import { Injectable, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { PaystackService } from "../payments/paystack.service";
import { CreateSettlementAccountDto } from "./dto/create-settlement-account.dto";

@Injectable()
export class WalletsService {
  constructor(
    private prisma: PrismaService,
    private paystack: PaystackService,
  ) {}

  async getWalletByOwner(ownerId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { ownerId },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: { ownerId, balance: 0 },
      });
    }

    return wallet;
  }

  async getBanks() {
    return this.paystack.getBanks();
  }

  async getSettlementAccount(ownerId: string) {
    return this.prisma.settlementAccount.findUnique({
      where: { ownerId },
    });
  }

  async updateSettlementAccount(ownerId: string, dto: CreateSettlementAccountDto) {
    // 1. Create or Get Paystack Transfer Recipient
    let recipientCode: string;

    try {
      const recipientRes = await this.paystack.createTransferRecipient({
        type: "ghipss", // Both bank and mobile money accounts in Ghana use the GHIPSS network via Paystack
        name: dto.accountName,
        account_number: dto.accountNumber,
        bank_code: dto.bankCode,
        currency: "GHS",
      });
      recipientCode = recipientRes.data.recipient_code;
    } catch (error: any) {
      throw new BadRequestException(error.message || "Failed to register recipient with Paystack");
    }

    // 2. Save to Database
    return this.prisma.settlementAccount.upsert({
      where: { ownerId },
      create: {
        ownerId,
        accountNumber: dto.accountNumber,
        bankCode: dto.bankCode,
        bankName: dto.bankName,
        accountName: dto.accountName,
        method: dto.method,
        recipientCode,
      },
      update: {
        accountNumber: dto.accountNumber,
        bankCode: dto.bankCode,
        bankName: dto.bankName,
        accountName: dto.accountName,
        method: dto.method,
        recipientCode,
      },
    });
  }
}
