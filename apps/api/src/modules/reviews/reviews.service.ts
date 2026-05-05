import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { UserRole, BookingStatus } from "@prisma/client";

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(params: {
    tenantId: string;
    hostelId: string;
    bookingId?: string;
    rating: number;
    cleanliness?: number;
    comfort?: number;
    value?: number;
    staff?: number;
    comment?: string;
    photos?: string[];
  }) {
    const { tenantId, hostelId, bookingId, rating, comment, photos, cleanliness, comfort, value, staff } = params;

    const hostel = await this.prisma.hostel.findUnique({ where: { id: hostelId } });
    if (!hostel) throw new NotFoundException("Hostel not found");

    // Check if review already exists for this booking
    if (bookingId && bookingId.trim() !== "") {
      const existing = await this.prisma.review.findUnique({ where: { bookingId } });
      if (existing) throw new BadRequestException("You have already reviewed this stay");

      // Verify booking belongs to tenant and is completed/paid
      const booking = await this.prisma.booking.findUnique({ where: { id: bookingId } });
      if (!booking || booking.tenantId !== tenantId) {
        throw new ForbiddenException("Invalid booking reference");
      }
    }

    const review = await this.prisma.review.create({
      data: {
        tenantId,
        hostelId,
        bookingId: (bookingId && bookingId.trim() !== "") ? bookingId : undefined,
        rating,
        cleanliness,
        comfort,
        value,
        staff,
        comment,
        isVerified: !!bookingId,
        photos: photos ? {
          create: photos.map(url => ({ url }))
        } : undefined
      },
      include: {
        tenant: { select: { firstName: true, avatarUrl: true } },
        photos: true
      }
    });

    // Update hostel aggregate stats
    await this.updateHostelStats(hostelId);

    return review;
  }

  async getHostelReviews(hostelId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { hostelId, isModerated: false },
        include: {
          tenant: { select: { firstName: true, avatarUrl: true } },
          photos: true,
          ownerResponse: true
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit
      }),
      this.prisma.review.count({ where: { hostelId, isModerated: false } })
    ]);

    return {
      reviews,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async addOwnerResponse(ownerId: string, reviewId: string, content: string) {
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
      include: { hostel: true }
    });

    if (!review) throw new NotFoundException("Review not found");
    if (review.hostel.ownerId !== ownerId) {
      throw new ForbiddenException("Only the hostel owner can respond to reviews");
    }

    return this.prisma.ownerResponse.upsert({
      where: { reviewId },
      update: { content },
      create: { reviewId, content }
    });
  }

  private async updateHostelStats(hostelId: string) {
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
  }
}
