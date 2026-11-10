// ============================================================
// NETIZENCITY - Daily Login Reward Modal
// 7-day Login Streak with Local Database Persistence
// Stylized for Cozy Simulation Game Aesthetic
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
        if (typeof data.newBalance === 'number') {
          updateBalance(data.newBalance)
        } else {
          const cur = wallet?.balance ?? 500
          updateBalance(cur + earnedCoins)
        }

        if (data.streak) {
          setCurrentStreak(data.streak)
        }

        addNotification({
          title: 'Hadiah Harian Berhasil Diklaim!',
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
          title: 'Hadiah Harian Berhasil Diklaim!',
          message: `+${earnedCoins} Netizen Coins telah ditambahkan ke dompetmu!`,
          type: 'success',
        })
      }
    } catch {
      setIsClaimedToday(true)
      const cur = wallet?.balance ?? 500
      updateBalance(cur + 75)
      addNotification({
        title: 'Hadiah Harian Diklaim!',
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
      title="Hadiah Login Harian"
      maxWidth="lg"
    >
      <div className="space-y-5">
        <div className="text-center">
          <p className="text-xs text-[#78634B] leading-relaxed">
            Masuk setiap hari untuk mempertahankan streak dan dapatkan bonus koin serta item eksklusif hari ke-7!
          </p>
          <div className="flex items-center justify-center space-x-2 mt-2">
            <span className="text-[11px] text-[#343B35] font-semibold bg-[#EFE9D8] px-3 py-1 rounded-lg border border-[#D8CEBE] flex items-center">
              <CalendarCheck className="w-3.5 h-3.5 mr-1 text-[#668B65]" />
              Streak: {currentStreak} Hari
            </span>
          </div>
        </div>

        {/* 7 Days Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {rewards.map((r) => {
            const isClaimed = r.day < currentStreak || (r.day === currentStreak && isClaimedToday)
            const isToday = r.day === currentStreak && !isClaimedToday

            return (
              <div
                key={r.day}
                className={`p-3 rounded-xl border flex flex-col items-center text-center relative transition-all ${
                  isClaimed
                    ? 'bg-[#EFE9D8]/50 border-[#D8CEBE] opacity-60'
                    : isToday
                    ? 'bg-[#F7F4E9] border-2 border-[#668B65] shadow-xs'
                    : r.day === 7
                    ? 'bg-[#E6C66F]/15 border-[#E6C66F]'
                    : 'bg-[#EFE9D8] border-[#D8CEBE]'
                } ${r.day === 7 ? 'col-span-2 sm:col-span-1' : ''}`}
              >
                <span className="text-[10px] font-semibold text-[#78634B] uppercase tracking-wide mb-1.5">
                  Hari {r.day}
                </span>

                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center mb-1.5 ${
                    r.day === 7
                      ? 'bg-[#E6C66F]/30 text-[#78634B]'
                      : isToday
                      ? 'bg-[#668B65]/15 text-[#668B65]'
                      : 'bg-[#F7F4E9] text-[#78634B]'
                  }`}
                >
                  {r.item ? (
                    <Gift className="w-4 h-4 text-[#78634B]" />
                  ) : (
                    <Coins className="w-4 h-4" />
                  )}
                </div>

                <div className="font-bold text-sm text-[#343B35]">
                  +{r.coins}
                </div>
                <span className="text-[10px] text-[#78634B]">Koin</span>

                {r.item && (
                  <span className="text-[9px] text-[#343B35] mt-1 font-medium bg-[#F7F4E9] px-1.5 py-0.5 rounded border border-[#D8CEBE]">
                    + {r.item}
                  </span>
                )}

                {isClaimed && (
                  <div className="absolute inset-0 bg-[#F7F4E9]/80 rounded-xl flex items-center justify-center border border-[#668B65]/40">
                    <span className="text-[10px] font-semibold text-[#668B65] flex items-center bg-[#EFE9D8] px-2 py-0.5 rounded border border-[#D8CEBE]">
                      <CheckCircle className="w-3 h-3 mr-1 text-[#668B65]" />
                      Diklaim
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Guest Warning */}
        {isGuest && (
          <div className="p-3 rounded-xl bg-[#EFE9D8] border border-[#D8CEBE] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4 text-[#78634B] flex-shrink-0" />
              <span className="text-[#343B35]">
                Kamu berkunjung sebagai Tamu. Daftar warga agar streak loginmu tersimpan.
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

        {/* Claim Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-[#D8CEBE]">
          <div className="text-xs text-[#78634B]">
            {isClaimedToday ? (
              <span className="text-[#668B65] font-semibold flex items-center">
                <CheckCircle className="w-3.5 h-3.5 mr-1 text-[#668B65]" />
                Hadiah hari ini sudah kamu klaim.
              </span>
            ) : (
              <span className="text-[#343B35] font-medium flex items-center">
                <Gift className="w-3.5 h-3.5 mr-1 text-[#668B65]" />
                Hadiah hari ini siap diambil.
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <Button variant="secondary" onClick={closeModal}>
              Tutup
            </Button>
            <Button
              variant="primary"
              disabled={isClaimedToday || isClaiming || isLoading}
              onClick={handleClaim}
            >
              {isClaiming ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Gift className="w-3.5 h-3.5 mr-1.5" />
              )}
              <span>{isClaimedToday ? 'Sudah Diklaim' : 'Klaim Hadiah'}</span>
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
