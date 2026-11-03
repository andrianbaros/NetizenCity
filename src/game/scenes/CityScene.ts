// ============================================================
// NETIZENCITY - Primary City Game Scene
// ============================================================

import * as Phaser from 'phaser'
import { useGameStore } from '@/lib/stores/useGameStore'
import { useUIStore } from '@/lib/stores/useUIStore'

export interface BuildingInteractiveData {
  id: string
  name: string
  district: string
  description: string
  type: string
  actionLabel: string
}

export class CityScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite
  private playerContainer!: Phaser.GameObjects.Container
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys
  private wasd!: {
    W: Phaser.Input.Keyboard.Key
    A: Phaser.Input.Keyboard.Key
    S: Phaser.Input.Keyboard.Key
    D: Phaser.Input.Keyboard.Key
  }

  private remotePlayerSprites: Map<string, Phaser.GameObjects.Container> = new Map()
  private buildingsGroup!: Phaser.Physics.Arcade.StaticGroup
  private interactiveBuildings: Map<Phaser.GameObjects.GameObject, BuildingInteractiveData> =
    new Map()

  private lastMoveBroadcast = 0
  private lastDirection = 'down'
  private currentDistrict = 'town_square'

  constructor() {
    super({ key: 'CityScene' })
  }

  create() {
    // Set game world bounds (3200 x 2400 pixels)
    const WORLD_WIDTH = 3200
    const WORLD_HEIGHT = 2400
    this.physics.world.setBounds(0, 0, WORLD_WIDTH, WORLD_HEIGHT)

    // Build the 2D City Environment
    this.createCityTerrain(WORLD_WIDTH, WORLD_HEIGHT)
    this.createRoadsAndSidewalks()
    this.createBuildings()
    this.createEnvironmentProps()

    // Spawn Player
    this.createPlayer(1600, 1200)

    // Setup Camera
    this.setupCamera(WORLD_WIDTH, WORLD_HEIGHT)

    // Setup Controls
    this.setupControls()

    // Notify Zustand that game is ready
    useGameStore.getState().setGameReady(true)
  }

  update(time: number) {
    if (!this.player) return

    this.handlePlayerMovement(time)
    this.checkDistrictBoundaries()
    this.checkBuildingProximity()
  }

  private createCityTerrain(worldWidth: number, worldHeight: number) {
    // Fill entire base with grass tiles
    for (let x = 0; x < worldWidth; x += 32) {
      for (let y = 0; y < worldHeight; y += 32) {
        this.add.image(x, y, 'tile_grass').setOrigin(0, 0)
      }
    }

    // Central Town Square Plaza (600x400 around x:1300-1900, y:1000-1400)
    for (let x = 1360; x <= 1840; x += 32) {
      for (let y = 1000; y <= 1380; y += 32) {
        this.add.image(x, y, 'tile_plaza').setOrigin(0, 0)
      }
    }
  }

  private createRoadsAndSidewalks() {
    // Main Avenue Horizontal (West to East at Y: 1400-1496)
    for (let x = 0; x < 3200; x += 32) {
      this.add.image(x, 1408, 'tile_sidewalk').setOrigin(0, 0)
      this.add.image(x, 1440, 'tile_road').setOrigin(0, 0)
      this.add.image(x, 1472, 'tile_road').setOrigin(0, 0)
      this.add.image(x, 1504, 'tile_sidewalk').setOrigin(0, 0)
    }

    // Main Avenue Vertical (North to South at X: 1200-1296)
    for (let y = 0; y < 2400; y += 32) {
      this.add.image(1216, y, 'tile_sidewalk').setOrigin(0, 0)
      this.add.image(1248, y, 'tile_road').setOrigin(0, 0)
      this.add.image(1280, y, 'tile_road').setOrigin(0, 0)
      this.add.image(1312, y, 'tile_sidewalk').setOrigin(0, 0)
    }

    // Commercial Avenue Vertical (X: 2000-2096)
    for (let y = 400; y < 2000; y += 32) {
      this.add.image(1984, y, 'tile_sidewalk').setOrigin(0, 0)
      this.add.image(2016, y, 'tile_road').setOrigin(0, 0)
      this.add.image(2048, y, 'tile_road').setOrigin(0, 0)
      this.add.image(2080, y, 'tile_sidewalk').setOrigin(0, 0)
    }
  }

  private createBuildings() {
    this.buildingsGroup = this.physics.add.staticGroup()

    // 1. Downtown - City Hall (Centerpiece of the city)
    const cityHall = this.add.image(1600, 940, 'bld_city_hall')
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
    this.setupInteractiveBuilding(apt1, {
      id: 'apartments_block_a',
      name: 'Rusunawa Harapan Baru Blok A',
      district: 'Perumahan',
      description: 'Kompleks hunian warga bertingkat dengan taman komunal.',
      type: 'residential',
      actionLabel: 'Cek Hunian',
    })

    const apt2 = this.add.image(1400, 680, 'bld_apartments')
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
    this.setupInteractiveBuilding(house1, {
      id: 'house_melati',
      name: 'Perumahan Jalan Melati No. 12',
      district: 'Perumahan',
      description: 'Rumah tapak ramah lingkungan dengan kebun kecil.',
      type: 'residential',
      actionLabel: 'Kunjungi Rumah',
    })

    const house2 = this.add.image(720, 850, 'bld_house')
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
    this.setupInteractiveBuilding(factory, {
      id: 'industrial_factory',
      name: 'Pabrik & Pusat Kurir Pengiriman',
      district: 'Industri',
      description: 'Pusat pekerjaan mini-game: ambil misi antar paket dan dapatkan koin!',
      type: 'industrial',
      actionLabel: 'Mulai Bekerja',
    })

    // 6. Airport - Arrival Terminal (South-East)
    const airport = this.add.image(2500, 1850, 'bld_airport')
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

    // Physics static body for collision
    const body = this.physics.add.staticBody(
      img.x - img.width / 2 + 10,
      img.y - img.height / 2 + 20,
      img.width - 20,
      img.height - 30
    )
    this.physics.add.collider(this.player, body)

    // Click handler to open building info
    img.on('pointerdown', () => {
      this.openBuildingModal(data)
    })

    // Hover effect
    img.on('pointerover', () => {
      img.setTint(0x93c5fd)
    })
    img.on('pointerout', () => {
      img.clearTint()
    })
  }

  private createEnvironmentProps() {
    // Trees along plaza & streets
    const treeCoords = [
      [1330, 980], [1330, 1060], [1330, 1140], [1330, 1220],
      [1870, 980], [1870, 1060], [1870, 1140], [1870, 1220],
      [1450, 1370], [1550, 1370], [1650, 1370], [1750, 1370],
      [700, 720], [800, 720], [900, 720], [1000, 620],
      [2200, 1100], [2360, 1100], [2450, 1100],
    ]

    treeCoords.forEach(([x, y]) => {
      this.add.image(x, y, 'prop_tree').setOrigin(0.5, 0.9)
    })

    // Streetlamps
    const lampCoords = [
      [1350, 1420], [1500, 1420], [1650, 1420], [1800, 1420],
      [1230, 1100], [1230, 1250], [1230, 1380],
    ]
    lampCoords.forEach(([x, y]) => {
      this.add.image(x, y, 'prop_lamp').setOrigin(0.5, 0.9)
    })
  }

  private createPlayer(spawnX: number, spawnY: number) {
    this.playerContainer = this.add.container(spawnX, spawnY)

    // Player sprite
    this.player = this.physics.add.sprite(0, 0, 'character_spritesheet', 0)
    this.player.setCollideWorldBounds(true)
    this.player.setSize(20, 24)
    this.player.setOffset(6, 12)

    // Username label above head
    const username = 'Warga #1'
    const nameText = this.add.text(0, -26, username, {
      font: 'bold 11px monospace',
      color: '#ffffff',
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      padding: { x: 4, y: 2 },
    })
    nameText.setOrigin(0.5, 0.5)

    this.playerContainer.add([this.player, nameText])
  }

  private setupCamera(worldWidth: number, worldHeight: number) {
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight)
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1)
    this.cameras.main.setZoom(1.75)

    // Mouse drag camera panning (when shift key or middle mouse is held)
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown && pointer.button === 1) {
        this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom
        this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom
      }
    })

    // Zoom on mouse wheel
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

    // Normalize diagonal movement speed
    if (vx !== 0 && vy !== 0) {
      vx *= 0.7071
      vy *= 0.7071
    }

    this.player.setVelocity(vx, vy)

    const isMoving = vx !== 0 || vy !== 0

    if (isMoving) {
      this.player.anims.play(`walk_${this.lastDirection}`, true)
    } else {
      this.player.anims.play(`idle_${this.lastDirection}`, true)
    }

    // Sync player container position
    if (this.playerContainer) {
      this.playerContainer.x = this.player.x
      this.playerContainer.y = this.player.y
    }

    // Periodically update Zustand store with player location
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
    if (data.id === 'netizen_mall') {
      useUIStore.getState().openModal('mall')
    } else if (data.id === 'city_hall') {
      useUIStore.getState().openModal('building_details')
    } else if (data.id.includes('apartments') || data.id.includes('house')) {
      useUIStore.getState().openModal('building_details')
    } else {
      useUIStore.getState().openModal('building_details')
    }
  }
}
