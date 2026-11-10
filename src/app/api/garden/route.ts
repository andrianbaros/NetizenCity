import { NextResponse, type NextRequest } from 'next/server'
import {
  getActiveCitizen,
  getCitizenGarden,
  waterCitizenGarden,
  fertilizeCitizenGarden,
  refillGardenWater,
  harvestCitizenGarden,
  plantCitizenGarden,
  GARDEN_SEEDS,
  MAX_DAILY_WATERS,
  WATER_REFILL_PRICE,
} from '@/lib/db/localDb'

export async function GET(request: NextRequest) {
  try {
    const citizenId = request.cookies.get('nc_citizen_id')?.value
    const citizen = getActiveCitizen(citizenId)
    if (!citizen) {
      return NextResponse.json({
        isGuest: true,
        garden: {
          id: 'guest-garden',
          citizen_id: 'guest',
          seed_id: 'coin_tree',
          stage: 1,
          progress: 0,
          water_level: 100,
          fertilizer_count: 3,
          total_harvested: 0,
          daily_waters_count: 0,
          daily_waters_date: new Date().toISOString().slice(0, 10),
          last_watered_at: new Date().toISOString(),
          last_refilled_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        seeds: GARDEN_SEEDS,
        maxDailyWaters: MAX_DAILY_WATERS,
        waterRefillPrice: WATER_REFILL_PRICE,
      })
    }

    const garden = getCitizenGarden(citizen.id)
    return NextResponse.json({
      success: true,
      isGuest: false,
      garden,
      seeds: GARDEN_SEEDS,
      maxDailyWaters: MAX_DAILY_WATERS,
      waterRefillPrice: WATER_REFILL_PRICE,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kesalahan server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const citizenId = request.cookies.get('nc_citizen_id')?.value
    const citizen = getActiveCitizen(citizenId)
    if (!citizen) {
      return NextResponse.json(
        { error: 'Silakan masuk atau daftar terlebih dahulu untuk menanam di kebun.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    if (action === 'water') {
      const result = waterCitizenGarden(citizen.id)
      if (!result.success) {
        return NextResponse.json(result, { status: 400 })
      }
      return NextResponse.json(result)
    }

    if (action === 'fertilize') {
      const result = fertilizeCitizenGarden(citizen.id)
      if (!result.success) {
        return NextResponse.json(result, { status: 400 })
      }
      return NextResponse.json(result)
    }

    if (action === 'refill_water') {
      const result = refillGardenWater(citizen.id)
      if (!result.success) {
        return NextResponse.json(result, { status: 400 })
      }
      return NextResponse.json(result)
    }

    if (action === 'harvest') {
      const result = harvestCitizenGarden(citizen.id)
      if (!result.success) {
        return NextResponse.json(result, { status: 400 })
      }
      return NextResponse.json(result)
    }

    if (action === 'plant') {
      const { seedId } = body
      if (!seedId) {
        return NextResponse.json({ error: 'Bibit tanaman wajib dipilih' }, { status: 400 })
      }
      const result = plantCitizenGarden(citizen.id, seedId)
      if (!result.success) {
        return NextResponse.json(result, { status: 400 })
      }
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: 'Aksi kebun tidak valid' }, { status: 400 })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Kesalahan server'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
