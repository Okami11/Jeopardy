'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import LobbyScreen from '@/components/LobbyScreen';
import GameRoom from '@/components/GameRoom';
import HostController from '@/components/HostController';

export default function Home() {
  const socketHook = useSocket();
  const { gameState, roomCode } = socketHook;

  const [view, setView] = useState<'lobby' | 'host' | 'player'>('lobby');
  const [isHost, setIsHost] = useState(false);

  // Once we're in a room, determine the view
  useEffect(() => {
    if (!gameState || !roomCode) return;
    const me = socketHook.myPlayerId ? gameState.players[socketHook.myPlayerId] : null;
    if (me?.role === 'host' || gameState.hostId === socketHook.myPlayerId) {
      setIsHost(true);
    }
  }, [gameState, roomCode, socketHook.myPlayerId]);

  if (!roomCode || !gameState) {
    return <LobbyScreen socketHook={socketHook} />;
  }

  return (
    <div className="min-h-screen bg-[#060818] relative">
      {/* View toggle for host */}
      {isHost && (
        <div className="fixed top-4 right-4 z-50 flex gap-2">
          <button
            onClick={() => setView('player')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
              view === 'player'
                ? 'bg-yellow-400 text-[#060818] border-yellow-400'
                : 'bg-[#1a2580] text-white border-[#2a3caa] hover:border-yellow-400'
            }`}
          >
            📺 Board View
          </button>
          <button
            onClick={() => setView('host')}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${
              view === 'host'
                ? 'bg-purple-500 text-white border-purple-500'
                : 'bg-[#1a2580] text-white border-[#2a3caa] hover:border-purple-400'
            }`}
          >
            🎛️ Host Panel
          </button>
        </div>
      )}

      {view === 'host' && isHost ? (
        <HostController socketHook={socketHook} />
      ) : (
        <GameRoom socketHook={socketHook} isHost={isHost} />
      )}
    </div>
  );
}
