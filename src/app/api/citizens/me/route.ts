import { NextResponse, type NextRequest } from 'next/server'
import {
  getActiveCitizen,
  getCitizenWallet,
  getCitizenInventoryDetailed,
} from '@/lib/db/localDb'

export async function GET(request: NextRequest) {
  const citizenId = request.cookies.get('nc_citizen_id')?.value
  if (!citizenId) {
    return NextResponse.json({ citizen: null, wallet: null, inventory: [] })
  }

  const citizen = getActiveCitizen(citizenId)
  if (!citizen) {
    return NextResponse.json({ citizen: null, wallet: null, inventory: [] })
  }

  const wallet = getCitizenWallet(citizen.id)
  const inventory = getCitizenInventoryDetailed(citizen.id)

  return NextResponse.json({
    citizen,
    wallet,
    inventory,
  })
}
