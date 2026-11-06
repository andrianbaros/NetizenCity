import { NextResponse, type NextRequest } from 'next/server'
import {
  readLocalDB,
  getActiveCitizen,
  addChatMessage,
} from '@/lib/db/localDb'

export async function GET() {
  const db = readLocalDB()
  return NextResponse.json({
    messages: db.chat_messages.slice(-50),
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content } = body
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 })
    }

    const citizenIdCookie = request.cookies.get('nc_citizen_id')?.value
    const citizen = getActiveCitizen(citizenIdCookie)
    const citizenId = citizen ? citizen.id : `guest-${Math.random().toString(36).substring(2, 7)}`
    const senderName = citizen ? (citizen.display_name || citizen.username) : 'Pengunjung'

    const message = addChatMessage(citizenId, senderName, content.trim())
    return NextResponse.json({ success: true, message })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kesalahan server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
