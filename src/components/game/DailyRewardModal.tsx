'use client'

import React, { useState } from 'react'
import { Coins, CheckCircle, Gift, Sparkles } from 'lucide-react'
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

  const [claimedDays, setClaimedDays] = useState<number[]>([1])
  const [currentDay] = useState(2)
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

  const handleClaim = () => {
    if (claimedDays.includes(currentDay)) return
    setIsClaiming(true)

    setTimeout(() => {
      const reward = rewards.find((r) => r.day === currentDay)
      const earnedCoins = reward ? reward.coins : 75

      setClaimedDays((prev) => [...prev, currentDay])
      setIsClaiming(false)

      const currentBalance = wallet?.balance ?? 500
      updateBalance(currentBalance + earnedCoins)

      addNotification({
        title: 'Hadiah Harian Diklaim!',
        message: `+${earnedCoins} Netizen Coins telah ditambahkan ke dompetmu.`,
        type: 'success',
      })
    }, 600)
  }

  const isTodayClaimed = claimedDays.includes(currentDay)

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
          <span className="inline-block mt-2 text-[10px] text-blue-400 font-mono bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
            Waktu Reset: 00:00 WIB (Asia/Jakarta)
          </span>
        </div>

        {/* 7 Days Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {rewards.map((r) => {
            const isClaimed = claimedDays.includes(r.day)
            const isCurrent = r.day === currentDay && !isClaimed

            return (
              <div
                key={r.day}
                className={`p-3.5 rounded-xl border flex flex-col items-center text-center relative transition-all ${
                  isClaimed
                    ? 'bg-slate-900/60 border-slate-800 opacity-60'
                    : isCurrent
                    ? 'bg-gradient-to-b from-blue-900/60 to-slate-900 border-blue-500 shadow-lg shadow-blue-500/20 ring-2 ring-blue-500/30'
                    : 'bg-slate-900/90 border-slate-800'
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

                <span className="font-extrabold text-sm text-white">
                  +{r.coins} Koin
                </span>

                {r.item && (
                  <span className="text-[10px] text-purple-300 font-medium mt-1">
                    + {r.item}
                  </span>
                )}

                {isClaimed && (
                  <div className="absolute inset-0 bg-slate-950/80 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Claim Action */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-400">
            Streak Saat Ini:{' '}
            <strong className="text-emerald-400 font-bold">2 Hari Berturut-turut</strong>
          </div>

          <Button
            variant="accent"
            size="md"
            disabled={isTodayClaimed}
            isLoading={isClaiming}
            onClick={handleClaim}
          >
            <Sparkles className="w-4 h-4 mr-1" />
            <span>{isTodayClaimed ? 'Sudah Diklaim Hari Ini' : 'Klaim Hadiah Hari Ini'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}
