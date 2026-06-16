import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class MessagingService {
  constructor(private readonly prisma: PrismaService) {}

  async getConversations(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const conversations = await this.prisma.conversation.findMany({
      where: { members: { some: { userId } } },
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        members: {
          include: {
            user: {
              select: { id: true, username: true, displayName: true, avatar: true },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          include: { sender: { select: { id: true, username: true } } },
        },
        _count: {
          select: {
            messages: {
              where: {
                NOT: { readBy: { some: { userId } } },
                senderId: { not: userId },
              },
            },
          },
        },
      },
    });

    return {
      data: conversations.map((c) => ({
        ...c,
        unreadCount: c._count.messages,
      })),
      meta: { total: conversations.length, page, limit },
    };
  }

  async getOrCreateConversation(userId: string, otherUserId: string) {
    const existing = await this.prisma.conversation.findFirst({
      where: {
        isGroup: false,
        AND: [
          { members: { some: { userId } } },
          { members: { some: { userId: otherUserId } } },
        ],
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, username: true, displayName: true, avatar: true } },
          },
        },
      },
    });

    if (existing) return existing;

    const conversation = await this.prisma.conversation.create({
      data: {
        members: {
          create: [{ userId }, { userId: otherUserId }],
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, username: true, displayName: true, avatar: true } },
          },
        },
      },
    });

    return conversation;
  }

  async getMessages(userId: string, conversationId: string, page = 1, limit = 50) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { members: { where: { userId } } },
    });

    if (!conversation || conversation.members.length === 0) {
      throw new ForbiddenException('Not a member of this conversation');
    }

    const skip = (page - 1) * limit;
    const [messages, total] = await Promise.all([
      this.prisma.message.findMany({
        where: { conversationId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          sender: { select: { id: true, username: true, displayName: true, avatar: true } },
          reactions: true,
          readBy: { where: { userId } },
        },
      }),
      this.prisma.message.count({ where: { conversationId } }),
    ]);

    await this.prisma.messageReadReceipt.createMany({
      data: messages
        .filter((m) => m.senderId !== userId)
        .map((m) => ({ messageId: m.id, userId })),
      skipDuplicates: true,
    });

    return {
      data: messages.reverse(),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async sendMessage(userId: string, conversationId: string, content: string, type = 'TEXT', mediaUrl?: string) {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { members: { where: { userId } } },
    });

    if (!conversation || conversation.members.length === 0) {
      throw new ForbiddenException('Not a member of this conversation');
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content,
        type: type as any,
        mediaUrl,
      },
      include: {
        sender: { select: { id: true, username: true, displayName: true, avatar: true } },
      },
    });

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async markAsRead(userId: string, conversationId: string, messageId: string) {
    await this.prisma.messageReadReceipt.upsert({
      where: { messageId_userId: { messageId, userId } },
      update: {},
      create: { messageId, userId },
    });

    await this.prisma.conversationMember.update({
      where: { conversationId_userId: { conversationId, userId } },
      data: { lastReadAt: new Date() },
    });

    return { message: 'Marked as read' };
  }

  async reactToMessage(userId: string, messageId: string, emoji: string) {
    const message = await this.prisma.message.findUnique({ where: { id: messageId } });
    if (!message) throw new NotFoundException('Message not found');

    const existing = await this.prisma.messageReaction.findUnique({
      where: { messageId_userId_emoji: { messageId, userId, emoji } },
    });

    if (existing) {
      await this.prisma.messageReaction.delete({ where: { id: existing.id } });
      return { reacted: false };
    }

    await this.prisma.messageReaction.create({ data: { messageId, userId, emoji } });
    return { reacted: true };
  }
}
