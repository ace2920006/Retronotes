import { Controller, Post, Delete, Get, Param, UseGuards, Request } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  async getBookmarks(@Request() req: any) {
    return this.bookmarksService.findUserBookmarks(req.user.id);
  }

  @Post(':postId')
  async bookmark(@Param('postId') postId: string, @Request() req: any) {
    return this.bookmarksService.bookmark(postId, req.user.id);
  }

  @Delete(':postId')
  async unbookmark(@Param('postId') postId: string, @Request() req: any) {
    return this.bookmarksService.unbookmark(postId, req.user.id);
  }
}
