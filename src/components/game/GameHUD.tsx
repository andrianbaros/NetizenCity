// ============================================================
// NETIZENCITY - Primary Game Heads-Up Display (GameHUD)
// Cozy Pastel Diorama Aesthetic Aligned with 3D Art Style
// ============================================================

'use client'

import React, { useEffect, useCallback } from 'react'
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

export default function GameHUD() {
  const cityStats = useGameStore((s) => s.cityStats)
  const setCityStats = useGameStore((s) => s.setCityStats)
  const currentDistrict = useGameStore((s) => s.currentDistrict)
  const selectedBuilding = useGameStore((s) => s.selectedBuilding)
  const setSelectedBuilding = useGameStore((s) => s.setSelectedBuilding)

  const wallet = useCitizenStore((s) => s.wallet)
  const profile = useCitizenStore((s) => s.profile)
  const setProfile = useCitizenStore((s) => s.setProfile)
  const setWallet = useCitizenStore((s) => s.setWallet)
  const setInventory = useCitizenStore((s) => s.setInventory)

  const openModal = useUIStore((s) => s.openModal)
  const notifications = useUIStore((s) => s.notifications)
  const removeNotification = useUIStore((s) => s.removeNotification)

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

  const currentCoins = wallet?.balance ?? 500

  const handleOpenCityHall = () => {
    setSelectedBuilding('city_hall')
    openModal('building_details')
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 sm:p-5 select-none font-sans">
      {/* ============================================================ */}
      {/* TOP BAR / NAVIGATION                                         */}
      {/* ============================================================ */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pointer-events-none">
        {/* Left: Citizen Profile Badge or Guest Welcome */}
        {profile ? (
          <div className="flex items-center space-x-3 bg-[#FFFDF9]/95 border-2 border-[#EADBCC] rounded-2xl p-1.5 pr-4 shadow-[0_8px_24px_rgba(70,50,60,0.1)] backdrop-blur-md pointer-events-auto">
            <button
              type="button"
              onClick={() => openModal('ktn_card')}
              title="Klik untuk melihat Kartu Tanda Netizen"
              className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F4A98C] via-[#F2C1D6] to-[#C9B8E8] p-0.5 flex items-center justify-center text-white font-heading font-black text-xs shadow-xs hover:scale-105 active:scale-95 transition-transform cursor-pointer"
            >
              <div className="w-full h-full bg-[#FFFDF9] rounded-[10px] flex items-center justify-center text-[#F4A98C] font-extrabold text-xs">
                NC
              </div>
            </button>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-heading font-bold text-[#3B3340]">
                  {profile.displayName}
                </span>
                <span className="text-[10px] text-[#2F9474] font-heading font-bold bg-[#E8F8F2] px-1.5 py-0.2 rounded-full border border-[#BDE8D8]">
                  @{profile.username}
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-gradient-to-r from-[#FFF5D0] to-[#FFE896] text-[#6A4D07] font-heading font-bold border border-[#ECC956]">
                  Lvl {profile.level || 1}
                </span>
              </div>
              <div className="flex items-center space-x-1 text-[11px] text-[#7A6E7E] font-medium mt-0.5">
                <MapPin className="w-3 h-3 text-[#F4A98C]" />
                <span>{districtNames[currentDistrict] || 'Netizen City'}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2.5 bg-[#FFFDF9]/95 border-2 border-[#EADBCC] rounded-2xl p-2 pr-3.5 shadow-[0_8px_24px_rgba(70,50,60,0.1)] backdrop-blur-md pointer-events-auto">
            <div className="w-9 h-9 rounded-xl bg-[#F0EBE3] border border-[#DDD3C7] flex items-center justify-center text-[#8C7E70] font-heading font-extrabold text-xs">
              <Users className="w-4 h-4 text-[#8C7E70]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-heading font-bold text-[#3B3340]">
                  Tamu Netizen
                </span>
                <span className="text-[10px] text-[#8C7E70] font-heading font-bold bg-[#EFE9E0] px-1.5 py-0.2 rounded-full border border-[#DDD3C7]">
                  Belum Masuk
                </span>
              </div>
              <div className="flex items-center space-x-2 mt-0.5 text-[11px] font-heading font-bold">
                <Link
                  href="/login"
                  className="text-[#D97858] hover:text-[#B85737] hover:underline"
                >
                  Masuk
                </Link>
                <span className="text-[#C5B8A8] text-[10px]">•</span>
                <Link
                  href="/welcome"
                  className="text-[#2F9474] hover:text-[#1E6850] hover:underline"
                >
                  Daftar Warga
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Center: 3 Separate Population Counters */}
        <div className="hidden lg:flex items-center space-x-4 bg-[#FFFDF9]/95 border-2 border-[#EADBCC] rounded-2xl px-4 py-2 shadow-[0_8px_24px_rgba(70,50,60,0.1)] backdrop-blur-md text-xs pointer-events-auto">
          {/* 1. Official Instagram Population */}
          <Link
            href="/admin/instagram"
            title="Kelola Integrasi Instagram @netizencity.id"
            className="flex items-center space-x-2 group hover:opacity-80 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-[#F58529] via-[#DD2A7B] to-[#8134AF] p-0.5 flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform">
              <InstagramIcon className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-[10px] text-[#8C7D91] block uppercase font-heading font-bold leading-none group-hover:text-[#DD2A7B]">
                Populasi Resmi
              </span>
              <span className="font-heading font-extrabold text-[#3B3340] text-sm">
                {formatNumber(cityStats.officialPopulation)}
              </span>
            </div>
          </Link>

          <div className="w-0.5 h-6 bg-[#EADBCC]" />

          {/* 2. Registered Citizens */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#EAF3FD] border border-[#BFD8F6] flex items-center justify-center text-[#245282] shadow-xs">
              <Users className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] text-[#8C7D91] block uppercase font-heading font-bold leading-none">
                Warga Terdaftar
              </span>
              <span className="font-heading font-extrabold text-[#3B3340] text-sm">
                {formatNumber(cityStats.registeredCitizens)}
              </span>
            </div>
          </div>

          <div className="w-0.5 h-6 bg-[#EADBCC]" />

          {/* 3. Online Citizens */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-[#EBF8F3] border border-[#B7E7D5] flex items-center justify-center text-[#1E5D46] shadow-xs relative">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2F9474] animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] text-[#8C7D91] block uppercase font-heading font-bold leading-none">
                Online Sekarang
              </span>
              <span className="font-heading font-extrabold text-[#2F9474] text-sm">
                {formatNumber(cityStats.onlineNow)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Netizen Coins & Quick Action Icons */}
        <div className="flex items-center space-x-1.5 bg-[#FFFDF9]/95 border-2 border-[#EADBCC] rounded-2xl p-1.5 px-3 shadow-[0_8px_24px_rgba(70,50,60,0.1)] backdrop-blur-md pointer-events-auto">
          {/* Coin Wallet */}
          <div className="flex items-center space-x-1.5 bg-gradient-to-r from-[#FFF5D0] to-[#FFE896] px-3 py-1.5 rounded-xl border border-[#ECC956] shadow-xs">
            <Coins className="w-4 h-4 text-[#8A6814]" />
            <span className="font-heading font-extrabold text-xs text-[#523F0C]">
              {formatCoins(currentCoins)}
            </span>
          </div>

          {/* KTN Card shortcut */}
          <button
            type="button"
            onClick={() => openModal('ktn_card')}
            title="Buka Kartu Tanda Netizen (KTN)"
            className="p-2 rounded-xl bg-[#FFF2EB] hover:bg-[#FFE5D6] text-[#D97858] border border-[#F4C8B4] border-b-2 border-b-[#E2A68C] transition-all active:translate-y-0.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Balai Kota & Poling Kebijakan Shortcut */}
          <button
            type="button"
            onClick={handleOpenCityHall}
            title="Balai Kota & Poling Kebijakan (+25 Koin)"
            className="p-2 rounded-xl bg-[#EAF3FD] hover:bg-[#D9EBFD] text-[#245282] border border-[#BED8F6] border-b-2 border-b-[#9EC4EE] transition-all active:translate-y-0.5 cursor-pointer"
          >
            <Vote className="w-4 h-4" />
          </button>

          {/* Missions / Quests shortcut */}
          <button
            type="button"
            onClick={() => openModal('missions')}
            title="Misi & Prestasi Warga (+Koin & XP)"
            className="p-2 rounded-xl bg-[#EBF8F3] hover:bg-[#D9F3E8] text-[#1E5D46] border border-[#B7E7D5] border-b-2 border-b-[#98D6BE] transition-all active:translate-y-0.5 cursor-pointer"
          >
            <Award className="w-4 h-4" />
          </button>

          {/* Job Mission Courier shortcut */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('start-courier-job'))
              }
            }}
            title="Mulai Misi Kurir Pengantar Paket (+100 Koin)"
            className="p-2 rounded-xl bg-[#FFF9E6] hover:bg-[#FFF2CC] text-[#7A5E0E] border border-[#FCE69C] border-b-2 border-b-[#E5C972] transition-all active:translate-y-0.5 cursor-pointer"
          >
            <Package className="w-4 h-4" />
          </button>

          {/* Mall Shop shortcut */}
          <button
            type="button"
            onClick={() => openModal('mall')}
            title="Buka Mall Busana"
            className="p-2 rounded-xl bg-[#FDEEF1] hover:bg-[#FCDCE2] text-[#A62F47] border border-[#F9CAD3] border-b-2 border-b-[#EAA8B6] transition-all active:translate-y-0.5 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>

          {/* Day / Night Atmospheric Mode */}
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('toggle-day-night'))
              }
            }}
            title="Ubah Suasana Siang / Malam"
            className="p-2 rounded-xl bg-[#F5F0FD] hover:bg-[#EBDEFC] text-[#55387E] border border-[#DACBF6] border-b-2 border-b-[#BFAAE8] transition-all active:translate-y-0.5 cursor-pointer"
          >
            <Moon className="w-4 h-4" />
          </button>

          {/* Daily Reward shortcut */}
          <button
            type="button"
            onClick={() => openModal('daily_rewards')}
            title="Hadiah Login Harian"
            className="p-2 rounded-xl bg-[#FFF0F4] hover:bg-[#FEE0E9] text-[#C03958] border border-[#F9C3D2] border-b-2 border-b-[#E59EB1] transition-all active:translate-y-0.5 relative cursor-pointer"
          >
            <Gift className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#F4A98C] animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#F4A98C] border-2 border-white" />
          </button>

          {/* Exit / Logout */}
          {profile ? (
            <button
              type="button"
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' })
                setProfile(null)
                setWallet(null)
                setInventory([])
                window.location.reload()
              }}
              title="Keluar Akun Warga (Logout)"
              className="p-2 rounded-xl bg-[#FFF0F0] hover:bg-[#FFE0E0] text-[#C53030] hover:text-[#9B2424] border border-[#FFC4C4] border-b-2 border-b-[#FFA4A4] transition-all active:translate-y-0.5 cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href="/"
              title="Keluar ke Beranda"
              className="p-2 rounded-xl bg-[#F5EDE1] hover:bg-[#EDE1D1] text-[#786A7C] hover:text-[#9A2D45] border border-[#E3D4C2] border-b-2 border-b-[#CEBDBA] transition-all active:translate-y-0.5"
            >
              <LogOut className="w-4 h-4" />
            </Link>
          )}
        </div>
      </header>

      {/* ============================================================ */}
      {/* NOTIFICATIONS CONTAINER                                      */}
      {/* ============================================================ */}
      <div className="pointer-events-auto fixed top-20 right-5 z-40 max-w-sm space-y-2">
        {notifications.map((n) => (
          <div
            key={n.id}
            onClick={() => removeNotification(n.id)}
            className="p-3.5 rounded-2xl bg-[#FFFDF9]/95 border-2 border-[#EADBCC] shadow-[0_12px_32px_rgba(70,50,60,0.15)] backdrop-blur-md cursor-pointer transition-all hover:scale-102 flex items-start space-x-3 text-xs"
          >
            <div className="w-7 h-7 rounded-xl bg-[#FFF4DC] border border-[#F7DA8A] flex items-center justify-center text-[#B38318] flex-shrink-0 mt-0.5">
              <Award className="w-4 h-4" />
            </div>
            <div>
              <h5 className="font-heading font-bold text-[#3B3340] text-sm">{n.title}</h5>
              <p className="text-[#6D5F72] text-xs mt-0.5 leading-snug">
                {n.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* BOTTOM AREA: CHAT OVERLAY (Elevated & Centered)              */}
      {/* ============================================================ */}
      <footer className="flex items-center justify-center pointer-events-auto w-full pb-3 sm:pb-5">
        <ChatPanel />
      </footer>

      {/* MODALS RENDERED VIA PORTAL TO DOCUMENT BODY */}
      <KTNCardModal />
      <MallModal />
      <DailyRewardModal />
      <BuildingModal />
      <MissionsModal />
    </div>
  )
}
