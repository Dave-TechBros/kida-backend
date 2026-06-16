import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { VideosService } from './videos.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Videos')
@Controller('videos')
export class VideosController {
  constructor(private readonly videosService: VideosService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload video metadata' })
  async create(@CurrentUser('id') userId: string, @Body() body: any) {
    return this.videosService.create(userId, body);
  }

  @Public()
  @Get('feed')
  @ApiOperation({ summary: 'Get video feed' })
  async getFeed(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.videosService.getFeed(page, limit);
  }

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Get trending videos' })
  async getTrending(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.videosService.getTrending(page, limit);
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get video by ID' })
  async findById(@Param('id') id: string) {
    return this.videosService.findById(id);
  }

  @Public()
  @Post(':id/view')
  @ApiOperation({ summary: 'Record video view' })
  async recordView(@Param('id') id: string, @CurrentUser('id') userId?: string) {
    return this.videosService.recordView(id, userId);
  }

  @Public()
  @Get('user/:username')
  @ApiOperation({ summary: 'Get user videos' })
  async getUserVideos(@Param('username') username: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.videosService.getUserVideos(username, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a video' })
  async deleteVideo(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.videosService.deleteVideo(userId, id);
  }
}
