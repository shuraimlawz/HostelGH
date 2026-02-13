import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UserRole, BookingStatus } from "@prisma/client";

@Injectable()
export class RoomsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(ownerId: string, hostelId: string, dto: CreateRoomDto) {
        const hostel = await this.prisma.hostel.findUnique({ where: { id: hostelId } });
        if (!hostel) throw new NotFoundException("Hostel not found");
        if (hostel.ownerId !== ownerId) throw new ForbiddenException("Not your hostel");

        return this.prisma.room.create({
            data: {
                ...dto,
                hostel: { connect: { id: hostelId } }
            },
        });
    }

    async update(actor: UserActor, roomId: string, dto: UpdateRoomDto) {
        const room = await this.getRoomWithHostel(roomId);
        this.validateOwnership(actor, room.hostel.ownerId);

        return this.prisma.room.update({
            where: { id: roomId },
            data: dto,
        });
    }

    async delete(actor: UserActor, roomId: string) {
        const room = await this.getRoomWithHostel(roomId);
        this.validateOwnership(actor, room.hostel.ownerId);

        await this.checkActiveBookings(roomId);

        return this.prisma.room.delete({ where: { id: roomId } });
    }

    async findByHostel(hostelId: string) {
        return this.prisma.room.findMany({
            where: { hostelId, isActive: true }
        });
    }

    private async getRoomWithHostel(id: string) {
        const room = await this.prisma.room.findUnique({
            where: { id },
            include: { hostel: true },
        });
        if (!room) throw new NotFoundException("Room not found");
        return room;
    }

    private validateOwnership(actor: UserActor, ownerId: string) {
        const isAuthorized = actor.role === UserRole.ADMIN || actor.userId === ownerId;
        if (!isAuthorized) throw new ForbiddenException("Not allowed to modify this room");
    }

    private async checkActiveBookings(roomId: string) {
        const activeBookings = await this.prisma.bookingItem.findFirst({
            where: {
                roomId,
                booking: { status: { in: [BookingStatus.PENDING_APPROVAL, BookingStatus.APPROVED, BookingStatus.CONFIRMED] } }
            }
        });
        if (activeBookings) {
            throw new ForbiddenException("Cannot delete room with active/pending bookings. Archive instead.");
        }
    }
}

interface UserActor {
    userId: string;
    role: UserRole;
}

interface CreateRoomDto {
    name: string;
    capacity: number;
    totalUnits: number;
    pricePerTerm: number;
    description?: string;
    images?: string[];
}

interface UpdateRoomDto extends Partial<CreateRoomDto> {
    isActive?: boolean;
}
