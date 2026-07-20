import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    data: { noteId: string; content: string; parentId?: string }
  ) {
    const { noteId, content, parentId } = data;

    // Check if note exists
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
    });
    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found`);
    }

    // Check if parent comment exists if parentId is provided
    if (parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parentId },
      });
      if (!parentComment) {
        throw new NotFoundException(`Parent comment with ID ${parentId} not found`);
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        content,
        noteId,
        authorId: userId,
        parentId: parentId || null,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Notify note owner
    if (note.userId !== userId) {
      await this.prisma.notification.create({
        data: {
          type: 'COMMENT',
          userId: note.userId,
          senderId: userId,
          noteId,
          commentId: comment.id,
          content: `commented on your post: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
        },
      });
    }

    // Notify parent comment author if it's a reply
    if (parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parentId },
        select: { authorId: true },
      });
      if (parentComment && parentComment.authorId !== userId && parentComment.authorId !== note.userId) {
        await this.prisma.notification.create({
          data: {
            type: 'COMMENT', // or MENTION/REPLY
            userId: parentComment.authorId,
            senderId: userId,
            noteId,
            commentId: comment.id,
            content: `replied to your comment: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
          },
        });
      }
    }

    return comment;
  }

  async getCommentsTree(noteId: string) {
    const comments = await this.prisma.comment.findMany({
      where: { noteId },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Build threaded tree in memory
    const commentMap: Record<string, any> = {};
    const roots: any[] = [];

    comments.forEach((comment) => {
      commentMap[comment.id] = { ...comment, replies: [] };
    });

    comments.forEach((comment) => {
      const mappedComment = commentMap[comment.id];
      if (comment.parentId) {
        const parent = commentMap[comment.parentId];
        if (parent) {
          parent.replies.push(mappedComment);
        } else {
          // Parent not found in this list, treat as root
          roots.push(mappedComment);
        }
      } else {
        roots.push(mappedComment);
      }
    });

    return roots;
  }
}
