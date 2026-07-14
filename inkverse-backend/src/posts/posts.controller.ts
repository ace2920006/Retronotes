import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Request, Query } from '@nestjs/common';
import { PostsService } from './posts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly jwtService: JwtService,
  ) {}

  private extractUserId(req: any): string | undefined {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      try {
        const payload = this.jwtService.verify(token, {
          secret: process.env.JWT_SECRET || 'secret_inkverse_2026',
        });
        return payload.sub;
      } catch (e) {
        // Token invalid/expired, treat as guest
      }
    }
    return undefined;
  }

  @Get('feed')
  async getFeed(
    @Request() req: any,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    const userId = this.extractUserId(req);
    return this.postsService.findFeed(userId, type, search);
  }

  @Get('user/:userId')
  async getUserPosts(@Param('userId') userId: string, @Request() req: any) {
    const currentUserId = this.extractUserId(req);
    return this.postsService.findByUser(userId, currentUserId);
  }

  @Get(':id')
  async getPost(@Param('id') id: string, @Request() req: any) {
    const currentUserId = this.extractUserId(req);
    return this.postsService.findOne(id, currentUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Request() req: any, @Body() body: { title?: string; content: string; type: string; songUrl?: string }) {
    return this.postsService.create(req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Request() req: any,
    @Body() body: { title?: string; content?: string; songUrl?: string },
  ) {
    return this.postsService.update(id, req.user.id, body);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: any) {
    return this.postsService.remove(id, req.user.id);
  }
}
