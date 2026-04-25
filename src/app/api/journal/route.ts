// ============================================================
// GET /api/journal — Retrieve unlocked journal entries
// ============================================================
import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function GET() {
  try {
    const status = await db.getLatestStatus();
    const entries = await db.getJournalEntries(status.syncFrequency);
    const lockedCount = await db.getLockedJournalCount(status.syncFrequency);
    
    return NextResponse.json({
      entries,
      lockedCount,
      syncFrequency: status.syncFrequency,
    });
  } catch (error) {
    console.error('Journal error:', error);
    return NextResponse.json({ entries: [], lockedCount: 0, syncFrequency: 0 });
  }
}
