import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { CommentsModule } from './comments/comments.module';
import { LikesModule } from './likes/likes.module';
import { FollowsModule } from './follows/follows.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [AuthModule, UsersModule, PostsModule, CommentsModule, LikesModule, FollowsModule, AiModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
