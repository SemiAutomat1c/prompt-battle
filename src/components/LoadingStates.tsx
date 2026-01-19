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
        {/* Animated VS */}
        <motion.div
          className="mb-6"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-battle-blue via-battle-purple to-battle-red flex items-center justify-center">
            <span className="text-3xl font-bold text-white">⚔️</span>
          </div>
        </motion.div>

        <h3 className="text-xl font-bold text-white mb-2">
          Generating Battle Outputs
        </h3>
        <p className="text-gray-400 mb-4">
          AI is crafting responses for both prompts...
        </p>

        {/* Progress indicators */}
        <div className="space-y-3">
          <ProgressItem label="Prompt A" delay={0} />
          <ProgressItem label="Prompt B" delay={0.5} />
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProgressItem({ label, delay }: { label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="flex items-center gap-3"
    >
      <motion.div
        className="w-4 h-4 rounded-full bg-battle-blue"
        animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
        transition={{ duration: 1, repeat: Infinity }}
      />
      <span className="text-sm text-gray-300">{label}</span>
      <motion.span
        className="text-xs text-battle-blue"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: delay + 1 }}
      >
        Processing...
      </motion.span>
    </motion.div>
  );
}
