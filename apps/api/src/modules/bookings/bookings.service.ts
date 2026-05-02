import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BookingStatus, UserRole, HostelBookingStatus } from "@prisma/client";
import { Cron, CronExpression } from "@nestjs/schedule";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { NotificationsService } from "../notifications/notifications.service";
import { AdminAuditLogService, AdminAction, AdminEntity } from "../admin/admin-audit.service";

@Injectable()
export class BookingsService {
  private readonly logger = new Logger(BookingsService.name);

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
    if (!hostel || !hostel.isPublished || hostel.isArchived)
      throw new NotFoundException("Hostel not found, not published, or archived");

    const tenant = await this.prisma.user.findUnique({
      where: { id: tenantId },
    });
    if (!tenant) throw new NotFoundException("User not found");

    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    // Validate rooms
    const roomMap = new Map(hostel.rooms.map((r) => [r.id, r]));
    for (const item of dto.items) {
      const room = roomMap.get(item.roomId);
      if (!room || !room.isActive)
        throw new BadRequestException(`Invalid room: ${item.roomId}`);
      if (item.quantity > room.availableSlots)
        throw new BadRequestException(
          `Quantity exceeds available slots for room: ${room.name}`,
        );
    }

    return await this.prisma.booking.create({
      data: {
        hostelId: dto.hostelId,
        tenantId,
        startDate: start,
        endDate: end,
        notes: dto.notes,
        status: BookingStatus.PENDING,
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

  async processSuccessfulPayment(bookingId: string) {
    return await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.findUnique({
        where: { id: bookingId },
        include: { items: true, hostel: { include: { owner: true, rooms: true } } },
      });

      if (!booking) throw new NotFoundException("Booking not found");

      // Check slot availability again
      const roomMap = new Map();
      for (const item of booking.items) {
        const room = await tx.room.findUnique({ where: { id: item.roomId } });
        roomMap.set(item.roomId, room);
      }

      for (const item of booking.items) {
        const room = roomMap.get(item.roomId)!;
        if (room.availableSlots < item.quantity) {
           await tx.booking.update({
             where: { id: bookingId },
             data: { status: BookingStatus.CANCELLED, notes: "Room no longer available." },
           });
           throw new BadRequestException("Room no longer available. Please contact support for a refund.");
        }
      }

      // Reserve the room slots
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
        data: { status: BookingStatus.COMPLETED },
        include: { tenant: true, hostel: true },
      });

      // Check if hostel is now fully booked
      const allRooms = await tx.room.findMany({ where: { hostelId: booking.hostelId, isActive: true } });
      const totalAvailableSlots = allRooms.reduce((sum, r) => sum + r.availableSlots, 0);

      if (totalAvailableSlots <= 0) {
        await tx.hostel.update({
           where: { id: booking.hostelId },
           data: { 
             isArchived: true, 
             bookingStatus: HostelBookingStatus.FULL 
           }
        });
        this.logger.log(`Hostel ${booking.hostelId} automatically archived as it reached full capacity.`);
      }

      // Notifications
      this.notifications.sendBookingApprovedEmail(updatedBooking.tenant.email, {
        hostelName: updatedBooking.hostel.name,
        startDate: updatedBooking.startDate.toDateString(),
        endDate: updatedBooking.endDate.toDateString(),
      }).catch(() => {});

      return updatedBooking;
    });
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

