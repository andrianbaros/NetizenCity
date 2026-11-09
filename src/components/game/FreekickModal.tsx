// ============================================================
// NETIZENCITY - Soccer Freekick Penalty Minigame (Fitur 5)
// Minigame tendangan bebas di Stadion Netizen City
// ============================================================

'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Trophy,
  RotateCcw,
  Sparkles,
  Coins,
  Flame,
  Award,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'
import { useUIStore } from '@/lib/stores/useUIStore'

type ShotTarget = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center'

interface FreekickModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function FreekickModal({ isOpen, onClose }: FreekickModalProps) {
  const updateBalance = useCitizenStore((s) => s.updateBalance)
  const addNotification = useUIStore((s) => s.addNotification)

  const [shotsLeft, setShotsLeft] = useState(5)
  const [goalsScored, setGoalsScored] = useState(0)
  const [history, setHistory] = useState<Array<'goal' | 'miss'>>([])
  const [isKicking, setIsKicking] = useState(false)
  const [lastResult, setLastResult] = useState<string | null>(null)
  const [isGameOver, setIsGameOver] = useState(false)

  // Ball & Keeper animation states
  const [ballPos, setBallPos] = useState({ x: 50, y: 15, scale: 1, rot: 0 })
  const [keeperPos, setKeeperPos] = useState(50) // 20% to 80%
  const [keeperDiving, setKeeperDiving] = useState<'left' | 'right' | 'center' | null>(null)

