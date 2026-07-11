import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FollowsService {
  constructor(private prisma: PrismaService) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const targetUser = await this.prisma.user.findUnique({
      where: { id: followingId },
    });
    if (!targetUser) {
      throw new BadRequestException('The user you are trying to follow does not exist');
    }

    try {
      return await this.prisma.follows.create({
        data: {
          followerId,
          followingId,
        },
      });
    } catch (e) {
      return { success: true, message: 'Already following' };
    }
  }

  async unfollow(followerId: string, followingId: string) {
    try {
      await this.prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          },
        },
      });
      return { success: true };
    } catch (e) {
      return { success: true };
    }
  }
}
