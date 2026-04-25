'use client';
import { useState, useEffect, useRef } from 'react';

const CARD_EMOJIS = ['🐟','🐾','⭐','🍖','🥕','🐱','🐶','🐰'];
const ALL_CARDS = [...CARD_EMOJIS, ...CARD_EMOJIS];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeCards(): Card[] {
  return shuffle(ALL_CARDS).map((emoji, id) => ({ id, emoji, flipped: false, matched: false }));
}

export default function MemoryMatch({ onGameEnd, petName = 'Your Pet' }: { onGameEnd: (xp: number) => void; petName?: string }) {
  const [phase, setPhase] = useState<'menu' | 'playing' | 'done'>('menu');
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [locked, setLocked] = useState(false);
  const [wrongPair, setWrongPair] = useState<number[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval>>();
  const startTime = useRef(0);

  const start = () => {
    setCards(makeCards());
    setSelected([]);
    setMoves(0);
    setMatches(0);
    setElapsed(0);
    setLocked(false);
    setWrongPair([]);
    setPhase('playing');
    startTime.current = Date.now();
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime.current) / 1000));
    }, 1000);
  };

  useEffect(() => () => clearInterval(timerRef.current), []);

  // End game when all matched
  useEffect(() => {
    if (matches === CARD_EMOJIS.length && phase === 'playing') {
      clearInterval(timerRef.current);
      setPhase('done');
    }
  }, [matches, phase]);

  const flipCard = (id: number) => {
    if (locked || phase !== 'playing') return;
    const card = cards.find(c => c.id === id);
    if (!card || card.flipped || card.matched) return;
    if (selected.includes(id)) return;

    const newSelected = [...selected, id];
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));

    if (newSelected.length === 2) {
      setMoves(m => m + 1);
      setLocked(true);
      const [a, b] = newSelected.map(sid => cards.find(c => c.id === sid)!);
      const [bCard] = cards.filter(c => c.id === id);
      const aCard = cards.find(c => c.id === newSelected[0])!;

      setTimeout(() => {
        if (aCard.emoji === bCard.emoji) {
          // Match!
          setCards(prev => prev.map(c => newSelected.includes(c.id) ? { ...c, matched: true } : c));
          setMatches(m => m + 1);
        } else {
          // No match
          setWrongPair(newSelected);
          setTimeout(() => {
            setCards(prev => prev.map(c => newSelected.includes(c.id) ? { ...c, flipped: false } : c));
            setWrongPair([]);
          }, 500);
        }
        setSelected([]);
        setLocked(false);
      }, 700);
      setSelected(newSelected);
    } else {
      setSelected(newSelected);
    }
  };

  const totalCards = ALL_CARDS.length;
  const xpEarned = Math.max(10, 80 - moves * 2 + Math.max(0, 60 - elapsed));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 520, background: '#050505', padding: 16, gap: 12 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 10, color: '#a855f7', textShadow: '0 0 10px #a855f7' }}>🃏 MEMORY MATCH</span>
        {phase === 'playing' && (
          <div style={{ display: 'flex', gap: 16, fontFamily: "'Space Mono', monospace", fontSize: 11 }}>
            <span style={{ color: '#a855f7' }}>MOVES: {moves}</span>
            <span style={{ color: '#9ca3af' }}>PAIRS: {matches}/{CARD_EMOJIS.length}</span>
            <span style={{ color: '#6b7280' }}>⏱ {elapsed}s</span>
          </div>
        )}
      </div>

      {/* Card Grid */}
      {phase === 'playing' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, flex: 1, maxWidth: 480, margin: '0 auto', width: '100%' }}>
          {cards.map(card => {
            const isWrong = wrongPair.includes(card.id);
            const isFlipped = card.flipped || card.matched;
            return (
              <button
                key={card.id}
                onClick={() => flipCard(card.id)}
                disabled={card.matched || locked}
                style={{
                  aspectRatio: '1',
                  borderRadius: 12,
                  border: card.matched
                    ? '2px solid rgba(168,85,247,0.5)'
                    : isWrong
                    ? '2px solid rgba(239,68,68,0.6)'
                    : isFlipped
                    ? '2px solid rgba(168,85,247,0.3)'
                    : '1px solid rgba(255,255,255,0.06)',
                  background: card.matched
                    ? 'rgba(168,85,247,0.15)'
                    : isWrong
                    ? 'rgba(239,68,68,0.1)'
                    : isFlipped
                    ? 'rgba(168,85,247,0.08)'
                    : 'rgba(255,255,255,0.03)',
                  fontSize: isFlipped ? 28 : 22,
                  cursor: card.matched || locked ? 'default' : 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)',
                  transform: isWrong ? 'scale(0.95)' : card.matched ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: card.matched ? '0 0 12px rgba(168,85,247,0.3)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: 0,
                }}
              >
                {isFlipped ? card.emoji : '?'}
              </button>
            );
          })}
        </div>
      )}

      {/* Overlays */}
      {phase !== 'playing' && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 14 }}>
          {phase === 'menu' && (
            <>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 13, color: '#a855f7', textShadow: '0 0 20px #a855f7', textAlign: 'center' }}>🃏 MEMORY MATCH</div>
              <p style={{ color: '#6b7280', fontSize: 12, textAlign: 'center' }}>Find all matching pairs!</p>
              <p style={{ color: '#4b5563', fontSize: 11, textAlign: 'center' }}>Fewer moves = more XP ⭐</p>
              <p style={{ color: '#374151', fontSize: 11, textAlign: 'center' }}>Help {petName} remember!</p>
            </>
          )}
          {phase === 'done' && (
            <>
              <div style={{ fontFamily: "'Press Start 2P', monospace", fontSize: 12, color: '#a855f7', textShadow: '0 0 20px #a855f7', textAlign: 'center', lineHeight: 1.8 }}>
                🎉 YOU WIN!
              </div>
              <div style={{ display: 'flex', gap: 24, textAlign: 'center' }}>
                <div><p style={{ color: '#9ca3af', fontSize: 11, margin: 0 }}>MOVES</p><p style={{ color: '#e2e8f0', fontSize: 20, fontWeight: 700, margin: 0 }}>{moves}</p></div>
                <div><p style={{ color: '#9ca3af', fontSize: 11, margin: 0 }}>TIME</p><p style={{ color: '#e2e8f0', fontSize: 20, fontWeight: 700, margin: 0 }}>{elapsed}s</p></div>
                <div><p style={{ color: '#4ade80', fontSize: 11, margin: 0 }}>XP</p><p style={{ color: '#4ade80', fontSize: 20, fontWeight: 700, margin: 0 }}>+{xpEarned}</p></div>
              </div>
              <p style={{ color: moves <= 10 ? '#f59e0b' : '#6b7280', fontSize: 11, textAlign: 'center', margin: 0 }}>
                {moves <= 10 ? '🏆 Perfect Memory!' : moves <= 16 ? '🌟 Great job!' : '💪 Keep practicing!'}
              </p>
            </>
          )}
          <button onClick={start} style={{ marginTop: 8, padding: '10px 28px', background: '#a855f7', color: '#fff', border: 'none', borderRadius: 8, fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
            {phase === 'menu' ? '▶ START' : '▶ PLAY AGAIN'}
          </button>
          <button onClick={() => onGameEnd(phase === 'done' ? xpEarned : 0)} style={{ padding: '8px 20px', background: 'transparent', color: '#4b5563', border: '1px solid #374151', borderRadius: 8, fontFamily: "'Space Mono', monospace", fontSize: 11, cursor: 'pointer' }}>
            {phase === 'done' ? `Collect ${xpEarned} XP & Exit` : '← Back'}
          </button>
        </div>
      )}
    </div>
  );
}
