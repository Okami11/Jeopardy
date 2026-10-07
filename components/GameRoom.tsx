'use client';

import { useState, useEffect, useRef } from 'react';
import { UseSocketReturn } from '@/hooks/useSocket';
import GameBoard from './GameBoard';
import ClueCard from './ClueCard';
import ScoreBar from './ScoreBar';
import FinalJeopardy from './FinalJeopardy';
import WinnerScreen from './WinnerScreen';
import RoundTransition from './RoundTransition';
import LobbyWaitRoom from './LobbyWaitRoom';

interface Props {
  socketHook: UseSocketReturn;
  isHost: boolean;
}

export default function GameRoom({ socketHook, isHost }: Props) {
  const { gameState, myPlayerId } = socketHook;

  if (!gameState) return null;

  const { phase } = gameState;
  const me = myPlayerId ? gameState.players[myPlayerId] : null;
  const isPlayer = me?.role === 'player';

  // Determine which overlay/screen to show
  if (phase === 'lobby') {
    return <LobbyWaitRoom socketHook={socketHook} isHost={isHost} />;
  }

  if (phase === 'round_transition') {
    return <RoundTransition socketHook={socketHook} isHost={isHost} />;
  }

  if (phase === 'winner') {
    return <WinnerScreen socketHook={socketHook} />;
  }

  if (
    phase === 'final_category' ||
    phase === 'final_wager' ||
    phase === 'final_clue' ||
    phase === 'final_reveal'
  ) {
    return <FinalJeopardy socketHook={socketHook} isHost={isHost} />;
  }

  // Main game view: board + clue overlay
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-[#0d1850] border-b border-[#2a3caa] px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="font-display text-2xl font-bold text-yellow-400">JEOPARDY!</span>
          <span className="text-[#6080c0] text-sm">
            {gameState.currentRound === 1 ? 'Round 1 — League of Legends' : 'Round 2 — Anime & Manga'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs bg-[#1a2580] border border-[#2a3caa] px-3 py-1 rounded-full text-[#a0b0e0]">
            Room: <span className="font-mono font-bold text-yellow-400">{gameState.roomCode}</span>
          </span>
        </div>
      </header>

      {/* Board area */}
      <main className="flex-1 p-4 overflow-auto">
        <GameBoard socketHook={socketHook} isHost={isHost} />
      </main>

      {/* Score bar */}
      <ScoreBar socketHook={socketHook} isHost={isHost} />

      {/* Clue overlay */}
      {(phase === 'clue' || phase === 'daily_double' || phase === 'buzzed' || phase === 'answer_reveal') && (
        <ClueCard socketHook={socketHook} isHost={isHost} isPlayer={isPlayer} />
      )}
    </div>
  );
}
