import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class LikesService {
  constructor(private prisma: PrismaService) {}

  async like(postId: string, userId: string) {
    const existing = await this.prisma.like.findUnique({
      where: {
        postId_userId: { postId, userId },
      },
    });

    if (existing) {
      return existing; // already liked
    }

    try {
      return await this.prisma.like.create({
        data: {
          postId,
          userId,
        },
      });
    } catch (e) {
      throw new BadRequestException('Could not like this post');
    }
  }

  async unlike(postId: string, userId: string) {
    try {
      await this.prisma.like.delete({
        where: {
          postId_userId: { postId, userId },
        },
      });
      return { success: true };
    } catch (e) {
      throw new BadRequestException('Could not unlike this post');
    }
  }
}
