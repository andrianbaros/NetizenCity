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
  Palette,
  Building2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { generateKTNNumber } from '@/lib/utils/ktn'
import { drawCharacterPreviewCanvas, resolveAvatarColors } from '@/game/utils/characterRenderer'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1)

  // Avatar customization state
  const previewCanvasRef = React.useRef<HTMLCanvasElement>(null)
  const ktnCanvasRef = React.useRef<HTMLCanvasElement>(null)

  const [avatar, setAvatar] = useState({
    skinTone: '#f5d0b0',
    hairStyle: 'short',
    hairColor: '#1e293b',
    shirtColor: '#2563eb',
    pantsColor: '#1e293b',
    shoesColor: '#f1f5f9',
    accessory: null as string | null,
    expression: 'happy',
  })

  React.useEffect(() => {
    const colors = resolveAvatarColors(avatar)
    if (previewCanvasRef.current) {
      drawCharacterPreviewCanvas(previewCanvasRef.current, colors, 4)
    }
    if (ktnCanvasRef.current) {
      drawCharacterPreviewCanvas(ktnCanvasRef.current, colors, 3)
    }
  }, [avatar, step])

  // Generated Citizen Identity
  const [ktnNumber, setKtnNumber] = useState('KTN-20261103-XXXXX')
  const [housing] = useState({
    name: 'Kampung Angkatan 1',
    unit: 'Unit 304, Blok Melati',
    district: 'Pusat Kota (Alun-Alun)',
  })

  useEffect(() => {
    setKtnNumber(generateKTNNumber())
  }, [])

  const profile = useCitizenStore((s) => s.profile)
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
      accessory: avatar.accessory,
    }

    updateAvatar({
      ...avatarConfig,
      eyeColor: '#000000',
      outfit: {
        top: avatar.shirtColor,
        bottom: avatar.pantsColor,
        shoes: avatar.shoesColor,
        accessory: avatar.accessory,
      },
    })

    try {
      if (typeof document !== 'undefined') {
        document.cookie = `nc_avatar_config=${encodeURIComponent(JSON.stringify(avatarConfig))}; path=/; max-age=2592000; SameSite=Lax`
      }
      await fetch('/api/citizens/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarConfig, citizenId: profile?.id }),
      })
    } catch {
      // ignore
    }

    router.push('/city')
  }

  return (
    <div className="bg-[#FFFDF9] border-2 border-[#EADBCC] rounded-3xl p-6 sm:p-10 shadow-xl">
      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-[#EADBCC]">
        {[
          { num: 1, label: 'Kedatangan' },
          { num: 2, label: 'Karakter' },
          { num: 3, label: 'KTN & Hunian' },
          { num: 4, label: 'Bonus Warga' },
        ].map((s) => (
          <div key={s.num} className="flex items-center space-x-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${
                step === s.num
                  ? 'bg-[#F4A98C] text-white ring-4 ring-[#F4A98C]/20 shadow-xs'
                  : step > s.num
                  ? 'bg-[#4EBA88] text-white font-black'
                  : 'bg-[#F0EAE1] text-[#A89E92]'
              }`}
            >
              {step > s.num ? '✓' : s.num}
            </div>
            <span
              className={`text-xs hidden sm:inline font-bold ${
                step === s.num ? 'text-[#3B3340]' : 'text-[#A89E92]'
              }`}
            >
              {s.label}
            </span>
          </div>
        ))}
      </div>

      {/* STEP 1: AIRPORT ARRIVAL */}
      {step === 1 && (
        <div className="text-center py-4 space-y-5">
          <div className="relative w-32 sm:w-40 mx-auto -mb-2 drop-shadow-md hover:scale-105 transition-transform duration-300">
            <img
              src="/brand/logo-badge.webp"
              alt="Netizen City Logo"
              className="w-full h-auto object-contain"
            />
          </div>

          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#F4A98C]">
              Terminal Kedatangan Bandara Netizen
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#3B3340] mt-1">
              Selamat Datang di NETIZENCITY!
            </h1>
            <p className="text-[#6F6675] text-xs max-w-md mx-auto mt-2 leading-relaxed font-medium">
              Pesawatmu baru saja mendarat di kota virtual komunitas. Kamu akan segera didaftarkan sebagai warga resmi dengan KTN (Kartu Tanda Netizen).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF9F1] border-2 border-[#EADBCC] text-left text-xs text-[#5C5265] max-w-md mx-auto space-y-2">
            <div className="flex items-center text-[#186D48] font-bold mb-1">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Prosedur Kedatangan Warga Baru:
            </div>
            <p>&bull; Kustomisasi penampilan avatar diorama minimalismu</p>
            <p>&bull; Penerbitan Kartu Tanda Netizen (KTN) resmi</p>
            <p>&bull; Penempatan unit tempat tinggal pertama di Kampung Angkatan 1</p>
            <p>&bull; Pencairan saldo awal 500 Netizen Coins</p>
          </div>

          <Button
            variant="peach"
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
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#F4A98C]">
              Karakter Warga 3D &amp; Diorama
            </span>
            <h2 className="text-2xl font-black text-[#3B3340] mt-0.5">
              Atur Penampilan Karaktermu
            </h2>
            <p className="text-xs text-[#6F6675] mt-1 font-medium">
              Sesuai dengan aset resmi warga Netizen City. Kamu juga bisa belanja kostum baru di Netizen Mall.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
            {/* Visual Canvas Preview Box */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center p-6 bg-[#FFF9F1] rounded-3xl border-2 border-[#EADBCC] shadow-inner">
              <div className="w-36 h-48 relative bg-gradient-to-b from-[#FFFDF9] to-[#FFF3E6] rounded-2xl border-2 border-[#EADBCC] flex flex-col items-center justify-center p-3 shadow-xs overflow-hidden">
                <canvas
                  ref={previewCanvasRef}
                  width={128}
                  height={144}
                  className="w-28 h-32 drop-shadow-md"
                  style={{ imageRendering: 'pixelated' }}
                />
                <span className="text-[10px] font-heading font-black text-[#8C7D91] mt-1 uppercase tracking-wider">
                  Warga Netizen
                </span>
              </div>

              <div className="mt-3 text-xs font-bold text-[#3B3340] flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-[#F4A98C]" />
                <span>Avatar Resmi Netizen City</span>
              </div>
            </div>

            {/* Customization Controls */}
            <div className="sm:col-span-7 space-y-4 max-h-[380px] overflow-y-auto pr-1">
              {/* Hairstyle */}
              <div>
                <label className="text-xs font-extrabold text-[#3B3340] block mb-1.5">
                  Model Rambut:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: 'short', name: 'Pendek' },
                    { id: 'spiky', name: 'Spiky' },
                    { id: 'curly', name: 'Keriting' },
                    { id: 'bob', name: 'Bob' },
                    { id: 'long', name: 'Panjang' },
                    { id: 'ponytail', name: 'Kuncir' },
                  ].map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => setAvatar((prev) => ({ ...prev, hairStyle: h.id }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 transition-all cursor-pointer ${
                        avatar.hairStyle === h.id
                          ? 'bg-[#EBF8F3] text-[#1E5D46] border-[#4EBA88] shadow-xs'
                          : 'bg-[#FFFDF9] text-[#6F6675] border-[#EADBCC] hover:bg-[#FFF8ED]'
                      }`}
                    >
                      {h.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skin Tone */}
              <div>
                <label className="text-xs font-extrabold text-[#3B3340] block mb-1.5">
                  Warna Kulit:
                </label>
                <div className="flex space-x-2">
                  {['#fcd5b5', '#f5d0b0', '#e0ac69', '#c68642', '#8d5524'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatar((prev) => ({ ...prev, skinTone: c }))}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer shadow-xs ${
                        avatar.skinTone === c
                          ? 'border-[#3B3340] scale-110 ring-2 ring-[#F4A98C]'
                          : 'border-[#EADBCC]'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Hair Color */}
              <div>
                <label className="text-xs font-extrabold text-[#3B3340] block mb-1.5">
                  Warna Rambut:
                </label>
                <div className="flex space-x-2">
                  {['#1e293b', '#78350f', '#d97706', '#ea580c', '#9333ea', '#64748b'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatar((prev) => ({ ...prev, hairColor: c }))}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer shadow-xs ${
                        avatar.hairColor === c
                          ? 'border-[#3B3340] scale-110 ring-2 ring-[#F4A98C]'
                          : 'border-[#EADBCC]'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Shirt Color */}
              <div>
                <label className="text-xs font-extrabold text-[#3B3340] block mb-1.5">
                  Warna Pakaian:
                </label>
                <div className="flex space-x-2">
                  {['#2563eb', '#10b981', '#f97316', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4', '#1e293b'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatar((prev) => ({ ...prev, shirtColor: c }))}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer shadow-xs ${
                        avatar.shirtColor === c
                          ? 'border-[#3B3340] scale-110 ring-2 ring-[#F4A98C]'
                          : 'border-[#EADBCC]'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Pants Color */}
              <div>
                <label className="text-xs font-extrabold text-[#3B3340] block mb-1.5">
                  Warna Celana:
                </label>
                <div className="flex space-x-2">
                  {['#1e293b', '#334155', '#1e3a8a', '#14532d', '#7c2d12'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setAvatar((prev) => ({ ...prev, pantsColor: c }))}
                      className={`w-7 h-7 rounded-full border-2 transition-transform cursor-pointer shadow-xs ${
                        avatar.pantsColor === c
                          ? 'border-[#3B3340] scale-110 ring-2 ring-[#F4A98C]'
                          : 'border-[#EADBCC]'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* Accessory */}
              <div>
                <label className="text-xs font-extrabold text-[#3B3340] block mb-1.5">
                  Aksesori:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { id: null, name: 'Tanpa Aksesori' },
                    { id: 'glasses', name: 'Kacamata' },
                    { id: 'backpack', name: 'Ransel' },
                    { id: 'wings', name: 'Sayap' },
                  ].map((acc) => (
                    <button
                      key={acc.name}
                      type="button"
                      onClick={() => setAvatar((prev) => ({ ...prev, accessory: acc.id }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-heading font-bold border-2 transition-all cursor-pointer ${
                        avatar.accessory === acc.id
                          ? 'bg-[#FFF0EB] text-[#D97858] border-[#F4A98C] shadow-xs'
                          : 'bg-[#FFFDF9] text-[#6F6675] border-[#EADBCC] hover:bg-[#FFF8ED]'
                      }`}
                    >
                      {acc.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t-2 border-[#EADBCC]">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Kembali
            </Button>
            <Button variant="peach" onClick={() => setStep(3)}>
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
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#D4980B]">
              Identitas &amp; Tempat Tinggal
            </span>
            <h2 className="text-2xl font-black text-[#3B3340] mt-0.5">
              KTN &amp; Penempatan Hunian
            </h2>
            <p className="text-xs text-[#6F6675] mt-1 font-medium">
              Data kewarganegaraanmu telah disahkan oleh Pemerintah Netizen City
            </p>
          </div>

          {/* Official Netizen City KTN Card Display */}
          <div className="max-w-md mx-auto p-5 rounded-3xl bg-[#FFFDF9] border-2 border-[#EADBCC] shadow-xl relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#EADBCC] mb-4">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-[#D4980B]" />
                <span className="font-black text-xs tracking-widest text-[#3B3340] uppercase">
                  KARTU TANDA NETIZEN
                </span>
              </div>
              <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#E8F8F0] text-[#186D48] border border-[#A8DCC8]">
                WARGA RESMI ✓
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 items-center">
              <div className="w-20 h-24 rounded-2xl bg-[#FFF9F1] border-2 border-[#EADBCC] flex flex-col items-center justify-center p-2 text-center shadow-xs">
                <span className="text-2xl mb-1">👤</span>
                <span className="text-[9px] text-[#186D48] font-black uppercase">
                  VERIFIED
                </span>
              </div>
              <div className="col-span-2 space-y-2 text-xs">
                <div>
                  <span className="text-[#6F6675] text-[10px] font-bold block">Nomor KTN:</span>
                  <span className="font-mono font-black text-[#8C6008] tracking-wider text-xs bg-[#FFF8DF] px-2 py-0.5 rounded-md border border-[#F7D772]">
                    {ktnNumber}
                  </span>
                </div>
                <div>
                  <span className="text-[#6F6675] text-[10px] font-bold block">Status:</span>
                  <span className="font-extrabold text-[#186D48]">
                    Aktif (Tingkat 1 - Warga Baru)
                  </span>
                </div>
                <div>
                  <span className="text-[#6F6675] text-[10px] font-bold block">Afiliasi:</span>
                  <span className="text-[#3B3340] font-bold">@netizencity.id</span>
                </div>
              </div>
            </div>

            {/* Housing section inside KTN */}
            <div className="mt-4 pt-3 border-t-2 border-[#EADBCC] flex items-center space-x-3 text-xs bg-[#FFF9F1] p-3 rounded-2xl border border-[#EADBCC]">
              <Home className="w-5 h-5 text-[#2C6ECB] flex-shrink-0" />
              <div>
                <span className="text-[#6F6675] text-[10px] font-bold block">Alamat Hunian Awal:</span>
                <span className="font-extrabold text-[#3B3340]">
                  {housing.name} — {housing.unit} ({housing.district})
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t-2 border-[#EADBCC]">
            <Button variant="ghost" onClick={() => setStep(2)}>
              Kembali
            </Button>
            <Button variant="peach" onClick={() => setStep(4)}>
              <span>Klaim Bonus Warga Baru</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 4: STARTING COINS & ENTRY */}
      {step === 4 && (
        <div className="text-center py-4 space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-[#FFF8DF] border-2 border-[#F7D772] text-[#D4980B] flex items-center justify-center mx-auto shadow-sm animate-bounce">
            <Coins className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#D4980B]">
              Bonus Sambutan Balai Kota
            </span>
            <h2 className="text-3xl font-black text-[#3B3340] mt-1">
              +500 Netizen Coins
            </h2>
            <p className="text-[#6F6675] text-xs max-w-md mx-auto mt-2 leading-relaxed font-medium">
              Pemerintah NETIZENCITY memberikan saldo awal 500 Netizen Coins ke dompet virtualmu untuk berbelanja pakaian dan kebutuhan awal di kota!
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#FFF9F1] border-2 border-[#EADBCC] text-xs text-[#5C5265] max-w-md mx-auto space-y-2">
            <div className="flex items-center text-[#D4980B] font-bold mb-1">
              <Building2 className="w-4 h-4 mr-1.5" />
              Pesan Balai Kota NETIZENCITY:
            </div>
            <p className="italic text-[#6F6675]">
              &ldquo;Jadilah warga yang aktif, ramah, dan saling mendukung. Jelajahi alun-alun kota, ambil pekerjaan harian, dan bantu jadikan NETIZENCITY kota virtual terbaik!&rdquo;
            </p>
          </div>

          <Button
            variant="mint"
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
