import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCommunityDto, UpdateCommunityDto } from './dto/communities.dto';

@Injectable()
export class CommunitiesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateCommunityDto) {
    const existing = await this.prisma.community.findFirst({
      where: { OR: [{ name: dto.name }, { slug: dto.slug }] },
    });

    if (existing) {
      throw new ConflictException('Community name or slug already exists');
    }

    const community = await this.prisma.community.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: dto.description,
        type: dto.type || 'PUBLIC',
        ownerId: userId,
        members: { create: { userId } },
      },
      include: {
        _count: { select: { members: true, posts: true } },
      },
    });

    return community;
  }

  async findById(id: string, userId?: string) {
    const community = await this.prisma.community.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
        _count: { select: { members: true, posts: true } },
      },
    });

    if (!community) throw new NotFoundException('Community not found');

    const isMember = userId
      ? await this.prisma.communityMember.findUnique({
          where: { communityId_userId: { communityId: id, userId } },
        })
      : null;

    return { ...community, isMember: !!isMember };
  }

  async findBySlug(slug: string, userId?: string) {
    const community = await this.prisma.community.findUnique({
      where: { slug },
      include: {
        owner: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
        _count: { select: { members: true, posts: true } },
      },
    });

    if (!community) throw new NotFoundException('Community not found');

    const isMember = userId
      ? await this.prisma.communityMember.findUnique({
          where: { communityId_userId: { communityId: community.id, userId } },
        })
      : null;

    return { ...community, isMember: !!isMember };
  }

  async update(userId: string, id: string, dto: UpdateCommunityDto) {
    const community = await this.prisma.community.findUnique({ where: { id } });
    if (!community) throw new NotFoundException('Community not found');
    if (community.ownerId !== userId) throw new ForbiddenException('Not the owner');

    return this.prisma.community.update({
      where: { id },
      data: dto,
    });
  }

  async join(userId: string, slug: string) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');

    if (community.type === 'PRIVATE') {
      const existing = await this.prisma.communityJoinRequest.findUnique({
        where: { communityId_userId: { communityId: community.id, userId } },
      });
      if (existing) throw new ConflictException('Already requested to join');

      await this.prisma.communityJoinRequest.create({
        data: { communityId: community.id, userId },
      });

      return { message: 'Join request sent' };
    }

    const existing = await this.prisma.communityMember.findUnique({
      where: { communityId_userId: { communityId: community.id, userId } },
    });
    if (existing) throw new ConflictException('Already a member');

    await this.prisma.communityMember.create({
      data: { communityId: community.id, userId },
    });

    return { isMember: true };
  }

  async leave(userId: string, slug: string) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');

    await this.prisma.communityMember.deleteMany({
      where: { communityId: community.id, userId },
    });

    return { isMember: false };
  }

  async getMembers(slug: string, page = 1, limit = 20) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');

    const skip = (page - 1) * limit;
    const [members, total] = await Promise.all([
      this.prisma.communityMember.findMany({
        where: { communityId: community.id },
        skip,
        take: limit,
        include: {
          user: {
            select: { id: true, username: true, displayName: true, avatar: true, verified: true },
          },
        },
        orderBy: { joinedAt: 'desc' },
      }),
      this.prisma.communityMember.count({ where: { communityId: community.id } }),
    ]);

    return {
      data: members.map((m) => m.user),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getPosts(slug: string, page = 1, limit = 20) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');

    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { communityId: community.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          author: {
            select: { id: true, username: true, displayName: true, avatar: true, verified: true },
          },
          media: true,
          _count: { select: { likes: true, comments: true, reposts: true } },
        },
      }),
      this.prisma.post.count({ where: { communityId: community.id } }),
    ]);

    return { data: posts, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getPopular(page = 1, limit = 20, userId?: string) {
    const skip = (page - 1) * limit;
    const [communities, total] = await Promise.all([
      this.prisma.community.findMany({
        skip,
        take: limit,
        orderBy: { members: { _count: 'desc' } },
        include: {
          _count: { select: { members: true, posts: true } },
          owner: {
            select: { id: true, username: true, displayName: true, avatar: true },
          },
        },
      }),
      this.prisma.community.count(),
    ]);

    let memberSet = new Set<string>();
    if (userId && communities.length > 0) {
      const memberships = await this.prisma.communityMember.findMany({
        where: { userId, communityId: { in: communities.map((c) => c.id) } },
        select: { communityId: true },
      });
      memberSet = new Set(memberships.map((m) => m.communityId));
    }

    const data = communities.map((c) => ({
      ...c,
      isMember: memberSet.has(c.id),
    }));

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async getJoinRequests(userId: string, slug: string) {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');
    if (community.ownerId !== userId) throw new ForbiddenException('Not the owner');

    return this.prisma.communityJoinRequest.findMany({
      where: { communityId: community.id, status: 'pending' },
      include: {
        user: {
          select: { id: true, username: true, displayName: true, avatar: true },
        },
      },
    });
  }

  async handleJoinRequest(userId: string, slug: string, requestId: string, action: 'approve' | 'reject') {
    const community = await this.prisma.community.findUnique({ where: { slug } });
    if (!community) throw new NotFoundException('Community not found');
    if (community.ownerId !== userId) throw new ForbiddenException('Not the owner');

    const request = await this.prisma.communityJoinRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new NotFoundException('Request not found');

    if (action === 'approve') {
      await this.prisma.communityMember.create({
        data: { communityId: community.id, userId: request.userId },
      });
    }

    await this.prisma.communityJoinRequest.update({
      where: { id: requestId },
      data: { status: action === 'approve' ? 'approved' : 'rejected' },
    });

    return { message: `Request ${action}d` };
  }
}
