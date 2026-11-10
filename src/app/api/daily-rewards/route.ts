import { NextResponse, type NextRequest } from 'next/server'
import {
  readLocalDB,
  getActiveCitizen,
  claimDailyStreakReward,
} from '@/lib/db/localDb'

export async function GET(request: NextRequest) {
  const db = readLocalDB()
  const citizenId = request.cookies.get('nc_citizen_id')?.value
  const citizen = getActiveCitizen(citizenId)
  const today = new Date().toISOString().split('T')[0]

  const claims = citizen
    ? db.daily_login_rewards.filter((r) => r.citizen_id === citizen.id)
    : []

  const isClaimedToday = claims.some((r) => r.claimed_date === today)
  const currentStreak = claims.length > 0 ? claims[claims.length - 1].streak_count : 1

  return NextResponse.json({
    isClaimedToday,
    currentStreak,
    claims,
    isGuest: !citizen,
  })
}

export async function POST(request: NextRequest) {
  try {
    const citizenId = request.cookies.get('nc_citizen_id')?.value
    const citizen = getActiveCitizen(citizenId)
    if (!citizen) {
      return NextResponse.json(
        { error: 'Silakan masuk atau daftar terlebih dahulu untuk klaim hadiah harian.' },
        { status: 401 }
      )
    }

    let currentBalance: number | undefined
    try {
      const body = await request.json()
      if (typeof body?.currentBalance === 'number') {
        currentBalance = body.currentBalance
      }
    } catch {
      // ignore
    }

    let effectiveBalance = currentBalance
    if (effectiveBalance === undefined) {
      try {
        const rawWalletCookie = request.cookies.get('nc_wallet')?.value
        if (rawWalletCookie) {
          const parsed = JSON.parse(decodeURIComponent(rawWalletCookie))
          if (parsed && parsed.cid === citizen.id && typeof parsed.b === 'number') {
            effectiveBalance = parsed.b
          }
        }
      } catch {
        // ignore
      }
    }

    const result = claimDailyStreakReward(citizen.id, effectiveBalance)
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    const response = NextResponse.json(result)
    if (result.wallet) {
      response.cookies.set(
        'nc_wallet',
        encodeURIComponent(
          JSON.stringify({
            cid: citizen.id,
            b: result.wallet.balance,
            te: result.wallet.total_earned,
            ts: result.wallet.total_spent,
            u: result.wallet.updated_at,
          })
        ),
        { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' }
      )
    }
    return response
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kesalahan server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
