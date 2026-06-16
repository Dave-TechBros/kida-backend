import {
  Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommunitiesService } from './communities.service';
import { CreateCommunityDto, UpdateCommunityDto } from './dto/communities.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Communities')
@Controller('communities')
export class CommunitiesController {
  constructor(private readonly communitiesService: CommunitiesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a community' })
  async create(@CurrentUser('id') userId: string, @Body() dto: CreateCommunityDto) {
    return this.communitiesService.create(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('popular')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get popular communities' })
  async getPopular(@CurrentUser('id') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.communitiesService.getPopular(page, limit, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':slug')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get community by slug' })
  async findBySlug(@CurrentUser('id') userId: string, @Param('slug') slug: string) {
    return this.communitiesService.findBySlug(slug, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update community' })
  async update(@CurrentUser('id') userId: string, @Param('id') id: string, @Body() dto: UpdateCommunityDto) {
    return this.communitiesService.update(userId, id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':slug/join')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Join a community' })
  async join(@CurrentUser('id') userId: string, @Param('slug') slug: string) {
    return this.communitiesService.join(userId, slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':slug/leave')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Leave a community' })
  async leave(@CurrentUser('id') userId: string, @Param('slug') slug: string) {
    return this.communitiesService.leave(userId, slug);
  }

  @Public()
  @Get(':slug/members')
  @ApiOperation({ summary: 'Get community members' })
  async getMembers(@Param('slug') slug: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.communitiesService.getMembers(slug, page, limit);
  }

  @Public()
  @Get(':slug/posts')
  @ApiOperation({ summary: 'Get community posts' })
  async getPosts(@Param('slug') slug: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.communitiesService.getPosts(slug, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':slug/requests')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get join requests' })
  async getJoinRequests(@CurrentUser('id') userId: string, @Param('slug') slug: string) {
    return this.communitiesService.getJoinRequests(userId, slug);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':slug/requests/:requestId/:action')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Approve or reject join request' })
  async handleJoinRequest(
    @CurrentUser('id') userId: string,
    @Param('slug') slug: string,
    @Param('requestId') requestId: string,
    @Param('action') action: 'approve' | 'reject',
  ) {
    return this.communitiesService.handleJoinRequest(userId, slug, requestId, action);
  }
}
