import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import type { Battle } from '../api';
import { VoteBar } from './VoteBar';
import { VICTORY_THRESHOLDS } from '../constants';
import {
  CardSpotlight,
  TypingAnimation,
  triggerConfetti,
  ShineBorder,
  Sparkles,
  BlurFade,
  BeamConnector,
  ShimmerButton,
} from './ui';

interface BattleResultsProps {
  battle: Battle;
  onVote: (choice: 'A' | 'B' | 'tie') => Promise<void>;
  isVoting: boolean;
  hasVoted: boolean;
  onNewBattle: () => void;
}

export function BattleResults({
  battle,
  onVote,
  isVoting,
  hasVoted,
  onNewBattle,
}: BattleResultsProps) {
  const [showPrompts, setShowPrompts] = useState(false);
  const [copiedA, setCopiedA] = useState(false);
  const [copiedB, setCopiedB] = useState(false);
  const [typingComplete, setTypingComplete] = useState({ A: false, B: false });

  const totalVotes = battle.votes.A + battle.votes.B + battle.votes.tie;
  const percentA = totalVotes > 0 ? (battle.votes.A / totalVotes) * 100 : 50;
  const percentB = totalVotes > 0 ? (battle.votes.B / totalVotes) * 100 : 50;

  // Determine winner and victory level
  const winner =
    battle.votes.A > battle.votes.B
      ? 'A'
      : battle.votes.B > battle.votes.A
      ? 'B'
      : null;

  const winningPercent = winner === 'A' ? percentA : percentB;
  const victoryLevel =
    winningPercent >= VICTORY_THRESHOLDS.DOMINANT * 100
      ? 'DOMINANT'
      : winningPercent >= VICTORY_THRESHOLDS.CLEAR * 100
      ? 'CLEAR'
      : winningPercent >= VICTORY_THRESHOLDS.NARROW * 100
      ? 'NARROW'
      : null;

  // Copy to clipboard with error handling
  const copyToClipboard = async (text: string, side: 'A' | 'B') => {
    try {
      await navigator.clipboard.writeText(text);
      if (side === 'A') {
        setCopiedA(true);
        setTimeout(() => setCopiedA(false), 2000);
      } else {
        setCopiedB(true);
        setTimeout(() => setCopiedB(false), 2000);
      }
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  // Handle vote with confetti
  const handleVote = async (choice: 'A' | 'B' | 'tie') => {
    await onVote(choice);
    // Trigger confetti on successful vote
    triggerConfetti({
      particleCount: 80,
      spread: 100,
      colors: choice === 'A' 
        ? ['#3b82f6', '#60a5fa', '#93c5fd'] 
        : choice === 'B' 
        ? ['#ef4444', '#f87171', '#fca5a5']
        : ['#fbbf24', '#fcd34d', '#fde68a'],
    });
  };

  // Keyboard shortcuts
  useEffect(() => {
    if (hasVoted || isVoting) return;

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '1') handleVote('A');
      if (e.key === '2') handleVote('B');
      if (e.key === '3') handleVote('tie');
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
  }, [hasVoted, isVoting]);

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-6xl mx-auto px-4 py-8"
    >
      {/* Task header */}
      <BlurFade delay={0.1}>
        <div className="text-center mb-8">
          <div className="text-sm text-gray-400 uppercase tracking-wide mb-2">
            The Challenge
          </div>
          <h2 className="text-2xl font-bold text-white">{battle.topic || 'Prompt Battle'}</h2>
        </div>
      </BlurFade>

      {/* Results grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-6 items-start">
        {/* Output A */}
        <OutputCard
          side="A"
          prompt={battle.promptA}
          response={battle.responseA}
          votes={battle.votes.A}
          percent={percentA}
          isWinner={winner === 'A'}
          victoryLevel={winner === 'A' ? victoryLevel : null}
          onVote={() => handleVote('A')}
          onCopy={() => copyToClipboard(battle.promptA, 'A')}
          copied={copiedA}
          hasVoted={hasVoted}
          isVoting={isVoting}
          showPrompt={showPrompts}
          onTypingComplete={() => setTypingComplete(prev => ({ ...prev, A: true }))}
        />

        {/* VS Badge with Animated Beams */}
        <div className="hidden lg:flex flex-col items-center justify-center py-8 gap-4">
          <BeamConnector direction="left" className="w-20" />
          <motion.div
            className="w-20 h-20 rounded-full bg-gradient-to-br from-battle-blue via-battle-purple to-battle-red flex items-center justify-center shadow-2xl relative"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-2xl font-bold text-white">VS</span>
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-battle-blue via-battle-purple to-battle-red opacity-50 blur-md -z-10" />
          </motion.div>
          <BeamConnector direction="right" className="w-20" />
          <div className="mt-2 text-xs text-gray-500 font-mono">
            #{battle.battleId.slice(0, 8)}
          </div>
        </div>

        {/* Output B */}
        <OutputCard
          side="B"
          prompt={battle.promptB}
          response={battle.responseB}
          votes={battle.votes.B}
          percent={percentB}
          isWinner={winner === 'B'}
          victoryLevel={winner === 'B' ? victoryLevel : null}
          onVote={() => handleVote('B')}
          onCopy={() => copyToClipboard(battle.promptB, 'B')}
          copied={copiedB}
          hasVoted={hasVoted}
          isVoting={isVoting}
          showPrompt={showPrompts}
          onTypingComplete={() => setTypingComplete(prev => ({ ...prev, B: true }))}
        />
      </div>

      {/* Mobile VS */}
      <div className="lg:hidden flex justify-center -my-3 relative z-10">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-battle-blue via-battle-purple to-battle-red flex items-center justify-center shadow-xl">
          <span className="text-xl font-bold text-white">VS</span>
        </div>
      </div>

      {/* Vote counts & tie option */}
      {totalVotes > 0 && (
        <BlurFade delay={0.3}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 text-center"
          >
            <div className="text-sm text-gray-400">
              Based on <span className="text-white font-bold">{totalVotes}</span> vote
              {totalVotes !== 1 ? 's' : ''}
            </div>
            {!hasVoted && !isVoting && (
              <button
                onClick={() => handleVote('tie')}
                className="mt-3 text-sm text-gray-500 hover:text-gray-300 underline transition-colors"
              >
                Too close to call (3)
              </button>
            )}
          </motion.div>
        </BlurFade>
      )}

      {/* Toggle prompts visibility */}
      {hasVoted && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-6 text-center"
        >
          <button
            onClick={() => setShowPrompts(!showPrompts)}
            className="btn-secondary text-sm"
          >
            {showPrompts ? 'Hide Prompts' : 'Reveal Prompts'}
          </button>
        </motion.div>
      )}

      {/* New battle button */}
      <div className="mt-8 text-center">
        <ShimmerButton
          onClick={onNewBattle}
          shimmerColor="#a855f7"
          borderRadius="12px"
          background="rgba(139, 92, 246, 0.2)"
          className="px-6 py-3 font-semibold"
        >
          <span className="flex items-center gap-2">
            <span>🔄</span>
            <span>Start New Battle</span>
          </span>
        </ShimmerButton>
      </div>

      {/* Keyboard shortcuts hint */}
      {!hasVoted && (
        <div className="mt-4 text-center text-xs text-gray-600">
          Press <kbd className="px-1 py-0.5 bg-white/10 rounded">1</kbd> or{' '}
          <kbd className="px-1 py-0.5 bg-white/10 rounded">2</kbd> to vote,{' '}
          <kbd className="px-1 py-0.5 bg-white/10 rounded">3</kbd> for tie
        </div>
      )}
    </motion.section>
  );
}

