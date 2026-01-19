import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Battle } from '../api';

interface LeaderboardProps {
  refreshTrigger?: number;
  onSelectBattle?: (battle: Battle) => void;
  currentBattle?: Battle | null;
}

interface StoredBattle {
  battleId: string;
  topic: string | null;
  votes: { A: number; B: number; tie: number };
  totalVotes: number;
  winner: 'A' | 'B' | 'tie' | null;
  createdAt: string;
  // Full battle data for restoration
  fullBattle: Battle;
}

// Local storage key
const STORAGE_KEY = 'promptbattle_recent';
const MAX_STORED = 20;

// Get battles from localStorage
function getStoredBattles(): StoredBattle[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Save battle to localStorage
function storeBattle(battle: Battle): void {
  try {
    const battles = getStoredBattles();
    const totalVotes = battle.votes.A + battle.votes.B + battle.votes.tie;
    
    const storedBattle: StoredBattle = {
      battleId: battle.battleId,
      topic: battle.topic,
      votes: battle.votes,
      totalVotes,
      winner: determineWinner(battle.votes, totalVotes),
      createdAt: battle.createdAt,
      fullBattle: battle,
    };
    
    // Remove existing entry if present
    const filtered = battles.filter(b => b.battleId !== battle.battleId);
    
    // Add to front, limit size
    const updated = [storedBattle, ...filtered].slice(0, MAX_STORED);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to store battle:', e);
  }
}

function determineWinner(votes: { A: number; B: number; tie: number }, total: number): 'A' | 'B' | 'tie' | null {
  if (total === 0) return null;
  if (votes.A > votes.B && votes.A > votes.tie) return 'A';
  if (votes.B > votes.A && votes.B > votes.tie) return 'B';
  return 'tie';
}

export function Leaderboard({ refreshTrigger, onSelectBattle, currentBattle }: LeaderboardProps) {
  const [battles, setBattles] = useState<StoredBattle[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  // Store current battle when it changes
  useEffect(() => {
    if (currentBattle) {
      storeBattle(currentBattle);
    }
  }, [currentBattle, refreshTrigger]);

  // Load battles from localStorage
  useEffect(() => {
    const stored = getStoredBattles();
    
    // Sort
    const sorted = [...stored].sort((a, b) => {
      if (sortBy === 'popular') {
        return b.totalVotes - a.totalVotes;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    setBattles(sorted);
  }, [sortBy, refreshTrigger, currentBattle]);

  const getWinnerDisplay = (battle: StoredBattle) => {
    if (!battle.winner || battle.totalVotes === 0) {
      return { text: 'No votes yet', color: 'text-gray-500' };
    }
    if (battle.winner === 'tie') {
      return { text: 'Tied', color: 'text-battle-purple' };
    }
    const percent =
      battle.winner === 'A'
        ? (battle.votes.A / battle.totalVotes) * 100
        : (battle.votes.B / battle.totalVotes) * 100;
    return {
      text: `${battle.winner} wins (${percent.toFixed(0)}%)`,
      color: battle.winner === 'A' ? 'text-battle-blue' : 'text-battle-red',
    };
  };

  return (
    <motion.aside
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="glass p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <span>🏆</span>
          <span>Recent Battles</span>
        </h3>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'recent' | 'popular')}
          className="text-xs bg-white/10 border border-white/20 rounded px-2 py-1 text-gray-300"
        >
          <option value="recent">Most Recent</option>
          <option value="popular">Most Votes</option>
        </select>
      </div>

      {/* Battle list */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {battles.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500"
            >
              <div className="text-3xl mb-2">⚔️</div>
              <div>No battles yet.</div>
              <div className="text-sm">Be the first to compete!</div>
            </motion.div>
          ) : (
            battles.map((battle, index) => {
              const winner = getWinnerDisplay(battle);
              return (
                <motion.button
                  key={battle.battleId}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onSelectBattle?.(battle.fullBattle)}
                  className="w-full text-left p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  {/* Topic */}
                  <div className="text-sm font-medium text-white truncate mb-1">
                    {battle.topic || 'Prompt Battle'}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-xs">
                    <span className={winner.color}>{winner.text}</span>
                    <span className="text-gray-500">
                      {battle.totalVotes} vote{battle.totalVotes !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Vote bar preview */}
                  {battle.totalVotes > 0 && (
                    <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-battle-blue"
                        style={{
                          width: `${(battle.votes.A / battle.totalVotes) * 100}%`,
                        }}
                      />
                      <div
                        className="h-full bg-battle-red"
                        style={{
                          width: `${(battle.votes.B / battle.totalVotes) * 100}%`,
                        }}
                      />
                    </div>
                  )}
                </motion.button>
              );
            })
          )}
        </AnimatePresence>
      </div>

      {/* Info text */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        Battles stored locally in your browser
      </div>
    </motion.aside>
  );
}
