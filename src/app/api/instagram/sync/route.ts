import { NextResponse, type NextRequest } from 'next/server'
import {
  fetchInstagramFollowersFromAPI,
  recordManualFollowerCount,
} from '@/lib/instagram/api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'api_sync') {
      const result = await fetchInstagramFollowersFromAPI(
        body.token,
        body.accountId
      )
      return NextResponse.json(result)
    }

    if (action === 'manual_update') {
      const count = Number(body.count)
      if (isNaN(count) || count < 0) {
        return NextResponse.json(
          { success: false, error: 'Jumlah follower harus berupa angka positif' },
          { status: 400 }
        )
      }

      const result = recordManualFollowerCount(
        count,
        body.reason || 'Pembaruan follower manual oleh admin',
        body.adminName || 'Admin Netizen'
      )
      return NextResponse.json(result)
    }

    return NextResponse.json(
      { success: false, error: 'Aksi tidak dikenali' },
      { status: 400 }
    )
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kesalahan server'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
