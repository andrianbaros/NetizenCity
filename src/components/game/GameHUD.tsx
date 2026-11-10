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
  Menu,
  ChevronDown,
  Check,
  X,
  User,
  Camera,
  Fish,
  Sprout,
  Trophy,
  Backpack,
  CheckCircle2,
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
import RodShopModal from './RodShopModal'
import FreekickModal from './FreekickModal'
import GardenModal from './GardenModal'
import InvestorModal from './InvestorModal'
import InventoryModal from './InventoryModal'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import BGMPlayer from './BGMPlayer'

export default function GameHUD() {
  const viewMode = useGameStore((s) => s.viewMode)
  const cityStats = useGameStore((s) => s.cityStats)
  const setCityStats = useGameStore((s) => s.setCityStats)
  const currentDistrict = useGameStore((s) => s.currentDistrict)
  const selectedBuilding = useGameStore((s) => s.selectedBuilding)
  const setSelectedBuilding = useGameStore((s) => s.setSelectedBuilding)

  const wallet = useCitizenStore((s) => s.wallet)
  const profile = useCitizenStore((s) => s.profile)
  const rawInventory = useCitizenStore((s) => s.inventory)
  const inventory = Array.isArray(rawInventory) ? rawInventory : []
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
  const [showHudRoomSwitcher, setShowHudRoomSwitcher] = useState(false)
  const [showHudRoster, setShowHudRoster] = useState(false)

  const currentRoomId = useGameStore((s) => s.currentRoomId)
  const setCurrentRoomId = useGameStore((s) => s.setCurrentRoomId)
  const roomUserCount = useGameStore((s) => s.roomUserCount)
  const allRooms = useGameStore((s) => s.allRooms)
  const roomPlayers = useGameStore((s) => s.roomPlayers)

  useEffect(() => {
    const onMode = (e: any) => {
      setIsTuguMode(e.detail?.mode === 'tugu')
    }
    const onOpenRodShop = () => {
      openModal('rod_shop')
    }
    window.addEventListener('tugu-mode-changed', onMode)
    window.addEventListener('open-rod-shop', onOpenRodShop)
    return () => {
      window.removeEventListener('tugu-mode-changed', onMode)
      window.removeEventListener('open-rod-shop', onOpenRodShop)
    }
  }, [openModal])

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
        if (citData.wallet && citData.citizen) {
          let currentStoreProfile = useCitizenStore.getState().profile
          let currentLocalWallet = useCitizenStore.getState().wallet

          // If store is still hydrating on reload, read directly from localStorage
          if (!currentLocalWallet && typeof window !== 'undefined') {
            try {
              const raw = localStorage.getItem('netizen_citizen_storage_v1')
              if (raw) {
                const parsed = JSON.parse(raw)
                if (parsed?.state?.wallet) {
                  currentLocalWallet = parsed.state.wallet
                }
                if (parsed?.state?.profile) {
                  currentStoreProfile = parsed.state.profile
                }
              }
            } catch {
              // ignore
            }
          }

          const isSameCitizen =
            (currentStoreProfile?.id === citData.citizen.id || !currentStoreProfile) &&
            currentLocalWallet?.citizenId === citData.citizen.id
          const serverBalance =
            typeof citData.wallet.balance === 'number' ? citData.wallet.balance : 0

          if (!isSameCitizen || !currentLocalWallet) {
            // Fresh login or switched citizen: strictly adopt official server wallet
            setWallet({
              id: citData.wallet.id || 'w-' + citData.citizen.id,
              citizenId: citData.citizen.id,
              balance: serverBalance,
              totalEarned: citData.wallet.total_earned ?? serverBalance,
              totalSpent: citData.wallet.total_spent ?? 0,
              updatedAt: citData.wallet.updated_at || new Date().toISOString(),
            })
          } else {
            // Same authenticated citizen: check timestamps between client and server
            const localBal = currentLocalWallet?.balance ?? serverBalance
            const localEarned = currentLocalWallet?.totalEarned ?? 0
            const localSpent = currentLocalWallet?.totalSpent ?? 0
            const serverEarned = citData.wallet.total_earned ?? 0
            const serverSpent = citData.wallet.total_spent ?? 0
            const serverTime = new Date(citData.wallet.updated_at || 0).getTime()
            const localTime = new Date(currentLocalWallet?.updatedAt || 0).getTime()

            // If local activity has a newer or equal timestamp than server's container DB,
            // or if server balance reverted to stale 500 while local has verified activity:
            if ((localTime >= serverTime && localBal !== serverBalance) || (serverBalance === 500 && localBal !== 500 && localSpent > 0)) {
              // Self-heal serverless container DB with client's confirmed wallet
              fetch('/api/economy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  action: 'reconcile',
                  amount: localBal,
                  totalEarned: Math.max(localEarned, serverEarned),
                  totalSpent: Math.max(localSpent, serverSpent),
                  updatedAt: currentLocalWallet?.updatedAt || new Date().toISOString(),
                  description: 'Sinkronisasi rekonsiliasi saldo warga',
                }),
              }).catch(() => {})

              setWallet({
                id: citData.wallet.id || currentLocalWallet?.id || 'w-' + citData.citizen.id,
                citizenId: citData.citizen.id,
                balance: localBal,
                totalEarned: Math.max(localEarned, serverEarned, localBal),
                totalSpent: Math.max(localSpent, serverSpent),
                updatedAt: currentLocalWallet?.updatedAt || new Date().toISOString(),
              })
            } else {
              // Server wallet is newer or in sync
              setWallet({
                id: citData.wallet.id || 'w-' + citData.citizen.id,
                citizenId: citData.citizen.id,
                balance: serverBalance,
                totalEarned: citData.wallet.total_earned ?? serverBalance,
                totalSpent: citData.wallet.total_spent ?? 0,
                updatedAt: citData.wallet.updated_at || new Date().toISOString(),
              })
            }
          }
        }
        if (Array.isArray(citData.inventory)) {
          const now = Date.now()
          const localInv = useCitizenStore.getState().inventory || []
          const serverIds = new Set(citData.inventory.map((i: any) => i.id))
          // Only retain temporary optimistic catches (< 5s ago) that haven't landed on server yet
          const inFlightPendingCatches = localInv.filter((i: any) => {
            if (!i || !i.id || serverIds.has(i.id)) return false
            const acquiredTime = new Date(i.acquiredAt || 0).getTime()
            return now - acquiredTime < 5000 && String(i.id).startsWith('fish-')
          })
          setInventory([...citData.inventory, ...inFlightPendingCatches])
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
    'Distrik Investor': 'Monumen Investor Kota',
    'Monumen Investor Kota': 'Monumen Investor Kota',
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

  const currentCoins = wallet?.balance ?? 0

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
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col p-2 sm:p-4 select-none font-sans">
      {/* ============================================================ */}
      {/* TOP HUD CONTAINER: Pinned to Top (Header + Sub-Bar)          */}
      {/* ============================================================ */}
      <div className="flex flex-col gap-1 sm:gap-1.5 w-full pointer-events-none">
        {/* TOP HUD BAR: Player Identity, City Stats & Action Toolbar   */}
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

        {/* B. Center Pill: City Statistics in City mode, OR Multiplayer Room Pill in Tugu & River mode */}
        {viewMode === 'city' ? (
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
            <div className="md:hidden flex items-center space-x-1.5 bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl px-2 py-1 shadow-xs text-[10px] font-heading font-bold pointer-events-auto shrink-0">
              <span className="text-[#343B35]">{formatNumber(cityStats.officialPopulation)}</span>
              <span className="text-[#C6BBA8]">•</span>
              <span className="text-[#668B65] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#668B65]" />
                {cityStats.onlineNow}
              </span>
            </div>
          </>
        ) : (viewMode === 'tugu' || viewMode === 'river' || viewMode === 'beach') ? (
          /* MULTIPLAYER ROOM PILL IN TUGU, RIVER & BEACH INSTANCES (Desktop md+) */
          <div className="hidden md:flex items-center space-x-1 sm:space-x-1.5 bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl p-0.5 sm:p-1 shadow-[0_3px_10px_rgba(52,59,53,0.08)] text-xs pointer-events-auto relative shrink-0">
            {/* Room Switcher Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setShowHudRoomSwitcher(!showHudRoomSwitcher)
                setShowHudRoster(false)
              }}
              className="flex items-center space-x-1 px-1.5 sm:px-2 py-1 rounded-lg bg-[#EFE9D8] hover:bg-[#E2DAC7] text-[#343B35] font-heading font-bold text-[10px] sm:text-xs transition-colors cursor-pointer shrink-0"
              title="Pilih Server Ruangan (Maks 10 Warga)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#668B65] animate-pulse" />
              <span className="sm:hidden">{viewMode === 'beach' ? 'P#' : viewMode === 'river' ? 'D#' : 'R#'}{currentRoomId}</span>
              <span className="hidden sm:inline">{viewMode === 'beach' ? 'Pantai' : viewMode === 'river' ? 'Dermaga' : 'Ruang'} #{currentRoomId}</span>
              <span className="text-[9px] sm:text-[10px] px-1 py-0.2 rounded bg-[#668B65]/15 text-[#668B65] font-extrabold">
                {roomUserCount}/10
              </span>
              <ChevronDown className="w-3 h-3 text-[#78634B]" />
            </button>

            {/* Room Citizen Roster Toggle Button */}
            <button
              type="button"
              onClick={() => {
                setShowHudRoster(!showHudRoster)
                setShowHudRoomSwitcher(false)
              }}
              className="flex items-center space-x-1 px-1.5 sm:px-2 py-1 rounded-lg hover:bg-[#EFE9D8] text-[#343B35] font-heading font-bold text-[10px] sm:text-xs transition-colors cursor-pointer shrink-0"
              title="Lihat Warga yang Online di Ruangan Ini"
            >
              <Users className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#668B65]" />
              <span className="hidden sm:inline text-[11px] text-[#78634B]">Warga:</span>
              <span className="text-[10px] sm:text-xs font-extrabold text-[#343B35]">
                {roomPlayers.length || roomUserCount}
              </span>
            </button>

            {/* Dropdown: Room Server Switcher */}
            {showHudRoomSwitcher && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowHudRoomSwitcher(false)} />
                <div className="absolute top-full mt-1.5 left-1/2 -translate-x-1/2 w-56 sm:w-64 bg-[#F7F4E9] border-2 border-[#D8CEBE] rounded-2xl p-2 shadow-2xl z-50 text-xs font-sans">
                  <div className="font-heading font-black text-[10px] text-[#78634B] px-2 py-1 uppercase tracking-wide border-b border-[#D8CEBE] mb-1 flex items-center justify-between">
                    <span>Pilih Server {viewMode === 'beach' ? 'Pantai' : viewMode === 'river' ? 'Dermaga' : 'Ruangan'} (Maks 10)</span>
                    <button type="button" onClick={() => setShowHudRoomSwitcher(false)} className="text-[#78634B] hover:text-[#343B35] p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {allRooms.map((r) => {
                      const isCurrent = r.roomId === currentRoomId
                      return (
                        <button
                          key={r.roomId}
                          type="button"
                          disabled={r.isFull && !isCurrent}
                          onClick={() => {
                            setCurrentRoomId(r.roomId)
                            setShowHudRoomSwitcher(false)
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                            isCurrent
                              ? 'bg-[#668B65] text-white font-bold'
                              : r.isFull
                              ? 'bg-[#EFE9D8]/50 text-[#78634B]/50 cursor-not-allowed'
                              : 'hover:bg-[#EFE9D8] text-[#343B35]'
                          }`}
                        >
                          <span className="flex items-center gap-1.5 font-heading text-xs">
                            {isCurrent && <Check className="w-3 h-3 text-white" />}
                            <span>{viewMode === 'beach' ? `Pantai #${r.roomId}` : viewMode === 'river' ? `Dermaga #${r.roomId}` : r.name}</span>
                          </span>
                          <span className={`text-[10px] font-semibold ${isCurrent ? 'text-white' : 'text-[#78634B]'}`}>
                            {r.isFull ? 'Penuh (10/10)' : `${r.userCount}/10 Warga`}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </>
            )}

            {/* Dropdown: Citizen Roster */}
            {showHudRoster && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowHudRoster(false)} />
                <div className="absolute top-full mt-1.5 right-0 sm:left-1/2 sm:-translate-x-1/2 w-60 sm:w-64 bg-[#F7F4E9] border-2 border-[#D8CEBE] rounded-2xl p-2.5 shadow-2xl z-50 text-xs font-sans">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#D8CEBE]">
                    <span className="font-heading font-black text-[10px] text-[#78634B] uppercase tracking-wide flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#668B65]" />
                      <span>Warga di {viewMode === 'beach' ? 'Pantai' : viewMode === 'river' ? 'Dermaga' : 'Ruang'} #{currentRoomId}</span>
                    </span>
                    <button type="button" onClick={() => setShowHudRoster(false)} className="text-[#78634B] hover:text-[#343B35] p-0.5 rounded cursor-pointer">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {roomPlayers.length === 0 ? (
                      <div className="text-[11px] text-[#78634B] py-2 text-center">Menghubungkan warga...</div>
                    ) : (
                      roomPlayers.map((p) => {
                        return (
                          <div
                            key={p.id}
                            className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#EFE9D8]/60 text-[#343B35]"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0" />
                              <span className="truncate font-heading font-bold text-xs">{p.name}</span>
                            </div>
                            <span className="text-[9px] text-[#668B65] font-bold px-1.5 py-0.2 rounded bg-[#668B65]/15 shrink-0">
                              🟢 Online
                            </span>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : null}

        {/* C. Main Action Bar — Top Right */}
        <div className="flex items-center space-x-1 bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl p-1 shadow-[0_3px_10px_rgba(52,59,53,0.08)] pointer-events-auto shrink-0">
          {/* Coin Wallet */}
          <div className="flex items-center space-x-1 sm:space-x-1.5 bg-[#EFE9D8] px-1.5 sm:px-2 py-1 rounded-lg border border-[#D8CEBE] text-xs shrink-0">
            <Coins className="w-3.5 h-3.5 text-[#E6C66F] shrink-0" />
            <span className="font-heading font-extrabold text-[11px] sm:text-xs text-[#343B35]">
              {formatCoins(currentCoins)}
            </span>
          </div>

          {/* Primary Quick Actions */}
          {/* On phones (< sm), Camera, Mall, Cat Hunt, Missions are hidden on the top bar and accessible via the Mobile Action Menu */}
          <button
            type="button"
            onClick={() => openModal('photo_studio')}
            title="Mode Foto Bersama (POV & Polaroid)"
            className="hidden sm:flex p-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 transition-all active:translate-y-0.5 cursor-pointer shrink-0"
          >
            <Camera className="w-3.5 h-3.5" />
          </button>

          {/* Tas Warga (Backpack) is ALWAYS visible on both mobile and desktop! */}
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
            className="hidden sm:flex p-1.5 rounded-lg bg-[#EFE9D8] hover:bg-[#E2DAC7] text-[#343B35] border border-[#D8CEBE] transition-all active:translate-y-0.5 cursor-pointer shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => openModal('cat_hunt')}
            title="Misi Cari Kucing Kota (5/5)"
            className="hidden sm:flex p-1.5 rounded-lg bg-[#EFE9D8] hover:bg-[#E2DAC7] text-[#343B35] border border-[#D8CEBE] transition-all active:translate-y-0.5 cursor-pointer shrink-0 text-xs items-center justify-center"
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
              title="Kebun Netizen 3D (Tanam & Panen Koin)"
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

          {/* Mobile Action Menu Toggle Button (lg:hidden) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            title="Menu Aksi Netizen City"
            className={`lg:hidden flex items-center space-x-1 px-2 py-1 rounded-lg transition-all active:translate-y-0.5 cursor-pointer border text-xs font-heading font-bold shrink-0 ${
              mobileMenuOpen
                ? 'bg-[#668B65] text-white border-[#547553] shadow-inner'
                : 'bg-[#EFE9D8] hover:bg-[#E2DAC7] text-[#343B35] border-[#D8CEBE]'
            }`}
          >
            {mobileMenuOpen ? (
              <X className="w-3.5 h-3.5 text-white" />
            ) : (
              <Menu className="w-3.5 h-3.5 text-[#668B65]" />
            )}
            <span className="text-[11px] leading-none">Menu</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          </button>
        </div>
      </header>

      {/* Sub-bar below header: Back to City, Room Switcher (on mobile), & Location Badge */}
      {(viewMode === 'tugu' || viewMode === 'river' || viewMode === 'beach' || viewMode === 'stadium') && (
        <div className="pointer-events-auto flex items-center space-x-1.5 mt-1 self-start z-20 flex-wrap gap-y-1">
          <button
            type="button"
            onClick={() => {
              if (viewMode === 'tugu') {
                if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('exit-tugu-area'))
              } else if (viewMode === 'river') {
                if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('exit-river-area'))
              } else if (viewMode === 'beach') {
                if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('exit-beach-area'))
              } else if (viewMode === 'stadium') {
                if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('exit-stadium-area'))
              }
            }}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[#F7F4E9] hover:bg-[#EFE9D8] border border-[#D8CEBE] text-[#343B35] text-[11px] sm:text-xs font-heading font-bold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <span>← Kembali ke Kota</span>
          </button>

          {/* On Mobile screens (<md), show the Room Switcher right here in the sub-bar! */}
          {(viewMode === 'tugu' || viewMode === 'river' || viewMode === 'beach') && (
            <div className="md:hidden flex items-center space-x-1 bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl p-0.5 shadow-xs text-xs pointer-events-auto relative shrink-0">
              {/* Room Switcher Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  setShowHudRoomSwitcher(!showHudRoomSwitcher)
                  setShowHudRoster(false)
                }}
                className="flex items-center space-x-1 px-1.5 py-0.5 rounded-lg bg-[#EFE9D8] hover:bg-[#E2DAC7] text-[#343B35] font-heading font-bold text-[10px] transition-colors cursor-pointer shrink-0"
                title="Pilih Server Ruangan (Maks 10 Warga)"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#668B65] animate-pulse" />
                <span>{viewMode === 'beach' ? 'P#' : viewMode === 'river' ? 'D#' : 'R#'}{currentRoomId}</span>
                <span className="text-[9px] px-1 py-0.2 rounded bg-[#668B65]/15 text-[#668B65] font-extrabold">
                  {roomUserCount}/10
                </span>
                <ChevronDown className="w-3 h-3 text-[#78634B]" />
              </button>

              {/* Citizen Roster Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  setShowHudRoster(!showHudRoster)
                  setShowHudRoomSwitcher(false)
                }}
                className="flex items-center space-x-1 px-1.5 py-0.5 rounded-lg hover:bg-[#EFE9D8] text-[#343B35] font-heading font-bold text-[10px] transition-colors cursor-pointer shrink-0"
                title="Lihat Warga Online di Ruangan Ini"
              >
                <Users className="w-3 h-3 text-[#668B65]" />
                <span className="text-[10px] font-extrabold text-[#343B35]">
                  {roomPlayers.length || roomUserCount}
                </span>
              </button>

              {/* Mobile Dropdown: Room Server Switcher */}
              {showHudRoomSwitcher && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowHudRoomSwitcher(false)} />
                  <div className="absolute top-full mt-1.5 left-0 w-56 bg-[#F7F4E9] border-2 border-[#D8CEBE] rounded-2xl p-2 shadow-2xl z-50 text-xs font-sans">
                    <div className="font-heading font-black text-[10px] text-[#78634B] px-2 py-1 uppercase tracking-wide border-b border-[#D8CEBE] mb-1 flex items-center justify-between">
                      <span>Pilih Server {viewMode === 'beach' ? 'Pantai' : viewMode === 'river' ? 'Dermaga' : 'Ruangan'} (Maks 10)</span>
                      <button type="button" onClick={() => setShowHudRoomSwitcher(false)} className="text-[#78634B] hover:text-[#343B35] p-0.5">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {allRooms.map((r) => {
                        const isCurrent = r.roomId === currentRoomId
                        return (
                          <button
                            key={r.roomId}
                            type="button"
                            disabled={r.isFull && !isCurrent}
                            onClick={() => {
                              setCurrentRoomId(r.roomId)
                              setShowHudRoomSwitcher(false)
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                              isCurrent
                                ? 'bg-[#668B65] text-white font-bold'
                                : r.isFull
                                ? 'bg-[#EFE9D8]/50 text-[#78634B]/50 cursor-not-allowed'
                                : 'hover:bg-[#EFE9D8] text-[#343B35]'
                            }`}
                          >
                            <span className="flex items-center gap-1.5 font-heading text-xs">
                              {isCurrent && <Check className="w-3 h-3 text-white" />}
                              <span>{viewMode === 'beach' ? `Pantai #${r.roomId}` : viewMode === 'river' ? `Dermaga #${r.roomId}` : r.name}</span>
                            </span>
                            <span className={`text-[10px] font-semibold ${isCurrent ? 'text-white' : 'text-[#78634B]'}`}>
                              {r.isFull ? 'Penuh (10/10)' : `${r.userCount}/10 Warga`}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Mobile Dropdown: Citizen Roster */}
              {showHudRoster && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowHudRoster(false)} />
                  <div className="absolute top-full mt-1.5 left-0 w-60 bg-[#F7F4E9] border-2 border-[#D8CEBE] rounded-2xl p-2.5 shadow-2xl z-50 text-xs font-sans">
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#D8CEBE]">
                      <span className="font-heading font-black text-[10px] text-[#78634B] uppercase tracking-wide flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-[#668B65]" />
                        <span>Warga di {viewMode === 'beach' ? 'Pantai' : viewMode === 'river' ? 'Dermaga' : 'Ruang'} #{currentRoomId}</span>
                      </span>
                      <button type="button" onClick={() => setShowHudRoster(false)} className="text-[#78634B] hover:text-[#343B35] p-0.5 rounded cursor-pointer">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {roomPlayers.length === 0 ? (
                        <div className="text-[11px] text-[#78634B] py-2 text-center">Menghubungkan warga...</div>
                      ) : (
                        roomPlayers.map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between px-2 py-1.5 rounded-lg bg-[#EFE9D8]/60 text-[#343B35]"
                          >
                            <div className="flex items-center gap-1.5 truncate">
                              <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0" />
                              <span className="truncate font-heading font-bold text-xs">{p.name}</span>
                            </div>
                            <span className="text-[9px] text-[#668B65] font-bold px-1.5 py-0.2 rounded bg-[#668B65]/15 shrink-0">
                              🟢 Online
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          <div className="hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-[#F7F4E9]/95 border border-[#D8CEBE] text-[#78634B] text-[10px] sm:text-[11px] font-heading font-bold shadow-xs">
            <span>
              {viewMode === 'beach'
                ? '🏖️ Pantai Netizen Beach'
                : viewMode === 'river'
                ? '🎣 Dermaga Sungai Kali Netizen'
                : viewMode === 'stadium'
                ? '⚽ Stadion Gelora Netizen'
                : '🏛️ Alun-Alun Tugu Pusat'}
            </span>
          </div>

          {(viewMode === 'river' || viewMode === 'beach') && (
            <button
              type="button"
              onClick={() => openModal('rod_shop')}
              className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-stone-950 text-[10px] sm:text-xs font-heading font-black shadow-md border border-amber-300 transition-all cursor-pointer animate-pulse"
              title="Buka Toko Joran Pancing"
            >
              <span>🎣 Toko Joran</span>
            </button>
          )}
        </div>
      )}
      </div>

      {/* ============================================================ */}
      {/* MOBILE ACTION DRAWER (Full Cozy Netizen City Experience)     */}
      {/* ============================================================ */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-[9990] flex flex-col justify-end sm:justify-center items-center p-2 sm:p-4 pointer-events-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in cursor-pointer"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div
            className="relative z-10 w-full max-w-md bg-[#F7F4E9] border-2 border-[#D8CEBE] rounded-3xl shadow-2xl p-4 sm:p-5 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 flex flex-col gap-3 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Handle (Mobile) */}
            <div className="w-12 h-1.5 bg-[#D8CEBE] rounded-full mx-auto sm:hidden -mt-1 mb-1" />

            {/* Header: Citizen Profile & Close Button */}
            <div className="flex items-center justify-between pb-3 border-b border-[#D8CEBE]">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-10 h-10 rounded-2xl bg-[#668B65] text-white flex items-center justify-center font-heading font-black text-sm shadow-md shrink-0">
                  NC
                </div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-heading font-black text-sm text-[#343B35] truncate">
                      {profile?.displayName || 'Warga Netizen'}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-md bg-[#EFE9D8] text-[#78634B] text-[10px] font-heading font-bold border border-[#D8CEBE]">
                      Lv.{profile?.level || 1}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#78634B] truncate">
                    @{profile?.username || 'tamu'} • {districtNames[currentDistrict] || 'Netizen City'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 rounded-xl bg-[#EFE9D8] hover:bg-[#E2DAC7] border border-[#D8CEBE] flex items-center justify-center text-[#78634B] hover:text-[#343B35] transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Wallet & City Stats Pill */}
            <div className="flex items-center justify-between p-2.5 bg-[#EFE9D8] rounded-2xl border border-[#D8CEBE] text-xs">
              <div className="flex items-center space-x-1.5">
                <Coins className="w-4 h-4 text-[#E6C66F]" />
                <span className="font-heading font-extrabold text-[#343B35]">
                  {formatCoins(currentCoins)} Netizen Coins
                </span>
              </div>
              <div className="flex items-center space-x-1 text-[11px] text-[#668B65] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#668B65]" />
                <span>{cityStats.onlineNow} Warga Online</span>
              </div>
            </div>

            {/* SECTION 1: Aktivitas Utama & Game (Grid 2 Kolom) */}
            <div>
              <h4 className="text-[10px] font-heading font-extrabold text-[#78634B] uppercase tracking-wider mb-2">
                Aktivitas &amp; Petualangan Warga
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {/* 1. Tas Warga */}
                <button
                  type="button"
                  onClick={() => {
                    openModal('inventory')
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-[#F7F4E9] hover:bg-[#EFE9D8] border border-[#D8CEBE] text-left transition-colors cursor-pointer group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0">
                    <Backpack className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading font-black text-xs text-[#343B35] truncate flex items-center gap-1">
                      <span>Tas Warga</span>
                      {inventory.length > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-[#668B65] text-white text-[9px] font-bold">
                          {inventory.length}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-[#78634B] truncate">Roblox Backpack</div>
                  </div>
                </button>

                {/* 2. Foto Polaroid */}
                <button
                  type="button"
                  onClick={() => {
                    openModal('photo_studio')
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-[#F7F4E9] hover:bg-[#EFE9D8] border border-[#D8CEBE] text-left transition-colors cursor-pointer group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-900 shrink-0">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading font-black text-xs text-[#343B35] truncate">
                      Foto Bersama
                    </div>
                    <div className="text-[10px] text-[#78634B] truncate">POV &amp; Polaroid</div>
                  </div>
                </button>

                {/* 3. Mall Busana */}
                <button
                  type="button"
                  onClick={() => {
                    openModal('mall')
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-[#F7F4E9] hover:bg-[#EFE9D8] border border-[#D8CEBE] text-left transition-colors cursor-pointer group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-rose-100 border border-rose-300 flex items-center justify-center text-rose-800 shrink-0">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading font-black text-xs text-[#343B35] truncate">
                      Mall Busana
                    </div>
                    <div className="text-[10px] text-[#78634B] truncate">Baju &amp; Aksesoris</div>
                  </div>
                </button>

                {/* 4. Cari Kucing Kota */}
                <button
                  type="button"
                  onClick={() => {
                    openModal('cat_hunt')
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-[#F7F4E9] hover:bg-[#EFE9D8] border border-[#D8CEBE] text-left transition-colors cursor-pointer group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-orange-100 border border-orange-300 flex items-center justify-center text-orange-800 shrink-0 text-sm">
                    🐱
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading font-black text-xs text-[#343B35] truncate">
                      Cari Kucing
                    </div>
                    <div className="text-[10px] text-[#78634B] truncate">Misi 5 Kucing</div>
                  </div>
                </button>

                {/* 5. Misi & Prestasi */}
                <button
                  type="button"
                  onClick={() => {
                    openModal('missions')
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-[#F7F4E9] hover:bg-[#EFE9D8] border border-[#D8CEBE] text-left transition-colors cursor-pointer group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 border border-indigo-300 flex items-center justify-center text-indigo-800 shrink-0">
                    <Award className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading font-black text-xs text-[#343B35] truncate">
                      Misi &amp; Prestasi
                    </div>
                    <div className="text-[10px] text-[#78634B] truncate">Klaim Hadiah Koin</div>
                  </div>
                </button>

                {/* 6. Kurir Paket */}
                <button
                  type="button"
                  onClick={() => {
                    handleStartCourier()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-[#F7F4E9] hover:bg-[#EFE9D8] border border-[#D8CEBE] text-left transition-colors cursor-pointer group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-yellow-100 border border-yellow-300 flex items-center justify-center text-yellow-800 shrink-0">
                    <Package className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading font-black text-xs text-[#343B35] truncate">
                      Kurir Paket
                    </div>
                    <div className="text-[10px] text-[#78634B] truncate">+100 Koin per Antar</div>
                  </div>
                </button>
              </div>
            </div>

            {/* SECTION 2: Fasilitas & Pemerintahan (Grid 2 Kolom) */}
            <div>
              <h4 className="text-[10px] font-heading font-extrabold text-[#78634B] uppercase tracking-wider mb-2">
                Fasilitas &amp; Pemerintahan
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {/* 1. Kebun Netizen */}
                <button
                  type="button"
                  onClick={() => {
                    openModal('garden')
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-[#F7F4E9] hover:bg-[#EFE9D8] border border-[#D8CEBE] text-left transition-colors cursor-pointer group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shrink-0">
                    <Sprout className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading font-black text-xs text-[#343B35] truncate">
                      Kebun Netizen
                    </div>
                    <div className="text-[10px] text-[#78634B] truncate">Tanam &amp; Panen</div>
                  </div>
                </button>

                {/* 2. Menara Investor */}
                <button
                  type="button"
                  onClick={() => {
                    openModal('investor')
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-[#F7F4E9] hover:bg-[#EFE9D8] border border-[#D8CEBE] text-left transition-colors cursor-pointer group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-100 border border-purple-300 flex items-center justify-center text-purple-800 shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading font-black text-xs text-[#343B35] truncate">
                      Menara Investor
                    </div>
                    <div className="text-[10px] text-[#78634B] truncate">103 Pendukung Kota</div>
                  </div>
                </button>

                {/* 3. Balai Kota */}
                <button
                  type="button"
                  onClick={() => {
                    handleOpenCityHall()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-[#F7F4E9] hover:bg-[#EFE9D8] border border-[#D8CEBE] text-left transition-colors cursor-pointer group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-[#78634B] shrink-0">
                    <Vote className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading font-black text-xs text-[#343B35] truncate">
                      Balai Kota
                    </div>
                    <div className="text-[10px] text-[#78634B] truncate">Poling Kebijakan</div>
                  </div>
                </button>

                {/* 4. Hadiah Harian */}
                <button
                  type="button"
                  onClick={() => {
                    openModal('daily_rewards')
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-[#F7F4E9] hover:bg-[#EFE9D8] border border-[#D8CEBE] text-left transition-colors cursor-pointer group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-pink-100 border border-pink-300 flex items-center justify-center text-pink-700 shrink-0">
                    <Gift className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading font-black text-xs text-[#343B35] truncate">
                      Hadiah Harian
                    </div>
                    <div className="text-[10px] text-[#78634B] truncate">Klaim Tiap Hari</div>
                  </div>
                </button>

                {/* 5. Kartu Tanda Netizen */}
                <button
                  type="button"
                  onClick={() => {
                    openModal('ktn_card')
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-[#F7F4E9] hover:bg-[#EFE9D8] border border-[#D8CEBE] text-left transition-colors cursor-pointer group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-800 shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading font-black text-xs text-[#343B35] truncate">
                      Kartu KTN
                    </div>
                    <div className="text-[10px] text-[#78634B] truncate">Identitas Digital</div>
                  </div>
                </button>

                {/* 6. Ubah Waktu Siang / Malam */}
                <button
                  type="button"
                  onClick={() => {
                    handleToggleDayNight()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-2.5 p-2.5 rounded-2xl bg-[#F7F4E9] hover:bg-[#EFE9D8] border border-[#D8CEBE] text-left transition-colors cursor-pointer group shadow-2xs"
                >
                  <div className="w-9 h-9 rounded-xl bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-800 shrink-0">
                    <Moon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-heading font-black text-xs text-[#343B35] truncate">
                      Waktu Kota
                    </div>
                    <div className="text-[10px] text-[#78634B] truncate">Siang / Malam</div>
                  </div>
                </button>
              </div>
            </div>

            {/* SECTION 3: Audio & Akun */}
            <div className="pt-2 border-t border-[#D8CEBE] flex items-center justify-between gap-2">
              {/* Musik BGM Toggle */}
              <button
                type="button"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('toggle-nc-bgm'))
                  }
                }}
                className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-3 rounded-2xl bg-[#EFE9D8] hover:bg-[#E2DAC7] border border-[#D8CEBE] text-[#343B35] font-heading font-bold text-xs transition-colors cursor-pointer shadow-2xs"
              >
                <span>🎵</span>
                <span>Musik Kota BGM</span>
              </button>

              {/* Keluar / Beranda */}
              {profile ? (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false)
                    handleLogout()
                  }}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-2xl bg-[#FBEBE8] hover:bg-[#F5D8D3] border border-[#EAC2BA] text-[#A23F32] font-heading font-bold text-xs transition-colors cursor-pointer shadow-2xs shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Keluar</span>
                </button>
              ) : (
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-2xl bg-[#EFE9D8] hover:bg-[#E2DAC7] border border-[#D8CEBE] text-[#78634B] font-heading font-bold text-xs transition-colors shadow-2xs shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Beranda</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* NOTIFICATIONS CONTAINER (Otomatis Hilang Fadeout 10 Detik)   */}
      {/* ============================================================ */}
      <div className="pointer-events-auto fixed top-16 right-3 sm:right-5 z-40 max-w-xs space-y-2 font-sans">
        {notifications.map((n) => (
          <NotificationToast
            key={n.id}
            notification={n}
            onDismiss={removeNotification}
          />
        ))}
      </div>

      {/* ============================================================ */}
      {/* CHAT OVERLAY: Posisi Kiri Tengah Sesuai Permintaan           */}
      {/* ============================================================ */}
      <div className="fixed z-40 pointer-events-auto left-2.5 sm:left-4 top-1/2 -translate-y-1/2 flex items-center transition-all">
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
      <RodShopModal />
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
      <ErrorBoundary name="InventoryModal">
        <InventoryModal
          isOpen={activeModal === 'inventory'}
          onClose={closeModal}
        />
      </ErrorBoundary>
    </div>
  )
}

function NotificationToast({
  notification,
  onDismiss,
}: {
  notification: { id: string; title: string; message: string; type: string }
  onDismiss: (id: string) => void
}) {
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // Start smooth fadeout at 9.2s, dismiss at 10.0s (10 detik menghilang otomatis)
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true)
    }, 9200)

    const removeTimer = setTimeout(() => {
      onDismiss(notification.id)
    }, 10000)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [notification.id, onDismiss])

  const handleClick = () => {
    setIsFadingOut(true)
    setTimeout(() => {
      onDismiss(notification.id)
    }, 280)
  }

  const isFish =
    notification.title.toLowerCase().includes('ikan') ||
    notification.message.toLowerCase().includes('ikan') ||
    notification.title.toLowerCase().includes('menangkap')

  return (
    <div
      onClick={handleClick}
      className={`relative overflow-hidden p-3 rounded-2xl bg-[#F7F4E9]/95 backdrop-blur-md border border-[#D8CEBE] shadow-[0_6px_20px_rgba(52,59,53,0.15)] cursor-pointer flex items-start space-x-2.5 text-xs font-sans transition-all duration-700 ease-out select-none ${
        isFadingOut
          ? 'opacity-0 translate-x-10 scale-95 pointer-events-none'
          : 'opacity-100 translate-x-0 scale-100 animate-in fade-in slide-in-from-right-6 duration-300'
      }`}
      title="Klik untuk menutup sekarang (Otomatis hilang dalam 10 detik)"
    >
      <div className="w-7 h-7 rounded-lg bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-sm shrink-0 mt-0.5 shadow-inner">
        {isFish ? (
          '🐟'
        ) : notification.type === 'success' ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
        ) : (
          <Award className="w-3.5 h-3.5 text-[#668B65]" />
        )}
      </div>

      <div className="min-w-0 flex-1 pr-1">
        <h5 className="font-heading font-extrabold text-[#343B35] text-xs leading-snug">
          {notification.title}
        </h5>
        <p className="text-[#78634B] text-[11px] mt-0.5 leading-snug">
          {notification.message}
        </p>
      </div>

      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          handleClick()
        }}
        className="text-[#78634B] hover:text-[#343B35] p-0.5 rounded cursor-pointer shrink-0 -mr-1 -mt-0.5"
      >
        <X className="w-3 h-3" />
      </button>

      {/* 10-Second Countdown Line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D8CEBE]/40 overflow-hidden">
        <div
          className="h-full bg-[#668B65]/70 transition-all duration-[10000ms] ease-linear"
          style={{ width: isFadingOut ? '0%' : '100%' }}
        />
      </div>
    </div>
  )
}
