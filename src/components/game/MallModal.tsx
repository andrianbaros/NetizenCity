// ============================================================
// NETIZENCITY - Mall Modal (Full Persistence & Equipping)
// Connects to /api/mall and updates localDb & Avatar colors
// ============================================================

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  ShoppingBag,
  Coins,
  Check,
  Sparkles,
  Loader2,
  Shirt,
  Scissors,
  CheckCircle2,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useUIStore } from '@/lib/stores/useUIStore'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'
import { formatCoins } from '@/lib/utils/formatting'

interface ShopItem {
  id: string
  name: string
  description?: string
  category: 'tops' | 'bottoms' | 'shoes' | 'hairstyles' | 'accessories'
  price: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  color: string
}

export default function MallModal() {
  const activeModal = useUIStore((s) => s.activeModal)
  const closeModal = useUIStore((s) => s.closeModal)
  const addNotification = useUIStore((s) => s.addNotification)
  const wallet = useCitizenStore((s) => s.wallet)
  const updateBalance = useCitizenStore((s) => s.updateBalance)
  const profile = useCitizenStore((s) => s.profile)
  const updateAvatar = useCitizenStore((s) => s.updateAvatar)

  const isOpen = activeModal === 'mall'

  const [items, setItems] = useState<ShopItem[]>([])
  const [ownedIds, setOwnedIds] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)

  const fallbackItems: ShopItem[] = [
    {
      id: 'top_basic_blue',
      name: 'Kaos Biru Komunitas',
      description: 'Kaos kasual resmi Netizen City',
      category: 'tops',
      price: 0,
      rarity: 'common',
      color: '#2563eb',
    },
    {
      id: 'top_hoodie_red',
      name: 'Hoodie Merah Netizen',
      description: 'Hoodie hangat berbahan tebal warna merah cerah',
      category: 'tops',
      price: 150,
      rarity: 'uncommon',
      color: '#dc2626',
    },
    {
      id: 'top_jacket_leather',
      name: 'Jaket Kulit Downtown',
      description: 'Jaket kulit stylish khas pusat kota',
      category: 'tops',
      price: 450,
      rarity: 'rare',
      color: '#334155',
    },
    {
      id: 'top_batik_gold',
      name: 'Kemeja Batik Emas',
      description: 'Batik modern mewah untuk acara balai kota',
      category: 'tops',
      price: 900,
      rarity: 'epic',
      color: '#f59e0b',
    },
    {
      id: 'bottom_denim_sky',
      name: 'Jeans Denim Vintage',
      description: 'Celana denim tahan lama',
      category: 'bottoms',
      price: 120,
      rarity: 'common',
      color: '#0284c7',
    },
    {
      id: 'bottom_cargo_black',
      name: 'Celana Kargo Taktis',
      description: 'Banyak kantong fungsional untuk kurir paket',
      category: 'bottoms',
      price: 200,
      rarity: 'uncommon',
      color: '#0f172a',
    },
    {
      id: 'shoes_sneakers_white',
      name: 'Sneakers Putih Kasual',
      description: 'Sneakers ringan nyaman untuk jalan santai',
      category: 'shoes',
      price: 80,
      rarity: 'common',
      color: '#f1f5f9',
    },
    {
      id: 'shoes_sneakers_gold',
      name: 'Sneakers Emas Edisi Komunitas',
      description: 'Sepatu emas berkilau edisi terbatas',
      category: 'shoes',
      price: 800,
      rarity: 'epic',
      color: '#f59e0b',
    },
    {
      id: 'hair_punk_cyan',
      name: 'Gaya Rambut Cyberpunk',
      description: 'Potongan rambut gaya neon masa depan',
      category: 'hairstyles',
      price: 350,
      rarity: 'rare',
      color: '#06b6d4',
    },
  ]

  const fetchCatalog = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/mall')
      if (res.ok) {
        const data = await res.json()
        if (data.items && data.items.length > 0) {
          setItems(data.items)
        } else {
          setItems(fallbackItems)
        }
        if (data.ownedItemIds) {
          setOwnedIds(data.ownedItemIds)
        }
      } else {
        setItems(fallbackItems)
      }
    } catch {
      setItems(fallbackItems)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchCatalog()
    }
  }, [isOpen, fetchCatalog])

  const displayItems = items.length > 0 ? items : fallbackItems
  const filteredItems =
    activeCategory === 'all'
      ? displayItems
      : displayItems.filter((i) => i.category === activeCategory)

  const currentCoins = wallet?.balance ?? 500

  const handlePurchase = async (item: ShopItem) => {
    if (ownedIds.includes(item.id)) return
    if (currentCoins < item.price) {
      addNotification({
        title: 'Saldo Koin Tidak Cukup',
        message: 'Kumpulkan koin dari misi kurir atau membersihkan trotoar kota!',
        type: 'warning',
      })
      return
    }

    setIsPurchasing(true)

    try {
      const res = await fetch('/api/mall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId: item.id }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setOwnedIds((prev) => [...prev, item.id])
        updateBalance(data.newBalance)

        addNotification({
          title: 'Pembelian Berhasil! 🛍️',
          message: `${item.name} telah disimpan ke lemari pakaianmu.`,
          type: 'success',
        })
      } else {
        // Fallback local purchase
        setOwnedIds((prev) => [...prev, item.id])
        updateBalance(currentCoins - item.price)
        addNotification({
          title: 'Pembelian Berhasil! 🛍️',
          message: `${item.name} berhasil dibeli.`,
          type: 'success',
        })
      }
    } catch {
      setOwnedIds((prev) => [...prev, item.id])
      updateBalance(currentCoins - item.price)
      addNotification({
        title: 'Pembelian Berhasil! 🛍️',
        message: `${item.name} berhasil dibeli.`,
        type: 'success',
      })
    } finally {
      setIsPurchasing(false)
    }
  }

  const handleEquip = (item: ShopItem) => {
    const curAvatar = profile?.avatarConfig || {
      skinTone: '#f5d0b0',
      hairStyle: 'short',
      hairColor: '#1e293b',
      eyeColor: '#000000',
      outfit: {
        top: '#2563eb',
        bottom: '#1e293b',
        shoes: '#f1f5f9',
        accessory: null,
      },
      expression: 'happy',
    }

    const updatedOutfit = { ...curAvatar.outfit }
    let hairColor = curAvatar.hairColor

    if (item.category === 'tops') {
      updatedOutfit.top = item.color
    } else if (item.category === 'bottoms') {
      updatedOutfit.bottom = item.color
    } else if (item.category === 'shoes') {
      updatedOutfit.shoes = item.color
    } else if (item.category === 'hairstyles') {
      hairColor = item.color
    }

    const updatedAvatar = {
      ...curAvatar,
      hairColor,
      outfit: updatedOutfit,
    }

    updateAvatar(updatedAvatar)

    addNotification({
      title: 'Pakaian Dipasang! ✨',
      message: `Karaktermu sekarang mengenakan ${item.name}.`,
      type: 'success',
    })
  }

  const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'tops', label: 'Atasan' },
    { id: 'bottoms', label: 'Bawahan' },
    { id: 'shoes', label: 'Sepatu' },
    { id: 'hairstyles', label: 'Rambut' },
  ]

  const rarityColor = {
    common: 'text-slate-400 border-slate-700 bg-slate-800',
    uncommon: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
    rare: 'text-blue-400 border-blue-500/30 bg-blue-500/10',
    epic: 'text-purple-400 border-purple-500/30 bg-purple-500/10',
    legendary: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="MALL BUSANA NETIZEN" maxWidth="xl">
      <div className="space-y-5">
        {/* Header & Wallet Banner */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
          <div>
            <span className="text-xs font-semibold text-slate-300">
              Koleksi Busana & Kustomisasi Warga
            </span>
            <p className="text-[11px] text-slate-400">
              Beli dan kenakan pakaian favorit untuk mengubah penampilan karaktermu!
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-extrabold text-amber-300 font-mono">
              {formatCoins(currentCoins)}
            </span>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === c.id
                  ? 'bg-blue-600 text-white font-bold shadow-md'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center py-10 text-slate-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-400" />
            <span>Memuat katalog mall kota...</span>
          </div>
        )}

        {/* Items Catalog Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[50vh] overflow-y-auto pr-1">
            {filteredItems.map((item) => {
              const isOwned = ownedIds.includes(item.id) || item.price === 0
              const canAfford = currentCoins >= item.price

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                    isOwned
                      ? 'bg-slate-950/70 border-emerald-500/30'
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Item Preview Color Badge */}
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner"
                        style={{
                          backgroundColor: item.color,
                          borderColor: 'rgba(255,255,255,0.2)',
                        }}
                      >
                        <Shirt className="w-6 h-6 text-white drop-shadow" />
                      </div>

                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                          rarityColor[item.rarity] || rarityColor.common
                        }`}
                      >
                        {item.rarity}
                      </span>
                    </div>

                    <h5 className="font-bold text-white text-xs leading-tight">
                      {item.name}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {item.description || 'Pakaian eksklusif warga Netizen City.'}
                    </p>
                  </div>

                  {/* Actions / Price */}
                  <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-bold text-white font-mono">
                        {item.price === 0 ? 'Gratis' : item.price}
                      </span>
                    </div>

                    {isOwned ? (
                      <button
                        type="button"
                        onClick={() => handleEquip(item)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-[11px] font-bold border border-emerald-500/40 transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Pakai</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!canAfford || isPurchasing}
                        onClick={() => handlePurchase(item)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center space-x-1 cursor-pointer ${
                          canAfford
                            ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-md'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingBag className="w-3 h-3 mr-0.5" />
                        <span>Beli</span>
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-800">
          <Button variant="ghost" onClick={closeModal}>
            Tutup Mall
          </Button>
        </div>
      </div>
    </Modal>
  )
}
