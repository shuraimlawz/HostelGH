import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class FavoritesService {
  constructor(private readonly prisma: PrismaService) {}

  async toggle(userId: string, hostelId: string) {
    const existing = await this.prisma.favorite.findUnique({
      where: {
        userId_hostelId: { userId, hostelId },
      },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: { id: existing.id },
      });
      return { favorited: false };
    }

    const hostel = await this.prisma.hostel.findUnique({ where: { id: hostelId } });
    if (!hostel) throw new NotFoundException("Hostel not found");

    await this.prisma.favorite.create({
      data: { userId, hostelId },
    });
    return { favorited: true };
  }

  async getMyFavorites(userId: string) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: {
        hostel: {
          include: {
            rooms: { where: { isActive: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async isFavorited(userId: string, hostelId: string) {
    const favorite = await this.prisma.favorite.findUnique({
      where: {
        userId_hostelId: { userId, hostelId },
      },
    });
    return !!favorite;
  }
}
