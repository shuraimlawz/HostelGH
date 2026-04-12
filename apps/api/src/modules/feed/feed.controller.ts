import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { CreatePostDto, UpdatePostDto, CreateCommentDto } from './dto/feed.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Feed')
@ApiBearerAuth()
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get paginated feed posts' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getPosts(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.feedService.getPosts(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get single post details' })
  getPostById(@Param('id') id: string) {
    return this.feedService.getPostById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Create a new post' })
  createPost(@Req() req: any, @Body() dto: CreatePostDto) {
    return this.feedService.createPost(req.user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOperation({ summary: 'Update a post' })
  updatePost(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ) {
    return this.feedService.updatePost(req.user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOperation({ summary: 'Delete a post' })
  deletePost(@Req() req: any, @Param('id') id: string) {
    return this.feedService.deletePost(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  @ApiOperation({ summary: 'Like a post' })
  likePost(@Req() req: any, @Param('id') id: string) {
    return this.feedService.likePost(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/like')
  @ApiOperation({ summary: 'Unlike a post' })
  unlikePost(@Req() req: any, @Param('id') id: string) {
    return this.feedService.unlikePost(req.user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  @ApiOperation({ summary: 'Add a comment to a post' })
  addComment(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.feedService.addComment(req.user.id, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('comments/:commentId')
  @ApiOperation({ summary: 'Delete a comment' })
  deleteComment(@Req() req: any, @Param('commentId') commentId: string) {
    return this.feedService.deleteComment(req.user.id, commentId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/share')
  @ApiOperation({ summary: 'Track a post share' })
  sharePost(@Req() req: any, @Param('id') id: string) {
    return this.feedService.sharePost(req.user.id, id);
  }
}
