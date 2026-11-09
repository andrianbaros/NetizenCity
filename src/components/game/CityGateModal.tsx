// ============================================================
// NETIZENCITY - City Gate & Immigration Modal (Fitur 1)
// Gate akses: Wajib Login / Daftar KTN & Follow Instagram
// ============================================================

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ShieldCheck,
  UserPlus,
  LogIn,
  Sparkles,
  Ticket,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Coins,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react'
import { InstagramIcon } from '@/components/ui/InstagramIcon'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'
import { useUIStore } from '@/lib/stores/useUIStore'

interface CityGateModalProps {
  isOpen: boolean
  onSuccess: () => void
}

export default function CityGateModal({ isOpen, onSuccess }: CityGateModalProps) {
  const router = useRouter()
  const profile = useCitizenStore((s) => s.profile)
  const setProfile = useCitizenStore((s) => s.setProfile)
  const updateBalance = useCitizenStore((s) => s.updateBalance)
  const addNotification = useUIStore((s) => s.addNotification)

  const [hasFollowedIG, setHasFollowedIG] = useState(false)
  const [claimedBonus, setClaimedBonus] = useState(false)
  const [isCreatingGuest, setIsCreatingGuest] = useState(false)

  // Load follow status from localStorage on client
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedFollow = localStorage.getItem('nc_ig_followed') === 'true'
      setHasFollowedIG(savedFollow)
      const savedBonus = localStorage.getItem('nc_ig_bonus_claimed') === 'true'
      setClaimedBonus(savedBonus)
    }
  }, [])

  const handleOpenInstagram = () => {
    window.open('https://instagram.com/netizencity.id', '_blank')
    setHasFollowedIG(true)
    if (typeof window !== 'undefined') {
      localStorage.setItem('nc_ig_followed', 'true')
    }
  }

  const handleClaimFollowBonus = () => {
    if (!claimedBonus) {
      setClaimedBonus(true)
      updateBalance(100)
      if (typeof window !== 'undefined') {
        localStorage.setItem('nc_ig_bonus_claimed', 'true')
      }
      addNotification({
        title: 'Bonus Follow Diklaim! 🎉',
        message: '+100 Koin Warga telah ditambahkan ke dompetmu!',
        type: 'success',
      })
    }
  }

  // Quick Guest KTN generator for visitors
  const handleCreateGuestKTN = async () => {
    setIsCreatingGuest(true)
    try {
      const guestNum = Math.floor(1000 + Math.random() * 9000)
      const guestUsername = `tamu_${guestNum}`
      const guestEmail = `${guestUsername}@netizencity.id`
      const guestPassword = `guest_${guestNum}_pass`

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: guestEmail,
          password: guestPassword,
          username: guestUsername,
          displayName: `Wisatawan ${guestNum}`,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.citizen) {
          setProfile({
            id: data.citizen.id,
            userId: data.citizen.user_id,
            username: data.citizen.username,
            displayName: data.citizen.display_name,
            ktnNumber: data.citizen.ktn_number,
            avatarConfig: data.citizen.avatar_config,
            level: 1,
            xp: 0,
            job: 'Wisatawan Tamu',
            housingId: 'rusun-guest-01',
            housingName: 'Rusunawa Harapan Baru',
            district: 'Perumahan Utara',
            biography: 'Warga baru yang sedang menjelajahi kota!',
            isOnline: true,
            role: 'citizen',
            lastLocation: null,
            joinedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })

          addNotification({
            title: 'KTN Tamu Berhasil Dibuat! 🎫',
            message: `Selamat datang di NetizenCity, Wisatawan ${guestNum}!`,
            type: 'success',
          })

          onSuccess()
          return
        }
      }
      // Fallback: grant temporary profile in memory
      setProfile({
        id: `guest-${guestNum}`,
        userId: `guest-${guestNum}`,
        username: guestUsername,
        displayName: `Wisatawan ${guestNum}`,
        ktnNumber: `KTN-202611-${guestNum}`,
        avatarConfig: {
          skinTone: '#f5d0b0',
          hairStyle: 'short',
          hairColor: '#1e293b',
          shirtColor: '#2563eb',
          pantsColor: '#1e293b',
          shoesColor: '#f1f5f9',
          eyeColor: '#000000',
          expression: 'happy',
        },
        level: 1,
        xp: 0,
        job: 'Wisatawan Tamu',
        housingId: 'rusun-guest-01',
        housingName: 'Rusunawa Harapan Baru',
        district: 'Perumahan Utara',
        biography: 'Warga tamu Netizen City',
        isOnline: true,
        role: 'citizen',
        lastLocation: null,
        joinedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      onSuccess()
    } catch {
      onSuccess()
    } finally {
      setIsCreatingGuest(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}}
      title="Gerbang Masuk NETIZENCITY"
      maxWidth="md"
    >
      <div className="space-y-4 font-sans text-[#343B35]">
        {/* Banner Gerbang Imigrasi */}
        <div className="bg-[#EFE9D8] border border-[#D8CEBE] rounded-2xl p-4 flex items-start space-x-3.5 shadow-inner">
          <div className="w-12 h-12 rounded-xl bg-[#668B65] text-white flex items-center justify-center flex-shrink-0 shadow-sm text-2xl">
            🏛️
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-[#668B65]/15 text-[#668B65] text-[10px] font-extrabold uppercase tracking-wide border border-[#668B65]/30">
              <ShieldCheck className="w-3 h-3" />
              <span>Pemeriksaan Identitas Kota</span>
            </div>
            <h3 className="text-sm font-extrabold text-[#343B35] mt-1">
              Selamat Datang di Pintu Gerbang Netizen City!
            </h3>
            <p className="text-xs text-[#78634B] mt-0.5 leading-relaxed">
              Sesuai Peraturan Balai Kota, seluruh pengunjung wajib memiliki identitas resmi berupa{' '}
              <strong>Kartu Tanda Netizen (KTN)</strong> untuk dapat menjelajahi kota 3D.
            </p>
          </div>
        </div>

        {/* STEP 1: FOLLOW INSTAGRAM */}
        <div className="border border-[#D8CEBE] rounded-2xl p-3.5 bg-[#FFFDF9] space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#343B35] flex items-center">
              <InstagramIcon className="w-3.5 h-3.5 mr-1.5" />
              Langkah 1: Ikuti Instagram Resmi
            </span>
            {hasFollowedIG ? (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Terverifikasi
              </span>
            ) : (
              <span className="text-[10px] font-bold text-[#78634B] bg-[#EFE9D8] px-2 py-0.5 rounded-full">
                Dapat +100 Koin
              </span>
            )}
          </div>
          <p className="text-xs text-[#78634B]">
            Dapatkan info update pembangunan harian, polling walikota, dan event kota di{' '}
            <strong className="text-[#343B35]">@netizencity.id</strong>
          </p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={handleOpenInstagram}
              className="inline-flex items-center px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 text-white font-bold text-xs hover:opacity-90 transition-opacity shadow-xs"
            >
              <InstagramIcon className="w-3.5 h-3.5 mr-1.5" />
              <span>Buka @netizencity.id</span>
              <ExternalLink className="w-3 h-3 ml-1.5 opacity-80" />
            </button>
            <button
              onClick={handleClaimFollowBonus}
              disabled={claimedBonus}
              className={`inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                claimedBonus
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                  : 'bg-[#F7F4E9] text-[#78634B] border-[#D8CEBE] hover:bg-[#EFE9D8]'
              }`}
            >
              <Coins className="w-3.5 h-3.5 mr-1 text-amber-500" />
              {claimedBonus ? 'Bonus +100 Koin Diklaim ✓' : 'Saya Sudah Follow'}
            </button>
          </div>
        </div>

        {/* STEP 2: PILIHAN MASUK / KTN */}
        <div className="border border-[#D8CEBE] rounded-2xl p-3.5 bg-[#FFFDF9] space-y-3">
          <span className="text-xs font-bold text-[#343B35] flex items-center">
            <Ticket className="w-3.5 h-3.5 mr-1.5 text-[#668B65]" />
            Langkah 2: Pilih Metode Masuk Kota
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Opsi 1: Daftar KTN Baru via Instagram */}
            <button
              onClick={() => router.push('/register')}
              className="flex flex-col text-left p-3.5 rounded-xl border-2 border-[#668B65] bg-[#668B65]/10 hover:bg-[#668B65]/20 transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-extrabold text-[#343B35] flex items-center">
                  <UserPlus className="w-4 h-4 mr-1.5 text-[#668B65]" />
                  Daftar Warga via IG
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#668B65] group-hover:translate-x-1 transition-transform" />
              </div>
              <span className="text-[11px] text-[#78634B] mt-1 leading-snug">
                Daftar dengan username IG, dapat KTN resmi, rusun gratis, & +600 Koin Warga.
              </span>
            </button>

            {/* Opsi 2: Sudah Punya Akun */}
            <button
              onClick={() => router.push('/login')}
              className="flex flex-col text-left p-3.5 rounded-xl border border-[#D8CEBE] bg-[#F7F4E9] hover:bg-[#EFE9D8] transition-all group cursor-pointer"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-extrabold text-[#343B35] flex items-center">
                  <LogIn className="w-4 h-4 mr-1.5 text-[#78634B]" />
                  Masuk Akun Warga
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-[#78634B] group-hover:translate-x-1 transition-transform" />
              </div>
              <span className="text-[11px] text-[#78634B] mt-1 leading-snug">
                Bagi warga yang sudah pernah mendaftar dengan akun Instagram terverifikasi.
              </span>
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
