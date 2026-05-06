import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UserRole, RoomGender, BookingStatus } from "@prisma/client";
import { RedisService } from "../redis/redis.service";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { SearchService } from "../search/search.service";
import { SubscriptionsService } from "../subscriptions/subscriptions.service";
import {
  AdminAuditLogService,
  AdminAction,
  AdminEntity,
} from "../admin/admin-audit.service";
import { CreateHostelDto, UpdateHostelDto } from "./dto/create-hostel.dto";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DiscoveryService } from "../discovery/discovery.service";
import { AIService } from "../ai/ai.service";
import { fuzzyMatch, findBestMatch, levenshteinDistance } from "../../utils/fuzzy-match";



@Injectable()
export class HostelsService {
  private readonly logger = new Logger(HostelsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly subscriptions: SubscriptionsService,
    private readonly audit: AdminAuditLogService,
    private readonly search: SearchService,
    private readonly discovery: DiscoveryService,
    private readonly ai: AIService,
    @InjectQueue("hostel-indexing") private readonly indexingQueue: Queue,
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

    // Indexing (Background)
    if (!hostel.pendingVerification) {
      await this.indexingQueue.add("sync", { hostelId: hostel.id });
    }

    // Invalidate discovery cache
    await this.discovery.invalidateCache();

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

    const updated = await this.prisma.hostel.update({
      where: { id: hostelId },
      data: { isPublished: true, pendingVerification: false },
    });

    await this.indexingQueue.add("sync", { hostelId });

    await this.discovery.invalidateCache();
    return updated;

  }

  async rejectHostel(hostelId: string, reason?: string) {
    const hostel = await this.prisma.hostel.findUnique({
      where: { id: hostelId },
    });
    if (!hostel) throw new NotFoundException("Hostel not found");

    const updated = await this.prisma.hostel.update({
      where: { id: hostelId },
      data: { isPublished: false, pendingVerification: false },
    });

    // Remove from search index
    await this.indexingQueue.add("sync", { hostelId });

    return updated;
  }

  async update(actor: UserActor, hostelId: string, dto: UpdateHostelDto) {
    const hostel = await this.getHostelById(hostelId);
    this.validateOwnership(actor, hostel.ownerId);

    if (dto.isFeatured) {
      await this.subscriptions.checkLimit(hostel.ownerId, "featured_listings");
      if (!dto.featuredUntil) {
        const sub = await this.subscriptions.getOwnerSubscription(hostel.ownerId);
        // During launch mode, if no sub exists, we default to 1 year of featuring
        const oneYearFromNow = new Date();
        oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
        dto.featuredUntil = sub?.endDate ?? sub?.expiresAt ?? oneYearFromNow;
      }
    }

    const updated = await this.prisma.hostel.update({
      where: { id: hostelId },
      data: dto,
    });

    await this.indexingQueue.add("sync", { hostelId });
    await this.discovery.invalidateCache();

    return updated;

  }

  async delete(actor: UserActor, hostelId: string) {
    const hostel = await this.getHostelById(hostelId);
    this.validateOwnership(actor, hostel.ownerId);

    await this.discovery.invalidateCache();
    return this.prisma.hostel.delete({ where: { id: hostelId } });

  }

