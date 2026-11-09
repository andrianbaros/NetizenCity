// ============================================================
// NETIZENCITY - Photo Studio & Selfie Mode (Fitur 2)
// Foto bersama di Alun-Alun / Kota dengan ganti POV & Polaroid Frame
// ============================================================

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  Camera,
  X,
  RotateCw,
  ZoomIn,
  ZoomOut,
  Download,
  Sparkles,
  Users,
  Compass,
  Check,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'
import { useUIStore } from '@/lib/stores/useUIStore'
import { useGameStore } from '@/lib/stores/useGameStore'

interface PhotoStudioModalProps {
  isOpen: boolean
  onClose: () => void
}

type POVPreset = 'selfie' | 'normal' | 'drone' | 'wide'

export default function PhotoStudioModal({ isOpen, onClose }: PhotoStudioModalProps) {
  const profile = useCitizenStore((s) => s.profile)
  const addNotification = useUIStore((s) => s.addNotification)
  const selectedBuilding = useGameStore((s) => s.selectedBuilding)
  const currentDistrict = useGameStore((s) => s.currentDistrict)

  const [activePOV, setActivePOV] = useState<POVPreset>('normal')
  const [orbitAngle, setOrbitAngle] = useState(135)
  const [zoomLevel, setZoomLevel] = useState(14)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isCapturing, setIsCapturing] = useState(false)
  const [shutterFlash, setShutterFlash] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Dispatch initial POV on mount
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('adjust-camera-pov', {
          detail: { preset: 'normal' },
        })
      )
    }
  }, [isOpen])

  if (!isOpen || !mounted) return null

  const handleSelectPOV = (preset: POVPreset) => {
    setActivePOV(preset)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('adjust-camera-pov', {
          detail: { preset },
        })
      )
    }
  }

  const handleOrbitChange = (val: number) => {
    setOrbitAngle(val)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('adjust-camera-pov', {
          detail: { yaw: val },
        })
      )
    }
  }

  const handleZoomChange = (val: number) => {
    setZoomLevel(val)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('adjust-camera-pov', {
          detail: { distance: val },
        })
      )
    }
  }

  // Play synthetic camera shutter sound
  const playShutterSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(800, audioCtx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(120, audioCtx.currentTime + 0.08)
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.1)
    } catch {
      // ignore
    }
  }

  // Capture the WebGL Canvas and composite into a Polaroid frame
  const handleShutter = () => {
    setIsCapturing(true)
    setShutterFlash(true)
    playShutterSound()

    setTimeout(() => {
      setShutterFlash(false)
    }, 200)

    setTimeout(() => {
      const gameCanvas = document.querySelector('canvas') as HTMLCanvasElement | null
      if (!gameCanvas) {
        setIsCapturing(false)
        return
      }

      // FITUR 4: Presisi Rasio Asli Layar (PC Landscape / Mobile Portrait) - Tidak Gepeng
      const cWidth = gameCanvas.width
      const cHeight = gameCanvas.height
      const aspect = cWidth / cHeight

      const pad = 36
      const footerHeight = 110
      let photoWidth: number
      let photoHeight: number

      if (aspect >= 1.0) {
        // Mode Landscape (PC / Tablet): Lebar 960px, tinggi mengikuti rasio asli
        photoWidth = 960
        photoHeight = Math.round(photoWidth / aspect)
      } else {
        // Mode Portrait (Mobile): Lebar 640px, tinggi mengikuti rasio asli
        photoWidth = 640
        photoHeight = Math.round(photoWidth / aspect)
      }

      const canvasWidth = photoWidth + pad * 2
      const canvasHeight = photoHeight + pad * 2 + footerHeight

      const frameCanvas = document.createElement('canvas')
      frameCanvas.width = canvasWidth
      frameCanvas.height = canvasHeight
      const ctx = frameCanvas.getContext('2d')

      if (!ctx) {
        setIsCapturing(false)
        return
      }

      // 1. Polaroid White/Cream Frame background
      ctx.fillStyle = '#FFFDF9'
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // Outer border
      ctx.lineWidth = 10
      ctx.strokeStyle = '#EFE9D8'
      ctx.strokeRect(5, 5, canvasWidth - 10, canvasHeight - 10)

      // Inner thin border
      ctx.lineWidth = 2
      ctx.strokeStyle = '#D8CEBE'
      ctx.strokeRect(pad - 4, pad - 4, photoWidth + 8, photoHeight + 8)

      // 2. Draw WebGL 3D Game Snapshot (100% RASIO ASLI - TIDAK GEPENG)
      ctx.drawImage(
        gameCanvas,
        0,
        0,
        cWidth,
        cHeight,
        pad,
        pad,
        photoWidth,
        photoHeight
      )

      // Determine dynamic location based on selectedBuilding & currentDistrict
      let locationBadge = '🏛️ ALUN-ALUN TUGU'
      let locationSubtitle = 'Alun-Alun Pusat Kota'
      let locationName = 'Alun-Alun Tugu'

      if (selectedBuilding === 'river_spot' || currentDistrict === 'Kawasan Alam') {
        locationBadge = '🎣 DERMAGA SUNGAI KALI NETIZEN'
        locationSubtitle = 'Dermaga Pancing Sungai Kali Netizen'
        locationName = 'Sungai Kali Netizen'
      } else if (selectedBuilding === 'sports_stadium') {
        locationBadge = '⚽ STADION GELORA NETIZEN'
        locationSubtitle = 'Stadion Gelora Netizen'
        locationName = 'Stadion Gelora Netizen'
      } else if (selectedBuilding === 'investor_tower' || currentDistrict === 'Distrik Investor') {
        locationBadge = '🏢 MENARA INVESTOR'
        locationSubtitle = 'Pusat Bisnis Menara Investor'
        locationName = 'Menara Investor'
      } else if (selectedBuilding === 'city_hall') {
        locationBadge = '🏛️ BALAI KOTA NETIZEN'
        locationSubtitle = 'Balai Kota Netizen'
        locationName = 'Balai Kota'
      } else if (selectedBuilding === 'monument' || currentDistrict === 'town_square' || currentDistrict === 'Pusat Kota') {
        locationBadge = '🏛️ ALUN-ALUN TUGU'
        locationSubtitle = 'Alun-Alun Pusat Kota'
        locationName = 'Alun-Alun Tugu'
      } else if (currentDistrict) {
        locationBadge = `🏙️ ${currentDistrict.toUpperCase()}`
        locationSubtitle = `${currentDistrict} • NetizenCity`
        locationName = currentDistrict
      }

      // 3. Top Stamp Banner (Dynamically sized to text width)
      ctx.font = 'bold 13px sans-serif'
      const badgeTextWidth = ctx.measureText(locationBadge).width
      const bannerWidth = Math.max(180, badgeTextWidth + 32)
      ctx.fillStyle = 'rgba(52, 59, 53, 0.78)'
      ctx.beginPath()
      ctx.roundRect(pad + 16, pad + 16, bannerWidth, 34, 8)
      ctx.fill()
      ctx.fillStyle = '#FFFFFF'
      ctx.fillText(locationBadge, pad + 28, pad + 38)

      // 4. Polaroid Footer
      const footerY = pad + photoHeight + 36
      ctx.fillStyle = '#343B35'
      ctx.font = 'bold 22px "Trebuchet MS", sans-serif'
      ctx.fillText('NETIZENCITY', pad + 10, footerY)

      ctx.fillStyle = '#668B65'
      ctx.font = 'bold 14px sans-serif'
      ctx.fillText(
        `Warga: ${profile?.displayName || 'Warga Netizen'} (${profile?.ktnNumber || 'KTN-OFFICIAL'})`,
        pad + 10,
        footerY + 28
      )

      const dateStr = new Date().toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
      ctx.fillStyle = '#78634B'
      ctx.font = '12px sans-serif'
      ctx.fillText(`📅 ${dateStr} • ${locationSubtitle}`, pad + 10, footerY + 54)

      // Cute Mascot Stamp on right side of footer
      ctx.font = '36px sans-serif'
      ctx.fillText('🎩', canvasWidth - pad - 60, footerY + 20)
      ctx.font = 'bold 10px sans-serif'
      ctx.fillStyle = '#78634B'
      ctx.fillText('Pak Mayor Approved', canvasWidth - pad - 110, footerY + 45)

      const dataUrl = frameCanvas.toDataURL('image/png')
      setCapturedImage(dataUrl)
      setIsCapturing(false)

      addNotification({
        title: 'Foto Berhasil Diambil! 📸',
        message: `Foto Polaroid ${locationName} siap diunduh!`,
        type: 'success',
      })
    }, 250)
  }

  const handleDownload = () => {
    if (!capturedImage) return
    try {
      const a = document.createElement('a')
      a.href = capturedImage
      a.download = `NetizenCity_Foto_${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      setTimeout(() => {
        document.body.removeChild(a)
      }, 150)
    } catch {
      window.open(capturedImage, '_blank')
    }
  }

  return createPortal(
    <div className="font-sans">
      {/* Shutter Camera Flash Effect */}
      {shutterFlash && (
        <div className="fixed inset-0 z-[10001] bg-white pointer-events-none animate-out fade-out duration-200" />
      )}

      {/* PHOTO STUDIO CONTROLLER (Fixed floating overlay) */}
      {!capturedImage ? (
        <div className="fixed inset-x-0 bottom-6 z-[9990] flex flex-col items-center justify-end px-4 pointer-events-none select-none">
          {/* Top Bar Hint */}
          <div className="mb-3 bg-[#343B35]/90 backdrop-blur-md text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg border border-white/20 pointer-events-auto flex items-center space-x-2">
            <Camera className="w-3.5 h-3.5 text-amber-400" />
            <span>Mode Foto Bersama Alun-Alun</span>
            <button
              type="button"
              onClick={onClose}
              className="ml-2 hover:bg-white/20 rounded-full p-0.5 text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Controls Box */}
          <div className="bg-[#F7F4E9]/98 backdrop-blur-md border-2 border-[#D8CEBE] rounded-3xl p-3.5 sm:p-4 shadow-2xl max-w-lg w-full pointer-events-auto select-auto space-y-3 font-sans">
            {/* 1. POV Selector Buttons */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-extrabold text-[#78634B] uppercase tracking-wider flex items-center">
                  <Compass className="w-3 h-3 mr-1 text-[#668B65]" />
                  Pilih Sudut Pandang (POV)
                </span>
                <span className="text-[10px] text-[#668B65] font-bold">
                  {activePOV.toUpperCase()} MODE
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                <button
                  type="button"
                  onClick={() => handleSelectPOV('selfie')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center cursor-pointer ${
                    activePOV === 'selfie'
                      ? 'bg-[#668B65] text-white border-[#668B65] shadow-xs scale-102'
                      : 'bg-[#EFE9D8] text-[#343B35] border-[#D8CEBE] hover:bg-[#E5DEC9]'
                  }`}
                >
                  <span className="text-base">🤳</span>
                  <span className="text-[10px] mt-0.5">Selfie</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPOV('normal')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center cursor-pointer ${
                    activePOV === 'normal'
                      ? 'bg-[#668B65] text-white border-[#668B65] shadow-xs scale-102'
                      : 'bg-[#EFE9D8] text-[#343B35] border-[#D8CEBE] hover:bg-[#E5DEC9]'
                  }`}
                >
                  <span className="text-base">🏛️</span>
                  <span className="text-[10px] mt-0.5">Normal</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPOV('drone')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center cursor-pointer ${
                    activePOV === 'drone'
                      ? 'bg-[#668B65] text-white border-[#668B65] shadow-xs scale-102'
                      : 'bg-[#EFE9D8] text-[#343B35] border-[#D8CEBE] hover:bg-[#E5DEC9]'
                  }`}
                >
                  <span className="text-base">🚁</span>
                  <span className="text-[10px] mt-0.5">Drone</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectPOV('wide')}
                  className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center cursor-pointer ${
                    activePOV === 'wide'
                      ? 'bg-[#668B65] text-white border-[#668B65] shadow-xs scale-102'
                      : 'bg-[#EFE9D8] text-[#343B35] border-[#D8CEBE] hover:bg-[#E5DEC9]'
                  }`}
                >
                  <span className="text-base">📸</span>
                  <span className="text-[10px] mt-0.5">Wide Low</span>
                </button>
              </div>
            </div>

            {/* 2. Orbit & Zoom Fine Tuning Sliders */}
            <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#D8CEBE]/80 text-[11px] text-[#78634B]">
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold flex items-center">
                    <RotateCw className="w-3 h-3 mr-1" /> Putar Sudut
                  </span>
                  <span>{orbitAngle}°</span>
                </div>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  value={orbitAngle}
                  onChange={(e) => handleOrbitChange(Number(e.target.value))}
                  className="w-full accent-[#668B65] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <span className="font-bold flex items-center">
                    <ZoomIn className="w-3 h-3 mr-1" /> Jarak Zoom
                  </span>
                  <span>{zoomLevel}m</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="45"
                  value={zoomLevel}
                  onChange={(e) => handleZoomChange(Number(e.target.value))}
                  className="w-full accent-[#668B65] cursor-pointer"
                />
              </div>
            </div>

            {/* 3. SHUTTER BUTTON */}
            <div className="flex items-center justify-between pt-1">
              <Button variant="secondary" size="sm" onClick={onClose} className="text-xs cursor-pointer">
                Kembali
              </Button>

              <button
                type="button"
                onClick={handleShutter}
                disabled={isCapturing}
                className="relative group p-3.5 rounded-full bg-gradient-to-tr from-rose-500 via-amber-500 to-rose-400 text-white shadow-xl hover:scale-105 active:scale-95 transition-transform flex items-center justify-center border-4 border-white cursor-pointer disabled:opacity-50"
              >
                <Camera className="w-6 h-6 animate-pulse" />
                <span className="sr-only">Jepret Foto</span>
              </button>

              <div className="text-[10px] font-bold text-[#78634B] text-right">
                <span>Klik tombol</span>
                <br />
                <span className="text-[#343B35]">untuk foto</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* POLAROID PREVIEW MODAL (Rendered at top level via React Portal) */
        <div
          className="fixed inset-0 z-[9999] bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto pointer-events-auto select-auto"
          style={{ pointerEvents: 'auto' }}
        >
          <div
            className="bg-[#FFFDF9] border-2 border-[#D8CEBE] rounded-3xl p-4 sm:p-6 max-w-md w-full shadow-2xl space-y-4 font-sans text-center relative pointer-events-auto select-auto my-auto"
            style={{ pointerEvents: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Title & Close Icon */}
            <div className="flex items-center justify-between pb-2 border-b border-[#D8CEBE]">
              <h3 className="text-sm sm:text-base font-extrabold text-[#343B35] flex items-center">
                <Sparkles className="w-4 h-4 mr-1.5 text-amber-500" />
                Foto Polaroid Alun-Alun Berhasil!
              </h3>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-[#78634B] hover:text-[#343B35] hover:bg-[#EFE9D8] transition-colors cursor-pointer"
                title="Tutup Modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Captured Polaroid Image Preview */}
            <div className="relative rounded-2xl overflow-hidden border-2 border-[#D8CEBE] shadow-md bg-[#343B35] max-h-[55vh] flex items-center justify-center">
              <img
                src={capturedImage}
                alt="Hasil Foto Alun-Alun"
                className="w-full h-auto max-h-[55vh] object-contain"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-2 pt-1">
              <Button
                variant="primary"
                onClick={handleDownload}
                className="flex-1 font-bold text-xs shadow-md cursor-pointer pointer-events-auto py-2.5"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Unduh Foto (PNG)
              </Button>
              <Button
                variant="secondary"
                onClick={() => setCapturedImage(null)}
                className="text-xs font-bold shadow-xs cursor-pointer pointer-events-auto py-2.5"
              >
                Foto Ulang
              </Button>
              <Button
                variant="ghost"
                onClick={onClose}
                className="text-xs font-bold text-[#78634B] hover:bg-[#EFE9D8] cursor-pointer pointer-events-auto py-2.5"
              >
                Selesai
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  )
}
