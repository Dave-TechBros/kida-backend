import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getReplies(commentId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { parentId: commentId },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: {
          user: {
            select: { id: true, username: true, displayName: true, avatar: true, verified: true },
          },
          _count: { select: { replies: true, reactions: true } },
        },
      }),
      this.prisma.comment.count({ where: { parentId: commentId } }),
    ]);

    return { data: comments, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async addReaction(commentId: string, userId: string, emoji: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');

    const existing = await this.prisma.commentReaction.findUnique({
      where: { commentId_userId_emoji: { commentId, userId, emoji } },
    });

    if (existing) {
      await this.prisma.commentReaction.delete({ where: { id: existing.id } });
      return { reacted: false };
    }

    await this.prisma.commentReaction.create({
      data: { commentId, userId, emoji },
    });

    return { reacted: true };
  }

  async deleteComment(userId: string, commentId: string) {
    const comment = await this.prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.userId !== userId) throw new NotFoundException('Not your comment');

    await this.prisma.comment.delete({ where: { id: commentId } });
    return { message: 'Comment deleted' };
  }
}
