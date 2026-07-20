import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey = process.env.GEMINI_API_KEY;

  private async callGemini(
    prompt: string,
    systemInstruction: string,
    jsonMode = false,
  ): Promise<string> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment');
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [{ text: prompt }],
              },
            ],
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
            ...(jsonMode
              ? {
                  generationConfig: {
                    responseMimeType: 'application/json',
                  },
                }
              : {}),
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      return text;
    } catch (error) {
      this.logger.error('Failed to contact Gemini API:', error);
      throw error;
    }
  }

  async generateResponse(messages: { role: string; content: string }[]): Promise<string> {
    if (!this.apiKey) {
      return this.generateMockResponse(messages);
    }

    try {
      // Map roles from user/assistant to user/model
      const contents = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const systemInstruction =
        'You are RetroNotes Terminal Assistant, a helpful AI integrated into a modern note-taking application with a retro computer theme. Help the user organize, refine, and study their notes. Keep responses in markdown format and maintain a retro-futuristic, friendly assistant persona.';

      const response = await fetch(
        `https://genergenerativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            systemInstruction: {
              parts: [{ text: systemInstruction }],
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Gemini error: ${response.status}`);
      }

      const data = await response.json();
      return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from AI.';
    } catch (error) {
      this.logger.error('AI chat error:', error);
      return this.generateMockResponse(messages);
    }
  }

  async summarize(content: string): Promise<string> {
    const system =
      'You are a concise, helpful note-taking assistant. Summarize the note text provided in a brief, structured, highly readable summary. Use markdown bullet points and headings. Be concise.';
    const prompt = `Summarize the following note content:\n\n${content}`;

    try {
      return await this.callGemini(prompt, system);
    } catch (e) {
      this.logger.warn('Gemini error, using fallback summarizer');
      return `### 📝 Note Summary (AI Mock)\n\n- **Overview**: This note contains descriptions and listings.\n- **Content Length**: approximately ${content.split(/\s+/).length} words.\n- **Summary**: The text outlines essential notes or documentation details.\n\n*(Connect your GEMINI_API_KEY for a real AI summary!)*`;
    }
  }

  async generateTitle(content: string): Promise<string> {
    const system =
      'You are a note-taking assistant. Generate a short, punchy, descriptive note title (max 5-6 words) based on the note content provided. Return ONLY the title text, with no quotes, punctuation, or extra text.';
    const prompt = `Generate a short title for this note content:\n\n${content}`;

    try {
      const title = await this.callGemini(prompt, system);
      return title.trim().replace(/^["']|["']$/g, '');
    } catch (e) {
      this.logger.warn('Gemini error, using fallback title generator');
      const words = content.trim().split(/\s+/).slice(0, 4).join(' ');
      return words ? `${words}...` : 'Untitled Note';
    }
  }

  async correctGrammar(content: string): Promise<string> {
    const system =
      'You are a professional editor. Correct the spelling, grammar, and typos in the user note content, while preserving the original layout and formatting. Return ONLY the corrected note text.';
    const prompt = `Correct the grammar of this note text, keeping its structure:\n\n${content}`;

    try {
      return await this.callGemini(prompt, system);
    } catch (e) {
      this.logger.warn('Gemini error, using fallback grammar corrector');
      return `${content}\n\n*(Checked for grammar - Mock verification)*`;
    }
  }

  async suggestTags(content: string): Promise<string[]> {
    const system =
      'You are a note organizer. Suggest 3 to 5 relevant tags for the note content provided. The output must be a simple comma-separated list of single-word tags, with no hashtags or punctuation. Example: College, Study, Coding, Math';
    const prompt = `Suggest tags for this note:\n\n${content}`;

    try {
      const response = await this.callGemini(prompt, system);
      return response
        .split(',')
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0);
    } catch (e) {
      this.logger.warn('Gemini error, using fallback tag suggester');
      const tags = ['General', 'Notes'];
      if (content.toLowerCase().includes('code') || content.toLowerCase().includes('console')) {
        tags.push('Coding');
      }
      if (content.toLowerCase().includes('recipe') || content.toLowerCase().includes('cook')) {
        tags.push('Recipe');
      }
      return tags;
    }
  }

  async generateFlashcards(content: string): Promise<{ question: string; answer: string }[]> {
    const system =
      'You are a study assistant. Generate 3 to 5 study flashcards (Question & Answer pairs) based on the note content provided. Your response must be in JSON format: [{"question": "...", "answer": "..."}]. Return ONLY valid JSON, no markdown code block formatting.';
    const prompt = `Generate flashcards for this note content:\n\n${content}`;

    try {
      const response = await this.callGemini(prompt, system, true);
      return JSON.parse(response);
    } catch (e) {
      this.logger.warn('Gemini error, using fallback flashcard generator');
      return [
        {
          question: 'What is the main topic of this note?',
          answer: 'The note describes a set of general ideas or structures.',
        },
        {
          question: 'Is this note complete?',
          answer: 'The note contains active sections and outlines.',
        },
      ];
    }
  }

  async aiSearch(
    query: string,
    notes: { id: string; title: string; content: string }[],
  ): Promise<string[]> {
    const system =
      'You are a note search assistant. You are given a natural language search query and a list of user notes in JSON format. Select the note IDs that match or are highly relevant to the query. Your response must be in JSON format: ["id1", "id2"]. Return ONLY valid JSON, no markdown code block formatting.';
    const prompt = `Search query: "${query}"\n\nNotes JSON:\n${JSON.stringify(notes)}`;

    try {
      const response = await this.callGemini(prompt, system, true);
      return JSON.parse(response);
    } catch (e) {
      this.logger.warn('Gemini error, using fallback search match');
      const lowercaseQuery = query.toLowerCase();
      return notes
        .filter(
          (note) =>
            note.title.toLowerCase().includes(lowercaseQuery) ||
            note.content.toLowerCase().includes(lowercaseQuery),
        )
        .map((n) => n.id);
    }
  }

  private generateMockResponse(messages: { role: string; content: string }[]): string {
    const lastUserMessage =
      [...messages].reverse().find((m) => m.role === 'user')?.content?.toLowerCase() || '';

    if (lastUserMessage.includes('help') || lastUserMessage.includes('hello')) {
      return `### 📟 RetroNotes AI Terminal\n\nWelcome back! I am your AI note companion. I can help you with:\n- Note Summarization\n- Tag Suggestions\n- Study Flashcards generation\n- Title generation\n- Quick grammatical fixes\n\n*Type anything or use the buttons in the AI drawer!*`;
    }

    return `### 📟 RetroNotes AI Response (Mock)\n\nI received your message: "${lastUserMessage}".\n\n*To unlock real-time Gemini AI integration, please set a valid \`GEMINI_API_KEY\` in your server \`.env\` file.*`;
  }
}
