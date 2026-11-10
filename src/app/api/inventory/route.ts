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
    const body = await request.json()
    const citizenId = request.cookies.get('nc_citizen_id')?.value || body?.citizenId
    const citizen = getActiveCitizen(citizenId)

    if (!citizen) {
      return NextResponse.json(
        { error: 'Silakan masuk atau daftar terlebih dahulu.' },
        { status: 401 }
      )
    }

    const { action, currentBalance } = body

    // Parse fallback balance from cookie or client body
    let effectiveBalance = typeof currentBalance === 'number' ? currentBalance : undefined
    if (effectiveBalance === undefined) {
      try {
        const rawWalletCookie = request.cookies.get('nc_wallet')?.value
        if (rawWalletCookie) {
          const parsed = JSON.parse(decodeURIComponent(rawWalletCookie))
          if (parsed && parsed.cid === citizen.id && typeof parsed.b === 'number') {
            effectiveBalance = parsed.b
          }
        }
      } catch {
        // ignore
      }
    }

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

      const result = sellInventoryItem(citizen.id, inventoryId, item, effectiveBalance)
      if (!result.success) {
        return NextResponse.json(result, { status: 400 })
      }

      const updatedInventory = getCitizenInventoryDetailed(citizen.id)
      const response = NextResponse.json({ ...result, inventory: updatedInventory })
      if (result.wallet) {
        response.cookies.set(
          'nc_wallet',
          encodeURIComponent(
            JSON.stringify({
              cid: citizen.id,
              b: result.wallet.balance,
              te: result.wallet.total_earned,
              ts: result.wallet.total_spent,
              u: result.wallet.updated_at,
            })
          ),
          { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' }
        )
      }
      return response
    }

    if (action === 'batch_sell') {
      const { inventoryIds, items } = body
      if (!Array.isArray(inventoryIds) || inventoryIds.length === 0) {
        return NextResponse.json({ error: 'Pilih setidaknya 1 ikan untuk dijual.' }, { status: 400 })
      }

      const result = batchSellInventoryItems(citizen.id, inventoryIds, items, effectiveBalance)
      if (!result.success) {
        return NextResponse.json(result, { status: 400 })
      }

      const updatedInventory = getCitizenInventoryDetailed(citizen.id)
      const response = NextResponse.json({ ...result, inventory: updatedInventory })
      if (result.wallet) {
        response.cookies.set(
          'nc_wallet',
          encodeURIComponent(
            JSON.stringify({
              cid: citizen.id,
              b: result.wallet.balance,
              te: result.wallet.total_earned,
              ts: result.wallet.total_spent,
              u: result.wallet.updated_at,
            })
          ),
          { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' }
        )
      }
      return response
    }

    if (action === 'equip') {
      const inventoryId = body.inventoryId || body.itemId || body.rodId
      const rodId = body.rodId || (typeof inventoryId === 'string' && inventoryId.startsWith('rod_') ? inventoryId : undefined)
      if (!inventoryId && !rodId) {
        return NextResponse.json({ error: 'ID barang tidak valid' }, { status: 400 })
      }

      const result = equipInventoryItem(citizen.id, inventoryId, rodId)
      if (!result.success) {
        return NextResponse.json(result, { status: 400 })
      }

      const updatedInventory = getCitizenInventoryDetailed(citizen.id, rodId)
      const response = NextResponse.json({ success: true, inventory: updatedInventory })

      const equippedRod = updatedInventory.find(
        (i: any) => Boolean(i.isEquipped) && ((i.itemId || i.item_id || '').startsWith('rod_') || i.category === 'tools')
      )
      if (equippedRod) {
        const equippedId = equippedRod.itemId || (equippedRod as any).item_id
        response.cookies.set('nc_equipped_rod', equippedId, {
          path: '/',
          maxAge: 60 * 60 * 24 * 30,
          sameSite: 'lax',
        })
      }
      return response
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

      const result = buyFishingRod(citizen.id, rodId, effectiveBalance)
      if (!result.success) {
        return NextResponse.json(result, { status: 400 })
      }

      const updatedInventory = getCitizenInventoryDetailed(citizen.id, rodId)
      const wallet = getCitizenWallet(citizen.id)
      const response = NextResponse.json({ ...result, inventory: updatedInventory, wallet, equippedRodId: rodId })
      
      // Persist equipped rod in cookie
      response.cookies.set('nc_equipped_rod', rodId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
      })

      if (wallet) {
        response.cookies.set(
          'nc_wallet',
          encodeURIComponent(
            JSON.stringify({
              cid: citizen.id,
              b: wallet.balance,
              te: wallet.total_earned,
              ts: wallet.total_spent,
              u: wallet.updated_at,
            })
          ),
          { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' }
        )
      }
      return response
    }

    return NextResponse.json({ error: 'Aksi tidak dikenal' }, { status: 400 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kesalahan server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
