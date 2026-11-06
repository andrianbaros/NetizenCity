// ============================================================
// NETIZENCITY - Tugu Room Sync API
// Endpoint for player position, rotation, and room presence
// Enforces max 10 users per room
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { syncPlayerInRoom, getRoomsSummary } from '@/lib/tuguRooms'
import { getActiveCitizen } from '@/lib/db/localDb'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const rooms = getRoomsSummary()
    return NextResponse.json({ success: true, rooms })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const citizen = await getActiveCitizen()

    // Determine client identification
    const cookieSession = req.cookies.get('netizen_session')?.value
    const clientId = body.clientId || cookieSession || (citizen ? citizen.id : `guest_${req.headers.get('x-forwarded-for') || 'local'}`)

    const displayName = citizen?.display_name || citizen?.username || body.name || 'Pengunjung'
    const isGuest = !citizen

    const result = syncPlayerInRoom({
      clientId,
      name: displayName,
      isGuest,
      x: typeof body.x === 'number' ? body.x : 0,
      z: typeof body.z === 'number' ? body.z : 12,
      facing: typeof body.facing === 'number' ? body.facing : 0,
      avatarConfig: citizen?.avatar_config || body.avatarConfig,
      preferredRoomId: body.preferredRoomId,
      chatText: body.chatText,
    })

    return NextResponse.json({
      success: true,
      myClientId: clientId,
      ...result,
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
