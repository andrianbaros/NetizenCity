// ============================================================
// NETIZENCITY - Tugu Room Leave API
// Removes player from room when exiting Tugu area
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { removePlayerFromTugu } from '@/lib/tuguRooms'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const clientId = typeof body.clientId === 'string' && body.clientId.trim().length > 0 ? body.clientId.trim() : null

    if (clientId) {
      removePlayerFromTugu(clientId)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
