'use client'

import React from 'react'
import { MapPin, Navigation } from 'lucide-react'
import { useGameStore } from '@/lib/stores/useGameStore'
import { useUIStore } from '@/lib/stores/useUIStore'

export default function MiniMap() {
  const playerPosition = useGameStore((s) => s.playerPosition)
  const currentDistrict = useGameStore((s) => s.currentDistrict)
  const isMiniMapExpanded = useUIStore((s) => s.isMiniMapExpanded)
  const toggleMiniMap = useUIStore((s) => s.toggleMiniMap)

  // Map dimensions in Phaser: 3200 x 2400
  const normalizedX = (playerPosition.x / 3200) * 100
  const normalizedY = (playerPosition.y / 2400) * 100

  const districtNames: Record<string, string> = {
    town_square: 'Alun-Alun Pusat',
    residential: 'Perumahan Utara',
    commercial: 'Komersial & Mall',
    industrial: 'Kawasan Industri',
    airport: 'Bandara Internasional',
    entertainment: 'Taman & Hiburan',
  }

  return (
    <div
      onClick={toggleMiniMap}
      className={`cursor-pointer transition-all duration-200 bg-slate-900/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden ${
        isMiniMapExpanded ? 'w-64 h-64' : 'w-40 h-32'
      }`}
    >
      {/* Header */}
      <div className="px-3 py-1.5 bg-slate-950/70 border-b border-slate-800 flex items-center justify-between text-[11px] font-semibold text-slate-300">
        <div className="flex items-center space-x-1">
          <Navigation className="w-3 h-3 text-blue-400" />
          <span>Mini Map</span>
        </div>
        <span className="text-[10px] text-blue-400 font-mono">
          {districtNames[currentDistrict] || 'Netizen City'}
        </span>
      </div>

      {/* Map visual representation */}
      <div className="relative w-full h-[calc(100%-28px)] bg-slate-950 p-2">
        {/* District Zones */}
        {/* Residential (North) */}
        <div className="absolute top-2 left-2 right-2 h-7 bg-emerald-950/50 border border-emerald-500/20 rounded flex items-center justify-center text-[9px] text-emerald-400 font-medium">
          Perumahan
        </div>

        {/* Town Square (Center) */}
        <div className="absolute top-11 left-1/2 -translate-x-1/2 w-14 h-9 bg-blue-950/60 border border-blue-500/30 rounded flex items-center justify-center text-[9px] text-blue-400 font-bold">
          Pusat
        </div>

        {/* Commercial (East) */}
        <div className="absolute top-10 right-2 w-10 h-12 bg-amber-950/50 border border-amber-500/20 rounded flex items-center justify-center text-[8px] text-amber-400 text-center font-medium">
          Mall
        </div>

        {/* Industrial (South) */}
        <div className="absolute bottom-2 left-6 right-16 h-7 bg-slate-800/50 border border-slate-600/20 rounded flex items-center justify-center text-[9px] text-slate-300 font-medium">
          Industri
        </div>

        {/* Airport (South East) */}
        <div className="absolute bottom-2 right-2 w-12 h-7 bg-sky-950/50 border border-sky-500/20 rounded flex items-center justify-center text-[8px] text-sky-400 text-center font-medium">
          Bandara
        </div>

        {/* Player Indicator Pin */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75"
          style={{
            left: `${Math.max(5, Math.min(95, normalizedX))}%`,
            top: `${Math.max(5, Math.min(95, normalizedY))}%`,
          }}
        >
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-blue-400 opacity-75" />
            <MapPin className="relative w-3.5 h-3.5 text-blue-400 fill-blue-500" />
          </div>
        </div>
      </div>
    </div>
  )
}
