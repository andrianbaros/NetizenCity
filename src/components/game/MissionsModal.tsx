// ============================================================
// NETIZENCITY - Missions & Quests Modal
// Daily & Weekly Citizen Tasks with Coin & XP Rewards
// Stylized for Cozy Pastel Diorama Aesthetic
// ============================================================

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Award,
  CheckCircle2,
  Coins,
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
      description: 'Berjalan sejauh 500 langkah di sudut-sudut kota',
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
      description: 'Selesaikan 2 pengantaran paket barang dari kawasan industri',
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
    if (id === 'm-01') return <Compass className="w-5 h-5 text-[#2C6ECB]" />
    if (id === 'm-02') return <Trash2 className="w-5 h-5 text-[#186D48]" />
    if (id === 'm-03') return <Package className="w-5 h-5 text-[#8C6008]" />
    return <Vote className="w-5 h-5 text-[#6A3F98]" />
  }

  const displayList = missions.length > 0 ? missions : fallbackMissions

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="MISI & PRESTASI WARGA" maxWidth="lg">
      <div className="space-y-4">
        <div className="p-3 bg-[#FFF9F1] rounded-2xl border-2 border-[#EADBCC] text-xs text-[#5C5265] leading-relaxed">
          Selesaikan misi harian dan mingguan warga untuk mendapatkan Netizen Coins ekstra, menaikkan level, dan membangun peradaban kota bersama!
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-[#6F6675] text-xs">
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#76A9EA]" />
            <span>Memuat misi kota...</span>
          </div>
        ) : (
          <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1 scrollbar-thin">
            {displayList.map((m) => {
              const pct = Math.min(100, Math.round((m.progress / m.target) * 100))
              const canClaim = (m.progress >= m.target || m.isCompleted) && !m.isClaimed

              return (
                <div
                  key={m.id}
                  className={`p-4 rounded-2xl border-2 transition-all ${
                    m.isClaimed
                      ? 'bg-[#F8F5F0] border-[#E6DDD3] opacity-75'
                      : canClaim
                      ? 'bg-[#F0FDF4] border-[#A8DCC8] shadow-md ring-1 ring-[#A8DCC8]/40'
                      : 'bg-[#FFFDF9] border-[#EADBCC] shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start space-x-3">
                      <div className="p-2.5 rounded-2xl bg-[#FFF9F1] border border-[#EADBCC] flex-shrink-0 shadow-inner">
                        {getMissionIcon(m.id)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h5 className="font-extrabold text-[#3B3340] text-xs">{m.name}</h5>
                          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#F4ECE0] text-[#5C5265] border border-[#D9C8B5]">
                            {m.type === 'daily' ? 'Harian' : 'Mingguan'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#6F6675] mt-0.5">
                          {m.description}
                        </p>
                      </div>
                    </div>

                    {/* Reward Badge */}
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <div className="flex items-center space-x-1 bg-[#FFF8DF] px-2 py-1 rounded-xl border border-[#F7D772] text-xs">
                        <Coins className="w-3.5 h-3.5 text-[#D4980B]" />
                        <span className="font-black text-[#8C6008] font-mono">
                          +{m.reward_coins}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 bg-[#F3EEFA] px-2 py-1 rounded-xl border border-[#C9B8E8] text-xs">
                        <Award className="w-3.5 h-3.5 text-[#6A3F98]" />
                        <span className="font-black text-[#6A3F98] font-mono">
                          +{m.reward_xp} XP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Claim Button */}
                  <div className="mt-3 pt-3 border-t border-[#F0EAE1] flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] text-[#6F6675] font-mono mb-1 font-semibold">
                        <span>Progress Misi</span>
                        <span>
                          {m.progress} / {m.target} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#F0EAE1] overflow-hidden border border-[#EADBCC]/60">
                        <div
                          className={`h-full transition-all duration-500 rounded-full ${
                            canClaim || m.isClaimed
                              ? 'bg-[#4EBA88]'
                              : 'bg-[#76A9EA]'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {m.isClaimed ? (
                        <span className="text-[11px] font-black text-[#186D48] flex items-center px-2.5 py-1 rounded-xl bg-[#E8F8F0] border border-[#A8DCC8]">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-[#186D48]" />
                          Selesai
                        </span>
                      ) : canClaim ? (
                        <button
                          type="button"
                          disabled={claimingId === m.id}
                          onClick={() => handleClaimReward(m)}
                          className="px-3.5 py-1.5 rounded-xl bg-[#4EBA88] hover:bg-[#3FA675] text-white font-bold text-xs shadow-sm border-b-3 border-[#2E7F59] active:border-b-0 active:translate-y-0.5 transition-transform flex items-center space-x-1 cursor-pointer"
                        >
                          {claimingId === m.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" />
                          ) : (
                            <Award className="w-3.5 h-3.5 mr-1" />
                          )}
                          <span>Klaim Hadiah</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#6F6675] font-semibold px-2 py-1">
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

        <div className="flex justify-end pt-3 border-t border-[#EADBCC]">
          <Button variant="ghost" onClick={closeModal}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  )
}
