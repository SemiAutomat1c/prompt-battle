import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShimmerButton } from './ui';

interface BattleCreatorProps {
  onCreateBattle: (task: string, promptA: string, promptB: string) => Promise<void>;
  isLoading: boolean;
  initialTask?: string;
  initialPromptA?: string;
  initialPromptB?: string;
}

export function BattleCreator({
  onCreateBattle,
  isLoading,
  initialTask = '',
  initialPromptA = '',
  initialPromptB = '',
}: BattleCreatorProps) {
  const [task, setTask] = useState(initialTask);
  const [promptA, setPromptA] = useState(initialPromptA);
  const [promptB, setPromptB] = useState(initialPromptB);

  // Update state when initial values change (for example battles)
  useEffect(() => {
    if (initialTask) setTask(initialTask);
  }, [initialTask]);

  useEffect(() => {
    if (initialPromptA) setPromptA(initialPromptA);
  }, [initialPromptA]);

  useEffect(() => {
    if (initialPromptB) setPromptB(initialPromptB);
  }, [initialPromptB]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!task.trim() || !promptA.trim() || !promptB.trim()) return;
    await onCreateBattle(task, promptA, promptB);
  };

  const isValid = task.trim() && promptA.trim() && promptB.trim();

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-8"
      id="battle-creator"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Task Input */}
        <div className="glass p-6">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            The Challenge
          </label>
          <input
            type="text"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            placeholder="e.g., Explain quantum computing to a 5-year-old"
            className="input-field"
            disabled={isLoading}
          />
        </div>

        {/* Prompts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Prompt A */}
          <motion.div
            className="glass p-6 border-l-4 border-l-battle-blue"
            whileHover={{ scale: isLoading ? 1 : 1.01 }}
          >
            <label className="flex items-center gap-2 text-sm font-semibold text-battle-blue mb-2">
              <span className="w-6 h-6 rounded-full bg-battle-blue text-white flex items-center justify-center text-xs">
                A
              </span>
              Prompt A
            </label>
            <textarea
              value={promptA}
              onChange={(e) => setPromptA(e.target.value)}
              placeholder="Enter your first prompt..."
              rows={6}
              className="textarea-field"
              disabled={isLoading}
            />
            <div className="mt-2 text-xs text-gray-500 text-right">
              {promptA.length} characters
            </div>
          </motion.div>

          {/* VS Divider (mobile) */}
          <div className="md:hidden flex justify-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-battle-blue to-battle-red flex items-center justify-center text-white font-bold text-lg vs-badge">
              VS
            </div>
          </div>

          {/* Prompt B */}
          <motion.div
            className="glass p-6 border-l-4 border-l-battle-red"
            whileHover={{ scale: isLoading ? 1 : 1.01 }}
          >
            <label className="flex items-center gap-2 text-sm font-semibold text-battle-red mb-2">
              <span className="w-6 h-6 rounded-full bg-battle-red text-white flex items-center justify-center text-xs">
                B
              </span>
              Prompt B
            </label>
            <textarea
              value={promptB}
              onChange={(e) => setPromptB(e.target.value)}
              placeholder="Enter your second prompt..."
              rows={6}
              className="textarea-field"
              disabled={isLoading}
            />
            <div className="mt-2 text-xs text-gray-500 text-right">
              {promptB.length} characters
            </div>
          </motion.div>
        </div>

        {/* Submit Button */}
        <div className="text-center">
          <ShimmerButton
            type="submit"
            disabled={!isValid || isLoading}
            shimmerColor="#60a5fa"
            shimmerSize="0.1em"
            borderRadius="16px"
            background="linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)"
            className="text-lg px-10 py-4 font-bold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                <LoadingSpinner />
                Generating outputs...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="text-2xl">⚔️</span>
                <span>FIGHT!</span>
              </span>
            )}
          </ShimmerButton>
        </div>
      </form>
    </motion.section>
  );
}

function LoadingSpinner() {
  return (
    <svg
      className="animate-spin h-5 w-5"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
