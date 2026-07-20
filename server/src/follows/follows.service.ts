import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class FollowsService {
  constructor(private readonly prisma: PrismaService) {}

  async follow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new BadRequestException('You cannot follow yourself');
    }

    const userToFollow = await this.prisma.user.findUnique({
      where: { id: followingId },
    });
    if (!userToFollow) {
      throw new NotFoundException(`User with ID ${followingId} not found`);
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
      return { message: 'Already following' };
    }

    const follow = await this.prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    // Create follow notification
    await this.prisma.notification.create({
      data: {
        type: 'FOLLOW',
        userId: followingId,
        senderId: followerId,
        content: 'started following you',
      },
    });

    return follow;
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
      return { message: 'Not following' };
    }

    await this.prisma.follow.delete({
      where: { id: existing.id },
    });

    return { message: 'Successfully unfollowed' };
  }

  async isFollowing(followerId: string, followingId: string) {
    const follow = await this.prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });
    return { isFollowing: !!follow };
  }

  async getFollowers(userId: string) {
    const followers = await this.prisma.follow.findMany({
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
    return followers.map((f) => f.follower);
  }

  async getFollowing(userId: string) {
    const following = await this.prisma.follow.findMany({
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
    return following.map((f) => f.following);
  }
}
