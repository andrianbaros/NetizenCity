// ============================================================
// NETIZENCITY - Kartu Tanda Netizen (KTN) Modal
// Official Citizen Identity Card Aligned with Cozy Simulation Game
// ============================================================

'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ShieldCheck,
  Copy,
  Check,
  Home,
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
        title: 'Belum Terdaftar',
        message: 'Silakan mendaftar sebagai warga untuk mendapatkan nomor KTN resmi.',
        type: 'info',
      })
      return
    }
    navigator.clipboard?.writeText(citizenData.ktnNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    addNotification({
      title: 'Nomor KTN Disalin',
      message: `${citizenData.ktnNumber} tersalin ke papan klip.`,
      type: 'info',
    })
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="Kartu Tanda Netizen" maxWidth="lg">
      <div className="space-y-4 font-sans">
        {/* Physical-style Card Display */}
        <div className="p-4 sm:p-5 rounded-xl bg-[#EFE9D8] border border-[#D8CEBE] shadow-xs">
          {/* Top Decorative Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#D8CEBE] mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#668B65] flex items-center justify-center text-white font-bold text-xs">
                NC
              </div>
              <div>
                <span className="font-bold text-xs tracking-wide text-[#343B35] uppercase block">
                  KARTU TANDA NETIZEN
                </span>
                <span className="text-[10px] text-[#78634B]">
                  Kota Virtual NETIZENCITY &bull; @netizencity.id
                </span>
              </div>
            </div>
            <div
              className={`flex items-center space-x-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold ${
                !isGuest
                  ? 'bg-[#668B65]/15 text-[#668B65] border border-[#668B65]/30'
                  : 'bg-[#F7F4E9] text-[#78634B] border border-[#D8CEBE]'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{!isGuest ? 'Terverifikasi' : 'Tamu'}</span>
            </div>
          </div>

          {/* Main Card Body */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
            {/* Avatar Photo Frame */}
            <div className="sm:col-span-4 flex flex-col items-center">
              <div className="w-24 h-28 rounded-lg bg-[#F7F4E9] border border-[#D8CEBE] flex flex-col items-center justify-center p-1 text-center">
                <canvas
                  ref={previewCanvasRef}
                  width={96}
                  height={108}
                  className="w-20 h-22 object-contain"
                />
                <span className="text-[8px] text-[#78634B] font-semibold uppercase tracking-wider mt-1">
                  {!isGuest ? 'Warga Resmi' : 'Tamu'}
                </span>
              </div>
            </div>

            {/* Citizen Details */}
            <div className="sm:col-span-8 space-y-2 text-xs text-[#343B35]">
              <div>
                <span className="text-[10px] text-[#78634B] uppercase tracking-wide block">
                  Nama Warga:
                </span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="font-bold text-sm text-[#343B35]">
                    {citizenData.displayName}
                  </span>
                  <span className="text-[#668B65] text-xs font-semibold bg-[#F7F4E9] px-2 py-0.2 rounded border border-[#D8CEBE]">
                    @{citizenData.username}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#D8CEBE]">
                <div>
                  <span className="text-[10px] text-[#78634B] uppercase block">
                    Pekerjaan:
                  </span>
                  <span className="font-semibold text-[#343B35]">{citizenData.job}</span>
                </div>
                <div>
                  <span className="text-[10px] text-[#78634B] uppercase block">
                    Tingkat:
                  </span>
                  <span className="font-semibold text-[#343B35] bg-[#F7F4E9] px-1.5 py-0.2 rounded border border-[#D8CEBE] text-[11px] inline-block">
                    Level {citizenData.level}
                  </span>
                </div>
              </div>

              <div className="pt-1 border-t border-[#D8CEBE]">
                <span className="text-[10px] text-[#78634B] uppercase block">
                  Hunian:
                </span>
                <span className="text-xs text-[#343B35] flex items-center mt-0.5">
                  <Home className="w-3.5 h-3.5 text-[#78634B] mr-1 flex-shrink-0" />
                  {citizenData.housing}
                </span>
              </div>

              <div className="pt-1 border-t border-[#D8CEBE] flex items-center justify-between text-[11px] text-[#78634B]">
                <span className="flex items-center">
                  <Calendar className="w-3 h-3 mr-1 text-[#78634B]" />
                  Bergabung: {citizenData.joinedDate}
                </span>
                <span className="font-semibold text-[#668B65]">Musim 1</span>
              </div>
            </div>
          </div>

          {/* KTN Serial Number Bar */}
          <div className="mt-4 pt-3 border-t border-[#D8CEBE] flex items-center justify-between">
            <div>
              <span className="text-[9px] text-[#78634B] uppercase tracking-wider block">
                Nomor Induk KTN:
              </span>
              <span className="font-bold text-xs text-[#343B35] tracking-wider font-mono">
                {citizenData.ktnNumber}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyKTN}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-[#F7F4E9] hover:bg-[#E2DACB] text-[#343B35] text-xs font-medium border border-[#D8CEBE] transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-[#668B65]" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Tersalin' : 'Salin KTN'}</span>
            </button>
          </div>
        </div>

        {/* Guest Banner if unauthenticated */}
        {isGuest && (
          <div className="p-3 rounded-xl bg-[#EFE9D8] border border-[#D8CEBE] flex flex-col sm:flex-row items-center justify-between gap-2.5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#F7F4E9] border border-[#D8CEBE] flex items-center justify-center text-[#78634B] flex-shrink-0">
                <UserPlus className="w-4 h-4" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-[#343B35]">
                  Kamu belum memiliki KTN Resmi
                </h5>
                <p className="text-[11px] text-[#78634B]">
                  Daftarkan dirimu untuk mendapatkan KTN digital, hunian virtual, dan penghasilan koin.
                </p>
              </div>
            </div>
            <Link
              href="/welcome"
              className="px-3 py-1.5 rounded-lg bg-[#668B65] text-white font-semibold text-xs hover:bg-[#557754] transition-colors flex items-center space-x-1 whitespace-nowrap"
            >
              <span>Daftar Warga</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end pt-1">
          <Button variant="secondary" onClick={closeModal}>
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  )
}
