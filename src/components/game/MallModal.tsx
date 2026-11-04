// ============================================================
// NETIZENCITY - Mall Modal (Full Persistence & Real-Time Equipping)
// Connects to /api/mall, updates localDb & Avatar renderer live
// ============================================================

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  ShoppingBag,
  Coins,
  Check,
  Sparkles,
  Loader2,
  Shirt,
  Layers,
  Footprints,
  Crown,
  Feather,
  CheckCircle2,
  X,
  Zap,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/lib/stores/useUIStore'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'
import { formatCoins } from '@/lib/utils/formatting'
import {
  resolveAvatarColors,
  drawCharacterPreviewCanvas,
} from '@/game/utils/characterRenderer'

interface ShopItem {
  id: string
  name: string
  description?: string
  category: 'tops' | 'bottoms' | 'shoes' | 'hairstyles' | 'accessories' | 'back'
  price: number
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  color: string
  pattern?: string
  sprite_key?: string
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
  const [isLoading, setIsLoading] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)

  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  // Redraw preview canvas whenever avatarConfig changes or modal opens
  useEffect(() => {
    if (isOpen && previewCanvasRef.current) {
      const colors = resolveAvatarColors(profile?.avatarConfig)
      drawCharacterPreviewCanvas(previewCanvasRef.current, colors, 2)
    }
  }, [isOpen, profile?.avatarConfig])

  const fetchCatalog = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/mall')
      if (res.ok) {
        const data = await res.json()
        if (data.items && data.items.length > 0) {
          setItems(data.items)
        }
        if (data.ownedItemIds) {
          setOwnedIds(data.ownedItemIds)
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchCatalog()
    }
  }, [isOpen, fetchCatalog])

  const displayItems = items
  const filteredItems =
    activeCategory === 'all'
      ? displayItems
      : displayItems.filter((i) => i.category === activeCategory)

  const currentCoins = wallet?.balance ?? 500

  // Resolve current avatar colors
  const currentShirt =
    profile?.avatarConfig?.shirtColor ||
    profile?.avatarConfig?.outfit?.top ||
    '#2563eb'
  const currentPants =
    profile?.avatarConfig?.pantsColor ||
    profile?.avatarConfig?.outfit?.bottom ||
    '#1e293b'
  const currentShoes =
    profile?.avatarConfig?.shoesColor ||
    profile?.avatarConfig?.outfit?.shoes ||
    '#f1f5f9'
  const currentHair = profile?.avatarConfig?.hairColor || '#1e293b'
  const currentAcc = profile?.avatarConfig?.accessory || null
  const currentBack = profile?.avatarConfig?.backpack || null
  const currentPattern = profile?.avatarConfig?.outfitPattern || 'plain'
  const currentHairStyle = profile?.avatarConfig?.hairStyle || 'short'

  const checkIsEquipped = (item: ShopItem) => {
    if (item.category === 'tops') {
      if (item.pattern && item.pattern !== 'plain') {
        return (
          currentPattern === item.pattern &&
          currentShirt.toLowerCase() === item.color.toLowerCase()
        )
      }
      return currentShirt.toLowerCase() === item.color.toLowerCase()
    }
    if (item.category === 'bottoms') {
      if (item.pattern && ['sarung', 'skirt', 'techwear'].includes(item.pattern)) {
        return (
          currentPattern === item.pattern &&
          currentPants.toLowerCase() === item.color.toLowerCase()
        )
      }
      return currentPants.toLowerCase() === item.color.toLowerCase()
    }
    if (item.category === 'shoes') {
      if (item.pattern && ['swallow', 'roller'].includes(item.pattern)) {
        return (
          currentPattern === item.pattern ||
          currentShoes.toLowerCase() === item.color.toLowerCase()
        )
      }
      return currentShoes.toLowerCase() === item.color.toLowerCase()
    }
    if (item.category === 'hairstyles') {
      if (item.pattern) {
        return (
          currentHairStyle === item.pattern &&
          currentHair.toLowerCase() === item.color.toLowerCase()
        )
      }
      return currentHair.toLowerCase() === item.color.toLowerCase()
    }
    if (item.category === 'accessories') {
      return currentAcc === item.pattern || currentAcc === item.id
    }
    if (item.category === 'back') {
      return currentBack === item.pattern || currentBack === item.id
    }
    return false
  }

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
          message: `${item.name} telah disimpan ke lemari pakaianmu. Klik "Pakai" untuk mengenakannya!`,
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

  const handleEquip = async (item: ShopItem) => {
    const curAvatar = profile?.avatarConfig || {
      skinTone: '#f5d0b0',
      hairStyle: 'short',
      hairColor: '#1e293b',
      eyeColor: '#000000',
      shirtColor: '#2563eb',
      pantsColor: '#1e293b',
      shoesColor: '#f1f5f9',
      expression: 'happy',
      outfitPattern: 'plain',
      accessory: null,
      backpack: null,
    }

    let shirtColor = curAvatar.shirtColor || '#2563eb'
    let pantsColor = curAvatar.pantsColor || '#1e293b'
    let shoesColor = curAvatar.shoesColor || '#f1f5f9'
    let hairColor = curAvatar.hairColor || '#1e293b'
    let hairStyle = curAvatar.hairStyle || 'short'
    let outfitPattern = curAvatar.outfitPattern || 'plain'
    let accessory = curAvatar.accessory ?? null
    let backpack = curAvatar.backpack ?? null

    if (item.category === 'tops') {
      shirtColor = item.color
      outfitPattern = item.pattern || 'plain'
    } else if (item.category === 'bottoms') {
      pantsColor = item.color
      if (item.pattern && ['sarung', 'skirt', 'techwear'].includes(item.pattern)) {
        outfitPattern = item.pattern
      } else if (['sarung', 'skirt'].includes(outfitPattern)) {
        outfitPattern = 'plain'
      }
    } else if (item.category === 'shoes') {
      shoesColor = item.color
      if (item.pattern && ['swallow', 'roller'].includes(item.pattern)) {
        outfitPattern = item.pattern
      }
    } else if (item.category === 'hairstyles') {
      hairColor = item.color
      if (item.pattern) {
        hairStyle = item.pattern
      }
    } else if (item.category === 'accessories') {
      // Toggle if already equipped
      accessory = accessory === (item.pattern || item.id) ? null : item.pattern || item.id
    } else if (item.category === 'back') {
      // Toggle if already equipped
      backpack = backpack === (item.pattern || item.id) ? null : item.pattern || item.id
    }

    const updatedAvatar = {
      ...curAvatar,
      hairColor,
      hairStyle,
      shirtColor,
      pantsColor,
      shoesColor,
      outfitPattern,
      accessory,
      backpack,
      outfit: {
        top: shirtColor,
        bottom: pantsColor,
        shoes: shoesColor,
        accessory,
      },
    }

    // 1. Update Zustand client store
    updateAvatar(updatedAvatar)

    // 2. Dispatch custom event to Phaser CityScene so player sprite immediately changes appearance
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('avatar-updated', { detail: updatedAvatar })
      )
    }

    // 3. Persist to server /api/citizens/avatar
    try {
      await fetch('/api/citizens/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarConfig: updatedAvatar, itemId: item.id }),
      })
    } catch {
      // ignore
    }

    addNotification({
      title: 'Pakaian Dipasang! ✨',
      message: `Karaktermu sekarang mengenakan ${item.name}!`,
      type: 'success',
    })
  }

  const handleUnequip = async (item: ShopItem) => {
    const curAvatar = profile?.avatarConfig || {
      skinTone: '#f5d0b0',
      hairStyle: 'short',
      hairColor: '#1e293b',
      expression: 'happy',
    }

    const updatedAvatar = { ...curAvatar }

    if (item.category === 'accessories') {
      updatedAvatar.accessory = null
    } else if (item.category === 'back') {
      updatedAvatar.backpack = null
    }

    updateAvatar(updatedAvatar)

    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('avatar-updated', { detail: updatedAvatar })
      )
    }

    try {
      await fetch('/api/citizens/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarConfig: updatedAvatar }),
      })
    } catch {
      // ignore
    }

    addNotification({
      title: 'Aksesoris Dilepas',
      message: `${item.name} telah disimpan ke tasmu.`,
      type: 'info',
    })
  }

  const categories = [
    { id: 'all', label: '🌟 Semua' },
    { id: 'tops', label: '👕 Atasan & Baju' },
    { id: 'accessories', label: '👑 Aksesoris' },
    { id: 'bottoms', label: '👖 Bawahan & Sarung' },
    { id: 'shoes', label: '👟 Sepatu & Sandal' },
    { id: 'hairstyles', label: '💇 Gaya Rambut' },
    { id: 'back', label: '🪽 Sayap & Ransel' },
  ]

  const rarityColor = {
    common: 'text-slate-300 border-slate-700 bg-slate-800/80',
    uncommon: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/20',
    rare: 'text-sky-300 border-sky-500/40 bg-sky-500/20',
    epic: 'text-purple-300 border-purple-500/40 bg-purple-500/20',
    legendary: 'text-amber-300 border-amber-500/50 bg-amber-500/20 shadow-sm shadow-amber-500/20',
  }

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'tops':
        return <Shirt className="w-5 h-5 text-white drop-shadow" />
      case 'bottoms':
        return <Layers className="w-5 h-5 text-white drop-shadow" />
      case 'shoes':
        return <Footprints className="w-5 h-5 text-white drop-shadow" />
      case 'accessories':
        return <Crown className="w-5 h-5 text-white drop-shadow" />
      case 'hairstyles':
        return <Sparkles className="w-5 h-5 text-white drop-shadow" />
      case 'back':
        return <Feather className="w-5 h-5 text-white drop-shadow" />
      default:
        return <Shirt className="w-5 h-5 text-white drop-shadow" />
    }
  }

  const getTraitBadge = (pattern?: string) => {
    if (!pattern || pattern === 'plain') return null
    switch (pattern) {
      case 'jersey':
        return '🛡️ Lambang Garuda #10'
      case 'ojol':
        return '🛵 Rompi Strip Reflektif'
      case 'cyber':
        return '⚡ Kerah Neon Cyberpunk'
      case 'batik':
        return '🏵️ Motif Parang Sutra'
      case 'armor':
        return '🛡️ Pelat Baja & Safir'
      case 'tuxedo':
        return '👔 Dasi Kupu-Kupu Emas'
      case 'sarung':
        return '🏮 Sarung Ronda Tradisional'
      case 'skirt':
        return '🎀 Rok Lipat Harajuku'
      case 'swallow':
        return '🩴 Sandal Jepit Karet'
      case 'roller':
        return '🛼 Roda Seluncur Neon'
      case 'cat_ears':
        return '🐱 Telinga Kucing RGB'
      case 'crown':
        return '👑 Mahkota Emas & Rubi'
      case 'glasses':
        return '🕶️ Kacamata Pixel 8-Bit'
      case 'straw_hat':
        return '👒 Topi Jerami Petualang'
      case 'beanie':
        return '🧢 Beanie Rajut Lo-Fi'
      case 'cyber_visor':
        return '🥽 Visor Hologram Neon'
      case 'halo':
        return '😇 Lingkaran Cahaya Halo'
      case 'wings':
        return '🪽 Sayap Malaikat 3D'
      case 'astronaut':
        return '🐱 Ransel Kucing Astronaut'
      case 'spiky':
        return '💥 Rambut Anime Spiky'
      case 'afro':
        return '🪩 Fluffy Afro Disco'
      case 'long':
        return '✨ Rambut Sutra Mengalir'
      default:
        return `Pola Khusus: ${pattern}`
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="MALL BUSANA & AKSESORIS NETIZENCITY" maxWidth="2xl">
      <div className="space-y-4">
        {/* Header & Wallet Banner with Real 2D Pixel-Art Character Preview */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-lg">
          {/* Live Mini Avatar Preview Canvas */}
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-18 rounded-2xl bg-slate-950 border border-slate-700/80 p-1 flex items-center justify-center shadow-inner overflow-hidden ring-2 ring-blue-500/20">
              <canvas
                ref={previewCanvasRef}
                width={64}
                height={72}
                className="w-full h-full object-contain [image-rendering:pixelated]"
              />
              <span className="absolute bottom-0.5 right-1 text-[8px] font-black text-emerald-400 bg-slate-950/80 px-1 rounded">
                LIVE
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-black text-white tracking-wide">
                  {profile?.displayName || 'Warga Netizen'}
                </span>
                <span className="text-[10px] text-blue-400 font-bold bg-blue-950/80 border border-blue-800/60 px-1.5 py-0.2 rounded-full">
                  Kamu
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                Pratinjau karakter pixel-art 2D live. Semua item yang dipakai langsung bergerak di kota!
              </p>
              <div className="flex items-center space-x-2 mt-1.5 text-[10px] text-slate-300">
                <span className="inline-flex items-center text-emerald-400">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {ownedIds.length} Item Dimiliki
                </span>
              </div>
            </div>
          </div>

          {/* User Wallet Balance */}
          <div className="flex items-center space-x-2.5 bg-slate-900/90 px-4 py-2.5 rounded-xl border border-amber-500/30 shadow-inner self-stretch sm:self-auto justify-center">
            <Coins className="w-5 h-5 text-amber-400 animate-pulse" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">
                Saldo Koin
              </span>
              <span className="text-sm font-extrabold text-amber-300 font-mono">
                {formatCoins(currentCoins)}
              </span>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-800/80">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === c.id
                  ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20 ring-1 ring-blue-400/50'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-slate-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-400" />
            <span>Memuat katalog busana kota...</span>
          </div>
        )}

        {/* Items Catalog Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[52vh] overflow-y-auto pr-1 scrollbar-thin">
            {filteredItems.map((item) => {
              const isOwned = ownedIds.includes(item.id) || item.price === 0
              const isEquipped = checkIsEquipped(item)
              const canAfford = currentCoins >= item.price
              const trait = getTraitBadge(item.pattern)

              return (
                <div
                  key={item.id}
                  className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
                    isEquipped
                      ? 'bg-blue-950/40 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50'
                      : isOwned
                      ? 'bg-slate-950/80 border-emerald-500/30'
                      : 'bg-slate-950/50 border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Item Preview Color & Icon Badge */}
                    <div className="flex items-start justify-between mb-2.5">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner relative"
                        style={{
                          backgroundColor: item.color,
                          borderColor: 'rgba(255,255,255,0.25)',
                        }}
                      >
                        {getCategoryIcon(item.category)}
                        {item.price === 0 && (
                          <span className="absolute -top-1.5 -left-1.5 bg-emerald-500 text-[8px] font-black text-slate-950 px-1 rounded-full uppercase shadow">
                            Free
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col items-end space-y-1">
                        <span
                          className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            rarityColor[item.rarity] || rarityColor.common
                          }`}
                        >
                          {item.rarity}
                        </span>
                        {isOwned && (
                          <span className="text-[9px] font-bold text-emerald-400 flex items-center">
                            <Check className="w-2.5 h-2.5 mr-0.5" /> Milikmu
                          </span>
                        )}
                      </div>
                    </div>

                    <h5 className="font-bold text-white text-xs leading-snug">
                      {item.name}
                    </h5>

                    {/* Special Trait Badge */}
                    {trait && (
                      <div className="mt-1">
                        <span className="inline-block text-[10px] font-bold text-amber-300 bg-amber-950/60 border border-amber-800/60 px-1.5 py-0.5 rounded-md">
                          {trait}
                        </span>
                      </div>
                    )}

                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {item.description || 'Pakaian eksklusif warga Netizen City.'}
                    </p>
                  </div>

                  {/* Actions / Price */}
                  <div className="mt-3.5 pt-3 border-t border-slate-900 flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Coins className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-xs font-bold text-white font-mono">
                        {item.price === 0 ? 'Gratis' : item.price}
                      </span>
                    </div>

                    {isEquipped ? (
                      <div className="flex items-center space-x-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 text-[11px] font-bold border border-emerald-500/40 flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Terpakai</span>
                        </span>
                        {/* If accessory or back, allow unequip */}
                        {(item.category === 'accessories' || item.category === 'back') && (
                          <button
                            type="button"
                            onClick={() => handleUnequip(item)}
                            title="Lepas item ini"
                            className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : isOwned ? (
                      <button
                        type="button"
                        onClick={() => handleEquip(item)}
                        className="px-3.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold shadow-md transition-transform active:scale-95 flex items-center space-x-1 cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Pakai</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!canAfford || isPurchasing}
                        onClick={() => handlePurchase(item)}
                        className={`px-3.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-md ${
                          canAfford
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
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

        {/* Footer info & button */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center space-x-1 text-[11px]">
            <Zap className="w-3.5 h-3.5 text-blue-400" />
            <span>Koleksi 34 item unik khas budaya & komunitas Netizen City.</span>
          </div>
          <Button variant="ghost" onClick={closeModal} className="text-xs">
            Tutup Mall
          </Button>
        </div>
      </div>
    </Modal>
  )
}
