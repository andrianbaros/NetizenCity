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
  updateAvatar: (avatarConfig) =>
    set((state) => ({
      profile: state.profile
        ? { ...state.profile, avatarConfig }
        : null,
    })),
  setLoading: (isLoading) => set({ isLoading }),
  reset: () => set({ profile: null, wallet: null, inventory: [], isLoading: false }),
}))
