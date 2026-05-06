import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AIService {
  private readonly logger = new Logger(AIService.name);

  constructor(private config: ConfigService) {}

  /**
   * Universal AI Caller supporting Rebix endpoints and standard providers.
   */
  private async callAI(query: string, systemPrompt?: string): Promise<string> {
    const provider = this.config.get<string>("AI_PROVIDER") || "rebix";
    const model = this.config.get<string>("AI_MODEL_NAME") || "gpt-5";

    if (provider === "rebix") {
      return this.callRebixApi(model, `${systemPrompt ? systemPrompt + "\n" : ""}${query}`);
    }

    // Fallback to generic logic if needed, but for now we prioritize the requested APIs
    return this.callRebixApi(model, query);
  }

  private async callRebixApi(model: string, query: string): Promise<string> {
    const endpoints: Record<string, string> = {
      "gpt-5": "https://api-rebix.zone.id/api/gpt-5",
      "llama-meta": "https://api-rebix.zone.id/api/llama-meta",
      "gemini": "https://api-rebix.zone.id/api/gemini",
      "deepseek": "https://api-rebix.zone.id/api/deepseek-v3",
    };

    const baseUrl = endpoints[model] || endpoints["gpt-5"];
    const url = `${baseUrl}?q=${encodeURIComponent(query)}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      return data.results || data.result || "I'm sorry, I couldn't process that.";
    } catch (error) {
      this.logger.error(`Failed to call Rebix AI (${model})`, error);
      return "AI Service temporarily unavailable.";
    }
  }

  /**
   * Parses a natural language search query into structured filters.
   */
  async parseSearchQuery(query: string): Promise<any> {
    try {
      const systemPrompt = `
        You are a search assistant for HostelGH, a hostel booking platform in Ghana.
        Extract search parameters from the user's query.
        
        Fields to extract:
        - city: The city name (e.g., Accra, Kumasi)
        - university: The university name (e.g., University of Ghana, KNUST)
        - minPrice: Minimum price in GHS
        - maxPrice: Maximum price in GHS
        - gender: 'MALE', 'FEMALE', or 'MIXED'
        - amenities: Array of amenities (e.g., wifi, AC, laundry)
        
        Return ONLY a JSON object. No explanation.
      `;

      const response = await this.callAI(`User Query: "${query}"`, systemPrompt);
      
      // Attempt to find JSON in the response if the model adds markdown
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      const cleanJson = jsonMatch ? jsonMatch[0] : response;
      
      return JSON.parse(cleanJson);
    } catch (error) {
      this.logger.error("Failed to parse search query with AI", error);
      return {};
    }
  }

  /**
   * Generates a response for the support chatbot.
   */
  async generateSupportResponse(conversationHistory: { role: string, content: string }[], userMessage: string): Promise<string> {
    const historyText = conversationHistory
      .map(m => `${m.role.toUpperCase()}: ${m.content}`)
      .join("\n");

    const systemPrompt = `
      You are the HostelGH AI Concierge. Help students find hostels and owners manage listings.
      Ghana contexts: UG, KNUST, UCC, etc. Most hostels paid per term.
      WhatsApp support available.
    `;

    return this.callAI(`History:\n${historyText}\nUSER: ${userMessage}`, systemPrompt);
  }

  /**
   * Polishes a hostel description for owners.
   */
  async polishDescription(description: string): Promise<string> {
    const systemPrompt = "Rewrite and polish this hostel description for a student booking platform.";
    return this.callAI(`Description: "${description}"`, systemPrompt);
  }
}