  // Keeper idle pacing
  useEffect(() => {
    if (!isOpen || isKicking || isGameOver) return
    const interval = setInterval(() => {
      setKeeperPos((prev) => (prev <= 40 ? 60 : 35))
    }, 1200)
    return () => clearInterval(interval)
  }, [isOpen, isKicking, isGameOver])

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      resetGame()
    }
  }, [isOpen])

  const resetGame = () => {
    setShotsLeft(5)
    setGoalsScored(0)
    setHistory([])
    setIsKicking(false)
    setLastResult(null)
    setIsGameOver(false)
    setBallPos({ x: 50, y: 15, scale: 1, rot: 0 })
    setKeeperDiving(null)
    setKeeperPos(50)
  }

  // Sound effects via Web Audio API synth
  const playWhistleSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(2200, audioCtx.currentTime)
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.3)
    } catch {}
  }

  const playKickSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(160, audioCtx.currentTime)
      osc.frequency.exponentialRampToValueAtTime(40, audioCtx.currentTime + 0.12)
      gain.gain.setValueAtTime(0.4, audioCtx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.12)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start()
      osc.stop(audioCtx.currentTime + 0.12)
    } catch {}
  }

  const playCheerSound = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      for (let i = 0; i < 3; i++) {
        const osc = audioCtx.createOscillator()
        const gain = audioCtx.createGain()
        osc.type = 'triangle'
        osc.frequency.setValueAtTime(350 + i * 120, audioCtx.currentTime + i * 0.1)
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime + i * 0.1)
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5)
        osc.connect(gain)
        gain.connect(audioCtx.destination)
        osc.start(audioCtx.currentTime + i * 0.1)
        osc.stop(audioCtx.currentTime + 0.5)
      }
    } catch {}
  }

  // Execute kick toward target
  const handleKick = (target: ShotTarget) => {
    if (isKicking || isGameOver || shotsLeft <= 0) return

    setIsKicking(true)
    setLastResult(null)
    playKickSound()

    // Determine target coordinates in goal space (% of pitch container)
    let targetX = 50
    let targetY = 70

    if (target === 'top-left') {
      targetX = 28
      targetY = 82
    } else if (target === 'top-right') {
      targetX = 72
      targetY = 82
    } else if (target === 'bottom-left') {
      targetX = 30
      targetY = 64
    } else if (target === 'bottom-right') {
      targetX = 70
      targetY = 64
    } else if (target === 'center') {
      targetX = 50
      targetY = 74
    }

    // Keeper AI choice (dives left, right, or stays middle)
    const dives: Array<'left' | 'right' | 'center'> = ['left', 'right', 'center']
    const keeperChoice = dives[Math.floor(Math.random() * dives.length)]
    setKeeperDiving(keeperChoice)

    if (keeperChoice === 'left') setKeeperPos(30)
    else if (keeperChoice === 'right') setKeeperPos(70)
    else setKeeperPos(50)

    // Ball flight animation
    setBallPos({
      x: targetX,
      y: targetY,
      scale: 0.55,
      rot: 720,
    })

    // Outcome check after ball flight
    setTimeout(() => {
      let isGoal = false
      let resultText = ''

      const isCornerShot = target === 'top-left' || target === 'top-right'
      const keeperDivedCorrectly =
        (keeperChoice === 'left' && (target === 'top-left' || target === 'bottom-left')) ||
        (keeperChoice === 'right' && (target === 'top-right' || target === 'bottom-right')) ||
        (keeperChoice === 'center' && target === 'center')

      if (isCornerShot && keeperDivedCorrectly) {
        // High corner has chance to beat keeper even if guessed right!
        if (Math.random() < 0.45) {
          isGoal = true
          resultText = 'GOOOLLL!! ⚽🔥 Tendangan pojok atas tak terjangkau kiper!'
        } else {
          resultText = 'DITEPAK KIPER! 🧤 Penyelamatan luar biasa!'
        }
      } else if (keeperDivedCorrectly) {
        resultText = 'DITANGKAP KIPER! 🧤 Kiper membaca arah bola!'
      } else {
        isGoal = true
        resultText = 'GOOOLLL!! ⚽🎉 Kiper terkecoh salah langkah!'
      }

      setLastResult(resultText)

      if (isGoal) {
        playCheerSound()
        setGoalsScored((prev) => prev + 1)
        setHistory((prev) => [...prev, 'goal'])
        updateBalance(25)
      } else {
        setHistory((prev) => [...prev, 'miss'])
      }

      const nextShots = shotsLeft - 1
      setShotsLeft(nextShots)

      // Reset ball position for next shot
      setTimeout(() => {
        setBallPos({ x: 50, y: 15, scale: 1, rot: 0 })
        setKeeperDiving(null)
        setKeeperPos(50)
        setIsKicking(false)

        if (nextShots <= 0) {
          setIsGameOver(true)
          playWhistleSound()
          // Grand bonus if scored 3+ goals
          if (goalsScored + (isGoal ? 1 : 0) >= 3) {
            updateBalance(50)
            addNotification({
              title: 'Top Scorer Netizen! ⚽🏆',
              message: `Mencetak ${goalsScored + (isGoal ? 1 : 0)} gol! Bonus +50 Koin!`,
              type: 'success',
            })
          }
        }
      }, 1000)
    }, 600)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Stadion Netizen - Adu Penalti Freekick"
      maxWidth="md"
    >
      <div className="space-y-3.5 font-sans text-[#343B35]">
        {/* Score & Shots Status Bar */}
        <div className="flex items-center justify-between p-3 bg-[#EFE9D8] border border-[#D8CEBE] rounded-2xl">
          <div className="flex items-center space-x-2">
            <span className="text-xl">⚽</span>
            <div>
              <span className="text-[10px] font-bold text-[#78634B] uppercase">Sisa Tendangan</span>
              <div className="flex items-center space-x-1 mt-0.5">
                {[...Array(5)].map((_, i) => (
                  <span
                    key={i}
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-extrabold border ${
                      i < history.length
                        ? history[i] === 'goal'
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : 'bg-rose-500 text-white border-rose-600'
                        : i === history.length
                        ? 'bg-amber-400 text-amber-950 border-amber-500 animate-pulse'
                        : 'bg-[#D8CEBE] text-[#78634B] border-transparent'
                    }`}
                  >
                    {i < history.length ? (history[i] === 'goal' ? '✓' : '✕') : i + 1}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] font-bold text-[#78634B] uppercase">Skor Gol</span>
            <div className="text-base font-black text-[#343B35]">
              {goalsScored} / 5 Gol
            </div>
          </div>
        </div>

        {/* 2.5D STADIUM GOAL PITCH ARENA */}
        <div className="relative w-full h-64 sm:h-72 rounded-2xl overflow-hidden border-2 border-[#D8CEBE] bg-gradient-to-b from-sky-300 via-sky-200 to-emerald-700 shadow-inner flex flex-col justify-end select-none">
          {/* Stadium Crowd / Grandstand Background */}
          <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-[#2C3E50] to-[#34495E] flex items-center justify-around px-4 opacity-90">
            <div className="text-[11px] font-extrabold text-white/70 tracking-wider">
              🏟️ STADION NETIZEN CITY
            </div>
            <div className="flex space-x-1 text-sm animate-pulse">
              <span>👏</span>
              <span>🙌</span>
              <span>📣</span>
              <span>👏</span>
            </div>
          </div>

          {/* Green Grass Pitch */}
          <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-b from-emerald-600 to-emerald-800 border-t-4 border-white/60">
            {/* Penalty Box Lines */}
            <div className="absolute inset-x-8 top-0 h-28 border-2 border-white/40 border-t-0 rounded-b-xl" />
            <div className="absolute left-1/2 -translate-x-1/2 top-10 w-2.5 h-2.5 rounded-full bg-white/70 shadow-xs" />
          </div>

          {/* Goal Frame & Net */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-20 w-64 sm:w-80 h-32 border-4 border-white rounded-t-lg bg-white/10 backdrop-blur-[1px] shadow-lg flex items-center justify-center">
            {/* Net Grid Pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)] [background-size:12px_12px] opacity-40 pointer-events-none" />

            {/* Goalkeeper Sprite / Mesh */}
            <div
              className="absolute bottom-0 text-3xl transition-all duration-300 transform -translate-x-1/2 pointer-events-none"
              style={{
                left: `${keeperPos}%`,
                transform: keeperDiving === 'left' ? 'translateX(-50%) rotate(-35deg)' : keeperDiving === 'right' ? 'translateX(-50%) rotate(35deg)' : 'translateX(-50%)',
              }}
            >
              🧤🧍‍♂️
            </div>
          </div>

          {/* The Soccer Ball */}
          <div
            className="absolute text-3xl transition-all duration-500 ease-out transform -translate-x-1/2 -translate-y-1/2 pointer-events-none drop-shadow-md z-20"
            style={{
              left: `${ballPos.x}%`,
              bottom: `${ballPos.y}%`,
              transform: `translate(-50%, -50%) scale(${ballPos.scale}) rotate(${ballPos.rot}deg)`,
            }}
          >
            ⚽
          </div>

          {/* Result Alert Toast inside Goal */}
          {lastResult && (
            <div className="absolute top-26 inset-x-4 z-30 mx-auto max-w-xs text-center py-1.5 px-3 rounded-full bg-black/80 backdrop-blur-md text-white text-xs font-bold shadow-lg animate-in fade-in">
              {lastResult}
            </div>
          )}
        </div>

        {/* TARGET DIRECTION BUTTONS */}
        {!isGameOver ? (
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-[#78634B] flex items-center justify-center">
              Pilih Sudut Tembakan ke Gawang:
            </span>
            <div className="grid grid-cols-3 gap-2 max-w-sm mx-auto">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleKick('top-left')}
                disabled={isKicking}
                className="font-bold text-xs"
              >
                ↖️ Pojok Kiri Atas
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleKick('center')}
                disabled={isKicking}
                className="font-bold text-xs"
              >
                ⬆️ Keras Tengah
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleKick('top-right')}
                disabled={isKicking}
                className="font-bold text-xs"
              >
                ↗️ Pojok Kanan Atas
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleKick('bottom-left')}
                disabled={isKicking}
                className="font-bold text-xs"
              >
                ↙️ Bawah Kiri
              </Button>
              <div />
              <Button
                variant="secondary"
                size="sm"
                onClick={() => handleKick('bottom-right')}
                disabled={isKicking}
                className="font-bold text-xs"
              >
                ↘️ Bawah Kanan
              </Button>
            </div>
          </div>
        ) : (
          /* GAME OVER SUMMARY */
          <div className="text-center py-3 bg-[#EFE9D8] border border-[#D8CEBE] rounded-2xl p-4 space-y-2.5">
            <h3 className="font-extrabold text-sm text-[#343B35] flex items-center justify-center">
              <Trophy className="w-4 h-4 text-amber-500 mr-1.5" />
              Sesi Adu Penalti Selesai!
            </h3>
            <p className="text-xs text-[#78634B]">
              Kamu berhasil mencetak <strong>{goalsScored} dari 5 gol</strong>! Total{' '}
              <strong>+{goalsScored * 25 + (goalsScored >= 3 ? 50 : 0)} Koin Warga</strong> didapat!
            </p>
            <div className="flex gap-2 justify-center pt-1">
              <Button
                variant="primary"
                onClick={resetGame}
                className="font-bold text-xs bg-[#668B65] hover:bg-[#527051]"
              >
                <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                Main Lagi
              </Button>
              <Button variant="secondary" onClick={onClose} className="font-bold text-xs">
                Selesai
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  )
}
