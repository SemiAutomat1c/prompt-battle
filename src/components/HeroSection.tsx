import { motion } from 'framer-motion';
import { EXAMPLE_BATTLES, UI_COPY } from '../constants';

interface HeroSectionProps {
  onTryExample: (example: typeof EXAMPLE_BATTLES[0]) => void;
}

export function HeroSection({ onTryExample }: HeroSectionProps) {
  return (
    <section className="relative py-12 px-4 overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-battle-blue/10 rounded-full blur-3xl"
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-battle-purple/10 rounded-full blur-3xl"
          animate={{
            x: [0, -30, 0],
            y: [0, 20, 0],
            scale: [1, 1.15, 1],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <h1 className="text-5xl md:text-7xl font-extrabold">
            <span className="text-battle-blue">Prompt</span>
            <span className="text-white">Battle</span>
          </h1>
          <div className="mt-2 text-4xl vs-badge inline-block">⚔️</div>
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-xl md:text-2xl text-gray-300 mb-10"
        >
          {UI_COPY.tagline}
        </motion.p>

        {/* 3-step guide */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
        >
          {[
            { num: 1, icon: '📝', text: 'Submit two prompts for any task' },
            { num: 2, icon: '🤖', text: 'AI generates both outputs' },
            { num: 3, icon: '🗳️', text: 'Community votes on the winner' },
          ].map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
              className="glass p-6"
            >
              <div className="text-3xl mb-3">{step.icon}</div>
              <div className="text-battle-blue font-bold mb-2">Step {step.num}</div>
              <p className="text-gray-300">{step.text}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Example battles */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <h3 className="text-lg font-semibold text-gray-400 mb-4">
            Try an example to see how it works
          </h3>
          <div className="flex flex-wrap justify-center gap-3">
            {EXAMPLE_BATTLES.map((example) => (
              <button
                key={example.id}
                onClick={() => onTryExample(example)}
                className="btn-secondary flex items-center gap-2"
              >
                <span>{example.icon}</span>
                <span>{example.category}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
