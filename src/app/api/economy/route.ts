import { NextResponse, type NextRequest } from 'next/server'
import {
  getActiveCitizen,
  getCitizenWallet,
  updateWalletBalance,
  readLocalDB,
} from '@/lib/db/localDb'

export async function GET(request: NextRequest) {
  const citizenId = request.cookies.get('nc_citizen_id')?.value
  const citizen = getActiveCitizen(citizenId)
  if (!citizen) {
    return NextResponse.json({
      wallet: {
        id: 'guest-wallet',
        citizen_id: 'guest',
        balance: 0,
        total_earned: 0,
        total_spent: 0,
        updated_at: new Date().toISOString(),
      },
      transactions: [],
      isGuest: true,
    })
  }

  // Parse cookie wallet if available
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

  const wallet = getCitizenWallet(citizen.id, fallbackWallet)
  const db = readLocalDB()
  const transactions = db.transactions
    .filter((tx) => tx.citizen_id === citizen.id)
    .slice(0, 20)

  const response = NextResponse.json({ wallet, transactions, isGuest: false })
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, amount, description, currentBalance, totalEarned, totalSpent, updatedAt } = body
    const citizenId = request.cookies.get('nc_citizen_id')?.value
    const citizen = getActiveCitizen(citizenId)
    if (!citizen) {
      return NextResponse.json(
        { error: 'Silakan masuk atau daftar terlebih dahulu.' },
        { status: 401 }
      )
    }

    // Determine current verified client balance from request body or cookie
    let clientBal = typeof currentBalance === 'number' && Number.isFinite(currentBalance) ? currentBalance : undefined
    if (clientBal === undefined) {
      try {
        const rawWalletCookie = request.cookies.get('nc_wallet')?.value
        if (rawWalletCookie) {
          const parsed = JSON.parse(decodeURIComponent(rawWalletCookie))
          if (parsed && parsed.cid === citizen.id && typeof parsed.b === 'number') {
            clientBal = parsed.b
          }
        }
      } catch {
        // ignore
      }
    }

    let wallet: any = null

    if (action === 'earn' || action === 'reward') {
      if (typeof clientBal === 'number') {
        const db = readLocalDB()
        let w = db.wallets.find((x) => x.citizen_id === citizen.id)
        if (w && w.balance !== clientBal) {
          w.balance = clientBal
        }
      }
      wallet = updateWalletBalance(
        citizen.id,
        Number(amount),
        action,
        description || 'Hadiah aktivitas kota'
      )
    } else if (action === 'reconcile') {
      wallet = updateWalletBalance(
        citizen.id,
        Number(amount),
        'reconcile',
        description || 'Sinkronisasi pemulihan saldo',
        { totalEarned, totalSpent, updatedAt }
      )
    } else if (action === 'spend') {
      if (typeof clientBal === 'number') {
        const db = readLocalDB()
        let w = db.wallets.find((x) => x.citizen_id === citizen.id)
        if (w && w.balance !== clientBal) {
          w.balance = clientBal
        }
      }
      wallet = updateWalletBalance(
        citizen.id,
        Number(amount),
        'spend',
        description || 'Pengeluaran kota'
      )
      if (!wallet) {
        return NextResponse.json(
          { success: false, error: 'Saldo koin tidak mencukupi' },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 })
    }

    const response = NextResponse.json({ success: true, wallet })
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kesalahan server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
