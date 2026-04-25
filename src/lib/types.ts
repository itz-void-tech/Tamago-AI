// ============================================================
// AI-Tamago Type Definitions
// ============================================================

export interface PetStatus {
  hunger: number;      // 0-10 (0 = starving, 10 = stuffed)
  happiness: number;   // 0-10
  health: number;      // 0-10
  energy: number;      // 0-10 (new: for sleep system)
  poop: number;        // 0-10
  age: number;         // ticks lived
  comment: string;     // pet's current thought
  name: string;        // custom pet name
  petType: string;     // cat, dog, bunny, fox, panda
  rank: number;        // evolution rank (0-5)
  syncFrequency: number; // relationship level (0-100)
  xp: number;         // experience points for rank up
  isAngry: boolean;    // new: for scolding/reconciliation system
}

export interface PetDNA {
  hue: number;           // 0-360 color hue
  saturation: number;    // 0-100
  vibrationFreq: number; // 0.5-3.0 animation speed multiplier
  particleDensity: number; // 0-1 how many particles
  complexity: number;    // 0-1 visual complexity
  auraGlow: number;      // 0-1 glow intensity
}

export interface Accessory {
  id: string;
  name: string;
  type: 'hat' | 'vest' | 'shades';
  icon: string;         // lucide icon name
  cost: number;         // xp cost
  ascii: string[];      // ascii overlay lines
}

export interface DailyTask {
  id: string;
  description: string;
  type: 'feed' | 'play' | 'chat' | 'bath' | 'discipline';
  target: number;       // how many times
  current: number;      // current progress
  xpReward: number;
  completed: boolean;
  cycle?: 'daily' | 'weekly' | 'monthly';
}

export interface JournalEntry {
  id: number;
  thought: string;
  sentiment: string;
  createdAt: string;
  unlockLevel: number;  // sync frequency needed to read
}

export interface InteractionResult {
  animation: string[];
  status: string;
  state: PetStatus;
  dna?: PetDNA;
}

export interface ChatMessage {
  role: 'user' | 'pet';
  content: string;
  timestamp: string;
}

export enum INTERACTION {
  FEED = 0,
  PLAY = 1,
  LIGHTS_OUT = 2,
  BATH = 3,
  GO_TO_HOSPITAL = 4,
  DISCIPLINE = 5,
  CHAT = 6,
  SLEEP = 7,
}

export const RANK_NAMES = [
  'Egg',        // Rank 0
  'Hatchling',  // Rank 1
  'Juvenile',   // Rank 2
  'Adult',      // Rank 3
  'Elder',      // Rank 4
  'Legendary',  // Rank 5
];

export const RANK_XP_THRESHOLDS = [0, 50, 150, 350, 700, 1200];

export const DEFAULT_STATUS: PetStatus = {
  hunger: 5,
  happiness: 5,
  health: 7,
  energy: 8,
  poop: 0,
  age: 0,
  comment: "Hello! I just hatched! Give me a name!",
  name: "Tamago",
  petType: "cat",
  rank: 0,
  syncFrequency: 0,
  xp: 0,
  isAngry: false,
};

export const DEFAULT_DNA: PetDNA = {
  hue: 180,
  saturation: 70,
  vibrationFreq: 1.0,
  particleDensity: 0.3,
  complexity: 0.2,
  auraGlow: 0.1,
};
