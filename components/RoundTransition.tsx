'use client';

import { UseSocketReturn } from '@/hooks/useSocket';

interface Props {
  socketHook: UseSocketReturn;
  isHost: boolean;
}

export default function RoundTransition({ socketHook, isHost }: Props) {
  const { gameState, startRound, startFinalJeopardy } = socketHook;

  if (!gameState) return null;

  const nextRound = gameState.currentRound === 1 ? 2 : null;
  const isR2Done = gameState.currentRound === 2;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#060818]">
      <div className="text-center space-y-8 p-8 max-w-xl">
        <div className="text-7xl animate-bounce">🎉</div>
        <h1 className="font-display text-5xl font-black text-yellow-400 tracking-wide">
          {gameState.currentRound === 1 ? 'Round 1 Complete!' : 'Round 2 Complete!'}
        </h1>

        {/* Round 1 recap */}
        {gameState.currentRound === 1 && (
          <p className="text-[#a0b0e0] text-lg">
            Get ready for Double Jeopardy — Anime & Manga edition!
          </p>
        )}

        {gameState.currentRound === 2 && (
          <p className="text-[#a0b0e0] text-lg">
            Time for the ultimate challenge — Final Jeopardy!
          </p>
        )}

        {isHost && (
          <div className="space-y-3">
            {nextRound && (
              <button
                className="btn-primary text-xl px-12 py-4 w-full justify-center"
                onClick={() => startRound(nextRound as 1 | 2)}
              >
                🌸 Start Round 2 — Anime & Manga
              </button>
            )}
            {isR2Done && (
              <button
                className="w-full py-4 px-12 rounded-xl font-bold text-xl text-orange-300 border-2 border-orange-500/60 bg-orange-500/10 hover:bg-orange-500/20 transition-all font-display tracking-wide"
                onClick={startFinalJeopardy}
              >
                🎯 Final Jeopardy!
              </button>
            )}
          </div>
        )}

        {!isHost && (
          <p className="text-[#6080a0] animate-pulse">Host is preparing the next round…</p>
        )}
      </div>
    </div>
  );
}
