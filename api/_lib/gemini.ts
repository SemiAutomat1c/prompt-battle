import { GoogleGenAI } from '@google/genai';
import type { GeminiGenerationResult } from './types';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.warn('[Gemini] Warning: GEMINI_API_KEY not set');
}

// Initialize Gemini client
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

// Rate limiter for Gemini API
class GeminiRateLimiter {
  private queue: number[] = [];
  private readonly requestsPerMinute = 60;

  async waitForSlot(): Promise<void> {
    const now = Date.now();
    this.queue = this.queue.filter(timestamp => now - timestamp < 60000);

    if (this.queue.length >= this.requestsPerMinute) {
      const oldestRequest = this.queue[0];
      const waitTime = 60000 - (now - oldestRequest);
      console.log(`[Gemini] Rate limit reached, waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.queue.push(now);
  }
}

const rateLimiter = new GeminiRateLimiter();

export class GeminiService {
  private modelName = 'gemini-2.0-flash';

  /**
   * Generate responses for both prompts in parallel
   */
  async generateComparison(
    promptA: string,
    promptB: string,
    topic?: string
  ): Promise<GeminiGenerationResult> {
    if (!ai) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const startTime = Date.now();

    try {
      // Wait for rate limit slots
      await rateLimiter.waitForSlot();
      await rateLimiter.waitForSlot();

      // Generate both responses in parallel
      const [resultA, resultB] = await Promise.all([
        this.generateSingle(promptA, topic, 'A'),
        this.generateSingle(promptB, topic, 'B'),
      ]);

      const generationTime = Date.now() - startTime;

      console.log(`[Gemini] Generated comparison in ${generationTime}ms`);

      return {
        responseA: resultA,
        responseB: resultB,
        generationTime,
      };
    } catch (error) {
      console.error('[Gemini] Generation error:', error);
      
      // If parallel fails, try sequential with retry
      console.log('[Gemini] Retrying sequentially...');
      return this.generateSequential(promptA, promptB, topic, startTime);
    }
  }

  /**
   * Generate a single response with retry logic
   */
  private async generateSingle(
    prompt: string,
    topic: string | undefined,
    promptId: string,
    attempt: number = 1
  ): Promise<string> {
    if (!ai) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const maxAttempts = 3;

    try {
      const systemPrompt = this.buildSystemPrompt(topic);
      const fullPrompt = `${systemPrompt}\n\nPrompt: ${prompt}`;

      const response = await ai.models.generateContent({
        model: this.modelName,
        contents: fullPrompt,
      });

      const text = response.text;

      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from Gemini');
      }

      console.log(`[Gemini] Generated response for prompt ${promptId} (${text.length} chars)`);
      return text.trim();
    } catch (error: any) {
      console.error(`[Gemini] Error generating prompt ${promptId} (attempt ${attempt}):`, error.message);

      // Categorize error
      const errorType = this.categorizeError(error);

      // Retry logic
      if (attempt < maxAttempts && errorType === 'RATE_LIMIT') {
        const backoffTime = Math.pow(2, attempt) * 1000;
        console.log(`[Gemini] Retrying after ${backoffTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoffTime));
        return this.generateSingle(prompt, topic, promptId, attempt + 1);
      }

      // If it's a safety filter issue, provide helpful message
      if (errorType === 'SAFETY') {
        throw new Error('Content was blocked by safety filters. Please try a different prompt.');
      }

      throw error;
    }
  }

  /**
   * Sequential fallback generation
   */
  private async generateSequential(
    promptA: string,
    promptB: string,
    topic: string | undefined,
    startTime: number
  ): Promise<GeminiGenerationResult> {
    const responseA = await this.generateSingle(promptA, topic, 'A');
    const responseB = await this.generateSingle(promptB, topic, 'B');

    const generationTime = Date.now() - startTime;

    return {
      responseA,
      responseB,
      generationTime,
    };
  }

  /**
   * Build system prompt for fair comparison
   */
  private buildSystemPrompt(topic?: string): string {
    let prompt = `You are a helpful AI assistant participating in a prompt battle competition.

TASK: Generate the best possible response for the given prompt.

RULES:
1. Respond naturally and helpfully as if you received this prompt directly
2. Do not compare, judge, or reference any other prompts
3. Give this prompt your full effort - treat it as a standalone request
4. Be concise but thorough (aim for 150-300 words unless the prompt requests otherwise)
5. Match the tone and style requested in the prompt
6. Be creative, accurate, and engaging`;

    if (topic) {
      prompt += `\n\nCONTEXT: This response is for a battle about "${topic}"`;
    }

    return prompt;
  }

  /**
   * Categorize error type
   */
  private categorizeError(error: any): 'RATE_LIMIT' | 'SAFETY' | 'NETWORK' | 'UNKNOWN' {
    const errorMessage = error.message?.toLowerCase() || '';
    const errorCode = error.code;

    if (errorCode === 429 || errorMessage.includes('rate limit') || errorMessage.includes('quota')) {
      return 'RATE_LIMIT';
    }

    if (errorMessage.includes('safety') || errorMessage.includes('blocked')) {
      return 'SAFETY';
    }

    if (errorMessage.includes('network') || errorMessage.includes('timeout') || errorCode === 'ECONNREFUSED') {
      return 'NETWORK';
    }

    return 'UNKNOWN';
  }
}

// Singleton instance
export const geminiService = new GeminiService();
