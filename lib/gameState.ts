// ─────────────────────────────────────────────────────────────
//  Server-side game state manager (in-memory room sessions)
// ─────────────────────────────────────────────────────────────
import {
  GameState,
  Player,
  SerializableGameState,
  FJRevealStep,
} from './gameTypes';
import { ROUND1, ROUND2, FINAL_JEOPARDY, assignDailyDoubles } from './gameData';

const rooms = new Map<string, GameState>();

// ─── Round data (with daily doubles randomised) ───────────────
let _rounds = assignDailyDoubles([ROUND1, ROUND2]);

export function getSerializable(state: GameState): SerializableGameState {
  return {
    ...state,
    usedClues: Array.from(state.usedClues),
  } as SerializableGameState;
}

export function getRoom(code: string): GameState | undefined {
  return rooms.get(code);
}

export function createRoom(code: string, hostId: string, hostName: string): GameState {
  // Re-randomise daily doubles per game
  _rounds = assignDailyDoubles([ROUND1, ROUND2]);

  const host: Player = {
    id: hostId,
    name: hostName,
    role: 'host',
    score: 0,
    avatar: '🎩',
    connected: true,
  };

  const state: GameState = {
    roomCode: code,
    phase: 'lobby',
    currentRound: 0,
    players: { [hostId]: host },
    hostId,
    usedClues: new Set(),
    activeClue: null,
    buzzedPlayerId: null,
    buzzerLockedOut: true,
    buzzerOpenTimestamp: null,
    answerTimerStart: null,
    ddWager: null,
    ddPlayerId: null,
    lastCorrectPlayerId: null,
    fjRevealOrder: [],
    fjCurrentRevealIdx: -1,
    fjRevealStep: 'none',
    countdownEnd: null,
    scoreEditPlayerId: null,
    customQuestionsJson: null,
  };

  rooms.set(code, state);
  return state;
}

export function addPlayer(
  code: string,
  socketId: string,
  name: string,
  avatar: string
): GameState | null {
  const room = rooms.get(code);
  if (!room) return null;

  room.players[socketId] = {
    id: socketId,
    name,
    role: 'player',
    score: 0,
    avatar,
    connected: true,
  };
  return room;
}

export function reconnectPlayer(
  code: string,
  oldSocketId: string,
  newSocketId: string
): GameState | null {
  const room = rooms.get(code);
  if (!room) return null;

  const player = room.players[oldSocketId];
  if (player) {
    player.id = newSocketId;
    player.connected = true;
    delete room.players[oldSocketId];
    room.players[newSocketId] = player;
  }
  return room;
}

export function disconnectPlayer(code: string, socketId: string): GameState | null {
  const room = rooms.get(code);
  if (!room) return null;
  if (room.players[socketId]) {
    room.players[socketId].connected = false;
  }
  return room;
}

export function startRound(code: string, round: 1 | 2): GameState | null {
  const room = rooms.get(code);
  if (!room) return null;

  room.currentRound = round;
  room.phase = 'board';
  room.activeClue = null;
  room.buzzedPlayerId = null;
  room.buzzerLockedOut = true;
  room.countdownEnd = null;
  return room;
}

export function getRoundData(roundNum: 0 | 1 | 2) {
  if (roundNum === 1) return _rounds[0];
  if (roundNum === 2) return _rounds[1];
  return null;
}

export function getFinalJeopardy() {
  return FINAL_JEOPARDY;
}

export function selectClue(
  code: string,
  categoryId: string,
  clueId: string
): GameState | null {
  const room = rooms.get(code);
  if (!room) return null;

  const roundData = getRoundData(room.currentRound as 1 | 2);
  if (!roundData) return null;

  const category = roundData.categories.find((c) => c.id === categoryId);
  const clue = category?.clues.find((cl) => cl.id === clueId);
  if (!clue || room.usedClues.has(clueId)) return null;

  room.activeClue = {
    categoryId,
    clueId,
    value: clue.value,
    clue: clue.clue,
    answer: clue.answer,
    isDailyDouble: clue.isDailyDouble ?? false,
  };

  if (clue.isDailyDouble) {
    room.phase = 'daily_double';
    room.buzzerLockedOut = true;
    // The player who picked gets to wager
    room.ddPlayerId = room.lastCorrectPlayerId ?? room.hostId;
    room.ddWager = null;
  } else {
    room.phase = 'clue';
    room.buzzerLockedOut = true;
    room.buzzedPlayerId = null;
  }

  return room;
}

