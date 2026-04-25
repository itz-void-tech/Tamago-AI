// ============================================================
// Interaction Handlers — uses new frame system with pet types
// ============================================================
import { callLLM } from './llm';
import * as db from './db';
import { INTERACTION, type PetStatus, RANK_NAMES } from './types';
import { getFrames, type PetType } from './frames';

const PERSONALITY = `You are a virtual pet with a unique personality. Playful, sometimes sassy, strong opinions. Short cute sentences. Never break character.`;

function ctx(s: PetStatus): string {
  return `Name: ${s.name}, Rank: ${RANK_NAMES[s.rank]}, Hunger: ${s.hunger}/10, Happy: ${s.happiness}/10, Health: ${s.health}/10, Energy: ${s.energy}/10`;
}

export async function handleFeed(status: PetStatus, inputMeta: any = {}): Promise<{ animation: string[]; comment: string; metadata: Record<string, unknown> }> {
  const pet = (status.petType || 'cat') as PetType;
  if (status.hunger >= 9) {
    return { animation: getFrames(pet, 'full'), comment: "Too full! Can't eat anymore!", metadata: { refuse: true } };
  }
  const foodChoice = inputMeta.foodType || 'kibble';
  const foodEmoji = inputMeta.foodEmoji || '🍖';
  const result = await callLLM(`${PERSONALITY}\n${ctx(status)}\nOwner feeds you ${foodChoice} ${foodEmoji}.\nReturn JSON: {"refuse":false,"food":"name","icon":"${foodEmoji}","rating":1-5,"comment":"reaction"}`);
  try {
    const p = JSON.parse(result);
    const icon = p.icon || '[food]';
    return {
      animation: p.refuse ? getFrames(pet, 'vomit') : getFrames(pet, 'eating'),
      comment: `${icon} ${p.comment || 'Nom!'}`,
      metadata: { ...p, FOOD: icon },
    };
  } catch {
    return { animation: getFrames(pet, 'eating'), comment: '[food] Yummy!', metadata: { food: 'kibble', rating: 3 } };
  }
}

export async function handlePlay(status: PetStatus): Promise<{ animation: string[]; comment: string; metadata: Record<string, unknown> }> {
  const pet = (status.petType || 'cat') as PetType;
  const result = await callLLM(`${PERSONALITY}\n${ctx(status)}\nOwner plays with you. Pick activity.\nReturn JSON: {"refuse":false,"activity":"name","icon":"[text]","rating":1-5,"comment":"reaction"}`);
  try {
    const p = JSON.parse(result);
    return {
      animation: p.refuse ? getFrames(pet, 'idle') : getFrames(pet, 'playing'),
      comment: `${p.icon || '[toy]'} ${p.comment || 'Wheee!'}`,
      metadata: { ...p, TOY: p.icon || '[toy]' },
    };
  } catch {
    return { animation: getFrames(pet, 'playing'), comment: '[ball] Fun!', metadata: { activity: 'ball', rating: 4 } };
  }
}

export async function handleBath(status: PetStatus) {
  const pet = (status.petType || 'cat') as PetType;
  return { animation: getFrames(pet, 'bath'), comment: status.poop > 3 ? '*splashy splashy* Finally clean!' : 'Do I really need this? *grumbles*', metadata: { cleaned: true } };
}

export async function handleDiscipline(status: PetStatus, inputMeta: any = {}) {
  const pet = (status.petType || 'cat') as PetType;
  const reason = inputMeta.reason || 'being naughty';
  const result = await callLLM(`${PERSONALITY}\n${ctx(status)}\nOwner disciplines you for: ${reason}. React accordingly.\nReturn JSON: {"icon":"[!]","rating":1-5,"comment":"reaction"}`);
  try {
    const p = JSON.parse(result);
    return { animation: getFrames(pet, 'discipline'), comment: `${p.icon || '[!]'} ${p.comment || 'Hmph!'}`, metadata: { ...p, ICON: p.icon || '[!]' } };
  } catch {
    return { animation: getFrames(pet, 'discipline'), comment: '[!] What did I do?!', metadata: { rating: 2 } };
  }
}

export async function handleHospital(status: PetStatus) {
  const pet = (status.petType || 'cat') as PetType;
  return { animation: getFrames(pet, 'sick'), comment: status.health < 4 ? 'Thank you for the doctor visit...' : 'I feel fine though!', metadata: { visited: true } };
}

export async function handleSleep(status: PetStatus) {
  const pet = (status.petType || 'cat') as PetType;
  return { animation: getFrames(pet, 'sleeping'), comment: status.energy < 4 ? 'So... sleepy... *yawns*' : 'A nap sounds nice...', metadata: { sleeping: true } };
}

export function updateStatusAfterInteraction(status: PetStatus, type: INTERACTION, metadata: Record<string, unknown>): PetStatus {
  const s = { ...status };
  switch (type) {
    case INTERACTION.FEED:
      if (!metadata.refuse) { s.hunger = Math.min(10, s.hunger + 2); s.happiness = Math.min(10, s.happiness + 1); s.poop = Math.min(10, s.poop + 1); s.energy = Math.max(0, s.energy - 1); }
      break;
    case INTERACTION.PLAY:
      if (!metadata.refuse) { s.happiness = Math.min(10, s.happiness + 2); s.hunger = Math.max(0, s.hunger - 1); s.energy = Math.max(0, s.energy - 2); s.health = Math.min(10, s.health + 1); }
      break;
    case INTERACTION.BATH:
      s.poop = Math.max(0, s.poop - 3); s.happiness = Math.min(10, s.happiness + 1); break;
    case INTERACTION.DISCIPLINE:
      s.happiness = Math.max(0, s.happiness - 1); s.isAngry = true; break;
    case INTERACTION.GO_TO_HOSPITAL:
      s.health = Math.min(10, s.health + 3); s.happiness = Math.max(0, s.happiness - 1); break;
    case INTERACTION.SLEEP:
      s.energy = Math.min(10, s.energy + 4); s.happiness = Math.min(10, s.happiness + 1); break;
    case INTERACTION.CHAT:
      s.syncFrequency = Math.min(100, s.syncFrequency + 1); s.happiness = Math.min(10, s.happiness + 1); break;
  }
  return s;
}
