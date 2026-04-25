import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { MeiliSearch } from "meilisearch";
import { PrismaService } from "../../prisma/prisma.service";
import { OpenAIEmbeddings } from "@langchain/openai";

@Injectable()
export class SearchService implements OnModuleInit {
  private readonly logger = new Logger(SearchService.name);
  private client: MeiliSearch | null = null;
  private embeddings: OpenAIEmbeddings | null = null;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService,
  ) {
    const host = this.config.get<string>("MEILISEARCH_HOST");
    const apiKey = this.config.get<string>("MEILISEARCH_KEY");
    const openAIKey = this.config.get<string>("OPENAI_API_KEY");

    if (host && apiKey) {
      this.client = new MeiliSearch({ host, apiKey });
    }

    if (openAIKey) {
      this.embeddings = new OpenAIEmbeddings({
        openAIApiKey: openAIKey,
        modelName: "text-embedding-3-small",
      });
    }
  }

  async onModuleInit() {
    if (!this.client) {
      this.logger.warn("Meilisearch not configured. Search fallback to Prisma.");
    } else {
      await this.setupIndex();
    }

    if (!this.embeddings) {
      this.logger.warn("OpenAI Embeddings not configured. Semantic search disabled.");
    }
  }

  private async setupIndex() {
    try {
      const index = this.client!.index("hostels");
      await index.updateSettings({
        searchableAttributes: ["name", "description", "city", "university", "amenities"],
        filterableAttributes: ["gender", "minPrice", "university", "city", "isPublished"],
        sortableAttributes: ["minPrice", "rating", "createdAt", "averageRating"],
        rankingRules: [
          "words",
          "typo",
          "proximity",
          "attribute",
          "sort",
          "exactness",
          "isFeatured:desc",
        ],
      });
      this.logger.log("Meilisearch index 'hostels' configured.");
    } catch (error) {
      this.logger.error("Failed to setup Meilisearch index", error.stack);
    }
  }

  async syncHostels() {
    const hostels = await this.prisma.hostel.findMany({
      where: { isPublished: true },
      include: {
        rooms: { where: { isActive: true } },
      },
    });

    if (this.client) {
      const documents = hostels.map((h) => ({
        id: h.id,
        name: h.name,
        description: h.description,
        city: h.city,
        university: h.university,
        gender: h.gender,
        minPrice: h.minPrice,
        rating: h.averageRating,
        amenities: h.amenities,
        isPublished: h.isPublished,
        isFeatured: h.isFeatured,
        createdAt: h.createdAt,
      }));

      await this.client.index("hostels").addDocuments(documents);
      this.logger.log(`Synced ${documents.length} hostels to Meilisearch.`);
    }

    // In a real scenario, we would also store embeddings in a vector DB (like PGVector)
    if (this.embeddings) {
      this.logger.log("Generating embeddings for hostels (Phase 3 simulation)...");
      // This is where we'd generate embeddings and save to vector store
    }
  }

  async search(query: string, options: any = {}) {
    if (!this.client) return null;

    const index = this.client.index("hostels");
    return index.search(query, {
      limit: options.limit || 20,
      offset: options.offset || 0,
      filter: options.filter,
      sort: options.sort,
    });
  }

  async semanticSearch(query: string) {
    if (!this.embeddings) return null;
    
    this.logger.log(`Performing semantic AI search for: ${query}`);
    const vector = await this.embeddings.embedQuery(query);
    // In production, you would perform a vector search against PGVector or Pinecone here.
    return vector; 
  }
}
