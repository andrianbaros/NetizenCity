// ============================================================
// NETIZENCITY - Trakteer Official Integration API
// Connected to: https://trakteer.id/sahamnetzencity/tip (@sahamnetzencity)
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import {
  OFFICIAL_TRAKTEER_CONFIG,
  getInvestorsList,
  addInvestorEntry,
  getActiveCitizen,
} from '@/lib/db/localDb'

export async function GET(req: NextRequest) {
  try {
    const investors = getInvestorsList()
    return NextResponse.json(
      {
        success: true,
        config: OFFICIAL_TRAKTEER_CONFIG,
        investors,
        totalInvestors: investors.length,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      }
    )
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const citizenCookie = req.cookies.get('nc_citizen_id')?.value
    const citizen = citizenCookie ? getActiveCitizen(citizenCookie) : null

    const name = typeof body.name === 'string' && body.name.trim().length > 0
      ? body.name.trim()
      : citizen?.display_name || citizen?.username || 'Warga Netizen'

    const handle = typeof body.handle === 'string' && body.handle.trim().length > 0
      ? body.handle.trim()
      : citizen?.username ? `@${citizen.username}` : undefined

    const message = typeof body.message === 'string' && body.message.trim().length > 0
      ? body.message.trim()
      : 'Dukungan untuk pembangunan kota virtual Netizen City!'

    const amount = typeof body.amount === 'number' && body.amount > 0 ? body.amount : 5000
    const trakteerOrderId = typeof body.orderId === 'string' ? body.orderId.trim() : undefined

    const result = addInvestorEntry({
      name,
      handle,
      message,
      amount,
      trakteer_order_id: trakteerOrderId,
      citizenId: citizen?.id || body.citizenId,
    })

    return NextResponse.json({
      success: true,
      investor: result.investor,
      bonusCoinsAwarded: result.bonusCoinsAwarded,
      message: 'Berhasil mendaftarkan nama di Menara Investor 3D!',
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
