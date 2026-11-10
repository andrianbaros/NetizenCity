// ============================================================
// NETIZENCITY - Rod Shop Modal (Toko Joran Pancing Kali & Rimba)
// 7 Tiers of Fishing Rods: Wooden -> Bamboo -> Carbon -> Pro -> Gold -> Mythic -> Immortal
// Connected to /api/inventory, real-time equipping & wallet updates
// ============================================================

'use client'

import React, { useState } from 'react'
import {
  Sparkles,
  Coins,
  Check,
  Zap,
  ShieldAlert,
  Loader2,
  Fish,
  Anchor,
  Compass,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/lib/stores/useUIStore'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'
import { formatCoins } from '@/lib/utils/formatting'
import {
  FISHING_RODS,
  type FishingRodDefinition,
} from '@/lib/inventory/rodDefinitions'

const RARITY_THEMES: Record<
  string,
  {
    bg: string
    border: string
    badgeBg: string
    badgeText: string
    glow: string
    accent: string
  }
> = {
  common: {
    bg: 'bg-stone-50 dark:bg-stone-900/60',
    border: 'border-stone-200 dark:border-stone-700',
    badgeBg: 'bg-stone-200 dark:bg-stone-700',
    badgeText: 'text-stone-700 dark:text-stone-300',
    glow: '',
    accent: '#8B5A2B',
  },
  uncommon: {
    bg: 'bg-lime-50 dark:bg-lime-950/40',
    border: 'border-lime-200 dark:border-lime-800',
    badgeBg: 'bg-lime-100 dark:bg-lime-900/60',
    badgeText: 'text-lime-800 dark:text-lime-300',
    glow: '',
    accent: '#84CC16',
  },
  rare: {
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    border: 'border-sky-300 dark:border-sky-700',
    badgeBg: 'bg-sky-100 dark:bg-sky-900/60',
    badgeText: 'text-sky-800 dark:text-sky-300',
    glow: 'shadow-sky-500/10',
    accent: '#2563EB',
  },
  epic: {
    bg: 'bg-purple-50 dark:bg-purple-950/40',
    border: 'border-purple-300 dark:border-purple-700',
    badgeBg: 'bg-purple-100 dark:bg-purple-900/60',
    badgeText: 'text-purple-800 dark:text-purple-300',
    glow: 'shadow-purple-500/15',
    accent: '#9333EA',
  },
  legendary: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    border: 'border-amber-400 dark:border-amber-600',
    badgeBg: 'bg-gradient-to-r from-amber-200 to-yellow-300 dark:from-amber-900 dark:to-yellow-800',
    badgeText: 'text-amber-900 dark:text-amber-200',
    glow: 'shadow-amber-500/20 ring-1 ring-amber-400/40',
    accent: '#EAB308',
  },
  mythic: {
    bg: 'bg-rose-50 dark:bg-rose-950/40',
    border: 'border-rose-400 dark:border-rose-600',
    badgeBg: 'bg-gradient-to-r from-rose-500 to-red-600',
    badgeText: 'text-white',
    glow: 'shadow-rose-500/25 ring-2 ring-rose-400/60',
    accent: '#DC2626',
  },
  immortal: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    border: 'border-cyan-400 dark:border-cyan-500',
    badgeBg: 'bg-gradient-to-r from-cyan-400 via-indigo-500 to-purple-600 animate-pulse',
    badgeText: 'text-white',
    glow: 'shadow-cyan-500/30 ring-2 ring-cyan-400 animate-pulse',
    accent: '#06B6D4',
  },
}

