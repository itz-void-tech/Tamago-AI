// ============================================================
// POST /api/auth/logout — Destroy session
// ============================================================
import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (token) {
      await db.deleteSession(token);
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
