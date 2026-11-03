import { NextResponse, type NextRequest } from 'next/server'
import {
  getActiveCitizen,
  getCitizenWallet,
  readLocalDB,
} from '@/lib/db/localDb'

export async function GET(request: NextRequest) {
  const citizenId = request.cookies.get('nc_citizen_id')?.value
  const citizen = getActiveCitizen(citizenId)
  if (!citizen) {
    return NextResponse.json({ error: 'Citizen not found' }, { status: 404 })
  }

  const wallet = getCitizenWallet(citizen.id)
  const db = readLocalDB()
  const inventory = db.inventory.filter((inv) => inv.citizen_id === citizen.id)

  return NextResponse.json({
    citizen,
    wallet,
    inventory,
  })
}
