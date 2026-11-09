// ============================================================
// NETIZENCITY - Roblox-Style Backpack Inventory System
// Fully integrated with Fishing 3D, Rod Tiers, Economy & DB
// Cozy Low-Poly Theme: Ivory, Cream, Warm Brown, Forest Green
// ============================================================

'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Package,
  Fish,
  Wrench,
  Shirt,
  Sparkles,
  Coins,
  Star,
  Trash2,
  ArrowUpDown,
  Filter,
  Search,
  Check,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Scale,
  Zap,
  Info,
  ExternalLink,
  ShoppingBag,
  ShieldAlert,
} from 'lucide-react'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'
import { useUIStore } from '@/lib/stores/useUIStore'
import { formatCoins } from '@/lib/utils/formatting'
import { FISHING_RODS, type FishingRodDefinition } from '@/lib/inventory/rodDefinitions'
import type { InventoryItem } from '@/types/economy'
import type { BackpackCategory } from '@/types/inventory'

interface InventoryModalProps {
  isOpen: boolean
  onClose: () => void
}

type SortOption = 'newest' | 'oldest' | 'weight_desc' | 'weight_asc' | 'price_desc' | 'price_asc'
type RarityFilter = 'all' | 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' | 'mythic' | 'immortal'

// Visual Rarity Map for Cozy Low-Poly Palette
const RARITY_THEMES: Record<
  string,
  { label: string; badge: string; border: string; glow: string; text: string }
> = {
  common: {
    label: 'Common',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    border: 'border-emerald-300',
    glow: 'shadow-emerald-100',
    text: 'text-emerald-700',
  },
  uncommon: {
    label: 'Uncommon 🌊',
    badge: 'bg-sky-100 text-sky-800 border-sky-300',
    border: 'border-sky-300',
    glow: 'shadow-sky-100',
    text: 'text-sky-700',
  },
  rare: {
    label: 'Rare 💎',
    badge: 'bg-blue-100 text-blue-800 border-blue-400 font-bold',
    border: 'border-blue-400',
    glow: 'shadow-blue-200',
    text: 'text-blue-700',
  },
  epic: {
    label: 'Epic 🔮',
    badge: 'bg-purple-100 text-purple-900 border-purple-400 font-extrabold',
    border: 'border-purple-400',
    glow: 'shadow-purple-200',
    text: 'text-purple-700',
  },
  legendary: {
    label: 'Legendary ✨',
    badge: 'bg-amber-100 text-amber-900 border-amber-400 font-black',
    border: 'border-amber-400',
    glow: 'shadow-amber-200',
    text: 'text-amber-700',
  },
  mythic: {
    label: 'Mythic 🐉',
    badge: 'bg-red-500 text-white border-red-300 font-black shadow-xs',
    border: 'border-red-400 ring-2 ring-red-400/40',
    glow: 'shadow-red-200',
    text: 'text-red-600',
  },
  immortal: {
    label: 'Immortal 🔱',
    badge: 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 text-white border-pink-300 font-black shadow-xs animate-pulse',
    border: 'border-pink-400 ring-2 ring-pink-400/60',
    glow: 'shadow-pink-200',
    text: 'text-pink-600',
  },
}

function getRarityTheme(rarity?: string) {
  const r = (rarity || 'common').toLowerCase()
  if (r.includes('immortal') || r.includes('abadi')) return RARITY_THEMES.immortal
  if (r.includes('mythic') || r.includes('mitos')) return RARITY_THEMES.mythic
  if (r.includes('legend') || r.includes('legendaris')) return RARITY_THEMES.legendary
  if (r.includes('epic') || r.includes('epik')) return RARITY_THEMES.epic
  if (r.includes('rare') || r.includes('langka')) return RARITY_THEMES.rare
  if (r.includes('uncommon') || r.includes('menengah')) return RARITY_THEMES.uncommon
  return RARITY_THEMES.common
}

function isRareOrHigher(rarity?: string) {
  const r = (rarity || '').toLowerCase()
  return (
    r.includes('rare') ||
    r.includes('langka') ||
    r.includes('epic') ||
    r.includes('epik') ||
    r.includes('legend') ||
    r.includes('legendaris') ||
    r.includes('mythic') ||
    r.includes('mitos') ||
    r.includes('immortal') ||
    r.includes('abadi')
  )
}

function getItemId(item?: InventoryItem | null): string {
  if (!item) return ''
  return item.itemId || (item as any).item_id || item.id || ''
}

function isRodItem(item?: InventoryItem | null): boolean {
  if (!item) return false
  const cat = (item.category || (item as any).metadata?.category || '').toLowerCase()
  return cat === 'tools' || getItemId(item).startsWith('rod_')
}

function isFishItem(item?: InventoryItem | null): boolean {
  if (!item) return false
  const cat = (item.category || (item as any).metadata?.category || '').toLowerCase()
  return cat === 'fish' || getItemId(item).startsWith('fish_')
}

function formatDateSafe(dateVal?: string): string {
  if (!dateVal) return 'Hari ini'
  try {
    const d = new Date(dateVal)
    if (isNaN(d.getTime())) return 'Hari ini'
    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return 'Hari ini'
  }
}

