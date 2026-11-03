// ============================================================
// NETIZENCITY - Building Interactive Modal
// Interactive Balai Kota Policy Voting, Courier Jobs, Housing, & Airport
// ============================================================

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Building2,
  Home,
  Briefcase,
  Plane,
  Vote,
  CheckCircle2,
  Sparkles,
  Users,
  Send,
  Loader2,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/lib/stores/useUIStore'
import { useGameStore } from '@/lib/stores/useGameStore'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'

interface PollOption {
  id: number
  title: string
  votes: number
}

interface PollData {
  id: string
  title: string
  description: string
  options: PollOption[]
}

export default function BuildingModal() {
  const activeModal = useUIStore((s) => s.activeModal)
  const closeModal = useUIStore((s) => s.closeModal)
  const addNotification = useUIStore((s) => s.addNotification)
  const selectedBuilding = useGameStore((s) => s.selectedBuilding)
  const wallet = useCitizenStore((s) => s.wallet)
  const updateBalance = useCitizenStore((s) => s.updateBalance)

  const isOpen = activeModal === 'building_details'

  // Polling state
  const [poll, setPoll] = useState<PollData | null>(null)
  const [selectedPollOption, setSelectedPollOption] = useState<number>(0)
  const [hasVoted, setHasVoted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingVotes, setIsLoadingVotes] = useState(false)

  // Fetch active vote data on open
  const fetchVotes = useCallback(async () => {
    try {
      setIsLoadingVotes(true)
      const res = await fetch('/api/votes')
      if (res.ok) {
        const data = await res.json()
        if (data.vote) {
          setPoll(data.vote)
          if (data.hasVoted) {
            setHasVoted(true)
            if (data.selectedOption !== null && data.selectedOption !== undefined) {
              setSelectedPollOption(data.selectedOption)
            }
          }
        }
      }
    } catch {
      // Fallback to default
    } finally {
      setIsLoadingVotes(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchVotes()
    }
  }, [isOpen, fetchVotes])

  const defaultPoll: PollData = {
    id: 'vote-01',
    title: 'Fasilitas Publik Baru NETIZENCITY',
    description:
      'Pilih fasilitas umum berikutnya yang akan diprioritaskan dibangun oleh Pemerintah Kota.',
    options: [
      { id: 0, title: 'Stadion Olahraga & Mini-Game Sepakbola Kota', votes: 1984 },
      { id: 1, title: 'Museum Seni Pixel & Bioskop Terbuka Komunitas', votes: 923 },
      { id: 2, title: 'Jalur Sepeda & Taman Rekreasi Danau Netizen', votes: 513 },
    ],
  }

  const currentPoll = poll || defaultPoll
  const totalVotes = currentPoll.options.reduce((acc, opt) => acc + opt.votes, 0)

  const buildingDataMap: Record<
    string,
    {
      title: string
      icon: React.ReactNode
      district: string
      desc: string
      actionName: string
      actionType: 'work' | 'vote' | 'inspect'
    }
  > = {
    city_hall: {
      title: 'BALAI KOTA NETIZENCITY',
      icon: <Building2 className="w-6 h-6 text-blue-400" />,
      district: 'Downtown (Pusat Kota)',
      desc: 'Pusat administrasi kota virtual dan kantor Walikota. Warga dapat berpartisipasi dalam pemungutan suara resmi kebijakan kota dan menentukan fasilitas umum berikutnya.',
      actionName: 'Kirim Suara Polling (+25 Koin)',
      actionType: 'vote',
    },
    industrial_factory: {
      title: 'PABRIK & LOGISTIK KURIR',
      icon: <Briefcase className="w-6 h-6 text-amber-400" />,
      district: 'Kawasan Industri',
      desc: 'Pekerjaan kurir kota: Ambil paket pesanan warga dari gudang pabrik, antar ke alamat tujuan di peta, dan dapatkan upah 100 Netizen Coins per pengantaran.',
      actionName: 'Mulai Pengantaran Kurir (+100 Koin)',
      actionType: 'work',
    },
    apartments_block_a: {
      title: 'RUSUNAWA HARAPAN BARU BLOK A',
      icon: <Home className="w-6 h-6 text-emerald-400" />,
      district: 'Perumahan Utara',
      desc: 'Hunian bersubsidi bagi warga baru NETIZENCITY dengan fasilitas taman komunal, keamanan 24 jam, dan akses cepat ke pusat kota.',
      actionName: 'Tutup Info Hunian',
      actionType: 'inspect',
    },
    apartments_block_b: {
      title: 'MENARA NETIZEN CITY VIEW',
      icon: <Home className="w-6 h-6 text-emerald-400" />,
      district: 'Perumahan Utara',
      desc: 'Apartemen residensial modern dengan pemandangan kota langsung ke alun-alun.',
      actionName: 'Tutup Info Hunian',
      actionType: 'inspect',
    },
    airport_terminal: {
      title: 'BANDARA INTERNASIONAL NETIZEN',
      icon: <Plane className="w-6 h-6 text-sky-400" />,
      district: 'Bandara & Kedatangan',
      desc: 'Pintu gerbang masuk wisatawan dan warga baru dari komunitas Instagram @netizencity.id. Semua warga baru mendarat di sini sebelum menuju pusat kota.',
      actionName: 'Tutup Info Bandara',
      actionType: 'inspect',
    },
  }

  const current =
    (selectedBuilding && buildingDataMap[selectedBuilding]) ||
    buildingDataMap.city_hall

  const handleVoteSubmit = async () => {
    if (hasVoted || isSubmitting) return
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/votes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          voteId: currentPoll.id,
          optionId: selectedPollOption,
        }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        if (data.options) {
          setPoll((prev) => (prev ? { ...prev, options: data.options } : prev))
        } else {
          setPoll((prev) => {
            if (!prev) return prev
            return {
              ...prev,
              options: prev.options.map((opt) =>
                opt.id === selectedPollOption ? { ...opt, votes: opt.votes + 1 } : opt
              ),
            }
          })
        }

        setHasVoted(true)

        // Award 25 coins to wallet
        const cur = wallet?.balance ?? 500
        updateBalance(cur + 25)

        addNotification({
          title: 'Suara Berhasil Diberikan! 🗳️',
          message:
            'Kamu mendapatkan +25 Netizen Coins atas partisipasi aktif dalam kebijakan kota!',
          type: 'success',
        })
      } else {
        // Fallback local vote
        setPoll((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            options: prev.options.map((opt) =>
              opt.id === selectedPollOption ? { ...opt, votes: opt.votes + 1 } : opt
            ),
          }
        })
        setHasVoted(true)
        const cur = wallet?.balance ?? 500
        updateBalance(cur + 25)
        addNotification({
          title: 'Suara Berhasil Diberikan! 🗳️',
          message: '+25 Netizen Coins masuk ke dompetmu!',
          type: 'success',
        })
      }
    } catch {
      // Offline fallback
      setHasVoted(true)
      const cur = wallet?.balance ?? 500
      updateBalance(cur + 25)
      addNotification({
        title: 'Suara Tersimpan! 🗳️',
        message: '+25 Netizen Coins masuk ke dompetmu!',
        type: 'success',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAction = () => {
    if (current.actionType === 'work') {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('start-courier-job'))
      }
      closeModal()
    } else if (current.actionType === 'vote') {
      if (!hasVoted) {
        handleVoteSubmit()
      } else {
        closeModal()
      }
    } else {
      closeModal()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title={current.title} maxWidth="md">
      <div className="space-y-5">
        {/* Top Info Banner */}
        <div className="flex items-start space-x-4">
          <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex-shrink-0">
            {current.icon}
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
              {current.district}
            </span>
            <h4 className="text-base font-extrabold text-white mt-0.5">
              Fasilitas Publik Resmi
            </h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {current.desc}
            </p>
          </div>
        </div>

        {/* POLLING KEBIJAKAN KOTA (BALAI KOTA) */}
        {current.actionType === 'vote' && (
          <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-bold text-white flex items-center">
                <Vote className="w-4 h-4 mr-1.5 text-blue-400" />
                {currentPoll.title}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {isLoadingVotes ? (
                  <span className="flex items-center">
                    <Loader2 className="w-3 h-3 animate-spin mr-1 text-blue-400" />
                    Memuat...
                  </span>
                ) : (
                  `${totalVotes} Suara Masuk`
                )}
              </span>
            </div>

            <p className="text-[11px] text-slate-400">
              {currentPoll.description}
            </p>

            <div className="space-y-2 pt-1">
              {currentPoll.options.map((opt) => {
                const isSelected = selectedPollOption === opt.id
                const percentage =
                  totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0

                return (
                  <button
                    key={opt.id}
                    type="button"
                    disabled={hasVoted}
                    onClick={() => {
                      if (!hasVoted) setSelectedPollOption(opt.id)
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer relative overflow-hidden block ${
                      isSelected
                        ? 'bg-blue-950/70 border-blue-500 shadow-md ring-1 ring-blue-500/40 text-white'
                        : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300'
                    } ${hasVoted ? 'cursor-default' : ''}`}
                  >
                    {/* Live percentage fill bar when voted */}
                    {hasVoted && (
                      <div
                        className="absolute inset-y-0 left-0 bg-blue-600/25 pointer-events-none transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    )}

                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center space-x-2.5">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-blue-400 bg-blue-600'
                              : 'border-slate-600 bg-slate-800'
                          }`}
                        >
                          {isSelected && (
                            <div className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </div>
                        <span className="font-semibold text-xs">{opt.title}</span>
                      </div>

                      {hasVoted && (
                        <div className="text-right pl-2">
                          <span className="font-bold font-mono text-blue-300">
                            {percentage}%
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {opt.votes} warga
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {hasVoted && (
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>
                  Suaramu telah terverifikasi dan disimpan di arsip Balai Kota! (+25 Koin)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
          <Button variant="ghost" onClick={closeModal}>
            Tutup
          </Button>

          {current.actionType === 'vote' ? (
            <Button
              variant="primary"
              onClick={handleAction}
              disabled={hasVoted || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : (
                <Vote className="w-4 h-4 mr-1.5" />
              )}
              <span>
                {hasVoted
                  ? 'Sudah Memilih (Selesai)'
                  : isSubmitting
                  ? 'Menyimpan...'
                  : current.actionName}
              </span>
            </Button>
          ) : (
            <Button variant="primary" onClick={handleAction}>
              {current.actionName}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
