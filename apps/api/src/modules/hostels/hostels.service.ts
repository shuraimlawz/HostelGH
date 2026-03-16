import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UserRole, RoomGender } from "@prisma/client";
import { RedisService } from "../redis/redis.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import {
  AdminAuditLogService,
  AdminAction,
  AdminEntity,
} from "../admin/admin-audit.service";
import { CreateHostelDto, UpdateHostelDto } from "./dto/create-hostel.dto";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class HostelsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly subscriptions: SubscriptionsService,
    private readonly audit: AdminAuditLogService,
  ) { }

  async create(ownerId: string, dto: CreateHostelDto) {
    await this.subscriptions.checkLimit(ownerId, "max_hostels");

    // Check if owner already has a previously published hostel (verified)
    const existingVerified = await this.prisma.hostel.findFirst({
      where: { ownerId, isPublished: true },
    });

    // First hostel always requires admin verification; subsequent hostels auto-publish
    const isFirstHostel = !existingVerified;

    let featuredUntil = dto.featuredUntil;
    if (dto.isFeatured) {
      await this.subscriptions.checkLimit(ownerId, "featured_listings");
      if (!featuredUntil) {
        const sub = await this.subscriptions.getOwnerSubscription(ownerId);
        featuredUntil = sub?.endDate ?? sub?.expiresAt ?? null;
      }
    }

    const hostel = await this.prisma.hostel.create({
      data: {
        name: dto.name,
        description: dto.description,
        addressLine: dto.addressLine,
        city: dto.city,
        region: dto.region,
        country: dto.country,
        images: dto.images,
        amenities: dto.amenities,
        university: dto.university,
        whatsappNumber: dto.whatsappNumber,
        distanceToCampus: dto.distanceToCampus,
        utilitiesIncluded: dto.utilitiesIncluded,
        bookingStatus: dto.bookingStatus,
        policiesText: dto.policiesText,
        genderCategory: dto.genderCategory,
        isFeatured: dto.isFeatured,
        featuredUntil: featuredUntil,
        // Listing fee model configuration
        listingFeeModel: dto.listingFeeModel,
        monthlyListingFee: dto.monthlyListingFee,
        revenueSharePercentage: dto.revenueSharePercentage,
        perAcceptanceFee: dto.perAcceptanceFee,
        ownerId,
        isPublished: !isFirstHostel, // auto-publish if already verified
        pendingVerification: isFirstHostel, // flag first-timers for admin review
      },
      include: { owner: { select: { email: true } } },
    });

    // Log for admin awareness
    await this.audit.log(
      null, // System-triggered (by user action)
      AdminAction.CREATE,
      AdminEntity.HOSTEL,
      hostel.id,
      `New property listed: ${hostel.name} by ${hostel.owner.email}`,
      { requiresVerification: isFirstHostel },
    );

    return {
      ...hostel,
      requiresVerification: isFirstHostel,
    };
  }

  async verifyHostel(hostelId: string) {
    const hostel = await this.prisma.hostel.findUnique({
      where: { id: hostelId },
    });
    if (!hostel) throw new NotFoundException("Hostel not found");

    return this.prisma.hostel.update({
      where: { id: hostelId },
      data: { isPublished: true, pendingVerification: false },
    });
  }

  async rejectHostel(hostelId: string, reason?: string) {
    const hostel = await this.prisma.hostel.findUnique({
      where: { id: hostelId },
    });
    if (!hostel) throw new NotFoundException("Hostel not found");

    return this.prisma.hostel.update({
      where: { id: hostelId },
      data: { isPublished: false, pendingVerification: false },
    });
  }

  async update(actor: UserActor, hostelId: string, dto: UpdateHostelDto) {
    const hostel = await this.getHostelById(hostelId);
    this.validateOwnership(actor, hostel.ownerId);

    if (dto.isFeatured) {
      await this.subscriptions.checkLimit(hostel.ownerId, "featured_listings");
      if (!dto.featuredUntil) {
        const sub = await this.subscriptions.getOwnerSubscription(hostel.ownerId);
        dto.featuredUntil = sub?.endDate ?? sub?.expiresAt ?? null;
      }
    }

    return this.prisma.hostel.update({
      where: { id: hostelId },
      data: dto,
    });
  }

  async delete(actor: UserActor, hostelId: string) {
    const hostel = await this.getHostelById(hostelId);
    this.validateOwnership(actor, hostel.ownerId);

    return this.prisma.hostel.delete({ where: { id: hostelId } });
  }

  async findMyHostels(ownerId: string) {
    return this.prisma.hostel.findMany({
      where: { ownerId },
      include: { _count: { select: { rooms: true, bookings: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async publicSearch(params: {
    city?: string;
    region?: string;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
    university?: string;
    sort?: string;
    gender?: string;
    roomConfig?: string;
    limit?: number;
    page?: number;
  }) {
    const cacheKey = `search:${JSON.stringify(params)}`;
    const cached = await this.redis.getJson<any[]>(cacheKey);
    if (cached) return cached;

    const {
      city,
      region,
      minPrice,
      maxPrice,
      amenities,
      university,
      sort,
      gender,
      roomConfig,
    } = params;

    // Intelligent Suggestion / Relevance Algorithm:
    // 1. Featured hostels first
    // 2. If requested, sort by relevance: bookings activity, rating, then recency
    // 3. Otherwise, respect explicit sort criteria (price, name, newest)
    const orderBy: any[] = [{ isFeatured: "desc" }];

    if (sort === "relevance") {
      // Use bookings count as a strong signal of popularity, then rating, then recency
      orderBy.push({ _count: { bookings: "desc" } }, { rating: "desc" }, { createdAt: "desc" });
    } else if (sort === "price_asc") {
      orderBy.push({ minPrice: "asc" });
    } else if (sort === "price_desc") {
      orderBy.push({ minPrice: "desc" });
    } else if (sort === "name_asc") {
      orderBy.push({ name: "asc" });
    } else {
      orderBy.push({ createdAt: "desc" }); // Default to Newest
    }

    // handle optional pagination
    const take = params.limit ?? 10;
    const skip = params.page && params.limit ? (params.page - 1) * params.limit : undefined;

    const results = await this.prisma.hostel.findMany({
      where: {
        isPublished: true,
        city: city ? { contains: city, mode: "insensitive" } : undefined,
        region: region ? { equals: region, mode: "insensitive" } : undefined,
        university: university
          ? { contains: university, mode: "insensitive" }
          : undefined,
        amenities:
          amenities && amenities.length > 0
            ? { hasEvery: amenities }
            : undefined,
        bookingStatus: { not: "CLOSED" },
        minPrice:
          minPrice !== undefined || maxPrice !== undefined
            ? {
              gte: minPrice,
              lte: maxPrice,
            }
            : undefined,
        rooms: {
          some: {
            isActive: true,
            availableSlots: { gt: 0 },
            gender: gender ? (gender as any) : undefined,
            roomConfiguration: roomConfig
              ? { contains: roomConfig, mode: "insensitive" }
              : undefined,
          },
        },
      },
      include: { rooms: { where: { isActive: true } } },
      orderBy: orderBy,
      // apply paging if provided
      ...(skip !== undefined ? { skip } : {}),
      ...(take !== undefined ? { take } : {}),
    });

    await this.redis.setJson(cacheKey, results, 300); // 5 minutes cache
    return results;
  }

  async getPublicById(id: string, actor?: UserActor) {
    const hostel = await this.prisma.hostel.findUnique({
      where: { id },
      include: {
        rooms: { where: { isActive: true }, orderBy: { createdAt: "asc" } },
        facilities: true,
        owner: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
      },
    });

    if (!hostel) throw new NotFoundException("Hostel not found");

    if (!hostel.isPublished) {
      const isOwner =
        actor && (actor.role === UserRole.ADMIN || actor.id === hostel.ownerId);
      if (!isOwner)
        throw new NotFoundException("Hostel not found or not published");
    }

    return hostel;
  }

  @Cron(CronExpression.EVERY_HOUR)
  async clearExpiredFeaturedListings() {
    const now = new Date();
    await this.prisma.hostel.updateMany({
      where: {
        isFeatured: true,
        featuredUntil: { lt: now },
      },
      data: { isFeatured: false, featuredUntil: null },
    });
  }

  async getCityStats() {
    const cacheKey = "city_stats";
    const cached = await this.redis.getJson<any[]>(cacheKey);
    if (cached) return cached;

    const stats = await this.prisma.hostel.groupBy({
      by: ["city"],
      _count: {
        id: true,
      },
      where: {
        isPublished: true,
      },
    });

    const cityImages: Record<string, string> = {
      Accra:
        "https://images.unsplash.com/photo-1590644365607-1c5a519a7a37?w=400&h=300&fit=crop",
      Kumasi:
        "https://images.unsplash.com/photo-1596401057633-5310457b1d4f?w=400&h=300&fit=crop",
      "Cape Coast":
        "https://images.unsplash.com/photo-1590636287955-ea299941a547?w=400&h=300&fit=crop",
      Takoradi:
        "https://images.unsplash.com/photo-1583002444634-8b64e6259f9e?w=400&h=300&fit=crop",
      Tamale:
        "https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?w=400&h=300&fit=crop",
    };

    const result = stats.map((s) => ({
      name: s.city,
      count: `${s._count.id} ${s._count.id === 1 ? "Hostel" : "Hostels"}`,
      image:
        cityImages[s.city] ||
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=300&fit=crop",
    }));

    await this.redis.setJson(cacheKey, result, 3600); // 1 hour cache
    return result;
  }

  async getTrendingLocations() {
    const cacheKey = "trending_locations";
    const cached = await this.redis.getJson<string[]>(cacheKey);
    if (cached) return cached;

    // Trending Algorithm Logic:
    // 1. Find locations (University or City) with most bookings in last 30 days
    // 2. Boost results if a hostel is "Featured"
    // 3. Fallback to locations with most published hostels

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Get bookings activity per hostel
    const recentActivity = await this.prisma.booking.groupBy({
      by: ["hostelId"],
      _count: { id: true },
      where: { createdAt: { gte: thirtyDaysAgo } },
    });

    const hostelIds = recentActivity.map((a) => a.hostelId);
    const activeHostels = await this.prisma.hostel.findMany({
      where: { id: { in: hostelIds }, isPublished: true },
      select: { city: true, university: true, id: true },
    });

    const scores: Record<string, number> = {};

    // Aggregate scores by location name
    activeHostels.forEach((hostel) => {
      const bookingCount =
        recentActivity.find((a) => a.hostelId === hostel.id)?._count.id || 0;
      const locationNames = [hostel.university, hostel.city].filter(
        Boolean,
      ) as string[];

      locationNames.forEach((name) => {
        scores[name] = (scores[name] || 0) + bookingCount;
      });
    });

    // Fallback: If not enough trending from bookings, add locations with most hostels
    if (Object.keys(scores).length < 4) {
      const topHostelLocations = await this.prisma.hostel.groupBy({
        by: ["university", "city"],
        _count: { id: true },
        where: { isPublished: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      });

      topHostelLocations.forEach((loc) => {
        const name = loc.university || loc.city;
        scores[name] = (scores[name] || 0) + loc._count.id * 0.5; // Lower weight for static count
      });
    }

    const trending = Object.entries(scores)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name]) => name);

    // Ultimate Fallback if DB is empty
    const finalResults =
      trending.length > 0
        ? trending
        : ["Legon", "KNUST", "UCC", "UPSA", "Accra"];

    await this.redis.setJson(cacheKey, finalResults, 3600); // 1 hour internal cache
    return finalResults;
  }

  async addHostelImages(hostelId: string, id: string, imageUrls: string[]) {
    const hostel = await this.getHostelById(hostelId);
    this.validateOwnership({ id, role: UserRole.OWNER }, hostel.ownerId);

    return this.prisma.hostel.update({
      where: { id: hostelId },
      data: {
        images: {
          push: imageUrls,
        },
      },
    });
  }

  async removeHostelImage(hostelId: string, id: string, imageUrl: string) {
    const hostel = await this.getHostelById(hostelId);
    this.validateOwnership({ id, role: UserRole.OWNER }, hostel.ownerId);

    const updatedImages = hostel.images.filter((img) => img !== imageUrl);

    return this.prisma.hostel.update({
      where: { id: hostelId },
      data: {
        images: updatedImages,
      },
    });
  }

  async addFacility(actor: UserActor, hostelId: string, dto: { name: string, type: any }) {
    const hostel = await this.getHostelById(hostelId);
    this.validateOwnership(actor, hostel.ownerId);

    return this.prisma.hostelFacility.create({
      data: {
        hostelId,
        name: dto.name,
        type: dto.type as any,
      },
    });
  }

  async removeFacility(actor: UserActor, hostelId: string, facilityId: string) {
    const hostel = await this.getHostelById(hostelId);
    this.validateOwnership(actor, hostel.ownerId);

    return this.prisma.hostelFacility.deleteMany({
      where: { id: facilityId, hostelId },
    });
  }

  async getById(actor: UserActor, id: string) {
    const hostel = await this.prisma.hostel.findUnique({
      where: { id },
      include: {
        rooms: { orderBy: { createdAt: "asc" } },
        facilities: true,
        _count: { select: { bookings: true } },
      },
    });

    if (!hostel) throw new NotFoundException("Hostel not found");
    this.validateOwnership(actor, hostel.ownerId);

    return hostel;
  }

  private async getHostelById(id: string) {
    const hostel = await this.prisma.hostel.findUnique({ where: { id } });
    if (!hostel) throw new NotFoundException("Hostel not found");
    return hostel;
  }

  async getOwnerNotificationCounts(ownerId: string) {
    const [pendingBookings] = await Promise.all([
      this.prisma.booking.count({
        where: {
          hostel: { ownerId },
          status: "PENDING_APPROVAL" as any,
        },
      }),
    ]);

    return {
      bookings: pendingBookings,
      total: pendingBookings,
    };
  }

  private validateOwnership(actor: UserActor, ownerId: string) {
    const isAuthorized = actor.role === UserRole.ADMIN || actor.id === ownerId;
    if (!isAuthorized)
      throw new ForbiddenException("Not allowed to modify this hostel");
  }
}

interface UserActor {
  id: string;
  role: UserRole;
}
