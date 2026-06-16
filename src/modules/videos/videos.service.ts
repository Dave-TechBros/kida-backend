import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class VideosService {
  private readonly logger = new Logger(VideosService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: {
    title: string;
    description?: string;
    videoUrl: string;
    thumbnail?: string;
    duration: number;
    mimeType?: string;
    width?: number;
    height?: number;
    size?: number;
    tags?: string[];
    postId?: string;
  }) {
    const video = await this.prisma.video.create({
      data: {
        creatorId: userId,
        title: dto.title,
        description: dto.description,
        videoUrl: dto.videoUrl,
        thumbnail: dto.thumbnail,
        duration: dto.duration,
        mimeType: dto.mimeType,
        width: dto.width,
        height: dto.height,
        size: dto.size,
        postId: dto.postId,
        tags: dto.tags?.length
          ? { create: dto.tags.map((tag) => ({ tag: tag.toLowerCase() })) }
          : undefined,
      },
      include: {
        creator: {
          select: { id: true, username: true, displayName: true, avatar: true, verified: true },
        },
        tags: true,
      },
    });

    return video;
  }

  async findById(id: string) {
    const video = await this.prisma.video.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, username: true, displayName: true, avatar: true, verified: true },
        },
        tags: true,
        _count: { select: { viewsRelation: true } },
      },
    });

    if (!video) throw new NotFoundException('Video not found');
    return video;
  }

  async getFeed(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [videos, total] = await Promise.all([
      this.prisma.video.findMany({
        skip,
        take: limit,
        orderBy: [{ views: 'desc' }, { createdAt: 'desc' }],
        include: {
          creator: {
            select: { id: true, username: true, displayName: true, avatar: true, verified: true },
          },
          _count: { select: { viewsRelation: true } },
        },
      }),
      this.prisma.video.count(),
    ]);

    return { data: videos, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getTrending(page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [videos, total] = await Promise.all([
      this.prisma.video.findMany({
        skip,
        take: limit,
        orderBy: [{ views: 'desc' }, { likes: 'desc' }],
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
        include: {
          creator: {
            select: { id: true, username: true, displayName: true, avatar: true, verified: true },
          },
          _count: { select: { viewsRelation: true } },
        },
      }),
      this.prisma.video.count({
        where: { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
      }),
    ]);

    return { data: videos, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async recordView(videoId: string, userId?: string) {
    await this.prisma.video.update({
      where: { id: videoId },
      data: { views: { increment: 1 } },
    });

    if (userId) {
      await this.prisma.videoView.upsert({
        where: { videoId_userId: { videoId, userId } },
        update: {},
        create: { videoId, userId },
      });
    }
  }

  async getUserVideos(username: string, page = 1, limit = 20) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException('User not found');

    const skip = (page - 1) * limit;
    const [videos, total] = await Promise.all([
      this.prisma.video.findMany({
        where: { creatorId: user.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { viewsRelation: true } },
        },
      }),
      this.prisma.video.count({ where: { creatorId: user.id } }),
    ]);

    return { data: videos, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async deleteVideo(userId: string, videoId: string) {
    const video = await this.prisma.video.findUnique({ where: { id: videoId } });
    if (!video) throw new NotFoundException('Video not found');
    if (video.creatorId !== userId) throw new NotFoundException('Not your video');

    await this.prisma.video.delete({ where: { id: videoId } });
    return { message: 'Video deleted' };
  }
}
