// ============================================================
// NETIZENCITY - Kebun Warga (Shopee Tanam Style) (Fitur 6)
// Tombol & Pratinjau Fitur Menanam Netizen City
// ============================================================

'use client'

import React from 'react'
import {
  Sprout,
  Droplets,
  Coins,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  HeartHandshake,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface GardenModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function GardenModal({ isOpen, onClose }: GardenModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Kebun Netizen (Shopee Tanam)"
      maxWidth="md"
    >
      <div className="space-y-4 font-sans text-[#343B35]">
        {/* Banner Segera Hadir */}
        <div className="bg-[#EFE9D8] border border-[#D8CEBE] rounded-2xl p-4 flex items-start space-x-3.5 shadow-inner">
          <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-3xl flex-shrink-0 shadow-sm animate-bounce">
            🌱
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wide border border-emerald-300">
              <Clock className="w-3 h-3" />
              <span>Segera Hadir • Dalam Pengerjaan</span>
            </div>
            <h3 className="text-sm font-extrabold text-[#343B35] mt-1">
              Lahan Kebun Pertanian Warga NetizenCity
            </h3>
            <p className="text-xs text-[#78634B] mt-0.5 leading-relaxed">
              Dinas Pertamanan dan Lingkungan Hidup sedang menyiapkan petak tanah subur, sumur air tawar, dan bibit unggul kota untuk seluruh warga ber-KTN!
            </p>
          </div>
        </div>

        {/* Sneak Peek Preview of Mechanics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-3 rounded-2xl border border-[#D8CEBE] bg-[#FFFDF9] text-center space-y-1">
            <span className="text-2xl block">🌱</span>
            <h4 className="text-xs font-bold text-[#343B35]">Tanam Bibit</h4>
            <p className="text-[11px] text-[#78634B] leading-tight">
              Pilih Pohon Koin, Bunga Melati, atau Pohon Emas Sultan.
            </p>
          </div>

          <div className="p-3 rounded-2xl border border-[#D8CEBE] bg-[#FFFDF9] text-center space-y-1">
            <span className="text-2xl block">💧</span>
            <h4 className="text-xs font-bold text-[#343B35]">Siram Berkala</h4>
            <p className="text-[11px] text-[#78634B] leading-tight">
              Siram air beberapa jam sekali atau minta bantuan tetangga.
            </p>
          </div>

          <div className="p-3 rounded-2xl border border-[#D8CEBE] bg-[#FFFDF9] text-center space-y-1">
            <span className="text-2xl block">💰</span>
            <h4 className="text-xs font-bold text-[#343B35]">Panen Koin</h4>
            <p className="text-[11px] text-[#78634B] leading-tight">
              Petik hasil panen melimpah langsung menjadi saldo dompet warga!
            </p>
          </div>
        </div>

        {/* Expected Crops Preview */}
        <div className="border border-[#D8CEBE] rounded-2xl p-3 bg-[#FFFDF9] space-y-2">
          <span className="text-xs font-bold text-[#343B35] flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
            Bocoran Bibit Yang Akan Tersedia:
          </span>
          <div className="space-y-1.5 text-xs text-[#78634B]">
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#F7F4E9] border border-[#D8CEBE]">
              <span className="font-bold flex items-center text-[#343B35]">
                <span className="mr-1.5">🌳</span> Pohon Koin Warga
              </span>
              <span className="font-extrabold text-[#668B65] text-xs">
                +120 Koin Warga
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#F7F4E9] border border-[#D8CEBE]">
              <span className="font-bold flex items-center text-[#343B35]">
                <span className="mr-1.5">🌸</span> Bunga Melati Tugu
              </span>
              <span className="font-extrabold text-[#668B65] text-xs">
                +80 Koin Warga
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#F7F4E9] border border-[#D8CEBE]">
              <span className="font-bold flex items-center text-[#343B35]">
                <span className="mr-1.5">🌲</span> Pohon Emas Sultan
              </span>
              <span className="font-extrabold text-[#668B65] text-xs">
                +300 Koin Warga
              </span>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2 border-t border-[#D8CEBE]">
          <Button variant="primary" onClick={onClose} className="font-bold text-xs bg-[#668B65] hover:bg-[#527051]">
            Nantikan Rilisnya! ✓
          </Button>
        </div>
      </div>
    </Modal>
  )
}
