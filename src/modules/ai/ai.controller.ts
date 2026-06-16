import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('AI')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @UseGuards(JwtAuthGuard)
  @Get('recommendations/feed')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI feed recommendations' })
  async getFeedRecommendations(@Param('userId') userId: string, @Query('limit') limit?: number) {
    return this.aiService.generateFeedRecommendations(userId, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Get('recommendations/videos')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI video recommendations' })
  async getVideoRecommendations(@Param('userId') userId: string, @Query('limit') limit?: number) {
    return this.aiService.generateVideoRecommendations(userId, limit);
  }

  @Public()
  @Post('moderate')
  @ApiOperation({ summary: 'Moderate content' })
  async moderateContent(@Body('content') content: string) {
    return this.aiService.autoModerateContent(content);
  }

  @Public()
  @Post('detect-spam')
  @ApiOperation({ summary: 'Detect spam' })
  async detectSpam(@Body('content') content: string) {
    return this.aiService.detectSpam(content);
  }

  @Public()
  @Post('suggest-hashtags')
  @ApiOperation({ summary: 'Suggest hashtags' })
  async suggestHashtags(@Body('content') content: string) {
    return this.aiService.suggestHashtags(content);
  }

  @Public()
  @Post('generate-caption')
  @ApiOperation({ summary: 'Generate image caption' })
  async generateCaption(@Body('imageUrl') imageUrl: string) {
    return this.aiService.generateCaption(imageUrl);
  }
}
