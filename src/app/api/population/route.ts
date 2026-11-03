import { NextResponse } from 'next/server'
import { getInstagramStatus } from '@/lib/instagram/api'
import { readLocalDB } from '@/lib/db/localDb'

export async function GET() {
  try {
    const igStatus = getInstagramStatus()
    let registeredCount = 3420
    let onlineCount = 128

    try {
      const db = readLocalDB()
      if (db.citizens && db.citizens.length > 0) {
        registeredCount = db.citizens.length
        onlineCount = db.citizens.filter((c) => c.is_online).length
      }
    } catch {
      // ignore
    }

    const payload = {
      officialPopulation: igStatus.currentFollowers,
      registeredCitizens: registeredCount,
      onlineNow: onlineCount,
      official_population: igStatus.currentFollowers,
      registered_citizens: registeredCount,
      online_now: onlineCount,
      source: igStatus.source,
      last_sync: igStatus.lastSyncAt,
      lastUpdated: igStatus.lastSyncAt,
      isApiConnected: igStatus.isConnected,
    }

    return NextResponse.json(payload)
  } catch {
    const igStatus = getInstagramStatus()
    return NextResponse.json({
      officialPopulation: igStatus.currentFollowers,
      registeredCitizens: 3420,
      onlineNow: 128,
      official_population: igStatus.currentFollowers,
      registered_citizens: 3420,
      online_now: 128,
      source: igStatus.source,
      last_sync: igStatus.lastSyncAt,
    })
  }
}
