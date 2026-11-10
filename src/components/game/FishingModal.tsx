// ============================================================
// NETIZENCITY - Fishing Minigame (Fitur 4)
// Mancing santai dengan mekanisme Tap-Tap layar / Reel Tension
// ============================================================

'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Fish,
  Waves,
  Coins,
  Sparkles,
  RotateCcw,
  AlertCircle,
  Trophy,
  CheckCircle2,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'
import { useUIStore } from '@/lib/stores/useUIStore'

interface CaughtFish {
  name: string
  rarity: 'Biasa' | 'Unik' | 'Langka' | 'Legendaris' | 'Nyentrik'
  weight: number
  price: number
  icon: string
  color: string
}

const FISH_CATALOG: CaughtFish[] = [
  {
    name: 'Ikan Lele Sultan Kumis Emas',
    rarity: 'Biasa',
    weight: 1.4,
    price: 35,
    icon: '🐟',
    color: '#34495E',
  },
  {
    name: 'Ikan Mas Koki Alun-Alun',
    rarity: 'Unik',
    weight: 0.8,
    price: 50,
    icon: '🐠',
    color: '#E67E22',
  },
  {
    name: 'Ikan Cupang Avatar Hias',
    rarity: 'Langka',
    weight: 0.3,
    price: 75,
    icon: '🐡',
    color: '#9B59B6',
  },
  {
    name: 'Ikan Arwana Emas Keraton',
    rarity: 'Legendaris',
    weight: 4.2,
    price: 150,
    icon: '✨',
    color: '#F1C40F',
  },
  {
    name: 'Sepatu Boots Rombeng Antik',
    rarity: 'Nyentrik',
    weight: 0.9,
    price: 15,
    icon: '👢',
    color: '#795548',
  },
]

type FishingState = 'idle' | 'waiting' | 'strike' | 'reeling' | 'caught' | 'failed'

interface FishingModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FishingModal({ isOpen, onClose }: FishingModalProps) {
  const updateBalance = useCitizenStore((s) => s.updateBalance)
  const addNotification = useUIStore((s) => s.addNotification)
  const openModal = useUIStore((s) => s.openModal)

  const [gameState, setGameState] = useState<FishingState>('idle')
  const [fishPos, setFishPos] = useState(50) // 0-100%
  const [hookPos, setHookPos] = useState(30) // 0-100%
  const [progress, setProgress] = useState(40) // 0-100%
  const [lastCatch, setLastCatch] = useState<CaughtFish | null>(null)
  const [totalFishCaught, setTotalFishCaught] = useState(0)

