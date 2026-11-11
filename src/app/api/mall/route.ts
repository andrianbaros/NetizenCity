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

  let cookieItemIds: string[] = []
  try {
    const rawInvCookie = request.cookies.get('nc_inventory')?.value
    if (rawInvCookie) {
      const parsed = JSON.parse(decodeURIComponent(rawInvCookie))
      if (Array.isArray(parsed)) cookieItemIds = parsed
    }
  } catch {
    // ignore
  }

  const dbItemIds = citizen
    ? db.inventory
        .filter((inv) => inv.citizen_id === citizen.id)
        .map((inv) => inv.item_id)
    : []

  const ownedItemIds = Array.from(new Set([...dbItemIds, ...cookieItemIds]))

  return NextResponse.json({
    items: db.items,
    ownedItemIds,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { itemId, currentBalance } = body
    const citizenId = request.cookies.get('nc_citizen_id')?.value
    const citizen = getActiveCitizen(citizenId)
    if (!citizen) {
      return NextResponse.json(
        { error: 'Silakan masuk atau daftar terlebih dahulu untuk berbelanja.' },
        { status: 401 }
      )
    }

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

    const result = buyShopItem(citizen.id, itemId, effectiveBalance)
    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    const response = NextResponse.json(result)
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

    // Always synchronize nc_inventory cookie with newly purchased item
    try {
      let currentItemIds: string[] = []
      const rawInv = request.cookies.get('nc_inventory')?.value
      if (rawInv) {
        const parsed = JSON.parse(decodeURIComponent(rawInv))
        if (Array.isArray(parsed)) currentItemIds = parsed
      }
      const updatedOwned = Array.from(new Set([...currentItemIds, itemId]))
      response.cookies.set(
        'nc_inventory',
        encodeURIComponent(JSON.stringify(updatedOwned)),
        { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' }
      )
    } catch {
      // ignore
    }

    return response
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kesalahan server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
