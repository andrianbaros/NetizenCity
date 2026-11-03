import { NextResponse, type NextRequest } from 'next/server'
import {
  readLocalDB,
  writeLocalDB,
  getActiveCitizen,
} from '@/lib/db/localDb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { avatarConfig } = body

    const citizenId = request.cookies.get('nc_citizen_id')?.value
    const citizen = getActiveCitizen(citizenId)
    if (!citizen) {
      return NextResponse.json({ error: 'Citizen not found' }, { status: 404 })
    }

    const db = readLocalDB()
    const cit = db.citizens.find((c) => c.id === citizen.id)
    if (cit && avatarConfig) {
      cit.avatar_config = {
        ...cit.avatar_config,
        ...avatarConfig,
      }
      cit.onboarding_completed = true
      cit.updated_at = new Date().toISOString()
      writeLocalDB(db)
    }

    return NextResponse.json({ success: true, citizen: cit })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kesalahan server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
