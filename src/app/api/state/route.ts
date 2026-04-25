// ============================================================
// GET /api/state — Returns current pet state + DNA
// ============================================================
import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function GET() {
  try {
    const status = await db.getLatestStatus();
    const dna = await db.getLatestDNA();
    const equippedAccessories = await db.getEquippedAccessories();
    const ownedAccessories = await db.getOwnedAccessories();
    const dailyTasks = await db.getTasks();
    const journalCount = await db.getLockedJournalCount(status.syncFrequency);
    
    return NextResponse.json({
      status,
      dna,
      equippedAccessories,
      ownedAccessories,
      dailyTasks,
      lockedJournalCount: journalCount,
    });
  } catch (error) {
    console.error('State error:', error);
    return NextResponse.json({ error: 'Failed to get state' }, { status: 500 });
  }
}
