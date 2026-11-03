'use client'

import React from 'react'
import { ShieldCheck, Download, Home, Award, Calendar, QrCode } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useUIStore } from '@/lib/stores/useUIStore'

export default function KTNCardModal() {
  const activeModal = useUIStore((s) => s.activeModal)
  const closeModal = useUIStore((s) => s.closeModal)

  const isOpen = activeModal === 'ktn_card'

  const citizenData = {
    displayName: 'Warga Netizen',
    username: 'warga_01',
    ktnNumber: 'KTN-20261103-8A29F',
    joinedDate: '3 Nov 2026',
    level: 1,
    job: 'Kurir Pengiriman',
    housing: 'Rusunawa Harapan Baru Unit 304',
    district: 'Perumahan Utara',
  }

  const handleDownload = () => {
    alert('Kartu Tanda Netizen (KTN) berhasil diunduh ke perangkatmu!')
  }

  return (
    <Modal isOpen={isOpen} onClose={closeModal} title="KARTU TANDA NETIZEN (KTN)" maxWidth="lg">
      <div className="space-y-6 pointer-events-auto select-auto">
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
              <div className="w-24 h-32 rounded-xl bg-slate-950/90 border border-blue-400/30 flex flex-col items-center justify-center p-2 text-center shadow-inner">
                {/* 2D avatar face representation */}
                <div className="w-10 h-10 rounded-full bg-amber-200 border-2 border-amber-900 mb-1 flex items-center justify-center">
                  <div className="flex space-x-1.5">
                    <div className="w-1 h-1 bg-black rounded-full" />
                    <div className="w-1 h-1 bg-black rounded-full" />
                  </div>
                </div>
                <div className="w-12 h-8 rounded-t bg-blue-600 flex items-center justify-center text-[8px] text-white font-bold">
                  NC
                </div>
                <span className="text-[9px] text-slate-400 font-mono mt-1">
                  OFFICIAL AVATAR
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
                  Nomor KTN:
                </span>
                <span className="font-mono font-bold text-amber-300 tracking-wider text-sm">
                  {citizenData.ktnNumber}
                </span>
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
                  {citizenData.housing}
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
              VALID FOREVER &bull; DIGITAL CITIZEN
            </div>
          </div>
        </div>

        {/* Action button */}
        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={closeModal}>
            Tutup
          </Button>
          <Button variant="accent" onClick={handleDownload}>
            <Download className="w-4 h-4" />
            <span>Unduh KTN (Gambar)</span>
          </Button>
        </div>
      </div>
    </Modal>
  )
}
