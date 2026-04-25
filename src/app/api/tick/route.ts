// ============================================================
// POST /api/tick — Game loop tick (called periodically)
// ============================================================
import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { callLLM } from '@/lib/llm';
import { INTERACTION, RANK_NAMES } from '@/lib/types';

export async function POST() {
  try {
    const status = await db.getLatestStatus();
    const lastInteractions = await db.getLastInteractions(10);
    const memories = await db.searchMemories('favorite food activity', 3);
    
    const interactionsSummary = lastInteractions.map(i => {
      const typeNames = ['Feed', 'Play', 'Lights Out', 'Bath', 'Hospital', 'Discipline', 'Chat', 'Sleep'];
      return `${typeNames[i.interaction_type] || 'Unknown'} at ${i.created_at}`;
    }).join(', ');
    
    const memoriesSummary = memories.map(m => m.content).join('; ');
    
    const result = await callLLM(
      `You are managing a virtual pet's status over time. The pet's name is ${status.name}, rank ${RANK_NAMES[status.rank]}.

Current status: hunger=${status.hunger}, happiness=${status.happiness}, health=${status.health}, energy=${status.energy}, poop=${status.poop}, age=${status.age}

Recent interactions: ${interactionsSummary || 'None recently'}
Pet memories: ${memoriesSummary || 'No memories yet'}

Time has passed. Update the pet's status naturally:
- Hunger decreases over time (pet gets hungry)
- Happiness decreases if no interactions
- Energy decreases during day, increases during sleep
- Poop increases slightly over time
- Health stays stable unless pet is hungry or has too much poop
- Age increases by 1

Max value for each stat is 10, min is 0.

Return ONLY JSON: {"hunger": N, "happiness": N, "health": N, "energy": N, "poop": N, "comment": "how you feel"}`
    );
    
    try {
      const parsed = JSON.parse(result);
      const newStatus = {
        ...status,
        hunger: Math.max(0, Math.min(10, parsed.hunger ?? Math.max(0, status.hunger - 1))),
        happiness: Math.max(0, Math.min(10, parsed.happiness ?? Math.max(0, status.happiness - 1))),
        health: Math.max(0, Math.min(10, parsed.health ?? status.health)),
        energy: Math.max(0, Math.min(10, parsed.energy ?? Math.max(0, status.energy - 1))),
        poop: Math.max(0, Math.min(10, parsed.poop ?? Math.min(10, status.poop + 1))),
        age: status.age + 1,
        comment: parsed.comment || status.comment,
      };
      
      await db.updateStatus(newStatus);
      await db.saveInteraction(INTERACTION.LIGHTS_OUT, { tick: true });
      
      return NextResponse.json({ state: newStatus });
    } catch {
      // Fallback: natural decay
      const newStatus = {
        ...status,
        hunger: Math.max(0, status.hunger - 1),
        happiness: Math.max(0, status.happiness - 1),
        energy: Math.max(0, status.energy - 1),
        poop: Math.min(10, status.poop + 1),
        age: status.age + 1,
        comment: '*yawns* Another moment passes...',
      };
      await db.updateStatus(newStatus);
      return NextResponse.json({ state: newStatus });
    }
  } catch (error) {
    console.error('Tick error:', error);
    return NextResponse.json({ error: 'Tick failed' }, { status: 500 });
  }
}
