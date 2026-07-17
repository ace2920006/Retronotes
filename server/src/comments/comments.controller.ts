import { Controller, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':postId')
  async create(
    @Param('postId') postId: string,
    @Request() req: any,
    @Body('content') content: string,
  ) {
    return this.commentsService.create(postId, req.user.id, content);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body('content') content: string,
  ) {
    return this.commentsService.update(id, req.user.id, content);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: any,
  ) {
    return this.commentsService.remove(id, req.user.id);
  }
}
