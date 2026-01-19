import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api, type BattleListItem } from '../api';

interface LeaderboardProps {
  refreshTrigger?: number;
  onSelectBattle?: (battleId: string) => void;
}

export function Leaderboard({ refreshTrigger, onSelectBattle }: LeaderboardProps) {
  const [battles, setBattles] = useState<BattleListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'popular'>('recent');

  useEffect(() => {
    loadBattles();
  }, [sortBy, refreshTrigger]);

  const loadBattles = async () => {
    try {
      setLoading(true);
      const response = await api.listBattles(10, sortBy);
      setBattles(response.battles);
    } catch (error) {
      console.error('Failed to load battles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWinnerDisplay = (battle: BattleListItem) => {
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
          {loading ? (
            // Loading skeletons
            [...Array(5)].map((_, i) => (
              <div
                key={`skeleton-${i}`}
                className="skeleton h-16 rounded-lg"
              />
            ))
          ) : battles.length === 0 ? (
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
                  onClick={() => onSelectBattle?.(battle.battleId)}
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

      {/* Refresh button */}
      <button
        onClick={loadBattles}
        disabled={loading}
        className="mt-4 w-full py-2 text-sm text-gray-400 hover:text-white transition-colors"
      >
        {loading ? 'Loading...' : '↻ Refresh'}
      </button>
    </motion.aside>
  );
}
