import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UserRole, BookingStatus } from "@prisma/client";
import { CreateRoomDto, UpdateRoomDto } from "./dto/create-room.dto";

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) { }

  async create(ownerId: string, hostelId: string, dto: CreateRoomDto) {
    const hostel = await this.prisma.hostel.findUnique({
      where: { id: hostelId },
    });
    if (!hostel) throw new NotFoundException("Hostel not found");
    if (hostel.ownerId !== ownerId)
      throw new ForbiddenException("Not your hostel");

    const room = await this.prisma.room.create({
      data: {
        name: dto.name,
        description: dto.description,
        capacity: dto.capacity,
        totalUnits: dto.totalUnits,
        pricePerTerm: dto.pricePerTerm,
        roomConfiguration: dto.roomConfiguration,
        gender: dto.gender,
        totalSlots: dto.totalSlots,
        availableSlots: dto.availableSlots ?? dto.totalSlots,
        hasAC: dto.hasAC,
        utilitiesIncluded: dto.utilitiesIncluded,
        isActive: dto.isActive,
        images: dto.images,
        hostel: { connect: { id: hostelId } },
      },
    });
    await this.syncHostelMinPrice(hostelId);
    return room;
  }

  async update(actor: UserActor, roomId: string, dto: UpdateRoomDto) {
    const room = await this.getRoomWithHostel(roomId);
    this.validateOwnership(actor, room.hostel.ownerId);

    const updated = await this.prisma.room.update({
      where: { id: roomId },
      data: {
        name: dto.name,
        description: dto.description,
        capacity: dto.capacity,
        totalUnits: dto.totalUnits,
        pricePerTerm: dto.pricePerTerm,
        roomConfiguration: dto.roomConfiguration,
        gender: dto.gender,
        totalSlots: dto.totalSlots,
        availableSlots: dto.availableSlots,
        hasAC: dto.hasAC,
        utilitiesIncluded: dto.utilitiesIncluded,
        isActive: dto.isActive,
        images: dto.images,
      },
    });
    await this.syncHostelMinPrice(room.hostelId);
    return updated;
  }

  async delete(actor: UserActor, roomId: string) {
    const room = await this.getRoomWithHostel(roomId);
    this.validateOwnership(actor, room.hostel.ownerId);

    await this.checkActiveBookings(roomId);

    const deleted = await this.prisma.room.delete({ where: { id: roomId } });
    await this.syncHostelMinPrice(room.hostelId);
    return deleted;
  }

  private async syncHostelMinPrice(hostelId: string) {
    const rooms = await this.prisma.room.findMany({
      where: {
        hostelId,
        isActive: true,
        availableSlots: { gt: 0 }, // Only consider available rooms
      },
      select: { pricePerTerm: true },
    });
    const minPrice =
      rooms.length > 0 ? Math.min(...rooms.map((r) => r.pricePerTerm)) : null;
    await this.prisma.hostel.update({
      where: { id: hostelId },
      data: { minPrice },
    });
  }

  async findByHostel(hostelId: string) {
    return this.prisma.room.findMany({
      where: { hostelId, isActive: true },
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
    const isAuthorized = actor.role === UserRole.ADMIN || actor.id === ownerId;
    if (!isAuthorized)
      throw new ForbiddenException("Not allowed to modify this room");
  }

  private async checkActiveBookings(roomId: string) {
    const activeBookings = await this.prisma.bookingItem.findFirst({
      where: {
        roomId,
        booking: {
          status: {
            in: [
              BookingStatus.PENDING_APPROVAL,
              BookingStatus.APPROVED,
              BookingStatus.CONFIRMED,
            ],
          },
        },
      },
    });
    if (activeBookings) {
      throw new ForbiddenException(
        "Cannot delete room with active/pending bookings. Archive instead.",
      );
    }
  }

  async addRoomImages(roomId: string, id: string, imageUrls: string[]) {
    const room = await this.getRoomWithHostel(roomId);
    this.validateOwnership({ id, role: UserRole.OWNER }, room.hostel.ownerId);

    return this.prisma.room.update({
      where: { id: roomId },
      data: {
        images: {
          push: imageUrls,
        },
      },
    });
  }

  async removeRoomImage(roomId: string, id: string, imageUrl: string) {
    const room = await this.getRoomWithHostel(roomId);
    this.validateOwnership({ id, role: UserRole.OWNER }, room.hostel.ownerId);

    const updatedImages = room.images.filter((img) => img !== imageUrl);

    return this.prisma.room.update({
      where: { id: roomId },
      data: {
        images: updatedImages,
      },
    });
  }
}

interface UserActor {
  id: string;
  role: UserRole;
}
