import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BookingStatus, UserRole, RoomStatus } from "@prisma/client";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { NotificationsService } from "../notifications/notifications.service";
import {
  AdminAuditLogService,
  AdminAction,
  AdminEntity,
} from "../admin/admin-audit.service";

import { ConfigService } from "@nestjs/config";

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private audit: AdminAuditLogService,
    private config: ConfigService,
  ) { }

  async createBooking(tenantId: string, dto: CreateBookingDto) {
    const hostel = await this.prisma.hostel.findUnique({
      where: { id: dto.hostelId },
      include: { rooms: true, owner: true },
    });
    if (!hostel || !hostel.isPublished)
      throw new NotFoundException("Hostel not found or not published");

    const tenant = await this.prisma.user.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) throw new NotFoundException("User not found");

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    if (!(start < end)) throw new BadRequestException("Invalid date range");

    // Validate rooms & compute price snapshot
    const roomMap = new Map(hostel.rooms.map((r) => [r.id, r]));
    for (const item of dto.items) {
      const room = roomMap.get(item.roomId);
      if (!room || !room.isActive)
        throw new BadRequestException(`Invalid room: ${item.roomId}`);
      if (item.quantity > room.totalUnits)
        throw new BadRequestException(
          `Quantity exceeds total capacity for room: ${room.name}`,
        );
    }

    // Create booking in PENDING status
    return await this.prisma.booking.create({
      data: {
        hostelId: dto.hostelId,
        tenantId,
        startDate: start,
        endDate: end,
        notes: dto.notes,
        status: BookingStatus.PENDING,
        // KYC fields
        levelOfStudy: dto.levelOfStudy,
        guardianName: dto.guardianName,
        guardianPhone: dto.guardianPhone,
        admissionDocUrl: dto.admissionDocUrl,
        passportPhotoUrl: dto.passportPhotoUrl,
        items: {
          create: dto.items.map((i) => {
            const room = roomMap.get(i.roomId)!;
            return {
              roomId: i.roomId,
              quantity: i.quantity,
              unitPrice: room.pricePerTerm,
            };
          }),
        },
      },
      include: { items: true },
    });
  }

  /**
   * Called after successful payment (Webhook or Manual Verification)
   * This method transitions PENDING -> PAYMENT_SECURED -> RESERVED (if available)
   */
  async processSuccessfulPayment(bookingId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { items: true, hostel: { include: { owner: true } } },
      });

      if (!booking) throw new NotFoundException("Booking not found");

      // 1. Mark as PAYMENT_SECURED
      await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.PAYMENT_SECURED },
      });

      // 2. Check if slot is still available
      const roomMap = new Map();
      for (const item of booking.items) {
        const room = await tx.room.findUnique({ where: { id: item.roomId } });
        roomMap.set(item.roomId, room);
      }

      try {
        await this.validateRoomAvailability(tx, booking.items, booking.startDate, booking.endDate, roomMap);
        
        // 3. Reserve the room
        for (const item of booking.items) {
          await tx.room.update({
            where: { id: item.roomId },
            data: {
              availableSlots: { decrement: item.quantity },
            },
          });
        }

        const updatedBooking = await tx.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.RESERVED },
          include: { tenant: true, hostel: true },
        });

        // Notifications
        this.notifications.sendBookingApprovedEmail(updatedBooking.tenant.email, {
          hostelName: updatedBooking.hostel.name,
          startDate: updatedBooking.startDate.toDateString(),
          endDate: updatedBooking.endDate.toDateString(),
        }).catch(() => {});

        return updatedBooking;
      } catch (e) {
        // Handle rejection / refund flow placeholder
        await tx.booking.update({
          where: { id: bookingId },
          data: { status: BookingStatus.CANCELLED, notes: "Room no longer available at time of payment secured." },
        });
        throw new BadRequestException("Room no longer available. Refund process initiated.");
      }
    });
  }

  private async validateRoomAvailability(
    tx: any,
    items: any[],
    start: Date,
    end: Date,
    roomMap: Map<string, any>,
  ) {
    const overlappingItems = await tx.bookingItem.findMany({
      where: {
        roomId: { in: items.map((i) => i.roomId) },
        booking: {
          status: {
            in: [
              BookingStatus.RESERVED,
              BookingStatus.CHECKED_IN,
              BookingStatus.COMPLETED,
            ],
          },
          startDate: { lt: end },
          endDate: { gt: start },
        },
      },
      select: { roomId: true, quantity: true },
    });

    const bookedQty = new Map<string, number>();
    for (const row of overlappingItems)
      bookedQty.set(
        row.roomId,
        (bookedQty.get(row.roomId) ?? 0) + row.quantity,
      );

    for (const item of items) {
      const room = roomMap.get(item.roomId)!;
      const alreadyBooked = bookedQty.get(item.roomId) ?? 0;
      if (alreadyBooked + item.quantity > room.totalUnits) {
        throw new BadRequestException(
          `Not enough availability for room: ${room.name}. Available: ${room.totalUnits - alreadyBooked}, Requested: ${item.quantity}`,
        );
      }
    }
  }

  async setTenantCheckedIn(tenantId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { hostel: true },
    });

    if (!booking) throw new NotFoundException("Booking not found");
    if (booking.tenantId !== tenantId) throw new ForbiddenException("Not authorized");
    if (booking.status !== BookingStatus.RESERVED && booking.status !== BookingStatus.CHECKED_IN) {
        throw new BadRequestException("Check-in only allowed for RESERVED bookings");
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { userCheckedIn: true, status: BookingStatus.CHECKED_IN },
    });

    await this.checkAndTriggerPaymentRelease(bookingId);
    return updated;
  }

  async setManagerConfirmed(managerId: string, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { hostel: true },
    });

    if (!booking) throw new NotFoundException("Booking not found");
    if (booking.hostel.ownerId !== managerId) throw new ForbiddenException("Not authorized");
    if (booking.status !== BookingStatus.RESERVED && booking.status !== BookingStatus.CHECKED_IN) {
        throw new BadRequestException("Confirmation only allowed for RESERVED or CHECKED_IN bookings");
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: { managerConfirmed: true },
    });

    await this.checkAndTriggerPaymentRelease(bookingId);
    return updated;
  }

  private async checkAndTriggerPaymentRelease(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true, hostel: true },
    });

    if (booking?.userCheckedIn && booking?.managerConfirmed && booking.status !== BookingStatus.COMPLETED) {
      await this.triggerPaymentRelease(booking);
    }
  }

  private getCommissionRate() {
    const envRate = this.config.get<string>("COMMISSION_RATE");
    const parsed = envRate ? Number(envRate) : NaN;
    if (!Number.isFinite(parsed) || parsed <= 0 || parsed >= 1) return 0.1;
    return parsed;
  }

  private async triggerPaymentRelease(booking: any) {
    if (!booking.payment || booking.payment.status !== "SUCCESS") return;

    const amountPaid = booking.payment.amount;
    const rate = this.getCommissionRate();
    const commission = Math.round(amountPaid * rate);
    const payoutAmount = amountPaid - commission;

    await this.prisma.$transaction(async (tx) => {
      // 1. Update booking
      await tx.booking.update({
        where: { id: booking.id },
        data: {
          status: BookingStatus.COMPLETED,
          commissionAmount: commission,
          payoutAmount: payoutAmount,
        },
      });

      // 2. Transfer from pending to available balance
      await tx.wallet.update({
        where: { ownerId: booking.hostel.ownerId },
        data: {
          balance: { increment: payoutAmount },
          pendingBalance: { decrement: booking.payment.ownerEarnings },
        },
      });
      
      console.log(`Payment released for booking ${booking.id}. Commission: ${commission}, Payout: ${payoutAmount}`);
    });

    this.notifications.sendPaymentConfirmedEmail(booking.hostel.ownerId, {
        hostelName: booking.hostel.name,
        amount: `GH₵ ${(payoutAmount / 100).toFixed(2)}`,
        reference: booking.payment.reference
    }).catch(() => {});
  }

  async getMyBookings(tenantId: string) {
    return this.prisma.booking.findMany({
      where: { tenantId },
      include: {
        items: { include: { room: true } },
        hostel: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getOwnerBookings(ownerId: string) {
    return this.prisma.booking.findMany({
      where: { hostel: { ownerId } },
      include: {
        items: { include: { room: true } },
        hostel: true,
        tenant: true,
        payment: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async cancelBooking(
    actor: { id: string; role: UserRole },
    bookingId: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { items: true, hostel: true, payment: true },
    });
    if (!booking) throw new NotFoundException("Booking not found");
    if (booking.tenantId !== actor.id && actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Not authorized to cancel this booking");
    }
    
    // Can only cancel before check-in
    if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CHECKED_IN) {
      throw new BadRequestException("Cannot cancel booking after check-in");
    }

    return await this.prisma.$transaction(async (tx) => {
      if (booking.status === BookingStatus.RESERVED) {
        for (const item of booking.items) {
          await tx.room.update({
            where: { id: item.roomId },
            data: { availableSlots: { increment: item.quantity } },
          });
        }
      }
      return tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELLED },
      });
    });
  }

  async requestDeletion(
    actor: { id: string; role: UserRole },
    bookingId: string,
    reason: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { hostel: true },
    });

    if (!booking) throw new NotFoundException("Booking not found");

    const isOwner = booking.hostel.ownerId === actor.id;
    if (!isOwner && actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Not authorized to request deletion");
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        deletionRequested: true,
        deletionReason: reason || "Owner requested deletion of old record.",
      },
    });
  }

  async confirmDeletion(bookingId: string) {
    return this.prisma.booking.delete({
      where: { id: bookingId },
    });
  }

  async getPendingDeletions() {
    return this.prisma.booking.findMany({
      where: { deletionRequested: true },
      include: {
        hostel: true,
        tenant: true,
        items: { include: { room: true } },
      },
    });
  }

  async getOwnerAnalytics(ownerId: string) {
    const bookings = await this.prisma.booking.findMany({
      where: { hostel: { ownerId } },
      include: { items: true, hostel: { include: { rooms: true } }, payment: true },
      orderBy: { createdAt: "asc" },
    });

    const now = new Date();
    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0);

      const monthBookings = bookings.filter((b) => {
        const createdDate = new Date(b.createdAt);
        return createdDate >= monthStart && createdDate <= monthEnd;
      });

      const monthRevenue = monthBookings
          .filter((b) => b.status === BookingStatus.COMPLETED)
          .reduce((sum, b) => sum + (b.payoutAmount || 0), 0) / 100;

      monthlyData.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short" }),
        bookings: monthBookings.length,
        revenue: Math.round(monthRevenue),
      });
    }

    const totalRooms = await this.prisma.room.count({
      where: { hostel: { ownerId }, isActive: true },
    });

    const currentOccupants = bookings.filter(
      (b) => b.status === BookingStatus.CHECKED_IN || b.status === BookingStatus.COMPLETED,
    ).length;
    const occupancyRate = totalRooms > 0 ? Math.round((currentOccupants / totalRooms) * 100) : 0;

    return {
      monthlyTrends: monthlyData,
      occupancyRate,
      trends: {
        bookings: 0, // Placeholder
      },
    };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleAutoRelease() {
    const expiredBookings = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING,
        autoReleaseAt: { lt: new Date() },
      },
    });

    for (const booking of expiredBookings) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.CANCELLED },
      });
      console.log(`Auto-released booking ${booking.id} due to payment timeout.`);
    }
  }
}
