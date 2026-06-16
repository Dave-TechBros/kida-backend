import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePostDto, UpdatePostDto, CreateCommentDto } from './dto/posts.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class PostsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(userId: string, dto: CreatePostDto) {
    const data: any = {
      authorId: userId,
      content: dto.content,
      type: dto.type || 'TEXT',
      visibility: dto.visibility || 'PUBLIC',
      parentId: dto.parentId,
      quoteOfId: dto.quoteOfId,
      communityId: dto.communityId,
    };

    if (dto.parentId) {
      const parent = await this.prisma.post.findUnique({ where: { id: dto.parentId } });
      if (!parent) throw new NotFoundException('Parent post not found');
    }

    if (dto.quoteOfId) {
      const quoted = await this.prisma.post.findUnique({ where: { id: dto.quoteOfId } });
      if (!quoted) throw new NotFoundException('Quoted post not found');
    }

    const post = await this.prisma.post.create({
      data: {
        ...data,
        media: dto.media ? {
          create: dto.media.map((m) => ({
            type: m.type as any,
            url: m.url,
            thumbnail: m.thumbnail,
            width: m.width,
            height: m.height,
            duration: m.duration,
          })),
        } : undefined,
        poll: dto.pollOptions ? {
          create: {
            question: dto.content || 'Poll',
            options: {
              create: dto.pollOptions.map((opt, idx) => ({
                label: opt.label,
              })),
            },
          },
        } : undefined,
      },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatar: true, verified: true },
        },
        media: true,
        poll: { include: { options: true } },
        _count: { select: { likes: true, comments: true, reposts: true, bookmarks: true } },
      },
    });

    if (dto.content) {
      await this.processHashtags(post.id, dto.content);
      await this.processMentions(post.id, dto.content);
    }

    return post;
  }

  async findById(postId: string, userId?: string) {
    const includeClause: any = {
      author: {
        select: { id: true, username: true, displayName: true, avatar: true, verified: true },
      },
      media: true,
      poll: { include: { options: { include: { _count: { select: { votes: true } } } } } },
      _count: { select: { likes: true, comments: true, reposts: true, bookmarks: true } },
      quoteOf: {
        include: {
          author: {
            select: { id: true, username: true, displayName: true, avatar: true, verified: true },
          },
          media: true,
          _count: { select: { likes: true, comments: true, reposts: true } },
        },
      },
    };

    if (userId) {
      includeClause.likes = { where: { userId }, take: 1 };
      includeClause.bookmarks = { where: { userId }, take: 1 };
      includeClause.reposts = { where: { userId }, take: 1 };
    }

    const post = await this.prisma.post.findUnique({
      where: { id: postId },
      include: includeClause,
    });

    if (!post) throw new NotFoundException('Post not found');

    return {
      ...post,
      isLiked: post.likes ? post.likes.length > 0 : false,
      isBookmarked: post.bookmarks ? post.bookmarks.length > 0 : false,
      isReposted: post.reposts ? post.reposts.length > 0 : false,
      likes: undefined,
      bookmarks: undefined,
      reposts: undefined,
    };
  }

  async getUserPosts(userId: string | undefined, authorUsername: string, page = 1, limit = 20) {
    const author = await this.prisma.user.findUnique({ where: { username: authorUsername } });
    if (!author) throw new NotFoundException('User not found');

    const skip = (page - 1) * limit;
    const includeClause: any = {
      author: {
        select: { id: true, username: true, displayName: true, avatar: true, verified: true },
      },
      media: true,
      _count: { select: { likes: true, comments: true, reposts: true, bookmarks: true } },
    };

    if (userId) {
      includeClause.likes = { where: { userId }, take: 1 };
      includeClause.bookmarks = { where: { userId }, take: 1 };
      includeClause.reposts = { where: { userId }, take: 1 };
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { authorId: author.id, parentId: null, communityId: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: includeClause,
      }),
      this.prisma.post.count({ where: { authorId: author.id, parentId: null } }),
    ]);

    return {
      data: posts.map((p) => ({
        ...p,
        isLiked: p.likes ? p.likes.length > 0 : false,
        isBookmarked: p.bookmarks ? p.bookmarks.length > 0 : false,
        isReposted: p.reposts ? p.reposts.length > 0 : false,
        likes: undefined,
        bookmarks: undefined,
        reposts: undefined,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getUserReplies(userId: string | undefined, authorUsername: string, page = 1, limit = 20) {
    const author = await this.prisma.user.findUnique({ where: { username: authorUsername } });
    if (!author) throw new NotFoundException('User not found');

    const skip = (page - 1) * limit;
    const includeClause: any = {
      author: {
        select: { id: true, username: true, displayName: true, avatar: true, verified: true },
      },
      parent: {
        select: { id: true, content: true, authorId: true },
      },
      _count: { select: { likes: true, comments: true, reposts: true } },
    };

    if (userId) {
      includeClause.likes = { where: { userId }, take: 1 };
      includeClause.reposts = { where: { userId }, take: 1 };
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { authorId: author.id, parentId: { not: null } },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: includeClause,
      }),
      this.prisma.post.count({ where: { authorId: author.id, parentId: { not: null } } }),
    ]);

    return {
      data: posts.map((p) => ({
        ...p,
        isLiked: p.likes ? p.likes.length > 0 : false,
        isReposted: p.reposts ? p.reposts.length > 0 : false,
        likes: undefined,
        bookmarks: undefined,
        reposts: undefined,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async update(userId: string, postId: string, dto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new ForbiddenException('Not your post');

    const updated = await this.prisma.post.update({
      where: { id: postId },
      data: {
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.visibility !== undefined && { visibility: dto.visibility }),
        ...(dto.isPinned !== undefined && { isPinned: dto.isPinned }),
      },
      include: {
        author: {
          select: { id: true, username: true, displayName: true, avatar: true, verified: true },
        },
        media: true,
        _count: { select: { likes: true, comments: true, reposts: true, bookmarks: true } },
      },
    });

    if (dto.content) {
      await this.processHashtags(post.id, dto.content);
      await this.processMentions(post.id, dto.content);
    }

    return updated;
  }

  async delete(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');
    if (post.authorId !== userId) throw new ForbiddenException('Not your post');

    await this.prisma.post.delete({ where: { id: postId } });
    return { message: 'Post deleted' };
  }

  async toggleLike(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.prisma.like.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } });
      return { liked: false };
    }

    await this.prisma.like.create({ data: { userId, postId } });

    if (post.authorId !== userId) {
      const actor = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { username: true, displayName: true, avatar: true },
      });
      await this.notificationsService.create({
        userId: post.authorId,
        type: 'LIKE',
        title: 'liked your post',
        body: null,
        actorId: userId,
        data: { postId },
      });
    }

    return { liked: true };
  }

  async toggleBookmark(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.prisma.bookmark.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await this.prisma.bookmark.delete({ where: { id: existing.id } });
      return { bookmarked: false };
    }

    await this.prisma.bookmark.create({ data: { userId, postId } });
    return { bookmarked: true };
  }

  async toggleRepost(userId: string, postId: string) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const existing = await this.prisma.repost.findUnique({
      where: { userId_postId: { userId, postId } },
    });

    if (existing) {
      await this.prisma.repost.delete({ where: { id: existing.id } });
      return { reposted: false };
    }

    await this.prisma.repost.create({ data: { userId, postId } });
    return { reposted: true };
  }

  async getLikes(postId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [likes, total] = await Promise.all([
      this.prisma.like.findMany({
        where: { postId },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, username: true, displayName: true, avatar: true, verified: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.like.count({ where: { postId } }),
    ]);

    return {
      data: likes.map((l) => l.user),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getComments(postId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [comments, total] = await Promise.all([
      this.prisma.comment.findMany({
        where: { postId, parentId: null },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { id: true, username: true, displayName: true, avatar: true, verified: true },
          },
          _count: { select: { replies: true, reactions: true } },
        },
      }),
      this.prisma.comment.count({ where: { postId, parentId: null } }),
    ]);

    return { data: comments, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async createComment(userId: string, postId: string, dto: CreateCommentDto) {
    const post = await this.prisma.post.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Post not found');

    const comment = await this.prisma.comment.create({
      data: {
        content: dto.content,
        userId,
        postId,
        parentId: dto.parentId,
      },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatar: true, verified: true },
        },
      },
    });

    if (post.authorId !== userId) {
      const preview = dto.content?.slice(0, 80);
      await this.notificationsService.create({
        userId: post.authorId,
        type: 'COMMENT',
        title: 'commented on your post',
        body: preview || null,
        actorId: userId,
        data: { postId, commentId: comment.id },
      });
    }

    return comment;
  }

  async getThread(postId: string, page = 1, limit = 50, userId?: string) {
    const post = await this.findById(postId, userId);

    const skip = (page - 1) * limit;
    const includeClause: any = {
      author: {
        select: { id: true, username: true, displayName: true, avatar: true, verified: true },
      },
      media: true,
      _count: { select: { likes: true, comments: true, reposts: true } },
    };

    if (userId) {
      includeClause.likes = { where: { userId }, take: 1 };
      includeClause.reposts = { where: { userId }, take: 1 };
    }

    const [replies, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { parentId: postId },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        include: includeClause,
      }),
      this.prisma.post.count({ where: { parentId: postId } }),
    ]);

    return {
      data: {
        post,
        replies: replies.map((r) => ({
          ...r,
          isLiked: r.likes ? r.likes.length > 0 : false,
          isReposted: r.reposts ? r.reposts.length > 0 : false,
          likes: undefined,
          bookmarks: undefined,
          reposts: undefined,
        })),
      },
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  private async processHashtags(postId: string, content: string) {
    const hashtagRegex = /#(\w+)/g;
    const matches = content.match(hashtagRegex);
    if (!matches) return;

    for (const match of matches) {
      const name = match.slice(1).toLowerCase();
      await this.prisma.hashtag.upsert({
        where: { name },
        update: { count: { increment: 1 } },
        create: { name },
      });

      const hashtag = await this.prisma.hashtag.findUnique({ where: { name } });
      if (hashtag) {
        await this.prisma.postHashtag.upsert({
          where: { postId_hashtagId: { postId, hashtagId: hashtag.id } },
          update: {},
          create: { postId, hashtagId: hashtag.id },
        });
      }
    }
  }

  private async processMentions(postId: string, content: string) {
    const mentionRegex = /@(\w+)/g;
    const matches = content.match(mentionRegex);
    if (!matches) return;

    for (const match of matches) {
      const username = match.slice(1);
      const user = await this.prisma.user.findUnique({ where: { username } });
      if (user) {
        await this.prisma.postMention.upsert({
          where: { postId_userId: { postId, userId: user.id } },
          update: {},
          create: { postId, userId: user.id },
        });
      }
    }
  }
}
