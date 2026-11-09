// ============================================================
// NETIZENCITY - Primary Game Heads-Up Display (GameHUD)
// Cozy Low-Poly City Simulation Interface (Tactile & Game-Native)
// Palette: #F7F4E9 (Ivory), #EFE9D8 (Cream), #668B65 (Forest Green),
// #78634B (Warm Brown), #343B35 (Charcoal), #E6C66F (Muted Yellow)
// ============================================================

'use client'

import React, { useEffect, useCallback, useState } from 'react'
import Link from 'next/link'
import {
  Coins,
  Users,
  ShieldCheck,
  ShoppingBag,
  Gift,
  Building2,
  LogOut,
  MapPin,
  Moon,
  Package,
  Award,
  Vote,
  MoreHorizontal,
  X,
  User,
  Camera,
  Fish,
  Sprout,
  Trophy,
  Backpack,
} from 'lucide-react'
import { InstagramIcon } from '@/components/ui/InstagramIcon'
import { useGameStore } from '@/lib/stores/useGameStore'
import { useUIStore } from '@/lib/stores/useUIStore'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'
import { formatCoins, formatNumber } from '@/lib/utils/formatting'
import ChatPanel from './ChatPanel'
import KTNCardModal from './KTNCardModal'
import MallModal from './MallModal'
import DailyRewardModal from './DailyRewardModal'
import BuildingModal from './BuildingModal'
import MissionsModal from './MissionsModal'
import PhotoStudioModal from './PhotoStudioModal'
import CatHuntModal from './CatHuntModal'
import FishingModal from './FishingModal'
import FreekickModal from './FreekickModal'
import GardenModal from './GardenModal'
import InvestorModal from './InvestorModal'
import InventoryModal from './InventoryModal'
import BGMPlayer from './BGMPlayer'

