import { NextResponse, type NextRequest } from 'next/server'
import {
  readLocalDB,
  writeLocalDB,
  getActiveCitizen,
} from '@/lib/db/localDb'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { avatarConfig, itemId } = body

    const citizenId = request.cookies.get('nc_citizen_id')?.value
    const citizen = getActiveCitizen(citizenId)
    if (!citizen) {
      return NextResponse.json({ error: 'Citizen not found' }, { status: 404 })
    }

    const db = readLocalDB()
    const cit = db.citizens.find((c) => c.id === citizen.id)
    if (cit && (avatarConfig || itemId)) {
      if (avatarConfig) {
        const shirtColor =
          avatarConfig.shirtColor ||
          avatarConfig.outfit?.top ||
          cit.avatar_config.shirtColor ||
          '#2563eb'
        const pantsColor =
          avatarConfig.pantsColor ||
          avatarConfig.outfit?.bottom ||
          cit.avatar_config.pantsColor ||
          '#1e293b'
        const shoesColor =
          avatarConfig.shoesColor ||
          avatarConfig.outfit?.shoes ||
          cit.avatar_config.shoesColor ||
          '#f1f5f9'
        const hairColor =
          avatarConfig.hairColor || cit.avatar_config.hairColor || '#1e293b'
        const skinTone =
          avatarConfig.skinTone || cit.avatar_config.skinTone || '#f5d0b0'

        cit.avatar_config = {
          ...cit.avatar_config,
          ...avatarConfig,
          skinTone,
          hairColor,
          shirtColor,
          pantsColor,
          shoesColor,
          outfit: {
            top: shirtColor,
            bottom: pantsColor,
            shoes: shoesColor,
            accessory: avatarConfig.outfit?.accessory ?? cit.avatar_config.accessory ?? null,
          },
        }
      }
      cit.onboarding_completed = true
      cit.updated_at = new Date().toISOString()

      // If an itemId was equipped, update inventory states and avatar patterns
      if (itemId) {
        const item = db.items.find((i) => i.id === itemId)
        if (item) {
          if (item.category === 'tops') {
            cit.avatar_config.shirtColor = item.color
            cit.avatar_config.outfitPattern = item.pattern || 'plain'
            if (cit.avatar_config.outfit) cit.avatar_config.outfit.top = item.color
          } else if (item.category === 'bottoms') {
            cit.avatar_config.pantsColor = item.color
            if (item.pattern && ['sarung', 'skirt', 'techwear'].includes(item.pattern)) {
              cit.avatar_config.outfitPattern = item.pattern
            }
            if (cit.avatar_config.outfit) cit.avatar_config.outfit.bottom = item.color
          } else if (item.category === 'shoes') {
            cit.avatar_config.shoesColor = item.color
            if (item.pattern && ['swallow', 'roller'].includes(item.pattern)) {
              cit.avatar_config.outfitPattern = item.pattern
            }
            if (cit.avatar_config.outfit) cit.avatar_config.outfit.shoes = item.color
          } else if (item.category === 'hairstyles') {
            cit.avatar_config.hairColor = item.color
            if (item.pattern) {
              cit.avatar_config.hairStyle = item.pattern
            }
          } else if (item.category === 'accessories') {
            cit.avatar_config.accessory = item.pattern || item.id
            if (cit.avatar_config.outfit) cit.avatar_config.outfit.accessory = item.pattern || item.id
          } else if (item.category === 'back') {
            cit.avatar_config.backpack = item.pattern || item.id
          }

          db.inventory.forEach((inv) => {
            if (inv.citizen_id === cit.id) {
              const other = db.items.find((i) => i.id === inv.item_id)
              if (other && other.category === item.category) {
                inv.is_equipped = inv.item_id === itemId
              }
            }
          })
        }
      }

      writeLocalDB(db)
    }

    return NextResponse.json({
      success: true,
      citizen: cit,
      avatarConfig: cit ? cit.avatar_config : null,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kesalahan server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
