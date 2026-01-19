import { randomUUID, createHash } from 'crypto';
import { getBattle, addVote, hasVoted } from '../../_lib/storage.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  try {
    const battleId = req.query.id;
    const { vote, voterId: providedVoterId } = req.body || {};

    // Validate vote
    if (!['A', 'B', 'tie'].includes(vote)) {
      return res.status(400).json({ error: { message: 'Vote must be "A", "B", or "tie"' } });
    }

    // Check battle exists
    const battle = getBattle(battleId);
    if (!battle) {
      return res.status(404).json({ error: { message: 'Battle not found', code: 'BATTLE_NOT_FOUND' } });
    }

    // Get voter ID
    const ip = req.headers['x-forwarded-for']?.split(',')[0] || 'unknown';
    const voterId = providedVoterId || hashIP(ip);

    // Check if already voted
    if (hasVoted(battleId, voterId)) {
      return res.status(409).json({ error: { message: 'Already voted', code: 'ALREADY_VOTED' } });
    }

    // Add vote
    const voteRecord = {
      voteId: randomUUID(),
      battleId,
      vote,
      voterId,
      timestamp: new Date().toISOString(),
    };

    const updatedBattle = addVote(battleId, voteRecord);
    const totalVotes = updatedBattle.votes.A + updatedBattle.votes.B + updatedBattle.votes.tie;

    return res.status(200).json({
      battleId,
      vote,
      votes: updatedBattle.votes,
      totalVotes,
      winner: determineWinner(updatedBattle.votes),
    });
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: { message: 'Internal server error' } });
  }
}

function hashIP(ip) {
  return 'voter_' + createHash('sha256').update(ip + 'promptbattle-salt').digest('hex').slice(0, 16);
}

function determineWinner(votes) {
  const total = votes.A + votes.B + votes.tie;
  if (total === 0) return null;
  if (votes.A > votes.B && votes.A > votes.tie) return 'A';
  if (votes.B > votes.A && votes.B > votes.tie) return 'B';
  return 'tie';
}
