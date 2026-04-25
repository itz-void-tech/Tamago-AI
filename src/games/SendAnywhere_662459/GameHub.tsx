'use client';
import { useState } from 'react';
import SnakeGame from './SnakeGame';
import BubblePop from './BubblePop';
import MemoryMatch from './MemoryMatch';

type GameId = 'snake' | 'bubble' | 'memory';

interface GameInfo {
  id: GameId;
  title: string;
  emoji: string;
  desc: string;
  howto: string;
  color: string;
  xpRange: string;
  difficulty: string;
  preview: string[];
}

const GAMES: GameInfo[] = [
  {
    id: 'snake',
    title: 'Snake Hunt',
    emoji: '🐍',
    desc: 'Guide your pet to catch food — but don\'t crash!',
    howto: '← → ↑ ↓ or WASD',
    color: '#22c55e',
    xpRange: '20–150',
    difficulty: 'Medium',
    preview: [
      '·  ·  ·  🐟  ·',
      '·  ▶  █  ·  ·',
      '·  ·  █  ·  ·',
      '·  ·  █  ·  ·',
    ],
  },
  {
    id: 'bubble',
    title: 'Bubble Pop',
    emoji: '🫧',
    desc: 'Pop bubbles before they float away! Chain combos for bonus XP.',
    howto: 'Click / Tap bubbles',
    color: '#06b6d4',
    xpRange: '10–100',
    difficulty: 'Easy',
    preview: [
      '  🫧  🫧  ',
      '🫧     🫧',
      '  🫧  🫧  ',
    ],
  },
  {
    id: 'memory',
    title: 'Memory Match',
    emoji: '🃏',
    desc: 'Flip cards to find matching pairs. Fewer moves = more XP!',
    howto: 'Click to flip cards',
    color: '#a855f7',
    xpRange: '10–100',
    difficulty: 'Hard',
    preview: [
      '🃏 🐟 🃏 🐾',
      '⭐ 🃏 🐱 🃏',
      '🃏 🐶 🃏 🥕',
    ],
  },
];

export default function GameHub({
  onGameEnd,
  petName = 'Your Pet',
}: {
  onGameEnd: (xp: number) => void;
  petName?: string;
}) {
  const [activeGame, setActiveGame] = useState<GameId | null>(null);

  const handleGameEnd = (xp: number) => {
    setActiveGame(null);
    if (xp > 0) onGameEnd(xp);
  };

  // Render active game
  if (activeGame === 'snake') return <SnakeGame onGameEnd={handleGameEnd} petName={petName} />;
  if (activeGame === 'bubble') return <BubblePop onGameEnd={handleGameEnd} petName={petName} />;
  if (activeGame === 'memory') return <MemoryMatch onGameEnd={handleGameEnd} petName={petName} />;

  // Hub screen
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: '#fff', margin: '0 0 6px', letterSpacing: 2 }}>
          🎮 MINI GAMES
        </h2>
        <p style={{ color: '#4b5563', fontSize: 11, margin: 0 }}>
          Play games to earn XP and rank up {petName}!
        </p>
      </div>

      {/* Game cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {GAMES.map(game => (
          <button
            key={game.id}
            onClick={() => setActiveGame(game.id)}
            style={{
              background: 'rgba(10, 10, 10, 0.4)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: `1px solid ${game.color}22`,
              borderRadius: 16,
              padding: '16px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
              display: 'flex',
              gap: 16,
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = `${game.color}55`;
              e.currentTarget.style.background = `${game.color}15`;
              e.currentTarget.style.backdropFilter = 'blur(12px)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = `0 8px 24px ${game.color}20`;
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = `${game.color}22`;
              e.currentTarget.style.background = 'rgba(10, 10, 10, 0.4)';
              e.currentTarget.style.backdropFilter = 'blur(10px)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {/* Glow accent bar */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: game.color, borderRadius: '4px 0 0 4px', opacity: 0.6 }} />

            {/* Preview */}
            <div style={{
              flexShrink: 0,
              width: 90,
              background: '#050505',
              border: `1px solid ${game.color}22`,
              borderRadius: 10,
              padding: '8px 6px',
              fontFamily: "'Press Start 2P', monospace",
              fontSize: 10,
              lineHeight: 1.8,
              color: game.color,
              textAlign: 'center',
              whiteSpace: 'pre',
              textShadow: `0 0 6px ${game.color}44`,
            }}>
              {game.preview.map((line, i) => <div key={i}>{line}</div>)}
            </div>

            {/* Info */}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>{game.emoji}</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>{game.title}</span>
              </div>
              <p style={{ color: '#6b7280', fontSize: 11, margin: '0 0 8px', lineHeight: 1.5 }}>{game.desc}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ padding: '2px 8px', background: `${game.color}15`, border: `1px solid ${game.color}30`, borderRadius: 4, fontSize: 10, color: game.color, fontFamily: "'Space Mono', monospace" }}>
                  {game.howto}
                </span>
                <span style={{ padding: '2px 8px', background: 'rgba(250,204,21,0.08)', border: '1px solid rgba(250,204,21,0.2)', borderRadius: 4, fontSize: 10, color: '#facc15', fontFamily: "'Space Mono', monospace" }}>
                  +{game.xpRange} XP
                </span>
                <span style={{ padding: '2px 8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 4, fontSize: 10, color: '#6b7280', fontFamily: "'Space Mono', monospace" }}>
                  {game.difficulty}
                </span>
              </div>
            </div>

            {/* Play arrow */}
            <div style={{ color: game.color, fontSize: 20, flexShrink: 0, marginRight: 4 }}>▶</div>
          </button>
        ))}
      </div>

      {/* Footer tip */}
      <p style={{ textAlign: 'center', color: '#374151', fontSize: 10, fontFamily: "'Space Mono', monospace" }}>
        XP earned is saved to your pet's account ✨
      </p>
    </div>
  );
}
