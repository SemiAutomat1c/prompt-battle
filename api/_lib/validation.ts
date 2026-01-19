import { z } from 'zod';
import type { CreateBattleRequest, VoteRequest, ListBattlesQuery } from './types';

/**
 * Validation schemas using Zod
 */

export const createBattleSchema = z.object({
  promptA: z.string()
    .min(10, 'Prompt A must be at least 10 characters')
    .max(2000, 'Prompt A must be at most 2000 characters')
    .trim(),
  promptB: z.string()
    .min(10, 'Prompt B must be at least 10 characters')
    .max(2000, 'Prompt B must be at most 2000 characters')
    .trim(),
  topic: z.string()
    .min(3, 'Topic must be at least 3 characters')
    .max(100, 'Topic must be at most 100 characters')
    .trim()
    .optional(),
  userId: z.string().optional(),
});

export const voteSchema = z.object({
  vote: z.enum(['A', 'B', 'tie'], {
    errorMap: () => ({ message: 'Vote must be "A", "B", or "tie"' }),
  }),
  voterId: z.string().optional(),
});

export const listBattlesQuerySchema = z.object({
  limit: z.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['recent', 'popular', 'controversial']).default('recent'),
  filter: z.enum(['all', 'decided', 'tied']).default('all'),
  offset: z.number().int().min(0).default(0),
});

/**
 * Validation helper functions
 */

export function validateCreateBattle(body: unknown): CreateBattleRequest {
  const result = createBattleSchema.safeParse(body);
  
  if (!result.success) {
    throw new ValidationError(
      result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    );
  }

  const data = result.data;

  // Additional custom validations
  if (data.promptA === data.promptB) {
    throw new ValidationError('Prompts must be different');
  }

  if (calculateSimilarity(data.promptA, data.promptB) > 0.9) {
    throw new ValidationError('Prompts are too similar (>90% match)');
  }

  if (containsHarmfulContent(data.promptA)) {
    throw new ValidationError('Prompt A contains potentially harmful content');
  }

  if (containsHarmfulContent(data.promptB)) {
    throw new ValidationError('Prompt B contains potentially harmful content');
  }

  return data;
}

export function validateVote(body: unknown): VoteRequest {
  const result = voteSchema.safeParse(body);
  
  if (!result.success) {
    throw new ValidationError(
      result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    );
  }

  return result.data;
}

export function validateListBattlesQuery(query: Record<string, any>): ListBattlesQuery {
  // Convert string query params to numbers
  const parsed = {
    limit: query.limit ? parseInt(query.limit, 10) : 20,
    sortBy: query.sortBy || 'recent',
    filter: query.filter || 'all',
    offset: query.offset ? parseInt(query.offset, 10) : 0,
  };

  const result = listBattlesQuerySchema.safeParse(parsed);
  
  if (!result.success) {
    throw new ValidationError(
      result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')
    );
  }

  return result.data;
}

export function validateBattleId(id: string): void {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  
  if (!uuidRegex.test(id)) {
    throw new ValidationError('Invalid battle ID format (must be UUID v4)');
  }
}

/**
 * Content safety checks
 */

const BLOCKED_PATTERNS = [
  // Injection attempts
  /<script[^>]*>.*?<\/script>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  
  // Extreme content (basic)
  /\b(kill|harm|attack|bomb|weapon)\s+(people|person|someone|children)\b/gi,
  
  // Personal info patterns (basic)
  /\b\d{3}-\d{2}-\d{4}\b/g, // SSN pattern
  /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email (if attempting prompt injection)
];

function containsHarmfulContent(text: string): boolean {
  return BLOCKED_PATTERNS.some(pattern => pattern.test(text));
}

/**
 * Calculate text similarity using simple word overlap
 * (Good enough for preventing duplicate submissions)
 */
function calculateSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
}

/**
 * Sanitize text by removing potentially dangerous characters
 */
export function sanitizeText(text: string): string {
  // Remove null bytes and control characters except newlines/tabs
  return text.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Custom validation error
 */
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
