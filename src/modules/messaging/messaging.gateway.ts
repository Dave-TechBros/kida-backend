import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { MessagingService } from './messaging.service';

@WebSocketGateway({
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true },
  namespace: '/ws',
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(MessagingGateway.name);
  private userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly messagingService: MessagingService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token as string, {
        secret: this.configService.get('JWT_SECRET'),
      });

      client.data.userId = payload.sub;

      if (!this.userSockets.has(payload.sub)) {
        this.userSockets.set(payload.sub, new Set());
      }
      this.userSockets.get(payload.sub)!.add(client.id);

      client.join(`user:${payload.sub}`);
      this.logger.log(`User ${payload.sub} connected`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId && this.userSockets.has(userId)) {
      this.userSockets.get(userId)!.delete(client.id);
      if (this.userSockets.get(userId)!.size === 0) {
        this.userSockets.delete(userId);
      }
    }
  }

  @SubscribeMessage('message:send')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; content: string; type?: string; mediaUrl?: string },
  ) {
    const userId = client.data.userId;
    const message = await this.messagingService.sendMessage(
      userId,
      data.conversationId,
      data.content,
      data.type,
      data.mediaUrl,
    );

    const conversation = await this.prismaFindConversation(data.conversationId);

    for (const memberId of this.getMemberIds(conversation)) {
      this.server.to(`user:${memberId}`).emit('message:new', message);
    }

    return { success: true, data: message };
  }

  @SubscribeMessage('message:typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; isTyping: boolean },
  ) {
    const userId = client.data.userId;
    const conversation = await this.prismaFindConversation(data.conversationId);

    for (const memberId of this.getMemberIds(conversation)) {
      if (memberId !== userId) {
        this.server.to(`user:${memberId}`).emit('message:typing', {
          conversationId: data.conversationId,
          userId,
          isTyping: data.isTyping,
        });
      }
    }
  }

  @SubscribeMessage('message:read')
  async handleRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { conversationId: string; messageId: string },
  ) {
    const userId = client.data.userId;
    await this.messagingService.markAsRead(userId, data.conversationId, data.messageId);

    this.server.to(`user:${userId}`).emit('message:read', {
      conversationId: data.conversationId,
      messageId: data.messageId,
    });
  }

  private async prismaFindConversation(id: string) {
    const { PrismaService } = await import('../../prisma/prisma.service');
    const { PrismaModule } = await import('../../prisma/prisma.module');
    return { members: [] };
  }

  private getMemberIds(conversation: any): string[] {
    if (conversation?.members) {
      return conversation.members.map((m: any) => m.userId || m.user?.id).filter(Boolean);
    }
    return [];
  }
}
