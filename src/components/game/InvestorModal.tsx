// ============================================================
// NETIZENCITY - Investor Tower Modal (Fitur 9)
// Menara Investor: Daftar 103 Investor Kota + Link Trakteer Resmi
// Connected to: https://trakteer.id/sahamnetzencity/tip (@sahamnetzencity)
// ============================================================

'use client'

import React, { useState, useEffect } from 'react'
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
  Copy,
  Check,
  Send,
  Loader2,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'
import { useUIStore } from '@/lib/stores/useUIStore'

export interface InvestorEntry {
  id: string
  name: string
  handle: string
  tier: 'sultan' | 'diamond' | 'gold' | 'silver'
  unitNumber: string
  message: string
  trakteer_order_id?: string
  amount?: number
  created_at?: string
}

const TRAKTEER_URL = 'https://trakteer.id/sahamnetzencity/tip'
const TRAKTEER_HANDLE = '@sahamnetzencity'
const TRAKTEER_NAME = 'Mayor Netizen City'

const QUICK_TIERS = [
  { qty: 1, price: 'Rp 5.000', label: '1 Kopi', tier: 'silver', bonus: '1.000 Koin', desc: 'Jendela Lantai 1-3' },
  { qty: 3, price: 'Rp 15.000', label: '3 Kopi', tier: 'silver', bonus: '3.500 Koin', desc: 'Jendela Lantai 1-3' },
  { qty: 5, price: 'Rp 25.000', label: '5 Kopi', tier: 'gold', bonus: '6.500 Koin', desc: 'Jendela Emas Lantai 4-7' },
  { qty: 10, price: 'Rp 50.000', label: '10 Kopi', tier: 'diamond', bonus: '15.000 Koin', desc: 'Jendela Berlian Lantai 8-10' },
  { qty: 20, price: 'Rp 100.000', label: '20 Kopi Sultan', tier: 'sultan', bonus: '35.000 Koin', desc: 'Crown Window di Puncak Spiral 3D' },
]

