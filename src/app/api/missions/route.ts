import { NextResponse, type NextRequest } from 'next/server'
import {
  readLocalDB,
  writeLocalDB,
  getActiveCitizen,
  updateWalletBalance,
} from '@/lib/db/localDb'

export async function GET() {
  const db = readLocalDB()
  const citizen = getActiveCitizen()
  const citizenId = citizen ? citizen.id : 'c-netizen-01'

  const userMissions = db.citizen_missions.filter((cm) => cm.citizen_id === citizenId)

  const missionsWithProgress = db.missions.map((m) => {
    const userM = userMissions.find((um) => um.mission_id === m.id)
    return {
      ...m,
      progress: userM ? userM.progress : 0,
      status: userM ? userM.status : 'active',
      isCompleted: userM ? userM.progress >= m.target : false,
      isClaimed: userM ? userM.status === 'completed' : false,
    }
  })

  return NextResponse.json({ missions: missionsWithProgress })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { missionId } = body
    const citizen = getActiveCitizen()
    if (!citizen) {
      return NextResponse.json({ error: 'Warga tidak ditemukan' }, { status: 404 })
    }

    const db = readLocalDB()
    const mission = db.missions.find((m) => m.id === missionId)
    if (!mission) {
      return NextResponse.json({ error: 'Misi tidak ditemukan' }, { status: 404 })
    }

    let userM = db.citizen_missions.find(
      (cm) => cm.citizen_id === citizen.id && cm.mission_id === missionId
    )

    if (!userM) {
      userM = {
        id: 'cm-' + Math.random().toString(36).substring(2, 9),
        citizen_id: citizen.id,
        mission_id: missionId,
        progress: mission.target,
        target: mission.target,
        status: 'active',
      }
      db.citizen_missions.push(userM)
    }

    if (userM.status === 'completed') {
      return NextResponse.json(
        { error: 'Hadiah misi ini sudah diklaim' },
        { status: 400 }
      )
    }

    // Mark as completed
    userM.status = 'completed'
    userM.progress = mission.target

    // Award coins
    const walletRes = updateWalletBalance(
      citizen.id,
      mission.reward_coins,
      'reward',
      `Hadiah Misi Kota: ${mission.name}`
    )

    // Award XP
    citizen.xp += mission.reward_xp
    if (citizen.xp >= citizen.level * 100) {
      citizen.level += 1
    }

    writeLocalDB(db)

    return NextResponse.json({
      success: true,
      rewardCoins: mission.reward_coins,
      rewardXp: mission.reward_xp,
      newBalance: walletRes?.balance,
      newLevel: citizen.level,
      newXp: citizen.xp,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kesalahan server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
