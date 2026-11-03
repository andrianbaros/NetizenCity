'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plane,
  ShieldCheck,
  Home,
  Coins,
  ArrowRight,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { generateKTNNumber } from '@/lib/utils/ktn'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Avatar customization state
  const [avatar, setAvatar] = useState({
    skinTone: '#f5d0b0',
    hairStyle: 'short',
    hairColor: '#1e293b',
    shirtColor: '#2563eb',
    pantsColor: '#1e293b',
    shoesColor: '#f1f5f9',
    expression: 'happy',
  })

  // Generated Citizen Identity
  const [ktnNumber, setKtnNumber] = useState('KTN-20261103-XXXXX')
  const [housing] = useState({
    name: 'Rusunawa Harapan Baru',
    unit: 'Unit 304, Blok B',
    district: 'Perumahan Utara',
  })

  useEffect(() => {
    setKtnNumber(generateKTNNumber())
  }, [])

  const updateAvatar = useCitizenStore((s) => s.updateAvatar)

  const handleFinishOnboarding = async () => {
    const avatarConfig = {
      skinTone: avatar.skinTone,
      hairStyle: avatar.hairStyle,
      hairColor: avatar.hairColor,
      shirtColor: avatar.shirtColor,
      pantsColor: avatar.pantsColor,
      shoesColor: avatar.shoesColor,
      expression: avatar.expression,
    }

    updateAvatar({
      ...avatarConfig,
      eyeColor: '#000000',
      outfit: {
        top: avatar.shirtColor,
        bottom: avatar.pantsColor,
        shoes: avatar.shoesColor,
        accessory: null,
      },
    })

    try {
      await fetch('/api/citizens/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarConfig }),
      })
    } catch {
      // ignore
    }

    router.push('/city')
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md">
      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-800">
        {[
          { num: 1, label: 'Arrival' },
          { num: 2, label: 'Avatar' },
          { num: 3, label: 'KTN & Hunian' },
          { num: 4, label: 'Welcome Bonus' },
        ].map((s) => (
          <div key={s.num} className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                step === s.num
                  ? 'bg-blue-600 text-white ring-4 ring-blue-500/20'
                  : step > s.num
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-slate-800 text-slate-400'
              }`}
            >
              {step > s.num ? '✓' : s.num}
            </div>
            <span
              className={`text-xs hidden sm:inline font-medium ${
                step === s.num ? 'text-white' : 'text-slate-500'
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: AIRPORT ARRIVAL */}
      {step === 1 && (
        <div className="text-center py-6 space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto shadow-inner animate-pulse">
            <Plane className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Terminal Kedatangan Bandara Netizen
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-white mt-1">
              Selamat Datang di NETIZENCITY!
            </h1>
            <p className="text-slate-300 text-sm max-w-md mx-auto mt-3 leading-relaxed">
              Pesawatmu baru saja mendarat di kota virtual komunitas. Kamu akan segera didaftarkan sebagai warga resmi dengan KTN (Kartu Tanda Netizen).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-left text-xs text-slate-300 max-w-md mx-auto space-y-2">
            <div className="flex items-center text-emerald-400 font-semibold mb-1">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Prosedur Kedatangan Warga:
            </div>
            <p>&bull; Kustomisasi penampilan avatar 2D pixel minimalismu</p>
            <p>&bull; Penerbitan Kartu Tanda Netizen (KTN) unik</p>
            <p>&bull; Penempatan unit tempat tinggal pertama</p>
            <p>&bull; Pencairan saldo awal 500 Netizen Coins</p>
          </div>

          <Button
            variant="primary"
            size="lg"
            className="w-full sm:w-auto px-8"
            onClick={() => setStep(2)}
          >
            <span>Kustomisasi Avatar</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}

      {/* STEP 2: AVATAR CUSTOMIZATION */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
              Karakter 2D Warga
            </span>
            <h2 className="text-2xl font-black text-white mt-0.5">
              Atur Penampilan Karaktermu
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Kamu bisa mengubah dan membeli pakaian baru nanti di Mall
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Visual Preview Box */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center p-6 bg-slate-950 rounded-2xl border border-slate-800 shadow-inner">
              <div className="w-32 h-44 relative bg-slate-900/60 rounded-xl border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
                {/* Simplified Modular Pixel Avatar Visual */}
                <div className="relative flex flex-col items-center">
                  {/* Hair */}
                  <div
                    className="w-12 h-6 rounded-t-full -mb-2 z-20"
                    style={{ backgroundColor: avatar.hairColor }}
                  />
                  {/* Head */}
                  <div
                    className="w-10 h-10 rounded-full z-10 flex items-center justify-center relative shadow-sm"
                    style={{ backgroundColor: avatar.skinTone }}
                  >
                    {/* Eyes */}
                    <div className="flex space-x-2">
                      <div className="w-1.5 h-1.5 bg-black rounded-full" />
                      <div className="w-1.5 h-1.5 bg-black rounded-full" />
                    </div>
                  </div>
                  {/* Shirt / Top */}
                  <div
                    className="w-14 h-12 rounded-t-lg mt-0.5 z-10 shadow-sm flex items-center justify-center text-[10px] font-bold text-white/50"
                    style={{ backgroundColor: avatar.shirtColor }}
                  >
                    NC
                  </div>
                  {/* Pants / Bottom */}
                  <div className="flex space-x-1 -mt-0.5">
                    <div
                      className="w-6 h-10 rounded-b-sm"
                      style={{ backgroundColor: avatar.pantsColor }}
                    />
                    <div
                      className="w-6 h-10 rounded-b-sm"
                      style={{ backgroundColor: avatar.pantsColor }}
                    />
                  </div>
                  {/* Shoes */}
                  <div className="flex space-x-2 -mt-1">
                    <div
                      className="w-5 h-3 rounded-full"
                      style={{ backgroundColor: avatar.shoesColor }}
                    />
                    <div
                      className="w-5 h-3 rounded-full"
                      style={{ backgroundColor: avatar.shoesColor }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-3 text-[11px] font-medium text-slate-400">
                Preview Karakter 2D
              </div>
            </div>

            {/* Customization Controls */}
            <div className="sm:col-span-7 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Warna Kulit:
                </label>
                <div className="flex space-x-2">
                  {['#f5d0b0', '#e0ac69', '#8d5524', '#c68642'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatar((prev) => ({ ...prev, skinTone: c }))}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        avatar.skinTone === c
                          ? 'border-white scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Warna Rambut:
                </label>
                <div className="flex space-x-2">
                  {['#1e293b', '#78350f', '#d97706', '#94a3b8'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatar((prev) => ({ ...prev, hairColor: c }))}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        avatar.hairColor === c
                          ? 'border-white scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Warna Baju:
                </label>
                <div className="flex space-x-2">
                  {['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatar((prev) => ({ ...prev, shirtColor: c }))}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        avatar.shirtColor === c
                          ? 'border-white scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Warna Celana:
                </label>
                <div className="flex space-x-2">
                  {['#1e293b', '#3b82f6', '#475569', '#78716c'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatar((prev) => ({ ...prev, pantsColor: c }))}
                      className={`w-7 h-7 rounded-full border-2 transition-transform ${
                        avatar.pantsColor === c
                          ? 'border-white scale-110'
                          : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Kembali
            </Button>
            <Button variant="primary" onClick={() => setStep(3)}>
              <span>Lanjut ke KTN &amp; Hunian</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: KTN & HOUSING ASSIGNMENT */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="text-center">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Identitas &amp; Tempat Tinggal
            </span>
            <h2 className="text-2xl font-black text-white mt-0.5">
              KTN &amp; Penempatan Hunian
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Data kewarganegaraanmu telah disahkan oleh Pemerintah Kota
            </p>
          </div>

          {/* Realistic KTN Card Display */}
          <div className="max-w-md mx-auto p-5 rounded-2xl bg-gradient-to-br from-blue-900/80 via-slate-900 to-indigo-950 border border-blue-500/40 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />

            <div className="flex items-center justify-between pb-3 border-b border-blue-500/20 mb-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span className="font-black text-xs tracking-widest text-white uppercase">
                  KARTU TANDA NETIZEN
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                WARGA RESMI
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 items-center">
              <div className="w-20 h-24 rounded-xl bg-slate-950/80 border border-slate-700/80 flex items-center justify-center p-2 text-center">
                <span className="text-[10px] text-slate-400 font-mono">
                  AVATAR VERIFIED
                </span>
              </div>
              <div className="col-span-2 space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Nomor KTN:</span>
                  <span className="font-mono font-bold text-amber-300 tracking-wider">
                    {ktnNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Status:</span>
                  <span className="font-semibold text-emerald-400">
                    Aktif (Tingkat 1 - Warga Baru)
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Afiliasi:</span>
                  <span className="text-slate-200">@netizencity.id</span>
                </div>
              </div>
            </div>

            {/* Housing section inside KTN */}
            <div className="mt-4 pt-3 border-t border-blue-500/20 flex items-center space-x-3 text-xs">
              <Home className="w-5 h-5 text-sky-400 flex-shrink-0" />
              <div>
                <span className="text-slate-400 text-[10px] block">Alamat Hunian:</span>
                <span className="font-medium text-white">
                  {housing.name} — {housing.unit} ({housing.district})
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t border-slate-800">
            <Button variant="ghost" onClick={() => setStep(2)}>
              Kembali
            </Button>
            <Button variant="primary" onClick={() => setStep(4)}>
              <span>Klaim Bonus Warga Baru</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: STARTING COINS & ENTRY */}
      {step === 4 && (
        <div className="text-center py-6 space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center mx-auto shadow-inner animate-bounce">
            <Coins className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
              Bonus Sambutan Balai Kota
            </span>
            <h2 className="text-3xl font-black text-white mt-1">
              +500 Netizen Coins
            </h2>
            <p className="text-slate-300 text-sm max-w-md mx-auto mt-2 leading-relaxed">
              Pemerintah NETIZENCITY memberikan saldo awal 500 Netizen Coins ke dompet virtualmu untuk berbelanja pakaian dan kebutuhan awal di kota!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300 max-w-md mx-auto space-y-2">
            <div className="flex items-center text-amber-400 font-semibold mb-1">
              <Sparkles className="w-4 h-4 mr-1.5" />
              Pesan Walikota NETIZENCITY:
            </div>
            <p className="italic text-slate-400">
              &ldquo;Jadilah warga yang aktif, ramah, dan saling mendukung. Jelajahi alun-alun kota, ambil pekerjaan harian, dan bantu jadikan NETIZENCITY kota virtual terbaik!&rdquo;
            </p>
          </div>

          <Button
            variant="accent"
            size="lg"
            className="w-full sm:w-auto px-10 text-base"
            onClick={handleFinishOnboarding}
          >
            <span>Masuk ke Dalam Kota</span>
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      )}
    </div>
  )
}
