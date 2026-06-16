import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '@prisma/client';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getUsers(page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (search) {
      where.OR = [
        { username: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { displayName: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, username: true, email: true, displayName: true,
          avatar: true, verified: true, role: true, isSuspended: true,
          isBanned: true, emailVerified: true, createdAt: true,
          _count: { select: { posts: true, followers: true, following: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async updateUserRole(userId: string, role: UserRole) {
    const validRoles: UserRole[] = ['USER', 'CREATOR', 'MODERATOR', 'ADMIN', 'SUPER_ADMIN'];
    if (!validRoles.includes(role)) {
      throw new BadRequestException(`Invalid role: ${role}`);
    }
    return this.prisma.user.update({
      where: { id: userId },
      data: { role },
      select: { id: true, username: true, role: true },
    });
  }

  async suspendUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isSuspended: true },
      select: { id: true, username: true, isSuspended: true },
    });
  }

  async unsuspendUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isSuspended: false },
      select: { id: true, username: true, isSuspended: true },
    });
  }

  async banUser(userId: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { isBanned: true, isSuspended: true },
      select: { id: true, username: true, isBanned: true },
    });
  }

  async verifyUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (!user) throw new BadRequestException('User not found');
    const data: any = { verified: true };
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      data.role = 'CREATOR';
    }
    return this.prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, username: true, verified: true, role: true },
    });
  }

  async getReports(page = 1, limit = 20, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [reports, total] = await Promise.all([
      this.prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: { select: { id: true, username: true } },
          moderator: { select: { id: true, username: true } },
        },
      }),
      this.prisma.report.count({ where }),
    ]);

    return { data: reports, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async resolveReport(reportId: string, moderatorId: string, action: 'dismiss' | 'action_taken') {
    return this.prisma.report.update({
      where: { id: reportId },
      data: {
        status: action === 'dismiss' ? 'dismissed' : 'resolved',
        moderatorId,
        resolvedAt: new Date(),
      },
    });
  }

  async getAnalytics() {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalUsers,
      totalPosts,
      totalVideos,
      totalComments,
      newUsersToday,
      newPostsToday,
      newUsersWeek,
      dauResult,
      mauResult,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.post.count(),
      this.prisma.video.count(),
      this.prisma.comment.count(),
      this.prisma.user.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.post.count({ where: { createdAt: { gte: todayStart } } }),
      this.prisma.user.count({ where: { createdAt: { gte: weekAgo } } }),
      // DAU: distinct users with activity today
      this.prisma.activityLog.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: todayStart }, userId: { not: null } },
        _count: { userId: true },
      }),
      // MAU: distinct users with activity in last 30 days
      this.prisma.activityLog.groupBy({
        by: ['userId'],
        where: { createdAt: { gte: monthAgo }, userId: { not: null } },
        _count: { userId: true },
      }),
    ]);

    return {
      totalUsers,
      totalPosts,
      totalVideos,
      totalComments,
      dau: dauResult.length,
      mau: mauResult.length,
      newUsersToday,
      newPostsToday,
      newUsersWeek,
      retention: Math.round((newUsersWeek / Math.max(totalUsers, 1)) * 100),
      engagement: Math.round((totalPosts + totalComments) / Math.max(totalUsers, 1) * 100) / 100,
    };
  }

  async getActivityLogs(page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    const [logs, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.activityLog.count(),
    ]);

    return { data: logs, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }
}
