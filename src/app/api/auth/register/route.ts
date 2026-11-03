import { NextResponse, type NextRequest } from 'next/server'
import { registerLocalCitizen } from '@/lib/db/localDb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, username, displayName } = body

    if (!email || !password || !username || !displayName) {
      return NextResponse.json(
        { error: 'Semua kolom pendaftaran wajib diisi' },
        { status: 400 }
      )
    }

    const result = registerLocalCitizen(email, password, username, displayName)
    if (!result.success || !result.citizen) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    const response = NextResponse.json(result)
    response.cookies.set('nc_citizen_id', result.citizen.id, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
    })
    return response
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kesalahan server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
