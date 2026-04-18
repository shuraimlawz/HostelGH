import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import axios from "axios";

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly baseUrl = "https://api.paystack.co";

  constructor(private config: ConfigService) {}

  private get secretKey() {
    const key = this.config.get<string>("paystack.secretKey");
    if (!key)
      throw new BadRequestException("PAYSTACK_SECRET_KEY not configured");
    return key;
  }

  async initializeTransaction(params: {
    email: string;
    amount: number; // minor unit
    reference: string;
    callback_url?: string;
    metadata?: any;
    subaccount?: string;
    bearer?: "subaccount" | "account";
  }) {
    try {
      const res = await axios.post(
        `${this.baseUrl}/transaction/initialize`,
        {
          email: params.email,
          amount: params.amount,
          reference: params.reference,
          callback_url: params.callback_url,
          metadata: params.metadata,
          subaccount: params.subaccount,
          bearer: params.bearer,
        },
        { headers: { Authorization: `Bearer ${this.secretKey}` } },
      );
      return res.data;
    } catch (error) {
      this.logger.error(
        `Paystack Init Error: ${(error as any).response?.data?.message || (error as any).message}`,
      );
      throw new BadRequestException(
        "Failed to initialize Paystack transaction",
      );
    }
  }

  async createSubaccount(params: {
    business_name: string;
    settlement_bank: string;
    account_number: string;
    percentage_charge: number;
  }) {
    try {
      const res = await axios.post(`${this.baseUrl}/subaccount`, params, {
        headers: { Authorization: `Bearer ${this.secretKey}` },
      });
      return res.data;
    } catch (error) {
      this.logger.error(
        `Paystack Subaccount Error: ${(error as any).response?.data?.message || (error as any).message}`,
      );
      throw new BadRequestException("Failed to create Paystack subaccount");
    }
  }

  async verifyTransaction(reference: string) {
    try {
      const res = await axios.get(
        `${this.baseUrl}/transaction/verify/${reference}`,
        {
          headers: { Authorization: `Bearer ${this.secretKey}` },
        },
      );
      return res.data;
    } catch (error) {
      this.logger.error(
        `Paystack Verify Error: ${(error as any).response?.data?.message || (error as any).message}`,
      );
      throw new BadRequestException("Failed to verify Paystack transaction");
    }
  }

  async getBanks() {
    try {
      const res = await axios.get(`${this.baseUrl}/bank?country=ghana`, {
        headers: { Authorization: `Bearer ${this.secretKey}` },
      });
      return res.data;
    } catch (error) {
      this.logger.error(`Paystack Get Banks Error: ${(error as any).message}`);
      throw new BadRequestException("Failed to fetch banks from Paystack");
    }
  }

  async createTransferRecipient(params: {
    type: string;
    name: string;
    account_number: string;
    bank_code: string;
    currency: string;
  }) {
    try {
      const res = await axios.post(`${this.baseUrl}/transferrecipient`, params, {
        headers: { Authorization: `Bearer ${this.secretKey}` },
      });
      return res.data;
    } catch (error) {
      this.logger.error(
        `Paystack Recipient Error: ${(error as any).response?.data?.message || (error as any).message}`,
      );
      throw new BadRequestException("Failed to create transfer recipient");
    }
  }

  async initiateTransfer(params: {
    source: string;
    amount: number;
    recipient: string;
    reason?: string;
    reference?: string;
  }) {
    try {
      const res = await axios.post(`${this.baseUrl}/transfer`, params, {
        headers: { Authorization: `Bearer ${this.secretKey}` },
      });
      return res.data;
    } catch (error) {
      this.logger.error(
        `Paystack Transfer Error: ${(error as any).response?.data?.message || (error as any).message}`,
      );
      throw new BadRequestException("Failed to initiate transfer");
    }
  }
}
