// ============================================================
// NETIZENCITY - 3D Virtual Garden View (Three.js Scene)
// Interactive 3D Planter, 5-Stage Growth, Watering Can & Sprinkler Particles
// ============================================================

'use client'

import React, { useEffect, useRef, useCallback } from 'react'
import * as THREE from 'three'
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  Plus,
  Minus,
} from 'lucide-react'
import type { GardenSeedDefinition } from '@/types/garden'

interface Garden3DViewProps {
  stage: number // 1 to 5
  seedId: string
  seedDef: GardenSeedDefinition
  isWatering: boolean
  isFertilizing: boolean
  isHarvesting: boolean
  onWaterAnimationComplete?: () => void
  onFertilizeAnimationComplete?: () => void
}

export default function Garden3DView({
  stage,
  seedId,
  seedDef,
  isWatering,
  isFertilizing,
  isHarvesting,
  onWaterAnimationComplete,
  onFertilizeAnimationComplete,
}: Garden3DViewProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  // Internal 3D References
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const plantGroupRef = useRef<THREE.Group | null>(null)
  const wateringCanGroupRef = useRef<THREE.Group | null>(null)
  const fertilizerGroupRef = useRef<THREE.Group | null>(null)
  const waterParticlesRef = useRef<THREE.Points | null>(null)
  const fertilizerParticlesRef = useRef<THREE.Points | null>(null)
  const confettiParticlesRef = useRef<THREE.Points | null>(null)
  const butterfliesGroupRef = useRef<THREE.Group | null>(null)
  const soilMeshRef = useRef<THREE.Mesh | null>(null)

  // Camera Orbit State
  const sphericalRef = useRef({ radius: 4.8, phi: Math.PI / 3.2, theta: Math.PI * 0.25 })
  const targetRef = useRef(new THREE.Vector3(0, 0.85, 0))
  const isPointerDownRef = useRef(false)
  const pointerStartRef = useRef({ x: 0, y: 0 })
  const pinchStartDistRef = useRef(0)
  const pinchStartRadiusRef = useRef(4.8)

  // Animation States
  const plantBounceRef = useRef(0)
  const wateringAnimProgressRef = useRef<number | null>(null)
  const fertilizeAnimProgressRef = useRef<number | null>(null)
  const harvestConfettiTimeRef = useRef<number | null>(null)

  // ------------------------------------------------------------
  // Web Audio Synthesizer (Realistic SFX without external audio files)
  // ------------------------------------------------------------
  const playGardenAudio = useCallback((type: 'water' | 'fertilize' | 'growth' | 'harvest') => {
    if (typeof window === 'undefined') return
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioCtx) return
      const ctx = new AudioCtx()

      if (type === 'water') {
        // Water pouring white-noise filtered rush
        const bufferSize = ctx.sampleRate * 1.2
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
        const output = buffer.getChannelData(0)
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1
        }
        const whiteNoise = ctx.createBufferSource()
        whiteNoise.buffer = buffer

        const filter = ctx.createBiquadFilter()
        filter.type = 'bandpass'
        filter.frequency.setValueAtTime(800, ctx.currentTime)
        filter.frequency.exponentialRampToValueAtTime(1400, ctx.currentTime + 1.2)
        filter.Q.setValueAtTime(3.0, ctx.currentTime)

        const gain = ctx.createGain()
        gain.gain.setValueAtTime(0.01, ctx.currentTime)
        gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.2)
        gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.9)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2)

        whiteNoise.connect(filter)
        filter.connect(gain)
        gain.connect(ctx.destination)
        whiteNoise.start()
        whiteNoise.stop(ctx.currentTime + 1.25)
      } else if (type === 'fertilize') {
        // Magical chime sequence (C5 - E5 - G5 - B5 - C6)
        const notes = [523.25, 659.25, 783.99, 987.77, 1046.5]
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.type = 'sine'
          osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08)
          gain.gain.setValueAtTime(0.001, ctx.currentTime + idx * 0.08)
          gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + idx * 0.08 + 0.02)
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35)
          osc.connect(gain)
          gain.connect(ctx.destination)
          osc.start(ctx.currentTime + idx * 0.08)
          osc.stop(ctx.currentTime + idx * 0.08 + 0.4)
        })
      } else if (type === 'harvest') {
        // Grand victory fanfare chords
        const chords = [
          [523.25, 659.25, 783.99], // C major
          [587.33, 739.99, 880.0],  // D major
          [659.25, 830.61, 987.77], // E major
          [783.99, 987.77, 1174.66, 1567.98], // G high victory
        ]
        chords.forEach((chord, cIdx) => {
          const startTime = ctx.currentTime + cIdx * 0.16
          chord.forEach((freq) => {
            const osc = ctx.createOscillator()
            const gain = ctx.createGain()
            osc.type = 'triangle'
            osc.frequency.setValueAtTime(freq, startTime)
            gain.gain.setValueAtTime(0.001, startTime)
            gain.gain.linearRampToValueAtTime(0.14, startTime + 0.03)
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + (cIdx === 3 ? 0.9 : 0.28))
            osc.connect(gain)
            gain.connect(ctx.destination)
            osc.start(startTime)
            osc.stop(startTime + 0.95)
          })
        })
      }
    } catch {
      // AudioContext unavailable
    }
  }, [])

  // ------------------------------------------------------------
  // Update Camera Orbit Transform
  // ------------------------------------------------------------
  const updateCameraTransform = useCallback(() => {
    if (!cameraRef.current) return
    const s = sphericalRef.current
    s.phi = Math.max(0.18, Math.min(Math.PI / 2 - 0.08, s.phi))
    s.radius = Math.max(2.6, Math.min(8.0, s.radius))

    const x = targetRef.current.x + s.radius * Math.sin(s.phi) * Math.sin(s.theta)
    const y = targetRef.current.y + s.radius * Math.cos(s.phi)
    const z = targetRef.current.z + s.radius * Math.sin(s.phi) * Math.cos(s.theta)

    cameraRef.current.position.set(x, y, z)
    cameraRef.current.lookAt(targetRef.current)
  }, [])

  // ------------------------------------------------------------
  // Camera Tactile Controls Handlers
  // ------------------------------------------------------------
  const handleRotate = useCallback(
    (deltaTheta: number, deltaPhi: number) => {
      sphericalRef.current.theta += deltaTheta
      sphericalRef.current.phi += deltaPhi
      updateCameraTransform()
    },
    [updateCameraTransform]
  )

  const handleZoom = useCallback(
    (factor: number) => {
      sphericalRef.current.radius *= factor
      updateCameraTransform()
    },
    [updateCameraTransform]
  )

  const handleResetCamera = useCallback(() => {
    sphericalRef.current = { radius: 4.8, phi: Math.PI / 3.2, theta: Math.PI * 0.25 }
    targetRef.current.set(0, 0.85, 0)
    updateCameraTransform()
  }, [updateCameraTransform])

  // ------------------------------------------------------------
  // Build Plant 3D Mesh for Specific Stage & Seed
  // ------------------------------------------------------------
  const buildPlantMesh = useCallback(
    (currentStage: number, currentSeedDef: GardenSeedDefinition) => {
      const plantGroup = new THREE.Group()
      plantGroup.name = 'CurrentPlant'

      const stemMat = new THREE.MeshStandardMaterial({
        color: '#15803D',
        roughness: 0.7,
      })
      const woodBarkMat = new THREE.MeshStandardMaterial({
        color: '#78350F',
        roughness: 0.85,
      })
      const leafMat = new THREE.MeshStandardMaterial({
        color: currentSeedDef.leafColor || '#22C55E',
        roughness: 0.5,
      })
      const fruitMat = new THREE.MeshStandardMaterial({
        color: currentSeedDef.fruitColor || '#FBBF24',
        roughness: 0.35,
        metalness: currentSeedDef.id === 'coin_tree' || currentSeedDef.id === 'golden_tree' ? 0.75 : 0.15,
      })
      const blossomMat = new THREE.MeshStandardMaterial({
        color: currentSeedDef.color || '#F472B6',
        roughness: 0.4,
      })

      // STAGE 1: Benih di Pot Tanah (Planted Golden Seed)
      if (currentStage === 1) {
        const seedGroup = new THREE.Group()
        seedGroup.position.set(0, 0.45, 0)

        // Golden Seed Oval
        const seedMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.12, 16, 12).scale(1, 1.4, 0.85),
          new THREE.MeshStandardMaterial({
            color: '#F59E0B',
            metalness: 0.65,
            roughness: 0.3,
            emissive: '#D97706',
            emissiveIntensity: 0.25,
          })
        )
        seedMesh.position.y = 0.06
        seedMesh.castShadow = true
        seedGroup.add(seedMesh)

        // Surrounding moist soil crumbs
        for (let i = 0; i < 5; i++) {
          const ang = (i / 5) * Math.PI * 2
          const crumb = new THREE.Mesh(
            new THREE.DodecahedronGeometry(0.045),
            new THREE.MeshStandardMaterial({ color: '#27170E', roughness: 0.9 })
          )
          crumb.position.set(Math.cos(ang) * 0.18, 0.02, Math.sin(ang) * 0.18)
          seedGroup.add(crumb)
        }

        // Gentle breathing pulse ring on soil
        const glowRing = new THREE.Mesh(
          new THREE.RingGeometry(0.24, 0.28, 24).rotateX(-Math.PI / 2),
          new THREE.MeshBasicMaterial({
            color: '#F59E0B',
            transparent: true,
            opacity: 0.65,
            side: THREE.DoubleSide,
          })
        )
        glowRing.position.y = 0.015
        glowRing.name = 'PulseRing'
        seedGroup.add(glowRing)

        plantGroup.add(seedGroup)
      }

      // STAGE 2: Tunas Muda (Sprout with 2 Heart Leaves)
      else if (currentStage === 2) {
        const sproutGroup = new THREE.Group()
        sproutGroup.position.set(0, 0.45, 0)
        sproutGroup.name = 'SproutMesh'

        // Curved green stem
        const stemCurve = new THREE.CatmullRomCurve3([
          new THREE.Vector3(0, 0, 0),
          new THREE.Vector3(0.04, 0.25, 0.02),
          new THREE.Vector3(0.02, 0.52, 0),
        ])
        const stemGeom = new THREE.TubeGeometry(stemCurve, 12, 0.042, 8, false)
        const stem = new THREE.Mesh(stemGeom, stemMat)
        stem.castShadow = true
        sproutGroup.add(stem)

        // Left cotyledon leaf
        const leafGeom = new THREE.SphereGeometry(0.15, 12, 8).scale(1.3, 0.3, 0.8)
        const leafL = new THREE.Mesh(leafGeom, leafMat)
        leafL.position.set(-0.16, 0.52, 0.04)
        leafL.rotation.set(0.2, 0, 0.55)
        leafL.castShadow = true
        sproutGroup.add(leafL)

        // Right cotyledon leaf
        const leafR = new THREE.Mesh(leafGeom, leafMat)
        leafR.position.set(0.18, 0.55, -0.04)
        leafR.rotation.set(-0.2, 0, -0.55)
        leafR.castShadow = true
        sproutGroup.add(leafR)

        // Tiny central baby leaf shoot
        const shootGeom = new THREE.ConeGeometry(0.06, 0.18, 8)
        const shoot = new THREE.Mesh(shootGeom, new THREE.MeshStandardMaterial({ color: '#86EFAC' }))
        shoot.position.set(0.02, 0.62, 0)
        sproutGroup.add(shoot)

        plantGroup.add(sproutGroup)
      }

      // STAGE 3: Tanaman Remaja (Growing Bushy Plant)
      else if (currentStage === 3) {
        const bushGroup = new THREE.Group()
        bushGroup.position.set(0, 0.45, 0)
        bushGroup.name = 'BushMesh'

        // Main woody stem
        const mainStem = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.1, 0.95, 10), woodBarkMat)
        mainStem.position.y = 0.47
        mainStem.castShadow = true
        bushGroup.add(mainStem)

        // Branching leaves
        const branchOffsets = [
          { y: 0.4, x: -0.22, z: 0.15, rotZ: 0.6, scale: 0.28 },
          { y: 0.55, x: 0.24, z: -0.12, rotZ: -0.55, scale: 0.32 },
          { y: 0.75, x: -0.15, z: -0.2, rotZ: 0.45, scale: 0.35 },
          { y: 0.85, x: 0.18, z: 0.2, rotZ: -0.5, scale: 0.36 },
          { y: 1.05, x: 0, z: 0, rotZ: 0, scale: 0.45 },
        ]

        branchOffsets.forEach((bo) => {
          const foliageCluster = new THREE.Mesh(
            new THREE.DodecahedronGeometry(bo.scale, 1),
            leafMat
          )
          foliageCluster.position.set(bo.x, bo.y, bo.z)
          foliageCluster.rotation.z = bo.rotZ
          foliageCluster.castShadow = true
          bushGroup.add(foliageCluster)
        })

        plantGroup.add(bushGroup)
      }

      // STAGE 4: Pohon Berbunga (Blooming / Budding Tree)
      else if (currentStage === 4) {
        const treeGroup = new THREE.Group()
        treeGroup.position.set(0, 0.45, 0)
        treeGroup.name = 'BloomTreeMesh'

        // Sturdy tree trunk
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.3, 12), woodBarkMat)
        trunk.position.y = 0.65
        trunk.castShadow = true
        treeGroup.add(trunk)

        // Lush layered leafy canopy
        const canopyLayers = [
          { y: 1.25, r: 0.65 },
          { y: 1.55, r: 0.52 },
          { y: 1.82, r: 0.38 },
        ]
        canopyLayers.forEach((cl) => {
          const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(cl.r, 1), leafMat)
          canopy.position.y = cl.y
          canopy.castShadow = true
          treeGroup.add(canopy)
        })

        // Blooming flower blossoms
        const flowerPos = [
          { x: -0.42, y: 1.25, z: 0.35 },
          { x: 0.45, y: 1.32, z: 0.28 },
          { x: -0.35, y: 1.48, z: -0.32 },
          { x: 0.38, y: 1.55, z: -0.25 },
          { x: 0.05, y: 1.72, z: 0.38 },
          { x: -0.25, y: 1.85, z: 0.18 },
          { x: 0.22, y: 1.88, z: -0.15 },
        ]

        flowerPos.forEach((fp) => {
          const flGroup = new THREE.Group()
          flGroup.position.set(fp.x, fp.y, fp.z)

          // 5 Petals
          for (let p = 0; p < 5; p++) {
            const pAng = (p / 5) * Math.PI * 2
            const petal = new THREE.Mesh(
              new THREE.SphereGeometry(0.065, 8, 6).scale(1, 0.3, 0.6),
              blossomMat
            )
            petal.position.set(Math.cos(pAng) * 0.08, 0, Math.sin(pAng) * 0.08)
            petal.rotation.y = -pAng
            flGroup.add(petal)
          }

          // Golden center
          const center = new THREE.Mesh(
            new THREE.SphereGeometry(0.045, 8, 8),
            new THREE.MeshStandardMaterial({ color: '#FACC15', roughness: 0.3 })
          )
          flGroup.add(center)
          treeGroup.add(flGroup)
        })

        plantGroup.add(treeGroup)
      }

      // STAGE 5: Pohon Berbuah Lebat & Siap Panen (Harvestable Tree with Coins/Fruits!)
      else if (currentStage >= 5) {
        const harvestGroup = new THREE.Group()
        harvestGroup.position.set(0, 0.45, 0)
        harvestGroup.name = 'HarvestTreeMesh'

        // Grand tree trunk
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 1.4, 12), woodBarkMat)
        trunk.position.y = 0.7
        trunk.castShadow = true
        harvestGroup.add(trunk)

        // Grand lush foliage canopy
        const canopyClusters = [
          { x: 0, y: 1.45, z: 0, r: 0.78 },
          { x: -0.35, y: 1.55, z: 0.25, r: 0.58 },
          { x: 0.4, y: 1.58, z: -0.2, r: 0.55 },
          { x: 0.25, y: 1.78, z: 0.3, r: 0.52 },
          { x: -0.22, y: 1.82, z: -0.28, r: 0.48 },
          { x: 0, y: 2.15, z: 0, r: 0.45 },
        ]

        canopyClusters.forEach((cc) => {
          const canopy = new THREE.Mesh(new THREE.DodecahedronGeometry(cc.r, 1), leafMat)
          canopy.position.set(cc.x, cc.y, cc.z)
          canopy.castShadow = true
          harvestGroup.add(canopy)
        })

        // Hanging Fruits / Golden Netizen Coins
        const fruitPositions = [
          { x: -0.52, y: 1.35, z: 0.38 },
          { x: 0.54, y: 1.42, z: 0.32 },
          { x: -0.45, y: 1.55, z: -0.42 },
          { x: 0.48, y: 1.62, z: -0.35 },
          { x: 0.08, y: 1.85, z: 0.45 },
          { x: -0.35, y: 1.95, z: 0.22 },
          { x: 0.32, y: 1.98, z: -0.25 },
          { x: -0.15, y: 2.25, z: 0.2 },
          { x: 0.2, y: 2.22, z: -0.15 },
        ]

        const hangingGroup = new THREE.Group()
        hangingGroup.name = 'HangingHarvestItems'

        fruitPositions.forEach((pos, idx) => {
          const itemPivot = new THREE.Group()
          itemPivot.position.set(pos.x, pos.y, pos.z)
          itemPivot.name = `HarvestFruit_${idx}`

          if (currentSeedDef.id === 'coin_tree' || currentSeedDef.id === 'golden_tree') {
            // Shiny 3D Golden Netizen Coins
            const coinGeom = new THREE.CylinderGeometry(0.14, 0.14, 0.04, 20).rotateX(Math.PI / 2)
            const coinMesh = new THREE.Mesh(coinGeom, fruitMat)
            coinMesh.castShadow = true
            itemPivot.add(coinMesh)

            // Coin inner star/stamp detail
            const star = new THREE.Mesh(
              new THREE.DodecahedronGeometry(0.06),
              new THREE.MeshStandardMaterial({ color: '#FEF08A', roughness: 0.2, metalness: 0.9 })
            )
            itemPivot.add(star)
          } else if (currentSeedDef.id === 'apple_tree') {
            // Juicy Ruby Red Apples
            const appleMesh = new THREE.Mesh(
              new THREE.SphereGeometry(0.14, 14, 12).scale(1, 0.92, 1),
              fruitMat
            )
            appleMesh.castShadow = true
            itemPivot.add(appleMesh)

            // Little stem & leaf
            const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.06, 6), woodBarkMat)
            stem.position.y = 0.14
            itemPivot.add(stem)

            const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6).scale(1.2, 0.2, 0.6), leafMat)
            leaf.position.set(0.04, 0.15, 0)
            itemPivot.add(leaf)
          } else {
            // Luxurious Orchid Blossoms
            const orchidMesh = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14), blossomMat)
            orchidMesh.castShadow = true
            itemPivot.add(orchidMesh)
          }

          hangingGroup.add(itemPivot)
        })

        harvestGroup.add(hangingGroup)

        // Floating Golden Halo over tree crown
        const crownHalo = new THREE.Mesh(
          new THREE.TorusGeometry(0.48, 0.035, 12, 32).rotateX(Math.PI / 2),
          new THREE.MeshStandardMaterial({
            color: '#FDE047',
            emissive: '#FACC15',
            emissiveIntensity: 0.8,
            metalness: 0.9,
          })
        )
        crownHalo.position.y = 2.45
        crownHalo.name = 'CrownHalo'
        harvestGroup.add(crownHalo)

        plantGroup.add(harvestGroup)
      }

      return plantGroup
    },
    []
  )

  // ------------------------------------------------------------
  // Three.js Scene Setup (Mount)
  // ------------------------------------------------------------
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const width = container.clientWidth || 360
    const height = container.clientHeight || 420

    // 1. Scene & Camera
    const scene = new THREE.Scene()
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 50)
    cameraRef.current = camera

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap
    rendererRef.current = renderer
    container.appendChild(renderer.domElement)

    // 3. Lighting (Warm Sun, Sky Fill & Bounce)
    const ambientLight = new THREE.AmbientLight(0xfff7ed, 1.4)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xfffaea, 2.0)
    sunLight.position.set(4, 9, 5)
    sunLight.castShadow = true
    sunLight.shadow.mapSize.width = 1024
    sunLight.shadow.mapSize.height = 1024
    sunLight.shadow.camera.near = 0.5
    sunLight.shadow.camera.far = 20
    sunLight.shadow.camera.left = -3
    sunLight.shadow.camera.right = 3
    sunLight.shadow.camera.top = 4
    sunLight.shadow.camera.bottom = -2
    sunLight.shadow.bias = -0.0005
    scene.add(sunLight)

    const fillLight = new THREE.DirectionalLight(0xbae6fd, 0.7)
    fillLight.position.set(-4, 3, -3)
    scene.add(fillLight)

    // 4. Diorama Pedestal Base (Stone Paver Garden Bed)
    const pedestalGroup = new THREE.Group()
    pedestalGroup.name = 'PedestalGroup'
    scene.add(pedestalGroup)

    // Base Stone Pedestal
    const stoneMat = new THREE.MeshStandardMaterial({ color: '#E2DAC7', roughness: 0.9 })
    const baseCyl = new THREE.Mesh(new THREE.CylinderGeometry(1.65, 1.8, 0.25, 36), stoneMat)
    baseCyl.position.y = -0.125
    baseCyl.receiveShadow = true
    pedestalGroup.add(baseCyl)

    // Decorative Terracotta Planter Pot
    const potMat = new THREE.MeshStandardMaterial({ color: '#C2410C', roughness: 0.65 })
    const potBody = new THREE.Mesh(new THREE.CylinderGeometry(0.92, 0.76, 0.82, 32), potMat)
    potBody.position.y = 0.28
    potBody.castShadow = true
    potBody.receiveShadow = true
    pedestalGroup.add(potBody)

    // Top Rim of Pot
    const rimMesh = new THREE.Mesh(new THREE.TorusGeometry(0.94, 0.075, 14, 32).rotateX(Math.PI / 2), potMat)
    rimMesh.position.y = 0.68
    rimMesh.castShadow = true
    pedestalGroup.add(rimMesh)

    // Potting Soil Disc & Mound
    const soilMat = new THREE.MeshStandardMaterial({ color: '#3E2723', roughness: 0.92 })
    const soilMound = new THREE.Mesh(
      new THREE.SphereGeometry(0.85, 24, 14, 0, Math.PI * 2, 0, Math.PI / 3).rotateX(Math.PI),
      soilMat
    )
    soilMound.position.y = 0.68
    soilMound.receiveShadow = true
    soilMeshRef.current = soilMound
    pedestalGroup.add(soilMound)

    // Cute Little Wooden Garden Sign
    const signGroup = new THREE.Group()
    signGroup.position.set(1.15, 0.2, 0.8)
    signGroup.rotation.y = -Math.PI / 5

    const signPole = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.45, 8),
      new THREE.MeshStandardMaterial({ color: '#78350F', roughness: 0.9 })
    )
    signGroup.add(signPole)

    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.18, 0.03),
      new THREE.MeshStandardMaterial({ color: '#FDE68A', roughness: 0.8 })
    )
    signBoard.position.y = 0.16
    signGroup.add(signBoard)
    pedestalGroup.add(signGroup)

    // Cobblestone ground pebbles
    for (let i = 0; i < 9; i++) {
      const ang = (i / 9) * Math.PI * 2 + Math.random() * 0.2
      const rad = 1.25 + (i % 2) * 0.22
      const pebble = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.065),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? '#94A3B8' : '#CBD5E1', roughness: 0.85 })
      )
      pebble.position.set(Math.cos(ang) * rad, 0.03, Math.sin(ang) * rad)
      pedestalGroup.add(pebble)
    }

    // 5. Stylized 3D Watering Can (Resting next to pot)
    const canGroup = new THREE.Group()
    canGroup.name = 'WateringCan'
    canGroup.position.set(1.35, 0.35, 0.1)
    wateringCanGroupRef.current = canGroup

    const canMat = new THREE.MeshStandardMaterial({ color: '#10B981', roughness: 0.4, metalness: 0.25 })
    const canBody = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.24, 0.42, 16), canMat)
    canBody.castShadow = true
    canGroup.add(canBody)

    // Handle
    const canHandle = new THREE.Mesh(
      new THREE.TorusGeometry(0.25, 0.03, 10, 16).rotateZ(Math.PI / 2),
      canMat
    )
    canHandle.position.set(0.22, 0.08, 0)
    canGroup.add(canHandle)

    // Spout & Rose Sprinkler
    const canSpout = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.06, 0.45, 12).rotateZ(-Math.PI / 3),
      canMat
    )
    canSpout.position.set(-0.25, 0.15, 0)
    canGroup.add(canSpout)

    const canRose = new THREE.Mesh(
      new THREE.CylinderGeometry(0.09, 0.07, 0.04, 14).rotateZ(-Math.PI / 3),
      new THREE.MeshStandardMaterial({ color: '#F59E0B', metalness: 0.5 })
    )
    canRose.position.set(-0.44, 0.26, 0)
    canGroup.add(canRose)

    scene.add(canGroup)

    // 6. Water Droplets Particle System (Sprayed during watering)
    const waterParticleCount = 120
    const waterGeom = new THREE.BufferGeometry()
    const waterPositions = new Float32Array(waterParticleCount * 3)
    for (let i = 0; i < waterParticleCount; i++) {
      waterPositions[i * 3 + 0] = 0
      waterPositions[i * 3 + 1] = -10
      waterPositions[i * 3 + 2] = 0
    }
    waterGeom.setAttribute('position', new THREE.BufferAttribute(waterPositions, 3))
    const waterParticles = new THREE.Points(
      waterGeom,
      new THREE.PointsMaterial({
        color: '#60A5FA',
        size: 0.055,
        transparent: true,
        opacity: 0.9,
      })
    )
    waterParticles.visible = false
    waterParticlesRef.current = waterParticles
    scene.add(waterParticles)

    // 7. Fertilizer Sparkles Particle System
    const fertCount = 80
    const fertGeom = new THREE.BufferGeometry()
    const fertPositions = new Float32Array(fertCount * 3)
    for (let i = 0; i < fertCount; i++) {
      fertPositions[i * 3 + 0] = 0
      fertPositions[i * 3 + 1] = -10
      fertPositions[i * 3 + 2] = 0
    }
    fertGeom.setAttribute('position', new THREE.BufferAttribute(fertPositions, 3))
    const fertParticles = new THREE.Points(
      fertGeom,
      new THREE.PointsMaterial({
        color: '#FACC15',
        size: 0.075,
        transparent: true,
        opacity: 0.95,
      })
    )
    fertParticles.visible = false
    fertilizerParticlesRef.current = fertParticles
    scene.add(fertParticles)

    // 8. Harvest Confetti Explosions Particle System
    const confettiCount = 180
    const confettiGeom = new THREE.BufferGeometry()
    const confettiPos = new Float32Array(confettiCount * 3)
    for (let i = 0; i < confettiCount; i++) {
      confettiPos[i * 3 + 0] = 0
      confettiPos[i * 3 + 1] = -10
      confettiPos[i * 3 + 2] = 0
    }
    confettiGeom.setAttribute('position', new THREE.BufferAttribute(confettiPos, 3))
    const confettiColors = new Float32Array(confettiCount * 3)
    for (let i = 0; i < confettiCount; i++) {
      const c = new THREE.Color(['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#A855F7'][i % 6])
      confettiColors[i * 3 + 0] = c.r
      confettiColors[i * 3 + 1] = c.g
      confettiColors[i * 3 + 2] = c.b
    }
    confettiGeom.setAttribute('color', new THREE.BufferAttribute(confettiColors, 3))
    const confettiParticles = new THREE.Points(
      confettiGeom,
      new THREE.PointsMaterial({
        size: 0.08,
        vertexColors: true,
        transparent: true,
        opacity: 0.95,
      })
    )
    confettiParticles.visible = false
    confettiParticlesRef.current = confettiParticles
    scene.add(confettiParticles)

    // 9. Animated Fluttering Butterflies
    const butterfliesGroup = new THREE.Group()
    butterfliesGroupRef.current = butterfliesGroup

    const createButterfly = (wingColor: string) => {
      const bf = new THREE.Group()
      const wingMat = new THREE.MeshBasicMaterial({ color: wingColor, side: THREE.DoubleSide })
      const wingGeom = new THREE.CircleGeometry(0.065, 8)

      const wingL = new THREE.Mesh(wingGeom, wingMat)
      wingL.position.x = -0.05
      wingL.name = 'WingL'
      bf.add(wingL)

      const wingR = new THREE.Mesh(wingGeom, wingMat)
      wingR.position.x = 0.05
      wingR.name = 'WingR'
      bf.add(wingR)

      return bf
    }

    const bf1 = createButterfly('#38BDF8')
    bf1.name = 'Butterfly1'
    butterfliesGroup.add(bf1)

    const bf2 = createButterfly('#FB923C')
    bf2.name = 'Butterfly2'
    butterfliesGroup.add(bf2)

    scene.add(butterfliesGroup)

    // 10. Initial Plant Mesh Creation
    const plantMesh = buildPlantMesh(stage, seedDef)
    plantGroupRef.current = plantMesh
    scene.add(plantMesh)

    // Update Camera Initial Angle
    updateCameraTransform()

    // 11. Render Loop with Delta Clock
    let animationFrameId: number
    const clock = { lastTime: performance.now() }

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)

      const now = performance.now()
      const delta = Math.min((now - clock.lastTime) / 1000, 0.1)
      clock.lastTime = now

      const time = now * 0.001

      // A. Gentle Plant Breathing & Sway Animation
      if (plantGroupRef.current) {
        // Natural wind sway
        plantGroupRef.current.rotation.z = Math.sin(time * 2.2) * 0.025
        plantGroupRef.current.rotation.x = Math.cos(time * 1.8) * 0.015

        // Squash-and-stretch plant bounce after watering or fertilizing
        if (plantBounceRef.current > 0.01) {
          plantBounceRef.current = THREE.MathUtils.lerp(plantBounceRef.current, 0, delta * 4)
          const scaleOffset = Math.sin(plantBounceRef.current * Math.PI * 4) * plantBounceRef.current * 0.25
          plantGroupRef.current.scale.set(1 - scaleOffset * 0.5, 1 + scaleOffset, 1 - scaleOffset * 0.5)
        } else {
          plantGroupRef.current.scale.set(1, 1, 1)
        }

        // Rotate hanging harvest coins in Stage 5
        const hangingItems = plantGroupRef.current.getObjectByName('HangingHarvestItems')
        if (hangingItems) {
          hangingItems.children.forEach((child) => {
            child.rotation.y += delta * 1.8
          })
        }

        // Spin crown halo in Stage 5
        const crownHalo = plantGroupRef.current.getObjectByName('CrownHalo')
        if (crownHalo) {
          crownHalo.rotation.z += delta * 1.2
        }

        // Pulse ring in Stage 1
        const pulseRing = plantGroupRef.current.getObjectByName('PulseRing') as THREE.Mesh
        if (pulseRing) {
          pulseRing.scale.setScalar(1 + Math.sin(time * 3) * 0.12)
        }
      }

      // B. Animated Butterflies Path
      if (butterfliesGroupRef.current) {
        const b1 = butterfliesGroupRef.current.getObjectByName('Butterfly1')
        if (b1) {
          const r1 = 1.1 + Math.sin(time * 1.2) * 0.2
          b1.position.set(Math.cos(time * 1.5) * r1, 1.4 + Math.sin(time * 2.8) * 0.35, Math.sin(time * 1.5) * r1)
          b1.rotation.y = -time * 1.5 + Math.PI / 2
          const wingL = b1.getObjectByName('WingL')
          const wingR = b1.getObjectByName('WingR')
          if (wingL && wingR) {
            const flap = Math.sin(time * 24) * 0.7
            wingL.rotation.y = flap
            wingR.rotation.y = -flap
          }
        }

        const b2 = butterfliesGroupRef.current.getObjectByName('Butterfly2')
        if (b2) {
          const r2 = 1.3 + Math.cos(time * 1.1) * 0.25
          b2.position.set(Math.sin(time * 1.2 + 2) * r2, 1.6 + Math.cos(time * 2.5) * 0.3, Math.cos(time * 1.2 + 2) * r2)
          b2.rotation.y = time * 1.2
          const wingL = b2.getObjectByName('WingL')
          const wingR = b2.getObjectByName('WingR')
          if (wingL && wingR) {
            const flap = Math.cos(time * 26) * 0.7
            wingL.rotation.y = flap
            wingR.rotation.y = -flap
          }
        }
      }

      // C. Watering Can Pour Animation
      if (wateringAnimProgressRef.current !== null && wateringCanGroupRef.current) {
        wateringAnimProgressRef.current += delta * 1.1
        const prog = wateringAnimProgressRef.current

        if (prog <= 0.35) {
          // Phase 1: Lift & Tilt into position
          const t = prog / 0.35
          wateringCanGroupRef.current.position.set(
            THREE.MathUtils.lerp(1.35, 0.45, t),
            THREE.MathUtils.lerp(0.35, 1.75, t),
            THREE.MathUtils.lerp(0.1, 0.45, t)
          )
          wateringCanGroupRef.current.rotation.z = THREE.MathUtils.lerp(0, -0.85, t)
        } else if (prog <= 0.8) {
          // Phase 2: Spraying water shower onto plant
          wateringCanGroupRef.current.position.set(0.45, 1.75 + Math.sin(time * 10) * 0.02, 0.45)
          wateringCanGroupRef.current.rotation.z = -0.85

          if (waterParticlesRef.current) {
            waterParticlesRef.current.visible = true
            const posAttr = waterParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute
            const arr = posAttr.array as Float32Array
            for (let i = 0; i < waterParticleCount; i++) {
              const pProg = (time * 4 + i / waterParticleCount) % 1.0
              // Stream from watering rose (-0.44 offset from can) to plant soil (0, 0.68, 0)
              arr[i * 3 + 0] = THREE.MathUtils.lerp(0.05, (Math.random() - 0.5) * 0.35, pProg)
              arr[i * 3 + 1] = THREE.MathUtils.lerp(1.5, 0.65, pProg)
              arr[i * 3 + 2] = THREE.MathUtils.lerp(0.45, (Math.random() - 0.5) * 0.35, pProg)
            }
            posAttr.needsUpdate = true
          }
        } else if (prog <= 1.0) {
          // Phase 3: Return to rest position
          if (waterParticlesRef.current) waterParticlesRef.current.visible = false
          const t = (prog - 0.8) / 0.2
          wateringCanGroupRef.current.position.set(
            THREE.MathUtils.lerp(0.45, 1.35, t),
            THREE.MathUtils.lerp(1.75, 0.35, t),
            THREE.MathUtils.lerp(0.45, 0.1, t)
          )
          wateringCanGroupRef.current.rotation.z = THREE.MathUtils.lerp(-0.85, 0, t)
        } else {
          // Completed
          wateringAnimProgressRef.current = null
          wateringCanGroupRef.current.position.set(1.35, 0.35, 0.1)
          wateringCanGroupRef.current.rotation.z = 0
          if (waterParticlesRef.current) waterParticlesRef.current.visible = false
          onWaterAnimationComplete?.()
        }
      }

      // D. Fertilizer Sparkles Animation
      if (fertilizeAnimProgressRef.current !== null) {
        fertilizeAnimProgressRef.current += delta * 1.2
        const prog = fertilizeAnimProgressRef.current

        if (fertilizerParticlesRef.current) {
          if (prog < 1.0) {
            fertilizerParticlesRef.current.visible = true
            const posAttr = fertilizerParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute
            const arr = posAttr.array as Float32Array
            for (let i = 0; i < fertCount; i++) {
              const ang = (i / fertCount) * Math.PI * 2 + time * 3
              const rad = 0.15 + (i % 4) * 0.15
              const fallY = 1.8 - ((prog * 2 + i * 0.02) % 1.2)
              arr[i * 3 + 0] = Math.cos(ang) * rad
              arr[i * 3 + 1] = Math.max(0.65, fallY)
              arr[i * 3 + 2] = Math.sin(ang) * rad
            }
            posAttr.needsUpdate = true
          } else {
            fertilizerParticlesRef.current.visible = false
            fertilizeAnimProgressRef.current = null
            onFertilizeAnimationComplete?.()
          }
        }
      }

      // E. Confetti Explosion Animation on Harvest
      if (harvestConfettiTimeRef.current !== null && confettiParticlesRef.current) {
        harvestConfettiTimeRef.current += delta
        const cTime = harvestConfettiTimeRef.current

        if (cTime < 1.8) {
          confettiParticlesRef.current.visible = true
          const posAttr = confettiParticlesRef.current.geometry.attributes.position as THREE.BufferAttribute
          const arr = posAttr.array as Float32Array
          for (let i = 0; i < confettiCount; i++) {
            const phi = (i / confettiCount) * Math.PI
            const theta = i * 2.39996 // Golden angle
            const speed = 1.4 + (i % 5) * 0.3
            const rad = cTime * speed
            arr[i * 3 + 0] = Math.sin(phi) * Math.cos(theta) * rad
            arr[i * 3 + 1] = 1.4 + Math.cos(phi) * rad - (cTime * cTime * 0.9)
            arr[i * 3 + 2] = Math.sin(phi) * Math.sin(theta) * rad
          }
          posAttr.needsUpdate = true
        } else {
          confettiParticlesRef.current.visible = false
          harvestConfettiTimeRef.current = null
        }
      }

      renderer.render(scene, camera)
    }

    animate()

    // 12. Handle Resize
    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return
      const w = container.clientWidth || 360
      const h = container.clientHeight || 420
      cameraRef.current.aspect = w / h
      cameraRef.current.updateProjectionMatrix()
      rendererRef.current.setSize(w, h)
      updateCameraTransform()
    }
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
      if (rendererRef.current?.domElement && container.contains(rendererRef.current.domElement)) {
        container.removeChild(rendererRef.current.domElement)
      }
      renderer.dispose()
    }
  }, [buildPlantMesh, seedDef, stage, updateCameraTransform, onWaterAnimationComplete, onFertilizeAnimationComplete])

  // ------------------------------------------------------------
  // Update Plant Mesh when Stage or Seed Changes
  // ------------------------------------------------------------
  useEffect(() => {
    if (!sceneRef.current) return

    // Remove existing plant mesh
    const oldPlant = sceneRef.current.getObjectByName('CurrentPlant')
    if (oldPlant) {
      sceneRef.current.remove(oldPlant)
    }

    // Build & attach new plant mesh
    const newPlant = buildPlantMesh(stage, seedDef)
    plantGroupRef.current = newPlant
    sceneRef.current.add(newPlant)

    // Trigger squash-and-stretch celebration
    plantBounceRef.current = 1.0
  }, [stage, seedDef, buildPlantMesh])

  // ------------------------------------------------------------
  // Trigger Watering Animation
  // ------------------------------------------------------------
  useEffect(() => {
    if (isWatering) {
      wateringAnimProgressRef.current = 0.0
      plantBounceRef.current = 1.0
      playGardenAudio('water')

      // Soil turns moist dark humus
      if (soilMeshRef.current) {
        ;(soilMeshRef.current.material as THREE.MeshStandardMaterial).color.set('#24140E')
      }
    }
  }, [isWatering, playGardenAudio])

  // ------------------------------------------------------------
  // Trigger Fertilize Animation
  // ------------------------------------------------------------
  useEffect(() => {
    if (isFertilizing) {
      fertilizeAnimProgressRef.current = 0.0
      plantBounceRef.current = 1.2
      playGardenAudio('fertilize')
    }
  }, [isFertilizing, playGardenAudio])

  // ------------------------------------------------------------
  // Trigger Harvest Confetti Animation
  // ------------------------------------------------------------
  useEffect(() => {
    if (isHarvesting) {
      harvestConfettiTimeRef.current = 0.0
      plantBounceRef.current = 1.5
      playGardenAudio('harvest')
    }
  }, [isHarvesting, playGardenAudio])

  // ------------------------------------------------------------
  // Pointer Event Handlers for 3D Camera Orbit
  // ------------------------------------------------------------
  const handlePointerDown = (e: React.PointerEvent) => {
    isPointerDownRef.current = true
    pointerStartRef.current = { x: e.clientX, y: e.clientY }
  }

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isPointerDownRef.current) return
    const dx = e.clientX - pointerStartRef.current.x
    const dy = e.clientY - pointerStartRef.current.y
    pointerStartRef.current = { x: e.clientX, y: e.clientY }

    sphericalRef.current.theta += dx * 0.008
    sphericalRef.current.phi -= dy * 0.008
    updateCameraTransform()
  }

  const handlePointerUp = () => {
    isPointerDownRef.current = false
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    const zoomFactor = 1 + Math.sign(e.deltaY) * 0.08
    sphericalRef.current.radius *= zoomFactor
    updateCameraTransform()
  }

  return (
    <div className="relative w-full h-[320px] sm:h-[400px] rounded-3xl overflow-hidden bg-gradient-to-b from-[#E0F2FE]/40 via-[#F7F4E9] to-[#EFE9D8] border border-[#D8CEBE] shadow-inner select-none">
      {/* Three.js Canvas Container */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Tactile On-Screen 3D Camera Controls */}
      <div className="absolute right-2.5 top-3 z-10 flex flex-col items-center gap-1">
        {/* D-Pad Orbit & Tilt */}
        <div className="bg-[#F7F4E9]/90 backdrop-blur-md p-1 rounded-2xl border border-[#D8CEBE] shadow-xs flex flex-col items-center">
          <button
            type="button"
            onClick={() => handleRotate(0, -0.1)}
            title="Sudut Atas"
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/80 hover:bg-white active:scale-95 border border-[#D8CEBE]/80 flex items-center justify-center text-[#343B35] cursor-pointer"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
          <div className="flex items-center gap-1 my-0.5">
            <button
              type="button"
              onClick={() => handleRotate(0.2, 0)}
              title="Putar Kiri"
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/80 hover:bg-white active:scale-95 border border-[#D8CEBE]/80 flex items-center justify-center text-[#343B35] cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleResetCamera}
              title="Reset Sudut"
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#EFE9D8]/80 hover:bg-[#E4D5BE] active:scale-95 border border-[#D8CEBE]/80 flex items-center justify-center text-[#78634B] cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => handleRotate(-0.2, 0)}
              title="Putar Kanan"
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/80 hover:bg-white active:scale-95 border border-[#D8CEBE]/80 flex items-center justify-center text-[#343B35] cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          <button
            type="button"
            onClick={() => handleRotate(0, 0.1)}
            title="Sudut Bawah"
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/80 hover:bg-white active:scale-95 border border-[#D8CEBE]/80 flex items-center justify-center text-[#343B35] cursor-pointer"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zoom In & Out */}
        <div className="bg-[#F7F4E9]/90 backdrop-blur-md p-1 rounded-2xl border border-[#D8CEBE] shadow-xs flex flex-col items-center gap-1">
          <button
            type="button"
            onClick={() => handleZoom(0.85)}
            title="Zoom In"
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/80 hover:bg-white active:scale-95 border border-[#D8CEBE]/80 flex items-center justify-center text-[#343B35] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => handleZoom(1.18)}
            title="Zoom Out"
            className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-white/80 hover:bg-white active:scale-95 border border-[#D8CEBE]/80 flex items-center justify-center text-[#343B35] cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating 3D Badge Status Pill */}
      <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
        <div className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#D8CEBE] shadow-xs flex items-center gap-1.5 text-xs font-heading font-black text-[#343B35]">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>3D Live Garden</span>
        </div>
      </div>

      {/* Interactive Drag Hint */}
      <div className="absolute left-3 bottom-2.5 z-10 pointer-events-none text-[10px] text-[#78634B]/80 font-medium">
        👆 Geser untuk putar tanaman 3D
      </div>
    </div>
  )
}
