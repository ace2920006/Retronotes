import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { User } from '@prisma/client';

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

  async getProfile(id: string, currentUserId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        followers: true,
        following: true,
      },
    });

    if (!user) return null;

    const followersCount = user.followers.length;
    const followingCount = user.following.length;
    const isFollowing = currentUserId
      ? user.followers.some((f) => f.followerId === currentUserId)
      : false;

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      songUrl: user.songUrl,
      image: user.image,
      createdAt: user.createdAt,
      followersCount,
      followingCount,
      isFollowing,
    };
  }

  async create(data: { email: string; name?: string; password?: string }): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: { name?: string; bio?: string; image?: string; songUrl?: string | null }): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async getFeatured(currentUserId?: string) {
    const users = await this.prisma.user.findMany({
      include: {
        followers: true,
      },
    });

    const mapped = users
      .filter((user) => user.id !== currentUserId)
      .map((user) => {
        const followersCount = user.followers.length;
        const isFollowing = currentUserId
          ? user.followers.some((f) => f.followerId === currentUserId)
          : false;
        return {
          id: user.id,
          name: user.name,
          bio: user.bio,
          image: user.image,
          followersCount,
          isFollowing,
        };
      });

    return mapped.sort((a, b) => b.followersCount - a.followersCount).slice(0, 5);
  }
}
