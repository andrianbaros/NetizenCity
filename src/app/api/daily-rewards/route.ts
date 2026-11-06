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

    const result = claimDailyStreakReward(citizen.id)
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kesalahan server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
