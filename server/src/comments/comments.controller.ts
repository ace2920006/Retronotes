import { Controller, Post, Get, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async create(
    @Request() req: any,
    @Body() body: { noteId: string; content: string; parentId?: string }
  ) {
    return this.commentsService.createComment(req.user.id, body.noteId, body.content, body.parentId);
  }

  @Get('note/:noteId')
  async getForNote(@Param('noteId') noteId: string) {
    return this.commentsService.getCommentsForNote(noteId);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Request() req: any) {
    return this.commentsService.deleteComment(id, req.user.id);
  }
}
