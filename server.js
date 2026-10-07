// ─────────────────────────────────────────────────────────────
//  Custom Socket.io server for Next.js
//  Run with: node server.js (or via package.json "dev" script)
// ─────────────────────────────────────────────────────────────
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOST || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Lazy-load game state (compiled TypeScript — use ts-node or pre-compiled)
// We use require with ts-node registration
let gameState;
let gameData;

try {
  // Try pre-compiled .js (production)
  gameState = require('./.next/server/chunks/gameState.js');
} catch {
  // Development: directly require TS via ts-node
  require('ts-node').register({ 
    transpileOnly: true,
    compilerOptions: { module: "commonjs", moduleResolution: "node" }
  });
  gameState = require('./lib/gameState.ts');
  gameData = require('./lib/gameData.ts');
}

const {
  createRoom,
  addPlayer,
  disconnectPlayer,
  reconnectPlayer,
  startRound,
  selectClue,
  unlockBuzzers,
  lockBuzzers,
  playerBuzz,
  resolveAnswer,
  resolveDDAnswer,
  setDDWager,
  returnToBoard,
  adjustScore,
  setScore,
  startFinalJeopardy,
  startFinalWager,
  submitFJWager,
  revealFinalClue,
  submitFJAnswer,
  startFinalReveal,
  advanceFJReveal,
  generateRoomCode,
  roomExists,
  getRoom,
  getRoundData,
  getFinalJeopardy,
  getSerializable,
} = gameState;

const HOST_PASSWORD = process.env.HOST_PASSWORD || 'jeopardy-host-2024';

