import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  async chat(
    @Body() body: { messages: { role: string; content: string }[] },
  ) {
    const { messages } = body;
    if (!messages || !Array.isArray(messages)) {
      throw new BadRequestException('Messages must be an array of chat messages');
    }
    
    const response = await this.aiService.generateResponse(messages);
    return { response };
  }
}
