import { NextResponse, type NextRequest } from 'next/server'
import {
  getChatMessages,
  addChatMessage,
  getActiveCitizen,
} from '@/lib/db/localDb'

export async function GET(request: NextRequest) {
  // Reading request searchParams ensures dynamic execution under Cache Components
  const _ts = request.nextUrl.searchParams.get('_t')
  const messages = getChatMessages()
  return NextResponse.json({
    messages,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { content, senderName: clientSenderName, citizenId: clientCitizenId } = body
    if (!content || !content.trim()) {
      return NextResponse.json({ error: 'Pesan tidak boleh kosong' }, { status: 400 })
    }

    const citizenIdCookie = request.cookies.get('nc_citizen_id')?.value
    const citizen = getActiveCitizen(citizenIdCookie)

    const citizenId =
      clientCitizenId ||
      (citizen ? citizen.id : `guest-${Math.random().toString(36).substring(2, 7)}`)

    const senderName =
      (clientSenderName && clientSenderName.trim()) ||
      (citizen ? citizen.display_name || citizen.username : 'Pengunjung')

    const message = addChatMessage(citizenId, senderName, content.trim())
    return NextResponse.json({ success: true, message })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kesalahan server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
