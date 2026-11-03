import { NextResponse, type NextRequest } from 'next/server'
import {
  readLocalDB,
  getActiveCitizen,
  buyShopItem,
} from '@/lib/db/localDb'

export async function GET() {
  const db = readLocalDB()
  const citizen = getActiveCitizen()
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
    const citizen = getActiveCitizen()
    if (!citizen) {
      return NextResponse.json({ error: 'Warga tidak ditemukan' }, { status: 404 })
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
