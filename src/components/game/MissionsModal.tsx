// ============================================================
// NETIZENCITY - Missions & Quests Modal
// Daily & Weekly Citizen Tasks with Coin & XP Rewards
// Stylized for Cozy Simulation Game Aesthetic
// ============================================================

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import {
  Award,
  CheckCircle2,
  Coins,
  Loader2,
  Compass,
  Trash2,
  Package,
  Vote,
  UserPlus,
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
  const profile = useCitizenStore((s) => s.profile)

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
          title: 'Hadiah Misi Diklaim!',
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
          title: 'Hadiah Misi Diklaim!',
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
        title: 'Hadiah Misi Diklaim!',
        message: `+${mission.reward_coins} Koin diperoleh!`,
        type: 'success',
      })
    } finally {
      setClaimingId(null)
    }
  }

  const getMissionIcon = (id: string) => {
    if (id === 'm-01') return <Compass className="w-4 h-4 text-[#78634B]" />
    if (id === 'm-02') return <Trash2 className="w-4 h-4 text-[#668B65]" />
    if (id === 'm-03') return <Package className="w-4 h-4 text-[#78634B]" />
    return <Vote className="w-4 h-4 text-[#668B65]" />
  }

  const displayList = missions.length > 0 ? missions : fallbackMissions

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Misi & Prestasi Warga" maxWidth="lg">
      <div className="space-y-3.5">
        <div className="p-2.5 bg-[#EFE9D8] rounded-xl border border-[#D8CEBE] text-xs text-[#78634B] leading-relaxed">
          Selesaikan misi harian dan mingguan untuk mendapatkan Netizen Coins ekstra dan menaikkan level warga!
        </div>

        {!profile && (
          <div className="p-3 rounded-xl bg-[#EFE9D8] border border-[#D8CEBE] flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
            <div className="flex items-center space-x-2">
              <UserPlus className="w-4 h-4 text-[#78634B] flex-shrink-0" />
              <span className="text-[#343B35]">
                Kamu berkunjung sebagai Tamu. Masuk atau daftar warga agar progres misi tersimpan.
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

        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-[#78634B] text-xs">
            <Loader2 className="w-4 h-4 animate-spin mr-2 text-[#668B65]" />
            <span>Memuat misi kota...</span>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[50vh] overflow-y-auto pr-1">
            {displayList.map((m) => {
              const pct = Math.min(100, Math.round((m.progress / m.target) * 100))
              const canClaim = (m.progress >= m.target || m.isCompleted) && !m.isClaimed

              return (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl border transition-all ${
                    m.isClaimed
                      ? 'bg-[#EFE9D8]/50 border-[#D8CEBE] opacity-60'
                      : canClaim
                      ? 'bg-[#F7F4E9] border-2 border-[#668B65] shadow-xs'
                      : 'bg-[#EFE9D8] border-[#D8CEBE]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start space-x-2.5">
                      <div className="p-2 rounded-lg bg-[#F7F4E9] border border-[#D8CEBE] flex-shrink-0">
                        {getMissionIcon(m.id)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h5 className="font-bold text-[#343B35] text-xs">{m.name}</h5>
                          <span className="text-[9px] uppercase font-semibold px-1.5 py-0.5 rounded bg-[#F7F4E9] text-[#78634B] border border-[#D8CEBE]">
                            {m.type === 'daily' ? 'Harian' : 'Mingguan'}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#78634B] mt-0.5">
                          {m.description}
                        </p>
                      </div>
                    </div>

                    {/* Reward Badge */}
                    <div className="flex items-center space-x-1.5 flex-shrink-0">
                      <div className="flex items-center space-x-1 bg-[#F7F4E9] px-2 py-0.5 rounded-lg border border-[#D8CEBE] text-xs">
                        <Coins className="w-3 h-3 text-[#E6C66F]" />
                        <span className="font-bold text-[#343B35]">
                          +{m.reward_coins}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 bg-[#F7F4E9] px-2 py-0.5 rounded-lg border border-[#D8CEBE] text-xs">
                        <Award className="w-3 h-3 text-[#668B65]" />
                        <span className="font-bold text-[#668B65]">
                          +{m.reward_xp} XP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar & Claim Button */}
                  <div className="mt-2.5 pt-2.5 border-t border-[#D8CEBE] flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex justify-between text-[10px] text-[#78634B] mb-1 font-medium">
                        <span>Progress</span>
                        <span>
                          {m.progress} / {m.target} ({pct}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#D8CEBE] overflow-hidden">
                        <div
                          className="h-full bg-[#668B65] transition-all duration-300 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      {m.isClaimed ? (
                        <span className="text-[10px] font-semibold text-[#668B65] flex items-center px-2 py-0.5 rounded-lg bg-[#F7F4E9] border border-[#D8CEBE]">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-[#668B65]" />
                          Selesai
                        </span>
                      ) : canClaim ? (
                        <Button
                          size="sm"
                          variant="primary"
                          disabled={claimingId === m.id}
                          onClick={() => handleClaimReward(m)}
                        >
                          {claimingId === m.id ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1" />
                          ) : (
                            <Award className="w-3 h-3 mr-1" />
                          )}
                          <span>Klaim</span>
                        </Button>
                      ) : (
                        <span className="text-[10px] text-[#78634B] font-medium px-1.5 py-0.5">
                          Berjalan
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-[#D8CEBE]">
          <Button variant="secondary" onClick={closeModal}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  )
}
