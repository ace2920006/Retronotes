import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { NotesService } from './notes.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('notes')
@UseGuards(JwtAuthGuard)
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post()
  async create(
    @Request() req: any,
    @Body() body: {
      title: string;
      content: string;
      folderId?: string;
      tagNames?: string[];
      isPinned?: boolean;
      isFavorite?: boolean;
      isPublished?: boolean;
      collection?: string;
      mood?: string;
      summary?: string;
      color?: string;
    }
  ) {
    return this.notesService.create(req.user.id, body);
  }

  @Get()
  async getNotes(
    @Request() req: any,
    @Query('folderId') folderId?: string,
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('status') status?: string, // e.g. 'pinned', 'archived', 'trashed', 'favorite'
    @Query('sort') sort?: 'newest' | 'oldest',
    @Query('feed') feed?: 'personal' | 'following' | 'trending',
    @Query('collection') collection?: string,
  ) {
    return this.notesService.findAll(req.user.id, {
      folderId,
      tag,
      search,
      status,
      sort,
      feed,
      collection,
    });
  }

  @Post('empty-trash')
  async emptyTrash(@Request() req: any) {
    return this.notesService.emptyTrash(req.user.id);
  }

  @Get(':id')
  async getNote(@Param('id') id: string, @Request() req: any) {
    return this.notesService.findOne(id, req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: {
      title?: string;
      content?: string;
      folderId?: string;
      tagNames?: string[];
      isPinned?: boolean;
      isArchived?: boolean;
      isTrashed?: boolean;
      isFavorite?: boolean;
      isPublished?: boolean;
      collection?: string;
      mood?: string;
      summary?: string;
      color?: string;
    }
  ) {
    return this.notesService.update(id, req.user.id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.notesService.remove(id, req.user.id);
  }
}

