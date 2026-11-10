// ============================================================
// NETIZENCITY - Mall Modal (Full Persistence & Real-Time Equipping)
// Connects to /api/mall, updates localDb & Avatar renderer live
// Stylized for Cozy Pastel Diorama Aesthetic
// ============================================================

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
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
  UserPlus,
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

  const currentCoins = wallet?.balance ?? 0

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
    mythic: 'text-[#991B1B] border-[#FCA5A5] bg-[#FEF2F2] ring-1 ring-[#F87171]',
    immortal: 'text-[#831843] border-[#F472B6] bg-gradient-to-r from-pink-100 to-purple-100 ring-2 ring-[#EC4899]',
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
    <Modal isOpen={isOpen} onClose={closeModal} title="Mall Busana & Aksesoris" maxWidth="2xl">
      <div className="space-y-3.5">
        {/* Header & Wallet Banner with Real Character Preview */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-[#EFE9D8] border border-[#D8CEBE]">
          {/* Live Mini Avatar Preview Canvas */}
          <div className="flex items-center space-x-3">
            <div className="relative w-14 h-16 rounded-xl bg-[#F7F4E9] border border-[#D8CEBE] p-1 flex items-center justify-center overflow-hidden">
              <canvas
                ref={previewCanvasRef}
                width={64}
                height={72}
                className="w-full h-full object-contain"
              />
              <span className="absolute bottom-0.5 right-1 text-[8px] font-bold text-[#668B65] bg-[#EFE9D8] px-1 rounded-sm border border-[#D8CEBE]">
                LIVE
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#343B35]">
                  {profile?.displayName || 'Tamu Netizen'}
                </span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                  profile
                    ? 'text-[#668B65] bg-[#F7F4E9] border-[#D8CEBE]'
                    : 'text-[#78634B] bg-[#F7F4E9] border-[#D8CEBE]'
                }`}>
                  {profile ? 'Warga' : 'Tamu'}
                </span>
              </div>
              <p className="text-[11px] text-[#78634B] mt-0.5 leading-snug">
                Pakaian yang kamu pakai langsung muncul pada karakter di dalam kota!
              </p>
              <div className="flex items-center space-x-2 mt-0.5 text-[11px]">
                <span className="inline-flex items-center text-[#668B65] font-semibold">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {ownedIds.length} Dimiliki
                </span>
              </div>
            </div>
          </div>

          {/* User Wallet Balance */}
          <div className="flex items-center space-x-2 bg-[#F7F4E9] px-3.5 py-2 rounded-xl border border-[#D8CEBE] self-stretch sm:self-auto justify-center">
            <Coins className="w-4 h-4 text-[#E6C66F]" />
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#78634B] block leading-none">
                Saldo Koin
              </span>
              <span className="text-xs font-bold text-[#343B35]">
                {formatCoins(currentCoins)}
              </span>
            </div>
          </div>
        </div>

        {/* Guest Warning */}
        {!profile && (
          <div className="p-3 rounded-xl bg-[#EFE9D8] border border-[#D8CEBE] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4 text-[#78634B] flex-shrink-0" />
              <span className="text-[#343B35]">
                Kamu sedang berkunjung sebagai Tamu. Daftar warga agar pakaian & koin tersimpan.
              </span>
            </div>
            <Link
              href="/welcome"
              className="px-3 py-1.5 rounded-lg bg-[#668B65] text-white font-semibold text-xs hover:bg-[#557754] transition-colors whitespace-nowrap"
            >
              Daftar Warga
            </Link>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="flex space-x-1.5 overflow-x-auto pb-1">
          {categories.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setActiveCategory(c.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                activeCategory === c.id
                  ? 'bg-[#668B65] text-white border border-[#557754]'
                  : 'bg-[#EFE9D8] hover:bg-[#E2DACB] text-[#343B35] border border-[#D8CEBE]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex items-center justify-center py-10 text-[#78634B] text-xs">
            <Loader2 className="w-4 h-4 animate-spin mr-2 text-[#668B65]" />
            <span>Memuat busana...</span>
          </div>
        )}

        {/* Items Catalog Grid */}
        {!isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[50vh] overflow-y-auto pr-1">
            {filteredItems.map((item) => {
              const isOwned = ownedIds.includes(item.id) || item.price === 0
              const isEquipped = checkIsEquipped(item)
              const canAfford = currentCoins >= item.price
              const trait = getTraitBadge(item.pattern)

              return (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border flex flex-col justify-between transition-all ${
                    isEquipped
                      ? 'bg-[#F7F4E9] border-2 border-[#668B65] shadow-xs'
                      : isOwned
                      ? 'bg-[#F7F4E9] border-[#D8CEBE]'
                      : 'bg-[#EFE9D8] border-[#D8CEBE]'
                  }`}
                >
                  <div>
                    {/* Item Preview Color & Icon Badge */}
                    <div className="flex items-start justify-between mb-2">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center border shadow-xs relative"
                        style={{
                          backgroundColor: item.color,
                          borderColor: '#D8CEBE',
                        }}
                      >
                        {getCategoryIcon(item.category)}
                        {item.price === 0 && (
                          <span className="absolute -top-1.5 -left-1.5 bg-[#668B65] text-[8px] font-bold text-white px-1.5 py-0.2 rounded-full uppercase">
                            Gratis
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col items-end space-y-0.5">
                        <span className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded bg-[#F7F4E9] text-[#78634B] border border-[#D8CEBE]">
                          {item.rarity}
                        </span>
                        {isOwned && (
                          <span className="text-[10px] font-medium text-[#668B65] flex items-center">
                            <Check className="w-3 h-3 mr-0.5" /> Milikmu
                          </span>
                        )}
                      </div>
                    </div>

                    <h5 className="font-bold text-[#343B35] text-xs leading-snug">
                      {item.name}
                    </h5>

                    {/* Special Trait Badge */}
                    {trait && (
                      <div className="mt-1">
                        <span className="inline-block text-[10px] text-[#78634B] bg-[#F7F4E9] border border-[#D8CEBE] px-1.5 py-0.5 rounded">
                          {trait}
                        </span>
                      </div>
                    )}

                    <p className="text-[11px] text-[#78634B] mt-1 line-clamp-2 leading-relaxed">
                      {item.description || 'Pakaian eksklusif warga Netizen City.'}
                    </p>
                  </div>

                  {/* Actions / Price */}
                  <div className="mt-2.5 pt-2.5 border-t border-[#D8CEBE] flex items-center justify-between">
                    <div className="flex items-center space-x-1 bg-[#F7F4E9] px-2 py-0.5 rounded-lg border border-[#D8CEBE]">
                      <Coins className="w-3 h-3 text-[#E6C66F]" />
                      <span className="text-xs font-bold text-[#343B35]">
                        {item.price === 0 ? 'Gratis' : item.price}
                      </span>
                    </div>

                    {isEquipped ? (
                      <div className="flex items-center space-x-1.5">
                        <span className="px-2.5 py-1 rounded-lg bg-[#668B65]/15 text-[#668B65] text-[11px] font-semibold border border-[#668B65]/30 flex items-center space-x-1">
                          <Check className="w-3 h-3" />
                          <span>Terpakai</span>
                        </span>
                        {(item.category === 'accessories' || item.category === 'back') && (
                          <button
                            type="button"
                            onClick={() => handleUnequip(item)}
                            title="Lepas item ini"
                            className="p-1 rounded-md bg-[#F7F4E9] hover:bg-[#E2DACB] text-[#78634B] border border-[#D8CEBE] transition-colors cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    ) : isOwned ? (
                      <button
                        type="button"
                        onClick={() => handleEquip(item)}
                        className="px-3 py-1 rounded-lg bg-[#78634B] hover:bg-[#64513B] text-white text-[11px] font-semibold border border-[#584632] transition-colors flex items-center space-x-1 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Pakai</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={!canAfford || isPurchasing}
                        onClick={() => handlePurchase(item)}
                        className={`px-3 py-1 rounded-lg text-[11px] font-semibold transition-colors flex items-center space-x-1 cursor-pointer ${
                          canAfford
                            ? 'bg-[#668B65] hover:bg-[#557754] text-white border border-[#557754]'
                            : 'bg-[#D8CEBE] text-[#78634B] cursor-not-allowed opacity-60'
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
        <div className="flex items-center justify-between pt-2.5 border-t border-[#D8CEBE] text-xs text-[#78634B]">
          <div className="flex items-center space-x-1 text-[11px]">
            <Zap className="w-3 h-3 text-[#668B65]" />
            <span>Koleksi 34 item unik busana khas warga Netizen City.</span>
          </div>
          <Button variant="secondary" onClick={closeModal} className="text-xs">
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  )
}
