import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID } from 'crypto';
import { storage } from '../_lib/storage';
import { geminiService } from '../_lib/gemini';
import { validateCreateBattle, validateListBattlesQuery, sanitizeText } from '../_lib/validation';
import { enforceRateLimit } from '../_lib/rateLimit';
import {
  sendError,
  setCORSHeaders,
  handleOptions,
  validateMethod,
  parseBody,
  logRequest,
  logResponse,
  GeminiError,
} from '../_lib/errors';
import type { Battle, CreateBattleRequest, CreateBattleResponse, ListBattlesResponse } from '../_lib/types';

/**
 * POST /api/battles - Create a new battle
 * GET /api/battles - List battles
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  
  try {
    setCORSHeaders(res);

    // Handle OPTIONS
    if (handleOptions(req, res)) {
      return;
    }

    // Route based on method
    if (req.method === 'POST') {
      return await handleCreate(req, res, startTime);
    } else if (req.method === 'GET') {
      return await handleList(req, res, startTime);
    } else {
      validateMethod(req, res, ['GET', 'POST']);
    }
  } catch (error) {
    sendError(res, error);
    logResponse(req, 500, Date.now() - startTime, { error: true });
  }
}

/**
 * Handle POST - Create battle
 */
async function handleCreate(
  req: VercelRequest,
  res: VercelResponse,
  startTime: number
): Promise<void> {
  logRequest(req, { endpoint: 'create_battle' });

  // Rate limiting
  enforceRateLimit(req, 'createBattle');

  // Parse and validate body
  const body = parseBody(req);
  const data: CreateBattleRequest = validateCreateBattle(body);

  // Generate battle ID
  const battleId = randomUUID();

  console.log(`[Battle] Creating battle ${battleId}`);

  // Generate responses using Gemini
  let geminiResult;
  try {
    geminiResult = await geminiService.generateComparison(
      data.promptA,
      data.promptB,
      data.topic
    );
  } catch (error: any) {
    throw new GeminiError(error.message, error);
  }

  // Create battle object with sanitized AI responses
  const battle: Battle = {
    battleId,
    promptA: data.promptA,
    promptB: data.promptB,
    responseA: sanitizeText(geminiResult.responseA),
    responseB: sanitizeText(geminiResult.responseB),
    topic: data.topic || null,
    votes: {
      A: 0,
      B: 0,
      tie: 0,
    },
    metadata: {
      createdAt: new Date().toISOString(),
      createdBy: data.userId,
      generationTime: geminiResult.generationTime,
    },
    status: 'completed',
  };

  // Save to storage
  storage.saveBattle(battle);

  // Build response
  const response: CreateBattleResponse = {
    battleId: battle.battleId,
    promptA: battle.promptA,
    promptB: battle.promptB,
    responseA: battle.responseA,
    responseB: battle.responseB,
    topic: battle.topic,
    votes: battle.votes,
    createdAt: battle.metadata.createdAt,
    status: battle.status,
  };

  const duration = Date.now() - startTime;
  logResponse(req, 201, duration, {
    battleId,
    generationTime: geminiResult.generationTime,
  });

  res.status(201).json(response);
}

/**
 * Handle GET - List battles
 */
async function handleList(
  req: VercelRequest,
  res: VercelResponse,
  startTime: number
): Promise<void> {
  logRequest(req, { endpoint: 'list_battles' });

  // Rate limiting
  enforceRateLimit(req, 'listBattles');

  // Validate query params
  const query = validateListBattlesQuery(req.query);

  // Get battles from storage
  const { battles, total } = storage.getBattles(
    query.offset,
    query.limit,
    query.sortBy,
    query.filter
  );

  // Build response
  const response: ListBattlesResponse = {
    battles,
    pagination: {
      offset: query.offset,
      limit: query.limit,
      total,
      hasMore: query.offset + query.limit < total,
    },
  };

  const duration = Date.now() - startTime;
  logResponse(req, 200, duration, {
    count: battles.length,
    total,
    sortBy: query.sortBy,
    filter: query.filter,
  });

  res.status(200).json(response);
}
