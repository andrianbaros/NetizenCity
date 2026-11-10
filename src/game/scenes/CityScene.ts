// ============================================================
// NETIZENCITY - Primary City Game Scene (Living Virtual World)
// ============================================================

import * as Phaser from 'phaser'
import { useGameStore } from '@/lib/stores/useGameStore'
import { useUIStore } from '@/lib/stores/useUIStore'
import { useCitizenStore } from '@/lib/stores/useCitizenStore'
import {
  resolveAvatarColors,
  drawCharacterSpritesheetCanvas,
} from '@/game/utils/characterRenderer'

export interface BuildingInteractiveData {
  id: string
  name: string
  district: string
  description: string
  type: string
  actionLabel: string
}

interface NPCEntity {
  container: Phaser.GameObjects.Container
  sprite: Phaser.GameObjects.Sprite
  nameTag: Phaser.GameObjects.Text
  speechBubble?: Phaser.GameObjects.Container
  targetX: number
  targetY: number
  speed: number
  prefix: string
  name: string
  dialogue: string
  state: 'walk' | 'idle'
  idleTimer: number
}

interface VehicleEntity {
  sprite: Phaser.GameObjects.Image
  direction: 'left' | 'right' | 'up' | 'down'
  speed: number
  laneY?: number
  laneX?: number
}

interface DeliveryMission {
  active: boolean
  targetName: string
  targetX: number
  targetY: number
  reward: number
  marker?: Phaser.GameObjects.Container
}