export default function RodShopModal() {
  const activeModal = useUIStore((s) => s.activeModal)
  const closeModal = useUIStore((s) => s.closeModal)
  const wallet = useCitizenStore((s) => s.wallet)
  const profile = useCitizenStore((s) => s.profile)
  const inventory = useCitizenStore((s) => s.inventory)
  const setWallet = useCitizenStore((s) => s.setWallet)
  const setInventory = useCitizenStore((s) => s.setInventory)
  const equipItemStore = useCitizenStore((s) => s.equipItem)

  const [loadingRodId, setLoadingRodId] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const isOpen = activeModal === 'rod_shop'

  // Helper: check if a rod is in user inventory
  const getInventoryEntry = (rodId: string) => {
    return (inventory || []).find((inv) => {
      const id = inv.itemId || (inv as any).item_id || inv.id || ''
      return (
        id === rodId ||
        id.startsWith(rodId) ||
        (inv as any).metadata?.itemId === rodId ||
        (inv as any).metadata?.id === rodId
      )
    })
  }

  // Handle equipping an owned rod
  const handleEquipRod = async (rod: FishingRodDefinition) => {
    let invItem = getInventoryEntry(rod.id)
    if (!invItem && rod.id === 'rod_wooden') {
      invItem = (inventory || []).find((i) => (i.id || '').startsWith('inv-rod-starter'))
    }
    if (!invItem) return

    setLoadingRodId(rod.id)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'equip',
          inventoryId: invItem.id,
          rodId: rod.id,
          citizenId: profile?.id,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal memasang joran')
      }

      // Persist equipped rod
      if (typeof document !== 'undefined') {
        document.cookie = `nc_equipped_rod=${rod.id}; path=/; max-age=2592000; SameSite=Lax`
      }
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('nc_equipped_rod', rod.id)
        } catch {}
      }

      // Update store
      equipItemStore(invItem.id)
      if (Array.isArray(data.inventory)) {
        setInventory(data.inventory)
      }

      setSuccessMsg(`🎣 Berhasil memasang ${rod.name}! Siap memancing!`)
      setTimeout(() => setSuccessMsg(null), 3500)
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal memasang joran.')
      setTimeout(() => setErrorMsg(null), 4000)
    } finally {
      setLoadingRodId(null)
    }
  }

  // Handle purchasing a rod
  const handleBuyRod = async (rod: FishingRodDefinition) => {
    if (!profile) {
      setErrorMsg('Silakan masuk atau daftar terlebih dahulu.')
      return
    }

    const currentCoins = wallet?.balance ?? 0
    if (currentCoins < rod.price) {
      setErrorMsg(
        `Saldo Koin kamu tidak mencukupi (Butuh ${formatCoins(rod.price)} Koin, saldo saat ini ${formatCoins(currentCoins)} Koin).`
      )
      setTimeout(() => setErrorMsg(null), 4500)
      return
    }

    setLoadingRodId(rod.id)
    setErrorMsg(null)

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'buy_rod',
          rodId: rod.id,
          citizenId: profile.id,
          currentBalance: currentCoins,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gagal membeli joran pancing')
      }

      // Persist equipped rod
      if (typeof document !== 'undefined') {
        document.cookie = `nc_equipped_rod=${rod.id}; path=/; max-age=2592000; SameSite=Lax`
      }
      if (typeof localStorage !== 'undefined') {
        try {
          localStorage.setItem('nc_equipped_rod', rod.id)
        } catch {}
      }

      // Update wallet and inventory in store
      if (data.wallet) {
        setWallet({
          id: data.wallet.id || 'w-' + profile.id,
          citizenId: profile.id,
          balance: data.wallet.balance,
          totalEarned: data.wallet.total_earned ?? data.wallet.balance,
          totalSpent: data.wallet.total_spent ?? 0,
          updatedAt: data.wallet.updated_at || new Date().toISOString(),
        })
      }
      if (Array.isArray(data.inventory)) {
        setInventory(data.inventory)
      }
      equipItemStore(rod.id)

      setSuccessMsg(`🎉 Selamat! Kamu berhasil membeli ${rod.name} dan langsung dipasang ke tangan!`)
      setTimeout(() => setSuccessMsg(null), 4500)
    } catch (err: any) {
      setErrorMsg(err.message || 'Gagal membeli joran pancing.')
      setTimeout(() => setErrorMsg(null), 4500)
    } finally {
      setLoadingRodId(null)
    }
  }

  const currentCoins = wallet?.balance ?? 0

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="🎣 Toko Joran Pancing Netizen"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {/* Banner Kios */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-emerald-500/15 to-sky-500/15 border border-amber-300/40 dark:border-amber-700/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-2xl shadow-inner">
              🎣
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-heading font-black text-sm sm:text-base text-stone-800 dark:text-stone-100">
                  Kios Pancing Mang Ujang &amp; Rimba
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                  Buka 24 Jam
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 flex items-center gap-1">
                <Compass className="w-3 h-3 text-amber-500" /> Tersedia di Dermaga Kali Netizen &amp; Kawasan Hutan
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 bg-white/80 dark:bg-stone-800/80 px-3.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 shadow-xs self-stretch sm:self-auto justify-between sm:justify-end">
            <span className="text-xs text-stone-500 dark:text-stone-400">Saldo Koin:</span>
            <div className="flex items-center space-x-1 font-heading font-black text-sm sm:text-base text-amber-600 dark:text-amber-400">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>{formatCoins(currentCoins)}</span>
            </div>
          </div>
        </div>

        {/* Feedback Messages */}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs sm:text-sm font-medium flex items-center space-x-2 animate-in fade-in">
            <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-700 text-rose-800 dark:text-rose-200 text-xs sm:text-sm font-medium flex items-center space-x-2 animate-in fade-in">
            <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Rod Catalog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 max-h-[62vh] overflow-y-auto pr-1">
          {FISHING_RODS.map((rod) => {
            const theme = RARITY_THEMES[rod.rarity] || RARITY_THEMES.common
            const invEntry = getInventoryEntry(rod.id)
            const isOwned = Boolean(invEntry) || (rod.price === 0 && rod.id === 'rod_wooden')
            const isEquipped =
              Boolean(invEntry?.isEquipped || (invEntry as any)?.is_equipped) ||
              (rod.id === 'rod_wooden' &&
                !inventory.some(
                  (i) =>
                    Boolean(i.isEquipped || (i as any)?.is_equipped) &&
                    ((i.itemId || (i as any)?.item_id || '').startsWith('rod_') || i.category === 'tools')
                ))
            const canAfford = currentCoins >= rod.price
            const isLoading = loadingRodId === rod.id

            return (
              <div
                key={rod.id}
                className={`relative p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 flex flex-col justify-between ${theme.bg} ${theme.border} ${theme.glow}`}
              >
                <div>
                  {/* Card Header: Icon, Name & Rarity Badge */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center space-x-2.5">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-xs border"
                        style={{
                          backgroundColor: `${theme.accent}20`,
                          borderColor: `${theme.accent}40`,
                        }}
                      >
                        {rod.icon}
                      </div>
                      <div>
                        <h4 className="font-heading font-black text-sm sm:text-base text-stone-900 dark:text-stone-100 leading-tight">
                          {rod.name}
                        </h4>
                        <span
                          className={`inline-block mt-0.5 px-2 py-0.2 rounded-md text-[10px] font-bold uppercase tracking-wider ${theme.badgeBg} ${theme.badgeText}`}
                        >
                          {rod.tierName}
                        </span>
                      </div>
                    </div>

                    {/* Price Tag */}
                    <div className="text-right">
                      {rod.price === 0 ? (
                        <span className="px-2.5 py-1 rounded-lg bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-bold text-xs">
                          Gratis (Starter)
                        </span>
                      ) : (
                        <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-400/40 text-amber-700 dark:text-amber-300 font-black text-xs">
                          <Coins className="w-3.5 h-3.5 text-amber-500" />
                          <span>{formatCoins(rod.price)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description & Ability */}
                  <p className="text-xs text-stone-600 dark:text-stone-400 line-clamp-2 mb-2.5">
                    {rod.description}
                  </p>

                  {/* Stat Badges */}
                  <div className="grid grid-cols-3 gap-1.5 p-2 rounded-xl bg-white/70 dark:bg-stone-800/70 border border-stone-200/60 dark:border-stone-700/60 mb-3 text-[11px]">
                    <div className="text-center">
                      <span className="text-stone-400 block text-[9px] uppercase">Langka</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        +{Math.round(rod.luck * 100)}%
                      </span>
                    </div>
                    <div className="text-center border-x border-stone-200 dark:border-stone-700">
                      <span className="text-stone-400 block text-[9px] uppercase">Kecepatan</span>
                      <span className="font-bold text-sky-600 dark:text-sky-400">
                        {rod.fishingSpeed}x
                      </span>
                    </div>
                    <div className="text-center">
                      <span className="text-stone-400 block text-[9px] uppercase">Beban Max</span>
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        {rod.maxWeight >= 900 ? '∞ Bebas' : `${rod.maxWeight} kg`}
                      </span>
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-500 dark:text-stone-400 italic mb-3 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                    <span className="line-clamp-1">{rod.specialAbility}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div>
                  {isEquipped ? (
                    <div className="w-full py-2 rounded-xl bg-emerald-500/15 border border-emerald-400/50 text-emerald-700 dark:text-emerald-300 font-heading font-black text-xs flex items-center justify-center space-x-1.5">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Sedang Digunakan</span>
                    </div>
                  ) : isOwned ? (
                    <Button
                      variant="secondary"
                      className="w-full py-2 rounded-xl border-sky-400/80 hover:bg-sky-50 dark:hover:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-heading font-black text-xs flex items-center justify-center space-x-1.5 cursor-pointer"
                      disabled={isLoading}
                      onClick={() => handleEquipRod(rod)}
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Fish className="w-3.5 h-3.5" />
                      )}
                      <span>Gunakan Joran Ini</span>
                    </Button>
                  ) : (
                    <Button
                      className={`w-full py-2 rounded-xl font-heading font-black text-xs shadow-md flex items-center justify-center space-x-1.5 transition-all cursor-pointer ${
                        canAfford
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-stone-950 border border-amber-300'
                          : 'bg-stone-300 dark:bg-stone-700 text-stone-500 dark:text-stone-400 cursor-not-allowed border-stone-300 dark:border-stone-600'
                      }`}
                      disabled={!canAfford || isLoading}
                      onClick={() => handleBuyRod(rod)}
                    >
                      {isLoading ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Coins className="w-3.5 h-3.5" />
                      )}
                      <span>
                        {canAfford
                          ? `Beli Sekarang (${formatCoins(rod.price)} Koin)`
                          : `Koin Kurang (${formatCoins(rod.price)} Koin)`}
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}
