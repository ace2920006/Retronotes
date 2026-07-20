import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleReaction(userId: string, noteId: string, type: string) {
    // Verify note exists
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
      include: { user: true },
    });
    if (!note) {
      throw new NotFoundException('Note not found');
    }

    // Check if reaction exists
    const existing = await this.prisma.reaction.findUnique({
      where: {
        noteId_userId_type: {
          noteId,
          userId,
          type,
        },
      },
    });

    if (existing) {
      // Remove reaction
      await this.prisma.reaction.delete({
        where: { id: existing.id },
      });
    } else {
      // Add reaction
      await this.prisma.reaction.create({
        data: {
          type,
          noteId,
          userId,
        },
      });

      // Notify the note owner (if it's someone else)
      if (note.userId !== userId) {
        const reactor = await this.prisma.user.findUnique({ where: { id: userId } });
        await this.prisma.notification.create({
          data: {
            type: 'REACTION',
            userId: note.userId,
            senderId: userId,
            senderName: reactor?.name || 'A writer',
            senderImage: reactor?.image || '✍️',
            noteId,
            content: `reacted with ${this.getReactionEmoji(type)} ${type.toLowerCase()} to your note "${note.title}"`,
          },
        });
      }
    }

    return this.getReactionStats(noteId, userId);
  }

  async getReactionStats(noteId: string, currentUserId?: string) {
    const reactions = await this.prisma.reaction.findMany({
      where: { noteId },
    });

    const types = ['LOVE', 'FIRE', 'INSIGHTFUL', 'CLAP', 'EMOTIONAL'];
    const stats: Record<string, number> = {};
    const userReacted: Record<string, boolean> = {};

    types.forEach((t) => {
      stats[t] = reactions.filter((r) => r.type === t).length;
      userReacted[t] = currentUserId
        ? reactions.some((r) => r.type === t && r.userId === currentUserId)
        : false;
    });

    return {
      noteId,
      totalCount: reactions.length,
      stats,
      userReacted,
    };
  }

  private getReactionEmoji(type: string): string {
    switch (type) {
      case 'LOVE': return '❤️';
      case 'FIRE': return '🔥';
      case 'INSIGHTFUL': return '💡';
      case 'CLAP': return '👏';
      case 'EMOTIONAL': return '😢';
      default: return '👍';
    }
  }
}
