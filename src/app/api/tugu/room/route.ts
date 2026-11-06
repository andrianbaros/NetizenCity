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
    const citizenCookie = req.cookies.get('nc_citizen_id')?.value
    const citizen = citizenCookie ? getActiveCitizen(citizenCookie) : null

    // Determine client identification: prioritize client-side unique session ID
    let clientId = typeof body.clientId === 'string' && body.clientId.trim().length > 0
      ? body.clientId.trim()
      : null

    if (!clientId) {
      clientId = `guest_${Math.random().toString(36).substring(2, 8)}_${Date.now().toString(36).slice(-4)}`
    }

    const isGuest = !citizen
    let displayName = 'Warga'
    if (citizen) {
      displayName = citizen.display_name || citizen.username
    } else if (typeof body.name === 'string' && body.name.trim().length > 0 && body.name !== 'Pengunjung') {
      displayName = body.name.trim()
    } else {
      displayName = `Tamu #${clientId.slice(-4)}`
    }

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
