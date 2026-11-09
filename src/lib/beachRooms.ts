// ============================================================
// NETIZENCITY - Beach Multiplayer Room Manager
// Server-side presence, position and fishing state synchronization for
// Pantai Netizen Beach (Max 10 citizens per room/server)
// ============================================================

export interface BeachPlayer {
  id: string
  name: string
  isGuest: boolean
  x: number
  z: number
  facing: number
  avatarConfig?: any
  isFishing?: boolean
  isMoving?: boolean
  lastSeen: number
  lastChat?: { id: string; text: string; time: number }
}

export interface BeachRoomSummary {
  roomId: string
  name: string
  userCount: number
  maxCapacity: number
  isFull: boolean
}

const MAX_ROOM_CAPACITY = 10
const PLAYER_TIMEOUT_MS = 12 * 1000 // 12 seconds timeout

declare global {
  // eslint-disable-next-line no-var
  var __netizen_beach_rooms: Map<string, Map<string, BeachPlayer>> | undefined
}

function getRoomsMap(): Map<string, Map<string, BeachPlayer>> {
  if (!globalThis.__netizen_beach_rooms) {
    globalThis.__netizen_beach_rooms = new Map<string, Map<string, BeachPlayer>>()
    // Always initialize at least room-1
    globalThis.__netizen_beach_rooms.set('1', new Map<string, BeachPlayer>())
  }
  return globalThis.__netizen_beach_rooms
}

/**
 * Remove stale players who haven't pinged within PLAYER_TIMEOUT_MS
 */
export function pruneStaleBeachPlayers() {
  const rooms = getRoomsMap()
  const now = Date.now()

  for (const [roomId, playerMap] of rooms.entries()) {
    for (const [playerId, player] of playerMap.entries()) {
      if (now - player.lastSeen > PLAYER_TIMEOUT_MS) {
        playerMap.delete(playerId)
      }
    }
    // Keep room '1' always, but prune empty higher rooms
    if (roomId !== '1' && playerMap.size === 0) {
      rooms.delete(roomId)
    }
  }
}

/**
 * Get summary of all active beach fishing rooms
 */
export function getBeachRoomsSummary(): BeachRoomSummary[] {
  pruneStaleBeachPlayers()
  const rooms = getRoomsMap()

  if (!rooms.has('1')) {
    rooms.set('1', new Map())
  }

  const summaries: BeachRoomSummary[] = []
  const sortedRoomIds = Array.from(rooms.keys()).sort((a, b) => parseInt(a, 10) - parseInt(b, 10))

  for (const roomId of sortedRoomIds) {
    const playerMap = rooms.get(roomId)!
    summaries.push({
      roomId,
      name: `Pantai #${roomId}`,
      userCount: playerMap.size,
      maxCapacity: MAX_ROOM_CAPACITY,
      isFull: playerMap.size >= MAX_ROOM_CAPACITY,
    })
  }

  // If the last room is full, show the next available server room
  const lastSummary = summaries[summaries.length - 1]
  if (lastSummary && lastSummary.isFull) {
    const nextId = (parseInt(lastSummary.roomId, 10) + 1).toString()
    summaries.push({
      roomId: nextId,
      name: `Pantai #${nextId}`,
      userCount: 0,
      maxCapacity: MAX_ROOM_CAPACITY,
      isFull: false,
    })
  }

  return summaries
}

/**
 * Join or update player position and fishing state in a beach room
 */
export function syncPlayerInBeachRoom(params: {
  clientId: string
  name: string
  isGuest: boolean
  x: number
  z: number
  facing: number
  avatarConfig?: any
  isFishing?: boolean
  isMoving?: boolean
  preferredRoomId?: string
  chatText?: string
  chatId?: string
}): {
  roomId: string
  userCount: number
  maxCapacity: number
  players: Array<{
    id: string
    name: string
    isGuest: boolean
    x: number
    z: number
    facing: number
    avatarConfig?: any
    isFishing?: boolean
    isMoving?: boolean
    lastChat?: { id: string; text: string; time: number }
  }>
  allRooms: BeachRoomSummary[]
} {
  pruneStaleBeachPlayers()
  const rooms = getRoomsMap()
  const { clientId, name, isGuest, x, z, facing, avatarConfig, isFishing, isMoving, preferredRoomId, chatText, chatId } = params
  const now = Date.now()

  // Find if player is currently in any beach room
  let currentRoomId: string | null = null
  for (const [rId, playerMap] of rooms.entries()) {
    if (playerMap.has(clientId)) {
      currentRoomId = rId
      break
    }
  }

  let targetRoomId = preferredRoomId || currentRoomId || '1'

  // If player requested a room switch or has no room, check capacity
  if (targetRoomId !== currentRoomId) {
    const targetMap = rooms.get(targetRoomId)
    if (targetMap && targetMap.size >= MAX_ROOM_CAPACITY && !targetMap.has(clientId)) {
      // Preferred room is full, find first available room
      let foundAvailable = false
      for (const [rId, playerMap] of rooms.entries()) {
        if (playerMap.size < MAX_ROOM_CAPACITY) {
          targetRoomId = rId
          foundAvailable = true
          break
        }
      }
      if (!foundAvailable) {
        const nextNum = rooms.size + 1
        targetRoomId = nextNum.toString()
        rooms.set(targetRoomId, new Map())
      }
    } else if (!targetMap) {
      rooms.set(targetRoomId, new Map())
    }

    if (currentRoomId && currentRoomId !== targetRoomId) {
      rooms.get(currentRoomId)?.delete(clientId)
    }
  }

  const roomMap = rooms.get(targetRoomId)!
  const existingPlayer = roomMap.get(clientId)
  const lastChat = chatText
    ? { id: chatId || `msg_${now}`, text: chatText, time: now }
    : existingPlayer?.lastChat

  roomMap.set(clientId, {
    id: clientId,
    name: name || 'Pemancing Pantai',
    isGuest: Boolean(isGuest),
    x,
    z,
    facing,
    avatarConfig: avatarConfig || existingPlayer?.avatarConfig,
    isFishing: typeof isFishing === 'boolean' ? isFishing : existingPlayer?.isFishing,
    isMoving: typeof isMoving === 'boolean' ? isMoving : false,
    lastSeen: now,
    lastChat,
  })

  // Collect other anglers in this beach room
  const playersList: Array<{
    id: string
    name: string
    isGuest: boolean
    x: number
    z: number
    facing: number
    avatarConfig?: any
    isFishing?: boolean
    isMoving?: boolean
    lastChat?: { id: string; text: string; time: number }
  }> = []

  for (const p of roomMap.values()) {
    playersList.push({
      id: p.id,
      name: p.name,
      isGuest: p.isGuest,
      x: p.x,
      z: p.z,
      facing: p.facing,
      avatarConfig: p.avatarConfig,
      isFishing: p.isFishing,
      isMoving: p.isMoving,
      lastChat: p.lastChat,
    })
  }

  return {
    roomId: targetRoomId,
    userCount: roomMap.size,
    maxCapacity: MAX_ROOM_CAPACITY,
    players: playersList,
    allRooms: getBeachRoomsSummary(),
  }
}

/**
 * Remove player when leaving Beach area
 */
export function removePlayerFromBeach(clientId: string) {
  const rooms = getRoomsMap()
  for (const playerMap of rooms.values()) {
    if (playerMap.has(clientId)) {
      playerMap.delete(clientId)
    }
  }
}
