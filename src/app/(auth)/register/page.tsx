'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { InstagramIcon } from '@/components/ui/InstagramIcon'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    instagramHandle: '',
    displayName: '',
    password: '',
    confirmPassword: '',
  })
  const [isFollowVerified, setIsFollowVerified] = useState(false)
  const [isCheckingFollow, setIsCheckingFollow] = useState(false)
  const [verifyMsg, setVerifyMsg] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (e.target.name === 'instagramHandle') {
      setIsFollowVerified(false)
      setVerifyMsg(null)
    }
  }

  const handleOpenInstagram = () => {
    window.open('https://instagram.com/netizencity.id', '_blank')
  }

  const handleVerifyFollow = async () => {
    const clean = formData.instagramHandle.trim().replace(/^@/, '')
    if (!clean || clean.length < 3) {
      setError('Masukkan username Instagram kamu terlebih dahulu')
      return
    }

    setError(null)
    setIsCheckingFollow(true)
    setVerifyMsg(null)

    try {
      const res = await fetch('/api/instagram/verify-follower', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ instagramHandle: clean }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || 'Verifikasi follower gagal')
        return
      }

      setIsFollowVerified(true)
      setVerifyMsg(`Akun @${clean} berhasil terverifikasi sebagai pengikut @netizencity.id!`)
    } catch {
      setError('Terjadi kendala saat memeriksa follower Instagram.')
    } finally {
      setIsCheckingFollow(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const cleanHandle = formData.instagramHandle.trim().replace(/^@/, '')
    if (!cleanHandle) {
      setError('Username Instagram wajib diisi')
      return
    }

    if (!isFollowVerified) {
      setError('Kamu wajib memverifikasi bahwa akunmu mengikuti @netizencity.id terlebih dahulu')
      return
    }

    if (formData.password.length < 4) {
      setError('Kata sandi minimal 4 karakter')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instagramHandle: cleanHandle,
          username: cleanHandle,
          displayName: formData.displayName || cleanHandle,
          password: formData.password,
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) {
        setError(data.error || 'Pendaftaran gagal. Coba username lain.')
        return
      }

      router.push('/welcome')
    } catch {
      setError('Terjadi kesalahan saat pendaftaran. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-[#FFFDF9] border-2 border-[#D8CEBE] rounded-3xl p-6 sm:p-8 shadow-xl max-w-md w-full mx-auto font-sans text-[#343B35]">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-[#668B65] text-white flex items-center justify-center mx-auto mb-3 shadow-md">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-extrabold text-xl text-[#343B35]">
          Pendaftaran Warga NETIZENCITY
        </h2>
        <p className="text-xs text-[#78634B] mt-1">
          Warga resmi terhubung dengan Instagram & Kartu Tanda Netizen (KTN)
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Instagram Handle */}
        <div>
          <label className="block text-xs font-bold text-[#343B35] mb-1">
            Username Instagram
          </label>
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-pink-600">
              <InstagramIcon className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="instagramHandle"
              placeholder="@nama_akun_kamu"
              value={formData.instagramHandle}
              onChange={handleChange}
              required
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D8CEBE] bg-[#F7F4E9] text-xs text-[#343B35] focus:outline-none focus:ring-2 focus:ring-[#668B65]"
            />
          </div>
          <span className="text-[10px] text-[#78634B] mt-0.5 block">
            Wajib akun asli yang mengikuti @netizencity.id
          </span>
        </div>

        {/* Verification Card */}
        <div className="p-3 bg-[#EFE9D8] border border-[#D8CEBE] rounded-2xl space-y-2">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="flex items-center text-[#343B35]">
              <InstagramIcon className="w-3.5 h-3.5 mr-1" />
              Bukti Follow @netizencity.id
            </span>
            {isFollowVerified && (
              <span className="text-[10px] text-emerald-700 bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded-full flex items-center font-bold">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                Terbukti Follow
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleOpenInstagram}
              className="flex-1 py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-amber-500 text-white font-bold text-[11px] flex items-center justify-center space-x-1 hover:opacity-90 transition-opacity"
            >
              <span>1. Follow IG</span>
              <ExternalLink className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={handleVerifyFollow}
              disabled={isCheckingFollow}
              className={`flex-1 py-1.5 px-2.5 rounded-xl font-bold text-[11px] border transition-colors flex items-center justify-center space-x-1 ${
                isFollowVerified
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-[#FFFDF9] text-[#343B35] border-[#D8CEBE] hover:bg-[#F7F4E9]'
              }`}
            >
              {isCheckingFollow ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                  <span>Memeriksa...</span>
                </>
              ) : isFollowVerified ? (
                <span>✓ Terverifikasi</span>
              ) : (
                <span>2. Cek Follow</span>
              )}
            </button>
          </div>

          {verifyMsg && (
            <p className="text-[11px] text-emerald-700 font-semibold pt-0.5">
              {verifyMsg}
            </p>
          )}
        </div>

        {/* Display Name */}
        <div>
          <label className="block text-xs font-bold text-[#343B35] mb-1">
            Nama Panggilan Warga
          </label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78634B]" />
            <input
              type="text"
              name="displayName"
              placeholder="Contoh: Budi Santoso"
              value={formData.displayName}
              onChange={handleChange}
              required
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D8CEBE] bg-[#F7F4E9] text-xs text-[#343B35] focus:outline-none focus:ring-2 focus:ring-[#668B65]"
            />
          </div>
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-bold text-[#343B35] mb-1">
            Kata Sandi / PIN Akun
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78634B]" />
            <input
              type="password"
              name="password"
              placeholder="Minimal 4 karakter"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D8CEBE] bg-[#F7F4E9] text-xs text-[#343B35] focus:outline-none focus:ring-2 focus:ring-[#668B65]"
            />
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-xs font-bold text-[#343B35] mb-1">
            Konfirmasi Kata Sandi
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78634B]" />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Ulangi kata sandi"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#D8CEBE] bg-[#F7F4E9] text-xs text-[#343B35] focus:outline-none focus:ring-2 focus:ring-[#668B65]"
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="primary"
          disabled={loading || !isFollowVerified}
          className="w-full py-2.5 font-bold text-xs bg-[#668B65] hover:bg-[#527051]"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              Menerbitkan KTN...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              Daftar & Terbitkan KTN (+600 Koin)
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </span>
          )}
        </Button>
      </form>

      {/* Login link */}
      <div className="mt-4 text-center text-xs text-[#78634B] border-t border-[#D8CEBE] pt-3">
        Sudah pernah mendaftar?{' '}
        <Link href="/login" className="font-bold text-[#668B65] hover:underline">
          Masuk di sini
        </Link>
      </div>
    </div>
  )
}
