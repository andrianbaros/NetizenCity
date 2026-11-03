import { NextResponse } from 'next/server'
import { getInstagramStatus } from '@/lib/instagram/api'

export async function GET() {
  const status = getInstagramStatus()
  return NextResponse.json(status)
}
