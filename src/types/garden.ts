// ============================================================
// NETIZENCITY - Kebun Netizen 3D Types & Seed Definitions
// Safe for both client and server imports (zero node:fs dependency)
// ============================================================

export interface GardenSeedDefinition {
  id: 'coin_tree' | 'apple_tree' | 'orchid' | 'golden_tree'
  name: string
  tagline: string
  rewardCoins: number
  rewardItem?: {
    id: string
    name: string
    category: 'fish' | 'tops' | 'accessories' | 'tools'
    icon: string
    sellPrice: number
  }
  waterPerStep: number
  growthPerWater: number
  growthPerFertilizer: number
  color: string
  fruitColor: string
  leafColor: string
  description: string
}

export const MAX_DAILY_WATERS = 3 // Maksimal siram 3 kali sehari
export const WATER_REFILL_PRICE = 200 // Harga reset / isi ulang air sumur kebun (200 Koin Warga)

export interface GardenState {
  id: string
  citizen_id: string
  seed_id: 'coin_tree' | 'apple_tree' | 'orchid' | 'golden_tree'
  stage: number // 1: Seed, 2: Sprout, 3: Growing, 4: Blooming, 5: Harvest Ready
  progress: number // 0 to 100
  water_level: number // 0 to 100
  fertilizer_count: number
  total_harvested: number
  daily_waters_count: number // Berapa kali sudah disiram hari ini
  daily_waters_date: string // Tanggal YYYY-MM-DD pelacakan kuota harian
  last_watered_at: string
  last_refilled_at: string
  created_at: string
  updated_at: string
}

export const GARDEN_SEEDS: Record<string, GardenSeedDefinition> = {
  coin_tree: {
    id: 'coin_tree',
    name: 'Pohon Koin Warga',
    tagline: 'Cepat Panen & Koin Melimpah',
    rewardCoins: 150,
    waterPerStep: 10,
    growthPerWater: 25,
    growthPerFertilizer: 40,
    color: '#F59E0B',
    fruitColor: '#FBBF24',
    leafColor: '#22C55E',
    description: 'Bibit pohon ajaib yang menghasilkan koin emas berkilauan di setiap dahannya.',
  },
  apple_tree: {
    id: 'apple_tree',
    name: 'Pohon Apel Merah Segar',
    tagline: 'Buah Manis & Koin Berkualitas',
    rewardCoins: 240,
    rewardItem: {
      id: 'harvest_apple_super',
      name: 'Apel Merah Kebun Netizen',
      category: 'accessories',
      icon: '🍎',
      sellPrice: 120,
    },
    waterPerStep: 10,
    growthPerWater: 20,
    growthPerFertilizer: 35,
    color: '#EF4444',
    fruitColor: '#DC2626',
    leafColor: '#16A34A',
    description: 'Pohon buah apel organik yang ranum dan manis. Menghasilkan koin dan buah apel langka.',
  },
  orchid: {
    id: 'orchid',
    name: 'Bunga Anggrek Ungu Tropis',
    tagline: 'Aroma Semerbak & Nilai Tinggi',
    rewardCoins: 320,
    rewardItem: {
      id: 'harvest_orchid_flower',
      name: 'Anggrek Ungu Mekar Sempurna',
      category: 'accessories',
      icon: '🌸',
      sellPrice: 160,
    },
    waterPerStep: 10,
    growthPerWater: 18,
    growthPerFertilizer: 30,
    color: '#A855F7',
    fruitColor: '#D8B4FE',
    leafColor: '#15803D',
    description: 'Tanaman hias nusantara yang anggun dan berharga tinggi di pasar bunga kota.',
  },
  golden_tree: {
    id: 'golden_tree',
    name: 'Pohon Emas Sultan Kemakmuran',
    tagline: 'Kemakmuran Tertinggi Warga',
    rewardCoins: 500,
    rewardItem: {
      id: 'harvest_golden_nugget',
      name: 'Bongkahan Emas Sultan',
      category: 'accessories',
      icon: '👑',
      sellPrice: 250,
    },
    waterPerStep: 10,
    growthPerWater: 15,
    growthPerFertilizer: 30,
    color: '#EAB308',
    fruitColor: '#FDE047',
    leafColor: '#15803D',
    description: 'Pohon pusaka legendaris Netizen City dengan cabang keemasan dan panen koin sultan melimpah.',
  },
}
