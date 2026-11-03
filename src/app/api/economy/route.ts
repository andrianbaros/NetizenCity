import { NextResponse, type NextRequest } from 'next/server'
import {
  getActiveCitizen,
  getCitizenWallet,
  updateWalletBalance,
  readLocalDB,
} from '@/lib/db/localDb'

export async function GET() {
  const citizen = getActiveCitizen()
  if (!citizen) {
    return NextResponse.json({ error: 'Citizen not found' }, { status: 404 })
  }

  const wallet = getCitizenWallet(citizen.id)
  const db = readLocalDB()
  const transactions = db.transactions
    .filter((tx) => tx.citizen_id === citizen.id)
    .slice(0, 20)

  return NextResponse.json({ wallet, transactions })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, amount, description } = body
    const citizen = getActiveCitizen()
    if (!citizen) {
      return NextResponse.json({ error: 'Citizen not found' }, { status: 404 })
    }

    if (action === 'earn' || action === 'reward') {
      const wallet = updateWalletBalance(
        citizen.id,
        Number(amount),
        action,
        description || 'Hadiah aktivitas kota'
      )
      return NextResponse.json({ success: true, wallet })
    }

    if (action === 'spend') {
      const wallet = updateWalletBalance(
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
      return NextResponse.json({ success: true, wallet })
    }

    return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kesalahan server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
