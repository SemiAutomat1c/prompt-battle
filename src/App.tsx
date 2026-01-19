import { useState, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
  HeroSection,
  BattleCreator,
  BattleResults,
  Leaderboard,
  BattleLoadingOverlay,
} from './components';
import { api, type Battle } from './api';
import { EXAMPLE_BATTLES } from './constants';

type AppState = 'idle' | 'creating' | 'viewing';

export default function App() {
  const [state, setState] = useState<AppState>('idle');
  const [currentBattle, setCurrentBattle] = useState<Battle | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Example battle prefill
  const [prefillTask, setPrefillTask] = useState('');
  const [prefillPromptA, setPrefillPromptA] = useState('');
  const [prefillPromptB, setPrefillPromptB] = useState('');

  // Handle example battle selection
  const handleTryExample = useCallback((example: typeof EXAMPLE_BATTLES[0]) => {
    setPrefillTask(example.task);
    setPrefillPromptA(example.promptA.text);
    setPrefillPromptB(example.promptB.text);
    
    // Scroll to creator
    setTimeout(() => {
      document.getElementById('battle-creator')?.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }, 100);

    toast.success(`Loaded "${example.category}" example!`, {
      icon: example.icon,
      style: {
        background: '#1a1a2e',
        color: '#fff',
        border: '1px solid rgba(255,255,255,0.1)',
      },
    });
  }, []);

  // Create a new battle
  const handleCreateBattle = useCallback(async (task: string, promptA: string, promptB: string) => {
    setIsLoading(true);
    setState('creating');

    try {
      const battle = await api.createBattle({
        promptA,
        promptB,
        topic: task,
      });

      setCurrentBattle(battle);
      setHasVoted(false);
      setState('viewing');
      setRefreshTrigger((t) => t + 1);

      toast.success('Battle created! Vote for your favorite.', {
        style: {
          background: '#1a1a2e',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      });

      // Scroll to results
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    } catch (error: any) {
      console.error('Failed to create battle:', error);
      toast.error(error.message || 'Failed to create battle. Please try again.', {
        style: {
          background: '#1a1a2e',
          color: '#fff',
          border: '1px solid rgba(239,68,68,0.3)',
        },
      });
      setState('idle');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cast a vote
  const handleVote = useCallback(async (choice: 'A' | 'B' | 'tie') => {
    if (!currentBattle || hasVoted) return;

    setIsVoting(true);

    try {
      const result = await api.vote(currentBattle.battleId, choice, currentBattle);
      
      // Update battle with new vote counts
      setCurrentBattle((prev) =>
        prev
          ? {
              ...prev,
              votes: result.votes,
            }
          : null
      );
      
      setHasVoted(true);
      setRefreshTrigger((t) => t + 1);

      const voteText = choice === 'tie' ? "It's a tie!" : `Voted for ${choice}!`;
      toast.success(voteText, {
        icon: choice === 'A' ? '🔵' : choice === 'B' ? '🔴' : '🤝',
        style: {
          background: '#1a1a2e',
          color: '#fff',
          border: '1px solid rgba(255,255,255,0.1)',
        },
      });
    } catch (error: any) {
      console.error('Failed to vote:', error);
      
      // Handle "already voted" error gracefully
      if (error.message?.includes('already voted')) {
        setHasVoted(true);
        toast.error("You've already voted on this battle!", {
          style: {
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid rgba(239,68,68,0.3)',
          },
        });
      } else {
        toast.error('Failed to record vote. Please try again.', {
          style: {
            background: '#1a1a2e',
            color: '#fff',
            border: '1px solid rgba(239,68,68,0.3)',
          },
        });
      }
    } finally {
      setIsVoting(false);
    }
  }, [currentBattle, hasVoted]);

  // Start a new battle
  const handleNewBattle = useCallback(() => {
    setState('idle');
    setCurrentBattle(null);
    setHasVoted(false);
    setPrefillTask('');
    setPrefillPromptA('');
    setPrefillPromptB('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Load a specific battle from leaderboard
  const handleSelectBattle = useCallback(async (battleId: string) => {
    try {
      setIsLoading(true);
      const battle = await api.getBattle(battleId);
      setCurrentBattle(battle);
      setHasVoted(false); // Let them vote if they haven't
      setState('viewing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error('Failed to load battle:', error);
      toast.error('Failed to load battle.', {
        style: {
          background: '#1a1a2e',
          color: '#fff',
          border: '1px solid rgba(239,68,68,0.3)',
        },
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-screen">
      <Toaster position="top-center" />

      {/* Loading overlay */}
      <AnimatePresence>
        {state === 'creating' && isLoading && <BattleLoadingOverlay />}
      </AnimatePresence>

      <main className="pb-20">
        {/* Show results if viewing a battle */}
        {state === 'viewing' && currentBattle ? (
          <BattleResults
            battle={currentBattle}
            onVote={handleVote}
            isVoting={isVoting}
            hasVoted={hasVoted}
            onNewBattle={handleNewBattle}
          />
        ) : (
          <>
            {/* Hero section */}
            <HeroSection onTryExample={handleTryExample} />

            {/* Battle creator */}
            <BattleCreator
              onCreateBattle={handleCreateBattle}
              isLoading={isLoading}
              initialTask={prefillTask}
              initialPromptA={prefillPromptA}
              initialPromptB={prefillPromptB}
            />
          </>
        )}

        {/* Leaderboard */}
        <div className="max-w-md mx-auto px-4 mt-12">
          <Leaderboard
            refreshTrigger={refreshTrigger}
            onSelectBattle={handleSelectBattle}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 py-3 bg-battle-darker/80 backdrop-blur-sm border-t border-white/5">
        <div className="text-center text-xs text-gray-500">
          <span>Built with ⚔️ for the SFL Assessment</span>
          <span className="mx-2">•</span>
          <span>Powered by Gemini AI</span>
        </div>
      </footer>
    </div>
  );
}
