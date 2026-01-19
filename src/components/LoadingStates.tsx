import { motion } from 'framer-motion';

export function LoadingSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Task skeleton */}
      <div className="text-center mb-8">
        <div className="skeleton h-4 w-24 mx-auto mb-2 rounded" />
        <div className="skeleton h-8 w-64 mx-auto rounded" />
      </div>

      {/* Results grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6">
        <OutputSkeleton side="A" />
        
        <div className="hidden lg:flex items-center justify-center">
          <div className="w-20 h-20 rounded-full skeleton" />
        </div>

        <OutputSkeleton side="B" />
      </div>
    </div>
  );
}

function OutputSkeleton({ side }: { side: 'A' | 'B' }) {
  const borderColor = side === 'A' ? 'border-l-battle-blue/30' : 'border-l-battle-red/30';
  
  return (
    <div className={`glass p-6 border-l-4 ${borderColor}`}>
      {/* Header skeleton */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full skeleton" />
        <div className="skeleton h-5 w-20 rounded" />
      </div>

      {/* Content skeleton */}
      <div className="space-y-3">
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-3/4 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-5/6 rounded" />
        <div className="skeleton h-4 w-full rounded" />
        <div className="skeleton h-4 w-2/3 rounded" />
      </div>

      {/* Button skeleton */}
      <div className="mt-6">
        <div className="skeleton h-12 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function BattleLoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-battle-dark/80 backdrop-blur-sm z-50 flex items-center justify-center"
    >
      <motion.div
        initial={{ scale: 0.9 }}
        animate={{ scale: 1 }}
        className="glass p-8 text-center max-w-md mx-4"
      >
        {/* Animated swords */}
        <div className="mb-6 relative w-24 h-24 mx-auto">
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-br from-battle-blue via-battle-purple to-battle-red opacity-30"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl">⚔️</span>
          </div>
        </div>

        <h3 className="text-xl font-bold text-white mb-2">
          Generating Battle Outputs
        </h3>
        <p className="text-gray-400 mb-6">
          AI is crafting responses for both prompts...
        </p>

        {/* Simple progress bar */}
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-battle-blue via-battle-purple to-battle-red"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 8, ease: 'easeInOut' }}
          />
        </div>
        
        <p className="text-xs text-gray-500 mt-3">
          This may take up to 10 seconds...
        </p>
      </motion.div>
    </motion.div>
  );
}
