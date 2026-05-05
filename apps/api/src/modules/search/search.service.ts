import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private readonly index = "hostels";

  constructor(
    private readonly elasticsearchService: ElasticsearchService,
    private readonly prisma: PrismaService,
  ) {}

  async onModuleInit() {
    await this.setupIndex();
  }

  private async setupIndex() {
    try {
      const indexExists = await this.elasticsearchService.indices.exists({
        index: this.index,
      });

      if (!indexExists) {
        await this.elasticsearchService.indices.create({
          index: this.index,
          body: {
            settings: {
              analysis: {
                analyzer: {
                  custom_analyzer: {
                    type: "custom",
                    tokenizer: "standard",
                    filter: ["lowercase", "trim"],
                  },
                },
              },
            },
            mappings: {
              properties: {
                id: { type: "keyword" },
                name: { type: "text", analyzer: "custom_analyzer" },
                description: { type: "text", analyzer: "custom_analyzer" },
                city: { type: "keyword" },
                university: { type: "keyword" },
                location: { type: "text", analyzer: "custom_analyzer" },
                price: { type: "integer" },
                amenities: { type: "keyword" },
                gender: { type: "keyword" },
                isPublished: { type: "boolean" },
                isFeatured: { type: "boolean" },
                rating: { type: "float" },
                createdAt: { type: "date" },
              },
            },
          },
        });
        this.logger.log("Elasticsearch index 'hostels' created with mappings.");
      }
    } catch (error) {
      this.logger.error("Failed to setup Elasticsearch index", (error as Error).stack);
    }
  }

  async indexHostel(hostelId: string) {
    const h = await this.prisma.hostel.findUnique({
      where: { id: hostelId },
      include: { rooms: { where: { isActive: true } } },
    });

    if (!h || !h.isPublished) {
      // If hostel was deleted or unpublished, remove from index
      try {
        await this.elasticsearchService.delete({
          index: this.index,
          id: hostelId,
        });
      } catch (e) {}
      return;
    }

    await this.elasticsearchService.index({
      index: this.index,
      id: h.id,
      body: {
        id: h.id,
        name: h.name,
        description: h.description,
        city: h.city,
        university: h.university,
        location: `${h.city} ${h.addressLine}`,
        price: h.minPrice,
        amenities: h.amenities,
        gender: h.genderCategory,
        isPublished: h.isPublished,
        isFeatured: h.isFeatured,
        rating: h.averageRating,
        createdAt: h.createdAt,
      },
    });
    this.logger.debug(`Indexed hostel ${h.name} in Elasticsearch.`);
  }

  async searchHostels(params: any) {
    const { query, city, minPrice, maxPrice, gender, amenities, university, sort, limit = 12, offset = 0 } = params;

    const must: any[] = [{ term: { isPublished: true } }];
    const filter: any[] = [];

    if (query) {
      must.push({
        multi_match: {
          query,
          fields: ["name^3", "description", "location^2", "university"],
          fuzziness: "AUTO",
        },
      });
    }

    if (city) filter.push({ term: { city } });
    if (university) filter.push({ term: { university } });
    if (gender) filter.push({ term: { gender } });
    
    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.push({
        range: {
          price: {
            gte: minPrice,
            lte: maxPrice,
          },
        },
      });
    }

    if (amenities && amenities.length > 0) {
      amenities.forEach((a: string) => {
        filter.push({ term: { amenities: a } });
      });
    }

    let sortOption: any = [{ isFeatured: "desc" }];
    if (sort === "price_asc") sortOption.push({ price: "asc" });
    else if (sort === "price_desc") sortOption.push({ price: "desc" });
    else if (sort === "rating") sortOption.push({ rating: "desc" });
    else sortOption.push({ createdAt: "desc" });

    const response = await this.elasticsearchService.search({
      index: this.index,
      body: {
        query: {
          bool: { must, filter },
        },
        sort: sortOption,
        from: offset,
        size: limit,
      },
    });

    return {
      total: (response.hits.total as any).value,
      data: response.hits.hits.map((hit) => hit._source),
    };
  }
}
