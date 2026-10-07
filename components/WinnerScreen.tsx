'use client';

import { useEffect, useState } from 'react';
import { UseSocketReturn } from '@/hooks/useSocket';
import { Player } from '@/lib/gameTypes';

interface Props {
  socketHook: UseSocketReturn;
}

export default function WinnerScreen({ socketHook }: Props) {
  const { gameState, resetGame, myPlayerId } = socketHook;
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!gameState) return null;

  const isHost = gameState.hostId === myPlayerId;
  const contestants = Object.values(gameState.players).filter((p) => p.role === 'player');
  
  // Sort by score descending
  const sorted = [...contestants].sort((a, b) => b.score - a.score);
  
  const winner = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  return (
    <div className="min-h-screen fj-background flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Confetti */}
      {showConfetti && [...Array(100)].map((_, i) => (
        <div
          key={i}
          className="confetti-piece"
          style={{
            left: Math.random() * 100 + 'vw',
            backgroundColor: ['#f5c518', '#22c55e', '#3b82f6', '#ef4444', '#a855f7'][Math.floor(Math.random() * 5)],
            animationDuration: (Math.random() * 3 + 2) + 's',
            animationDelay: (Math.random() * 2) + 's',
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-4xl space-y-12 text-center">
        <h1 className="fj-title text-5xl md:text-7xl">GAME OVER!</h1>

        {/* Podium */}
        <div className="flex items-end justify-center gap-4 md:gap-8 h-64 mt-12">
          {/* 2nd Place */}
          {second && (
            <div className="flex flex-col items-center slide-in" style={{ animationDelay: '0.6s' }}>
              <div className="text-4xl mb-2">{second.avatar}</div>
              <div className="font-bold text-white text-xl">{second.name}</div>
              <div className="text-yellow-400 font-display text-2xl font-bold mb-4">${second.score.toLocaleString()}</div>
              <div className="w-24 md:w-32 bg-gradient-to-b from-[#c0c0c0] to-[#808080] h-32 rounded-t-lg flex items-center justify-center text-4xl font-display font-bold text-white/50 border-t-4 border-[#e0e0e0]">
                2
              </div>
            </div>
          )}

          {/* 1st Place */}
          {winner && (
            <div className="flex flex-col items-center slide-in" style={{ animationDelay: '1.2s' }}>
              <div className="text-5xl mb-2 animate-bounce">👑</div>
              <div className="text-5xl mb-2">{winner.avatar}</div>
              <div className="font-bold text-white text-2xl">{winner.name}</div>
              <div className="text-yellow-400 font-display text-4xl font-bold mb-4">${winner.score.toLocaleString()}</div>
              <div className="w-28 md:w-40 bg-gradient-to-b from-[#f5c518] to-[#d4a00e] h-48 rounded-t-lg flex items-center justify-center text-6xl font-display font-bold text-white/50 border-t-4 border-[#fff8e1] shadow-[0_0_40px_rgba(245,197,24,0.5)]">
                1
              </div>
            </div>
          )}

          {/* 3rd Place */}
          {third && (
            <div className="flex flex-col items-center slide-in" style={{ animationDelay: '0.2s' }}>
              <div className="text-3xl mb-2">{third.avatar}</div>
              <div className="font-bold text-white text-lg">{third.name}</div>
              <div className="text-yellow-400 font-display text-xl font-bold mb-4">${third.score.toLocaleString()}</div>
              <div className="w-24 md:w-32 bg-gradient-to-b from-[#cd7f32] to-[#8b5a2b] h-20 rounded-t-lg flex items-center justify-center text-3xl font-display font-bold text-white/50 border-t-4 border-[#e6a87c]">
                3
              </div>
            </div>
          )}
        </div>

        {/* Other players */}
        {sorted.length > 3 && (
          <div className="glass-card p-6 inline-block slide-in" style={{ animationDelay: '1.5s' }}>
            <h3 className="text-[#a0b0e0] uppercase tracking-widest text-sm font-bold mb-3">Honorable Mentions</h3>
            <div className="flex flex-wrap justify-center gap-6">
              {sorted.slice(3).map(p => (
                <div key={p.id} className="text-center">
                  <span className="text-2xl mr-2">{p.avatar}</span>
                  <span className="text-white font-bold">{p.name}</span>
                  <span className="ml-2 text-yellow-400/80 font-display">${p.score.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {isHost && (
          <div className="pt-8">
            <button className="btn-primary py-3 px-8 text-lg" onClick={resetGame}>
              🔄 Play Again (Reset Room)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
