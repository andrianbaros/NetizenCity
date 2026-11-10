// ============================================================
// NETIZENCITY - Official Trakteer Webhook Listener
// Endpoint: /api/trakteer/webhook
// Connected to: https://trakteer.id/sahamnetzencity/tip
// Automatically handles incoming donations/tips from Trakteer
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { addInvestorEntry } from '@/lib/db/localDb'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Trakteer webhook sends: supporter_name, supporter_message, quantity, price, unit_name, order_id
    const supporterName = body.supporter_name || body.name || 'Warga Dermawan'
    const supporterMessage = body.supporter_message || body.message || 'Traktir kopi untuk Pak Mayor!'
    const quantity = typeof body.quantity === 'number' ? body.quantity : 1
    const price = typeof body.price === 'number' ? body.price : 5000
    const totalAmount = typeof body.amount === 'number' ? body.amount : quantity * price
    const orderId = body.order_id || body.id

    const result = addInvestorEntry({
      name: supporterName,
      message: supporterMessage,
      amount: totalAmount,
      trakteer_order_id: orderId,
    })

    return NextResponse.json({
      status: 'success',
      message: 'Trakteer webhook processed successfully',
      investor: result.investor,
    })
  } catch (error: any) {
    return NextResponse.json(
      { status: 'error', message: error.message || 'Webhook error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    endpoint: '/api/trakteer/webhook',
    trakteer_page: 'https://trakteer.id/sahamnetzencity/tip',
  })
}
