// ============================================================
// NETIZENCITY - Kartu Tanda Netizen (KTN) Modal
// Displays Official Citizen Identity Card from Active Profile
// ============================================================

'use client'

import React, { useState } from 'react'
import {
  ShieldCheck,
  Copy,
  Check,
  Home,
  Award,
  Calendar,
  QrCode,
  Sparkles,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/lib/stores/useUIStore'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'

export default function KTNCardModal() {
  const activeModal = useUIStore((s) => s.activeModal)
  const closeModal = useUIStore((s) => s.closeModal)
  const addNotification = useUIStore((s) => s.addNotification)
  const profile = useCitizenStore((s) => s.profile)

  const isOpen = activeModal === 'ktn_card'
  const [copied, setCopied] = useState(false)

  const citizenData = {
    displayName: profile?.displayName || 'Warga Netizen',
    username: profile?.username || 'warga_netizen',
    ktnNumber: profile?.ktnNumber || 'KTN-20261103-8A29F',
    joinedDate: profile?.joinedAt
      ? new Date(profile.joinedAt).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : '3 Nov 2026',
    level: profile?.level || 1,
    job: profile?.job || 'Warga Baru',
    housing: profile?.housingName || 'Rusunawa Harapan Baru Unit 304',
    district: profile?.district || 'Perumahan Utara',
    skinTone: profile?.avatarConfig?.skinTone || '#f5d0b0',
    hairColor: profile?.avatarConfig?.hairColor || '#1e293b',
    shirtColor: profile?.avatarConfig?.outfit?.top || '#2563eb',
  }

  const handleCopyKTN = () => {
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
      <div className="space-y-6">
        {/* Physical-style Card Display */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-900 via-slate-900 to-indigo-950 border-2 border-blue-500/40 shadow-2xl relative overflow-hidden">
          {/* Card Hologram & Watermark */}
          <div className="absolute top-0 right-0 w-44 h-44 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          {/* Top row */}
          <div className="flex items-center justify-between pb-3 border-b border-blue-400/20 mb-5">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md">
                NC
              </div>
              <div>
                <span className="font-black text-sm tracking-widest text-white uppercase block">
                  KARTU TANDA NETIZEN
                </span>
                <span className="text-[10px] text-blue-300 font-medium">
                  Republik Virtual NETIZENCITY &bull; @netizencity.id
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>TERVERIFIKASI</span>
            </div>
          </div>

          {/* Main Card Body */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
            {/* Avatar Photo Frame */}
            <div className="sm:col-span-4 flex flex-col items-center">
              <div className="w-24 h-32 rounded-xl bg-slate-950/90 border border-blue-400/30 flex flex-col items-center justify-center p-2 text-center shadow-inner relative overflow-hidden">
                {/* Hair */}
                <div
                  className="w-10 h-3 rounded-t-lg -mb-1 z-10"
                  style={{ backgroundColor: citizenData.hairColor }}
                />
                {/* Face */}
                <div
                  className="w-9 h-9 rounded-full mb-1 flex items-center justify-center border border-black/20"
                  style={{ backgroundColor: citizenData.skinTone }}
                >
                  <div className="flex space-x-1.5">
                    <div className="w-1 h-1 bg-black rounded-full" />
                    <div className="w-1 h-1 bg-black rounded-full" />
                  </div>
                </div>
                {/* Shirt */}
                <div
                  className="w-12 h-9 rounded-t-md flex items-center justify-center text-[8px] text-white font-bold"
                  style={{ backgroundColor: citizenData.shirtColor }}
                >
                  NC
                </div>
                <span className="text-[8px] text-slate-400 font-mono mt-0.5 uppercase">
                  AVATAR RESMI
                </span>
              </div>
            </div>

            {/* Citizen Details */}
            <div className="sm:col-span-8 space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Nama Warga:
                </span>
                <span className="font-extrabold text-white text-base">
                  {citizenData.displayName}
                </span>
                <span className="text-slate-400 text-xs ml-2">
                  (@{citizenData.username})
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Nomor Identitas KTN:
                </span>
                <div className="flex items-center space-x-2">
                  <span className="font-mono font-bold text-amber-300 tracking-wider text-sm">
                    {citizenData.ktnNumber}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyKTN}
                    title="Salin Nomor KTN"
                    className="p-1 rounded bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Level &amp; Pekerjaan:
                  </span>
                  <span className="font-semibold text-slate-200">
                    Lvl {citizenData.level} &bull; {citizenData.job}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                    Tanggal Bergabung:
                  </span>
                  <span className="font-semibold text-slate-200">
                    {citizenData.joinedDate}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Alamat Domisili Kota:
                </span>
                <span className="font-medium text-sky-200">
                  {citizenData.housing} ({citizenData.district})
                </span>
              </div>
            </div>
          </div>

          {/* Bottom Card Bar with QR Code */}
          <div className="mt-5 pt-3 border-t border-blue-400/20 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2">
              <QrCode className="w-8 h-8 text-white p-0.5 bg-slate-950 rounded border border-slate-700" />
              <div className="text-[10px] text-slate-400">
                <span>Scan untuk verifikasi profil publik</span>
                <br />
                <span className="text-blue-300 font-mono">netizencity.id/warga</span>
              </div>
            </div>
            <div className="text-right text-[10px] text-slate-500 font-mono">
              VALID PERMANEN &bull; DIGITAL CITIZEN ID
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={closeModal}>
            Tutup
          </Button>
          <Button variant="accent" onClick={handleCopyKTN}>
            {copied ? (
              <Check className="w-4 h-4 mr-1.5" />
            ) : (
              <Copy className="w-4 h-4 mr-1.5" />
            )}
            <span>{copied ? 'Tersalin!' : 'Salin Nomor KTN'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}
