import { Controller, Get, Post, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { TagsService } from './tags.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tags')
@UseGuards(JwtAuthGuard)
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @Post()
  async create(@Request() req: any, @Body() body: { name: string }) {
    return this.tagsService.create(req.user.id, body);
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.tagsService.findAll(req.user.id);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.tagsService.remove(id, req.user.id);
  }
}
