// ============================================================
// NETIZENCITY - Comprehensive Persistent Local Database
// Saves all 17 schema entities to data/local_db.json
// ============================================================

import fs from 'fs'
import path from 'path'
import { generateKTNNumber } from '@/lib/utils/ktn'

const DB_PATH = path.join(process.cwd(), 'data', 'local_db.json')

export interface LocalDBSchema {
  citizens: Array<{
    id: string
    user_id: string
    email: string
    password_hash: string
    username: string
    display_name: string
    ktn_number: string
    avatar_config: {
      skinTone: string
      hairStyle: string
      hairColor: string
      shirtColor: string
      pantsColor: string
      shoesColor: string
      expression: string
    }
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
    category: 'tops' | 'bottoms' | 'shoes' | 'hairstyles' | 'accessories'
    price: number
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
    color: string
    sprite_key: string
    is_available: boolean
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
      { id: 'top_basic_blue', name: 'Kaos Biru Komunitas', description: 'Kaos kasual resmi Netizen City', category: 'tops', price: 0, rarity: 'common', color: '#2563eb', sprite_key: 'top_blue', is_available: true },
      { id: 'top_hoodie_red', name: 'Hoodie Merah Netizen', description: 'Hoodie hangat berbahan tebal', category: 'tops', price: 150, rarity: 'uncommon', color: '#dc2626', sprite_key: 'top_red', is_available: true },
      { id: 'top_jacket_leather', name: 'Jaket Kulit Downtown', description: 'Jaket kulit stylish khas pusat kota', category: 'tops', price: 450, rarity: 'rare', color: '#334155', sprite_key: 'top_black', is_available: true },
      { id: 'top_batik_gold', name: 'Kemeja Batik Emas', description: 'Batik modern untuk acara formal balai kota', category: 'tops', price: 900, rarity: 'epic', color: '#f59e0b', sprite_key: 'top_gold', is_available: true },
      { id: 'bottom_denim_sky', name: 'Jeans Denim Vintage', description: 'Celana denim tahan lama', category: 'bottoms', price: 120, rarity: 'common', color: '#0284c7', sprite_key: 'bottom_blue', is_available: true },
      { id: 'bottom_cargo_black', name: 'Celana Kargo Taktis', description: 'Banyak kantong untuk kurir pengiriman', category: 'bottoms', price: 200, rarity: 'uncommon', color: '#0f172a', sprite_key: 'bottom_dark', is_available: true },
      { id: 'shoes_sneakers_gold', name: 'Sneakers Emas Edisi Terbatas', description: 'Sepatu emas berkilau hadiah komunitas', category: 'shoes', price: 800, rarity: 'epic', color: '#f59e0b', sprite_key: 'shoes_gold', is_available: true },
      { id: 'shoes_sneakers_white', name: 'Sneakers Putih Kasual', description: 'Sneakers ringan nyaman untuk jalan santai', category: 'shoes', price: 80, rarity: 'common', color: '#f1f5f9', sprite_key: 'shoes_white', is_available: true },
      { id: 'hair_punk_cyan', name: 'Gaya Rambut Cyberpunk', description: 'Potongan rambut gaya masa depan', category: 'hairstyles', price: 350, rarity: 'rare', color: '#06b6d4', sprite_key: 'hair_cyan', is_available: true },
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
        sender_name: 'Pemerintah Kota',
        channel: 'global',
        content: 'Selamat datang di NETIZENCITY! Kota virtual komunitas Instagram @netizencity.id',
        created_at: new Date().toISOString(),
      },
      {
        id: 'msg-02',
        citizen_id: 'c-admin',
        sender_name: 'Admin Kota',
        channel: 'global',
        content: 'Ambil pekerjaan kurir di kawasan pabrik selatan untuk menghasilkan koin cepat!',
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

export function readLocalDB(): LocalDBSchema {
  try {
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf-8')
      return JSON.parse(data)
    }
  } catch {
    // ignore
  }

  const initial = getInitialSeedData()
  writeLocalDB(initial)
  return initial
}

export function writeLocalDB(data: LocalDBSchema): void {
  try {
    const dir = path.dirname(DB_PATH)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Failed to write local database:', err)
  }
}

// ============================================================
// DATABASE OPERATIONS
// ============================================================

export function getActiveCitizen(citizenId?: string) {
  const db = readLocalDB()
  if (citizenId) {
    const found = db.citizens.find((c) => c.id === citizenId)
    if (found) return found
  }
  // Return most recently registered or default citizen
  return db.citizens[db.citizens.length - 1] || db.citizens[0] || null
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

export function addChatMessage(citizenId: string, senderName: string, content: string) {
  const db = readLocalDB()
  const msg = {
    id: 'msg-' + Math.random().toString(36).substring(2, 9),
    citizen_id: citizenId,
    sender_name: senderName,
    channel: 'global',
    content,
    created_at: new Date().toISOString(),
  }
  db.chat_messages.push(msg)
  if (db.chat_messages.length > 100) {
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
  const existing = db.citizens.find(
    (c) => c.username.toLowerCase() === username.toLowerCase() || c.email === email
  )
  if (existing) {
    return { success: false, error: 'Username atau email sudah digunakan' }
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
    email,
    password_hash: passwordHash,
    username: username.toLowerCase(),
    display_name: displayName,
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
    biography: 'Warga resmi baru NETIZENCITY.',
    is_online: true,
    role: 'citizen' as const,
    onboarding_completed: true,
    joined_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  db.citizens.push(newCitizen)

  // Auto-create wallet with +500 welcome bonus
  db.wallets.push({
    id: 'w-' + citizenId,
    citizen_id: citizenId,
    balance: 500,
    total_earned: 500,
    total_spent: 0,
    updated_at: new Date().toISOString(),
  })

  db.transactions.push({
    id: 'tx-' + Math.random().toString(36).substring(2, 9),
    citizen_id: citizenId,
    type: 'reward',
    amount: 500,
    previous_balance: 0,
    new_balance: 500,
    description: 'Bonus Selamat Datang Balai Kota',
    reference_type: 'onboarding',
    reference_id: null,
    created_at: new Date().toISOString(),
  })

  writeLocalDB(db)
  return { success: true, citizen: newCitizen }
}

export function loginLocalCitizen(email: string, passwordHash: string) {
  const db = readLocalDB()
  const citizen = db.citizens.find(
    (c) => c.email === email && c.password_hash === passwordHash
  )
  if (!citizen) {
    return { success: false, error: 'Email atau kata sandi tidak cocok' }
  }
  citizen.is_online = true
  writeLocalDB(db)
  return { success: true, citizen }
}
