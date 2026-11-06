'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  RefreshCw,
  Edit3,
  CheckCircle2,
  AlertTriangle,
  History,
  Key,
  ArrowLeft,
  ExternalLink,
  Info,
} from 'lucide-react'
import { InstagramIcon } from '@/components/ui/InstagramIcon'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { formatNumber, formatDate } from '@/lib/utils/formatting'

interface HistoryEntry {
  id: string
  followerCount: number
  source: 'instagram_api' | 'manual'
  oldValue: number | null
  reason: string | null
  updatedBy: string
  recordedAt: string
}

export default function AdminInstagramPage() {
  const [status, setStatus] = useState<{
    isConfigured: boolean
    username: string
    accountId?: string
    lastSyncAt: string | null
    currentFollowers: number
    source: 'instagram_api' | 'manual'
    lastError: string | null
    history: HistoryEntry[]
  } | null>(null)

  const [loading, setLoading] = useState(false)
  const [syncingAPI, setSyncingAPI] = useState(false)
  const [manualCount, setManualCount] = useState('')
  const [manualReason, setManualReason] = useState('')
  const [adminName, setAdminName] = useState('Admin Netizen')
  const [tokenInput, setTokenInput] = useState('')
  const [accountIdInput, setAccountIdInput] = useState('')
  const [message, setMessage] = useState<{
    text: string
    type: 'success' | 'error' | 'info'
  } | null>(null)

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/instagram/status')
      if (res.ok) {
        const data = await res.json()
        setStatus(data)
        setManualCount(String(data.currentFollowers || ''))
      }
    } catch {
      setMessage({
        text: 'Gagal memuat status integrasi Instagram',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
  }, [])

  const handleAPISync = async (e: React.FormEvent) => {
    e.preventDefault()
    setSyncingAPI(true)
    setMessage(null)

    try {
      const res = await fetch('/api/instagram/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'api_sync',
          token: tokenInput || undefined,
          accountId: accountIdInput || undefined,
        }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage({
          text: `Berhasil sinkronisasi langsung dari Meta Graph API! Follower saat ini: ${formatNumber(
            data.followerCount
          )}`,
          type: 'success',
        })
        fetchStatus()
      } else {
        setMessage({
          text: `Gagal sinkronisasi API: ${data.error}`,
          type: 'error',
        })
      }
    } catch {
      setMessage({
        text: 'Terjadi kesalahan saat memanggil server Meta',
        type: 'error',
      })
    } finally {
      setSyncingAPI(false)
    }
  }

  const handleManualUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    const count = parseInt(manualCount, 10)
    if (isNaN(count) || count < 0) {
      setMessage({
        text: 'Masukkan jumlah follower yang valid (angka positif)',
        type: 'error',
      })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/instagram/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'manual_update',
          count,
          reason:
            manualReason ||
            'Update jumlah follower riil Instagram @netizencity.id',
          adminName: adminName || 'Admin Netizen',
        }),
      })

      const data = await res.json()
      if (data.success) {
        setMessage({
          text: `Populasi resmi kota berhasil diperbarui ke ${formatNumber(
            count
          )} warga! Semua tampilan di Beranda & Kota telah sinkron.`,
          type: 'success',
        })
        setManualReason('')
        fetchStatus()
      } else {
        setMessage({
          text: `Gagal memperbarui: ${data.error}`,
          type: 'error',
        })
      }
    } catch {
      setMessage({
        text: 'Terjadi kesalahan saat memperbarui populasi',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F4EE] text-[#3B3340] p-4 sm:p-8 selection:bg-[#F4A98C] selection:text-white">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation & Header */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="inline-flex items-center text-xs font-bold text-[#6F6675] hover:text-[#3B3340] transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" /> Kembali ke Beranda
            </Link>
            <Link
              href="/city"
              className="inline-flex items-center text-xs font-bold text-[#2C6ECB] hover:text-[#1D60A6]"
            >
              Lihat di Dalam Kota &rarr;
            </Link>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 bg-[#FFFDF9] border-2 border-[#EADBCC] rounded-3xl shadow-sm">
            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F4A98C] via-[#F2C1D6] to-[#C9B8E8] p-0.5 flex items-center justify-center shadow-md">
                <div className="w-full h-full bg-[#FFFDF9] rounded-[14px] flex items-center justify-center">
                  <InstagramIcon className="w-6 h-6 text-[#F282A8]" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-black text-[#3B3340] tracking-wide">
                  Integrasi Instagram @netizencity.id
                </h1>
                <p className="text-xs text-[#6F6675] mt-0.5 font-medium">
                  Pengaturan Sumber Resmi Populasi Virtual NETIZENCITY
                </p>
              </div>
            </div>

            <a
              href="https://www.instagram.com/netizencity.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#F8F4EE] hover:bg-[#EFE6D8] border border-[#EADBCC] text-xs font-bold text-[#3B3340] transition-colors self-start sm:self-auto shadow-xs"
            >
              <InstagramIcon className="w-4 h-4 text-[#F282A8]" />
              <span>Buka Profil Instagram</span>
              <ExternalLink className="w-3.5 h-3.5 ml-1 text-[#6F6675]" />
            </a>
          </div>
        </div>

        {/* Message Alert Banner */}
        {message && (
          <div
            className={`p-4 rounded-2xl border-2 flex items-start space-x-3 text-xs font-bold ${
              message.type === 'success'
                ? 'bg-[#E8F8F0] border-[#A8DCC8] text-[#186D48]'
                : message.type === 'error'
                ? 'bg-[#FFF0F0] border-[#FFC4C4] text-[#C53030]'
                : 'bg-[#EBF4FD] border-[#A9C8EC] text-[#1D60A6]'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            )}
            <div className="flex-1">{message.text}</div>
          </div>
        )}

        {/* Status Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-3xl bg-[#FFFDF9] border-2 border-[#EADBCC] shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6F6675] block mb-1">
              Populasi Resmi Saat Ini
            </span>
            <div className="text-3xl font-black text-[#3B3340] font-mono">
              {formatNumber(status?.currentFollowers ?? 25800)}
            </div>
            <div className="mt-2 flex items-center space-x-2">
              <Badge
                variant={status?.source === 'instagram_api' ? 'success' : 'warning'}
                size="sm"
              >
                {status?.source === 'instagram_api' ? 'Meta Graph API' : 'Input Manual'}
              </Badge>
              <span className="text-[11px] text-[#6F6675] font-semibold">
                Warga Kota
              </span>
            </div>
          </div>

          <div className="p-5 rounded-3xl bg-[#FFFDF9] border-2 border-[#EADBCC] shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6F6675] block mb-1">
              Status Koneksi Meta Graph API
            </span>
            <div className="flex items-center space-x-2 mt-1">
              <span
                className={`w-3 h-3 rounded-full ${
                  status?.isConfigured ? 'bg-[#4EBA88]' : 'bg-[#D4980B]'
                }`}
              />
              <span className="text-base font-extrabold text-[#3B3340]">
                {status?.isConfigured ? 'Terhubung (API Siap)' : 'Mode Manual'}
              </span>
            </div>
            <p className="text-[11px] text-[#6F6675] mt-2 font-medium">
              Akun: <strong className="text-[#3B3340]">@netizencity.id</strong>
            </p>
          </div>

          <div className="p-5 rounded-3xl bg-[#FFFDF9] border-2 border-[#EADBCC] shadow-xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#6F6675] block mb-1">
              Sinkronisasi Terakhir
            </span>
            <div className="text-sm font-extrabold text-[#3B3340] mt-1">
              {status?.lastSyncAt ? formatDate(status.lastSyncAt) : 'Belum pernah'}
            </div>
            <p className="text-[11px] text-[#6F6675] mt-2 font-medium">
              Tercatat otomatis di database city_population
            </p>
          </div>
        </div>

        {/* Section: Manual Correction (Recommended & Immediate) */}
        <div className="p-6 bg-[#FFFDF9] border-2 border-[#EADBCC] rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 pb-3 border-b-2 border-[#EADBCC]">
            <Edit3 className="w-5 h-5 text-[#D4980B]" />
            <div>
              <h2 className="text-base font-extrabold text-[#3B3340]">
                Pembaruan / Koreksi Manual Populasi Kota
              </h2>
              <p className="text-xs text-[#6F6675] font-medium">
                Jika API resmi belum terhubung, admin dapat memasukkan jumlah follower asli @netizencity.id secara langsung
              </p>
            </div>
          </div>

          <form onSubmit={handleManualUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Jumlah Follower Asli @netizencity.id Saat Ini"
                type="number"
                required
                placeholder="Contoh: 25800"
                value={manualCount}
                onChange={(e) => setManualCount(e.target.value)}
                helperText="Angka ini akan langsung menjadi Populasi Resmi di Beranda dan Game HUD"
              />

              <Input
                label="Nama / Jabatan Administrator"
                type="text"
                required
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
                placeholder="Administrator Netizen City"
              />
            </div>

            <Input
              label="Alasan Pembaruan (Audit Log)"
              type="text"
              required
              placeholder="Contoh: Sinkronisasi jumlah follower Instagram @netizencity.id terkini"
              value={manualReason}
              onChange={(e) => setManualReason(e.target.value)}
            />

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="accent"
                size="md"
                isLoading={loading}
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                <span>Simpan &amp; Terapkan ke Seluruh Kota</span>
              </Button>
            </div>
          </form>
        </div>

        {/* Section: Official Meta Graph API Direct Sync */}
        <div className="p-6 bg-[#FFFDF9] border-2 border-[#EADBCC] rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 pb-3 border-b-2 border-[#EADBCC]">
            <Key className="w-5 h-5 text-[#2C6ECB]" />
            <div>
              <h2 className="text-base font-extrabold text-[#3B3340]">
                Koneksi Meta Graph API (Sinkronisasi Otomatis)
              </h2>
              <p className="text-xs text-[#6F6675] font-medium">
                Ambil followers_count langsung dari endpoint resmi Meta Graph API v19.0
              </p>
            </div>
          </div>

          <form onSubmit={handleAPISync} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Instagram Access Token (User / Page Token)"
                type="password"
                placeholder="EAAB... (atau simpan di INSTAGRAM_ACCESS_TOKEN di .env.local)"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
              />

              <Input
                label="Instagram Business Account ID"
                type="text"
                placeholder="178414... (atau simpan di INSTAGRAM_BUSINESS_ACCOUNT_ID)"
                value={accountIdInput}
                onChange={(e) => setAccountIdInput(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center space-x-1.5 text-xs text-[#6F6675] font-medium">
                <Info className="w-4 h-4 text-[#2C6ECB]" />
                <span>
                  Hanya menggunakan endpoint resmi Meta Graph API tanpa scraping.
                </span>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={syncingAPI}
              >
                <RefreshCw className="w-4 h-4 mr-1.5" />
                <span>Tarik Data Langsung Dari Instagram</span>
              </Button>
            </div>
          </form>
        </div>

        {/* Section: Sync & Correction History Table */}
        <div className="p-6 bg-[#FFFDF9] border-2 border-[#EADBCC] rounded-3xl space-y-4 shadow-sm">
          <div className="flex items-center space-x-2 pb-3 border-b-2 border-[#EADBCC]">
            <History className="w-5 h-5 text-[#6A3F98]" />
            <div>
              <h2 className="text-base font-extrabold text-[#3B3340]">
                Riwayat Sinkronisasi &amp; Pembaruan Populasi
              </h2>
              <p className="text-xs text-[#6F6675] font-medium">
                Catatan historis pertumbuhan warga resmi @netizencity.id
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-[#5C5265]">
              <thead className="text-[10px] text-[#6F6675] font-black uppercase bg-[#F8F4EE] border-b-2 border-[#EADBCC]">
                <tr>
                  <th className="py-2.5 px-3">Waktu Rekam</th>
                  <th className="py-2.5 px-3">Metode</th>
                  <th className="py-2.5 px-3 font-mono">Jumlah Follower</th>
                  <th className="py-2.5 px-3">Nilai Lama</th>
                  <th className="py-2.5 px-3">Alasan / Catatan</th>
                  <th className="py-2.5 px-3">Oleh</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-[#F0EAE1]">
                {status?.history?.map((entry) => (
                  <tr key={entry.id} className="hover:bg-[#F8F4EE]/60 transition-colors">
                    <td className="py-2.5 px-3 font-mono text-[#6F6675]">
                      {formatDate(entry.recordedAt)}
                    </td>
                    <td className="py-2.5 px-3">
                      <Badge
                        variant={
                          entry.source === 'instagram_api' ? 'success' : 'neutral'
                        }
                        size="sm"
                      >
                        {entry.source === 'instagram_api' ? 'API' : 'Manual'}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-3 font-black text-[#3B3340] font-mono">
                      {formatNumber(entry.followerCount)}
                    </td>
                    <td className="py-2.5 px-3 text-[#A89E92] font-mono">
                      {entry.oldValue ? formatNumber(entry.oldValue) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-[#3B3340] font-medium">
                      {entry.reason}
                    </td>
                    <td className="py-2.5 px-3 text-[#2C6ECB] font-bold">
                      {entry.updatedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
