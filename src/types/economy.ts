// ============================================================
// NETIZENCITY - Economy Type Definitions
// ============================================================

/** Citizen wallet */
export interface Wallet {
  id: string
  citizenId: string
  balance: number
  totalEarned: number
  totalSpent: number
  updatedAt: string
}

/** Transaction types */
export type TransactionType = 'earn' | 'spend' | 'reward' | 'admin'

/** Wallet transaction record */
export interface Transaction {
  id: string
  citizenId: string
  type: TransactionType
  amount: number
  previousBalance: number
  newBalance: number
  description: string
  referenceType: string | null
  referenceId: string | null
  idempotencyKey: string | null
  createdAt: string
}

/** Item rarity levels */
export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'

/** Item categories */
export type ItemCategory =
  | 'tops'
  | 'bottoms'
  | 'shoes'
  | 'hairstyles'
  | 'accessories'
  | 'skins'
  | 'special'

/** Shop item */
export interface Item {
  id: string
  name: string
  description: string
  category: ItemCategory
  price: number
  rarity: ItemRarity
  spriteKey: string
  isAvailable: boolean
  isLimited: boolean
  availableFrom: string | null
  availableUntil: string | null
  createdAt: string
}

/** Inventory item (owned by citizen) */
export interface InventoryItem {
  id: string
  citizenId: string
  itemId: string
  item?: Item
  isEquipped: boolean
  acquiredAt: string
  name?: string
  category?: 'fish' | 'fashion' | 'crop' | 'other' | ItemCategory
  description?: string
  icon?: string
  weight?: number // for fish (e.g. 3.45 kg)
  rarity?: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'Biasa' | 'Langka' | 'Legendaris'
  sellPrice?: number
  quantity?: number
}

/** Price display helper */
export interface PriceDisplay {
  amount: number
  formatted: string
  canAfford: boolean
}

/** Rarity configuration */
export interface RarityConfig {
  name: ItemRarity
  label: string
  color: string
  dropRate: number
}

/** Rarity color mappings */
export const RARITY_COLORS: Record<ItemRarity, string> = {
  common: '#9e9e9e',
  uncommon: '#4caf50',
  rare: '#2196f3',
  epic: '#9c27b0',
  legendary: '#ff9800',
}