  async findMyHostels(ownerId: string) {
    return this.prisma.hostel.findMany({
      where: { ownerId },
      include: { _count: { select: { rooms: true, bookings: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  /**
   * Fetch all unique universities from hostels to enable fuzzy matching
   */
  private async getAvailableUniversities(): Promise<string[]> {
    const cacheKey = "available_universities";
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        this.logger.warn("Failed to parse cached universities");
      }
    }

    const hostels = await this.prisma.hostel.findMany({
      where: { isPublished: true, university: { not: null } },
      select: { university: true },
      distinct: ["university"],
    });

    const universities = hostels
      .map((h) => h.university)
      .filter((u): u is string => u !== null && u.trim() !== "");

    // Cache for 1 hour
    await this.redis.set(cacheKey, JSON.stringify(universities), 3600);
    return universities;
  }

  /**
   * Find matching university using fuzzy matching (handles typos)
   */
  private async fuzzyMatchUniversity(input: string): Promise<string | null> {
    if (!input || input.trim() === "") return null;

    const available = await this.getAvailableUniversities();
    const best = findBestMatch(input, available, 0.65); // 65% similarity threshold

    if (best) {
      this.logger.debug(
        `Fuzzy matched "${input}" to "${best.value}" (score: ${best.score.toFixed(2)})`,
      );
      return best.value;
    }

    return null;
  }

  /**
   * Fetch all distinct hostel names and city values from DB (for fuzzy query expansion).
   * Returns a flat list of tokens that the search engine can use to find typo-tolerant matches.
   */
  private async getAvailableHostelNames(): Promise<string[]> {
    const cacheKey = "available_hostel_names";
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      try { return JSON.parse(cached); } catch { /* ignore */ }
    }

    const [hostels, cities] = await Promise.all([
      this.prisma.hostel.findMany({
        where: { isPublished: true },
        select: { name: true },
        distinct: ["name"],
      }),
      this.prisma.hostel.findMany({
        where: { isPublished: true },
        select: { city: true },
        distinct: ["city"],
      }),
    ]);

    const names = [
      ...hostels.map(h => h.name),
      ...cities.map(h => h.city),
    ].filter(Boolean);

    await this.redis.set(cacheKey, JSON.stringify(names), 3600);
    return names;
  }

  async publicSearch(params: {
    city?: string;
    region?: string;
    minPrice?: number;
    maxPrice?: number;
    amenities?: string[];
    university?: string;
    /** Comma-separated list of all known name variants for a school (sent by the schools page) */
    universityAliases?: string[];
    sort?: string;
    gender?: string;
    roomConfig?: string;
    limit?: number;
    page?: number;
    query?: string;
    /** Geo-search: user latitude */
    lat?: number;
    /** Geo-search: user longitude */
    lng?: number;
    /** Radius in km (default 10) */
    radius?: number;
    availableOnly?: string;
  }) {
    let searchParams = { ...params };
    const searchQueryText = searchParams.query;

    // Smart Search: If query is long/conversational, use LLM to parse filters
    if (searchQueryText && searchQueryText.split(' ').length > 2) {
      try {
        const aiParsed = await this.ai.parseSearchQuery(searchQueryText);
        this.logger.debug(`AI parsed query "${searchQueryText}" into: ${JSON.stringify(aiParsed)}`);
        // Merge AI parsed values into searchParams, prioritizing explicitly passed params
        searchParams = {
          ...aiParsed,
          ...searchParams,
          // Special merge for amenities to combine both
          amenities: [...new Set([...(aiParsed.amenities || []), ...(searchParams.amenities || [])])]
        };
      } catch (err) {
        this.logger.warn("AI Smart Search parsing failed, falling back to standard search");
      }
    }

    //   limit: params.limit,
    //   offset: params.page && params.limit ? (params.page - 1) * params.limit : 0,
    //   filter: this.buildMeiliFilter(params),
    // });

    // if (meiliResults) {
    //   this.logger.log(`Using Meilisearch for query: ${searchQueryText}`);
    //   // If we have meilisearch results, we return them
    //   // Note: Need to fetch full objects from DB or return meili docs
    //   const ids = meiliResults.hits.map(h => h.id);
    //   return this.prisma.hostel.findMany({
    //     where: { id: { in: ids } },
    //     include: { rooms: { where: { isActive: true } } },
    //   });
    // }

    const {
      city,
      region,
      minPrice,
      maxPrice,
      amenities,
      university,
      universityAliases,
      sort,
      gender,
      roomConfig,
      query,
      availableOnly,
    } = searchParams;


    // Smart Aliases Mapping
    const ALIASES: Record<string, string[]> = {
      "legon": ["University of Ghana", "UG"],
      "knust": ["Kwame Nkrumah University", "Tech"],
      "ucc": ["University of Cape Coast"],
      "upsa": ["University of Professional Studies"],
      "tech": ["KNUST"],
      "central": ["Central University"],
    };

    let searchQuery = query?.toLowerCase() || "";
    let universityFilter = university;
    // universityFilters is the full set of name variants to match against (OR logic)
    let universityFilters: string[] = universityAliases && universityAliases.length > 0
      ? universityAliases
      : university ? [university] : [];
    let genderFilter = gender;
    let minPriceFilter = minPrice;
    let maxPriceFilter = maxPrice;
    let amenitiesFilter = amenities || [];
    let roomConfigFilter = roomConfig;

    // Apply fuzzy matching to university filter to handle typos (only when NOT using the full alias list)
    if (universityFilter && universityFilters.length <= 1) {
      const fuzzyMatched = await this.fuzzyMatchUniversity(universityFilter);
      if (fuzzyMatched && fuzzyMatched !== universityFilter) {
        // Add the fuzzy match as an extra variant
        universityFilters = [...new Set([...universityFilters, fuzzyMatched])];
      }
    }

    // Phase 1: Smart Parsing of the natural language query
    if (searchQuery) {
        // Price parsing: "under 3000", "below 2000", "cheap"
        if (searchQuery.includes("cheap") || searchQuery.includes("affordable") || searchQuery.includes("budget")) {
            maxPriceFilter = Math.min(maxPriceFilter ?? Infinity, 1500 * 100); // 1500 GHS in pesewas
        }
        const underMatch = searchQuery.match(/(?:under|below|less than|max)\s*(\d+)/);
        if (underMatch) {
            maxPriceFilter = parseInt(underMatch[1], 10) * 100;
        }

        // Gender parsing: "female", "girls", "male", "boys"
        if (searchQuery.includes("female") || searchQuery.includes("girls") || searchQuery.includes("ladies") || searchQuery.includes("women")) {
            genderFilter = "FEMALE";
        } else if (searchQuery.includes("male") || searchQuery.includes("boys") || searchQuery.includes("guys") || searchQuery.includes("men")) {
            genderFilter = "MALE";
        }

        // Amenity parsing
        if (searchQuery.includes("ac") || searchQuery.includes("air condition") || searchQuery.includes("cooling")) {
            if (!amenitiesFilter.includes("AC")) amenitiesFilter.push("AC");
        }
        if (searchQuery.includes("wifi") || searchQuery.includes("internet") || searchQuery.includes("data") || searchQuery.includes("network")) {
            if (!amenitiesFilter.includes("WiFi")) amenitiesFilter.push("WiFi");
        }

        // Room Config parsing: "2 in a room", "single", "2 in 1"
        if (searchQuery.includes("single") || searchQuery.includes("1 in a room") || searchQuery.includes("1 in 1")) {
            roomConfigFilter = "1 in a room";
        } else if (searchQuery.includes("2 in a room") || searchQuery.includes("2 in 1") || searchQuery.includes("two in one")) {
            roomConfigFilter = "2 in a room";
        } else if (searchQuery.includes("3 in a room") || searchQuery.includes("3 in 1")) {
            roomConfigFilter = "3 in a room";
        } else if (searchQuery.includes("4 in a room") || searchQuery.includes("4 in 1")) {
            roomConfigFilter = "4 in a room";
        }

        // Proximity parsing: "near Legon", "close to KNUST"
        const nearMatch = searchQuery.match(/(?:near|close to|around|at)\s+([a-zA-Z\s]+)/);
        if (nearMatch) {
            const schoolPart = nearMatch[1].trim();
            // Check if this schoolPart matches any alias or university name
            for (const [alias, realNames] of Object.entries(ALIASES)) {
                if (schoolPart.includes(alias) || alias.includes(schoolPart)) {
                    universityFilter = realNames[0];
                    break;
                }
            }
            
            // If no alias matched, try fuzzy matching the school name
            if (!universityFilter) {
              const fuzzyMatched = await this.fuzzyMatchUniversity(schoolPart);
              if (fuzzyMatched) {
                universityFilter = fuzzyMatched;
              }
            }
        }
    }

    // If the query matches an alias, add to the university filters
    for (const [alias, realNames] of Object.entries(ALIASES)) {
      if (searchQuery.includes(alias)) {
        universityFilter = realNames[0];
        universityFilters = [...new Set([...universityFilters, ...realNames])];
        break;
      }
    }

    // -----------------------------------------------------------------------
    // Fuzzy query expansion: when the user typed something in the search box,
    // fetch all distinct hostel names + cities from the DB and find fuzzy
    // neighbours. This handles single-letter typos like "Tesono" → "Tesano".
    // -----------------------------------------------------------------------
    let fuzzyExpandedTerms: string[] = [];
    if (searchQuery && searchQuery.length >= 3) {
      const allNames = await this.getAvailableHostelNames();
      const words = searchQuery.split(/\s+/).filter(w => w.length >= 3);
      for (const word of words) {
        const matches = allNames.filter(name => {
          const nameLower = name.toLowerCase();
          // Exact substring match already handled by Prisma contains — skip
          if (nameLower.includes(word) || word.includes(nameLower)) return false;
          // Accept if Levenshtein distance <= 2 for words up to 8 chars, or <= 3 for longer words
          const maxDist = word.length <= 8 ? 2 : 3;
          return levenshteinDistance(word, nameLower) <= maxDist;
        });
        fuzzyExpandedTerms.push(...matches);
      }
      // Deduplicate
      fuzzyExpandedTerms = [...new Set(fuzzyExpandedTerms)];
      if (fuzzyExpandedTerms.length > 0) {
        this.logger.debug(`Fuzzy expanded "${searchQuery}" → [${fuzzyExpandedTerms.slice(0, 5).join(", ")}]`);
      }
    }
    

    // Intelligent Suggestion / Relevance Algorithm:
    // 1. Featured hostels first
    // 2. If requested, sort by relevance: bookings activity, rating, then recency
    // 3. Otherwise, respect explicit sort criteria (price, name, newest)
    const orderBy: any[] = [{ isFeatured: "desc" }];

    if (sort === "relevance") {
      // Use bookings count as a strong signal of popularity, then rating, then recency
      orderBy.push({ bookings: { _count: "desc" } }, { averageRating: "desc" }, { createdAt: "desc" });
    } else if (sort === "rating") {
      orderBy.push({ averageRating: "desc" }, { totalReviews: "desc" });
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
    const take = params.limit ?? 12;
    const page = params.page ?? 1;
    const skip = (page - 1) * take;

    // 1. Initialize Base Conditions
    const whereConditions: any = {
      isPublished: true,
      city: city ? { contains: city, mode: "insensitive" } : undefined,
      region: region ? { equals: region, mode: "insensitive" } : undefined,
      genderCategory: genderFilter ? { equals: genderFilter as any } : undefined,
      amenities:
        amenitiesFilter && amenitiesFilter.length > 0
          ? { hasEvery: amenitiesFilter }
          : undefined,
      bookingStatus: { not: "CLOSED" },
      // Optional: Show only hostels with physical space left
      ...(params.availableOnly === "true" ? {
        rooms: {
          some: {
            isActive: true,
            availableSlots: { gt: 0 }
          }
        }
      } : {}),
      minPrice:
        minPriceFilter !== undefined || maxPriceFilter !== undefined
          ? {
              gte: minPriceFilter,
              lte: maxPriceFilter,
            }
          : undefined,
    };

    // 2. Room Configuration Filter
    if (roomConfigFilter) {
      whereConditions.rooms = {
        some: {
          isActive: true,
          roomConfiguration: { contains: roomConfigFilter, mode: "insensitive" },
        },
      };
    }

    // 3. Search Query Logic
    const textOrConditions = [];
    if (searchQuery) {
      textOrConditions.push(
        { name: { contains: searchQuery, mode: "insensitive" } },
        { city: { contains: searchQuery, mode: "insensitive" } },
        { addressLine: { contains: searchQuery, mode: "insensitive" } },
        { description: { contains: searchQuery, mode: "insensitive" } },
      );

      // Add fuzzy matches
      fuzzyExpandedTerms.forEach(term => {
        textOrConditions.push({ name: { contains: term, mode: "insensitive" } });
      });
    }

    const universityConditions = universityFilters.length > 0
      ? universityFilters.map(u => ({ university: { contains: u, mode: "insensitive" } }))
      : null;

    // Attach OR conditions intelligently
    if (universityConditions && textOrConditions.length > 0) {
      // Both: must satisfy university AND text query
      whereConditions.AND = [
        { OR: universityConditions },
        { OR: textOrConditions },
      ];
    } else if (universityConditions) {
      whereConditions.OR = universityConditions;
    } else if (textOrConditions.length > 0) {
      whereConditions.OR = textOrConditions;
    }

    // -----------------------------------------------------------------------
    // SCALABLE SEARCH ARCHITECTURE (Redis -> Elasticsearch -> Prisma Fallback)
    // -----------------------------------------------------------------------
    
    // 1. Check Redis Cache First
    const cacheKey = `search:${JSON.stringify(params)}`;
    const cachedResults = await this.redis.get(cacheKey);
    if (cachedResults) {
      this.logger.debug(`Search Cache Hit: ${cacheKey}`);
      try { return JSON.parse(cachedResults); } catch (e) {}
    }

    try {
      // 2. Query Elasticsearch
      const esResults = await this.search.searchHostels({
        query: searchQuery,
        city,
        university: universityFilter,
        gender: genderFilter,
        minPrice: minPriceFilter,
        maxPrice: maxPriceFilter,
        amenities: amenitiesFilter,
        sort,
        limit: take,
        offset: skip,
      });

      if (esResults && esResults.data.length > 0) {
        const result = {
          data: esResults.data,
          total: esResults.total,
          meta: {
            total: esResults.total,
            page,
            limit: take,
            totalPages: Math.ceil(esResults.total / take),
          },
          source: "elasticsearch"
        };
        
        // Cache for 5 minutes
        await this.redis.set(cacheKey, JSON.stringify(result), 300);
        return result;
      }
    } catch (error) {
      this.logger.error("Elasticsearch search failed, falling back to Prisma", (error as Error).stack);
    }

    // 3. Fallback to Prisma Database Query (Legacy Logic)
    const [data, total] = await Promise.all([
      this.prisma.hostel.findMany({
        where: whereConditions,
        include: {
          rooms: { where: { isActive: true } },
          _count: { select: { rooms: true } },
        },
        orderBy,
        skip,
        take,
      }),
      this.prisma.hostel.count({ where: whereConditions }),
    ]);

    const finalResult = {
      data,
      total,
      meta: {
        total,
        page,
        limit: take,
        totalPages: Math.ceil(total / take),
      },
      source: "prisma_fallback"
    };

    // Cache fallback results too (shorter TTL)
    await this.redis.set(cacheKey, JSON.stringify(finalResult), 60);
    
    return finalResult;
  }

  async getPublicById(idOrSlug: string, actor?: UserActor) {
    // First try finding by ID (most common)
    let hostel = await this.prisma.hostel.findUnique({
      where: { id: idOrSlug },
      include: {
        rooms: { where: { isActive: true }, orderBy: { createdAt: "asc" } },
        facilities: true,
        owner: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
        reviews: {
          include: { 
            tenant: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
            photos: true,
            ownerResponse: true
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }
      },
    });

    // If not found by ID, try finding by name (slug fallback)
    if (!hostel) {
      hostel = await this.prisma.hostel.findFirst({
        where: { name: { equals: idOrSlug, mode: 'insensitive' } },
        include: {
          rooms: { where: { isActive: true }, orderBy: { createdAt: "asc" } },
          facilities: true,
          owner: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
          reviews: {
            include: { 
              tenant: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
              photos: true,
              ownerResponse: true
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          }
        },
      });
    }

    if (!hostel) throw new NotFoundException("Hostel not found");

    // Calculate rating distribution
    const reviewStats = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { hostelId: hostel.id, isModerated: false },
      _count: { id: true }
    });

    const ratingDistribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviewStats.forEach(s => {
      ratingDistribution[s.rating as keyof typeof ratingDistribution] = s._count.id;
    });

    if (!hostel.isPublished) {
      const isAdmin = actor?.role === UserRole.ADMIN;
      const isOwner = actor?.id === hostel.ownerId;
      
      if (!isAdmin && !isOwner) {
        throw new NotFoundException("Hostel not found or not published");
      }
    }

    return { ...hostel, ratingDistribution };
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
          status: BookingStatus.PENDING,
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

  private buildMeiliFilter(params: any) {
    const filters = ["isPublished = true"];
    if (params.university) filters.push(`university = "${params.university}"`);
    if (params.city) filters.push(`city = "${params.city}"`);
    if (params.gender) filters.push(`gender = "${params.gender}"`);
    return filters.length > 0 ? filters.join(" AND ") : undefined;
  }
}

interface UserActor {
  id: string;
  role: UserRole;
}
