import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const notifications = await this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    // Populate sender details dynamically
    const senderIds = Array.from(
      new Set(notifications.map((n) => n.senderId).filter(Boolean))
    ) as string[];

    const senders = await this.prisma.user.findMany({
      where: { id: { in: senderIds } },
      select: { id: true, name: true, image: true },
    });

    const senderMap = new Map(senders.map((s) => [s.id, s]));

    return notifications.map((n) => {
      const sender = n.senderId ? senderMap.get(n.senderId) : null;
      return {
        ...n,
        senderName: sender?.name || n.senderName || 'Anonymous',
        senderImage: sender?.image || n.senderImage || null,
      };
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.notification.count({
      where: { userId, isRead: false },
    });
    return { count };
  }

  async markAsRead(userId: string, id: string) {
    const notification = await this.prisma.notification.findUnique({
      where: { id },
    });

    if (!notification) {
      throw new NotFoundException(`Notification with ID ${id} not found`);
    }

    if (notification.userId !== userId) {
      throw new NotFoundException('You do not own this notification');
    }

    return this.prisma.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }
}
