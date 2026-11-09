// ============================================================
// NETIZENCITY - Citizen Inventory Modal (Tas Barang Warga)
// Cozy Low-Poly UI: Kelola hasil pancingan, busana mall, & koleksi
// ============================================================

'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Fish,
  ShoppingBag,
  Coins,
  Package,
  Sparkles,
  Scale,
  Trash2,
  ExternalLink,
  CheckCircle2,
} from 'lucide-react'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'
import { useUIStore } from '@/lib/stores/useUIStore'
import { formatCoins } from '@/lib/utils/formatting'
import type { InventoryItem } from '@/types/economy'

interface InventoryModalProps {
  isOpen: boolean
  onClose: () => void
}

type TabCategory = 'all' | 'fish' | 'fashion' | 'other'

const isFashionItem = (category?: string) => {
  return (
    category === 'fashion' ||
    category === 'tops' ||
    category === 'bottoms' ||
    category === 'shoes' ||
    category === 'accessories' ||
    category === 'hairstyles' ||
    category === 'skins'
  )
}

export default function InventoryModal({ isOpen, onClose }: InventoryModalProps) {
  const [mounted, setMounted] = useState(false)
  const [activeTab, setActiveTab] = useState<TabCategory>('all')
  const [sellingId, setSellingId] = useState<string | null>(null)

  const profile = useCitizenStore((s) => s.profile)
  const wallet = useCitizenStore((s) => s.wallet)
  const inventory = useCitizenStore((s) => s.inventory)
  const setInventory = useCitizenStore((s) => s.setInventory)
  const removeFromInventory = useCitizenStore((s) => s.removeFromInventory)
  const updateBalance = useCitizenStore((s) => s.updateBalance)
  const addNotification = useUIStore((s) => s.addNotification)
  const openModal = useUIStore((s) => s.openModal)
  const closeModal = useUIStore((s) => s.closeModal)

  const handleClose = () => {
    onClose()
    closeModal()
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  // Listen to Escape key to close modal
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  const currentCoins = wallet?.balance ?? 500
  const maxSlots = 50

  // Filter items by active tab
  const filteredItems = useMemo(() => {
    if (activeTab === 'all') return inventory
    if (activeTab === 'fish') return inventory.filter((i) => i.category === 'fish')
    if (activeTab === 'fashion') return inventory.filter((i) => isFashionItem(i.category))
    return inventory.filter((i) => i.category !== 'fish' && !isFashionItem(i.category))
  }, [inventory, activeTab])

  // Counts for tabs
  const fishCount = useMemo(
    () => inventory.filter((i) => i.category === 'fish').length,
    [inventory]
  )
  const fashionCount = useMemo(
    () => inventory.filter((i) => isFashionItem(i.category)).length,
    [inventory]
  )
  const otherCount = useMemo(
    () => inventory.length - fishCount - fashionCount,
    [inventory, fishCount, fashionCount]
  )

  const handleSell = async (item: InventoryItem) => {
    if (sellingId) return
    setSellingId(item.id)

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
          updateBalance(currentCoins + (item.sellPrice || 40))
        }

        addNotification({
          title: `Berhasil Menjual ${item.name || 'Barang'}! 💰`,
          message: `+${item.sellPrice || 40} Netizen Coins telah ditambahkan ke dompetmu.`,
          type: 'success',
        })
      } else {
        const err = await res.json()
        addNotification({
          title: 'Gagal Menjual Barang',
          message: err.error || 'Terjadi kesalahan saat menjual barang.',
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
      setSellingId(null)
    }
  }

  if (!isOpen || !mounted) return null

  const modalEl = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 pointer-events-auto"
      style={{ pointerEvents: 'auto' }}
    >
      {/* Dimmed backdrop - click to close */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer animate-fade-in"
        onClick={handleClose}
        style={{ pointerEvents: 'auto' }}
      />

      {/* Modal Dialog */}
      <div
        className="relative z-10 w-full max-w-2xl bg-[#F7F4E9] border-2 border-[#D8CEBE] rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-scale-up"
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-5 bg-[#EFE9D8] border-b border-[#D8CEBE]">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#668B65] text-white flex items-center justify-center shadow-md">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-heading font-extrabold text-[#343B35]">
                Tas Barang Warga (Inventori)
              </h2>
              <p className="text-xs text-[#78634B]">
                Kapasitas: <span className="font-bold text-[#343B35]">{inventory.length}</span> / {maxSlots} Slot
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Wallet pill */}
            <div className="flex items-center space-x-1.5 bg-[#F7F4E9] border border-[#D8CEBE] px-3 py-1.5 rounded-xl shadow-xs">
              <Coins className="w-4 h-4 text-[#E6C66F]" />
              <span className="font-heading font-extrabold text-xs sm:text-sm text-[#343B35]">
                {formatCoins(currentCoins)}
              </span>
            </div>

            <button
              type="button"
              onClick={handleClose}
              title="Tutup (Esc)"
              className="w-9 h-9 rounded-xl bg-[#F7F4E9] hover:bg-[#E2DAC7] border border-[#D8CEBE] flex items-center justify-center text-[#78634B] hover:text-[#343B35] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center gap-1.5 px-4 sm:px-5 py-2.5 bg-[#F7F4E9] border-b border-[#D8CEBE] overflow-x-auto text-xs scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl font-heading font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#668B65] text-white shadow-xs'
                : 'bg-[#EFE9D8] text-[#78634B] hover:bg-[#E2DAC7]'
            }`}
          >
            🎒 Semua ({inventory.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fish')}
            className={`px-3 py-1.5 rounded-xl font-heading font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'fish'
                ? 'bg-[#2D7F9D] text-white shadow-xs'
                : 'bg-[#EFE9D8] text-[#78634B] hover:bg-[#E2DAC7]'
            }`}
          >
            🎣 Tangkapan Ikan ({fishCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('fashion')}
            className={`px-3 py-1.5 rounded-xl font-heading font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'fashion'
                ? 'bg-[#78634B] text-white shadow-xs'
                : 'bg-[#EFE9D8] text-[#78634B] hover:bg-[#E2DAC7]'
            }`}
          >
            👔 Busana Mall ({fashionCount})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('other')}
            className={`px-3 py-1.5 rounded-xl font-heading font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
              activeTab === 'other'
                ? 'bg-[#E6C66F] text-[#343B35] shadow-xs'
                : 'bg-[#EFE9D8] text-[#78634B] hover:bg-[#E2DAC7]'
            }`}
          >
            📦 Lainnya ({otherCount})
          </button>
        </div>

        {/* Inventory Item List Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 min-h-[300px]">
          {filteredItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-3xl bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-3xl mb-3 shadow-inner">
                {activeTab === 'fish' ? '🎣' : activeTab === 'fashion' ? '👔' : '🎒'}
              </div>
              <h3 className="font-heading font-bold text-base text-[#343B35]">
                {activeTab === 'fish'
                  ? 'Belum Ada Ikan di Tas'
                  : activeTab === 'fashion'
                  ? 'Belum Memiliki Busana'
                  : 'Tas Barang Kosong'}
              </h3>
              <p className="text-xs text-[#78634B] max-w-sm mt-1 mb-4">
                {activeTab === 'fish'
                  ? 'Pergi ke Sungai Kali Netizen & Dermaga Pancing untuk menangkap ikan segar khas kota!'
                  : activeTab === 'fashion'
                  ? 'Kunjungi Mall Busana Netizen untuk membeli pakaian, gaya rambut, dan aksesoris keren.'
                  : 'Koleksi berbagai tangkapan ikan, hasil panen kebun, dan busana favoritmu di sini.'}
              </p>
              {activeTab === 'fashion' && (
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredItems.map((item) => {
                const isFish = item.category === 'fish'
                const rarityLabel =
                  item.rarity === 'Legendaris' || item.rarity === 'legendary'
                    ? 'Legendaris'
                    : item.rarity === 'Langka' || item.rarity === 'rare' || item.rarity === 'epic'
                    ? 'Langka'
                    : 'Biasa'

                const rarityColor =
                  rarityLabel === 'Legendaris'
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : rarityLabel === 'Langka'
                    ? 'bg-purple-100 text-purple-800 border-purple-300'
                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'

                const dateStr = item.acquiredAt
                  ? new Date(item.acquiredAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })
                  : ''

                return (
                  <div
                    key={item.id}
                    className="p-3.5 bg-white border border-[#D8CEBE] rounded-2xl shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Icon + Name + Rarity */}
                      <div className="flex items-start space-x-3">
                        <div className="w-12 h-12 rounded-2xl bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-2xl shrink-0 shadow-inner">
                          {isFish ? '🐟' : item.icon || '🎒'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-heading font-extrabold text-sm text-[#343B35] truncate">
                              {item.name || 'Barang Warga'}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1.5 mt-1">
                            <span
                              className={`text-[10px] font-heading font-bold px-1.5 py-0.5 rounded-md border ${rarityColor}`}
                            >
                              {rarityLabel}
                            </span>

                            {item.weight && (
                              <span className="text-[10px] font-heading font-medium text-[#78634B] bg-[#EFE9D8] px-1.5 py-0.5 rounded-md border border-[#D8CEBE] flex items-center gap-1">
                                <Scale className="w-2.5 h-2.5 text-[#668B65]" />
                                {item.weight} kg
                              </span>
                            )}

                            {item.isEquipped && (
                              <span className="text-[10px] font-heading font-bold text-[#668B65] bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200 flex items-center gap-0.5">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Dipakai
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#78634B] mt-2 line-clamp-2">
                        {item.description || (isFish ? 'Ikan segar dari Kali Netizen.' : 'Barang milik warga.')}
                      </p>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#F0EBE0]">
                      <span className="text-[10px] text-[#A89885]">{dateStr}</span>

                      {/* Sell Button for fish & sellable goods */}
                      {isFish ? (
                        <button
                          type="button"
                          onClick={() => handleSell(item)}
                          disabled={sellingId === item.id}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-heading font-bold text-xs flex items-center gap-1 transition-all active:translate-y-0.5 cursor-pointer disabled:opacity-50 shadow-xs"
                        >
                          <Coins className="w-3.5 h-3.5 text-[#E6C66F]" />
                          Jual (+{item.sellPrice || 40})
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            handleClose()
                            openModal('mall')
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#EFE9D8] hover:bg-[#E2DAC7] text-[#343B35] font-heading font-bold text-[11px] border border-[#D8CEBE] flex items-center gap-1 cursor-pointer"
                        >
                          Lihat di Mall
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="p-3.5 px-5 bg-[#EFE9D8] border-t border-[#D8CEBE] flex items-center justify-between text-xs text-[#78634B]">
          <span className="truncate pr-2">💡 Ikan tangkapan dapat disimpan sebagai koleksi atau dijual ke pasar.</span>
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-1.5 bg-[#343B35] hover:bg-[#252A26] text-white font-heading font-bold rounded-xl transition-colors cursor-pointer shrink-0 shadow-xs"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalEl, document.body)
}
