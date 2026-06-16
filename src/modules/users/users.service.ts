import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateProfileDto, SearchUsersDto } from './dto/users.dto';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async getProfile(username: string, currentUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: {
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isFollowing = currentUserId
      ? await this.prisma.follow.findUnique({
          where: {
            followerId_followingId: {
              followerId: currentUserId,
              followingId: user.id,
            },
          },
        })
      : null;

    const { passwordHash, refreshToken, ...safeUser } = user;
    return {
      ...safeUser,
      isFollowing: !!isFollowing,
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    if (dto.username) {
      const existing = await this.prisma.user.findUnique({
        where: { username: dto.username },
      });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Username already taken');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    const { passwordHash, refreshToken, ...safeUser } = user;
    return safeUser;
  }

  async followUser(followerId: string, followingUsername: string) {
    const targetUser = await this.prisma.user.findUnique({
      where: { username: followingUsername },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    if (targetUser.id === followerId) {
      throw new ConflictException('Cannot follow yourself');
    }

    const existingFollow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId: targetUser.id,
        },
      },
    });

    if (existingFollow) {
      await this.prisma.follow.delete({
        where: { id: existingFollow.id },
      });
      return { following: false };
    }

    await this.prisma.follow.create({
      data: {
        followerId,
        followingId: targetUser.id,
      },
    });

    if (targetUser.id !== followerId) {
      const actor = await this.prisma.user.findUnique({
        where: { id: followerId },
        select: { username: true, displayName: true, avatar: true },
      });
      await this.notificationsService.create({
        userId: targetUser.id,
        type: 'FOLLOW',
        title: 'started following you',
        body: null,
        actorId: followerId,
        data: { actorUsername: actor?.username },
      });
    }

    return { following: true };
  }

  async getFollowers(username: string, page = 1, limit = 20) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException('User not found');

    const skip = (page - 1) * limit;
    const [followers, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followingId: user.id },
        skip,
        take: limit,
        include: {
          follower: {
            select: { id: true, username: true, displayName: true, avatar: true, verified: true, bio: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({ where: { followingId: user.id } }),
    ]);

    return {
      data: followers.map((f) => f.follower),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getFollowing(username: string, page = 1, limit = 20) {
    const user = await this.prisma.user.findUnique({ where: { username } });
    if (!user) throw new NotFoundException('User not found');

    const skip = (page - 1) * limit;
    const [following, total] = await Promise.all([
      this.prisma.follow.findMany({
        where: { followerId: user.id },
        skip,
        take: limit,
        include: {
          following: {
            select: { id: true, username: true, displayName: true, avatar: true, verified: true, bio: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.follow.count({ where: { followerId: user.id } }),
    ]);

    return {
      data: following.map((f) => f.following),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async searchUsers(dto: SearchUsersDto) {
    const { q, page = 1, limit = 20 } = dto;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          OR: [
            { username: { contains: q, mode: 'insensitive' } },
            { displayName: { contains: q, mode: 'insensitive' } },
            { bio: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: { id: true, username: true, displayName: true, avatar: true, verified: true, bio: true },
        skip,
        take: limit,
        orderBy: [{ verified: 'desc' }, { username: 'asc' }],
      }),
      this.prisma.user.count({
        where: {
          OR: [
            { username: { contains: q, mode: 'insensitive' } },
            { displayName: { contains: q, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    return { data: users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
