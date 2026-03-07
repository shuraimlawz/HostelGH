import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) { }

    async createReview(tenantId: string, hostelId: string, rating: number, comment?: string) {
        const hostel = await this.prisma.hostel.findUnique({ where: { id: hostelId } });
        if (!hostel) throw new NotFoundException("Hostel not found");

        // @ts-ignore
        return this.prisma.review.create({
            data: {
                tenantId,
                hostelId,
                rating,
                comment,
            },
            include: { tenant: { select: { firstName: true, avatarUrl: true } } },
        });
    }

    async getHostelReviews(hostelId: string) {
        // @ts-ignore
        return this.prisma.review.findMany({
            where: { hostelId },
            include: { tenant: { select: { firstName: true, avatarUrl: true } } },
            orderBy: { createdAt: "desc" },
        });
    }
}
