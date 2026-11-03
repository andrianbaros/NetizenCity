'use client'

import React from 'react'
import Link from 'next/link'
import {
  Coins,
  Users,
  ShieldCheck,
  ShoppingBag,
  Gift,
  Building2,
  Sparkles,
  LogOut,
  MapPin,
  HelpCircle,
  Moon,
  Package,
} from 'lucide-react'
import { InstagramIcon } from '@/components/ui/InstagramIcon'
import { useGameStore } from '@/lib/stores/useGameStore'
import { useUIStore } from '@/lib/stores/useUIStore'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'
import { formatCoins, formatNumber } from '@/lib/utils/formatting'
import MiniMap from './MiniMap'
import ChatPanel from './ChatPanel'
import KTNCardModal from './KTNCardModal'
import MallModal from './MallModal'
import DailyRewardModal from './DailyRewardModal'
import BuildingModal from './BuildingModal'

export default function GameHUD() {
  const cityStats = useGameStore((s) => s.cityStats)
  const currentDistrict = useGameStore((s) => s.currentDistrict)
  const selectedBuilding = useGameStore((s) => s.selectedBuilding)

  const wallet = useCitizenStore((s) => s.wallet)
  const profile = useCitizenStore((s) => s.profile)

  const openModal = useUIStore((s) => s.openModal)
  const notifications = useUIStore((s) => s.notifications)
  const removeNotification = useUIStore((s) => s.removeNotification)

  const districtNames: Record<string, string> = {
    town_square: 'Downtown (Alun-Alun Pusat)',
    residential: 'Distrik Perumahan Utara',
    commercial: 'Distrik Komersial & Mall',
    industrial: 'Kawasan Industri Selatan',
    airport: 'Bandara Internasional Netizen',
    entertainment: 'Taman Kota & Hiburan Barat',
  }

  const currentCoins = wallet?.balance ?? 500

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-3 sm:p-5 select-none">
      {/* ============================================================ */}
      {/* TOP BAR / NAVIGATION                                         */}
      {/* ============================================================ */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 pointer-events-auto">
        {/* Left: Citizen Profile Badge & District */}
        <div className="flex items-center space-x-2.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-1.5 pr-4 shadow-2xl backdrop-blur-md">
          <button
            onClick={() => openModal('ktn_card')}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 p-0.5 flex items-center justify-center text-white font-bold text-xs shadow-md hover:scale-105 transition-transform"
          >
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center text-blue-400">
              NC
            </div>
          </button>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-bold text-white">
                {profile?.displayName || 'Warga Netizen'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/30">
                Lvl 1
              </span>
            </div>
            <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-medium">
              <MapPin className="w-3 h-3 text-emerald-400" />
              <span>{districtNames[currentDistrict] || 'Netizen City'}</span>
            </div>
          </div>
        </div>

        {/* Center: 3 Separate Population Counters */}
        <div className="hidden lg:flex items-center space-x-4 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-4 py-2 shadow-2xl backdrop-blur-md text-xs">
          {/* 1. Official Instagram Population */}
          <Link
            href="/admin/instagram"
            title="Kelola Integrasi Instagram @netizencity.id"
            className="flex items-center space-x-2 group hover:opacity-80 transition-opacity"
          >
            <InstagramIcon className="w-4 h-4 text-pink-400 flex-shrink-0 group-hover:scale-110 transition-transform" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold leading-none group-hover:text-pink-300">
                Populasi Resmi
              </span>
              <span className="font-extrabold text-white text-xs font-mono">
                {formatNumber(cityStats.officialPopulation)}
              </span>
            </div>
          </Link>

          <div className="w-px h-6 bg-slate-800" />

          {/* 2. Registered Citizens */}
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold leading-none">
                Warga Terdaftar
              </span>
              <span className="font-extrabold text-white text-xs font-mono">
                {formatNumber(cityStats.registeredCitizens)}
              </span>
            </div>
          </div>

          <div className="w-px h-6 bg-slate-800" />

          {/* 3. Online Citizens */}
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-semibold leading-none">
                Online Sekarang
              </span>
              <span className="font-extrabold text-emerald-400 text-xs font-mono">
                {formatNumber(cityStats.onlineNow)}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Netizen Coins & Quick Action Icons */}
        <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl p-1.5 px-3 shadow-2xl backdrop-blur-md">
          {/* Coin Wallet */}
          <div className="flex items-center space-x-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
            <Coins className="w-4 h-4 text-amber-400" />
            <span className="font-extrabold text-xs text-amber-300 font-mono">
              {formatCoins(currentCoins)}
            </span>
          </div>

          {/* KTN Card shortcut */}
          <button
            onClick={() => openModal('ktn_card')}
            title="Buka Kartu Tanda Netizen"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-amber-400 hover:text-amber-300 transition-colors"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>

          {/* Job Mission Courier shortcut */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('start-courier-job'))
              }
            }}
            title="Mulai Misi Kurir Pengantar Paket (+100 Koin)"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <Package className="w-4 h-4" />
          </button>

          {/* Mall Shop shortcut */}
          <button
            onClick={() => openModal('mall')}
            title="Buka Mall Busana"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-blue-400 hover:text-blue-300 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>

          {/* Day / Night Atmospheric Mode */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('toggle-day-night'))
              }
            }}
            title="Ubah Suasana Siang / Malam"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-sky-300 hover:text-sky-200 transition-colors"
          >
            <Moon className="w-4 h-4" />
          </button>

          {/* Daily Reward shortcut */}
          <button
            onClick={() => openModal('daily_rewards')}
            title="Hadiah Harian"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-purple-400 hover:text-purple-300 transition-colors relative"
          >
            <Gift className="w-4 h-4" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500" />
          </button>

          {/* Exit / Home */}
          <Link
            href="/"
            title="Keluar ke Beranda"
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </Link>
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
            className="p-3.5 rounded-2xl bg-slate-900/95 border border-slate-700 shadow-2xl backdrop-blur-md cursor-pointer transition-all hover:opacity-80 flex items-start space-x-3 text-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <h5 className="font-bold text-white">{n.title}</h5>
              <p className="text-slate-300 text-[11px] mt-0.5 leading-tight">
                {n.message}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================ */}
      {/* CONTEXTUAL BUILDING PROXIMITY BANNER                         */}
      {/* ============================================================ */}
      {selectedBuilding && (
        <div className="self-center pointer-events-auto mb-2 animate-bounce">
          <button
            onClick={() => openModal('building_details')}
            className="px-4 py-2 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-xl shadow-blue-900/50 border border-blue-400/40 flex items-center space-x-2 transition-transform active:scale-95"
          >
            <Building2 className="w-4 h-4" />
            <span>Klik Untuk Berinteraksi dengan Gedung</span>
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* BOTTOM AREA: CHAT & MINIMAP                                  */}
      {/* ============================================================ */}
      <footer className="flex items-end justify-between pointer-events-auto w-full">
        {/* Left: Chat Overlay */}
        <div>
          <ChatPanel />
        </div>

        {/* Right: Controls Guide & MiniMap */}
        <div className="flex flex-col items-end space-y-2">
          {/* Controls helper tooltip */}
          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 bg-slate-900/80 border border-slate-800 rounded-lg text-[10px] text-slate-400">
            <span className="font-mono bg-slate-800 px-1 py-0.5 rounded text-white font-bold">
              WASD / Klik Tanah
            </span>
            <span>Jalan &bull; Tabrak Sampah (+15 Koin) &bull; Klik NPC untuk Ngobrol</span>
          </div>

          <MiniMap />
        </div>
      </footer>

      {/* MODALS */}
      <KTNCardModal />
      <MallModal />
      <DailyRewardModal />
      <BuildingModal />
    </div>
  )
}
