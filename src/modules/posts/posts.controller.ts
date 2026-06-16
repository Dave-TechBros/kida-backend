import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto, CreateCommentDto } from './dto/posts.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a post' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreatePostDto) {
    return this.postsService.create(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get post by ID' })
  async findById(@Param('id') id: string, @CurrentUser('id') userId?: string) {
    return this.postsService.findById(id, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a post' })
  async update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdatePostDto) {
    return this.postsService.update(userId, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post' })
  async delete(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.postsService.delete(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/like')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle like on a post' })
  async toggleLike(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.postsService.toggleLike(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/bookmark')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle bookmark on a post' })
  async toggleBookmark(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.postsService.toggleBookmark(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/repost')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Toggle repost on a post' })
  async toggleRepost(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.postsService.toggleRepost(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Public()
  @Get(':id/likes')
  @ApiOperation({ summary: 'Get users who liked a post' })
  async getLikes(@Param('id') id: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.postsService.getLikes(id, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Public()
  @Get(':id/comments')
  @ApiOperation({ summary: 'Get comments on a post' })
  async getComments(@Param('id') id: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.postsService.getComments(id, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/comments')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a comment' })
  async createComment(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.postsService.createComment(userId, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Public()
  @Get(':id/thread')
  @ApiOperation({ summary: 'Get post thread with replies' })
  async getThread(@Param('id') id: string, @Query('page') page?: number, @Query('limit') limit?: number, @CurrentUser('id') userId?: string) {
    return this.postsService.getThread(id, page, limit, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Public()
  @Get('user/:username')
  @ApiOperation({ summary: 'Get user posts' })
  async getUserPosts(
    @Param('username') username: string,
    @CurrentUser('id') userId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.postsService.getUserPosts(userId, username, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Public()
  @Get('user/:username/replies')
  @ApiOperation({ summary: 'Get user replies' })
  async getUserReplies(
    @Param('username') username: string,
    @CurrentUser('id') userId?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.postsService.getUserReplies(userId, username, page, limit);
  }
}
