// ============================================================
// NETIZENCITY - Game Title & Start Screen (Layar Awal Game)
// Cozy Low-Poly 3D City Simulation Game Experience
// Mascot: Pak Mayor (Walikota Netizen City)
// Palette: #F7F4E9 (Ivory), #EFE9D8 (Cream), #668B65 (Forest Green),
// #78634B (Warm Brown), #343B35 (Charcoal), #E6C66F (Muted Yellow)
// ============================================================

'use client'

import React, { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import {
  Users,
  Compass,
  Building2,
  ShieldCheck,
  ArrowRight,
  Play,
  ShoppingBag,
  Package,
  Vote,
  Sparkles,
  Mountain,
  Landmark,
  Volume2,
  VolumeX,
} from 'lucide-react'
import { InstagramIcon } from '@/components/ui/InstagramIcon'
import { formatNumber } from '@/lib/utils/formatting'

// Dynamic import of 3D Pak Mayor Mascot to ensure SSR compatibility
const MayorMascot3D = dynamic(() => import('@/components/game/MayorMascot3D'), {
  ssr: false,
  loading: () => (
    <div className="w-56 h-56 sm:w-64 sm:h-64 flex flex-col items-center justify-center text-[#78634B]">
      <div className="w-16 h-16 rounded-full bg-[#EFE9D8] border-2 border-[#D8CEBE] flex items-center justify-center text-2xl animate-bounce">
        🎩
      </div>
      <span className="text-xs font-bold mt-2">Memanggil Pak Mayor...</span>
    </div>
  ),
})

const MAYOR_QUOTES = [
  'Halo Warga! Selamat datang di NETIZENCITY! Tekan tombol "Mulai Main" di bawah untuk langsung menjelajahi kota!',
  'Dukung pembangunan kota dan dapatkan tempat di Menara Investor 11 Lantai lewat Trakteer resmi @sahamnetzencity!',
  'Sudah punya Kartu Tanda Netizen (KTN)? Daftarkan dirimu secara gratis untuk dapat rumah rusun dan 500 Koin Warga!',
  'Kunjungi Alun-Alun Tugu untuk berkumpul dan mengobrol live bersama sesama warga secara multiplayer!',
  'Ingin bergaya? Belanja kemeja kasual, gaun manis, dan topi keren di Netizen Grand Mall!',
  'Ayo bantu kota! Jalankan pekerjaan kurir harian dan ambil hadiah login di Balai Kota!',
]

export default function GameStartScreen() {
  const [stats, setStats] = useState({
    officialPopulation: 53400,
    registeredCitizens: 3420,
    onlineNow: 18,
  })

  const [quoteIndex, setQuoteIndex] = useState(0)

  const handleNextQuote = useCallback(() => {
    setQuoteIndex((prev) => (prev + 1) % MAYOR_QUOTES.length)
  }, [])

  // Auto-cycle quote every 9 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % MAYOR_QUOTES.length)
    }, 9000)
    return () => clearInterval(timer)
  }, [])

  // Fetch Live Population Stats
  useEffect(() => {
    const fetchStats = () => {
      fetch('/api/population')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data) {
            setStats({
              officialPopulation: data.officialPopulation ?? data.official_population ?? 53400,
              registeredCitizens: data.registeredCitizens ?? data.registered_citizens ?? 3420,
              onlineNow: data.onlineNow ?? data.online_now ?? 18,
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
    <div className="min-h-screen bg-[#F7F4E9] text-[#343B35] font-sans flex flex-col selection:bg-[#668B65]/20 selection:text-[#343B35] relative overflow-x-hidden">
      {/* Background Diorama Atmosphere Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(#D8CEBE_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      {/* Floating Low-Poly Cloud Accents */}
      <div className="absolute top-12 left-[8%] w-32 h-14 bg-white/60 rounded-full blur-xs pointer-events-none animate-pulse" />
      <div className="absolute top-28 right-[12%] w-40 h-16 bg-white/50 rounded-full blur-xs pointer-events-none animate-pulse delay-700" />

      {/* ============================================================ */}
      {/* GAME SYSTEM TOP BAR                                          */}
      {/* ============================================================ */}
      <header className="sticky top-0 z-50 bg-[#F7F4E9]/95 backdrop-blur-md border-b border-[#D8CEBE] shadow-xs">
        <div className="max-w-6xl mx-auto px-3 sm:px-6 h-14 flex items-center justify-between">
          {/* Game Brand Emblem */}
          <Link href="/" className="flex items-center space-x-2 group cursor-pointer">
            <div className="w-8 h-8 rounded-xl bg-[#668B65] text-white flex items-center justify-center font-heading font-extrabold text-xs shadow-sm group-hover:scale-105 transition-transform">
              NC
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="font-heading font-extrabold tracking-wide text-base text-[#343B35]">
                NETIZENCITY
              </span>
              <span className="hidden sm:inline-block text-[10px] font-bold text-[#668B65] bg-[#668B65]/15 px-1.5 py-0.2 rounded border border-[#668B65]/30">
                v1.0 &bull; Game 3D
              </span>
            </div>
          </Link>

          {/* Quick Access Navigation */}
          <nav className="flex items-center space-x-2 sm:space-x-3">
            <a
              href="https://www.instagram.com/netizencity.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-xs font-semibold text-[#78634B] hover:text-[#343B35] px-2.5 py-1.5 rounded-xl hover:bg-[#EFE9D8] transition-colors"
              title="Instagram Resmi @netizencity.id"
            >
              <InstagramIcon className="w-3.5 h-3.5 text-[#E08595]" />
              <span className="hidden sm:inline">@netizencity.id</span>
            </a>

            <a
              href="https://trakteer.id/sahamnetzencity/tip"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-xs font-bold text-rose-600 hover:text-rose-700 px-2.5 py-1.5 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
              title="Trakteer Mayor Netizen City (@sahamnetzencity)"
            >
              <span>☕</span>
              <span className="hidden sm:inline">Trakteer</span>
            </a>

            <Link
              href="/login"
              className="text-xs font-semibold text-[#343B35] hover:text-[#78634B] px-3 py-1.5 rounded-xl hover:bg-[#EFE9D8] border border-transparent hover:border-[#D8CEBE] transition-colors"
            >
              Masuk
            </Link>

            <Link
              href="/register"
              className="text-xs font-bold text-white bg-[#668B65] hover:bg-[#527251] active:translate-y-0.5 px-3.5 py-1.5 rounded-xl border border-[#527251] shadow-sm transition-all"
            >
              Daftar KTN
            </Link>
          </nav>
        </div>
      </header>

      {/* ============================================================ */}
      {/* MAIN GAME TITLE & START SCREEN HERO                          */}
      {/* ============================================================ */}
      <main className="flex-1 flex flex-col justify-center items-center py-8 sm:py-14 px-4 relative z-10">
        <div className="max-w-4xl w-full mx-auto flex flex-col items-center text-center">

          {/* Game Title Plaque / Signboard */}
          <div className="mb-4 sm:mb-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="inline-flex items-center space-x-2 bg-[#EFE9D8] border-2 border-[#D8CEBE] px-3.5 py-1 rounded-full text-[11px] font-heading font-extrabold text-[#78634B] shadow-xs mb-3">
              <span className="w-2 h-2 rounded-full bg-[#668B65] animate-pulse" />
              <span>DUNIA SIMULASI KOMUNITAS INDONESIA</span>
              <span className="text-[#D8CEBE]">&bull;</span>
              <span className="text-[#668B65]">SERVER ONLINE</span>
            </div>

            {/* Cozy Tactile Game Logo */}
            <h1 className="text-4xl sm:text-6xl font-heading font-black tracking-wider text-[#343B35] drop-shadow-sm select-none">
              NETIZENCITY
            </h1>
            <p className="font-heading font-bold text-xs sm:text-sm text-[#78634B] tracking-wide mt-1">
              ✦ KOTA VIRTUAL 3D DIORAMA WARGA NETIZEN ✦
            </p>
          </div>

          {/* 3D Pak Mayor Mascot Hero Showcase */}
          <div className="my-2 sm:my-4 flex flex-col items-center">
            <MayorMascot3D
              onMayorClick={handleNextQuote}
              currentQuote={MAYOR_QUOTES[quoteIndex]}
            />
          </div>

          {/* ============================================================ */}
          {/* PRIMARY GAME MENU BUTTONS (CHUNKY TACTILE GAME HUD)         */}
          {/* ============================================================ */}
          <div className="w-full max-w-md flex flex-col space-y-3 mt-4 sm:mt-6">
            {/* Primary Action: Mulai Main */}
            <Link
              href="/city"
              className="group relative w-full flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-[#668B65] hover:bg-[#577756] active:translate-y-1 text-white border-b-4 border-[#435C42] shadow-lg transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-3 text-left">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <div className="font-heading font-black text-base sm:text-lg tracking-wide leading-tight">
                    MULAI PETUALANGAN KOTA
                  </div>
                  <div className="text-[11px] text-[#E0EEDF] font-medium leading-none mt-0.5">
                    Langsung jelajahi kota 3D &amp; Alun-Alun warga
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
            </Link>

            {/* Secondary Action: Buat KTN Baru */}
            <Link
              href="/register"
              className="group w-full flex items-center justify-between p-3 sm:p-3.5 rounded-2xl bg-[#F7F4E9] hover:bg-[#EFE9D8] active:translate-y-0.5 text-[#343B35] border-2 border-[#D8CEBE] border-b-4 border-b-[#B8AFA0] shadow-sm transition-all cursor-pointer"
            >
              <div className="flex items-center space-x-3 text-left">
                <div className="w-9 h-9 rounded-xl bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-[#E6C66F] shrink-0 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-heading font-extrabold text-sm text-[#343B35] leading-tight">
                    Daftar Kartu Tanda Netizen (KTN)
                  </div>
                  <div className="text-[11px] text-[#78634B] font-medium leading-none mt-0.5">
                    Gratis &bull; Klaim hunian rusun &amp; 500 Koin Warga
                  </div>
                </div>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#668B65] bg-[#668B65]/15 px-2 py-0.5 rounded border border-[#668B65]/30 shrink-0">
                Warga Baru
              </span>
            </Link>

            {/* Tertiary: Masuk Akun Warga */}
            <div className="pt-1 text-center">
              <span className="text-xs text-[#78634B]">Sudah pernah membuat KTN? </span>
              <Link
                href="/login"
                className="text-xs font-heading font-bold text-[#668B65] hover:underline"
              >
                Masuk ke Akun Wargamu &rarr;
              </Link>
            </div>
          </div>

          {/* ============================================================ */}
          {/* GAME WORLD LIVE STATISTICS HUD                               */}
          {/* ============================================================ */}
          <div className="w-full max-w-2xl mt-8 sm:mt-12 bg-[#F7F4E9] border-2 border-[#D8CEBE] rounded-2xl p-3 sm:p-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#D8CEBE] pb-2 mb-3">
              <span className="text-[11px] font-heading font-extrabold text-[#78634B] uppercase tracking-wider flex items-center gap-1.5">
                <Landmark className="w-3.5 h-3.5 text-[#668B65]" />
                Status Kota Netizen (Live Sync)
              </span>
              <span className="text-[10px] font-bold text-[#668B65] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#668B65] animate-pulse" />
                Server Aktif
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
              {/* Stat 1: Official Instagram Population */}
              <a
                href="https://www.instagram.com/netizencity.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 sm:p-3 rounded-xl bg-[#EFE9D8]/70 hover:bg-[#EFE9D8] border border-[#D8CEBE] transition-colors cursor-pointer group"
                title="Populasi resmi dari Instagram @netizencity.id"
              >
                <div className="flex items-center justify-center space-x-1 text-[#78634B] text-[10px] sm:text-[11px] font-heading font-bold uppercase mb-0.5">
                  <InstagramIcon className="w-3 h-3 text-[#E08595]" />
                  <span className="truncate">Populasi IG</span>
                </div>
                <div className="text-base sm:text-xl font-heading font-black text-[#343B35]">
                  {formatNumber(stats.officialPopulation)}
                </div>
                <div className="text-[9px] text-[#78634B]/80 hidden sm:block">
                  Followers @netizencity.id
                </div>
              </a>

              {/* Stat 2: Registered Citizens */}
              <div className="p-2 sm:p-3 rounded-xl bg-[#EFE9D8]/70 border border-[#D8CEBE]">
                <div className="flex items-center justify-center space-x-1 text-[#78634B] text-[10px] sm:text-[11px] font-heading font-bold uppercase mb-0.5">
                  <Users className="w-3 h-3 text-[#668B65]" />
                  <span className="truncate">Warga KTN</span>
                </div>
                <div className="text-base sm:text-xl font-heading font-black text-[#343B35]">
                  {formatNumber(stats.registeredCitizens)}
                </div>
                <div className="text-[9px] text-[#78634B]/80 hidden sm:block">
                  Warga Terverifikasi
                </div>
              </div>

              {/* Stat 3: Online Players */}
              <div className="p-2 sm:p-3 rounded-xl bg-[#E6F0E4]/60 border border-[#C5D8C4]">
                <div className="flex items-center justify-center space-x-1 text-[#4F6E4E] text-[10px] sm:text-[11px] font-heading font-bold uppercase mb-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#668B65] animate-pulse" />
                  <span className="truncate">Online</span>
                </div>
                <div className="text-base sm:text-xl font-heading font-black text-[#668B65]">
                  {formatNumber(stats.onlineNow)}
                </div>
                <div className="text-[9px] text-[#4F6E4E]/80 hidden sm:block">
                  Sedang Bermain
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================ */}
          {/* GAMEPLAY ACTIVITIES & LANDMARKS                              */}
          {/* ============================================================ */}
          <div className="w-full max-w-4xl mt-10 sm:mt-16 text-left">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-heading font-black text-[#343B35]">
                Destinasi &amp; Aktivitas Kota
              </h2>
              <p className="text-xs text-[#78634B] font-medium mt-1">
                Jelajahi seluruh pelosok diorama interaktif NETIZENCITY
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {/* Landmark 1: Alun-Alun Tugu */}
              <div className="p-4 rounded-2xl bg-[#F7F4E9] border-2 border-[#D8CEBE] shadow-xs hover:border-[#668B65] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-[#668B65] mb-2.5">
                  <Landmark className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-sm text-[#343B35]">
                  Alun-Alun Tugu Multiplayer
                </h3>
                <p className="text-xs text-[#78634B] mt-1 leading-relaxed">
                  Kawasan sosial berkumpul sesama warga secara real-time (maks. 10 per ruangan), kendalikan karakter dengan analog joystick, dan balon kata live.
                </p>
              </div>

              {/* Landmark 2: Grand Mall Busana */}
              <div className="p-4 rounded-2xl bg-[#F7F4E9] border-2 border-[#D8CEBE] shadow-xs hover:border-[#668B65] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-[#E6C66F] mb-2.5">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-sm text-[#343B35]">
                  Netizen Grand Mall
                </h3>
                <p className="text-xs text-[#78634B] mt-1 leading-relaxed">
                  Kustomisasi gayamu di toko busana kota! Beli pakaian kasual, kemeja, celana, sepatu, dan aksesoris khas diorama dengan koin warga.
                </p>
              </div>

              {/* Landmark 3: Balai Kota & Demokrasi */}
              <div className="p-4 rounded-2xl bg-[#F7F4E9] border-2 border-[#D8CEBE] shadow-xs hover:border-[#668B65] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-[#668B65] mb-2.5">
                  <Vote className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-sm text-[#343B35]">
                  Balai Kota &amp; Poling Kebijakan
                </h3>
                <p className="text-xs text-[#78634B] mt-1 leading-relaxed">
                  Pusat administrasi kota tempat Pak Mayor berkantor. Berikan suaramu untuk menentukan pembangunan fasilitas publik berikutnya.
                </p>
              </div>

              {/* Landmark 4: Misi Kurir Paket */}
              <div className="p-4 rounded-2xl bg-[#F7F4E9] border-2 border-[#D8CEBE] shadow-xs hover:border-[#668B65] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-[#78634B] mb-2.5">
                  <Package className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-sm text-[#343B35]">
                  Misi Harian Kurir Kota
                </h3>
                <p className="text-xs text-[#78634B] mt-1 leading-relaxed">
                  Ambil pekerjaan pengantaran barang ke berbagai distrik untuk mengumpulkan koin warga dan menaikkan level reputasi wargamu.
                </p>
              </div>

              {/* Landmark 5: Kawasan Wisata Alam & Gunung */}
              <div className="p-4 rounded-2xl bg-[#F7F4E9] border-2 border-[#D8CEBE] shadow-xs hover:border-[#668B65] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-[#A5BE91] mb-2.5">
                  <Mountain className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-sm text-[#343B35]">
                  Gunung &amp; Air Terjun Alami
                </h3>
                <p className="text-xs text-[#78634B] mt-1 leading-relaxed">
                  Wisata alam hijau dengan jalur pendakian zig-zag dan danau alami yang tenang di batas utara kota diorama.
                </p>
              </div>

              {/* Landmark 6: Kucing Mayor & Habitat Satwa */}
              <div className="p-4 rounded-2xl bg-[#F7F4E9] border-2 border-[#D8CEBE] shadow-xs hover:border-[#668B65] transition-colors">
                <div className="w-9 h-9 rounded-xl bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-[#E08595] mb-2.5">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-bold text-sm text-[#343B35]">
                  Kucing Mayor &amp; Safari
                </h3>
                <p className="text-xs text-[#78634B] mt-1 leading-relaxed">
                  Temui Kucing oranye kesayangan Pak Mayor yang gemar berjalan di Alun-Alun dan satwa ramah di Kebun Binatang Safari.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================ */}
      {/* GAME FOOTER                                                  */}
      {/* ============================================================ */}
      <footer className="border-t border-[#D8CEBE] bg-[#EFE9D8]/60 py-6 px-4 text-center text-xs text-[#78634B] relative z-10">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="font-heading font-bold text-[#343B35]">NETIZENCITY</span>
            <span>&bull;</span>
            <span>Game Simulasi Komunitas Virtual Indonesia</span>
          </div>

          <div className="flex items-center space-x-3">
            <a
              href="https://www.instagram.com/netizencity.id/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[#343B35] font-semibold flex items-center gap-1 transition-colors"
            >
              <InstagramIcon className="w-3.5 h-3.5 text-[#E08595]" />
              <span>@netizencity.id</span>
            </a>
            <span>&bull;</span>
            <span>Edisi 2026</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
