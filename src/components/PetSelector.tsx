'use client';
import { useState } from 'react';
import { PET_INFO, type PetType, getFrames, applyEyes, applyPlaceholders } from '@/lib/frames';

export default function PetSelector({ onSelect }: { onSelect: (pet: PetType, name: string) => void }) {
  const [selected, setSelected] = useState<PetType>('cat');
  const [name, setName] = useState('');

  const previewFrame = () => {
    const frames = getFrames(selected, 'idle');
    let f = applyEyes(frames[0] || '', 'center');
    f = applyPlaceholders(f, {});
    return f;
  };

  return (
    <div className="auth-container">
      <div className="auth-card" style={{ maxWidth: '480px' }}>
        <h1 className="auth-title" style={{ marginBottom: '4px' }}>Choose Your Pet</h1>
        <p className="auth-subtitle" style={{ marginBottom: '24px' }}>Pick a companion and give it a name</p>

        <div className="grid grid-cols-5 gap-3 mb-6">
          {(Object.keys(PET_INFO) as PetType[]).map(pet => (
            <button key={pet} onClick={() => setSelected(pet)}
              style={{
                padding: '12px 8px',
                borderRadius: '12px',
                border: selected === pet ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.06)',
                background: selected === pet ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                transition: 'all 0.25s',
                transform: selected === pet ? 'scale(1.05)' : 'scale(1)',
              }}>
              <div style={{ fontSize: '24px', marginBottom: '4px' }}>{PET_INFO[pet].emoji}</div>
              <div style={{ fontSize: '10px', color: selected === pet ? '#fff' : '#666' }}>{PET_INFO[pet].name}</div>
            </button>
          ))}
        </div>

        {/* Preview */}
        <div style={{
          background: '#080808',
          border: '1px solid rgba(255,255,255,0.06)',
          borderRadius: '12px',
          padding: '20px',
          textAlign: 'center',
          marginBottom: '16px',
        }}>
          <pre className="pet-display" style={{ fontSize: '14px' }}>{previewFrame()}</pre>
        </div>

        <p style={{ fontSize: '11px', color: '#555', textAlign: 'center', marginBottom: '16px' }}>{PET_INFO[selected].desc}</p>

        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Name your pet..."
          className="auth-input"
          style={{ textAlign: 'center', marginBottom: '16px' }}
          maxLength={20}
        />

        <button
          onClick={() => onSelect(selected, name || PET_INFO[selected].name)}
          className="auth-btn"
        >
          Begin Journey →
        </button>
      </div>
    </div>
  );
}
