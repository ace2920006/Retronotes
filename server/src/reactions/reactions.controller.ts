import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { ReactionsService } from './reactions.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reactions')
@UseGuards(JwtAuthGuard)
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post()
  async toggle(
    @Request() req: any,
    @Body() body: { noteId: string; type: string }
  ) {
    return this.reactionsService.toggleReaction(req.user.id, body.noteId, body.type);
  }

  @Get('note/:noteId')
  async getStats(@Param('noteId') noteId: string) {
    return this.reactionsService.getReactionStats(noteId);
  }
}
