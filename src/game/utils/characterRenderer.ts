// ============================================================
// NETIZENCITY - Advanced Pixel-Art Character Spritesheet Renderer
// High-detail 2D character avatar engine with hair, outfits & accessories
// ============================================================

import type * as Phaser from 'phaser'

export interface AvatarColors {
  skin: string
  hair: string
  shirt: string
  pants: string
  shoes: string
  hairStyle: string
  outfitPattern: string
  accessory: string | null
  backpack: string | null
}

export function resolveAvatarColors(avatarConfig?: {
  skinTone?: string
  hairColor?: string
  hairStyle?: string
  shirtColor?: string
  pantsColor?: string
  shoesColor?: string
  outfitPattern?: string
  accessory?: string | null
  headwear?: string | null
  backpack?: string | null
  outfit?: {
    top?: string | null
    bottom?: string | null
    shoes?: string | null
    accessory?: string | null
  }
} | null): AvatarColors {
  return {
    skin: avatarConfig?.skinTone || '#f5d0b0',
    hair: avatarConfig?.hairColor || '#1e293b',
    shirt: avatarConfig?.shirtColor || avatarConfig?.outfit?.top || '#2563eb',
    pants: avatarConfig?.pantsColor || avatarConfig?.outfit?.bottom || '#1e293b',
    shoes: avatarConfig?.shoesColor || avatarConfig?.outfit?.shoes || '#f1f5f9',
    hairStyle: avatarConfig?.hairStyle || 'short',
    outfitPattern: avatarConfig?.outfitPattern || 'plain',
    accessory: avatarConfig?.accessory || avatarConfig?.headwear || avatarConfig?.outfit?.accessory || null,
    backpack: avatarConfig?.backpack || null,
  }
}

