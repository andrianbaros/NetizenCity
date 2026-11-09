// ============================================================
// NETIZENCITY - River Room Leave API
// Removes player from river pier room when exiting to city
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { removePlayerFromRiver } from '@/lib/riverRooms'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const clientId = typeof body.clientId === 'string' && body.clientId.trim().length > 0 ? body.clientId.trim() : null

    if (clientId) {
      removePlayerFromRiver(clientId)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
