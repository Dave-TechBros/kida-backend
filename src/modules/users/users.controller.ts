import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateProfileDto, SearchUsersDto } from './dto/users.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Public()
  @Get(':username')
  @ApiOperation({ summary: 'Get user profile' })
  async getProfile(@Param('username') username: string, @CurrentUser('id') currentUserId?: string) {
    return this.usersService.getProfile(username, currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Put('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update profile' })
  async updateProfile(@CurrentUser('id') userId: string, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(userId, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':username/follow')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Follow/unfollow a user' })
  async followUser(@CurrentUser('id') userId: string, @Param('username') username: string) {
    return this.usersService.followUser(userId, username);
  }

  @Public()
  @Get(':username/followers')
  @ApiOperation({ summary: 'Get followers' })
  async getFollowers(
    @Param('username') username: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.getFollowers(username, page, limit);
  }

  @Public()
  @Get(':username/following')
  @ApiOperation({ summary: 'Get following' })
  async getFollowing(
    @Param('username') username: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.usersService.getFollowing(username, page, limit);
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search users' })
  async searchUsers(@Query() dto: SearchUsersDto) {
    return this.usersService.searchUsers(dto);
  }
}
