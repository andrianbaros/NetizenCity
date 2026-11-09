// ============================================================
// NETIZENCITY - Leave Beach Area API
// Removes player presence cleanly from beach room map
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { removePlayerFromBeach } from '@/lib/beachRooms'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const clientId = body.clientId

    if (clientId) {
      removePlayerFromBeach(clientId)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