app.prepare().then(() => {
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Helper to broadcast state to room
  function broadcastState(roomCode, extraData = {}) {
    const room = getRoom(roomCode);
    if (!room) return;
    const serial = getSerializable(room);
    const roundData = getRoundData(room.currentRound);
    const fjData = getFinalJeopardy();
    io.to(roomCode).emit('game_state', { ...serial, roundData, fjData, ...extraData });
  }

  io.on('connection', (socket) => {
    console.log(`[WS] Connected: ${socket.id}`);

    // ── CREATE ROOM ──────────────────────────────────────────
    socket.on('create_room', ({ hostName, hostPassword, isHost }) => {
      if (!isHost || hostPassword !== HOST_PASSWORD) {
        socket.emit('error', { message: 'Invalid host password.' });
        return;
      }
      let code = generateRoomCode();
      while (roomExists(code)) code = generateRoomCode();

      createRoom(code, socket.id, hostName || 'Host');
      socket.join(code);
      socket.data.roomCode = code;
      socket.data.playerId = socket.id;

      broadcastState(code);
      socket.emit('room_created', { roomCode: code });
      console.log(`[Room] Created: ${code} by ${socket.id}`);
    });

    // ── JOIN ROOM ─────────────────────────────────────────────
    socket.on('join_room', ({ roomCode, playerName, avatar, isHost, hostPassword }) => {
      const code = roomCode?.toUpperCase();
      if (!roomExists(code)) {
        socket.emit('error', { message: 'Room not found.' });
        return;
      }

      if (isHost) {
        if (hostPassword !== HOST_PASSWORD) {
          socket.emit('error', { message: 'Invalid host password.' });
          return;
        }
        // Re-join as host
        socket.join(code);
        socket.data.roomCode = code;
        socket.data.playerId = socket.id;
        broadcastState(code);
        socket.emit('joined', { roomCode: code, role: 'host' });
        return;
      }

      const room = addPlayer(code, socket.id, playerName || 'Player', avatar || '😊');
      if (!room) {
        socket.emit('error', { message: 'Could not join room.' });
        return;
      }

      socket.join(code);
      socket.data.roomCode = code;
      socket.data.playerId = socket.id;

      broadcastState(code);
      socket.emit('joined', { roomCode: code, role: 'player', playerId: socket.id });
      console.log(`[Room] ${playerName} joined ${code}`);
    });

    // ── START ROUND ───────────────────────────────────────────
    socket.on('start_round', ({ roomCode, round }) => {
      const room = getRoom(roomCode);
      if (!room || room.hostId !== socket.id) return;
      startRound(roomCode, round);
      broadcastState(roomCode);
      io.to(roomCode).emit('sfx', { sound: 'round_start' });
    });

    // ── SELECT CLUE ───────────────────────────────────────────
    socket.on('select_clue', ({ roomCode, categoryId, clueId }) => {
      const room = getRoom(roomCode);
      if (!room) return;
      // Only host or the player whose turn it is
      if (room.hostId !== socket.id && room.lastCorrectPlayerId !== socket.id && room.phase !== 'board') return;

      const updated = selectClue(roomCode, categoryId, clueId);
      if (!updated) return;
      broadcastState(roomCode);
      io.to(roomCode).emit('sfx', { sound: updated.activeClue?.isDailyDouble ? 'daily_double' : 'clue_select' });
    });

    // ── UNLOCK / LOCK BUZZERS ──────────────────────────────────
    socket.on('unlock_buzzers', ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room || room.hostId !== socket.id) return;
      unlockBuzzers(roomCode);
      broadcastState(roomCode);
      io.to(roomCode).emit('sfx', { sound: 'buzzer_unlock' });
    });

    socket.on('lock_buzzers', ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room || room.hostId !== socket.id) return;
      lockBuzzers(roomCode);
      broadcastState(roomCode);
    });

    // ── PLAYER BUZZ IN ─────────────────────────────────────────
    socket.on('buzz', ({ roomCode, timestamp }) => {
      const result = playerBuzz(roomCode, socket.id, timestamp || Date.now());
      if (!result || !result.accepted) return;
      broadcastState(roomCode);
      io.to(roomCode).emit('sfx', { sound: 'buzz_in' });
    });

    // ── ANSWER RESULT ──────────────────────────────────────────
    socket.on('answer_result', ({ roomCode, playerId, correct }) => {
      const room = getRoom(roomCode);
      if (!room || room.hostId !== socket.id) return;
      const updated = resolveAnswer(roomCode, playerId, correct);
      if (!updated) return;
      broadcastState(roomCode);
      io.to(roomCode).emit('sfx', { sound: correct ? 'correct' : 'incorrect' });
    });

    // ── DAILY DOUBLE WAGER ────────────────────────────────────
    socket.on('dd_wager', ({ roomCode, wager }) => {
      const room = getRoom(roomCode);
      if (!room) return;
      if (room.ddPlayerId !== socket.id && room.hostId !== socket.id) return;
      setDDWager(roomCode, wager);
      broadcastState(roomCode);
    });

    // ── DD ANSWER RESULT ──────────────────────────────────────
    socket.on('dd_answer_result', ({ roomCode, correct }) => {
      const room = getRoom(roomCode);
      if (!room || room.hostId !== socket.id) return;
      resolveDDAnswer(roomCode, correct);
      broadcastState(roomCode);
      io.to(roomCode).emit('sfx', { sound: correct ? 'correct' : 'incorrect' });
    });

    // ── RETURN TO BOARD ───────────────────────────────────────
    socket.on('return_to_board', ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room || room.hostId !== socket.id) return;
      returnToBoard(roomCode);
      broadcastState(roomCode);
    });

    // ── SCORE ADJUST ───────────────────────────────────────────
    socket.on('adjust_score', ({ roomCode, playerId, delta }) => {
      const room = getRoom(roomCode);
      if (!room || room.hostId !== socket.id) return;
      adjustScore(roomCode, playerId, delta);
      broadcastState(roomCode);
    });

    socket.on('set_score', ({ roomCode, playerId, score }) => {
      const room = getRoom(roomCode);
      if (!room || room.hostId !== socket.id) return;
      setScore(roomCode, playerId, score);
      broadcastState(roomCode);
    });

    // ── FINAL JEOPARDY FLOW ────────────────────────────────────
    socket.on('start_final_jeopardy', ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room || room.hostId !== socket.id) return;
      startFinalJeopardy(roomCode);
      broadcastState(roomCode);
      io.to(roomCode).emit('sfx', { sound: 'final_jeopardy_start' });
    });

    socket.on('start_final_wager', ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room || room.hostId !== socket.id) return;
      startFinalWager(roomCode);
      broadcastState(roomCode);
    });

    socket.on('fj_wager', ({ roomCode, wager }) => {
      const room = getRoom(roomCode);
      if (!room) return;
      submitFJWager(roomCode, socket.id, wager);
      broadcastState(roomCode);
    });

    socket.on('reveal_final_clue', ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room || room.hostId !== socket.id) return;
      revealFinalClue(roomCode);
      broadcastState(roomCode);
      io.to(roomCode).emit('sfx', { sound: 'final_jeopardy_theme' });
    });

    socket.on('fj_answer', ({ roomCode, answer }) => {
      const room = getRoom(roomCode);
      if (!room) return;
      submitFJAnswer(roomCode, socket.id, answer);
      broadcastState(roomCode);
    });

    socket.on('start_final_reveal', ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room || room.hostId !== socket.id) return;
      startFinalReveal(roomCode);
      broadcastState(roomCode);
    });

    socket.on('advance_fj_reveal', ({ roomCode, correct }) => {
      const room = getRoom(roomCode);
      if (!room || room.hostId !== socket.id) return;
      advanceFJReveal(roomCode, correct);
      broadcastState(roomCode);

      const updatedRoom = getRoom(roomCode);
      if (updatedRoom?.phase === 'winner') {
        io.to(roomCode).emit('sfx', { sound: 'winner' });
      }
    });

    // ── RESET GAME ──────────────────────────────────────────
    socket.on('reset_game', ({ roomCode }) => {
      const room = getRoom(roomCode);
      if (!room || room.hostId !== socket.id) return;
      // Re-use create room logic
      const hostName = room.hostId && room.players[room.hostId] ? room.players[room.hostId].name : 'Host';
      const newRoom = createRoom(roomCode, socket.id, hostName);
      // Re-add existing players with zeroed scores
      Object.values(room.players).forEach((p) => {
        if (p.role === 'player') {
          addPlayer(roomCode, p.id, p.name, p.avatar);
        }
      });
      broadcastState(roomCode);
    });

    // ── CUSTOM QUESTIONS JSON ──────────────────────────────────
    socket.on('set_custom_questions', ({ roomCode, json }) => {
      const room = getRoom(roomCode);
      if (!room || room.hostId !== socket.id) return;
      room.customQuestionsJson = json;
      socket.emit('custom_questions_ack', { ok: true });
    });

    // ── DISCONNECT ──────────────────────────────────────────────
    socket.on('disconnect', () => {
      const code = socket.data.roomCode;
      if (code) {
        disconnectPlayer(code, socket.id);
        broadcastState(code);
      }
      console.log(`[WS] Disconnected: ${socket.id}`);
    });
  });

  httpServer.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});
