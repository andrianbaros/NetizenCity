import { NextResponse, type NextRequest } from 'next/server'
import {
  readLocalDB,
  getActiveCitizen,
  buyShopItem,
} from '@/lib/db/localDb'

export async function GET(request: NextRequest) {
  const db = readLocalDB()
  const citizenId = request.cookies.get('nc_citizen_id')?.value
  const citizen = getActiveCitizen(citizenId)
  const ownedItemIds = citizen
    ? db.inventory
        .filter((inv) => inv.citizen_id === citizen.id)
        .map((inv) => inv.item_id)
    : []

  return NextResponse.json({
    items: db.items,
    ownedItemIds,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId } = body
    const citizenId = request.cookies.get('nc_citizen_id')?.value
    const citizen = getActiveCitizen(citizenId)
    if (!citizen) {
      return NextResponse.json(
        { error: 'Silakan masuk atau daftar terlebih dahulu untuk berbelanja.' },
        { status: 401 }
      )
    }

    const result = buyShopItem(citizen.id, itemId)
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kesalahan server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
