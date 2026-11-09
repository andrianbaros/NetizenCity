// ============================================================
// NETIZENCITY - Comprehensive Persistent Local Database
// Saves all 17 schema entities to data/local_db.json
// ============================================================

import fs from 'fs'
import path from 'path'
import { generateKTNNumber } from '@/lib/utils/ktn'
import type { AvatarConfig } from '@/types/citizen'

const DB_PATH = path.join(process.cwd(), 'data', 'local_db.json')
const TMP_DB_PATH = path.join(
  process.platform === 'win32'
    ? process.env.TEMP || process.env.TMP || path.join(process.cwd(), 'data')
    : '/tmp',
  'netizencity_local_db.json'
)

declare global {
  // eslint-disable-next-line no-var
  var __netizen_local_db: LocalDBSchema | undefined
}

export interface LocalDBSchema {
  citizens: Array<{
    id: string
    user_id: string
    email: string
    password_hash: string
    username: string
    display_name: string
    ktn_number: string
    avatar_config: AvatarConfig
    level: number
    xp: number
    job: string | null
    housing_id: string | null
    housing_name?: string
    district: string
    biography: string
    is_online: boolean
    role: 'citizen' | 'moderator' | 'admin' | 'mayor'
    onboarding_completed: boolean
    joined_at: string
    updated_at: string
  }>
  wallets: Array<{
    id: string
    citizen_id: string
    balance: number
    total_earned: number
    total_spent: number
    updated_at: string
  }>
  transactions: Array<{
    id: string
    citizen_id: string
    type: 'earn' | 'spend' | 'reward' | 'admin'
    amount: number
    previous_balance: number
    new_balance: number
    description: string
    reference_type: string | null
    reference_id: string | null
    created_at: string
  }>
  housing_units: Array<{
    id: string
    name: string
    type: 'small_house' | 'standard_house' | 'apartment' | 'public_housing' | 'premium'
    district: string
    unit_number: string
    status: 'available' | 'occupied'
  }>
  housing_assignments: Array<{
    id: string
    citizen_id: string
    housing_id: string
    moved_in_at: string
    is_active: boolean
  }>
  items: Array<{
    id: string
    name: string
    description: string
    category: 'tops' | 'bottoms' | 'shoes' | 'hairstyles' | 'accessories' | 'back'
    price: number
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
    color: string
    sprite_key: string
    is_available: boolean
    pattern?: string
  }>
  inventory: Array<{
    id: string
    citizen_id: string
    item_id: string
    is_equipped: boolean
    acquired_at: string
  }>
  daily_login_rewards: Array<{
    id: string
    citizen_id: string
    day_number: number
    reward_coins: number
    streak_count: number
    claimed_date: string
    claimed_at: string
  }>
  missions: Array<{
    id: string
    name: string
    description: string
    type: 'daily' | 'weekly'
    reward_coins: number
    reward_xp: number
    target: number
  }>
  citizen_missions: Array<{
    id: string
    citizen_id: string
    mission_id: string
    progress: number
    target: number
    status: 'active' | 'completed' | 'claimed'
  }>
  votes: Array<{
    id: string
    title: string
    description: string
    options: Array<{ id: number; title: string; votes: number }>
    is_active: boolean
  }>
  vote_submissions: Array<{
    id: string
    vote_id: string
    citizen_id: string
    selected_option: number
    submitted_at: string
  }>
  chat_messages: Array<{
    id: string
    citizen_id: string
    sender_name: string
    channel: string
    content: string
    created_at: string
  }>
  announcements: Array<{
    id: string
    title: string
    content: string
    category: string
    author: string
    created_at: string
  }>
}

