import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ReactionsService {
  constructor(private readonly prisma: PrismaService) {}

  async toggleReaction(userId: string, noteId: string, type: string) {
    // Check if the note exists
    const note = await this.prisma.note.findUnique({
      where: { id: noteId },
    });
    if (!note) {
      throw new NotFoundException(`Note with ID ${noteId} not found`);
    }

    const normalizedType = type.toUpperCase();
    const existing = await this.prisma.reaction.findUnique({
      where: {
        noteId_userId_type: {
          noteId,
          userId,
          type: normalizedType,
        },
      },
    });

    if (existing) {
      // Toggle off (delete)
      await this.prisma.reaction.delete({
        where: { id: existing.id },
      });
    } else {
      // Toggle on (create)
      await this.prisma.reaction.create({
        data: {
          noteId,
          userId,
          type: normalizedType,
        },
      });

      // Create a notification for the note owner if it's not the user reacting
      if (note.userId !== userId) {
        await this.prisma.notification.create({
          data: {
            type: 'REACTION',
            userId: note.userId, // target user (note owner)
            senderId: userId,
            noteId,
            content: `reacted to your post with ${normalizedType}`,
          },
        });
      }
    }

    return this.getReactionStats(noteId);
  }

  async getReactionStats(noteId: string) {
    const reactions = await this.prisma.reaction.findMany({
      where: { noteId },
      select: { type: true, userId: true },
    });

    // Group reactions by type and list userIds who reacted
    const stats: Record<string, { count: number; userIds: string[] }> = {
      LOVE: { count: 0, userIds: [] },
      FIRE: { count: 0, userIds: [] },
      INSIGHTFUL: { count: 0, userIds: [] },
      CLAP: { count: 0, userIds: [] },
      EMOTIONAL: { count: 0, userIds: [] },
    };

    reactions.forEach((r) => {
      const t = r.type.toUpperCase();
      if (stats[t]) {
        stats[t].count++;
        stats[t].userIds.push(r.userId);
      }
    });

    return stats;
  }
}
