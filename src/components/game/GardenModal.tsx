// ============================================================
// NETIZENCITY - Kebun Netizen 3D (Virtual 3D Garden)
// Penuh Interaktif: Tanam Bibit, Siram Air, Pupuk & Panen Koin
// ============================================================

'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Sprout,
  Droplets,
  Sparkles,
  Coins,
  RefreshCw,
  Trophy,
  CheckCircle2,
  Info,
  ChevronRight,
  PackageCheck,
  Flame,
  ArrowRight,
  Check,
  AlertCircle,
  X,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import Garden3DView from './Garden3DView'
import {
  GARDEN_SEEDS,
  MAX_DAILY_WATERS,
  WATER_REFILL_PRICE,
  type GardenSeedDefinition,
  type GardenState,
} from '@/types/garden'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'

interface GardenModalProps {
  isOpen: boolean
  onClose: () => void
}

const STAGE_NAMES = [
  'Bibit di Tanah Humus',
  'Tunas Muda Bersemi',
  'Pohon Muda Rimbun',
  'Pohon Kuncup Bunga',
  'Pohon Matang Berbuah (Siap Panen!)',
]

const STAGE_BADGES = ['🌱 Tahap 1/5', '🌿 Tahap 2/5', '🌳 Tahap 3/5', '🌸 Tahap 4/5', '🎉 Tahap 5/5']

