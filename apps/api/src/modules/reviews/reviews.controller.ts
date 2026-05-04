import { Body, Controller, Get, Param, Post, UseGuards, Query, HttpStatus, HttpCode } from "@nestjs/common";
import { ReviewsService } from "./reviews.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { User } from "../../common/decorators/user.decorator";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { CreateReviewDto } from "./dto/create-review.dto";
import { OwnerResponseDto } from "./dto/owner-response.dto";

@ApiTags("Reviews")
@Controller("reviews")
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post(":hostelId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Post a review for a hostel" })
  createReview(
    @User() user,
    @Param("hostelId") hostelId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.createReview({
      tenantId: user.id,
      hostelId,
      ...dto
    });
  }

  @Get(":hostelId")
  @ApiOperation({ summary: "Get all reviews for a hostel" })
  getHostelReviews(
    @Param("hostelId") hostelId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ) {
    return this.reviewsService.getHostelReviews(hostelId, Number(page) || 1, Number(limit) || 10);
  }

  @Post(":reviewId/response")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Add owner response to a review" })
  addResponse(
    @User() user,
    @Param("reviewId") reviewId: string,
    @Body() dto: OwnerResponseDto,
  ) {
    return this.reviewsService.addOwnerResponse(user.id, reviewId, dto.content);
  }
}
