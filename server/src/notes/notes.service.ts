import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class NotesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    data: {
      title: string;
      content: string;
      folderId?: string;
      tagNames?: string[];
      isPinned?: boolean;
      isFavorite?: boolean;
      isPublished?: boolean;
      collection?: string;
      mood?: string;
      summary?: string;
      color?: string;
    }
  ) {
    const { title, content, folderId, tagNames, isPinned, isFavorite, isPublished, collection, mood, summary, color } = data;

    const tagsConnectOrCreate = tagNames
      ? tagNames.map((name) => ({
          where: { name_userId: { name, userId } },
          create: { name, userId },
        }))
      : [];

    const note = await this.prisma.note.create({
      data: {
        title,
        content,
        isPinned: isPinned ?? false,
        isFavorite: isFavorite ?? false,
        isPublished: isPublished ?? true,
        collection: collection || null,
        mood: mood || null,
        summary: summary || null,
        color: color || null,
        user: { connect: { id: userId } },
        folder: folderId ? { connect: { id: folderId } } : undefined,
        tags: {
          connectOrCreate: tagsConnectOrCreate,
        },
      },
      include: {
        folder: true,
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            streak: true,
          }
        }
      },
    });

    // --- STREAK & ACHIEVEMENTS SYSTEM ---
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        let newStreak = user.streak;
        const now = new Date();
        
        if (user.lastWriteDate) {
          const lastDate = new Date(user.lastWriteDate);
          
          // Clear time component for accurate day comparison
          const lastDateMidnight = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());
          const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          
          const diffTime = nowMidnight.getTime() - lastDateMidnight.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 1) {
            newStreak += 1;
          } else if (diffDays > 1) {
            newStreak = 1;
          }
          // If diffDays === 0 (same day), streak remains unchanged
        } else {
          newStreak = 1;
        }

        await this.prisma.user.update({
          where: { id: userId },
          data: { streak: newStreak, lastWriteDate: now },
        });

        // Trigger Achievement checks
        const checkAndUnlockBadge = async (badgeId: string, condition: boolean, message: string) => {
          if (condition) {
            const hasBadge = await this.prisma.userAchievement.findUnique({
              where: { badgeId_userId: { badgeId, userId } },
            });
            if (!hasBadge) {
              await this.prisma.userAchievement.create({
                data: { badgeId, userId },
              });
              // Create notification
              await this.prisma.notification.create({
                data: {
                  type: 'PUBLISH', // Generic system notification
                  userId,
                  content: `🏆 Achievement Unlocked: ${message}!`,
                },
              });
            }
          }
        };

        // Badge 1: FIRST_NOTE
        const noteCount = await this.prisma.note.count({ where: { userId, isTrashed: false } });
        await checkAndUnlockBadge('FIRST_NOTE', noteCount >= 1, 'First Page (You wrote your first note)');

        // Badge 2: 7-DAY STREAK
        await checkAndUnlockBadge('SEVEN_DAY_STREAK', newStreak >= 7, '7-Day Writing Streak (Consistent scribe)');

        // Badge 3: 50 NOTES
        await checkAndUnlockBadge('FIFTY_NOTES', noteCount >= 50, 'Master Scribe (Written 50 notes)');
      }
    } catch (streakError) {
      console.error('Streak system error:', streakError);
    }

    return note;
  }

  async findAll(
    userId: string,
    filters: {
      folderId?: string;
      tag?: string;
      search?: string;
      status?: string; // E.g., pinned, archived, trashed, favorite
      sort?: 'newest' | 'oldest';
      feed?: 'personal' | 'following' | 'trending';
      collection?: string;
      seriesId?: string;
    }
  ) {
    const { folderId, tag, search, status, sort, feed, collection, seriesId } = filters;

    // Build the query where clause
    const whereClause: any = {};

    // 1. Handle Feeds
    if (feed === 'trending') {
      // Show all published, active posts from any user
      whereClause.isPublished = true;
      whereClause.isTrashed = false;
      whereClause.isArchived = false;
    } else if (feed === 'following') {
      // Show published, active posts from followed users
      const following = await this.prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });
      const followingIds = following.map((f) => f.followingId);
      
      whereClause.userId = { in: followingIds };
      whereClause.isPublished = true;
      whereClause.isTrashed = false;
      whereClause.isArchived = false;
    } else {
      // Default: personal notes feed
      whereClause.userId = userId;

      // Handle personal statuses
      if (status === 'pinned') {
        whereClause.isPinned = true;
        whereClause.isTrashed = false;
        whereClause.isArchived = false;
      } else if (status === 'archived') {
        whereClause.isArchived = true;
        whereClause.isTrashed = false;
      } else if (status === 'trashed') {
        whereClause.isTrashed = true;
      } else if (status === 'favorite') {
        whereClause.isFavorite = true;
        whereClause.isTrashed = false;
        whereClause.isArchived = false;
      } else {
        whereClause.isTrashed = false;
        whereClause.isArchived = false;
      }
    }

    // Collection filter (e.g. Poetry, Stories, etc.)
    if (collection) {
      whereClause.collection = collection;
    }

    if (seriesId) {
      whereClause.seriesId = seriesId;
    }

    // Folder filter
    if (folderId) {
      whereClause.folderId = folderId;
    }

    // Tag filter
    if (tag) {
      whereClause.tags = {
        some: {
          name: tag,
        },
      };
    }

    // Search filter (title or content)
    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
      ];
    }

    // Ordering definition
    const orderBy = {
      createdAt: (sort === 'oldest' ? 'asc' : 'desc') as 'asc' | 'desc',
    };

    const notes = await this.prisma.note.findMany({
      where: whereClause,
      include: {
        folder: true,
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            streak: true,
          },
        },
        reactions: true,
        comments: {
          select: { id: true },
        },
      },
      orderBy,
    });

    // If feed is trending, sort posts dynamically in memory by popularity index
    // Popularity = uniqueReaders + views + (commentsCount * 3) + (reactionsCount * 2)
    if (feed === 'trending') {
      return notes.sort((a, b) => {
        const scoreA = a.viewsCount + (a.comments.length * 3) + (a.reactions.length * 2);
        const scoreB = b.viewsCount + (b.comments.length * 3) + (b.reactions.length * 2);
        return scoreB - scoreA; // descending
      });
    }

    return notes;
  }

  async findOne(id: string, userId: string) {
    const note = await this.prisma.note.findUnique({
      where: { id },
      include: {
        folder: true,
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            streak: true,
            followers: true,
          },
        },
        comments: {
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
        },
        reactions: true,
      },
    });

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    // Increment view count if read by someone else
    if (note.userId !== userId && !note.isTrashed) {
      await this.prisma.note.update({
        where: { id },
        data: {
          viewsCount: { increment: 1 },
          uniqueReadersCount: { increment: 1 }, // Simple increment
        },
      });
    }

    return note;
  }

  async update(
    id: string,
    userId: string,
    data: {
      title?: string;
      content?: string;
      folderId?: string;
      tagNames?: string[];
      isPinned?: boolean;
      isArchived?: boolean;
      isTrashed?: boolean;
      isFavorite?: boolean;
      color?: string;
      isPublished?: boolean;
      collection?: string;
      seriesId?: string;
      mood?: string;
      summary?: string;
    }
  ) {
    // Check ownership
    const note = await this.findOne(id, userId);
    if (note.userId !== userId) {
      throw new ForbiddenException('You do not own this note');
    }

    const {
      title,
      content,
      folderId,
      tagNames,
      isPinned,
      isArchived,
      isTrashed,
      isFavorite,
      color,
      isPublished,
      collection,
      seriesId,
      mood,
      summary,
    } = data;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (isArchived !== undefined) updateData.isArchived = isArchived;
    if (isTrashed !== undefined) updateData.isTrashed = isTrashed;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;
    if (color !== undefined) updateData.color = color;
    if (isPublished !== undefined) updateData.isPublished = isPublished;
    if (collection !== undefined) updateData.collection = collection;
    if (mood !== undefined) updateData.mood = mood;
    if (summary !== undefined) updateData.summary = summary;

    if (folderId !== undefined) {
      if (folderId === null || folderId === '') {
        updateData.folder = { disconnect: true };
      } else {
        updateData.folder = { connect: { id: folderId } };
      }
    }

    if (seriesId !== undefined) {
      if (seriesId === null || seriesId === '') {
        updateData.series = { disconnect: true };
      } else {
        updateData.series = { connect: { id: seriesId } };
      }
    }

    if (tagNames !== undefined) {
      const tagsConnectOrCreate = tagNames.map((name) => ({
        where: { name_userId: { name, userId } },
        create: { name, userId },
      }));

      updateData.tags = {
        set: [],
        connectOrCreate: tagsConnectOrCreate,
      };
    }

    const updatedNote = await this.prisma.note.update({
      where: { id },
      data: updateData,
      include: {
        folder: true,
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
          },
        },
      },
    });

    // Check streaks if this is newly published
    if (isPublished === true && !note.isPublished) {
      // Calculate streak
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      if (user) {
        let newStreak = user.streak;
        const now = new Date();
        const lastWrite = user.lastWriteDate;

        if (!lastWrite) {
          newStreak = 1;
        } else {
          const diffTime = Math.abs(now.getTime() - lastWrite.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          if (diffDays <= 1) {
            // Written today or yesterday
            if (diffDays === 1) {
              newStreak += 1;
            }
          } else {
            // Streak broken
            newStreak = 1;
          }
        }

        await this.prisma.user.update({
          where: { id: userId },
          data: {
            streak: newStreak,
            lastWriteDate: now,
          },
        });

        // Award achievement for 7 day streak
        if (newStreak >= 7) {
          await this.prisma.userAchievement.upsert({
            where: {
              badgeId_userId: {
                badgeId: 'SEVEN_DAY_STREAK',
                userId,
              },
            },
            update: {},
            create: {
              badgeId: 'SEVEN_DAY_STREAK',
              userId,
            },
          });
        }
      }
    }

    return updatedNote;
  }

  async remove(id: string, userId: string) {
    // Check ownership
    const note = await this.findOne(id, userId);
    if (note.userId !== userId) {
      throw new ForbiddenException('You do not own this note');
    }

    return this.prisma.note.delete({
      where: { id },
    });
  }

  async emptyTrash(userId: string) {
    return this.prisma.note.deleteMany({
      where: {
        userId,
        isTrashed: true,
      },
    });
  }
}
