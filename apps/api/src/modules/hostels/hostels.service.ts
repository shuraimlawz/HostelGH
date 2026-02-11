import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UserRole } from "@prisma/client";

@Injectable()
export class HostelsService {
    constructor(private prisma: PrismaService) { }

    async create(ownerId: string, dto: any) {
        return this.prisma.hostel.create({
            data: {
                ...dto,
                ownerId,
            },
        });
    }

    async update(actor: { userId: string; role: UserRole }, hostelId: string, dto: any) {
        const hostel = await this.prisma.hostel.findUnique({ where: { id: hostelId } });
        if (!hostel) throw new NotFoundException("Hostel not found");

        const isOwner = hostel.ownerId === actor.userId;
        if (!(actor.role === UserRole.ADMIN || isOwner))
            throw new ForbiddenException("Not allowed");

        return this.prisma.hostel.update({
            where: { id: hostelId },
            data: dto,
        });
    }

    async delete(actor: { userId: string; role: UserRole }, hostelId: string) {
        const hostel = await this.prisma.hostel.findUnique({ where: { id: hostelId } });
        if (!hostel) throw new NotFoundException("Hostel not found");

        const isOwner = hostel.ownerId === actor.userId;
        if (!(actor.role === UserRole.ADMIN || isOwner))
            throw new ForbiddenException("Not allowed");

        return this.prisma.hostel.delete({ where: { id: hostelId } });
    }

    async publicSearch(city?: string) {
        return this.prisma.hostel.findMany({
            where: {
                isPublished: true,
                city: city ? { contains: city, mode: "insensitive" } : undefined,
            },
            include: { rooms: true },
        });
    }
}
