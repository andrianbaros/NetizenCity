// ============================================================
// NETIZENCITY - Investor Tower Modal (Fitur 9)
// Menara Investor: Daftar 103 Investor Kota + Link Trakteer
// ============================================================

'use client'

import React, { useState } from 'react'
import {
  Building2,
  ExternalLink,
  Crown,
  Heart,
  Sparkles,
  Search,
  Award,
  Coffee,
  CheckCircle2,
  Star,
  Users,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'

interface InvestorEntry {
  id: string
  name: string
  handle: string
  tier: 'sultan' | 'diamond' | 'gold' | 'silver'
  unitNumber: string
  message: string
}

const SAMPLE_INVESTORS: InvestorEntry[] = [
  {
    id: 'inv_1',
    name: 'Sultan Alun-Alun',
    handle: '@sultan_nc',
    tier: 'sultan',
    unitNumber: 'Crown Window 01',
    message: 'Maju terus NetizenCity! Kota virtual kebanggaan kita bersama.',
  },
  {
    id: 'inv_2',
    name: 'Rizki RZNN',
    handle: '@rznn8619',
    tier: 'sultan',
    unitNumber: 'Crown Window 02',
    message: 'Stadion dan kompleks olahraga keren banget!',
  },
  {
    id: 'inv_3',
    name: 'Siddiq Profesor',
    handle: '@sidddiq_s',
    tier: 'sultan',
    unitNumber: 'Crown Window 03',
    message: 'Observatorium dan lab sains Day 8 akhirnya terwujud!',
  },
  {
    id: 'inv_4',
    name: 'Aftone Moon',
    handle: '@aftone_moon',
    tier: 'diamond',
    unitNumber: 'Lantai 10 - Unit 102',
    message: 'Kebun Binatang dan satwa kota favoritku!',
  },
  {
    id: 'inv_5',
    name: 'Ji Hann',
    handle: '@ji_hann09',
    tier: 'diamond',
    unitNumber: 'Lantai 09 - Unit 94',
    message: 'Perpustakaan kota tempat ternyaman membaca.',
  },
  {
    id: 'inv_6',
    name: 'Kopi Hangat Netizen',
    handle: '@kopinetizen',
    tier: 'gold',
    unitNumber: 'Lantai 07 - Unit 72',
    message: 'Semoga kotanya makin ramai dan warganya kompak selalu!',
  },
  {
    id: 'inv_7',
    name: 'Budi Warga Baru',
    handle: '@budi_warga',
    tier: 'silver',
    unitNumber: 'Lantai 03 - Unit 31',
    message: 'Traktir kopi buat developer hebat pembangun kota.',
  },
  {
    id: 'inv_8',
    name: 'Andra Digital',
    handle: '@andra_dg',
    tier: 'silver',
    unitNumber: 'Lantai 02 - Unit 18',
    message: 'Support penuh karya anak bangsa!',
  },
]

interface InvestorModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function InvestorModal({ isOpen, onClose }: InvestorModalProps) {
  const [tab, setTab] = useState<'list' | 'trakteer'>('list')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredInvestors = SAMPLE_INVESTORS.filter(
    (inv) =>
      inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.message.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenTrakteer = () => {
    window.open('https://trakteer.id', '_blank')
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Monumen Investor Kota Netizen (103 Investor)"
      maxWidth="md"
    >
      <div className="space-y-4 font-sans text-[#343B35]">
        {/* Banner Monumen Spiral 11 Lantai */}
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white rounded-2xl p-4 flex items-center justify-between shadow-md">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-purple-500/30 border border-purple-400/40 flex items-center justify-center text-3xl shadow-inner">
              🏢
            </div>
            <div>
              <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-widest flex items-center">
                <Crown className="w-3 h-3 mr-1" />
                Monumen Investor Kota
              </span>
              <h3 className="text-sm font-extrabold text-white mt-0.5">
                Monumen Spiral 11 Lantai &amp; Halo Emas
              </h3>
              <p className="text-xs text-purple-200 mt-0.5">
                100 Jendela menyala dan 3 Crown Windows emas untuk pendukung kota.
              </p>
            </div>
          </div>

          <div className="hidden sm:block text-right">
            <span className="text-xl font-black text-amber-400">103</span>
            <span className="text-[10px] block text-purple-300 font-bold uppercase">
              Investor Terdaftar
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex rounded-xl bg-[#EFE9D8] p-1 border border-[#D8CEBE]">
          <button
            onClick={() => setTab('list')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              tab === 'list'
                ? 'bg-[#F7F4E9] text-[#343B35] shadow-xs'
                : 'text-[#78634B] hover:text-[#343B35]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Daftar Investor Kota</span>
          </button>
          <button
            onClick={() => setTab('trakteer')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              tab === 'trakteer'
                ? 'bg-rose-500 text-white shadow-xs'
                : 'text-[#78634B] hover:text-[#343B35]'
            }`}
          >
            <Coffee className="w-3.5 h-3.5 text-amber-300" />
            <span>Daftar Jadi Investor (Trakteer ☕)</span>
          </button>
        </div>

        {/* TAB 1: LIST INVESTOR */}
        {tab === 'list' && (
          <div className="space-y-3">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78634B]" />
              <input
                type="text"
                placeholder="Cari nama investor atau username..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D8CEBE] bg-[#FFFDF9] text-xs text-[#343B35] focus:outline-none focus:ring-2 focus:ring-[#668B65]"
              />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {filteredInvestors.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl border border-[#D8CEBE] bg-[#FFFDF9] flex items-start space-x-3 hover:border-purple-300 transition-colors"
                >
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
                      inv.tier === 'sultan'
                        ? 'bg-amber-100 text-amber-700 border border-amber-300'
                        : inv.tier === 'diamond'
                        ? 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                        : inv.tier === 'gold'
                        ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                        : 'bg-stone-100 text-stone-700 border border-stone-300'
                    }`}
                  >
                    {inv.tier === 'sultan' ? '👑' : inv.tier === 'diamond' ? '💎' : '🌟'}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-baseline space-x-1.5">
                        <span className="font-extrabold text-xs text-[#343B35]">
                          {inv.name}
                        </span>
                        <span className="text-[10px] text-[#78634B]">
                          {inv.handle}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFE9D8] text-[#78634B]">
                        {inv.unitNumber}
                      </span>
                    </div>

                    <p className="text-[11px] text-[#78634B] mt-1 italic">
                      "{inv.message}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: DAFTAR INVESTOR VIA TRAKTEER */}
        {tab === 'trakteer' && (
          <div className="space-y-3.5 p-1 text-center">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-100 border-2 border-rose-300 flex items-center justify-center text-3xl shadow-sm">
              ☕
            </div>

            <div>
              <h3 className="font-extrabold text-sm text-[#343B35]">
                Dukung Pembangunan Kota Lewat Trakteer
              </h3>
              <p className="text-xs text-[#78634B] mt-1 max-w-sm mx-auto">
                Setiap donasi kopi membantumu mendapatkan tempat permanen di Menara Investor dan fitur eksklusif kota!
              </p>
            </div>

            {/* Perks List */}
            <div className="bg-[#FFFDF9] border border-[#D8CEBE] rounded-2xl p-3.5 text-left space-y-2 max-w-md mx-auto text-xs">
              <span className="font-bold text-[#343B35] block mb-1.5">
                Keuntungan Eksklusif Investor Kota:
              </span>
              <div className="flex items-center space-x-2 text-[#78634B]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Nama & pesan diabadikan di Menara Investor 11 Lantai 3D</span>
              </div>
              <div className="flex items-center space-x-2 text-[#78634B]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>1 Jendela khusus menyala di Menara Spiral sesuai namamu</span>
              </div>
              <div className="flex items-center space-x-2 text-[#78634B]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Gelar Khusus "Investor Kehormatan" pada Kartu Tanda Netizen (KTN)</span>
              </div>
              <div className="flex items-center space-x-2 text-[#78634B]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Bonus 1000 Koin Warga + Akses Rusunawa VIP Balai Kota</span>
              </div>
            </div>

            {/* Big Trakteer CTA Button */}
            <div className="pt-1">
              <button
                onClick={handleOpenTrakteer}
                className="w-full max-w-sm mx-auto py-3 px-4 rounded-2xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white font-black text-sm shadow-lg hover:opacity-95 active:scale-98 transition-all flex items-center justify-center space-x-2 border-2 border-white/80"
              >
                <Coffee className="w-4 h-4 text-amber-200" />
                <span>Daftar Jadi Investor di Trakteer Sekarang ☕</span>
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-2 border-t border-[#D8CEBE]">
          <Button variant="secondary" onClick={onClose} className="font-bold text-xs">
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  )
}
