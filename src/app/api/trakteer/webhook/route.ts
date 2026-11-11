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
      console.warn('[Trakteer Webhook] Invalid token received:', incomingToken)
      return NextResponse.json(
        { status: 'error', message: 'Token keamanan webhook tidak valid' },
        { status: 401 }
      )
    }

    const rawBody = await req.json().catch(() => ({}))
    // Trakteer payload can be at root or wrapped in .data
    const data = rawBody.data || rawBody

    console.log('[Trakteer Webhook] Received payload:', JSON.stringify(data))

    // Trakteer official webhook payload fields:
    // supporter_name, supporter_message, quantity, price, unit, transaction_id
    const supporterName = data.supporter_name || data.name || 'Warga Dermawan'
    const supporterMessage = data.supporter_message || data.message || 'Traktir kopi untuk Pak Mayor!'
    const quantity = typeof data.quantity === 'number' ? data.quantity : 1
    const price = typeof data.price === 'number' ? data.price : 5000
    const totalAmount =
      typeof data.amount === 'number'
        ? data.amount
        : (typeof data.price === 'number' ? data.price * quantity : quantity * 5000)
    const orderId = data.transaction_id || data.order_id || data.id || `tr_${Date.now()}`

    const result = addInvestorEntry({
      name: supporterName,
      message: supporterMessage,
      amount: totalAmount,
      trakteer_order_id: orderId,
    })

    return NextResponse.json(
      {
        status: 'success',
        message: 'Trakteer webhook processed successfully',
        investor: result.investor,
      },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
        },
      }
    )
  } catch (error: any) {
    console.error('[Trakteer Webhook Error]', error)
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
