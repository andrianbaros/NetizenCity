// ============================================================
// NETIZENCITY - Missions & Quests Modal
// Daily & Weekly Citizen Tasks with Coin & XP Rewards
// ============================================================

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Award,
  CheckCircle2,
  Coins,
  Sparkles,
  Loader2,
  Compass,
  Trash2,
  Package,
  Vote,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/lib/stores/useUIStore'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'

interface MissionItem {
  id: string
  name: string
  description: string
  type: 'daily' | 'weekly'
  reward_coins: number
  reward_xp: number
  target: number
  progress: number
  isCompleted: boolean
  isClaimed: boolean
}

export default function MissionsModal() {
  const activeModal = useUIStore((s) => s.activeModal)
  const closeModal = useUIStore((s) => s.closeModal)
  const addNotification = useUIStore((s) => s.addNotification)
  const updateBalance = useCitizenStore((s) => s.updateBalance)
  const wallet = useCitizenStore((s) => s.wallet)

  const isOpen = activeModal === 'missions'

  const [missions, setMissions] = useState<MissionItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [claimingId, setClaimingId] = useState<string | null>(null)

  const fallbackMissions: MissionItem[] = [
    {
      id: 'm-01',
      name: 'Jelajah Kota',
      description: 'Berjalan sejauh 500 langkah di kota',
      type: 'daily',
      reward_coins: 50,
      reward_xp: 25,
      target: 500,
      progress: 320,
      isCompleted: false,
      isClaimed: false,
    },
    {
      id: 'm-02',
      name: 'Petugas Kebersihan',
      description: 'Bersihkan 3 sampah yang berserakan di trotoar',
      type: 'daily',
      reward_coins: 75,
      reward_xp: 40,
      target: 3,
      progress: 3,
      isCompleted: true,
      isClaimed: false,
    },
    {
      id: 'm-03',
      name: 'Antar Paket Kurir',
      description: 'Selesaikan 2 pengantaran paket barang dari pabrik',
      type: 'daily',
      reward_coins: 150,
      reward_xp: 80,
      target: 2,
      progress: 1,
      isCompleted: false,
      isClaimed: false,
    },
    {
      id: 'm-04',
      name: 'Suara Demokrasi',
      description: 'Berikan suaramu pada polling kebijakan kota di Balai Kota',
      type: 'weekly',
      reward_coins: 100,
      reward_xp: 50,
      target: 1,
      progress: 1,
      isCompleted: true,
      isClaimed: false,
    },
  ]

  const fetchMissions = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/missions')
      if (res.ok) {
        const data = await res.json()
        if (data.missions && data.missions.length > 0) {
          setMissions(data.missions)
          return
        }
      }
      setMissions(fallbackMissions)
    } catch {
      setMissions(fallbackMissions)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchMissions()
    }
  }, [isOpen, fetchMissions])

  const handleClaimReward = async (mission: MissionItem) => {
    if (mission.isClaimed || claimingId) return
    setClaimingId(mission.id)

    try {
      const res = await fetch('/api/missions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ missionId: mission.id }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        setMissions((prev) =>
          prev.map((m) =>
            m.id === mission.id ? { ...m, isClaimed: true, isCompleted: true } : m
          )
        )

        const cur = wallet?.balance ?? 500
        updateBalance(cur + mission.reward_coins)

        addNotification({
          title: 'Hadiah Misi Diklaim! 🎯',
          message: `+${mission.reward_coins} Koin & +${mission.reward_xp} XP berhasil diperoleh!`,
          type: 'success',
        })
      } else {
        // Fallback local claim
        setMissions((prev) =>
          prev.map((m) =>
            m.id === mission.id ? { ...m, isClaimed: true, isCompleted: true } : m
          )
        )
        const cur = wallet?.balance ?? 500
        updateBalance(cur + mission.reward_coins)
        addNotification({
          title: 'Hadiah Misi Diklaim! 🎯',
          message: `+${mission.reward_coins} Koin & +${mission.reward_xp} XP diperoleh!`,
          type: 'success',
        })
      }
    } catch {
      setMissions((prev) =>
        prev.map((m) =>
          m.id === mission.id ? { ...m, isClaimed: true, isCompleted: true } : m
        )
      )
      const cur = wallet?.balance ?? 500
      updateBalance(cur + mission.reward_coins)
      addNotification({
        title: 'Hadiah Misi Diklaim! 🎯',
        message: `+${mission.reward_coins} Koin diperoleh!`,
        type: 'success',
      })
    } finally {
      setClaimingId(null)
    }
  }

  const getMissionIcon = (id: string) => {
    if (id === 'm-01') return <Compass className="w-5 h-5 text-sky-400" />
    if (id === 'm-02') return <Trash2 className="w-5 h-5 text-emerald-400" />
    if (id === 'm-03') return <Package className="w-5 h-5 text-amber-400" />
    return <Vote className="w-5 h-5 text-purple-400" />
  }

  const displayList = missions.length > 0 ? missions : fallbackMissions

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="MISI & PRESTASI WARGA" maxWidth="lg">
      <div className="space-y-5">
        <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-300">
          Selesaikan misi harian dan mingguan warga untuk mendapatkan koin ekstra, menaikkan level, dan membangun kota!
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-slate-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-blue-400" />
            <span>Memuat misi kota...</span>
          </div>
        ) : (
          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
            {displayList.map((m) => {
              const pct = Math.min(100, Math.round((m.progress / m.target) * 100))
              const canClaim = (m.progress >= m.target || m.isCompleted) && !m.isClaimed

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    m.isClaimed
                      ? 'bg-slate-950/50 border-slate-800 opacity-60'
                      : canClaim
                      ? 'bg-gradient-to-r from-blue-950/60 to-slate-950 border-blue-500/60 shadow-lg ring-1 ring-blue-500/30'
                      : 'bg-slate-950/70 border-slate-800'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex-shrink-0">
                        {getMissionIcon(m.id)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h5 className="font-bold text-white text-xs">{m.name}</h5>
                          <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {m.type === 'daily' ? 'Harian' : 'Mingguan'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {m.description}
                        </p>
                      </div>
                    </div>

                    {/* Reward Badge */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="flex items-center space-x-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-xs">
                        <Coins className="w-3.5 h-3.5 text-amber-400" />
                        <span className="font-bold text-amber-300 font-mono">
                          +{m.reward_coins}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 text-xs">
                        <Award className="w-3.5 h-3.5 text-purple-400" />
                        <span className="font-bold text-purple-300 font-mono">
                          +{m.reward_xp} XP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Claim Button */}
                  <div className="mt-3 pt-3 border-t border-slate-900 flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] text-slate-400 font-mono mb-1">
                        <span>Progress</span>
                        <span>
                          {m.progress} / {m.target} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-500 ${
                            canClaim || m.isClaimed
                              ? 'bg-emerald-500'
                              : 'bg-blue-500'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {m.isClaimed ? (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center px-2 py-1">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                          Selesai
                        </span>
                      ) : canClaim ? (
                        <button
                          type="button"
                          disabled={claimingId === m.id}
                          onClick={() => handleClaimReward(m)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-transform active:scale-95 flex items-center space-x-1 cursor-pointer"
                        >
                          {claimingId === m.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          ) : (
                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                          )}
                          <span>Klaim Hadiah</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-medium px-2 py-1">
                          Sedang Berjalan
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <Button variant="ghost" onClick={closeModal}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  )
}
