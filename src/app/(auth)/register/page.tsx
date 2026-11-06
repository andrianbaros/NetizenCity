'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mail, Lock, User, ShieldCheck, ArrowRight } from 'lucide-react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { generateKTNNumber } from '@/lib/utils/ktn'

export default function RegisterPage() {
  const router = useRouter()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    username: '',
    displayName: '',
  })
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.password !== formData.confirmPassword) {
      setError('Konfirmasi kata sandi tidak cocok')
      return
    }

    if (formData.username.length < 3) {
      setError('Username minimal 3 karakter')
      return
    }

    setLoading(true)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const isPlaceholder =
        !supabaseUrl || supabaseUrl.includes('your_supabase_url_here')

      if (isPlaceholder) {
        // Authenticate & create citizen in local database
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            username: formData.username,
            displayName: formData.displayName,
          }),
        })

        const data = await res.json()
        if (!res.ok || data.error) {
          setError(data.error || 'Pendaftaran gagal. Coba username atau email lain.')
          return
        }

        router.push('/welcome')
        return
      }

      const supabase = createClient()

      // 1. Check if username is already taken
      const { data: existingUser } = await supabase
        .from('citizens')
        .select('username')
        .eq('username', formData.username.toLowerCase())
        .maybeSingle()

      if (existingUser) {
        setError('Username sudah digunakan oleh warga lain')
        setLoading(false)
        return
      }

      // 2. Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            username: formData.username.toLowerCase(),
            display_name: formData.displayName,
          },
        },
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (authData.user) {
        // 3. Create citizen profile row
        const ktn = generateKTNNumber()
        await (supabase.from('citizens').insert as any)({
          user_id: authData.user.id,
          username: formData.username.toLowerCase(),
          display_name: formData.displayName,
          ktn_number: ktn,
          avatar_config: {
            skinTone: 'fair',
            hairStyle: 'short',
            hairColor: 'black',
            eyeColor: 'brown',
            outfit: { top: 'basic_blue', bottom: 'jeans', shoes: 'sneakers', accessory: null },
            expression: 'happy',
          },
          role: 'citizen',
          onboarding_completed: false,
        })

        router.push('/onboarding')
      }
    } catch {
      setError('Terjadi kesalahan saat pendaftaran. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-6 text-center">
        <h2 className="text-xl font-black text-[#3B3340] tracking-wide">
          Daftar Menjadi Warga
        </h2>
        <p className="text-xs text-[#6F6675] mt-1 font-medium">
          Dapatkan KTN resmi dan mulai hidup virtualmu di Netizen City
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-[#FFF0F0] border-2 border-[#FFC4C4] text-[#C53030] text-xs font-bold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Username Unik"
          name="username"
          required
          placeholder="contoh: budi_netizen"
          value={formData.username}
          onChange={handleChange}
          leftIcon={<User className="w-4 h-4 text-[#A89E92]" />}
          helperText="Huruf kecil, angka, dan underscore (tanpa spasi)"
        />

        <Input
          label="Nama Lengkap / Tampilan"
          name="displayName"
          required
          placeholder="Budi Santoso"
          value={formData.displayName}
          onChange={handleChange}
          leftIcon={<User className="w-4 h-4 text-[#A89E92]" />}
        />

        <Input
          label="Email Aktif"
          name="email"
          type="email"
          required
          placeholder="nama@email.com"
          value={formData.email}
          onChange={handleChange}
          leftIcon={<Mail className="w-4 h-4 text-[#A89E92]" />}
        />

        <Input
          label="Kata Sandi"
          name="password"
          type="password"
          required
          placeholder="Minimal 6 karakter"
          value={formData.password}
          onChange={handleChange}
          leftIcon={<Lock className="w-4 h-4 text-[#A89E92]" />}
        />

        <Input
          label="Konfirmasi Kata Sandi"
          name="confirmPassword"
          type="password"
          required
          placeholder="Ulangi kata sandi"
          value={formData.confirmPassword}
          onChange={handleChange}
          leftIcon={<Lock className="w-4 h-4 text-[#A89E92]" />}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="peach"
            size="lg"
            isLoading={loading}
            className="w-full"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Terbitkan KTN &amp; Lanjut</span>
          </Button>
        </div>
      </form>

      <div className="mt-6 pt-5 border-t-2 border-[#EADBCC] text-center">
        <p className="text-xs text-[#6F6675] font-medium">
          Sudah punya akun warga?{' '}
          <Link
            href="/login"
            className="text-[#2C6ECB] hover:text-[#1D60A6] font-black inline-flex items-center ml-1"
          >
            Masuk <ArrowRight className="w-3 h-3 ml-0.5" />
          </Link>
        </p>
      </div>
    </div>
  )
}
