// ============================================================
// NETIZENCITY - Tugu Room Leave API
// Removes player from room when exiting Tugu area
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { removePlayerFromTugu } from '@/lib/tuguRooms'
import { getActiveCitizen } from '@/lib/db/localDb'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}))
    const citizen = await getActiveCitizen()
    const cookieSession = req.cookies.get('netizen_session')?.value
    const clientId = body.clientId || cookieSession || (citizen ? citizen.id : `guest_${req.headers.get('x-forwarded-for') || 'local'}`)

    removePlayerFromTugu(clientId)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
