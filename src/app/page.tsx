'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  Compass,
  Building2,
  Sparkles,
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
    // Fetch live stats from API if available
    fetch('/api/population')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setStats({
            officialPopulation: data.official_population ?? 25800,
            registeredCitizens: data.registered_citizens ?? 3420,
            onlineNow: data.online_now ?? 128,
          })
        }
      })
      .catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Bar / Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 p-0.5 shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center font-black tracking-wider text-blue-400 text-sm">
                NC
              </div>
            </div>
            <div>
              <span className="font-extrabold tracking-wider text-lg bg-gradient-to-r from-blue-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                NETIZENCITY
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                Virtual World
              </span>
            </div>
          </div>

          <nav className="flex items-center space-x-4">
            <a
              href="https://www.instagram.com/netizencity.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-slate-800"
            >
              <InstagramIcon className="w-4 h-4 text-pink-400" />
              <span className="hidden sm:inline">@netizencity.id</span>
            </a>
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-200 hover:text-white py-2 px-3.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Masuk
            </Link>
            <Link
              href="/register"
              className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 py-2 px-4 rounded-lg shadow-md shadow-blue-900/30 border border-blue-400/30 transition-all active:scale-95"
            >
              Daftar KTN
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden py-16 sm:py-24 border-b border-slate-800/60">
          {/* Pixel-style grid background */}
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          {/* Ambient Glows */}
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/2 right-10 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 mb-6 shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-slate-300">
                Dunia Virtual Komunitas Netizen City Indonesia
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white mb-6 uppercase leading-tight">
              Your Community.{' '}
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-teal-300 bg-clip-text text-transparent">
                Your City.
              </span>{' '}
              Your World.
            </h1>

            <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 mb-10 leading-relaxed font-normal">
              Selamat datang di <strong className="text-white font-semibold">NETIZENCITY</strong>. Kota virtual 2D persisten di mana followers @netizencity.id menjadi warga nyata: berjelajah, memiliki hunian, bekerja, berbelanja, dan membangun peradaban kota bersama.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
              <Link
                href="/city"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-base shadow-xl shadow-blue-900/30 border border-blue-400/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Gamepad2 className="w-5 h-5" />
                <span>Masuk ke Kota Sekarang</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <Link
                href="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 font-semibold text-base border border-slate-700 transition-colors"
              >
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <span>Buat KTN (Kartu Tanda Netizen)</span>
              </Link>
            </div>

            {/* Critical Live Statistics: 3 Distinct Counters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <InstagramIcon className="w-4 h-4 text-pink-400" />
                  <span>Populasi Resmi Kota</span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {formatNumber(stats.officialPopulation)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium flex items-center justify-center space-x-2">
                  <span>Follower @netizencity.id</span>
                  <span>&bull;</span>
                  <Link
                    href="/admin/instagram"
                    className="text-pink-400 hover:text-pink-300 font-semibold underline underline-offset-2"
                  >
                    Sync / Kelola
                  </Link>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>Warga Terdaftar</span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  {formatNumber(stats.registeredCitizens)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">
                  Pemilik Akun & KTN
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-slate-700 transition-colors">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl pointer-events-none" />
                <div className="flex items-center justify-center space-x-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  <span>Online di Kota</span>
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 tracking-tight">
                  {formatNumber(stats.onlineNow)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 font-medium">
                  Warga Aktif Saat Ini
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* City Districts & Features */}
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-3">
              Distrik & Fasilitas Kota
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-white">
              Eksplorasi 6 Wilayah Utama NETIZENCITY
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 rounded-2xl p-6 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">1. Downtown (Pusat Kota)</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Balai Kota (City Hall), Kantor Walikota, Alun-Alun Utama, dan Pusat Pelayanan Publik. Tempat warga berkumpul untuk pengambilan kebijakan kota.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-6 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">2. Distrik Perumahan</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Rumah sederhana, rusunawa, dan apartemen warga. Setiap warga baru berhak mendapatkan penempatan tempat tinggal saat menyelesaikan registrasi.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 transition-all">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Coins className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">3. Distrik Komersial</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Mall belanja, kafe, minimarket, dan toko busana. Belanja outfit kustomisasi avatar dengan Netizen Coin yang didapat dari pekerjaan.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 rounded-2xl p-6 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <Gamepad2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">4. Kawasan Industri</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Pusat pekerjaan mini-game: Pabrik, logistik kurir pengiriman barang, area tambang, dan kebun kota untuk menghasilkan Netizen Coin.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 hover:border-pink-500/40 rounded-2xl p-6 transition-all">
              <div className="w-12 h-12 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">5. Hiburan & Festival</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Taman kota, panggung festival, dan area turnamen game komunitas. Ikuti event berkala dan rayakan pencapaian bersama warga lainnya.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 rounded-2xl p-6 transition-all">
              <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-4">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">6. Bandara Netizen</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Gerbang kedatangan warga baru saat pertama kali landing di kota. Di sinilah onboarding warga dimulai sebelum mendapatkan KTN resmi.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-300">NETIZENCITY</span>
            <span>&bull;</span>
            <span>Komunitas Instagram @netizencity.id</span>
          </div>
          <div>
            Powered by Next.js, Phaser 3 &amp; Supabase Realtime
          </div>
        </div>
      </footer>
    </div>
  )
}
