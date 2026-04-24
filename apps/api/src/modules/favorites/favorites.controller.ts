import { Controller, Get, Param, Post, Req, UseGuards } from "@nestjs/common";
import { FavoritesService } from "./favorites.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";

@ApiTags("Favorites")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("favorites")
export class FavoritesController {
  constructor(private readonly favorites: FavoritesService) {}

  @Post(":hostelId")
  @ApiOperation({ summary: "Toggle a hostel as favorite" })
  toggle(@Req() req: any, @Param("hostelId") hostelId: string) {
    return this.favorites.toggle(req.user.id, hostelId);
  }

  @Get()
  @ApiOperation({ summary: "Get my favorite hostels" })
  getMyFavorites(@Req() req: any) {
    return this.favorites.getMyFavorites(req.user.id);
  }

  @Get(":hostelId/status")
  @ApiOperation({ summary: "Check if a hostel is favorited by me" })
  isFavorited(@Req() req: any, @Param("hostelId") hostelId: string) {
    return this.favorites.isFavorited(req.user.id, hostelId);
  }
}
