import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { amount } = await req.json();
    const status = await db.addXP(amount || 0);
    return NextResponse.json({ status });
  } catch (error) {
    console.error('XP error:', error);
    return NextResponse.json({ error: 'Failed to add XP' }, { status: 500 });
  }
}
