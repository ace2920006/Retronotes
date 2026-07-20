import { Controller, Post, Get, Param, UseGuards, Request } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('follows')
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post('follow/:userId')
  async follow(@Request() req: any, @Param('userId') userId: string) {
    return this.followsService.follow(req.user.id, userId);
  }

  @Post('unfollow/:userId')
  async unfollow(@Request() req: any, @Param('userId') userId: string) {
    return this.followsService.unfollow(req.user.id, userId);
  }

  @Get('status/:userId')
  async status(@Request() req: any, @Param('userId') userId: string) {
    return this.followsService.isFollowing(req.user.id, userId);
  }

  @Get('followers/:userId')
  async getFollowers(@Param('userId') userId: string) {
    return this.followsService.getFollowers(userId);
  }

  @Get('following/:userId')
  async getFollowing(@Param('userId') userId: string) {
    return this.followsService.getFollowing(userId);
  }
}