export function drawSingleCharacterFrame(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  row: number,
  col: number,
  colors: AvatarColors
) {
  const isWalking = col !== 0
  const legOffset = col === 1 ? -3 : col === 2 ? 3 : 0
  const armSwing = col === 1 ? 2 : col === 2 ? -2 : 0

      // ------------------------------------------------------------
      // 1. DROP SHADOW (Soft pixel shadow)
      // ------------------------------------------------------------
      ctx.fillStyle = 'rgba(15, 23, 42, 0.35)'
      ctx.beginPath()
      ctx.ellipse(ox + 16, oy + 34, 9, 3.5, 0, 0, Math.PI * 2)
      ctx.fill()

      // ------------------------------------------------------------
      // 2. BACK ACCESSORIES (Wings, Backpacks - rendered behind)
      // ------------------------------------------------------------
      if (colors.backpack === 'wings' || colors.accessory === 'wings') {
        // Angel Wings
        ctx.fillStyle = '#fef08a'
        if (row !== 3) {
          // Facing front / sides: wings peek out behind
          ctx.beginPath()
          // Left wing
          ctx.moveTo(ox + 9, oy + 16)
          ctx.lineTo(ox + 2, oy + 10)
          ctx.lineTo(ox + 4, oy + 22)
          ctx.closePath()
          ctx.fill()
          // Right wing
          ctx.beginPath()
          ctx.moveTo(ox + 23, oy + 16)
          ctx.lineTo(ox + 30, oy + 10)
          ctx.lineTo(ox + 28, oy + 22)
          ctx.closePath()
          ctx.fill()
        } else {
          // Facing away: full wings on back
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(ox + 4, oy + 12, 8, 12)
          ctx.fillRect(ox + 20, oy + 12, 8, 12)
        }
      } else if (colors.backpack === 'astronaut' || colors.accessory === 'astronaut') {
        if (row === 3) {
          // Backpack bubble with cute cat silhouette
          ctx.fillStyle = '#38bdf8'
          ctx.fillRect(ox + 11, oy + 16, 10, 10)
          ctx.fillStyle = '#f97316'
          ctx.fillRect(ox + 14, oy + 19, 4, 4) // orange cat
        }
      } else if (colors.backpack === 'tackle_box' || colors.accessory === 'tackle_box' || colors.backpack === 'back_tackle_box') {
        if (row === 3) {
          // Angler tackle box backpack
          ctx.fillStyle = '#0284c7'
          ctx.fillRect(ox + 10, oy + 16, 12, 10)
          ctx.fillStyle = '#f59e0b'
          ctx.fillRect(ox + 15, oy + 20, 2, 2)
        }
      }

      // ------------------------------------------------------------
      // 3. LEGS & PANTS
      // ------------------------------------------------------------
      if (colors.outfitPattern === 'sarung') {
        // Sarung Ronda (Cylindrical traditional skirt)
        ctx.fillStyle = colors.pants
        ctx.fillRect(ox + 10, oy + 25, 12, 7)
        // Checkered plaid pattern
        ctx.fillStyle = 'rgba(255,255,255,0.25)'
        ctx.fillRect(ox + 10, oy + 27, 12, 1)
        ctx.fillRect(ox + 13, oy + 25, 1, 7)
        ctx.fillRect(ox + 18, oy + 25, 1, 7)
      } else if (colors.outfitPattern === 'skirt') {
        // Tartan pleated mini skirt
        ctx.fillStyle = colors.pants
        ctx.fillRect(ox + 10, oy + 25, 12, 5)
        ctx.fillStyle = '#ef4444'
        ctx.fillRect(ox + 12, oy + 27, 2, 3)
        ctx.fillRect(ox + 18, oy + 27, 2, 3)
        // Bare legs under skirt
        ctx.fillStyle = colors.skin
        ctx.fillRect(ox + 11, oy + 30, 3, 2 + legOffset)
        ctx.fillRect(ox + 18, oy + 30, 3, 2 - legOffset)
      } else {
        // Normal / Techwear / Cargo Pants
        ctx.fillStyle = colors.pants
        ctx.fillRect(ox + 11, oy + 25, 4, 7 + legOffset)
        ctx.fillRect(ox + 17, oy + 25, 4, 7 - legOffset)

        // Techwear / Cargo pocket straps
        if (colors.outfitPattern === 'techwear') {
          ctx.fillStyle = '#06b6d4'
          ctx.fillRect(ox + 10, oy + 27, 1, 4)
          ctx.fillRect(ox + 21, oy + 27, 1, 4)
        }
      }

      // ------------------------------------------------------------
      // 4. SHOES / FOOTWEAR
      // ------------------------------------------------------------
      if (colors.shoes === '#10b981' || colors.outfitPattern === 'swallow') {
        // Sandal Jepit Swallow (Green sole, bare feet)
        ctx.fillStyle = colors.skin
        ctx.fillRect(ox + 10, oy + 31 + legOffset, 5, 2)
        ctx.fillRect(ox + 17, oy + 31 - legOffset, 5, 2)
        // Green rubber strap
        ctx.fillStyle = '#10b981'
        ctx.fillRect(ox + 10, oy + 33 + legOffset, 5, 2)
        ctx.fillRect(ox + 17, oy + 33 - legOffset, 5, 2)
      } else if (colors.shoes === '#06b6d4' || colors.outfitPattern === 'roller') {
        // Roller Skates (Glowing Cyan Wheels)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(ox + 10, oy + 31 + legOffset, 5, 2)
        ctx.fillRect(ox + 17, oy + 31 - legOffset, 5, 2)
        ctx.fillStyle = '#06b6d4'
        ctx.fillRect(ox + 9, oy + 33 + legOffset, 3, 2)
        ctx.fillRect(ox + 13, oy + 33 + legOffset, 3, 2)
        ctx.fillRect(ox + 16, oy + 33 - legOffset, 3, 2)
        ctx.fillRect(ox + 20, oy + 33 - legOffset, 3, 2)
      } else {
        // High-top Sneakers / Boots / Classic Shoes
        ctx.fillStyle = colors.shoes
        ctx.fillRect(ox + 10, oy + 31 + legOffset, 5, 3)
        ctx.fillRect(ox + 17, oy + 31 - legOffset, 5, 3)
        // Clean white rubber sole line
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(ox + 10, oy + 33 + legOffset, 5, 1)
        ctx.fillRect(ox + 17, oy + 33 - legOffset, 5, 1)
      }

      // ------------------------------------------------------------
      // 5. TORSO & OUTFIT
      // ------------------------------------------------------------
      ctx.fillStyle = colors.shirt
      ctx.fillRect(ox + 10, oy + 15, 12, 10)

      // Unique Patterns & Insignias
      if (colors.outfitPattern === 'jersey' || colors.shirt === '#dc2626') {
        // Timnas Garuda Jersey (Golden shield on chest, white shoulder trims)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(ox + 10, oy + 15, 2, 3)
        ctx.fillRect(ox + 20, oy + 15, 2, 3)
        if (row === 0) {
          ctx.fillStyle = '#f59e0b'
          ctx.fillRect(ox + 14, oy + 18, 4, 4) // Gold shield crest
        } else if (row === 3) {
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(ox + 14, oy + 17, 4, 6) // Player Number '10'
        }
      } else if (colors.outfitPattern === 'ojol' || colors.shirt === '#16a34a') {
        // Jaket Ojol (Green with high-vis reflective silver strip)
        ctx.fillStyle = '#cbd5e1'
        ctx.fillRect(ox + 10, oy + 19, 12, 2)
        ctx.fillStyle = '#0f172a'
        ctx.fillRect(ox + 10, oy + 23, 12, 2)
      } else if (colors.outfitPattern === 'cyber' || colors.shirt === '#0f172a') {
        // Cyberpunk Samurai (Glowing Cyan Collar & Edges)
        ctx.fillStyle = '#06b6d4'
        ctx.fillRect(ox + 10, oy + 15, 2, 10)
        ctx.fillRect(ox + 20, oy + 15, 2, 10)
        ctx.fillRect(ox + 13, oy + 21, 6, 2)
      } else if (colors.outfitPattern === 'batik' || colors.shirt === '#f59e0b') {
        // Batik Keraton Emas (Intricate diagonal parang dots)
        ctx.fillStyle = '#78350f'
        ctx.fillRect(ox + 11, oy + 16, 2, 2)
        ctx.fillRect(ox + 15, oy + 18, 2, 2)
        ctx.fillRect(ox + 19, oy + 20, 2, 2)
        ctx.fillRect(ox + 12, oy + 22, 2, 2)
      } else if (colors.outfitPattern === 'armor' || colors.shirt === '#64748b') {
        // Ksatria Armor (Steel plate & blue sapphire gem)
        ctx.fillStyle = '#94a3b8'
        ctx.fillRect(ox + 11, oy + 16, 10, 8)
        ctx.fillStyle = '#3b82f6'
        ctx.fillRect(ox + 15, oy + 18, 2, 3) // Blue gem
      } else if (colors.outfitPattern === 'tuxedo' || colors.shirt === '#020617') {
        // Tuxedo Walikota (White shirt triangle & gold bow tie)
        ctx.fillStyle = '#ffffff'
        ctx.beginPath()
        ctx.moveTo(ox + 16, oy + 22)
        ctx.lineTo(ox + 13, oy + 15)
        ctx.lineTo(ox + 19, oy + 15)
        ctx.closePath()
        ctx.fill()
        ctx.fillStyle = '#f59e0b'
        ctx.fillRect(ox + 15, oy + 16, 2, 1) // Golden bow tie
      }

      // Belt
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(ox + 10, oy + 24, 12, 1)
      ctx.fillStyle = '#f59e0b'
      ctx.fillRect(ox + 15, oy + 24, 2, 1) // Gold buckle

      // Arms & Hands (Animated swing)
      ctx.fillStyle = colors.shirt
      ctx.fillRect(ox + 8, oy + 16 + armSwing, 2, 6)
      ctx.fillRect(ox + 22, oy + 16 - armSwing, 2, 6)
      // Hands (Skin)
      ctx.fillStyle = colors.skin
      ctx.fillRect(ox + 8, oy + 22 + armSwing, 2, 3)
      ctx.fillRect(ox + 22, oy + 22 - armSwing, 2, 3)

      // ------------------------------------------------------------
      // 6. HEAD & DETAILED FACE
      // ------------------------------------------------------------
      // Head base (Skin)
      ctx.fillStyle = colors.skin
      ctx.fillRect(ox + 10, oy + 5, 12, 10)

      // Cute Blush cheeks & eyes (When facing front)
      if (row === 0) {
        // Eyes (Large expressive anime eyes with specular shine)
        ctx.fillStyle = '#0f172a'
        ctx.fillRect(ox + 12, oy + 9, 2, 3)
        ctx.fillRect(ox + 18, oy + 9, 2, 3)
        // White twinkle highlight in eyes
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(ox + 12, oy + 9, 1, 1)
        ctx.fillRect(ox + 18, oy + 9, 1, 1)

        // Cute pink blush cheeks
        ctx.fillStyle = 'rgba(244, 63, 94, 0.45)'
        ctx.fillRect(ox + 11, oy + 12, 2, 1)
        ctx.fillRect(ox + 19, oy + 12, 2, 1)

        // Smile
        ctx.fillStyle = '#991b1b'
        ctx.fillRect(ox + 15, oy + 12, 2, 1)
      } else if (row === 1) {
        // Facing Left
        ctx.fillStyle = '#0f172a'
        ctx.fillRect(ox + 11, oy + 9, 2, 3)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(ox + 11, oy + 9, 1, 1)
        ctx.fillStyle = 'rgba(244, 63, 94, 0.45)'
        ctx.fillRect(ox + 11, oy + 12, 2, 1)
      } else if (row === 2) {
        // Facing Right
        ctx.fillStyle = '#0f172a'
        ctx.fillRect(ox + 19, oy + 9, 2, 3)
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(ox + 20, oy + 9, 1, 1)
        ctx.fillStyle = 'rgba(244, 63, 94, 0.45)'
        ctx.fillRect(ox + 19, oy + 12, 2, 1)
      }

      // ------------------------------------------------------------
      // 7. HAIRSTYLES (Short, Spiky Anime, Long, Afro/Curly)
      // ------------------------------------------------------------
      ctx.fillStyle = colors.hair

      if (colors.hairStyle === 'spiky' || colors.hair === '#f59e0b') {
        // Super Saiyan / Spiky Anime Hair
        if (row === 3) {
          // Back of head spiky clumps
          ctx.fillRect(ox + 9, oy + 1, 14, 11)
          ctx.fillRect(ox + 8, oy + 3, 2, 5)
          ctx.fillRect(ox + 22, oy + 3, 2, 5)
        } else {
          ctx.fillRect(ox + 9, oy + 2, 14, 5)
          // Spiky spikes pointing up
          ctx.fillRect(ox + 11, oy, 3, 2)
          ctx.fillRect(ox + 18, oy, 3, 2)
          ctx.fillRect(ox + 15, oy - 1, 2, 2)
          // Bangs over forehead
          ctx.fillRect(ox + 10, oy + 6, 3, 2)
          ctx.fillRect(ox + 19, oy + 6, 3, 2)
        }
      } else if (colors.hairStyle === 'afro' || colors.hairStyle === 'curly') {
        // Fluffy Afro Disco
        ctx.beginPath()
        ctx.ellipse(ox + 16, oy + 7, 9, 7, 0, 0, Math.PI * 2)
        ctx.fill()
      } else if (colors.hairStyle === 'long' || colors.hair === '#e2e8f0') {
        // Long Flowing Hair
        ctx.fillRect(ox + 9, oy + 3, 14, 5)
        // Hair sides going down past shoulders
        ctx.fillRect(ox + 9, oy + 7, 3, 11)
        ctx.fillRect(ox + 20, oy + 7, 3, 11)
        if (row === 3) {
          ctx.fillRect(ox + 10, oy + 4, 12, 14)
        }
      } else {
        // Modern Short Hair with sideburns & stylish bangs
        if (row === 3) {
          ctx.fillRect(ox + 10, oy + 3, 12, 9)
        } else {
          ctx.fillRect(ox + 9, oy + 2, 14, 5) // Top
          ctx.fillRect(ox + 9, oy + 6, 2, 4) // Left sideburn
          ctx.fillRect(ox + 21, oy + 6, 2, 4) // Right sideburn
          if (row === 0) {
            ctx.fillRect(ox + 13, oy + 6, 4, 2) // Front bangs
          }
        }
      }

      // ------------------------------------------------------------
      // 8. HEADWEAR & ACCESSORIES (Crown, Cat Ears, Visor, Glasses, etc.)
      // ------------------------------------------------------------
      if (colors.accessory === 'crown' || colors.accessory === 'acc_crown_gold') {
        // Golden King Crown with Ruby
        ctx.fillStyle = '#f59e0b'
        ctx.fillRect(ox + 11, oy, 10, 4)
        // 3 Crown peaks
        ctx.fillRect(ox + 11, oy - 2, 2, 2)
        ctx.fillRect(ox + 15, oy - 3, 2, 3)
        ctx.fillRect(ox + 19, oy - 2, 2, 2)
        // Ruby Gem
        ctx.fillStyle = '#ef4444'
        ctx.fillRect(ox + 15, oy + 1, 2, 2)
      } else if (colors.accessory === 'cat_ears' || colors.accessory === 'acc_cat_headset') {
        // Mecha RGB Cat Ear Headset
        ctx.fillStyle = '#ec4899' // Pink ear cups
        ctx.fillRect(ox + 8, oy + 6, 2, 5)
        ctx.fillRect(ox + 22, oy + 6, 2, 5)
        ctx.fillRect(ox + 10, oy + 2, 12, 1) // Headband
        // Cat Ear Triangles
        ctx.beginPath()
        ctx.moveTo(ox + 9, oy + 2)
        ctx.lineTo(ox + 11, oy - 3)
        ctx.lineTo(ox + 13, oy + 2)
        ctx.closePath()
        ctx.fill()
        ctx.beginPath()
        ctx.moveTo(ox + 19, oy + 2)
        ctx.lineTo(ox + 21, oy - 3)
        ctx.lineTo(ox + 23, oy + 2)
        ctx.closePath()
        ctx.fill()
        // Inner cyan glow
        ctx.fillStyle = '#06b6d4'
        ctx.fillRect(ox + 11, oy, 1, 1)
        ctx.fillRect(ox + 21, oy, 1, 1)
      } else if (colors.accessory === 'glasses' || colors.accessory === 'acc_thug_glasses') {
        // 8-Bit Pixel Sunglasses
        if (row === 0) {
          ctx.fillStyle = '#000000'
          ctx.fillRect(ox + 11, oy + 8, 4, 3)
          ctx.fillRect(ox + 17, oy + 8, 4, 3)
          ctx.fillRect(ox + 15, oy + 8, 2, 1) // bridge
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(ox + 12, oy + 8, 1, 1)
          ctx.fillRect(ox + 18, oy + 8, 1, 1)
        }
      } else if (colors.accessory === 'straw_hat' || colors.accessory === 'acc_straw_hat') {
        // Luffy-style Straw Hat
        ctx.fillStyle = '#fde047'
        ctx.fillRect(ox + 7, oy + 2, 18, 3) // Wide brim
        ctx.fillRect(ox + 11, oy - 2, 10, 4) // Dome
        ctx.fillStyle = '#dc2626'
        ctx.fillRect(ox + 11, oy + 1, 10, 1) // Red ribbon
      } else if (colors.accessory === 'beanie' || colors.accessory === 'acc_beanie_lofi') {
        // Lo-Fi Knit Beanie
        ctx.fillStyle = '#f59e0b'
        ctx.fillRect(ox + 9, oy + 1, 14, 5)
        ctx.fillRect(ox + 10, oy - 2, 12, 3)
        ctx.fillStyle = '#b45309'
        ctx.fillRect(ox + 9, oy + 5, 14, 1) // Folded rim
      } else if (colors.accessory === 'cyber_visor' || colors.accessory === 'acc_cyber_visor') {
        // Cyberpunk 2077 Glowing Visor
        if (row === 0) {
          ctx.fillStyle = '#06b6d4'
          ctx.fillRect(ox + 11, oy + 8, 10, 3)
          ctx.fillStyle = '#ffffff'
          ctx.fillRect(ox + 13, oy + 9, 6, 1)
        } else if (row === 1) {
          ctx.fillStyle = '#06b6d4'
          ctx.fillRect(ox + 10, oy + 8, 4, 3)
        } else if (row === 2) {
          ctx.fillStyle = '#06b6d4'
          ctx.fillRect(ox + 18, oy + 8, 4, 3)
        }
      } else if (colors.accessory === 'halo' || colors.accessory === 'acc_halo_malaikat') {
        // Angel Glowing Halo Ring
        ctx.strokeStyle = '#fef08a'
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.ellipse(ox + 16, oy - 2, 6, 2, 0, 0, Math.PI * 2)
        ctx.stroke()
      } else if (colors.accessory === 'caping' || colors.accessory === 'acc_caping_bambu') {
        // Caping Bambu Tradisional
        ctx.fillStyle = '#facc15'
        ctx.beginPath()
        ctx.moveTo(ox + 6, oy + 4)
        ctx.lineTo(ox + 16, oy - 3)
        ctx.lineTo(ox + 26, oy + 4)
        ctx.closePath()
        ctx.fill()
        ctx.strokeStyle = '#ca8a04'
        ctx.lineWidth = 1
        ctx.stroke()
      } else if (colors.accessory === 'safari_hat' || colors.accessory === 'acc_topi_rimba') {
        // Topi Rimba Safari Ranger
        ctx.fillStyle = '#85754e'
        ctx.fillRect(ox + 6, oy + 2, 20, 2)
        ctx.fillRect(ox + 10, oy - 2, 12, 4)
        ctx.fillStyle = '#65a30d'
        ctx.fillRect(ox + 10, oy + 1, 12, 1)
      } else if (colors.accessory === 'snorkel' || colors.accessory === 'acc_snorkel_mask') {
        // Kacamata Selam Snorkel Laut
        if (row === 0) {
          ctx.fillStyle = '#06b6d4'
          ctx.fillRect(ox + 10, oy + 7, 12, 5)
          ctx.fillStyle = '#facc15'
          ctx.fillRect(ox + 22, oy + 4, 2, 9)
          ctx.fillRect(ox + 20, oy + 12, 3, 2)
        }
      }
}

export function drawCharacterSpritesheetCanvas(
  charSheet: Phaser.Textures.CanvasTexture,
  colors: AvatarColors
) {
  const ctx = charSheet.getContext()
  ctx.clearRect(0, 0, 96, 144)

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      drawSingleCharacterFrame(ctx, col * 32, row * 36, row, col, colors)
    }
  }

  charSheet.refresh()
}

export function drawCharacterPreviewCanvas(
  canvas: HTMLCanvasElement,
  colors: AvatarColors,
  scale: number = 2
) {
  canvas.width = 32 * scale
  canvas.height = 36 * scale
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  ctx.imageSmoothingEnabled = false
  ctx.save()
  ctx.scale(scale, scale)
  drawSingleCharacterFrame(ctx, 0, 0, 0, 0, colors)
  ctx.restore()
}
