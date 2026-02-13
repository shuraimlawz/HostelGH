import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { BookingStatus, UserRole } from "@prisma/client";
import { CreateBookingDto } from "./dto/create-booking.dto";
import { NotificationsService } from "../notifications/notifications.service";

@Injectable()
export class BookingsService {
    constructor(
        private prisma: PrismaService,
        private notifications: NotificationsService
    ) { }

    async createBooking(tenantId: string, dto: CreateBookingDto) {
        const hostel = await this.prisma.hostel.findUnique({
            where: { id: dto.hostelId },
            include: { rooms: true, owner: true },
        });
        if (!hostel || !hostel.isPublished) throw new NotFoundException("Hostel not found or not published");

        const tenant = await this.prisma.user.findUnique({ where: { id: tenantId } });
        if (!tenant) throw new NotFoundException("User not found");

        const start = new Date(dto.startDate);
        const end = new Date(dto.endDate);
        if (!(start < end)) throw new BadRequestException("Invalid date range");

        // Validate rooms & compute price snapshot
        const roomMap = new Map(hostel.rooms.map((r) => [r.id, r]));
        for (const item of dto.items) {
            const room = roomMap.get(item.roomId);
            if (!room || !room.isActive) throw new BadRequestException(`Invalid room: ${item.roomId}`);
            if (item.quantity > room.totalUnits) throw new BadRequestException(`Quantity exceeds total capacity for room: ${room.name}`);
        }

        // Validate availability and create booking in a transaction
        return await this.prisma.$transaction(async (tx) => {
            await this.validateRoomAvailability(tx, dto, start, end, roomMap);

            const booking = await tx.booking.create({
                data: {
                    hostelId: dto.hostelId,
                    tenantId,
                    startDate: start,
                    endDate: end,
                    notes: dto.notes,
                    status: BookingStatus.PENDING_APPROVAL,
                    expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24h window
                    items: {
                        create: dto.items.map((i) => {
                            const room = roomMap.get(i.roomId)!;
                            return { roomId: i.roomId, quantity: i.quantity, unitPrice: room.pricePerTerm };
                        }),
                    },
                },
                include: { items: true },
            });

            this.sendBookingNotification(hostel.owner.email, {
                tenantName: `${tenant.firstName || ''} ${tenant.lastName || ''}`.trim() || tenant.email,
                hostelName: hostel.name,
                startDate: start,
                endDate: end,
            });

            return booking;
        });
    }

    private async validateRoomAvailability(tx: any, dto: CreateBookingDto, start: Date, end: Date, roomMap: Map<string, any>) {
        const overlappingItems = await tx.bookingItem.findMany({
            where: {
                roomId: { in: dto.items.map((i) => i.roomId) },
                booking: {
                    hostelId: dto.hostelId,
                    status: { in: [BookingStatus.PENDING_APPROVAL, BookingStatus.APPROVED, BookingStatus.CONFIRMED] },
                    startDate: { lt: end },
                    endDate: { gt: start },
                },
            },
            select: { roomId: true, quantity: true },
        });

        const bookedQty = new Map<string, number>();
        for (const row of overlappingItems) bookedQty.set(row.roomId, (bookedQty.get(row.roomId) ?? 0) + row.quantity);

        for (const item of dto.items) {
            const room = roomMap.get(item.roomId)!;
            const alreadyBooked = bookedQty.get(item.roomId) ?? 0;
            if (alreadyBooked + item.quantity > room.totalUnits) {
                throw new BadRequestException(`Not enough availability for room: ${room.name}. Available: ${room.totalUnits - alreadyBooked}, Requested: ${item.quantity}`);
            }
        }
    }

    private sendBookingNotification(ownerEmail: string, payload: { tenantName: string; hostelName: string; startDate: Date; endDate: Date }) {
        this.notifications.sendBookingRequestEmail(ownerEmail, {
            ...payload,
            startDate: payload.startDate.toDateString(),
            endDate: payload.endDate.toDateString(),
        }).catch(e => console.error("Email failed", e));
    }

    async approveBooking(actor: { userId: string; role: UserRole }, bookingId: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { hostel: true },
        });
        if (!booking) throw new NotFoundException("Booking not found");

        const isOwnerOfHostel = booking.hostel.ownerId === actor.userId;
        if (!(actor.role === UserRole.ADMIN || isOwnerOfHostel)) throw new ForbiddenException("Not authorized to approve this booking");

        if (booking.status !== BookingStatus.PENDING_APPROVAL) {
            throw new BadRequestException(`Booking is in ${booking.status} state and cannot be approved.`);
        }

        const updated = await this.prisma.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.APPROVED },
            include: { tenant: true, hostel: true }
        });

        // Trigger notification
        this.notifications.sendBookingApprovedEmail(updated.tenant.email, {
            hostelName: updated.hostel.name,
            startDate: updated.startDate.toDateString(),
            endDate: updated.endDate.toDateString(),
        }).catch(e => console.error("Email failed", e));

        return updated;
    }

    async rejectBooking(actor: { userId: string; role: UserRole }, bookingId: string, reason?: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { hostel: true },
        });
        if (!booking) throw new NotFoundException("Booking not found");

        const isOwnerOfHostel = booking.hostel.ownerId === actor.userId;
        if (!(actor.role === UserRole.ADMIN || isOwnerOfHostel)) throw new ForbiddenException("Not authorized to reject this booking");

        if (booking.status !== BookingStatus.PENDING_APPROVAL) {
            throw new BadRequestException(`Booking is in ${booking.status} state and cannot be rejected.`);
        }

        const updated = await this.prisma.booking.update({
            where: { id: bookingId },
            data: { status: BookingStatus.REJECTED, notes: reason ? `Rejected: ${reason}` : booking.notes },
            include: { tenant: true, hostel: true }
        });

        // Trigger notification
        this.notifications.sendBookingRejectedEmail(updated.tenant.email, {
            hostelName: updated.hostel.name,
            reason: reason,
        }).catch(e => console.error("Email failed", e));

        return updated;
    }

    async getMyBookings(tenantId: string) {
        return this.prisma.booking.findMany({
            where: { tenantId },
            include: { items: { include: { room: true } }, hostel: true, payment: true },
            orderBy: { createdAt: "desc" },
        });
    }

    async getOwnerBookings(ownerId: string) {
        return this.prisma.booking.findMany({
            where: { hostel: { ownerId } },
            include: { items: { include: { room: true } }, hostel: true, tenant: true, payment: true },
            orderBy: { createdAt: "desc" },
        });
    }
}
