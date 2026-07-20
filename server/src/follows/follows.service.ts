import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FollowsService {
  constructor(private readonly prisma: PrismaService) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    // Check if target user exists
    const targetUser = await this.prisma.user.findUnique({
      where: { id: followingId },
    });
    if (!targetUser) {
      throw new NotFoundException('User to follow not found');
    }

    const existing = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existing) {
      return { following: true };
    }

    await this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    // Notify target user
    const follower = await this.prisma.user.findUnique({ where: { id: followerId } });
    await this.prisma.notification.create({
      data: {
        type: 'FOLLOW',
        userId: followingId,
        senderId: followerId,
        senderName: follower?.name || 'A writer',
        senderImage: follower?.image || '✍️',
        content: 'started following you',
      },
    });

    // Check FIRST_FOLLOWER achievement for the followed user
    const followersCount = await this.prisma.follow.count({
      where: { followingId },
    });
    if (followersCount === 1) {
      const achievementsCount = await this.prisma.userAchievement.count({
        where: { userId: followingId, badgeId: 'FIRST_FOLLOWER' },
      });
      if (achievementsCount === 0) {
        await this.prisma.userAchievement.create({
          data: {
            badgeId: 'FIRST_FOLLOWER',
            userId: followingId,
          },
        });
        // Notify the followed user about their badge
        await this.prisma.notification.create({
          data: {
            type: 'PUBLISH',
            userId: followingId,
            content: '🏆 Unlocked Achievement: First Follower! Someone is keeping tabs on your ink.',
          },
        });
      }
    }

    return { following: true };
  }

  async unfollow(followerId: string, followingId: string) {
    const existing = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!existing) {
      return { following: false };
    }

    await this.prisma.follow.delete({
      where: {
        id: existing.id,
      },
    });

    return { following: false };
  }

  async getFollowers(userId: string) {
    const follows = await this.prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
      },
    });
    return follows.map((f) => f.follower);
  }

  async getFollowing(userId: string) {
    const follows = await this.prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
      },
    });
    return follows.map((f) => f.following);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const count = await this.prisma.follow.count({
      where: {
        followerId,
        followingId,
      },
    });
    return count > 0;
  }
}
