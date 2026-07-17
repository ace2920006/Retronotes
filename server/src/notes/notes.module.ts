import { Module } from '@nestjs/common';
import { NotesService } from './notes.service';
import { NotesController } from './notes.controller';
import { PrismaService } from '../prisma.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'secret_retronotes_2026',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [NotesController],
  providers: [NotesService, PrismaService],
  exports: [NotesService],
})
export class NotesModule {}