export function unlockBuzzers(code: string): GameState | null {
  const room = rooms.get(code);
  if (!room) return null;
  room.buzzerLockedOut = false;
  room.buzzerOpenTimestamp = Date.now();
  return room;
}

export function lockBuzzers(code: string): GameState | null {
  const room = rooms.get(code);
  if (!room) return null;
  room.buzzerLockedOut = true;
  room.buzzerOpenTimestamp = null;
  return room;
}

export function playerBuzz(
  code: string,
  playerId: string,
  clientTimestamp: number
): { state: GameState; accepted: boolean } | null {
  const room = rooms.get(code);
  if (!room) return null;
  if (room.buzzerLockedOut || room.buzzedPlayerId) {
    return { state: room, accepted: false };
  }

  room.buzzedPlayerId = playerId;
  room.buzzerLockedOut = true;
  room.phase = 'buzzed';
  room.answerTimerStart = Date.now();
  room.countdownEnd = Date.now() + 8000;
  return { state: room, accepted: true };
}

export function resolveAnswer(
  code: string,
  playerId: string,
  correct: boolean
): GameState | null {
  const room = rooms.get(code);
  if (!room) return null;
  const player = room.players[playerId];
  if (!player || !room.activeClue) return null;

  const value = room.activeClue.value;

  if (correct) {
    player.score += value;
    room.lastCorrectPlayerId = playerId;
    room.phase = 'answer_reveal';
    room.usedClues.add(room.activeClue.clueId);
    room.buzzedPlayerId = null;
    room.countdownEnd = null;
  } else {
    player.score -= value;
    // Re-open buzzers for others
    room.buzzedPlayerId = null;
    room.phase = 'clue';
    room.buzzerLockedOut = false;
    room.buzzerOpenTimestamp = Date.now();
    room.countdownEnd = null;
  }
  return room;
}

export function resolveDDAnswer(
  code: string,
  correct: boolean
): GameState | null {
  const room = rooms.get(code);
  if (!room || !room.activeClue || room.ddPlayerId === null) return null;

  const player = room.players[room.ddPlayerId];
  if (!player) return null;

  const wager = room.ddWager ?? room.activeClue.value;
  if (correct) {
    player.score += wager;
    room.lastCorrectPlayerId = room.ddPlayerId;
  } else {
    player.score -= wager;
  }

  room.phase = 'answer_reveal';
  room.usedClues.add(room.activeClue.clueId);
  room.ddWager = null;
  room.ddPlayerId = null;
  room.countdownEnd = null;
  return room;
}

export function setDDWager(code: string, wager: number): GameState | null {
  const room = rooms.get(code);
  if (!room) return null;
  room.ddWager = wager;
  room.phase = 'clue'; // Show the clue now
  room.countdownEnd = null;
  return room;
}

export function returnToBoard(code: string): GameState | null {
  const room = rooms.get(code);
  if (!room) return null;
  room.phase = 'board';
  room.activeClue = null;
  room.buzzedPlayerId = null;
  room.buzzerLockedOut = true;
  room.countdownEnd = null;
  return room;
}

export function adjustScore(
  code: string,
  playerId: string,
  delta: number
): GameState | null {
  const room = rooms.get(code);
  if (!room) return null;
  const player = room.players[playerId];
  if (!player) return null;
  player.score += delta;
  return room;
}

export function setScore(
  code: string,
  playerId: string,
  newScore: number
): GameState | null {
  const room = rooms.get(code);
  if (!room) return null;
  const player = room.players[playerId];
  if (!player) return null;
  player.score = newScore;
  return room;
}

// ─── Final Jeopardy ──────────────────────────────────────────

