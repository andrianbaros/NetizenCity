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

  // 3D City bounds: X (-240 to +240), Z (-200 to +160)
  const normalizedX = ((playerPosition.x + 240) / 480) * 100
  const normalizedY = ((playerPosition.y + 200) / 360) * 100

  const districtNames: Record<string, string> = {
    town_square: 'Alun-Alun Pusat',
    residential: 'Perumahan Utara',
    commercial: 'Komersial & Mall',
    industrial: 'Kawasan Industri',
    airport: 'Bandara Internasional',
    entertainment: 'Taman & Hiburan',
    'Downtown (Pusat Kota)': 'Pusat Pemerintahan',
    'Komersial & Mall': 'Mall & Ruko',
    'Pusat Kota': 'Monumen Akbar',
    'Distrik Investor': 'Menara Investor',
    'Fasilitas Publik': 'Fasilitas Kota',
    Transportasi: 'Stasiun Kereta',
    'Kawasan Kerukunan': 'Masjid & Gereja',
    'Bandara & Kedatangan': 'Bandara Netizen',
    'Olahraga & Hiburan': 'Stadion Atletik',
    'Distrik Riset': 'Lab & Observatorium',
    'Kawasan Wisata & Edukasi': 'Kebun Binatang',
    'Distrik Riset & Pendidikan': 'Universitas',
    'Kawasan Alam': 'Gunung & Air Terjun',
    'Kawasan Alam & Wisata': 'Pantai Netizen Beach',
  }

  return (
    <div
      onClick={toggleMiniMap}
      className={`cursor-pointer transition-all duration-200 bg-[#FFFDF9]/95 border-2 border-[#EADBCC] rounded-2xl shadow-xl backdrop-blur-md overflow-hidden ${
        isMiniMapExpanded ? 'w-64 h-64' : 'w-40 h-32'
      }`}
    >
      {/* Header */}
      <div className="px-3 py-1.5 bg-[#FFF9F1] border-b-2 border-[#EADBCC] flex items-center justify-between text-[11px] font-extrabold text-[#3B3340]">
        <div className="flex items-center space-x-1">
          <Navigation className="w-3.5 h-3.5 text-[#F4A98C]" />
          <span>Mini Map</span>
        </div>
        <span className="text-[10px] text-[#2C6ECB] font-bold font-mono">
          {districtNames[currentDistrict] || 'Netizen City'}
        </span>
      </div>

      {/* Map visual representation */}
      <div className="relative w-full h-[calc(100%-28px)] bg-[#F8F4EE] p-2">
        {/* District Zones */}
        {/* Residential (North) */}
        <div className="absolute top-2 left-2 right-2 h-7 bg-[#E8F8F0] border border-[#A8DCC8] rounded-lg flex items-center justify-center text-[9px] text-[#1E7250] font-bold shadow-xs">
          Perumahan
        </div>

        {/* Town Square (Center) */}
        <div className="absolute top-11 left-1/2 -translate-x-1/2 w-14 h-9 bg-[#EBF4FD] border border-[#A9C8EC] rounded-lg flex items-center justify-center text-[9px] text-[#1D60A6] font-extrabold shadow-xs">
          Pusat
        </div>

        {/* Commercial (East) */}
        <div className="absolute top-10 right-2 w-10 h-12 bg-[#FFF0EB] border border-[#F4A98C] rounded-lg flex items-center justify-center text-[8px] text-[#B85838] text-center font-bold shadow-xs">
          Mall
        </div>

        {/* Industrial (South) */}
        <div className="absolute bottom-2 left-6 right-16 h-7 bg-[#F0ECE7] border border-[#D9C8B5] rounded-lg flex items-center justify-center text-[9px] text-[#5C5265] font-bold shadow-xs">
          Industri
        </div>

        {/* Airport (South East) */}
        <div className="absolute bottom-2 right-2 w-12 h-7 bg-[#F3EEFA] border border-[#C9B8E8] rounded-lg flex items-center justify-center text-[8px] text-[#6A3F98] text-center font-bold shadow-xs">
          Bandara
        </div>

        {/* Player Indicator Pin */}
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none transition-all duration-75 z-20"
          style={{
            left: `${Math.max(8, Math.min(92, normalizedX))}%`,
            top: `${Math.max(8, Math.min(92, normalizedY))}%`,
          }}
        >
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-3.5 w-3.5 rounded-full bg-[#F4A98C] opacity-75" />
            <MapPin className="relative w-4 h-4 text-[#F4A98C] fill-[#F4A98C] drop-shadow" />
          </div>
        </div>
      </div>
    </div>
  )
}
