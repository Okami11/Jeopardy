'use client';

import { useState } from 'react';
import { UseSocketReturn } from '@/hooks/useSocket';

interface Props {
  socketHook: UseSocketReturn;
}

export default function HostController({ socketHook }: Props) {
  const {
    gameState, myPlayerId,
    unlockBuzzers, lockBuzzers, answerResult, returnToBoard,
    ddAnswerResult, startRound, startFinalJeopardy
  } = socketHook;

  const [customJson, setCustomJson] = useState('');

  if (!gameState) return null;

  const isHost = gameState.hostId === myPlayerId;
  if (!isHost) return <div className="p-8 text-center text-red-400">Host access denied.</div>;

  const { phase, activeClue, buzzedPlayerId, buzzerLockedOut, players, currentRound } = gameState;
  const buzzedPlayer = buzzedPlayerId ? players[buzzedPlayerId] : null;

  function handleSaveCustom() {
    socketHook.socket?.emit('set_custom_questions', { roomCode: gameState?.roomCode, json: customJson });
    alert('Custom questions loaded!');
  }

  return (
    <div className="min-h-screen bg-[#060818] p-6 pb-24 overflow-auto">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-center bg-[#0d1850] p-4 rounded-xl border border-[#2a3caa]">
          <div>
            <h1 className="text-xl font-bold text-purple-300">🎛️ Host Dashboard</h1>
            <p className="text-sm text-[#a0b0e0]">Room: <span className="font-mono text-yellow-400 font-bold">{gameState.roomCode}</span></p>
          </div>
          <div className="text-right">
            <p className="text-sm text-[#a0b0e0]">Phase: <span className="font-bold text-white uppercase">{phase}</span></p>
            <p className="text-sm text-[#a0b0e0]">Round: <span className="font-bold text-white">{currentRound}</span></p>
          </div>
        </header>

        {/* Main Control Panel */}
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Active Clue View */}
          <div className="host-panel p-5 space-y-4">
            <h2 className="text-[#a0b0e0] font-bold uppercase tracking-widest border-b border-[#2a3caa] pb-2">Active Clue</h2>
            
            {activeClue ? (
              <div className="space-y-4">
                <div className="bg-[#1a2580] p-3 rounded-lg border border-[#2a3caa]">
                  <p className="text-xs text-yellow-400 uppercase font-bold mb-1">${activeClue.value} • {activeClue.isDailyDouble ? 'DAILY DOUBLE' : 'Regular'}</p>
                  <p className="text-white font-bold">{activeClue.clue}</p>
                </div>
                
                <div className="bg-green-900/30 p-3 rounded-lg border border-green-500/40">
                  <p className="text-xs text-green-400 uppercase font-bold mb-1">Correct Answer</p>
                  <p className="text-green-300 font-bold">{activeClue.answer}</p>
                </div>

                {/* Buzz Controls */}
                {phase === 'clue' && !activeClue.isDailyDouble && (
                  <div className="flex gap-2">
                    {buzzerLockedOut ? (
                      <button className="btn-primary flex-1" onClick={unlockBuzzers}>🔔 Unlock Buzzers</button>
                    ) : (
                      <button className="btn-secondary flex-1" onClick={lockBuzzers}>🔒 Lock Buzzers</button>
                    )}
                  </div>
                )}

                {/* Answer Resolution */}
                {phase === 'buzzed' && buzzedPlayer && (
                  <div className="space-y-2">
                    <p className="text-center font-bold text-yellow-400 bg-yellow-400/10 p-2 rounded-lg">
                      {buzzedPlayer.name} buzzed in!
                    </p>
                    <div className="flex gap-2">
                      <button className="btn-correct flex-1" onClick={() => answerResult(buzzedPlayer.id, true)}>✅ Correct</button>
                      <button className="btn-incorrect flex-1" onClick={() => answerResult(buzzedPlayer.id, false)}>❌ Incorrect</button>
                    </div>
                  </div>
                )}

                {/* Daily Double Resolution */}
                {phase === 'clue' && activeClue.isDailyDouble && gameState.ddWager !== null && (
                  <div className="space-y-2">
                    <p className="text-center text-purple-300">Wager: ${gameState.ddWager}</p>
                    <div className="flex gap-2">
                      <button className="btn-correct flex-1" onClick={() => ddAnswerResult(true)}>✅ DD Correct</button>
                      <button className="btn-incorrect flex-1" onClick={() => ddAnswerResult(false)}>❌ DD Incorrect</button>
                    </div>
                  </div>
                )}

                <button className="btn-secondary w-full" onClick={returnToBoard}>⬅️ Force Back to Board</button>
              </div>
            ) : (
              <p className="text-[#6080a0] italic text-center py-8">No active clue.</p>
            )}
          </div>

          {/* Game Flow & Scores */}
          <div className="space-y-6">
            <div className="host-panel p-5 space-y-4">
              <h2 className="text-[#a0b0e0] font-bold uppercase tracking-widest border-b border-[#2a3caa] pb-2">Game Flow</h2>
              <div className="grid grid-cols-2 gap-2">
                <button className="btn-secondary text-sm" onClick={() => startRound(1)}>Start Round 1</button>
                <button className="btn-secondary text-sm" onClick={() => startRound(2)}>Start Round 2</button>
                <button className="btn-secondary text-sm col-span-2 text-orange-300 border-orange-500/40" onClick={startFinalJeopardy}>Start Final Jeopardy</button>
              </div>
            </div>

            <div className="host-panel p-5 space-y-4">
              <h2 className="text-[#a0b0e0] font-bold uppercase tracking-widest border-b border-[#2a3caa] pb-2">Contestants</h2>
              <div className="space-y-3 max-h-[300px] overflow-auto">
                {Object.values(players).filter(p => p.role === 'player').map(p => (
                  <div key={p.id} className="flex items-center justify-between bg-[#1a2580]/50 p-2 rounded-lg">
                    <span className="font-bold text-white">{p.avatar} {p.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow-400 font-mono font-bold w-16 text-right">${p.score}</span>
                      <button className="w-6 h-6 rounded bg-green-500/20 text-green-400 hover:bg-green-500/40" onClick={() => socketHook.adjustScore(p.id, 100)}>+</button>
                      <button className="w-6 h-6 rounded bg-red-500/20 text-red-400 hover:bg-red-500/40" onClick={() => socketHook.adjustScore(p.id, -100)}>-</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* Custom Data Editor */}
        <div className="host-panel p-5 space-y-4">
          <h2 className="text-[#a0b0e0] font-bold uppercase tracking-widest border-b border-[#2a3caa] pb-2">Custom Game Data (Advanced)</h2>
          <p className="text-xs text-[#6080a0]">Paste a valid JSON object matching the internal game format to override the built-in questions. Do this in the lobby before starting.</p>
          <textarea 
            className="jeopardy-input font-mono text-xs h-32"
            placeholder="{ ROUND1: { ... }, ROUND2: { ... }, FINAL_JEOPARDY: { ... } }"
            value={customJson}
            onChange={(e) => setCustomJson(e.target.value)}
          />
          <button className="btn-secondary" onClick={handleSaveCustom}>💾 Load Custom JSON</button>
        </div>

      </div>
    </div>
  );
}
