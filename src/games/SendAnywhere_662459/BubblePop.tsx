'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

interface Bubble {
  id: number;
  x: number;   // % from left
  y: number;   // % from top
  size: number; // px radius
  maxSize: number;
  color: string;
  emoji: string;
  born: number; // timestamp
  ttl: number;  // ms until disappears
  popped: boolean;
  popAnim: boolean;
}

const BUBBLE_COLORS = [
  'rgba(139,92,246,0.7)',  // purple
  'rgba(6,182,212,0.7)',   // cyan
  'rgba(245,158,11,0.7)',  // amber
  'rgba(236,72,153,0.7)',  // pink
  'rgba(34,197,94,0.7)',   // green
  'rgba(59,130,246,0.7)',  // blue
];
const BUBBLE_EMOJIS = ['🐟','🐾','⭐','🎯','💎','🍖','🥕','🍓','🎀','🌟'];
const GAME_DURATION = 45_000; // 45 seconds
const SPAWN_INTERVAL = 900;

let idCounter = 0;
function makeBubble(): Bubble {
  const size = 28 + Math.random() * 32;
  return {
    id: idCounter++,
    x: 5 + Math.random() * 85,
    y: 10 + Math.random() * 75,
    size: 0,
    maxSize: size,
    color: BUBBLE_COLORS[Math.floor(Math.random() * BUBBLE_COLORS.length)],
    emoji: BUBBLE_EMOJIS[Math.floor(Math.random() * BUBBLE_EMOJIS.length)],
    born: Date.now(),
    ttl: 2500 + Math.random() * 2000,
    popped: false,
    popAnim: false,
  };
}

