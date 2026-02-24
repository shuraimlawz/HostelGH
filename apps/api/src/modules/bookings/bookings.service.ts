import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BookingStatus, UserRole, RoomGender } from "@prisma/client";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { NotificationsService } from "../notifications/notifications.service";
import {
  AdminAuditLogService,
  AdminAction,
  AdminEntity,
} from "../admin/admin-audit.service";

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private audit: AdminAuditLogService,
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

    // Validate availability and create booking in a transaction
    return await this.prisma.$transaction(async (tx) => {
      await this.validateRoomAvailability(tx, dto, start, end, roomMap);

      const now = new Date();
      const paymentDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

      const booking = await tx.booking.create({
        data: {
          hostelId: dto.hostelId,
          tenantId,
          startDate: start,
          endDate: end,
          notes: dto.notes,
          status: BookingStatus.PENDING_APPROVAL,
          // @ts-ignore
          paymentDeadline: paymentDeadline,
          // @ts-ignore
          autoReleaseAt: paymentDeadline,
          expiresAt: paymentDeadline, // Keep for backward compatibility if needed

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

      this.sendBookingNotification(hostel.owner.email, hostel.owner.phone, {
        tenantName:
          `${tenant.firstName || ""} ${tenant.lastName || ""}`.trim() ||
          tenant.email,
        hostelName: hostel.name,
        startDate: start,
        endDate: end,
      });

      return booking;
    });
  }

  private async validateRoomAvailability(
    tx: any,
    dto: CreateBookingDto,
    start: Date,
    end: Date,
    roomMap: Map<string, any>,
  ) {
    const overlappingItems = await tx.bookingItem.findMany({
      where: {
        roomId: { in: dto.items.map((i) => i.roomId) },
        booking: {
          hostelId: dto.hostelId,
          status: {
            in: [
              BookingStatus.PENDING_APPROVAL,
              BookingStatus.APPROVED,
              BookingStatus.CONFIRMED,
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

    for (const item of dto.items) {
      const room = roomMap.get(item.roomId)!;
      const alreadyBooked = bookedQty.get(item.roomId) ?? 0;
      if (alreadyBooked + item.quantity > room.totalUnits) {
        throw new BadRequestException(
          `Not enough availability for room: ${room.name}. Available: ${room.totalUnits - alreadyBooked}, Requested: ${item.quantity}`,
        );
      }
    }
  }

  private sendBookingNotification(
    ownerEmail: string,
    ownerPhone: string | null,
    payload: {
      tenantName: string;
      hostelName: string;
      startDate: Date;
      endDate: Date;
    },
  ) {
    this.notifications
      .sendBookingRequestEmail(ownerEmail, {
        ...payload,
        startDate: payload.startDate.toDateString(),
        endDate: payload.endDate.toDateString(),
      })
      .catch((e) => console.error("Email failed", e));

    if (ownerPhone) {
      this.notifications
        .sendBookingRequestSms(ownerPhone, payload)
        .catch((e) => console.error("SMS failed", e));
    }
  }

  async updateStatus(
    actor: { id: string; role: UserRole },
    bookingId: string,
    status: BookingStatus,
    allowedSourceStatuses: BookingStatus[],
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { hostel: true },
    });
    if (!booking) throw new NotFoundException("Booking not found");

    const isOwnerOfHostel = booking.hostel.ownerId === actor.id;
    if (!(actor.role === UserRole.ADMIN || isOwnerOfHostel))
      throw new ForbiddenException("Not authorized to update this booking");

    if (!allowedSourceStatuses.includes(booking.status)) {
      throw new BadRequestException(
        `Booking cannot transition from ${booking.status} to ${status}.`,
      );
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status },
      include: { tenant: true, hostel: true },
    });
  }

  async approveBooking(
    actor: { id: string; role: UserRole },
    bookingId: string,
  ) {
    return await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { items: true, hostel: { include: { owner: true } } },
      });

      if (!booking) throw new NotFoundException("Booking not found");
      if (booking.status !== BookingStatus.PENDING_APPROVAL) {
        throw new BadRequestException("Only pending bookings can be approved.");
      }

      // Verify ownership
      if (
        actor.role !== UserRole.ADMIN &&
        booking.hostel.ownerId !== actor.id
      ) {
        throw new ForbiddenException("Not authorized to approve this booking");
      }

      // Assign slot number and update room availability
      for (const item of booking.items) {
        await tx.room.update({
          where: { id: item.roomId },
          data: {
            // @ts-ignore
            availableSlots: { decrement: item.quantity },
          },
        });
      }

      const updated: any = await tx.booking.update({
        where: { id: bookingId },
        data: {
          status: BookingStatus.APPROVED,
          // Refresh payment deadline and auto-release from approval time
          // @ts-ignore
          paymentDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
          // @ts-ignore
          autoReleaseAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        },
        include: { tenant: true, hostel: true },
      });

      // Log audit
      await this.audit.log(
        { id: actor.id } as any,
        AdminAction.APPROVE,
        AdminEntity.BOOKING,
        bookingId,
        `Booking approved for tenant ${updated.tenant.email}`,
        { tenantId: updated.tenantId, hostelId: updated.hostelId },
      );

      // Trigger notification
      this.notifications
        .sendBookingApprovedEmail(updated.tenant.email, {
          hostelName: updated.hostel.name,
          startDate: updated.startDate.toDateString(),
          endDate: updated.endDate.toDateString(),
        })
        .catch((e) => console.error("Email failed", e));

      if (updated.tenant.phone) {
        this.notifications
          .sendBookingApprovedSms(updated.tenant.phone, {
            hostelName: updated.hostel.name,
          })
          .catch((e) => console.error("SMS failed", e));
      }

      return updated;
    });
  }

  async rejectBooking(
    actor: { id: string; role: UserRole },
    bookingId: string,
    reason?: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { hostel: true },
    });
    if (!booking) throw new NotFoundException("Booking not found");

    const isOwnerOfHostel = booking.hostel.ownerId === actor.id;
    if (!(actor.role === UserRole.ADMIN || isOwnerOfHostel))
      throw new ForbiddenException("Not authorized to reject this booking");

    if (booking.status !== BookingStatus.PENDING_APPROVAL) {
      throw new BadRequestException(
        `Booking is in ${booking.status} state and cannot be rejected.`,
      );
    }

    const updated = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.REJECTED,
        notes: reason ? `Rejected: ${reason}` : booking.notes,
      },
      include: { tenant: true, hostel: true },
    });

    // Log audit
    this.audit
      .log(
        { id: actor.id } as any,
        AdminAction.REJECT,
        AdminEntity.BOOKING,
        bookingId,
        `Booking rejected: ${reason || "No reason provided"}`,
        { tenantId: updated.tenantId, reason },
      )
      .catch(() => {});

    // Trigger notification
    this.notifications
      .sendBookingRejectedEmail(updated.tenant.email, {
        hostelName: updated.hostel.name,
        reason: reason,
      })
      .catch((e) => console.error("Email failed", e));

    return updated;
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

  async checkIn(actor: { id: string; role: UserRole }, bookingId: string) {
    return this.updateStatus(actor, bookingId, BookingStatus.CHECKED_IN, [
      BookingStatus.CONFIRMED,
      BookingStatus.APPROVED,
    ]); // Allow from APPROVED if payment is handled offline
  }

  async checkOut(actor: { id: string; role: UserRole }, bookingId: string) {
    return this.updateStatus(actor, bookingId, BookingStatus.CHECKED_OUT, [
      BookingStatus.CHECKED_IN,
    ]);
  }

  async complete(actor: { id: string; role: UserRole }, bookingId: string) {
    return this.updateStatus(actor, bookingId, BookingStatus.COMPLETED, [
      BookingStatus.CHECKED_OUT,
    ]);
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
    // Admin only action (guarded by controller)
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
    // Get all bookings for owner's hostels
    const bookings = await this.prisma.booking.findMany({
      where: { hostel: { ownerId } },
      include: { items: true, hostel: { include: { rooms: true } } },
      orderBy: { createdAt: "asc" },
    });

    // Calculate monthly trends for last 6 months
    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const monthlyData = [];
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date(
        now.getFullYear(),
        now.getMonth() - (5 - i),
        1,
      );
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() - (5 - i) + 1,
        0,
      );

      const monthBookings = bookings.filter((b) => {
        const createdDate = new Date(b.createdAt);
        return createdDate >= monthStart && createdDate <= monthEnd;
      });

      const monthRevenue =
        monthBookings
          .filter(
            (b) =>
              b.status === "CONFIRMED" ||
              b.status === "CHECKED_IN" ||
              b.status === "CHECKED_OUT" ||
              b.status === "COMPLETED",
          )
          .reduce((sum, b) => {
            const itemTotal = b.items.reduce(
              (itemSum, item) => itemSum + item.unitPrice * item.quantity,
              0,
            );
            return sum + itemTotal;
          }, 0) / 100; // Convert from cents

      monthlyData.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short" }),
        bookings: monthBookings.length,
        revenue: Math.round(monthRevenue),
      });
    }

    // Calculate occupancy rate
    const totalRooms = await this.prisma.room.count({
      where: { hostel: { ownerId }, isActive: true },
    });

    const currentOccupants = bookings.filter(
      (b) => b.status === "CHECKED_IN",
    ).length;
    const occupancyRate =
      totalRooms > 0 ? Math.round((currentOccupants / totalRooms) * 100) : 0;

    // Calculate trend percentages (compare current month vs previous month)
    const currentMonthBookings = monthlyData[5]?.bookings || 0;
    const previousMonthBookings = monthlyData[4]?.bookings || 1; // Avoid division by zero
    const bookingTrend =
      previousMonthBookings > 0
        ? Math.round(
          ((currentMonthBookings - previousMonthBookings) /
            previousMonthBookings) *
          100,
        )
        : 0;

    return {
      monthlyTrends: monthlyData,
      occupancyRate,
      trends: {
        bookings: bookingTrend,
      },
    };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleAutoRelease() {
    console.log("Running auto-release cron job...");
    const now = new Date();

    // Find expired bookings that are not yet confirmed
    const expiredBookings = await this.prisma.booking.findMany({
      where: {
        status: {
          in: [BookingStatus.PENDING_APPROVAL, BookingStatus.APPROVED],
        },
        // @ts-ignore
        autoReleaseAt: { lt: now },
      },
      include: { items: true },
    });

    if (expiredBookings.length === 0) return;

    console.log(`Found ${expiredBookings.length} expired bookings to release.`);

    for (const booking of expiredBookings) {
      await this.prisma.$transaction(async (tx) => {
        // Return slots to rooms if it was approved
        if (booking.status === BookingStatus.APPROVED) {
          // @ts-ignore
          for (const item of booking.items) {
            await tx.room.update({
              where: { id: item.roomId },
              // @ts-ignore
              data: { availableSlots: { increment: item.quantity } },
            });
          }
        }

        // Update booking status to EXPIRED
        await tx.booking.update({
          where: { id: booking.id },
          data: {
            status: BookingStatus.EXPIRED,
            notes: "Auto-released due to payment expiration (24h).",
          },
        });
      });
    }
  }
}
