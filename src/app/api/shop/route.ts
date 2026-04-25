// ============================================================
// POST /api/shop — Buy or toggle accessories
// ============================================================
import { NextResponse } from 'next/server';
import * as db from '@/lib/db';
import { getAccessoryById } from '@/lib/accessories';

export async function POST(req: Request) {
  try {
    const { action, accessoryId } = await req.json();
    const accessory = getAccessoryById(accessoryId);
    
    if (!accessory) {
      return NextResponse.json({ error: 'Accessory not found' }, { status: 404 });
    }
    
    const status = await db.getLatestStatus();
    
    if (action === 'buy') {
      const owned = await db.getOwnedAccessories();
      if (owned.includes(accessoryId)) {
        return NextResponse.json({ error: 'Already owned' }, { status: 400 });
      }
      
      if (status.xp < accessory.cost) {
        return NextResponse.json({ error: 'Not enough XP' }, { status: 400 });
      }
      
      // Deduct XP and buy
      const newStatus = { ...status, xp: status.xp - accessory.cost };
      await db.updateStatus(newStatus);
      await db.buyAccessory(accessoryId);
      
      return NextResponse.json({
        success: true,
        state: newStatus,
        owned: await db.getOwnedAccessories(),
        equipped: await db.getEquippedAccessories(),
      });
    }
    
    if (action === 'toggle') {
      const equipped = await db.toggleAccessory(accessoryId);
      return NextResponse.json({
        success: true,
        equipped: await db.getEquippedAccessories(),
        isEquipped: equipped,
      });
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Shop error:', error);
    return NextResponse.json({ error: 'Shop operation failed' }, { status: 500 });
  }
}
