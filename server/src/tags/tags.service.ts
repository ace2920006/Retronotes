import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class TagsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, data: { name: string }) {
    const { name } = data;
    // Normalize tag name (e.g. alphanumeric only, lowercase, trim)
    const normalizedName = name.trim();

    return this.prisma.tag.upsert({
      where: {
        name_userId: {
          name: normalizedName,
          userId,
        },
      },
      update: {},
      create: {
        name: normalizedName,
        user: { connect: { id: userId } },
      },
    });
  }

  async findAll(userId: string) {
    return this.prisma.tag.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, userId: string) {
    const tag = await this.prisma.tag.findUnique({
      where: { id },
    });

    if (!tag) {
      throw new NotFoundException(`Tag with ID ${id} not found`);
    }

    if (tag.userId !== userId) {
      throw new ForbiddenException('You do not own this tag');
    }

    return tag;
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);

    return this.prisma.tag.delete({
      where: { id },
    });
  }

  async followTag(userId: string, tagName: string) {
    const existing = await this.prisma.tagFollow.findUnique({
      where: {
        tagName_userId: {
          tagName,
          userId,
        },
      },
    });

    if (existing) {
      return { followed: true };
    }

    await this.prisma.tagFollow.create({
      data: {
        tagName,
        userId,
      },
    });

    return { followed: true };
  }

  async unfollowTag(userId: string, tagName: string) {
    const existing = await this.prisma.tagFollow.findUnique({
      where: {
        tagName_userId: {
          tagName,
          userId,
        },
      },
    });

    if (existing) {
      await this.prisma.tagFollow.delete({
        where: { id: existing.id },
      });
    }

    return { followed: false };
  }

  async getFollowedTags(userId: string) {
    const follows = await this.prisma.tagFollow.findMany({
      where: { userId },
      orderBy: { tagName: 'asc' },
    });
    return follows.map((f) => f.tagName);
  }
}