  const loopRef = useRef<number | null>(null)
  const hookVelocityRef = useRef(0)
  const fishTargetRef = useRef(50)
  const waitTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const strikeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setGameState('idle')
      setLastCatch(null)
    } else {
      cleanupTimers()
    }
  }, [isOpen])

  const cleanupTimers = () => {
    if (waitTimeoutRef.current) clearTimeout(waitTimeoutRef.current)
    if (strikeTimeoutRef.current) clearTimeout(strikeTimeoutRef.current)
    if (loopRef.current) cancelAnimationFrame(loopRef.current)
  }

  // Cast rod
  const handleCast = () => {
    setGameState('waiting')
    const waitTime = 2000 + Math.random() * 2500

    waitTimeoutRef.current = setTimeout(() => {
      setGameState('strike')
      playBiteSound()

      // 1.8 seconds to hit strike
      strikeTimeoutRef.current = setTimeout(() => {
        setGameState('failed')
      }, 1800)
    }, waitTime)
  }

  // Tap Strike when fish bites
  const handleStrike = () => {
    if (strikeTimeoutRef.current) clearTimeout(strikeTimeoutRef.current)
    setGameState('reeling')
    setFishPos(50)
    setHookPos(30)
    setProgress(35)
    hookVelocityRef.current = 0
    fishTargetRef.current = 50
    startReelingLoop()
  }

  // Tap reel button
  const handleTapReel = () => {
    if (gameState !== 'reeling') return
    hookVelocityRef.current = Math.min(hookVelocityRef.current + 3.8, 8.0)
    playTapSound()
  }

  // Sound effects
  const playTapSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(440, audioCtx.currentTime)
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.05)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.05)
    } catch {}
  }

  const playBiteSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(300, audioCtx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.15)
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.15)
    } catch {}
  }

  // Physics animation loop for reeling
  const startReelingLoop = () => {
    let lastTime = performance.now()
    let fishMoveTimer = 0

    const updatePhysics = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1)
      lastTime = now

      // 1. Move fish target randomly
      fishMoveTimer += dt
      if (fishMoveTimer > 0.8) {
        fishMoveTimer = 0
        fishTargetRef.current = 15 + Math.random() * 70
      }

      setFishPos((prev) => {
        const speed = 1.6
        return prev + (fishTargetRef.current - prev) * speed * dt
      })

      // 2. Hook bar physics (gravity + velocity)
      hookVelocityRef.current -= 4.2 * dt // gravity pull
      setHookPos((prev) => {
        const next = prev + hookVelocityRef.current
        if (next <= 5) {
          hookVelocityRef.current = 0
          return 5
        }
        if (next >= 85) {
          hookVelocityRef.current = 0
          return 85
        }
        return next
      })

      // 3. Check if fish is inside hook bar (hook bar height = 20%)
      setHookPos((curHook) => {
        setFishPos((curFish) => {
          const isInside = curFish >= curHook - 4 && curFish <= curHook + 20

          setProgress((curProg) => {
            const delta = isInside ? 22 * dt : -14 * dt
            const newProg = Math.max(0, Math.min(100, curProg + delta))

            if (newProg >= 100) {
              finishCatch()
            } else if (newProg <= 0) {
              setGameState('failed')
            }
            return newProg
          })
          return curFish
        })
        return curHook
      })

      loopRef.current = requestAnimationFrame(updatePhysics)
    }

    loopRef.current = requestAnimationFrame(updatePhysics)
  }

  const finishCatch = () => {
    if (loopRef.current) cancelAnimationFrame(loopRef.current)

    // Roll random fish based on weight probability
    const rand = Math.random()
    let chosen: CaughtFish
    if (rand < 0.4) chosen = FISH_CATALOG[0] // Lele (40%)
    else if (rand < 0.7) chosen = FISH_CATALOG[1] // Mas Koki (30%)
    else if (rand < 0.88) chosen = FISH_CATALOG[2] // Cupang (18%)
    else if (rand < 0.96) chosen = FISH_CATALOG[4] // Sepatu (8%)
    else chosen = FISH_CATALOG[3] // Arwana (4%)

    setLastCatch(chosen)
    setGameState('caught')
    setTotalFishCaught((prev) => prev + 1)

    // Add Coins to wallet & persist to database
    const curWallet = useCitizenStore.getState().wallet
    const curBalance = curWallet?.balance ?? 0
    updateBalance(curBalance + chosen.price)

    fetch('/api/economy', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'earn',
        amount: chosen.price,
        description: `Menangkap ikan ${chosen.name} di Dermaga Pancing`,
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.wallet?.balance !== undefined) {
          updateBalance(data.wallet.balance)
        }
      })
      .catch(() => {})

    addNotification({
      title: 'Ikan Berhasil Ditangkap! 🎣✨',
      message: `Dapat ${chosen.name}! +${chosen.price} Koin masuk dompet!`,
      type: 'success',
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Spot Mancing Dermaga Netizen"
      maxWidth="sm"
    >
      <div className="space-y-4 font-sans text-[#343B35]">
        {/* State 1: IDLE */}
        {gameState === 'idle' && (
          <div className="text-center py-6 space-y-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-sky-100 border-2 border-sky-300 flex items-center justify-center text-4xl shadow-sm animate-bounce">
              🎣
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#343B35]">
                Dermaga Pemancingan Kali Netizen
              </h3>
              <p className="text-xs text-[#78634B] mt-1 max-w-xs mx-auto">
                Lepaskan penat, lempar kailmu ke air yang tenang, dan dapatkan ikan segar bernilai koin tinggi!
              </p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={handleCast}
              className="w-full max-w-xs font-bold text-sm bg-sky-600 hover:bg-sky-700"
            >
              Lempar Kail ke Air 🌊
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onClose()
                openModal('rod_shop')
              }}
              className="w-full max-w-xs font-bold text-xs border-amber-400 text-amber-800 bg-amber-50 hover:bg-amber-100 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>🎣 Buka Toko Joran Pancing</span>
            </Button>
          </div>
        )}

        {/* State 2: WAITING */}
        {gameState === 'waiting' && (
          <div className="text-center py-8 space-y-3">
            <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-sky-300 animate-ping opacity-60" />
              <div className="w-14 h-14 rounded-full bg-sky-200 border-2 border-sky-400 flex items-center justify-center text-2xl">
                🔴
              </div>
            </div>
            <h4 className="text-sm font-extrabold text-[#343B35] animate-pulse">
              Pelampung Mengapung di Air...
            </h4>
            <p className="text-xs text-[#78634B]">
              Tunggu sampai ikan menyambar umpan! Jangan lengah!
            </p>
          </div>
        )}

        {/* State 3: STRIKE */}
        {gameState === 'strike' && (
          <div className="text-center py-6 space-y-3 bg-rose-50 border-2 border-rose-300 rounded-2xl p-4 animate-bounce">
            <span className="text-4xl">⚡🐟</span>
            <h3 className="text-base font-extrabold text-rose-700">
              STRIKE!! IKAN MENYAMBAR!
            </h3>
            <p className="text-xs text-rose-600">
              Klik tombol di bawah SEKARANG sebelum ikannya kabur!
            </p>
            <Button
              variant="primary"
              size="lg"
              onClick={handleStrike}
              className="w-full font-extrabold text-sm bg-rose-600 hover:bg-rose-700 text-white animate-pulse"
            >
              TARIK REEL SEKARANG! 🎣
            </Button>
          </div>
        )}

        {/* State 4: REELING (TAP-TAP MINIGAME) */}
        {gameState === 'reeling' && (
          <div className="space-y-3 p-2">
            <div className="flex items-center justify-between text-xs font-bold text-[#78634B]">
              <span>Tahan Ikan di Area Hijau!</span>
              <span className="text-[#668B65]">Progres: {Math.round(progress)}%</span>
            </div>

            {/* Fishing Reel Gauge */}
            <div className="flex items-center space-x-3">
              {/* Vertical Water Column */}
              <div className="relative w-16 h-64 bg-gradient-to-b from-sky-200 via-sky-300 to-sky-600 rounded-2xl border-2 border-sky-500 overflow-hidden shadow-inner flex-shrink-0">
                {/* Green Hook Sweet-spot Bar */}
                <div
                  className="absolute inset-x-1 bg-emerald-400/85 border-2 border-emerald-600 rounded-xl shadow-xs transition-all duration-75 flex items-center justify-center text-[10px] font-bold text-emerald-950"
                  style={{
                    bottom: `${hookPos}%`,
                    height: '24%',
                  }}
                >
                  KAIL
                </div>

                {/* Moving Fish Icon */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 text-2xl transition-all duration-100 pointer-events-none"
                  style={{ bottom: `${fishPos}%` }}
                >
                  🐟
                </div>
              </div>

              {/* Progress & Tap Button Box */}
              <div className="flex-1 flex flex-col justify-between h-64 py-1 space-y-2">
                {/* Catch Progress Bar */}
                <div>
                  <span className="text-[11px] font-bold text-[#78634B]">Kekuatan Senar</span>
                  <div className="w-full bg-[#EFE9D8] rounded-full h-4 border border-[#D8CEBE] overflow-hidden p-0.5 mt-0.5">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all duration-150"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Big Tap-Tap Screen Button */}
                <button
                  onClick={handleTapReel}
                  className="flex-1 w-full rounded-2xl bg-gradient-to-tr from-sky-600 via-sky-500 to-cyan-400 text-white font-heading font-black text-lg shadow-lg active:scale-95 transition-transform flex flex-col items-center justify-center border-4 border-white/80 select-none"
                >
                  <span className="text-3xl">🎣</span>
                  <span className="tracking-wider mt-1">TAP REEL!</span>
                  <span className="text-[10px] font-medium text-sky-100 opacity-90">
                    Tap berulang untuk naik
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* State 5: CAUGHT */}
        {gameState === 'caught' && lastCatch && (
          <div className="text-center py-4 space-y-3 bg-[#EFE9D8] border border-[#D8CEBE] rounded-2xl p-4">
            <span className="text-5xl animate-bounce inline-block">{lastCatch.icon}</span>
            <div>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                {lastCatch.rarity}
              </span>
              <h3 className="text-base font-extrabold text-[#343B35] mt-1.5">
                {lastCatch.name}
              </h3>
              <p className="text-xs text-[#78634B]">
                Berat: {lastCatch.weight} kg • Hasil Pancingan Kota
              </p>
            </div>

            <div className="bg-[#FFFDF9] border border-[#D8CEBE] rounded-xl p-2.5 max-w-xs mx-auto flex items-center justify-center space-x-2 text-xs font-bold text-[#668B65]">
              <Coins className="w-4 h-4 text-amber-500" />
              <span>+{lastCatch.price} Koin Warga telah ditambahkan!</span>
            </div>

            <div className="flex gap-2 pt-1 max-w-xs mx-auto">
              <Button
                variant="primary"
                onClick={handleCast}
                className="flex-1 font-bold text-xs bg-sky-600 hover:bg-sky-700"
              >
                Mancing Lagi 🎣
              </Button>
              <Button variant="secondary" onClick={onClose} className="text-xs font-bold">
                Selesai
              </Button>
            </div>
          </div>
        )}

        {/* State 6: FAILED */}
        {gameState === 'failed' && (
          <div className="text-center py-6 space-y-3">
            <span className="text-4xl">💨</span>
            <h4 className="text-sm font-extrabold text-[#343B35]">
              Yah, Ikannya Berhasil Lepas!
            </h4>
            <p className="text-xs text-[#78634B] max-w-xs mx-auto">
              Senar terlalu kendur atau kail lepas. Jangan menyerah, pasang umpan baru dan coba lagi!
            </p>
            <Button
              variant="primary"
              onClick={handleCast}
              className="font-bold text-xs bg-sky-600 hover:bg-sky-700"
            >
              Lempar Ulang Kail 🔄
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
