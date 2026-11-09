'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Lock, LogIn, ArrowRight, Loader2 } from 'lucide-react'
import { InstagramIcon } from '@/components/ui/InstagramIcon'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/useAuthStore'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/city'

  const [instagramHandle, setInstagramHandle] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const setUser = useAuthStore((s) => s.setUser)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const clean = instagramHandle.trim().replace(/^@/, '')

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const isPlaceholder =
        !supabaseUrl || supabaseUrl.includes('your_supabase_url_here')

      if (isPlaceholder) {
        // Authenticate via local database
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ instagramHandle: clean, password }),
        })
        const data = await res.json()
        if (!res.ok || data.error) {
          setError(data.error || 'Username Instagram atau kata sandi tidak cocok')
          return
        }

        router.push(redirectTo)
        return
      }

      const supabase = createClient()
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email: `${clean}@instagram.netizencity.id`,
          password,
        })

      if (signInError) {
        setError(signInError.message)
        return
      }

      if (data.user) {
        setUser(data.user)
        router.push(redirectTo)
        router.refresh()
      }
    } catch {
      setError('Terjadi kesalahan saat masuk. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-black text-[#3B3340] tracking-wide">
          Masuk ke Netizen City
        </h2>
        <p className="text-xs text-[#6F6675] mt-1 font-medium">
          Masuk menggunakan akun Instagram terdaftar
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-[#FFF0F0] border-2 border-[#FFC4C4] text-[#C53030] text-xs font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
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
              placeholder="@username_kamu"
              value={instagramHandle}
              onChange={(e) => setInstagramHandle(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D8CEBE] bg-[#F7F4E9] text-xs text-[#343B35] focus:outline-none focus:ring-2 focus:ring-[#668B65]"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#343B35] mb-1">
            Kata Sandi Akun
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#78634B]" />
            <input
              type="password"
              placeholder="Kata sandi akunmu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#D8CEBE] bg-[#F7F4E9] text-xs text-[#343B35] focus:outline-none focus:ring-2 focus:ring-[#668B65]"
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={loading}
          className="w-full py-3 font-bold text-xs bg-[#668B65] hover:bg-[#527051]"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <Loader2 className="w-4 h-4 animate-spin mr-1.5" />
              Menghubungkan ke Kota...
            </span>
          ) : (
            <span className="flex items-center justify-center">
              <LogIn className="w-4 h-4 mr-1.5" />
              Masuk ke NetizenCity
            </span>
          )}
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-[#78634B] border-t border-[#D8CEBE] pt-4">
        Belum punya akun warga?{' '}
        <Link href="/register" className="font-bold text-[#668B65] hover:underline">
          Daftar via Instagram di sini
        </Link>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-[#78634B]">
          Memuat formulir masuk...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}
