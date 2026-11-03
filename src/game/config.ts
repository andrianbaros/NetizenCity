// ============================================================
// NETIZENCITY - Phaser 3 Game Configuration
// ============================================================

import * as Phaser from 'phaser'
import { BootScene } from './scenes/BootScene'
import { PreloadScene } from './scenes/PreloadScene'
import { CityScene } from './scenes/CityScene'

export const createGameConfig = (
  parent: string | HTMLElement
): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  parent,
  width: typeof window !== 'undefined' ? window.innerWidth : 1280,
  height: typeof window !== 'undefined' ? window.innerHeight : 720,
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.RESIZE,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, PreloadScene, CityScene],
  backgroundColor: '#0f172a',
})
