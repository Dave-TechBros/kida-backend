import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Comments')
@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Public()
  @Get(':id/replies')
  @ApiOperation({ summary: 'Get comment replies' })
  async getReplies(@Param('id') id: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.commentsService.getReplies(id, page, limit);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/react')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Add reaction to a comment' })
  async addReaction(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body('emoji') emoji: string,
  ) {
    return this.commentsService.addReaction(id, userId, emoji);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  async deleteComment(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.commentsService.deleteComment(userId, id);
  }
}
