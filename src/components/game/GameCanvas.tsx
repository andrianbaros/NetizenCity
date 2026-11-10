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
  ChevronUp,
  ChevronLeft,
  ChevronRight,
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
  Fish,
  Waves,
  Trophy,
  Zap,
  Flame,
  RotateCcw,
} from 'lucide-react'
import {
  City3DManager,
  TimeOfDay,
  CameraMode,
  RiverFishCatch,
  FishingState,
} from '@/game3d/City3DManager'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'
import { useGameStore, ViewMode } from '@/lib/stores/useGameStore'
import { useUIStore } from '@/lib/stores/useUIStore'
import { getFishingRodById } from '@/lib/inventory/rodDefinitions'

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
  const knobRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const activePointerId = useRef<number | null>(null)

  const updateKnob = useCallback((clientX: number, clientY: number) => {
    if (!baseRef.current || !knobRef.current) return
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

    // Direct hardware-accelerated transform with zero CSS transition or React state latency
    knobRef.current.style.transform = `translate3d(${clampedX}px, ${clampedY}px, 0)`

    // Send normalized proportional vector (-1.0 to 1.0) instantly
    onMove({
      x: clampedX / maxRadius,
      y: clampedY / maxRadius,
    })
  }, [onMove])

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isDraggingRef.current = true
    activePointerId.current = e.pointerId
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    updateKnob(e.clientX, e.clientY)
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || e.pointerId !== activePointerId.current) return
    e.preventDefault()
    e.stopPropagation()
    updateKnob(e.clientX, e.clientY)
  }

  const handlePointerUp = (e: React.PointerEvent) => {
    if (e.pointerId !== activePointerId.current) return
    e.preventDefault()
    e.stopPropagation()
    isDraggingRef.current = false
    activePointerId.current = null
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate3d(0px, 0px, 0)'
    }
    onMove(null)
  }

  return (
    <div
      ref={baseRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#F7F4E9]/95 border-2 border-[#D8CEBE] shadow-xl backdrop-blur-xs flex items-center justify-center touch-none select-none pointer-events-auto cursor-grab active:cursor-grabbing"
      title="Analog Joystick Karakter (Sentuh & Gerakkan)"
    >
      {/* Decorative concentric indicator */}
      <div className="absolute w-10 h-10 sm:w-12 sm:h-12 rounded-full border border-[#D8CEBE]/80 pointer-events-none" />
      <div className="absolute w-2 h-2 rounded-full bg-[#78634B]/30 pointer-events-none" />

      {/* Movable Knob (Zero-latency direct 1:1 hardware transform) */}
      <div
        ref={knobRef}
        className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-[#668B65] border-2 border-[#527251] shadow-md flex items-center justify-center pointer-events-none will-change-transform"
      >
        <div className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full bg-white/40" />
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
  const [viewMode, setViewMode] = useState<ViewMode>('city')
  const [showLandmarkMenu, setShowLandmarkMenu] = useState(false)
  const [showHelpHint, setShowHelpHint] = useState(false)
  const [tuguConfirmOpen, setTuguConfirmOpen] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [transitionMessage, setTransitionMessage] = useState('')

  // 3D River Map Fishing States
  const [fishingState, setFishingState] = useState<FishingState>('idle')
  const [reelProgress, setReelProgress] = useState(0)
  const [caughtFish, setCaughtFish] = useState<RiverFishCatch | null>(null)
  const [isAutoFishing, setIsAutoFishing] = useState(false)
  const [autoCatchCount, setAutoCatchCount] = useState(0)
  const autoFishingTimerRef = useRef<NodeJS.Timeout | null>(null)
  const [selectedLandmarkInfo, setSelectedLandmarkInfo] = useState<{
    id: string
    name: string
    district: string
    type?: string
  } | null>(null)

  // 3D Stadium Penalty Shootout Score & Feedback State
  const [stadiumScore, setStadiumScore] = useState<{
    goals: number
    shots: number
    streak: number
    history: Array<'goal' | 'saved'>
  }>({
    goals: 0,
    shots: 0,
    streak: 0,
    history: [],
  })

  const [stadiumFeedback, setStadiumFeedback] = useState<{
    isGoal: boolean
    title: string
    subtitle: string
    coinsAwarded?: number
  } | null>(null)

  const [isShootingFreekick, setIsShootingFreekick] = useState(false)

  const handleResetStadiumScore = () => {
    setStadiumScore({
      goals: 0,
      shots: 0,
      streak: 0,
      history: [],
    })
    cityManagerRef.current?.setStadiumScore3D(0, 0)
    useUIStore.getState().addNotification({
      title: 'Skor Direset ⚽',
      message: 'Mulai sesi tantangan adu penalti baru!',
      type: 'info',
    })
  }

  // Multiplayer Room State from Zustand Store (Alun-Alun Tugu & Sungai Dermaga Pancing)
  const currentRoomId = useGameStore((s) => s.currentRoomId)
  const setCurrentRoomId = useGameStore((s) => s.setCurrentRoomId)
  const roomUserCount = useGameStore((s) => s.roomUserCount)
  const setRoomUserCount = useGameStore((s) => s.setRoomUserCount)
  const allRooms = useGameStore((s) => s.allRooms)
  const setAllRooms = useGameStore((s) => s.setAllRooms)
  const roomPlayers = useGameStore((s) => s.roomPlayers)
  const setRoomPlayers = useGameStore((s) => s.setRoomPlayers)

  const myClientIdRef = useRef<string>('')
  const lastSentChatRef = useRef<{ text: string; id: string } | null>(null)
  const fastSyncTriggerRef = useRef<(() => void) | null>(null)
  const isSyncingRef = useRef(false)
  const lastSyncReqTimeRef = useRef(0)
  const fishingStateRef = useRef<FishingState>(fishingState)

  useEffect(() => {
    fishingStateRef.current = fishingState
    // When fishing state transitions, flush update to server immediately without disconnecting from room!
    if (fastSyncTriggerRef.current) {
      fastSyncTriggerRef.current()
    }
  }, [fishingState])

  const inventory = useCitizenStore((s) => s.inventory)

  // Synchronize equipped rod with 3D City3DManager in river area
  useEffect(() => {
    if (!cityManagerRef.current) return
    const equipped = inventory.find(
      (item) =>
        Boolean(item.isEquipped || (item as any).is_equipped) &&
        ((item.itemId || (item as any).item_id || '').startsWith('rod_') || item.category === 'tools')
    )
    if (equipped) {
      const rodId = equipped.itemId || (equipped as any).item_id
      const rodDef = getFishingRodById(rodId)
      cityManagerRef.current.updateEquippedRod(rodDef)
    } else {
      cityManagerRef.current.updateEquippedRod(null)
    }
  }, [inventory])

  useEffect(() => {
    setMounted(true)
    myClientIdRef.current = getClientSessionId()
  }, [])

  // Listen to chat sent by local player to broadcast in Tugu & River rooms
  useEffect(() => {
    const onChatSent = (e: any) => {
      if (e.detail?.text) {
        lastSentChatRef.current = {
          text: e.detail.text,
          id: e.detail.id || `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        }
        if (fastSyncTriggerRef.current) {
          fastSyncTriggerRef.current()
        }
      }
    }
    window.addEventListener('player-chat-sent', onChatSent)
    return () => window.removeEventListener('player-chat-sent', onChatSent)
  }, [])

  // Sync player position with Tugu, River & Beach pier rooms (Adaptive, sequential, prevents out-of-order jitter & lag)
  useEffect(() => {
    if (viewMode !== 'tugu' && viewMode !== 'river' && viewMode !== 'beach') return

    let isMounted = true
    let syncTimeout: NodeJS.Timeout | null = null
    const isRiver = viewMode === 'river'
    const isBeach = viewMode === 'beach'
    const isFishingArea = isRiver || isBeach
    const syncEndpoint = isBeach ? '/api/beach/room' : isRiver ? '/api/river/room' : '/api/tugu/room'
    const leaveEndpoint = isBeach ? '/api/beach/leave' : isRiver ? '/api/river/leave' : '/api/tugu/leave'

    const syncRoom = async () => {
      if (isSyncingRef.current) return
      isSyncingRef.current = true
      const reqStart = Date.now()

      try {
        const clientId = myClientIdRef.current || getClientSessionId()
        myClientIdRef.current = clientId

        const profile = useCitizenStore.getState().profile
        const playerState = cityManagerRef.current?.getPlayerTuguState() || { x: 0, z: isFishingArea ? -5.5 : 12, facing: 0, isMoving: false }
        const isFishingNow = isFishingArea ? fishingStateRef.current !== 'idle' : false
        const body: any = {
          clientId,
          name: profile?.displayName || profile?.username || undefined,
          avatarConfig: profile?.avatarConfig || undefined,
          x: playerState.x,
          z: playerState.z,
          facing: playerState.facing,
          isMoving: Boolean(playerState.isMoving),
          preferredRoomId: currentRoomId,
          isFishing: isFishingNow,
        }

        const chatToSend = lastSentChatRef.current
        if (chatToSend) {
          body.chatText = chatToSend.text
          body.chatId = chatToSend.id
        }

        const res = await fetch(syncEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        })

        if (!isMounted) return

        if (res.ok) {
          if (chatToSend && lastSentChatRef.current?.id === chatToSend.id) {
            lastSentChatRef.current = null
          }

          if (reqStart < lastSyncReqTimeRef.current) {
            // Discard out-of-order response
            return
          }
          lastSyncReqTimeRef.current = reqStart

          const data = await res.json()
          if (data.myClientId) {
            myClientIdRef.current = data.myClientId
          }
          if (data.roomId && data.roomId !== currentRoomId) {
            setCurrentRoomId(data.roomId)
          }
          if (typeof data.userCount === 'number') {
            setRoomUserCount(data.userCount)
          }
          if (data.allRooms) {
            setAllRooms(data.allRooms)
          }
          if (data.players) {
            setRoomPlayers(data.players)
            cityManagerRef.current?.updateRemotePlayers(data.players, myClientIdRef.current)
          }
        }
      } catch {
        // ignore network hiccup
      } finally {
        isSyncingRef.current = false
        if (isMounted) {
          syncTimeout = setTimeout(syncRoom, 110)
        }
      }
    }

    fastSyncTriggerRef.current = () => {
      if (syncTimeout) {
        clearTimeout(syncTimeout)
        syncTimeout = null
      }
      if (!isSyncingRef.current && isMounted) {
        syncRoom()
      }
    }

    // Initial sync
    syncRoom()

    return () => {
      isMounted = false
      fastSyncTriggerRef.current = null
      if (syncTimeout) clearTimeout(syncTimeout)
      isSyncingRef.current = false
      // Leave room on exit
      const cid = myClientIdRef.current || (typeof window !== 'undefined' ? sessionStorage.getItem('nc_citizen_session_id') : '')
      if (cid) {
        fetch(leaveEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clientId: cid }),
        }).catch(() => {})
      }
    }
  }, [viewMode, currentRoomId, setCurrentRoomId, setRoomUserCount, setAllRooms, setRoomPlayers])

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
      useGameStore.getState().setViewMode(mode)
      if (mode === 'tugu') {
        setSelectedLandmarkInfo(null)
      }
    }
    const onLandmarkSelected = (_e: CustomEvent) => {
      // Direct 3D taps open BuildingModal directly; clear any floating destination card
      setSelectedLandmarkInfo(null)
    }
    const onTimeChanged = (e: CustomEvent) => {
      const t = e.detail?.time
      if (t) setTimeOfDay(t)
    }

    const onEnterRiver = () => {
      setSelectedLandmarkInfo(null)
      setIsTransitioning(true)
      setTransitionMessage('Memuat Sungai Kali Netizen & Dermaga Pancing...')
      setTimeout(() => {
        cityManagerRef.current?.enterRiverArea()
        setViewMode('river')
        useGameStore.getState().setViewMode('river')
        useGameStore.getState().setSelectedBuilding('river_spot')
        useGameStore.getState().setCurrentDistrict('Kawasan Alam')
        setTimeout(() => {
          setIsTransitioning(false)
        }, 400)
      }, 450)
    }

    const onExitRiver = () => {
      setIsTransitioning(true)
      setTransitionMessage('Kembali ke Kota Utama...')
      setTimeout(() => {
        cityManagerRef.current?.exitRiverArea()
        setViewMode('city')
        useGameStore.getState().setViewMode('city')
        useGameStore.getState().setSelectedBuilding(null)
        useGameStore.getState().setCurrentDistrict('town_square')
        setTimeout(() => {
          setIsTransitioning(false)
        }, 400)
      }, 450)
    }

    const onRiverModeChanged = (e: CustomEvent) => {
      const mode = e.detail?.mode || 'city'
      setViewMode(mode)
      useGameStore.getState().setViewMode(mode)
      if (mode === 'river') {
        setSelectedLandmarkInfo(null)
      }
    }

    const onEnterStadium = () => {
      setIsTransitioning(true)
      setTransitionMessage('Memasuki Lapangan Stadion Gelora Netizen 🏟️...')
      setTimeout(() => {
        cityManagerRef.current?.enterStadiumArea()
        setViewMode('stadium')
        useGameStore.getState().setViewMode('stadium')
        useGameStore.getState().setSelectedBuilding('sports_stadium')
        useGameStore.getState().setCurrentDistrict('Kawasan Olahraga')
        setTimeout(() => {
          setIsTransitioning(false)
        }, 400)
      }, 450)
    }

    const onExitStadium = () => {
      setIsTransitioning(true)
      setTransitionMessage('Kembali ke Kota Utama...')
      setTimeout(() => {
        cityManagerRef.current?.exitStadiumArea()
        setViewMode('city')
        useGameStore.getState().setViewMode('city')
        useGameStore.getState().setSelectedBuilding(null)
        useGameStore.getState().setCurrentDistrict('town_square')
        setTimeout(() => {
          setIsTransitioning(false)
        }, 400)
      }, 450)
    }

    const onStadiumModeChanged = (e: CustomEvent) => {
      const mode = e.detail?.mode || 'city'
      setViewMode(mode)
      useGameStore.getState().setViewMode(mode)
      if (mode === 'stadium') {
        setSelectedLandmarkInfo(null)
      }
    }

    const playStadiumSynthAudio = (type: 'kick' | 'goal' | 'save') => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        if (!AudioCtx) return
        const ctx = new AudioCtx()

        if (type === 'kick') {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'triangle'
          osc.frequency.setValueAtTime(140, ctx.currentTime)
          osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + 0.15)
          gain.gain.setValueAtTime(0.35, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + 0.15)
        } else if (type === 'save') {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(220, ctx.currentTime)
          osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.2)
          gain.gain.setValueAtTime(0.4, ctx.currentTime)
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start()
          osc.stop(ctx.currentTime + 0.2)
        } else if (type === 'goal') {
          // Referee Whistle
          const whistleOsc = ctx.createOscillator()
          const whistleGain = ctx.createGain()
          whistleOsc.type = 'sine'
          whistleOsc.frequency.setValueAtTime(2400, ctx.currentTime)
          whistleOsc.frequency.exponentialRampToValueAtTime(2600, ctx.currentTime + 0.25)
          whistleGain.gain.setValueAtTime(0.22, ctx.currentTime)
          whistleGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3)
          whistleOsc.connect(whistleGain)
          whistleGain.connect(ctx.destination)
          whistleOsc.start()
          whistleOsc.stop(ctx.currentTime + 0.3)

          // Celebratory stadium chime chord (C, E, G, High C)
          const freqs = [523.25, 659.25, 783.99, 1046.5]
          freqs.forEach((freq, idx) => {
            const chordOsc = ctx.createOscillator()
            const chordGain = ctx.createGain()
            chordOsc.type = 'triangle'
            chordOsc.frequency.setValueAtTime(freq, ctx.currentTime + 0.08)
            chordGain.gain.setValueAtTime(0.12, ctx.currentTime + 0.08)
            chordGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.75 + idx * 0.1)
            chordOsc.connect(chordGain)
            chordGain.connect(ctx.destination)
            chordOsc.start(ctx.currentTime + 0.08)
            chordOsc.stop(ctx.currentTime + 0.75 + idx * 0.1)
          })
        }
      } catch {}
    }

    const onStadiumBallKicked = () => {
      setIsShootingFreekick(true)
      playStadiumSynthAudio('kick')
    }

    const onStadiumFreekickResult = (e: any) => {
      const { isGoal, saveType } = e.detail || {}
      setIsShootingFreekick(false)

      if (isGoal) {
        playStadiumSynthAudio('goal')

        // Optimistically update wallet balance (+20 Netizen Coins per goal)
        const curWallet = useCitizenStore.getState().wallet
        const currentBalance = curWallet?.balance ?? 0
        useCitizenStore.getState().updateBalance(currentBalance + 20)

        // Persist reward to database via /api/economy
        fetch('/api/economy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'earn',
            amount: 20,
            currentBalance: currentBalance,
            description: 'Hadiah cetak gol penalti di Stadion Netizen City',
          }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.wallet?.balance !== undefined) {
              useCitizenStore.getState().updateBalance(data.wallet.balance)
            }
          })
          .catch(() => {})

        useUIStore.getState().addNotification({
          title: 'GOOOLLL!! ⚽🔥',
          message: '+20 Koin Hadiah Gol masuk ke dompetmu!',
          type: 'success',
        })
        setStadiumScore((prev) => {
          const newGoals = prev.goals + 1
          const newShots = prev.shots + 1
          const newStreak = prev.streak + 1
          cityManagerRef.current?.setStadiumScore3D(newGoals, newShots)
          return {
            goals: newGoals,
            shots: newShots,
            streak: newStreak,
            history: [...prev.history.slice(-4), 'goal'],
          }
        })
        setStadiumFeedback({
          isGoal: true,
          title: 'GOOOLLL!! ⚽🔥',
          subtitle: 'Tendangan Spektakuler Membobol Gawang!',
          coinsAwarded: 20,
        })
      } else {
        playStadiumSynthAudio('save')
        const isCatch = saveType === 'catch'
        setStadiumScore((prev) => {
          const newShots = prev.shots + 1
          cityManagerRef.current?.setStadiumScore3D(prev.goals, newShots)
          return {
            ...prev,
            shots: newShots,
            streak: 0,
            history: [...prev.history.slice(-4), 'saved'],
          }
        })
        setStadiumFeedback({
          isGoal: false,
          title: isCatch ? 'DITANGKAP KIPER! 🧤' : 'DITEPAK KIPER! 🧤',
          subtitle: isCatch
            ? 'Kiper membaca arah bola dan menangkapnya dengan erat!'
            : 'Penyelamatan akrobatik! Bola ditepak menjauhi gawang!',
        })
      }

      setTimeout(() => {
        setStadiumFeedback(null)
      }, 2600)
    }

    const onEnterBeach = () => {
      setSelectedLandmarkInfo(null)
      setIsTransitioning(true)
      setTransitionMessage('Memuat Pantai Netizen Beach 🏖️...')
      setTimeout(() => {
        cityManagerRef.current?.enterBeachArea()
        setViewMode('beach')
        useGameStore.getState().setViewMode('beach')
        useGameStore.getState().setSelectedBuilding('netizen_beach')
        useGameStore.getState().setCurrentDistrict('Pantai Netizen Beach')
        setTimeout(() => {
          setIsTransitioning(false)
        }, 400)
      }, 450)
    }

    const onExitBeach = () => {
      setIsTransitioning(true)
      setTransitionMessage('Kembali ke Kota Utama...')
      setTimeout(() => {
        cityManagerRef.current?.exitBeachArea()
        setViewMode('city')
        useGameStore.getState().setViewMode('city')
        useGameStore.getState().setSelectedBuilding(null)
        useGameStore.getState().setCurrentDistrict('town_square')
        setTimeout(() => {
          setIsTransitioning(false)
        }, 400)
      }, 450)
    }

    const onBeachModeChanged = (e: CustomEvent) => {
      const mode = e.detail?.mode || 'city'
      setViewMode(mode)
      useGameStore.getState().setViewMode(mode)
      if (mode === 'beach') {
        setSelectedLandmarkInfo(null)
      }
    }

    const onRiverFishingState = (e: CustomEvent) => {
      if (e.detail?.state) {
        setFishingState(e.detail.state)
      }
      if (typeof e.detail?.progress === 'number') {
        setReelProgress(e.detail.progress)
      }
      if (e.detail?.fish) {
        setCaughtFish(e.detail.fish)
      }
    }

    const onRiverFishCaught = (e: CustomEvent) => {
      const fish = e.detail?.fish as RiverFishCatch
      if (fish) {
        const addToInventory = useCitizenStore.getState().addToInventory
        const setInventory = useCitizenStore.getState().setInventory
        const profile = useCitizenStore.getState().profile
        const addNotification = useUIStore.getState().addNotification

        // Optimistically add individual catch to citizen backpack inventory
        const tempId = 'fish-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6)
        addToInventory({
          id: tempId,
          citizenId: profile?.id || 'citizen',
          itemId: fish.id || 'fish_' + fish.name.toLowerCase().replace(/[^a-z0-9]/g, '_'),
          name: fish.name,
          category: 'fish',
          weight: fish.weight,
          speciesId: fish.id,
          rarity: fish.rarity as any,
          sellPrice: fish.rewardCoins,
          icon: fish.icon || '🐟',
          isEquipped: false,
          isFavorite: false,
          caughtLocation: 'Sungai Kali Netizen',
          caughtTimestamp: new Date().toISOString(),
          acquiredAt: new Date().toISOString(),
          description:
            fish.desc ||
            `Tangkapan segar dari Sungai Kali Netizen dengan bobot ${fish.weight} kg.`,
        })

        // Persist individual fish catch to local DB / API
        fetch('/api/inventory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add_fish', fish }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .then((data) => {
            if (data?.inventory && Array.isArray(data.inventory) && data.inventory.length > 0) {
              const currentInv = useCitizenStore.getState().inventory || []
              const serverIds = new Set(data.inventory.map((i: any) => i.id))
              const remainingLocal = currentInv.filter((i: any) => i && i.id && !serverIds.has(i.id) && i.id !== tempId)
              setInventory([...data.inventory, ...remainingLocal])
            }
          })
          .catch(() => {})

        addNotification({
          title: `Berhasil Menangkap ${fish.name}! 🎣`,
          message: `Bobot: ${fish.weight} kg • Masuk ke Tas Barang (Nilai Jual: +${fish.rewardCoins} Koin)!`,
          type: 'success',
        })
      }
    }

    const onFishingNoRod = (e: CustomEvent) => {
      const addNotification = useUIStore.getState().addNotification
      const openModal = useUIStore.getState().openModal
      setIsAutoFishing(false)
      addNotification({
        title: 'Perlu Joran Pancing! 🎣',
        message:
          e.detail?.message ||
          'Kamu belum memasang joran pancing. Buka Tas Barang (🎒) untuk memasang joranmu!',
        type: 'warning',
      })
      openModal('inventory')
    }

    window.addEventListener('open-tugu-confirm', onOpenConfirm)
    window.addEventListener('tugu-mode-changed', onModeChanged as EventListener)
    window.addEventListener('landmark-selected', onLandmarkSelected as EventListener)
    window.addEventListener('time-of-day-changed', onTimeChanged as EventListener)

    window.addEventListener('enter-river-area', onEnterRiver)
    window.addEventListener('exit-river-area', onExitRiver)
    window.addEventListener('river-mode-changed', onRiverModeChanged as EventListener)
    window.addEventListener('river-fishing-state', onRiverFishingState as EventListener)
    window.addEventListener('river-fish-caught', onRiverFishCaught as EventListener)
    window.addEventListener('fishing-no-rod', onFishingNoRod as EventListener)

    window.addEventListener('enter-stadium-area', onEnterStadium)
    window.addEventListener('exit-stadium-area', onExitStadium)
    window.addEventListener('stadium-mode-changed', onStadiumModeChanged as EventListener)
    window.addEventListener('stadium-ball-kicked', onStadiumBallKicked as EventListener)
    window.addEventListener('stadium-freekick-result', onStadiumFreekickResult as EventListener)

    window.addEventListener('enter-beach-area', onEnterBeach)
    window.addEventListener('exit-beach-area', onExitBeach)
    window.addEventListener('beach-mode-changed', onBeachModeChanged as EventListener)

    return () => {
      window.removeEventListener('open-tugu-confirm', onOpenConfirm)
      window.removeEventListener('tugu-mode-changed', onModeChanged as EventListener)
      window.removeEventListener('landmark-selected', onLandmarkSelected as EventListener)
      window.removeEventListener('time-of-day-changed', onTimeChanged as EventListener)

      window.removeEventListener('enter-river-area', onEnterRiver)
      window.removeEventListener('exit-river-area', onExitRiver)
      window.removeEventListener('river-mode-changed', onRiverModeChanged as EventListener)
      window.removeEventListener('river-fishing-state', onRiverFishingState as EventListener)
      window.removeEventListener('river-fish-caught', onRiverFishCaught as EventListener)
      window.removeEventListener('fishing-no-rod', onFishingNoRod as EventListener)

      window.removeEventListener('enter-stadium-area', onEnterStadium)
      window.removeEventListener('exit-stadium-area', onExitStadium)
      window.removeEventListener('stadium-mode-changed', onStadiumModeChanged as EventListener)
      window.removeEventListener('stadium-ball-kicked', onStadiumBallKicked as EventListener)
      window.removeEventListener('stadium-freekick-result', onStadiumFreekickResult as EventListener)

      window.removeEventListener('enter-beach-area', onEnterBeach)
      window.removeEventListener('exit-beach-area', onExitBeach)
      window.removeEventListener('beach-mode-changed', onBeachModeChanged as EventListener)

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

  // Continuous tactile camera actions (tap once or hold to smoothly rotate/zoom)
  const cameraActionTimerRef = useRef<{
    timerId: NodeJS.Timeout | null
    intervalId: NodeJS.Timeout | null
  }>({ timerId: null, intervalId: null })

  const stopCameraAction = useCallback(() => {
    if (cameraActionTimerRef.current.timerId) {
      clearTimeout(cameraActionTimerRef.current.timerId)
      cameraActionTimerRef.current.timerId = null
    }
    if (cameraActionTimerRef.current.intervalId) {
      clearInterval(cameraActionTimerRef.current.intervalId)
      cameraActionTimerRef.current.intervalId = null
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('pointerup', stopCameraAction)
      window.removeEventListener('pointercancel', stopCameraAction)
    }
  }, [])

  const startCameraAction = useCallback(
    (actionFn: (isContinuous?: boolean) => void) => {
      stopCameraAction()
      actionFn(false) // First step triggers immediately on tap/click
      if (typeof window !== 'undefined') {
        window.addEventListener('pointerup', stopCameraAction)
        window.addEventListener('pointercancel', stopCameraAction)
      }
      // Start rapid continuous repeat if held for > 200ms
      cameraActionTimerRef.current.timerId = setTimeout(() => {
        cameraActionTimerRef.current.intervalId = setInterval(() => {
          actionFn(true)
        }, 50)
      }, 200)
    },
    [stopCameraAction]
  )

  useEffect(() => {
    return () => {
      stopCameraAction()
    }
  }, [stopCameraAction])

  const handleRotateLeft = useCallback((isContinuous = false) => {
    cityManagerRef.current?.rotateLeft(isContinuous ? Math.PI / 36 : Math.PI / 14)
  }, [])

  const handleRotateRight = useCallback((isContinuous = false) => {
    cityManagerRef.current?.rotateRight(isContinuous ? Math.PI / 36 : Math.PI / 14)
  }, [])

  const handleTiltUp = useCallback((isContinuous = false) => {
    cityManagerRef.current?.tiltUp(isContinuous ? 0.03 : 0.08)
  }, [])

  const handleTiltDown = useCallback((isContinuous = false) => {
    cityManagerRef.current?.tiltDown(isContinuous ? 0.03 : 0.08)
  }, [])

  const handleResetCamera = useCallback(() => {
    cityManagerRef.current?.resetCamera()
  }, [])

  const handleZoomIn = useCallback((isContinuous = false) => {
    cityManagerRef.current?.zoomIn(isContinuous ? 0.95 : 0.82)
  }, [])

  const handleZoomOut = useCallback((isContinuous = false) => {
    cityManagerRef.current?.zoomOut(isContinuous ? 1.05 : 1.22)
  }, [])

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

  const handleExitRiver = () => {
    setIsAutoFishing(false)
    if (autoFishingTimerRef.current) clearTimeout(autoFishingTimerRef.current)
    setIsTransitioning(true)
    setTransitionMessage('Kembali ke Kota Utama...')
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('exit-river-area'))
      setTimeout(() => {
        setIsTransitioning(false)
      }, 400)
    }, 450)
  }

  const handleAnalogMove = useCallback((dir: { x: number; y: number } | null) => {
    if (dir && (Math.abs(dir.x) > 0.15 || Math.abs(dir.y) > 0.15)) {
      setIsAutoFishing(false)
    }
    cityManagerRef.current?.setVirtualMovement(dir)
  }, [])

  // Auto-Fishing Lifecycle Automation
  useEffect(() => {
    if (!isAutoFishing || viewMode !== 'river') {
      if (autoFishingTimerRef.current) clearTimeout(autoFishingTimerRef.current)
      return
    }

    if (autoFishingTimerRef.current) clearTimeout(autoFishingTimerRef.current)

    if (fishingState === 'idle') {
      // Auto cast line in the center after a brief delay
      autoFishingTimerRef.current = setTimeout(() => {
        cityManagerRef.current?.castFishingLine()
      }, 700)
    } else if (fishingState === 'bite') {
      // Quick reaction strike within 250ms
      autoFishingTimerRef.current = setTimeout(() => {
        cityManagerRef.current?.reelFishingTap()
      }, 250)
    } else if (fishingState === 'reeling') {
      // Rapid reel clicks until 100%
      const interval = setInterval(() => {
        cityManagerRef.current?.reelFishingTap()
      }, 100)
      return () => clearInterval(interval)
    } else if (fishingState === 'caught') {
      // Successfully caught fish
      setAutoCatchCount((prev) => prev + 1)
      // Celebrate for 2.2 seconds so user sees the catch, then auto reset and recast
      autoFishingTimerRef.current = setTimeout(() => {
        cityManagerRef.current?.resetFishing()
        autoFishingTimerRef.current = setTimeout(() => {
          cityManagerRef.current?.castFishingLine()
        }, 500)
      }, 2200)
    } else if (fishingState === 'escaped') {
      // If escaped, retry quickly
      autoFishingTimerRef.current = setTimeout(() => {
        cityManagerRef.current?.resetFishing()
        autoFishingTimerRef.current = setTimeout(() => {
          cityManagerRef.current?.castFishingLine()
        }, 500)
      }, 900)
    }

    return () => {
      if (autoFishingTimerRef.current) clearTimeout(autoFishingTimerRef.current)
    }
  }, [isAutoFishing, fishingState, viewMode])

  return (
    <div className="relative w-full h-full select-none overflow-hidden bg-[#CDE7F0] font-sans">
      {/* 3D Canvas Mounting Point */}
      <div
        ref={containerRef}
        className="w-full h-full touch-none select-none cursor-grab active:cursor-grabbing outline-none"
      />

      {/* ============================================================ */}
      {/* TOP CANVAS CONTROLS (City Mode Time & Landmark Navigation)   */}
      {/* ============================================================ */}
      {viewMode === 'city' && (
        <div className="absolute top-13 sm:top-16 left-2 sm:left-4 z-20 pointer-events-auto font-sans">
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
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowLandmarkMenu(false)}
                  />
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
                    onClick={() => handleFlyTo('investor_tower')}
                    className="flex items-center space-x-2 text-left p-1.5 rounded-lg text-[#343B35] hover:bg-[#EFE9D8] transition-colors cursor-pointer"
                  >
                    <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                    <div>
                      <div className="font-semibold text-xs text-purple-700">Monumen Investor Kota</div>
                      <div className="text-[10px] text-[#78634B]">103 Investor Kota &bull; Hall of Fame</div>
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
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* TACTILE ON-SCREEN CAMERA ROTATE & ZOOM BUTTONS               */}
      {/* Ultra-compact on mobile, thumb-friendly, hidden in stadium    */}
      {/* ============================================================ */}
      {viewMode !== 'stadium' && (
        <div className="absolute right-0.5 sm:right-2 md:right-3.5 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center select-none pointer-events-auto gap-0.5 sm:gap-1 scale-[0.48] sm:scale-[0.65] md:scale-75 lg:scale-90 origin-right">
        {/* 1. CAMERA ROTATE D-PAD (Atas, Bawah, Kiri, Kanan, Reset) */}
        <div className="bg-[#F7F4E9]/85 backdrop-blur-md p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-[#D8CEBE]/80 shadow-xs sm:shadow-sm flex flex-col items-center">
          {/* Top: Tilt Up / Sudut Atas (Aerial View) */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault()
              startCameraAction(handleTiltUp)
            }}
            onPointerUp={stopCameraAction}
            onPointerLeave={stopCameraAction}
            onPointerCancel={stopCameraAction}
            title="Sudut Atas (Tunduk / Pandangan Aerial)"
            aria-label="Sudut Atas"
            className="w-5.5 h-5.5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg bg-white/90 hover:bg-[#EFE9D8] active:bg-[#E4D5BE] active:translate-y-0.5 border border-[#D8CEBE] shadow-xs flex items-center justify-center text-[#343B35] cursor-pointer transition-all touch-manipulation"
          >
            <ChevronUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 stroke-[2.2]" />
          </button>

          {/* Middle Row: Rotate Left, Reset Compass, Rotate Right */}
          <div className="flex items-center gap-0.5 my-0.5">
            {/* Left: Rotate Left / Putar Kiri */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault()
                startCameraAction(handleRotateLeft)
              }}
              onPointerUp={stopCameraAction}
              onPointerLeave={stopCameraAction}
              onPointerCancel={stopCameraAction}
              title="Putar Kiri"
              aria-label="Putar Kiri"
              className="w-5.5 h-5.5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg bg-white/90 hover:bg-[#EFE9D8] active:bg-[#E4D5BE] active:translate-y-0.5 border border-[#D8CEBE] shadow-xs flex items-center justify-center text-[#343B35] cursor-pointer transition-all touch-manipulation"
            >
              <ChevronLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 stroke-[2.2]" />
            </button>

            {/* Center: Reset Default Angle */}
            <button
              type="button"
              onClick={handleResetCamera}
              title="Reset Sudut Kamera Default"
              aria-label="Reset Sudut Kamera Default"
              className="w-5.5 h-5.5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg bg-[#EFE9D8]/90 hover:bg-[#E4D5BE] active:bg-[#D8CEBE] active:translate-y-0.5 border border-[#D8CEBE] shadow-xs flex items-center justify-center text-[#78634B] cursor-pointer transition-all touch-manipulation"
            >
              <Compass className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-[#8C7A6B]" />
            </button>

            {/* Right: Rotate Right / Putar Kanan */}
            <button
              type="button"
              onPointerDown={(e) => {
                e.preventDefault()
                startCameraAction(handleRotateRight)
              }}
              onPointerUp={stopCameraAction}
              onPointerLeave={stopCameraAction}
              onPointerCancel={stopCameraAction}
              title="Putar Kanan"
              aria-label="Putar Kanan"
              className="w-5.5 h-5.5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg bg-white/90 hover:bg-[#EFE9D8] active:bg-[#E4D5BE] active:translate-y-0.5 border border-[#D8CEBE] shadow-xs flex items-center justify-center text-[#343B35] cursor-pointer transition-all touch-manipulation"
            >
              <ChevronRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 stroke-[2.2]" />
            </button>
          </div>

          {/* Bottom: Tilt Down / Sudut Bawah (Ground Level View) */}
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault()
              startCameraAction(handleTiltDown)
            }}
            onPointerUp={stopCameraAction}
            onPointerLeave={stopCameraAction}
            onPointerCancel={stopCameraAction}
            title="Sudut Bawah (Tegak / Pandangan Tanah)"
            aria-label="Sudut Bawah"
            className="w-5.5 h-5.5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg bg-white/90 hover:bg-[#EFE9D8] active:bg-[#E4D5BE] active:translate-y-0.5 border border-[#D8CEBE] shadow-xs flex items-center justify-center text-[#343B35] cursor-pointer transition-all touch-manipulation"
          >
            <ChevronDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 stroke-[2.2]" />
          </button>
        </div>

        {/* 2. ZOOM IN / OUT BUTTONS */}
        <div className="bg-[#F7F4E9]/85 backdrop-blur-md p-0.5 sm:p-1 rounded-lg sm:rounded-xl border border-[#D8CEBE]/80 shadow-xs sm:shadow-sm flex flex-col items-center gap-0.5">
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault()
              startCameraAction(handleZoomIn)
            }}
            onPointerUp={stopCameraAction}
            onPointerLeave={stopCameraAction}
            onPointerCancel={stopCameraAction}
            title="Zoom In (Perbesar Tampilan)"
            aria-label="Zoom In"
            className="w-5.5 h-5.5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg bg-white/90 hover:bg-[#EFE9D8] active:bg-[#E4D5BE] active:translate-y-0.5 border border-[#D8CEBE] shadow-xs flex items-center justify-center text-[#343B35] cursor-pointer transition-all touch-manipulation"
          >
            <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 stroke-[2.2]" />
          </button>
          <button
            type="button"
            onPointerDown={(e) => {
              e.preventDefault()
              startCameraAction(handleZoomOut)
            }}
            onPointerUp={stopCameraAction}
            onPointerLeave={stopCameraAction}
            onPointerCancel={stopCameraAction}
            title="Zoom Out (Perkecil Tampilan)"
            aria-label="Zoom Out"
            className="w-5.5 h-5.5 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-md sm:rounded-lg bg-white/90 hover:bg-[#EFE9D8] active:bg-[#E4D5BE] active:translate-y-0.5 border border-[#D8CEBE] shadow-xs flex items-center justify-center text-[#343B35] cursor-pointer transition-all touch-manipulation"
          >
            <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>
      )}

      {/* ============================================================ */}
      {/* VIRTUAL ANALOG JOYSTICK (Tugu, River, Stadium & Beach on Touch) */}
      {/* Positioned at bottom-6 left-4 (spacious, thumb-friendly)     */}
      {/* ============================================================ */}
      {(viewMode === 'tugu' || viewMode === 'river' || viewMode === 'stadium' || viewMode === 'beach') && (
        <div className="md:hidden absolute bottom-6 sm:bottom-8 left-4 sm:left-8 z-30 pointer-events-auto">
          <AnalogJoystick onMove={handleAnalogMove} />
        </div>
      )}

      {/* ============================================================ */}
      {/* 3D RIVER & BEACH FISHING CONTROLS & HUD                     */}
      {/* Mobile: right-thumb action buttons (zero analog collision)   */}
      {/* Desktop: clean centered bottom bar                           */}
      {/* ============================================================ */}
      {(viewMode === 'river' || viewMode === 'beach') && (
        <div className={`absolute z-30 pointer-events-auto font-sans flex flex-col gap-1.5 px-2 ${
          fishingState === 'idle'
            ? 'bottom-6 sm:bottom-8 right-3 sm:right-auto sm:left-1/2 sm:-translate-x-1/2 items-end sm:items-center'
            : 'bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 items-center w-auto max-w-[320px] sm:max-w-sm'
        }`}>
          {/* Active Auto-Fishing Notification Badge */}
          {isAutoFishing && fishingState !== 'caught' && (
            <div className="flex items-center space-x-2 px-3 py-1 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-xl border border-white/30 animate-pulse font-sans">
              <span className="text-xs animate-spin">⚡</span>
              <span className="text-[11px] sm:text-xs font-black tracking-wide">
                Auto Mancing • {autoCatchCount} Ikan
              </span>
              <button
                type="button"
                onClick={() => setIsAutoFishing(false)}
                className="ml-1 px-2 py-0.5 bg-black/25 hover:bg-black/40 rounded-lg text-[10px] font-bold text-white transition-all cursor-pointer"
              >
                Stop ✕
              </button>
            </div>
          )}

          {/* 1. IDLE STATE: Centered Action Controls */}
          {fishingState === 'idle' && (
            <div className="flex flex-col items-center gap-1.5">
              <span className="text-[9px] sm:text-[10px] font-semibold text-[#343B35] bg-[#F7F4E9]/95 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-[#D8CEBE] shadow-xs">
                {viewMode === 'beach' ? '💡 Tap air laut atau tombol lempar kail' : '💡 Tap air sungai atau tombol lempar'}
              </span>

              <div className="flex items-center gap-1.5 justify-center">
                {/* Main Centered Throw Button */}
                <button
                  type="button"
                  onClick={() => {
                    const hasRod = inventory.some(
                      (i) => i.isEquipped && ((i.itemId || (i as any).item_id || '').startsWith('rod_') || i.category === 'tools')
                    )
                    if (!hasRod) {
                      useUIStore.getState().addNotification({
                        title: 'Perlu Joran Pancing! 🎣',
                        message:
                          'Kamu belum memasang joran pancing. Buka Tas Barang (🎒) untuk memasang joran terlebih dahulu!',
                        type: 'warning',
                      })
                      useUIStore.getState().openModal('inventory')
                      return
                    }
                    cityManagerRef.current?.castFishingLine()
                  }}
                  className="flex items-center space-x-1.5 px-4 py-2 sm:px-6 sm:py-3 rounded-2xl bg-gradient-to-r from-[#267385] to-[#1E5D6C] text-white font-black text-xs sm:text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer border border-white/30"
                >
                  <Fish className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#80DEEA] animate-pulse" />
                  <span>Lempar Kail 🎣</span>
                </button>

                {/* Auto-Fishing Toggle Button */}
                <button
                  type="button"
                  onClick={() => {
                    const hasRod = inventory.some(
                      (i) => i.isEquipped && ((i.itemId || (i as any).item_id || '').startsWith('rod_') || i.category === 'tools')
                    )
                    if (!hasRod && !isAutoFishing) {
                      useUIStore.getState().addNotification({
                        title: 'Perlu Joran Pancing! 🎣',
                        message:
                          'Kamu belum memasang joran pancing. Buka Tas Barang (🎒) untuk memasang joran terlebih dahulu!',
                        type: 'warning',
                      })
                      useUIStore.getState().openModal('inventory')
                      return
                    }
                    const next = !isAutoFishing
                    setIsAutoFishing(next)
                    if (next) {
                      cityManagerRef.current?.castFishingLine()
                    }
                  }}
                  className={`flex items-center space-x-1 px-3 py-2 sm:px-4 sm:py-3 rounded-2xl font-black text-xs sm:text-sm transition-all cursor-pointer border shadow-md active:scale-95 ${
                    isAutoFishing
                      ? 'bg-amber-500 text-white border-amber-400 animate-pulse'
                      : 'bg-[#F7F4E9] hover:bg-[#EFE9D8] text-[#343B35] border-[#D8CEBE]'
                  }`}
                >
                  <Zap className="w-3 h-3 text-amber-500" />
                  <span>{isAutoFishing ? 'Auto On' : 'Auto'}</span>
                </button>

                {/* Toko Joran Direct Kiosk Button */}
                <button
                  type="button"
                  onClick={() => useUIStore.getState().openModal('rod_shop')}
                  className="flex items-center space-x-1 px-3 py-2 sm:px-4 sm:py-3 rounded-2xl font-black text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-stone-950 border border-amber-300 shadow-md hover:shadow-lg active:scale-95 transition-all cursor-pointer"
                  title="Buka Toko Joran Pancing"
                >
                  <span className="text-xs sm:text-sm">🏪</span>
                  <span>Toko Joran</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. CASTING STATE */}
          {fishingState === 'casting' && (
            <div className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-[#F7F4E9] border border-[#D8CEBE] shadow-md text-xs font-bold text-[#267385] animate-pulse">
              <Waves className="w-4 h-4 text-[#267385] animate-spin" />
              <span>{viewMode === 'beach' ? 'Melempar kail ke laut samudra...' : 'Melempar kail ke tengah sungai...'}</span>
            </div>
          )}

          {/* 3. WAITING STATE */}
          {fishingState === 'waiting' && (
            <div className="flex items-center space-x-2 bg-[#F7F4E9]/95 backdrop-blur-xs border border-[#D8CEBE] rounded-2xl p-2 sm:p-2.5 shadow-lg">
              <div className="flex items-center space-x-2 px-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] animate-ping" />
                <span className="text-xs font-bold text-[#343B35]">
                  Menunggu ikan menyambar...
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsAutoFishing(false)
                  cityManagerRef.current?.resetFishing()
                }}
                className="px-2.5 py-1 text-[11px] font-semibold text-[#78634B] hover:text-[#343B35] hover:bg-[#EFE9D8] rounded-xl transition-colors cursor-pointer"
              >
                Batal ✕
              </button>
            </div>
          )}

          {/* 4. BITE / STRIKE STATE */}
          {fishingState === 'bite' && (
            <button
              type="button"
              onClick={() => cityManagerRef.current?.reelFishingTap()}
              className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl bg-gradient-to-r from-[#EF4444] via-[#F59E0B] to-[#EF4444] text-white font-black text-sm sm:text-base shadow-2xl animate-bounce hover:scale-105 active:scale-95 transition-transform cursor-pointer border-2 border-white ring-4 ring-[#EF4444]/40"
            >
              ⚡ STRIKE! TARIK SEKARANG! ⚡
            </button>
          )}

          {/* 5. REELING MINIGAME STATE */}
          {fishingState === 'reeling' && (
            <div className="w-60 sm:w-68 bg-[#F7F4E9] border-2 border-[#267385] rounded-2xl p-3 shadow-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold text-[#343B35]">
                <span className="flex items-center gap-1">
                  <Fish className="w-3.5 h-3.5 text-[#267385]" />
                  Tensi Tarikan
                </span>
                <span className="text-[#267385] font-black">{Math.round(reelProgress)}%</span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-3 bg-[#D8CEBE] rounded-full overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full transition-all duration-100 bg-gradient-to-r from-[#22C55E] via-[#EAB308] to-[#EF4444]"
                  style={{ width: `${Math.min(100, Math.max(0, reelProgress))}%` }}
                />
              </div>
              {/* Fast Tap Action Button */}
              <button
                type="button"
                onClick={() => cityManagerRef.current?.reelFishingTap()}
                className="w-full py-2.5 rounded-xl bg-[#267385] hover:bg-[#1E5D6C] active:scale-95 text-white font-black text-xs sm:text-sm tracking-wide shadow-md transition-transform cursor-pointer border border-[#1E5D6C]"
              >
                {isAutoFishing ? '⚡ Auto Menarik Kail... ⚡' : 'TARIK! 🎣 (Tap Cepat!)'}
              </button>
            </div>
          )}

          {/* 6. CAUGHT CELEBRATION CARD */}
          {fishingState === 'caught' && caughtFish && (
            <div
              className={`w-72 sm:w-80 rounded-3xl p-4 sm:p-5 shadow-2xl animate-in zoom-in-95 font-sans relative overflow-hidden ${
                caughtFish.tier === 'immortal'
                  ? 'bg-gradient-to-br from-[#FFF5F8] via-[#FCE7F3] to-[#F5D0FE] border-3 border-[#EC4899] ring-4 ring-[#EC4899]/30'
                  : caughtFish.tier === 'mythic'
                  ? 'bg-gradient-to-br from-[#FFF5F5] via-[#FEE2E2] to-[#FED7AA] border-3 border-[#EF4444] ring-4 ring-[#EF4444]/30'
                  : caughtFish.tier === 'legendary'
                  ? 'bg-gradient-to-br from-[#FFFBEB] via-[#FEF3C7] to-[#FDE68A] border-2 border-[#F59E0B] ring-2 ring-[#F59E0B]/30'
                  : 'bg-[#F7F4E9] border-2 border-[#668B65]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="text-3xl sm:text-4xl animate-bounce">{caughtFish.icon}</div>
                <span
                  className={`text-[11px] font-black px-2.5 py-1 rounded-full text-white shadow-sm tracking-wide ${
                    caughtFish.tier === 'immortal'
                      ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 animate-pulse'
                      : caughtFish.tier === 'mythic'
                      ? 'bg-gradient-to-r from-red-600 to-rose-600'
                      : ''
                  }`}
                  style={{
                    backgroundColor:
                      caughtFish.tier !== 'immortal' && caughtFish.tier !== 'mythic'
                        ? caughtFish.rarityColor || '#27AE60'
                        : undefined,
                  }}
                >
                  {caughtFish.rarity}
                </span>
              </div>

              <h4 className="font-heading font-black text-base sm:text-lg text-[#343B35] mt-2">
                {caughtFish.name}
              </h4>
              <p className="text-[11px] text-[#78634B] mt-1 leading-relaxed">
                {caughtFish.desc}
              </p>

              <div className="mt-3 p-2.5 bg-white/70 backdrop-blur-xs rounded-xl flex items-center justify-between text-xs border border-[#D8CEBE]">
                <div>
                  <span className="text-[10px] text-[#78634B] block font-semibold">Berat</span>
                  <span className="font-extrabold text-[#343B35]">{caughtFish.weight} kg</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-[#78634B] block font-semibold">Hadiah Koin</span>
                  <span className="font-black text-[#668B65]">+{caughtFish.rewardCoins} Koin</span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-[#D8CEBE] flex items-center justify-between">
                {isAutoFishing ? (
                  <span className="flex items-center space-x-1 text-[11px] font-bold text-amber-600 animate-pulse">
                    <span>⚡</span>
                    <span>Mancing otomatis dalam 2s...</span>
                  </span>
                ) : (
                  <span className="text-[10px] text-[#78634B]">Disimpan ke Tas</span>
                )}
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsAutoFishing(false)
                      cityManagerRef.current?.resetFishing()
                    }}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-[#78634B] hover:bg-[#EFE9D8] cursor-pointer"
                  >
                    {isAutoFishing ? 'Stop Auto' : 'Selesai'}
                  </button>
                  {!isAutoFishing && (
                    <button
                      type="button"
                      onClick={() => {
                        cityManagerRef.current?.resetFishing()
                        setTimeout(() => cityManagerRef.current?.castFishingLine(), 150)
                      }}
                      className="px-4 py-1.5 rounded-xl bg-[#267385] hover:bg-[#1E5D6C] text-white text-xs font-extrabold shadow-sm cursor-pointer"
                    >
                      Mancing Lagi 🎣
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 7. ESCAPED STATE */}
          {fishingState === 'escaped' && (
            <div className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] text-xs font-bold shadow-md">
              <span>Ikan terlepas! Jangan menyerah!</span>
              <button
                type="button"
                onClick={() => cityManagerRef.current?.resetFishing()}
                className="underline ml-1 cursor-pointer text-[#343B35]"
              >
                Coba Lagi
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* 3D STADIUM FREEKICK SCOREBOARD & CELEBRATION HUD              */}
      {/* ============================================================ */}
      {viewMode === 'stadium' && (
        <>
          {/* Top-Center Digital Stadium Scoreboard */}
          <div className="absolute top-16 sm:top-18 left-1/2 -translate-x-1/2 z-30 pointer-events-auto font-sans">
            <div className="bg-[#0F172A]/90 backdrop-blur-md text-white border-2 border-emerald-400/50 rounded-2xl px-3.5 py-1.5 sm:px-5 sm:py-2 shadow-2xl flex items-center gap-3 sm:gap-5">
              {/* Goals */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-wider">⚽ GOL</span>
                <span className="text-lg sm:text-2xl font-black text-white leading-tight">{stadiumScore.goals}</span>
              </div>
              <div className="h-7 w-px bg-white/20" />
              {/* Shots */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] font-bold text-slate-300 uppercase tracking-wider">TEMBAKAN</span>
                <span className="text-lg sm:text-2xl font-black text-slate-100 leading-tight">{stadiumScore.shots}</span>
              </div>
              <div className="h-7 w-px bg-white/20" />
              {/* Accuracy */}
              <div className="flex flex-col items-center">
                <span className="text-[9px] sm:text-[10px] font-bold text-amber-400 uppercase tracking-wider">AKURASI</span>
                <span className="text-xs sm:text-sm font-bold text-amber-300 leading-tight">
                  {stadiumScore.shots > 0 ? Math.round((stadiumScore.goals / stadiumScore.shots) * 100) : 0}%
                </span>
              </div>
              {/* Streak Badge */}
              {stadiumScore.streak >= 2 && (
                <>
                  <div className="h-7 w-px bg-white/20 hidden sm:block" />
                  <div className="hidden sm:flex items-center gap-1 bg-amber-500/20 px-2 py-1 rounded-lg border border-amber-400/40 animate-pulse">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[11px] font-black text-amber-300">{stadiumScore.streak} Streak!</span>
                  </div>
                </>
              )}
              {/* History Dots */}
              {stadiumScore.history.length > 0 && (
                <div className="hidden sm:flex items-center gap-1 ml-1">
                  {stadiumScore.history.map((res, i) => (
                    <span
                      key={i}
                      className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                        res === 'goal' ? 'bg-emerald-500 text-white shadow-xs' : 'bg-rose-500 text-white'
                      }`}
                      title={res === 'goal' ? 'Gol' : 'Gagal'}
                    >
                      {res === 'goal' ? '✓' : '✗'}
                    </span>
                  ))}
                </div>
              )}
              {/* Reset Score Button */}
              {stadiumScore.shots > 0 && (
                <button
                  type="button"
                  onClick={handleResetStadiumScore}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all cursor-pointer ml-1"
                  title="Reset Skor Penalti"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Goal & Goalkeeper Save Celebration Overlay */}
          {stadiumFeedback && (
            <div className="absolute inset-0 pointer-events-none z-50 flex items-center justify-center px-4">
              <div
                className={`transform transition-all duration-300 scale-100 animate-in zoom-in-75 p-5 sm:p-7 rounded-3xl shadow-2xl border-2 flex flex-col items-center text-center max-w-sm ${
                  stadiumFeedback.isGoal
                    ? 'bg-gradient-to-b from-[#1E5C25]/95 to-[#0F3514]/95 border-emerald-400 text-white shadow-emerald-500/60'
                    : 'bg-gradient-to-b from-[#1E293B]/95 to-[#0F172A]/95 border-amber-400/80 text-white shadow-amber-500/40'
                }`}
              >
                <div className="text-5xl sm:text-6xl mb-2 animate-bounce">
                  {stadiumFeedback.isGoal ? '⚽🔥' : '🧤'}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black tracking-wider uppercase mb-1 drop-shadow-md">
                  {stadiumFeedback.title}
                </h2>
                <p className="text-xs sm:text-sm text-slate-200 font-medium mb-3 max-w-xs">
                  {stadiumFeedback.subtitle}
                </p>
                {stadiumFeedback.coinsAwarded && (
                  <div className="flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/50 px-3.5 py-1.5 rounded-xl font-black text-amber-300 text-sm animate-pulse">
                    <span>🪙</span>
                    <span>+{stadiumFeedback.coinsAwarded} Koin Hadiah Gol!</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom Shootout Action Controls */}
          <div className="absolute bottom-16 sm:bottom-6 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-28 z-30 pointer-events-auto font-sans flex flex-col items-center sm:items-end gap-2.5 max-w-sm">
            <div className="flex flex-col items-center sm:items-end gap-1.5">
              <span className="text-[10px] sm:text-[11px] font-semibold text-[#343B35] bg-[#F7F4E9]/90 backdrop-blur-xs px-2.5 py-1 rounded-full border border-[#D8CEBE] shadow-xs">
                {isShootingFreekick ? '⚽ Bola sedang meluncur...' : '💡 Ketuk bola sepak atau tombol untuk menendang'}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isShootingFreekick}
                  onClick={() => cityManagerRef.current?.shootSoccerBall('top_left', 90)}
                  className={`px-3 py-2 rounded-xl bg-[#2D7F36] hover:bg-[#23682B] text-white font-bold text-xs shadow-md active:scale-95 transition-all border border-white/20 ${
                    isShootingFreekick ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  title="Tendang Pojok Kiri Atas"
                >
                  ↖️ Kiri
                </button>
                <button
                  type="button"
                  disabled={isShootingFreekick}
                  onClick={() => cityManagerRef.current?.shootSoccerBall('center', 85)}
                  className={`flex items-center space-x-1.5 px-4 py-2.5 sm:px-5 sm:py-3 rounded-2xl bg-gradient-to-r from-[#2D7F36] to-[#1E5C25] text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all border border-white/20 ${
                    isShootingFreekick ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <span>{isShootingFreekick ? 'Menendang... ⚽' : 'Tendang Keras ⚽'}</span>
                </button>
                <button
                  type="button"
                  disabled={isShootingFreekick}
                  onClick={() => cityManagerRef.current?.shootSoccerBall('top_right', 90)}
                  className={`px-3 py-2 rounded-xl bg-[#2D7F36] hover:bg-[#23682B] text-white font-bold text-xs shadow-md active:scale-95 transition-all border border-white/20 ${
                    isShootingFreekick ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                  title="Tendang Pojok Kanan Atas"
                >
                  ↗️ Kanan
                </button>
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <button
                  type="button"
                  onClick={() => useUIStore.getState().openModal('freekick')}
                  className="px-3 py-1 rounded-lg bg-[#F7F4E9] hover:bg-[#EFE9D8] border border-[#D8CEBE] text-[11px] font-bold text-[#343B35] shadow-xs cursor-pointer"
                >
                  🎮 Mini-Game Penalti
                </button>
                <button
                  type="button"
                  onClick={() => useUIStore.getState().openModal('photo_studio')}
                  className="px-3 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-[11px] font-bold text-amber-900 shadow-xs cursor-pointer"
                >
                  📸 Foto di Lapangan
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* COMPACT PLAYER GUIDANCE PANEL                                */}
      {/* ============================================================ */}
      <div
        className={`absolute z-20 pointer-events-auto font-sans ${
          viewMode === 'tugu' || viewMode === 'river' || viewMode === 'stadium' || viewMode === 'beach'
            ? 'top-20 sm:top-24 right-3 sm:right-4'
            : 'bottom-4 sm:bottom-5 right-3 sm:right-4'
        }`}
      >
        {showHelpHint ? (
          <div className="w-64 sm:w-72 bg-[#F7F4E9] border border-[#D8CEBE] rounded-xl p-2.5 shadow-lg text-[11px] text-[#343B35]">
            <div className="flex items-center justify-between pb-1.5 border-b border-[#D8CEBE] mb-1.5">
              <span className="font-bold text-xs flex items-center gap-1.5 text-[#343B35]">
                <Info className="w-3.5 h-3.5 text-[#668B65]" />
                {viewMode === 'city'
                  ? 'Panduan Kota 3D'
                  : viewMode === 'river'
                  ? 'Panduan Sungai Kali Netizen'
                  : viewMode === 'beach'
                  ? 'Panduan Pantai Netizen Beach'
                  : viewMode === 'stadium'
                  ? 'Panduan Freekick Stadion'
                  : 'Panduan Alun-Alun'}
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
                  <div>• <strong className="text-[#343B35]">Tombol Kamera Kanan:</strong> D-Pad putar atas, bawah, kiri, kanan, reset &amp; zoom</div>
                  <div>• <strong className="text-[#343B35]">Geser 1 Jari:</strong> Geser map (Pan)</div>
                  <div>• <strong className="text-[#343B35]">2 Jari (Putar/Cubit):</strong> Muter-muter orbit kamera &amp; zoom</div>
                  <div>• <strong className="text-[#343B35]">Mouse:</strong> Klik kiri drag orbit, klik kanan geser</div>
                  <div>• <strong className="text-[#343B35]">Klik Bangunan:</strong> Kunjungi Alun-Alun, Sungai, Pantai, atau Stadion</div>
                </>
              ) : viewMode === 'river' ? (
                <>
                  <div>• <strong className="text-[#343B35]">Tombol Tengah:</strong> Lempar kail langsung ke tengah sungai</div>
                  <div>• <strong className="text-[#343B35]">Mode Auto:</strong> Lempar, strike &amp; tarik kail otomatis tanpa lelah</div>
                  <div>• <strong className="text-[#343B35]">STRIKE &amp; Tarik:</strong> Tap secepatnya saat kail disambar ikan</div>
                  <div>• <strong className="text-[#343B35]">Koleksi Rarity:</strong> Common, Rare, Epic, Legendary, Mythic, hingga Immortal 🔱</div>
                </>
              ) : viewMode === 'beach' ? (
                <>
                  <div>• <strong className="text-[#343B35]">Dermaga &amp; Pantai:</strong> Eksplorasi dermaga kayu samudra hingga pasir pantai</div>
                  <div>• <strong className="text-[#343B35]">Mancing Samudra:</strong> 17 spesies biota laut (Lumba-lumba, Pari, Hiu Martil, Megalodon)</div>
                  <div>• <strong className="text-[#343B35]">Multiplayer Pantai:</strong> Mancing bersama 10 warga per server ruangan</div>
                  <div>• <strong className="text-[#343B35]">Mode Auto:</strong> Santai mancing otomatis sambil mengobrol</div>
                </>
              ) : viewMode === 'stadium' ? (
                <>
                  <div>• <strong className="text-[#343B35]">Analog / WASD:</strong> Jelajahi rumput lapangan hijau</div>
                  <div>• <strong className="text-[#343B35]">Tendang Bola:</strong> Ketuk bola atau tombol tendang keras</div>
                  <div>• <strong className="text-[#343B35]">Kiper AI 3D:</strong> Taklukkan kiper &amp; pagar betis untuk cetak gol</div>
                  <div>• <strong className="text-[#343B35]">Mini-Game:</strong> Mainkan mode penalti beruntun</div>
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
                  useGameStore.getState().setSelectedBuilding(selectedLandmarkInfo.id)
                  useUIStore.getState().openModal('building_details')
                  setSelectedLandmarkInfo(null)
                }}
                className="px-3.5 py-1.5 rounded-lg bg-[#668B65] hover:bg-[#557754] text-white font-semibold text-xs border border-[#557754] flex items-center space-x-1 cursor-pointer transition-colors shadow-xs"
              >
                <Eye className="w-3.5 h-3.5 mr-1" />
                <span>Kunjungi Fasilitas</span>
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
              : transitionMessage.includes('Sungai')
              ? 'Mempersiapkan alat pancing & dermaga kayu sungai...'
              : transitionMessage.includes('Pantai')
              ? 'Menghubungkan ke server ruangan Pantai Netizen Beach & ombak laut...'
              : transitionMessage.includes('Stadion')
              ? 'Menyiapkan rumput lapangan hijau & tribun warna-warni Stadion Gelora Netizen...'
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
