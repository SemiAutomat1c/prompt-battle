import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { ErrorCode, APIError } from './types';
import { ValidationError } from './validation';
import { RateLimitError } from './rateLimit';

/**
 * Custom error classes
 */

export class BattleNotFoundError extends Error {
  constructor(battleId: string) {
    super(`Battle with ID ${battleId} does not exist`);
    this.name = 'BattleNotFoundError';
  }
}

export class AlreadyVotedError extends Error {
  constructor() {
    super('You have already voted on this battle');
    this.name = 'AlreadyVotedError';
  }
}

export class GeminiError extends Error {
  constructor(message: string, public originalError?: any) {
    super(message);
    this.name = 'GeminiError';
  }
}

export class InvalidVoteError extends Error {
  constructor() {
    super('Invalid vote value');
    this.name = 'InvalidVoteError';
  }
}

/**
 * Map error to API error response
 */
export function mapErrorToResponse(error: unknown): APIError {
  console.error('[Error]', error);

  // Validation errors
  if (error instanceof ValidationError) {
    return {
      error: {
        code: 'VALIDATION_ERROR',
        message: error.message,
        statusCode: 400,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Rate limit errors
  if (error instanceof RateLimitError) {
    return {
      error: {
        code: 'RATE_LIMIT',
        message: error.message,
        statusCode: 429,
        details: { retryAfter: error.retryAfter },
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Battle not found
  if (error instanceof BattleNotFoundError) {
    return {
      error: {
        code: 'BATTLE_NOT_FOUND',
        message: error.message,
        statusCode: 404,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Already voted
  if (error instanceof AlreadyVotedError) {
    return {
      error: {
        code: 'ALREADY_VOTED',
        message: error.message,
        statusCode: 409,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Invalid vote
  if (error instanceof InvalidVoteError) {
    return {
      error: {
        code: 'INVALID_VOTE',
        message: error.message,
        statusCode: 400,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Gemini errors
  if (error instanceof GeminiError) {
    // Check if it's a safety filter issue
    if (error.message.includes('safety')) {
      return {
        error: {
          code: 'GEMINI_SAFETY',
          message: 'Content was blocked by safety filters. Please try different prompts.',
          statusCode: 422,
          timestamp: new Date().toISOString(),
        },
      };
    }

    return {
      error: {
        code: 'GEMINI_ERROR',
        message: 'Failed to generate AI responses. Please try again.',
        statusCode: 500,
        timestamp: new Date().toISOString(),
      },
    };
  }

  // Generic error
  const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
  
  return {
    error: {
      code: 'INTERNAL_ERROR',
      message: errorMessage,
      statusCode: 500,
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Send error response
 */
export function sendError(res: VercelResponse, error: unknown): void {
  const apiError = mapErrorToResponse(error);
  
  // Add retry-after header for rate limits
  if (apiError.error.code === 'RATE_LIMIT' && apiError.error.details?.retryAfter) {
    res.setHeader('Retry-After', apiError.error.details.retryAfter);
  }

  res.status(apiError.error.statusCode).json(apiError);
}

/**
 * CORS headers
 */
export function setCORSHeaders(res: VercelResponse): void {
  const isDev = process.env.NODE_ENV !== 'production';
  
  res.setHeader(
    'Access-Control-Allow-Origin',
    isDev ? '*' : (process.env.ALLOWED_ORIGIN || '*')
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');
}

/**
 * Handle OPTIONS request
 */
export function handleOptions(req: VercelRequest, res: VercelResponse): boolean {
  if (req.method === 'OPTIONS') {
    setCORSHeaders(res);
    res.status(200).end();
    return true;
  }
  return false;
}

/**
 * Validate HTTP method
 */
export function validateMethod(
  req: VercelRequest,
  res: VercelResponse,
  allowedMethods: string[]
): boolean {
  if (!allowedMethods.includes(req.method || '')) {
    res.status(405).json({
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: `Method ${req.method} not allowed. Allowed methods: ${allowedMethods.join(', ')}`,
        statusCode: 405,
        timestamp: new Date().toISOString(),
      },
    });
    return false;
  }
  return true;
}

/**
 * Parse JSON body safely
 */
export function parseBody<T = any>(req: VercelRequest): T {
  if (req.method === 'GET') {
    return {} as T;
  }

  if (!req.body) {
    throw new ValidationError('Request body is required');
  }

  return req.body as T;
}

/**
 * Log request
 */
export function logRequest(req: VercelRequest, context?: Record<string, any>): void {
  console.log(JSON.stringify({
    level: 'info',
    event: 'request',
    method: req.method,
    url: req.url,
    timestamp: new Date().toISOString(),
    ...context,
  }));
}

/**
 * Log response
 */
export function logResponse(
  req: VercelRequest,
  statusCode: number,
  duration: number,
  context?: Record<string, any>
): void {
  console.log(JSON.stringify({
    level: 'info',
    event: 'response',
    method: req.method,
    url: req.url,
    statusCode,
    duration,
    timestamp: new Date().toISOString(),
    ...context,
  }));
}
