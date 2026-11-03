// ============================================================
// NETIZENCITY - Game Constants
// ============================================================

/** Tile and map dimensions */
export const TILE_SIZE = 32
export const MAP_WIDTH = 100
export const MAP_HEIGHT = 100
export const MAP_PIXEL_WIDTH = MAP_WIDTH * TILE_SIZE
export const MAP_PIXEL_HEIGHT = MAP_HEIGHT * TILE_SIZE

/** Player defaults */
export const PLAYER_SPEED = 160
export const PLAYER_SPRITE_SIZE = 32
export const STARTING_COINS = 500
export const MAX_LEVEL = 50
export const XP_PER_LEVEL_BASE = 100
export const XP_MULTIPLIER = 1.5

/** Camera */
export const CAMERA_ZOOM = 2
export const CAMERA_LERP = 0.1

/** City districts */
export const DISTRICTS = {
  TOWN_SQUARE: {
    id: 'town_square',
    name: 'Town Square',
    displayName: 'Alun-Alun Kota',
    description: 'The bustling center of NETIZENCITY',
    color: '#42a5f5',
    type: 'civic' as const,
  },
  RESIDENTIAL_NORTH: {
    id: 'residential_north',
    name: 'Residential North',
    displayName: 'Perumahan Utara',
    description: 'Quiet neighborhoods and cozy homes',
    color: '#66bb6a',
    type: 'residential' as const,
  },
  COMMERCIAL_EAST: {
    id: 'commercial_east',
    name: 'Commercial East',
    displayName: 'Pasar Timur',
    description: 'Shops, markets, and trading posts',
    color: '#ffa726',
    type: 'commercial' as const,
  },
  INDUSTRIAL_SOUTH: {
    id: 'industrial_south',
    name: 'Industrial South',
    displayName: 'Kawasan Industri Selatan',
    description: 'Factories and workshops',
    color: '#78909c',
    type: 'industrial' as const,
  },
  ENTERTAINMENT_WEST: {
    id: 'entertainment_west',
    name: 'Entertainment West',
    displayName: 'Hiburan Barat',
    description: 'Fun, games, and social gatherings',
    color: '#ab47bc',
    type: 'entertainment' as const,
  },
  CENTRAL_PARK: {
    id: 'central_park',
    name: 'Central Park',
    displayName: 'Taman Pusat',
    description: 'A peaceful green space in the city',
    color: '#2e7d32',
    type: 'park' as const,
  },
} as const

/** Housing types */
export const HOUSING_TYPES = {
  SMALL_HOUSE: { type: 'small_house', label: 'Small House', capacity: 1, basePrice: 200 },
  STANDARD_HOUSE: { type: 'standard_house', label: 'Standard House', capacity: 2, basePrice: 500 },
  APARTMENT: { type: 'apartment', label: 'Apartment', capacity: 1, basePrice: 300 },
  PUBLIC_HOUSING: { type: 'public_housing', label: 'Public Housing', capacity: 4, basePrice: 0 },
  PREMIUM: { type: 'premium', label: 'Premium Estate', capacity: 2, basePrice: 2000 },
} as const

/** Level titles */
export const LEVEL_TITLES: Record<number, string> = {
  1: 'Newcomer',
  5: 'Resident',
  10: 'Established Citizen',
  15: 'Respected Member',
  20: 'Community Leader',
  25: 'District Champion',
  30: 'City Influencer',
  35: 'Urban Legend',
  40: 'City Elder',
  45: 'Grand Citizen',
  50: 'Mayor\'s Council',
}

/** Chat settings */
export const CHAT_MAX_MESSAGE_LENGTH = 280
export const CHAT_HISTORY_LIMIT = 100

/** Animation keys */
export const ANIMATIONS = {
  PLAYER_IDLE_DOWN: 'player_idle_down',
  PLAYER_IDLE_UP: 'player_idle_up',
  PLAYER_IDLE_LEFT: 'player_idle_left',
  PLAYER_IDLE_RIGHT: 'player_idle_right',
  PLAYER_WALK_DOWN: 'player_walk_down',
  PLAYER_WALK_UP: 'player_walk_up',
  PLAYER_WALK_LEFT: 'player_walk_left',
  PLAYER_WALK_RIGHT: 'player_walk_right',
} as const

/** Public routes that don't require auth */
export const PUBLIC_ROUTES = ['/', '/login', '/register', '/forgot-password']

/** Protected routes that require auth */
export const PROTECTED_ROUTES = ['/city', '/welcome']
