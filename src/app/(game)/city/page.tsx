'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import GameHUD from '@/components/game/GameHUD'
import { LoadingScreen } from '@/components/ui/Loading'

// Dynamically import GameCanvas with SSR disabled because Phaser requires browser window/canvas
const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
  ssr: false,
  loading: () => <LoadingScreen message="Memuat mesin kota 2D..." />,
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
    <main className="relative w-full h-full overflow-hidden bg-slate-950">
      {/* 2D Isometric Phaser Game Canvas */}
      <GameCanvas />

      {/* Modern Overlay Game HUD */}
      <GameHUD />
    </main>
  )
}
