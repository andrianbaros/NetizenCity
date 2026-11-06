'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import GameHUD from '@/components/game/GameHUD'
import { LoadingScreen } from '@/components/ui/Loading'

// Dynamically import GameCanvas with SSR disabled because WebGL/Three.js requires browser window/canvas
const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
  ssr: false,
  loading: () => <LoadingScreen message="Memuat dunia 3D NETIZENCITY (Day 1-9)..." />,
})

export default function CityPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return <LoadingScreen message="Menghubungkan ke NETIZENCITY..." />
  }

  return (
    <main className="relative w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-[#CDE7F0]">
      {/* 3D Diorama Three.js Game Canvas */}
      <GameCanvas />

      {/* Modern Overlay Game HUD */}
      <GameHUD />
    </main>
  )
}
