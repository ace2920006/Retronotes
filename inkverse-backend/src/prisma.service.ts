import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../generated/prisma';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    console.log('[PrismaService] Debugging - Connecting to the database...');
    await this.$connect();
    console.log('[PrismaService] Database connected successfully.');
  }
}
