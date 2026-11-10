// ============================================================
// NETIZENCITY - Cat Scavenger Hunt Modal (Fitur 3)
// Cari 5 Kucing di Seluruh Kota dan dapatkan reward koin!
// ============================================================

'use client'

import React, { useState, useEffect } from 'react'
import {
  Sparkles,
  Trophy,
  CheckCircle2,
  HelpCircle,
  Coins,
  MapPin,
  Heart,
  Award,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'
import { useUIStore } from '@/lib/stores/useUIStore'

interface CatInfo {
  id: string
  name: string
  icon: string
  color: string
  hint: string
  reward: number
}

const CITY_CATS: CatInfo[] = [
  {
    id: 'cat_oren',
    name: 'Si Oren Alun-Alun',
    icon: '🐱',
    color: '#E67E22',
    hint: 'Suka berjemur santai di dekat taman bunga air mancur Monumen Pusat Kota.',
    reward: 50,
  },
  {
    id: 'cat_mimi',
    name: 'Mimi Si Manis',
    icon: '🐈',
    color: '#F5B041',
    hint: 'Sering mengawasi rapat walikota dari lantai teras depan Balai Kota.',
    reward: 50,
  },
  {
    id: 'cat_kuro',
    name: 'Kuro Si Penjaga',
    icon: '🐈‍⬛',
    color: '#2C3E50',
    hint: 'Bersembunyi di gang samping komplek Rusunawa Harapan Baru.',
    reward: 50,
  },
  {
    id: 'cat_mochi',
    name: 'Mochi Si Belanja',
    icon: '🤍',
    color: '#FDFEFE',
    hint: 'Nongkrong menunggu sisa snack di pelataran pintu masuk Netizen Grand Mall.',
    reward: 50,
  },
  {
    id: 'cat_cimot',
    name: 'Cimot Si Petualang',
    icon: '🐾',
    color: '#7F8C8D',
    hint: 'Suka mendengar bunyi peluit kereta di dekat peron Stasiun Netizen Express.',
    reward: 50,
  },
]

interface CatHuntModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function CatHuntModal({ isOpen, onClose }: CatHuntModalProps) {
  const updateBalance = useCitizenStore((s) => s.updateBalance)
  const addNotification = useUIStore((s) => s.addNotification)

  const [foundCatIds, setFoundCatIds] = useState<string[]>([])
  const [grandRewardClaimed, setGrandRewardClaimed] = useState(false)

  // Load found cats from localStorage with Daily Reset
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const today = new Date().toISOString().split('T')[0]
        const lastReset = localStorage.getItem('nc_cats_last_reset_date')

        // Reset sehari sekali: Jika tanggal berbeda, kembalikan posisi kucing & klaim baru
        if (lastReset !== today) {
          localStorage.setItem('nc_cats_found', '[]')
          localStorage.setItem('nc_cats_grand_claimed', 'false')
          localStorage.setItem('nc_cats_last_reset_date', today)
          setFoundCatIds([])
          setGrandRewardClaimed(false)
        } else {
          const saved = JSON.parse(localStorage.getItem('nc_cats_found') || '[]')
          if (Array.isArray(saved)) setFoundCatIds(saved)
          const grandClaimed = localStorage.getItem('nc_cats_grand_claimed') === 'true'
          setGrandRewardClaimed(grandClaimed)
        }
      } catch {
        // ignore
      }
    }
  }, [isOpen])

  // Listen to cat click events from 3D world
  useEffect(() => {
    const handleCatClicked = (e: any) => {
      const cat = e.detail
      if (!cat || !cat.id) return

      setFoundCatIds((prev) => {
        if (prev.includes(cat.id)) {
          addNotification({
            title: `Meooww! 🐾`,
            message: `Kamu menyapa ${cat.name}! Kucing ini sudah pernah kamu temukan.`,
            type: 'info',
          })
          return prev
        }

        const next = [...prev, cat.id]
        if (typeof window !== 'undefined') {
          localStorage.setItem('nc_cats_found', JSON.stringify(next))
        }

        // Give individual reward (+50 coins) & persist to database
        const curWallet = useCitizenStore.getState().wallet
        const curBal = curWallet?.balance ?? 0
        updateBalance(curBal + 50)

        fetch('/api/economy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'earn',
            amount: 50,
            description: `Menemukan kucing liar: ${cat.name}`,
          }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.wallet?.balance !== undefined) {
              updateBalance(data.wallet.balance)
            }
          })
          .catch(() => {})

        addNotification({
          title: `Kucing Ditemukan! 🐱🎉`,
          message: `Kamu menemukan ${cat.name}! +50 Koin Warga masuk ke dompetmu!`,
          type: 'success',
        })

        // Check if all 5 found
        if (next.length === CITY_CATS.length) {
          addNotification({
            title: `🏆 SEMUA KUCING DITEMUKAN!`,
            message: `Selamat! Buka Menu Kucing untuk klaim Hadiah Utama +250 Koin!`,
            type: 'success',
          })
        }

        return next
      })
    }

    window.addEventListener('cat-clicked', handleCatClicked)
    return () => window.removeEventListener('cat-clicked', handleCatClicked)
  }, [updateBalance, addNotification])

  const handleClaimGrandPrize = () => {
    if (foundCatIds.length >= CITY_CATS.length && !grandRewardClaimed) {
      setGrandRewardClaimed(true)

      const curWallet = useCitizenStore.getState().wallet
      const curBal = curWallet?.balance ?? 0
      updateBalance(curBal + 250)

      fetch('/api/economy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'earn',
          amount: 250,
          description: 'Hadiah Utama: Menemukan Seluruh Kucing Kota',
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.wallet?.balance !== undefined) {
            updateBalance(data.wallet.balance)
          }
        })
        .catch(() => {})

      if (typeof window !== 'undefined') {
        localStorage.setItem('nc_cats_grand_claimed', 'true')
      }
      addNotification({
        title: 'Hadiah Utama Diklaim! 🏆✨',
        message: '+250 Koin Warga & Gelar Kehormatan "Penyelamat Kucing Netizen"!',
        type: 'success',
      })
    }
  }

  const foundCount = foundCatIds.length
  const allFound = foundCount >= CITY_CATS.length

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Misi Pencarian Kucing Kota (Scavenger Hunt)"
      maxWidth="md"
    >
      <div className="space-y-4 font-sans text-[#343B35]">
        {/* Progress Banner */}
        <div className="bg-[#EFE9D8] border border-[#D8CEBE] rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center text-2xl shadow-sm">
              🐱
            </div>
            <div>
              <span className="text-[10px] font-bold text-[#668B65] uppercase tracking-wider flex items-center">
                Misi Harian • Reset Tiap Hari Pukul 00:00 🌙
              </span>
              <h3 className="text-sm font-extrabold text-[#343B35]">
                Kucing Ditemukan: {foundCount} / {CITY_CATS.length}
              </h3>
              <p className="text-xs text-[#78634B]">
                Cari dan klik kucing-kucing lucu di seluruh penjuru kota 3D!
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-[#668B65] flex items-center justify-end">
              <Coins className="w-3.5 h-3.5 mr-1 text-amber-500" />
              +50 Koin / ekor
            </span>
            <span className="text-[10px] text-[#78634B]">Bonus Akhir: +250 Koin</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#EFE9D8] rounded-full h-2.5 overflow-hidden border border-[#D8CEBE]">
          <div
            className="bg-gradient-to-r from-amber-400 to-[#668B65] h-full transition-all duration-500 rounded-full"
            style={{ width: `${(foundCount / CITY_CATS.length) * 100}%` }}
          />
        </div>

        {/* List of 5 Cats */}
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {CITY_CATS.map((cat) => {
            const isFound = foundCatIds.includes(cat.id)
            return (
              <div
                key={cat.id}
                className={`p-3 rounded-xl border transition-all flex items-start space-x-3 ${
                  isFound
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-[#FFFDF9] border-[#D8CEBE]'
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0 border shadow-xs"
                  style={{
                    backgroundColor: isFound ? '#D1FAE5' : '#EFE9D8',
                    borderColor: isFound ? '#A7F3D0' : '#D8CEBE',
                  }}
                >
                  {cat.icon}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#343B35] flex items-center">
                      {cat.name}
                      {isFound && (
                        <CheckCircle2 className="w-3.5 h-3.5 ml-1.5 text-emerald-600 inline" />
                      )}
                    </h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isFound
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {isFound ? 'Ditemukan (+50 Koin)' : 'Belum Ketemu'}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#78634B] mt-0.5 leading-relaxed">
                    <MapPin className="w-3 h-3 inline mr-1 text-[#668B65]" />
                    {isFound ? 'Lokasi berhasil terungkap!' : `Petunjuk: ${cat.hint}`}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Grand Prize Box */}
        {allFound && (
          <div className="bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-50 border-2 border-amber-300 rounded-2xl p-3.5 text-center space-y-2 shadow-xs">
            <div className="flex items-center justify-center space-x-2 text-amber-800 font-extrabold text-xs">
              <Trophy className="w-4 h-4 text-amber-600" />
              <span>LUAR BIASA! SELURUH KUCING KOTA TELAH DISELAMATKAN!</span>
            </div>
            <p className="text-xs text-[#78634B]">
              Kamu berhak menerima Hadiah Utama dari Pak Mayor berupa{' '}
              <strong>250 Koin Warga</strong> dan Gelar Kehormatan!
            </p>
            <Button
              variant="primary"
              onClick={handleClaimGrandPrize}
              disabled={grandRewardClaimed}
              className="w-full font-bold text-xs bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Award className="w-3.5 h-3.5 mr-1.5" />
              {grandRewardClaimed
                ? 'Hadiah Utama Sudah Diklaim ✓'
                : 'Klaim Hadiah Utama (+250 Koin)'}
            </Button>
          </div>
        )}

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-[#D8CEBE]">
          <Button variant="secondary" onClick={onClose} className="text-xs font-bold">
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  )
}
