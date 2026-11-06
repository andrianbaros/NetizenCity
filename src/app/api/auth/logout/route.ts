import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Berhasil keluar' })
  response.cookies.delete('nc_citizen_id')
  return response
}
