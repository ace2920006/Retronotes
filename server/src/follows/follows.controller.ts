import { Controller, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('follows')
@UseGuards(JwtAuthGuard)
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post(':followingId')
  async follow(@Param('followingId') followingId: string, @Request() req: any) {
    return this.followsService.follow(req.user.id, followingId);
  }

  @Delete(':followingId')
  async unfollow(@Param('followingId') followingId: string, @Request() req: any) {
    return this.followsService.unfollow(req.user.id, followingId);
  }
}
