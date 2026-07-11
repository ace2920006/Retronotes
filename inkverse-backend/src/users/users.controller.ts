import { Controller, Get, Patch, Body, Param, UseGuards, Request, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOneById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    
    // Fetch user with posts, comments, likes to return detailed counts
    // (PrismaService extends PrismaClient so we can query database directly from controller or add to service)
    // To keep controller clean, let's return user and we can query counts in frontend or here
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      image: user.image,
      createdAt: user.createdAt,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() body: { name?: string; bio?: string; image?: string },
    @Request() req: any,
  ) {
    // Only allow updating own profile
    if (req.user.id !== id) {
      throw new NotFoundException('You can only update your own profile');
    }
    return this.usersService.update(id, body);
  }
}
