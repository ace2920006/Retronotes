import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(authorId: string, data: { title?: string; content: string; type: string; songUrl?: string }) {
    return this.prisma.post.create({
      data: {
        title: data.title,
        content: data.content,
        type: data.type,
        songUrl: data.songUrl,
        authorId,
      },
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
      },
    });
  }

  async findFeed(currentUserId?: string, type?: string, search?: string, followingOnly?: boolean) {
    const where: any = {};

    if (type && type !== 'All') {
      where.type = type;
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        {
          author: {
            name: { contains: search },
          },
        },
      ];
    }

    if (followingOnly && currentUserId) {
      const followedUsers = await this.prisma.follows.findMany({
        where: { followerId: currentUserId },
        select: { followingId: true },
      });
      where.authorId = { in: followedUsers.map((f) => f.followingId) };
    }

    const posts = await this.prisma.post.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, image: true, bio: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        likes: true,
      },
    });

    // Format output with counts and hasLiked boolean
    return posts.map((post) => {
      const { likes, comments, ...rest } = post;
      return {
        ...rest,
        likesCount: likes.length,
        commentsCount: comments.length,
        comments,
        hasLiked: currentUserId ? likes.some((like) => like.userId === currentUserId) : false,
      };
    });
  }

  async findByUser(userId: string, currentUserId?: string) {
    const posts = await this.prisma.post.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, image: true, bio: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        likes: true,
      },
    });

    return posts.map((post) => {
      const { likes, comments, ...rest } = post;
      return {
        ...rest,
        likesCount: likes.length,
        commentsCount: comments.length,
        comments,
        hasLiked: currentUserId ? likes.some((like) => like.userId === currentUserId) : false,
      };
    });
  }

  async findOne(id: string, currentUserId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: { id: true, name: true, image: true, bio: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true, image: true },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        likes: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const { likes, comments, ...rest } = post;
    return {
      ...rest,
      likesCount: likes.length,
      commentsCount: comments.length,
      comments,
      hasLiked: currentUserId ? likes.some((like) => like.userId === currentUserId) : false,
    };
  }

  async update(id: string, authorId: string, data: { title?: string; content?: string; songUrl?: string }) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only edit your own posts');
    }

    return this.prisma.post.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, authorId: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }
    if (post.authorId !== authorId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.delete({
      where: { id },
    });
    return { success: true };
  }
}
