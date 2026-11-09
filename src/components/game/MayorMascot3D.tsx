// ============================================================
// NETIZENCITY - 3D Pak Mayor Mascot Title Hero Component
// Cozy Low-Poly Mascot with Interactive Breathing, Waving & Eye Contact
// ============================================================

'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as THREE from 'three'

interface MayorMascot3DProps {
  onMayorClick?: () => void
  currentQuote?: string
}

export default function MayorMascot3D({ onMayorClick, currentQuote }: MayorMascot3DProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const isInteractingRef = useRef(false)
  const mouseNormRef = useRef({ x: 0, y: 0 })
  const hopAnimRef = useRef(0)

  const handleHop = useCallback(() => {
    hopAnimRef.current = 1.0
    if (onMayorClick) onMayorClick()
  }, [onMayorClick])

  useEffect(() => {
    const container = mountRef.current
    if (!container) return

    const width = container.clientWidth || 260
    const height = container.clientHeight || 260

    // Scene & Camera
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50)
    camera.position.set(0, 1.35, 3.4)
    camera.lookAt(0, 0.72, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.15
    container.appendChild(renderer.domElement)

    // Lighting (Warm Cozy Sunlight)
    const ambientLight = new THREE.AmbientLight(0xfff5ea, 1.2)
    scene.add(ambientLight)

    const sunLight = new THREE.DirectionalLight(0xfffaee, 1.6)
    sunLight.position.set(3, 6, 4)
    scene.add(sunLight)

    const fillLight = new THREE.DirectionalLight(0xa5c4d4, 0.7)
    fillLight.position.set(-3, 2, -2)
    scene.add(fillLight)

    // Diorama Circular Pedestal
    const pedestalGroup = new THREE.Group()
    scene.add(pedestalGroup)

    const grassMat = new THREE.MeshStandardMaterial({ color: '#A5BE91', roughness: 0.85 })
    const baseCylinder = new THREE.Mesh(
      new THREE.CylinderGeometry(1.05, 1.1, 0.22, 28),
      grassMat
    )
    baseCylinder.position.y = -0.11
    pedestalGroup.add(baseCylinder)

    const rimMat = new THREE.MeshStandardMaterial({ color: '#D8CEBE', roughness: 0.7 })
    const rim = new THREE.Mesh(
      new THREE.CylinderGeometry(1.12, 1.12, 0.05, 28),
      rimMat
    )
    rim.position.y = -0.22
    pedestalGroup.add(rim)

    // Wooden Podium Step
    const woodMat = new THREE.MeshStandardMaterial({ color: '#9E7E5D', roughness: 0.75 })
    const step = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.5), woodMat)
    step.position.set(0, 0.05, 0)
    pedestalGroup.add(step)

    // Flowers / Grass tufts on pedestal
    const flowerMatYellow = new THREE.MeshStandardMaterial({ color: '#E6C66F', roughness: 0.5 })
    const flowerMatCoral = new THREE.MeshStandardMaterial({ color: '#E08595', roughness: 0.5 })
    const stemMat = new THREE.MeshStandardMaterial({ color: '#668B65', roughness: 0.8 })

    const flowerCoords = [
      { x: -0.65, z: 0.45, mat: flowerMatYellow },
      { x: 0.65, z: 0.4, mat: flowerMatCoral },
      { x: -0.55, z: -0.5, mat: flowerMatCoral },
      { x: 0.6, z: -0.45, mat: flowerMatYellow },
    ]
    flowerCoords.forEach((fc) => {
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.1, 5), stemMat)
      stem.position.set(fc.x, 0.05, fc.z)
      const blossom = new THREE.Mesh(new THREE.DodecahedronGeometry(0.045, 0), fc.mat)
      blossom.position.set(fc.x, 0.11, fc.z)
      pedestalGroup.add(stem, blossom)
    })

    // ============================================================
    // BUILD PAK MAYOR (Iconic 3D Low-Poly Character)
    // ============================================================
    const mayorRoot = new THREE.Group()
    mayorRoot.position.set(0, 0.11, 0)
    scene.add(mayorRoot)

    const mayorBody = new THREE.Group()
    mayorRoot.add(mayorBody)

    // Suit Capsule Body (Mayor Blue)
    const suitMat = new THREE.MeshStandardMaterial({ color: '#5E86C1', roughness: 0.45 })
    const bodyMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.26, 0.46, 8, 18), suitMat)
    bodyMesh.position.y = 0.48
    mayorBody.add(bodyMesh)

    // Mayoral Sash (Cream Torus)
    const sashMat = new THREE.MeshStandardMaterial({ color: '#F5E3B8', roughness: 0.55 })
    const sash = new THREE.Mesh(new THREE.TorusGeometry(0.265, 0.032, 6, 24), sashMat)
    sash.position.y = 0.46
    sash.rotation.set(Math.PI / 2 + 0.55, 0, 0)
    mayorBody.add(sash)

    // Golden Badge / Medal
    const goldMat = new THREE.MeshStandardMaterial({
      color: '#E6B64C',
      metalness: 0.8,
      roughness: 0.25,
      emissive: '#44300A',
    })
    const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.048, 0.048, 0.02, 12), goldMat)
    badge.rotation.x = Math.PI / 2
    badge.position.set(0.1, 0.52, 0.255)
    mayorBody.add(badge)

    // Star on medal
    const starCenter = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), goldMat)
    starCenter.position.set(0.1, 0.52, 0.268)
    mayorBody.add(starCenter)

    // Head Group
    const mayorHead = new THREE.Group()
    mayorHead.position.y = 0.78
    mayorBody.add(mayorHead)

    // Eyes with Round Golden Spectacles
    const eyeMat = new THREE.MeshStandardMaterial({ color: '#2C2A33', roughness: 0.25 })
    const cheekMat = new THREE.MeshStandardMaterial({
      color: '#F3A6A0',
      transparent: true,
      opacity: 0.65,
      roughness: 0.4,
    })

    for (const s of [-1, 1]) {
      // Dark eye
      const eye = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), eyeMat)
      eye.position.set(s * 0.09, 0.02, 0.245)
      eye.scale.z = 0.5
      mayorHead.add(eye)

      // Gold spectacles rim
      const glassesRim = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.012, 6, 20), goldMat)
      glassesRim.position.set(s * 0.09, 0.02, 0.265)
      mayorHead.add(glassesRim)

      // Cute blush cheeks
      const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.036, 8, 6), cheekMat)
      cheek.position.set(s * 0.16, -0.065, 0.215)
      cheek.scale.set(1, 0.6, 0.3)
      mayorHead.add(cheek)
    }

    // Spectacles Nose Bridge
    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.048, 5), goldMat)
    bridge.rotation.z = Math.PI / 2
    bridge.position.set(0, 0.028, 0.268)
    mayorHead.add(bridge)

    // Mayoral Top Hat
    const hatGroup = new THREE.Group()
    hatGroup.position.y = 0.28
    mayorHead.add(hatGroup)

    const hatMat = new THREE.MeshStandardMaterial({ color: '#7E838D', roughness: 0.65 })
    const hatBandMat = new THREE.MeshStandardMaterial({ color: '#43464E', roughness: 0.5 })

    const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.028, 24), hatMat)
    hatGroup.add(brim)

    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.2, 0.32, 24), hatMat)
    crown.position.y = 0.17
    hatGroup.add(crown)

    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.203, 0.203, 0.055, 24), hatBandMat)
    band.position.y = 0.05
    hatGroup.add(band)

    // Arms
    const armMat = new THREE.MeshStandardMaterial({ color: '#5E86C1', roughness: 0.45 })
    const handMat = new THREE.MeshStandardMaterial({ color: '#F5E3B8', roughness: 0.5 })

    // Left Arm (Relaxed)
    const leftArmGroup = new THREE.Group()
    leftArmGroup.position.set(-0.28, 0.55, 0)
    mayorBody.add(leftArmGroup)
    const leftArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.22, 6, 10), armMat)
    leftArm.position.y = -0.12
    leftArmGroup.add(leftArm)
    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 6), handMat)
    leftHand.position.y = -0.24
    leftArmGroup.add(leftHand)

    // Right Arm (Waving to the player!)
    const rightArmGroup = new THREE.Group()
    rightArmGroup.position.set(0.28, 0.55, 0)
    mayorBody.add(rightArmGroup)
    const rightArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.065, 0.22, 6, 10), armMat)
    rightArm.position.y = -0.12
    rightArmGroup.add(rightArm)
    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.065, 8, 6), handMat)
    rightHand.position.y = -0.24
    rightArmGroup.add(rightHand)

    // Mouse / Touch Tracking for Eyes and Head
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0
      let clientY = 0
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else if ('clientX' in e) {
        clientX = e.clientX
        clientY = e.clientY
      }
      const rect = container.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      mouseNormRef.current = {
        x: THREE.MathUtils.clamp((clientX - cx) / (window.innerWidth / 2), -1, 1),
        y: THREE.MathUtils.clamp((clientY - cy) / (window.innerHeight / 2), -1, 1),
      }
    }

    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('touchmove', handlePointerMove, { passive: true })

    // Animation Loop
    let reqId = 0
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now()

    const animate = () => {
      reqId = requestAnimationFrame(animate)
      const now = typeof performance !== 'undefined' ? performance.now() : Date.now()
      const elapsed = (now - startTime) / 1000

      // Handle Hop on Click
      if (hopAnimRef.current > 0) {
        hopAnimRef.current -= 0.05
        const hopVal = Math.sin(hopAnimRef.current * Math.PI) * 0.18
        mayorRoot.position.y = 0.11 + hopVal
        hatGroup.position.y = 0.28 + hopVal * 0.3
        hatGroup.rotation.z = Math.sin(elapsed * 12) * 0.08
      } else {
        mayorRoot.position.y = 0.11
        hatGroup.position.y = 0.28
        hatGroup.rotation.z = 0
      }

      // Gentle Mayor Breathing Idle
      const breath = Math.sin(elapsed * 2.2) * 0.015
      mayorBody.position.y = breath

      // Mayor Waving Right Arm
      const wave = Math.sin(elapsed * 3.5) * 0.35 + 0.35
      rightArmGroup.rotation.z = -0.8 - wave * 0.4
      rightArmGroup.rotation.x = Math.sin(elapsed * 2.0) * 0.15

      leftArmGroup.rotation.z = Math.sin(elapsed * 1.5) * 0.05 + 0.08

      // Smooth Head Tracking toward cursor
      const targetHeadYaw = mouseNormRef.current.x * 0.45
      const targetHeadPitch = -mouseNormRef.current.y * 0.25
      mayorHead.rotation.y = THREE.MathUtils.lerp(mayorHead.rotation.y, targetHeadYaw, 0.08)
      mayorHead.rotation.x = THREE.MathUtils.lerp(mayorHead.rotation.x, targetHeadPitch, 0.08)

      // Pedestal slow ambient rotation
      pedestalGroup.rotation.y = elapsed * 0.15
      mayorRoot.rotation.y = Math.sin(elapsed * 0.8) * 0.1

      renderer.render(scene, camera)
    }

    animate()

    // Resize Handler
    const handleResize = () => {
      if (!container) return
      const w = container.clientWidth || 260
      const h = container.clientHeight || 260
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(reqId)
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('touchmove', handlePointerMove)
      window.removeEventListener('resize', handleResize)
      if (renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  return (
    <div className="relative flex flex-col items-center select-none font-sans">
      {/* Interactive 3D Canvas Mounting Container */}
      <div
        ref={mountRef}
        onClick={handleHop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="w-56 h-56 sm:w-64 sm:h-64 cursor-pointer relative touch-none transition-transform active:scale-95 group"
        title="Klik Pak Mayor!"
      >
        {/* Subtle hover pulse indicator around pedestal */}
        <div className="absolute inset-x-8 bottom-3 h-8 rounded-full bg-[#343B35]/15 blur-md pointer-events-none group-hover:scale-110 transition-transform" />
      </div>

      {/* Tactile Mascot Badge */}
      <button
        type="button"
        onClick={handleHop}
        className="mt-1 flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#F7F4E9] hover:bg-[#EFE9D8] border border-[#D8CEBE] shadow-xs text-xs font-heading font-extrabold text-[#343B35] cursor-pointer active:translate-y-0.5 transition-transform"
      >
        <span>🎩 Pak Mayor</span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#668B65] animate-pulse" />
        <span className="text-[10px] text-[#78634B] font-semibold">(Klik saya!)</span>
      </button>

      {/* Mayoral Speech Bubble Dialogue */}
      {currentQuote && (
        <div
          onClick={handleHop}
          className="mt-2.5 max-w-xs sm:max-w-sm bg-[#F7F4E9] border-2 border-[#D8CEBE] rounded-2xl p-3 shadow-lg relative cursor-pointer hover:bg-[#FFFDF9] transition-all text-left"
        >
          {/* Decorative speech bubble pointer arrow */}
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-[#F7F4E9] border-t-2 border-l-2 border-[#D8CEBE] rotate-45" />

          <div className="flex items-start space-x-2">
            <span className="text-base select-none shrink-0">🏛️</span>
            <div>
              <p className="text-xs text-[#343B35] font-semibold leading-relaxed">
                {currentQuote}
              </p>
              <span className="text-[10px] text-[#78634B] font-bold block mt-1 tracking-wide uppercase">
                &bull; Walikota Netizen City
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