export default function GameHUD() {
  const cityStats = useGameStore((s) => s.cityStats)
  const setCityStats = useGameStore((s) => s.setCityStats)
  const currentDistrict = useGameStore((s) => s.currentDistrict)
  const selectedBuilding = useGameStore((s) => s.selectedBuilding)
  const setSelectedBuilding = useGameStore((s) => s.setSelectedBuilding)

  const wallet = useCitizenStore((s) => s.wallet)
  const profile = useCitizenStore((s) => s.profile)
  const inventory = useCitizenStore((s) => s.inventory)
  const setProfile = useCitizenStore((s) => s.setProfile)
  const setWallet = useCitizenStore((s) => s.setWallet)
  const setInventory = useCitizenStore((s) => s.setInventory)

  const activeModal = useUIStore((s) => s.activeModal)
  const openModal = useUIStore((s) => s.openModal)
  const closeModal = useUIStore((s) => s.closeModal)
  const notifications = useUIStore((s) => s.notifications)
  const removeNotification = useUIStore((s) => s.removeNotification)

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isTuguMode, setIsTuguMode] = useState(false)

  useEffect(() => {
    const onMode = (e: any) => {
      setIsTuguMode(e.detail?.mode === 'tugu')
    }
    window.addEventListener('tugu-mode-changed', onMode)
    return () => window.removeEventListener('tugu-mode-changed', onMode)
  }, [])

  // Fetch active citizen profile and city population on mount
  const initGameData = useCallback(async () => {
    try {
      // 1. Fetch Citizen Profile & Wallet
      const citRes = await fetch('/api/citizens/me')
      if (citRes.ok) {
        const citData = await citRes.json()
        if (citData.citizen) {
          setProfile({
            id: citData.citizen.id,
            userId: citData.citizen.user_id,
            username: citData.citizen.username,
            displayName: citData.citizen.display_name,
            ktnNumber: citData.citizen.ktn_number,
            avatarConfig: citData.citizen.avatar_config,
            level: citData.citizen.level || 1,
            xp: citData.citizen.xp || 0,
            job: citData.citizen.job || 'Warga Baru',
            housingId: citData.citizen.housing_id,
            housingName: citData.citizen.housing_name || 'Rusunawa Harapan Baru',
            district: citData.citizen.district || 'Perumahan Utara',
            biography: citData.citizen.biography || '',
            isOnline: true,
            role: citData.citizen.role || 'citizen',
            lastLocation: null,
            joinedAt: citData.citizen.joined_at,
            updatedAt: citData.citizen.updated_at || citData.citizen.joined_at,
          })

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('avatar-updated'))
          }
        } else {
          setProfile(null)
        }
        if (citData.wallet) {
          setWallet({
            id: citData.wallet.id,
            citizenId: citData.wallet.citizen_id,
            balance: citData.wallet.balance,
            totalEarned: citData.wallet.total_earned,
            totalSpent: citData.wallet.total_spent,
            updatedAt: citData.wallet.updated_at,
          })
        } else {
          setWallet(null)
        }
        if (citData.inventory) {
          setInventory(citData.inventory)
        } else {
          setInventory([])
        }
      }

      // 2. Fetch Live Population Stats
      const popRes = await fetch('/api/population')
      if (popRes.ok) {
        const popData = await popRes.json()
        setCityStats({
          officialPopulation: popData.officialPopulation ?? 53000,
          registeredCitizens: popData.registeredCitizens ?? 103,
          onlineNow: popData.onlineNow ?? 18,
        })
      }
    } catch {
      // Fallback
    }
  }, [setProfile, setWallet, setInventory, setCityStats])

  useEffect(() => {
    initGameData()
    const interval = setInterval(initGameData, 15000)
    return () => clearInterval(interval)
  }, [initGameData])

  const districtNames: Record<string, string> = {
    town_square: 'Alun-Alun Pusat',
    residential: 'Perumahan Utara',
    commercial: 'Komersial & Mall',
    industrial: 'Kawasan Industri',
    airport: 'Bandara Internasional',
    entertainment: 'Taman & Hiburan',
    'Downtown (Pusat Kota)': 'Pusat Pemerintahan',
    'Komersial & Mall': 'Mall & Ruko',
    'Pusat Kota': 'Monumen Netizen City',
    'Distrik Investor': 'Menara Investor',
    'Fasilitas Publik': 'Fasilitas Publik',
    Transportasi: 'Stasiun Kereta',
    'Kawasan Kerukunan': 'Kawasan Kerukunan',
    'Bandara & Kedatangan': 'Bandara Internasional',
    'Olahraga & Hiburan': 'Stadion Netizen City',
    'Distrik Riset': 'Laboratorium Riset',
    'Kawasan Wisata & Edukasi': 'Kebun Binatang',
    'Distrik Riset & Pendidikan': 'Universitas',
    'Kawasan Alam': 'Gunung & Air Terjun',
    'Kawasan Alam & Wisata': 'Pantai Netizen Beach',
  }

  const currentCoins = wallet?.balance ?? (profile ? 500 : 0)

  const handleOpenCityHall = () => {
    setSelectedBuilding('city_hall')
    openModal('building_details')
    setMobileMenuOpen(false)
  }

  const handleStartCourier = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('start-courier-job'))
    }
    setMobileMenuOpen(false)
  }

  const handleToggleDayNight = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('toggle-day-night'))
    }
    setMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    setProfile(null)
    setWallet(null)
    setInventory([])
    window.location.reload()
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-2 sm:p-4 select-none font-sans">
      {/* ============================================================ */}
      {/* TOP HUD BAR: Player Identity, City Stats & Action Toolbar   */}
      {/* ============================================================ */}
      <header className="flex items-center justify-between gap-1.5 sm:gap-2.5 pointer-events-none w-full">
        {/* A. Player Profile — Top Left */}
        {profile ? (
          <div className="flex items-center space-x-1.5 sm:space-x-2 bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl p-1 sm:p-1.5 pr-2 sm:pr-3 shadow-[0_3px_10px_rgba(52,59,53,0.08)] pointer-events-auto shrink-0">
            <button
              type="button"
              onClick={() => openModal('ktn_card')}
              title="Lihat Kartu Tanda Netizen (KTN)"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-[#668B65] font-heading font-extrabold text-xs hover:bg-[#E2DAC7] transition-colors cursor-pointer shrink-0"
            >
              NC
            </button>
            <div className="min-w-0">
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <span className="text-[11px] sm:text-xs font-heading font-bold text-[#343B35] truncate max-w-[65px] sm:max-w-[130px]">
                  {profile.displayName}
                </span>
                <span className="hidden sm:inline-block text-[9px] sm:text-[10px] text-[#4F6E4E] font-heading font-bold bg-[#E6F0E4] px-1.5 py-0.2 rounded-md border border-[#C5D8C4]">
                  @{profile.username}
                </span>
                <span className="text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.2 rounded-md bg-[#EFE9D8] text-[#78634B] font-heading font-bold border border-[#D8CEBE]">
                  Lv.{profile.level || 1}
                </span>
              </div>
              <div className="hidden sm:flex items-center space-x-1 text-[10px] text-[#78634B] font-medium mt-0.5 truncate">
                <MapPin className="w-2.5 h-2.5 text-[#668B65] shrink-0" />
                <span className="truncate">{districtNames[currentDistrict] || 'Netizen City'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-1.5 bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl p-1 sm:p-1.5 pr-2 sm:pr-3 shadow-[0_3px_10px_rgba(52,59,53,0.08)] pointer-events-auto shrink-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-[#78634B] shrink-0">
              <User className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <span className="text-[11px] sm:text-xs font-heading font-bold text-[#343B35]">
                  Tamu
                </span>
                <span className="hidden sm:inline-block text-[9px] text-[#78634B] font-heading font-semibold bg-[#EFE9D8] px-1.5 py-0.2 rounded-md">
                  Belum Masuk
                </span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-1.5 text-[9px] sm:text-[10px] font-heading font-bold leading-none mt-0.5">
                <Link
                  href="/login"
                  className="text-[#78634B] hover:text-[#343B35]"
                >
                  Masuk
                </Link>
                <span className="text-[#C6BBA8]">•</span>
                <Link
                  href="/welcome"
                  className="text-[#668B65] hover:text-[#4F6E4E]"
                >
                  Daftar
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* B. City Statistics — Top Center (Hidden in Tugu mode to prevent overlapping with Room pills) */}
        {!isTuguMode && (
          <>
            {/* Desktop View (md+) */}
            <div className="hidden md:flex items-center space-x-3 bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl px-3 py-1.5 shadow-[0_3px_10px_rgba(52,59,53,0.08)] text-xs pointer-events-auto">
              {/* 1. Official Instagram Population */}
              <Link
                href="/admin/instagram"
                title="Kelola Integrasi Instagram @netizencity.id"
                className="flex items-center space-x-1.5 group hover:opacity-80 transition-opacity"
              >
                <div className="w-6 h-6 rounded-md bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-[#78634B]">
                  <InstagramIcon className="w-3.5 h-3.5" />
                </div>
                <div className="leading-tight">
                  <span className="text-[9px] text-[#78634B] block font-heading font-bold uppercase">
                    Populasi
                  </span>
                  <span className="font-heading font-extrabold text-[#343B35] text-xs">
                    {formatNumber(cityStats.officialPopulation)}
                  </span>
                </div>
              </Link>

              <div className="w-px h-5 bg-[#D8CEBE]" />

              {/* 2. Registered Citizens */}
              <div className="flex items-center space-x-1.5">
                <div className="w-6 h-6 rounded-md bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-[#78634B]">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="leading-tight">
                  <span className="text-[9px] text-[#78634B] block font-heading font-bold uppercase">
                    Warga
                  </span>
                  <span className="font-heading font-extrabold text-[#343B35] text-xs">
                    {formatNumber(cityStats.registeredCitizens)}
                  </span>
                </div>
              </div>

              <div className="w-px h-5 bg-[#D8CEBE]" />

              {/* 3. Online Citizens */}
              <div className="flex items-center space-x-1.5">
                <div className="w-6 h-6 rounded-md bg-[#E6F0E4] border border-[#C5D8C4] flex items-center justify-center text-[#4F6E4E]">
                  <span className="w-2 h-2 rounded-full bg-[#668B65] animate-pulse" />
                </div>
                <div className="leading-tight">
                  <span className="text-[9px] text-[#78634B] block font-heading font-bold uppercase">
                    Online
                  </span>
                  <span className="font-heading font-extrabold text-[#668B65] text-xs">
                    {formatNumber(cityStats.onlineNow)}
                  </span>
                </div>
              </div>
            </div>

            {/* Mobile View: Micro summary badge */}
            <div className="md:hidden flex items-center space-x-1.5 bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl px-2 py-1 shadow-xs text-[10px] font-heading font-bold pointer-events-auto">
              <span className="text-[#343B35]">{formatNumber(cityStats.officialPopulation)}</span>
              <span className="text-[#C6BBA8]">•</span>
              <span className="text-[#668B65] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#668B65]" />
                {cityStats.onlineNow}
              </span>
            </div>
          </>
        )}

        {/* C. Main Action Bar — Top Right */}
        <div className="flex items-center space-x-1 bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl p-1 shadow-[0_3px_10px_rgba(52,59,53,0.08)] pointer-events-auto shrink-0">
          {/* Coin Wallet */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 bg-[#EFE9D8] px-1.5 sm:px-2 py-1 rounded-lg border border-[#D8CEBE] text-xs shrink-0">
            <Coins className="w-3.5 h-3.5 text-[#E6C66F] shrink-0" />
            <span className="font-heading font-extrabold text-[11px] sm:text-xs text-[#343B35]">
              {formatCoins(currentCoins)}
            </span>
          </div>

          {/* Primary Quick Actions always visible */}
          <button
            type="button"
            onClick={() => openModal('photo_studio')}
            title="Mode Foto Bersama (POV & Polaroid)"
            className="p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-all active:translate-y-0.5 cursor-pointer shrink-0"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => openModal('inventory')}
            title="Tas Barang Warga (Inventori)"
            className="relative p-1.5 rounded-lg bg-[#EFE9D8] hover:bg-[#E2DAC7] text-[#343B35] border border-[#D8CEBE] transition-all active:translate-y-0.5 cursor-pointer shrink-0"
          >
            <Backpack className="w-3.5 h-3.5 text-[#668B65]" />
            {inventory.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] bg-[#668B65] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 shadow-xs">
                {inventory.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => openModal('mall')}
            title="Mall Busana"
            className="p-1.5 rounded-lg bg-[#EFE9D8] hover:bg-[#E2DAC7] text-[#343B35] border border-[#D8CEBE] transition-all active:translate-y-0.5 cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => openModal('cat_hunt')}
            title="Misi Cari Kucing Kota (5/5)"
            className="p-1.5 rounded-lg bg-[#EFE9D8] hover:bg-[#E2DAC7] text-[#343B35] border border-[#D8CEBE] transition-all active:translate-y-0.5 cursor-pointer shrink-0 text-xs flex items-center justify-center"
          >
            🐱
          </button>

          {/* Missions button: Available on sm+, in mobile menu on small screens */}
          <button
            type="button"
            onClick={() => openModal('missions')}
            title="Misi & Prestasi"
            className="hidden sm:flex p-1.5 rounded-lg bg-[#EFE9D8] hover:bg-[#E2DAC7] text-[#343B35] border border-[#D8CEBE] transition-all active:translate-y-0.5 cursor-pointer shrink-0"
          >
            <Award className="w-3.5 h-3.5" />
          </button>

          {/* Desktop-only secondary toolbar actions */}
          <div className="hidden lg:flex items-center space-x-1">
            <button
              type="button"
              onClick={() => openModal('garden')}
              title="Kebun Netizen (Shopee Tanam)"
              className="p-1.5 rounded-lg bg-[#EFE9D8] hover:bg-[#E2DAC7] text-[#343B35] border border-[#D8CEBE] transition-all active:translate-y-0.5 cursor-pointer"
            >
              <Sprout className="w-3.5 h-3.5 text-emerald-600" />
            </button>

            <button
              type="button"
              onClick={() => openModal('investor')}
              title="Menara Investor (103 Pendukung Kota & Trakteer)"
              className="p-1.5 rounded-lg bg-[#EFE9D8] hover:bg-[#E2DAC7] text-purple-700 border border-[#D8CEBE] transition-all active:translate-y-0.5 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleOpenCityHall}
              title="Balai Kota & Poling Kebijakan"
              className="p-1.5 rounded-lg bg-[#EFE9D8] hover:bg-[#E2DAC7] text-[#343B35] border border-[#D8CEBE] transition-all active:translate-y-0.5 cursor-pointer"
            >
              <Vote className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleStartCourier}
              title="Mulai Misi Kurir Paket"
              className="p-1.5 rounded-lg bg-[#EFE9D8] hover:bg-[#E2DAC7] text-[#343B35] border border-[#D8CEBE] transition-all active:translate-y-0.5 cursor-pointer"
            >
              <Package className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => openModal('daily_rewards')}
              title="Hadiah Login Harian"
              className="p-1.5 rounded-lg bg-[#EFE9D8] hover:bg-[#E2DAC7] text-[#343B35] border border-[#D8CEBE] transition-all active:translate-y-0.5 relative cursor-pointer"
            >
              <Gift className="w-3.5 h-3.5" />
              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-[#668B65]" />
            </button>

            <button
              type="button"
              onClick={() => openModal('ktn_card')}
              title="Buka Kartu Tanda Netizen"
              className="p-1.5 rounded-lg bg-[#EFE9D8] hover:bg-[#E2DAC7] text-[#343B35] border border-[#D8CEBE] transition-all active:translate-y-0.5 cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleToggleDayNight}
              title="Ubah Suasana Waktu Siang / Malam"
              className="p-1.5 rounded-lg bg-[#EFE9D8] hover:bg-[#E2DAC7] text-[#78634B] border border-[#D8CEBE] transition-all active:translate-y-0.5 cursor-pointer"
            >
              <Moon className="w-3.5 h-3.5" />
            </button>

            {/* BGM Player Component */}
            <BGMPlayer />

            {/* Logout / Home */}
            {profile ? (
              <button
                type="button"
                onClick={handleLogout}
                title="Keluar Akun Warga"
                className="p-1.5 rounded-lg bg-[#FBEBE8] hover:bg-[#F5D8D3] text-[#A23F32] border border-[#EAC2BA] transition-all active:translate-y-0.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            ) : (
              <Link
                href="/"
                title="Keluar ke Beranda"
                className="p-1.5 rounded-lg bg-[#EFE9D8] hover:bg-[#E2DAC7] text-[#78634B] border border-[#D8CEBE] transition-all active:translate-y-0.5"
              >
                <LogOut className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Mobile Action Menu Toggle (opens cohesive game sheet) */}
          <div className="lg:hidden relative">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              title="Menu Aksi Lainnya"
              className={`p-1.5 rounded-lg transition-all active:translate-y-0.5 cursor-pointer border ${
                mobileMenuOpen
                  ? 'bg-[#668B65] text-white border-[#547553]'
                  : 'bg-[#EFE9D8] hover:bg-[#E2DAC7] text-[#343B35] border-[#D8CEBE]'
              }`}
            >
              {mobileMenuOpen ? <X className="w-3.5 h-3.5" /> : <MoreHorizontal className="w-3.5 h-3.5" />}
            </button>

            {/* Dropdown sheet for mobile */}
            {mobileMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-52 bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl shadow-xl p-1.5 z-50 flex flex-col space-y-1 animate-in fade-in zoom-in-95 text-xs font-heading font-bold text-[#343B35]">
                <button
                  type="button"
                  onClick={() => {
                    openModal('photo_studio')
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-[#EFE9D8] transition-colors text-left cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-amber-600" />
                  <span>Foto Bersama Alun-Alun</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    openModal('inventory')
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-[#EFE9D8] transition-colors text-left cursor-pointer"
                >
                  <Backpack className="w-4 h-4 text-[#668B65]" />
                  <span>Tas Barang Warga ({inventory.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    openModal('cat_hunt')
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-[#EFE9D8] transition-colors text-left cursor-pointer"
                >
                  <span className="text-sm">🐱</span>
                  <span>Cari Kucing Kota</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    openModal('garden')
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-[#EFE9D8] transition-colors text-left cursor-pointer"
                >
                  <Sprout className="w-4 h-4 text-emerald-600" />
                  <span>Kebun Netizen (Tanam)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    openModal('investor')
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-[#EFE9D8] transition-colors text-left cursor-pointer"
                >
                  <Building2 className="w-4 h-4 text-purple-700" />
                  <span>Menara Investor Kota</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenCityHall}
                  className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-[#EFE9D8] transition-colors text-left cursor-pointer"
                >
                  <Vote className="w-4 h-4 text-[#78634B]" />
                  <span>Balai Kota & Poling</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    openModal('missions')
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-[#EFE9D8] transition-colors text-left cursor-pointer"
                >
                  <Award className="w-4 h-4 text-[#78634B]" />
                  <span>Misi & Prestasi</span>
                </button>

                <button
                  type="button"
                  onClick={handleStartCourier}
                  className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-[#EFE9D8] transition-colors text-left cursor-pointer"
                >
                  <Package className="w-4 h-4 text-[#78634B]" />
                  <span>Misi Kurir (+100)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    openModal('daily_rewards')
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-[#EFE9D8] transition-colors text-left cursor-pointer"
                >
                  <Gift className="w-4 h-4 text-[#78634B]" />
                  <span>Hadiah Harian</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    openModal('ktn_card')
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-[#EFE9D8] transition-colors text-left cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-[#78634B]" />
                  <span>Kartu Tanda Netizen</span>
                </button>

                <button
                  type="button"
                  onClick={handleToggleDayNight}
                  className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-[#EFE9D8] transition-colors text-left cursor-pointer"
                >
                  <Moon className="w-4 h-4 text-[#78634B]" />
                  <span>Ubah Siang / Malam</span>
                </button>

                <div className="w-full h-px bg-[#D8CEBE] my-1" />

                {profile ? (
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex items-center space-x-2 w-full p-2 rounded-lg text-[#A23F32] hover:bg-[#FBEBE8] transition-colors text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar Akun Warga</span>
                  </button>
                ) : (
                  <Link
                    href="/"
                    className="flex items-center space-x-2 w-full p-2 rounded-lg text-[#78634B] hover:bg-[#EFE9D8] transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Kembali ke Beranda</span>
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* NOTIFICATIONS CONTAINER                                      */}
      {/* ============================================================ */}
      <div className="pointer-events-auto fixed top-16 right-3 sm:right-5 z-40 max-w-xs space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => removeNotification(n.id)}
            className="p-3 rounded-xl bg-[#F7F4E9] border border-[#D8CEBE] shadow-[0_4px_16px_rgba(52,59,53,0.12)] cursor-pointer transition-all hover:scale-102 flex items-start space-x-2.5 text-xs font-sans"
          >
            <div className="w-6 h-6 rounded-md bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-[#78634B] shrink-0 mt-0.5">
              <Award className="w-3.5 h-3.5" />
            </div>
            <div>
              <h5 className="font-heading font-bold text-[#343B35] text-xs">{n.title}</h5>
              <p className="text-[#78634B] text-[11px] mt-0.5 leading-snug">
                {n.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* BOTTOM AREA: CHAT OVERLAY                                    */}
      {/* ============================================================ */}
      <div
        className={`fixed z-40 pointer-events-auto flex items-center justify-center ${
          isTuguMode
            ? 'bottom-5 right-3 sm:left-1/2 sm:right-auto sm:-translate-x-1/2'
            : 'bottom-5 sm:bottom-6 left-1/2 -translate-x-1/2'
        }`}
      >
        <ChatPanel />
      </div>

      {/* MODALS RENDERED VIA PORTAL TO DOCUMENT BODY */}
      <KTNCardModal />
      <MallModal />
      <DailyRewardModal />
      <BuildingModal />
      <MissionsModal />

      {/* NEW FEATURES MODALS */}
      <PhotoStudioModal
        isOpen={activeModal === 'photo_studio'}
        onClose={closeModal}
      />
      <CatHuntModal
        isOpen={activeModal === 'cat_hunt'}
        onClose={closeModal}
      />
      <FishingModal
        isOpen={activeModal === 'fishing'}
        onClose={closeModal}
      />
      <FreekickModal
        isOpen={activeModal === 'freekick'}
        onClose={closeModal}
      />
      <GardenModal
        isOpen={activeModal === 'garden'}
        onClose={closeModal}
      />
      <InvestorModal
        isOpen={activeModal === 'investor'}
        onClose={closeModal}
      />
      <InventoryModal
        isOpen={activeModal === 'inventory'}
        onClose={closeModal}
      />
    </div>
  )
}
