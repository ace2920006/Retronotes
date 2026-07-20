import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class CommentsService {
  constructor(private readonly prisma: PrismaService) {}

  async createComment(userId: string, noteId: string, content: string, parentId?: string) {
    // Verify note exists
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
      include: { user: true },
    });
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Verify parent comment if parentId is supplied
    if (parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: parentId },
      });
      if (!parent) {
        throw new NotFoundException('Parent comment not found');
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

    // Notify the note owner (if it's someone else)
    if (note.userId !== userId) {
      await this.prisma.notification.create({
        data: {
          type: 'COMMENT',
          userId: note.userId,
          senderId: userId,
          senderName: comment.author.name || 'A writer',
          senderImage: comment.author.image || '✍️',
          noteId,
          commentId: comment.id,
          content: `commented on your note "${note.title}": "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
        },
      });
    }

    // If it's a nested reply, notify the parent comment owner (if different from note owner and actor)
    if (parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: parentId },
        include: { author: true },
      });

      if (parentComment && parentComment.authorId !== userId && parentComment.authorId !== note.userId) {
        await this.prisma.notification.create({
          data: {
            type: 'COMMENT',
            userId: parentComment.authorId,
            senderId: userId,
            senderName: comment.author.name || 'A writer',
            senderImage: comment.author.image || '✍️',
            noteId,
            commentId: comment.id,
            content: `replied to your comment: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
          },
        });
      }
    }

    // Check achievement unlock: FIRST_COMMENT
    const achievementsCount = await this.prisma.userAchievement.count({
      where: { userId, badgeId: 'FIRST_COMMENT' },
    });
    if (achievementsCount === 0) {
      await this.prisma.userAchievement.create({
        data: {
          badgeId: 'FIRST_COMMENT',
          userId,
        },
      });
      // Also notify user they unlocked an achievement
      await this.prisma.notification.create({
        data: {
          type: 'PUBLISH', // generic update
          userId,
          content: '🏆 Unlocked Achievement: First Comment! You left your first feedback.',
        },
      });
    }

    return comment;
  }

  async getCommentsForNote(noteId: string) {
    return this.prisma.comment.findMany({
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
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      // Also allow note owner to delete comments on their own note
      const note = await this.prisma.note.findUnique({
        where: { id: comment.noteId },
      });
      if (!note || note.userId !== userId) {
        throw new NotFoundException('You are not authorized to delete this comment');
      }
    }

    return this.prisma.comment.delete({
      where: { id: commentId },
    });
  }
}
