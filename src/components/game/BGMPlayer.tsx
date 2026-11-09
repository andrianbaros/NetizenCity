// ============================================================
// NETIZENCITY - Background Music & Audio Controller (Fitur 8)
// Mempersiapkan pemutar audio BGM dengan dukungan file /public/audio/bgm.mp3
// serta ambient audio fallback jika lagu belum ditentukan
// ============================================================

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Volume2, VolumeX, Music, Disc } from 'lucide-react'

export default function BGMPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.4)
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [hasCustomTrack, setHasCustomTrack] = useState(false)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const synthIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Initialize audio on client
  useEffect(() => {
    if (typeof window === 'undefined') return

    const audio = new Audio('/audio/bgm.mp3')
    audio.loop = true
    audio.volume = volume
    audioRef.current = audio

    // Check if /audio/bgm.mp3 exists
    fetch('/audio/bgm.mp3', { method: 'HEAD' })
      .then((res) => {
        if (res.ok) setHasCustomTrack(true)
      })
      .catch(() => {})

    const handleRemoteToggle = () => {
      togglePlay()
    }
    window.addEventListener('toggle-nc-bgm', handleRemoteToggle)

    return () => {
      window.removeEventListener('toggle-nc-bgm', handleRemoteToggle)
      audio.pause()
      if (synthIntervalRef.current) clearInterval(synthIntervalRef.current)
      if (audioCtxRef.current) audioCtxRef.current.close().catch(() => {})
    }
  }, [isPlaying, hasCustomTrack, volume])

  // Procedural cozy ambient chime fallback
  const startProceduralAmbient = () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      }
      const ctx = audioCtxRef.current
      if (ctx.state === 'suspended') ctx.resume()

      const CHORD_NOTES = [261.63, 329.63, 392.0, 523.25, 587.33, 659.25] // C, E, G, C, D, E

      synthIntervalRef.current = setInterval(() => {
        if (!isPlaying || ctx.state !== 'running') return
        const note = CHORD_NOTES[Math.floor(Math.random() * CHORD_NOTES.length)]
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(note, ctx.currentTime)

        const noteVol = volume * 0.05
        gain.gain.setValueAtTime(0.001, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(noteVol, ctx.currentTime + 0.4)
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.5)

        osc.connect(gain)
        gain.connect(ctx.destination)
        osc.start()
        osc.stop(ctx.currentTime + 2.5)
      }, 3000)
    } catch {}
  }

  const stopProceduralAmbient = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current)
      synthIntervalRef.current = null
    }
  }

  const togglePlay = () => {
    const nextState = !isPlaying
    setIsPlaying(nextState)

    if (nextState) {
      if (hasCustomTrack && audioRef.current) {
        audioRef.current.play().catch(() => {})
      } else {
        startProceduralAmbient()
      }
    } else {
      if (audioRef.current) audioRef.current.pause()
      stopProceduralAmbient()
    }
  }

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol)
    if (audioRef.current) audioRef.current.volume = newVol
  }

  return (
    <div className="relative flex items-center">
      <button
        onClick={togglePlay}
        onMouseEnter={() => setShowVolumeSlider(true)}
        className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all shadow-xs ${
          isPlaying
            ? 'bg-[#668B65] text-white border-[#527051]'
            : 'bg-[#F7F4E9] text-[#78634B] border-[#D8CEBE] hover:bg-[#EFE9D8]'
        }`}
        title={
          hasCustomTrack
            ? isPlaying
              ? 'Matikan Musik BGM'
              : 'Nyalakan Musik BGM'
            : isPlaying
            ? 'Matikan Nada Ambient'
            : 'Nyalakan BGM (Siap menerima file /public/audio/bgm.mp3)'
        }
      >
        {isPlaying ? (
          <Volume2 className="w-4 h-4 animate-pulse" />
        ) : (
          <VolumeX className="w-4 h-4" />
        )}
      </button>

      {/* Floating Volume Slider on hover/focus */}
      {showVolumeSlider && (
        <div
          onMouseLeave={() => setShowVolumeSlider(false)}
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-[#F7F4E9]/98 backdrop-blur-md border border-[#D8CEBE] rounded-xl p-2.5 shadow-xl w-44 flex flex-col items-center space-y-1.5 z-50 text-[10px] font-bold text-[#78634B]"
        >
          <div className="flex items-center justify-between w-full">
            <span className="flex items-center">
              <Music className="w-3 h-3 mr-1 text-[#668B65]" />
              Volume
            </span>
            <span>{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => handleVolumeChange(Number(e.target.value))}
            className="w-full accent-[#668B65] cursor-pointer"
          />
          <div className="text-[9px] text-[#78634B] text-center leading-tight border-t border-[#D8CEBE] pt-1.5 w-full">
            <div className="font-extrabold text-[#343B35]">Chill Wave</div>
            <div className="text-[8px] text-[#78634B]/80 font-normal mt-0.5">Kevin MacLeod (CC-BY 4.0)</div>
          </div>
        </div>
      )}
    </div>
  )
}
