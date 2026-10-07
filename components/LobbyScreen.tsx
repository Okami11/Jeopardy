'use client';

import { useState } from 'react';
import { UseSocketReturn } from '@/hooks/useSocket';

const AVATARS = ['😊', '🎮', '⚔️', '🐉', '🌸', '🔥', '💎', '🦊', '🌙', '⭐', '🎯', '🏆'];

interface Props {
  socketHook: UseSocketReturn;
}

export default function LobbyScreen({ socketHook }: Props) {
  const { createRoom, joinRoom, joinAsHost, error, connected } = socketHook;

  const [tab, setTab] = useState<'join' | 'host'>('join');
  const [playerName, setPlayerName] = useState('');
  const [avatar, setAvatar] = useState('😊');
  const [roomCode, setRoomCode] = useState('');
  const [hostName, setHostName] = useState('');
  const [hostPassword, setHostPassword] = useState('');
  const [joinHostPassword, setJoinHostPassword] = useState('');
  const [joinAsHostMode, setJoinAsHostMode] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleCreateRoom() {
    if (!hostName.trim() || !hostPassword.trim()) return;
    setLoading(true);
    createRoom(hostName.trim(), hostPassword);
    setTimeout(() => setLoading(false), 3000);
  }

  function handleJoin() {
    if (!playerName.trim() || !roomCode.trim()) return;
    setLoading(true);
    joinRoom(roomCode.trim(), playerName.trim(), avatar);
    setTimeout(() => setLoading(false), 3000);
  }

  function handleJoinAsHost() {
    if (!roomCode.trim() || !joinHostPassword.trim()) return;
    setLoading(true);
    joinAsHost(roomCode.trim(), joinHostPassword);
    setTimeout(() => setLoading(false), 3000);
  }

  return (
    <div className="lobby-hero flex flex-col items-center justify-center p-6 relative">
      {/* Background grid effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(rgba(42,60,170,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(42,60,170,0.15) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }} />
      </div>

      <div className="relative z-10 w-full max-w-lg space-y-8">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="text-7xl mb-4">🏆</div>
          <h1 className="font-display text-5xl md:text-7xl font-black tracking-wider"
            style={{
              background: 'linear-gradient(135deg, #f5c518, #fff8e1, #f5c518)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
            JEOPARDY!
          </h1>
          <p className="text-[#a0b0e0] text-lg">
            League of Legends &amp; Anime Edition
          </p>
          <div className={`inline-flex items-center gap-2 text-sm px-4 py-1.5 rounded-full border ${
            connected
              ? 'border-green-500/40 bg-green-500/10 text-green-400'
              : 'border-red-500/40 bg-red-500/10 text-red-400'
          }`}>
            <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            {connected ? 'Connected to server' : 'Connecting…'}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/40 border border-red-500/50 text-red-300 rounded-xl px-5 py-4 text-sm slide-in">
            ⚠️ {error}
          </div>
        )}

        {/* Tabs */}
        <div className="glass-card p-6 space-y-6">
          <div className="flex gap-2 bg-[#060818]/60 rounded-xl p-1">
            {[{ key: 'join', label: '🙋 Join Game' }, { key: 'host', label: '🎩 Host Game' }].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key as 'join' | 'host')}
                className={`flex-1 py-2.5 rounded-lg font-bold text-sm transition-all ${
                  tab === key
                    ? 'bg-gradient-to-r from-[#1a2580] to-[#2a3caa] text-white shadow-lg'
                    : 'text-[#a0b0e0] hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {tab === 'join' && (
            <div className="space-y-4 slide-in">
              {/* Avatar picker */}
              <div>
                <label className="block text-sm font-semibold text-[#a0b0e0] mb-2">Choose Avatar</label>
                <div className="grid grid-cols-6 gap-2">
                  {AVATARS.map((em) => (
                    <button
                      key={em}
                      onClick={() => setAvatar(em)}
                      className={`text-2xl h-12 rounded-xl transition-all border-2 ${
                        avatar === em
                          ? 'border-yellow-400 bg-yellow-400/20 scale-110'
                          : 'border-[#2a3caa] bg-[#1a2580]/50 hover:border-[#4a5cca]'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#a0b0e0] mb-2">Your Name</label>
                <input
                  className="jeopardy-input"
                  placeholder="Enter your player name…"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#a0b0e0] mb-2">Room Code</label>
                <input
                  className="jeopardy-input font-mono text-xl tracking-widest uppercase"
                  placeholder="ABC-123"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  maxLength={7}
                />
              </div>

              <button
                className="btn-primary w-full justify-center text-lg"
                onClick={handleJoin}
                disabled={!playerName.trim() || !roomCode.trim() || loading || !connected}
              >
                {loading ? '⏳ Joining…' : '🚀 Join Game'}
              </button>

              {/* Join as host option */}
              <div className="border-t border-[#2a3caa]/50 pt-4">
                <button
                  className="text-sm text-[#a0b0e0] hover:text-yellow-400 transition-colors"
                  onClick={() => setJoinAsHostMode(!joinAsHostMode)}
                >
                  🎩 Rejoin as Host instead
                </button>
                {joinAsHostMode && (
                  <div className="mt-3 space-y-3 slide-in">
                    <input
                      className="jeopardy-input"
                      type="password"
                      placeholder="Host password"
                      value={joinHostPassword}
                      onChange={(e) => setJoinHostPassword(e.target.value)}
                    />
                    <button
                      className="btn-secondary w-full"
                      onClick={handleJoinAsHost}
                      disabled={!roomCode.trim() || !joinHostPassword.trim() || loading}
                    >
                      Rejoin as Host
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'host' && (
            <div className="space-y-4 slide-in">
              <div className="bg-yellow-400/10 border border-yellow-400/30 rounded-xl p-4 text-sm text-yellow-300">
                <strong>Host Mode:</strong> You control the game board, buzzers, and scoring.
                Share your Room Code with players to join.
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#a0b0e0] mb-2">Host Name</label>
                <input
                  className="jeopardy-input"
                  placeholder="Alex Trebek Jr."
                  value={hostName}
                  onChange={(e) => setHostName(e.target.value)}
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-[#a0b0e0] mb-2">Host Password</label>
                <input
                  className="jeopardy-input"
                  type="password"
                  placeholder="Server host password"
                  value={hostPassword}
                  onChange={(e) => setHostPassword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateRoom()}
                />
                <p className="text-xs text-[#6070a0] mt-1">Default: jeopardy-host-2024 (set via HOST_PASSWORD env)</p>
              </div>

              <button
                className="btn-primary w-full justify-center text-lg"
                onClick={handleCreateRoom}
                disabled={!hostName.trim() || !hostPassword.trim() || loading || !connected}
              >
                {loading ? '⏳ Creating…' : '🎬 Create Room'}
              </button>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="text-center text-xs text-[#4060a0] space-y-1">
          <p>Real-time multiplayer • No account needed • Share screen on Discord</p>
        </div>
      </div>
    </div>
  );
}
