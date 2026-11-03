'use client'

import React, { useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { useAuthStore } from '@/lib/stores/useAuthStore'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/city'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const setUser = useAuthStore((s) => s.setUser)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const isPlaceholder =
        !supabaseUrl || supabaseUrl.includes('your_supabase_url_here')

      if (isPlaceholder) {
        // Authenticate via persistent local database
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        })
        const data = await res.json()
        if (!res.ok || data.error) {
          setError(data.error || 'Email atau kata sandi tidak cocok')
          return
        }

        router.push(redirectTo)
        return
      }

      const supabase = createClient()
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
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
        <h2 className="text-xl font-bold text-white tracking-wide">
          Masuk ke Netizen City
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Lanjutkan petualangan virtualmu di kota
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email Warga"
          type="email"
          required
          placeholder="nama@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Kata Sandi"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
        />

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center text-slate-400 hover:text-slate-300 cursor-pointer">
            <input
              type="checkbox"
              className="rounded bg-slate-900 border-slate-700 text-blue-600 focus:ring-0 mr-2"
            />
            Ingat saya
          </label>
          <Link
            href="/forgot-password"
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Lupa kata sandi?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          className="w-full mt-2"
        >
          <LogIn className="w-4 h-4" />
          <span>Masuk Sekarang</span>
        </Button>
      </form>

      <div className="mt-6 pt-6 border-t border-slate-800 text-center">
        <p className="text-xs text-slate-400">
          Belum punya identitas warga?{' '}
          <Link
            href="/register"
            className="text-blue-400 hover:text-blue-300 font-semibold inline-flex items-center ml-1"
          >
            Daftar KTN <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-slate-400 text-xs text-center py-8">Memuat form login...</div>}>
      <LoginForm />
    </Suspense>
  )
}
