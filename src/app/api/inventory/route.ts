import { NextResponse, type NextRequest } from 'next/server'
import {
  getActiveCitizen,
  getCitizenInventoryDetailed,
  addCaughtFishToInventory,
  sellInventoryItem,
} from '@/lib/db/localDb'

export async function GET(request: NextRequest) {
  const citizenId = request.cookies.get('nc_citizen_id')?.value
  const citizen = getActiveCitizen(citizenId)

  if (!citizen) {
    return NextResponse.json({ inventory: [] })
  }

  const inventory = getCitizenInventoryDetailed(citizen.id)
  return NextResponse.json({ inventory })
}

export async function POST(request: NextRequest) {
  try {
    const citizenId = request.cookies.get('nc_citizen_id')?.value
    const citizen = getActiveCitizen(citizenId)

    if (!citizen) {
      return NextResponse.json(
        { error: 'Silakan masuk atau daftar terlebih dahulu.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    if (action === 'add_fish') {
      const { fish } = body
      if (!fish || !fish.name) {
        return NextResponse.json({ error: 'Data ikan tidak valid' }, { status: 400 })
      }

      const item = addCaughtFishToInventory(citizen.id, {
        name: fish.name,
        weight: Number(fish.weight) || 1.0,
        rarity: fish.rarity || 'Biasa',
        rewardCoins: Number(fish.rewardCoins) || 40,
        color: fish.color || '#2D7F9D',
      })

      const updatedInventory = getCitizenInventoryDetailed(citizen.id)
      return NextResponse.json({ success: true, item, inventory: updatedInventory })
    }

    if (action === 'sell') {
      const { inventoryId } = body
      if (!inventoryId) {
        return NextResponse.json({ error: 'ID barang tidak valid' }, { status: 400 })
      }

      const result = sellInventoryItem(citizen.id, inventoryId)
      if (!result.success) {
        return NextResponse.json(result, { status: 400 })
      }

      const updatedInventory = getCitizenInventoryDetailed(citizen.id)
      return NextResponse.json({ ...result, inventory: updatedInventory })
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal' }, { status: 400 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kesalahan server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
