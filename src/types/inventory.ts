// ============================================================
// NETIZENCITY - Roblox-Style Inventory & Equipment System Types
// ============================================================

import type { ItemRarity, ItemCategory } from './economy'

export type BackpackCategory =
  | 'all'
  | 'tools'
  | 'fish'
  | 'clothing'
  | 'accessories'
  | 'special'

export interface FishingRodDefinition {
  id: string
  name: string
  rarity: ItemRarity
  tierName: string
  price: number
  luck: number // Multiplier/bonus to catch higher rarity fish, e.g. 0.35 (+35%)
  fishingSpeed: number // Multiplier to shorten bite & strike wait times, e.g. 1.35x
  maxWeight: number // Max weight limit / cap bonus in kg
  specialAbility: string
  description: string
  color: string // 3D Rod Blank hex color
  handleColor: string // Cork/grip hex color
  reelColor: string // Metal reel hex color
  glowColor?: string // Optional emissive glow hex for rare/epic/mythic/immortal
  icon: string
}

export interface InventoryItemMetadata {
  name?: string
  category?: BackpackCategory | string
  description?: string
  icon?: string
  weight?: number // for fish
  speciesId?: string // for fish
  rarity?: ItemRarity | string
  sellPrice?: number
  quantity?: number
  caughtLocation?: string
  caughtTimestamp?: string
  isFavorite?: boolean
  // For tools/rods
  rodTier?: ItemRarity
  luck?: number
  fishingSpeed?: number
  maxWeight?: number
  specialAbility?: string
  color?: string
  handleColor?: string
  reelColor?: string
  glowColor?: string
  [key: string]: any
}
