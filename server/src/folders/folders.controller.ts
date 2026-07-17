import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request } from '@nestjs/common';
import { FoldersService } from './folders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('folders')
@UseGuards(JwtAuthGuard)
export class FoldersController {
  constructor(private readonly foldersService: FoldersService) {}

  @Post()
  async create(@Request() req: any, @Body() body: { name: string; color?: string }) {
    return this.foldersService.create(req.user.id, body);
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.foldersService.findAll(req.user.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { name?: string; color?: string }
  ) {
    return this.foldersService.update(id, req.user.id, body);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.foldersService.remove(id, req.user.id);
  }
}
