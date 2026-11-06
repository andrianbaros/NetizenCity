// ============================================================
// NETIZENCITY - GameCanvas Component (Cozy Simulation Game Canvas)
// Supports Multi-Touch Pinch Zoom, Virtual Analog Joystick,
// Centered Modals (via React Portal), and Tugu Multiplayer Rooms (Max 10 per Room)
// ============================================================

'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { createPortal } from 'react-dom'
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
  Plus,
  Minus,
  Users,
  Check,
} from 'lucide-react'
import { City3DManager, TimeOfDay, CameraMode } from '@/game3d/City3DManager'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'

function getClientSessionId(): string {
  if (typeof window === 'undefined') return ''
  try {
    let id = sessionStorage.getItem('nc_citizen_session_id')
    if (!id) {
      id = 'client_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36).slice(-4)
      sessionStorage.setItem('nc_citizen_session_id', id)
    }
    return id
  } catch {
    return 'client_' + Math.random().toString(36).substring(2, 9)
  }
}

/**
 * Virtual Analog Joystick Component for Mobile Touch & Mouse Control
 */
function AnalogJoystick({
  onMove,
}: {
  onMove: (dir: { x: number; y: number } | null) => void
}) {
  const baseRef = useRef<HTMLDivElement>(null)
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const activePointerId = useRef<number | null>(null)

  const updateKnob = useCallback((clientX: number, clientY: number) => {
    if (!baseRef.current) return
    const rect = baseRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    const dx = clientX - centerX
    const dy = clientY - centerY
    const dist = Math.hypot(dx, dy)
    const maxRadius = Math.max(22, rect.width / 2 - 14)

    let clampedX = dx
    let clampedY = dy
    if (dist > maxRadius) {
      clampedX = (dx / dist) * maxRadius
      clampedY = (dy / dist) * maxRadius
    }

    setKnobPos({ x: clampedX, y: clampedY })
    // Send normalized proportional vector (-1.0 to 1.0)
    onMove({
      x: clampedX / maxRadius,
      y: clampedY / maxRadius,
    })
  }, [onMove])

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
    activePointerId.current = e.pointerId
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    updateKnob(e.clientX, e.clientY)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || e.pointerId !== activePointerId.current) return
    e.preventDefault()
    e.stopPropagation()
    updateKnob(e.clientX, e.clientY)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerId !== activePointerId.current) return
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    activePointerId.current = null
    setKnobPos({ x: 0, y: 0 })
    onMove(null)
  }

  return (
    <div
      ref={baseRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative w-22 h-22 sm:w-26 sm:h-26 rounded-full bg-[#F7F4E9]/95 border-2 border-[#D8CEBE] shadow-xl backdrop-blur-xs flex items-center justify-center touch-none select-none pointer-events-auto"
      title="Analog Joystick Karakter"
    >
      {/* Decorative concentric indicator */}
      <div className="absolute w-12 h-12 sm:w-14 sm:h-14 rounded-full border border-[#D8CEBE]/80 pointer-events-none" />
      <div className="absolute w-2 h-2 rounded-full bg-[#78634B]/30 pointer-events-none" />

      {/* Movable Knob */}
      <div
        className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#668B65] border-2 border-[#527251] shadow-md flex items-center justify-center pointer-events-none transition-transform duration-75"
        style={{
          transform: `translate3d(${knobPos.x}px, ${knobPos.y}px, 0)`,
        }}
      >
        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-white/40" />
      </div>
    </div>
  )
}

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const cityManagerRef = useRef<City3DManager | null>(null)

  const [mounted, setMounted] = useState(false)
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('noon')
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit')
  const [viewMode, setViewMode] = useState<'city' | 'tugu'>('city')
  const [showLandmarkMenu, setShowLandmarkMenu] = useState(false)
  const [showHelpHint, setShowHelpHint] = useState(false)
  const [tuguConfirmOpen, setTuguConfirmOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionMessage, setTransitionMessage] = useState('')
  const [selectedLandmarkInfo, setSelectedLandmarkInfo] = useState<{
    id: string
    name: string
    district: string
    type?: string
  } | null>(null)

  // Multiplayer Tugu Room State (Max 10 users per room)
  const [currentRoomId, setCurrentRoomId] = useState('1')
  const [roomUserCount, setRoomUserCount] = useState(1)
  const [roomPlayers, setRoomPlayers] = useState<
    Array<{
      id: string
      name: string
      isGuest: boolean
      x: number
      z: number
      facing: number
      avatarConfig?: any
    }>
  >([])
  const [allRooms, setAllRooms] = useState<
    Array<{ roomId: string; name: string; userCount: number; maxCapacity: number; isFull: boolean }>
  >([
    { roomId: '1', name: 'Ruang #1', userCount: 1, maxCapacity: 10, isFull: false },
  ])
  const [showRoomSwitcher, setShowRoomSwitcher] = useState(false)
  const [showRoster, setShowRoster] = useState(false)
  const myClientIdRef = useRef<string>('')
  const lastSentChatRef = useRef<string | null>(null)

  useEffect(() => {
    setMounted(true)
    myClientIdRef.current = getClientSessionId()
  }, [])

  // Listen to chat sent by local player to broadcast in Tugu room
  useEffect(() => {
    const onChatSent = (e: any) => {
      if (e.detail?.text) {
        lastSentChatRef.current = e.detail.text
      }
    }
    window.addEventListener('player-chat-sent', onChatSent)
    return () => window.removeEventListener('player-chat-sent', onChatSent)
  }, [])

  // Sync player position with Tugu room (Every 800ms while in Tugu mode)
  useEffect(() => {
    if (viewMode !== 'tugu') return

    const syncRoom = async () => {
      try {
        const clientId = myClientIdRef.current || getClientSessionId()
        myClientIdRef.current = clientId

        const profile = useCitizenStore.getState().profile
        const playerState = cityManagerRef.current?.getPlayerTuguState() || { x: 0, z: 12, facing: 0 }
        const body: any = {
          clientId,
          name: profile?.displayName || profile?.username || undefined,
          avatarConfig: profile?.avatarConfig || undefined,
          x: playerState.x,
          z: playerState.z,
          facing: playerState.facing,
          preferredRoomId: currentRoomId,
        }

        if (lastSentChatRef.current) {
          body.chatText = lastSentChatRef.current
          lastSentChatRef.current = null
        }

        const res = await fetch('/api/tugu/room', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (res.ok) {
          const data = await res.json()
          if (data.myClientId) {
            myClientIdRef.current = data.myClientId
          }
          if (data.roomId && data.roomId !== currentRoomId) {
            setCurrentRoomId(data.roomId)
          }
          if (typeof data.userCount === 'number') {
            setRoomUserCount((prev) => (prev === data.userCount ? prev : data.userCount))
          }
          if (data.allRooms) {
            setAllRooms((prev) => {
              if (
                prev.length === data.allRooms.length &&
                prev.every((r, i) => r.roomId === data.allRooms[i].roomId && r.userCount === data.allRooms[i].userCount)
              ) {
                return prev
              }
              return data.allRooms
            })
          }
          if (data.players) {
            setRoomPlayers((prev) => {
              if (
                prev.length === data.players.length &&
                prev.every((p, i) => p.id === data.players[i].id && p.name === data.players[i].name)
              ) {
                return prev
              }
              return data.players
            })
            cityManagerRef.current?.updateRemotePlayers(data.players, myClientIdRef.current)
          }
        }
      } catch {
        // ignore network hiccup
      }
    }

    // Initial sync and fast responsive room polling
    syncRoom()
    const interval = setInterval(syncRoom, 400)

    return () => {
      clearInterval(interval)
      // Leave room on exit
      const cid = myClientIdRef.current || (typeof window !== 'undefined' ? sessionStorage.getItem('nc_citizen_session_id') : '')
      if (cid) {
        fetch('/api/tugu/leave', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId: cid }),
        }).catch(() => {})
      }
    }
  }, [viewMode, currentRoomId])

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

  const handleAnalogMove = useCallback((dir: { x: number; y: number } | null) => {
    cityManagerRef.current?.setVirtualMovement(dir)
  }, [])

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#CDE7F0] font-sans">
      {/* 3D Canvas Mounting Point */}
      <div
        ref={containerRef}
        className="w-full h-full touch-none select-none cursor-grab active:cursor-grabbing outline-none"
      />

      {/* ============================================================ */}
      {/* TOP CANVAS CONTROLS (Time & Camera / Exit Tugu)              */}
      {/* ============================================================ */}
      <div className="absolute top-13 sm:top-16 left-2 sm:left-4 z-20 pointer-events-auto font-sans">
        {viewMode === 'tugu' ? (
          <button
            type="button"
            onClick={handleExitTugu}
            className="flex items-center space-x-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl bg-[#F7F4E9] hover:bg-[#EFE9D8] active:translate-y-0.5 border border-[#D8CEBE] text-[#343B35] font-bold text-[11px] sm:text-xs shadow-sm transition-transform cursor-pointer"
          >
            <Navigation className="w-3.5 h-3.5 text-[#668B65]" />
            <span>Kembali ke Kota</span>
          </button>
        ) : (
          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1.5">
            {/* 4-Segment Time of Day Control */}
            <div className="flex items-center bg-[#F7F4E9] p-0.5 rounded-xl border border-[#D8CEBE] shadow-xs shrink-0">
              <button
                type="button"
                onClick={() => handleTimeChange('morning')}
                title="Pagi"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  timeOfDay === 'morning'
                    ? 'bg-[#668B65] text-white shadow-xs'
                    : 'text-[#78634B] hover:bg-[#EFE9D8]'
                }`}
              >
                <Sunrise className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleTimeChange('noon')}
                title="Siang"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  timeOfDay === 'noon'
                    ? 'bg-[#668B65] text-white shadow-xs'
                    : 'text-[#78634B] hover:bg-[#EFE9D8]'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleTimeChange('sunset')}
                title="Sore"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  timeOfDay === 'sunset'
                    ? 'bg-[#668B65] text-white shadow-xs'
                    : 'text-[#78634B] hover:bg-[#EFE9D8]'
                }`}
              >
                <Sunset className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleTimeChange('night')}
                title="Malam"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                  timeOfDay === 'night'
                    ? 'bg-[#668B65] text-white shadow-xs'
                    : 'text-[#78634B] hover:bg-[#EFE9D8]'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Landmark Destination Switcher */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setShowLandmarkMenu(!showLandmarkMenu)}
                className="flex items-center space-x-1 sm:space-x-1.5 bg-[#F7F4E9] hover:bg-[#EFE9D8] text-[#343B35] px-2 sm:px-2.5 py-1.5 rounded-xl border border-[#D8CEBE] shadow-xs text-[11px] sm:text-xs font-semibold cursor-pointer transition-colors"
              >
                <Navigation className="w-3.5 h-3.5 text-[#668B65]" />
                <span className="hidden sm:inline">Tujuan Landmark</span>
                <span className="sm:hidden">Landmark</span>
                <ChevronDown className="w-3 h-3 text-[#78634B]" />
              </button>

              {showLandmarkMenu && (
                <div className="absolute top-full mt-1.5 left-0 w-56 bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl p-1.5 shadow-lg z-50 flex flex-col space-y-1">
                  <button
                    type="button"
                    onClick={() => handleFlyTo('monument')}
                    className="flex items-center space-x-2 text-left p-1.5 rounded-lg text-[#343B35] hover:bg-[#EFE9D8] transition-colors cursor-pointer"
                  >
                    <Landmark className="w-4 h-4 text-[#668B65] shrink-0" />
                    <div>
                      <div className="font-semibold text-xs text-[#668B65]">Alun-Alun Tugu</div>
                      <div className="text-[10px] text-[#78634B]">Pusat Kota &bull; Kunjungi Langsung</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFlyTo('city_hall')}
                    className="flex items-center space-x-2 text-left p-1.5 rounded-lg text-[#343B35] hover:bg-[#EFE9D8] transition-colors cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-[#78634B] shrink-0" />
                    <div>
                      <div className="font-semibold text-xs">Balai Kota Netizen</div>
                      <div className="text-[10px] text-[#78634B]">Pusat Administrasi &bull; Polling</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFlyTo('mall')}
                    className="flex items-center space-x-2 text-left p-1.5 rounded-lg text-[#343B35] hover:bg-[#EFE9D8] transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-4 h-4 text-[#78634B] shrink-0" />
                    <div>
                      <div className="font-semibold text-xs">Netizen Grand Mall</div>
                      <div className="text-[10px] text-[#78634B]">Kawasan Belanja Busana</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFlyTo('zoo')}
                    className="flex items-center space-x-2 text-left p-1.5 rounded-lg text-[#343B35] hover:bg-[#EFE9D8] transition-colors cursor-pointer"
                  >
                    <Dog className="w-4 h-4 text-[#78634B] shrink-0" />
                    <div>
                      <div className="font-semibold text-xs">Kebun Binatang Safari</div>
                      <div className="text-[10px] text-[#78634B]">Habitat Hewan Kota</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleFlyTo('nature_mountain')}
                    className="flex items-center space-x-2 text-left p-1.5 rounded-lg text-[#343B35] hover:bg-[#EFE9D8] transition-colors cursor-pointer"
                  >
                    <Mountain className="w-4 h-4 text-[#78634B] shrink-0" />
                    <div>
                      <div className="font-semibold text-xs">Gunung &amp; Air Terjun</div>
                      <div className="text-[10px] text-[#78634B]">Kawasan Wisata Alam</div>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* TUGU MULTIPLAYER ROOM STATUS & SWITCHER (Max 10 per room)     */}
      {/* ============================================================ */}
      {viewMode === 'tugu' && (
        <div className="absolute top-2 sm:top-3.5 left-1/2 -translate-x-1/2 z-30 pointer-events-auto flex items-center gap-1 sm:gap-1.5 shrink-0">
          {/* Room Switcher Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowRoomSwitcher(!showRoomSwitcher)
                setShowRoster(false)
              }}
              className="flex items-center space-x-1 bg-[#F7F4E9] hover:bg-[#EFE9D8] border border-[#D8CEBE] rounded-xl px-1.5 sm:px-3 py-1 sm:py-1.5 shadow-sm text-[10px] sm:text-xs font-semibold text-[#343B35] cursor-pointer transition-colors shrink-0"
            >
              <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#668B65]" />
              <span className="sm:hidden">R#{currentRoomId}</span>
              <span className="hidden sm:inline">Ruang #{currentRoomId}</span>
              <span className="text-[9px] sm:text-[11px] px-1 sm:px-1.5 py-0.2 rounded bg-[#668B65]/15 text-[#668B65] font-bold">
                {roomUserCount}/10
              </span>
              <ChevronDown className="w-3 h-3 text-[#78634B]" />
            </button>

            {showRoomSwitcher && (
              <div className="absolute top-full mt-1.5 left-0 sm:left-1/2 sm:-translate-x-1/2 w-60 bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl p-2 shadow-xl z-50 text-xs">
                <div className="font-bold text-[10px] text-[#78634B] px-2 py-1 uppercase tracking-wide border-b border-[#D8CEBE] mb-1">
                  Pilih Server Ruangan (Maks 10)
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {allRooms.map((r) => {
                    const isCurrent = r.roomId === currentRoomId
                    return (
                      <button
                        key={r.roomId}
                        type="button"
                        disabled={r.isFull && !isCurrent}
                        onClick={() => {
                          setCurrentRoomId(r.roomId)
                          setShowRoomSwitcher(false)
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors cursor-pointer ${
                          isCurrent
                            ? 'bg-[#668B65] text-white font-bold'
                            : r.isFull
                            ? 'bg-[#EFE9D8]/50 text-[#78634B]/50 cursor-not-allowed'
                            : 'hover:bg-[#EFE9D8] text-[#343B35]'
                        }`}
                      >
                        <span className="flex items-center gap-1.5">
                          {isCurrent && <Check className="w-3 h-3 text-white" />}
                          {r.name}
                        </span>
                        <span className={`text-[10px] font-semibold ${isCurrent ? 'text-white' : 'text-[#78634B]'}`}>
                          {r.isFull ? 'Penuh (10/10)' : `${r.userCount}/10 Warga`}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Citizen Roster in Room Pill */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowRoster(!showRoster)
                setShowRoomSwitcher(false)
              }}
              className="flex items-center space-x-1 bg-[#F7F4E9] hover:bg-[#EFE9D8] border border-[#D8CEBE] rounded-xl px-1.5 sm:px-2.5 py-1 sm:py-1.5 shadow-sm text-[10px] sm:text-xs font-semibold text-[#343B35] cursor-pointer transition-colors shrink-0"
              title="Lihat warga di sekitar"
            >
              <Users className="w-3.5 h-3.5 text-[#668B65]" />
              <span className="hidden sm:inline">Warga:</span>
              <span className="text-[9px] sm:text-[11px] px-1 sm:px-1.5 py-0.2 rounded bg-[#668B65]/15 text-[#668B65] font-bold">
                {roomPlayers.length || roomUserCount}
              </span>
            </button>

            {showRoster && (
              <div className="absolute top-full mt-1.5 right-0 sm:left-1/2 sm:-translate-x-1/2 w-64 bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl p-2.5 shadow-xl z-50 text-xs">
                <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#D8CEBE]">
                  <span className="font-bold text-[11px] text-[#78634B] uppercase tracking-wide flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#668B65]" /> Warga di Ruang #{currentRoomId}
                  </span>
                  <button
                    onClick={() => setShowRoster(false)}
                    className="text-[#78634B] hover:text-[#343B35] p-0.5 rounded cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {roomPlayers.length === 0 ? (
                    <div className="text-[11px] text-[#78634B] py-1 text-center">Menghubungkan warga...</div>
                  ) : (
                    roomPlayers.map((p) => {
                      const isMe = p.id === myClientIdRef.current
                      return (
                        <div
                          key={p.id}
                          className={`flex items-center justify-between px-2 py-1.5 rounded-lg ${
                            isMe ? 'bg-[#668B65]/15 font-bold text-[#343B35]' : 'bg-[#EFE9D8]/60 text-[#343B35]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <span className="w-2 h-2 rounded-full bg-[#22C55E] shrink-0" />
                            <span className="truncate">{p.name}</span>
                            {isMe && (
                              <span className="text-[9px] px-1 py-0.2 rounded bg-[#668B65] text-white uppercase shrink-0">
                                Kamu
                              </span>
                            )}
                          </div>
                          {!isMe && (
                            <span className="text-[10px] text-[#668B65] font-semibold shrink-0">
                              🟢 Online
                            </span>
                          )}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TACTILE ON-SCREEN ZOOM BUTTONS                               */}
      {/* ============================================================ */}
      <div className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 flex flex-col space-y-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F7F4E9] hover:bg-[#EFE9D8] active:translate-y-0.5 border border-[#D8CEBE] shadow-sm flex items-center justify-center text-[#343B35] cursor-pointer transition-transform"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#F7F4E9] hover:bg-[#EFE9D8] active:translate-y-0.5 border border-[#D8CEBE] shadow-sm flex items-center justify-center text-[#343B35] cursor-pointer transition-transform"
        >
          <Minus className="w-4 h-4" />
        </button>
      </div>

      {/* ============================================================ */}
      {/* VIRTUAL ANALOG JOYSTICK (Tugu Mode on Touch/Mobile Screens)  */}
      {/* ============================================================ */}
      {viewMode === 'tugu' && (
        <div className="absolute bottom-5 sm:bottom-6 left-3 sm:left-6 z-30 pointer-events-auto">
          <AnalogJoystick onMove={handleAnalogMove} />
        </div>
      )}

      {/* ============================================================ */}
      {/* COMPACT PLAYER GUIDANCE PANEL                                */}
      {/* ============================================================ */}
      <div
        className={`absolute z-20 pointer-events-auto font-sans ${
          viewMode === 'tugu'
            ? 'bottom-16 sm:bottom-5 right-3 sm:right-4'
            : 'bottom-4 sm:bottom-5 right-3 sm:right-4'
        }`}
      >
        {showHelpHint ? (
          <div className="w-64 sm:w-72 bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl p-2.5 shadow-lg text-[11px] text-[#343B35]">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#D8CEBE] mb-1.5">
              <span className="font-bold text-xs flex items-center gap-1.5 text-[#343B35]">
                <Info className="w-3.5 h-3.5 text-[#668B65]" />
                {viewMode === 'city' ? 'Panduan Kota 3D' : 'Panduan Alun-Alun'}
              </span>
              <button
                type="button"
                onClick={() => setShowHelpHint(false)}
                className="text-[#78634B] hover:text-[#343B35] p-0.5 rounded cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1 text-[#78634B]">
              {viewMode === 'city' ? (
                <>
                  <div>• <strong className="text-[#343B35]">Geser 1 Jari / Mouse:</strong> Putar orbit kota</div>
                  <div>• <strong className="text-[#343B35]">Cubit 2 Jari / Scroll:</strong> Zoom in &amp; out</div>
                  <div>• <strong className="text-[#343B35]">Geser 2 Jari:</strong> Pindah pandangan kamera</div>
                  <div>• <strong className="text-[#343B35]">Klik Landmark / Tugu:</strong> Kunjungi Alun-Alun Warga</div>
                </>
              ) : (
                <>
                  <div>• <strong className="text-[#343B35]">Analog / WASD:</strong> Gerakkan karakter 360°</div>
                  <div>• <strong className="text-[#343B35]">Obrolan Kota:</strong> Mengobrol bersama warga satu ruangan</div>
                  <div>• <strong className="text-[#343B35]">Ruangan:</strong> Maksimal 10 warga per ruangan</div>
                </>
              )}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowHelpHint(true)}
            className="flex items-center space-x-1.5 bg-[#F7F4E9] hover:bg-[#EFE9D8] border border-[#D8CEBE] rounded-xl px-2.5 py-1 text-[11px] font-semibold text-[#343B35] shadow-sm cursor-pointer transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-[#668B65]" />
            <span>Panduan</span>
          </button>
        )}
      </div>

      {/* ============================================================ */}
      {/* FLOATING LANDMARK INFO POPUP (Rendered via Portal, Centered)  */}
      {/* ============================================================ */}
      {mounted && selectedLandmarkInfo && viewMode === 'city' && createPortal(
        <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-[#343B35]/25 backdrop-blur-xs font-sans">
          <div
            className="w-full max-w-sm bg-[#F7F4E9] border border-[#D8CEBE] rounded-2xl p-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-center space-x-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-[#668B65] shrink-0">
                  <Landmark className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[#668B65] bg-[#668B65]/15 px-1.5 py-0.2 rounded border border-[#668B65]/30">
                    {selectedLandmarkInfo.district}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-[#343B35] mt-0.5 truncate">
                    {selectedLandmarkInfo.name}
                  </h4>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLandmarkInfo(null)}
                className="p-1 rounded-lg text-[#78634B] hover:text-[#343B35] hover:bg-[#EFE9D8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#78634B] mt-2 leading-relaxed">
              Titik landmark kota terdaftar. Klik tombol di bawah untuk mengarahkan kamera ke lokasi ini.
            </p>

            <div className="mt-3 pt-2.5 border-t border-[#D8CEBE] flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setSelectedLandmarkInfo(null)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#343B35] bg-[#EFE9D8] hover:bg-[#E2DACB] border border-[#D8CEBE] transition-colors cursor-pointer"
              >
                Tutup
              </button>
              <button
                type="button"
                onClick={() => {
                  cityManagerRef.current?.flyToLandmark(selectedLandmarkInfo.id)
                  setSelectedLandmarkInfo(null)
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#668B65] hover:bg-[#557754] text-white font-semibold text-xs border border-[#557754] flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                <span>Arahkan Kamera</span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================ */}
      {/* POPUP MODAL: "MAU MENGUNJUNGI TUGU?" (Rendered via Portal)   */}
      {/* ============================================================ */}
      {mounted && tuguConfirmOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#343B35]/50 backdrop-blur-xs font-sans">
          <div
            className="w-full max-w-sm bg-[#F7F4E9] border border-[#D8CEBE] rounded-2xl p-4 sm:p-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-[#668B65]">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#343B35]">
                    Kunjungi Alun-Alun Tugu?
                  </h3>
                  <span className="text-[10px] text-[#668B65] font-semibold bg-[#668B65]/15 px-1.5 py-0.2 rounded border border-[#668B65]/30">
                    Pusat Komunitas
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTuguConfirmOpen(false)}
                className="text-[#78634B] hover:text-[#343B35] p-1 rounded-lg hover:bg-[#EFE9D8] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#78634B] leading-relaxed mb-4">
              Masuk ke area khusus Alun-Alun Tugu untuk mengendalikan karaktermu secara bebas dengan analog joystick, mengobrol langsung, dan berkumpul dengan sesama warga dalam ruangan komunitas (maksimal 10 warga per ruangan).
            </p>

            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setTuguConfirmOpen(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#343B35] bg-[#EFE9D8] hover:bg-[#E2DACB] border border-[#D8CEBE] transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleEnterTugu}
                className="px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#668B65] hover:bg-[#557754] border border-[#557754] shadow-sm flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <span>Masuk Sekarang</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ============================================================ */}
      {/* MAP TRANSITION LOADING SCREEN                                */}
      {/* ============================================================ */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#343B35]/90 backdrop-blur-sm text-white font-sans animate-in fade-in">
          <div className="w-12 h-12 rounded-2xl bg-[#EFE9D8] border border-[#D8CEBE] flex items-center justify-center text-[#668B65] mb-3 shadow-md animate-bounce">
            <Compass className="w-6 h-6" />
          </div>
          <h2 className="text-sm sm:text-base font-bold tracking-wide text-[#F7F4E9] mb-1">
            {transitionMessage}
          </h2>
          <p className="text-xs text-[#A9C9D8] font-normal text-center max-w-xs">
            {transitionMessage.includes('Alun-Alun')
              ? 'Menghubungkan ke server ruangan Alun-Alun Tugu...'
              : 'Memuat peta diorama 3D kota utama...'}
          </p>
          <div className="w-36 h-1 bg-white/20 rounded-full mt-3 overflow-hidden">
            <div className="w-full h-full bg-[#668B65] rounded-full animate-pulse" />
          </div>
        </div>
      )}
    </div>
  )
}
