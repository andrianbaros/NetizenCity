// ============================================================
// NETIZENCITY - Preload & Procedural Asset Generation Scene
// ============================================================

import * as Phaser from 'phaser'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'
import {
  resolveAvatarColors,
  drawCharacterSpritesheetCanvas,
} from '@/game/utils/characterRenderer'

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PreloadScene' })
  }

  preload() {
    // Show a clean loading bar
    const width = this.cameras.main.width
    const height = this.cameras.main.height

    const progressBar = this.add.graphics()
    const progressBox = this.add.graphics()
    progressBox.fillStyle(0x1e293b, 0.8)
    progressBox.fillRect(width / 2 - 160, height / 2 - 25, 320, 50)

    const loadingText = this.add.text(width / 2, height / 2 - 50, 'Mempersiapkan Kota...', {
      font: '14px monospace',
      color: '#38bdf8',
    })
    loadingText.setOrigin(0.5, 0.5)

    this.load.on('progress', (value: number) => {
      progressBar.clear()
      progressBar.fillStyle(0x38bdf8, 1)
      progressBar.fillRect(width / 2 - 150, height / 2 - 15, 300 * value, 30)
    })

    // Generate procedural pixel assets dynamically
    this.generatePixelAssets()
    this.generateCityLifeAssets()
  }

  create() {
    this.createPlayerAnimations()
    this.createNPCAnimations()
    this.scene.start('CityScene')
  }

  private generatePixelAssets() {
    // 1. Grass Tile (32x32)
    const grass = this.textures.createCanvas('tile_grass', 32, 32)
    if (grass) {
      const ctx = grass.getContext()
      ctx.fillStyle = '#4ade80' // base green
      ctx.fillRect(0, 0, 32, 32)
      ctx.fillStyle = '#22c55e'
      for (let i = 0; i < 32; i += 4) {
        for (let j = 0; j < 32; j += 4) {
          if ((i + j) % 8 === 0) ctx.fillRect(i, j, 2, 2)
        }
      }
      ctx.fillStyle = '#16a34a'
      ctx.fillRect(4, 4, 2, 2)
      ctx.fillRect(20, 16, 2, 2)
      ctx.fillRect(12, 24, 2, 2)
      grass.refresh()
    }

    // 2. Road Tile (32x32)
    const road = this.textures.createCanvas('tile_road', 32, 32)
    if (road) {
      const ctx = road.getContext()
      ctx.fillStyle = '#334155' // dark asphalt
      ctx.fillRect(0, 0, 32, 32)
      // Subtle asphalt texture
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(0, 0, 32, 1)
      ctx.fillRect(0, 31, 32, 1)
      // Dashed yellow line in center
      ctx.fillStyle = '#facc15'
      ctx.fillRect(14, 8, 4, 16)
      road.refresh()
    }

    // 3. Sidewalk Tile (32x32)
    const sidewalk = this.textures.createCanvas('tile_sidewalk', 32, 32)
    if (sidewalk) {
      const ctx = sidewalk.getContext()
      ctx.fillStyle = '#94a3b8' // light gray stone
      ctx.fillRect(0, 0, 32, 32)
      ctx.strokeStyle = '#64748b'
      ctx.lineWidth = 1
      ctx.strokeRect(1, 1, 30, 30)
      ctx.strokeRect(1, 1, 14, 14)
      ctx.strokeRect(17, 17, 14, 14)
      sidewalk.refresh()
    }

    // 4. Plaza Tile (32x32)
    const plaza = this.textures.createCanvas('tile_plaza', 32, 32)
    if (plaza) {
      const ctx = plaza.getContext()
      ctx.fillStyle = '#cbd5e1'
      ctx.fillRect(0, 0, 32, 32)
      ctx.strokeStyle = '#94a3b8'
      ctx.strokeRect(2, 2, 28, 28)
      ctx.fillStyle = '#e2e8f0'
      ctx.fillRect(4, 4, 24, 24)
      plaza.refresh()
    }

    // 5. Tree (48x64)
    const tree = this.textures.createCanvas('prop_tree', 48, 64)
    if (tree) {
      const ctx = tree.getContext()
      // Trunk
      ctx.fillStyle = '#78350f'
      ctx.fillRect(20, 36, 8, 24)
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      ctx.beginPath()
      ctx.ellipse(24, 60, 16, 4, 0, 0, Math.PI * 2)
      ctx.fill()
      // Leaves (round pixel foliage)
      ctx.fillStyle = '#15803d'
      ctx.beginPath()
      ctx.arc(24, 24, 20, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#16a34a'
      ctx.beginPath()
      ctx.arc(22, 20, 16, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#4ade80'
      ctx.beginPath()
      ctx.arc(18, 16, 8, 0, Math.PI * 2)
      ctx.fill()
      tree.refresh()
    }

    // 6. Streetlight (16x48)
    const lamp = this.textures.createCanvas('prop_lamp', 16, 48)
    if (lamp) {
      const ctx = lamp.getContext()
      ctx.fillStyle = '#475569'
      ctx.fillRect(7, 12, 2, 36)
      ctx.fillRect(5, 46, 6, 2)
      ctx.fillStyle = '#fef08a'
      ctx.fillRect(4, 6, 8, 6)
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(3, 4, 10, 2)
      lamp.refresh()
    }

    // 7. BUILDINGS: City Hall (128x128)
    const cityHall = this.textures.createCanvas('bld_city_hall', 128, 128)
    if (cityHall) {
      const ctx = cityHall.getContext()
      // Drop Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fillRect(8, 116, 112, 8)
      // Base / Steps
      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(12, 100, 104, 18)
      ctx.fillStyle = '#cbd5e1'
      ctx.fillRect(16, 96, 96, 6)
      // Main Body
      ctx.fillStyle = '#e2e8f0'
      ctx.fillRect(20, 48, 88, 50)
      // Pillars
      ctx.fillStyle = '#f8fafc'
      for (let x = 24; x <= 96; x += 18) {
        ctx.fillRect(x, 52, 10, 44)
      }
      // Roof / Pediment
      ctx.fillStyle = '#1e3a8a'
      ctx.beginPath()
      ctx.moveTo(16, 48)
      ctx.lineTo(64, 18)
      ctx.lineTo(112, 48)
      ctx.closePath()
      ctx.fill()
      // Clock tower
      ctx.fillStyle = '#1e40af'
      ctx.fillRect(52, 6, 24, 20)
      ctx.fillStyle = '#fef08a'
      ctx.beginPath()
      ctx.arc(64, 16, 6, 0, Math.PI * 2)
      ctx.fill()
      // Flagpole & Indonesian Red-White Flag
      ctx.fillStyle = '#64748b'
      ctx.fillRect(63, 0, 2, 8)
      ctx.fillStyle = '#ef4444' // red
      ctx.fillRect(65, 0, 10, 3)
      ctx.fillStyle = '#ffffff' // white
      ctx.fillRect(65, 3, 10, 3)
      cityHall.refresh()
    }

    // 8. Commercial Mall (128x112)
    const mall = this.textures.createCanvas('bld_mall', 128, 112)
    if (mall) {
      const ctx = mall.getContext()
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fillRect(6, 104, 116, 8)
      // Main structure
      ctx.fillStyle = '#3b82f6'
      ctx.fillRect(10, 30, 108, 76)
      // Glass storefronts
      ctx.fillStyle = '#93c5fd'
      ctx.fillRect(18, 68, 92, 34)
      ctx.strokeStyle = '#1d4ed8'
      ctx.lineWidth = 2
      ctx.strokeRect(18, 68, 92, 34)
      // Entrance sliding doors
      ctx.fillStyle = '#1e40af'
      ctx.fillRect(54, 76, 20, 26)
      // Mall Sign Banner
      ctx.fillStyle = '#f59e0b'
      ctx.fillRect(24, 16, 80, 20)
      ctx.fillStyle = '#0f172a'
      ctx.font = 'bold 10px monospace'
      ctx.fillText('NETIZEN MALL', 28, 30)
      mall.refresh()
    }

    // 9. Apartments (96x112)
    const apartments = this.textures.createCanvas('bld_apartments', 96, 112)
    if (apartments) {
      const ctx = apartments.getContext()
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fillRect(4, 104, 88, 8)
      // Building Brick
      ctx.fillStyle = '#b91c1c'
      ctx.fillRect(8, 20, 80, 86)
      // Roof parapet
      ctx.fillStyle = '#7f1d1d'
      ctx.fillRect(6, 14, 84, 8)
      // Windows grid
      ctx.fillStyle = '#fef08a'
      for (let y = 30; y <= 80; y += 18) {
        for (let x = 16; x <= 72; x += 18) {
          ctx.fillRect(x, y, 10, 12)
        }
      }
      // Main Entrance door
      ctx.fillStyle = '#451a03'
      ctx.fillRect(38, 84, 20, 22)
      apartments.refresh()
    }

    // 10. Small House (80x80)
    const house = this.textures.createCanvas('bld_house', 80, 80)
    if (house) {
      const ctx = house.getContext()
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      ctx.fillRect(4, 72, 72, 8)
      // House Body
      ctx.fillStyle = '#f1f5f9'
      ctx.fillRect(10, 36, 60, 38)
      // Roof (Pitched tile)
      ctx.fillStyle = '#ea580c'
      ctx.beginPath()
      ctx.moveTo(6, 36)
      ctx.lineTo(40, 12)
      ctx.lineTo(74, 36)
      ctx.closePath()
      ctx.fill()
      // Door
      ctx.fillStyle = '#78350f'
      ctx.fillRect(32, 52, 16, 22)
      // Windows
      ctx.fillStyle = '#38bdf8'
      ctx.fillRect(14, 46, 12, 12)
      ctx.fillRect(54, 46, 12, 12)
      house.refresh()
    }

    // 11. Factory / Industrial (128x112)
    const factory = this.textures.createCanvas('bld_factory', 128, 112)
    if (factory) {
      const ctx = factory.getContext()
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fillRect(6, 104, 116, 8)
      // Main warehouse body
      ctx.fillStyle = '#475569'
      ctx.fillRect(12, 40, 104, 66)
      // Sawtooth Roof
      ctx.fillStyle = '#334155'
      for (let x = 12; x < 116; x += 26) {
        ctx.beginPath()
        ctx.moveTo(x, 40)
        ctx.lineTo(x + 20, 24)
        ctx.lineTo(x + 26, 40)
        ctx.closePath()
        ctx.fill()
      }
      // Smokestack
      ctx.fillStyle = '#64748b'
      ctx.fillRect(96, 6, 14, 34)
      ctx.fillStyle = '#f97316'
      ctx.fillRect(94, 4, 18, 4)
      // Roller shutter / loading dock
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(40, 70, 48, 36)
      ctx.strokeStyle = '#64748b'
      ctx.strokeRect(40, 70, 48, 36)
      factory.refresh()
    }

    // 12. Airport Terminal (144x96)
    const airport = this.textures.createCanvas('bld_airport', 144, 96)
    if (airport) {
      const ctx = airport.getContext()
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.fillRect(4, 88, 136, 8)
      // Modern Curved Terminal
      ctx.fillStyle = '#e2e8f0'
      ctx.fillRect(10, 36, 124, 54)
      // Glass Facade
      ctx.fillStyle = '#38bdf8'
      ctx.fillRect(16, 50, 112, 38)
      // Control Tower
      ctx.fillStyle = '#cbd5e1'
      ctx.fillRect(100, 6, 24, 32)
      ctx.fillStyle = '#1e293b'
      ctx.fillRect(96, 2, 32, 10)
      // Sign
      ctx.fillStyle = '#0284c7'
      ctx.fillRect(20, 24, 70, 16)
      ctx.fillStyle = '#ffffff'
      ctx.font = 'bold 9px monospace'
      ctx.fillText('AIRPORT NC', 24, 36)
      airport.refresh()
    }

    // 13. Dynamic Character Spritesheet (96x144, 4 directions x 3 frames = 32x36 per frame)
    const charSheet = this.textures.createCanvas('character_spritesheet', 96, 144)
    if (charSheet) {
      const citizenProfile = useCitizenStore.getState().profile
      const colors = resolveAvatarColors(citizenProfile?.avatarConfig)
      drawCharacterSpritesheetCanvas(charSheet, colors)
    }
  }

  private createPlayerAnimations() {
    if (this.anims.exists('walk_down')) return
    if (!this.textures.exists('character_spritesheet')) return

    const sheet = this.textures.get('character_spritesheet')
    if (!sheet.has('0')) {
      sheet.add(0, 0, 0, 0, 32, 36)
      sheet.add(1, 0, 32, 0, 32, 36)
      sheet.add(2, 0, 64, 0, 32, 36)

      sheet.add(3, 0, 0, 36, 32, 36)
      sheet.add(4, 0, 32, 36, 32, 36)
      sheet.add(5, 0, 64, 36, 32, 36)

      sheet.add(6, 0, 0, 72, 32, 36)
      sheet.add(7, 0, 32, 72, 32, 36)
      sheet.add(8, 0, 64, 72, 32, 36)

      sheet.add(9, 0, 0, 108, 32, 36)
      sheet.add(10, 0, 32, 108, 32, 36)
      sheet.add(11, 0, 64, 108, 32, 36)
    }

    // Create walk & idle animations
    this.anims.create({
      key: 'walk_down',
      frames: [{ key: 'character_spritesheet', frame: 1 }, { key: 'character_spritesheet', frame: 0 }, { key: 'character_spritesheet', frame: 2 }],
      frameRate: 8,
      repeat: -1,
    })

    this.anims.create({
      key: 'walk_left',
      frames: [{ key: 'character_spritesheet', frame: 4 }, { key: 'character_spritesheet', frame: 3 }, { key: 'character_spritesheet', frame: 5 }],
      frameRate: 8,
      repeat: -1,
    })

    this.anims.create({
      key: 'walk_right',
      frames: [{ key: 'character_spritesheet', frame: 7 }, { key: 'character_spritesheet', frame: 6 }, { key: 'character_spritesheet', frame: 8 }],
      frameRate: 8,
      repeat: -1,
    })

    this.anims.create({
      key: 'walk_up',
      frames: [{ key: 'character_spritesheet', frame: 10 }, { key: 'character_spritesheet', frame: 9 }, { key: 'character_spritesheet', frame: 11 }],
      frameRate: 8,
      repeat: -1,
    })

    this.anims.create({
      key: 'idle_down',
      frames: [{ key: 'character_spritesheet', frame: 0 }],
      frameRate: 1,
    })

    this.anims.create({
      key: 'idle_left',
      frames: [{ key: 'character_spritesheet', frame: 3 }],
      frameRate: 1,
    })

    this.anims.create({
      key: 'idle_right',
      frames: [{ key: 'character_spritesheet', frame: 6 }],
      frameRate: 1,
    })

    this.anims.create({
      key: 'idle_up',
      frames: [{ key: 'character_spritesheet', frame: 9 }],
      frameRate: 1,
    })
  }

  private generateCityLifeAssets() {
    // 1. Grand Plaza Fountain (64x64)
    const fountain = this.textures.createCanvas('prop_fountain', 64, 64)
    if (fountain) {
      const ctx = fountain.getContext()
      // Outer shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.beginPath()
      ctx.ellipse(32, 54, 28, 8, 0, 0, Math.PI * 2)
      ctx.fill()
      // Outer stone rim
      ctx.fillStyle = '#64748b'
      ctx.beginPath()
      ctx.ellipse(32, 40, 26, 16, 0, 0, Math.PI * 2)
      ctx.fill()
      // Water pool
      ctx.fillStyle = '#38bdf8'
      ctx.beginPath()
      ctx.ellipse(32, 40, 22, 12, 0, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = '#0284c7'
      ctx.beginPath()
      ctx.ellipse(32, 42, 16, 8, 0, 0, Math.PI * 2)
      ctx.fill()
      // Center pedestal & bowl
      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(28, 20, 8, 20)
      ctx.beginPath()
      ctx.ellipse(32, 20, 14, 6, 0, 0, Math.PI * 2)
      ctx.fill()
      // Water spray
      ctx.fillStyle = '#bae6fd'
      ctx.fillRect(30, 8, 4, 12)
      ctx.fillRect(26, 12, 3, 6)
      ctx.fillRect(35, 12, 3, 6)
      fountain.refresh()
    }

    // 2. Park Bench (32x20)
    const bench = this.textures.createCanvas('prop_bench', 32, 20)
    if (bench) {
      const ctx = bench.getContext()
      ctx.fillStyle = 'rgba(0,0,0,0.25)'
      ctx.fillRect(2, 16, 28, 4)
      ctx.fillStyle = '#1e293b' // iron frame
      ctx.fillRect(4, 8, 3, 10)
      ctx.fillRect(25, 8, 3, 10)
      ctx.fillStyle = '#b45309' // wood slats
      ctx.fillRect(2, 4, 28, 4)
      ctx.fillRect(2, 9, 28, 4)
      ctx.fillStyle = '#d97706'
      ctx.fillRect(3, 5, 26, 2)
      bench.refresh()
    }

    // 3. Yellow City Taxi (52x26)
    const taxi = this.textures.createCanvas('vehicle_taxi', 52, 26)
    if (taxi) {
      const ctx = taxi.getContext()
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.fillRect(2, 20, 48, 6)
      // Car Body
      ctx.fillStyle = '#eab308' // taxi yellow
      ctx.fillRect(4, 8, 44, 14)
      // Roof / Cabin
      ctx.fillStyle = '#ca8a04'
      ctx.fillRect(14, 2, 24, 8)
      // Windows
      ctx.fillStyle = '#38bdf8'
      ctx.fillRect(16, 4, 8, 5)
      ctx.fillRect(26, 4, 10, 5)
      // Black & White checkered stripe
      for (let x = 6; x < 46; x += 4) {
        ctx.fillStyle = (x / 4) % 2 === 0 ? '#000000' : '#ffffff'
        ctx.fillRect(x, 12, 4, 2)
      }
      // Rooftop TAXI sign
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(22, 0, 8, 3)
      ctx.fillStyle = '#dc2626'
      ctx.fillRect(23, 1, 6, 1)
      // Wheels
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(8, 18, 8, 6)
      ctx.fillRect(36, 18, 8, 6)
      ctx.fillStyle = '#94a3b8'
      ctx.fillRect(10, 20, 4, 2)
      ctx.fillRect(38, 20, 4, 2)
      // Headlights / Taillights
      ctx.fillStyle = '#fef08a'
      ctx.fillRect(46, 10, 2, 4)
      ctx.fillStyle = '#ef4444'
      ctx.fillRect(4, 10, 2, 4)
      taxi.refresh()
    }

    // 4. Blue Sedan (52x26)
    const carBlue = this.textures.createCanvas('vehicle_car_blue', 52, 26)
    if (carBlue) {
      const ctx = carBlue.getContext()
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.fillRect(2, 20, 48, 6)
      ctx.fillStyle = '#2563eb' // blue
      ctx.fillRect(4, 8, 44, 14)
      ctx.fillStyle = '#1d4ed8'
      ctx.fillRect(14, 2, 24, 8)
      ctx.fillStyle = '#93c5fd'
      ctx.fillRect(16, 4, 8, 5)
      ctx.fillRect(26, 4, 10, 5)
      // Wheels
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(8, 18, 8, 6)
      ctx.fillRect(36, 18, 8, 6)
      ctx.fillStyle = '#fef08a'
      ctx.fillRect(46, 10, 2, 4)
      ctx.fillStyle = '#ef4444'
      ctx.fillRect(4, 10, 2, 4)
      carBlue.refresh()
    }

    // 5. Indonesian Green Angkot (54x28)
    const angkot = this.textures.createCanvas('vehicle_angkot', 54, 28)
    if (angkot) {
      const ctx = angkot.getContext()
      ctx.fillStyle = 'rgba(0,0,0,0.35)'
      ctx.fillRect(2, 22, 50, 6)
      ctx.fillStyle = '#15803d' // green
      ctx.fillRect(4, 6, 46, 18)
      ctx.fillStyle = '#facc15' // yellow roof stripe
      ctx.fillRect(4, 4, 46, 3)
      // Passenger windows
      ctx.fillStyle = '#e2e8f0'
      ctx.fillRect(12, 8, 10, 7)
      ctx.fillRect(24, 8, 10, 7)
      ctx.fillRect(36, 8, 10, 7)
      // Wheels
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(10, 20, 8, 6)
      ctx.fillRect(38, 20, 8, 6)
      angkot.refresh()
    }

    // 6. Courier Package Item (20x20)
    const pkg = this.textures.createCanvas('item_package', 20, 20)
    if (pkg) {
      const ctx = pkg.getContext()
      ctx.fillStyle = '#b45309' // cardboard
      ctx.fillRect(2, 4, 16, 14)
      ctx.fillStyle = '#d97706'
      ctx.fillRect(3, 5, 14, 12)
      // Tape
      ctx.fillStyle = '#fde68a'
      ctx.fillRect(9, 4, 3, 14)
      ctx.fillRect(2, 10, 16, 3)
      // Label
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(4, 6, 4, 3)
      pkg.refresh()
    }

    // 7. Trash Item for Cleaning Job (16x16)
    const trash = this.textures.createCanvas('item_trash', 16, 16)
    if (trash) {
      const ctx = trash.getContext()
      ctx.fillStyle = 'rgba(0,0,0,0.2)'
      ctx.fillRect(2, 12, 12, 4)
      ctx.fillStyle = '#64748b'
      ctx.fillRect(4, 6, 8, 8)
      ctx.fillStyle = '#ef4444' // red crumpled soda can
      ctx.fillRect(5, 7, 6, 5)
      ctx.fillStyle = '#f1f5f9'
      ctx.fillRect(7, 8, 2, 2)
      trash.refresh()
    }

    // 8. Citizen NPC Spritesheet (Red shirt - Siti_Netizen with Straw Hat & Long Hair)
    this.createCustomCharSheet('npc_spritesheet_red', {
      shirt: '#dc2626',
      hair: '#f59e0b',
      hairStyle: 'long',
      outfitPattern: 'plain',
      accessory: 'straw_hat',
    })
    // 9. Citizen NPC Spritesheet (Green shirt - Pak_RT_Budi with Ojol Reflective Jacket)
    this.createCustomCharSheet('npc_spritesheet_green', {
      shirt: '#16a34a',
      hair: '#0f172a',
      hairStyle: 'short',
      outfitPattern: 'ojol',
      accessory: null,
    })
  }

  private createCustomCharSheet(
    key: string,
    colors: {
      skin?: string
      hair?: string
      shirt?: string
      pants?: string
      shoes?: string
      hairStyle?: string
      outfitPattern?: string
      accessory?: string | null
      backpack?: string | null
    }
  ) {
    const charSheet = this.textures.createCanvas(key, 96, 144)
    if (charSheet) {
      drawCharacterSpritesheetCanvas(charSheet, {
        skin: colors.skin || '#f5d0b0',
        hair: colors.hair || '#78350f',
        shirt: colors.shirt || '#2563eb',
        pants: colors.pants || '#334155',
        shoes: colors.shoes || '#0f172a',
        hairStyle: colors.hairStyle || 'short',
        outfitPattern: colors.outfitPattern || 'plain',
        accessory: colors.accessory || null,
        backpack: colors.backpack || null,
      })
    }
  }

  private createNPCAnimations() {
    if (this.anims.exists('npc_red_walk_down')) return

    ['npc_spritesheet_red', 'npc_spritesheet_green'].forEach((sheetKey) => {
      if (!this.textures.exists(sheetKey)) return
      const sheet = this.textures.get(sheetKey)
      if (!sheet.has('0')) {
        sheet.add(0, 0, 0, 0, 32, 36)
        sheet.add(1, 0, 32, 0, 32, 36)
        sheet.add(2, 0, 64, 0, 32, 36)

        sheet.add(3, 0, 0, 36, 32, 36)
        sheet.add(4, 0, 32, 36, 32, 36)
        sheet.add(5, 0, 64, 36, 32, 36)

        sheet.add(6, 0, 0, 72, 32, 36)
        sheet.add(7, 0, 32, 72, 32, 36)
        sheet.add(8, 0, 64, 72, 32, 36)

        sheet.add(9, 0, 0, 108, 32, 36)
        sheet.add(10, 0, 32, 108, 32, 36)
        sheet.add(11, 0, 64, 108, 32, 36)
      }

      const prefix = sheetKey === 'npc_spritesheet_red' ? 'npc_red' : 'npc_green'

      this.anims.create({
        key: `${prefix}_walk_down`,
        frames: [{ key: sheetKey, frame: 1 }, { key: sheetKey, frame: 0 }, { key: sheetKey, frame: 2 }],
        frameRate: 6,
        repeat: -1,
      })
      this.anims.create({
        key: `${prefix}_walk_left`,
        frames: [{ key: sheetKey, frame: 4 }, { key: sheetKey, frame: 3 }, { key: sheetKey, frame: 5 }],
        frameRate: 6,
        repeat: -1,
      })
      this.anims.create({
        key: `${prefix}_walk_right`,
        frames: [{ key: sheetKey, frame: 7 }, { key: sheetKey, frame: 6 }, { key: sheetKey, frame: 8 }],
        frameRate: 6,
        repeat: -1,
      })
      this.anims.create({
        key: `${prefix}_walk_up`,
        frames: [{ key: sheetKey, frame: 10 }, { key: sheetKey, frame: 9 }, { key: sheetKey, frame: 11 }],
        frameRate: 6,
        repeat: -1,
      })
      this.anims.create({
        key: `${prefix}_idle`,
        frames: [{ key: sheetKey, frame: 0 }],
        frameRate: 1,
      })
    })
  }
}
