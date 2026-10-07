'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SerializableGameState } from '@/lib/gameTypes';
import { Round, FinalJeopardyData } from '@/lib/gameData';
import { playSFX } from '@/lib/soundManager';

export interface ExtendedGameState extends SerializableGameState {
  roundData?: Round;
  fjData?: FinalJeopardyData;
}

export interface UseSocketReturn {
  socket: Socket | null;
  gameState: ExtendedGameState | null;
  connected: boolean;
  error: string | null;
  myPlayerId: string | null;
  roomCode: string | null;
  // Actions
  createRoom: (hostName: string, hostPassword: string) => void;
  joinRoom: (roomCode: string, playerName: string, avatar: string) => void;
  joinAsHost: (roomCode: string, hostPassword: string) => void;
  startRound: (round: 1 | 2) => void;
  selectClue: (categoryId: string, clueId: string) => void;
  unlockBuzzers: () => void;
  lockBuzzers: () => void;
  buzz: () => void;
  answerResult: (playerId: string, correct: boolean) => void;
  ddWager: (wager: number) => void;
  ddAnswerResult: (correct: boolean) => void;
  returnToBoard: () => void;
  adjustScore: (playerId: string, delta: number) => void;
  setScore: (playerId: string, score: number) => void;
  startFinalJeopardy: () => void;
  startFinalWager: () => void;
  fjWager: (wager: number) => void;
  revealFinalClue: () => void;
  fjAnswer: (answer: string) => void;
  startFinalReveal: () => void;
  advanceFJReveal: (correct?: boolean) => void;
  resetGame: () => void;
}

export function useSocket(): UseSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [gameState, setGameState] = useState<ExtendedGameState | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [roomCode, setRoomCode] = useState<string | null>(null);

  useEffect(() => {
    const s = io({ transports: ['websocket'] });
    socketRef.current = s;

    s.on('connect', () => {
      setConnected(true);
      setError(null);
    });

    s.on('disconnect', () => setConnected(false));

    s.on('connect_error', (err) => {
      setError(`Connection error: ${err.message}`);
    });

    s.on('error', ({ message }: { message: string }) => {
      setError(message);
      setTimeout(() => setError(null), 5000);
    });

    s.on('room_created', ({ roomCode: code }: { roomCode: string }) => {
      setRoomCode(code);
      setMyPlayerId(s.id ?? null);
    });

    s.on('joined', ({ roomCode: code, role, playerId }: { roomCode: string; role: string; playerId?: string }) => {
      setRoomCode(code);
      setMyPlayerId(playerId ?? s.id ?? null);
    });

    s.on('game_state', (state: ExtendedGameState) => {
      setGameState(state);
    });

    s.on('sfx', ({ sound }: { sound: string }) => {
      playSFX(sound);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  const emit = useCallback(
    (event: string, data?: Record<string, unknown>) => {
      socketRef.current?.emit(event, { roomCode, ...data });
    },
    [roomCode]
  );

  return {
    socket: socketRef.current,
    gameState,
    connected,
    error,
    myPlayerId,
    roomCode,

    createRoom: (hostName, hostPassword) =>
      socketRef.current?.emit('create_room', { hostName, hostPassword, isHost: true }),

    joinRoom: (code, playerName, avatar) =>
      socketRef.current?.emit('join_room', {
        roomCode: code.toUpperCase(),
        playerName,
        avatar,
        isHost: false,
      }),

    joinAsHost: (code, hostPassword) =>
      socketRef.current?.emit('join_room', {
        roomCode: code.toUpperCase(),
        isHost: true,
        hostPassword,
      }),

    startRound: (round) => emit('start_round', { round }),
    selectClue: (categoryId, clueId) => emit('select_clue', { categoryId, clueId }),
    unlockBuzzers: () => emit('unlock_buzzers'),
    lockBuzzers: () => emit('lock_buzzers'),
    buzz: () => emit('buzz', { timestamp: Date.now() }),
    answerResult: (playerId, correct) => emit('answer_result', { playerId, correct }),
    ddWager: (wager) => emit('dd_wager', { wager }),
    ddAnswerResult: (correct) => emit('dd_answer_result', { correct }),
    returnToBoard: () => emit('return_to_board'),
    adjustScore: (playerId, delta) => emit('adjust_score', { playerId, delta }),
    setScore: (playerId, score) => emit('set_score', { playerId, score }),
    startFinalJeopardy: () => emit('start_final_jeopardy'),
    startFinalWager: () => emit('start_final_wager'),
    fjWager: (wager) => emit('fj_wager', { wager }),
    revealFinalClue: () => emit('reveal_final_clue'),
    fjAnswer: (answer) => emit('fj_answer', { answer }),
    startFinalReveal: () => emit('start_final_reveal'),
    advanceFJReveal: (correct) => emit('advance_fj_reveal', { correct }),
    resetGame: () => emit('reset_game'),
  };
}
