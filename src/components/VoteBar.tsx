import { motion } from 'framer-motion';
import { NumberTicker } from './ui';

interface VoteBarProps {
  percent: number;
  color: string;
  votes: number;
  isWinner: boolean;
}

export function VoteBar({ percent, color, votes, isWinner }: VoteBarProps) {
  const bgColor = color === 'battle-blue' ? 'bg-battle-blue' : 'bg-battle-red';
  const glowColor =
    color === 'battle-blue'
      ? 'shadow-battle-blue/50'
      : 'shadow-battle-red/50';

  return (
    <div className="space-y-2">
      {/* Percentage and vote count */}
      <div className="flex justify-between items-center text-sm">
        <span className={`font-bold ${isWinner ? 'text-white' : 'text-gray-400'}`}>
          <NumberTicker value={percent} decimalPlaces={1} delay={0.2} />%
        </span>
        <span className="text-gray-500">
          <NumberTicker value={votes} decimalPlaces={0} delay={0.3} /> vote{votes !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Bar container */}
      <div className="h-3 bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${bgColor} ${
            isWinner ? `shadow-lg ${glowColor}` : ''
          }`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
        />
      </div>

      {/* Victory indicator */}
      {isWinner && percent >= 70 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <span className="text-xs text-battle-gold font-semibold">
            Dominant Victory!
          </span>
        </motion.div>
      )}
    </div>
  );
}
