// ============================================================
// POST /api/interact — Handle pet interactions
// ============================================================
import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { INTERACTION, RANK_XP_THRESHOLDS } from '@/lib/types';
import {
  handleFeed,
  handlePlay,
  handleBath,
  handleDiscipline,
  handleHospital,
  handleSleep,
  updateStatusAfterInteraction,
} from '@/lib/interaction';
import { getFrames } from '@/lib/frames';

export async function POST(req: Request) {
  try {
    const { type: interactionType, metadata: inputMetadata } = await req.json();
    const status = await db.getLatestStatus();
    
    let animation = getFrames((status.petType || 'cat') as any, 'idle');
    let comment = '';
    let metadata: Record<string, unknown> = { ...inputMetadata };
    
    switch (interactionType) {
      case INTERACTION.FEED: {
        const result = await handleFeed(status, metadata);
        animation = result.animation;
        comment = result.comment;
        metadata = result.metadata;
        break;
      }
      case INTERACTION.PLAY: {
        const result = await handlePlay(status);
        animation = result.animation;
        comment = result.comment;
        metadata = result.metadata;
        break;
      }
      case INTERACTION.BATH: {
        const result = await handleBath(status);
        animation = result.animation;
        comment = result.comment;
        metadata = result.metadata;
        break;
      }
      case INTERACTION.DISCIPLINE: {
        const result = await handleDiscipline(status, metadata);
        animation = result.animation;
        comment = result.comment;
        metadata = result.metadata;
        break;
      }
      case INTERACTION.GO_TO_HOSPITAL: {
        const result = await handleHospital(status);
        animation = result.animation;
        comment = result.comment;
        metadata = result.metadata;
        break;
      }
      case INTERACTION.SLEEP: {
        const result = await handleSleep(status);
        animation = result.animation;
        comment = result.comment;
        metadata = result.metadata;
        break;
      }
    }
    
    // Update status
    const newStatus = updateStatusAfterInteraction(status, interactionType, metadata);
    newStatus.comment = comment;
    
    // Save interaction and update status
    await db.saveInteraction(interactionType, metadata);
    await db.saveMemory(comment, metadata);
    await db.updateStatus(newStatus);
    
    // Track daily task progress
    const taskTypeMap: Record<number, string> = {
      [INTERACTION.FEED]: 'feed',
      [INTERACTION.PLAY]: 'play',
      [INTERACTION.BATH]: 'bath',
      [INTERACTION.DISCIPLINE]: 'discipline',
    };
    
    const taskType = taskTypeMap[interactionType];
    if (taskType) {
      const taskResult = await db.incrementTaskProgress(taskType);
      if (taskResult?.completed) {
        // Award XP
        newStatus.xp += taskResult.xpReward;
        
        // Check for rank up
        const nextRankThreshold = RANK_XP_THRESHOLDS[newStatus.rank + 1];
        if (nextRankThreshold && newStatus.xp >= nextRankThreshold) {
          newStatus.rank = Math.min(5, newStatus.rank + 1);
        }
        
        await db.updateStatus(newStatus);
      }
    }
    
    const dna = await db.getLatestDNA();
    
    return NextResponse.json({
      animation,
      status: comment,
      state: newStatus,
      dna,
    });
  } catch (error) {
    console.error('Interact error:', error);
    return NextResponse.json({ error: 'Interaction failed' }, { status: 500 });
  }
}
