import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from '../../generated/prisma';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOneByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findOneById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: { email: string; name?: string; password?: string }): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: { name?: string; bio?: string; image?: string }): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }
}
