import { Injectable, OnModuleInit, Logger, Inject } from "@nestjs/common";
import { MeiliSearch, Index } from "meilisearch";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private readonly indexName = "hostels";

  constructor(
    @Inject("MEILISEARCH_CLIENT") private readonly meiliClient: MeiliSearch,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    await this.setupIndex();
  }

  private async setupIndex() {
    try {
      const index = this.meiliClient.index(this.indexName);
      
      // Configure index settings for Meilisearch
      await index.updateSettings({
        searchableAttributes: ["name", "description", "university", "city", "locationText"],
        filterableAttributes: ["city", "university", "gender", "price", "amenities", "isPublished", "_geo"],
        sortableAttributes: ["price", "rating", "createdAt", "isFeatured", "_geo"],
        rankingRules: [
          "words",
          "typo",
          "proximity",
          "attribute",
          "sort",
          "exactness",
        ],
      });

      this.logger.log("Meilisearch index 'hostels' configured.");
    } catch (error) {
      this.logger.error("Failed to configure Meilisearch index", (error as Error).stack);
    }
  }

  async indexHostel(hostelId: string) {
    const h = await this.prisma.hostel.findUnique({
      where: { id: hostelId },
    });

    if (!h || !h.isPublished) {
      try {
        await this.meiliClient.index(this.indexName).deleteDocument(hostelId);
      } catch (e) {}
      return;
    }

    // Meilisearch uses _geo for location-based search
    const document = {
      id: h.id,
      name: h.name,
      description: h.description,
      city: h.city,
      university: h.university,
      locationText: `${h.city} ${h.addressLine}`,
      price: h.minPrice,
      amenities: h.amenities,
      gender: h.genderCategory,
      isPublished: h.isPublished,
      isFeatured: h.isFeatured,
      rating: h.averageRating,
      createdAt: h.createdAt.getTime(), // Meilisearch prefers numbers for sorting dates
      _geo: h.latitude && h.longitude ? { lat: h.latitude, lng: h.longitude } : undefined,
    };

    await this.meiliClient.index(this.indexName).addDocuments([document]);
    this.logger.debug(`Indexed hostel ${h.name} in Meilisearch.`);
  }

  async searchHostels(params: any) {
    const { query, city, university, gender, minPrice, maxPrice, amenities, sort, limit = 12, offset = 0, lat, lng, radius } = params;

    const filter: string[] = ["isPublished = true"];

    if (city) filter.push(`city = "${city}"`);
    if (university) filter.push(`university = "${university}"`);
    if (gender) filter.push(`gender = "${gender}"`);
    
    if (minPrice !== undefined) filter.push(`price >= ${minPrice}`);
    if (maxPrice !== undefined) filter.push(`price <= ${maxPrice}`);

    if (amenities && amenities.length > 0) {
      amenities.forEach((a: string) => {
        filter.push(`amenities = "${a}"`);
      });
    }

    // Geo-filtering
    if (lat && lng) {
      const rad = radius || 10;
      filter.push(`_geoRadius(${lat}, ${lng}, ${rad * 1000})`); // Meilisearch radius is in meters
    }

    const sortOptions: string[] = ["isFeatured:desc"];
    if (lat && lng && sort === "distance") {
      sortOptions.push(`_geoPoint(${lat}, ${lng}):asc`);
    } else if (sort === "price_asc") sortOptions.push("price:asc");
    else if (sort === "price_desc") sortOptions.push("price:desc");
    else if (sort === "rating") sortOptions.push("rating:desc");
    else sortOptions.push("createdAt:desc");

    const searchResults = await this.meiliClient.index(this.indexName).search(query, {
      filter: filter.join(" AND "),
      sort: sortOptions,
      limit,
      offset,
    });

    return {
      total: searchResults.estimatedTotalHits || searchResults.hits.length,
      data: searchResults.hits,
    };
  }
}