export default function GardenModal({ isOpen, onClose }: GardenModalProps) {
  const [garden, setGarden] = useState<GardenState | null>(null)
  const [seeds, setSeeds] = useState<Record<string, GardenSeedDefinition>>(GARDEN_SEEDS)
  const [isLoading, setIsLoading] = useState(false)
  const [isWatering, setIsWatering] = useState(false)
  const [isFertilizing, setIsFertilizing] = useState(false)
  const [isHarvesting, setIsHarvesting] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [harvestSuccessData, setHarvestSuccessData] = useState<{
    coins: number
    item?: any
    message: string
  } | null>(null)
  const [showSeedPicker, setShowSeedPicker] = useState(false)

  // Fetch garden status
  const fetchGarden = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/garden')
      if (res.ok) {
        const data = await res.json()
        if (data.garden) {
          setGarden(data.garden)
        }
        if (data.seeds) {
          setSeeds(data.seeds)
        }
      }
    } catch (e) {
      console.error('Failed to load garden:', e)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchGarden()
      setHarvestSuccessData(null)
    }
  }, [isOpen, fetchGarden])

  // Show temporary toast message
  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 3200)
  }

  // Active seed definition
  const currentSeed = useMemo(() => {
    if (!garden) return GARDEN_SEEDS.coin_tree
    return seeds[garden.seed_id] || GARDEN_SEEDS.coin_tree
  }, [garden, seeds])

  // Daily water calculations
  const dailyWatersCount = garden?.daily_waters_count || 0
  const dailyWatersLeft = Math.max(0, MAX_DAILY_WATERS - dailyWatersCount)
  const isDailyLimitReached = dailyWatersLeft <= 0

  // Action: Siram Tanaman
  const handleWater = async () => {
    if (isWatering || isFertilizing || isHarvesting || !garden) return

    if (isDailyLimitReached) {
      showToast(`⚠️ Batas siram hari ini sudah tercapai (${MAX_DAILY_WATERS}/${MAX_DAILY_WATERS} kali). Pohon butuh istirahat menyerap tanah. Siram lagi besok!`)
      return
    }

    if (garden.water_level < (currentSeed.waterPerStep || 10)) {
      showToast(`⚠️ Air gembor habis! Beli reset air sumur (${WATER_REFILL_PRICE} Koin) di bawah.`)
      return
    }

    setIsWatering(true)
    try {
      const res = await fetch('/api/garden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'water' }),
      })
      const data = await res.json()
      if (data.success && data.garden) {
        setGarden(data.garden)
        const sisa = Math.max(0, MAX_DAILY_WATERS - (data.garden.daily_waters_count || 0))
        if (data.isHarvestReady) {
          showToast('🌟 Luar biasa! Tanamanmu kini siap dipanen!')
        } else if (data.isStageUp) {
          showToast(`🌱 Hore! Tanaman berkembang ke Tahap ${data.garden.stage}! (Sisa siram: ${sisa}x)`)
        } else {
          showToast(`💧 Tanaman segar disiram! (+${data.addedProgress}% Pertumbuhan) [Sisa siram: ${sisa}x]`)
        }
      } else {
        showToast(data.error || 'Gagal menyiram tanaman')
      }
    } catch (err) {
      console.error('Water error:', err)
      showToast('Gagal menghubungi sumur kota')
    }
  }

  // Action: Beri Pupuk Organik
  const handleFertilize = async () => {
    if (isWatering || isFertilizing || isHarvesting || !garden) return
    if (garden.fertilizer_count <= 0) {
      showToast('⚠️ Pupuk organik habis! Selesaikan panen untuk dapat pupuk gratis.')
      return
    }

    setIsFertilizing(true)
    try {
      const res = await fetch('/api/garden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'fertilize' }),
      })
      const data = await res.json()
      if (data.success && data.garden) {
        setGarden(data.garden)
        if (data.isHarvestReady) {
          showToast('🌟 Keajaiban pupuk! Tanaman langsung matang siap panen!')
        } else if (data.isStageUp) {
          showToast(`✨ Pupuk mujarab! Tunas melonjak ke Tahap ${data.garden.stage}!`)
        } else {
          showToast(`✨ Pupuk ditabur! Pertumbuhan melonjak (+${data.addedProgress}%)`)
        }
      } else {
        showToast(data.error || 'Gagal memberi pupuk')
      }
    } catch (err) {
      console.error('Fertilize error:', err)
      showToast('Gagal menabur pupuk')
    }
  }

  // Action: Reset Air Sumur Kota (200 Koin)
  const handleRefillWater = async () => {
    if (!garden) return
    if (garden.water_level >= 100) {
      showToast('💧 Air gembor masih penuh (100/100). Belum perlu diisi ulang!')
      return
    }

    const currentBalance = useCitizenStore.getState().wallet?.balance ?? 0
    if (currentBalance < WATER_REFILL_PRICE) {
      showToast(`⚠️ Saldo koin tidak cukup untuk reset air (butuh ${WATER_REFILL_PRICE} Koin, saldomu: ${currentBalance} Koin).`)
      return
    }

    try {
      const res = await fetch('/api/garden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refill_water' }),
      })
      const data = await res.json()
      if (data.success && data.garden) {
        if (typeof data.newBalance === 'number') {
          useCitizenStore.getState().updateBalance(data.newBalance)
        }
        setGarden(data.garden)
        showToast(`💧 Gembor air berhasil direset penuh (100L)! -${WATER_REFILL_PRICE} Koin Warga.`)
      } else {
        showToast(data.error || 'Gagal mengisi air sumur')
      }
    } catch (err) {
      console.error('Refill error:', err)
      showToast('Gagal mengisi air sumur')
    }
  }

  // Action: Panen Hasil Tanaman
  const handleHarvest = async () => {
    if (isHarvesting || !garden) return
    if (garden.stage < 5) {
      showToast('Tanaman belum matang sempurna untuk dipanen.')
      return
    }

    setIsHarvesting(true)
    try {
      const res = await fetch('/api/garden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'harvest' }),
      })
      const data = await res.json()
      if (data.success && data.garden) {
        // Sync local wallet store with new balance so HUD updates immediately
        if (typeof data.newBalance === 'number') {
          useCitizenStore.getState().updateBalance(data.newBalance)
        }

        setGarden(data.garden)
        setHarvestSuccessData({
          coins: data.rewardCoins,
          item: data.rewardItem,
          message: `Selamat! Kamu berhasil memanen ${currentSeed.name}!`,
        })
        showToast(`🎉 Berhasil memanen! +${data.rewardCoins} Koin masuk dompetmu!`)
      } else {
        showToast(data.error || 'Gagal memanen tanaman')
      }
    } catch (err) {
      console.error('Harvest error:', err)
      showToast('Gagal melakukan panen')
    } finally {
      setTimeout(() => {
        setIsHarvesting(false)
      }, 2500)
    }
  }

  // Action: Pilih & Tanam Bibit Baru
  const handleSelectSeed = async (seedId: string) => {
    try {
      const res = await fetch('/api/garden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'plant', seedId }),
      })
      const data = await res.json()
      if (data.success && data.garden) {
        setGarden(data.garden)
        setShowSeedPicker(false)
        showToast(`🌱 Bibit "${seeds[seedId]?.name}" berhasil ditanam di pot!`)
      } else {
        showToast(data.error || 'Gagal mengganti bibit')
      }
    } catch (err) {
      console.error('Plant error:', err)
      showToast('Gagal menanam bibit')
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kebun Netizen 3D"
      maxWidth="lg"
    >
      <div className="space-y-3.5 font-sans text-[#343B35]">
        {/* Header Ribbon & Stage Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-[#EFE9D8] border border-[#D8CEBE] rounded-2xl p-2.5 sm:p-3 shadow-inner">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-xs">
              🌱
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-heading font-black text-xs sm:text-sm text-[#343B35]">
                  {currentSeed.name}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {STAGE_BADGES[(garden?.stage || 1) - 1]}
                </span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide bg-blue-100 text-blue-800 border border-blue-300">
                  <Droplets className="w-2.5 h-2.5 fill-blue-600 text-blue-600" />
                  <span>Siram: {dailyWatersCount}/{MAX_DAILY_WATERS}</span>
                </span>
              </div>
              <p className="text-[11px] text-[#78634B] font-medium leading-tight mt-0.5">
                {STAGE_NAMES[(garden?.stage || 1) - 1]}
              </p>
            </div>
          </div>

          {/* Seed switch button */}
          <button
            type="button"
            onClick={() => setShowSeedPicker(true)}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-[#FFFDF9] hover:bg-[#F7F4E9] border border-[#D8CEBE] text-xs font-bold text-[#343B35] transition-colors shadow-2xs cursor-pointer"
          >
            <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            <span>Pilih Bibit</span>
            <ChevronRight className="w-3.5 h-3.5 text-[#78634B]" />
          </button>
        </div>

        {/* 3D Viewport Diorama Container */}
        <div className="relative rounded-2xl overflow-hidden border-2 border-[#D8CEBE] shadow-md bg-gradient-to-b from-[#87CEEB]/20 via-[#FFFDF9] to-[#EAE4D3]">
          <Garden3DView
            stage={garden?.stage || 1}
            seedId={garden?.seed_id || 'coin_tree'}
            seedDef={currentSeed}
            isWatering={isWatering}
            isFertilizing={isFertilizing}
            isHarvesting={isHarvesting}
            onWaterAnimationComplete={() => setIsWatering(false)}
            onFertilizeAnimationComplete={() => setIsFertilizing(false)}
          />

          {/* Toast Notification Banner */}
          {toastMessage && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3.5 py-1.5 rounded-full bg-[#343B35]/90 backdrop-blur-md text-white text-xs font-bold shadow-lg border border-white/20 animate-fade-in flex items-center space-x-1.5">
              <span>{toastMessage}</span>
            </div>
          )}

          {/* Harvest Celebration Overlay */}
          {harvestSuccessData && (
            <div className="absolute inset-0 z-30 bg-[#343B35]/75 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center text-white animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-amber-400 text-amber-950 flex items-center justify-center text-3xl shadow-xl animate-bounce mb-2">
                🎉
              </div>
              <h3 className="text-lg font-heading font-black text-amber-300 drop-shadow-md">
                Panen Melimpah Sukses!
              </h3>
              <p className="text-xs text-white/90 max-w-xs mt-1 font-medium">
                {harvestSuccessData.message}
              </p>

              <div className="flex items-center space-x-3 my-3 p-3 rounded-2xl bg-white/10 border border-white/20">
                <div className="flex items-center space-x-1.5 text-amber-300 font-black text-sm">
                  <Coins className="w-4 h-4 fill-amber-300 text-amber-400" />
                  <span>+{harvestSuccessData.coins} Koin</span>
                </div>
                {harvestSuccessData.item && (
                  <div className="flex items-center space-x-1.5 text-emerald-300 font-black text-sm border-l border-white/20 pl-3">
                    <span className="text-base">{harvestSuccessData.item.icon}</span>
                    <span>{harvestSuccessData.item.name}</span>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-white/70 mb-3">
                Saldo dompet otomatis bertambah & bibit baru siap ditanam kembali!
              </p>

              <Button
                variant="primary"
                onClick={() => setHarvestSuccessData(null)}
                className="bg-emerald-600 hover:bg-emerald-500 font-black text-xs px-6 py-2 rounded-xl shadow-lg cursor-pointer"
              >
                Lanjutkan Berkebun ✓
              </Button>
            </div>
          )}
        </div>

        {/* Growth Progress Bar */}
        <div className="bg-[#FFFDF9] border border-[#D8CEBE] rounded-2xl p-3 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-heading font-bold text-[#343B35] flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Progres Pertumbuhan</span>
            </span>
            <span className="font-mono font-black text-[#668B65]">
              {(garden?.stage || 1) >= 5 ? '100% (Siap Dipetik!)' : `${garden?.progress || 0}%`}
            </span>
          </div>

          {/* Multi-step progress bar */}
          <div className="relative w-full h-3 rounded-full bg-[#E5DEC9] overflow-hidden p-0.5 border border-[#D8CEBE]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 transition-all duration-700 ease-out shadow-xs"
              style={{
                width: `${
                  (garden?.stage || 1) >= 5
                    ? 100
                    : Math.min(100, (((garden?.stage || 1) - 1) * 20) + ((garden?.progress || 0) * 0.2))
                }%`,
              }}
            />
          </div>

          {/* 5 Step markers */}
          <div className="grid grid-cols-5 text-center text-[10px] text-[#78634B] font-bold pt-0.5">
            {[1, 2, 3, 4, 5].map((st) => {
              const currentSt = garden?.stage || 1
              const isPassed = currentSt >= st
              const isCurrent = currentSt === st
              return (
                <div key={st} className="flex flex-col items-center">
                  <div
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black transition-all ${
                      isCurrent
                        ? 'bg-emerald-600 text-white ring-2 ring-emerald-300 scale-110'
                        : isPassed
                        ? 'bg-emerald-500 text-white'
                        : 'bg-[#D8CEBE] text-[#78634B]'
                    }`}
                  >
                    {isPassed ? '✓' : st}
                  </div>
                  <span className={`mt-0.5 text-[9px] ${isCurrent ? 'text-emerald-800 font-black' : ''}`}>
                    {st === 5 ? 'Panen' : `T${st}`}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Resources & Status Bar */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          {/* Water Tank */}
          <div className="p-2.5 rounded-2xl bg-[#FFFDF9] border border-[#D8CEBE] shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#78634B] flex items-center space-x-1">
                <Droplets className="w-3.5 h-3.5 text-blue-500 fill-blue-400" />
                <span>Air Gembor</span>
              </span>
              <span className="font-mono font-black text-[#343B35] text-[11px]">
                {garden?.water_level || 0}/100
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-blue-100 overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, garden?.water_level || 0)}%` }}
              />
            </div>
            <button
              type="button"
              onClick={handleRefillWater}
              disabled={(garden?.water_level || 0) >= 100}
              className="w-full mt-1 px-1.5 py-1 rounded-xl bg-blue-50 hover:bg-blue-100 disabled:opacity-40 border border-blue-200 text-[10px] font-black text-blue-800 transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              title={`Isi ulang gembor ke 100 air seharga ${WATER_REFILL_PRICE} Koin`}
            >
              <RefreshCw className="w-2.5 h-2.5 shrink-0" />
              <span>Reset Air ({WATER_REFILL_PRICE} Koin)</span>
            </button>
          </div>

          {/* Organic Fertilizer */}
          <div className="p-2.5 rounded-2xl bg-[#FFFDF9] border border-[#D8CEBE] shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#78634B] flex items-center space-x-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Pupuk Organik</span>
              </span>
              <span className="font-mono font-black text-[#343B35] text-[11px]">
                {garden?.fertilizer_count || 0} Sak
              </span>
            </div>
            <p className="text-[10px] text-[#78634B] leading-tight">
              +30% percepat tunas pohon
            </p>
          </div>

          {/* Harvest Stats */}
          <div className="p-2.5 rounded-2xl bg-[#FFFDF9] border border-[#D8CEBE] shadow-2xs space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#78634B] flex items-center space-x-1">
                <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                <span>Total Panen</span>
              </span>
              <span className="font-mono font-black text-[#343B35] text-[11px]">
                {garden?.total_harvested || 0}x
              </span>
            </div>
            <p className="text-[10px] text-[#78634B] leading-tight">
              Hadiah {currentSeed.rewardCoins} koin/panen
            </p>
          </div>
        </div>

        {/* Primary Action Controls */}
        <div className="pt-1">
          {(garden?.stage || 1) >= 5 ? (
            /* Big Glowing Harvest Button */
            <button
              type="button"
              onClick={handleHarvest}
              disabled={isHarvesting}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-amber-950 font-heading font-black text-sm sm:text-base shadow-lg shadow-amber-500/30 border-2 border-amber-300 transition-all transform active:scale-98 flex items-center justify-center space-x-2 animate-pulse cursor-pointer"
            >
              <Coins className="w-5 h-5 fill-amber-950 text-amber-950" />
              <span>
                {isHarvesting
                  ? 'Sedang Memetik Hasil...'
                  : `PANEN SEKARANG (+${currentSeed.rewardCoins} KOIN WARGA)!`}
              </span>
            </button>
          ) : (
            /* Watering and Fertilizing Action Grid */
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2.5">
                {/* Button: Siram Air */}
                <button
                  type="button"
                  onClick={handleWater}
                  disabled={isWatering || isFertilizing || isDailyLimitReached || (garden?.water_level || 0) < 10}
                  className={`py-3 px-3 rounded-2xl active:translate-y-0.5 disabled:opacity-50 text-white font-heading font-black text-xs sm:text-sm shadow-md border transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
                    isDailyLimitReached
                      ? 'bg-slate-400 border-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500 border-blue-400'
                  }`}
                >
                  <Droplets className="w-4 h-4 fill-white" />
                  <span>
                    {isWatering
                      ? 'Menyiram...'
                      : isDailyLimitReached
                      ? `Batas Siram Habis (${MAX_DAILY_WATERS}/${MAX_DAILY_WATERS})`
                      : `💧 Siram Air (-10) [Sisa: ${dailyWatersLeft}x]`}
                  </span>
                </button>

                {/* Button: Beri Pupuk */}
                <button
                  type="button"
                  onClick={handleFertilize}
                  disabled={isWatering || isFertilizing || (garden?.fertilizer_count || 0) <= 0}
                  className="py-3 px-3 rounded-2xl bg-gradient-to-b from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:translate-y-0.5 disabled:opacity-50 text-white font-heading font-black text-xs sm:text-sm shadow-md border border-emerald-400 transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>
                    {isFertilizing
                      ? 'Menabur...'
                      : `✨ Beri Pupuk (${garden?.fertilizer_count || 0})`}
                  </span>
                </button>
              </div>

              {/* Daily Limit Info Banner */}
              {isDailyLimitReached && (
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    Batas siram {MAX_DAILY_WATERS}x hari ini sudah tercapai. Pohon butuh istirahat menyerap tanah. Silakan siram kembali besok ya!
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal: Seed Catalog Picker Drawer */}
        {showSeedPicker && (
          <div className="fixed inset-0 z-50 bg-[#343B35]/70 backdrop-blur-xs flex items-center justify-center p-3 animate-fade-in">
            <div className="w-full max-w-md bg-[#FFFDF9] rounded-3xl border-2 border-[#D8CEBE] p-4 shadow-2xl space-y-3 font-sans max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-[#D8CEBE]">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-lg">
                    🌱
                  </div>
                  <div>
                    <h4 className="font-heading font-black text-sm text-[#343B35]">
                      Katalog Bibit Unggul Kota
                    </h4>
                    <p className="text-[11px] text-[#78634B]">
                      Pilih tanaman yang ingin kamu kembangkan di petak kebunmu
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSeedPicker(false)}
                  className="p-1 rounded-full text-[#78634B] hover:bg-[#EFE9D8] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Seed Options */}
              <div className="space-y-2">
                {Object.values(seeds).map((seed) => {
                  const isSelected = garden?.seed_id === seed.id
                  return (
                    <div
                      key={seed.id}
                      onClick={() => handleSelectSeed(seed.id)}
                      className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between space-x-2.5 ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/70 shadow-xs'
                          : 'border-[#D8CEBE] bg-[#F7F4E9] hover:bg-[#EFE9D8]'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shadow-xs shrink-0"
                          style={{ backgroundColor: `${seed.color}25`, borderColor: seed.color }}
                        >
                          {seed.id === 'coin_tree' && '🌾'}
                          {seed.id === 'apple_tree' && '🍎'}
                          {seed.id === 'orchid' && '🌸'}
                          {seed.id === 'golden_tree' && '👑'}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center space-x-1.5">
                            <h5 className="font-heading font-black text-xs text-[#343B35]">
                              {seed.name}
                            </h5>
                            {isSelected && (
                              <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[9px] font-black">
                                Aktif
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#78634B] line-clamp-1">{seed.description}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold text-amber-600">
                              <Coins className="w-3 h-3" />
                              <span>+{seed.rewardCoins} Koin</span>
                            </span>
                            {seed.rewardItem && (
                              <span className="text-[10px] text-emerald-700 font-bold">
                                • Bonus: {seed.rewardItem.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <span className="px-2.5 py-1 rounded-xl bg-white border border-[#D8CEBE] text-[10px] font-bold text-[#343B35]">
                            Tanam
                          </span>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="pt-1 flex justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setShowSeedPicker(false)}
                  className="text-xs font-bold"
                >
                  Tutup
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Footer info note */}
        <div className="flex items-center justify-between text-[11px] text-[#78634B] pt-1 border-t border-[#D8CEBE]">
          <span className="flex items-center space-x-1">
            <Info className="w-3 h-3 text-emerald-600 shrink-0" />
            <span>Air sumur kota pulih berkala. Panen tanaman untuk koin & pupuk gratis!</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-[#343B35] hover:underline cursor-pointer"
          >
            Tutup Kebun
          </button>
        </div>
      </div>
    </Modal>
  )
}
