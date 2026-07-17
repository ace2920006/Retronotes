import { Controller, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { LikesService } from './likes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':postId')
  async like(@Param('postId') postId: string, @Request() req: any) {
    return this.likesService.like(postId, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':postId')
  async unlike(@Param('postId') postId: string, @Request() req: any) {
    return this.likesService.unlike(postId, req.user.id);
  }
}
