import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { name, petType } = await req.json();
    const status = await db.getLatestStatus();
    const updates: Record<string, unknown> = {};
    if (name && typeof name === 'string' && name.length <= 20) updates.name = name.trim();
    if (petType) updates.petType = petType;
    if (Object.keys(updates).length === 0) return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
    const newStatus = { ...status, ...updates, comment: updates.name ? `Call me ${updates.name}! I love it!` : status.comment };
    await db.updateStatus(newStatus);
    return NextResponse.json({ state: newStatus });
  } catch (error) {
    console.error('Name error:', error);
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
