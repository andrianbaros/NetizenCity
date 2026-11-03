// ============================================================
// NETIZENCITY - Game Type Definitions
// ============================================================

/** 2D position in the game world */
export interface Position {
  x: number
  y: number
}

/** Movement direction */
export type Direction = 'up' | 'down' | 'left' | 'right' | 'idle'

/** Player state synchronized across clients */
export interface PlayerState {
  citizenId: string
  username: string
  position: Position
  direction: Direction
  isMoving: boolean
  avatarConfig: Record<string, unknown>
  currentAnimation: string
}

/** District in the city */
export interface District {
  id: string
  name: string
  displayName: string
  description: string
  color: string
  bounds: {
    x: number
    y: number
    width: number
    height: number
  }
  buildingSlots: number
  type: DistrictType
}

/** Types of city districts */
export type DistrictType =
  | 'residential'
  | 'commercial'
  | 'industrial'
  | 'civic'
  | 'entertainment'
  | 'park'

/** Building data in the game world */
export interface BuildingData {
  id: string
  name: string
  type: BuildingType
  district: string
  position: Position
  size: { width: number; height: number }
  spriteKey: string
  isInteractable: boolean
  interactionType?: InteractionType
}

/** Types of buildings */
export type BuildingType =
  | 'house'
  | 'shop'
  | 'office'
  | 'factory'
  | 'park'
  | 'civic'
  | 'entertainment'
  | 'landmark'

/** Types of interactions with buildings */
export type InteractionType =
  | 'enter'
  | 'shop'
  | 'work'
  | 'socialize'
  | 'quest'
  | 'info'

/** NPC definition */
export interface NPCData {
  id: string
  name: string
  role: string
  position: Position
  spriteKey: string
  dialogue: string[]
  questIds?: string[]
}

/** Chat message */
export interface ChatMessage {
  id: string
  senderId: string
  senderName: string
  content: string
  channel: ChatChannel
  timestamp: string
}

/** Chat channels */
export type ChatChannel = 'global' | 'district' | 'private' | 'system'

/** Game configuration */
export interface GameConfig {
  tileSize: number
  mapWidth: number
  mapHeight: number
  playerSpeed: number
  cameraZoom: number
  renderScale: number
}

/** Multiplayer event types */
export type MultiplayerEventType =
  | 'player_join'
  | 'player_leave'
  | 'player_move'
  | 'player_interact'
  | 'chat_message'
  | 'state_sync'
