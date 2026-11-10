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
  Users,
  Send,
  Loader2,
  HeartPulse,
  Shield,
  Flame,
  Train,
  Landmark,
  BookOpen,
  Trophy,
  Atom,
  Dog,
  GraduationCap,
  Mountain,
  Sun,
  Church,
  Fish,
  ExternalLink,
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
  const openModal = useUIStore((s) => s.openModal)
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
      'Pilih fasilitas umum berikutnya yang akan diprioritaskan dibangun oleh Mayor.',
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
      actionType: 'work' | 'vote' | 'inspect' | 'investor' | 'freekick' | 'fishing' | 'beach'
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
      district: 'Bandara & Kedatangan (Day 7)',
      desc: 'Pintu gerbang masuk wisatawan dan warga baru dari komunitas Instagram @netizencity.id dengan landasan pacu megah dan menara ATC modern.',
      actionName: 'Tutup Info Bandara',
      actionType: 'inspect',
    },
    monument: {
      title: 'MONUMEN NETIZEN CITY & TAMAN AIR MANCUR',
      icon: <Landmark className="w-6 h-6 text-yellow-400" />,
      district: 'Pusat Kota',
      desc: 'Monumen kebanggaan kota dengan obelisk megah, hati kristal bercahaya, prasasti nama investor, dan pertunjukan air mancur jet di taman kota.',
      actionName: 'Kagumi Monumen',
      actionType: 'inspect',
    },
    investor_tower: {
      title: 'MONUMEN INVESTOR KOTA (103 INVESTOR)',
      icon: <Building2 className="w-6 h-6 text-purple-400" />,
      district: 'Monumen Investor Kota',
      desc: 'Monumen megah 11 lantai berlapis opal dengan 100 jendela menyala untuk para investor, 3 Crown Windows emas di puncak, cincin halo terapung, dan sign neon "TERIMA KASIH, INVESTOR KOTA".',
      actionName: 'Buka Hall of Fame Investor & Trakteer ☕',
      actionType: 'investor',
    },
    hospital: {
      title: 'RSUD NETIZEN CITY',
      icon: <HeartPulse className="w-6 h-6 text-rose-400" />,
      district: 'Fasilitas Publik',
      desc: 'Rumah sakit pusat dengan ambulans siaga 24 jam dan pelayanan kesehatan lengkap bagi seluruh warga Netizen City.',
      actionName: 'Periksa Kesehatan',
      actionType: 'inspect',
    },
    police: {
      title: 'KANTOR POLISI NETIZEN CITY',
      icon: <Shield className="w-6 h-6 text-blue-400" />,
      district: 'Fasilitas Publik',
      desc: 'Pusat komando keamanan dan ketertiban kota menjaga perdamaian di seluruh distrik.',
      actionName: 'Lapor Keamanan',
      actionType: 'inspect',
    },
    fire_station: {
      title: 'POS DAMKAR NETIZEN CITY',
      icon: <Flame className="w-6 h-6 text-orange-400" />,
      district: 'Fasilitas Publik',
      desc: 'Pos pemadam kebakaran sigap dengan armada mobil pemadam modern siap menghadapi situasi darurat.',
      actionName: 'Cek Kesiapsiagaan',
      actionType: 'inspect',
    },
    train_station: {
      title: 'STASIUN KERETA NETIZEN EXPRESS',
      icon: <Train className="w-6 h-6 text-cyan-400" />,
      district: 'Transportasi',
      desc: 'Stasiun kereta api komuter modern yang menghubungkan distrik selatan melewati rel kereta kota.',
      actionName: 'Jadwal Kereta',
      actionType: 'inspect',
    },
    worship_place: {
      title: 'KAWASAN KERUKUNAN (MASJID & GEREJA)',
      icon: <Church className="w-6 h-6 text-teal-400" />,
      district: 'Kawasan Kerukunan',
      desc: 'Simbol toleransi dan harmoni kota, tempat ibadah berdampingan dengan damai di sebelah barat kota.',
      actionName: 'Kunjungi Rumah Ibadah',
      actionType: 'inspect',
    },
    library: {
      title: 'PERPUSTAKAAN PUBLIK JI HANN',
      icon: <BookOpen className="w-6 h-6 text-indigo-400" />,
      district: 'Fasilitas Publik (Day 7)',
      desc: 'Perpustakaan kota usulan warga @ji_hann09 dengan ribuan koleksi buku digital, arsip sejarah kota, dan ruang baca nyaman di tepi trotoar.',
      actionName: 'Baca Buku',
      actionType: 'inspect',
    },
    sports_stadium: {
      title: 'STADION & KOMPLEKS OLAHRAGA',
      icon: <Trophy className="w-6 h-6 text-emerald-400" />,
      district: 'Olahraga & Hiburan (Day 7)',
      desc: 'Kompleks olahraga megah usulan @rznn8619 dengan stadion atletik, lintasan lari tartan, gawang sepakbola 3D, dan lapangan adu penalti freekick.',
      actionName: 'Masuk Lapangan Stadion (Freekick 3D) ⚽',
      actionType: 'freekick',
    },
    science_lab: {
      title: 'LABORATORIUM RISET & OBSERVATORIUM',
      icon: <Atom className="w-6 h-6 text-violet-400" />,
      district: 'Distrik Riset (Day 8)',
      desc: 'Laboratorium sains usulan @sidddiq_s dengan kubah teleskop antariksa lavender, tabung cairan mint, roket festival raksasa, dan sang Profesor!',
      actionName: 'Eksperimen Sains',
      actionType: 'inspect',
    },
    zoo: {
      title: 'KEBUN BINATANG NETIZEN CITY',
      icon: <Dog className="w-6 h-6 text-amber-400" />,
      district: 'Kawasan Wisata & Edukasi (Day 9)',
      desc: 'Kebun binatang asri usulan @aftone_moon di tepi hutan: kandang gajah, jerapah tinggi, flamingo anggun, komodo eksotis, singa gagah, dan penguin lucu!',
      actionName: 'Beri Makan Satwa',
      actionType: 'inspect',
    },
    vet_hospital: {
      title: 'RS HEWAN & SUDUT ADOPSI PELIHARAAN',
      icon: <HeartPulse className="w-6 h-6 text-pink-400" />,
      district: 'Fasilitas Publik (Day 9)',
      desc: 'Pusat perawatan satwa usulan @muh_adnan_11: dokter hewan berpengalaman, meja pemeriksaan terbuka, dan rumah adopsi kucing & anjing!',
      actionName: 'Adopsi Peliharaan',
      actionType: 'inspect',
    },
    university: {
      title: 'UNIVERSITAS NETIZEN CITY',
      icon: <GraduationCap className="w-6 h-6 text-purple-400" />,
      district: 'Distrik Riset & Kampus (Day 9)',
      desc: 'Kampus universitas megah usulan @z_hr.da dengan menara jam rektorat, fakultas warna pastel, aula wisuda beratap lengkung, dan Rektor Profesor!',
      actionName: 'Daftar Kuliah',
      actionType: 'inspect',
    },
    nature_mountain: {
      title: 'GUNUNG NETIZEN & AIR TERJUN ALAMI',
      icon: <Mountain className="w-6 h-6 text-emerald-400" />,
      district: 'Kawasan Alam (Day 5)',
      desc: 'Gunung hijau megah usulan @bilalzharkasi dengan jalur pendakian zig-zag, air terjun jernih, dan kolam alami yang mengalirkan sungai ke samudra.',
      actionName: 'Mendaki Gunung',
      actionType: 'inspect',
    },
    netizen_beach: {
      title: 'PANTAI NETIZEN BEACH',
      icon: <Sun className="w-6 h-6 text-yellow-400" />,
      district: 'Kawasan Alam & Wisata (Day 5)',
      desc: 'Pantai tropis eksotis usulan @njemaa_28: pasir krem halus, ombak pastel, deretan payung santai, menara penjaga pantai, dan gapura berpita pink. Dilengkapi dermaga pancing samudra dengan aneka ikan laut tropis!',
      actionName: 'Masuk ke Pantai & Mulai Mancing 🏖️',
      actionType: 'beach',
    },
    river_spot: {
      title: 'SUNGAI KALI NETIZEN & DERMAGA PANCING',
      icon: <Fish className="w-6 h-6 text-sky-400" />,
      district: 'Kawasan Alam',
      desc: 'Sungai Kali Netizen adalah aliran air bersih nan asri yang melintasi pusat kota dari kaki pegunungan hingga bermuara ke pantai. Konon sungai ini dihuni berbagai jenis ikan air tawar legendaris seperti Ikan Lele Sultan dan Mas Koki Alun-Alun.',
      actionName: 'Masuk ke Sungai & Mulai Mancing 🎣',
      actionType: 'fishing',
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

        // Award 25 coins to wallet (persisted from server response)
        if (typeof data.newBalance === 'number') {
          updateBalance(data.newBalance)
        } else {
          const cur = wallet?.balance ?? 0
          updateBalance(cur + 25)
        }

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
        const cur = wallet?.balance ?? 0
        updateBalance(cur + 25)

        fetch('/api/economy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'earn',
            amount: 25,
            currentBalance: cur,
            description: 'Bonus partisipasi polling Balai Kota',
          }),
        })
          .then((r) => (r.ok ? r.json() : null))
          .then((d) => {
            if (d?.wallet?.balance !== undefined) {
              updateBalance(d.wallet.balance)
            }
          })
          .catch(() => {})

        addNotification({
          title: 'Suara Berhasil Diberikan! 🗳️',
          message: '+25 Netizen Coins masuk ke dompetmu!',
          type: 'success',
        })
      }
    } catch {
      // Offline fallback
      setHasVoted(true)
      const cur = wallet?.balance ?? 0
      updateBalance(cur + 25)

      fetch('/api/economy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'earn',
          amount: 25,
          currentBalance: cur,
          description: 'Bonus partisipasi polling Balai Kota',
        }),
      })
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => {
          if (d?.wallet?.balance !== undefined) {
            updateBalance(d.wallet.balance)
          }
        })
        .catch(() => {})

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
    if (current.actionType === 'investor' || selectedBuilding === 'investor_tower') {
      closeModal()
      openModal('investor')
    } else if (current.actionType === 'freekick' || selectedBuilding === 'sports_stadium') {
      closeModal()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('enter-stadium-area'))
      }
    } else if (current.actionType === 'fishing' || selectedBuilding === 'river_spot') {
      closeModal()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('enter-river-area'))
      }
    } else if (current.actionType === 'beach' || selectedBuilding === 'netizen_beach') {
      closeModal()
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('enter-beach-area'))
      }
    } else if (current.actionType === 'work') {
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
      <div className="space-y-4 font-sans">
        {/* Top Info Banner */}
        <div className="flex items-start space-x-3 p-3 bg-[#EFE9D8] rounded-xl border border-[#D8CEBE]">
          <div className="w-10 h-10 rounded-lg bg-[#F7F4E9] border border-[#D8CEBE] flex items-center justify-center text-[#668B65] flex-shrink-0">
            {current.icon}
          </div>
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wide text-[#78634B] bg-[#F7F4E9] border border-[#D8CEBE] px-2 py-0.5 rounded inline-block">
              {current.district}
            </span>
            <h4 className="font-bold text-xs text-[#343B35] mt-1">
              Fasilitas Publik Kota
            </h4>
            <p className="text-xs text-[#78634B] mt-0.5 leading-relaxed">
              {current.desc}
            </p>
          </div>
        </div>

        {/* POLLING KEBIJAKAN KOTA (BALAI KOTA) */}
        {current.actionType === 'vote' && (
          <div className="p-3 bg-[#EFE9D8] border border-[#D8CEBE] rounded-xl space-y-2.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8CEBE]">
              <span className="font-bold text-[#343B35] flex items-center text-xs">
                <Vote className="w-3.5 h-3.5 mr-1.5 text-[#668B65]" />
                {currentPoll.title}
              </span>
              <span className="text-[11px] text-[#78634B]">
                {isLoadingVotes ? (
                  <span className="flex items-center">
                    <Loader2 className="w-3 h-3 animate-spin mr-1 text-[#668B65]" />
                    Memuat...
                  </span>
                ) : (
                  `${totalVotes} Suara Masuk`
                )}
              </span>
            </div>

            <p className="text-xs text-[#78634B] leading-relaxed">
              {currentPoll.description}
            </p>

            <div className="space-y-1.5 pt-0.5">
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
                    className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer relative overflow-hidden block ${
                      isSelected
                        ? 'bg-[#F7F4E9] border-[#668B65] text-[#343B35]'
                        : 'bg-[#F7F4E9] border-[#D8CEBE] text-[#343B35]'
                    } ${hasVoted ? 'cursor-default' : ''}`}
                  >
                    {/* Live percentage fill bar when voted */}
                    {hasVoted && (
                      <div
                        className="absolute inset-y-0 left-0 bg-[#668B65]/15 pointer-events-none transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    )}

                    <div className="flex items-center justify-between relative z-10">
                      <div className="flex items-center space-x-2">
                        <div
                          className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-[#668B65] bg-[#668B65]'
                              : 'border-[#D8CEBE] bg-white'
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
                          <span className="font-bold text-[#668B65] text-xs">
                            {percentage}%
                          </span>
                          <span className="text-[10px] text-[#78634B] block">
                            {opt.votes} suara
                          </span>
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>

            {hasVoted && (
              <div className="p-2.5 rounded-lg bg-[#668B65]/15 border border-[#668B65]/30 text-[#668B65] text-xs font-semibold flex items-center space-x-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#668B65] flex-shrink-0" />
                <span>
                  Suaramu telah tersimpan di arsip Balai Kota (+25 Koin).
                </span>
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2.5 border-t border-[#D8CEBE]">
          {selectedBuilding === 'investor_tower' ? (
            <a
              href="https://trakteer.id/sahamnetzencity/tip"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-black text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>☕ Trakteer: @sahamnetzencity</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <div />
          )}

          <div className="flex items-center space-x-2">
            <Button variant="secondary" onClick={closeModal}>
              Tutup
            </Button>

            {current.actionType === 'vote' ? (
              <Button
                variant="primary"
                onClick={handleAction}
                disabled={hasVoted || isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                ) : (
                  <Vote className="w-3.5 h-3.5 mr-1" />
                )}
                <span>
                  {hasVoted
                    ? 'Sudah Memilih'
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
      </div>
    </Modal>
  )
}
