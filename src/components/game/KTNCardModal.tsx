// ============================================================
// NETIZENCITY - Kartu Tanda Netizen (KTN) Modal
// Official Citizen Identity Card Aligned with Netizen City Art Style
// ============================================================

'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Copy,
  Check,
  Home,
  Award,
  Calendar,
  UserPlus,
  ArrowRight,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/lib/stores/useUIStore'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'
import { drawCharacterPreviewCanvas, resolveAvatarColors } from '@/game/utils/characterRenderer'

export default function KTNCardModal() {
  const activeModal = useUIStore((s) => s.activeModal)
  const closeModal = useUIStore((s) => s.closeModal)
  const addNotification = useUIStore((s) => s.addNotification)
  const profile = useCitizenStore((s) => s.profile)

  const isOpen = activeModal === 'ktn_card'
  const [copied, setCopied] = useState(false)
  const previewCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (isOpen && previewCanvasRef.current) {
      const colors = resolveAvatarColors(profile?.avatarConfig)
      drawCharacterPreviewCanvas(previewCanvasRef.current, colors, 3)
    }
  }, [isOpen, profile?.avatarConfig])

  const isGuest = !profile

  const citizenData = {
    displayName: profile?.displayName || 'Tamu Netizen',
    username: profile?.username || 'tamu',
    ktnNumber: profile?.ktnNumber || 'BELUM TERDAFTAR',
    joinedDate: profile?.joinedAt
      ? new Date(profile.joinedAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : 'Hari Ini (Tamu)',
    level: profile?.level || 0,
    job: profile?.job || 'Pengunjung Kota',
    housing: profile?.housingName || 'Belum Memiliki Hunian',
    district: profile?.district || 'Pusat Kota',
    skinTone: profile?.avatarConfig?.skinTone || '#f5d0b0',
    hairColor: profile?.avatarConfig?.hairColor || '#1e293b',
    shirtColor: profile?.avatarConfig?.outfit?.top || '#2563eb',
  }

  const handleCopyKTN = () => {
    if (isGuest) {
      addNotification({
        title: 'Belum Terdaftar 📋',
        message: 'Silakan mendaftar sebagai warga untuk mendapatkan nomor KTN resmi.',
        type: 'info',
      })
      return
    }
    navigator.clipboard?.writeText(citizenData.ktnNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    addNotification({
      title: 'Nomor KTN Disalin! 📋',
      message: `${citizenData.ktnNumber} tersalin ke papan klip.`,
      type: 'info',
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="KARTU TANDA NETIZEN (KTN)" maxWidth="lg">
      <div className="space-y-6 font-sans">
        {/* Physical-style Card Display (Official Netizen City Pastel ID) */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FFFDF9] via-[#FFF9F1] to-[#FFF3E6] border-2 border-[#EADBCC] shadow-[0_16px_40px_rgba(70,50,60,0.12)] relative overflow-hidden">
          {/* Top Decorative Header */}
          <div className="flex items-center justify-between pb-4 border-b-2 border-[#F0E4D5] mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F4A98C] to-[#E88968] flex items-center justify-center text-white font-heading font-black text-sm shadow-xs border border-[#D97858]">
                NC
              </div>
              <div>
                <span className="font-heading font-extrabold text-sm tracking-wider text-[#3B3340] uppercase block">
                  KARTU TANDA NETIZEN
                </span>
                <span className="text-[11px] text-[#8C7D91] font-medium">
                  Republik Virtual NETIZENCITY &bull; @netizencity.id
                </span>
              </div>
            </div>
            <div
              className={`flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-heading font-bold shadow-xs ${
                !isGuest
                  ? 'bg-[#EBF8F3] text-[#1E5D46] border border-[#B7E7D5]'
                  : 'bg-[#FFF4E6] text-[#A65B20] border border-[#FCD8B5]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{!isGuest ? 'TERVERIFIKASI ✓' : 'PASS PENGUNJUNG'}</span>
            </div>
          </div>

          {/* Main Card Body */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
            {/* Avatar Photo Frame with Signature Gradient Ring */}
            <div className="sm:col-span-4 flex flex-col items-center">
              <div className="p-1 rounded-2xl bg-gradient-to-tr from-[#F4A98C] via-[#F2C1D6] to-[#C9B8E8] shadow-md">
                <div className="w-24 h-32 rounded-xl bg-[#FFFDF9] border border-[#EADBCC] flex flex-col items-center justify-center p-1 text-center shadow-inner relative overflow-hidden">
                  <canvas
                    ref={previewCanvasRef}
                    width={96}
                    height={108}
                    className="w-20 h-24 drop-shadow-xs"
                    style={{ imageRendering: 'pixelated' }}
                  />
                  <span className="text-[8px] text-[#8C7D91] font-heading font-bold uppercase tracking-wider">
                    WARGA RESMI
                  </span>
                </div>
              </div>
            </div>

            {/* Citizen Details */}
            <div className="sm:col-span-8 space-y-2.5 text-xs text-[#3B3340]">
              <div>
                <span className="text-[10px] text-[#8C7D91] font-heading font-bold uppercase tracking-wider block">
                  Nama Warga:
                </span>
                <span className="font-heading font-extrabold text-[#3B3340] text-base">
                  {citizenData.displayName}
                </span>
                <span className="text-[#2F9474] font-heading font-bold text-xs ml-2 bg-[#EBF8F3] px-2 py-0.5 rounded-full border border-[#B7E7D5]">
                  @{citizenData.username}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#F0E4D5]">
                <div>
                  <span className="text-[10px] text-[#8C7D91] font-heading font-bold uppercase block">
                    Pekerjaan:
                  </span>
                  <span className="font-heading font-bold text-[#3B3340]">{citizenData.job}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#8C7D91] font-heading font-bold uppercase block">
                    Tingkat Warga:
                  </span>
                  <span className="font-heading font-bold text-[#6A4D07] bg-[#FFF5D0] px-2 py-0.5 rounded-lg border border-[#ECC956] text-[11px] inline-block">
                    Level {citizenData.level}
                  </span>
                </div>
              </div>

              <div className="pt-1 border-t border-[#F0E4D5]">
                <span className="text-[10px] text-[#8C7D91] font-heading font-bold uppercase block">
                  Tempat Tinggal:
                </span>
                <span className="font-medium text-xs text-[#3B3340] flex items-center mt-0.5">
                  <Home className="w-3.5 h-3.5 text-[#F4A98C] mr-1.5 flex-shrink-0" />
                  {citizenData.housing}
                </span>
              </div>

              <div className="pt-1 border-t border-[#F0E4D5] flex items-center justify-between text-[11px] text-[#8C7D91]">
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1 text-[#8C7D91]" />
                  Bergabung: {citizenData.joinedDate}
                </span>
                <span className="font-heading font-bold text-[#D97858]">Musim 1</span>
              </div>
            </div>
          </div>

          {/* KTN Serial Number Bar */}
          <div className="mt-5 pt-3 border-t-2 border-[#F0E4D5] flex items-center justify-between">
            <div>
              <span className="text-[9px] text-[#8C7D91] font-heading font-bold uppercase tracking-wider block">
                Nomor Induk KTN:
              </span>
              <span className="font-heading font-extrabold text-sm text-[#3B3340] tracking-widest">
                {citizenData.ktnNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyKTN}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-[#FFF0E6] hover:bg-[#FFE5D6] text-[#D97858] font-heading font-bold text-xs border border-[#F4C8B4] border-b-2 border-b-[#E2A68C] transition-all active:translate-y-0.5 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#2F9474]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin KTN'}</span>
            </button>
          </div>
        </div>

        {/* Guest Banner if unauthenticated */}
        {isGuest && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FFF5EC] to-[#FDF0EE] border-2 border-[#F4C8B4] flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#FFFDF9] border border-[#F4C8B4] flex items-center justify-center text-[#D97858] flex-shrink-0">
                <UserPlus className="w-5 h-5" />
              </div>
              <div>
                <h5 className="font-heading font-bold text-xs text-[#3B3340]">
                  Kamu belum memiliki KTN Resmi
                </h5>
                <p className="text-[11px] text-[#7A6E7E] mt-0.5">
                  Daftarkan dirimu untuk mendapatkan KTN digital, hunian virtual, dan penghasilan koin harian.
                </p>
              </div>
            </div>
            <Link
              href="/welcome"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#F4A98C] to-[#E88968] text-white font-heading font-bold text-xs shadow-md hover:scale-105 transition-transform flex items-center space-x-1 whitespace-nowrap"
            >
              <span>Daftar Warga Baru</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3">
          <Button variant="peach" size="md" onClick={closeModal}>
            Tutup KTN
          </Button>
        </div>
      </div>
    </Modal>
  )
}
