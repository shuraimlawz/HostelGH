import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UserRole } from "@prisma/client";

@Injectable()
export class RoomsService {
    constructor(private prisma: PrismaService) { }

    async create(ownerId: string, hostelId: string, dto: any) {
        const hostel = await this.prisma.hostel.findUnique({ where: { id: hostelId } });
        if (!hostel) throw new NotFoundException("Hostel not found");
        if (hostel.ownerId !== ownerId) throw new ForbiddenException("Not your hostel");

        return this.prisma.room.create({
            data: { ...dto, hostelId },
        });
    }

    async update(actor: { userId: string; role: UserRole }, roomId: string, dto: any) {
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            include: { hostel: true },
        });
        if (!room) throw new NotFoundException("Room not found");

        const isOwner = room.hostel.ownerId === actor.userId;
        if (!(actor.role === UserRole.ADMIN || isOwner))
            throw new ForbiddenException("Not allowed");

        return this.prisma.room.update({
            where: { id: roomId },
            data: dto,
        });
    }

    async delete(actor: { userId: string; role: UserRole }, roomId: string) {
        const room = await this.prisma.room.findUnique({
            where: { id: roomId },
            include: { hostel: true },
        });
        if (!room) throw new NotFoundException("Room not found");

        // Check for active bookings before deleting (Phase 4 requirement)
        const activeBookings = await this.prisma.bookingItem.findFirst({
            where: { roomId, booking: { status: { in: ['APPROVED', 'CONFIRMED', 'PENDING_APPROVAL'] } } }
        });
        if (activeBookings) {
            throw new ForbiddenException("Cannot delete room with active/pending bookings. Archive instead.");
        }

        const isOwner = room.hostel.ownerId === actor.userId;
        if (!(actor.role === UserRole.ADMIN || isOwner))
            throw new ForbiddenException("Not allowed");

        return this.prisma.room.delete({ where: { id: roomId } });
    }

    async findByHostel(hostelId: string) {
        return this.prisma.room.findMany({
            where: { hostelId, isActive: true }
        });
    }
}
