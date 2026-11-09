// ============================================================
// NETIZENCITY - Citizen Store (Zustand)
// ============================================================

import { create } from 'zustand'
import type { CitizenProfile, AvatarConfig } from '@/types/citizen'
import type { Wallet, InventoryItem } from '@/types/economy'

interface CitizenState {
  profile: CitizenProfile | null
  wallet: Wallet | null
  inventory: InventoryItem[]
  isLoading: boolean
  setProfile: (profile: CitizenProfile | null) => void
  setWallet: (wallet: Wallet | null) => void
  updateBalance: (balance: number) => void
  setInventory: (inventory: InventoryItem[]) => void
  addToInventory: (item: InventoryItem) => void
  removeFromInventory: (inventoryId: string) => void
  batchRemoveFromInventory: (inventoryIds: string[]) => void
  toggleFavorite: (inventoryId: string) => void
  equipItem: (inventoryId: string) => void
  unequipItem: (inventoryId: string) => void
  updateAvatar: (avatarConfig: AvatarConfig) => void
  setLoading: (loading: boolean) => void
  reset: () => void
}

export const useCitizenStore = create<CitizenState>((set) => ({
  profile: null,
  wallet: null,
  inventory: [],
  isLoading: true,
  setProfile: (profile) => set({ profile }),
  setWallet: (wallet) => set({ wallet }),
  updateBalance: (balance) =>
    set((state) => ({
      wallet: state.wallet ? { ...state.wallet, balance } : null,
    })),
  setInventory: (inventory) => set({ inventory }),
  addToInventory: (item) =>
    set((state) => ({
      inventory: [item, ...state.inventory],
    })),
  removeFromInventory: (inventoryId) =>
    set((state) => ({
      inventory: state.inventory.filter((inv) => inv.id !== inventoryId),
    })),
  batchRemoveFromInventory: (inventoryIds) => {
    const idSet = new Set(inventoryIds)
    set((state) => ({
      inventory: state.inventory.filter((inv) => !idSet.has(inv.id)),
    }))
  },
  toggleFavorite: (inventoryId) =>
    set((state) => ({
      inventory: state.inventory.map((inv) =>
        inv.id === inventoryId ? { ...inv, isFavorite: !inv.isFavorite } : inv
      ),
    })),
  equipItem: (inventoryId) =>
    set((state) => {
      const target = state.inventory.find((inv) => inv.id === inventoryId)
      if (!target) return state
      const isRod = target.itemId.startsWith('rod_') || target.category === 'tools'

      return {
        inventory: state.inventory.map((inv) => {
          if (isRod && (inv.itemId.startsWith('rod_') || inv.category === 'tools')) {
            return { ...inv, isEquipped: inv.id === inventoryId }
          }
          if (inv.id === inventoryId) {
            return { ...inv, isEquipped: true }
          }
          return inv
        }),
      }
    }),
  unequipItem: (inventoryId) =>
    set((state) => ({
      inventory: state.inventory.map((inv) =>
        inv.id === inventoryId ? { ...inv, isEquipped: false } : inv
      ),
    })),
  updateAvatar: (avatarConfig) =>
    set((state) => ({
      profile: state.profile
        ? { ...state.profile, avatarConfig }
        : null,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ profile: null, wallet: null, inventory: [], isLoading: false }),
}))
