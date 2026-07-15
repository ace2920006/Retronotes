import { Controller, Get, Patch, Body, Param, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
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
        // Token invalid/expired
      }
    }
    return undefined;
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    const currentUserId = this.extractUserId(req);
    const profile = await this.usersService.getProfile(id, currentUserId);
    if (!profile) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return profile;
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; bio?: string; image?: string; songUrl?: string | null },
    @Request() req: any,
  ) {
    // Only allow updating own profile
    if (req.user.id !== id) {
      throw new NotFoundException('You can only update your own profile');
    }
    return this.usersService.update(id, body);
  }
}
