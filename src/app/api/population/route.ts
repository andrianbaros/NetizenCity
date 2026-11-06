import { NextRequest, NextResponse } from 'next/server'
import { getInstagramStatus, fetchInstagramFollowersFromAPI } from '@/lib/instagram/api'
import { readLocalDB } from '@/lib/db/localDb'
import { recordPresence } from '@/lib/presence'

export async function GET(request: NextRequest) {
  try {
    // 1. Identify client session for real-time presence (guest or citizen)
    const { searchParams } = new URL(request.url)
    const urlClientId = searchParams.get('clientId')
    const headerClientId = request.headers.get('x-client-id')
    const cookieClientId = request.cookies.get('netizen_client_id')?.value
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || '127.0.0.1'

    const clientId = urlClientId || headerClientId || cookieClientId || `visitor_${ip}`
    const citizenId =
      searchParams.get('citizenId') ||
      request.headers.get('x-citizen-id') ||
      request.cookies.get('netizen_citizen_id')?.value ||
      undefined

    // Record real online visitor presence
    const realOnlineCount = recordPresence(clientId, citizenId)

    // 2. Live Sync Instagram Followers
    let igStatus = getInstagramStatus()
    const now = Date.now()
    const lastSyncTime = igStatus.lastSyncAt ? new Date(igStatus.lastSyncAt).getTime() : 0
    const shouldForceSync = searchParams.get('sync') === '1' || searchParams.get('sync') === 'true'

    // If configured and last sync was > 60 seconds ago (or forced), sync live from Meta Graph API
    if (igStatus.isConfigured && (shouldForceSync || now - lastSyncTime > 60 * 1000)) {
      try {
        const syncResult = await fetchInstagramFollowersFromAPI()
        if (syncResult.success) {
          igStatus = getInstagramStatus()
        }
      } catch {
        // Continue with current cached followers if network fails
      }
    }

    // 3. Registered Citizens Count from Local Database
    let registeredCount = 3420
    try {
      const db = readLocalDB()
      if (db.citizens && db.citizens.length > 0) {
        registeredCount = db.citizens.length
      }
    } catch {
      // ignore
    }

    const payload = {
      officialPopulation: igStatus.currentFollowers,
      registeredCitizens: registeredCount,
      onlineNow: realOnlineCount,
      official_population: igStatus.currentFollowers,
      registered_citizens: registeredCount,
      online_now: realOnlineCount,
      source: igStatus.source,
      last_sync: igStatus.lastSyncAt,
      lastUpdated: igStatus.lastSyncAt,
      isApiConnected: igStatus.isConfigured,
    }

    const response = NextResponse.json(payload)
    if (!cookieClientId) {
      response.cookies.set('netizen_client_id', clientId, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30, // 30 days
        sameSite: 'lax',
      })
    }
    return response
  } catch {
    const igStatus = getInstagramStatus()
    return NextResponse.json({
      officialPopulation: igStatus.currentFollowers,
      registeredCitizens: 3420,
      onlineNow: 1,
      official_population: igStatus.currentFollowers,
      registered_citizens: 3420,
      online_now: 1,
      source: igStatus.source,
      last_sync: igStatus.lastSyncAt,
    })
  }
}

export async function POST(request: NextRequest) {
  // Support POST to force immediate live sync
  try {
    const syncRes = await fetchInstagramFollowersFromAPI()
    const igStatus = getInstagramStatus()
    return NextResponse.json({
      success: syncRes.success,
      followerCount: igStatus.currentFollowers,
      lastSyncAt: igStatus.lastSyncAt,
      error: syncRes.error,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Gagal sinkronisasi'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
