import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

interface FeeCalculationInput {
  hostelId: string;
  bookingAmount: number; // Amount in pesewas
  isAcceptance?: boolean; // Whether this is being charged at acceptance
}

interface FeeCalculationOutput {
  feeAmount: number;
  feeType: string;
  description: string;
}

import { ConfigService } from "@nestjs/config";

@Injectable()
export class FeeCalculationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService
  ) {}

  private getCommissionRate() {
    // Launch Mode: 0% Platform Commission
    return 0.0;
  }

  /**
   * Calculate the fee to charge based on the hostel's listing fee model
   * @param input Fee calculation input with hostel ID, booking amount, etc
   * @returns Fee amount in pesewas and description
   */
  async calculateListingFee(
    input: FeeCalculationInput,
  ): Promise<FeeCalculationOutput> {
    const hostel = await this.prisma.hostel.findUnique({
      where: { id: input.hostelId },
    });

    if (!hostel) {
      throw new Error("Hostel not found");
    }

    const feeModel = (hostel as any).listingFeeModel || "STANDARD";
    const monthlyFee = (hostel as any).monthlyListingFee;
    const revenueShare = (hostel as any).revenueSharePercentage;
    const perAcceptanceFee = (hostel as any).perAcceptanceFee;

    switch (feeModel) {
      case "STANDARD":
        // Standard per-booking fee - use default platform fee
        const rate = this.getCommissionRate();
        const standardFee = Math.ceil(input.bookingAmount * rate);
        return {
          feeAmount: standardFee,
          feeType: "STANDARD",
          description: `Standard fee (${(rate * 100).toFixed(0)}% of ${(input.bookingAmount / 100).toFixed(2)} GHS)`,
        };

      case "MONTHLY_LISTING":
        // Monthly listing fee - charge upfront or periodically
        if (!monthlyFee) {
          throw new Error(
            "Monthly listing fee not configured for this hostel",
          );
        }
        return {
          feeAmount: monthlyFee,
          feeType: "MONTHLY_LISTING",
          description: `Monthly listing fee (${(monthlyFee / 100).toFixed(2)} GHS)`,
        };

      case "REVENUE_SHARE":
        // Revenue share - percentage of booking amount
        if (revenueShare === null || revenueShare === undefined) {
          throw new Error(
            "Revenue share percentage not configured for this hostel",
          );
        }
        const revenueFee = Math.ceil((input.bookingAmount * revenueShare) / 100);
        return {
          feeAmount: revenueFee,
          feeType: "REVENUE_SHARE",
          description: `Revenue share (${revenueShare}% of ${(input.bookingAmount / 100).toFixed(2)} GHS)`,
        };

      case "PER_ACCEPTANCE":
        // Fixed fee per accepted booking
        if (!perAcceptanceFee) {
          throw new Error(
            "Per-acceptance fee not configured for this hostel",
          );
        }
        return {
          feeAmount: perAcceptanceFee,
          feeType: "PER_ACCEPTANCE",
          description: `Per-booking fee (${(perAcceptanceFee / 100).toFixed(2)} GHS)`,
        };

      default:
        throw new Error(`Unknown fee model: ${feeModel}`);
    }
  }

  /**
   * Check if a fee should be charged at acceptance time
   * @param feeModel The hostel's listing fee model
   * @returns Whether to charge at acceptance
   */
  shouldChargeAtAcceptance(feeModel: string): boolean {
    return (
      feeModel === "STANDARD" ||
      feeModel === "REVENUE_SHARE" ||
      feeModel === "PER_ACCEPTANCE"
    );
  }

  /**
   * Check if fee is monthly (billed periodically)
   * @param feeModel The hostel's listing fee model
   * @returns Whether fee is monthly
   */
  isMonthlyFee(feeModel: string): boolean {
    return feeModel === "MONTHLY_LISTING";
  }
}
