import {
  Controller, Get, Post, Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Messaging')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get user conversations' })
  async getConversations(@CurrentUser('id') userId: string, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.messagingService.getConversations(userId, page, limit);
  }

  @Post('conversations/:userId')
  @ApiOperation({ summary: 'Get or create conversation with user' })
  async getOrCreateConversation(@CurrentUser('id') userId: string, @Param('userId') otherUserId: string) {
    return this.messagingService.getOrCreateConversation(userId, otherUserId);
  }

  @Get('conversations/:id/messages')
  @ApiOperation({ summary: 'Get conversation messages' })
  async getMessages(
    @CurrentUser('id') userId: string,
    @Param('id') conversationId: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.messagingService.getMessages(userId, conversationId, page, limit);
  }

  @Post('conversations/:id/messages')
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(
    @CurrentUser('id') userId: string,
    @Param('id') conversationId: string,
    @Body('content') content: string,
    @Body('type') type?: string,
    @Body('mediaUrl') mediaUrl?: string,
  ) {
    return this.messagingService.sendMessage(userId, conversationId, content, type, mediaUrl);
  }

  @Post('messages/:id/react')
  @ApiOperation({ summary: 'React to a message' })
  async reactToMessage(
    @CurrentUser('id') userId: string,
    @Param('id') messageId: string,
    @Body('emoji') emoji: string,
  ) {
    return this.messagingService.reactToMessage(userId, messageId, emoji);
  }

  @Post('conversations/:conversationId/messages/:messageId/read')
  @ApiOperation({ summary: 'Mark message as read' })
  async markAsRead(
    @CurrentUser('id') userId: string,
    @Param('conversationId') conversationId: string,
    @Param('messageId') messageId: string,
  ) {
    return this.messagingService.markAsRead(userId, conversationId, messageId);
  }
}
