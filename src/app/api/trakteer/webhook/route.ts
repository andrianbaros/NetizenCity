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
    // 1. Verify Trakteer Security Token from request headers
    const expectedToken = process.env.TRAKTEER_WEBHOOK_TOKEN || 'trhook-diOArR2n0mXDZ8f7W0iiDwNv'
    const incomingToken =
      req.headers.get('x-webhook-token') ||
      req.headers.get('X-Webhook-Token') ||
      req.headers.get('webhook-token')

    if (expectedToken && incomingToken && incomingToken !== expectedToken) {
      return NextResponse.json(
        { status: 'error', message: 'Token keamanan webhook tidak valid' },
        { status: 401 }
      )
    }

    const body = await req.json()

    // Trakteer official webhook payload: supporter_name, supporter_message, transaction_id, quantity, price, unit
    const supporterName = body.supporter_name || body.name || 'Warga Dermawan'
    const supporterMessage = body.supporter_message || body.message || 'Traktir kopi untuk Pak Mayor!'
    const quantity = typeof body.quantity === 'number' ? body.quantity : 1
    const price = typeof body.price === 'number' ? body.price : 5000
    const totalAmount = typeof body.amount === 'number' ? body.amount : (typeof body.price === 'number' ? body.price * quantity : quantity * 5000)
    const orderId = body.transaction_id || body.order_id || body.id

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
    token_protection: 'active',
  })
}
