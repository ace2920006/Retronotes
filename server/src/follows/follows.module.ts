import { Module } from '@nestjs/common';
import { FollowsService } from './follows.service';
import { FollowsController } from './follows.controller';
import { PrismaService } from '../prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret_inkverse_2026',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [FollowsController],
  providers: [FollowsService, PrismaService],
  exports: [FollowsService],
})
export class FollowsModule {}
