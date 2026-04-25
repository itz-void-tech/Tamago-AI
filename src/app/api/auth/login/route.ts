// ============================================================
// POST /api/auth/login — Authenticate user
// ============================================================
import { NextResponse } from 'next/server';
import * as db from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
    }
    const result = await db.loginUser(username, password);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }
    return NextResponse.json({ token: result.token, user: result.user });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
