// ============================================================
// NETIZENCITY - Mall Modal (Full Persistence & Real-Time Equipping)
// Connects to /api/mall, updates localDb & Avatar renderer live
// Stylized for Cozy Pastel Diorama Aesthetic
// ============================================================

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import {
  ShoppingBag,
  Coins,
  Check,
  Palette,
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

    // 2. Dispatch custom event to 3D diorama so player character immediately changes appearance
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
    { id: 'tops', label: '👕 Atasan' },
    { id: 'accessories', label: '👑 Aksesoris' },
    { id: 'bottoms', label: '👖 Bawahan' },
    { id: 'shoes', label: '👟 Sepatu' },
    { id: 'hairstyles', label: '💇 Rambut' },
    { id: 'back', label: '🪽 Sayap & Ransel' },
  ]

  const rarityColor = {
    common: 'text-[#5C5265] border-[#D9C8B5] bg-[#F4ECE0]',
    uncommon: 'text-[#186D48] border-[#A8DCC8] bg-[#E8F8F0]',
    rare: 'text-[#1D60A6] border-[#A9C8EC] bg-[#EBF4FD]',
    epic: 'text-[#6A3F98] border-[#C9B8E8] bg-[#F3EEFA]',
    legendary: 'text-[#8C6008] border-[#F7D772] bg-[#FFF8DF] ring-1 ring-[#F7D772]',
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
        return <Palette className="w-5 h-5 text-white drop-shadow" />
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
        return '🛵 Rompi Reflektif Ojol'
      case 'cyber':
        return '⚡ Kerah Neon Cyberpunk'
      case 'batik':
        return '🏵️ Motif Batik Parang'
      case 'armor':
        return '🛡️ Pelat Pelindung Safir'
      case 'tuxedo':
        return '👔 Dasi Kupu-Kupu Emas'
      case 'sarung':
        return '🏮 Sarung Ronda Tradisional'
      case 'skirt':
        return '🎀 Rok Lipat Pastel'
      case 'swallow':
        return '🩴 Sandal Jepit Karet'
      case 'roller':
        return '🛼 Roda Seluncur Neon'
      case 'cat_ears':
        return '🐱 Telinga Kucing Gemas'
      case 'crown':
        return '👑 Mahkota Emas & Permata'
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
        return `Pola: ${pattern}`
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="MALL BUSANA & AKSESORIS NETIZENCITY" maxWidth="2xl">
      <div className="space-y-4">
        {/* Header & Wallet Banner with Real 2D Pixel-Art Character Preview */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-[#FFFDF9] via-[#FFF9F1] to-[#FCEEE3] border-2 border-[#EADBCC] shadow-sm">
          {/* Live Mini Avatar Preview Canvas */}
          <div className="flex items-center space-x-3.5">
            <div className="relative w-16 h-18 rounded-2xl bg-[#FFF9F1] border-2 border-[#EADBCC] p-1 flex items-center justify-center shadow-inner overflow-hidden ring-2 ring-[#F4A98C]/30">
              <canvas
                ref={previewCanvasRef}
                width={64}
                height={72}
                className="w-full h-full object-contain [image-rendering:auto]"
              />
              <span className="absolute bottom-0.5 right-1 text-[8px] font-black text-[#1E7250] bg-[#D2F0E3] px-1 rounded-full shadow-xs">
                LIVE
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-extrabold text-[#3B3340] tracking-wide">
                  {profile?.displayName || 'Warga Netizen'}
                </span>
                <span className="text-[10px] text-[#2C6ECB] font-bold bg-[#EBF3FB] border border-[#A9C8EC] px-2 py-0.5 rounded-full">
                  Avatar Kamu
                </span>
              </div>
              <p className="text-[11px] text-[#6F6675] mt-0.5 leading-snug">
                Pakaian yang kamu pakai langsung muncul pada karakter di dalam kota!
              </p>
              <div className="flex items-center space-x-2 mt-1 text-[11px] text-[#5C5265]">
                <span className="inline-flex items-center text-[#186D48] font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  {ownedIds.length} Koleksi Dimiliki
                </span>
              </div>
            </div>
          </div>

          {/* User Wallet Balance */}
          <div className="flex items-center space-x-2.5 bg-[#FFF8DF] px-4 py-2.5 rounded-2xl border-2 border-[#F7D772] shadow-xs self-stretch sm:self-auto justify-center">
            <Coins className="w-5 h-5 text-[#D4980B] animate-pulse" />
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8C6008] block leading-none">
                Saldo Koin
              </span>
              <span className="text-sm font-extrabold text-[#8C6008] font-mono">
                {formatCoins(currentCoins)}
              </span>
            </div>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-thin">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeCategory === c.id
                  ? 'bg-[#F4A98C] text-white shadow-sm border-b-2 border-[#B85838]'
                  : 'bg-[#FFFDF9] hover:bg-[#F8F4EE] text-[#5C5265] border border-[#EADBCC]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center py-12 text-[#6F6675] text-xs">
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#76A9EA]" />
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
                  className={`p-3.5 rounded-2xl border-2 flex flex-col justify-between transition-all ${
                    isEquipped
                      ? 'bg-[#F0F7FF] border-[#76A9EA] shadow-md ring-2 ring-[#A9C8EC]/40'
                      : isOwned
                      ? 'bg-[#FFFDF9] border-[#A8DCC8] shadow-sm'
                      : 'bg-[#FFFDF9] border-[#EADBCC] shadow-sm hover:border-[#D6C2AC] hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Item Preview Color & Icon Badge */}
                    <div className="flex items-start justify-between mb-2.5">
                      <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center border-2 shadow-inner relative"
                        style={{
                          backgroundColor: item.color,
                          borderColor: 'rgba(255,255,255,0.6)',
                        }}
                      >
                        {getCategoryIcon(item.category)}
                        {item.price === 0 && (
                          <span className="absolute -top-1.5 -left-1.5 bg-[#4EBA88] text-[8px] font-black text-white px-1.5 py-0.2 rounded-full uppercase shadow">
                            Gratis
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
                          <span className="text-[10px] font-bold text-[#186D48] flex items-center">
                            <Check className="w-3 h-3 mr-0.5" /> Milikmu
                          </span>
                        )}
                      </div>
                    </div>

                    <h5 className="font-extrabold text-[#3B3340] text-xs leading-snug">
                      {item.name}
                    </h5>

                    {/* Special Trait Badge */}
                    {trait && (
                      <div className="mt-1">
                        <span className="inline-block text-[10px] font-bold text-[#8C6008] bg-[#FFF8DF] border border-[#F7D772] px-2 py-0.5 rounded-md">
                          {trait}
                        </span>
                      </div>
                    )}

                    <p className="text-[11px] text-[#6F6675] mt-1 line-clamp-2 leading-relaxed">
                      {item.description || 'Pakaian eksklusif warga Netizen City.'}
                    </p>
                  </div>

                  {/* Actions / Price */}
                  <div className="mt-3.5 pt-3 border-t border-[#F0EAE1] flex items-center justify-between">
                    <div className="flex items-center space-x-1.5 bg-[#FFF9F1] px-2.5 py-1 rounded-xl border border-[#EADBCC]">
                      <Coins className="w-3.5 h-3.5 text-[#D4980B]" />
                      <span className="text-xs font-black text-[#8C6008] font-mono">
                        {item.price === 0 ? 'Gratis' : item.price}
                      </span>
                    </div>

                    {isEquipped ? (
                      <div className="flex items-center space-x-1.5">
                        <span className="px-3 py-1 rounded-xl bg-[#E8F8F0] text-[#186D48] text-[11px] font-black border border-[#A8DCC8] flex items-center space-x-1">
                          <Check className="w-3.5 h-3.5" />
                          <span>Terpakai</span>
                        </span>
                        {/* If accessory or back, allow unequip */}
                        {(item.category === 'accessories' || item.category === 'back') && (
                          <button
                            type="button"
                            onClick={() => handleUnequip(item)}
                            title="Lepas item ini"
                            className="p-1 rounded-lg bg-[#F8F4EE] hover:bg-[#EFE6D8] text-[#5C5265] border border-[#EADBCC] transition-colors cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ) : isOwned ? (
                      <button
                        type="button"
                        onClick={() => handleEquip(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#76A9EA] hover:bg-[#6297DC] text-white text-[11px] font-bold border-b-3 border-[#4A7BB8] active:border-b-0 active:translate-y-0.5 shadow-sm transition-transform flex items-center space-x-1 cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Pakai</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!canAfford || isPurchasing}
                        onClick={() => handlePurchase(item)}
                        className={`px-3.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center space-x-1 cursor-pointer shadow-sm ${
                          canAfford
                            ? 'bg-[#4EBA88] hover:bg-[#3FA675] text-white border-b-3 border-[#2E7F59] active:border-b-0 active:translate-y-0.5'
                            : 'bg-[#F0EAE1] text-[#A89E92] border border-[#E0D5C7] cursor-not-allowed'
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
        <div className="flex items-center justify-between pt-3 border-t border-[#EADBCC] text-xs text-[#6F6675]">
          <div className="flex items-center space-x-1 text-[11px]">
            <Zap className="w-3.5 h-3.5 text-[#F4A98C]" />
            <span>Koleksi 34 item unik busana khas warga Netizen City.</span>
          </div>
          <Button variant="ghost" onClick={closeModal} className="text-xs">
            Tutup Mall
          </Button>
        </div>
      </div>
    </Modal>
  )
}
