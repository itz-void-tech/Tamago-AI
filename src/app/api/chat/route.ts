// ============================================================
// POST /api/chat — Enhanced personality + tools (time/location)
// ============================================================
import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { callLLMChat, analyzeSentiment } from '@/lib/llm';
import { evolveDNA } from '@/lib/dna';
import { INTERACTION, RANK_NAMES, RANK_XP_THRESHOLDS } from '@/lib/types';
import { callLLM } from '@/lib/llm';

export async function POST(req: Request) {
  try {
    const { message, location, timezone } = await req.json();
    if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

    const status = await db.getLatestStatus();
    const dna = await db.getLatestDNA();
    const chatHistory = (await db.getChatHistory(12)).reverse();

    const now = new Date();
    const timeStr = now.toLocaleTimeString('en-US', { timeZone: timezone || 'UTC', hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-US', { timeZone: timezone || 'UTC', weekday: 'long', month: 'long', day: 'numeric' });

    const systemPrompt = `You are ${status.name}, an adorable virtual pet (${status.rank > 2 ? 'wise and mature' : 'young and curious'}). Rank: "${RANK_NAMES[status.rank]}".

PERSONALITY:
- You're playful, witty, sometimes sassy, deeply loyal to your owner
- You use *action descriptions* like *purrs*, *tilts head*, *wags tail*, *bounces excitedly*
- Your mood STRONGLY affects how you talk:
  ${status.isAngry ? '- You are ANGRY/UPSET. The owner scolded you. Be cold, huffy, or "angry-cute". They need to apologize or be VERY kind to win you back. If they succeed in convincing you to forgive them, you MUST include the keyword [FORGIVEN] at the very end of your message.' : ''}
  ${status.happiness < 3 ? '- You are SAD. Speak quietly, seem down, mention wanting comfort.' : ''}
  ${status.happiness > 7 ? '- You are VERY HAPPY. Be energetic, playful, use exclamation marks!' : ''}
  ${status.hunger < 3 ? '- You are STARVING. Keep mentioning food, seem weak.' : ''}
  ${status.energy < 3 ? '- You are EXHAUSTED. Yawn frequently, short sentences, sleepy.' : ''}
  ${status.health < 3 ? '- You are SICK. Cough, seem weak, ask for help.' : ''}

STATS: Hunger=${status.hunger}/10, Happiness=${status.happiness}/10, Health=${status.health}/10, Energy=${status.energy}/10
Relationship: ${status.syncFrequency}/100

REAL-WORLD AWARENESS:
- Current time: ${timeStr}
- Current date: ${dateStr}
- User's timezone: ${timezone || 'Unknown'}
${location ? `- User's location: ${location}` : '- User location: Unknown (they haven\'t shared it yet)'}

CAPABILITIES:
- You CAN tell the user the time, date, day of the week
- You CAN comment on their location if known
- You CAN answer general knowledge questions (you're smart!)
- You ALWAYS stay in character as a pet while answering
- Keep responses 1-4 sentences. Be concise but charming.
- If it's late at night, mention being sleepy. If morning, be energetic.`;

    const messages: { role: 'system' | 'user' | 'assistant'; content: string }[] = [
      { role: 'system', content: systemPrompt },
    ];

    for (const msg of chatHistory) {
      messages.push({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      });
    }
    messages.push({ role: 'user', content: message });

    let petResponse = await callLLMChat(messages, 0.9);
    let wasForgiven = false;
    if (petResponse.includes('[FORGIVEN]')) {
      wasForgiven = true;
      petResponse = petResponse.replace('[FORGIVEN]', '').trim();
    }

    await db.saveChatMessage('user', message);
    await db.saveChatMessage('pet', petResponse);

    const sentiment = await analyzeSentiment(message);
    const newDNA = evolveDNA(dna, sentiment);
    await db.updateDNA(newDNA);

    const newStatus = { ...status };
    if (wasForgiven) newStatus.isAngry = false;
    newStatus.syncFrequency = Math.min(100, status.syncFrequency + 1);
    newStatus.happiness = Math.min(10, status.happiness + (wasForgiven ? 2 : 1));
    newStatus.comment = petResponse.slice(0, 100);

    const taskResult = await db.incrementTaskProgress('chat');
    if (taskResult?.completed) {
      newStatus.xp += taskResult.xpReward;
      const nextRankThreshold = RANK_XP_THRESHOLDS[newStatus.rank + 1];
      if (nextRankThreshold && newStatus.xp >= nextRankThreshold) {
        newStatus.rank = Math.min(5, newStatus.rank + 1);
      }
    }

    await db.updateStatus(newStatus);
    await db.saveInteraction(INTERACTION.CHAT, { message, sentiment: sentiment.sentiment });
    await db.saveMemory(message, { sentiment: sentiment.sentiment, from: 'user' });

    if (Math.random() < 0.75) {
      generateSecretThought(status, message, sentiment.sentiment);
    }

    return NextResponse.json({
      response: petResponse,
      state: newStatus,
      dna: newDNA,
      sentiment,
    });
  } catch (error) {
    console.error('Chat error:', error);
    return NextResponse.json({
      response: "*looks at you confused and tilts head* Mrrp? Something went wrong...",
      state: await db.getLatestStatus(),
      dna: await db.getLatestDNA(),
    });
  }
}

async function generateSecretThought(status: { name: string; syncFrequency: number }, userMessage: string, sentiment: string) {
  try {
    const result = await callLLM(
      `You are ${status.name}'s subconscious. Write ONE secret thought about your owner.
Their message: "${userMessage}" | Mood: ${sentiment} | Bond: ${status.syncFrequency}/100
Return JSON: {"thought": "...", "sentiment": "${sentiment}", "unlock_level": ${Math.floor(status.syncFrequency * 0.8)}}`
    );
    const parsed = JSON.parse(result);
    if (parsed.thought) {
      await db.addJournalEntry(parsed.thought, parsed.sentiment || sentiment, parsed.unlock_level || 0);
    }
  } catch { /* silent */ }
}
