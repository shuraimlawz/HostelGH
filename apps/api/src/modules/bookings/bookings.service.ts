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

    async updateStatus(actor: { userId: string; role: UserRole }, bookingId: string, status: BookingStatus, allowedSourceStatuses: BookingStatus[]) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { hostel: true },
        });
        if (!booking) throw new NotFoundException("Booking not found");

        const isOwnerOfHostel = booking.hostel.ownerId === actor.userId;
        if (!(actor.role === UserRole.ADMIN || isOwnerOfHostel)) throw new ForbiddenException("Not authorized to update this booking");

        if (!allowedSourceStatuses.includes(booking.status)) {
            throw new BadRequestException(`Booking cannot transition from ${booking.status} to ${status}.`);
        }

        return this.prisma.booking.update({
            where: { id: bookingId },
            data: { status },
            include: { tenant: true, hostel: true }
        });
    }

    async approveBooking(actor: { userId: string; role: UserRole }, bookingId: string) {
        const updated = await this.updateStatus(actor, bookingId, BookingStatus.APPROVED, [BookingStatus.PENDING_APPROVAL]);

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

    async checkIn(actor: { userId: string; role: UserRole }, bookingId: string) {
        return this.updateStatus(actor, bookingId, BookingStatus.CHECKED_IN, [BookingStatus.CONFIRMED, BookingStatus.APPROVED]); // Allow from APPROVED if payment is handled offline
    }

    async checkOut(actor: { userId: string; role: UserRole }, bookingId: string) {
        return this.updateStatus(actor, bookingId, BookingStatus.CHECKED_OUT, [BookingStatus.CHECKED_IN]);
    }

    async complete(actor: { userId: string; role: UserRole }, bookingId: string) {
        return this.updateStatus(actor, bookingId, BookingStatus.COMPLETED, [BookingStatus.CHECKED_OUT]);
    }

    async requestDeletion(actor: { userId: string; role: UserRole }, bookingId: string, reason: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: { hostel: true },
        });

        if (!booking) throw new NotFoundException("Booking not found");

        const isOwner = booking.hostel.ownerId === actor.userId;
        if (!isOwner && actor.role !== UserRole.ADMIN) {
            throw new ForbiddenException("Not authorized to request deletion");
        }

        return this.prisma.booking.update({
            where: { id: bookingId },
            data: {
                deletionRequested: true,
                deletionReason: reason || "Owner requested deletion of old record."
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
            include: { hostel: true, tenant: true, items: { include: { room: true } } },
        });
    }

    async getOwnerAnalytics(ownerId: string) {
        // Get all bookings for owner's hostels
        const bookings = await this.prisma.booking.findMany({
            where: { hostel: { ownerId } },
            include: { items: true, hostel: { include: { rooms: true } } },
            orderBy: { createdAt: 'asc' }
        });

        // Calculate monthly trends for last 6 months
        const now = new Date();
        const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

        const monthlyData = [];
        for (let i = 0; i < 6; i++) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0);

            const monthBookings = bookings.filter(b => {
                const createdDate = new Date(b.createdAt);
                return createdDate >= monthStart && createdDate <= monthEnd;
            });

            const monthRevenue = monthBookings
                .filter(b => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN' || b.status === 'CHECKED_OUT' || b.status === 'COMPLETED')
                .reduce((sum, b) => {
                    const itemTotal = b.items.reduce((itemSum, item) => itemSum + (item.unitPrice * item.quantity), 0);
                    return sum + itemTotal;
                }, 0) / 100; // Convert from cents

            monthlyData.push({
                month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
                bookings: monthBookings.length,
                revenue: Math.round(monthRevenue)
            });
        }

        // Calculate occupancy rate
        const totalRooms = await this.prisma.room.count({
            where: { hostel: { ownerId }, isActive: true }
        });

        const currentOccupants = bookings.filter(b => b.status === 'CHECKED_IN').length;
        const occupancyRate = totalRooms > 0 ? Math.round((currentOccupants / totalRooms) * 100) : 0;

        // Calculate trend percentages (compare current month vs previous month)
        const currentMonthBookings = monthlyData[5]?.bookings || 0;
        const previousMonthBookings = monthlyData[4]?.bookings || 1; // Avoid division by zero
        const bookingTrend = previousMonthBookings > 0
            ? Math.round(((currentMonthBookings - previousMonthBookings) / previousMonthBookings) * 100)
            : 0;

        return {
            monthlyTrends: monthlyData,
            occupancyRate,
            trends: {
                bookings: bookingTrend
            }
        };
    }
}

