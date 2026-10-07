'use client';

import { useState, useEffect } from 'react';
import { UseSocketReturn } from '@/hooks/useSocket';
import { Player } from '@/lib/gameTypes';
import CountdownTimer from './CountdownTimer';

interface Props {
  socketHook: UseSocketReturn;
  isHost: boolean;
}

export default function FinalJeopardy({ socketHook, isHost }: Props) {
  const {
    gameState, myPlayerId,
    startFinalWager, fjWager, revealFinalClue, fjAnswer,
    startFinalReveal, advanceFJReveal,
  } = socketHook;

  const [wagerInput, setWagerInput] = useState('');
  const [answerInput, setAnswerInput] = useState('');
  const [wagerLocked, setWagerLocked] = useState(false);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);

  if (!gameState) return null;

  const { phase, players, fjData, fjRevealOrder, fjCurrentRevealIdx, fjRevealStep } = gameState;
  const me = myPlayerId ? players[myPlayerId] : null;
  const isPlayer = me?.role === 'player';
  const contestants = Object.values(players).filter((p) => p.role === 'player');
  const activeContestants = contestants.filter((p) => !p.eliminated);

  // Wager calculations
  const myMaxWager = me ? Math.max(me.score, me.score < 1000 ? 1000 : me.score) : 0;
  const allWagersIn = activeContestants.every((p) => p.fjWagerLocked);
  const allAnswersIn = activeContestants.every((p) => p.fjAnswerSubmitted);

  // Current reveal player
  const revealPlayerId = fjRevealOrder[fjCurrentRevealIdx] ?? null;
  const revealPlayer = revealPlayerId ? players[revealPlayerId] : null;

  // ─── Phase: Category Reveal ─────────────────────────────────
  if (phase === 'final_category') {
    return (
      <div className="fj-background min-h-screen flex flex-col items-center justify-center p-8 space-y-10">
        {/* Stars background */}
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-white"
              style={{
                width: Math.random() * 3 + 1 + 'px',
                height: Math.random() * 3 + 1 + 'px',
                top: Math.random() * 100 + '%',
                left: Math.random() * 100 + '%',
                opacity: Math.random() * 0.7 + 0.1,
                animation: `twinkle ${Math.random() * 3 + 2}s ease infinite alternate`,
              }}
            />
          ))}
        </div>

        <div className="relative z-10 text-center space-y-6">
          <p className="text-orange-300 font-display text-xl tracking-widest uppercase">
            And now…
          </p>
          <h1 className="fj-title">FINAL JEOPARDY!</h1>

          {/* Category reveal */}
          {fjData && (
            <div className="mt-8 animate-pulse">
              <p className="text-[#a0b0e0] text-sm uppercase tracking-widest mb-3">Tonight&apos;s Category</p>
              <div className="bg-[#1a0a3d] border-2 border-orange-500/60 rounded-2xl px-10 py-6">
                <p className="font-display text-3xl font-bold text-orange-300">
                  {fjData.category}
                </p>
              </div>
            </div>
          )}

          {/* Eliminated players */}
          {contestants.filter((p) => p.eliminated).length > 0 && (
            <div className="text-sm text-red-400/70">
              Eliminated (score ≤ $0):{' '}
              {contestants.filter((p) => p.eliminated).map((p) => p.name).join(', ')}
            </div>
          )}

          {/* Host: proceed to wagers */}
          {isHost && (
            <button className="btn-primary text-xl px-12 py-4" onClick={startFinalWager}>
              💰 Open Wagers
            </button>
          )}
          {!isHost && (
            <p className="text-[#6080a0] animate-pulse">Host will open wagers shortly…</p>
          )}
        </div>
      </div>
    );
  }

  // ─── Phase: Wagers ──────────────────────────────────────────
  if (phase === 'final_wager') {
    const myWagerMax = me ? (me.score > 0 ? me.score : 1000) : 0;

    return (
      <div className="fj-background min-h-screen flex flex-col items-center justify-center p-8">
        <div className="relative z-10 w-full max-w-2xl space-y-6">
          <div className="text-center">
            <h2 className="fj-title text-4xl">Place Your Wagers</h2>
            <p className="text-[#a0b0e0] mt-2">Wagers are secret until the reveal</p>
          </div>

          {/* Player wager form */}
          {isPlayer && !me?.eliminated && (
            <div className="glass-card p-6 space-y-4 slide-in">
              <div className="flex items-center justify-between">
                <span className="font-display text-lg text-white">Your Score: </span>
                <span className="font-display text-2xl font-bold text-yellow-400">
                  ${me?.score?.toLocaleString()}
                </span>
              </div>

              {!wagerLocked ? (
                <>
                  <div>
                    <label className="block text-sm text-[#a0b0e0] mb-2">
                      Wager (max: ${myWagerMax.toLocaleString()})
                    </label>
                    <input
                      type="range"
                      min={0}
                      max={myWagerMax}
                      value={parseInt(wagerInput) || 0}
                      onChange={(e) => setWagerInput(e.target.value)}
                      className="w-full accent-yellow-400"
                    />
                    <div className="flex justify-between text-xs text-[#6080a0] mt-1">
                      <span>$0</span>
                      <span className="text-yellow-400 font-bold text-base">
                        ${parseInt(wagerInput) || 0}
                      </span>
                      <span>${myWagerMax.toLocaleString()}</span>
                    </div>
                    <input
                      type="number"
                      className="jeopardy-input mt-2 text-center text-xl"
                      placeholder="Or type amount"
                      value={wagerInput}
                      onChange={(e) => setWagerInput(e.target.value)}
                      min={0}
                      max={myWagerMax}
                    />
                  </div>
                  <button
                    className="btn-primary w-full justify-center py-4 text-lg"
                    onClick={() => {
                      const w = parseInt(wagerInput) || 0;
                      fjWager(Math.max(0, Math.min(w, myWagerMax)));
                      setWagerLocked(true);
                    }}
                    disabled={!wagerInput}
                  >
                    🔒 Lock In Wager
                  </button>
                </>
              ) : (
                <div className="text-center py-6 space-y-2">
                  <div className="text-5xl">✅</div>
                  <p className="text-green-400 font-bold text-lg">Wager Locked!</p>
                  <p className="text-[#6080a0] text-sm">Waiting for others…</p>
                </div>
              )}
            </div>
          )}

          {me?.eliminated && (
            <div className="glass-card p-6 text-center text-red-400">
              <div className="text-4xl mb-2">❌</div>
              <p className="font-bold">You've been eliminated</p>
              <p className="text-sm text-red-400/70">Score was $0 or below at Final Jeopardy</p>
            </div>
          )}

          {/* Status for all players */}
          <div className="glass-card p-4 space-y-2">
            <h3 className="font-display text-sm uppercase tracking-widest text-[#a0b0e0] mb-3">Wager Status</h3>
            {activeContestants.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-[#2a3caa]/30 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{p.avatar}</span>
                  <span className="text-white font-semibold">{p.name}</span>
                </div>
                <span className={`text-sm font-bold ${p.fjWagerLocked ? 'text-green-400' : 'text-yellow-400/50 animate-pulse'}`}>
                  {p.fjWagerLocked ? '🔒 Locked In' : '⏳ Thinking…'}
                </span>
              </div>
            ))}
          </div>

          {/* Host: force start */}
          {isHost && (
            <div className="space-y-2">
              <button
                className="btn-primary w-full justify-center py-3 text-lg"
                onClick={revealFinalClue}
                disabled={!allWagersIn}
              >
                {allWagersIn ? '📜 Reveal Final Clue!' : `Waiting for ${activeContestants.filter(p => !p.fjWagerLocked).length} wager(s)…`}
              </button>
              {!allWagersIn && (
                <button
                  className="btn-secondary w-full justify-center"
                  onClick={revealFinalClue}
                >
                  ⚡ Force Start (skip waiting)
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ─── Phase: Clue + 30-second timer ─────────────────────────
  if (phase === 'final_clue') {
    return (
      <div className="fj-background min-h-screen flex flex-col items-center justify-center p-8">
        <div className="relative z-10 w-full max-w-3xl space-y-6">
          {/* Category */}
          <div className="text-center">
            <p className="text-orange-300 font-display text-lg uppercase tracking-widest">{fjData?.category}</p>
          </div>

          {/* Clue */}
          <div className="clue-card" style={{ border: '4px solid #f97316' }}>
            <p className="font-display text-3xl font-bold text-white leading-snug">
              {fjData?.clue}
            </p>
          </div>

          {/* Countdown */}
          {gameState.countdownEnd && (
            <div className="flex justify-center">
              <CountdownTimer
                endTime={gameState.countdownEnd}
                totalMs={30000}
                label="Final Jeopardy — 30 seconds!"
              />
            </div>
          )}

          {/* Player answer input */}
          {isPlayer && !me?.eliminated && (
            <div className="glass-card p-5 space-y-3 slide-in">
              {!answerSubmitted ? (
                <>
                  <label className="block text-sm text-[#a0b0e0]">
                    Your answer (submit before time runs out!)
                  </label>
                  <textarea
                    className="jeopardy-input min-h-[80px] resize-none"
                    placeholder="What is…?"
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    maxLength={200}
                  />
                  <button
                    className="btn-primary w-full justify-center"
                    onClick={() => {
                      fjAnswer(answerInput);
                      setAnswerSubmitted(true);
                    }}
                    disabled={!answerInput.trim()}
                  >
                    ✅ Submit Answer
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-green-400 font-bold">Answer submitted!</p>
                  <p className="text-sm text-[#6080a0] mt-1 italic">{answerInput}</p>
                </div>
              )}
            </div>
          )}

          {/* Answer status */}
          <div className="glass-card p-4 space-y-2">
            {activeContestants.map((p) => (
              <div key={p.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>{p.avatar}</span>
                  <span className="text-white font-semibold">{p.name}</span>
                </div>
                <span className={`text-sm ${p.fjAnswerSubmitted ? 'text-green-400' : 'text-yellow-400/50 animate-pulse'}`}>
                  {p.fjAnswerSubmitted ? '✅ Submitted' : '✏️ Writing…'}
                </span>
              </div>
            ))}
          </div>

          {/* Host: start reveal */}
          {isHost && (
            <button
              className="btn-primary w-full justify-center py-3 text-lg"
              onClick={startFinalReveal}
            >
              🎬 Start Dramatic Reveal
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── Phase: Dramatic Reveal ─────────────────────────────────
  if (phase === 'final_reveal') {
    return (
      <div className="fj-background min-h-screen flex flex-col items-center justify-center p-8">
        <div className="relative z-10 w-full max-w-2xl space-y-6">
          <h2 className="font-display text-4xl font-bold text-center text-orange-300">
            The Reveal…
          </h2>

          {/* Correct answer (always shown during reveal) */}
          <div className="bg-green-900/20 border border-green-500/30 rounded-xl px-6 py-4 text-center">
            <p className="text-xs text-green-400/70 uppercase tracking-widest mb-1">Correct Answer</p>
            <p className="text-green-300 font-semibold text-lg">{fjData?.answer}</p>
          </div>

          {/* Current player reveal card */}
          {revealPlayer && (
            <div className="glass-card p-6 space-y-5 slide-in" style={{ border: '2px solid #f97316' }}>
              <div className="flex items-center gap-3">
                <span className="text-4xl">{revealPlayer.avatar}</span>
                <div>
                  <p className="font-display text-2xl font-bold text-white">{revealPlayer.name}</p>
                  <p className="text-[#a0b0e0] text-sm">
                    Starting score: ${(revealPlayer.score).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Step 1: Answer */}
              {(fjRevealStep === 'answer' || fjRevealStep === 'correct_incorrect' || fjRevealStep === 'wager') && (
                <div className="bg-[#1a2580] rounded-xl px-5 py-4 slide-in">
                  <p className="text-xs text-[#a0b0e0] uppercase tracking-widest mb-1">Their Answer</p>
                  <p className="text-white text-xl font-semibold italic">
                    &ldquo;{revealPlayer.fjAnswer || '(no answer)'}&rdquo;
                  </p>
                </div>
              )}

              {/* Step 2: Correct/Incorrect */}
              {(fjRevealStep === 'correct_incorrect' || fjRevealStep === 'wager') && (
                <div className={`rounded-xl px-5 py-4 text-center slide-in ${
                  revealPlayer.fjCorrect
                    ? 'bg-green-900/30 border border-green-500/40'
                    : 'bg-red-900/30 border border-red-500/40'
                }`}>
                  <span className="text-3xl">{revealPlayer.fjCorrect ? '✅' : '❌'}</span>
                  <p className={`font-display text-xl font-bold mt-1 ${
                    revealPlayer.fjCorrect ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {revealPlayer.fjCorrect ? 'CORRECT!' : 'INCORRECT'}
                  </p>
                </div>
              )}

              {/* Step 3: Wager + score */}
              {fjRevealStep === 'wager' && (
                <div className="text-center slide-in space-y-2">
                  <p className="text-[#a0b0e0] text-sm">Wager: </p>
                  <p className="font-display text-4xl font-bold text-orange-300">
                    ${revealPlayer.fjWager?.toLocaleString()}
                  </p>
                  <p className="text-[#a0b0e0] text-sm">Final Score:</p>
                  <p className={`font-display text-5xl font-bold ${
                    revealPlayer.score >= 0 ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    ${revealPlayer.score.toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Host controls */}
          {isHost && revealPlayer && (
            <div className="space-y-3">
              {fjRevealStep === 'none' && (
                <button className="btn-primary w-full justify-center py-3" onClick={() => advanceFJReveal()}>
                  👁️ Reveal Their Answer
                </button>
              )}
              {fjRevealStep === 'answer' && (
                <div className="grid grid-cols-2 gap-3">
                  <button className="btn-correct py-3" onClick={() => advanceFJReveal(true)}>
                    ✅ Mark Correct
                  </button>
                  <button className="btn-incorrect py-3" onClick={() => advanceFJReveal(false)}>
                    ❌ Mark Incorrect
                  </button>
                </div>
              )}
              {fjRevealStep === 'correct_incorrect' && (
                <button className="btn-primary w-full justify-center py-3" onClick={() => advanceFJReveal()}>
                  💰 Reveal Wager & Score
                </button>
              )}
              {fjRevealStep === 'wager' && (
                <button className="btn-primary w-full justify-center py-3" onClick={() => advanceFJReveal()}>
                  {fjCurrentRevealIdx < fjRevealOrder.length - 1 ? '➡️ Next Player' : '🏆 Show Winner!'}
                </button>
              )}
            </div>
          )}

          {/* Reveal order progress */}
          <div className="flex gap-2 justify-center flex-wrap">
            {fjRevealOrder.map((pid, idx) => {
              const p = players[pid];
              const isPast = idx < fjCurrentRevealIdx;
              const isCurrent = idx === fjCurrentRevealIdx;
              return (
                <div
                  key={pid}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                    isCurrent ? 'border-orange-500 bg-orange-500/20 text-orange-300' :
                    isPast ? 'border-green-500/40 bg-green-500/10 text-green-400' :
                    'border-[#2a3caa] text-[#6080a0]'
                  }`}
                >
                  {p?.avatar} {p?.name}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
