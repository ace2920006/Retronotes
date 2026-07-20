import { Controller, Get, Patch, Body, Param, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('dashboard')
  async getDashboard(@Request() req: any) {
    return this.usersService.getDashboardStats(req.user.id);
  }

  @Get('me')
  async getMe(@Request() req: any) {
    const user = await this.usersService.findOneById(req.user.id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    // Omit password
    const { password, ...rest } = user as any;
    return rest;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    const { password, ...rest } = user as any;
    return rest;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: {
      name?: string;
      image?: string;
      bio?: string;
      banner?: string;
      twitterUrl?: string;
      mediumUrl?: string;
      githubUrl?: string;
    },
    @Request() req: any,
  ) {
    // Only allow updating own profile
    if (req.user.id !== id) {
      throw new NotFoundException('You can only update your own profile');
    }
    return this.usersService.update(id, body);
  }
}
