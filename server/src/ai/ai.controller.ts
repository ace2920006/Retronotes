import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(@Body() body: { messages: { role: string; content: string }[] }) {
    const { messages } = body;
    if (!messages || !Array.isArray(messages)) {
      throw new BadRequestException('Messages must be an array');
    }
    const response = await this.aiService.generateResponse(messages);
    return { response };
  }

  @Post('summarize')
  async summarize(@Body() body: { content: string }) {
    const { content } = body;
    if (content === undefined) {
      throw new BadRequestException('Content is required');
    }
    const summary = await this.aiService.summarize(content);
    return { summary };
  }

  @Post('generate-title')
  async generateTitle(@Body() body: { content: string }) {
    const { content } = body;
    if (content === undefined) {
      throw new BadRequestException('Content is required');
    }
    const title = await this.aiService.generateTitle(content);
    return { title };
  }

  @Post('correct-grammar')
  async correctGrammar(@Body() body: { content: string }) {
    const { content } = body;
    if (content === undefined) {
      throw new BadRequestException('Content is required');
    }
    const correctedContent = await this.aiService.correctGrammar(content);
    return { correctedContent };
  }

  @Post('suggest-tags')
  async suggestTags(@Body() body: { content: string }) {
    const { content } = body;
    if (content === undefined) {
      throw new BadRequestException('Content is required');
    }
    const tags = await this.aiService.suggestTags(content);
    return { tags };
  }

  @Post('generate-flashcards')
  async generateFlashcards(@Body() body: { content: string }) {
    const { content } = body;
    if (content === undefined) {
      throw new BadRequestException('Content is required');
    }
    const flashcards = await this.aiService.generateFlashcards(content);
    return { flashcards };
  }

  @Post('search')
  async search(
    @Body() body: { query: string; notes: { id: string; title: string; content: string }[] },
  ) {
    const { query, notes } = body;
    if (!query || !notes || !Array.isArray(notes)) {
      throw new BadRequestException('Query and notes array are required');
    }
    const matchedIds = await this.aiService.aiSearch(query, notes);
    return { matchedIds };
  }

  @Post('detect-mood')
  async detectMood(@Body() body: { content: string }) {
    const { content } = body;
    if (content === undefined) {
      throw new BadRequestException('Content is required');
    }
    const mood = await this.aiService.detectMood(content);
    return { mood };
  }
}
