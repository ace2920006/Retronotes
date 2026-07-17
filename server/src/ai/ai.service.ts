import { Injectable, Logger } from '@nestjs/common';
import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly apiKey = process.env.GEMINI_API_KEY;

  async generateResponse(messages: { role: string; content: string }[]): Promise<string> {
    if (!this.apiKey) {
      this.logger.warn('GEMINI_API_KEY not found in environment. Using fallback creative generator.');
      return this.generateMockResponse(messages);
    }

    try {
      // Map roles from OpenAI format (user/assistant) to Gemini format (user/model)
      const contents = messages.map((msg) => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const systemInstruction = {
        parts: [
          {
            text: 'You are InkVerse Muse, a warm, encouraging, and deeply creative literary assistant for a social media platform called InkVerse. InkVerse is a community for poets, novelists, storytellers, and dreamers. Your goal is to inspire writers, offer helpful critiques, suggest rhymes/haikus, spark story ideas, and critique work gently. Keep your responses formatted in beautiful, readable markdown. Keep your tone poetic, thoughtful, and encouraging.',
          },
        ],
      };

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents,
            systemInstruction,
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(`Gemini API returned error: ${response.status} - ${errorText}`);
        return `*The Muse is deep in thought, but hit a slight block (API Error: ${response.status}). Here is some creative inspiration in the meantime:*\n\n"Every secret of a writer's soul, every experience of his life, every quality of his mind is written large in his works." — Virginia Woolf\n\n*Please check backend configuration or try again.*`;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('Empty response from Gemini API');
      }

      return text;
    } catch (error) {
      this.logger.error('Failed to contact Gemini API:', error);
      return this.generateMockResponse(messages);
    }
  }

  private generateMockResponse(messages: { role: string; content: string }[]): string {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user')?.content?.toLowerCase() || '';

    // Haiku requested
    if (lastUserMessage.includes('haiku') || lastUserMessage.includes('5-7-5')) {
      const haikus = [
        `*A drift of autumn petals,*\n*Silent whispers in the breeze,*\n*Souls find home in ink.*`,
        `*Quiet empty page,*\n*Ink flows like a river wild,*\n*Worlds begin to wake.*`,
        `*Moonlight on the sea,*\n*Tides of words that rise and fall,*\n*Stories left untold.*`,
      ];
      const selected = haikus[Math.floor(Math.random() * haikus.length)];
      return `### 🌸 A Gift from the Muse\n\nHere is a haiku crafted just for you:\n\n${selected}\n\n*Haikus capture a universe in just three lines (5-7-5 syllables). What would you like to write about next?*`;
    }

    // Poem or Poetry requested
    if (lastUserMessage.includes('poem') || lastUserMessage.includes('poetry') || lastUserMessage.includes('write')) {
      return `### 🖊️ Spurring the Creative Flow\n\nWriting poetry is about capturing the texture of a single moment. If you're feeling stuck, try one of these prompts:\n\n1. **The Language of Rain:** Write a stanza where the rain acts as a messenger between two distant towns.\n2. **Echoes of a Mirror:** Describe a mirror that reflects the owner's memories instead of their current face.\n3. **Whispers in the Library:** Write about the conversations books have with each other when the lights go out.\n\n*Start with one line, let the rhythm guide you, and post your creation to InkVerse!*`;
    }

    // Rhymes requested
    if (lastUserMessage.includes('rhyme') || lastUserMessage.includes('rhyming')) {
      return `### 🎵 Finding the Rhythm\n\nRhymes give poetry its musical heartbeat. Here is a creative exercise:\n- Select a word like **Light** (rhymes: *flight, night, sight, height, ignite, twilight*).\n- Try to weave them into a couplet:\n  > *A single spark in deep twilight,*\n  > *Can set a dreaming heart in flight.*\n\nWhat words are you trying to pair together right now? Let me know, and we can find the perfect match!`;
    }

    // Feedback or Critique requested
    if (lastUserMessage.includes('feedback') || lastUserMessage.includes('critique') || lastUserMessage.includes('review') || lastUserMessage.includes('analyze')) {
      return `### 🧐 The Muse's Gentle Critique\n\nI would be absolutely delighted to read and review your writing! \n\nPlease paste a stanza or a passage here, and I will share my thoughts on:\n- **Tone & Mood** (what feelings it evokes)\n- **Imagery & Metaphor** (how your words paint pictures)\n- **Rhythm & Flow** (how it reads aloud)\n\n*Paste your lines below, and let us polish them together!*`;
    }

    // Story or Novel requested
    if (lastUserMessage.includes('story') || lastUserMessage.includes('novel') || lastUserMessage.includes('fiction')) {
      return `### 📖 The Spark of Storytelling\n\nEvery great story starts with a "What If?". Here is a storytelling prompt to get your pen moving:\n\n> *What if people's shadows could speak, but they only spoke the truths that their owners were too afraid to say aloud?*\n\nThink about:\n- Who is your main character?\n- What secret does their shadow reveal in public?\n- How does this change their life?\n\n*Write a paragraph starting with this concept, and feel free to share it here!*`;
    }

    // General welcoming responses
    return `### ✨ Hello, Fellow Dreamer! \n\nI am the **InkVerse Muse**, your creative writing companion. Whether you are crafting a delicate haiku, building a vast fictional world, or looking for the perfect rhyme, I am here to help.\n\nHere are a few things you can ask me:\n- *"Give me a prompt for a poetry piece"* \n- *"Write a haiku about a starry night"* \n- *"Can you give me feedback on my writing?"*\n- *"What are some words that rhyme with 'silence'?"*\n\n*What is on your mind today? Let the words flow.*`;
  }
}
