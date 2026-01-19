import type { VercelRequest, VercelResponse } from '@vercel/node';
import { storage } from '../../_lib/storage';
import { validateBattleId } from '../../_lib/validation';
import { enforceRateLimit } from '../../_lib/rateLimit';
import {
  sendError,
  setCORSHeaders,
  handleOptions,
  validateMethod,
  logRequest,
  logResponse,
  BattleNotFoundError,
} from '../../_lib/errors';
import type { Battle } from '../../_lib/types';

/**
 * GET /api/battles/[id] - Get specific battle
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  
  try {
    setCORSHeaders(res);

    // Handle OPTIONS
    if (handleOptions(req, res)) {
      return;
    }

    // Only allow GET
    if (!validateMethod(req, res, ['GET'])) {
      return;
    }

    logRequest(req, { endpoint: 'get_battle' });

    // Rate limiting
    enforceRateLimit(req, 'getBattle');

    // Extract battle ID from URL
    const battleId = req.query.id as string;

    // Validate battle ID format
    validateBattleId(battleId);

    // Get battle from storage
    const battle = storage.getBattle(battleId);

    if (!battle) {
      throw new BattleNotFoundError(battleId);
    }

    // Build response (same as Battle but ensure full details)
    const response: Battle = {
      battleId: battle.battleId,
      promptA: battle.promptA,
      promptB: battle.promptB,
      responseA: battle.responseA,
      responseB: battle.responseB,
      topic: battle.topic,
      votes: battle.votes,
      metadata: battle.metadata,
      status: battle.status,
      error: battle.error,
    };

    const duration = Date.now() - startTime;
    logResponse(req, 200, duration, { battleId });

    res.status(200).json(response);
  } catch (error) {
    sendError(res, error);
    logResponse(req, 500, Date.now() - startTime, { error: true });
  }
}
