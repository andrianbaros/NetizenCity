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
} from 'lucide-react'
import { City3DManager, TimeOfDay, CameraMode } from '@/game3d/City3DManager'

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cityManagerRef = useRef<City3DManager | null>(null)

  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('noon')
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit')
  const [viewMode, setViewMode] = useState<'city' | 'tugu'>('city')
  const [showLandmarkMenu, setShowLandmarkMenu] = useState(false)
  const [showHelpHint, setShowHelpHint] = useState(true)
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

    window.addEventListener('open-tugu-confirm', onOpenConfirm)
    window.addEventListener('tugu-mode-changed', onModeChanged as EventListener)
    window.addEventListener('landmark-selected', onLandmarkSelected as EventListener)

    return () => {
      window.removeEventListener('open-tugu-confirm', onOpenConfirm)
      window.removeEventListener('tugu-mode-changed', onModeChanged as EventListener)
      window.removeEventListener('landmark-selected', onLandmarkSelected as EventListener)
      if (cityManagerRef.current) {
        cityManagerRef.current.destroy()
        cityManagerRef.current = null
      }
    }
  }, [])

  const handleTimeChange = (time: TimeOfDay) => {
    setTimeOfDay(time)
    cityManagerRef.current?.applyTimeOfDay(time)
  }

  const handleCameraChange = (mode: CameraMode) => {
    setCameraMode(mode)
    cityManagerRef.current?.setCameraMode(mode)
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

  return (
    <div
      className="relative w-full h-full overflow-hidden bg-[#CDE7F0] select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* 3D WebGL Canvas Container */}
      <div
        ref={containerRef}
        id="netizencity-3d-canvas"
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing"
      />

      {/* 3D Floating Control Bar (Top-Left, below HUD Header) */}
      <div className="absolute top-20 left-3 sm:left-5 z-40 flex flex-wrap items-center gap-2 pointer-events-auto">
        {/* Time of Day Switcher */}
        <div className="flex items-center bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#EADBCC] rounded-2xl p-1 shadow-[0_8px_24px_rgba(70,50,60,0.1)]">
          <button
            onClick={() => handleTimeChange('morning')}
            title="Pagi (Sunrise)"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
              timeOfDay === 'morning'
                ? 'bg-[#EBF8F3] text-[#1E5D46] border border-[#B7E7D5] shadow-xs'
                : 'text-[#8C7D91] hover:text-[#3B3340]'
            }`}
          >
            <Sunrise className="w-3.5 h-3.5 text-[#2F9474]" />
            <span className="hidden sm:inline">Pagi</span>
          </button>

          <button
            onClick={() => handleTimeChange('noon')}
            title="Siang (Daylight)"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
              timeOfDay === 'noon'
                ? 'bg-[#FFF9E6] text-[#7A5E0E] border border-[#FCE69C] shadow-xs'
                : 'text-[#8C7D91] hover:text-[#3B3340]'
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-[#D9A834]" />
            <span className="hidden sm:inline">Siang</span>
          </button>

          <button
            onClick={() => handleTimeChange('sunset')}
            title="Sore (Sunset)"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
              timeOfDay === 'sunset'
                ? 'bg-[#FFF2EB] text-[#D97858] border border-[#F4C8B4] shadow-xs'
                : 'text-[#8C7D91] hover:text-[#3B3340]'
            }`}
          >
            <Sunset className="w-3.5 h-3.5 text-[#F4A98C]" />
            <span className="hidden sm:inline">Sore</span>
          </button>

          <button
            onClick={() => handleTimeChange('night')}
            title="Malam (City Lights & Stars)"
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
              timeOfDay === 'night'
                ? 'bg-[#F5F0FD] text-[#55387E] border border-[#DACBF6] shadow-xs'
                : 'text-[#8C7D91] hover:text-[#3B3340]'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-[#8F7AB4]" />
            <span className="hidden sm:inline">Malam</span>
          </button>
        </div>

        {/* Dynamic Mode Controls based on viewMode */}
        {viewMode === 'city' ? (
          <div className="flex items-center space-x-2 bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#EADBCC] rounded-2xl px-3.5 py-1.5 shadow-[0_8px_24px_rgba(70,50,60,0.1)] text-xs font-heading font-bold text-[#3B3340]">
            <Compass className="w-3.5 h-3.5 text-[#245282]" />
            <span>Mode Orbit Kota (360°)</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleExitTugu}
              className="px-3.5 py-1.5 rounded-2xl bg-[#FFFDF9] hover:bg-[#FFF8ED] text-[#3B3340] font-heading font-extrabold text-xs border-2 border-[#EADBCC] border-b-4 border-b-[#D6C2AC] active:border-b-2 active:translate-y-0.5 shadow-md flex items-center space-x-2 transition-transform cursor-pointer"
            >
              <span>🏛️ Kembali ke Tinjauan Kota</span>
            </button>

            <div className="flex items-center bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#EADBCC] rounded-2xl p-1 shadow-xs">
              <button
                onClick={() => handleCameraChange('orbit')}
                className={`px-2.5 py-1 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
                  cameraMode === 'orbit'
                    ? 'bg-[#EAF3FD] text-[#245282] border border-[#BFD8F6]'
                    : 'text-[#8C7D91] hover:text-[#3B3340]'
                }`}
              >
                Orbit
              </button>
              <button
                onClick={() => handleCameraChange('follow')}
                className={`px-2.5 py-1 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
                  cameraMode === 'follow'
                    ? 'bg-[#EBF8F3] text-[#1E5D46] border border-[#B7E7D5]'
                    : 'text-[#8C7D91] hover:text-[#3B3340]'
                }`}
              >
                Karakter
              </button>
            </div>
          </div>
        )}

        {/* Fly-to Landmark Selector */}
        <div className="relative">
          <button
            onClick={() => setShowLandmarkMenu(!showLandmarkMenu)}
            className="flex items-center space-x-2 bg-[#FFFDF9]/95 hover:bg-[#FFF8ED] backdrop-blur-md border-2 border-[#EADBCC] rounded-2xl px-3.5 py-2 text-xs font-heading font-bold text-[#3B3340] shadow-[0_8px_24px_rgba(70,50,60,0.1)] transition-all cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-[#F4A98C]" />
            <span>Kunjungi Landmark</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#8C7D91] ml-1" />
          </button>

          {showLandmarkMenu && (
            <div className="absolute top-full left-0 mt-2 w-72 max-h-84 overflow-y-auto bg-[#FFFDF9]/98 backdrop-blur-xl border-2 border-[#EADBCC] rounded-2xl shadow-2xl p-2 z-50 flex flex-col space-y-1">
              <button
                onClick={() => handleFlyTo('monument')}
                className="flex items-center space-x-2 text-left px-3 py-2 rounded-xl text-xs text-[#3B3340] bg-[#FFF0EB] hover:bg-[#FFE3D6] border border-[#F4A98C]/60 font-bold transition-colors cursor-pointer"
              >
                <Landmark className="w-4 h-4 text-[#D97858] shrink-0" />
                <div>
                  <div className="font-extrabold text-[#D97858]">Monumen Tugu Alun-Alun</div>
                  <div className="text-[10px] text-[#8C7D91]">Pusat Kumpul, Gerak &amp; Obrolan Warga</div>
                </div>
              </button>

              <button
                onClick={() => handleFlyTo('city_hall')}
                className="flex items-center space-x-2 text-left px-3 py-2 rounded-xl text-xs text-[#3B3340] hover:bg-[#F8F4EE] transition-colors cursor-pointer"
              >
                <Building2 className="w-4 h-4 text-[#245282] shrink-0" />
                <div>
                  <div className="font-semibold">Balai Kota (City Hall)</div>
                  <div className="text-[10px] text-[#8C7D91]">Pusat Pemerintahan &amp; Kantor Walikota</div>
                </div>
              </button>

              <button
                onClick={() => handleFlyTo('netizen_mall')}
                className="flex items-center space-x-2 text-left px-3 py-2 rounded-xl text-xs text-[#3B3340] hover:bg-[#F8F4EE] transition-colors cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4 text-[#D9A834] shrink-0" />
                <div>
                  <div className="font-semibold">Netizen Mall (Day 6)</div>
                  <div className="text-[10px] text-[#8C7D91]">Pusat Belanja Busana &amp; Aksesoris</div>
                </div>
              </button>

              <button
                onClick={() => handleFlyTo('sports_stadium')}
                className="flex items-center space-x-2 text-left px-3 py-2 rounded-xl text-xs text-[#3B3340] hover:bg-[#F8F4EE] transition-colors cursor-pointer"
              >
                <Landmark className="w-4 h-4 text-[#2F9474] shrink-0" />
                <div>
                  <div className="font-semibold">Stadion Sepak Bola (Day 7)</div>
                  <div className="text-[10px] text-[#8C7D91]">Stadion Atletik Megah &amp; Tribun</div>
                </div>
              </button>

              <button
                onClick={() => handleFlyTo('airport')}
                className="flex items-center space-x-2 text-left px-3 py-2 rounded-xl text-xs text-[#3B3340] hover:bg-[#F8F4EE] transition-colors cursor-pointer"
              >
                <Plane className="w-4 h-4 text-[#245282] shrink-0" />
                <div>
                  <div className="font-semibold">Bandara Internasional (Day 7)</div>
                  <div className="text-[10px] text-[#8C7D91]">Terminal Pesawat &amp; Runway</div>
                </div>
              </button>

              <button
                onClick={() => handleFlyTo('university')}
                className="flex items-center space-x-2 text-left px-3 py-2 rounded-xl text-xs text-[#3B3340] hover:bg-[#F8F4EE] transition-colors cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-[#8F7AB4] shrink-0" />
                <div>
                  <div className="font-semibold">Universitas Netizen (Day 9)</div>
                  <div className="text-[10px] text-[#8C7D91]">Menara Rektorat &amp; Kampus Riset</div>
                </div>
              </button>

              <button
                onClick={() => handleFlyTo('zoo')}
                className="flex items-center space-x-2 text-left px-3 py-2 rounded-xl text-xs text-[#3B3340] hover:bg-[#F8F4EE] transition-colors cursor-pointer"
              >
                <Dog className="w-4 h-4 text-[#D9A834] shrink-0" />
                <div>
                  <div className="font-semibold">Kebun Binatang Safari (Day 8)</div>
                  <div className="text-[10px] text-[#8C7D91]">Habitat Hewan Hidup &amp; Kolam Flamingo</div>
                </div>
              </button>

              <button
                onClick={() => handleFlyTo('nature_beach')}
                className="flex items-center space-x-2 text-left px-3 py-2 rounded-xl text-xs text-[#3B3340] hover:bg-[#F8F4EE] transition-colors cursor-pointer"
              >
                <Sun className="w-4 h-4 text-[#D97858] shrink-0" />
                <div>
                  <div className="font-semibold">Pantai Netizen (Day 5)</div>
                  <div className="text-[10px] text-[#8C7D91]">Pasir Krem &amp; Menara Pantai</div>
                </div>
              </button>

              <button
                onClick={() => handleFlyTo('nature_mountain')}
                className="flex items-center space-x-2 text-left px-3 py-2 rounded-xl text-xs text-[#3B3340] hover:bg-[#F8F4EE] transition-colors cursor-pointer"
              >
                <Mountain className="w-4 h-4 text-[#2F9474] shrink-0" />
                <div>
                  <div className="font-semibold">Gunung &amp; Air Terjun (Day 5)</div>
                  <div className="text-[10px] text-[#8C7D91]">Jalur Pendakian &amp; Kolam Alam</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Control Hint Banner (Bottom-Left) */}
      {showHelpHint && (
        <div className="absolute bottom-6 left-6 z-20 max-w-sm bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#EADBCC] rounded-2xl p-3.5 shadow-xl text-xs text-[#524456] pointer-events-auto font-sans">
          <div className="flex items-center justify-between font-heading font-bold text-[#3B3340] pb-1.5 border-b border-[#F0E4D5]">
            <span className="flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-[#F4A98C]" />
              <span>{viewMode === 'city' ? 'Panduan Tinjauan Kota 3D' : 'Panduan Alun-Alun Tugu'}</span>
            </span>
            <button
              onClick={() => setShowHelpHint(false)}
              className="text-[#9C8F9F] hover:text-[#3B3340] text-xs w-5 h-5 rounded-full flex items-center justify-center hover:bg-[#FFF3E3] cursor-pointer"
            >
              ✕
            </button>
          </div>
          <div className="mt-2 space-y-1.5 text-xs text-[#6A5E6E]">
            {viewMode === 'city' ? (
              <>
                <div>
                  <span className="font-heading font-bold text-[#245282]">Drag Mouse:</span> Putar &amp; orbit melihat seluruh kota diorama 3D
                </div>
                <div>
                  <span className="font-heading font-bold text-[#1E5D46]">Scroll Mouse:</span> Zoom in / zoom out
                </div>
                <div>
                  <span className="font-heading font-bold text-[#D97858]">Klik Tugu Alun-Alun:</span> Masuk ke area Tugu untuk bergerak &amp; mengobrol
                </div>
              </>
            ) : (
              <>
                <div>
                  <span className="font-heading font-bold text-[#245282]">WASD / Panah / Klik:</span> Gerakkan karakter berkeliling Alun-Alun Tugu
                </div>
                <div>
                  <span className="font-heading font-bold text-[#1E5D46]">Obrolan Warga:</span> Ngobrol &amp; berinteraksi bersama warga lain
                </div>
                <div>
                  <span className="font-heading font-bold text-[#D97858]">Tombol Atas:</span> Kembali ke Tinjauan Kota Orbit kapan saja
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* FLOATING LANDMARK INFO BADGE (Muncul saat Landmark diklik di Diorama 3D Kota) */}
      {selectedLandmarkInfo && viewMode === 'city' && (
        <div className="absolute bottom-20 sm:bottom-24 left-1/2 -translate-x-1/2 z-40 max-w-sm sm:max-w-md w-[92%] sm:w-auto bg-[#FFFDF9]/95 backdrop-blur-md border-2 border-[#EADBCC] rounded-3xl p-4 shadow-[0_12px_36px_rgba(70,50,60,0.18)] transition-all animate-in fade-in slide-in-from-bottom-3 font-sans pointer-events-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 rounded-2xl bg-[#FFF0EB] border border-[#F4A98C] flex items-center justify-center text-[#D97858] shrink-0 shadow-xs">
                {selectedLandmarkInfo.type === 'sports' ? (
                  <Trophy className="w-5 h-5 text-[#D97858]" />
                ) : selectedLandmarkInfo.type === 'transport' ? (
                  <Plane className="w-5 h-5 text-[#245282]" />
                ) : selectedLandmarkInfo.type === 'education' ? (
                  <GraduationCap className="w-5 h-5 text-[#245282]" />
                ) : selectedLandmarkInfo.type === 'entertainment' ? (
                  <Dog className="w-5 h-5 text-[#2F9474]" />
                ) : selectedLandmarkInfo.type === 'nature' ? (
                  <Mountain className="w-5 h-5 text-[#2F9474]" />
                ) : (
                  <Landmark className="w-5 h-5 text-[#D97858]" />
                )}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-heading font-extrabold uppercase tracking-wider text-[#2F9474] bg-[#EBF8F3] px-2 py-0.5 rounded-full border border-[#B7E7D5]">
                    {selectedLandmarkInfo.district}
                  </span>
                  <span className="text-[10px] text-[#8C7D91] font-heading font-bold">
                    Landmark Kota
                  </span>
                </div>
                <h4 className="text-sm font-heading font-black text-[#3B3340] mt-1 leading-snug">
                  {selectedLandmarkInfo.name}
                </h4>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedLandmarkInfo(null)}
              className="w-7 h-7 rounded-full bg-[#FFF0E6] text-[#D97858] hover:bg-[#F4A98C] hover:text-white transition-colors flex items-center justify-center cursor-pointer border border-[#F2C9B6] shrink-0"
              title="Tutup"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-3 pt-2.5 border-t border-[#F0E4D5] flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => {
                cityManagerRef.current?.flyToLandmark(selectedLandmarkInfo.id)
              }}
              className="px-3 py-1.5 rounded-xl bg-[#EAF3FD] hover:bg-[#D9EBFD] text-[#245282] font-heading font-bold text-xs border border-[#BFD8F6] flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#245282]" />
              <span>Arahkan Kamera</span>
            </button>
          </div>
        </div>
      )}

      {/* POPUP MODAL: "MAU MENGUNJUNGI TUGU?" */}
      {tuguConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="w-full max-w-md bg-[#FFFDF9] border-2 border-[#EADBCC] rounded-3xl p-6 shadow-2xl relative overflow-hidden font-sans">
            {/* Header with Icon */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFF0EB] border-2 border-[#F4A98C] flex items-center justify-center text-[#D97858] shadow-xs">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-heading font-black text-[#3B3340]">
                    Kunjungi Alun-Alun Tugu?
                  </h3>
                  <span className="text-[11px] text-[#2F9474] font-bold bg-[#EBF8F3] px-2 py-0.5 rounded-full border border-[#B7E7D5]">
                    Pusat Komunitas Warga
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTuguConfirmOpen(false)}
                className="w-7 h-7 rounded-full bg-[#FFF0E6] text-[#D97858] hover:bg-[#F4A98C] hover:text-white transition-colors flex items-center justify-center cursor-pointer border border-[#F2C9B6]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content info */}
            <p className="text-xs text-[#5C5265] leading-relaxed mb-4 font-medium">
              Apakah kamu ingin mengunjungi area <strong className="text-[#3B3340]">Alun-Alun Monumen Tugu</strong>? Di sinilah seluruh warga Netizen City berkumpul, berjalan-jalan, dan saling mengobrol secara langsung!
            </p>

            <div className="p-3.5 bg-[#FFF9F1] rounded-2xl border-2 border-[#EADBCC] space-y-2 mb-6 text-xs text-[#6A5E6E]">
              <div className="flex items-center space-x-2 text-[#245282] font-heading font-bold">
                <User className="w-4 h-4 text-[#245282] shrink-0" />
                <span>Karakter Aktif &amp; Bebas Bergerak</span>
              </div>
              <div className="flex items-center space-x-2 text-[#2F9474] font-heading font-bold">
                <MessageSquare className="w-4 h-4 text-[#2F9474] shrink-0" />
                <span>Obrolan Live Bersama Seluruh Warga</span>
              </div>
              <div className="flex items-center space-x-2 text-[#D97858] font-heading font-bold">
                <MapPin className="w-4 h-4 text-[#D97858] shrink-0" />
                <span>Taman Air Mancur, Bunga &amp; Pak Mayor</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-2 border-t-2 border-[#EADBCC]">
              <button
                type="button"
                onClick={() => setTuguConfirmOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-heading font-bold text-[#6A5E6E] hover:text-[#3B3340] hover:bg-[#F8F4EE] transition-colors cursor-pointer"
              >
                Tetap di Mode Orbit
              </button>

              <button
                type="button"
                onClick={handleEnterTugu}
                className="px-5 py-2.5 rounded-xl bg-[#F4A98C] hover:bg-[#E89578] text-white font-heading font-extrabold text-xs border-b-3 border-[#B85838] active:border-b-0 active:translate-y-0.5 shadow-md flex items-center space-x-1.5 transition-transform cursor-pointer"
              >
                <span>Kunjungi Tugu Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAP TRANSITION LOADING SCREEN */}
      {isTransitioning && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#2A2430]/90 backdrop-blur-md text-white transition-opacity duration-300 font-sans">
          <div className="w-16 h-16 rounded-3xl bg-[#F4A98C]/20 border-2 border-[#F4A98C] flex items-center justify-center text-[#F4A98C] mb-4 shadow-[0_0_30px_rgba(244,169,140,0.3)] animate-bounce">
            <Compass className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-heading font-black tracking-wide text-[#FFFDF9] mb-2">
            {transitionMessage}
          </h2>
          <p className="text-xs text-[#D8CEE0] font-medium text-center max-w-xs">
            {transitionMessage.includes('Alun-Alun')
              ? 'Memuat peta khusus Alun-Alun Tugu, warga & obrolan komunitas...'
              : 'Memuat peta diorama 3D seluruh kota Netizen City...'}
          </p>
          <div className="w-48 h-2 bg-white/10 rounded-full mt-5 overflow-hidden">
            <div className="w-full h-full bg-[#F4A98C] rounded-full animate-pulse" />
          </div>
        </div>
      )}
    </div>
  )
}