export class CityScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private playerNameText!: Phaser.GameObjects.Text
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: {
    W: Phaser.Input.Keyboard.Key
    A: Phaser.Input.Keyboard.Key
    S: Phaser.Input.Keyboard.Key
    D: Phaser.Input.Keyboard.Key
  }

  // Click-to-Move Target
  private targetMovePosition: { x: number; y: number } | null = null

  // City Life Entities
  private npcs: NPCEntity[] = []
  private vehicles: VehicleEntity[] = []
  private trashPiles: Phaser.GameObjects.Sprite[] = []

  // Active Job Mission
  private activeDelivery: DeliveryMission | null = null

  private buildingsGroup!: Phaser.Physics.Arcade.StaticGroup
  private interactiveBuildings: Map<Phaser.GameObjects.GameObject, BuildingInteractiveData> =
    new Map()

  private lastMoveBroadcast = 0
  private lastDirection = 'down'
  private currentDistrict = 'town_square'

  // Day-Night lighting overlay
  private darknessOverlay!: Phaser.GameObjects.Graphics
  private isNightMode = false

  constructor() {
    super({ key: 'CityScene' })
  }

  create() {
    // Set game world bounds (3200 x 2400 pixels)
    const WORLD_WIDTH = 3200
    const WORLD_HEIGHT = 2400
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

    // 1. Build 2D City Environment, Roads & Props
    this.createCityTerrain(WORLD_WIDTH, WORLD_HEIGHT)
    this.createRoadsAndSidewalks()
    this.createEnvironmentProps()

    // 2. Spawn Player first (Central Alun-Alun)
    this.createPlayer(1600, 1200)
    this.updatePlayerSpritesheet()

    // 3. Buildings with collision group
    this.buildingsGroup = this.physics.add.staticGroup()
    this.createBuildings()
    this.physics.add.collider(this.player, this.buildingsGroup)

    // 4. Spawn Interactive City Life (Fountain, Vehicles, NPCs, Cleaning Trash)
    this.createFountainAndSquare()
    this.spawnCityVehicles()
    this.spawnCitizenNPCs()
    this.spawnStreetTrash()

    // 5. Setup Camera & Day/Night Overlay
    this.setupCamera(WORLD_WIDTH, WORLD_HEIGHT)
    this.setupLightingOverlay(WORLD_WIDTH, WORLD_HEIGHT)

    // 6. Setup Keyboard & Click-to-Move Controls
    this.setupControls()

    // Listen to custom global events for jobs
    this.setupJobEventListeners()

    // Notify Zustand that game is ready
    useGameStore.getState().setGameReady(true)
  }

  update(time: number) {
    if (!this.player) return

    this.handlePlayerMovement(time)
    this.updateNPCs(time)
    this.updateVehicles()
    this.checkDistrictBoundaries()
    this.checkBuildingProximity()
    this.checkTrashCleaning()
    this.checkDeliveryArrival()
  }

  // ============================================================
  // TERRAIN & ROADS
  // ============================================================
  private createCityTerrain(worldWidth: number, worldHeight: number) {
    for (let x = 0; x < worldWidth; x += 32) {
      for (let y = 0; y < worldHeight; y += 32) {
        this.add.image(x, y, 'tile_grass').setOrigin(0, 0)
      }
    }

    // Central Town Square Plaza (Around x:1360-1840, y:1000-1380)
    for (let x = 1360; x <= 1840; x += 32) {
      for (let y = 1000; y <= 1380; y += 32) {
        this.add.image(x, y, 'tile_plaza').setOrigin(0, 0)
      }
    }
  }

  private createRoadsAndSidewalks() {
    // Main Avenue Horizontal (West to East at Y: 1408-1504)
    for (let x = 0; x < 3200; x += 32) {
      this.add.image(x, 1408, 'tile_sidewalk').setOrigin(0, 0)
      this.add.image(x, 1440, 'tile_road').setOrigin(0, 0)
      this.add.image(x, 1472, 'tile_road').setOrigin(0, 0)
      this.add.image(x, 1504, 'tile_sidewalk').setOrigin(0, 0)
    }

    // Main Avenue Vertical (North to South at X: 1216-1312)
    for (let y = 0; y < 2400; y += 32) {
      this.add.image(1216, y, 'tile_sidewalk').setOrigin(0, 0)
      this.add.image(1248, y, 'tile_road').setOrigin(0, 0)
      this.add.image(1280, y, 'tile_road').setOrigin(0, 0)
      this.add.image(1312, y, 'tile_sidewalk').setOrigin(0, 0)
    }

    // Commercial Avenue Vertical (X: 1984-2080)
    for (let y = 400; y < 2200; y += 32) {
      this.add.image(1984, y, 'tile_sidewalk').setOrigin(0, 0)
      this.add.image(2016, y, 'tile_road').setOrigin(0, 0)
      this.add.image(2048, y, 'tile_road').setOrigin(0, 0)
      this.add.image(2080, y, 'tile_sidewalk').setOrigin(0, 0)
    }
  }

  private createFountainAndSquare() {
    // Grand Plaza Fountain in the Center of Alun-Alun
    const fountain = this.add.image(1600, 1180, 'prop_fountain')
    fountain.setDepth(1180)

    // Park Benches around the plaza
    const bench1 = this.add.image(1520, 1140, 'prop_bench')
    const bench2 = this.add.image(1680, 1140, 'prop_bench')
    const bench3 = this.add.image(1520, 1220, 'prop_bench')
    const bench4 = this.add.image(1680, 1220, 'prop_bench')
    bench1.setDepth(1140)
    bench2.setDepth(1140)
    bench3.setDepth(1220)
    bench4.setDepth(1220)
  }

  // ============================================================
  // BUILDINGS & INTERACTION
  // ============================================================
  private createBuildings() {
    // 1. Downtown - City Hall
    const cityHall = this.add.image(1600, 940, 'bld_city_hall')
    cityHall.setDepth(940)
    this.setupInteractiveBuilding(cityHall, {
      id: 'city_hall',
      name: 'Balai Kota NETIZENCITY',
      district: 'Downtown',
      description: 'Pusat Pemerintahan, Kantor Walikota, dan Tempat Pemungutan Suara Kebijakan Kota.',
      type: 'civic',
      actionLabel: 'Masuk Balai Kota',
    })

    // 2. Commercial - Netizen Mall (East)
    const mall = this.add.image(2280, 1260, 'bld_mall')
    mall.setDepth(1260)
    this.setupInteractiveBuilding(mall, {
      id: 'netizen_mall',
      name: 'Mall Perbelanjaan Netizen',
      district: 'Komersial',
      description: 'Pusat perbelanjaan outfit, aksesori, rambut, dan kustomisasi avatar.',
      type: 'commercial',
      actionLabel: 'Buka Mall',
    })

    // 3. Residential - Apartments (North)
    const apt1 = this.add.image(1050, 750, 'bld_apartments')
    apt1.setDepth(750)
    this.setupInteractiveBuilding(apt1, {
      id: 'apartments_block_a',
      name: 'Rusunawa Harapan Baru Blok A',
      district: 'Perumahan',
      description: 'Kompleks hunian warga bertingkat dengan taman komunal.',
      type: 'residential',
      actionLabel: 'Cek Hunian',
    })

    const apt2 = this.add.image(1400, 680, 'bld_apartments')
    apt2.setDepth(680)
    this.setupInteractiveBuilding(apt2, {
      id: 'apartments_block_b',
      name: 'Menara Netizen City View',
      district: 'Perumahan',
      description: 'Apartemen residensial modern dengan pemandangan kota.',
      type: 'residential',
      actionLabel: 'Cek Hunian',
    })

    // 4. Residential - Houses
    const house1 = this.add.image(850, 850, 'bld_house')
    house1.setDepth(850)
    this.setupInteractiveBuilding(house1, {
      id: 'house_melati',
      name: 'Perumahan Jalan Melati No. 12',
      district: 'Perumahan',
      description: 'Rumah tapak ramah lingkungan dengan kebun kecil.',
      type: 'residential',
      actionLabel: 'Kunjungi Rumah',
    })

    const house2 = this.add.image(720, 850, 'bld_house')
    house2.setDepth(850)
    this.setupInteractiveBuilding(house2, {
      id: 'house_mawar',
      name: 'Perumahan Jalan Mawar No. 8',
      district: 'Perumahan',
      description: 'Rumah tinggal asri warga Netizen City.',
      type: 'residential',
      actionLabel: 'Kunjungi Rumah',
    })

    // 5. Industrial - Factory & Logistics (South)
    const factory = this.add.image(1500, 1850, 'bld_factory')
    factory.setDepth(1850)
    this.setupInteractiveBuilding(factory, {
      id: 'industrial_factory',
      name: 'Pabrik & Pusat Kurir Pengiriman',
      district: 'Industri',
      description: 'Pusat pekerjaan mini-game: Ambil misi kurir antar paket dan dapatkan koin!',
      type: 'industrial',
      actionLabel: 'Ambil Pekerjaan Kurir',
    })

    // 6. Airport - Arrival Terminal (South-East)
    const airport = this.add.image(2500, 1850, 'bld_airport')
    airport.setDepth(1850)
    this.setupInteractiveBuilding(airport, {
      id: 'airport_terminal',
      name: 'Bandara Internasional Netizen',
      district: 'Bandara',
      description: 'Pintu gerbang kedatangan turis dan warga baru dari Instagram @netizencity.id.',
      type: 'transport',
      actionLabel: 'Info Bandara',
    })
  }

  private setupInteractiveBuilding(
    img: Phaser.GameObjects.Image,
    data: BuildingInteractiveData
  ) {
    img.setInteractive({ cursor: 'pointer' })
    this.interactiveBuildings.set(img, data)

    // Add static collision body to buildingsGroup
    this.physics.add.existing(img, true)
    const body = img.body as Phaser.Physics.Arcade.StaticBody
    if (body) {
      body.setSize(img.width - 24, 36)
      body.setOffset(12, img.height - 36)
    }
    this.buildingsGroup.add(img)

    img.on('pointerdown', () => {
      this.targetMovePosition = null
      useGameStore.getState().setSelectedBuilding(data.id)
      this.openBuildingModal(data)
    })

    img.on('pointerover', () => {
      img.setTint(0x93c5fd)
    })
    img.on('pointerout', () => {
      img.clearTint()
    })
  }

  private createEnvironmentProps() {
    const treeCoords = [
      [1330, 980], [1330, 1060], [1330, 1140], [1330, 1220],
      [1870, 980], [1870, 1060], [1870, 1140], [1870, 1220],
      [1450, 1370], [1550, 1370], [1650, 1370], [1750, 1370],
      [700, 720], [800, 720], [900, 720], [1000, 620],
      [2200, 1100], [2360, 1100], [2450, 1100],
    ]

    treeCoords.forEach(([x, y]) => {
      const tree = this.add.image(x, y, 'prop_tree').setOrigin(0.5, 0.9)
      tree.setDepth(y)
    })

    const lampCoords = [
      [1350, 1420], [1500, 1420], [1650, 1420], [1800, 1420],
      [1230, 1100], [1230, 1250], [1230, 1380],
    ]
    lampCoords.forEach(([x, y]) => {
      const lamp = this.add.image(x, y, 'prop_lamp').setOrigin(0.5, 0.9)
      lamp.setDepth(y)
    })
  }

  // ============================================================
  // LIVING CITY ENTITIES: VEHICLES, NPCS, CLEANING TRASH
  // ============================================================
  private spawnCityVehicles() {
    // Horizontal West-to-East lane (Y: 1450)
    const taxi1 = this.add.image(200, 1450, 'vehicle_taxi').setOrigin(0.5, 0.5)
    taxi1.setDepth(1450)
    this.vehicles.push({
      sprite: taxi1,
      direction: 'right',
      speed: 120,
      laneY: 1450,
    })

    const car1 = this.add.image(1000, 1450, 'vehicle_car_blue').setOrigin(0.5, 0.5)
    car1.setDepth(1450)
    this.vehicles.push({
      sprite: car1,
      direction: 'right',
      speed: 100,
      laneY: 1450,
    })

    // Horizontal East-to-West lane (Y: 1480)
    const angkot1 = this.add.image(2800, 1480, 'vehicle_angkot').setOrigin(0.5, 0.5)
    angkot1.setFlipX(true)
    angkot1.setDepth(1480)
    this.vehicles.push({
      sprite: angkot1,
      direction: 'left',
      speed: 90,
      laneY: 1480,
    })

    const taxi2 = this.add.image(1800, 1480, 'vehicle_taxi').setOrigin(0.5, 0.5)
    taxi2.setFlipX(true)
    taxi2.setDepth(1480)
    this.vehicles.push({
      sprite: taxi2,
      direction: 'left',
      speed: 110,
      laneY: 1480,
    })
  }

  private updateVehicles() {
    this.vehicles.forEach((v) => {
      if (v.direction === 'right') {
        v.sprite.x += v.speed * 0.016
        if (v.sprite.x > 3250) {
          v.sprite.x = -50
        }
      } else if (v.direction === 'left') {
        v.sprite.x -= v.speed * 0.016
        if (v.sprite.x < -50) {
          v.sprite.x = 3250
        }
      }
    })
  }

  private spawnCitizenNPCs() {
    const npcConfigs = [
      {
        name: 'Siti_Netizen',
        x: 1480,
        y: 1100,
        prefix: 'npc_red',
        sheet: 'npc_spritesheet_red',
        dialogue: 'Halo warga baru! Alun-Alun ini adalah pusat aktivitas kota kita.',
      },
      {
        name: 'Pak_RT_Budi',
        x: 1720,
        y: 1120,
        prefix: 'npc_green',
        sheet: 'npc_spritesheet_green',
        dialogue: 'Jaga kebersihan kota ya! Bersihkan sampah di trotoar untuk dapat koin ekstra.',
      },
      {
        name: 'Rian_Bandung',
        x: 1400,
        y: 1250,
        prefix: 'npc_red',
        sheet: 'npc_spritesheet_red',
        dialogue: 'Mau belanja baju baru? Ayo mampir ke Netizen Mall di sebelah timur!',
      },
      {
        name: 'Ayu_Jakarta',
        x: 1650,
        y: 1300,
        prefix: 'npc_green',
        sheet: 'npc_spritesheet_green',
        dialogue: 'Kunjungi Pabrik di selatan kalau kamu mau kerja jadi kurir pengantar barang!',
      },
    ]

    npcConfigs.forEach((cfg) => {
      const container = this.add.container(cfg.x, cfg.y)
      const sprite = this.add.sprite(0, 0, cfg.sheet, 0)
      sprite.play(`${cfg.prefix}_idle`)

      const nameText = this.add.text(0, -24, cfg.name, {
        font: 'bold 10px monospace',
        color: '#facc15',
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        padding: { x: 3, y: 1 },
      })
      nameText.setOrigin(0.5, 0.5)

      container.add([sprite, nameText])
      container.setDepth(cfg.y)

      // Make clickable to talk
      sprite.setInteractive({ cursor: 'pointer' })
      sprite.on('pointerdown', () => {
        this.showNPCDialogue(npc, cfg.dialogue)
      })

      const npc: NPCEntity = {
        container,
        sprite,
        nameTag: nameText,
        targetX: cfg.x,
        targetY: cfg.y,
        speed: 40 + Math.random() * 20,
        prefix: cfg.prefix,
        name: cfg.name,
        dialogue: cfg.dialogue,
        state: 'idle',
        idleTimer: 2000 + Math.random() * 3000,
      }

      this.npcs.push(npc)
    })
  }

  private updateNPCs(time: number) {
    this.npcs.forEach((npc) => {
      if (npc.state === 'idle') {
        npc.idleTimer -= 16
        if (npc.idleTimer <= 0) {
          // Pick new wandering target within plaza radius
          npc.targetX = 1420 + Math.random() * 360
          npc.targetY = 1040 + Math.random() * 280
          npc.state = 'walk'
          npc.idleTimer = 3000 + Math.random() * 4000
        }
      } else if (npc.state === 'walk') {
        const dx = npc.targetX - npc.container.x
        const dy = npc.targetY - npc.container.y
        const dist = Math.sqrt(dx * dx + dy * dy)

        if (dist < 5) {
          npc.state = 'idle'
          npc.sprite.play(`${npc.prefix}_idle`, true)
        } else {
          const vx = (dx / dist) * npc.speed * 0.016
          const vy = (dy / dist) * npc.speed * 0.016
          npc.container.x += vx
          npc.container.y += vy
          npc.container.setDepth(npc.container.y)

          if (Math.abs(dx) > Math.abs(dy)) {
            if (dx > 0) npc.sprite.play(`${npc.prefix}_walk_right`, true)
            else npc.sprite.play(`${npc.prefix}_walk_left`, true)
          } else {
            if (dy > 0) npc.sprite.play(`${npc.prefix}_walk_down`, true)
            else npc.sprite.play(`${npc.prefix}_walk_up`, true)
          }
        }
      }
    })
  }

  private showNPCDialogue(npc: NPCEntity, text: string) {
    if (npc.speechBubble) {
      npc.speechBubble.destroy()
    }

    const bubble = this.add.container(0, -56)
    const bubbleBg = this.add.graphics()
    const bubbleText = this.add.text(0, 0, text, {
      font: '11px sans-serif',
      color: '#ffffff',
      wordWrap: { width: 180 },
      align: 'center',
    })
    bubbleText.setOrigin(0.5, 0.5)

    const w = Math.max(bubbleText.width + 16, 120)
    const h = bubbleText.height + 12

    bubbleBg.fillStyle(0x0f172a, 0.95)
    bubbleBg.lineStyle(1.5, 0x38bdf8, 1)
    bubbleBg.fillRoundedRect(-w / 2, -h / 2, w, h, 8)
    bubbleBg.strokeRoundedRect(-w / 2, -h / 2, w, h, 8)

    bubble.add([bubbleBg, bubbleText])
    npc.container.add(bubble)
    npc.speechBubble = bubble

    // Auto-dismiss bubble after 4 seconds
    this.time.delayedCall(4000, () => {
      if (bubble.active) {
        bubble.destroy()
        npc.speechBubble = undefined
      }
    })
  }

  // ============================================================
  // PLAYABLE MINI-GAME JOBS: STREET CLEANING & COURIER
  // ============================================================
  private spawnStreetTrash() {
    const trashCoords = [
      [1420, 1080], [1780, 1150], [1500, 1320], [1700, 1350],
      [1350, 1460], [1550, 1460], [1750, 1460], [1950, 1460],
    ]

    trashCoords.forEach(([x, y]) => {
      const trash = this.add.sprite(x, y, 'item_trash')
      trash.setDepth(y)
      this.trashPiles.push(trash)
    })
  }

  private checkTrashCleaning() {
    for (let i = this.trashPiles.length - 1; i >= 0; i--) {
      const t = this.trashPiles[i]
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, t.x, t.y)

      if (dist < 28) {
        // Collect & clean!
        const curWallet = useCitizenStore.getState().wallet
        const balance = curWallet?.balance ?? 0
        useCitizenStore.getState().updateBalance(balance + 15)

        // Persist to local database
        fetch('/api/economy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'earn',
            amount: 15,
            description: 'Membersihkan sampah trotoar kota',
          }),
        }).catch(() => {})

        useUIStore.getState().addNotification({
          title: 'Trotoar Bersih! (+15 Koin)',
          message: 'Terima kasih telah menjaga kebersihan kota!',
          type: 'success',
        })

        // Pop effect
        this.tweens.add({
          targets: t,
          y: t.y - 20,
          alpha: 0,
          scale: 1.5,
          duration: 300,
          onComplete: () => {
            t.destroy()
          },
        })

        this.trashPiles.splice(i, 1)

        // Respawn new trash after 20 seconds to keep city playable
        this.time.delayedCall(20000, () => {
          const rx = 1380 + Math.random() * 400
          const ry = 1040 + Math.random() * 320
          const newTrash = this.add.sprite(rx, ry, 'item_trash')
          newTrash.setDepth(ry)
          this.trashPiles.push(newTrash)
        })
      }
    }
  }

  public startCourierDeliveryJob() {
    const destinations = [
      { name: 'Mall Perbelanjaan Netizen', x: 2280, y: 1320 },
      { name: 'Rusunawa Harapan Baru Blok A', x: 1050, y: 810 },
      { name: 'Menara Netizen City View', x: 1400, y: 740 },
      { name: 'Perumahan Jalan Melati', x: 850, y: 910 },
    ]

    const dest = destinations[Math.floor(Math.random() * destinations.length)]

    // Create glowing drop-off circle at target
    const marker = this.add.container(dest.x, dest.y)
    const circle = this.add.graphics()
    circle.fillStyle(0x38bdf8, 0.4)
    circle.fillCircle(0, 0, 32)
    circle.lineStyle(2, 0x38bdf8, 1)
    circle.strokeCircle(0, 0, 32)

    const pkgIcon = this.add.image(0, 0, 'item_package')
    const label = this.add.text(0, -38, `Titik Antar:\n${dest.name}`, {
      font: 'bold 10px monospace',
      color: '#38bdf8',
      align: 'center',
      backgroundColor: 'rgba(15, 23, 42, 0.85)',
      padding: { x: 4, y: 2 },
    })
    label.setOrigin(0.5, 0.5)

    marker.add([circle, pkgIcon, label])
    marker.setDepth(dest.y + 10)

    // Pulsing tween
    this.tweens.add({
      targets: circle,
      scaleX: 1.25,
      scaleY: 1.25,
      alpha: 0.2,
      yoyo: true,
      repeat: -1,
      duration: 700,
    })

    this.activeDelivery = {
      active: true,
      targetName: dest.name,
      targetX: dest.x,
      targetY: dest.y,
      reward: 100,
      marker,
    }

    useUIStore.getState().addNotification({
      title: 'Misi Kurir Aktif!',
      message: `Antarkan paket ke ${dest.name}. Ikuti tanda lingkaran di peta!`,
      type: 'info',
    })
  }

  private checkDeliveryArrival() {
    if (!this.activeDelivery || !this.activeDelivery.active) return

    const dist = Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y,
      this.activeDelivery.targetX,
      this.activeDelivery.targetY
    )

    if (dist < 45) {
      const reward = this.activeDelivery.reward
      const cur = useCitizenStore.getState().wallet?.balance ?? 0
      useCitizenStore.getState().updateBalance(cur + reward)

      // Persist to local database
      fetch('/api/economy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'earn',
          amount: reward,
          description: `Pengantaran paket ke ${this.activeDelivery.targetName}`,
        }),
      }).catch(() => {})

      useUIStore.getState().addNotification({
        title: 'Paket Berhasil Diantar! 📦',
        message: `Pengantaran ke ${this.activeDelivery.targetName} sukses! +${reward} Netizen Coins masuk ke dompetmu.`,
        type: 'success',
      })

      if (this.activeDelivery.marker) {
        this.activeDelivery.marker.destroy()
      }
      this.activeDelivery = null
    }
  }

  // ============================================================
  // PLAYER, CONTROLS, AND CAMERA
  // ============================================================
  private createPlayer(spawnX: number, spawnY: number) {
    this.player = this.physics.add.sprite(spawnX, spawnY, 'character_spritesheet', 0)
    this.player.setCollideWorldBounds(true)
    this.player.setSize(20, 24)
    this.player.setOffset(6, 12)
    this.player.setDepth(spawnY)

    const currentUsername = useCitizenStore.getState().profile?.username || 'warga'
    this.playerNameText = this.add.text(spawnX, spawnY - 26, `${currentUsername} (Kamu)`, {
      font: 'bold 11px monospace',
      color: '#ffffff',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      padding: { x: 4, y: 2 },
    })
    this.playerNameText.setOrigin(0.5, 0.5)
    this.playerNameText.setDepth(spawnY + 1)
  }

  private setupLightingOverlay(worldWidth: number, worldHeight: number) {
    this.darknessOverlay = this.add.graphics()
    this.darknessOverlay.setDepth(9999)
    this.darknessOverlay.setScrollFactor(0)
  }

  public toggleDayNight() {
    this.isNightMode = !this.isNightMode
    this.darknessOverlay.clear()

    if (this.isNightMode) {
      // Midnight blue atmospheric tint
      this.darknessOverlay.fillStyle(0x0f172a, 0.55)
      this.darknessOverlay.fillRect(0, 0, 4000, 3000)
    }
  }

  private setupCamera(worldWidth: number, worldHeight: number) {
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.cameras.main.setZoom(1.75)

    // Mouse drag camera panning
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && pointer.button === 1) {
        this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom
        this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom
      }
    })

    // Zoom on wheel
    this.input.on(
      'wheel',
      (
        _pointer: Phaser.Input.Pointer,
        _gameObjects: Phaser.GameObjects.GameObject[],
        _deltaX: number,
        deltaY: number
      ) => {
        const newZoom = Phaser.Math.Clamp(
          this.cameras.main.zoom - deltaY * 0.001,
          1.0,
          2.5
        )
        this.cameras.main.setZoom(newZoom)
      }
    )

    // Click-to-Move / Tap-to-Walk
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.button === 0) {
        // Convert screen coordinate to game world coordinates
        const worldX = pointer.worldX
        const worldY = pointer.worldY
        this.targetMovePosition = { x: worldX, y: worldY }
      }
    })
  }

  private setupControls() {
    if (!this.input.keyboard) return

    this.cursors = this.input.keyboard.createCursorKeys()
    this.wasd = {
      W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
    }
  }

  private handlePlayerMovement(time: number) {
    const speed = 160
    let vx = 0
    let vy = 0

    const isLeft = this.cursors?.left.isDown || this.wasd?.A.isDown
    const isRight = this.cursors?.right.isDown || this.wasd?.D.isDown
    const isUp = this.cursors?.up.isDown || this.wasd?.W.isDown
    const isDown = this.cursors?.down.isDown || this.wasd?.S.isDown

    const keyboardActive = isLeft || isRight || isUp || isDown

    if (keyboardActive) {
      // Cancel click-to-move when manual keys are pressed
      this.targetMovePosition = null

      if (isLeft) {
        vx = -speed
        this.lastDirection = 'left'
      } else if (isRight) {
        vx = speed
        this.lastDirection = 'right'
      }

      if (isUp) {
        vy = -speed
        this.lastDirection = 'up'
      } else if (isDown) {
        vy = speed
        this.lastDirection = 'down'
      }

      if (vx !== 0 && vy !== 0) {
        vx *= 0.7071
        vy *= 0.7071
      }
    } else if (this.targetMovePosition) {
      // Click-to-move pathfinding
      const dx = this.targetMovePosition.x - this.player.x
      const dy = this.targetMovePosition.y - this.player.y
      const dist = Math.sqrt(dx * dx + dy * dy)

      if (dist < 8) {
        this.targetMovePosition = null
        vx = 0
        vy = 0
      } else {
        vx = (dx / dist) * speed
        vy = (dy / dist) * speed

        if (Math.abs(dx) > Math.abs(dy)) {
          this.lastDirection = dx > 0 ? 'right' : 'left'
        } else {
          this.lastDirection = dy > 0 ? 'down' : 'up'
        }
      }
    }

    this.player.setVelocity(vx, vy)

    const isMoving = vx !== 0 || vy !== 0

    if (isMoving) {
      this.player.anims.play(`walk_${this.lastDirection}`, true)
    } else {
      this.player.anims.play(`idle_${this.lastDirection}`, true)
    }

    if (this.playerNameText && this.player) {
      this.playerNameText.setPosition(this.player.x, this.player.y - 26)
      this.playerNameText.setDepth(this.player.y + 1)
      this.player.setDepth(this.player.y)
    }

    if (time - this.lastMoveBroadcast > 100) {
      this.lastMoveBroadcast = time
      useGameStore.getState().setPlayerPosition({ x: this.player.x, y: this.player.y })
      useGameStore.getState().setIsMoving(isMoving)
      useGameStore.getState().setPlayerDirection(this.lastDirection as any)
    }
  }

  private checkDistrictBoundaries() {
    const px = this.player.x
    const py = this.player.y
    let detectedDistrict = 'town_square'

    if (py < 900) {
      detectedDistrict = 'residential'
    } else if (px > 1950 && py > 1550) {
      detectedDistrict = 'airport'
    } else if (px > 1950) {
      detectedDistrict = 'commercial'
    } else if (py > 1550) {
      detectedDistrict = 'industrial'
    } else if (px < 1150) {
      detectedDistrict = 'entertainment'
    }

    if (detectedDistrict !== this.currentDistrict) {
      this.currentDistrict = detectedDistrict
      useGameStore.getState().setCurrentDistrict(detectedDistrict)
    }
  }

  private checkBuildingProximity() {
    let nearestBuilding: BuildingInteractiveData | null = null
    let minDistance = 90

    this.interactiveBuildings.forEach((data, obj) => {
      const bld = obj as Phaser.GameObjects.Image
      const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, bld.x, bld.y)
      if (dist < minDistance) {
        minDistance = dist
        nearestBuilding = data
      }
    })

    const found = nearestBuilding as BuildingInteractiveData | null
    useGameStore.getState().setSelectedBuilding(found ? found.id : null)
  }

  private openBuildingModal(data: BuildingInteractiveData) {
    useGameStore.getState().setSelectedBuilding(data.id)
    if (data.id === 'netizen_mall') {
      useUIStore.getState().openModal('mall')
    } else if (data.id === 'industrial_factory') {
      // Trigger delivery job directly or open job modal
      this.startCourierDeliveryJob()
    } else {
      useUIStore.getState().openModal('building_details')
    }
  }

  private setupJobEventListeners() {
    if (typeof window !== 'undefined') {
      window.addEventListener('start-courier-job', () => {
        this.startCourierDeliveryJob()
      })
      window.addEventListener('toggle-day-night', () => {
        this.toggleDayNight()
      })
      window.addEventListener('avatar-updated', () => {
        this.updatePlayerSpritesheet()
      })
    }
  }

  public updatePlayerSpritesheet() {
    const profile = useCitizenStore.getState().profile
    if (this.playerNameText && profile?.username) {
      this.playerNameText.setText(`${profile.username} (Kamu)`)
    }
    if (!this.textures.exists('character_spritesheet')) return
    const sheet = this.textures.get('character_spritesheet') as Phaser.Textures.CanvasTexture
    const colors = resolveAvatarColors(profile?.avatarConfig)
    drawCharacterSpritesheetCanvas(sheet, colors)
  }
}
