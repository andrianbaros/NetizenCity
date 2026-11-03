'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Mail, ArrowLeft, Send } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const isPlaceholder =
        !supabaseUrl || supabaseUrl.includes('your_supabase_url_here')

      if (isPlaceholder) {
        setSubmitted(true)
        return
      }

      const supabase = createClient()
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      )

      if (resetError) {
        setError(resetError.message)
        return
      }

      setSubmitted(true)
    } catch {
      setError('Gagal mengirim email reset kata sandi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-bold text-white tracking-wide">
          Lupa Kata Sandi
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Masukkan email terdaftar untuk menerima instruksi pemulihan
        </p>
      </div>

      {submitted ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center">
            <Mail className="w-6 h-6" />
          </div>
          <p className="text-sm text-slate-300">
            Tautan reset kata sandi telah dikirim ke <strong className="text-white">{email}</strong> jika terdaftar.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center text-xs font-semibold text-blue-400 hover:text-blue-300"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke halaman Masuk
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <Input
            label="Email Terdaftar"
            type="email"
            required
            placeholder="nama@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full"
          >
            <Send className="w-4 h-4" />
            <span>Kirim Tautan Reset</span>
          </Button>

          <div className="pt-2 text-center">
            <Link
              href="/login"
              className="inline-flex items-center text-xs text-slate-400 hover:text-slate-200 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Kembali ke Masuk
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
