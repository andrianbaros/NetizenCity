'use client'

import React, { useEffect, useRef } from 'react'
import { createGameConfig } from '@/game/config'
import type * as Phaser from 'phaser'

export default function GameCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)
  const gameRef = useRef<Phaser.Game | null>(null)

  useEffect(() => {
    let isMounted = true

    async function initGame() {
      if (!containerRef.current || gameRef.current) return

      const PhaserLib = await import('phaser')
      if (!isMounted) return

      const config = createGameConfig(containerRef.current)
      gameRef.current = new PhaserLib.Game(config)
    }

    initGame()

    return () => {
      isMounted = false
      if (gameRef.current) {
        gameRef.current.destroy(true)
        gameRef.current = null
      }
    }
  }, [])

  return (
    <div
      ref={containerRef}
      id="phaser-game-container"
      className="w-full h-full absolute inset-0 overflow-hidden bg-slate-950"
    />
  )
}
