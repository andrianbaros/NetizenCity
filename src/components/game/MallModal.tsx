'use client'

import React, { useState } from 'react'
import { ShoppingBag, Coins, Check, Sparkles } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useUIStore } from '@/lib/stores/useUIStore'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'
import { formatCoins } from '@/lib/utils/formatting'

interface ShopItem {
  id: string
  name: string
  category: 'tops' | 'bottoms' | 'shoes' | 'hairstyles'
  price: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic'
  color: string
}

export default function MallModal() {
  const activeModal = useUIStore((s) => s.activeModal)
  const closeModal = useUIStore((s) => s.closeModal)
  const addNotification = useUIStore((s) => s.addNotification)
  const wallet = useCitizenStore((s) => s.wallet)
  const updateBalance = useCitizenStore((s) => s.updateBalance)

  const isOpen = activeModal === 'mall'

  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [purchasedIds, setPurchasedIds] = useState<string[]>([])
  const [selectedItem, setSelectedItem] = useState<ShopItem | null>(null)

  const items: ShopItem[] = [
    {
      id: 'top_hoodie_red',
      name: 'Hoodie Merah Netizen',
      category: 'tops',
      price: 150,
      rarity: 'uncommon',
      color: '#dc2626',
    },
    {
      id: 'top_jacket_leather',
      name: 'Jaket Kulit Downtown',
      category: 'tops',
      price: 450,
      rarity: 'rare',
      color: '#334155',
    },
    {
      id: 'bottom_cargo_black',
      name: 'Celana Kargo Taktis',
      category: 'bottoms',
      price: 120,
      rarity: 'common',
      color: '#0f172a',
    },
    {
      id: 'bottom_denim_sky',
      name: 'Jeans Denim Vintage',
      category: 'bottoms',
      price: 200,
      rarity: 'uncommon',
      color: '#0284c7',
    },
    {
      id: 'shoes_sneakers_gold',
      name: 'Sneakers Emas Edisi Komunitas',
      category: 'shoes',
      price: 800,
      rarity: 'epic',
      color: '#f59e0b',
    },
    {
      id: 'hair_punk_cyan',
      name: 'Gaya Rambut Cyberpunk',
      category: 'hairstyles',
      price: 350,
      rarity: 'rare',
      color: '#06b6d4',
    },
  ]

  const filteredItems =
    activeCategory === 'all'
      ? items
      : items.filter((i) => i.category === activeCategory)

  const currentCoins = wallet?.balance ?? 500

  const handlePurchase = (item: ShopItem) => {
    if (purchasedIds.includes(item.id)) return
    if (currentCoins < item.price) {
      addNotification({
        title: 'Saldo Koin Tidak Cukup',
        message: 'Bekerjalah di kota untuk mendapatkan lebih banyak koin.',
        type: 'warning',
      })
      return
    }

    const newBalance = currentCoins - item.price
    updateBalance(newBalance)
    setPurchasedIds((prev) => [...prev, item.id])

    addNotification({
      title: 'Pembelian Berhasil!',
      message: `Kamu membeli ${item.name} seharga ${item.price} Netizen Coins.`,
      type: 'success',
    })
  }

  const rarityBadgeVariant: Record<string, 'neutral' | 'primary' | 'warning' | 'gold'> = {
    common: 'neutral',
    uncommon: 'primary',
    rare: 'warning',
    epic: 'gold',
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="MALL PERBELANJAAN NETIZEN"
      maxWidth="xl"
    >
      <div className="space-y-5">
        {/* Top Mall Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-800 gap-3">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span className="text-xs text-slate-300">
              Koleksi Busana &amp; Aksesori Warga
            </span>
          </div>

          <div className="flex items-center space-x-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="text-xs text-slate-400">Saldo:</span>
            <span className="font-extrabold text-sm text-amber-300 font-mono">
              {formatCoins(currentCoins)}
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex space-x-2 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'all', label: 'Semua Item' },
            { id: 'tops', label: 'Baju & Atasan' },
            { id: 'bottoms', label: 'Celana' },
            { id: 'shoes', label: 'Sepatu' },
            { id: 'hairstyles', label: 'Gaya Rambut' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Item Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 max-h-80 overflow-y-auto p-1">
          {filteredItems.map((item) => {
            const isOwned = purchasedIds.includes(item.id)

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={`p-3.5 rounded-xl border bg-slate-900/80 transition-all cursor-pointer flex flex-col justify-between ${
                  selectedItem?.id === item.id
                    ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant={rarityBadgeVariant[item.rarity]} size="sm">
                      {item.rarity}
                    </Badge>
                    <div
                      className="w-4 h-4 rounded-full border border-slate-700"
                      style={{ backgroundColor: item.color }}
                    />
                  </div>
                  <h4 className="font-bold text-xs text-white mb-1">
                    {item.name}
                  </h4>
                </div>

                <div className="mt-4 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-amber-300 font-mono text-xs font-bold">
                    <Coins className="w-3.5 h-3.5" />
                    <span>{item.price}</span>
                  </div>

                  {isOwned ? (
                    <span className="text-[10px] text-emerald-400 font-bold flex items-center">
                      <Check className="w-3 h-3 mr-0.5" /> Dimiliki
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handlePurchase(item)
                      }}
                      className="text-[11px] font-bold px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white transition-colors"
                    >
                      Beli
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Bottom Try-On info */}
        {selectedItem && (
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-slate-300">
                Item Terpilih: <strong className="text-white">{selectedItem.name}</strong>
              </span>
            </div>
            {!purchasedIds.includes(selectedItem.id) && (
              <Button
                variant="accent"
                size="sm"
                onClick={() => handlePurchase(selectedItem)}
              >
                Beli Sekarang ({selectedItem.price} Koin)
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
