import {
  Controller, Get, Post, Param, Query, Body, UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@ApiTags('Admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
@ApiBearerAuth()
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users' })
  async getUsers(@Query('page') page?: number, @Query('limit') limit?: number, @Query('search') search?: string) {
    return this.adminService.getUsers(page, limit, search);
  }

  @Post('users/:id/role')
  @ApiOperation({ summary: 'Update user role' })
  async updateRole(@Param('id') id: string, @Body('role') role: UserRole) {
    return this.adminService.updateUserRole(id, role);
  }

  @Post('users/:id/suspend')
  @ApiOperation({ summary: 'Suspend user' })
  async suspendUser(@Param('id') id: string) {
    return this.adminService.suspendUser(id);
  }

  @Post('users/:id/unsuspend')
  @ApiOperation({ summary: 'Unsuspend user' })
  async unsuspendUser(@Param('id') id: string) {
    return this.adminService.unsuspendUser(id);
  }

  @Post('users/:id/ban')
  @ApiOperation({ summary: 'Ban user' })
  async banUser(@Param('id') id: string) {
    return this.adminService.banUser(id);
  }

  @Post('users/:id/verify')
  @ApiOperation({ summary: 'Verify user' })
  async verifyUser(@Param('id') id: string) {
    return this.adminService.verifyUser(id);
  }

  @Get('reports')
  @ApiOperation({ summary: 'Get reports' })
  async getReports(@Query('page') page?: number, @Query('limit') limit?: number, @Query('status') status?: string) {
    return this.adminService.getReports(page, limit, status);
  }

  @Post('reports/:id/resolve')
  @ApiOperation({ summary: 'Resolve report' })
  async resolveReport(
    @Param('id') id: string,
    @CurrentUser('id') moderatorId: string,
    @Body('action') action: 'dismiss' | 'action_taken',
  ) {
    return this.adminService.resolveReport(id, moderatorId, action);
  }

  @Get('analytics')
  @ApiOperation({ summary: 'Get analytics' })
  async getAnalytics() {
    return this.adminService.getAnalytics();
  }

  @Get('activity-logs')
  @ApiOperation({ summary: 'Get activity logs' })
  async getActivityLogs(@Query('page') page?: number, @Query('limit') limit?: number) {
    return this.adminService.getActivityLogs(page, limit);
  }
}
