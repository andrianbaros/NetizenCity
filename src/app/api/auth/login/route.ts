import { NextResponse, type NextRequest } from 'next/server'
import { loginLocalCitizen } from '@/lib/db/localDb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan kata sandi wajib diisi' },
        { status: 400 }
      )
    }

    const result = loginLocalCitizen(email, password)
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
