import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../../common/decorators/user.decorator";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";

@ApiTags("Reviews")
@Controller("reviews")
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Post(":hostelId")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: "Post a review for a hostel" })
    createReview(
        @User() user,
        @Param("hostelId") hostelId: string,
        @Body() dto: { rating: number; comment?: string },
    ) {
        return this.reviewsService.createReview(user.id, hostelId, dto.rating, dto.comment);
    }

    @Get(":hostelId")
    @ApiOperation({ summary: "Get all reviews for a hostel" })
    getHostelReviews(@Param("hostelId") hostelId: string) {
        return this.reviewsService.getHostelReviews(hostelId);
    }
}
