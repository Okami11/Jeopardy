'use client';

import { useState } from 'react';
import { UseSocketReturn } from '@/hooks/useSocket';

interface Props {
  socketHook: UseSocketReturn;
  isHost: boolean;
}

export default function LobbyWaitRoom({ socketHook, isHost }: Props) {
  const { gameState, myPlayerId, startRound, startFinalJeopardy } = socketHook;
  const [starting, setStarting] = useState(false);

  if (!gameState) return null;

  const players = Object.values(gameState.players).filter((p) => p.role === 'player');
  const allRound1Used = gameState.usedClues.length >= 25;
  const allRound2Used = gameState.currentRound === 2 && gameState.usedClues.length >= 25;

  function handleStart(round: 1 | 2) {
    setStarting(true);
    startRound(round);
    setTimeout(() => setStarting(false), 2000);
  }

  return (
    <div className="lobby-hero flex flex-col items-center justify-center min-h-screen p-8">
      <div className="relative z-10 w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="font-display text-5xl font-black text-yellow-400 tracking-wider">
            GAME LOBBY
          </h1>
          <p className="text-[#a0b0e0]">Waiting for players to join…</p>
          <div className="inline-block bg-[#1a2580] border border-yellow-400/40 rounded-xl px-6 py-3 mt-2">
            <p className="text-xs text-[#a0b0e0] uppercase tracking-widest">Room Code</p>
            <p className="font-mono text-4xl font-bold text-yellow-400 tracking-widest">
              {gameState.roomCode}
            </p>
            <p className="text-xs text-[#6080a0] mt-1">Share this code with players</p>
          </div>
        </div>

        {/* Players list */}
        <div className="glass-card p-6">
          <h2 className="font-display text-lg font-bold text-[#a0b0e0] uppercase tracking-widest mb-4">
            Players ({players.length})
          </h2>
          {players.length === 0 ? (
            <p className="text-[#4060a0] text-center py-8">No players yet — share the room code!</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {players.map((p) => (
                <div key={p.id} className="flex items-center gap-3 bg-[#1a2580]/50 rounded-xl px-4 py-3 border border-[#2a3caa]">
                  <span className="text-3xl">{p.avatar}</span>
                  <div>
                    <p className="font-bold text-white">{p.name}</p>
                    <p className="text-xs text-[#6080a0]">
                      {p.connected ? '🟢 Connected' : '🔴 Disconnected'}
                    </p>
                  </div>
                  {p.id === myPlayerId && (
                    <span className="ml-auto text-xs text-yellow-400 font-bold">YOU</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Host controls */}
        {isHost && (
          <div className="glass-card p-6 space-y-4">
            <h2 className="font-display text-lg font-bold text-purple-300 uppercase tracking-widest">
              Host Controls
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                className="btn-primary justify-center py-4 text-lg"
                onClick={() => handleStart(1)}
                disabled={starting || players.length === 0}
              >
                ⚔️ Start Round 1
                <span className="block text-xs opacity-70 font-sans mt-0.5">League of Legends</span>
              </button>

              <button
                className="btn-primary justify-center py-4 text-lg"
                onClick={() => handleStart(2)}
                disabled={starting || players.length === 0}
                style={{ background: 'linear-gradient(135deg, #9333ea, #7c3aed)' }}
              >
                🌸 Start Round 2
                <span className="block text-xs opacity-70 font-sans mt-0.5">Anime & Manga</span>
              </button>
            </div>

            <button
              className="w-full py-3 rounded-xl font-bold text-orange-300 border border-orange-500/40 bg-orange-500/10 hover:bg-orange-500/20 transition-all"
              onClick={startFinalJeopardy}
              disabled={starting}
            >
              🎯 Skip to Final Jeopardy
            </button>

            <div className="text-xs text-[#6070a0] text-center">
              Default host password: <code className="text-yellow-400/70">jeopardy-host-2024</code><br />
              Set <code className="text-yellow-400/70">HOST_PASSWORD</code> env var to change it
            </div>
          </div>
        )}

        {!isHost && (
          <div className="text-center text-[#6080a0]">
            <div className="text-4xl animate-bounce">⏳</div>
            <p className="mt-2">Waiting for host to start the game…</p>
          </div>
        )}
      </div>
    </div>
  );
}
