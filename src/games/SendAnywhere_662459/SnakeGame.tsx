'use client';
import { useState, useEffect, useRef, useCallback } from 'react';

type Pos = { x: number; y: number };
type Dir = { x: number; y: number };

const W = 22;
const H = 15;
const SPEED = 140;
const FOOD_EMOJIS = ['🐟','🍖','🥕','🍓','⭐','🎯','🍕','🍦','🧁','🍒'];

function randomFoodPos(snake: Pos[]): Pos {
  let pos: Pos;
  do { pos = { x: Math.floor(Math.random() * W), y: Math.floor(Math.random() * H) }; }
  while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

export default function SnakeGame({ onGameEnd, petName = 'Your Pet' }: { onGameEnd: (xp: number) => void; petName?: string }) {
  // All mutable game state in a single ref to avoid stale closures
  const G = useRef({
    snake: [{ x: 11, y: 7 }] as Pos[],
    dir: { x: 1, y: 0 } as Dir,
    nextDir: { x: 1, y: 0 } as Dir,
    food: { x: 5, y: 5 } as Pos,
    foodEmoji: '🐟',
    score: 0,
    running: false,
    dead: false,
    frameCount: 0,
  });

  const [tick, setTick] = useState(0);       // force re-render
  const [phase, setPhase] = useState<'menu' | 'playing' | 'dead'>('menu');
  const [finalScore, setFinalScore] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const containerRef = useRef<HTMLDivElement>(null);

  const gameTick = useCallback(() => {
    const g = G.current;
    if (!g.running) return;
    g.dir = g.nextDir;
    const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y };
    // Wall or self collision
    if (head.x < 0 || head.x >= W || head.y < 0 || head.y >= H || g.snake.some(s => s.x === head.x && s.y === head.y)) {
      g.running = false;
      g.dead = true;
      setFinalScore(g.score);
      setPhase('dead');
      clearInterval(timerRef.current);
      return;
    }
    const ate = head.x === g.food.x && head.y === g.food.y;
    if (ate) {
      g.score += 10;
      g.food = randomFoodPos(g.snake);
      g.foodEmoji = FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];
    }
    g.snake = [head, ...(ate ? g.snake : g.snake.slice(0, -1))];
    g.frameCount++;
    setTick(t => t + 1);
  }, []);

  const start = useCallback(() => {
    const g = G.current;
    g.snake = [{ x: 11, y: 7 }];
    g.dir = { x: 1, y: 0 };
    g.nextDir = { x: 1, y: 0 };
    g.food = randomFoodPos(g.snake);
    g.foodEmoji = FOOD_EMOJIS[Math.floor(Math.random() * FOOD_EMOJIS.length)];
    g.score = 0;
    g.dead = false;
    g.running = true;
    g.frameCount = 0;
    setPhase('playing');
    clearInterval(timerRef.current);
    timerRef.current = setInterval(gameTick, SPEED);
    setTimeout(() => containerRef.current?.focus(), 50);
  }, [gameTick]);

  useEffect(() => () => clearInterval(timerRef.current), []);

  const handleKey = useCallback((e: KeyboardEvent) => {
    const g = G.current;
    if (!g.running) return;
    const dirs: Record<string, Dir> = {
      ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 }, s: { x: 0, y: 1 }, a: { x: -1, y: 0 }, d: { x: 1, y: 0 },
    };
    const next = dirs[e.key];
    if (!next) return;
    e.preventDefault();
    if (next.x + g.dir.x === 0 && next.y + g.dir.y === 0) return; // no 180
    g.nextDir = next;
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  const nudge = (dir: Dir) => {
    const g = G.current;
    if (!g.running) return;
    if (dir.x + g.dir.x === 0 && dir.y + g.dir.y === 0) return;
    g.nextDir = dir;
  };

  // Build grid
  const g = G.current;
  const cells = Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_, x) => {
    const isHead = g.snake[0]?.x === x && g.snake[0]?.y === y;
    const bodyIdx = g.snake.slice(1).findIndex(s => s.x === x && s.y === y);
    const isFood = g.food.x === x && g.food.y === y;
    if (isHead) return { type: 'head' };
    if (bodyIdx !== -1) return { type: 'body', idx: bodyIdx };
    if (isFood) return { type: 'food' };
    return { type: 'empty' };
  }));

  const headChar: Record<string, string> = { '1,0': '▶', '-1,0': '◀', '0,-1': '▲', '0,1': '▼' };
  const hc = headChar[`${g.dir.x},${g.dir.y}`] || '●';
  const xpEarned = Math.floor(finalScore * 1.5);

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={e => {
        const dirs: Record<string, Dir> = { ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 }, ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 } };
        const next = dirs[e.key];
        if (next) { e.preventDefault(); nudge(next); }
      }}
      style={{ outline: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '16px', background: '#050505', minHeight: '100%', position: 'relative' }}
    >
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 11, color: '#22c55e', textShadow: '0 0 10px #22c55e' }}>🐍 SNAKE HUNT</span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: '#86efac' }}>
          SCORE: {g.score} &nbsp;|&nbsp; LEN: {g.snake.length}
        </span>
      </div>

      {/* Grid */}
      <div style={{ position: 'relative', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, overflow: 'hidden', boxShadow: '0 0 30px rgba(34,197,94,0.1)', background: '#050505' }}>
        {cells.map((row, y) => (
          <div key={y} style={{ display: 'flex' }}>
            {row.map((cell, x) => (
              <div key={x} style={{
                width: 20, height: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: cell.type === 'food' ? 13 : 11,
                fontFamily: "'Press Start 2P', monospace",
                background: cell.type === 'head' ? 'rgba(34,197,94,0.3)' : cell.type === 'body' ? `rgba(34,197,94,${0.08 + (cell.idx ?? 0) * 0.005})` : 'transparent',
                color: cell.type === 'head' ? '#4ade80' : cell.type === 'body' ? '#166534' : '#1f2937',
                textShadow: cell.type === 'head' ? '0 0 8px #22c55e' : 'none',
                borderRadius: cell.type === 'head' ? 4 : 0,
                transition: 'background 0.1s',
              }}>
                {cell.type === 'head' ? hc : cell.type === 'body' ? '█' : cell.type === 'food' ? g.foodEmoji : '·'}
              </div>
            ))}
          </div>
        ))}

        {/* Overlay */}
        {phase !== 'playing' && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
            {phase === 'menu' && <>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 14, color: '#4ade80', textShadow: '0 0 20px #22c55e', textAlign: 'center' }}>🐍 SNAKE HUNT</div>
              <p style={{ color: '#6b7280', fontSize: 11, textAlign: 'center' }}>Help {petName} catch food!</p>
              <p style={{ color: '#374151', fontSize: 10, textAlign: 'center' }}>Use ← → ↑ ↓ or WASD</p>
            </>}
            {phase === 'dead' && <>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 13, color: '#ef4444', textShadow: '0 0 15px #ef4444', textAlign: 'center' }}>💀 GAME OVER</div>
              <p style={{ color: '#9ca3af', fontSize: 12, textAlign: 'center', margin: 0 }}>Score: {finalScore}</p>
              <p style={{ color: '#4ade80', fontSize: 11, textAlign: 'center', margin: 0 }}>+{xpEarned} XP earned!</p>
            </>}
            <button onClick={start} style={{ marginTop: 8, padding: '10px 24px', background: '#22c55e', color: '#000', border: 'none', borderRadius: 8, fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, cursor: 'pointer', letterSpacing: 1 }}>
              {phase === 'menu' ? '▶ START' : '▶ PLAY AGAIN'}
            </button>
            <button onClick={() => onGameEnd(phase === 'dead' ? xpEarned : 0)} style={{ padding: '8px 20px', background: 'transparent', color: '#4b5563', border: '1px solid #374151', borderRadius: 8, fontFamily: "'Space Mono', monospace", fontSize: 11, cursor: 'pointer' }}>
              {phase === 'dead' ? `Collect ${xpEarned} XP & Exit` : '← Back'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile D-Pad */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginTop: 4 }}>
        {[
          [null, { x: 0, y: -1 }, null],
          [{ x: -1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 0 }],
        ].map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 4 }}>
            {row.map((dir, ci) => (
              <button key={ci} onClick={() => dir && nudge(dir)}
                style={{ width: 44, height: 44, background: dir ? 'rgba(34,197,94,0.1)' : 'transparent', border: dir ? '1px solid rgba(34,197,94,0.2)' : 'none', borderRadius: 8, color: '#22c55e', fontSize: 18, cursor: dir ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {dir ? (dir.x === 0 ? (dir.y === -1 ? '▲' : '▼') : (dir.x === -1 ? '◀' : '▶')) : ''}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
