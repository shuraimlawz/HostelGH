import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) { }

    async createReview(tenantId: string, hostelId: string, rating: number, comment?: string) {
        try {
            const hostel = await this.prisma.hostel.findUnique({ where: { id: hostelId } });
            if (!hostel) throw new NotFoundException("Hostel not found");

            const review = await this.prisma.review.create({
                data: {
                    tenantId,
                    hostelId,
                    rating,
                    comment,
                },
                include: { tenant: { select: { firstName: true, avatarUrl: true } } },
            });

            // Update average rating and review count on hostel
            const stats = await this.prisma.review.aggregate({
                where: { hostelId },
                _avg: { rating: true },
                _count: { id: true },
            });

            await this.prisma.hostel.update({
                where: { id: hostelId },
                data: { 
                    averageRating: stats._avg.rating || 0,
                    totalReviews: stats._count.id || 0
                },
            });

            return review;
        } catch (error) {
            console.error(`[ReviewsService] Failed to create review for hostel ${hostelId}:`, error);
            throw error;
        }
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
