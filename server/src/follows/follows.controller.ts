import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('follows')
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post('follow')
  async follow(@Request() req: any, @Body() body: { followingId: string }) {
    return this.followsService.follow(req.user.id, body.followingId);
  }

  @Post('unfollow')
  async unfollow(@Request() req: any, @Body() body: { followingId: string }) {
    return this.followsService.unfollow(req.user.id, body.followingId);
  }

  @Get('followers/:userId')
  async getFollowers(@Param('userId') userId: string) {
    return this.followsService.getFollowers(userId);
  }

  @Get('following/:userId')
  async getFollowing(@Param('userId') userId: string) {
    return this.followsService.getFollowing(userId);
  }

  @Get('status/:followingId')
  async getStatus(@Request() req: any, @Param('followingId') followingId: string) {
    const isFollowing = await this.followsService.isFollowing(req.user.id, followingId);
    return { isFollowing };
  }
}