function getInitialSeedData(): LocalDBSchema {
  const defaultCitizenId = 'c-netizen-01'
  const defaultUserId = 'u-netizen-01'
  const defaultKTN = 'KTN-20261103-W4RG4'

  return {
    citizens: [
      {
        id: defaultCitizenId,
        user_id: defaultUserId,
        email: 'warga@netizencity.id',
        password_hash: '123456',
        username: 'warga_netizen',
        display_name: 'Warga Netizen',
        ktn_number: defaultKTN,
        avatar_config: {
          skinTone: '#f5d0b0',
          hairStyle: 'short',
          hairColor: '#1e293b',
          shirtColor: '#2563eb',
          pantsColor: '#1e293b',
          shoesColor: '#f1f5f9',
          expression: 'happy',
        },
        level: 1,
        xp: 150,
        job: 'Kurir Pengiriman Kota',
        housing_id: 'house-apt-01',
        housing_name: 'Rusunawa Harapan Baru Blok A - Unit 304',
        district: 'Perumahan Utara',
        biography: 'Warga aktif pertama NETIZENCITY. Suka menjelajahi Alun-Alun dan berbelanja di Mall!',
        is_online: true,
        role: 'citizen',
        onboarding_completed: true,
        joined_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ],
    wallets: [
      {
        id: 'w-netizen-01',
        citizen_id: defaultCitizenId,
        balance: 650,
        total_earned: 650,
        total_spent: 0,
        updated_at: new Date().toISOString(),
      },
    ],
    transactions: [
      {
        id: 'tx-init-01',
        citizen_id: defaultCitizenId,
        type: 'reward',
        amount: 500,
        previous_balance: 0,
        new_balance: 500,
        description: 'Bonus Selamat Datang Balai Kota',
        reference_type: 'onboarding',
        reference_id: null,
        created_at: new Date().toISOString(),
      },
    ],
    housing_units: [
      { id: 'house-apt-01', name: 'Rusunawa Harapan Baru Blok A', type: 'public_housing', district: 'Perumahan Utara', unit_number: 'Unit 304', status: 'occupied' },
      { id: 'house-apt-02', name: 'Rusunawa Harapan Baru Blok B', type: 'public_housing', district: 'Perumahan Utara', unit_number: 'Unit 201', status: 'available' },
      { id: 'house-apt-03', name: 'Menara Netizen City View', type: 'apartment', district: 'Perumahan Utara', unit_number: 'Lantai 12 #12B', status: 'available' },
      { id: 'house-melati-01', name: 'Perumahan Asri Jalan Melati', type: 'small_house', district: 'Perumahan Utara', unit_number: 'No. 12', status: 'available' },
      { id: 'house-mawar-01', name: 'Perumahan Hijau Jalan Mawar', type: 'standard_house', district: 'Perumahan Utara', unit_number: 'No. 8', status: 'available' },
      { id: 'house-downtown-01', name: 'Menara Sudirman Netizen', type: 'premium', district: 'Downtown', unit_number: 'Penthouse #01', status: 'available' },
    ],
    housing_assignments: [
      {
        id: 'ha-01',
        citizen_id: defaultCitizenId,
        housing_id: 'house-apt-01',
        moved_in_at: new Date().toISOString(),
        is_active: true,
      },
    ],
    items: [
      {
            "id": "top_basic_blue",
            "name": "Kaos Biru Komunitas",
            "description": "Kaos kasual resmi Netizen City",
            "category": "tops",
            "price": 0,
            "rarity": "common",
            "color": "#2563eb",
            "sprite_key": "top_blue",
            "is_available": true,
            "pattern": "plain"
      },
      {
            "id": "top_jersey_garuda",
            "name": "Jersey Timnas Garuda Netizen",
            "description": "Jersey merah menyala dengan lambang perisai emas & nomor 10 di punggung",
            "category": "tops",
            "price": 250,
            "rarity": "rare",
            "color": "#dc2626",
            "sprite_key": "top_jersey",
            "is_available": true,
            "pattern": "jersey"
      },
      {
            "id": "top_bomber_ojol",
            "name": "Jaket Bomber Ojol Hijau Neon",
            "description": "Jaket driver ikonik kota virtual dengan strip reflektif silver menyala",
            "category": "tops",
            "price": 180,
            "rarity": "uncommon",
            "color": "#16a34a",
            "sprite_key": "top_ojol",
            "is_available": true,
            "pattern": "ojol"
      },
      {
            "id": "top_cyber_samurai",
            "name": "Jaket Techwear Street Samurai",
            "description": "Jaket futuristik kerah tinggi berhiaskan garis neon cyan menyala",
            "category": "tops",
            "price": 500,
            "rarity": "epic",
            "color": "#0f172a",
            "sprite_key": "top_cyber",
            "is_available": true,
            "pattern": "cyber"
      },
      {
            "id": "top_batik_keraton",
            "name": "Batik Keraton Sutra Emas",
            "description": "Batik motif parang emas megah untuk acara kenegaraan Balai Kota",
            "category": "tops",
            "price": 650,
            "rarity": "epic",
            "color": "#f59e0b",
            "sprite_key": "top_batik",
            "is_available": true,
            "pattern": "batik"
      },
      {
            "id": "top_armor_ksatria",
            "name": "Baju Zirah Ksatria Pixel",
            "description": "Armor pelat baja perak bertatahkan kristal safir biru di dada",
            "category": "tops",
            "price": 850,
            "rarity": "legendary",
            "color": "#64748b",
            "sprite_key": "top_armor",
            "is_available": true,
            "pattern": "armor"
      },
      {
            "id": "top_tuxedo_walikota",
            "name": "Jas Tuxedo Eksekutif Walikota",
            "description": "Jas hitam formal dengan dasi kupu-kupu satin emas khas walikota",
            "category": "tops",
            "price": 1000,
            "rarity": "legendary",
            "color": "#020617",
            "sprite_key": "top_tuxedo",
            "is_available": true,
            "pattern": "tuxedo"
      },
      {
            "id": "top_pantai_hawaii",
            "name": "Kemeja Pantai Tropis Kelapa",
            "description": "Kemeja santai warna toska cerah dengan motif daun kelapa",
            "category": "tops",
            "price": 140,
            "rarity": "common",
            "color": "#06b6d4",
            "sprite_key": "top_hawaii",
            "is_available": true,
            "pattern": "plain"
      },
      {
            "id": "top_hoodie_red",
            "name": "Hoodie Merah Netizen",
            "description": "Hoodie hangat berbahan tebal warna merah cerah",
            "category": "tops",
            "price": 150,
            "rarity": "uncommon",
            "color": "#dc2626",
            "sprite_key": "top_red",
            "is_available": true,
            "pattern": "plain"
      },
      {
            "id": "bottom_denim_sky",
            "name": "Jeans Denim Vintage",
            "description": "Celana denim tahan lama khas perkotaan",
            "category": "bottoms",
            "price": 120,
            "rarity": "common",
            "color": "#0284c7",
            "sprite_key": "bottom_blue",
            "is_available": true,
            "pattern": "plain"
      },
      {
            "id": "bottom_sarung_ronda",
            "name": "Sarung Batik Kotak Warga",
            "description": "Sarung santai motif kotak-kotak khas warga ronda dan nongkrong malam",
            "category": "bottoms",
            "price": 90,
            "rarity": "common",
            "color": "#047857",
            "sprite_key": "bottom_sarung",
            "is_available": true,
            "pattern": "sarung"
      },
      {
            "id": "bottom_techwear_jogger",
            "name": "Jogger Techwear Tali Taktis",
            "description": "Celana jogger hitam pekat dengan sabuk tali kargo gantung futuristik",
            "category": "bottoms",
            "price": 280,
            "rarity": "rare",
            "color": "#0f172a",
            "sprite_key": "bottom_techwear",
            "is_available": true,
            "pattern": "techwear"
      },
      {
            "id": "bottom_rok_tartan",
            "name": "Rok Mini Tartan Harajuku",
            "description": "Rok lipit kotak-kotak merah gaya anime Harajuku Jepang",
            "category": "bottoms",
            "price": 260,
            "rarity": "rare",
            "color": "#dc2626",
            "sprite_key": "bottom_skirt",
            "is_available": true,
            "pattern": "skirt"
      },
      {
            "id": "bottom_cargo_black",
            "name": "Celana Kargo Taktis",
            "description": "Banyak kantong fungsional untuk kurir paket logistik",
            "category": "bottoms",
            "price": 200,
            "rarity": "uncommon",
            "color": "#1e293b",
            "sprite_key": "bottom_cargo",
            "is_available": true,
            "pattern": "plain"
      },
      {
            "id": "bottom_loreng_militer",
            "name": "Celana Kargo Loreng Gurun",
            "description": "Celana militer kamuflase tebal untuk petualang sejati",
            "category": "bottoms",
            "price": 310,
            "rarity": "rare",
            "color": "#78350f",
            "sprite_key": "bottom_camo",
            "is_available": true,
            "pattern": "plain"
      },
      {
            "id": "shoes_sneakers_white",
            "name": "Sneakers Putih Kasual",
            "description": "Sneakers ringan nyaman untuk jalan santai di alun-alun",
            "category": "shoes",
            "price": 80,
            "rarity": "common",
            "color": "#f1f5f9",
            "sprite_key": "shoes_white",
            "is_available": true,
            "pattern": "plain"
      },
      {
            "id": "shoes_sandal_swallow",
            "name": "Sandal Jepit Karet Hijau",
            "description": "Sandal jepit legendaris anti-hilang paling santai sedunia",
            "category": "shoes",
            "price": 50,
            "rarity": "common",
            "color": "#10b981",
            "sprite_key": "shoes_swallow",
            "is_available": true,
            "pattern": "swallow"
      },
      {
            "id": "shoes_roller_glider",
            "name": "Sepatu Roda Glider Neon",
            "description": "Sepatu roller berseluncur cepat dengan roda cyan bercahaya",
            "category": "shoes",
            "price": 520,
            "rarity": "epic",
            "color": "#06b6d4",
            "sprite_key": "shoes_roller",
            "is_available": true,
            "pattern": "roller"
      },
      {
            "id": "shoes_sneakers_air",
            "name": "Sneakers Air Netizen High-Top",
            "description": "Sneakers basket hypebeast merah-putih edisi komunitas",
            "category": "shoes",
            "price": 480,
            "rarity": "rare",
            "color": "#dc2626",
            "sprite_key": "shoes_air",
            "is_available": true,
            "pattern": "plain"
      },
      {
            "id": "shoes_boots_tempur",
            "name": "Sepatu Boots Tempur Obsidian",
            "description": "Boots kulit baja hitam tahan banting anti-lumpur",
            "category": "shoes",
            "price": 380,
            "rarity": "rare",
            "color": "#0f172a",
            "sprite_key": "shoes_boots",
            "is_available": true,
            "pattern": "plain"
      },
      {
            "id": "shoes_sneakers_gold",
            "name": "Sneakers Emas Edisi Komunitas",
            "description": "Sepatu emas berkilau hadiah kehormatan warga berprestasi",
            "category": "shoes",
            "price": 800,
            "rarity": "legendary",
            "color": "#f59e0b",
            "sprite_key": "shoes_gold",
            "is_available": true,
            "pattern": "plain"
      },
      {
            "id": "acc_cat_headset",
            "name": "Headset Mecha Kucing RGB",
            "description": "Headset gaming dengan telinga kucing menyala warna magenta neon",
            "category": "accessories",
            "price": 400,
            "rarity": "epic",
            "color": "#ec4899",
            "sprite_key": "acc_cat",
            "is_available": true,
            "pattern": "cat_ears"
      },
      {
            "id": "acc_crown_gold",
            "name": "Mahkota Emas Raja Netizen",
            "description": "Mahkota emas murni bertabur batu permata rubi merah mewah",
            "category": "accessories",
            "price": 1200,
            "rarity": "legendary",
            "color": "#f59e0b",
            "sprite_key": "acc_crown",
            "is_available": true,
            "pattern": "crown"
      },
      {
            "id": "acc_thug_glasses",
            "name": "Kacamata Hitam Pixel 8-Bit",
            "description": "Kacamata hitam pixel-art ikonik meme santai",
            "category": "accessories",
            "price": 220,
            "rarity": "rare",
            "color": "#000000",
            "sprite_key": "acc_glasses",
            "is_available": true,
            "pattern": "glasses"
      },
      {
            "id": "acc_straw_hat",
            "name": "Topi Jerami Petualang Kota",
            "description": "Topi jerami pita merah gaya kapten bajak laut penjelajah",
            "category": "accessories",
            "price": 300,
            "rarity": "uncommon",
            "color": "#fde047",
            "sprite_key": "acc_straw",
            "is_available": true,
            "pattern": "straw_hat"
      },
      {
            "id": "acc_beanie_lofi",
            "name": "Topi Beanie Rapper Lo-Fi",
            "description": "Beanie rajut mustard kekinian untuk nongkrong malam",
            "category": "accessories",
            "price": 160,
            "rarity": "common",
            "color": "#f59e0b",
            "sprite_key": "acc_beanie",
            "is_available": true,
            "pattern": "beanie"
      },
      {
            "id": "acc_cyber_visor",
            "name": "Visor Neon Cyberpunk 2077",
            "description": "Kacamata visor strip neon biru bersinar khas masa depan",
            "category": "accessories",
            "price": 450,
            "rarity": "epic",
            "color": "#06b6d4",
            "sprite_key": "acc_visor",
            "is_available": true,
            "pattern": "cyber_visor"
      },
      {
            "id": "acc_halo_malaikat",
            "name": "Halo Cincin Cahaya Malaikat",
            "description": "Lingkaran suci melayang berkilau emas di atas kepala",
            "category": "accessories",
            "price": 950,
            "rarity": "legendary",
            "color": "#fef08a",
            "sprite_key": "acc_halo",
            "is_available": true,
            "pattern": "halo"
      },
      {
            "id": "hair_spiky_anime",
            "name": "Rambut Super Saiyan Emas",
            "description": "Rambut jabrik pirang gaya anime legendaris berkarakter kuat",
            "category": "hairstyles",
            "price": 350,
            "rarity": "rare",
            "color": "#f59e0b",
            "sprite_key": "hair_spiky",
            "is_available": true,
            "pattern": "spiky"
      },
      {
            "id": "hair_punk_cyan",
            "name": "Mohawk Cyberpunk Neon",
            "description": "Gaya mohawk biru cyan menyala terang di malam hari",
            "category": "hairstyles",
            "price": 300,
            "rarity": "rare",
            "color": "#06b6d4",
            "sprite_key": "hair_cyan",
            "is_available": true,
            "pattern": "punk"
      },
      {
            "id": "hair_afro_disco",
            "name": "Afro Klasik Kribo Funk",
            "description": "Rambut afro mekar bulat tebal khas funk retro tahun 80-an",
            "category": "hairstyles",
            "price": 280,
            "rarity": "uncommon",
            "color": "#334155",
            "sprite_key": "hair_afro",
            "is_available": true,
            "pattern": "afro"
      },
      {
            "id": "hair_long_silver",
            "name": "Rambut Panjang Lurus Silver",
            "description": "Rambut panjang perak anggun berkilau jatuh melewati bahu",
            "category": "hairstyles",
            "price": 380,
            "rarity": "epic",
            "color": "#e2e8f0",
            "sprite_key": "hair_long",
            "is_available": true,
            "pattern": "long"
      },
      {
            "id": "back_sayap_malaikat",
            "name": "Sayap Malaikat Pixel Putih",
            "description": "Sepasang sayap bulu suci yang mengepak anggun di punggungmu",
            "category": "back",
            "price": 1500,
            "rarity": "legendary",
            "color": "#ffffff",
            "sprite_key": "back_wings",
            "is_available": true,
            "pattern": "wings"
      },
      {
            "id": "back_tas_astronaut",
            "name": "Ransel Kapsul Kucing Angkasa",
            "description": "Tas ransel futuristik dengan kubah kaca berisi kucing oranye lucu",
            "category": "back",
            "price": 600,
            "rarity": "epic",
            "color": "#38bdf8",
            "sprite_key": "back_cat",
            "is_available": true,
            "pattern": "astronaut"
      }
],
    inventory: [
      { id: 'inv-01', citizen_id: defaultCitizenId, item_id: 'top_basic_blue', is_equipped: true, acquired_at: new Date().toISOString() },
      { id: 'inv-02', citizen_id: defaultCitizenId, item_id: 'bottom_denim_sky', is_equipped: true, acquired_at: new Date().toISOString() },
      { id: 'inv-03', citizen_id: defaultCitizenId, item_id: 'shoes_sneakers_white', is_equipped: true, acquired_at: new Date().toISOString() },
    ],
    daily_login_rewards: [
      { id: 'dlr-01', citizen_id: defaultCitizenId, day_number: 1, reward_coins: 50, streak_count: 1, claimed_date: new Date().toISOString().split('T')[0], claimed_at: new Date().toISOString() },
    ],
    missions: [
      { id: 'm-01', name: 'Jelajah Kota', description: 'Berjalan sejauh 500 langkah di kota', type: 'daily', reward_coins: 50, reward_xp: 25, target: 500 },
      { id: 'm-02', name: 'Petugas Kebersihan', description: 'Bersihkan 3 sampah yang berserakan di trotoar', type: 'daily', reward_coins: 75, reward_xp: 40, target: 3 },
      { id: 'm-03', name: 'Antar Paket Kurir', description: 'Selesaikan 2 pengantaran paket barang dari pabrik', type: 'daily', reward_coins: 150, reward_xp: 80, target: 2 },
      { id: 'm-04', name: 'Suara Demokrasi', description: 'Berikan suaramu pada polling kebijakan kota di Balai Kota', type: 'weekly', reward_coins: 100, reward_xp: 50, target: 1 },
    ],
    citizen_missions: [
      { id: 'cm-01', citizen_id: defaultCitizenId, mission_id: 'm-01', progress: 320, target: 500, status: 'active' },
      { id: 'cm-02', citizen_id: defaultCitizenId, mission_id: 'm-02', progress: 1, target: 3, status: 'active' },
      { id: 'cm-03', citizen_id: defaultCitizenId, mission_id: 'm-03', progress: 0, target: 2, status: 'active' },
    ],
    votes: [
      {
        id: 'vote-01',
        title: 'Fasilitas Publik Baru NETIZENCITY',
        description: 'Pilih fasilitas umum berikutnya yang akan diprioritaskan dibangun oleh Pemerintah Kota.',
        options: [
          { id: 0, title: 'Stadion Olahraga & Mini-Game Sepakbola Kota', votes: 1984 },
          { id: 1, title: 'Museum Seni Pixel & Bioskop Terbuka Komunitas', votes: 923 },
          { id: 2, title: 'Jalur Sepeda & Taman Rekreasi Danau Netizen', votes: 513 },
        ],
        is_active: true,
      },
    ],
    vote_submissions: [],
    chat_messages: [
      {
        id: 'msg-01',
        citizen_id: 'system',
        sender_name: 'Mayor',
        channel: 'global',
        content: 'Selamat datang di NETIZENCITY! Jelajahi kota, kunjungi Alun-Alun Tugu, dan jadilah warga aktif.',
        created_at: new Date().toISOString(),
      },
      {
        id: 'msg-02',
        citizen_id: 'c-admin',
        sender_name: 'Admin Kota',
        channel: 'global',
        content: 'Selamat datang di Alun-Alun Tugu! Kunjungi Monumen, berinteraksi, dan saling mengobrol bersama seluruh warga Netizen City!',
        created_at: new Date().toISOString(),
      },
    ],
    announcements: [
      {
        id: 'ann-01',
        title: 'Peresmian Kota Virtual NETIZENCITY',
        content: 'Balai Kota resmi membuka pendaftaran warga baru dengan penerbitan Kartu Tanda Netizen (KTN) digital.',
        category: 'government',
        author: 'Kantor Walikota',
        created_at: new Date().toISOString(),
      },
    ],
  }
}

let lastDbMtime = 0

export function readLocalDB(): LocalDBSchema {
  // 1. Try reading from TMP_DB_PATH if it has been updated on disk
  try {
    if (fs.existsSync(TMP_DB_PATH)) {
      const stat = fs.statSync(TMP_DB_PATH)
      if (!globalThis.__netizen_local_db || stat.mtimeMs > lastDbMtime) {
        const data = fs.readFileSync(TMP_DB_PATH, 'utf-8')
        const parsed = JSON.parse(data)
        globalThis.__netizen_local_db = parsed
        lastDbMtime = stat.mtimeMs
        return parsed
      }
    }
  } catch {
    // ignore
  }

  if (globalThis.__netizen_local_db) {
    return globalThis.__netizen_local_db
  }

  // 2. Try reading from project DB_PATH
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8')
      const parsed = JSON.parse(data)
      globalThis.__netizen_local_db = parsed
      return parsed
    }
  } catch {
    // ignore
  }

  const initial = getInitialSeedData()
  globalThis.__netizen_local_db = initial
  writeLocalDB(initial)
  return initial
}

