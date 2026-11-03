import { NextResponse } from 'next/server'
import {
  readLocalDB,
  getActiveCitizen,
  claimDailyStreakReward,
} from '@/lib/db/localDb'

export async function GET() {
  const db = readLocalDB()
  const citizen = getActiveCitizen()
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
  })
}

export async function POST() {
  try {
    const citizen = getActiveCitizen()
    if (!citizen) {
      return NextResponse.json({ error: 'Warga tidak ditemukan' }, { status: 404 })
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
