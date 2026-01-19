import { GoogleGenAI } from '@google/genai';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Initialize Gemini client
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

/**
 * Generate responses for both prompts in parallel
 */
export async function generateComparison(promptA, promptB, topic) {
  if (!ai) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const startTime = Date.now();

  const systemPrompt = buildSystemPrompt(topic);

  // Generate both responses in parallel with retry
  const [resultA, resultB] = await Promise.all([
    generateWithRetry(systemPrompt, promptA),
    generateWithRetry(systemPrompt, promptB),
  ]);

  return {
    responseA: resultA,
    responseB: resultB,
    generationTime: Date.now() - startTime,
  };
}

async function generateWithRetry(systemPrompt, prompt, retries = 3) {
  let lastError;
  
  for (let i = 0; i < retries; i++) {
    try {
      return await generateSingle(systemPrompt, prompt);
    } catch (error) {
      lastError = error;
      const errMsg = error.message || '';
      
      // Retry on 503 (overloaded) or 429 (rate limit)
      if (errMsg.includes('503') || errMsg.includes('overloaded') || errMsg.includes('429')) {
        const waitTime = Math.pow(2, i) * 1000; // Exponential backoff: 1s, 2s, 4s
        console.log(`Gemini overloaded, retrying in ${waitTime}ms (attempt ${i + 1}/${retries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // Don't retry other errors
      throw error;
    }
  }
  
  throw lastError;
}

async function generateSingle(systemPrompt, prompt) {
  const fullPrompt = `${systemPrompt}\n\nPrompt: ${prompt}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: fullPrompt,
  });

  const text = response.text;
  if (!text || text.trim().length === 0) {
    throw new Error('Empty response from Gemini');
  }

  return text.trim();
}

function buildSystemPrompt(topic) {
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
