// ============================================================
// NETIZENCITY - Beach Pier Room Sync API
// Endpoint for angler position, facing, fishing state & presence
// Enforces max 10 users per beach room
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { syncPlayerInBeachRoom, getBeachRoomsSummary } from '@/lib/beachRooms'
import { getActiveCitizen } from '@/lib/db/localDb'

export async function GET(req: NextRequest) {
  try {
    const rooms = getBeachRoomsSummary()
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

    let clientId = typeof body.clientId === 'string' && body.clientId.trim().length > 0
      ? body.clientId.trim()
      : null

    if (!clientId) {
      clientId = `guest_${Math.random().toString(36).substring(2, 8)}_${Date.now().toString(36).slice(-4)}`
    }

    const isGuest = !citizen
    let displayName = 'Pemancing Pantai'
    if (citizen) {
      displayName = citizen.display_name || citizen.username
    } else if (typeof body.name === 'string' && body.name.trim().length > 0 && body.name !== 'Pengunjung') {
      displayName = body.name.trim()
    } else {
      displayName = `Tamu #${clientId.slice(-4)}`
    }

    const result = syncPlayerInBeachRoom({
      clientId,
      name: displayName,
      isGuest,
      x: typeof body.x === 'number' ? body.x : 0,
      z: typeof body.z === 'number' ? body.z : -5.5,
      facing: typeof body.facing === 'number' ? body.facing : Math.PI,
      avatarConfig: citizen?.avatar_config || body.avatarConfig,
      isFishing: Boolean(body.isFishing),
      isMoving: Boolean(body.isMoving),
      preferredRoomId: body.preferredRoomId,
      chatText: body.chatText,
      chatId: body.chatId,
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
