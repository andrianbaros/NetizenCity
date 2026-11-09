import { NextResponse, type NextRequest } from 'next/server'
import {
  getActiveCitizen,
  getCitizenInventoryDetailed,
  addCaughtFishToInventory,
  sellInventoryItem,
  batchSellInventoryItems,
  equipInventoryItem,
  unequipInventoryItem,
  toggleFavoriteInventoryItem,
  buyFishingRod,
  getCitizenWallet,
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
        id: fish.id,
        name: fish.name,
        weight: Number(fish.weight) || 1.0,
        rarity: fish.rarity || 'Common',
        rewardCoins: Number(fish.rewardCoins) || 50,
        color: fish.rarityColor || fish.color || '#22C55E',
        icon: fish.icon || '🐟',
        desc: fish.desc,
        caughtLocation: fish.caughtLocation || 'Sungai Kali Netizen',
      })

      const updatedInventory = getCitizenInventoryDetailed(citizen.id)
      return NextResponse.json({ success: true, item, inventory: updatedInventory })
    }

    if (action === 'sell') {
      const { inventoryId, item } = body
      if (!inventoryId) {
        return NextResponse.json({ error: 'ID barang tidak valid' }, { status: 400 })
      }

      const result = sellInventoryItem(citizen.id, inventoryId, item)
      if (!result.success) {
        return NextResponse.json(result, { status: 400 })
      }

      const updatedInventory = getCitizenInventoryDetailed(citizen.id)
      return NextResponse.json({ ...result, inventory: updatedInventory })
    }

    if (action === 'batch_sell') {
      const { inventoryIds, items } = body
      if (!Array.isArray(inventoryIds) || inventoryIds.length === 0) {
        return NextResponse.json({ error: 'Pilih setidaknya 1 ikan untuk dijual.' }, { status: 400 })
      }

      const result = batchSellInventoryItems(citizen.id, inventoryIds, items)
      if (!result.success) {
        return NextResponse.json(result, { status: 400 })
      }

      const updatedInventory = getCitizenInventoryDetailed(citizen.id)
      return NextResponse.json({ ...result, inventory: updatedInventory })
    }

    if (action === 'equip') {
      const { inventoryId } = body
      if (!inventoryId) {
        return NextResponse.json({ error: 'ID barang tidak valid' }, { status: 400 })
      }

      const result = equipInventoryItem(citizen.id, inventoryId)
      if (!result.success) {
        return NextResponse.json(result, { status: 400 })
      }

      const updatedInventory = getCitizenInventoryDetailed(citizen.id)
      return NextResponse.json({ success: true, inventory: updatedInventory })
    }

    if (action === 'unequip') {
      const { inventoryId } = body
      if (!inventoryId) {
        return NextResponse.json({ error: 'ID barang tidak valid' }, { status: 400 })
      }

      const result = unequipInventoryItem(citizen.id, inventoryId)
      if (!result.success) {
        return NextResponse.json(result, { status: 400 })
      }

      const updatedInventory = getCitizenInventoryDetailed(citizen.id)
      return NextResponse.json({ success: true, inventory: updatedInventory })
    }

    if (action === 'toggle_favorite') {
      const { inventoryId } = body
      if (!inventoryId) {
        return NextResponse.json({ error: 'ID barang tidak valid' }, { status: 400 })
      }

      const result = toggleFavoriteInventoryItem(citizen.id, inventoryId)
      if (!result.success) {
        return NextResponse.json(result, { status: 400 })
      }

      const updatedInventory = getCitizenInventoryDetailed(citizen.id)
      return NextResponse.json({ success: true, isFavorite: result.isFavorite, inventory: updatedInventory })
    }

    if (action === 'buy_rod') {
      const { rodId } = body
      if (!rodId) {
        return NextResponse.json({ error: 'ID joran tidak valid' }, { status: 400 })
      }

      const result = buyFishingRod(citizen.id, rodId)
      if (!result.success) {
        return NextResponse.json(result, { status: 400 })
      }

      const updatedInventory = getCitizenInventoryDetailed(citizen.id)
      const wallet = getCitizenWallet(citizen.id)
      return NextResponse.json({ ...result, inventory: updatedInventory, wallet })
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal' }, { status: 400 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kesalahan server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
