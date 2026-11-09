'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import GameHUD from '@/components/game/GameHUD'
import CityGateModal from '@/components/game/CityGateModal'
import { LoadingScreen } from '@/components/ui/Loading'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'

// Dynamically import GameCanvas with SSR disabled because WebGL/Three.js requires browser window/canvas
const GameCanvas = dynamic(() => import('@/components/game/GameCanvas'), {
  ssr: false,
  loading: () => <LoadingScreen message="Memuat dunia 3D NETIZENCITY (Day 1-9)..." />,
})

export default function CityPage() {
  const [isClient, setIsClient] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const profile = useCitizenStore((s) => s.profile)

  useEffect(() => {
    setIsClient(true)

    // Check if citizen profile with valid KTN already exists
    fetch('/api/citizens/me')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.citizen?.ktn_number) {
          setHasAccess(true)
        } else if (profile?.ktnNumber) {
          setHasAccess(true)
        } else {
          setHasAccess(false)
        }
      })
      .catch(() => {
        if (profile?.ktnNumber) {
          setHasAccess(true)
        } else {
          setHasAccess(false)
        }
      })
      .finally(() => {
        setCheckingAuth(false)
      })
  }, [profile?.ktnNumber])

  if (!isClient || checkingAuth) {
    return <LoadingScreen message="Memeriksa Izin Masuk Gerbang Netizen City..." />
  }

  // FITUR 1: Gate akses kota — Belum bisa melihat kota sebelum Login / Follow / Buat KTN
  if (!hasAccess) {
    return (
      <main className="relative w-full h-[100dvh] min-h-[100dvh] overflow-hidden bg-[#EFE9D8] flex items-center justify-center p-4">
        {/* Background diorama atmosphere pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(#D8CEBE_1px,transparent_1px)] [background-size:24px_24px] opacity-60 pointer-events-none" />

        <CityGateModal
          isOpen={!hasAccess}
          onSuccess={() => setHasAccess(true)}
        />
      </main>
    )
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
