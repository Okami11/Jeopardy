// ─────────────────────────────────────────────────────────────
//  Shared Game State Types
// ─────────────────────────────────────────────────────────────

export type PlayerRole = 'host' | 'player' | 'spectator';

export type GamePhase =
  | 'lobby'
  | 'board'            // Clue selection on board
  | 'clue'             // Clue is displayed, buzzers unlocked
  | 'buzzed'           // Player buzzed in, 8-sec answer timer
  | 'daily_double'     // Daily double wager input
  | 'answer_reveal'    // Showing correct answer after round
  | 'round_transition' // Between rounds
  | 'final_category'   // FJ: category reveal
  | 'final_wager'      // FJ: players submit wagers
  | 'final_clue'       // FJ: clue shown, 30-sec timer
  | 'final_reveal'     // FJ: host reveals each player
  | 'winner'           // Game over / podium
  | 'paused';

export type FJRevealStep = 'none' | 'answer' | 'correct_incorrect' | 'wager';

export interface Player {
  id: string;          // socket id
  name: string;
  role: PlayerRole;
  score: number;
  avatar: string;      // emoji or initials
  connected: boolean;
  // Final Jeopardy fields
  fjWager?: number;
  fjAnswer?: string;
  fjWagerLocked?: boolean;
  fjAnswerSubmitted?: boolean;
  fjCorrect?: boolean | null;
  eliminated?: boolean; // score <= 0 at FJ start
}

export interface ActiveClue {
  categoryId: string;
  clueId: string;
  value: number;
  clue: string;
  answer: string;
  isDailyDouble: boolean;
}

export interface GameState {
  roomCode: string;
  phase: GamePhase;
  currentRound: 0 | 1 | 2; // 0=lobby, 1=R1, 2=R2, FJ is phase-driven
  players: Record<string, Player>;
  hostId: string | null;
  // Board state
  usedClues: Set<string>; // clueId set
  activeClue: ActiveClue | null;
  buzzedPlayerId: string | null;
  buzzerLockedOut: boolean;
  buzzerOpenTimestamp: number | null;
  answerTimerStart: number | null;
  // Daily Double
  ddWager: number | null;
  ddPlayerId: string | null;
  // Score who picks next
  lastCorrectPlayerId: string | null;
  // Final Jeopardy
  fjRevealOrder: string[];   // player ids, lowest → highest score
  fjCurrentRevealIdx: number; // index into fjRevealOrder
  fjRevealStep: FJRevealStep;
  // Timers (server-tracked)
  countdownEnd: number | null; // epoch ms when timer expires
  // Host override edit
  scoreEditPlayerId: string | null;
  // Custom question data (JSON override)
  customQuestionsJson?: string | null;
}

// Socket event payloads
export interface JoinRoomPayload {
  roomCode: string;
  playerName: string;
  avatar: string;
  isHost: boolean;
  hostPassword?: string;
}

export interface BuzzPayload {
  roomCode: string;
  playerId: string;
  timestamp: number;
}

export interface AnswerResultPayload {
  roomCode: string;
  playerId: string;
  correct: boolean;
}

export interface SelectCluePayload {
  roomCode: string;
  categoryId: string;
  clueId: string;
}

export interface DDWagerPayload {
  roomCode: string;
  wager: number;
}

export interface ScoreAdjustPayload {
  roomCode: string;
  playerId: string;
  delta: number;
}

export interface FJWagerPayload {
  roomCode: string;
  playerId: string;
  wager: number;
}

export interface FJAnswerPayload {
  roomCode: string;
  playerId: string;
  answer: string;
}

export interface FJRevealNextPayload {
  roomCode: string;
  correct: boolean;
}

// Serializable game state (convert Set to array for JSON)
export interface SerializableGameState extends Omit<GameState, 'usedClues'> {
  usedClues: string[];
}
