// ============================================================
// NETIZENCITY - Official Meta / Instagram Graph API Service
// ============================================================

import fs from 'fs'
import path from 'path'

export interface InstagramSyncResult {
  success: boolean
  followerCount?: number
  username?: string
  source: 'instagram_api' | 'manual'
  timestamp: string
  error?: string
}

export interface InstagramStatus {
  isConfigured: boolean
  username: string
  accountId?: string
  lastSyncAt: string | null
  currentFollowers: number
  source: 'instagram_api' | 'manual'
  lastError: string | null
}

interface PopulationState {
  followerCount: number
  source: 'instagram_api' | 'manual'
  lastSyncAt: string | null
  lastError: string | null
  history: Array<{
    id: string
    followerCount: number
    source: 'instagram_api' | 'manual'
    oldValue: number | null
    reason: string | null
    updatedBy: string
    recordedAt: string
  }>
}

const DATA_FILE = path.join(process.cwd(), 'data', 'population.json')

function loadState(): PopulationState {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8')
      return JSON.parse(raw)
    }
  } catch {
    // fallback
  }

  const initial: PopulationState = {
    followerCount: 25800,
    source: 'manual',
    lastSyncAt: new Date().toISOString(),
    lastError: null,
    history: [
      {
        id: 'init-1',
        followerCount: 25800,
        source: 'manual',
        oldValue: 0,
        reason: 'Inisialisasi awal basis data populasi @netizencity.id',
        updatedBy: 'Sistem Kota',
        recordedAt: new Date().toISOString(),
      },
    ],
  }
  saveState(initial)
  return initial
}

function saveState(state: PopulationState) {
  try {
    const dir = path.dirname(DATA_FILE)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), 'utf-8')
  } catch {
    // ignore
  }
}

/**
 * Calls the official Meta Graph API to fetch followers_count for @netizencity.id
 */
export async function fetchInstagramFollowersFromAPI(
  tokenOverride?: string,
  accountIdOverride?: string
): Promise<InstagramSyncResult> {
  const token = tokenOverride || process.env.INSTAGRAM_ACCESS_TOKEN
  const accountId = accountIdOverride || process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
  const state = loadState()

  if (!token || token.includes('your_instagram_token_here')) {
    return {
      success: false,
      source: 'manual',
      timestamp: new Date().toISOString(),
      error:
        'Instagram Access Token belum diatur di .env.local atau form konfigurasi. Gunakan update manual atau masukkan token Meta Graph API.',
    }
  }

  if (!accountId || accountId.includes('your_account_id_here')) {
    return {
      success: false,
      source: 'manual',
      timestamp: new Date().toISOString(),
      error:
        'Instagram Business Account ID belum diatur. Diperlukan ID akun Instagram Business yang terhubung ke Facebook Page.',
    }
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${accountId}?fields=followers_count,follows_count,media_count,username&access_token=${token}`
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
      next: { revalidate: 0 },
    })

    const data = await response.json()

    if (!response.ok || data.error) {
      const errorMsg =
        data.error?.message ||
        `Permintaan Meta Graph API gagal dengan status ${response.status}`
      state.lastError = errorMsg
      saveState(state)
      return {
        success: false,
        source: 'manual',
        timestamp: new Date().toISOString(),
        error: errorMsg,
      }
    }

    const followers = data.followers_count
    if (typeof followers !== 'number') {
      return {
        success: false,
        source: 'manual',
        timestamp: new Date().toISOString(),
        error: 'Respons API tidak berisi angka followers_count yang valid',
      }
    }

    // Record success
    const oldVal = state.followerCount
    state.followerCount = followers
    state.source = 'instagram_api'
    state.lastSyncAt = new Date().toISOString()
    state.lastError = null

    state.history.unshift({
      id: Math.random().toString(36).substring(2, 9),
      followerCount: followers,
      source: 'instagram_api',
      oldValue: oldVal,
      reason: 'Sinkronisasi otomatis Meta Graph API v19.0',
      updatedBy: 'Meta Graph API',
      recordedAt: new Date().toISOString(),
    })

    saveState(state)

    return {
      success: true,
      followerCount: followers,
      username: data.username || 'netizencity.id',
      source: 'instagram_api',
      timestamp: new Date().toISOString(),
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Koneksi ke server Meta gagal'
    state.lastError = msg
    saveState(state)
    return {
      success: false,
      source: 'manual',
      timestamp: new Date().toISOString(),
      error: msg,
    }
  }
}

/**
 * Records a manual correction of the follower count as mandated by Section 7
 */
export function recordManualFollowerCount(
  newCount: number,
  reason: string,
  adminName: string = 'Administrator'
): InstagramSyncResult {
  const state = loadState()
  const oldVal = state.followerCount
  state.followerCount = newCount
  state.source = 'manual'
  state.lastSyncAt = new Date().toISOString()
  state.lastError = null

  state.history.unshift({
    id: Math.random().toString(36).substring(2, 9),
    followerCount: newCount,
    source: 'manual',
    oldValue: oldVal,
    reason: reason || 'Koreksi manual populasi kota',
    updatedBy: adminName,
    recordedAt: new Date().toISOString(),
  })

  // Limit history length to 50
  if (state.history.length > 50) {
    state.history.pop()
  }

  saveState(state)

  return {
    success: true,
    followerCount: newCount,
    source: 'manual',
    timestamp: new Date().toISOString(),
  }
}

/**
 * Returns current Instagram connection status & latest population data
 */
export function getInstagramStatus(): InstagramStatus & {
  history: PopulationState['history']
} {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID
  const isConfigured = Boolean(
    token &&
      !token.includes('your_instagram_token_here') &&
      accountId &&
      !accountId.includes('your_account_id_here')
  )

  const state = loadState()

  return {
    isConfigured,
    username: 'netizencity.id',
    accountId: accountId && !accountId.includes('your_account_id_here') ? accountId : undefined,
    lastSyncAt: state.lastSyncAt,
    currentFollowers: state.followerCount,
    source: state.source,
    lastError: state.lastError,
    history: state.history,
  }
}
