import type { VercelRequest, VercelResponse } from '@vercel/node';
import { randomUUID, createHash } from 'crypto';
import { storage } from '../../_lib/storage';
import { validateBattleId, validateVote } from '../../_lib/validation';
import { enforceRateLimit, getClientIP } from '../../_lib/rateLimit';
import {
  sendError,
  setCORSHeaders,
  handleOptions,
  validateMethod,
  parseBody,
  logRequest,
  logResponse,
  BattleNotFoundError,
  AlreadyVotedError,
} from '../../_lib/errors';
import type { VoteRequest, VoteResponse, VoteRecord } from '../../_lib/types';

/**
 * POST /api/battles/[id]/vote - Cast a vote
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  
  try {
    setCORSHeaders(res);

    // Handle OPTIONS
    if (handleOptions(req, res)) {
      return;
    }

    // Only allow POST
    if (!validateMethod(req, res, ['POST'])) {
      return;
    }

    logRequest(req, { endpoint: 'vote' });

    // Rate limiting
    enforceRateLimit(req, 'vote');

    // Extract battle ID from URL
    const battleId = req.query.id as string;

    // Validate battle ID format
    validateBattleId(battleId);

    // Check if battle exists
    const battle = storage.getBattle(battleId);
    if (!battle) {
      throw new BattleNotFoundError(battleId);
    }

    // Parse and validate vote
    const body = parseBody(req);
    const data: VoteRequest = validateVote(body);

    // Determine voter ID (use provided voterId or hash of IP)
    const voterId = data.voterId || hashIP(getClientIP(req));

    // Check if already voted (optional - can be disabled)
    if (storage.hasVoted(battleId, voterId)) {
      throw new AlreadyVotedError();
    }

    // Create vote record
    const voteRecord: VoteRecord = {
      voteId: randomUUID(),
      battleId,
      vote: data.vote,
      voterId,
      timestamp: new Date().toISOString(),
    };

    // Add vote to storage
    const updatedBattle = storage.addVote(battleId, voteRecord);

    if (!updatedBattle) {
      throw new BattleNotFoundError(battleId);
    }

    // Calculate totals and winner
    const totalVotes = updatedBattle.votes.A + updatedBattle.votes.B + updatedBattle.votes.tie;
    const winner = determineWinner(updatedBattle.votes);

    // Build response
    const response: VoteResponse = {
      battleId,
      vote: data.vote,
      votes: updatedBattle.votes,
      totalVotes,
      winner,
    };

    const duration = Date.now() - startTime;
    logResponse(req, 200, duration, {
      battleId,
      vote: data.vote,
      totalVotes,
    });

    res.status(200).json(response);
  } catch (error) {
    sendError(res, error);
    logResponse(req, 500, Date.now() - startTime, { error: true });
  }
}

/**
 * Hash IP for anonymous voter tracking using cryptographic hash
 */
function hashIP(ip: string): string {
  const hash = createHash('sha256')
    .update(ip + (process.env.VOTER_SALT || 'promptbattle-salt'))
    .digest('hex')
    .slice(0, 16);
  return `voter_${hash}`;
}

/**
 * Determine winner based on votes
 */
function determineWinner(votes: { A: number; B: number; tie: number }): 'A' | 'B' | 'tie' | null {
  const totalVotes = votes.A + votes.B + votes.tie;
  if (totalVotes === 0) return null;
  
  if (votes.A > votes.B && votes.A > votes.tie) return 'A';
  if (votes.B > votes.A && votes.B > votes.tie) return 'B';
  if (votes.tie > votes.A && votes.tie > votes.B) return 'tie';
  
  return 'tie'; // Any other tie scenario
}
