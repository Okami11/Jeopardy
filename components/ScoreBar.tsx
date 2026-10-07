'use client';

import { useState, useEffect, useRef } from 'react';
import { UseSocketReturn } from '@/hooks/useSocket';
import { Player } from '@/lib/gameTypes';

interface Props {
  socketHook: UseSocketReturn;
  isHost: boolean;
}

export default function ScoreBar({ socketHook, isHost }: Props) {
  const { gameState, myPlayerId, adjustScore } = socketHook;
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const prevScores = useRef<Record<string, number>>({});

  if (!gameState) return null;

  const contestants = Object.values(gameState.players).filter((p) => p.role === 'player');

  function handleScoreEdit(playerId: string, currentScore: number) {
    if (!isHost) return;
    setEditingId(playerId);
    setEditValue(String(currentScore));
  }

  function commitEdit(playerId: string) {
    const newScore = parseInt(editValue);
    if (!isNaN(newScore)) {
      socketHook.setScore(playerId, newScore);
    }
    setEditingId(null);
  }

  return (
    <div className="score-bar px-4 py-3 flex-shrink-0">
      <div className="flex gap-3 justify-center flex-wrap max-w-6xl mx-auto">
        {contestants.map((player: Player) => {
          const isBuzzed = gameState.buzzedPlayerId === player.id;
          const isMe = player.id === myPlayerId;
          const negative = player.score < 0;
          const eliminated = player.eliminated;

          return (
            <div
              key={player.id}
              className={`score-card px-4 py-3 min-w-[140px] text-center relative
                ${isBuzzed ? 'buzzed' : ''}
                ${eliminated ? 'opacity-50' : ''}
              `}
            >
              {/* Avatar + name */}
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="text-xl">{player.avatar}</span>
                <span className={`font-bold text-sm truncate max-w-[90px] ${isMe ? 'text-yellow-400' : 'text-white'}`}>
                  {player.name}
                  {isMe && ' (you)'}
                </span>
                {!player.connected && (
                  <span className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0" title="Disconnected" />
                )}
              </div>

              {/* Score */}
              {isHost && editingId === player.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    className="jeopardy-input text-center py-1 text-sm"
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitEdit(player.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                  />
                  <button className="text-green-400 text-sm" onClick={() => commitEdit(player.id)}>✓</button>
                </div>
              ) : (
                <div
                  className={`font-display text-2xl font-bold cursor-${isHost ? 'pointer' : 'default'} score-value
                    ${negative ? 'text-red-400' : 'text-yellow-400'}
                  `}
                  onClick={() => isHost && handleScoreEdit(player.id, player.score)}
                  title={isHost ? 'Click to edit score' : undefined}
                >
                  {negative && '-'}${Math.abs(player.score).toLocaleString()}
                </div>
              )}

              {/* Host quick adjust */}
              {isHost && editingId !== player.id && (
                <div className="flex gap-1 justify-center mt-1">
                  <button
                    className="text-xs text-green-400 hover:text-green-300 bg-green-400/10 rounded px-2 py-0.5"
                    onClick={() => adjustScore(player.id, 200)}
                  >
                    +200
                  </button>
                  <button
                    className="text-xs text-red-400 hover:text-red-300 bg-red-400/10 rounded px-2 py-0.5"
                    onClick={() => adjustScore(player.id, -200)}
                  >
                    -200
                  </button>
                </div>
              )}

              {eliminated && (
                <div className="text-xs text-red-400 mt-1">ELIMINATED</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
