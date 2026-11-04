// ============================================================
// NETIZENCITY - Character Spritesheet Renderer
// Dynamic pixel-art character generator for Phaser 3
// ============================================================

import type * as Phaser from 'phaser'

export interface AvatarColors {
  skin: string
  hair: string
  shirt: string
  pants: string
  shoes: string
}

export function resolveAvatarColors(avatarConfig?: {
  skinTone?: string
  hairColor?: string
  shirtColor?: string
  pantsColor?: string
  shoesColor?: string
  outfit?: {
    top?: string | null
    bottom?: string | null
    shoes?: string | null
  }
} | null): AvatarColors {
  return {
    skin: avatarConfig?.skinTone || '#f5d0b0',
    hair: avatarConfig?.hairColor || '#1e293b',
    shirt: avatarConfig?.shirtColor || avatarConfig?.outfit?.top || '#2563eb',
    pants: avatarConfig?.pantsColor || avatarConfig?.outfit?.bottom || '#1e293b',
    shoes: avatarConfig?.shoesColor || avatarConfig?.outfit?.shoes || '#f1f5f9',
  }
}

export function drawCharacterSpritesheetCanvas(
  charSheet: Phaser.Textures.CanvasTexture,
  colors: AvatarColors
) {
  const ctx = charSheet.getContext()
  ctx.clearRect(0, 0, 96, 144)

  // Row 0: Down (frames 0, 1, 2)
  // Row 1: Left (frames 3, 4, 5)
  // Row 2: Right (frames 6, 7, 8)
  // Row 3: Up (frames 9, 10, 11)

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const ox = col * 32
      const oy = row * 36
      const legOffset = col === 1 ? -2 : col === 2 ? 2 : 0

      // 1. Drop Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)'
      ctx.beginPath()
      ctx.ellipse(ox + 16, oy + 34, 8, 3, 0, 0, Math.PI * 2)
      ctx.fill()

      // 2. Hair back (Facing up / away from screen)
      if (row === 3) {
        ctx.fillStyle = colors.hair
        ctx.fillRect(ox + 11, oy + 4, 10, 10)
      }

      // 3. Head / Skin
      ctx.fillStyle = colors.skin
      ctx.fillRect(ox + 11, oy + 6, 10, 10)

      // 4. Face & Hair Front Details based on direction
      if (row === 0) {
        // Facing down
        ctx.fillStyle = colors.hair
        ctx.fillRect(ox + 10, oy + 3, 12, 4) // Hair top
        ctx.fillStyle = '#000000'
        ctx.fillRect(ox + 13, oy + 10, 2, 2) // Left eye
        ctx.fillRect(ox + 17, oy + 10, 2, 2) // Right eye
      } else if (row === 1) {
        // Facing left
        ctx.fillStyle = colors.hair
        ctx.fillRect(ox + 10, oy + 3, 11, 4)
        ctx.fillStyle = '#000000'
        ctx.fillRect(ox + 12, oy + 10, 2, 2)
      } else if (row === 2) {
        // Facing right
        ctx.fillStyle = colors.hair
        ctx.fillRect(ox + 11, oy + 3, 11, 4)
        ctx.fillStyle = '#000000'
        ctx.fillRect(ox + 18, oy + 10, 2, 2)
      }

      // 5. Body / Torso (Shirt)
      ctx.fillStyle = colors.shirt
      ctx.fillRect(ox + 10, oy + 16, 12, 10)

      // 6. Legs (Pants)
      ctx.fillStyle = colors.pants
      ctx.fillRect(ox + 11, oy + 26, 4, 6 + legOffset)
      ctx.fillRect(ox + 17, oy + 26, 4, 6 - legOffset)

      // 7. Shoes
      ctx.fillStyle = colors.shoes
      ctx.fillRect(ox + 10, oy + 31 + legOffset, 5, 3)
      ctx.fillRect(ox + 17, oy + 31 - legOffset, 5, 3)
    }
  }

  charSheet.refresh()
}
