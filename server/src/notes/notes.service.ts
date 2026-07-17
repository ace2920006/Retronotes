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
    }
  ) {
    const { title, content, folderId, tagNames, isPinned, isFavorite } = data;

    const tagsConnectOrCreate = tagNames
      ? tagNames.map((name) => ({
          where: { name_userId: { name, userId } },
          create: { name, userId },
        }))
      : [];

    return this.prisma.note.create({
      data: {
        title,
        content,
        isPinned: isPinned ?? false,
        isFavorite: isFavorite ?? false,
        user: { connect: { id: userId } },
        folder: folderId ? { connect: { id: folderId } } : undefined,
        tags: {
          connectOrCreate: tagsConnectOrCreate,
        },
      },
      include: {
        folder: true,
        tags: true,
      },
    });
  }

  async findAll(
    userId: string,
    filters: {
      folderId?: string;
      tag?: string;
      search?: string;
      status?: string;
      sort?: 'newest' | 'oldest';
    }
  ) {
    const { folderId, tag, search, status, sort } = filters;

    const whereClause: any = {
      userId,
    };

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

    // Status filter
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
      // By default, do not show archived or trashed notes
      whereClause.isTrashed = false;
      whereClause.isArchived = false;
    }

    const orderBy = {
      updatedAt: (sort === 'oldest' ? 'asc' : 'desc') as 'asc' | 'desc',
    };

    return this.prisma.note.findMany({
      where: whereClause,
      include: {
        folder: true,
        tags: true,
      },
      orderBy,
    });
  }

  async findOne(id: string, userId: string) {
    const note = await this.prisma.note.findUnique({
      where: { id },
      include: {
        folder: true,
        tags: true,
      },
    });

    if (!note) {
      throw new NotFoundException(`Note with ID ${id} not found`);
    }

    if (note.userId !== userId) {
      throw new ForbiddenException('You do not own this note');
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
    }
  ) {
    // Check ownership
    await this.findOne(id, userId);

    const { title, content, folderId, tagNames, isPinned, isArchived, isTrashed, isFavorite } = data;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (isArchived !== undefined) updateData.isArchived = isArchived;
    if (isTrashed !== undefined) updateData.isTrashed = isTrashed;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    // Handle Folder update
    if (folderId !== undefined) {
      if (folderId === null || folderId === '') {
        updateData.folder = { disconnect: true };
      } else {
        updateData.folder = { connect: { id: folderId } };
      }
    }

    // Handle Tags update
    if (tagNames !== undefined) {
      const tagsConnectOrCreate = tagNames.map((name) => ({
        where: { name_userId: { name, userId } },
        create: { name, userId },
      }));

      updateData.tags = {
        set: [], // clear current tags
        connectOrCreate: tagsConnectOrCreate,
      };
    }

    return this.prisma.note.update({
      where: { id },
      data: updateData,
      include: {
        folder: true,
        tags: true,
      },
    });
  }

  async remove(id: string, userId: string) {
    // Check ownership
    await this.findOne(id, userId);

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
