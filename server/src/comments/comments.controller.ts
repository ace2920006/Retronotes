import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
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
    return this.commentsService.create(req.user.id, body);
  }

  @Get('note/:noteId')
  async getNoteComments(@Param('noteId') noteId: string) {
    return this.commentsService.getCommentsTree(noteId);
  }
}