export function startFinalJeopardy(code: string): GameState | null {
  const room = rooms.get(code);
  if (!room) return null;

  // Determine eligibility: score > 0
  const contestants = Object.values(room.players).filter(
    (p) => p.role === 'player'
  );
  contestants.forEach((p) => {
    p.eliminated = p.score <= 0;
    p.fjWager = undefined;
    p.fjAnswer = undefined;
    p.fjWagerLocked = false;
    p.fjAnswerSubmitted = false;
    p.fjCorrect = null;
  });

  room.phase = 'final_category';
  room.fjRevealOrder = [];
  room.fjCurrentRevealIdx = -1;
  room.fjRevealStep = 'none';
  return room;
}

export function startFinalWager(code: string): GameState | null {
  const room = rooms.get(code);
  if (!room) return null;
  room.phase = 'final_wager';
  return room;
}

export function submitFJWager(
  code: string,
  playerId: string,
  wager: number
): GameState | null {
  const room = rooms.get(code);
  if (!room) return null;
  const player = room.players[playerId];
  if (!player || player.eliminated) return null;

  const maxWager = Math.max(player.score, 1000);
  const clampedWager = Math.max(0, Math.min(wager, maxWager));
  player.fjWager = clampedWager;
  player.fjWagerLocked = true;
  return room;
}

export function revealFinalClue(code: string): GameState | null {
  const room = rooms.get(code);
  if (!room) return null;
  room.phase = 'final_clue';
  room.countdownEnd = Date.now() + 30000;
  return room;
}

export function submitFJAnswer(
  code: string,
  playerId: string,
  answer: string
): GameState | null {
  const room = rooms.get(code);
  if (!room) return null;
  const player = room.players[playerId];
  if (!player || player.eliminated) return null;
  player.fjAnswer = answer;
  player.fjAnswerSubmitted = true;
  return room;
}

export function startFinalReveal(code: string): GameState | null {
  const room = rooms.get(code);
  if (!room) return null;

  // Order: lowest to highest score (non-eliminated contestants)
  const contestants = Object.values(room.players)
    .filter((p) => p.role === 'player' && !p.eliminated)
    .sort((a, b) => a.score - b.score);

  room.fjRevealOrder = contestants.map((p) => p.id);
  room.fjCurrentRevealIdx = 0;
  room.fjRevealStep = 'none';
  room.phase = 'final_reveal';
  room.countdownEnd = null;
  return room;
}

export function advanceFJReveal(
  code: string,
  correct?: boolean
): GameState | null {
  const room = rooms.get(code);
  if (!room) return null;

  const currentStep = room.fjRevealStep;
  const currentPlayerId = room.fjRevealOrder[room.fjCurrentRevealIdx];
  const player = currentPlayerId ? room.players[currentPlayerId] : null;

  if (currentStep === 'none') {
    // Show answer
    room.fjRevealStep = 'answer';
  } else if (currentStep === 'answer') {
    // Mark correct/incorrect
    if (player && correct !== undefined) {
      player.fjCorrect = correct;
    }
    room.fjRevealStep = 'correct_incorrect';
  } else if (currentStep === 'correct_incorrect') {
    // Reveal wager + animate score
    if (player && player.fjWager !== undefined && player.fjCorrect !== null) {
      if (player.fjCorrect) {
        player.score += player.fjWager;
      } else {
        player.score -= player.fjWager;
      }
    }
    room.fjRevealStep = 'wager';
  } else if (currentStep === 'wager') {
    // Move to next player
    const nextIdx = room.fjCurrentRevealIdx + 1;
    if (nextIdx >= room.fjRevealOrder.length) {
      room.phase = 'winner';
    } else {
      room.fjCurrentRevealIdx = nextIdx;
      room.fjRevealStep = 'none';
    }
  }

  return room;
}

export function generateRoomCode(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const digits = '0123456789';
  const l1 = letters[Math.floor(Math.random() * letters.length)];
  const l2 = letters[Math.floor(Math.random() * letters.length)];
  const l3 = letters[Math.floor(Math.random() * letters.length)];
  const d1 = digits[Math.floor(Math.random() * digits.length)];
  const d2 = digits[Math.floor(Math.random() * digits.length)];
  const d3 = digits[Math.floor(Math.random() * digits.length)];
  return `${l1}${l2}${l3}-${d1}${d2}${d3}`;
}

export function roomExists(code: string): boolean {
  return rooms.has(code);
}
