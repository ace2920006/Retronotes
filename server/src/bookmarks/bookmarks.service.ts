import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class BookmarksService {
  constructor(private prisma: PrismaService) {}

  async bookmark(postId: string, userId: string) {
    const existing = await this.prisma.bookmark.findUnique({
      where: {
        postId_userId: { postId, userId },
      },
    });

    if (existing) {
      return existing;
    }

    try {
      return await this.prisma.bookmark.create({
        data: {
          postId,
          userId,
        },
      });
    } catch (e) {
      throw new BadRequestException('Could not bookmark this post');
    }
  }

  async unbookmark(postId: string, userId: string) {
    try {
      await this.prisma.bookmark.delete({
        where: {
          postId_userId: { postId, userId },
        },
      });
      return { success: true };
    } catch (e) {
      throw new BadRequestException('Could not unbookmark this post');
    }
  }

  async findUserBookmarks(userId: string) {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId },
      include: {
        post: {
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
            bookmarks: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bookmarks.map((b) => {
      const post = b.post;
      const { likes, comments, bookmarks: bList, ...rest } = post;
      return {
        ...rest,
        likesCount: likes.length,
        commentsCount: comments.length,
        comments,
        hasLiked: likes.some((like) => like.userId === userId),
        hasBookmarked: true,
      };
    });
  }
}
