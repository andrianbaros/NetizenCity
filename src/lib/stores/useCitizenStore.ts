// ============================================================
// NETIZENCITY - Citizen Store (Zustand with LocalStorage Persistence)
// ============================================================

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
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

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

function syncWalletCookie(wallet: Wallet | null) {
  if (typeof document === 'undefined' || !wallet) return
  try {
    const payload = encodeURIComponent(
      JSON.stringify({
        cid: wallet.citizenId,
        b: wallet.balance,
        te: wallet.totalEarned ?? wallet.balance,
        ts: wallet.totalSpent ?? 0,
        u: wallet.updatedAt || new Date().toISOString(),
      })
    )
    document.cookie = `nc_wallet=${payload}; path=/; max-age=2592000; SameSite=Lax`
  } catch {
    // ignore
  }
}

export const useCitizenStore = create<CitizenState>()(
  persist(
    (set) => ({
      profile: null,
      wallet: null,
      inventory: [],
      isLoading: true,
      setProfile: (profile) =>
        set((state) => {
          if (profile && state.profile && profile.id !== state.profile.id) {
            // Citizen account switched - clear prior citizen's wallet and inventory
            return { profile, wallet: null, inventory: [] }
          }
          return { profile }
        }),
      setWallet: (wallet) => {
        syncWalletCookie(wallet)
        set({ wallet })
      },
      updateBalance: (balance) =>
        set((state) => {
          if (!state.wallet) {
            const newW: Wallet = {
              id: 'w-' + (state.profile?.id || 'saved'),
              citizenId: state.profile?.id || 'citizen',
              balance,
              totalEarned: balance,
              totalSpent: 0,
              updatedAt: new Date().toISOString(),
            }
            syncWalletCookie(newW)
            return { wallet: newW }
          }
          const prev = state.wallet.balance
          const diff = balance - prev
          const updatedW: Wallet = {
            ...state.wallet,
            balance,
            totalEarned:
              diff > 0
                ? (state.wallet.totalEarned ?? prev) + diff
                : state.wallet.totalEarned,
            totalSpent:
              diff < 0
                ? (state.wallet.totalSpent ?? 0) + Math.abs(diff)
                : state.wallet.totalSpent,
            updatedAt: new Date().toISOString(),
          }
          syncWalletCookie(updatedW)
          return { wallet: updatedW }
        }),
      setInventory: (inventory) => set({ inventory: Array.isArray(inventory) ? inventory : [] }),
      addToInventory: (item) =>
        set((state) => ({
          inventory: [item, ...(Array.isArray(state.inventory) ? state.inventory : [])],
        })),
      removeFromInventory: (inventoryId) =>
        set((state) => ({
          inventory: (Array.isArray(state.inventory) ? state.inventory : []).filter((inv) => inv.id !== inventoryId),
        })),
      batchRemoveFromInventory: (inventoryIds) => {
        const idSet = new Set(inventoryIds)
        set((state) => ({
          inventory: (Array.isArray(state.inventory) ? state.inventory : []).filter((inv) => !idSet.has(inv.id)),
        }))
      },
      toggleFavorite: (inventoryId) =>
        set((state) => ({
          inventory: (Array.isArray(state.inventory) ? state.inventory : []).map((inv) =>
            inv.id === inventoryId ? { ...inv, isFavorite: !inv.isFavorite } : inv
          ),
        })),
      equipItem: (inventoryId) =>
        set((state) => {
          const target = state.inventory.find(
            (inv) =>
              inv.id === inventoryId ||
              inv.itemId === inventoryId ||
              (inv as any).item_id === inventoryId
          )
          if (!target) return state
          const targetItemId = target.itemId || (target as any).item_id || ''
          const isRod = targetItemId.startsWith('rod_') || target.category === 'tools'

          if (isRod) {
            if (typeof document !== 'undefined') {
              document.cookie = `nc_equipped_rod=${targetItemId}; path=/; max-age=2592000; SameSite=Lax`
            }
            if (typeof localStorage !== 'undefined') {
              try {
                localStorage.setItem('nc_equipped_rod', targetItemId)
              } catch {}
            }
          }

          return {
            inventory: state.inventory.map((inv) => {
              const invItemId = inv.itemId || (inv as any).item_id || ''
              if (isRod && (invItemId.startsWith('rod_') || inv.category === 'tools')) {
                return { ...inv, isEquipped: inv.id === target.id || invItemId === targetItemId }
              }
              if (inv.id === target.id) {
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
        set((state) => {
          if (typeof document !== 'undefined') {
            try {
              document.cookie = `nc_avatar_config=${encodeURIComponent(JSON.stringify(avatarConfig))}; path=/; max-age=2592000; SameSite=Lax`
            } catch {}
          }
          return {
            profile: state.profile
              ? { ...state.profile, avatarConfig }
              : null,
          }
        }),
      setLoading: (isLoading) => set({ isLoading }),
      reset: () => set({ profile: null, wallet: null, inventory: [], isLoading: false }),
    }),
    {
      name: 'netizen_citizen_storage_v1',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : (dummyStorage as any))),
      partialize: (state) => ({
        profile: state.profile,
        wallet: state.wallet,
        inventory: state.inventory,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.wallet) {
          syncWalletCookie(state.wallet)
        }
        if (state?.profile?.avatarConfig && typeof document !== 'undefined') {
          try {
            document.cookie = `nc_avatar_config=${encodeURIComponent(JSON.stringify(state.profile.avatarConfig))}; path=/; max-age=2592000; SameSite=Lax`
          } catch {}
        }
      },
    }
  )
)