export function writeLocalDB(data: LocalDBSchema): void {
  // Merge concurrent chat_messages from disk if available to avoid race-condition overwriting across lambdas
  try {
    if (fs.existsSync(TMP_DB_PATH)) {
      const diskRaw = fs.readFileSync(TMP_DB_PATH, 'utf-8')
      const diskData = JSON.parse(diskRaw)
      if (diskData.chat_messages && Array.isArray(diskData.chat_messages)) {
        const mergedMap = new Map<string, any>()
        for (const m of diskData.chat_messages) {
          mergedMap.set(m.id, m)
        }
        for (const m of (data.chat_messages || [])) {
          mergedMap.set(m.id, m)
        }
        data.chat_messages = pruneExpiredChatMessages(Array.from(mergedMap.values())).sort(
          (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
      }
    }
  } catch {
    // ignore
  }

  globalThis.__netizen_local_db = data

  // 1. Try writing to TMP_DB_PATH (always works on Vercel & OS temp)
  try {
    const tmpDir = path.dirname(TMP_DB_PATH)
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true })
    }
    fs.writeFileSync(TMP_DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
    try {
      lastDbMtime = fs.statSync(TMP_DB_PATH).mtimeMs
    } catch {}
  } catch {
    // ignore
  }

  // 2. Try writing to DB_PATH (works in local development)
  try {
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch {
    // ignore EROFS on Vercel
  }
}

// ============================================================
// DATABASE OPERATIONS
// ============================================================

export function getActiveCitizen(citizenId?: string) {
  if (!citizenId) return null
  const db = readLocalDB()
  const found = db.citizens.find((c) => c.id === citizenId)
  return found || null
}

export function getCitizenWallet(citizenId: string) {
  const db = readLocalDB()
  return db.wallets.find((w) => w.citizen_id === citizenId) || null
}

export function updateWalletBalance(
  citizenId: string,
  amount: number,
  type: 'earn' | 'spend' | 'reward',
  description: string
) {
  const db = readLocalDB()
  const wallet = db.wallets.find((w) => w.citizen_id === citizenId)
  if (!wallet) return null

  const prev = wallet.balance
  let next = prev
  if (type === 'earn' || type === 'reward') {
    next = prev + amount
    wallet.total_earned += amount
  } else {
    if (prev < amount) return null
    next = prev - amount
    wallet.total_spent += amount
  }

  wallet.balance = next
  wallet.updated_at = new Date().toISOString()

  db.transactions.unshift({
    id: 'tx-' + Math.random().toString(36).substring(2, 9),
    citizen_id: citizenId,
    type,
    amount,
    previous_balance: prev,
    new_balance: next,
    description,
    reference_type: null,
    reference_id: null,
    created_at: new Date().toISOString(),
  })

  writeLocalDB(db)
  return wallet
}

export function buyShopItem(citizenId: string, itemId: string) {
  const db = readLocalDB()
  const item = db.items.find((i) => i.id === itemId)
  if (!item) return { success: false, error: 'Item tidak ditemukan' }

  const owned = db.inventory.some(
    (inv) => inv.citizen_id === citizenId && inv.item_id === itemId
  )
  if (owned) return { success: false, error: 'Item sudah dimiliki' }

  const wallet = db.wallets.find((w) => w.citizen_id === citizenId)
  if (!wallet || wallet.balance < item.price) {
    return { success: false, error: 'Saldo koin tidak mencukupi' }
  }

  wallet.balance -= item.price
  wallet.total_spent += item.price
  wallet.updated_at = new Date().toISOString()

  db.transactions.unshift({
    id: 'tx-' + Math.random().toString(36).substring(2, 9),
    citizen_id: citizenId,
    type: 'spend',
    amount: item.price,
    previous_balance: wallet.balance + item.price,
    new_balance: wallet.balance,
    description: `Membeli item: ${item.name}`,
    reference_type: 'item',
    reference_id: itemId,
    created_at: new Date().toISOString(),
  })

  db.inventory.push({
    id: 'inv-' + Math.random().toString(36).substring(2, 9),
    citizen_id: citizenId,
    item_id: itemId,
    is_equipped: false,
    acquired_at: new Date().toISOString(),
  })

  writeLocalDB(db)
  return { success: true, item, newBalance: wallet.balance }
}

export function castVote(citizenId: string, voteId: string, optionId: number) {
  const db = readLocalDB()
  const vote = db.votes.find((v) => v.id === voteId)
  if (!vote) return { success: false, error: 'Polling tidak ditemukan' }

  const alreadyVoted = db.vote_submissions.some(
    (vs) => vs.vote_id === voteId && vs.citizen_id === citizenId
  )
  if (alreadyVoted) return { success: false, error: 'Kamu sudah memberikan suara' }

  const opt = vote.options.find((o) => o.id === optionId)
  if (!opt) return { success: false, error: 'Opsi pilihan tidak valid' }

  opt.votes += 1

  db.vote_submissions.push({
    id: 'vs-' + Math.random().toString(36).substring(2, 9),
    vote_id: voteId,
    citizen_id: citizenId,
    selected_option: optionId,
    submitted_at: new Date().toISOString(),
  })

  // Award 25 coins for civic participation
  const wallet = db.wallets.find((w) => w.citizen_id === citizenId)
  if (wallet) {
    wallet.balance += 25
    wallet.total_earned += 25
    wallet.updated_at = new Date().toISOString()
    db.transactions.unshift({
      id: 'tx-' + Math.random().toString(36).substring(2, 9),
      citizen_id: citizenId,
      type: 'reward',
      amount: 25,
      previous_balance: wallet.balance - 25,
      new_balance: wallet.balance,
      description: 'Bonus partisipasi polling Balai Kota',
      reference_type: 'vote',
      reference_id: voteId,
      created_at: new Date().toISOString(),
    })
  }

  writeLocalDB(db)
  return { success: true, options: vote.options }
}

export function claimDailyStreakReward(citizenId: string) {
  const db = readLocalDB()
  const today = new Date().toISOString().split('T')[0]

  const alreadyClaimed = db.daily_login_rewards.some(
    (r) => r.citizen_id === citizenId && r.claimed_date === today
  )
  if (alreadyClaimed) {
    return { success: false, error: 'Hadiah hari ini sudah diklaim!' }
  }

  const lastClaim = db.daily_login_rewards
    .filter((r) => r.citizen_id === citizenId)
    .sort((a, b) => b.claimed_date.localeCompare(a.claimed_date))[0]

  let streak = 1
  if (lastClaim) {
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
    if (lastClaim.claimed_date === yesterday) {
      streak = (lastClaim.streak_count % 7) + 1
    }
  }

  const coinRewards = [50, 75, 100, 125, 150, 200, 500]
  const rewardCoins = coinRewards[streak - 1] || 50

  db.daily_login_rewards.push({
    id: 'dlr-' + Math.random().toString(36).substring(2, 9),
    citizen_id: citizenId,
    day_number: streak,
    reward_coins: rewardCoins,
    streak_count: streak,
    claimed_date: today,
    claimed_at: new Date().toISOString(),
  })

  const wallet = db.wallets.find((w) => w.citizen_id === citizenId)
  if (wallet) {
    wallet.balance += rewardCoins
    wallet.total_earned += rewardCoins
    wallet.updated_at = new Date().toISOString()
    db.transactions.unshift({
      id: 'tx-' + Math.random().toString(36).substring(2, 9),
      citizen_id: citizenId,
      type: 'reward',
      amount: rewardCoins,
      previous_balance: wallet.balance - rewardCoins,
      new_balance: wallet.balance,
      description: `Hadiah Login Harian Hari ke-${streak}`,
      reference_type: 'daily_reward',
      reference_id: null,
      created_at: new Date().toISOString(),
    })
  }

  writeLocalDB(db)

  return { success: true, dayNumber: streak, rewardCoins, streak }
}

export const CHAT_RETENTION_MS = 30 * 60 * 1000 // 30 minutes retention per individual message

/**
 * Prunes ONLY individual chat messages that have exceeded 30 minutes since creation.
 * Individual messages younger than 30 minutes are strictly preserved.
 */
export function pruneExpiredChatMessages(messages: Array<any>): Array<any> {
  if (!Array.isArray(messages)) return []
  const now = Date.now()
  const cutoff = now - CHAT_RETENTION_MS
  return messages.filter((m) => {
    if (!m || !m.created_at) return false
    const time = new Date(m.created_at).getTime()
    return !isNaN(time) && time >= cutoff
  })
}

export function getChatMessages() {
  const db = readLocalDB()
  const currentMessages = db.chat_messages || []
  const valid = pruneExpiredChatMessages(currentMessages)
  if (valid.length !== currentMessages.length) {
    db.chat_messages = valid
    writeLocalDB(db)
  }
  return valid
}

export function addChatMessage(citizenId: string, senderName: string, content: string) {
  const db = readLocalDB()
  if (!db.chat_messages) {
    db.chat_messages = []
  }

  // Prune only individual messages older than 30 minutes
  db.chat_messages = pruneExpiredChatMessages(db.chat_messages)

  // Prevent immediate duplicate message within 2.5 seconds
  const now = Date.now()
  const isDuplicate = db.chat_messages.some(
    (m) =>
      m.content === content &&
      (m.sender_name === senderName || m.citizen_id === citizenId) &&
      now - new Date(m.created_at).getTime() < 2500
  )
  if (isDuplicate) {
    return db.chat_messages[db.chat_messages.length - 1]
  }

  const msg = {
    id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    citizen_id: citizenId,
    sender_name: senderName,
    channel: 'global',
    content,
    created_at: new Date().toISOString(),
  }

  db.chat_messages.push(msg)
  if (db.chat_messages.length > 250) {
    db.chat_messages.shift()
  }

  writeLocalDB(db)
  return msg
}

export function registerLocalCitizen(
  email: string,
  passwordHash: string,
  username: string,
  displayName: string
) {
  const db = readLocalDB()
  const cleanHandle = (username || email).trim().toLowerCase().replace(/^@/, '')
  const emailVal = email.includes('@') && !email.startsWith('@')
    ? email
    : `${cleanHandle}@instagram.netizencity.id`

  const existing = db.citizens.find(
    (c) =>
      c.username.toLowerCase() === cleanHandle ||
      (c as any).instagram_handle?.toLowerCase() === cleanHandle ||
      c.email.toLowerCase() === emailVal.toLowerCase()
  )
  if (existing) {
    return { success: false, error: `Akun Instagram @${cleanHandle} sudah terdaftar sebagai warga!` }
  }

  const citizenId = 'c-' + Math.random().toString(36).substring(2, 9)
  const userId = 'u-' + Math.random().toString(36).substring(2, 9)
  const ktn = generateKTNNumber()

  // Assign available housing
  const housing = db.housing_units.find((h) => h.status === 'available') || db.housing_units[0]
  if (housing) housing.status = 'occupied'

  const newCitizen = {
    id: citizenId,
    user_id: userId,
    email: emailVal,
    instagram_handle: cleanHandle,
    is_ig_verified: true,
    password_hash: passwordHash,
    username: cleanHandle,
    display_name: displayName || cleanHandle,
    ktn_number: ktn,
    avatar_config: {
      skinTone: '#f5d0b0',
      hairStyle: 'short',
      hairColor: '#1e293b',
      shirtColor: '#2563eb',
      pantsColor: '#1e293b',
      shoesColor: '#f1f5f9',
      expression: 'happy',
    },
    level: 1,
    xp: 0,
    job: 'Warga Baru',
    housing_id: housing ? housing.id : null,
    housing_name: housing ? `${housing.name} - ${housing.unit_number}` : 'Rusunawa Harapan Baru',
    district: housing ? housing.district : 'Perumahan Utara',
    biography: `Warga resmi NETIZENCITY terverifikasi dari Instagram @${cleanHandle}.`,
    is_online: true,
    role: 'citizen' as const,
    onboarding_completed: true,
    joined_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  db.citizens.push(newCitizen)

  // Auto-create wallet with +600 bonus (500 kota + 100 Instagram bonus)
  db.wallets.push({
    id: 'w-' + citizenId,
    citizen_id: citizenId,
    balance: 600,
    total_earned: 600,
    total_spent: 0,
    updated_at: new Date().toISOString(),
  })

  db.transactions.push({
    id: 'tx-' + Math.random().toString(36).substring(2, 9),
    citizen_id: citizenId,
    type: 'reward',
    amount: 600,
    previous_balance: 0,
    new_balance: 600,
    description: 'Bonus Selamat Datang Balai Kota & Verifikasi Follow Instagram',
    reference_type: 'onboarding',
    reference_id: null,
    created_at: new Date().toISOString(),
  })

  writeLocalDB(db)
  return { success: true, citizen: newCitizen }
}

export function loginLocalCitizen(identifier: string, passwordHash: string) {
  const db = readLocalDB()
  const clean = identifier.trim().toLowerCase().replace(/^@/, '')
  const citizen = db.citizens.find(
    (c) =>
      (c.username.toLowerCase() === clean ||
        (c as any).instagram_handle?.toLowerCase() === clean ||
        c.email.toLowerCase() === clean ||
        c.email.toLowerCase() === `${clean}@instagram.netizencity.id` ||
        c.ktn_number === identifier.trim()) &&
      c.password_hash === passwordHash
  )
  if (!citizen) {
    return { success: false, error: 'Username Instagram atau kata sandi tidak cocok' }
  }
  citizen.is_online = true
  writeLocalDB(db)
  return { success: true, citizen }
}
