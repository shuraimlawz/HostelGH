import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreatePayoutMethodDto } from "./dto/provide-payout-method.dto";
import { PaystackService } from "../payments/paystack.service";

@Injectable()
export class PayoutsService {
  constructor(
    private prisma: PrismaService,
    private paystack: PaystackService,
  ) { }

  async create(ownerId: string, dto: CreatePayoutMethodDto) {
    if (dto.isDefault) {
      await this.prisma.payoutMethod.updateMany({
        where: { ownerId },
        data: { isDefault: false },
      });
    }

    const method = await this.prisma.payoutMethod.create({
      data: {
        ...dto,
        ownerId,
      },
    });

    if (dto.isDefault) {
      await this.handleSubaccountSync(ownerId, method);
    }

    return method;
  }

  private async handleSubaccountSync(ownerId: string, method: any) {
    // Only for BANK or MOBILE_MONEY if supported by subaccount
    // For Ghana, both Bank and MoMo work as subaccounts
    const owner = await this.prisma.user.findUnique({ where: { id: ownerId } });
    if (!owner) return;

    try {
      const subRes = await this.paystack.createSubaccount({
        business_name: `${owner.firstName} ${owner.lastName}` || owner.email,
        settlement_bank: method.bankCode || method.provider, // Paystack expects bank code
        account_number: method.accountNumber,
        percentage_charge: 5, // 5% for the developer/platform
      });

      if (subRes?.data?.subaccount_code) {
        await this.prisma.user.update({
          where: { id: ownerId },
          data: { paystackSubaccountCode: subRes.data.subaccount_code },
        });
      }
    } catch (error) {
      console.error("Subaccount creation failed:", error.message);
      // We don't throw here to avoid blocking method save, but maybe we should warn the user
    }
  }

  async createPayoutRequest(ownerId: string, amount: number) {
    // Validate balance
    const wallet = await this.prisma.wallet.findUnique({ where: { ownerId } });
    if (!wallet || wallet.balance < amount) {
      throw new BadRequestException("Insufficient balance in wallet");
    }

    // Check for default payout method
    const defaultMethod = await this.prisma.payoutMethod.findFirst({
      where: { ownerId, isDefault: true },
    });
    if (!defaultMethod) {
      throw new BadRequestException("Please set a default payout method first");
    }

    return await this.prisma.$transaction(async (tx) => {
      // Deduct from wallet
      await tx.wallet.update({
        where: { ownerId },
        data: { balance: { decrement: amount } },
      });

      // Create request with snapshot of payout method
      return tx.payoutRequest.create({
        data: {
          ownerId,
          amount,
          status: "PENDING",
          payoutMethodDetails: {
            bankCode: defaultMethod.bankCode,
            accountNumber: defaultMethod.accountNumber,
            accountName: defaultMethod.accountName,
            provider: defaultMethod.provider,
            type: defaultMethod.type,
          },
        },
      });
    });
  }

  async processPayout(adminId: string, requestId: string, action: "APPROVE" | "REJECT") {
    const request = await this.prisma.payoutRequest.findUnique({
      where: { id: requestId },
      include: { owner: true },
    });

    if (!request) throw new NotFoundException("Payout request not found");
    if (request.status !== "PENDING") {
      throw new BadRequestException(`Request is already ${request.status}`);
    }

    if (action === "REJECT") {
      return await this.prisma.$transaction(async (tx) => {
        // Refund the wallet
        await tx.wallet.update({
          where: { ownerId: request.ownerId },
          data: { balance: { increment: request.amount } },
        });

        return tx.payoutRequest.update({
          where: { id: requestId },
          data: {
            status: "REJECTED",
            processedBy: adminId,
          },
        });
      });
    }

    // Action is APPROVE
    // In a real system, you'd trigger Paystack Transfer here
    // For this MVP, we move it to PAID status after approval
    // If Paystack Transfer is enabled, we'd call Paystack API and wait for webhook

    return this.prisma.payoutRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        processedBy: adminId,
      },
    });
  }

  async getPayoutHistory(ownerId: string) {
    return this.prisma.payoutRequest.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAllRequests() {
    return this.prisma.payoutRequest.findMany({
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findAll(ownerId: string) {
    return this.prisma.payoutMethod.findMany({
      where: { ownerId },
      orderBy: { createdAt: "desc" },
    });
  }

  async remove(ownerId: string, id: string) {
    const method = await this.prisma.payoutMethod.findUnique({
      where: { id },
    });

    if (!method || method.ownerId !== ownerId) {
      throw new NotFoundException("Payout method not found");
    }

    return this.prisma.payoutMethod.delete({
      where: { id },
    });
  }

  async setDefault(ownerId: string, id: string) {
    await this.prisma.payoutMethod.updateMany({
      where: { ownerId },
      data: { isDefault: false },
    });

    const method = await this.prisma.payoutMethod.update({
      where: { id },
      data: { isDefault: true },
    });

    await this.handleSubaccountSync(ownerId, method);

    return method;
  }
}
