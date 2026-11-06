// ============================================================
// NETIZENCITY - Daily Login Reward Modal
// 7-day Login Streak with Local Database Persistence
// Stylized for Cozy Pastel Diorama Aesthetic
// ============================================================

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Coins,
  CheckCircle,
  Gift,
  Loader2,
  CalendarCheck,
  UserPlus,
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
  const profile = useCitizenStore((s) => s.profile)

  const isGuest = !profile

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
          <p className="text-xs text-[#6F6675] leading-relaxed">
            Masuk ke kota setiap hari untuk mempertahankan streak dan dapatkan bonus koin serta item eksklusif pada hari ke-7!
          </p>
          <div className="flex items-center justify-center space-x-2 mt-2.5">
            <span className="text-[11px] text-[#6A3F98] font-bold bg-[#F3EEFA] px-3 py-1 rounded-full border border-[#C9B8E8] flex items-center">
              <CalendarCheck className="w-3.5 h-3.5 mr-1 text-[#6A3F98]" />
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
                className={`p-3.5 rounded-2xl border-2 flex flex-col items-center text-center relative transition-all ${
                  isClaimed
                    ? 'bg-[#F8F5F0] border-[#E6DDD3] opacity-75'
                    : isToday
                    ? 'bg-gradient-to-b from-[#FFF5DE] to-[#FFF0D4] border-[#F4A98C] shadow-md ring-2 ring-[#F4A98C]/40'
                    : r.day === 7
                    ? 'bg-gradient-to-b from-[#FFF9E6] to-[#FFE8A3] border-[#E5B537] shadow-sm'
                    : 'bg-[#FFFDF9] border-[#EADBCC] shadow-xs'
                } ${r.day === 7 ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                <span className="text-[10px] font-black text-[#5C5265] uppercase tracking-wider mb-2">
                  Hari ke-{r.day}
                </span>

                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center mb-2 shadow-xs ${
                    r.day === 7
                      ? 'bg-[#FFE8A3] text-[#8C6008] border border-[#E5B537]'
                      : isToday
                      ? 'bg-[#FFF8DF] text-[#D4980B] border border-[#F7D772]'
                      : 'bg-[#F8F4EE] text-[#D4980B] border border-[#EADBCC]'
                  }`}
                >
                  {r.item ? (
                    <Gift className="w-5 h-5 text-[#8C6008] animate-bounce" />
                  ) : (
                    <Coins className="w-5 h-5" />
                  )}
                </div>

                <div className="font-black text-sm text-[#3B3340] font-mono">
                  +{r.coins}
                </div>
                <span className="text-[10px] font-bold text-[#8C6008]">Netizen Coins</span>

                {r.item && (
                  <span className="text-[9px] text-[#6A3F98] mt-1 font-bold leading-tight bg-[#F3EEFA] px-1.5 py-0.5 rounded-md border border-[#C9B8E8]">
                    + {r.item}
                  </span>
                )}

                {isClaimed && (
                  <div className="absolute inset-0 bg-[#FFFDF9]/85 rounded-2xl flex items-center justify-center backdrop-blur-[1px] border-2 border-[#A8DCC8]">
                    <span className="text-[11px] font-black text-[#186D48] flex items-center bg-[#E8F8F0] px-2.5 py-1 rounded-xl border border-[#A8DCC8]">
                      <CheckCircle className="w-3.5 h-3.5 mr-1 text-[#186D48]" />
                      Sudah Diklaim
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Guest Warning */}
        {isGuest && (
          <div className="p-3.5 rounded-2xl bg-[#FFF5EC] border-2 border-[#F4C8B4] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center space-x-2.5">
              <UserPlus className="w-4 h-4 text-[#D97858] flex-shrink-0" />
              <span className="text-[#3B3340] font-medium">
                Kamu sedang berkunjung sebagai Tamu. Masuk atau daftar warga agar streak loginmu tersimpan permanen.
              </span>
            </div>
            <Link
              href="/welcome"
              className="px-3.5 py-1.5 rounded-xl bg-[#F4A98C] text-white font-heading font-bold text-xs hover:bg-[#E88968] transition-colors whitespace-nowrap"
            >
              Daftar Warga
            </Link>
          </div>
        )}

        {/* Claim Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#EADBCC]">
          <div className="text-xs text-[#6F6675]">
            {isClaimedToday ? (
              <span className="text-[#186D48] font-bold flex items-center">
                <CheckCircle className="w-4 h-4 mr-1.5" />
                Kamu sudah mengklaim hadiah hari ini. Kembali lagi besok!
              </span>
            ) : (
              <span className="text-[#3B3340] font-semibold flex items-center">
                <Gift className="w-4 h-4 mr-1.5 text-[#D97858]" />
                Hadiah hari ini siap untuk kamu klaim!
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={closeModal}>
              Tutup
            </Button>
            <Button
              variant="accent"
              disabled={isClaimedToday || isClaiming || isLoading}
              onClick={handleClaim}
            >
              {isClaiming ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Gift className="w-4 h-4 mr-1.5" />
              )}
              <span>{isClaimedToday ? 'Sudah Diklaim' : 'Klaim Hadiah Hari Ini'}</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
