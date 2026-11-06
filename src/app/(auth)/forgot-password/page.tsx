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
        <h2 className="text-xl font-black text-[#3B3340] tracking-wide">
          Lupa Kata Sandi
        </h2>
        <p className="text-xs text-[#6F6675] mt-1 font-medium">
          Masukkan email terdaftar untuk menerima instruksi pemulihan
        </p>
      </div>

      {submitted ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#E8F8F0] text-[#186D48] border border-[#A8DCC8] mx-auto flex items-center justify-center shadow-xs">
            <Mail className="w-6 h-6" />
          </div>
          <p className="text-xs text-[#5C5265]">
            Tautan reset kata sandi telah dikirim ke <strong className="text-[#3B3340]">{email}</strong> jika terdaftar.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center text-xs font-bold text-[#2C6ECB] hover:text-[#1D60A6]"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Kembali ke halaman Masuk
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[#FFF0F0] border-2 border-[#FFC4C4] text-[#C53030] text-xs font-bold">
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
            leftIcon={<Mail className="w-4 h-4 text-[#A89E92]" />}
          />

          <Button
            type="submit"
            variant="peach"
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
              className="inline-flex items-center text-xs font-semibold text-[#6F6675] hover:text-[#3B3340] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Kembali ke Masuk
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}
