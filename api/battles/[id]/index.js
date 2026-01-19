import { getBattle } from '../../_lib/storage.js';

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: { message: 'Method not allowed' } });
  }

  try {
    const battleId = req.query.id;
    const battle = getBattle(battleId);

    if (!battle) {
      // Return 404 - client should handle this gracefully
      return res.status(404).json({ 
        error: { 
          message: 'Battle not found. Battles are stored temporarily and may have expired.', 
          code: 'BATTLE_NOT_FOUND' 
        } 
      });
    }

    return res.status(200).json({
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
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: { message: 'Internal server error' } });
  }
}
