import { Injectable, Logger } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";

@Injectable()
export class DiscoveryService {
  private readonly logger = new Logger(DiscoveryService.name);
  private readonly CACHE_KEY = "discovery_data";
  private readonly CACHE_TTL = 600; // 10 minutes

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getDiscovery() {
    const cached = await this.redis.getJson(this.CACHE_KEY);
    if (cached) {
      this.logger.debug("Discovery data served from cache");
      return cached;
    }

    this.logger.debug("Generating fresh discovery data");
    const data = await this.generateDiscoveryData();
    
    await this.redis.setJson(this.CACHE_KEY, data, this.CACHE_TTL);
    return data;
  }

  private async generateDiscoveryData() {
    // 1. Hostels of the Week (random but stable via seed if needed, here we just pick 4 featured/high rating)
    const weekly = await this.prisma.hostel.findMany({
      where: { isPublished: true, images: { isEmpty: false } },
      orderBy: [
        { isFeatured: "desc" },
        { averageRating: "desc" },
      ],
      take: 4,
      include: {
        rooms: { where: { isActive: true } },
      },
    });

    // 2. Near Top Universities (Dynamic top 3 based on count)
    const uniStats = await this.prisma.hostel.groupBy({
      by: ["university"],
      _count: { id: true },
      where: { isPublished: true, university: { not: null } },
      orderBy: { _count: { id: "desc" } },
      take: 3,
    });

    const nearUniversity = await Promise.all(
      uniStats.map(async (stat) => {
        const hostels = await this.prisma.hostel.findMany({
          where: { isPublished: true, university: stat.university },
          take: 4,
          orderBy: { averageRating: "desc" },
          include: {
            rooms: { where: { isActive: true } },
          },
        });
        return {
          university: stat.university,
          hostels,
        };
      }),
    );

    // 3. Affordable by City (Top 3 cities by count, then sorted by price)
    const cityStats = await this.prisma.hostel.groupBy({
      by: ["city"],
      _count: { id: true },
      where: { isPublished: true },
      orderBy: { _count: { id: "desc" } },
      take: 3,
    });

    const affordable = await Promise.all(
      cityStats.map(async (stat) => {
        const hostels = await this.prisma.hostel.findMany({
          where: { isPublished: true, city: stat.city, minPrice: { not: null } },
          take: 4,
          orderBy: { minPrice: "asc" },
          include: {
            rooms: { where: { isActive: true } },
          },
        });
        return {
          city: stat.city,
          hostels,
        };
      }),
    );

    // 4. Last Rooms Available (slots < 5)
    const lastRooms = await this.prisma.hostel.findMany({
      where: {
        isPublished: true,
        rooms: {
          some: {
            isActive: true,
            availableSlots: { gt: 0, lte: 4 },
          },
        },
      },
      take: 4,
      include: {
        rooms: { where: { isActive: true } },
      },
    });

    return {
      weekly,
      nearUniversity,
      affordable,
      lastRooms,
      timestamp: new Date().toISOString(),
    };
  }

  async invalidateCache() {
    await this.redis.del(this.CACHE_KEY);
    this.logger.debug("Discovery cache invalidated");
  }
}
