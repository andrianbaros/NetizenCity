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

  // Parse cookie wallet if available to prevent cold-start resets on Vercel
  let fallbackWallet: any = undefined
  try {
    const rawWalletCookie = request.cookies.get('nc_wallet')?.value
    if (rawWalletCookie) {
      const parsed = JSON.parse(decodeURIComponent(rawWalletCookie))
      if (parsed && parsed.cid === citizen.id && typeof parsed.b === 'number') {
        fallbackWallet = {
          balance: parsed.b,
          totalEarned: parsed.te,
          totalSpent: parsed.ts,
          updatedAt: parsed.u,
        }
      }
    }
  } catch {
    // ignore
  }

  // Parse cookie avatar_config if available to prevent outfit reset across lambdas
  try {
    const rawAvatarCookie = request.cookies.get('nc_avatar_config')?.value
    if (rawAvatarCookie) {
      const parsedAvatar = JSON.parse(decodeURIComponent(rawAvatarCookie))
      if (parsedAvatar && typeof parsedAvatar === 'object') {
        citizen.avatar_config = {
          ...citizen.avatar_config,
          ...parsedAvatar,
        }
      }
    }
  } catch {
    // ignore
  }

  // Parse cookie inventory if available to prevent clothing loss across serverless lambdas
  let fallbackItemIds: string[] | undefined = undefined
  try {
    const rawInvCookie = request.cookies.get('nc_inventory')?.value
    if (rawInvCookie) {
      const parsedInv = JSON.parse(decodeURIComponent(rawInvCookie))
      if (Array.isArray(parsedInv)) {
        fallbackItemIds = parsedInv
      }
    }
  } catch {
    // ignore
  }

  const rawEquippedRod = request.cookies.get('nc_equipped_rod')?.value
  const wallet = getCitizenWallet(citizen.id, fallbackWallet)
  const inventory = getCitizenInventoryDetailed(citizen.id, rawEquippedRod, fallbackItemIds)

  const response = NextResponse.json({
    citizen,
    wallet,
    inventory,
  })

  // Set fresh cookie with active inventory snapshot
  if (Array.isArray(inventory)) {
    try {
      const ownedIds = Array.from(
        new Set(inventory.map((i: any) => i.itemId || i.item_id || i.id).filter(Boolean))
      )
      response.cookies.set(
        'nc_inventory',
        encodeURIComponent(JSON.stringify(ownedIds)),
        { path: '/', maxAge: 60 * 60 * 24 * 30, sameSite: 'lax' }
      )
    } catch {
      // ignore
    }
  }

  // Set fresh cookie with active wallet snapshot
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

  // Ensure active equipped rod is synced in cookie
  const equippedRod = inventory.find(
    (i: any) => Boolean(i.isEquipped) && ((i.itemId || i.item_id || '').startsWith('rod_') || i.category === 'tools')
  )
  if (equippedRod) {
    const rodId = equippedRod.itemId || (equippedRod as any).item_id
    response.cookies.set('nc_equipped_rod', rodId, {
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax',
    })
  }

  // Ensure active avatar config is synced in cookie
  if (citizen && citizen.avatar_config) {
    try {
      response.cookies.set('nc_avatar_config', encodeURIComponent(JSON.stringify(citizen.avatar_config)), {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        sameSite: 'lax',
      })
    } catch {}
  }

  return response
}
