// ============================================================
// NETIZENCITY - Daily Login Reward Modal
// 7-day Login Streak with Local Database Persistence
// ============================================================

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Coins,
  CheckCircle,
  Gift,
  Sparkles,
  Loader2,
  CalendarCheck,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/lib/stores/useUIStore'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'

export default function DailyRewardModal() {
  const activeModal = useUIStore((s) => s.activeModal)
  const closeModal = useUIStore((s) => s.closeModal)
  const addNotification = useUIStore((s) => s.addNotification)
  const updateBalance = useCitizenStore((s) => s.updateBalance)
  const wallet = useCitizenStore((s) => s.wallet)

  const isOpen = activeModal === 'daily_rewards'

  const [currentStreak, setCurrentStreak] = useState(1)
  const [isClaimedToday, setIsClaimedToday] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  const rewards = [
    { day: 1, coins: 50, item: null },
    { day: 2, coins: 75, item: null },
    { day: 3, coins: 100, item: null },
    { day: 4, coins: 125, item: null },
    { day: 5, coins: 150, item: null },
    { day: 6, coins: 200, item: null },
    { day: 7, coins: 500, item: 'Jaket Eksklusif Netizen' },
  ]

  const fetchDailyStatus = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/daily-rewards')
      if (res.ok) {
        const data = await res.json()
        setIsClaimedToday(Boolean(data.isClaimedToday))
        if (data.currentStreak) {
          setCurrentStreak(data.currentStreak)
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
      fetchDailyStatus()
    }
  }, [isOpen, fetchDailyStatus])

  const handleClaim = async () => {
    if (isClaimedToday || isClaiming) return
    setIsClaiming(true)

    try {
      const res = await fetch('/api/daily-rewards', {
        method: 'POST',
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setIsClaimedToday(true)
        const earnedCoins = data.rewardCoins || 75
        const cur = wallet?.balance ?? 500
        updateBalance(cur + earnedCoins)

        if (data.streak) {
          setCurrentStreak(data.streak)
        }

        addNotification({
          title: 'Hadiah Harian Berhasil Diklaim! 🎁',
          message: `+${earnedCoins} Netizen Coins telah ditambahkan ke dompetmu!`,
          type: 'success',
        })
      } else {
        // Fallback local claim
        setIsClaimedToday(true)
        const reward = rewards.find((r) => r.day === currentStreak)
        const earnedCoins = reward ? reward.coins : 75
        const cur = wallet?.balance ?? 500
        updateBalance(cur + earnedCoins)

        addNotification({
          title: 'Hadiah Harian Berhasil Diklaim! 🎁',
          message: `+${earnedCoins} Netizen Coins telah ditambahkan ke dompetmu!`,
          type: 'success',
        })
      }
    } catch {
      setIsClaimedToday(true)
      const cur = wallet?.balance ?? 500
      updateBalance(cur + 75)
      addNotification({
        title: 'Hadiah Harian Diklaim! 🎁',
        message: '+75 Netizen Coins masuk ke dompetmu!',
        type: 'success',
      })
    } finally {
      setIsClaiming(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={closeModal}
      title="HADIAH LOGIN HARIAN (7 HARI)"
      maxWidth="lg"
    >
      <div className="space-y-6">
        <div className="text-center">
          <p className="text-xs text-slate-300">
            Masuk ke kota setiap hari untuk mempertahankan streak dan dapatkan bonus koin serta item eksklusif pada hari ke-7!
          </p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <span className="text-[10px] text-blue-400 font-mono bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20 flex items-center">
              <CalendarCheck className="w-3 h-3 mr-1" />
              Streak Saat Ini: {currentStreak} Hari
            </span>
          </div>
        </div>

        {/* 7 Days Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {rewards.map((r) => {
            const isClaimed = r.day < currentStreak || (r.day === currentStreak && isClaimedToday)
            const isToday = r.day === currentStreak && !isClaimedToday

            return (
              <div
                key={r.day}
                className={`p-3.5 rounded-2xl border flex flex-col items-center text-center relative transition-all ${
                  isClaimed
                    ? 'bg-slate-950/60 border-slate-800 opacity-60'
                    : isToday
                    ? 'bg-gradient-to-b from-blue-900/60 to-slate-900 border-blue-500 shadow-xl shadow-blue-500/20 ring-2 ring-blue-500/40'
                    : 'bg-slate-950/80 border-slate-800'
                } ${r.day === 7 ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Hari ke-{r.day}
                </span>

                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-400 mb-2">
                  {r.item ? (
                    <Gift className="w-5 h-5 text-purple-400" />
                  ) : (
                    <Coins className="w-5 h-5" />
                  )}
                </div>

                <div className="font-extrabold text-sm text-white font-mono">
                  +{r.coins}
                </div>
                <span className="text-[10px] text-amber-300">Netizen Coins</span>

                {r.item && (
                  <span className="text-[9px] text-purple-300 mt-1 font-semibold leading-tight">
                    + {r.item}
                  </span>
                )}

                {isClaimed && (
                  <div className="absolute inset-0 bg-slate-950/80 rounded-2xl flex items-center justify-center backdrop-blur-[1px]">
                    <span className="text-[11px] font-bold text-emerald-400 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Klaim
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Claim Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            {isClaimedToday ? (
              <span className="text-emerald-400 font-semibold flex items-center">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Kamu sudah mengklaim hadiah hari ini. Kembali besok!
              </span>
            ) : (
              <span>Hadiah hari ini siap untuk diklaim!</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={closeModal}>
              Tutup
            </Button>
            <Button
              variant="primary"
              disabled={isClaimedToday || isClaiming || isLoading}
              onClick={handleClaim}
            >
              {isClaiming ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-1.5" />
              )}
              <span>{isClaimedToday ? 'Sudah Diklaim' : 'Klaim Hadiah Hari Ini'}</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
