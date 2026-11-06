'use client'

import React, { useEffect, useRef, useState } from 'react'
import {
  Sun,
  Moon,
  Sunset,
  Sunrise,
  Compass,
  User,
  Navigation,
  Info,
  ChevronDown,
  Building2,
  ShoppingBag,
  Landmark,
  GraduationCap,
  Dog,
  Plane,
  Mountain,
  MapPin,
  ArrowRight,
  X,
  MessageSquare,
  Eye,
  Trophy,
  Plus,
  Minus,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react'
import { City3DManager, TimeOfDay, CameraMode } from '@/game3d/City3DManager'

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cityManagerRef = useRef<City3DManager | null>(null)

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('noon')
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit')
  const [viewMode, setViewMode] = useState<'city' | 'tugu'>('city')
  const [showLandmarkMenu, setShowLandmarkMenu] = useState(false)
  const [showHelpHint, setShowHelpHint] = useState(false) // Collapsed by default for clean mobile screen
  const [showMobileControls, setShowMobileControls] = useState(true)
  const [tuguConfirmOpen, setTuguConfirmOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionMessage, setTransitionMessage] = useState('')
  const [selectedLandmarkInfo, setSelectedLandmarkInfo] = useState<{
    id: string
    name: string
    district: string
    type?: string
  } | null>(null)

  useEffect(() => {
    if (containerRef.current && !cityManagerRef.current) {
      cityManagerRef.current = new City3DManager(containerRef.current, {
        onCameraModeChange: (mode: CameraMode) => setCameraMode(mode),
      })
    }

    const onOpenConfirm = () => setTuguConfirmOpen(true)
    const onModeChanged = (e: CustomEvent) => {
      const mode = e.detail?.mode || 'city'
      setViewMode(mode)
      if (mode === 'tugu') {
        setSelectedLandmarkInfo(null)
      }
    }
    const onLandmarkSelected = (e: CustomEvent) => {
      if (e.detail) {
        setSelectedLandmarkInfo(e.detail)
      }
    }
    const onTimeChanged = (e: CustomEvent) => {
      const t = e.detail?.time
      if (t) setTimeOfDay(t)
    }

    window.addEventListener('open-tugu-confirm', onOpenConfirm)
    window.addEventListener('tugu-mode-changed', onModeChanged as EventListener)
    window.addEventListener('landmark-selected', onLandmarkSelected as EventListener)
    window.addEventListener('time-of-day-changed', onTimeChanged as EventListener)

    return () => {
      window.removeEventListener('open-tugu-confirm', onOpenConfirm)
      window.removeEventListener('tugu-mode-changed', onModeChanged as EventListener)
      window.removeEventListener('landmark-selected', onLandmarkSelected as EventListener)
      window.removeEventListener('time-of-day-changed', onTimeChanged as EventListener)
      if (cityManagerRef.current) {
        cityManagerRef.current.destroy()
        cityManagerRef.current = null
      }
    }
  }, [])

  const handleTimeChange = (time: TimeOfDay) => {
    setTimeOfDay(time)
    cityManagerRef.current?.applyTimeOfDay(time)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('time-of-day-changed', { detail: { time } }))
    }
  }

  const handleCameraChange = (mode: CameraMode) => {
    setCameraMode(mode)
    cityManagerRef.current?.setCameraMode(mode)
  }

  const handleZoomIn = () => {
    cityManagerRef.current?.zoomIn()
  }

  const handleZoomOut = () => {
    cityManagerRef.current?.zoomOut()
  }

  const handleFlyTo = (landmarkId: string) => {
    if (landmarkId === 'monument') {
      cityManagerRef.current?.flyToLandmark('monument')
      setShowLandmarkMenu(false)
      setTuguConfirmOpen(true)
      return
    }
    cityManagerRef.current?.flyToLandmark(landmarkId)
    setShowLandmarkMenu(false)
    const lm = cityManagerRef.current?.landmarks.find((l) => l.id === landmarkId)
    if (lm) {
      setSelectedLandmarkInfo(lm)
    }
  }

  const handleEnterTugu = () => {
    setTuguConfirmOpen(false)
    setIsTransitioning(true)
    setTransitionMessage('Memuat Alun-Alun Tugu...')
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('enter-tugu-area'))
      setTimeout(() => {
        setIsTransitioning(false)
      }, 400)
    }, 450)
  }

  const handleExitTugu = () => {
    setIsTransitioning(true)
    setTransitionMessage('Kembali ke Kota Utama...')
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('exit-tugu-area'))
      setTimeout(() => {
        setIsTransitioning(false)
      }, 400)
    }, 450)
  }

  // Virtual D-Pad helpers for mobile touch walking in Tugu mode
  const handleVirtualDirection = (dir: { x: number; y: number } | null) => {
    cityManagerRef.current?.setVirtualMovement(dir)
  }

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-[#CDE7F0] select-none touch-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 3D WebGL Canvas Container with touch-none for proper multi-touch */}
      <div
        ref={containerRef}
        id="netizencity-3d-canvas"
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing touch-none"
      />

      {/* ============================================================ */}
      {/* GAME ENVIRONMENT CONTROLS: Time of Day, Camera & Destination */}
      {/* Positioned cleanly below the top HUD (responsive & non-intrusive) */}
      {/* ============================================================ */}
      <div className="absolute top-14 sm:top-16 left-2 sm:left-4 z-20 flex flex-wrap items-center gap-1.5 sm:gap-2 pointer-events-auto">
        {/* Mobile controls toggle pill on small screens */}
        <button
          type="button"
          onClick={() => setShowMobileControls(!showMobileControls)}
          className="sm:hidden p-1.5 rounded-lg bg-[#F7F4E9] border border-[#D8CEBE] shadow-xs text-[#343B35] flex items-center gap-1 text-[11px] font-heading font-bold"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#78634B]" />
          <span>{showMobileControls ? 'Sembunyikan' : 'Kontrol'}</span>
        </button>

        {showMobileControls && (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 animate-in fade-in">
            {/* 1. Time of Day Segmented Control (Solid, Restrained Game Palette) */}
            <div className="flex items-center bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl p-0.5 shadow-[0_3px_10px_rgba(52,59,53,0.08)]">
              <button
                type="button"
                onClick={() => handleTimeChange('morning')}
                title="Pagi (Sunrise)"
                className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                  timeOfDay === 'morning'
                    ? 'bg-[#EFE9D8] text-[#78634B] shadow-xs'
                    : 'text-[#78634B]/70 hover:text-[#343B35]'
                }`}
              >
                <Sunrise className="w-3.5 h-3.5 text-[#E6C66F]" />
                <span className="hidden md:inline text-[11px]">Pagi</span>
              </button>

              <button
                type="button"
                onClick={() => handleTimeChange('noon')}
                title="Siang (Daylight)"
                className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                  timeOfDay === 'noon'
                    ? 'bg-[#EFE9D8] text-[#78634B] shadow-xs'
                    : 'text-[#78634B]/70 hover:text-[#343B35]'
                }`}
              >
                <Sun className="w-3.5 h-3.5 text-[#E6C66F]" />
                <span className="hidden md:inline text-[11px]">Siang</span>
              </button>

              <button
                type="button"
                onClick={() => handleTimeChange('sunset')}
                title="Sore (Sunset)"
                className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                  timeOfDay === 'sunset'
                    ? 'bg-[#EFE9D8] text-[#78634B] shadow-xs'
                    : 'text-[#78634B]/70 hover:text-[#343B35]'
                }`}
              >
                <Sunset className="w-3.5 h-3.5 text-[#78634B]" />
                <span className="hidden md:inline text-[11px]">Sore</span>
              </button>

              <button
                type="button"
                onClick={() => handleTimeChange('night')}
                title="Malam (City Lights & Stars)"
                className={`flex items-center space-x-1 px-2 sm:px-2.5 py-1 rounded-lg text-xs font-heading font-bold transition-all cursor-pointer ${
                  timeOfDay === 'night'
                    ? 'bg-[#343B35] text-[#F7F4E9] shadow-xs'
                    : 'text-[#78634B]/70 hover:text-[#343B35]'
                }`}
              >
                <Moon className="w-3.5 h-3.5 text-[#A9C9D8]" />
                <span className="hidden md:inline text-[11px]">Malam</span>
              </button>
            </div>

            {/* 2. Camera Mode & Return Control */}
            {viewMode === 'city' ? (
              <div className="flex items-center space-x-1.5 bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl px-2.5 py-1 shadow-[0_3px_10px_rgba(52,59,53,0.08)] text-[11px] font-heading font-bold text-[#343B35]">
                <Compass className="w-3.5 h-3.5 text-[#668B65]" />
                <span className="hidden sm:inline">Mode Orbit 360°</span>
                <span className="sm:hidden">Orbit</span>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={handleExitTugu}
                  className="px-2.5 py-1 rounded-xl bg-[#F7F4E9] hover:bg-[#EFE9D8] text-[#343B35] font-heading font-bold text-[11px] border border-[#D8CEBE] shadow-xs flex items-center space-x-1 transition-transform cursor-pointer"
                >
                  <Landmark className="w-3.5 h-3.5 text-[#668B65]" />
                  <span>Keluar Tugu</span>
                </button>

                <div className="flex items-center bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl p-0.5 shadow-xs">
                  <button
                    type="button"
                    onClick={() => handleCameraChange('orbit')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-heading font-bold transition-all cursor-pointer ${
                      cameraMode === 'orbit'
                        ? 'bg-[#EFE9D8] text-[#343B35]'
                        : 'text-[#78634B] hover:text-[#343B35]'
                    }`}
                  >
                    Orbit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCameraChange('follow')}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-heading font-bold transition-all cursor-pointer ${
                      cameraMode === 'follow'
                        ? 'bg-[#668B65] text-white'
                        : 'text-[#78634B] hover:text-[#343B35]'
                    }`}
                  >
                    Karakter
                  </button>
                </div>
              </div>
            )}

            {/* 3. Landmark Destination Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowLandmarkMenu(!showLandmarkMenu)}
                className="flex items-center space-x-1.5 bg-[#F7F4E9] hover:bg-[#EFE9D8] border border-[#D8CEBE] rounded-xl px-2.5 py-1 text-[11px] font-heading font-bold text-[#343B35] shadow-[0_3px_10px_rgba(52,59,53,0.08)] transition-all cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5 text-[#668B65]" />
                <span className="hidden sm:inline">Kunjungi Landmark</span>
                <span className="sm:hidden">Landmark</span>
                <ChevronDown className="w-3 h-3 text-[#78634B]" />
              </button>

              {showLandmarkMenu && (
                <div className="absolute top-full left-0 mt-1.5 w-64 max-h-72 overflow-y-auto bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl shadow-xl p-1.5 z-50 flex flex-col space-y-1 font-sans text-xs">
                  <button
                    type="button"
                    onClick={() => handleFlyTo('monument')}
                    className="flex items-center space-x-2 text-left p-2 rounded-lg text-[#343B35] bg-[#EFE9D8] hover:bg-[#E2DAC7] font-bold transition-colors cursor-pointer"
                  >
                    <Landmark className="w-4 h-4 text-[#668B65] shrink-0" />
                    <div>
                      <div className="font-heading font-bold text-xs text-[#343B35]">Alun-Alun Tugu</div>
                      <div className="text-[10px] text-[#78634B]">Kumpul Warga &amp; Eksplorasi</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFlyTo('city_hall')}
                    className="flex items-center space-x-2 text-left p-2 rounded-lg text-[#343B35] hover:bg-[#EFE9D8] transition-colors cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-[#78634B] shrink-0" />
                    <div>
                      <div className="font-heading font-semibold text-xs">Balai Kota (City Hall)</div>
                      <div className="text-[10px] text-[#78634B]">Pemerintahan &amp; Kantor Mayor</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFlyTo('netizen_mall')}
                    className="flex items-center space-x-2 text-left p-2 rounded-lg text-[#343B35] hover:bg-[#EFE9D8] transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#78634B] shrink-0" />
                    <div>
                      <div className="font-heading font-semibold text-xs">Netizen Mall</div>
                      <div className="text-[10px] text-[#78634B]">Toko Busana &amp; Aksesoris</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFlyTo('sports_stadium')}
                    className="flex items-center space-x-2 text-left p-2 rounded-lg text-[#343B35] hover:bg-[#EFE9D8] transition-colors cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 text-[#78634B] shrink-0" />
                    <div>
                      <div className="font-heading font-semibold text-xs">Stadion Kota</div>
                      <div className="text-[10px] text-[#78634B]">Tribun &amp; Lintasan Atletik</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFlyTo('airport')}
                    className="flex items-center space-x-2 text-left p-2 rounded-lg text-[#343B35] hover:bg-[#EFE9D8] transition-colors cursor-pointer"
                  >
                    <Plane className="w-4 h-4 text-[#78634B] shrink-0" />
                    <div>
                      <div className="font-heading font-semibold text-xs">Bandara Internasional</div>
                      <div className="text-[10px] text-[#78634B]">Terminal &amp; Landasan Pesawat</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFlyTo('university')}
                    className="flex items-center space-x-2 text-left p-2 rounded-lg text-[#343B35] hover:bg-[#EFE9D8] transition-colors cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4 text-[#78634B] shrink-0" />
                    <div>
                      <div className="font-heading font-semibold text-xs">Universitas Netizen</div>
                      <div className="text-[10px] text-[#78634B]">Gedung Rektorat &amp; Sains</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFlyTo('zoo')}
                    className="flex items-center space-x-2 text-left p-2 rounded-lg text-[#343B35] hover:bg-[#EFE9D8] transition-colors cursor-pointer"
                  >
                    <Dog className="w-4 h-4 text-[#78634B] shrink-0" />
                    <div>
                      <div className="font-heading font-semibold text-xs">Kebun Binatang Safari</div>
                      <div className="text-[10px] text-[#78634B]">Habitat Hewan &amp; Flamingo</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFlyTo('nature_mountain')}
                    className="flex items-center space-x-2 text-left p-2 rounded-lg text-[#343B35] hover:bg-[#EFE9D8] transition-colors cursor-pointer"
                  >
                    <Mountain className="w-4 h-4 text-[#78634B] shrink-0" />
                    <div>
                      <div className="font-heading font-semibold text-xs">Gunung &amp; Air Terjun</div>
                      <div className="text-[10px] text-[#78634B]">Kawasan Alam &amp; Sungai</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* TACTILE ON-SCREEN ZOOM BUTTONS (Mobile & Desktop Accessibility) */}
      {/* ============================================================ */}
      <div className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col space-y-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Perbesar Kamera (Zoom In)"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F7F4E9] hover:bg-[#EFE9D8] active:translate-y-0.5 border border-[#D8CEBE] shadow-[0_3px_10px_rgba(52,59,53,0.08)] flex items-center justify-center text-[#343B35] cursor-pointer transition-transform"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Perkecil Kamera (Zoom Out)"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F7F4E9] hover:bg-[#EFE9D8] active:translate-y-0.5 border border-[#D8CEBE] shadow-[0_3px_10px_rgba(52,59,53,0.08)] flex items-center justify-center text-[#343B35] cursor-pointer transition-transform"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* ============================================================ */}
      {/* MOBILE VIRTUAL D-PAD (Only visible on mobile screens in Tugu mode) */}
      {/* ============================================================ */}
      {viewMode === 'tugu' && (
        <div className="sm:hidden absolute bottom-20 left-3 z-30 pointer-events-auto flex flex-col items-center">
          <button
            type="button"
            onPointerDown={() => handleVirtualDirection({ x: 0, y: -1 })}
            onPointerUp={() => handleVirtualDirection(null)}
            onPointerCancel={() => handleVirtualDirection(null)}
            className="w-10 h-10 rounded-lg bg-[#F7F4E9]/90 active:bg-[#668B65] active:text-white border border-[#D8CEBE] shadow-md flex items-center justify-center text-[#343B35] mb-1"
          >
            <ChevronUp className="w-5 h-5" />
          </button>
          <div className="flex space-x-1">
            <button
              type="button"
              onPointerDown={() => handleVirtualDirection({ x: -1, y: 0 })}
              onPointerUp={() => handleVirtualDirection(null)}
              onPointerCancel={() => handleVirtualDirection(null)}
              className="w-10 h-10 rounded-lg bg-[#F7F4E9]/90 active:bg-[#668B65] active:text-white border border-[#D8CEBE] shadow-md flex items-center justify-center text-[#343B35]"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onPointerDown={() => handleVirtualDirection({ x: 0, y: 1 })}
              onPointerUp={() => handleVirtualDirection(null)}
              onPointerCancel={() => handleVirtualDirection(null)}
              className="w-10 h-10 rounded-lg bg-[#F7F4E9]/90 active:bg-[#668B65] active:text-white border border-[#D8CEBE] shadow-md flex items-center justify-center text-[#343B35]"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            <button
              type="button"
              onPointerDown={() => handleVirtualDirection({ x: 1, y: 0 })}
              onPointerUp={() => handleVirtualDirection(null)}
              onPointerCancel={() => handleVirtualDirection(null)}
              className="w-10 h-10 rounded-lg bg-[#F7F4E9]/90 active:bg-[#668B65] active:text-white border border-[#D8CEBE] shadow-md flex items-center justify-center text-[#343B35]"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* COMPACT PLAYER GUIDANCE PANEL (Bottom-Left)                 */}
      {/* ============================================================ */}
      <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 z-20 pointer-events-auto font-sans">
        {showHelpHint ? (
          <div className="w-64 sm:w-72 bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl p-2.5 shadow-lg text-[11px] text-[#343B35] animate-in fade-in">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#D8CEBE] mb-1.5">
              <span className="font-heading font-bold text-xs flex items-center gap-1.5 text-[#343B35]">
                <Info className="w-3.5 h-3.5 text-[#668B65]" />
                {viewMode === 'city' ? 'Panduan Kota 3D' : 'Panduan Alun-Alun'}
              </span>
              <button
                type="button"
                onClick={() => setShowHelpHint(false)}
                className="text-[#78634B] hover:text-[#343B35] p-0.5 cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1 text-[#78634B]">
              {viewMode === 'city' ? (
                <>
                  <div>• <strong className="text-[#343B35]">Geser 1 Jari / Mouse:</strong> Putar orbit kota</div>
                  <div>• <strong className="text-[#343B35]">Cubit 2 Jari / Scroll:</strong> Zoom in &amp; out</div>
                  <div>• <strong className="text-[#343B35]">Geser 2 Jari:</strong> Pindah pandangan kamera</div>
                  <div>• <strong className="text-[#343B35]">Klik Tugu:</strong> Kunjungi Alun-Alun Warga</div>
                </>
              ) : (
                <>
                  <div>• <strong className="text-[#343B35]">D-Pad / WASD / Tap:</strong> Gerakkan karakter</div>
                  <div>• <strong className="text-[#343B35]">Obrolan Warga:</strong> Kirim pesan ke seluruh warga</div>
                  <div>• <strong className="text-[#343B35]">Keluar Tugu:</strong> Kembali ke orbit kota utama</div>
                </>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowHelpHint(true)}
            className="flex items-center space-x-1.5 bg-[#F7F4E9] hover:bg-[#EFE9D8] border border-[#D8CEBE] rounded-xl px-2.5 py-1 text-[11px] font-heading font-bold text-[#343B35] shadow-sm cursor-pointer transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-[#668B65]" />
            <span>Panduan</span>
          </button>
        )}
      </div>

      {/* ============================================================ */}
      {/* FLOATING LANDMARK INFO POPUP (City Mode)                     */}
      {/* ============================================================ */}
      {selectedLandmarkInfo && viewMode === 'city' && (
        <div className="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-40 w-[90%] max-w-sm bg-[#F7F4E9] border border-[#D8CEBE] rounded-2xl p-3 shadow-xl transition-all font-sans pointer-events-auto">
          <div className="flex items-start justify-between gap-2.5">
            <div className="flex items-center space-x-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-[#668B65] shrink-0">
                <Landmark className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[9px] font-heading font-bold uppercase tracking-wider text-[#668B65] bg-[#E6F0E4] px-1.5 py-0.2 rounded-md border border-[#C5D8C4]">
                  {selectedLandmarkInfo.district}
                </span>
                <h4 className="text-xs font-heading font-extrabold text-[#343B35] mt-0.5 truncate">
                  {selectedLandmarkInfo.name}
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedLandmarkInfo(null)}
              className="p-1 rounded-lg text-[#78634B] hover:text-[#343B35] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-2.5 pt-2 border-t border-[#D8CEBE] flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                cityManagerRef.current?.flyToLandmark(selectedLandmarkInfo.id)
              }}
              className="px-2.5 py-1 rounded-lg bg-[#EFE9D8] hover:bg-[#E2DAC7] text-[#343B35] font-heading font-bold text-xs border border-[#D8CEBE] flex items-center space-x-1 cursor-pointer transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-[#668B65]" />
              <span>Arahkan Kamera</span>
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* POPUP MODAL: "MAU MENGUNJUNGI TUGU?"                         */}
      {/* ============================================================ */}
      {tuguConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#343B35]/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-[#F7F4E9] border border-[#D8CEBE] rounded-2xl p-5 shadow-2xl relative font-sans animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-[#668B65]">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-heading font-extrabold text-[#343B35]">
                    Kunjungi Alun-Alun Tugu?
                  </h3>
                  <span className="text-[10px] text-[#4F6E4E] font-heading font-bold bg-[#E6F0E4] px-1.5 py-0.2 rounded-md border border-[#C5D8C4]">
                    Pusat Komunitas
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTuguConfirmOpen(false)}
                className="text-[#78634B] hover:text-[#343B35] p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#78634B] leading-relaxed mb-3">
              Kunjungi area <strong className="text-[#343B35]">Alun-Alun Monumen Tugu</strong> untuk berjalan-jalan bersama karaktermu dan saling mengobrol bersama seluruh warga Netizen City secara langsung!
            </p>

            <div className="p-3 bg-[#EFE9D8] rounded-xl border border-[#D8CEBE] space-y-1.5 mb-4 text-[11px] text-[#78634B]">
              <div className="flex items-center space-x-2 text-[#343B35] font-heading font-bold">
                <User className="w-3.5 h-3.5 text-[#668B65]" />
                <span>Karakter Aktif &amp; Bebas Bergerak</span>
              </div>
              <div className="flex items-center space-x-2 text-[#343B35] font-heading font-bold">
                <MessageSquare className="w-3.5 h-3.5 text-[#668B65]" />
                <span>Obrolan Komunitas Warga</span>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-[#D8CEBE]">
              <button
                type="button"
                onClick={() => setTuguConfirmOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-heading font-bold text-[#78634B] hover:text-[#343B35] cursor-pointer"
              >
                Batal
              </button>

              <button
                type="button"
                onClick={handleEnterTugu}
                className="px-4 py-2 rounded-xl bg-[#668B65] hover:bg-[#547553] text-white font-heading font-bold text-xs shadow-sm flex items-center space-x-1.5 active:translate-y-0.5 transition-all cursor-pointer"
              >
                <span>Kunjungi Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MAP TRANSITION LOADING SCREEN                                */}
      {/* ============================================================ */}
      {isTransitioning && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#343B35]/90 backdrop-blur-sm text-white font-sans animate-in fade-in">
          <div className="w-14 h-14 rounded-2xl bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-[#668B65] mb-3 shadow-md animate-bounce">
            <Compass className="w-7 h-7" />
          </div>
          <h2 className="text-base font-heading font-black tracking-wide text-[#F7F4E9] mb-1">
            {transitionMessage}
          </h2>
          <p className="text-xs text-[#A9C9D8] font-medium text-center max-w-xs">
            {transitionMessage.includes('Alun-Alun')
              ? 'Memuat peta khusus Alun-Alun Tugu & warga...'
              : 'Memuat peta diorama 3D kota utama...'}
          </p>
          <div className="w-40 h-1.5 bg-white/20 rounded-full mt-4 overflow-hidden">
            <div className="w-full h-full bg-[#668B65] rounded-full animate-pulse" />
          </div>
        </div>
      )}
    </div>
  )
}
