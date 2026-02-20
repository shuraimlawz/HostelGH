import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private readonly apiKey: string;
  private readonly senderId: string;
  private readonly provider: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get<string>("SMS_API_KEY");
    this.senderId = this.config.get<string>("SMS_SENDER_ID") || "HostelGH";
    this.provider = this.config.get<string>("SMS_PROVIDER") || "LOGONLY";
  }

  async sendSms(to: string, message: string) {
    if (!to) return;

    // Ensure number is in international format for Ghana if it starts with 0
    let formattedTo = to;
    if (to.startsWith("0")) {
      formattedTo = "233" + to.substring(1);
    }

    if (this.provider === "LOGONLY") {
      this.logger.log(`[SMS DEBUG] To: ${formattedTo}, Message: ${message}`);
      return true;
    }

    try {
      if (this.provider === "ARKESEL") {
        await this.sendViaArkesel(formattedTo, message);
      } else if (this.provider === "HUBTEL") {
        await this.sendViaHubtel(formattedTo, message);
      } else {
        this.logger.warn(
          `Unknown SMS provider: ${this.provider}. Logging only.`,
        );
        this.logger.log(`[SMS] To: ${formattedTo}, Message: ${message}`);
      }
      return true;
    } catch (error) {
      this.logger.error(
        `Failed to send SMS to ${formattedTo}: ${error.message}`,
      );
      return false;
    }
  }

  private async sendViaArkesel(to: string, message: string) {
    const url = `https://sms.arkesel.com/sms/api?action=send-sms&api_key=${this.apiKey}&to=${to}&from=${this.senderId}&sms=${encodeURIComponent(message)}`;
    await axios.get(url);
  }

  private async sendViaHubtel(to: string, message: string) {
    // Hubtel implementation placeholder
    this.logger.log(`Hubtel integration would send to ${to}`);
  }
}
