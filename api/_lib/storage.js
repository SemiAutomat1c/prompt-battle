// In-memory storage
const battles = new Map();
const voteRecords = new Map();

export function saveBattle(battle) {
  battles.set(battle.battleId, battle);
  voteRecords.set(battle.battleId, []);
}

export function getBattle(battleId) {
  return battles.get(battleId);
}

export function addVote(battleId, vote) {
  const battle = battles.get(battleId);
  if (!battle) return undefined;

  const records = voteRecords.get(battleId) || [];
  records.push(vote);
  voteRecords.set(battleId, records);

  battle.votes[vote.vote]++;
  battles.set(battleId, battle);

  return battle;
}

export function hasVoted(battleId, voterId) {
  const records = voteRecords.get(battleId) || [];
  return records.some(record => record.voterId === voterId);
}

export function getBattles(offset = 0, limit = 20, sortBy = 'recent', filter = 'all') {
  let battleList = Array.from(battles.values())
    .filter(b => b.status === 'completed');

  // Apply filter
  if (filter === 'decided') {
    battleList = battleList.filter(b => {
      const totalVotes = b.votes.A + b.votes.B + b.votes.tie;
      return totalVotes > 0 && b.votes.A !== b.votes.B;
    });
  } else if (filter === 'tied') {
    battleList = battleList.filter(b => {
      const totalVotes = b.votes.A + b.votes.B + b.votes.tie;
      return totalVotes > 0 && b.votes.A === b.votes.B;
    });
  }

  // Sort
  if (sortBy === 'recent') {
    battleList.sort((a, b) => b.metadata.createdAt.localeCompare(a.metadata.createdAt));
  } else if (sortBy === 'popular') {
    battleList.sort((a, b) => {
      const totalA = a.votes.A + a.votes.B + a.votes.tie;
      const totalB = b.votes.A + b.votes.B + b.votes.tie;
      return totalB - totalA;
    });
  }

  const total = battleList.length;
  const paginated = battleList.slice(offset, offset + limit);

  const items = paginated.map(battle => ({
    battleId: battle.battleId,
    promptA: battle.promptA.substring(0, 100),
    promptB: battle.promptB.substring(0, 100),
    topic: battle.topic,
    votes: battle.votes,
    totalVotes: battle.votes.A + battle.votes.B + battle.votes.tie,
    winner: determineWinner(battle.votes),
    createdAt: battle.metadata.createdAt
  }));

  return { battles: items, total };
}

function determineWinner(votes) {
  const total = votes.A + votes.B + votes.tie;
  if (total === 0) return null;
  if (votes.A > votes.B && votes.A > votes.tie) return 'A';
  if (votes.B > votes.A && votes.B > votes.tie) return 'B';
  return 'tie';
}