  async approveBooking(
    actor: { id: string; role: UserRole },
    bookingId: string,
    slotNumber?: number,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { hostel: true, tenant: true, items: true },
    });

    if (!booking) throw new NotFoundException("Booking not found");

    // Authorization: only owner of hostel or admin can approve
    if (booking.hostel.ownerId !== actor.id && actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Not authorized to approve this booking");
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(`Cannot approve booking with status: ${booking.status}`);
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.PAYMENT_SECURED,
        slotNumber: slotNumber,
      },
      include: { tenant: true, hostel: true, items: { include: { room: true } } },
    });

    // Log audit trail - fire and forget
    this.audit.log(
      null,
      AdminAction.APPROVE,
      AdminEntity.BOOKING,
      bookingId,
      `Approved booking for ${booking.tenant.firstName} ${booking.tenant.lastName} at ${booking.hostel.name}`,
      { before: { status: BookingStatus.PENDING }, after: { status: BookingStatus.PAYMENT_SECURED } },
    ).catch(() => {});

    // Send email notification
    this.notifications.sendBookingApprovedEmail(booking.tenant.email, {
      hostelName: booking.hostel.name,
      startDate: booking.startDate.toDateString(),
      endDate: booking.endDate.toDateString(),
    }).catch(() => {});

    return updatedBooking;
  }

  async rejectBooking(
    actor: { id: string; role: UserRole },
    bookingId: string,
    reason?: string,
  ) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { hostel: true, tenant: true, items: true },
    });

    if (!booking) throw new NotFoundException("Booking not found");

    // Authorization: only owner of hostel or admin can reject
    if (booking.hostel.ownerId !== actor.id && actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Not authorized to reject this booking");
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(`Cannot reject booking with status: ${booking.status}`);
    }

    const updatedBooking = await this.prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: BookingStatus.CANCELLED,
        notes: reason || "Booking rejected by hostel owner",
      },
      include: { tenant: true, hostel: true, items: { include: { room: true } } },
    });

    // Log audit trail - fire and forget
    this.audit.log(
      null,
      AdminAction.REJECT,
      AdminEntity.BOOKING,
      bookingId,
      `Rejected booking for ${booking.tenant.firstName} ${booking.tenant.lastName} at ${booking.hostel.name}. Reason: ${reason || "No reason provided"}`,
      { before: { status: BookingStatus.PENDING }, after: { status: BookingStatus.CANCELLED }, reason },
    ).catch(() => {});

    // Send rejection email
    this.notifications.sendBookingRejectedEmail(booking.tenant.email, {
      hostelName: booking.hostel.name,
      reason: reason || "Hostel owner rejected your booking request",
    }).catch(() => {});

    return updatedBooking;
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
    if (booking.hostel.ownerId !== actor.id && actor.role !== UserRole.ADMIN) {
      throw new ForbiddenException("Not authorized to cancel this booking");
    }

    return await this.prisma.$transaction(async (tx) => {
      if (booking.status === BookingStatus.COMPLETED) {
        for (const item of booking.items) {
          await tx.room.update({
            where: { id: item.roomId },
            data: { availableSlots: { increment: item.quantity } },
          });
        }
        
        // Unarchive hostel if it was full
        await tx.hostel.update({
          where: { id: booking.hostelId },
          data: { isArchived: false, bookingStatus: HostelBookingStatus.OPEN }
        });
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

      monthlyData.push({
        month: monthStart.toLocaleDateString("en-US", { month: "short" }),
        bookings: monthBookings.length,
      });
    }

    const totalRooms = await this.prisma.room.count({
      where: { hostel: { ownerId }, isActive: true },
    });

    return {
      monthlyTrends: monthlyData,
      occupancyRate: 100, // Placeholder
      trends: {
        bookings: bookings.length,
      },
    };
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleAutoRelease() {
    const expiredBookings = await this.prisma.booking.findMany({
      where: {
        status: BookingStatus.PENDING,
        createdAt: { lt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // 24 hours old
      },
    });

    for (const booking of expiredBookings) {
      await this.prisma.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.CANCELLED },
      });
      console.log(`Auto-cancelled booking ${booking.id} due to payment timeout.`);
    }
  }

  /**
   * Returns a full receipt for a booking.
   * Only the booking tenant or an admin can access this.
   */
  async getBookingReceipt(userId: string, userRole: UserRole, bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        hostel: {
          select: {
            id: true,
            name: true,
            addressLine: true,
            city: true,
            region: true,
            university: true,
            whatsappNumber: true,
          },
        },
        tenant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        items: {
          include: {
            room: {
              select: {
                name: true,
                roomConfiguration: true,
                gender: true,
              },
            },
          },
        },
        payment: true,
      },
    });

    if (!booking) throw new NotFoundException("Booking not found");

    // Authorization: only the tenant or admin
    if (booking.tenantId !== userId && userRole !== UserRole.ADMIN) {
      throw new ForbiddenException("Not authorized to view this receipt");
    }

    // Calculate amounts
    const baseAmount = booking.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const totalPaid = booking.payment?.amount ?? baseAmount;
    const platformFee = booking.payment?.platformFee ?? 0;
    const processingFee = booking.payment?.processingFee ?? 0;

    return {
      receiptNumber: booking.payment?.reference ?? `GH-${booking.id.slice(-8).toUpperCase()}`,
      bookingId: booking.id,
      status: booking.status,
      paymentStatus: booking.payment?.status ?? null,
      paymentMethod: booking.payment?.method ?? null,
      paymentProvider: booking.payment?.provider ?? null,
      paidAt: booking.payment?.paidAt ?? null,
      createdAt: booking.createdAt,
      startDate: booking.startDate,
      endDate: booking.endDate,
      slotNumber: booking.slotNumber,
      tenant: booking.tenant,
      hostel: booking.hostel,
      items: booking.items.map((item) => ({
        roomName: item.room.name,
        roomConfiguration: item.room.roomConfiguration,
        gender: item.room.gender,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        subtotal: item.unitPrice * item.quantity,
      })),
      amounts: {
        baseAmount,
        platformFee,
        processingFee,
        totalPaid,
        currency: booking.payment?.currency ?? "GHS",
      },
    };
  }
}
