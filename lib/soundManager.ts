// ─────────────────────────────────────────────────────────────
//  Web Audio API Sound Manager
//  Generates all sound FX procedurally — no audio files needed
// ─────────────────────────────────────────────────────────────

let audioCtx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioCtx;
}

// ─── Basic helpers ────────────────────────────────────────────

function playTone(
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  gain = 0.3,
  startTime?: number
) {
  const ctx = getCtx();
  const t = startTime ?? ctx.currentTime;
  const osc = ctx.createOscillator();
  const gainNode = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gainNode.gain.setValueAtTime(gain, t);
  gainNode.gain.exponentialRampToValueAtTime(0.001, t + duration);

  osc.connect(gainNode);
  gainNode.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + duration + 0.01);
}

function playChord(freqs: number[], duration: number, gain = 0.15) {
  freqs.forEach((f) => playTone(f, duration, 'sine', gain));
}

// ─── Sound effects ────────────────────────────────────────────

export function playSFX(sound: string) {
  try {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();

    switch (sound) {
      case 'board_fill':
        // Ascending arpeggio
        [261, 329, 392, 523].forEach((f, i) =>
          setTimeout(() => playTone(f, 0.15, 'triangle', 0.2), i * 80)
        );
        break;

      case 'clue_select':
        playTone(880, 0.08, 'square', 0.15);
        setTimeout(() => playTone(1100, 0.12, 'square', 0.12), 90);
        break;

      case 'daily_double':
        // Rising fanfare
        [300, 400, 600, 800, 1000].forEach((f, i) =>
          setTimeout(() => playTone(f, 0.2, 'sawtooth', 0.18), i * 100)
        );
        setTimeout(() => playChord([600, 750, 900], 0.5, 0.15), 550);
        break;

      case 'buzzer_unlock':
        playTone(1200, 0.05, 'square', 0.1);
        break;

      case 'buzz_in':
        // Sharp ding
        playTone(1400, 0.08, 'triangle', 0.35);
        setTimeout(() => playTone(1600, 0.15, 'triangle', 0.25), 90);
        break;

      case 'correct':
        // Upbeat positive ding
        [523, 659, 784, 1047].forEach((f, i) =>
          setTimeout(() => playTone(f, 0.18, 'triangle', 0.25), i * 80)
        );
        break;

      case 'incorrect':
        // Descending buzz
        playTone(220, 0.08, 'sawtooth', 0.3);
        setTimeout(() => playTone(180, 0.1, 'sawtooth', 0.25), 80);
        setTimeout(() => playTone(150, 0.25, 'sawtooth', 0.2), 160);
        break;

      case 'countdown_tick':
        playTone(1000, 0.05, 'square', 0.08);
        break;

      case 'round_start':
        // Trumpet fanfare approximation
        const fanfare = [523, 659, 784, 1047, 784, 659, 523];
        fanfare.forEach((f, i) =>
          setTimeout(() => playTone(f, 0.2, 'sawtooth', 0.2), i * 120)
        );
        break;

      case 'round_transition':
        // Descending then ascending
        [800, 600, 400, 600, 800, 1000].forEach((f, i) =>
          setTimeout(() => playTone(f, 0.15, 'triangle', 0.2), i * 100)
        );
        break;

      case 'final_jeopardy_start':
        // Dramatic low chord
        playChord([130, 164, 196], 1.5, 0.2);
        setTimeout(() => playTone(98, 2.0, 'sine', 0.15), 500);
        break;

      case 'final_jeopardy_theme': {
        // 30-second approximation of the FJ "think" music
        // Classic ascending/descending pattern with rhythmic bass
        const ctx2 = getCtx();
        const melody = [
          { f: 392, d: 0.4 }, { f: 440, d: 0.2 }, { f: 494, d: 0.4 },
          { f: 523, d: 0.4 }, { f: 494, d: 0.2 }, { f: 440, d: 0.4 },
          { f: 392, d: 0.8 }, { f: 392, d: 0.2 }, { f: 440, d: 0.2 },
          { f: 494, d: 0.2 }, { f: 523, d: 0.2 }, { f: 587, d: 0.4 },
          { f: 659, d: 0.8 }, { f: 523, d: 0.2 }, { f: 494, d: 0.2 },
          { f: 440, d: 0.2 }, { f: 392, d: 0.4 }, { f: 349, d: 0.4 },
          { f: 330, d: 0.4 }, { f: 294, d: 0.8 },
        ];
        let t2 = ctx2.currentTime + 0.1;
        melody.forEach(({ f, d }) => {
          playTone(f, d * 0.85, 'triangle', 0.22, t2);
          // Bass
          playTone(f / 2, d * 0.85, 'sine', 0.1, t2);
          t2 += d;
        });
        // Repeat with slight variation
        melody.forEach(({ f, d }) => {
          playTone(f * 1.05, d * 0.85, 'triangle', 0.18, t2);
          playTone(f / 2, d * 0.85, 'sine', 0.08, t2);
          t2 += d;
        });
        break;
      }

      case 'reveal_answer':
        playTone(600, 0.12, 'triangle', 0.2);
        setTimeout(() => playTone(750, 0.2, 'triangle', 0.18), 140);
        break;

      case 'winner':
        // Victory fanfare
        const victory = [523, 523, 523, 415, 466, 523, 466, 523];
        victory.forEach((f, i) =>
          setTimeout(() => playTone(f, 0.3, 'sawtooth', 0.22), i * 150)
        );
        setTimeout(() => playChord([523, 659, 784, 1047], 1.5, 0.18), 1300);
        break;

      case 'confetti':
        [800, 1000, 1200, 900, 1100].forEach((f, i) =>
          setTimeout(() => playTone(f, 0.1, 'triangle', 0.15), i * 50)
        );
        break;

      default:
        break;
    }
  } catch (e) {
    // Audio context errors are non-fatal
    console.warn('[Audio] SFX error:', e);
  }
}

export function stopAllAudio() {
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
}
