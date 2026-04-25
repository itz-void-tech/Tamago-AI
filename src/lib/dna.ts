// ============================================================
// DNA Evolution System
// Morphs pet visuals based on sentiment analysis
// ============================================================
import type { PetDNA } from './types';
import { DEFAULT_DNA } from './types';

export function evolveDNA(
  currentDNA: PetDNA,
  sentiment: { valence: number; arousal: number; dominance: number }
): PetDNA {
  const { valence, arousal, dominance } = sentiment;
  
  // Hue shifts based on emotional valence
  // Positive emotions -> warm colors (0-60), Negative -> cool (180-270)
  const hueShift = (valence - 0.5) * 20; // -10 to +10 per interaction
  let newHue = (currentDNA.hue + hueShift + 360) % 360;
  
  // Saturation increases with emotional intensity
  const satShift = (Math.abs(valence - 0.5) + Math.abs(arousal - 0.5)) * 5;
  const newSat = Math.max(30, Math.min(100, currentDNA.saturation + satShift * (valence > 0.5 ? 1 : -0.5)));
  
  // Vibration frequency responds to arousal
  const vibShift = (arousal - 0.5) * 0.1;
  const newVib = Math.max(0.5, Math.min(3.0, currentDNA.vibrationFreq + vibShift));
  
  // Particle density grows with positive interactions
  const particleShift = valence > 0.6 ? 0.02 : valence < 0.4 ? -0.01 : 0;
  const newParticles = Math.max(0, Math.min(1, currentDNA.particleDensity + particleShift));
  
  // Complexity increases with variety of emotions
  const complexityShift = Math.abs(dominance - 0.5) * 0.02;
  const newComplexity = Math.max(0, Math.min(1, currentDNA.complexity + complexityShift));
  
  // Aura glow based on overall positivity
  const auraShift = valence > 0.7 ? 0.03 : valence < 0.3 ? -0.02 : 0;
  const newAura = Math.max(0, Math.min(1, currentDNA.auraGlow + auraShift));
  
  return {
    hue: Math.round(newHue),
    saturation: Math.round(newSat),
    vibrationFreq: Math.round(newVib * 100) / 100,
    particleDensity: Math.round(newParticles * 100) / 100,
    complexity: Math.round(newComplexity * 100) / 100,
    auraGlow: Math.round(newAura * 100) / 100,
  };
}

export function getDNAStyles(dna: PetDNA): Record<string, string> {
  return {
    '--pet-hue': String(dna.hue),
    '--pet-saturation': `${dna.saturation}%`,
    '--pet-vibration': `${1000 / dna.vibrationFreq}ms`,
    '--pet-particle-density': String(dna.particleDensity),
    '--pet-complexity': String(dna.complexity),
    '--pet-aura-glow': String(dna.auraGlow),
    '--pet-color': `hsl(${dna.hue}, ${dna.saturation}%, 70%)`,
    '--pet-glow-color': `hsl(${dna.hue}, ${dna.saturation}%, 50%)`,
  };
}

export function getDNADescription(dna: PetDNA): string {
  const hueNames: Record<string, string> = {
    warm: 'Warm & Fiery',
    cool: 'Cool & Serene',
    neutral: 'Balanced',
  };
  
  const hueType = dna.hue < 60 || dna.hue > 300 ? 'warm' : dna.hue < 180 ? 'neutral' : 'cool';
  const energyLevel = dna.vibrationFreq > 2 ? 'Hyperactive' : dna.vibrationFreq > 1.2 ? 'Energetic' : 'Calm';
  const complexity = dna.complexity > 0.7 ? 'Complex' : dna.complexity > 0.3 ? 'Growing' : 'Simple';
  
  return `${hueNames[hueType]} | ${energyLevel} | ${complexity}`;
}
