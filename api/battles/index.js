import { randomUUID } from 'crypto';
import { generateComparison } from '../_lib/gemini.js';
import { saveBattle, getBattles } from '../_lib/storage.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    if (req.method === 'POST') {
      return await handleCreate(req, res);
    } else if (req.method === 'GET') {
      return await handleList(req, res);
    } else {
      return res.status(405).json({ error: { message: 'Method not allowed' } });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ 
      error: { 
        message: error.message || 'Internal server error',
        code: 'INTERNAL_ERROR'
      } 
    });
  }
}

async function handleCreate(req, res) {
  const { promptA, promptB, topic, userId } = req.body || {};

  // Validate
  if (!promptA || promptA.length < 10) {
    return res.status(400).json({ error: { message: 'Prompt A must be at least 10 characters' } });
  }
  if (!promptB || promptB.length < 10) {
    return res.status(400).json({ error: { message: 'Prompt B must be at least 10 characters' } });
  }

  const battleId = randomUUID();

  // Generate AI responses
  let geminiResult;
  try {
    geminiResult = await generateComparison(promptA, promptB, topic);
  } catch (error) {
    console.error('Gemini error:', error.message, error);
    const errMsg = error.message || '';
    // Check for rate limit
    if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED')) {
      return res.status(429).json({ 
        error: { 
          message: 'AI rate limit reached. Please wait a moment and try again.',
          code: 'RATE_LIMIT'
        } 
      });
    }
    // Return actual error for debugging
    return res.status(500).json({ 
      error: { 
        message: 'Failed to generate AI responses: ' + errMsg,
        code: 'GEMINI_ERROR'
      } 
    });
  }

  const battle = {
    battleId,
    promptA,
    promptB,
    responseA: geminiResult.responseA,
    responseB: geminiResult.responseB,
    topic: topic || null,
    votes: { A: 0, B: 0, tie: 0 },
    metadata: {
      createdAt: new Date().toISOString(),
      createdBy: userId,
      generationTime: geminiResult.generationTime,
    },
    status: 'completed',
  };

  saveBattle(battle);

  return res.status(201).json({
    battleId: battle.battleId,
    promptA: battle.promptA,
    promptB: battle.promptB,
    responseA: battle.responseA,
    responseB: battle.responseB,
    topic: battle.topic,
    votes: battle.votes,
    createdAt: battle.metadata.createdAt,
    status: battle.status,
  });
}

async function handleList(req, res) {
  const limit = parseInt(req.query.limit) || 20;
  const offset = parseInt(req.query.offset) || 0;
  const sortBy = req.query.sortBy || 'recent';
  const filter = req.query.filter || 'all';

  const { battles, total } = getBattles(offset, limit, sortBy, filter);

  return res.status(200).json({
    battles,
    pagination: {
      offset,
      limit,
      total,
      hasMore: offset + limit < total,
    },
  });
}
