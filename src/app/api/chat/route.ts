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

    const citizen = getActiveCitizen()
    const citizenId = citizen ? citizen.id : 'anon'
    const senderName = citizen ? citizen.display_name : 'Warga Netizen'

    const message = addChatMessage(citizenId, senderName, content.trim())
    return NextResponse.json({ success: true, message })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kesalahan server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
