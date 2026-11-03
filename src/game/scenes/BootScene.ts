// ============================================================
// NETIZENCITY - Boot Scene
// ============================================================

import * as Phaser from 'phaser'

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' })
  }

  create() {
    // Transition immediately to asset generation and preload
    this.scene.start('PreloadScene')
  }
}