export default function InventoryModal({ isOpen, onClose }: InventoryModalProps) {
  const [mounted, setMounted] = useState(false)
  const [activeCategory, setActiveCategory] = useState<BackpackCategory>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [rarityFilter, setRarityFilter] = useState<RarityFilter>('all')
  const [sortOption, setSortOption] = useState<SortOption>('newest')

  // Item Selection & Inspector
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [selectedShopRodId, setSelectedShopRodId] = useState<string | null>(null)

  // Multi-select bulk sell
  const [isMultiSelect, setIsMultiSelect] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Loading & confirmation states
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [confirmSellModal, setConfirmSellModal] = useState<{
    isOpen: boolean
    items: InventoryItem[]
    totalCoins: number
  }>({ isOpen: false, items: [], totalCoins: 0 })

  // Mobile Bottom Sheet
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false)

  // Citizen store
  const wallet = useCitizenStore((s) => s.wallet)
  const rawInventory = useCitizenStore((s) => s.inventory)
  const inventory = useMemo(() => (Array.isArray(rawInventory) ? rawInventory : []), [rawInventory])
  const setInventory = useCitizenStore((s) => s.setInventory)
  const updateBalance = useCitizenStore((s) => s.updateBalance)
  const toggleFavorite = useCitizenStore((s) => s.toggleFavorite)
  const equipItem = useCitizenStore((s) => s.equipItem)
  const unequipItem = useCitizenStore((s) => s.unequipItem)
  const removeFromInventory = useCitizenStore((s) => s.removeFromInventory)
  const batchRemoveFromInventory = useCitizenStore((s) => s.batchRemoveFromInventory)

  const addNotification = useUIStore((s) => s.addNotification)
  const openModal = useUIStore((s) => s.openModal)
  const closeModal = useUIStore((s) => s.closeModal)

  const currentCoins = wallet?.balance ?? 500
  const maxSlots = 50

  const handleClose = () => {
    setIsMultiSelect(false)
    setSelectedIds(new Set())
    setIsMobileSheetOpen(false)
    onClose()
    closeModal()
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Listen to Escape key
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmSellModal.isOpen) {
          setConfirmSellModal({ isOpen: false, items: [], totalCoins: 0 })
        } else if (isMobileSheetOpen) {
          setIsMobileSheetOpen(false)
        } else {
          handleClose()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, confirmSellModal.isOpen, isMobileSheetOpen])

  // Filter items according to category
  const categorizedItems = useMemo(() => {
    const safeList = Array.isArray(inventory) ? inventory : []
    return safeList.filter((item) => {
      if (!item) return false
      const cat = (item.category || '').toLowerCase()
      const isRod = isRodItem(item)
      const isFish = isFishItem(item)
      const isClothing =
        cat === 'clothing' ||
        ['tops', 'bottoms', 'shoes', 'fashion'].includes(cat)
      const isAccessory =
        cat === 'accessories' ||
        ['accessories', 'hairstyles', 'skins', 'back'].includes(cat)
      const isSpecial =
        cat === 'special' || (!isRod && !isFish && !isClothing && !isAccessory)

      if (activeCategory === 'tools') return isRod
      if (activeCategory === 'fish') return isFish
      if (activeCategory === 'clothing') return isClothing
      if (activeCategory === 'accessories') return isAccessory
      if (activeCategory === 'special') return isSpecial
      return true
    })
  }, [inventory, activeCategory])

  // Apply search, rarity, and sort
  const displayItems = useMemo(() => {
    let list = categorizedItems.filter((item) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const name = (item.name || '').toLowerCase()
        const desc = (item.description || '').toLowerCase()
        if (!name.includes(q) && !desc.includes(q)) return false
      }

      // Rarity filter
      if (rarityFilter !== 'all') {
        const itemRarity = (item.rarity || '').toLowerCase()
        if (!itemRarity.includes(rarityFilter)) return false
      }

      return true
    })

    // Sort
    list = [...list].sort((a, b) => {
      if (sortOption === 'newest') {
        const tB = b.acquiredAt ? new Date(b.acquiredAt).getTime() : 0
        const tA = a.acquiredAt ? new Date(a.acquiredAt).getTime() : 0
        return (isNaN(tB) ? 0 : tB) - (isNaN(tA) ? 0 : tA)
      }
      if (sortOption === 'oldest') {
        const tA = a.acquiredAt ? new Date(a.acquiredAt).getTime() : 0
        const tB = b.acquiredAt ? new Date(b.acquiredAt).getTime() : 0
        return (isNaN(tA) ? 0 : tA) - (isNaN(tB) ? 0 : tB)
      }
      if (sortOption === 'weight_desc') {
        return (b.weight || 0) - (a.weight || 0)
      }
      if (sortOption === 'weight_asc') {
        return (a.weight || 0) - (b.weight || 0)
      }
      if (sortOption === 'price_desc') {
        return (b.sellPrice || 0) - (a.sellPrice || 0)
      }
      if (sortOption === 'price_asc') {
        return (a.sellPrice || 0) - (b.sellPrice || 0)
      }
      return 0
    })

    return list
  }, [categorizedItems, searchQuery, rarityFilter, sortOption])

  // Selected item object (or shop rod)
  const selectedItem = useMemo(() => {
    if (selectedItemId) {
      return inventory.find((it) => it.id === selectedItemId) || null
    }
    return null
  }, [inventory, selectedItemId])

  const selectedShopRod = useMemo(() => {
    if (selectedShopRodId) {
      return FISHING_RODS.find((r) => r.id === selectedShopRodId) || null
    }
    return null
  }, [selectedShopRodId])

  // Auto-select first item on category change
  useEffect(() => {
    setSelectedShopRodId(null)
    if (displayItems.length > 0) {
      setSelectedItemId(displayItems[0].id)
    } else {
      setSelectedItemId(null)
    }
  }, [activeCategory])

  // Counts for category badges
  const categoryCounts = useMemo(() => {
    const safeList = Array.isArray(inventory) ? inventory : []
    const counts = {
      all: safeList.length,
      tools: 0,
      fish: 0,
      clothing: 0,
      accessories: 0,
      special: 0,
    }

    safeList.forEach((item) => {
      if (!item) return
      const cat = (item.category || '').toLowerCase()
      if (isRodItem(item)) counts.tools++
      else if (isFishItem(item)) counts.fish++
      else if (cat === 'clothing' || ['tops', 'bottoms', 'shoes', 'fashion'].includes(cat)) counts.clothing++
      else if (cat === 'accessories' || ['accessories', 'hairstyles', 'skins', 'back'].includes(cat)) counts.accessories++
      else counts.special++
    })

    return counts
  }, [inventory])

  // Rods owned IDs set
  const ownedRodIds = useMemo(() => {
    const set = new Set<string>()
    const safeList = Array.isArray(inventory) ? inventory : []
    safeList.forEach((i) => {
      const id = getItemId(i)
      if (id.startsWith('rod_')) set.add(id)
    })
    return set
  }, [inventory])

  // Calculate batch sell sum (must be declared at top level with all other hooks)
  const batchTotalCoins = useMemo(() => {
    const safeList = Array.isArray(inventory) ? inventory : []
    return safeList
      .filter((i) => selectedIds.has(i.id))
      .reduce((sum, item) => sum + (item.sellPrice || 50), 0)
  }, [inventory, selectedIds])

  // ACTIONS
  // 1. Equip / Unequip
  const handleEquipToggle = async (item: InventoryItem) => {
    if (isActionLoading) return
    setIsActionLoading(true)

    const nextEquipped = !item.isEquipped
    const action = nextEquipped ? 'equip' : 'unequip'

    // Optimistic update
    if (nextEquipped) {
      equipItem(item.id)
    } else {
      unequipItem(item.id)
    }

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, inventoryId: item.id }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.inventory) {
          setInventory(data.inventory)
        }
        addNotification({
          title: nextEquipped ? 'Peralatan Dipasang! ⚔️' : 'Peralatan Dilepas',
          message: `${item.name || 'Barang'} berhasil ${nextEquipped ? 'dipasang ke karaktermu' : 'dilepas ke tas'}.`,
          type: 'success',
        })
      } else {
        const err = await res.json()
        addNotification({
          title: 'Gagal Memasang Peralatan',
          message: err.error || 'Terjadi kesalahan.',
          type: 'error',
        })
      }
    } catch {
      addNotification({
        title: 'Koneksi Bermasalah',
        message: 'Tidak dapat memperbarui status peralatan ke server.',
        type: 'error',
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  // 2. Favorite Toggle
  const handleToggleFavorite = async (item: InventoryItem) => {
    if (isActionLoading) return
    setIsActionLoading(true)

    // Optimistic update
    toggleFavorite(item.id)

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_favorite', inventoryId: item.id }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.inventory) {
          setInventory(data.inventory)
        }
        addNotification({
          title: data.isFavorite ? 'Bintang Favorit Ditambahkan! ⭐' : 'Favorit Dihapus',
          message: `${item.name || 'Barang'} ${data.isFavorite ? 'kini dilindungi dari penjualan tidak sengaja' : 'telah dihapus dari daftar favorit'}.`,
          type: 'info',
        })
      }
    } catch {
      // rollback
      toggleFavorite(item.id)
    } finally {
      setIsActionLoading(false)
    }
  }

  // 3. Single Sell
  const requestSellSingle = (item: InventoryItem) => {
    if (item.isFavorite) {
      addNotification({
        title: 'Ikan Dilindungi ⭐',
        message: 'Buka tanda bintang favorit terlebih dahulu jika ingin menjualnya.',
        type: 'warning',
      })
      return
    }

    if (isRareOrHigher(item.rarity)) {
      // Show confirmation dialog
      setConfirmSellModal({
        isOpen: true,
        items: [item],
        totalCoins: item.sellPrice || 50,
      })
    } else {
      executeSellSingle(item)
    }
  }

  const executeSellSingle = async (item: InventoryItem) => {
    if (isActionLoading) return
    setIsActionLoading(true)

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'sell', inventoryId: item.id }),
      })

      if (res.ok) {
        const data = await res.json()
        removeFromInventory(item.id)
        if (typeof data.newBalance === 'number') {
          updateBalance(data.newBalance)
        } else {
          updateBalance(currentCoins + (item.sellPrice || 50))
        }

        addNotification({
          title: `Berhasil Menjual ${item.name || 'Ikan'}! 💰`,
          message: `+${item.sellPrice || 50} Netizen Coins telah ditambahkan ke dompetmu.`,
          type: 'success',
        })

        if (selectedItemId === item.id) {
          setSelectedItemId(null)
          setIsMobileSheetOpen(false)
        }
      } else {
        const err = await res.json()
        addNotification({
          title: 'Gagal Menjual Barang',
          message: err.error || 'Terjadi kesalahan.',
          type: 'error',
        })
      }
    } catch {
      addNotification({
        title: 'Koneksi Bermasalah',
        message: 'Tidak dapat menghubungi server pasar kota.',
        type: 'error',
      })
    } finally {
      setIsActionLoading(false)
      setConfirmSellModal({ isOpen: false, items: [], totalCoins: 0 })
    }
  }

  // 4. Multi-Select Toggle & Batch Sell
  const toggleSelectId = (id: string) => {
    const next = new Set(selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    setSelectedIds(next)
  }

  const handleSelectAllSellableFish = () => {
    const next = new Set<string>()
    categorizedItems.forEach((item) => {
      const isFish = isFishItem(item)
      if (isFish && !item.isFavorite && !item.isEquipped) {
        next.add(item.id)
      }
    })
    setSelectedIds(next)
  }

  const requestBatchSell = () => {
    const itemsToSell = inventory.filter((i) => i && selectedIds.has(i.id))
    if (itemsToSell.length === 0) return

    const totalCoins = itemsToSell.reduce((sum, item) => sum + (item.sellPrice || 50), 0)
    const hasRare = itemsToSell.some((i) => isRareOrHigher(i.rarity))

    if (hasRare) {
      setConfirmSellModal({
        isOpen: true,
        items: itemsToSell,
        totalCoins,
      })
    } else {
      executeBatchSell(itemsToSell, totalCoins)
    }
  }

  const executeBatchSell = async (items: InventoryItem[], totalCoins: number) => {
    if (isActionLoading) return
    setIsActionLoading(true)

    const ids = items.map((i) => i.id)

    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'batch_sell', inventoryIds: ids }),
      })

      if (res.ok) {
        const data = await res.json()
        batchRemoveFromInventory(ids)
        if (typeof data.newBalance === 'number') {
          updateBalance(data.newBalance)
        } else {
          updateBalance(currentCoins + totalCoins)
        }

        addNotification({
          title: `Berhasil Menjual ${items.length} Ikan! 💰`,
          message: `+${totalCoins.toLocaleString('id-ID')} Netizen Coins telah ditambahkan ke dompetmu.`,
          type: 'success',
        })

        setSelectedIds(new Set())
        setIsMultiSelect(false)
        setSelectedItemId(null)
      } else {
        const err = await res.json()
        addNotification({
          title: 'Gagal Menjual Pilihan Ikan',
          message: err.error || 'Terjadi kesalahan.',
          type: 'error',
        })
      }
    } catch {
      addNotification({
        title: 'Koneksi Bermasalah',
        message: 'Tidak dapat menghubungi server pasar kota.',
        type: 'error',
      })
    } finally {
      setIsActionLoading(false)
      setConfirmSellModal({ isOpen: false, items: [], totalCoins: 0 })
    }
  }

  // 5. Buy Fishing Rod
  const handleBuyRod = async (rod: FishingRodDefinition) => {
    if (isActionLoading) return
    if (currentCoins < rod.price) {
      addNotification({
        title: 'Saldo Koin Tidak Cukup',
        message: `Kamu membutuhkan ${rod.price.toLocaleString('id-ID')} Netizen Coins untuk membeli ${rod.name}.`,
        type: 'warning',
      })
      return
    }

    setIsActionLoading(true)
    try {
      const res = await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'buy_rod', rodId: rod.id }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.inventory) {
          setInventory(data.inventory)
        }
        if (typeof data.newBalance === 'number') {
          updateBalance(data.newBalance)
        }
        addNotification({
          title: `Berhasil Membeli ${rod.name}! 🎣`,
          message: `Joran baru telah dipasang ke karaktermu! Bersiaplah menangkap ikan spektakuler.`,
          type: 'success',
        })
        setSelectedShopRodId(null)
      } else {
        const err = await res.json()
        addNotification({
          title: 'Gagal Membeli Joran',
          message: err.error || 'Terjadi kesalahan.',
          type: 'error',
        })
      }
    } catch {
      addNotification({
        title: 'Koneksi Bermasalah',
        message: 'Tidak dapat menghubungi toko peralatan kota.',
        type: 'error',
      })
    } finally {
      setIsActionLoading(false)
    }
  }

  if (!isOpen || !mounted) return null

  const modalEl = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-2 sm:p-4 pointer-events-auto"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Dimmed backdrop - click to close */}
      <div
        className="fixed inset-0 bg-black/65 backdrop-blur-xs transition-opacity cursor-pointer animate-fade-in"
        onClick={handleClose}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Main Roblox-Style Backpack Modal Dialog */}
      <div
        className="relative z-10 w-full max-w-5xl bg-[#F7F4E9] border-2 border-[#D8CEBE] rounded-3xl shadow-2xl flex flex-col h-[94vh] sm:h-[88vh] max-h-[850px] overflow-hidden animate-scale-up"
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ============================================================ */}
        {/* 1. HEADER BAR: Title, Slot Counter, Coins, Close Button */}
        {/* ============================================================ */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 bg-[#EFE9D8] border-b border-[#D8CEBE] shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#668B65] text-white flex items-center justify-center shadow-md">
              <Package className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-heading font-black text-[#343B35]">
                  Tas Perlengkapan Warga
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-[#668B65]/15 text-[#668B65] font-extrabold text-[11px]">
                  Roblox Backpack
                </span>
              </div>
              <p className="text-xs text-[#78634B]">
                Kapasitas Tas: <span className="font-extrabold text-[#343B35]">{inventory.length}</span> / {maxSlots} Slot
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Wallet pill */}
            <div className="flex items-center space-x-1.5 bg-[#F7F4E9] border border-[#D8CEBE] px-3 py-1.5 rounded-xl shadow-xs">
              <Coins className="w-4 h-4 text-[#E6C66F]" />
              <span className="font-heading font-black text-xs sm:text-sm text-[#343B35]">
                {formatCoins(currentCoins)}
              </span>
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              title="Tutup Tas (Esc)"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#F7F4E9] hover:bg-[#E2DAC7] border border-[#D8CEBE] flex items-center justify-center text-[#78634B] hover:text-[#343B35] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. CATEGORY TABS (Roblox Top Navigation) */}
        {/* ============================================================ */}
        <div className="flex items-center gap-1.5 px-3 sm:px-6 py-2.5 bg-[#F7F4E9] border-b border-[#D8CEBE] overflow-x-auto text-xs scrollbar-none shrink-0">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-xl font-heading font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[#668B65] text-white shadow-xs'
                : 'bg-[#EFE9D8] text-[#78634B] hover:bg-[#E2DAC7]'
            }`}
          >
            <span>🎒 Semua</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/15">
              {categoryCounts.all}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('tools')}
            className={`px-3 py-1.5 rounded-xl font-heading font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeCategory === 'tools'
                ? 'bg-[#784620] text-white shadow-xs'
                : 'bg-[#EFE9D8] text-[#78634B] hover:bg-[#E2DAC7]'
            }`}
          >
            <span>🎣 Alat & Joran</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/15">
              {categoryCounts.tools}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('fish')}
            className={`px-3 py-1.5 rounded-xl font-heading font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeCategory === 'fish'
                ? 'bg-[#2D7F9D] text-white shadow-xs'
                : 'bg-[#EFE9D8] text-[#78634B] hover:bg-[#E2DAC7]'
            }`}
          >
            <span>🐟 Ikan Kali</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/15">
              {categoryCounts.fish}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('clothing')}
            className={`px-3 py-1.5 rounded-xl font-heading font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeCategory === 'clothing'
                ? 'bg-[#A855F7] text-white shadow-xs'
                : 'bg-[#EFE9D8] text-[#78634B] hover:bg-[#E2DAC7]'
            }`}
          >
            <span>👔 Busana</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/15">
              {categoryCounts.clothing}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('accessories')}
            className={`px-3 py-1.5 rounded-xl font-heading font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeCategory === 'accessories'
                ? 'bg-[#EAB308] text-[#343B35] shadow-xs'
                : 'bg-[#EFE9D8] text-[#78634B] hover:bg-[#E2DAC7]'
            }`}
          >
            <span>👒 Aksesori</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/15">
              {categoryCounts.accessories}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('special')}
            className={`px-3 py-1.5 rounded-xl font-heading font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeCategory === 'special'
                ? 'bg-[#DC2626] text-white shadow-xs'
                : 'bg-[#EFE9D8] text-[#78634B] hover:bg-[#E2DAC7]'
            }`}
          >
            <span>⭐ Spesial</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/15">
              {categoryCounts.special}
            </span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* 3. CONTROLS BAR: Search, Rarity Filter, Sort, Multi-Select */}
        {/* ============================================================ */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-6 py-2.5 bg-[#EFE9D8]/60 border-b border-[#D8CEBE] text-xs shrink-0">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[140px] max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#78634B]" />
            <input
              type="text"
              placeholder="Cari barang atau ikan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl text-xs text-[#343B35] placeholder-[#A89885] focus:outline-none focus:border-[#668B65]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#A89885] hover:text-[#343B35]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Rarity Filter */}
            <div className="flex items-center space-x-1 bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl px-2 py-1">
              <Filter className="w-3 h-3 text-[#78634B]" />
              <select
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value as RarityFilter)}
                className="bg-transparent text-xs text-[#343B35] font-bold focus:outline-none cursor-pointer"
              >
                <option value="all">Semua Rarity</option>
                <option value="common">Common</option>
                <option value="uncommon">Uncommon</option>
                <option value="rare">Rare</option>
                <option value="epic">Epic</option>
                <option value="legendary">Legendary</option>
                <option value="mythic">Mythic</option>
                <option value="immortal">Immortal</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center space-x-1 bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl px-2 py-1">
              <ArrowUpDown className="w-3 h-3 text-[#78634B]" />
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as SortOption)}
                className="bg-transparent text-xs text-[#343B35] font-bold focus:outline-none cursor-pointer"
              >
                <option value="newest">Terbaru</option>
                <option value="oldest">Terlama</option>
                <option value="weight_desc">Bobot Terberat</option>
                <option value="weight_asc">Bobot Teringan</option>
                <option value="price_desc">Harga Tertinggi</option>
                <option value="price_asc">Harga Terendah</option>
              </select>
            </div>

            {/* Multi-Select Toggle (for fish selling) */}
            {(activeCategory === 'fish' || activeCategory === 'all') && (
              <button
                type="button"
                onClick={() => {
                  setIsMultiSelect(!isMultiSelect)
                  setSelectedIds(new Set())
                }}
                className={`px-3 py-1 rounded-xl font-heading font-bold text-xs transition-all flex items-center gap-1 cursor-pointer border ${
                  isMultiSelect
                    ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                    : 'bg-[#F7F4E9] hover:bg-[#E2DAC7] text-[#78634B] border-[#D8CEBE]'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isMultiSelect ? 'Batal Pilih' : 'Pilih Banyak'}</span>
              </button>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4. MAIN CONTENT AREA (2-Column Desktop, 1-Column Mobile) */}
        {/* ============================================================ */}
        <div className="flex-1 flex overflow-hidden">
          {/* LEFT: Item Grid (60% width on desktop, 100% on mobile) */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#F7F4E9] overflow-hidden">
            <div className="flex-1 overflow-y-auto p-3 sm:p-5">
              {/* If active category is Tools: Show Owned Rods + Unowned Rod Shop Section */}
              {activeCategory === 'tools' && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-heading font-black text-[#78634B] uppercase tracking-wider">
                      Joran Yang Dimiliki ({displayItems.length})
                    </h3>
                  </div>
                </div>
              )}

              {/* Items Grid */}
              {displayItems.length === 0 && activeCategory !== 'tools' ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-3xl mb-3 shadow-inner">
                    {activeCategory === 'fish' ? '🐟' : activeCategory === 'clothing' ? '👔' : '🎒'}
                  </div>
                  <h3 className="font-heading font-black text-base text-[#343B35]">
                    {searchQuery
                      ? 'Barang Tidak Ditemukan'
                      : activeCategory === 'fish'
                      ? 'Belum Ada Ikan di Tas'
                      : 'Tas Kategori Ini Kosong'}
                  </h3>
                  <p className="text-xs text-[#78634B] max-w-sm mt-1 mb-4">
                    {activeCategory === 'fish'
                      ? 'Pergi ke Sungai Kali Netizen & Dermaga Pancing untuk menangkap ikan segar khas kota!'
                      : activeCategory === 'clothing'
                      ? 'Kunjungi Mall Busana Netizen untuk membeli pakaian dan gaya rambut keren.'
                      : 'Koleksi berbagai hasil tangkapan ikan, alat, dan aksesoris di sini.'}
                  </p>
                  {activeCategory === 'clothing' && (
                    <button
                      type="button"
                      onClick={() => {
                        handleClose()
                        openModal('mall')
                      }}
                      className="px-4 py-2 rounded-xl bg-[#668B65] text-white font-heading font-bold text-xs hover:bg-[#527051] transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" /> Buka Mall Busana
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 sm:gap-3">
                  {displayItems.map((item) => {
                    const isSelected = selectedItemId === item.id && !selectedShopRodId
                    const isChecked = selectedIds.has(item.id)
                    const theme = getRarityTheme(item.rarity)
                    const isFish = isFishItem(item)
                    const isRod = isRodItem(item)

                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (isMultiSelect && isFish) {
                            toggleSelectId(item.id)
                          } else {
                            setSelectedShopRodId(null)
                            setSelectedItemId(item.id)
                            setIsMobileSheetOpen(true)
                          }
                        }}
                        onDoubleClick={() => {
                          if (isRod) handleEquipToggle(item)
                        }}
                        className={`group relative aspect-square p-2 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between overflow-hidden select-none ${
                          isSelected
                            ? 'border-[#668B65] bg-emerald-50/70 ring-3 ring-[#668B65]/40 shadow-md scale-[1.02]'
                            : isChecked
                            ? 'border-amber-500 bg-amber-50/70 ring-2 ring-amber-400'
                            : 'border-[#D8CEBE] bg-white hover:border-[#78634B] hover:shadow-md'
                        }`}
                      >
                        {/* Multi-select checkbox */}
                        {isMultiSelect && isFish && (
                          <div className="absolute top-1.5 left-1.5 z-10">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleSelectId(item.id)}
                              className="w-4 h-4 rounded text-amber-500 focus:ring-0 cursor-pointer"
                            />
                          </div>
                        )}

                        {/* Top Badges: Favorite Star & Equipped Indicator */}
                        <div className="flex items-center justify-between w-full">
                          {/* Equipped Badge */}
                          {item.isEquipped ? (
                            <span className="px-1.5 py-0.5 rounded-md bg-[#668B65] text-white text-[9px] font-black flex items-center gap-0.5 shadow-xs">
                              <CheckCircle2 className="w-2.5 h-2.5" /> Pakai
                            </span>
                          ) : (
                            <span />
                          )}

                          {/* Favorite Star */}
                          {item.isFavorite && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleToggleFavorite(item)
                              }}
                              className="text-amber-500 hover:scale-110 transition-transform"
                              title="Favorit"
                            >
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            </button>
                          )}
                        </div>

                        {/* Center Icon */}
                        <div className="flex items-center justify-center my-auto">
                          <span className="text-3xl sm:text-4xl filter drop-shadow-xs group-hover:scale-110 transition-transform">
                            {item.icon || (isFish ? '🐟' : isRod ? '🎣' : '🎒')}
                          </span>
                        </div>

                        {/* Bottom Info: Name & Weight / Price */}
                        <div className="w-full text-center">
                          <p className="text-[11px] font-heading font-extrabold text-[#343B35] truncate leading-tight">
                            {item.name || 'Barang Warga'}
                          </p>

                          <div className="flex items-center justify-center gap-1 mt-0.5">
                            {isFish && item.weight && (
                              <span className="text-[9px] font-bold text-[#78634B] bg-[#EFE9D8] px-1 rounded">
                                {item.weight} kg
                              </span>
                            )}
                            <span
                              className={`text-[8px] font-heading font-extrabold px-1 rounded border ${theme.badge}`}
                            >
                              {theme.label.split(' ')[0]}
                            </span>
                          </div>
                        </div>

                        {/* Rarity Bottom Stripe */}
                        <div
                          className={`absolute bottom-0 left-0 right-0 h-1 ${
                            item.rarity === 'immortal'
                              ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500'
                              : item.rarity === 'mythic'
                              ? 'bg-red-500'
                              : item.rarity === 'legendary'
                              ? 'bg-amber-400'
                              : item.rarity === 'epic'
                              ? 'bg-purple-500'
                              : item.rarity === 'rare'
                              ? 'bg-blue-500'
                              : item.rarity === 'uncommon'
                              ? 'bg-sky-400'
                              : 'bg-emerald-400'
                          }`}
                        />
                      </div>
                    )
                  })}
                </div>
              )}

              {/* If in Tools tab: Show JORAN UPGRADE SHOP / CATALOG */}
              {activeCategory === 'tools' && (
                <div className="mt-8 pt-6 border-t-2 border-[#D8CEBE]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-xs sm:text-sm font-heading font-black text-[#343B35] flex items-center gap-1.5">
                        <ShoppingBag className="w-4 h-4 text-[#784620]" />
                        <span>Katalog Joran Kota (7 Tingkat Rarity)</span>
                      </h3>
                      <p className="text-[11px] text-[#78634B]">
                        Tingkatkan joranmu untuk menangkap ikan langka berbobot kolosal dan strike lebih cepat!
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
                    {FISHING_RODS.map((rod) => {
                      const isOwned = ownedRodIds.has(rod.id)
                      const isShopSelected = selectedShopRodId === rod.id
                      const theme = getRarityTheme(rod.rarity)

                      return (
                        <div
                          key={rod.id}
                          onClick={() => {
                            setSelectedItemId(null)
                            setSelectedShopRodId(rod.id)
                            setIsMobileSheetOpen(true)
                          }}
                          className={`relative p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between select-none ${
                            isShopSelected
                              ? 'border-[#784620] bg-amber-50 ring-2 ring-[#784620]/30 shadow-md'
                              : 'border-[#D8CEBE] bg-[#EFE9D8]/50 hover:bg-white hover:border-[#78634B]'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span
                              className={`text-[9px] font-heading font-extrabold px-1.5 py-0.5 rounded border ${theme.badge}`}
                            >
                              {theme.label}
                            </span>
                            {isOwned && (
                              <span className="text-[9px] font-bold text-[#668B65] bg-emerald-100 px-1 rounded">
                                Dimiliki
                              </span>
                            )}
                          </div>

                          <div className="text-center my-2">
                            <span className="text-3xl filter drop-shadow-xs">{rod.icon}</span>
                            <h4 className="text-xs font-heading font-extrabold text-[#343B35] mt-1 truncate">
                              {rod.name}
                            </h4>
                          </div>

                          <div className="pt-2 border-t border-[#D8CEBE]/60 flex items-center justify-between text-[10px]">
                            <span className="font-bold text-[#78634B]">
                              +{Math.round(rod.luck * 100)}% Luck
                            </span>
                            <span className="font-black text-[#343B35] flex items-center gap-0.5">
                              <Coins className="w-3 h-3 text-[#E6C66F]" />
                              {rod.price === 0 ? 'Gratis' : rod.price.toLocaleString('id-ID')}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Multi-Select Floating Bar */}
            {isMultiSelect && selectedIds.size > 0 && (
              <div className="p-3 sm:p-4 bg-[#EFE9D8] border-t-2 border-[#D8CEBE] flex items-center justify-between gap-3 shadow-lg animate-slide-up">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-xs">
                    {selectedIds.size}
                  </div>
                  <div>
                    <p className="text-xs font-heading font-bold text-[#343B35]">
                      {selectedIds.size} Ikan Dipilih
                    </p>
                    <p className="text-[11px] font-black text-emerald-700 flex items-center gap-1">
                      <Coins className="w-3 h-3 text-[#E6C66F]" />
                      Total Hasil Jual: +{batchTotalCoins.toLocaleString('id-ID')} Koin
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleSelectAllSellableFish}
                    className="px-2.5 py-1.5 rounded-xl bg-[#F7F4E9] hover:bg-[#E2DAC7] text-[#343B35] font-bold text-[11px] border border-[#D8CEBE] cursor-pointer"
                  >
                    Pilih Semua
                  </button>

                  <button
                    type="button"
                    onClick={requestBatchSell}
                    disabled={isActionLoading}
                    className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-heading font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Coins className="w-4 h-4 text-amber-200" />
                    <span>Jual Pilihan ({selectedIds.size})</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Roblox Inspector / Item Detail Panel (Hidden on mobile, slides up as bottom sheet) */}
          <div className="hidden md:flex w-[340px] lg:w-[380px] bg-[#EFE9D8] border-l-2 border-[#D8CEBE] flex-col justify-between p-5 overflow-y-auto shrink-0">
            {selectedShopRod ? (
              // SHOP ROD INSPECTOR
              <div className="flex flex-col h-full justify-between">
                <div>
                  {/* Big Preview */}
                  <div className="relative aspect-4/3 rounded-2xl bg-[#F7F4E9] border-2 border-[#D8CEBE] flex items-center justify-center shadow-inner overflow-hidden mb-4">
                    <span className="text-6xl filter drop-shadow-md animate-bounce-slow">
                      {selectedShopRod.icon}
                    </span>
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`text-[10px] font-heading font-black px-2 py-0.5 rounded-lg border ${
                          getRarityTheme(selectedShopRod.rarity).badge
                        }`}
                      >
                        {getRarityTheme(selectedShopRod.rarity).label}
                      </span>
                    </div>
                  </div>

                  {/* Title & Price */}
                  <h3 className="font-heading font-black text-base text-[#343B35]">
                    {selectedShopRod.name}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-[#78634B] mt-0.5 mb-2">
                    <Coins className="w-4 h-4 text-[#E6C66F]" />
                    <span className="font-extrabold text-[#343B35]">
                      {selectedShopRod.price === 0
                        ? 'Gratis (Joran Pemula)'
                        : `${selectedShopRod.price.toLocaleString('id-ID')} Netizen Coins`}
                    </span>
                  </div>

                  <p className="text-xs text-[#78634B] mb-4 leading-relaxed">
                    {selectedShopRod.description}
                  </p>

                  {/* Stats Grid */}
                  <div className="space-y-2 bg-[#F7F4E9] p-3.5 rounded-2xl border border-[#D8CEBE] text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[#78634B] flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Keberuntungan (Luck)
                      </span>
                      <span className="font-black text-[#343B35]">
                        +{Math.round(selectedShopRod.luck * 100)}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#78634B] flex items-center gap-1">
                        <Zap className="w-3.5 h-3.5 text-blue-500" /> Kecepatan Sambaran
                      </span>
                      <span className="font-black text-[#343B35]">
                        {selectedShopRod.fishingSpeed}x Speed
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-[#78634B] flex items-center gap-1">
                        <Scale className="w-3.5 h-3.5 text-emerald-600" /> Batas Bobot Ikan
                      </span>
                      <span className="font-black text-[#343B35]">
                        Hingga {selectedShopRod.maxWeight} kg
                      </span>
                    </div>

                    <div className="pt-2 border-t border-[#D8CEBE]/60 text-[11px] text-[#78634B]">
                      <strong className="text-[#343B35]">Kemampuan Khusus: </strong>
                      {selectedShopRod.specialAbility}
                    </div>
                  </div>
                </div>

                {/* Purchase Button */}
                <div className="mt-4 pt-4 border-t border-[#D8CEBE]">
                  {ownedRodIds.has(selectedShopRod.id) ? (
                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-center font-heading font-black text-xs text-emerald-800">
                      ✓ Kamu Sudah Memiliki Joran Ini di Tas
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleBuyRod(selectedShopRod)}
                      disabled={isActionLoading || currentCoins < selectedShopRod.price}
                      className="w-full py-3 rounded-2xl bg-[#668B65] hover:bg-[#527051] active:scale-95 text-white font-heading font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <Coins className="w-4 h-4 text-[#E6C66F]" />
                      <span>
                        Beli Joran ({selectedShopRod.price.toLocaleString('id-ID')} Koin)
                      </span>
                    </button>
                  )}
                </div>
              </div>
            ) : selectedItem ? (
              // OWNED ITEM INSPECTOR
              <div className="flex flex-col h-full justify-between">
                <div>
                  {/* Big Preview */}
                  <div className="relative aspect-4/3 rounded-2xl bg-[#F7F4E9] border-2 border-[#D8CEBE] flex items-center justify-center shadow-inner overflow-hidden mb-4">
                    <span className="text-6xl filter drop-shadow-md">
                      {selectedItem.icon || (selectedItem.category === 'fish' ? '🐟' : '🎒')}
                    </span>

                    {/* Top right rarity */}
                    <div className="absolute top-2.5 right-2.5">
                      <span
                        className={`text-[10px] font-heading font-black px-2 py-0.5 rounded-lg border ${
                          getRarityTheme(selectedItem.rarity).badge
                        }`}
                      >
                        {getRarityTheme(selectedItem.rarity).label}
                      </span>
                    </div>

                    {/* Top left favorite button */}
                    <button
                      type="button"
                      onClick={() => handleToggleFavorite(selectedItem)}
                      title={selectedItem.isFavorite ? 'Batal Favorit' : 'Jadikan Favorit'}
                      className="absolute top-2.5 left-2.5 w-8 h-8 rounded-xl bg-white/80 hover:bg-white border border-[#D8CEBE] flex items-center justify-center shadow-xs cursor-pointer transition-transform hover:scale-105"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          selectedItem.isFavorite
                            ? 'fill-amber-400 text-amber-500'
                            : 'text-[#A89885]'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Title & Category */}
                  <h3 className="font-heading font-black text-base text-[#343B35]">
                    {selectedItem.name || 'Barang Warga'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#78634B] mt-0.5 mb-2">
                    <span className="capitalize font-bold text-[#668B65]">
                      {selectedItem.category === 'tools'
                        ? 'Alat Pancing'
                        : selectedItem.category === 'fish'
                        ? 'Ikan Kali Netizen'
                        : selectedItem.category}
                    </span>
                    {selectedItem.isEquipped && (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-extrabold text-[10px]">
                        ✓ Sedang Digunakan
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#78634B] mb-4 leading-relaxed">
                    {selectedItem.description || 'Peralatan resmi milik warga NetizenCity.'}
                  </p>

                  {/* Stats Card */}
                  <div className="space-y-2 bg-[#F7F4E9] p-3.5 rounded-2xl border border-[#D8CEBE] text-xs">
                    {/* If Fish: Weight, Location, Catch Time, Sell Value */}
                    {selectedItem.category === 'fish' && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-[#78634B] flex items-center gap-1">
                            <Scale className="w-3.5 h-3.5 text-emerald-600" /> Bobot Tangkapan
                          </span>
                          <span className="font-black text-[#343B35]">
                            {selectedItem.weight ? `${selectedItem.weight} kg` : '-'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#78634B]">Lokasi</span>
                          <span className="font-bold text-[#343B35]">
                            {selectedItem.caughtLocation || 'Sungai Kali Netizen'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#78634B]">Tanggal Ditangkap</span>
                          <span className="font-bold text-[#343B35]">
                            {formatDateSafe(selectedItem.acquiredAt)}
                          </span>
                        </div>

                        <div className="pt-2 border-t border-[#D8CEBE]/60 flex items-center justify-between">
                          <span className="text-[#78634B] flex items-center gap-1 font-bold">
                            <Coins className="w-3.5 h-3.5 text-[#E6C66F]" /> Nilai Jual Pasar
                          </span>
                          <span className="font-black text-emerald-700 text-sm">
                            +{selectedItem.sellPrice || 50} Koin
                          </span>
                        </div>
                      </>
                    )}

                    {/* If Tool / Rod: Luck, Speed, Max Weight, Ability */}
                    {isRodItem(selectedItem) && (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-[#78634B] flex items-center gap-1">
                            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Bonus Luck
                          </span>
                          <span className="font-black text-[#343B35]">
                            +{Math.round((selectedItem.metadata?.luck || 0) * 100)}%
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#78634B] flex items-center gap-1">
                            <Zap className="w-3.5 h-3.5 text-blue-500" /> Kecepatan
                          </span>
                          <span className="font-black text-[#343B35]">
                            {selectedItem.metadata?.fishingSpeed || 1.0}x Speed
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-[#78634B] flex items-center gap-1">
                            <Scale className="w-3.5 h-3.5 text-emerald-600" /> Max Bobot
                          </span>
                          <span className="font-black text-[#343B35]">
                            {selectedItem.metadata?.maxWeight || 5.0} kg
                          </span>
                        </div>

                        {selectedItem.metadata?.specialAbility && (
                          <div className="pt-2 border-t border-[#D8CEBE]/60 text-[11px] text-[#78634B]">
                            <strong className="text-[#343B35]">Kemampuan: </strong>
                            {selectedItem.metadata.specialAbility}
                          </div>
                        )}
                      </>
                    )}

                    {/* If Fashion or Other: Quantity, Acquired */}
                    {selectedItem.category !== 'fish' &&
                      !isRodItem(selectedItem) && (
                        <>
                          <div className="flex items-center justify-between">
                            <span className="text-[#78634B]">Jumlah</span>
                            <span className="font-black text-[#343B35]">
                              {selectedItem.quantity || 1}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-[#78634B]">Diperoleh</span>
                            <span className="font-bold text-[#343B35]">
                              {formatDateSafe(selectedItem.acquiredAt)}
                            </span>
                          </div>
                        </>
                      )}
                  </div>
                </div>

                {/* Bottom Actions for Owned Item */}
                <div className="mt-4 pt-4 border-t border-[#D8CEBE] space-y-2">
                  {/* Tool Equip/Unequip */}
                  {isRodItem(selectedItem) && (
                    <button
                      type="button"
                      onClick={() => handleEquipToggle(selectedItem)}
                      disabled={isActionLoading}
                      className={`w-full py-2.5 rounded-2xl font-heading font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        selectedItem.isEquipped
                          ? 'bg-[#343B35] hover:bg-[#252A26] text-white'
                          : 'bg-[#668B65] hover:bg-[#527051] text-white active:scale-95'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>{selectedItem.isEquipped ? 'Lepas Joran' : 'Pasang / Equip Joran'}</span>
                    </button>
                  )}

                  {/* Fish Sell Button */}
                  {selectedItem.category === 'fish' && (
                    <button
                      type="button"
                      onClick={() => requestSellSingle(selectedItem)}
                      disabled={isActionLoading || selectedItem.isFavorite}
                      className="w-full py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-heading font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <Coins className="w-4 h-4 text-amber-200" />
                      <span>Jual Ikan (+{selectedItem.sellPrice || 50} Koin)</span>
                    </button>
                  )}

                  {/* Fashion Mall Link */}
                  {(selectedItem.category === 'clothing' ||
                    selectedItem.category === 'accessories' ||
                    selectedItem.category === 'fashion') && (
                    <button
                      type="button"
                      onClick={() => {
                        handleClose()
                        openModal('mall')
                      }}
                      className="w-full py-2.5 rounded-2xl bg-[#668B65] hover:bg-[#527051] text-white font-heading font-black text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Lihat Koleksi di Mall</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              // NO SELECTION EMPTY STATE
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <div className="w-14 h-14 rounded-2xl bg-[#F7F4E9] border border-[#D8CEBE] flex items-center justify-center text-2xl text-[#78634B] mb-2 shadow-inner">
                  🎒
                </div>
                <h4 className="font-heading font-bold text-sm text-[#343B35]">Pilih Suatu Barang</h4>
                <p className="text-xs text-[#78634B] mt-1">
                  Klik item pada tas untuk melihat spesifikasi, bobot, nilai jual, atau memasang peralatan.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ============================================================ */}
        {/* 5. FOOTER STATUS BAR */}
        {/* ============================================================ */}
        <div className="px-4 py-3 sm:px-6 bg-[#EFE9D8] border-t border-[#D8CEBE] flex items-center justify-between text-xs text-[#78634B] shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="hidden sm:inline">
              Tips: Pasang joran bertingkat tinggi sebelum memancing untuk hasil tangkapan mitos & abadi!
            </span>
            <span className="sm:hidden truncate">
              {inventory.length} item tersimpan di tas
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 bg-[#343B35] hover:bg-[#252A26] text-white font-heading font-black rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            Tutup (Esc)
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 6. MOBILE BOTTOM SHEET INSPECTOR */}
      {/* ============================================================ */}
      {isMobileSheetOpen && (selectedItem || selectedShopRod) && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-[10000] bg-[#F7F4E9] border-t-2 border-[#D8CEBE] rounded-t-3xl shadow-2xl p-4 max-h-[82vh] overflow-y-auto animate-slide-up">
          {/* Sheet Handle */}
          <div className="w-12 h-1.5 bg-[#D8CEBE] rounded-full mx-auto mb-3" />

          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3">
              <span className="text-4xl filter drop-shadow-xs">
                {selectedShopRod ? selectedShopRod.icon : selectedItem?.icon || '🎒'}
              </span>
              <div>
                <h3 className="font-heading font-black text-sm text-[#343B35]">
                  {selectedShopRod ? selectedShopRod.name : selectedItem?.name}
                </h3>
                <span
                  className={`text-[9px] font-heading font-black px-1.5 py-0.5 rounded border ${
                    getRarityTheme(selectedShopRod ? selectedShopRod.rarity : selectedItem?.rarity).badge
                  }`}
                >
                  {getRarityTheme(selectedShopRod ? selectedShopRod.rarity : selectedItem?.rarity).label}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsMobileSheetOpen(false)}
              className="w-8 h-8 rounded-lg bg-[#EFE9D8] flex items-center justify-center text-[#78634B]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Description */}
          <p className="text-xs text-[#78634B] mb-3">
            {selectedShopRod ? selectedShopRod.description : selectedItem?.description}
          </p>

          {/* Details / Stats */}
          <div className="p-3 bg-[#EFE9D8] rounded-xl text-xs space-y-1.5 mb-4">
            {selectedItem?.category === 'fish' && (
              <>
                <div className="flex justify-between">
                  <span className="text-[#78634B]">Bobot Tangkapan:</span>
                  <span className="font-bold text-[#343B35]">{selectedItem.weight} kg</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78634B]">Nilai Jual Pasar:</span>
                  <span className="font-black text-emerald-700">+{selectedItem.sellPrice || 50} Koin</span>
                </div>
              </>
            )}

            {(selectedShopRod || isRodItem(selectedItem)) && (
              <>
                <div className="flex justify-between">
                  <span className="text-[#78634B]">Keberuntungan:</span>
                  <span className="font-black text-[#343B35]">
                    +{Math.round(((selectedShopRod ? selectedShopRod.luck : selectedItem?.metadata?.luck) || 0) * 100)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78634B]">Batas Bobot Ikan:</span>
                  <span className="font-black text-[#343B35]">
                    {selectedShopRod ? selectedShopRod.maxWeight : selectedItem?.metadata?.maxWeight} kg
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {selectedShopRod && (
              <button
                type="button"
                onClick={() => handleBuyRod(selectedShopRod)}
                disabled={isActionLoading || currentCoins < selectedShopRod.price}
                className="w-full py-3 rounded-xl bg-[#668B65] text-white font-heading font-black text-xs shadow-md disabled:opacity-50"
              >
                Beli Joran ({selectedShopRod.price.toLocaleString('id-ID')} Koin)
              </button>
            )}

            {selectedItem && isRodItem(selectedItem) && (
              <button
                type="button"
                onClick={() => handleEquipToggle(selectedItem)}
                className={`w-full py-3 rounded-xl font-heading font-black text-xs shadow-md text-white ${
                  selectedItem.isEquipped ? 'bg-[#343B35]' : 'bg-[#668B65]'
                }`}
              >
                {selectedItem.isEquipped ? 'Lepas Joran' : 'Pasang / Equip Joran'}
              </button>
            )}

            {selectedItem && selectedItem.category === 'fish' && (
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleFavorite(selectedItem)}
                  className="px-4 py-3 rounded-xl bg-[#EFE9D8] border border-[#D8CEBE] text-xs font-bold text-[#343B35] flex items-center gap-1"
                >
                  <Star
                    className={`w-4 h-4 ${selectedItem.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`}
                  />
                  <span>{selectedItem.isFavorite ? 'Batal Favorit' : 'Favorit'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => requestSellSingle(selectedItem)}
                  disabled={selectedItem.isFavorite || isActionLoading}
                  className="flex-1 py-3 rounded-xl bg-amber-600 text-white font-heading font-black text-xs shadow-md disabled:opacity-40"
                >
                  Jual Ikan (+{selectedItem.sellPrice || 50} Koin)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 7. RARE FISH SELL CONFIRMATION MODAL */}
      {/* ============================================================ */}
      {confirmSellModal.isOpen && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-md bg-[#F7F4E9] border-2 border-red-300 rounded-3xl p-5 shadow-2xl animate-scale-up">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mb-3 shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <h3 className="text-base font-heading font-black text-[#343B35]">
              Konfirmasi Penjualan Ikan Langka!
            </h3>

            <p className="text-xs text-[#78634B] mt-1.5 leading-relaxed">
              Perhatian! Kamu akan menjual{' '}
              <strong className="text-red-600 font-extrabold">
                {confirmSellModal.items.length === 1
                  ? confirmSellModal.items[0].name
                  : `${confirmSellModal.items.length} ekor ikan (termasuk ikan langka)`}
              </strong>{' '}
              seharga{' '}
              <strong className="text-[#343B35] font-extrabold">
                +{confirmSellModal.totalCoins.toLocaleString('id-ID')} Netizen Coins
              </strong>
              . Ikan dengan kelangkaan tinggi sangat sulit didapatkan kembali!
            </p>

            <div className="flex items-center gap-2 mt-5">
              <button
                type="button"
                onClick={() => setConfirmSellModal({ isOpen: false, items: [], totalCoins: 0 })}
                className="flex-1 py-2.5 rounded-xl bg-[#EFE9D8] hover:bg-[#E2DAC7] text-[#343B35] font-heading font-bold text-xs border border-[#D8CEBE] cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirmSellModal.items.length === 1) {
                    executeSellSingle(confirmSellModal.items[0])
                  } else {
                    executeBatchSell(confirmSellModal.items, confirmSellModal.totalCoins)
                  }
                }}
                disabled={isActionLoading}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-heading font-black text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                Ya, Tetap Jual
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return createPortal(modalEl, document.body)
}
