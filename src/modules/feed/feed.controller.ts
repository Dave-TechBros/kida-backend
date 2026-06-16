import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Feed')
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @UseGuards(JwtAuthGuard)
  @Get('home')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get home feed' })
  async getHomeFeed(@CurrentUser('id') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.feedService.getHomeFeed(userId, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Public()
  @Get('discover')
  @ApiOperation({ summary: 'Get discover feed' })
  async getDiscoverFeed(
    @CurrentUser('id') userId: string | undefined,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.feedService.getDiscoverFeed(userId, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('following')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get following feed' })
  async getFollowingFeed(@CurrentUser('id') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.feedService.getFollowingFeed(userId, page, limit);
  }

  @Public()
  @Get('trending/hashtags')
  @ApiOperation({ summary: 'Get trending hashtags' })
  async getTrendingHashtags(@Query('limit') limit?: number) {
    return this.feedService.getTrendingHashtags(limit);
  }

  @Public()
  @Get('trending/creators')
  @ApiOperation({ summary: 'Get trending creators' })
  async getTrendingCreators(@Query('limit') limit?: number) {
    return this.feedService.getTrendingCreators(limit);
  }
}
