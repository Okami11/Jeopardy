'use client';

import { useState, useEffect, useRef } from 'react';
import { playSFX } from '@/lib/soundManager';

interface Props {
  endTime: number;
  totalMs: number;
  label?: string;
  onExpire?: () => void;
}

export default function CountdownTimer({ endTime, totalMs, label, onExpire }: Props) {
  const [remaining, setRemaining] = useState(totalMs);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const lastTickRef = useRef(0);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const left = Math.max(0, endTime - now);
      setRemaining(left);

      // Tick sound in last 5 seconds
      const secs = Math.ceil(left / 1000);
      if (secs <= 5 && secs > 0 && secs !== lastTickRef.current) {
        lastTickRef.current = secs;
        playSFX('countdown_tick');
      }

      if (left <= 0) {
        clearInterval(intervalRef.current!);
        onExpire?.();
      }
    }, 100);

    return () => clearInterval(intervalRef.current!);
  }, [endTime, onExpire]);

  const pct = remaining / totalMs;
  const seconds = Math.ceil(remaining / 1000);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);

  const color = pct > 0.5 ? '#22c55e' : pct > 0.25 ? '#f59e0b' : '#ef4444';

  return (
    <div className="flex flex-col items-center gap-2">
      {label && <p className="text-sm text-[#a0b0e0]">{label}</p>}
      <div className="relative w-24 h-24">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 96 96">
          {/* Background circle */}
          <circle
            cx="48" cy="48" r={radius}
            fill="none" stroke="rgba(42,60,170,0.5)" strokeWidth="8"
          />
          {/* Progress arc */}
          <circle
            cx="48" cy="48" r={radius}
            fill="none" stroke={color} strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="timer-ring"
            style={{ transition: 'stroke-dashoffset 0.1s linear, stroke 0.3s ease' }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center font-display font-bold text-3xl"
          style={{ color }}
        >
          {seconds}
        </div>
      </div>
    </div>
  );
}
