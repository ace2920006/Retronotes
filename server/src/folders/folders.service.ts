import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FoldersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: { name: string; color?: string }) {
    return this.prisma.folder.create({
      data: {
        name: data.name,
        color: data.color,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.folder.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const folder = await this.prisma.folder.findUnique({
      where: { id },
    });

    if (!folder) {
      throw new NotFoundException(`Folder with ID ${id} not found`);
    }

    if (folder.userId !== userId) {
      throw new ForbiddenException('You do not own this folder');
    }

    return folder;
  }

  async update(id: string, userId: string, data: { name?: string; color?: string }) {
    await this.findOne(id, userId);

    return this.prisma.folder.update({
      where: { id },
      data: {
        name: data.name,
        color: data.color,
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.folder.delete({
      where: { id },
    });
  }
}
