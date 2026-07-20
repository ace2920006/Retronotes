import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { NotesModule } from './notes/notes.module';
import { FoldersModule } from './folders/folders.module';
import { TagsModule } from './tags/tags.module';
import { AiModule } from './ai/ai.module';
import { ReactionsModule } from './reactions/reactions.module';
import { CommentsModule } from './comments/comments.module';
import { FollowsModule } from './follows/follows.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    NotesModule,
    FoldersModule,
    TagsModule,
    AiModule,
    ReactionsModule,
    CommentsModule,
    FollowsModule,
    NotificationsModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}

