import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class FeedService {
  constructor(private readonly prisma: PrismaService) {}

  async getHomeFeed(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const following = await this.prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    const followingIds = following.map((f) => f.followingId);

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: {
          OR: [
            { authorId: { in: followingIds } },
            { author: { followers: { some: { followerId: userId } } } },
          ],
          parentId: null,
          visibility: 'PUBLIC',
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, username: true, displayName: true, avatar: true, verified: true },
          },
          media: true,
          _count: { select: { likes: true, comments: true, reposts: true, bookmarks: true } },
          likes: { where: { userId }, take: 1 },
          bookmarks: { where: { userId }, take: 1 },
          reposts: { where: { userId }, take: 1 },
        },
      }),
      this.prisma.post.count({
        where: {
          OR: [
            { authorId: { in: followingIds } },
            { author: { followers: { some: { followerId: userId } } } },
          ],
          parentId: null,
          visibility: 'PUBLIC',
        },
      }),
    ]);

    return {
      data: posts.map((p) => ({
        ...p,
        isLiked: p.likes.length > 0,
        isBookmarked: p.bookmarks.length > 0,
        isReposted: p.reposts.length > 0,
        likes: undefined,
        bookmarks: undefined,
        reposts: undefined,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getDiscoverFeed(userId: string | undefined, page = 1, limit = 20) {
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

    const [trendingPosts, hashtags, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { parentId: null, visibility: 'PUBLIC' },
        skip,
        take: limit,
        orderBy: [
          { likes: { _count: 'desc' } },
          { comments: { _count: 'desc' } },
          { createdAt: 'desc' },
        ],
        include: includeClause,
      }),
      this.prisma.hashtag.findMany({
        orderBy: { count: 'desc' },
        take: 10,
      }),
      this.prisma.post.count({
        where: { parentId: null, visibility: 'PUBLIC' },
      }),
    ]);

    const mapped = trendingPosts.map((p: any) => ({
      ...p,
      isLiked: p.likes ? p.likes.length > 0 : false,
      isBookmarked: p.bookmarks ? p.bookmarks.length > 0 : false,
      isReposted: p.reposts ? p.reposts.length > 0 : false,
      likes: undefined,
      bookmarks: undefined,
      reposts: undefined,
    }));

    return {
      data: mapped,
      trending: hashtags,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getFollowingFeed(userId: string, page = 1, limit = 20) {
    return this.getHomeFeed(userId, page, limit);
  }

  async getTrendingHashtags(limit = 10) {
    return this.prisma.hashtag.findMany({
      orderBy: { count: 'desc' },
      take: limit,
    });
  }

  async getTrendingCreators(limit = 10) {
    const creators = await this.prisma.user.findMany({
      where: {
        role: 'CREATOR',
        verified: true,
      },
      orderBy: {
        followers: { _count: 'desc' },
      },
      take: limit,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatar: true,
        verified: true,
        bio: true,
        _count: { select: { followers: true, following: true, posts: true } },
      },
    });

    return creators;
  }
}
