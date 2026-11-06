// ============================================================
// NETIZENCITY - Real-time Online Presence Tracker
// Tracks active online visitors (both guests & registered citizens)
// ============================================================

import fs from 'fs'
import path from 'path'
import { readLocalDB, writeLocalDB } from './db/localDb'

interface PresenceSession {
  lastSeen: number
  citizenId?: string
}

const PRESENCE_TIMEOUT_MS = 45 * 1000 // 45 seconds timeout
const PRESENCE_FILE = path.join(process.cwd(), 'data', 'presence.json')

// Attach to globalThis so the presence map survives across requests in the Node server
declare global {
  // eslint-disable-next-line no-var
  var __netizen_presence_sessions: Map<string, PresenceSession> | undefined
}

function getSessionMap(): Map<string, PresenceSession> {
  if (!globalThis.__netizen_presence_sessions) {
    globalThis.__netizen_presence_sessions = new Map<string, PresenceSession>()
    // Try to load persisted presence state if available
    try {
      if (fs.existsSync(PRESENCE_FILE)) {
        const raw = fs.readFileSync(PRESENCE_FILE, 'utf-8')
        const entries = JSON.parse(raw) as Array<[string, PresenceSession]>
        const now = Date.now()
        for (const [id, s] of entries) {
          if (now - s.lastSeen < PRESENCE_TIMEOUT_MS) {
            globalThis.__netizen_presence_sessions.set(id, s)
          }
        }
      }
    } catch {
      // ignore
    }
  }
  return globalThis.__netizen_presence_sessions
}

function persistSessionMap(map: Map<string, PresenceSession>) {
  try {
    const dir = path.dirname(PRESENCE_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    const entries = Array.from(map.entries())
    fs.writeFileSync(PRESENCE_FILE, JSON.stringify(entries, null, 2), 'utf-8')
  } catch {
    // ignore
  }
}

/**
 * Record active ping from any visitor or citizen and return current real online count
 */
export function recordPresence(clientId: string, citizenId?: string): number {
  const map = getSessionMap()
  const now = Date.now()

  // Update current client
  map.set(clientId, {
    lastSeen: now,
    citizenId: citizenId || map.get(clientId)?.citizenId,
  })

  // Prune expired sessions
  const expiredCitizenIds = new Set<string>()
  for (const [id, session] of map.entries()) {
    if (now - session.lastSeen > PRESENCE_TIMEOUT_MS) {
      if (session.citizenId) {
        expiredCitizenIds.add(session.citizenId)
      }
      map.delete(id)
    }
  }

  // Update offline citizens in local database if any expired
  if (expiredCitizenIds.size > 0) {
    try {
      const db = readLocalDB()
      let updated = false
      db.citizens.forEach((c) => {
        if (expiredCitizenIds.has(c.id) && c.is_online) {
          c.is_online = false
          updated = true
        }
      })
      if (updated) {
        writeLocalDB(db)
      }
    } catch {
      // ignore
    }
  }

  // Also update active citizen as online in db
  if (citizenId) {
    try {
      const db = readLocalDB()
      const cit = db.citizens.find((c) => c.id === citizenId)
      if (cit && !cit.is_online) {
        cit.is_online = true
        writeLocalDB(db)
      }
    } catch {
      // ignore
    }
  }

  persistSessionMap(map)
  return Math.max(1, map.size)
}

/**
 * Get current real online visitor count
 */
export function getRealOnlineCount(): number {
  const map = getSessionMap()
  const now = Date.now()

  // Prune expired sessions
  for (const [id, session] of map.entries()) {
    if (now - session.lastSeen > PRESENCE_TIMEOUT_MS) {
      map.delete(id)
    }
  }

  return Math.max(1, map.size)
}