export default function BubblePop({ onGameEnd, petName = 'Your Pet' }: { onGameEnd: (xp: number) => void; petName?: string }) {
  const [phase, setPhase] = useState<'menu' | 'playing' | 'done'>('menu');
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(1);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [missed, setMissed] = useState(0);

  const scoreRef = useRef(0);
  const comboRef = useRef(1);
  const lastPopRef = useRef(0);
  const spawnRef = useRef<ReturnType<typeof setInterval>>();
  const clockRef = useRef<ReturnType<typeof setInterval>>();
  const growRef = useRef<ReturnType<typeof requestAnimationFrame>>();
  const startTime = useRef(0);

  const endGame = useCallback(() => {
    clearInterval(spawnRef.current);
    clearInterval(clockRef.current);
    cancelAnimationFrame(growRef.current!);
    setPhase('done');
  }, []);

  const start = useCallback(() => {
    idCounter = 0;
    scoreRef.current = 0;
    comboRef.current = 1;
    lastPopRef.current = 0;
    setScore(0);
    setCombo(1);
    setMissed(0);
    setTimeLeft(GAME_DURATION);
    setBubbles([]);
    startTime.current = Date.now();
    setPhase('playing');

    // Spawn bubbles
    spawnRef.current = setInterval(() => {
      setBubbles(prev => [...prev.filter(b => !b.popped || b.popAnim), makeBubble()]);
    }, SPAWN_INTERVAL);

    // Countdown clock
    clockRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const remaining = GAME_DURATION - elapsed;
      if (remaining <= 0) {
        setTimeLeft(0);
        endGame();
      } else {
        setTimeLeft(remaining);
      }
    }, 200);

    // Grow bubbles & expire them
    const grow = () => {
      setBubbles(prev => {
        const now = Date.now();
        let newMissed = 0;
        const updated = prev.map(b => {
          if (b.popped) return b;
          const age = now - b.born;
          if (age >= b.ttl) {
            newMissed++;
            return { ...b, popped: true, size: 0 };
          }
          const progress = Math.min(age / 300, 1); // grow in first 300ms
          return { ...b, size: b.maxSize * progress };
        });
        if (newMissed > 0) setMissed(m => m + newMissed);
        return updated.filter(b => !(b.popped && !b.popAnim));
      });
      growRef.current = requestAnimationFrame(grow);
    };
    growRef.current = requestAnimationFrame(grow);

  }, [endGame]);

  useEffect(() => () => {
    clearInterval(spawnRef.current);
    clearInterval(clockRef.current);
    cancelAnimationFrame(growRef.current!);
  }, []);

  const popBubble = (id: number) => {
    const now = Date.now();
    const gap = now - lastPopRef.current;
    lastPopRef.current = now;
    const newCombo = gap < 1200 ? Math.min(comboRef.current + 1, 8) : 1;
    comboRef.current = newCombo;
    setCombo(newCombo);
    const points = 10 * newCombo;
    scoreRef.current += points;
    setScore(scoreRef.current);

    setBubbles(prev => prev.map(b => b.id === id ? { ...b, popped: true, popAnim: true } : b));
    setTimeout(() => setBubbles(prev => prev.filter(b => b.id !== id)), 400);
  };

  const timePercent = (timeLeft / GAME_DURATION) * 100;
  const xpEarned = Math.floor(score * 0.8 + (missed > 10 ? 0 : 20));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 520, background: '#050505', position: 'relative', userSelect: 'none' }}>
      {/* Header */}
      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(6,182,212,0.15)', flexShrink: 0 }}>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#06b6d4', textShadow: '0 0 10px #06b6d4' }}>🫧 BUBBLE POP</span>
        <div style={{ display: 'flex', gap: 16, fontFamily: "'Space Mono', monospace", fontSize: 11 }}>
          <span style={{ color: '#e2e8f0' }}>SCORE: <strong style={{ color: '#06b6d4' }}>{score}</strong></span>
          {combo > 1 && <span style={{ color: '#f59e0b', fontWeight: 700, animation: 'pulse 0.5s ease' }}>×{combo} COMBO!</span>}
          <span style={{ color: '#ef4444' }}>MISS: {missed}</span>
        </div>
      </div>

      {/* Timer bar */}
      {phase === 'playing' && (
        <div style={{ height: 3, background: '#111', flexShrink: 0 }}>
          <div style={{ height: '100%', width: `${timePercent}%`, background: timePercent > 50 ? '#06b6d4' : timePercent > 20 ? '#f59e0b' : '#ef4444', transition: 'width 0.2s linear, background 0.5s' }} />
        </div>
      )}

      {/* Bubble arena */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {bubbles.filter(b => !b.popped).map(b => (
          <button key={b.id} onClick={() => !b.popped && popBubble(b.id)}
            style={{
              position: 'absolute',
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: b.size * 2,
              height: b.size * 2,
              transform: 'translate(-50%, -50%)',
              borderRadius: '50%',
              background: b.color,
              border: '2px solid rgba(255,255,255,0.3)',
              backdropFilter: 'blur(4px)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: b.size * 0.8,
              transition: 'transform 0.1s',
              boxShadow: `0 0 ${b.size}px ${b.color.replace('0.7', '0.3')}`,
              padding: 0,
              animation: 'bubbleFloat 3s ease-in-out infinite',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.1)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)')}
          >
            {b.emoji}
          </button>
        ))}

        {/* Overlays */}
        {phase !== 'playing' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
            {phase === 'menu' && (
              <>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: '#06b6d4', textShadow: '0 0 20px #06b6d4', textAlign: 'center' }}>🫧 BUBBLE POP</div>
                <p style={{ color: '#6b7280', fontSize: 12, textAlign: 'center' }}>Pop bubbles before they disappear!</p>
                <p style={{ color: '#374151', fontSize: 11, textAlign: 'center' }}>Chain pops for COMBO MULTIPLIER!</p>
                <p style={{ color: '#374151', fontSize: 10, textAlign: 'center' }}>45 seconds. {petName} is counting on you!</p>
              </>
            )}
            {phase === 'done' && (
              <>
                <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 13, color: '#06b6d4', textAlign: 'center' }}>⏰ TIME'S UP!</div>
                <p style={{ color: '#e2e8f0', fontSize: 13, margin: 0 }}>Final Score: <strong style={{ color: '#06b6d4' }}>{score}</strong></p>
                <p style={{ color: '#9ca3af', fontSize: 11, margin: 0 }}>Missed: {missed} bubbles</p>
                <p style={{ color: '#4ade80', fontSize: 12, margin: 0 }}>+{xpEarned} XP earned!</p>
              </>
            )}
            <button onClick={start} style={{ padding: '10px 28px', background: '#06b6d4', color: '#000', border: 'none', borderRadius: 8, fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              {phase === 'menu' ? '▶ START' : '▶ PLAY AGAIN'}
            </button>
            <button onClick={() => onGameEnd(phase === 'done' ? xpEarned : 0)} style={{ padding: '8px 20px', background: 'transparent', color: '#4b5563', border: '1px solid #374151', borderRadius: 8, fontFamily: "'Space Mono', monospace", fontSize: 11, cursor: 'pointer' }}>
              {phase === 'done' ? `Collect ${xpEarned} XP & Exit` : '← Back'}
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes bubbleFloat { 0%,100%{margin-top:0} 50%{margin-top:-6px} }`}</style>
    </div>
  );
}