// Output Card Component
interface OutputCardProps {
  side: 'A' | 'B';
  prompt: string;
  response: string;
  votes: number;
  percent: number;
  isWinner: boolean;
  victoryLevel: string | null;
  onVote: () => void;
  onCopy: () => void;
  copied: boolean;
  hasVoted: boolean;
  isVoting: boolean;
  showPrompt: boolean;
  onTypingComplete?: () => void;
}

function OutputCard({
  side,
  prompt,
  response,
  votes,
  percent,
  isWinner,
  victoryLevel,
  onVote,
  onCopy,
  copied,
  hasVoted,
  isVoting,
  showPrompt,
  onTypingComplete,
}: OutputCardProps) {
  const color = side === 'A' ? 'battle-blue' : 'battle-red';
  const colorClass = side === 'A' ? 'text-battle-blue' : 'text-battle-red';
  const bgClass = side === 'A' ? 'bg-battle-blue' : 'bg-battle-red';
  const borderClass = side === 'A' ? 'border-battle-blue' : 'border-battle-red';
  const spotlightColor = side === 'A' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(239, 68, 68, 0.15)';
  const shineColors = side === 'A' 
    ? ['#3b82f6', '#60a5fa', '#3b82f6'] 
    : ['#ef4444', '#f87171', '#ef4444'];

  const cardContent = (
    <motion.div
      className={`glass p-6 relative overflow-hidden ${
        isWinner && hasVoted ? `border-2 ${borderClass}` : ''
      }`}
      whileHover={{ scale: hasVoted ? 1 : 1.01 }}
    >
      {/* Sparkles for winner */}
      {isWinner && hasVoted && (
        <Sparkles 
          color={side === 'A' ? '#3b82f6' : '#ef4444'} 
          count={20}
          size={3}
        />
      )}

      {/* Winner badge with BlurFade */}
      <AnimatePresence>
        {isWinner && hasVoted && victoryLevel && (
          <BlurFade delay={0.2}>
            <div
              className={`absolute top-0 right-0 ${bgClass} text-white text-xs font-bold px-3 py-1 rounded-bl-lg z-10`}
            >
              {victoryLevel === 'DOMINANT' && '👑 '}
              WINNER
            </div>
          </BlurFade>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span
            className={`w-8 h-8 rounded-full ${bgClass} text-white flex items-center justify-center font-bold`}
          >
            {side}
          </span>
          <span className={`font-semibold ${colorClass}`}>Output {side}</span>
        </div>
        <button
          onClick={onCopy}
          className="text-xs text-gray-500 hover:text-white transition-colors"
          title="Copy prompt"
        >
          {copied ? '✓ Copied!' : '📋 Copy'}
        </button>
      </div>

      {/* Prompt (collapsible) */}
      <AnimatePresence>
        {showPrompt && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mb-4 overflow-hidden"
          >
            <div className="text-xs text-gray-400 mb-1">Prompt:</div>
            <div className="text-sm text-gray-300 bg-white/5 p-3 rounded font-mono">
              {prompt}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Response with Typing Animation */}
      <div className="prose prose-invert max-w-none">
        <div className="text-gray-200 text-sm leading-relaxed max-h-80 overflow-y-auto">
          <TypingAnimation 
            text={response} 
            duration={15}
            startDelay={side === 'A' ? 0 : 300}
            onComplete={onTypingComplete}
            className="whitespace-pre-wrap"
          />
        </div>
      </div>

      {/* Vote button */}
      {!hasVoted && (
        <motion.button
          onClick={onVote}
          disabled={isVoting}
          className={`mt-6 w-full py-3 rounded-lg font-semibold transition-all ${
            isVoting
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : `${bgClass} text-white hover:opacity-90`
          }`}
          whileHover={{ scale: isVoting ? 1 : 1.02 }}
          whileTap={{ scale: isVoting ? 1 : 0.98 }}
        >
          {isVoting ? 'Voting...' : `Vote for ${side} (${side === 'A' ? '1' : '2'})`}
        </motion.button>
      )}

      {/* Vote bar */}
      {hasVoted && (
        <div className="mt-6">
          <VoteBar percent={percent} color={color} votes={votes} isWinner={isWinner} />
        </div>
      )}
    </motion.div>
  );

  // Wrap winner card in ShineBorder
  if (isWinner && hasVoted) {
    return (
      <CardSpotlight spotlightColor={spotlightColor}>
        <ShineBorder color={shineColors} duration={2} borderWidth={2}>
          {cardContent}
        </ShineBorder>
      </CardSpotlight>
    );
  }

  return (
    <CardSpotlight spotlightColor={spotlightColor}>
      {cardContent}
    </CardSpotlight>
  );
}
