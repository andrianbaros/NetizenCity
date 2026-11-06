'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Compass,
  Building2,
  Trophy,
  ShieldCheck,
  ArrowRight,
  Gamepad2,
  Coins,
  MapPin,
} from 'lucide-react'
import { InstagramIcon } from '@/components/ui/InstagramIcon'
import { formatNumber } from '@/lib/utils/formatting'

export default function LandingPage() {
  const [stats, setStats] = useState({
    officialPopulation: 25800,
    registeredCitizens: 3420,
    onlineNow: 128,
  })

  useEffect(() => {
    const fetchStats = () => {
      fetch('/api/population')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setStats({
              officialPopulation: data.official_population ?? 53400,
              registeredCitizens: data.registered_citizens ?? 3420,
              onlineNow: data.online_now ?? 1,
            })
          }
        })
        .catch(() => {})
    }

    fetchStats()
    const interval = setInterval(fetchStats, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-[#F8F4EE] text-[#3B3340] flex flex-col selection:bg-[#F4A98C] selection:text-white">
      {/* Top Bar / Navigation */}
      <header className="border-b-2 border-[#EADBCC] bg-[#FFFDF9]/90 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#F4A98C] via-[#F2C1D6] to-[#C9B8E8] p-0.5 shadow-md">
              <div className="w-full h-full bg-[#FFFDF9] rounded-[14px] flex items-center justify-center font-black tracking-wider text-[#F4A98C] text-sm">
                NC
              </div>
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-lg bg-gradient-to-r from-[#F4A98C] via-[#E2829F] to-[#76A9EA] bg-clip-text text-transparent">
                NETIZENCITY
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#E8F8F0] text-[#1E7250] border border-[#A8DCC8]">
                Diorama 3D
              </span>
            </div>
          </div>

          <nav className="flex items-center space-x-3">
            <a
              href="https://www.instagram.com/netizencity.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 text-xs font-bold text-[#5C5265] hover:text-[#3B3340] transition-colors py-2 px-3 rounded-xl hover:bg-[#F8F4EE]"
            >
              <InstagramIcon className="w-4 h-4 text-[#F282A8]" />
              <span className="hidden sm:inline">@netizencity.id</span>
            </a>
            <Link
              href="/login"
              className="text-xs font-bold text-[#5C5265] hover:text-[#3B3340] py-2 px-3.5 rounded-xl hover:bg-[#F8F4EE] transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="text-xs font-bold text-white bg-[#F4A98C] hover:bg-[#E89578] py-2 px-4 rounded-xl shadow-xs border-b-3 border-[#B85838] active:border-b-0 active:translate-y-0.5 transition-all"
            >
              Daftar KTN
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-16 sm:py-24 border-b-2 border-[#EADBCC] bg-gradient-to-b from-[#FFFDF9] via-[#FBF7F0] to-[#F8F4EE]">
          {/* Ambient Warm Pastel Glows */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#FFE8CC]/40 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 right-10 w-72 h-72 bg-[#E6F3FF]/50 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#FFFDF9] border-2 border-[#EADBCC] mb-6 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4EBA88] animate-pulse" />
              <span className="text-xs font-bold text-[#5C5265]">
                Dunia Virtual Diorama Komunitas Netizen City Indonesia
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-[#3B3340] mb-6 leading-tight">
              Your Community.{' '}
              <span className="bg-gradient-to-r from-[#F4A98C] via-[#E2829F] to-[#76A9EA] bg-clip-text text-transparent">
                Your City.
              </span>{' '}
              Your World.
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#6F6675] mb-10 leading-relaxed font-medium">
              Selamat datang di <strong className="text-[#3B3340] font-extrabold">NETIZENCITY</strong>. Kota virtual 3D diorama hangat di mana followers @netizencity.id menjadi warga nyata: berjelajah, memiliki hunian, berbelanja di mall, dan membangun peradaban kota bersama.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/city"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-2xl bg-[#76A9EA] hover:bg-[#6297DC] text-white font-extrabold text-base border-b-4 border-[#4A7BB8] active:border-b-2 active:translate-y-0.5 shadow-md transition-all hover:scale-[1.01]"
              >
                <Gamepad2 className="w-5 h-5" />
                <span>Masuk ke Kota Sekarang</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-4 rounded-2xl bg-[#FFFDF9] hover:bg-[#FFF9F1] text-[#3B3340] font-extrabold text-base border-2 border-[#EADBCC] border-b-4 border-b-[#D6C2AC] active:border-b-2 active:translate-y-0.5 shadow-xs transition-colors"
              >
                <ShieldCheck className="w-5 h-5 text-[#D4980B]" />
                <span>Buat KTN (Kartu Tanda Netizen)</span>
              </Link>
            </div>

            {/* Critical Live Statistics: 3 Distinct Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="bg-[#FFFDF9] border-2 border-[#EADBCC] rounded-3xl p-5 shadow-xs hover:border-[#D6C2AC] transition-colors relative overflow-hidden group">
                <div className="flex items-center justify-center space-x-2 text-[#6F6675] text-xs font-bold uppercase tracking-wider mb-2">
                  <InstagramIcon className="w-4 h-4 text-[#F282A8]" />
                  <span>Populasi Resmi Kota</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-[#3B3340] tracking-tight">
                  {formatNumber(stats.officialPopulation)}
                </div>
                <div className="text-[11px] text-[#6F6675] mt-1 font-semibold flex items-center justify-center space-x-2">
                  <span>Follower @netizencity.id</span>
                  <span>&bull;</span>
                  <Link
                    href="/admin/instagram"
                    className="text-[#D84978] hover:text-[#B5345F] font-bold underline underline-offset-2"
                  >
                    Sync / Kelola
                  </Link>
                </div>
              </div>

              <div className="bg-[#FFFDF9] border-2 border-[#EADBCC] rounded-3xl p-5 shadow-xs hover:border-[#D6C2AC] transition-colors relative overflow-hidden group">
                <div className="flex items-center justify-center space-x-2 text-[#6F6675] text-xs font-bold uppercase tracking-wider mb-2">
                  <Users className="w-4 h-4 text-[#2C6ECB]" />
                  <span>Warga Terdaftar</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-[#3B3340] tracking-tight">
                  {formatNumber(stats.registeredCitizens)}
                </div>
                <div className="text-[11px] text-[#6F6675] mt-1 font-semibold">
                  Pemilik Akun &amp; KTN
                </div>
              </div>

              <div className="bg-[#FFFDF9] border-2 border-[#EADBCC] rounded-3xl p-5 shadow-xs hover:border-[#D6C2AC] transition-colors relative overflow-hidden group">
                <div className="flex items-center justify-center space-x-2 text-[#6F6675] text-xs font-bold uppercase tracking-wider mb-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4EBA88] animate-ping inline-block" />
                  <span>Online di Kota</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-[#186D48] tracking-tight">
                  {formatNumber(stats.onlineNow)}
                </div>
                <div className="text-[11px] text-[#6F6675] mt-1 font-semibold">
                  Warga Aktif Saat Ini
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* City Districts & Features */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-[#F4A98C] mb-3">
              Distrik &amp; Fasilitas Kota
            </h2>
            <p className="text-2xl sm:text-3xl font-black text-[#3B3340]">
              Eksplorasi Wilayah Utama NETIZENCITY
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#FFFDF9] border-2 border-[#EADBCC] hover:border-[#76A9EA] rounded-3xl p-6 transition-all shadow-xs hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-[#EBF4FD] text-[#2C6ECB] border border-[#A9C8EC] flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-[#3B3340] mb-2">1. Downtown (Pusat Kota)</h3>
              <p className="text-[#6F6675] text-xs leading-relaxed font-medium">
                Balai Kota (City Hall), Kantor Walikota, Alun-Alun Utama, dan Pusat Pelayanan Publik. Tempat warga berkumpul untuk pengambilan kebijakan kota.
              </p>
            </div>

            <div className="bg-[#FFFDF9] border-2 border-[#EADBCC] hover:border-[#4EBA88] rounded-3xl p-6 transition-all shadow-xs hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-[#E8F8F0] text-[#186D48] border border-[#A8DCC8] flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-[#3B3340] mb-2">2. Distrik Perumahan</h3>
              <p className="text-[#6F6675] text-xs leading-relaxed font-medium">
                Kampung Angkatan 1, rusunawa, dan rumah tapak warga. Setiap warga baru berhak mendapatkan penempatan tempat tinggal saat menyelesaikan registrasi.
              </p>
            </div>

            <div className="bg-[#FFFDF9] border-2 border-[#EADBCC] hover:border-[#F7D772] rounded-3xl p-6 transition-all shadow-xs hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF8DF] text-[#8C6008] border border-[#F7D772] flex items-center justify-center mb-4">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-[#3B3340] mb-2">3. Distrik Komersial &amp; Mall</h3>
              <p className="text-[#6F6675] text-xs leading-relaxed font-medium">
                Netizen Mall, kafe, minimarket, dan ruko busana. Belanja outfit kustomisasi avatar dengan Netizen Coins yang didapat dari pekerjaan kota.
              </p>
            </div>

            <div className="bg-[#FFFDF9] border-2 border-[#EADBCC] hover:border-[#D9C8B5] rounded-3xl p-6 transition-all shadow-xs hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-[#F0ECE7] text-[#5C5265] border border-[#D9C8B5] flex items-center justify-center mb-4">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-[#3B3340] mb-2">4. Kawasan Industri</h3>
              <p className="text-[#6F6675] text-xs leading-relaxed font-medium">
                Pabrik, logistik kurir pengiriman barang, area tambang, dan kebun kota untuk menghasilkan Netizen Coins dan XP warga.
              </p>
            </div>

            <div className="bg-[#FFFDF9] border-2 border-[#EADBCC] hover:border-[#F2A0B4] rounded-3xl p-6 transition-all shadow-xs hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-[#FFF0F4] text-[#D84978] border border-[#F8B4C8] flex items-center justify-center mb-4">
                <Trophy className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-[#3B3340] mb-2">5. Hiburan &amp; Olahraga</h3>
              <p className="text-[#6F6675] text-xs leading-relaxed font-medium">
                Stadion sepak bola megah, kebun binatang safari, pantai Netizen Beach, dan taman kota untuk bersantai bersama warga lainnya.
              </p>
            </div>

            <div className="bg-[#FFFDF9] border-2 border-[#EADBCC] hover:border-[#C9B8E8] rounded-3xl p-6 transition-all shadow-xs hover:shadow-md">
              <div className="w-12 h-12 rounded-2xl bg-[#F3EEFA] text-[#6A3F98] border border-[#C9B8E8] flex items-center justify-center mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-[#3B3340] mb-2">6. Bandara Netizen</h3>
              <p className="text-[#6F6675] text-xs leading-relaxed font-medium">
                Gerbang kedatangan warga baru saat pertama kali landing di kota lengkap dengan runway pesawat dan penerbangan terjadwal.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t-2 border-[#EADBCC] bg-[#FFFDF9] py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6F6675]">
          <div className="flex items-center space-x-2">
            <span className="font-extrabold text-[#3B3340]">NETIZENCITY</span>
            <span>&bull;</span>
            <span>Komunitas Instagram @netizencity.id</span>
          </div>
          <div className="font-semibold">
            Diorama 3D WebGL &bull; Powered by Next.js &amp; Three.js
          </div>
        </div>
      </footer>
    </div>
  )
}
