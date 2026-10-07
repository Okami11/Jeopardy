'use client';

import { useState, useEffect, useRef } from 'react';
import { UseSocketReturn } from '@/hooks/useSocket';
import CountdownTimer from './CountdownTimer';

interface Props {
  socketHook: UseSocketReturn;
  isHost: boolean;
  isPlayer: boolean;
}

export default function ClueCard({ socketHook, isHost, isPlayer }: Props) {
  const {
    gameState, myPlayerId,
    unlockBuzzers, lockBuzzers, buzz, answerResult,
    ddWager, ddAnswerResult, returnToBoard,
  } = socketHook;

  const [wagerInput, setWagerInput] = useState('');
  const [answerRevealed, setAnswerRevealed] = useState(false);

  if (!gameState || !gameState.activeClue) return null;

  const { phase, activeClue, buzzedPlayerId, players, buzzerLockedOut, countdownEnd } = gameState;
  const buzzedPlayer = buzzedPlayerId ? players[buzzedPlayerId] : null;
  const me = myPlayerId ? players[myPlayerId] : null;
  const isBuzzed = buzzedPlayerId === myPlayerId;
  const isDailyDouble = activeClue.isDailyDouble;

  const myMaxWager = me ? Math.max(me.score, isDailyDouble ? me.score : activeClue.value) : 0;
  const ddMaxWager = gameState.ddPlayerId && players[gameState.ddPlayerId]
    ? Math.max(players[gameState.ddPlayerId].score, 1000)
    : activeClue.value;

  function handleBuzz() {
    if (!isBuzzed && !buzzedPlayerId && !buzzerLockedOut && isPlayer) {
      buzz();
    }
  }

  function handleDDWager() {
    const w = parseInt(wagerInput);
    if (isNaN(w) || w < 0 || w > ddMaxWager) return;
    ddWager(w);
    setWagerInput('');
  }

  // Reset answer reveal when clue changes
  useEffect(() => {
    setAnswerRevealed(false);
  }, [activeClue.clueId]);

  const clueTextSize = activeClue.clue.length > 150 ? 'text-xl' : activeClue.clue.length > 80 ? 'text-2xl' : 'text-3xl';

  return (
    <div className="clue-overlay">
      {/* Daily Double reveal */}
      {phase === 'daily_double' && (
        <div className="dd-card p-10 max-w-xl w-full text-center space-y-6">
          <div className="font-display text-6xl font-black text-purple-300 tracking-wider">
            DAILY DOUBLE!
          </div>
          <div className="text-[#c0b0e0]">
            Category: <strong className="text-white">{gameState.roundData?.categories.find(c => c.id === activeClue.categoryId)?.name}</strong>
          </div>

          {/* Wager input — shown to the DD player or host */}
          {(isHost || myPlayerId === gameState.ddPlayerId) && (
            <div className="space-y-3">
              <p className="text-purple-200 text-sm">
                Max wager: <strong>${ddMaxWager.toLocaleString()}</strong>
              </p>
              <div className="flex gap-2">
                <input
                  type="number"
                  className="jeopardy-input text-center text-xl"
                  placeholder={`0 – ${ddMaxWager}`}
                  value={wagerInput}
                  onChange={(e) => setWagerInput(e.target.value)}
                  min={0}
                  max={ddMaxWager}
                  onKeyDown={(e) => e.key === 'Enter' && handleDDWager()}
                />
                <button className="btn-primary whitespace-nowrap" onClick={handleDDWager}>
                  Lock In
                </button>
              </div>
            </div>
          )}
          {!isHost && myPlayerId !== gameState.ddPlayerId && (
            <p className="text-purple-300 animate-pulse">
              {players[gameState.ddPlayerId!]?.name ?? 'A player'} is placing their wager…
            </p>
          )}
        </div>
      )}

      {/* Clue card */}
      {(phase === 'clue' || phase === 'buzzed' || phase === 'answer_reveal') && (
        <div className="clue-card space-y-6">
          {/* Value and category */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <span className="font-display text-3xl font-bold text-yellow-400">
              ${activeClue.value.toLocaleString()}
            </span>
            <span className="text-[#a0b0e0] text-base">
              {gameState.roundData?.categories.find(c => c.id === activeClue.categoryId)?.name}
            </span>
          </div>

          {/* Clue text */}
          <p className={`font-display font-bold text-white leading-snug ${clueTextSize}`}>
            {activeClue.clue}
          </p>

          {/* Timer */}
          {countdownEnd && (phase === 'buzzed') && (
            <CountdownTimer
              endTime={countdownEnd}
              totalMs={8000}
              label={`${buzzedPlayer?.name ?? 'Player'} has 8 seconds!`}
            />
          )}

          {/* Who buzzed */}
          {phase === 'buzzed' && buzzedPlayer && (
            <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl px-5 py-3">
              <span className="text-2xl">{buzzedPlayer.avatar}</span>{' '}
              <strong className="text-yellow-300 font-display text-xl">{buzzedPlayer.name}</strong>{' '}
              <span className="text-yellow-200">buzzed in!</span>
            </div>
          )}

          {/* Answer reveal */}
          {(phase === 'answer_reveal' || (phase === 'clue' && isHost)) && (
            <div className="space-y-3">
              {(answerRevealed || phase === 'answer_reveal') && (
                <div className="bg-green-900/30 border border-green-500/40 rounded-xl px-5 py-3 slide-in">
                  <p className="text-xs text-green-400/70 uppercase tracking-widest mb-1">Correct Answer</p>
                  <p className="text-green-300 font-semibold text-lg">{activeClue.answer}</p>
                </div>
              )}
            </div>
          )}

          {/* Host controls */}
          {isHost && (
            <div className="border-t border-[#2a3caa]/50 pt-4 space-y-3">
              {phase === 'clue' && !buzzedPlayerId && (
                <div className="flex flex-wrap gap-2 justify-center">
                  {buzzerLockedOut ? (
                    <button className="btn-primary" onClick={unlockBuzzers}>
                      🔔 Unlock Buzzers
                    </button>
                  ) : (
                    <button className="btn-secondary" onClick={lockBuzzers}>
                      🔒 Lock Buzzers
                    </button>
                  )}
                  <button
                    className="btn-secondary"
                    onClick={() => setAnswerRevealed(true)}
                  >
                    👁️ Reveal Answer
                  </button>
                  <button className="btn-secondary" onClick={returnToBoard}>
                    ⬅️ Back to Board
                  </button>
                </div>
              )}

              {phase === 'buzzed' && buzzedPlayerId && (
                <div className="flex flex-wrap gap-2 justify-center">
                  <button className="btn-correct" onClick={() => answerResult(buzzedPlayerId, true)}>
                    ✅ Correct
                  </button>
                  <button className="btn-incorrect" onClick={() => answerResult(buzzedPlayerId, false)}>
                    ❌ Incorrect
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={() => setAnswerRevealed(true)}
                  >
                    👁️ Reveal Answer
                  </button>
                </div>
              )}

              {phase === 'answer_reveal' && (
                <div className="flex gap-2 justify-center">
                  <button className="btn-primary" onClick={returnToBoard}>
                    ⬅️ Back to Board
                  </button>
                </div>
              )}

              {/* DD answer buttons shown when clue is visible after DD wager */}
              {isDailyDouble && phase === 'clue' && gameState.ddWager !== null && (
                <div className="flex flex-wrap gap-2 justify-center border-t border-[#2a3caa]/50 pt-3">
                  <p className="w-full text-center text-sm text-purple-300">
                    DD Wager: <strong>${gameState.ddWager?.toLocaleString()}</strong>
                  </p>
                  <button className="btn-correct" onClick={() => ddAnswerResult(true)}>
                    ✅ Correct
                  </button>
                  <button className="btn-incorrect" onClick={() => ddAnswerResult(false)}>
                    ❌ Incorrect
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Player buzzer */}
          {isPlayer && (phase === 'clue' || phase === 'buzzed') && (
            <div className="flex justify-center pt-4">
              {phase === 'buzzed' && isBuzzed ? (
                <div className="text-center">
                  <div className="text-4xl animate-bounce">🎤</div>
                  <p className="text-yellow-300 font-bold mt-2">Your turn! Answer now!</p>
                </div>
              ) : phase === 'buzzed' ? (
                <div className="text-center text-[#6080a0]">
                  <div className="text-3xl">🔒</div>
                  <p className="mt-1 text-sm">{buzzedPlayer?.name} buzzed in</p>
                </div>
              ) : (
                <button
                  className="buzzer-btn"
                  onClick={handleBuzz}
                  disabled={buzzerLockedOut || !!buzzedPlayerId}
                >
                  {buzzerLockedOut ? '🔒' : 'BUZZ!'}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
