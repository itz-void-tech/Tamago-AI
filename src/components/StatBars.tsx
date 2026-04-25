'use client';
import { Apple, Heart, Shield, Zap, Droplets } from 'lucide-react';

interface Props {
  hunger: number; happiness: number; health: number; energy: number; poop: number;
}

const STATS = [
  { key: 'hunger', label: 'Hunger', icon: Apple, colors: 'bg-white/70' },
  { key: 'happiness', label: 'Happy', icon: Heart, colors: 'bg-white/60' },
  { key: 'health', label: 'Health', icon: Shield, colors: 'bg-white/50' },
  { key: 'energy', label: 'Energy', icon: Zap, colors: 'bg-white/55' },
  { key: 'poop', label: 'Poop', icon: Droplets, colors: 'bg-white/45' },
] as const;

export default function StatBars(props: Props) {
  return (
    <div className="space-y-3">
      {STATS.map(s => {
        const val = props[s.key as keyof Props];
        const pct = val * 10;
        return (
          <div key={s.key}>
            <div className="flex justify-between text-[11px] mb-1.5">
              <span className="flex items-center gap-1.5" style={{ color: '#888' }}>
                <s.icon size={11} /> {s.label}
              </span>
              <span className="tabular-nums" style={{ color: '#555', fontFamily: 'Space Mono, monospace', fontSize: '10px' }}>{val}/10</span>
            </div>
            <div className="stat-bar">
              <div
                className="stat-bar-fill"
                style={{
                  width: `${pct}%`,
                  background: pct > 60 ? 'rgba(255,255,255,0.7)' : pct > 30 ? 'rgba(255,255,255,0.4)' : 'rgba(255,100,100,0.5)',
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