interface InvestorModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function InvestorModal({ isOpen, onClose }: InvestorModalProps) {
  const [tab, setTab] = useState<'list' | 'trakteer' | 'claim'>('list')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)
  const [investors, setInvestors] = useState<InvestorEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)

  // Claim Form State
  const profile = useCitizenStore((s) => s.profile)
  const addNotification = useUIStore((s) => s.addNotification)
  const [claimName, setClaimName] = useState(profile?.displayName || profile?.username || '')
  const [claimHandle, setClaimHandle] = useState(profile?.username ? `@${profile.username}` : '')
  const [claimOrderId, setClaimOrderId] = useState('')
  const [claimMessage, setClaimMessage] = useState('')
  const [claimQty, setClaimQty] = useState(1)
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false)
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null)

  // Fetch live investors list from backend
  const fetchInvestors = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/trakteer')
      if (res.ok) {
        const data = await res.json()
        if (data.investors && Array.isArray(data.investors)) {
          setInvestors(data.investors)
        }
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isOpen) {
      fetchInvestors()
      if (profile) {
        setClaimName(profile.displayName || profile.username || '')
        setClaimHandle(profile.username ? `@${profile.username}` : '')
      }
    }
  }, [isOpen, profile])

  const filteredInvestors = investors.filter(
    (inv) =>
      inv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.handle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.message.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleOpenTrakteer = (qty?: number) => {
    const url = qty ? `${TRAKTEER_URL}?quantity=${qty}` : TRAKTEER_URL
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(TRAKTEER_URL)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
    addNotification({
      title: 'Trakteer Link Disalin!',
      message: 'Link Trakteer Mayor Netizen City berhasil disalin ke clipboard.',
      type: 'info',
    })
  }

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!claimName.trim()) {
      addNotification({ title: 'Nama Diperlukan', message: 'Harap masukkan nama donatur Anda.', type: 'warning' })
      return
    }

    try {
      setIsSubmittingClaim(true)
      const amount = claimQty * 5000
      const res = await fetch('/api/trakteer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: claimName.trim(),
          handle: claimHandle.trim() || undefined,
          message: claimMessage.trim() || undefined,
          orderId: claimOrderId.trim() || undefined,
          amount,
          citizenId: profile?.id,
        }),
      })

      const data = await res.json()
      if (res.ok && data.success) {
        setClaimSuccess(`🎉 Selamat! Nama ${claimName} berhasil diukir di Menara Investor 3D!`)
        addNotification({
          title: 'Klaim Investor Berhasil! 🏢',
          message: `Terima kasih! Kamu mendapatkan tempat di Menara Investor dan bonus koin warga!`,
          type: 'success',
        })
        fetchInvestors()
        setTimeout(() => {
          setTab('list')
          setClaimSuccess(null)
          setClaimOrderId('')
          setClaimMessage('')
        }, 2500)
      } else {
        throw new Error(data.error || 'Gagal memproses klaim investor')
      }
    } catch (err: any) {
      addNotification({ title: 'Gagal Klaim', message: err.message || 'Terjadi kesalahan.', type: 'error' })
    } finally {
      setIsSubmittingClaim(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Monumen Investor Kota Netizen (103 Investor)"
      maxWidth="md"
    >
      <div className="space-y-4 font-sans text-[#343B35]">
        {/* Banner Monumen Spiral 11 Lantai & Akun Trakteer Resmi */}
        <div className="bg-gradient-to-r from-purple-950 via-indigo-900 to-rose-950 text-white rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md border border-white/10">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-purple-600 border border-white/30 flex items-center justify-center text-2xl shadow-inner shrink-0">
              ☕
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-black text-amber-300 uppercase tracking-widest flex items-center">
                  <Crown className="w-3 h-3 mr-1" />
                  Monumen Investor 3D
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/30">
                  Trakteer: {TRAKTEER_HANDLE}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white mt-0.5">
                {TRAKTEER_NAME}
              </h3>
              <p className="text-xs text-purple-200 mt-0.5">
                100 Jendela menyala dan 3 Crown Windows emas untuk pendukung kota.
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-white/15 pt-2 sm:pt-0">
            <span className="text-xl sm:text-2xl font-black text-amber-400">
              {investors.length}
            </span>
            <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider">
              Investor Terdaftar
            </span>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex rounded-xl bg-[#EFE9D8] p-1 border border-[#D8CEBE]">
          <button
            type="button"
            onClick={() => setTab('list')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              tab === 'list'
                ? 'bg-[#F7F4E9] text-[#343B35] shadow-xs'
                : 'text-[#78634B] hover:text-[#343B35]'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Daftar Investor ({investors.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('trakteer')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              tab === 'trakteer'
                ? 'bg-gradient-to-r from-rose-500 to-amber-500 text-white shadow-xs'
                : 'text-[#78634B] hover:text-[#343B35]'
            }`}
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Traktir Mayor (Trakteer ☕)</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('claim')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer ${
              tab === 'claim'
                ? 'bg-[#668B65] text-white shadow-xs'
                : 'text-[#78634B] hover:text-[#343B35]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Klaim Nama</span>
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
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-[#78634B]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#668B65] mb-2" />
                  <span className="text-xs font-bold">Memuat daftar investor...</span>
                </div>
              ) : filteredInvestors.length === 0 ? (
                <div className="py-8 text-center text-[#78634B]">
                  <p className="text-xs font-bold">Tidak ada investor yang cocok dengan pencarian.</p>
                </div>
              ) : (
                filteredInvestors.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-3 rounded-xl border border-[#D8CEBE] bg-[#FFFDF9] flex items-start space-x-3 hover:border-purple-300 transition-colors"
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0 ${
                        inv.tier === 'sultan'
                          ? 'bg-amber-100 text-amber-700 border border-amber-300 ring-2 ring-amber-300/40'
                          : inv.tier === 'diamond'
                          ? 'bg-cyan-100 text-cyan-700 border border-cyan-300'
                          : inv.tier === 'gold'
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
                          : 'bg-stone-100 text-stone-700 border border-stone-300'
                      }`}
                    >
                      {inv.tier === 'sultan' ? '👑' : inv.tier === 'diamond' ? '💎' : inv.tier === 'gold' ? '🌟' : '☕'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-baseline space-x-1.5 truncate">
                          <span className="font-extrabold text-xs text-[#343B35] truncate">
                            {inv.name}
                          </span>
                          <span className="text-[10px] text-[#78634B] shrink-0">
                            {inv.handle}
                          </span>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EFE9D8] text-[#78634B] shrink-0">
                          {inv.unitNumber}
                        </span>
                      </div>

                      <p className="text-[11px] text-[#78634B] mt-1 italic break-words">
                        "{inv.message}"
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* TAB 2: DAFTAR INVESTOR VIA TRAKTEER */}
        {tab === 'trakteer' && (
          <div className="space-y-3.5 p-1 text-center">
            {/* Creator Badge Box */}
            <div className="bg-gradient-to-br from-rose-50 via-[#FFFDF9] to-amber-50 border-2 border-rose-200 rounded-2xl p-3.5 text-center">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-2xl shadow-md text-white mb-2">
                ☕
              </div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#343B35]">
                Trakteer Resmi: {TRAKTEER_NAME}
              </h3>
              <p className="text-xs text-rose-600 font-bold mt-0.5">
                {TRAKTEER_HANDLE} &bull; Trakteer.id
              </p>
              <div className="mt-2.5 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenTrakteer()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 via-rose-600 to-amber-500 text-white font-extrabold text-xs shadow-md hover:opacity-95 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Coffee className="w-3.5 h-3.5 text-amber-200" />
                  <span>Buka Halaman Trakteer</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 rounded-xl bg-[#F7F4E9] hover:bg-[#EFE9D8] text-[#343B35] font-bold text-xs border border-[#D8CEBE] transition-all flex items-center gap-1 cursor-pointer"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#78634B]" />}
                  <span>{copiedLink ? 'Tersalin' : 'Salin Link'}</span>
                </button>
              </div>
            </div>

            {/* Quick Tip Tiers */}
            <div className="text-left">
              <span className="text-xs font-black text-[#343B35] block mb-2">
                Pilih Paket Traktir Kopi:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {QUICK_TIERS.map((tier) => (
                  <button
                    key={tier.qty}
                    type="button"
                    onClick={() => handleOpenTrakteer(tier.qty)}
                    className="p-2.5 rounded-xl border border-[#D8CEBE] bg-[#FFFDF9] hover:border-rose-400 hover:bg-rose-50/40 text-left transition-all active:scale-98 flex items-center justify-between group cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs text-[#343B35] group-hover:text-rose-700">
                          {tier.label}
                        </span>
                        <span className="text-[10px] font-black px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                          {tier.price}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#78634B] block mt-0.5">
                        {tier.desc} &bull; +{tier.bonus}
                      </span>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-[#78634B] group-hover:text-rose-600 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Perks List */}
            <div className="bg-[#FFFDF9] border border-[#D8CEBE] rounded-2xl p-3.5 text-left space-y-2 text-xs">
              <span className="font-bold text-[#343B35] block mb-1">
                Keuntungan Eksklusif Investor Kota:
              </span>
              <div className="flex items-center space-x-2 text-[#78634B]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Nama &amp; pesan abadi di Menara Investor 11 Lantai 3D</span>
              </div>
              <div className="flex items-center space-x-2 text-[#78634B]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>1 Jendela khusus menyala di Menara Spiral sesuai namamu</span>
              </div>
              <div className="flex items-center space-x-2 text-[#78634B]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Gelar "Investor Kehormatan" pada Kartu Tanda Netizen (KTN)</span>
              </div>
              <div className="flex items-center space-x-2 text-[#78634B]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Bonus ribuan Koin Warga + Notifikasi siaran live ke seluruh warga</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: KLAIM NAMA DI MENARA */}
        {tab === 'claim' && (
          <form onSubmit={handleClaimSubmit} className="space-y-3 text-left">
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 leading-relaxed">
              <p className="font-bold mb-0.5">Sudah mentraktir kopi di Trakteer?</p>
              <p className="text-[11px] text-purple-800">
                Masukkan nama donatur dan Order ID Trakteer Anda di bawah ini agar sistem langsung mengukir nama Anda di Menara Investor 3D dan memberikan bonus koin!
              </p>
            </div>

            {claimSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 font-bold animate-in fade-in">
                {claimSuccess}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#343B35] mb-1">
                Nama Donatur (Sesuai di Trakteer) *
              </label>
              <input
                type="text"
                required
                maxLength={32}
                value={claimName}
                onChange={(e) => setClaimName(e.target.value)}
                placeholder="Contoh: Budi Santoso / Sultan Alun-Alun"
                className="w-full px-3 py-2 rounded-xl border border-[#D8CEBE] bg-[#FFFDF9] text-xs text-[#343B35] focus:outline-none focus:ring-2 focus:ring-[#668B65]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#343B35] mb-1">
                  Username / Instagram (Opsional)
                </label>
                <input
                  type="text"
                  maxLength={30}
                  value={claimHandle}
                  onChange={(e) => setClaimHandle(e.target.value)}
                  placeholder="@username"
                  className="w-full px-3 py-2 rounded-xl border border-[#D8CEBE] bg-[#FFFDF9] text-xs text-[#343B35] focus:outline-none focus:ring-2 focus:ring-[#668B65]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#343B35] mb-1">
                  Jumlah Traktir Kopi
                </label>
                <select
                  value={claimQty}
                  onChange={(e) => setClaimQty(parseInt(e.target.value, 10))}
                  className="w-full px-3 py-2 rounded-xl border border-[#D8CEBE] bg-[#FFFDF9] text-xs text-[#343B35] focus:outline-none focus:ring-2 focus:ring-[#668B65]"
                >
                  <option value={1}>1 Kopi (Rp 5.000) &bull; +1.000 Koin</option>
                  <option value={3}>3 Kopi (Rp 15.000) &bull; +3.500 Koin</option>
                  <option value={5}>5 Kopi (Rp 25.000) &bull; +6.500 Koin</option>
                  <option value={10}>10 Kopi (Rp 50.000) &bull; +15.000 Koin</option>
                  <option value={20}>20 Kopi Sultan (Rp 100.000) &bull; +35.000 Koin</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#343B35] mb-1">
                Trakteer Order ID / Catatan Donasi (Opsional)
              </label>
              <input
                type="text"
                maxLength={40}
                value={claimOrderId}
                onChange={(e) => setClaimOrderId(e.target.value)}
                placeholder="Contoh: TRK-98234 atau ID pembayaran"
                className="w-full px-3 py-2 rounded-xl border border-[#D8CEBE] bg-[#FFFDF9] text-xs text-[#343B35] focus:outline-none focus:ring-2 focus:ring-[#668B65]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#343B35] mb-1">
                Pesan untuk Warga / Kota (Maks 140 karakter)
              </label>
              <textarea
                rows={2}
                maxLength={140}
                value={claimMessage}
                onChange={(e) => setClaimMessage(e.target.value)}
                placeholder="Tulis pesan motivasi atau salam untuk sesama warga..."
                className="w-full px-3 py-2 rounded-xl border border-[#D8CEBE] bg-[#FFFDF9] text-xs text-[#343B35] focus:outline-none focus:ring-2 focus:ring-[#668B65]"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingClaim}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#668B65] to-[#4D6E4C] hover:from-[#577756] hover:to-[#435C42] text-white font-extrabold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmittingClaim ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Memverifikasi &amp; Menyimpan...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Kirim &amp; Abadikan di Menara Investor 3D</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-[#D8CEBE]">
          <a
            href={TRAKTEER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
          >
            <span>Buka trakteer.id/sahamnetzencity/tip</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <Button variant="secondary" onClick={onClose} className="font-bold text-xs">
            Tutup
          </Button>
        </div>
      </div>
    </Modal>
  )
}
