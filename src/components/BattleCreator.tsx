import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShimmerButton } from './ui';

interface BattleCreatorProps {
  onCreateBattle: (task: string, promptA: string, promptB: string, apiKey?: string) => Promise<void>;
  isLoading: boolean;
  initialTask?: string;
  initialPromptA?: string;
  initialPromptB?: string;
}

const API_KEY_STORAGE_KEY = 'promptbattle_custom_api_key';

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
  const [showSettings, setShowSettings] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    const savedKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  // Save API key to localStorage when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem(API_KEY_STORAGE_KEY, apiKey);
    } else {
      localStorage.removeItem(API_KEY_STORAGE_KEY);
    }
  }, [apiKey]);

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
    await onCreateBattle(task, promptA, promptB, apiKey || undefined);
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

        {/* Settings Panel */}
        <div className="glass p-4">
          <button
            type="button"
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors w-full"
          >
            <svg
              className={`w-4 h-4 transition-transform ${showSettings ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span>⚙️ Settings</span>
            {apiKey && (
              <span className="ml-auto px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                Custom API Key Set
              </span>
            )}
          </button>

          <AnimatePresence>
            {showSettings && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Gemini API Key (Optional)
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                      Provide your own API key to use instead of the default. Get one free at{' '}
                      <a
                        href="https://aistudio.google.com/apikey"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:underline"
                      >
                        Google AI Studio
                      </a>
                    </p>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={showApiKey ? 'text' : 'password'}
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                          placeholder="Enter your Gemini API key..."
                          className="input-field pr-10"
                          disabled={isLoading}
                        />
                        <button
                          type="button"
                          onClick={() => setShowApiKey(!showApiKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                        >
                          {showApiKey ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          )}
                        </button>
                      </div>
                      {apiKey && (
                        <button
                          type="button"
                          onClick={() => setApiKey('')}
                          className="px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center">
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
