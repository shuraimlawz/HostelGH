import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CreateDisputeDto } from "./dto/create-dispute.dto";
import { BookingStatus, DisputeStatus } from "@prisma/client";

@Injectable()
export class DisputesService {
  constructor(private prisma: PrismaService) {}

  async createDispute(dto: CreateDisputeDto) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
    });

    if (!booking) throw new NotFoundException("Booking not found");

    return await this.prisma.$transaction(async (tx) => {
      // 1. Create dispute
      const dispute = await tx.dispute.create({
        data: {
          bookingId: dto.bookingId,
          raisedBy: dto.raisedBy,
          reason: dto.reason,
          details: dto.details,
          status: DisputeStatus.OPEN,
        },
      });

      // 2. Mark booking as DISPUTED
      await tx.booking.update({
        where: { id: dto.bookingId },
        data: { status: BookingStatus.DISPUTED },
      });

      return dispute;
    });
  }

  async getDispute(id: string) {
    const dispute = await this.prisma.dispute.findUnique({
      where: { id },
      include: { booking: true },
    });
    if (!dispute) throw new NotFoundException("Dispute not found");
    return dispute;
  }

  async resolveDispute(id: string, status: DisputeStatus) {
    return await this.prisma.dispute.update({
      where: { id },
      data: { status },
    });
  }

  async getDisputesByBooking(bookingId: string) {
    return this.prisma.dispute.findMany({
      where: { bookingId },
    });
  }
}
