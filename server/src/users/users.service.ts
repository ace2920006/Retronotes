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

  async create(data: { email: string; name?: string; password?: string }): Promise<User> {
    return this.prisma.user.create({
      data,
    });
  }

  async update(id: string, data: { name?: string; image?: string }): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data,
    });
  }

  async getDashboardStats(userId: string) {
    // 1. Get notes by status
    const allNotes = await this.prisma.note.findMany({
      where: { userId },
      select: {
        isPinned: true,
        isArchived: true,
        isTrashed: true,
        isFavorite: true,
        content: true,
      },
    });

    const totalNotes = allNotes.filter((n) => !n.isTrashed).length;
    const pinnedCount = allNotes.filter((n) => n.isPinned && !n.isTrashed && !n.isArchived).length;
    const archivedCount = allNotes.filter((n) => n.isArchived && !n.isTrashed).length;
    const trashedCount = allNotes.filter((n) => n.isTrashed).length;
    const favoriteCount = allNotes.filter((n) => n.isFavorite && !n.isTrashed && !n.isArchived).length;

    // 2. Count folders and tags
    const foldersCount = await this.prisma.folder.count({ where: { userId } });
    const tagsCount = await this.prisma.tag.count({ where: { userId } });

    // 3. Folder stats breakdown
    const folders = await this.prisma.folder.findMany({
      where: { userId },
      include: {
        _count: {
          select: { notes: { where: { isTrashed: false } } },
        },
      },
    });

    const folderStats = folders.map((f) => ({
      folderId: f.id,
      folderName: f.name,
      color: f.color,
      noteCount: f._count.notes,
    }));

    // 4. Calculate total word count (excluding trashed notes)
    let totalWordCount = 0;
    allNotes
      .filter((n) => !n.isTrashed)
      .forEach((n) => {
        const words = n.content.trim().split(/\s+/).filter(Boolean);
        totalWordCount += words.length;
      });

    return {
      totalNotes,
      pinnedCount,
      archivedCount,
      trashedCount,
      favoriteCount,
      foldersCount,
      tagsCount,
      totalWordCount,
      folderStats,
    };
  }
}
