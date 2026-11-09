// ============================================================
// NETIZENCITY 3D - Comprehensive Day 1-9 Living City Engine
// ============================================================

import * as THREE from 'three';
import { buildWorld, PAL, signTex, makeMayor, makeGate, makeOffice } from './world.js';
import { buildCity, makeCrowd } from './city.js';
import { buildMetro, RAIL_Z, HOSP, POLICE, FIRE, STATION, KERUK, makeMonument, makeMonumentPark } from './metro.js';
import { makeMountain, makeRiver, makeBeach, makeMistBelt } from './nature.js';
import { MT, SHORE } from './land.js';
import { makeForest, makeFireflies } from './forest.js';
import { makeMall, MALL } from './mall.js';
import { makeLibrary, makeAirport, makePort, makeSports, makePrasasti, makePlane, LIB, AIR, SPORT, seatAt } from './day7.js';
import { makeLab, LAB } from './day8.js';
import { makeTower, TOWER } from './menara.js';
import { makeCat, makePet, makeZoo, makeVet, makeUni, ZOO, VET, UNI } from './day9.js';
import { makeCitizen3D, createPakMayorNPC, Citizen3DInstance, CitizenAvatarColors, PakMayorNPCInstance } from './citizen3d';
import { resolveAvatarColors } from '@/game/utils/characterRenderer';
import { useGameStore } from '@/lib/stores/useGameStore';
import { useUIStore } from '@/lib/stores/useUIStore';
import { useCitizenStore } from '@/lib/stores/useCitizenStore';
import { FISHING_RODS, getFishingRodById, type FishingRodDefinition } from '@/lib/inventory/rodDefinitions';

export type TimeOfDay = 'morning' | 'noon' | 'sunset' | 'night';
export type CameraMode = 'orbit' | 'follow' | 'cinematic';
export type FishingState = 'idle' | 'casting' | 'waiting' | 'bite' | 'reeling' | 'caught' | 'escaped';

export type FishRarityTier =
  | 'common'
  | 'uncommon'
  | 'rare'
  | 'epic'
  | 'legendary'
  | 'mythic'
  | 'immortal';

export interface RiverFishCatch {
  id: string;
  name: string;
  rarity: string;
  tier: FishRarityTier;
  rarityColor: string;
  weight: number;
  rewardCoins: number;
  icon: string;
  desc: string;
  caughtLocation?: string;
}

export const RIVER_FISH_SPECIES: RiverFishCatch[] = [
  // 1. COMMON (Biasa - Hijau Emerald)
  {
    id: 'fish_mujair_kali',
    name: 'Mujair Kali Netizen',
    rarity: 'Common',
    tier: 'common',
    rarityColor: '#22C55E',
    weight: 0.85,
    rewardCoins: 50,
    icon: '🐟',
    desc: 'Ikan air tawar lincah yang mudah ditemukan warga di sepanjang tepian sungai.',
  },
  {
    id: 'fish_nila_tropis',
    name: 'Ikan Nila Tropis',
    rarity: 'Common',
    tier: 'common',
    rarityColor: '#22C55E',
    weight: 1.25,
    rewardCoins: 55,
    icon: '🐟',
    desc: 'Ikan nila air tawar sehat dan lincah, santapan favorit warga NetizenCity.',
  },
  {
    id: 'fish_mas_koki',
    name: 'Ikan Mas Koki Alun-Alun',
    rarity: 'Common',
    tier: 'common',
    rarityColor: '#22C55E',
    weight: 1.1,
    rewardCoins: 65,
    icon: '🐠',
    desc: 'Ikan mas berenang anggun yang sering terlihat di sekitar dermaga kayu.',
  },
  {
    id: 'fish_tawes_perak',
    name: 'Ikan Tawes Sungai Perak',
    rarity: 'Common',
    tier: 'common',
    rarityColor: '#22C55E',
    weight: 0.95,
    rewardCoins: 45,
    icon: '🐟',
    desc: 'Ikan perak lincah penghuni arus tenang Sungai Kali Netizen.',
  },

  // 2. UNCOMMON (Menengah - Biru Langit / Sky Blue)
  {
    id: 'fish_patin_deras',
    name: 'Ikan Patin Sungai Deras',
    rarity: 'Uncommon',
    tier: 'uncommon',
    rarityColor: '#0EA5E9',
    weight: 2.8,
    rewardCoins: 110,
    icon: '🐡',
    desc: 'Ikan bertenaga besar yang gemar melawan arus air jernih bebatuan.',
  },
  {
    id: 'fish_gurame_kali',
    name: 'Ikan Gurame Kali Indah',
    rarity: 'Uncommon',
    tier: 'uncommon',
    rarityColor: '#0EA5E9',
    weight: 3.2,
    rewardCoins: 135,
    icon: '🐟',
    desc: 'Gurame sisik tebal dengan daging bernilai jual tinggi di pasar kota.',
  },
  {
    id: 'fish_baung_muara',
    name: 'Ikan Baung Muara Kali',
    rarity: 'Uncommon',
    tier: 'uncommon',
    rarityColor: '#0EA5E9',
    weight: 2.1,
    rewardCoins: 100,
    icon: '🐟',
    desc: 'Ikan pemalu berkumis panjang yang menyukai ceruk bebatuan kali.',
  },

  // 3. RARE (Langka - Royal Blue)
  {
    id: 'fish_lele_sultan',
    name: 'Ikan Lele Sultan',
    rarity: 'Rare',
    tier: 'rare',
    rarityColor: '#3B82F6',
    weight: 5.2,
    rewardCoins: 260,
    icon: '🐟',
    desc: 'Lele berkumis panjang dengan bobot gemuk penghuni palung terdalam kali.',
  },
  {
    id: 'fish_gabus_emas',
    name: 'Ikan Gabus Emas Rawa Kali',
    rarity: 'Rare',
    tier: 'rare',
    rarityColor: '#3B82F6',
    weight: 4.6,
    rewardCoins: 290,
    icon: '🐠',
    desc: 'Predator air tawar bersisik kuning keemasan yang sangat lincah menyambar mangsa.',
  },
  {
    id: 'fish_bilis_perak',
    name: 'Ikan Bilis Cahaya Perak',
    rarity: 'Rare',
    tier: 'rare',
    rarityColor: '#3B82F6',
    weight: 3.8,
    rewardCoins: 230,
    icon: '✨',
    desc: 'Ikan perak berkilau yang memantulkan sinar matahari senja di atas permukaan air.',
  },

  // 4. EPIC (Sangat Langka - Ungu / Violet)
  {
    id: 'fish_sidat_raksasa',
    name: 'Sidat Raksasa Gua Bawah Air',
    rarity: 'Epic',
    tier: 'epic',
    rarityColor: '#A855F7',
    weight: 9.8,
    rewardCoins: 650,
    icon: '🐍',
    desc: 'Sidat raksasa bertubuh panjang licin penjelajah gua bawah air Sungai Kali Netizen.',
  },
  {
    id: 'fish_belida_mahakam',
    name: 'Ikan Belida Purba Mahakam',
    rarity: 'Epic',
    tier: 'epic',
    rarityColor: '#A855F7',
    weight: 8.5,
    rewardCoins: 580,
    icon: '🐟',
    desc: 'Ikan eksotis berpunggung bungkuk dengan motif totol langka yang dilindungi.',
  },
  {
    id: 'fish_monster_catfish',
    name: 'Monster Catfish Palung Hitam',
    rarity: 'Epic',
    tier: 'epic',
    rarityColor: '#A855F7',
    weight: 14.5,
    rewardCoins: 750,
    icon: '🦈',
    desc: 'Monster lele air tawar raksasa berkekuatan dahsyat yang menggetarkan dermaga!',
  },

  // 5. LEGENDARY (Legendaris - Emas / Amber)
  {
    id: 'fish_arwana_emas',
    name: 'Arwana Emas Super Red Harapan',
    rarity: 'Legendary',
    tier: 'legendary',
    rarityColor: '#F59E0B',
    weight: 21.0,
    rewardCoins: 1600,
    icon: '👑',
    desc: 'Ikan pusaka bernilai fantastis dengan sisik merah-emas berpendar megah!',
  },
  {
    id: 'fish_raja_patin_albino',
    name: 'Raja Patin Albino Keramat',
    rarity: 'Legendary',
    tier: 'legendary',
    rarityColor: '#F59E0B',
    weight: 24.5,
    rewardCoins: 1850,
    icon: '✨',
    desc: 'Raja patin berbadan putih mutiara suci pembawa keberuntungan bagi pemancingnya.',
  },

  // 6. MYTHIC (Mitos - Ruby Crimson)
  {
    id: 'fish_naga_sungai_merah',
    name: 'Naga Sungai Merah Kali Netizen',
    rarity: 'Mythic',
    tier: 'mythic',
    rarityColor: '#EF4444',
    weight: 48.0,
    rewardCoins: 3800,
    icon: '🐉',
    desc: 'Makhluk mitos bersisik api penunggu mata air misterius hulu kali NetizenCity!',
  },
  {
    id: 'fish_leviathan_kali',
    name: 'Leviathan Mini Air Tawar',
    rarity: 'Mythic',
    tier: 'mythic',
    rarityColor: '#EF4444',
    weight: 55.0,
    rewardCoins: 4500,
    icon: '🌊',
    desc: 'Monster kuno mitologi berkulit zirah baja pencipta ombak pusaran air misterius.',
  },

  // 7. IMMORTAL (Abadi - Glowing Rainbow / Diamond Fuchsia)
  {
    id: 'fish_penguasa_air_abadi',
    name: 'Sang Penguasa Air Abadi (The Immortal Sovereign)',
    rarity: 'Immortal',
    tier: 'immortal',
    rarityColor: '#EC4899',
    weight: 95.0,
    rewardCoins: 9999,
    icon: '🔱',
    desc: 'Entitas suci dewa air abadi penjaga berkah kehidupan seluruh Sungai NetizenCity!',
  },
  {
    id: 'fish_naga_kristal_abadi',
    name: 'Naga Kristal Abadi Mahkota Air',
    rarity: 'Immortal',
    tier: 'immortal',
    rarityColor: '#EC4899',
    weight: 110.0,
    rewardCoins: 12500,
    icon: '💎',
    desc: 'Naga kristal berlian abadi yang tak lekang oleh waktu, tangkapan paling agung di jagat raya!',
  },
];

export const BEACH_FISH_SPECIES: RiverFishCatch[] = [
  // 1. COMMON (Biasa - Hijau Emerald)
  {
    id: 'fish_kembung_pantai',
    name: 'Ikan Kembung Pantai',
    rarity: 'Common',
    tier: 'common',
    rarityColor: '#22C55E',
    weight: 0.65,
    rewardCoins: 50,
    icon: '🐟',
    desc: 'Ikan laut lincah bergerombol yang sering berenang di dekat ombak pantai.',
  },
  {
    id: 'fish_tongkol_tropis',
    name: 'Ikan Tongkol Tropis',
    rarity: 'Common',
    tier: 'common',
    rarityColor: '#22C55E',
    weight: 1.4,
    rewardCoins: 60,
    icon: '🐟',
    desc: 'Ikan perenang cepat favorit nelayan pesisir Netizen Beach.',
  },
  {
    id: 'fish_buntal_mini',
    name: 'Ikan Buntal Mini Pasir',
    rarity: 'Common',
    tier: 'common',
    rarityColor: '#22C55E',
    weight: 0.8,
    rewardCoins: 55,
    icon: '🐡',
    desc: 'Ikan buntal bulat menggemaskan yang suka bersembunyi di pasir dangkal.',
  },
  {
    id: 'fish_kerang_mutiara',
    name: 'Kerang Mutiara Pesisir',
    rarity: 'Common',
    tier: 'common',
    rarityColor: '#22C55E',
    weight: 0.5,
    rewardCoins: 70,
    icon: '🦪',
    desc: 'Kerang laut berkilau yang tersangkut di kail pancing pemancing pantai.',
  },

  // 2. UNCOMMON (Menengah - Biru Langit / Sky Blue)
  {
    id: 'fish_kakap_merah',
    name: 'Ikan Kakap Merah Karang',
    rarity: 'Uncommon',
    tier: 'uncommon',
    rarityColor: '#0EA5E9',
    weight: 3.2,
    rewardCoins: 120,
    icon: '🐠',
    desc: 'Ikan kakap berwarna merah menyala dengan tarikan pancing yang bertenaga.',
  },
  {
    id: 'fish_cumi_teluk',
    name: 'Cumi-Cumi Teluk Netizen',
    rarity: 'Uncommon',
    tier: 'uncommon',
    rarityColor: '#0EA5E9',
    weight: 1.8,
    rewardCoins: 135,
    icon: '🦑',
    desc: 'Cumi-cumi bertentakel lincah yang menyemprotkan tinta saat ditarik ke darat.',
  },
  {
    id: 'fish_kepiting_bakau',
    name: 'Kepiting Bakau Biru',
    rarity: 'Uncommon',
    tier: 'uncommon',
    rarityColor: '#0EA5E9',
    weight: 2.1,
    rewardCoins: 140,
    icon: '🦀',
    desc: 'Kepiting bercapit kokoh dengan corak biru tropis yang eksotis.',
  },
  {
    id: 'fish_pari_pasir',
    name: 'Ikan Pari Pasir Tropis',
    rarity: 'Uncommon',
    tier: 'uncommon',
    rarityColor: '#0EA5E9',
    weight: 4.5,
    rewardCoins: 155,
    icon: '🦈',
    desc: 'Ikan pari pipih yang meluncur anggun di dasar perairan pantai.',
  },

  // 3. RARE (Langka - Ungu Kristal)
  {
    id: 'fish_tuna_sirip_kuning',
    name: 'Tuna Sirip Kuning Samudra',
    rarity: 'Rare',
    tier: 'rare',
    rarityColor: '#A855F7',
    weight: 8.6,
    rewardCoins: 280,
    icon: '🐟',
    desc: 'Tuna gagah dengan sirip kuning keemasan, incaran utama para pemancing samudra.',
  },
  {
    id: 'fish_kerapu_macan',
    name: 'Ikan Kerapu Macan Karang',
    rarity: 'Rare',
    tier: 'rare',
    rarityColor: '#A855F7',
    weight: 6.2,
    rewardCoins: 260,
    icon: '🐠',
    desc: 'Kerapu bercorak loreng macan penguasa celah terumbu karang laut dalam.',
  },
  {
    id: 'fish_lobster_samudra',
    name: 'Lobster Samudra Raja',
    rarity: 'Rare',
    tier: 'rare',
    rarityColor: '#A855F7',
    weight: 3.8,
    rewardCoins: 310,
    icon: '🦞',
    desc: 'Lobster berduri merah menyala bernilai tinggi di pasar kuliner kota.',
  },

  // 4. EPIC (Epik - Emas Oranye / Amber)
  {
    id: 'fish_layaran_samudra',
    name: 'Ikan Layaran Samudra (Sailfish)',
    rarity: 'Epic',
    tier: 'epic',
    rarityColor: '#F59E0B',
    weight: 16.5,
    rewardCoins: 650,
    icon: '🐬',
    desc: 'Ikan tercepat di samudra dengan sirip punggung megah menyerupai layar kapal.',
  },
  {
    id: 'fish_hiu_karang',
    name: 'Hiu Karang Sirip Hitam',
    rarity: 'Epic',
    tier: 'epic',
    rarityColor: '#F59E0B',
    weight: 14.2,
    rewardCoins: 720,
    icon: '🦈',
    desc: 'Predator anggun terumbu karang yang melompat dramatis saat menyambar kail.',
  },

  // 5. LEGENDARY (Legendaris - Merah Delima / Crimson)
  {
    id: 'fish_marlin_biru',
    name: 'Marlin Biru Samudra (Blue Marlin)',
    rarity: 'Legendary',
    tier: 'legendary',
    rarityColor: '#EF4444',
    weight: 28.0,
    rewardCoins: 1600,
    icon: '⚔️',
    desc: 'Raja samudra bertanduk pedang legendaris yang hanya sanggup ditaklukkan pemancing sejati.',
  },
  {
    id: 'fish_todak_raja',
    name: 'Ikan Todak Raja Laut Dalam',
    rarity: 'Legendary',
    tier: 'legendary',
    rarityColor: '#EF4444',
    weight: 24.5,
    rewardCoins: 1450,
    icon: '🗡️',
    desc: 'Todak perak bercahaya yang muncul dari palung samudra terdalam.',
  },

  // 6. MYTHIC (Mitos - Merah Neon Mawar)
  {
    id: 'fish_barramundi_emas',
    name: 'Barramundi Emas Ratu Pantai',
    rarity: 'Mythic',
    tier: 'mythic',
    rarityColor: '#FB7185',
    weight: 38.0,
    rewardCoins: 3500,
    icon: '👑',
    desc: 'Ikan mitos bersisik emas murni yang konon membawa keberuntungan abadi bagi yang berhasil menangkapnya.',
  },

  // 7. IMMORTAL (Abadi - Pelangi Kosmik / Prismatic)
  {
    id: 'fish_naga_laut_netizen',
    name: 'Naga Laut Samudra Netizen (Leviathan)',
    rarity: 'Immortal',
    tier: 'immortal',
    rarityColor: '#38BDF8',
    weight: 65.0,
    rewardCoins: 8888,
    icon: '🐉',
    desc: 'Mahakarya samudra legendaris penjaga perairan Netizen City! Bersinar dengan aura mistis pelangi abadi.',
  },
];

export interface LandmarkLocation {
  id: string;
  name: string;
  district: string;
  type: string;
  position: THREE.Vector3;
  cameraTarget: THREE.Vector3;
  cameraPos: THREE.Vector3;
  radius: number;
}

export interface City3DOptions {
  onCameraModeChange?: (mode: CameraMode) => void;
}

interface WalkingCitizen {
  instance: Citizen3DInstance;
  pA: THREE.Vector3;
  pB: THREE.Vector3;
  state: 'walk_to_B' | 'idle_at_B' | 'walk_to_A' | 'idle_at_A';
  timer: number;
  speed: number;
  facing: number;
  isStationary?: boolean;
}

interface BuildingCollider {
  x: number;
  z: number;
  radius: number;
}

interface CityLandmarkNPCSpec {
  id: string;
  name: string;
  role: string;
  location: 'alun_alun' | 'rumah_ibadah' | 'universitas' | 'bandara' | 'pantai';
  colors: CitizenAvatarColors;
  activity: 'walk_patrol' | 'idle_look' | 'sit' | 'wave_greet' | 'photo';
  basePos: [number, number, number];
  targetPos?: [number, number, number];
  facing: number;
  speed?: number;
  phase?: number;
}

const CITY_LANDMARK_DIALOGUES: Record<string, string[]> = {
  alun_alun: [
    'Segar banget angin di Alun-Alun!',
    'Air mancur Monumen megah sekali!',
    'Foto dulu di Monumen Netizen City!',
    'Yuk jalan santai keliling taman.',
    'Bunga-bunga di sini terawat rapi!',
  ],
  rumah_ibadah: [
    'Damai selalu di Kawasan Kerukunan.',
    'Menyejukkan hati dan jiwa di sini.',
    'Toleransi adalah keindahan Netizen City.',
    'Selamat beribadah, saudaraku!',
    'Suasana taman ini sungguh syahdu.',
  ],
  universitas: [
    'Ayo kumpul di quad kampus!',
    'Perpustakaan UNC bukunya super lengkap.',
    'Semangat riset untuk masa depan!',
    'Ada seminar menarik di Gedung Rektorat.',
    'Kopi dulu sebelum kuliah berikutnya!',
  ],
  bandara: [
    'Selamat datang di Bandara Internasional Netizen!',
    'Penerbangan on-time, siap liburan!',
    'Terminalnya bersih dan modern banget!',
    'Jangan lupa boarding pass & paspor.',
    'Pesawat baru mendarat di runway!',
  ],
  pantai: [
    'Angin pantainya sejuk dan menenangkan!',
    'Sunset di Pantai Netizen paling juara!',
    'Ayo cari kerang mutiara di tepi ombak!',
    'Segarnya es kelapa muda di pantai.',
    'Hati-hati dan perhatikan ombak ya!',
  ],
};


function makeSpeechBubbleSprite(text: string, bgColor = '#FFFDF9', textColor = '#3B3340'): THREE.Sprite {
  if (typeof document === 'undefined') return new THREE.Sprite();
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Sprite();

  const r = 24;
  const x = 16, y = 16, w = 480, h = 150;

  ctx.fillStyle = bgColor;
  ctx.strokeStyle = '#EADBCC';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(w / 2 + 20, y + h);
  ctx.lineTo(w / 2, y + h + 32);
  ctx.lineTo(w / 2 - 20, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = textColor;
  ctx.font = 'bold 26px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const maxChars = 26;
  if (text.length > maxChars) {
    const words = text.split(' ');
    let line1 = '';
    let line2 = '';
    for (const wd of words) {
      if ((line1 + ' ' + wd).length <= maxChars) {
        line1 = line1 ? line1 + ' ' + wd : wd;
      } else {
        line2 = line2 ? line2 + ' ' + wd : wd;
      }
    }
    ctx.fillText(line1, x + w / 2, y + h / 2 - 16);
    ctx.fillText(line2, x + w / 2, y + h / 2 + 18);
  } else {
    ctx.fillText(text, x + w / 2, y + h / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(4.0, 2.0, 1);
  return sprite;
}

function makeNameTagSprite(name: string, isGuest = false, isSelf = false, isFishing = false): THREE.Sprite {
  if (typeof document === 'undefined') return new THREE.Sprite();
  const canvas = document.createElement('canvas');
  canvas.width = 440;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  if (!ctx) return new THREE.Sprite();

  const r = 26;
  const x = 12, y = 12, w = 416, h = 76;
  ctx.fillStyle = isSelf
    ? 'rgba(78, 120, 77, 0.98)'
    : isGuest
    ? 'rgba(239, 233, 216, 0.96)'
    : 'rgba(102, 139, 101, 0.98)';
  ctx.strokeStyle = isSelf ? '#2E4C2C' : isGuest ? '#D8CEBE' : '#476346';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Green online indicator dot
  ctx.fillStyle = '#22C55E';
  ctx.beginPath();
  ctx.arc(x + 32, y + h / 2, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.fillStyle = isGuest && !isSelf ? '#343B35' : '#FFFFFF';
  ctx.font = 'bold 30px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(name.slice(0, 13), x + 52, y + h / 2);

  if (isFishing) {
    ctx.font = '28px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('🎣', x + w - 18, y + h / 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthTest: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(1.9, 0.44, 1);
  return sprite;
}

const TUGU_DIALOGUES = [
  'Senang sekali bisa kumpul di Alun-Alun Tugu!',
  'Followers kita sekarang sudah 53.000+!',
  'Tugu ini simbol kebersamaan warga Netizen.',
  'Suasana alun-alun hari ini adem banget ya.',
  'Pak Mayor lagi menyapa seluruh warga!',
  'Ada yang mau belanja bareng ke mall?',
  'Kucingnya lucu banget, ramah sekali!',
  'Netizen City kotanya makin maju tiap hari!',
  'Yuk klaim reward harian kamu di Balai Kota!',
  'Bangga jadi warga setia Netizen City!',
];

export class City3DManager {
  private container: HTMLElement;
  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private onCameraModeChange?: (mode: CameraMode) => void;
  private unsubscribeCitizen?: () => void;

  // World objects
  private clouds!: THREE.Group;
  private skyUniforms!: any;
  private hemiLight!: THREE.HemisphereLight;
  private sunLight!: THREE.DirectionalLight;
  private moonLight!: THREE.DirectionalLight;
  private stars!: THREE.Points;

  // City sub-systems
  private town: any;
  private metro: any;
  private mtn: any;
  private river: any;
  private beach: any;
  private forest: any;
  private fireflies: any;
  private mall: any;
  private library: any;
  private airport: any;
  private port: any;
  private sports: any;
  private separateSports: any = null;
  private lab: any;
  private tower: any;
  private zoo: any;
  private vet: any;
  private uni: any;
  private office: any;
  private gate: any;
  private mistBelt: any;
  private prasasti: any;

  // Characters & NPCs
  private playerCitizen: Citizen3DInstance | null = null;
  private mayorPlayer: any = null;
  private mayorNPC: PakMayorNPCInstance | null = null;
  private isPlayerAdmin = false;
  private cat: any = null;
  private petDogs: any[] = [];
  private bigCrowd: any = null;
  private walkingCitizens: WalkingCitizen[] = [];

  // Pak Mayor NPC Walking & Dialogue AI in Alun-Alun Tugu
  private mayorWaypoints: THREE.Vector3[] = [
    new THREE.Vector3(0, 0, 11.2),     // South entrance (welcoming arrivals)
    new THREE.Vector3(7.5, 0, 7.5),    // Southeast walkway
    new THREE.Vector3(10.6, 0, 0),     // East plaza
    new THREE.Vector3(7.5, 0, -7.5),   // Northeast garden path
    new THREE.Vector3(0, 0, -10.6),    // North view
    new THREE.Vector3(-7.5, 0, -7.5),  // Northwest garden path
    new THREE.Vector3(-10.6, 0, 0),    // West plaza
    new THREE.Vector3(-7.5, 0, 7.5),   // Southwest walkway
  ];
  private mayorWaypointIndex = 0;
  private mayorPauseTimer = 3.0;
  private mayorIsMoving = false;
  private mayorSpeechTimer = 8.0;
  private mayorSpeechBubble: THREE.Sprite | null = null;
  private mayorBubbleTimer = 0;

  // Airplanes
  private landingPlane: any = null;
  private skyPlane: any = null;
  private contrails: THREE.LineSegments[] = [];

  // Colliders for buildings
  private colliders: BuildingCollider[] = [];

  // Interactive buildings map for raycasting
  private interactiveMeshes: { mesh: THREE.Object3D; landmark: LandmarkLocation }[] = [];
  private raycaster = new THREE.Raycaster();
  private mouse = new THREE.Vector2();
  private hoveredLandmark: LandmarkLocation | null = null;

  // Animation and state
  private reqId: number = 0;
  private startTime: number = typeof performance !== 'undefined' ? performance.now() : Date.now();
  private lastTime: number = typeof performance !== 'undefined' ? performance.now() : Date.now();
  private timeOfDay: TimeOfDay = 'noon';
  private cameraMode: CameraMode = 'orbit'; // Main city starts in free Orbit overview
  public viewMode: 'city' | 'tugu' | 'river' | 'stadium' | 'beach' = 'city';
  public cityWorldGroup = new THREE.Group();
  public tuguWorldGroup = new THREE.Group();
  public riverWorldGroup = new THREE.Group();
  public stadiumWorldGroup = new THREE.Group();
  public beachWorldGroup = new THREE.Group();

  // 3D Beach Map State
  public beachLamps: Array<{
    root: THREE.Mesh;
    headMat: THREE.MeshStandardMaterial;
    light: THREE.PointLight;
  }> = [];
  private beachFishList: Array<{
    mesh: THREE.Group;
    tail: THREE.Mesh;
    center: THREE.Vector3;
    radius: number;
    angle: number;
    speed: number;
    depth: number;
  }> = [];
  private beachWaveFoams: THREE.Mesh[] = [];
  private beachBuoys: THREE.Group[] = [];
  private separateBeachFlag: THREE.Mesh | null = null;
  private separateLighthouseBeam: THREE.Group | null = null;
  private handleEnterBeachEvent?: () => void;
  private handleExitBeachEvent?: () => void;

  public get activeFishingWorldGroup(): THREE.Group {
    return this.viewMode === 'beach' ? this.beachWorldGroup : this.riverWorldGroup;
  }

  // 3D Stadium & Freekick State
  public soccerBall: THREE.Mesh | null = null;
  public ballVelocity = new THREE.Vector3();
  public ballPos = new THREE.Vector3(0, 0.22, -18);
  public isBallKicked = false;
  public goalkeeper: THREE.Group | null = null;
  public goalkeeperState: 'idle' | 'dive_left' | 'dive_right' | 'jump' = 'idle';
  public goalkeeperAnimTimer = 0;
  public stadiumDefenders: THREE.Group[] = [];
  public stadiumCrowd: Array<{
    root: THREE.Group;
    body: THREE.Mesh;
    armL?: THREE.Mesh;
    armR?: THREE.Mesh;
    flag?: THREE.Mesh;
    baseY: number;
    phase: number;
    speed: number;
    waveAngle: number;
    jumpHeight: number;
  }> = [];
  public stadiumGoalCheerTimer = 0;
  public defenderJumpTimer = 0;
  public keeperArmL: THREE.Mesh | null = null;
  public keeperArmR: THREE.Mesh | null = null;
  public keeperGloveL: THREE.Group | null = null;
  public keeperGloveR: THREE.Group | null = null;
  public isBallCaught = false;
  public hasResolvedPenaltyShot = false;
  public penaltyOutcome: 'goal' | 'saved_catch' | 'saved_deflect' | null = null;
  public stadiumScoreboardMesh: THREE.Mesh | null = null;
  public stadiumScoreboardCanvas: HTMLCanvasElement | null = null;
  public stadiumScoreboardTex: THREE.CanvasTexture | null = null;
  public stadiumScore = { goals: 0, shots: 0 };
  public stadiumCornerFlags: THREE.Mesh[] = [];
  public stadiumLamps: Array<{
    root: THREE.Group;
    light: THREE.SpotLight | THREE.PointLight;
  }> = [];

  // 3D River Map & Fishing System State
  public fishingState: FishingState = 'idle';
  public reelProgress = 0;
  public activeCaughtFish: RiverFishCatch | null = null;
  public pendingHookedFish: RiverFishCatch | null = null;
  private riverFishList: Array<{
    mesh: THREE.Group;
    tail: THREE.Mesh;
    center: THREE.Vector3;
    radius: number;
    angle: number;
    speed: number;
    depth: number;
  }> = [];
  private riverRipples: Array<{ mesh: THREE.Mesh; maxScale: number; speed: number; curScale: number }> = [];
  private currentEquippedRod: FishingRodDefinition | null = FISHING_RODS[0];
  private fishingRodGroup: THREE.Group | null = null;
  private rodHandleMesh: THREE.Mesh | null = null;
  private rodBlankMesh: THREE.Mesh | null = null;
  private rodReelMesh: THREE.Mesh | null = null;
  private rodTipGlowMesh: THREE.Mesh | null = null;
  private rodTip: THREE.Object3D | null = null;
  private fishingBobber: THREE.Group | null = null;
  private fishingLine: THREE.Line | null = null;
  private targetBobberPos = new THREE.Vector3(0, -0.05, -6);
  private castStartTipPos = new THREE.Vector3();
  private castAnimTimer = 0;
  private caughtFishMesh: THREE.Group | null = null;
  private isPlayerWalking = false;
  private fishBiteTimer = 0;
  private biteReactTimer = 0;
  private handleEnterRiverEvent?: () => void;
  private handleExitRiverEvent?: () => void;
  private gateBoard: any = null;
  private unsubscribeGameStore?: () => void;
  private tuguMonument: any = null;
  private tuguMpark: any = null;
  private tuguCitizens: Array<{
    instance: Citizen3DInstance;
    pA: THREE.Vector3;
    pB: THREE.Vector3;
    state: 'walk_to_B' | 'idle_at_B' | 'walk_to_A' | 'idle_at_A';
    timer: number;
    speed: number;
    facing: number;
    isStationary?: boolean;
    bubble?: THREE.Sprite | null;
    bubbleTimer?: number;
  }> = [];
  private playerSpeechBubble: THREE.Sprite | null = null;
  private playerBubbleTimer = 0;
  private npcBubbleTimer = 3.5;
  private handlePlayerChat?: (e: any) => void;
  private isDestroyed = false;

  // Ambient City Landmark NPCs (Alun-Alun, Rumah Ibadah, Universitas, Bandara, Pantai)
  private cityLandmarkNPCs: Array<{
    id: string;
    name: string;
    role: string;
    location: 'alun_alun' | 'rumah_ibadah' | 'universitas' | 'bandara' | 'pantai';
    instance: Citizen3DInstance;
    nameTag: THREE.Sprite;
    bubble?: THREE.Sprite | null;
    bubbleTimer?: number;
    activity: 'walk_patrol' | 'idle_look' | 'sit' | 'wave_greet' | 'photo';
    basePos: THREE.Vector3;
    targetPos?: THREE.Vector3;
    facing: number;
    speed: number;
    phase: number;
  }> = [];
  private cityNPCBubbleTimer = 5.0;

  // Multiplayer Remote Players in Tugu (Max 10 per room)
  public currentTuguRoomId = '1';
  public remotePlayers = new Map<
    string,
    {
      root: THREE.Group;
      citizen: Citizen3DInstance;
      targetPos: THREE.Vector3;
      targetFacing: number;
      nameTag: THREE.Sprite;
      bubble?: THREE.Sprite | null;
      bubbleTimer?: number;
      lastChatTime?: number;
      lastChatId?: string;
      lastServerTime?: number;
      lastTargetUpdate?: number;
      moveSpeed?: number;
      missingSince?: number;
      isFishing?: boolean;
      isMoving?: boolean;
      fishingLine?: THREE.Line;
      bobber?: THREE.Group;
      rodTip?: THREE.Object3D;
    }
  >();

  // Event handlers for mode changes
  private handleEnterTuguEvent?: () => void;
  private handleExitTuguEvent?: () => void;

  // Orbit / Camera controls state
  private target = new THREE.Vector3(0, 0, 0); // City center overview
  private spherical = { radius: 120, phi: Math.PI / 3.5, theta: Math.PI * 0.75 };
  private isPointerDown = false;
  private isPanning = false;
  private pointerStart = { x: 0, y: 0 };
  private pointerDownPos = { x: 0, y: 0 };
  private targetPosition: THREE.Vector3 | null = null;
  private activePointers = new Map<number, { x: number; y: number }>();
  private pinchStartDistance = 0;
  private pinchStartRadius = 0;
  private pinchStartMidpoint = { x: 0, y: 0 };
  private pinchStartAngle = 0;
  private virtualMove: { x: number; y: number } | null = null;
  private tuguLamps: Array<{
    root: THREE.Group;
    globeMat: THREE.MeshStandardMaterial;
    light: THREE.PointLight | null;
  }> = [];
  private riverLamps: Array<{
    root: THREE.Group | THREE.Mesh;
    headMat: THREE.MeshStandardMaterial;
    light: THREE.PointLight;
  }> = [];
  private handleTimeOfDayEvent?: (e: any) => void;
  private handleToggleDayNightEvent?: () => void;

  // Scavenger Hunt Cats
  public cats: Array<{
    id: string;
    name: string;
    locationHint: string;
    root: THREE.Group;
    tail: THREE.Mesh;
    head: THREE.Group;
    baseY: number;
    bounceTimer: number;
  }> = [];
  public interactiveCatMeshes: Array<{ mesh: THREE.Mesh; catId: string }> = [];

  // Photo Studio Camera Adjustment
  private handleAdjustCameraPOV?: (e: any) => void;

  // Character movement state
  private playerPos = new THREE.Vector3(0, 0, 14);
  private playerFacing = 0;
  private keysPressed: Record<string, boolean> = {};

  // Landmarks dictionary
  public readonly landmarks: LandmarkLocation[] = [
    {
      id: 'city_hall',
      name: 'Balai Kota & Kantor Mayor',
      district: 'Downtown (Pusat Kota)',
      type: 'civic',
      position: new THREE.Vector3(0, 0, 9.3),
      cameraTarget: new THREE.Vector3(0, 1.5, 9.3),
      cameraPos: new THREE.Vector3(0, 10, 28),
      radius: 6,
    },
    {
      id: 'netizen_mall',
      name: 'Mall Perbelanjaan Netizen (Day 6)',
      district: 'Komersial & Mall',
      type: 'commercial',
      position: new THREE.Vector3(MALL.x, 0, MALL.z),
      cameraTarget: new THREE.Vector3(MALL.x, 3, MALL.z),
      cameraPos: new THREE.Vector3(MALL.x + 16, 12, MALL.z + 24),
      radius: 12,
    },
    {
      id: 'monument',
      name: 'Monumen Netizen City & Taman Air Mancur',
      district: 'Pusat Kota',
      type: 'monument',
      position: new THREE.Vector3(-44, 0, -94),
      cameraTarget: new THREE.Vector3(-44, 6, -94),
      cameraPos: new THREE.Vector3(-44, 18, -62),
      radius: 16,
    },
    {
      id: 'investor_tower',
      name: 'Monumen Investor Kota (103 Investor)',
      district: 'Monumen Investor Kota',
      type: 'investor',
      position: new THREE.Vector3(TOWER.x, 0, TOWER.z),
      cameraTarget: new THREE.Vector3(TOWER.x, 10, TOWER.z),
      cameraPos: new THREE.Vector3(TOWER.x + 18, 16, TOWER.z + 20),
      radius: 8,
    },
    {
      id: 'hospital',
      name: 'RSUD Netizen City',
      district: 'Fasilitas Publik',
      type: 'facility',
      position: new THREE.Vector3(HOSP.x, 0, HOSP.z),
      cameraTarget: new THREE.Vector3(HOSP.x, 3, HOSP.z),
      cameraPos: new THREE.Vector3(HOSP.x + 15, 12, HOSP.z + 18),
      radius: 8,
    },
    {
      id: 'police',
      name: 'Kantor Polisi Netizen City',
      district: 'Fasilitas Publik',
      type: 'facility',
      position: new THREE.Vector3(POLICE.x, 0, POLICE.z),
      cameraTarget: new THREE.Vector3(POLICE.x, 2, POLICE.z),
      cameraPos: new THREE.Vector3(POLICE.x + 14, 10, POLICE.z + 16),
      radius: 7,
    },
    {
      id: 'fire_station',
      name: 'Pos Pemadam Kebakaran',
      district: 'Fasilitas Publik',
      type: 'facility',
      position: new THREE.Vector3(FIRE.x, 0, FIRE.z),
      cameraTarget: new THREE.Vector3(FIRE.x, 2, FIRE.z),
      cameraPos: new THREE.Vector3(FIRE.x + 14, 10, FIRE.z + 16),
      radius: 7,
    },
    {
      id: 'train_station',
      name: 'Stasiun Kereta Netizen Express',
      district: 'Transportasi',
      type: 'transport',
      position: new THREE.Vector3(STATION.x, 0, STATION.z),
      cameraTarget: new THREE.Vector3(STATION.x, 2, STATION.z),
      cameraPos: new THREE.Vector3(STATION.x + 16, 12, STATION.z + 20),
      radius: 10,
    },
    {
      id: 'worship_place',
      name: 'Kawasan Kerukunan (Masjid & Gereja)',
      district: 'Kawasan Kerukunan',
      type: 'worship',
      position: new THREE.Vector3(KERUK.x, 0, KERUK.z),
      cameraTarget: new THREE.Vector3(KERUK.x, 4, KERUK.z),
      cameraPos: new THREE.Vector3(KERUK.x + 22, 14, KERUK.z + 24),
      radius: 14,
    },
    {
      id: 'apartments_block_a',
      name: 'Rusunawa Harapan Baru Blok A',
      district: 'Perumahan Utara',
      type: 'residential',
      position: new THREE.Vector3(26, 0, 19.5),
      cameraTarget: new THREE.Vector3(26, 4, 19.5),
      cameraPos: new THREE.Vector3(42, 14, 35),
      radius: 10,
    },
    {
      id: 'library',
      name: 'Perpustakaan Ji Hann (Day 7)',
      district: 'Fasilitas Publik',
      type: 'education',
      position: new THREE.Vector3(LIB.x, 0, LIB.z),
      cameraTarget: new THREE.Vector3(LIB.x, 3, LIB.z),
      cameraPos: new THREE.Vector3(LIB.x + 16, 11, LIB.z + 20),
      radius: 8,
    },
    {
      id: 'airport_terminal',
      name: 'Bandara Internasional Netizen (Day 7)',
      district: 'Bandara & Kedatangan',
      type: 'transport',
      position: new THREE.Vector3(AIR.term.x, 0, AIR.term.z),
      cameraTarget: new THREE.Vector3(AIR.term.x, 4, AIR.term.z),
      cameraPos: new THREE.Vector3(AIR.term.x - 25, 18, AIR.term.z + 30),
      radius: 20,
    },
    {
      id: 'sports_stadium',
      name: 'Stadion Olahraga & Kompleks Atletik (Day 7)',
      district: 'Olahraga & Hiburan',
      type: 'sports',
      position: new THREE.Vector3(SPORT.x, 0, SPORT.z),
      cameraTarget: new THREE.Vector3(SPORT.x, 4, SPORT.z),
      cameraPos: new THREE.Vector3(SPORT.x + 35, 25, SPORT.z + 40),
      radius: 22,
    },
    {
      id: 'science_lab',
      name: 'Laboratorium Riset & Roket Festival (Day 8)',
      district: 'Distrik Riset',
      type: 'science',
      position: new THREE.Vector3(LAB.x, 0, LAB.z),
      cameraTarget: new THREE.Vector3(LAB.x, 4, LAB.z),
      cameraPos: new THREE.Vector3(LAB.x + 18, 14, LAB.z + 24),
      radius: 12,
    },
    {
      id: 'zoo',
      name: 'Kebun Binatang Netizen City (Day 9)',
      district: 'Kawasan Wisata & Edukasi',
      type: 'entertainment',
      position: new THREE.Vector3(ZOO.x, 0, ZOO.z),
      cameraTarget: new THREE.Vector3(ZOO.x, 2, ZOO.z),
      cameraPos: new THREE.Vector3(ZOO.x, 22, ZOO.z + 38),
      radius: 22,
    },
    {
      id: 'vet_hospital',
      name: 'RS Hewan & Pojok Adopsi Kucing (Day 9)',
      district: 'Fasilitas Publik',
      type: 'facility',
      position: new THREE.Vector3(VET.x, 0, VET.z),
      cameraTarget: new THREE.Vector3(VET.x, 2, VET.z),
      cameraPos: new THREE.Vector3(VET.x + 16, 10, VET.z + 18),
      radius: 10,
    },
    {
      id: 'university',
      name: 'Universitas Netizen City & Kampus (Day 9)',
      district: 'Distrik Riset & Pendidikan',
      type: 'education',
      position: new THREE.Vector3(UNI.x, 0, UNI.z),
      cameraTarget: new THREE.Vector3(UNI.x, 5, UNI.z),
      cameraPos: new THREE.Vector3(UNI.x, 20, UNI.z + 36),
      radius: 20,
    },
    {
      id: 'nature_mountain',
      name: 'Gunung Netizen & Air Terjun',
      district: 'Kawasan Alam',
      type: 'nature',
      position: new THREE.Vector3(MT.x, 0, MT.z),
      cameraTarget: new THREE.Vector3(MT.x, 30, MT.z),
      cameraPos: new THREE.Vector3(MT.x + 80, 50, MT.z + 90),
      radius: 40,
    },
    {
      id: 'netizen_beach',
      name: 'Pantai Netizen Beach & Menara Pantai',
      district: 'Kawasan Alam & Wisata',
      type: 'nature',
      position: new THREE.Vector3(SHORE.x, 0, SHORE.z),
      cameraTarget: new THREE.Vector3(SHORE.x, 2, SHORE.z),
      cameraPos: new THREE.Vector3(SHORE.x + 35, 18, SHORE.z + 25),
      radius: 25,
    },
    {
      id: 'river_spot',
      name: 'Sungai Kali Netizen & Dermaga Pancing',
      district: 'Kawasan Alam',
      type: 'nature',
      position: new THREE.Vector3(-175, 0, 24),
      cameraTarget: new THREE.Vector3(-175, 1, 24),
      cameraPos: new THREE.Vector3(-150, 14, 45),
      radius: 28,
    },
  ];

  constructor(container: HTMLElement, options?: City3DOptions) {
    this.container = container;
    this.onCameraModeChange = options?.onCameraModeChange;
    if (typeof window !== 'undefined') {
      (window as any).__city3DManager = this;
    }
    this.init();
  }

  private init() {
    const W = this.container.clientWidth || window.innerWidth;
    const H = this.container.clientHeight || window.innerHeight;

    // 1. Renderer Setup (hardware 24-bit depth buffer for crisp rendering without scanline moire quantization)
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      preserveDrawingBuffer: true,
    });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.renderer.setSize(W, H);
    this.renderer.toneMapping = THREE.NeutralToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.shadowMap.enabled = false;
    this.container.appendChild(this.renderer.domElement);

    // 2. Scene & Fog Setup
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.Fog('#F4E6D4', 260, 950);

    // World Groups: Separate Main City Diorama vs Dedicated Tugu Alun-Alun Map
    this.cityWorldGroup = new THREE.Group();
    this.cityWorldGroup.name = 'CityWorldGroup';
    this.scene.add(this.cityWorldGroup);

    this.tuguWorldGroup = new THREE.Group();
    this.tuguWorldGroup.name = 'TuguWorldGroup';
    this.scene.add(this.tuguWorldGroup);
    this.tuguWorldGroup.visible = false; // Initially hidden

    this.riverWorldGroup = new THREE.Group();
    this.riverWorldGroup.name = 'RiverWorldGroup';
    this.scene.add(this.riverWorldGroup);
    this.riverWorldGroup.visible = false; // Initially hidden

    this.stadiumWorldGroup = new THREE.Group();
    this.stadiumWorldGroup.name = 'StadiumWorldGroup';
    this.scene.add(this.stadiumWorldGroup);
    this.stadiumWorldGroup.visible = false; // Initially hidden

    this.beachWorldGroup = new THREE.Group();
    this.beachWorldGroup.name = 'BeachWorldGroup';
    this.scene.add(this.beachWorldGroup);
    this.beachWorldGroup.visible = false; // Initially hidden

    // 3. Camera Setup (near 0.8 and far 1200 eliminates clipping and depth precision artifacts)
    this.camera = new THREE.PerspectiveCamera(40, W / H, 0.8, 1200);
    this.updateCameraTransform();

    // 4. Lighting & Sky Setup
    const worldElements = buildWorld(this.scene, this.cityWorldGroup);
    this.clouds = worldElements.clouds;
    this.skyUniforms = (this.scene.children[0] as any)?.material?.uniforms;

    this.hemiLight = new THREE.HemisphereLight('#D3E8FF', '#EAD6B4', 1.05);
    this.scene.add(this.hemiLight);

    this.sunLight = new THREE.DirectionalLight('#FFF0D8', 2.5);
    this.sunLight.castShadow = false;
    this.sunLight.position.set(60, 100, 70);
    this.scene.add(this.sunLight, this.sunLight.target);

    this.moonLight = new THREE.DirectionalLight('#9FB4FF', 0);
    this.moonLight.position.set(-50, 90, 40);
    this.scene.add(this.moonLight);

    // Stars at night
    this.stars = this.createStars();
    this.scene.add(this.stars);

    // 5. Build Complete City Assets (Days 1 to 9)
    this.buildCityDiorama();
    this.buildTuguMap();
    this.buildRiverMap();
    this.buildStadiumMap();
    this.buildBeachMap();

    // 6. Setup Characters, Living Citizens & Airplanes
    this.setupCharacters();
    this.setupAirplanes();

    // 7. Setup Interactive Raycasting & Colliders for Buildings
    this.registerInteractiveLandmarks();
    this.setupColliders();
    this.setupCats();

    // 8. Event Listeners (Resize, Controls, Click, Prevent ContextMenu)
    this.setupEventListeners();

    // 9. Update state in Zustand store
    useGameStore.getState().setGameReady(true);
    useGameStore.getState().setCurrentDistrict('town_square');

    this.unsubscribeGameStore = useGameStore.subscribe((state) => {
      if (state.cityStats?.officialPopulation) {
        this.updateGatePopulation(state.cityStats.officialPopulation);
      }
    });

    if (typeof fetch !== 'undefined') {
      fetch('/api/population')
        .then((r) => r.json())
        .then((d) => {
          if (d.officialPopulation) {
            useGameStore.getState().setCityStats({ officialPopulation: d.officialPopulation });
            this.updateGatePopulation(d.officialPopulation);
          }
        })
        .catch(() => {});
    }

    // 10. Start Animation Loop
    this.animate();
  }

  private createStars(): THREE.Points {
    const p: number[] = [];
    for (let i = 0; i < 600; i++) {
      const a = Math.random() * 6.283;
      const e = 0.15 + Math.random() * 1.3;
      p.push(
        Math.cos(a) * Math.cos(e) * 850,
        Math.sin(e) * 850,
        Math.sin(a) * Math.cos(e) * 850
      );
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
    const m = new THREE.PointsMaterial({
      color: '#FFF6E0',
      size: 3.5,
      sizeAttenuation: false,
      transparent: true,
      opacity: 0,
      fog: false,
      depthWrite: false,
    });
    return new THREE.Points(g, m);
  }

  private buildCityDiorama() {
    // A. Day 1: Office & Gate
    const clock = signTex((x: any, v: any, w: any, h: any) => {
      x.fillStyle = '#FFFBF2';
      x.beginPath();
      x.arc(w / 2, h / 2, w / 2 - 4, 0, 7);
      x.fill();
      x.lineWidth = 10;
      x.strokeStyle = '#E58F72';
      x.stroke();
      x.fillStyle = '#4B3A36';
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * 6.283;
        x.beginPath();
        x.arc(w / 2 + Math.cos(a) * w * 0.36, h / 2 + Math.sin(a) * h * 0.36, 5, 0, 7);
        x.fill();
      }
    }, 256, 256);
    clock.set(12 * 60);

    const initialPop = useGameStore.getState().cityStats?.officialPopulation || 53476;
    this.gateBoard = signTex((x: any, v: any, w: any, h: any) => {
      const popCount = typeof v === 'number' ? v.toLocaleString('id-ID') : (typeof v === 'string' && v && v !== 'p53' ? v : initialPop.toLocaleString('id-ID'));
      x.fillStyle = '#FFF4DA';
      x.fillRect(0, 0, w, h);
      x.strokeStyle = '#D9A877';
      x.lineWidth = 14;
      x.strokeRect(7, 7, w - 14, h - 14);
      x.fillStyle = '#4B3A36';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.font = '54px "Lilita One", sans-serif';
      x.fillText(`POPULASI: ${popCount}`, w / 2, h * 0.4);
      x.fillStyle = '#5FA88A';
      x.font = '40px "Lilita One", sans-serif';
      x.fillText('NETIZEN CITY', w / 2, h * 0.76);
    }, 640, 200);
    this.gateBoard.set(initialPop.toLocaleString('id-ID'));

    this.gate = makeGate(this.gateBoard);
    this.gate.root.position.set(0, 0, 27.6);
    this.cityWorldGroup.add(this.gate.root);

    this.office = makeOffice(clock);
    this.office.root.position.set(0, 0, 9.3);
    this.cityWorldGroup.add(this.office.root);

    // B. Day 2: Kampung Angkatan 1 & 2
    const K2 = {
      infill: true,
      S3: -100,
      S6: -100,
      S7: -100,
      S8: -100,
      pohon: -100,
      lampu: -100,
      modern: -100,
      ruko: -100,
      lapangan: -100,
      atSchool: -100,
      rolldoor: -100,
      lights: 1,
    };
    this.town = buildCity(this.cityWorldGroup, K2);
    this.town.ball.visible = false;
    this.town.rollers.forEach((r: any) => (r.visible = false));
    this.town.appear(1000, 1000);

    // C. Day 3-4: Metro (Avenues, Offices, Rusun, RS, Polisi, Damkar, Stasiun, Monumen)
    this.metro = buildMetro(this.cityWorldGroup, { lights: 1, grow: -100 });
    this.metro.buildWorship(9);
    this.metro.buildParts(this.metro.hosp, 9);
    this.metro.buildParts(this.metro.police, 9);
    this.metro.buildParts(this.metro.fire, 9);
    this.metro.fire.doors.forEach((d: any) => (d.scale.y = 1));
    this.metro.myst.root.visible = false;
    this.metro.northCrane.root.visible = false;
    this.metro.monument.root.visible = true;
    this.metro.mpark.root.visible = true;
    this.metro.promenade.visible = true;
    (this.metro.promenadeTrees || []).forEach((o: any) => (o.visible = true));
    this.metro.mpark.jets.children.forEach((j: any) => (j.scale.y = 0.85));
    this.metro.cranes.forEach((k: any) => (k.root.visible = false));
    this.metro.trucks.forEach((k: any) => (k.root.visible = false));

    // D. Day 5: Kawasan Alam (Gunung, Sungai, Pantai Netizen Beach, Mist)
    this.mtn = makeMountain();
    this.cityWorldGroup.add(this.mtn.root);
    this.mtn.build(1, 1, 0);

    this.river = makeRiver(RAIL_Z);
    this.cityWorldGroup.add(this.river.root);
    this.river.build(1, 0);

    this.beach = makeBeach();
    this.cityWorldGroup.add(this.beach.root);
    this.beach.ribbon.forEach((r: any) => (r.visible = false));
    this.beach.gate.userData.bow.visible = false;
    this.beach.build(1, 1, 1, 0);

    this.mistBelt = makeMistBelt();
    this.cityWorldGroup.add(this.mistBelt.root);

    // E. Day 6: Hutan & Netizen Mall
    this.forest = makeForest();
    this.cityWorldGroup.add(this.forest.root);
    this.forest.grow(1, 0);

    this.fireflies = makeFireflies(this.forest);
    this.cityWorldGroup.add(this.fireflies.root);

    this.mall = makeMall();
    this.cityWorldGroup.add(this.mall.root);
    this.mall.build(1);

    // F. Day 7: Fasilitas Publik (Perpustakaan, Bandara, Pelabuhan, Olahraga, Prasasti)
    this.library = makeLibrary();
    this.cityWorldGroup.add(this.library.root);
    this.library.build(1);

    this.airport = makeAirport();
    this.cityWorldGroup.add(this.airport.root);
    this.airport.build(1);
    // Parked plane on airport apron
    if (this.airport?.plane?.root) {
      this.airport.plane.root.position.set(AIR.term.x + 9.5, 0, AIR.term.z);
      this.airport.plane.root.rotation.set(0, -Math.PI / 2, 0);
    }

    this.port = makePort();
    this.cityWorldGroup.add(this.port.root);
    this.port.build(1);

    this.sports = makeSports();
    this.cityWorldGroup.add(this.sports.root);
    this.sports.build(1);

    // Paved walkway and parking bays between stadium stands and east access road
    const asphMat = new THREE.MeshStandardMaterial({ color: '#8C98AA', roughness: 0.95 });
    const stadiumParking = new THREE.Mesh(
      new THREE.BoxGeometry(6, 0.04, 28).translate(SPORT.x + 22.5, 0.02, SPORT.z),
      asphMat
    );
    stadiumParking.receiveShadow = false;
    this.cityWorldGroup.add(stadiumParking);

    this.prasasti = makePrasasti();
    this.cityWorldGroup.add(this.prasasti);

    // G. Day 8: Laboratorium Riset & Menara Investor
    this.lab = makeLab();
    this.cityWorldGroup.add(this.lab.root);
    this.lab.open(0);

    this.tower = makeTower(this.renderer);
    this.cityWorldGroup.add(this.tower.root);
    this.tower.light(() => 0.8, 0, 0);
    this.tower.crowns.forEach((c: any, j: number) => this.tower.crown(j, 0.9, 0, 0));
    this.tower.haloOn(0.7, 0);
    this.tower.neon(0.6);
    this.tower.env(1);

    // H. Day 9: Kebun Binatang, RS Hewan & Sudut Adopsi, Universitas
    this.zoo = makeZoo();
    this.cityWorldGroup.add(this.zoo.root);
    this.zoo.build(1);

    this.vet = makeVet();
    this.cityWorldGroup.add(this.vet.root);
    this.vet.build(1);

    this.uni = makeUni();
    this.cityWorldGroup.add(this.uni.root);
    this.uni.build(1);

    // Setup ambient animated NPCs in key city landmarks
    this.setupCityLandmarkNPCs();

    this.applyTimeOfDay('noon');
  }

    private createParkBench(): THREE.Group {
    const bench = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: '#C68B59', roughness: 0.8 });
    const ironMat = new THREE.MeshStandardMaterial({ color: '#2E2D38', roughness: 0.5, metalness: 0.7 });

    for (let i = 0; i < 4; i++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.06, 0.18), woodMat);
      plank.position.set(0, 0.45, -0.3 + i * 0.2);
      plank.castShadow = false;
      bench.add(plank);
    }
    for (let i = 0; i < 3; i++) {
      const bPlank = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.16, 0.06), woodMat);
      bPlank.position.set(0, 0.65 + i * 0.22, -0.42);
      bPlank.castShadow = false;
      bench.add(bPlank);
    }
    for (const sx of [-1.1, 1.1]) {
      const leg1 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 6), ironMat);
      leg1.position.set(sx, 0.22, 0.25);
      const leg2 = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.45, 6), ironMat);
      leg2.position.set(sx, 0.22, -0.35);
      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.7), ironMat);
      arm.position.set(sx, 0.58, -0.05);
      bench.add(leg1, leg2, arm);
    }
    return bench;
  }

  private createParkLamp(hasLight = false): THREE.Group {
    const lamp = new THREE.Group();
    const poleMat = new THREE.MeshStandardMaterial({ color: '#2C2B36', roughness: 0.6, metalness: 0.6 });
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.16, 3.8, 8), poleMat);
    post.position.y = 1.9;
    post.castShadow = false;
    lamp.add(post);

    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.38, 0.35, 8), poleMat);
    base.position.y = 0.17;
    lamp.add(base);

    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.1, 0.3, 8), poleMat);
    cap.position.y = 3.9;
    lamp.add(cap);

    const glassMat = new THREE.MeshStandardMaterial({
      color: '#FFF8E7',
      emissive: '#FFDA8A',
      emissiveIntensity: 0.4,
      roughness: 0.3,
    });
    const globe = new THREE.Mesh(new THREE.SphereGeometry(0.28, 8, 8), glassMat);
    globe.position.y = 3.75;
    lamp.add(globe);

    let bulbLight: THREE.PointLight | null = null;
    if (hasLight) {
      bulbLight = new THREE.PointLight('#FFE29A', 0, 16, 1.6);
      bulbLight.position.y = 3.75;
      lamp.add(bulbLight);
    }

    this.tuguLamps.push({ root: lamp, globeMat: glassMat, light: bulbLight });

    return lamp;
  }

  private createParkTree(type: number): THREE.Group {
    const tree = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#5C4033', roughness: 0.9 });
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.32, 2.2, 7), trunkMat);
    trunk.position.y = 1.1;
    trunk.castShadow = false;
    tree.add(trunk);

    if (type === 0) {
      const pinkMat1 = new THREE.MeshStandardMaterial({ color: '#F8BBD0', roughness: 0.8 });
      const pinkMat2 = new THREE.MeshStandardMaterial({ color: '#F48FB1', roughness: 0.8 });
      const puff1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.4, 1), pinkMat1);
      puff1.position.y = 2.8;
      puff1.castShadow = false;
      const puff2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.0, 1), pinkMat2);
      puff2.position.set(0.6, 3.2, 0.4);
      puff2.castShadow = false;
      const puff3 = new THREE.Mesh(new THREE.DodecahedronGeometry(0.9, 1), pinkMat1);
      puff3.position.set(-0.5, 3.0, -0.4);
      puff3.castShadow = false;
      tree.add(puff1, puff2, puff3);
    } else if (type === 1) {
      const greenMat1 = new THREE.MeshStandardMaterial({ color: '#7CB342', roughness: 0.85 });
      const greenMat2 = new THREE.MeshStandardMaterial({ color: '#558B2F', roughness: 0.85 });
      const puff1 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6, 1), greenMat1);
      puff1.position.y = 2.9;
      puff1.castShadow = false;
      const puff2 = new THREE.Mesh(new THREE.DodecahedronGeometry(1.1, 1), greenMat2);
      puff2.position.set(-0.6, 3.4, 0.3);
      puff2.castShadow = false;
      tree.add(puff1, puff2);
    } else {
      const pineMat = new THREE.MeshStandardMaterial({ color: '#2E7D32', roughness: 0.8 });
      for (let i = 0; i < 3; i++) {
        const cone = new THREE.Mesh(new THREE.ConeGeometry(1.6 - i * 0.4, 1.3, 7), pineMat);
        cone.position.y = 2.1 + i * 0.9;
        cone.castShadow = false;
        tree.add(cone);
      }
    }
    return tree;
  }

  private createFlowerbed(colorIdx: number): THREE.Group {
    const fb = new THREE.Group();
    const curbMat = new THREE.MeshStandardMaterial({ color: '#D2C3B0', roughness: 0.9 });
    const soilMat = new THREE.MeshStandardMaterial({ color: '#4A3525', roughness: 0.95 });

    const bed = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, 0.22, 16), curbMat);
    bed.position.y = 0.11;
    bed.receiveShadow = false;
    const soil = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.08, 16), soilMat);
    soil.position.y = 0.23;
    fb.add(bed, soil);

    const flowerColors = ['#F06292', '#FFD54F', '#BA68C8', '#4FC3F7'];
    const col = flowerColors[colorIdx % flowerColors.length];
    const flowerMat = new THREE.MeshStandardMaterial({ color: col, roughness: 0.6 });

    for (let f = 0; f < 3; f++) {
      const a = (f / 3) * Math.PI * 2;
      const r = 0.5;
      const fl = new THREE.Mesh(new THREE.DodecahedronGeometry(0.14, 0), flowerMat);
      fl.position.set(Math.cos(a) * r, 0.34, Math.sin(a) * r);
      fb.add(fl);
    }
    return fb;
  }

  private createTuguPortal(): THREE.Group {
    const portal = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: '#D9CBBA', roughness: 0.85 });
    const woodMat = new THREE.MeshStandardMaterial({ color: '#8D6E63', roughness: 0.8 });
    const goldMat = new THREE.MeshStandardMaterial({ color: '#FFD54F', metalness: 0.6, roughness: 0.3 });

    for (const sx of [-3.5, 3.5]) {
      const pillar = new THREE.Mesh(new THREE.BoxGeometry(0.8, 3.8, 0.8), stoneMat);
      pillar.position.set(sx, 1.9, 0);
      pillar.castShadow = false;
      const cap = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.25, 1.1), goldMat);
      cap.position.set(sx, 3.85, 0);
      const lantern = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 8, 8),
        new THREE.MeshStandardMaterial({ color: '#FFF8E7', emissive: '#FFD777', emissiveIntensity: 1.5 })
      );
      lantern.position.set(sx, 4.15, 0);
      portal.add(pillar, cap, lantern);
    }

    const arch = new THREE.Mesh(new THREE.BoxGeometry(7.8, 0.5, 0.5), woodMat);
    arch.position.set(0, 3.6, 0);
    arch.castShadow = false;
    portal.add(arch);

    const signTexMesh = signTex((x: any, v: any, w: any, h: any) => {
      x.fillStyle = '#FFFDF5';
      x.fillRect(0, 0, w, h);
      x.strokeStyle = '#D7B484';
      x.lineWidth = 10;
      x.strokeRect(5, 5, w - 10, h - 10);
      x.fillStyle = '#4A3B32';
      x.font = 'bold 36px sans-serif';
      x.textAlign = 'center';
      x.textBaseline = 'middle';
      x.fillText('ALUN-ALUN MONUMEN TUGU', w / 2, h / 2);
    }, 512, 128);
    signTexMesh.set(1);
    const signBoard = new THREE.Mesh(
      new THREE.BoxGeometry(5.2, 0.9, 0.1),
      new THREE.MeshStandardMaterial({ map: signTexMesh.t, roughness: 0.7 })
    );
    signBoard.position.set(0, 4.3, 0);
    portal.add(signBoard);

    const exitPadMat = new THREE.MeshStandardMaterial({
      color: '#4DD0E1',
      emissive: '#00ACC1',
      emissiveIntensity: 0.8,
      roughness: 0.3,
    });
    const exitPad = new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, 0.04, 32), exitPadMat);
    exitPad.position.set(0, 0.03, 0);
    exitPad.receiveShadow = false;

    const exitBorder = new THREE.Mesh(
      new THREE.RingGeometry(2.1, 2.4, 32).rotateX(-Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: '#E0F7FA', emissive: '#80DEEA', emissiveIntensity: 1.2 })
    );
    exitBorder.position.set(0, 0.04, 0);

    portal.add(exitPad, exitBorder);
    return portal;
  }

  private buildTuguMap() {
    const baseLawn = new THREE.Mesh(
      new THREE.CylinderGeometry(28, 29, 1.4, 64),
      new THREE.MeshStandardMaterial({ color: '#7DB85C', roughness: 0.9 })
    );
    baseLawn.position.set(0, -0.7, 0);
    baseLawn.receiveShadow = false;
    this.tuguWorldGroup.add(baseLawn);

    const rim = new THREE.Mesh(
      new THREE.TorusGeometry(28.2, 0.5, 12, 64),
      new THREE.MeshStandardMaterial({ color: '#D4C4AA', roughness: 0.8 })
    );
    rim.rotation.x = Math.PI / 2;
    rim.position.set(0, 0, 0);
    this.tuguWorldGroup.add(rim);

    const plaza = new THREE.Mesh(
      new THREE.CircleGeometry(16, 64),
      new THREE.MeshStandardMaterial({
        color: '#F5EEDB',
        roughness: 0.85,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1,
      })
    );
    plaza.rotation.x = -Math.PI / 2;
    plaza.position.set(0, 0.03, 0);
    plaza.receiveShadow = false;
    this.tuguWorldGroup.add(plaza);

    const decRing = new THREE.Mesh(
      new THREE.RingGeometry(11, 12.2, 64).rotateX(-Math.PI / 2),
      new THREE.MeshStandardMaterial({
        color: '#E4D5BE',
        roughness: 0.9,
        polygonOffset: true,
        polygonOffsetFactor: -2,
        polygonOffsetUnits: -2,
      })
    );
    decRing.position.set(0, 0.045, 0);
    decRing.receiveShadow = false;
    this.tuguWorldGroup.add(decRing);

    const walkwayMat = new THREE.MeshStandardMaterial({
      color: '#F5EEDB',
      roughness: 0.85,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    angles.forEach((rot) => {
      const walk = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.04, 12), walkwayMat);
      walk.position.set(Math.sin(rot) * 20, 0.035, Math.cos(rot) * 20);
      walk.rotation.y = rot;
      walk.receiveShadow = false;
      this.tuguWorldGroup.add(walk);
    });

    this.tuguMonument = makeMonument();
    this.tuguMonument.root.position.set(0, 0, 0);
    this.tuguWorldGroup.add(this.tuguMonument.root);

    this.tuguMpark = makeMonumentPark();
    this.tuguMpark.root.position.set(0, 0, 0);
    this.tuguWorldGroup.add(this.tuguMpark.root);
    if (this.tuguMpark?.jets) {
      this.tuguMpark.jets.children.forEach((j: any) => (j.scale.y = 0.85));
    }

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const bench = this.createParkBench();
      bench.position.set(Math.cos(a) * 13.8, 0.03, Math.sin(a) * 13.8);
      bench.rotation.y = -a - Math.PI / 2;
      this.tuguWorldGroup.add(bench);
    }

    this.tuguLamps = [];
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const lamp = this.createParkLamp(i % 2 === 0);
      lamp.position.set(Math.cos(a) * 15.5, 0.03, Math.sin(a) * 15.5);
      lamp.rotation.y = -a;
      this.tuguWorldGroup.add(lamp);
    }

    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * Math.PI * 2;
      if (Math.abs(a - Math.PI / 2) < 0.28) continue;
      const dist = 21 + (i % 3) * 2.2;
      const tree = this.createParkTree(i % 3);
      tree.position.set(Math.cos(a) * dist, 0.02, Math.sin(a) * dist);
      this.tuguWorldGroup.add(tree);
    }

    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const fb = this.createFlowerbed(i);
      fb.position.set(Math.cos(a) * 18.5, 0.03, Math.sin(a) * 18.5);
      this.tuguWorldGroup.add(fb);
    }

    const portal = this.createTuguPortal();
    portal.position.set(0, 0, 22);
    this.tuguWorldGroup.add(portal);
  }

  private buildRiverMap() {
    this.riverLamps = [];

    // 1. Riverbed (underwater bottom)
    const riverbed = new THREE.Mesh(
      new THREE.PlaneGeometry(160, 70, 1, 1).rotateX(-Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: '#1B261E', roughness: 0.95 })
    );
    riverbed.position.set(0, -1.8, -32);
    riverbed.receiveShadow = false;
    this.riverWorldGroup.add(riverbed);

    // 2. Translucent River Water Surface
    // Extends from z = -62 up to z = 0.0 with pure matte Lambertian reflection (zero blinding specular glare hotspot)
    const waterGeom = new THREE.PlaneGeometry(160, 62, 1, 1).rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshLambertMaterial({
      color: '#1B6B7C',
      transparent: true,
      opacity: 0.88,
      depthWrite: false, // Clean underwater rendering with swimming fish
    });
    const riverWater = new THREE.Mesh(waterGeom, waterMat);
    riverWater.position.set(0, -0.05, -31);
    riverWater.receiveShadow = false;
    this.riverWorldGroup.add(riverWater);

    // 3. Sandy Riverbank Strip (along z = 0.0 to 1.4, stepped at y = +0.02)
    const bank = new THREE.Mesh(
      new THREE.BoxGeometry(160, 0.35, 1.4),
      new THREE.MeshStandardMaterial({ color: '#C6B599', roughness: 0.95 })
    );
    bank.position.set(0, -0.15, 0.7);
    bank.receiveShadow = false;
    this.riverWorldGroup.add(bank);

    // 4. Grassy Shoreline Meadow (South, z = 1.4 to 45.0, stepped at y = +0.05)
    // Completely distinct physical elevation prevents any plane overlap or Z-fighting
    const shore = new THREE.Mesh(
      new THREE.BoxGeometry(160, 1.4, 43.6),
      new THREE.MeshStandardMaterial({ color: '#559A36', roughness: 0.95 })
    );
    shore.position.set(0, -0.65, 23.2);
    shore.receiveShadow = false;
    this.riverWorldGroup.add(shore);

    // Stone pathway from city portal to pier (raised slightly at y = 0.08)
    const pathMat = new THREE.MeshStandardMaterial({
      color: '#E6D7BE',
      roughness: 0.95,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const stonePath = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.04, 11.5), pathMat);
    stonePath.position.set(0, 0.08, 8.5);
    stonePath.receiveShadow = false;
    this.riverWorldGroup.add(stonePath);

    // Shoreline rocks & river stones along water edge (Z ~ 0)
    const rockMat = new THREE.MeshStandardMaterial({ color: '#7E8B85', roughness: 0.9 });
    for (let i = 0; i < 28; i++) {
      const rx = (i - 14) * 2.6 + (Math.random() - 0.5) * 0.8;
      if (Math.abs(rx) < 3.2) continue; // Leave pier entrance clear
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.45),
        rockMat
      );
      rock.position.set(rx, 0.12, 0.5 + (Math.random() - 0.5) * 0.6);
      rock.rotation.set(Math.random(), Math.random(), Math.random());
      rock.scale.set(1.2, 0.7, 1);
      this.riverWorldGroup.add(rock);
    }

    // 5. Wooden Pier (Dermaga Pancing)
    const pierDeckGroup = new THREE.Group();
    const woodPlankMat1 = new THREE.MeshStandardMaterial({ color: '#7A4B26', roughness: 0.85 });
    const woodPlankMat2 = new THREE.MeshStandardMaterial({ color: '#8C562E', roughness: 0.85 });

    // Approach Steps connecting Shore (y = 0.0) up to Pier (y = 0.35)
    const stepMat = new THREE.MeshStandardMaterial({ color: '#6A4122', roughness: 0.85 });
    const step1 = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.12, 0.55), stepMat);
    step1.position.set(0, 0.06, 2.75);
    const step2 = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.12, 0.55), stepMat);
    step2.position.set(0, 0.18, 2.25);
    pierDeckGroup.add(step1, step2);

    // Main structural under-beams
    const beamMat = new THREE.MeshStandardMaterial({ color: '#54321A', roughness: 0.9 });
    const leftBeam = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 12.6), beamMat);
    leftBeam.position.set(-2.4, 0.15, -3.8);
    const rightBeam = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.4, 12.6), beamMat);
    rightBeam.position.set(2.4, 0.15, -3.8);
    pierDeckGroup.add(leftBeam, rightBeam);

    // Wooden planks (laid across X axis)
    const plankCount = 30;
    for (let i = 0; i < plankCount; i++) {
      const zPos = 1.95 - i * (11.5 / plankCount);
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(5.2, 0.1, 0.36),
        i % 2 === 0 ? woodPlankMat1 : woodPlankMat2
      );
      plank.position.set(0, 0.35, zPos);
      plank.receiveShadow = false;
      pierDeckGroup.add(plank);
    }

    // Pier Pilings (wooden stilts in water)
    const postMat = new THREE.MeshStandardMaterial({ color: '#4A2D17', roughness: 0.9 });
    const pilingsZ = [1.8, -0.8, -3.6, -6.4, -9.4];
    pilingsZ.forEach((pz) => {
      [-2.4, 2.4].forEach((px) => {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 2.4, 8), postMat);
        post.position.set(px, -0.6, pz);
        pierDeckGroup.add(post);
      });
    });

    // Pier Railings (Left & Right sides)
    const railMat = new THREE.MeshStandardMaterial({ color: '#6A4122', roughness: 0.85 });
    pilingsZ.forEach((pz) => {
      [-2.45, 2.45].forEach((px) => {
        const railPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.9, 8), railMat);
        railPost.position.set(px, 0.8, pz);
        pierDeckGroup.add(railPost);
      });
    });
    const leftRail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 11.4), railMat);
    leftRail.position.set(-2.45, 1.15, -3.8);
    const rightRail = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 11.4), railMat);
    rightRail.position.set(2.45, 1.15, -3.8);
    pierDeckGroup.add(leftRail, rightRail);

    // Front edge bumper beam at fishing spot (z = -9.5)
    const frontBumper = new THREE.Mesh(new THREE.BoxGeometry(5.4, 0.22, 0.25), railMat);
    frontBumper.position.set(0, 0.45, -9.55);
    pierDeckGroup.add(frontBumper);

    // Dock Lanterns (3 lamps on posts with day/night integration)
    [
      { x: -2.4, z: -9.4 },
      { x: 2.4, z: -9.4 },
      { x: -2.4, z: -0.8 },
    ].forEach((pos) => {
      const lampPost = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 1.6, 8), postMat);
      lampPost.position.set(pos.x, 1.15, pos.z);
      pierDeckGroup.add(lampPost);

      const lampHeadMat = new THREE.MeshStandardMaterial({
        color: '#FFA94D',
        emissive: '#FF8800',
        emissiveIntensity: 0.3,
        roughness: 0.5,
      });
      const lampHead = new THREE.Mesh(
        new THREE.CylinderGeometry(0.16, 0.12, 0.25, 6),
        lampHeadMat
      );
      lampHead.position.set(pos.x, 1.9, pos.z);
      pierDeckGroup.add(lampHead);

      // PointLight starts at 0 during day, preventing specular flares!
      const lampLight = new THREE.PointLight('#FFA94D', 0, 6, 2);
      lampLight.position.set(pos.x, 2.1, pos.z);
      pierDeckGroup.add(lampLight);

      this.riverLamps.push({ root: lampHead, headMat: lampHeadMat, light: lampLight });
    });

    // Decorative Barrels & Crates on Pier
    const barrel = new THREE.Group();
    const barrelBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.28, 0.7, 10),
      woodPlankMat1
    );
    const ringMat = new THREE.MeshStandardMaterial({ color: '#374151', metalness: 0.6 });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.02, 6, 12).rotateX(Math.PI / 2), ringMat);
    ring1.position.y = 0.2;
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.02, 6, 12).rotateX(Math.PI / 2), ringMat);
    ring2.position.y = -0.2;
    barrel.add(barrelBody, ring1, ring2);
    barrel.position.set(-1.8, 0.7, -4.5);
    pierDeckGroup.add(barrel);

    const fishCrate = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.4, 0.5),
      new THREE.MeshStandardMaterial({ color: '#A06E3B', roughness: 0.9 })
    );
    fishCrate.position.set(1.7, 0.55, -5.2);
    fishCrate.rotation.y = 0.2;
    pierDeckGroup.add(fishCrate);

    this.riverWorldGroup.add(pierDeckGroup);

    // 6. Water Lilies & Lotus Blossoms floating on River
    const lilyMat = new THREE.MeshStandardMaterial({ color: '#2E7D32', roughness: 0.8 });
    const flowerMat = new THREE.MeshStandardMaterial({ color: '#FFB6C1', roughness: 0.6 });
    const lilySpots = [
      { x: -5.5, z: -7.5 },
      { x: -7.2, z: -9.0 },
      { x: 5.8, z: -8.0 },
      { x: 7.5, z: -6.5 },
      { x: 4.8, z: -12.0 },
      { x: -6.0, z: -13.5 },
    ];
    lilySpots.forEach((lp, idx) => {
      const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.02, 12), lilyMat);
      pad.position.set(lp.x, 0.015, lp.z);
      this.riverWorldGroup.add(pad);
      if (idx % 2 === 0) {
        const fl = new THREE.Mesh(new THREE.DodecahedronGeometry(0.12), flowerMat);
        fl.position.set(lp.x, 0.07, lp.z);
        this.riverWorldGroup.add(fl);
      }
    });

    // 7. Mountain Ridge, Waterfall & Surrounding Landscape (Eliminates all void gaps!)
    // North Mountain Massif
    const mountainMassif = new THREE.Mesh(
      new THREE.BoxGeometry(160, 26, 18),
      new THREE.MeshStandardMaterial({ color: '#3A483B', roughness: 0.95 })
    );
    mountainMassif.position.set(0, 9.0, -42);
    this.riverWorldGroup.add(mountainMassif);

    // Rolling Mountain Peaks
    const peakMat = new THREE.MeshStandardMaterial({ color: '#4B5A4D', roughness: 0.95 });
    [
      { x: -42, y: 13, z: -38, r: 18, h: 18 },
      { x: 2, y: 17, z: -44, r: 24, h: 24 },
      { x: 46, y: 14, z: -40, r: 20, h: 20 },
    ].forEach((pk) => {
      const peak = new THREE.Mesh(new THREE.ConeGeometry(pk.r, pk.h, 6), peakMat);
      peak.position.set(pk.x, pk.y, pk.z);
      this.riverWorldGroup.add(peak);
    });

    // Low-poly Waterfall cascade on North Cliff
    const waterfallMat = new THREE.MeshStandardMaterial({
      color: '#99F6E4',
      emissive: '#38BDF8',
      emissiveIntensity: 0.25,
      roughness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    const waterfall = new THREE.Mesh(new THREE.PlaneGeometry(5.2, 16), waterfallMat);
    waterfall.position.set(-14, 6.0, -32.8);
    this.riverWorldGroup.add(waterfall);

    const mistPool = new THREE.Mesh(
      new THREE.CylinderGeometry(3.6, 4.2, 0.35, 12),
      new THREE.MeshStandardMaterial({
        color: '#F0FDFA',
        transparent: true,
        opacity: 0.7,
        roughness: 0.3,
      })
    );
    mistPool.position.set(-14, 0.08, -32.2);
    this.riverWorldGroup.add(mistPool);

    // North Mountain Trees (24 trees along mountain slopes)
    for (let i = 0; i < 24; i++) {
      const px = (i - 12) * 5.6 + (Math.random() - 0.5) * 2.0;
      const tree = this.createParkTree(i % 3);
      tree.position.set(px, 7.5 + (Math.random() - 0.5) * 1.5, -30 + (Math.random() - 0.5) * 3);
      this.riverWorldGroup.add(tree);
    }

    // West & East Valley Ridge Bluffs
    const sideRidgeMat = new THREE.MeshStandardMaterial({ color: '#445741', roughness: 0.95 });
    const westRidge = new THREE.Mesh(new THREE.BoxGeometry(24, 12, 70), sideRidgeMat);
    westRidge.position.set(-52, 4.0, -5);
    const eastRidge = new THREE.Mesh(new THREE.BoxGeometry(24, 12, 70), sideRidgeMat);
    eastRidge.position.set(52, 4.0, -5);
    this.riverWorldGroup.add(westRidge, eastRidge);

    // Trees on West and East Ridges
    for (let i = 0; i < 8; i++) {
      const zPos = -25 + i * 8.0 + (Math.random() - 0.5) * 2;
      const treeW = this.createParkTree(i % 3);
      treeW.position.set(-42 + (Math.random() - 0.5) * 3, 5.0, zPos);
      const treeE = this.createParkTree((i + 1) % 3);
      treeE.position.set(42 + (Math.random() - 0.5) * 3, 5.0, zPos);
      this.riverWorldGroup.add(treeW, treeE);
    }

    // South Boundary Trees (Behind Exit Portal, z = 21 to 26)
    for (let i = 0; i < 14; i++) {
      const px = (i - 7) * 4.5 + (Math.random() - 0.5) * 1.2;
      const tree = this.createParkTree(i % 3);
      tree.position.set(px, 0.0, 22.0 + (Math.random() - 0.5) * 2.5);
      this.riverWorldGroup.add(tree);
    }

    // 8. Shore Exit Portal back to City (at Z = 13.5)
    const exitArch = this.createRiverExitPortal();
    exitArch.position.set(0, 0, 13.5);
    this.riverWorldGroup.add(exitArch);

    // 9. Swimming 3D Fish Instances
    this.setupRiverFish();

    // 10. Fishing Rod, Bobber, and Line
    this.setupFishingGear();
  }

  private buildStadiumMap() {
    this.stadiumLamps = [];

    // 1. Lush Green Diorama Base Ground
    // Generous warm lawn matching Netizen City green diorama palette (#76B055 / #7DB85C)
    const groundGeom = new THREE.BoxGeometry(92, 1.2, 128);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#76B055',
      roughness: 0.88,
    });
    const ground = new THREE.Mesh(groundGeom, groundMat);
    ground.position.set(0, -0.6, 16);
    this.stadiumWorldGroup.add(ground);

    // Warm stone curb wrapping the diorama perimeter
    const curbMat = new THREE.MeshStandardMaterial({ color: '#D8CEBE', roughness: 0.8 });
    const curb = new THREE.Mesh(new THREE.BoxGeometry(93.6, 0.45, 129.6), curbMat);
    curb.position.set(0, -0.9, 16);
    this.stadiumWorldGroup.add(curb);

    // 2. The Iconic Oval Sports Complex from Day 7 (makeSports)
    // Centered at (0, 0, 0): includes oval running track, rainbow pastel stands,
    // green striped football pitch, cream rim, billboard "STADION NETIZEN CITY",
    // 4 floodlight towers, GOR with lavender roof, and outdoor basketball court!
    this.separateSports = makeSports({ x: 0, z: 0 });
    this.stadiumWorldGroup.add(this.separateSports.root);
    this.separateSports.build(1);

    // 3. Paved Plaza and Pathways
    // Connecting the stadium south exit, GOR hall, basketball court, and entrance portal
    const pathMat = new THREE.MeshStandardMaterial({ color: '#EFE9D8', roughness: 0.85 });
    // Central connecting plaza between stadium, GOR, and court
    const plaza = new THREE.Mesh(new THREE.BoxGeometry(36, 0.05, 32), pathMat);
    plaza.position.set(2, 0.02, 34);
    this.stadiumWorldGroup.add(plaza);

    // South entrance access road / walkway
    const accessRoad = new THREE.Mesh(new THREE.BoxGeometry(10, 0.05, 18), pathMat);
    accessRoad.position.set(2, 0.02, 49);
    this.stadiumWorldGroup.add(accessRoad);

    // 4. Perimeter Low-Poly Trees and Benches
    const treeTrunkMat = new THREE.MeshStandardMaterial({ color: '#78634B', roughness: 0.9 });
    const treeFoliageColors = ['#4F7F4B', '#5E935A', '#6DA768', '#42703E'];
    const createTree = (tx: number, tz: number, scale = 1.0) => {
      const tree = new THREE.Group();
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25 * scale, 0.35 * scale, 1.8 * scale, 6),
        treeTrunkMat
      );
      trunk.position.y = 0.9 * scale;
      tree.add(trunk);

      const fCol = treeFoliageColors[Math.floor(Math.abs(tx * 3 + tz * 7)) % treeFoliageColors.length];
      const foliageMat = new THREE.MeshStandardMaterial({ color: fCol, roughness: 0.85, flatShading: true });
      for (let t = 0; t < 3; t++) {
        const cone = new THREE.Mesh(
          new THREE.ConeGeometry((1.8 - t * 0.35) * scale, 1.6 * scale, 7),
          foliageMat
        );
        cone.position.y = (1.8 + t * 0.9) * scale;
        tree.add(cone);
      }
      tree.position.set(tx, 0, tz);
      this.stadiumWorldGroup.add(tree);
    };

    // Tree border along west, east, and north perimeter
    [-38, -32, -26, 26, 32, 38].forEach((tx) => {
      createTree(tx, -30 + (Math.abs(tx) % 5));
      createTree(tx, -10 + (Math.abs(tx) % 4));
      createTree(tx, 14 + (Math.abs(tx) % 6));
      createTree(tx, 38 + (Math.abs(tx) % 3));
    });
    for (let tz = -34; tz <= -26; tz += 6) {
      createTree(-14, tz);
      createTree(0, tz - 4);
      createTree(14, tz);
    }

    // Cozy wooden benches in the plaza
    const benchWoodMat = new THREE.MeshStandardMaterial({ color: '#B4865C', roughness: 0.8 });
    const benchIronMat = new THREE.MeshStandardMaterial({ color: '#4A4650', roughness: 0.6 });
    const createBench = (bx: number, bz: number, rotY = 0) => {
      const bench = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.1, 0.6), benchWoodMat);
      seat.position.y = 0.45;
      const back = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.45, 0.08), benchWoodMat);
      back.position.set(0, 0.75, -0.26);
      for (const lx of [-0.85, 0.85]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.55), benchIronMat);
        leg.position.set(lx, 0.22, 0);
        bench.add(leg);
      }
      bench.add(seat, back);
      bench.position.set(bx, 0, bz);
      bench.rotation.y = rotY;
      this.stadiumWorldGroup.add(bench);
    };
    createBench(-12, 28, Math.PI / 2);
    createBench(16, 28, -Math.PI / 2);
    createBench(-12, 40, Math.PI / 2);

    // 5. Realistic Modern 3D Soccer Goals (North Shootout Goal & South Stadium Goal)
    // Professional white enamel posts with rounded corner joints, back depth frame, and woven net panels
    const northGoal = this.createRealisticSoccerGoal(-12.3, true);
    this.stadiumWorldGroup.add(northGoal);

    const southGoal = this.createRealisticSoccerGoal(12.3, false);
    this.stadiumWorldGroup.add(southGoal);

    // 6. 3D Soccer Ball at Penalty Spot (Z = -4.5) with Classic Black/White Pentagon Pattern
    const ballCanvas = document.createElement('canvas');
    ballCanvas.width = 256;
    ballCanvas.height = 128;
    const ballCtx = ballCanvas.getContext('2d');
    if (ballCtx) {
      ballCtx.fillStyle = '#FFFFFF';
      ballCtx.fillRect(0, 0, 256, 128);
      ballCtx.fillStyle = '#111827';
      const spots = [
        [40, 40], [100, 30], [170, 45], [230, 35],
        [30, 95], [90, 85], [150, 95], [210, 90],
      ];
      spots.forEach(([sx, sy]) => {
        ballCtx.beginPath();
        for (let a = 0; a < 5; a++) {
          const ang = (a * Math.PI * 2) / 5 - Math.PI / 2;
          const px = sx + Math.cos(ang) * 14;
          const py = sy + Math.sin(ang) * 14;
          if (a === 0) ballCtx.moveTo(px, py);
          else ballCtx.lineTo(px, py);
        }
        ballCtx.closePath();
        ballCtx.fill();
      });
    }
    const ballTex = new THREE.CanvasTexture(ballCanvas);
    const ballMat = new THREE.MeshStandardMaterial({ map: ballTex, roughness: 0.35 });
    this.soccerBall = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), ballMat);
    this.soccerBall.position.set(0, 0.2, -4.5);
    this.soccerBall.castShadow = true;
    this.stadiumWorldGroup.add(this.soccerBall);

    // Ball drop shadow
    const shadowMat = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.35 });
    const ballShadow = new THREE.Mesh(new THREE.CircleGeometry(0.22, 16).rotateX(-Math.PI / 2), shadowMat);
    ballShadow.position.set(0, 0.09, -4.5);
    this.stadiumWorldGroup.add(ballShadow);

    // 7. Realistic 3D Goalkeeper Athlete NPC at North Goal Line (Z = -11.9)
    this.goalkeeper = this.createRealisticGoalkeeper();
    this.stadiumWorldGroup.add(this.goalkeeper);

    // 8. Freekick Defender Wall (4 players in team jerseys standing shoulder-to-shoulder at Z = -7.5)
    this.stadiumDefenders = [];
    const defenderWall = this.createDefenderWall();
    this.stadiumWorldGroup.add(defenderWall);

    // 9. Moving Stadium Spectators across Oval Stands (Penonton Bergerak-gerak & Ombak Suporter)
    this.buildStadiumCrowd();

    // 10. Corner Flags at the 4 Pitch Corners
    this.createCornerFlags();

    // 11. Large Electronic LED Stadium Scoreboard on North Stands
    const scoreboardGroup = this.createStadiumScoreboard3D();
    this.stadiumWorldGroup.add(scoreboardGroup);

    // 9. South Entrance Archway / Portal to City (Z = 54)
    const archPortal = new THREE.Group();
    const archMat = new THREE.MeshStandardMaterial({ color: '#D4C4AA', roughness: 0.8 });
    const post1 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 4.0, 0.7), archMat);
    post1.position.set(-3.2, 2.0, 54);
    const post2 = new THREE.Mesh(new THREE.BoxGeometry(0.7, 4.0, 0.7), archMat);
    post2.position.set(3.2, 2.0, 54);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.7, 0.7), archMat);
    beam.position.set(0, 4.0, 54);

    // Canvas banner "← KEMBALI KE KOTA UTAMA"
    const bannerCanvas = document.createElement('canvas');
    bannerCanvas.width = 512;
    bannerCanvas.height = 128;
    const bCtx = bannerCanvas.getContext('2d');
    if (bCtx) {
      bCtx.fillStyle = '#267385';
      bCtx.fillRect(0, 0, 512, 128);
      bCtx.strokeStyle = '#FFFFFF';
      bCtx.lineWidth = 6;
      bCtx.strokeRect(6, 6, 500, 116);
      bCtx.fillStyle = '#FFFFFF';
      bCtx.font = 'bold 36px "Lilita One", sans-serif';
      bCtx.textAlign = 'center';
      bCtx.textBaseline = 'middle';
      bCtx.fillText('← KEMBALI KE KOTA UTAMA', 256, 64);
    }
    const bannerTex = new THREE.CanvasTexture(bannerCanvas);
    const bannerMat = new THREE.MeshBasicMaterial({ map: bannerTex });
    const bannerMesh = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 1.4), bannerMat);
    bannerMesh.position.set(0, 2.8, 53.9);
    bannerMesh.rotation.y = Math.PI;

    archPortal.add(post1, post2, beam, bannerMesh);
    this.stadiumWorldGroup.add(archPortal);

    // 10. Floodlight Lighting for Stadium Map
    // Four high floodlights angled directly into the oval pitch
    const flCoords = [
      { x: -(12.6 + 7), z: -(17.6 + 5) },
      { x: (12.6 + 7), z: -(17.6 + 5) },
      { x: -(12.6 + 7), z: (17.6 + 5) },
      { x: (12.6 + 7), z: (17.6 + 5) },
    ];
    flCoords.forEach((pos) => {
      const light = new THREE.SpotLight('#FFF8E7', 1.6, 60, Math.PI / 3.5, 0.5, 1.2);
      light.position.set(pos.x, 14, pos.z);
      light.target.position.set(0, 0, pos.z > 0 ? 5 : -5);
      this.stadiumWorldGroup.add(light.target);
      this.stadiumWorldGroup.add(light);
      this.stadiumLamps.push({ root: new THREE.Group(), light });
    });
  }

  private createRealisticSoccerGoal(zPos: number, isNorth: boolean): THREE.Group {
    const goalGroup = new THREE.Group();
    const postRadius = 0.065;
    const goalWidth = 4.8;
    const goalHeight = 2.15;
    const goalDepth = 1.6;
    const postMat = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      metalness: 0.15,
      roughness: 0.25,
    });

    // 1. Procedural woven square soccer net texture on canvas
    const netCanvas = document.createElement('canvas');
    netCanvas.width = 128;
    netCanvas.height = 128;
    const nCtx = netCanvas.getContext('2d');
    if (nCtx) {
      nCtx.fillStyle = 'rgba(255, 255, 255, 0)';
      nCtx.fillRect(0, 0, 128, 128);
      nCtx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
      nCtx.lineWidth = 3.5;
      nCtx.strokeRect(1, 1, 126, 126);
      nCtx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      nCtx.fillRect(0, 0, 5, 5);
      nCtx.fillRect(123, 0, 5, 5);
      nCtx.fillRect(0, 123, 5, 5);
      nCtx.fillRect(123, 123, 5, 5);
    }
    const netTexture = new THREE.CanvasTexture(netCanvas);
    netTexture.wrapS = THREE.RepeatWrapping;
    netTexture.wrapT = THREE.RepeatWrapping;

    const netMat = new THREE.MeshStandardMaterial({
      map: netTexture,
      transparent: true,
      opacity: 0.88,
      roughness: 0.65,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    // 2. White Goal Line on pitch grass
    const lineGeom = new THREE.PlaneGeometry(goalWidth, 0.12).rotateX(-Math.PI / 2);
    const lineMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.9 });
    const goalLine = new THREE.Mesh(lineGeom, lineMat);
    goalLine.position.set(0, 0.082, zPos);
    goalGroup.add(goalLine);

    // 3. Vertical Posts & Crossbar
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, goalHeight, 14), postMat);
    postL.position.set(-goalWidth / 2, goalHeight / 2 + 0.08, zPos);
    postL.castShadow = true;

    const postR = new THREE.Mesh(new THREE.CylinderGeometry(postRadius, postRadius, goalHeight, 14), postMat);
    postR.position.set(goalWidth / 2, goalHeight / 2 + 0.08, zPos);
    postR.castShadow = true;

    const crossbar = new THREE.Mesh(
      new THREE.CylinderGeometry(postRadius, postRadius, goalWidth + postRadius * 2, 14).rotateZ(Math.PI / 2),
      postMat
    );
    crossbar.position.set(0, goalHeight + 0.08, zPos);
    crossbar.castShadow = true;

    // Rounded elbow joints at front corners
    const elbowL = new THREE.Mesh(new THREE.SphereGeometry(postRadius * 1.05, 12, 12), postMat);
    elbowL.position.set(-goalWidth / 2, goalHeight + 0.08, zPos);
    const elbowR = new THREE.Mesh(new THREE.SphereGeometry(postRadius * 1.05, 12, 12), postMat);
    elbowR.position.set(goalWidth / 2, goalHeight + 0.08, zPos);

    goalGroup.add(postL, postR, crossbar, elbowL, elbowR);

    // 4. Rear Depth Frame
    const zDir = isNorth ? -1 : 1;
    const rearZ = zPos + zDir * goalDepth;

    // Top depth horizontal bars
    const topDepthL = new THREE.Mesh(
      new THREE.CylinderGeometry(postRadius * 0.85, postRadius * 0.85, goalDepth, 10).rotateX(Math.PI / 2),
      postMat
    );
    topDepthL.position.set(-goalWidth / 2, goalHeight + 0.08, zPos + (zDir * goalDepth) / 2);

    const topDepthR = new THREE.Mesh(
      new THREE.CylinderGeometry(postRadius * 0.85, postRadius * 0.85, goalDepth, 10).rotateX(Math.PI / 2),
      postMat
    );
    topDepthR.position.set(goalWidth / 2, goalHeight + 0.08, zPos + (zDir * goalDepth) / 2);

    // Top rear horizontal bar
    const topRearBar = new THREE.Mesh(
      new THREE.CylinderGeometry(postRadius * 0.85, postRadius * 0.85, goalWidth, 10).rotateZ(Math.PI / 2),
      postMat
    );
    topRearBar.position.set(0, goalHeight + 0.08, rearZ);

    // Rear drop vertical posts
    const rearDropL = new THREE.Mesh(
      new THREE.CylinderGeometry(postRadius * 0.8, postRadius * 0.8, goalHeight, 10),
      postMat
    );
    rearDropL.position.set(-goalWidth / 2, goalHeight / 2 + 0.08, rearZ);

    const rearDropR = new THREE.Mesh(
      new THREE.CylinderGeometry(postRadius * 0.8, postRadius * 0.8, goalHeight, 10),
      postMat
    );
    rearDropR.position.set(goalWidth / 2, goalHeight / 2 + 0.08, rearZ);

    // Base ground side bars and rear ground bar
    const baseSideL = new THREE.Mesh(
      new THREE.CylinderGeometry(postRadius * 0.8, postRadius * 0.8, goalDepth, 8).rotateX(Math.PI / 2),
      postMat
    );
    baseSideL.position.set(-goalWidth / 2, 0.08 + postRadius, zPos + (zDir * goalDepth) / 2);

    const baseSideR = new THREE.Mesh(
      new THREE.CylinderGeometry(postRadius * 0.8, postRadius * 0.8, goalDepth, 8).rotateX(Math.PI / 2),
      postMat
    );
    baseSideR.position.set(goalWidth / 2, 0.08 + postRadius, zPos + (zDir * goalDepth) / 2);

    const baseRear = new THREE.Mesh(
      new THREE.CylinderGeometry(postRadius * 0.8, postRadius * 0.8, goalWidth, 8).rotateZ(Math.PI / 2),
      postMat
    );
    baseRear.position.set(0, 0.08 + postRadius, rearZ);

    goalGroup.add(topDepthL, topDepthR, topRearBar, rearDropL, rearDropR, baseSideL, baseSideR, baseRear);

    // 5. Four Woven Net Panels (Back, Top, Left Side, Right Side)
    const backMat = netMat.clone();
    if (backMat.map) {
      backMat.map = netTexture.clone();
      backMat.map.repeat.set(22, 10);
      backMat.map.needsUpdate = true;
    }
    const backNet = new THREE.Mesh(new THREE.PlaneGeometry(goalWidth, goalHeight), backMat);
    backNet.position.set(0, goalHeight / 2 + 0.08, rearZ);
    if (!isNorth) backNet.rotation.y = Math.PI;

    const topMat = netMat.clone();
    if (topMat.map) {
      topMat.map = netTexture.clone();
      topMat.map.repeat.set(22, 8);
      topMat.map.needsUpdate = true;
    }
    const topNet = new THREE.Mesh(new THREE.PlaneGeometry(goalWidth, goalDepth).rotateX(-Math.PI / 2), topMat);
    topNet.position.set(0, goalHeight + 0.08, zPos + (zDir * goalDepth) / 2);

    const sideLMat = netMat.clone();
    if (sideLMat.map) {
      sideLMat.map = netTexture.clone();
      sideLMat.map.repeat.set(8, 10);
      sideLMat.map.needsUpdate = true;
    }
    const leftNet = new THREE.Mesh(new THREE.PlaneGeometry(goalDepth, goalHeight).rotateY(Math.PI / 2), sideLMat);
    leftNet.position.set(-goalWidth / 2, goalHeight / 2 + 0.08, zPos + (zDir * goalDepth) / 2);

    const sideRMat = netMat.clone();
    if (sideRMat.map) {
      sideRMat.map = netTexture.clone();
      sideRMat.map.repeat.set(8, 10);
      sideRMat.map.needsUpdate = true;
    }
    const rightNet = new THREE.Mesh(new THREE.PlaneGeometry(goalDepth, goalHeight).rotateY(-Math.PI / 2), sideRMat);
    rightNet.position.set(goalWidth / 2, goalHeight / 2 + 0.08, zPos + (zDir * goalDepth) / 2);

    goalGroup.add(backNet, topNet, leftNet, rightNet);

    return goalGroup;
  }

  private createRealisticGoalkeeper(): THREE.Group {
    const keeper = new THREE.Group();

    const cyanJerseyMat = new THREE.MeshStandardMaterial({ color: '#00E5FF', roughness: 0.5 });
    const navyMat = new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.7 });
    const skinMat = new THREE.MeshStandardMaterial({ color: '#F6D8B8', roughness: 0.6 });
    const gloveMat = new THREE.MeshStandardMaterial({ color: '#FF3D00', roughness: 0.35, metalness: 0.1 });
    const glovePalmMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.4 });
    const hairMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.8 });
    const cleatMat = new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.4 });

    // Torso: Athletic goalie jersey with number "1"
    const jerseyCanvas = document.createElement('canvas');
    jerseyCanvas.width = 128;
    jerseyCanvas.height = 128;
    const jCtx = jerseyCanvas.getContext('2d');
    if (jCtx) {
      jCtx.fillStyle = '#00E5FF';
      jCtx.fillRect(0, 0, 128, 128);
      jCtx.fillStyle = '#0F172A';
      jCtx.fillRect(0, 0, 128, 20); // collar
      jCtx.fillRect(0, 0, 16, 128); // side stripes
      jCtx.fillRect(112, 0, 16, 128);
      // Number 1 on back
      jCtx.fillStyle = '#FFFFFF';
      jCtx.font = 'bold 64px "Lilita One", sans-serif';
      jCtx.textAlign = 'center';
      jCtx.textBaseline = 'middle';
      jCtx.fillText('1', 64, 74);
    }
    const jerseyTex = new THREE.CanvasTexture(jerseyCanvas);
    const keeperJerseyMat = new THREE.MeshStandardMaterial({ map: jerseyTex, roughness: 0.5 });

    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.62, 0.28), [
      cyanJerseyMat,
      cyanJerseyMat,
      cyanJerseyMat,
      cyanJerseyMat,
      cyanJerseyMat,
      keeperJerseyMat, // back has number 1
    ]);
    torso.position.y = 0.98;
    torso.castShadow = true;

    // Head
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 12), skinMat);
    head.position.y = 1.48;
    head.castShadow = true;

    // Athletic dark swept hair
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.21, 10, 10), hairMat);
    hair.position.set(0, 1.54, -0.04);
    hair.scale.set(1.02, 0.75, 1.05);

    // Headband
    const headband = new THREE.Mesh(
      new THREE.CylinderGeometry(0.21, 0.21, 0.05, 12).rotateX(Math.PI / 2),
      navyMat
    );
    headband.position.set(0, 1.51, 0.02);

    // Eyes
    const eyeMat = new THREE.MeshBasicMaterial({ color: '#0F172A' });
    const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), eyeMat);
    eyeL.position.set(-0.07, 1.48, 0.18);
    const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), eyeMat);
    eyeR.position.set(0.07, 1.48, 0.18);

    // Goalkeeper Shorts
    const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.32, 0.3), navyMat);
    shorts.position.y = 0.58;

    // Legs & Cleats
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.45, 0.16), skinMat);
    legL.position.set(-0.16, 0.26, 0);
    const sockL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.18), cyanJerseyMat);
    sockL.position.set(-0.16, 0.15, 0);
    const cleatL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.26), cleatMat);
    cleatL.position.set(-0.16, 0.05, 0.04);

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.45, 0.16), skinMat);
    legR.position.set(0.16, 0.26, 0);
    const sockR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.24, 0.18), cyanJerseyMat);
    sockR.position.set(0.16, 0.15, 0);
    const cleatR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.1, 0.26), cleatMat);
    cleatR.position.set(0.16, 0.05, 0.04);

    // Arms in athletic ready stance (bent forward ready to catch)
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.42, 0.14), cyanJerseyMat);
    armL.position.set(-0.35, 0.95, 0.06);
    armL.rotation.set(0.3, 0, 0.35);

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.42, 0.14), cyanJerseyMat);
    armR.position.set(0.35, 0.95, 0.06);
    armR.rotation.set(0.3, 0, -0.35);

    // Padded Goalkeeper Gloves (Large, stylized orange volt gloves with grip)
    const gloveL = new THREE.Group();
    const gBackL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.12), gloveMat);
    const gPalmL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.04), glovePalmMat);
    gPalmL.position.z = 0.06;
    gloveL.add(gBackL, gPalmL);
    gloveL.position.set(-0.46, 0.78, 0.22);
    gloveL.rotation.set(-0.2, 0.3, 0.4);

    const gloveR = new THREE.Group();
    const gBackR = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.12), gloveMat);
    const gPalmR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.04), glovePalmMat);
    gPalmR.position.z = 0.06;
    gloveR.add(gBackR, gPalmR);
    gloveR.position.set(0.46, 0.78, 0.22);
    gloveR.rotation.set(-0.2, -0.3, -0.4);

    this.keeperArmL = armL;
    this.keeperArmR = armR;
    this.keeperGloveL = gloveL;
    this.keeperGloveR = gloveR;

    keeper.add(
      torso,
      head,
      hair,
      headband,
      eyeL,
      eyeR,
      shorts,
      legL,
      sockL,
      cleatL,
      legR,
      sockR,
      cleatR,
      armL,
      armR,
      gloveL,
      gloveR
    );
    keeper.position.set(0, 0.08, -11.9);
    return keeper;
  }

  private createDefenderWall(): THREE.Group {
    const wallGroup = new THREE.Group();
    const hairColors = ['#1E293B', '#3E2723', '#78350F', '#0F172A'];
    const skinTones = ['#F6D8B8', '#ECC49E', '#DFB085', '#F8DEC4'];
    const jerseyMat = new THREE.MeshStandardMaterial({ color: '#DC2626', roughness: 0.6 });
    const shortsMat = new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.6 });
    const socksMat = new THREE.MeshStandardMaterial({ color: '#DC2626', roughness: 0.6 });
    const cleatsMat = new THREE.MeshStandardMaterial({ color: '#1E293B', roughness: 0.4 });
    const numbers = ['3', '4', '5', '6'];

    const wallXCoords = [-0.88, -0.29, 0.29, 0.88];
    wallXCoords.forEach((wx, idx) => {
      const defender = new THREE.Group();
      const skinMat = new THREE.MeshStandardMaterial({
        color: skinTones[idx % skinTones.length],
        roughness: 0.65,
      });
      const hairMat = new THREE.MeshStandardMaterial({
        color: hairColors[idx % hairColors.length],
        roughness: 0.8,
      });

      // Jersey with player squad number on back
      const numCanvas = document.createElement('canvas');
      numCanvas.width = 128;
      numCanvas.height = 128;
      const nCtx = numCanvas.getContext('2d');
      if (nCtx) {
        nCtx.fillStyle = '#DC2626';
        nCtx.fillRect(0, 0, 128, 128);
        nCtx.fillStyle = '#FFFFFF';
        nCtx.font = 'bold 64px "Lilita One", sans-serif';
        nCtx.textAlign = 'center';
        nCtx.textBaseline = 'middle';
        nCtx.fillText(numbers[idx], 64, 70);
      }
      const numTex = new THREE.CanvasTexture(numCanvas);
      const backMat = new THREE.MeshStandardMaterial({ map: numTex, roughness: 0.6 });

      const torso = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.6, 0.26), [
        jerseyMat,
        jerseyMat,
        jerseyMat,
        jerseyMat,
        jerseyMat,
        backMat,
      ]);
      torso.position.y = 0.95;
      torso.castShadow = true;

      // Head
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 10, 10), skinMat);
      head.position.y = 1.42;

      // Hair
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.19, 8, 8), hairMat);
      hair.position.set(0, 1.47, -0.03);
      hair.scale.set(1.02, 0.8, 1.05);

      // Shorts
      const shorts = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.3, 0.28), shortsMat);
      shorts.position.y = 0.54;

      // Legs & Boots
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.4, 0.15), skinMat);
      legL.position.set(-0.13, 0.24, 0);
      const sockL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.16), socksMat);
      sockL.position.set(-0.13, 0.14, 0);
      const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.24), cleatsMat);
      bootL.position.set(-0.13, 0.04, 0.03);

      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.4, 0.15), skinMat);
      legR.position.set(0.13, 0.24, 0);
      const sockR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.16), socksMat);
      sockR.position.set(0.13, 0.14, 0);
      const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 0.24), cleatsMat);
      bootR.position.set(0.13, 0.04, 0.03);

      // Arms crossed across chest/waist (standard free-kick wall posture)
      const armL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.38, 0.12), jerseyMat);
      armL.position.set(-0.16, 0.82, 0.16);
      armL.rotation.set(0.8, 0, -0.9);

      const armR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.38, 0.12), jerseyMat);
      armR.position.set(0.16, 0.82, 0.16);
      armR.rotation.set(0.8, 0, 0.9);

      defender.add(torso, head, hair, shorts, legL, sockL, bootL, legR, sockR, bootR, armL, armR);
      defender.position.set(wx, 0.08, -7.5);

      this.stadiumDefenders.push(defender);
      wallGroup.add(defender);
    });

    return wallGroup;
  }

  private buildStadiumCrowd(): void {
    this.stadiumCrowd = [];

    // Supporter shirt colors (vibrant stadium crowd)
    const shirtColors = [
      '#0284C7', // Ocean blue
      '#EF4444', // Red
      '#F59E0B', // Amber gold
      '#10B981', // Emerald green
      '#8B5CF6', // Purple
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#F97316', // Orange
      '#FFFFFF', // White
    ];
    const skinColors = ['#F6D8B8', '#ECC49E', '#DFB085', '#F8DEC4'];
    const hairColors = ['#1E293B', '#3E2723', '#78350F', '#0F172A', '#D97706'];

    // Flag pole & cloth materials
    const poleMat = new THREE.MeshStandardMaterial({ color: '#E2E8F0', roughness: 0.3 });
    const flagBlueMat = new THREE.MeshStandardMaterial({ color: '#0284C7', roughness: 0.5, side: THREE.DoubleSide });
    const flagRedMat = new THREE.MeshStandardMaterial({ color: '#EF4444', roughness: 0.5, side: THREE.DoubleSide });
    const flagYellowMat = new THREE.MeshStandardMaterial({ color: '#F59E0B', roughness: 0.5, side: THREE.DoubleSide });
    const flagMats = [flagBlueMat, flagRedMat, flagYellowMat];

    // Shared spectator geometry
    const torsoGeom = new THREE.BoxGeometry(0.36, 0.42, 0.22);
    const headGeom = new THREE.SphereGeometry(0.14, 8, 8);
    const hairGeom = new THREE.SphereGeometry(0.15, 8, 8);
    const armGeom = new THREE.BoxGeometry(0.1, 0.32, 0.1);
    const sittingLegsGeom = new THREE.BoxGeometry(0.34, 0.2, 0.28);
    const flagGeom = new THREE.PlaneGeometry(0.55, 0.35);

    // 5 tiers (k = 0 to 4)
    for (let k = 0; k < 5; k++) {
      // 1. North stands behind goal (primary camera view - heavy concentration)
      const northCount = 14 + k * 2;
      for (let i = 0; i < northCount; i++) {
        const th = -2.9 + (i / (northCount - 1)) * 2.66;
        this.createSingleSpectator(
          k,
          th,
          shirtColors,
          skinColors,
          hairColors,
          torsoGeom,
          headGeom,
          hairGeom,
          armGeom,
          sittingLegsGeom,
          poleMat,
          flagMats,
          flagGeom,
          (k * 15 + i) % 4 === 0
        );
      }

      // 2. West stands (side view)
      const westCount = 5 + k;
      for (let i = 0; i < westCount; i++) {
        const th = 0.2 + (i / (westCount - 1)) * 1.15;
        this.createSingleSpectator(
          k,
          th,
          shirtColors,
          skinColors,
          hairColors,
          torsoGeom,
          headGeom,
          hairGeom,
          armGeom,
          sittingLegsGeom,
          poleMat,
          flagMats,
          flagGeom,
          (k * 15 + i) % 5 === 0
        );
      }

      // 3. East stands (side view)
      const eastCount = 5 + k;
      for (let i = 0; i < eastCount; i++) {
        const th = 1.85 + (i / (eastCount - 1)) * 1.15;
        this.createSingleSpectator(
          k,
          th,
          shirtColors,
          skinColors,
          hairColors,
          torsoGeom,
          headGeom,
          hairGeom,
          armGeom,
          sittingLegsGeom,
          poleMat,
          flagMats,
          flagGeom,
          (k * 15 + i) % 5 === 0
        );
      }
    }
  }

  private createSingleSpectator(
    k: number,
    th: number,
    shirtColors: string[],
    skinColors: string[],
    hairColors: string[],
    torsoGeom: THREE.BufferGeometry,
    headGeom: THREE.BufferGeometry,
    hairGeom: THREE.BufferGeometry,
    armGeom: THREE.BufferGeometry,
    sittingLegsGeom: THREE.BufferGeometry,
    poleMat: THREE.Material,
    flagMats: THREE.Material[],
    flagGeom: THREE.BufferGeometry,
    hasFlag: boolean
  ) {
    const pos = seatAt(k, th, 0, 0);
    const specGroup = new THREE.Group();

    const shirtMat = new THREE.MeshStandardMaterial({
      color: shirtColors[Math.floor(Math.random() * shirtColors.length)],
      roughness: 0.7,
    });
    const skinMat = new THREE.MeshStandardMaterial({
      color: skinColors[Math.floor(Math.random() * skinColors.length)],
      roughness: 0.65,
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: hairColors[Math.floor(Math.random() * hairColors.length)],
      roughness: 0.8,
    });
    const pantsMat = new THREE.MeshStandardMaterial({
      color: Math.random() > 0.5 ? '#1E293B' : '#334155',
      roughness: 0.8,
    });

    // Sitting legs on bench
    const legs = new THREE.Mesh(sittingLegsGeom, pantsMat);
    legs.position.y = 0.1;
    specGroup.add(legs);

    // Torso
    const torso = new THREE.Mesh(torsoGeom, shirtMat);
    torso.position.y = 0.38;
    specGroup.add(torso);

    // Head
    const head = new THREE.Mesh(headGeom, skinMat);
    head.position.y = 0.66;
    specGroup.add(head);

    // Hair or Supporter Cap
    const hair = new THREE.Mesh(hairGeom, hairMat);
    hair.position.set(0, 0.7, -0.02);
    hair.scale.set(1.02, 0.7, 1.05);
    specGroup.add(hair);

    // Left Arm (with shoulder pivot)
    const armL = new THREE.Mesh(armGeom, shirtMat);
    armL.position.set(-0.24, 0.36, 0.05);
    armL.rotation.set(-0.2, 0, 0.2);
    specGroup.add(armL);

    // Right Arm
    const armR = new THREE.Mesh(armGeom, shirtMat);
    armR.position.set(0.24, 0.36, 0.05);
    armR.rotation.set(-0.2, 0, -0.2);
    specGroup.add(armR);

    // Supporter Flag
    let flagMesh: THREE.Mesh | undefined;
    if (hasFlag) {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.9, 6), poleMat);
      pole.position.set(0.28, 0.5, 0.15);
      pole.rotation.set(-0.3, 0, -0.2);

      const fMat = flagMats[Math.floor(Math.random() * flagMats.length)];
      flagMesh = new THREE.Mesh(flagGeom, fMat);
      flagMesh.position.set(0.28 + 0.28, 0.75, 0.15);
      flagMesh.rotation.set(-0.3, 0, 0);

      specGroup.add(pole, flagMesh);
    }

    // Orient spectator to face the center of the pitch
    const lookAngle = Math.atan2(-pos.x, -pos.z);
    specGroup.rotation.y = lookAngle;

    specGroup.position.set(pos.x, pos.y, pos.z);
    this.stadiumWorldGroup.add(specGroup);

    this.stadiumCrowd.push({
      root: specGroup,
      body: torso,
      armL,
      armR,
      flag: flagMesh,
      baseY: pos.y,
      phase: Math.random() * Math.PI * 2,
      speed: 2.2 + Math.random() * 0.8,
      waveAngle: th,
      jumpHeight: 0.32 + Math.random() * 0.1,
    });
  }

  private createCornerFlags(): void {
    this.stadiumCornerFlags = [];
    const corners = [
      { x: -8.0, z: -12.5 },
      { x: 8.0, z: -12.5 },
      { x: -8.0, z: 12.5 },
      { x: 8.0, z: 12.5 },
    ];

    const poleMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 });
    const arcMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.9 });

    // Checkerboard flag texture
    const flagCanvas = document.createElement('canvas');
    flagCanvas.width = 64;
    flagCanvas.height = 64;
    const fCtx = flagCanvas.getContext('2d');
    if (fCtx) {
      fCtx.fillStyle = '#EF4444'; // Red
      fCtx.fillRect(0, 0, 64, 64);
      fCtx.fillStyle = '#FACC15'; // Yellow
      fCtx.fillRect(0, 0, 32, 32);
      fCtx.fillRect(32, 32, 32, 32);
    }
    const flagTex = new THREE.CanvasTexture(flagCanvas);
    const flagMat = new THREE.MeshStandardMaterial({
      map: flagTex,
      roughness: 0.5,
      side: THREE.DoubleSide,
    });

    corners.forEach((c) => {
      const cornerGroup = new THREE.Group();

      // Quarter-circle corner arc on turf
      const arc = new THREE.Mesh(
        new THREE.RingGeometry(0.7, 0.78, 16, 1, 0, Math.PI / 2).rotateX(-Math.PI / 2),
        arcMat
      );
      arc.position.set(0, 0.082, 0);
      if (c.x > 0 && c.z < 0) arc.rotation.y = Math.PI / 2;
      else if (c.x > 0 && c.z > 0) arc.rotation.y = Math.PI;
      else if (c.x < 0 && c.z > 0) arc.rotation.y = -Math.PI / 2;
      cornerGroup.add(arc);

      // Flag pole (1.5m tall flexible white tube)
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 1.5, 8), poleMat);
      pole.position.y = 0.75 + 0.08;
      cornerGroup.add(pole);

      // Checkered flag banner
      const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.3), flagMat);
      flag.position.set(0.21, 1.4 + 0.08, 0);
      cornerGroup.add(flag);
      this.stadiumCornerFlags.push(flag);

      cornerGroup.position.set(c.x, 0, c.z);
      this.stadiumWorldGroup.add(cornerGroup);
    });
  }

  public setStadiumScore3D(goals: number, shots: number) {
    this.stadiumScore = { goals, shots };
    if (!this.stadiumScoreboardCanvas || !this.stadiumScoreboardTex) return;
    const ctx = this.stadiumScoreboardCanvas.getContext('2d');
    if (!ctx) return;

    // LED Scoreboard Background
    ctx.fillStyle = '#080F1E';
    ctx.fillRect(0, 0, 512, 256);

    // Glowing Neon Border
    ctx.strokeStyle = '#38BDF8';
    ctx.lineWidth = 8;
    ctx.strokeRect(8, 8, 496, 240);

    // Header Bar
    ctx.fillStyle = '#0284C7';
    ctx.fillRect(12, 12, 488, 52);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 26px "Lilita One", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★ STADION NETIZEN CITY ★', 256, 38);

    // Goals Column (Left)
    ctx.fillStyle = '#10B981';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('GOL ⚽', 130, 100);
    ctx.font = '900 74px "Lilita One", sans-serif';
    ctx.fillText(String(goals), 130, 162);

    // Vertical Divider
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(256, 80);
    ctx.lineTo(256, 195);
    ctx.stroke();

    // Shots Column (Right)
    ctx.fillStyle = '#94A3B8';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('TEMBAKAN', 382, 100);
    ctx.fillStyle = '#F8FAFC';
    ctx.font = '900 74px "Lilita One", sans-serif';
    ctx.fillText(String(shots), 382, 162);

    // Sub-banner with Accuracy
    const acc = shots > 0 ? Math.round((goals / shots) * 100) : 0;
    ctx.fillStyle = '#F59E0B';
    ctx.font = 'bold 20px "Lilita One", sans-serif';
    ctx.fillText(`AKURASI: ${acc}%  •  HADIAH +20 KOIN / GOL`, 256, 222);

    this.stadiumScoreboardTex.needsUpdate = true;
  }

  private createStadiumScoreboard3D(): THREE.Group {
    const group = new THREE.Group();

    // 1. Dual Support Pillars mounted behind North Stands
    const pillarMat = new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.6 });
    const pillarL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 6.0, 8), pillarMat);
    pillarL.position.set(-3.2, 3.0, -23.5);
    const pillarR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.22, 6.0, 8), pillarMat);
    pillarR.position.set(3.2, 3.0, -23.5);
    group.add(pillarL, pillarR);

    // 2. Scoreboard Housing Backing
    const housingMat = new THREE.MeshStandardMaterial({ color: '#0F172A', roughness: 0.7 });
    const housing = new THREE.Mesh(new THREE.BoxGeometry(8.0, 3.4, 0.45), housingMat);
    housing.position.set(0, 6.0, -23.5);
    group.add(housing);

    // 3. LED Screen Mesh with CanvasTexture
    this.stadiumScoreboardCanvas = document.createElement('canvas');
    this.stadiumScoreboardCanvas.width = 512;
    this.stadiumScoreboardCanvas.height = 256;
    this.stadiumScoreboardTex = new THREE.CanvasTexture(this.stadiumScoreboardCanvas);

    const screenMat = new THREE.MeshBasicMaterial({ map: this.stadiumScoreboardTex });
    this.stadiumScoreboardMesh = new THREE.Mesh(new THREE.PlaneGeometry(7.6, 3.0), screenMat);
    this.stadiumScoreboardMesh.position.set(0, 6.0, -23.25);
    group.add(this.stadiumScoreboardMesh);

    // Initial render with 0 - 0 score
    this.setStadiumScore3D(0, 0);

    return group;
  }

  private buildBeachMap() {
    this.beachLamps = [];
    this.beachWaveFoams = [];
    this.beachBuoys = [];
    this.separateBeachFlag = null;
    this.separateLighthouseBeam = null;

    // 1. Underwater Seabed / Sand Bottom (Pasir Bawah Laut Samudra)
    const seabedGeom = new THREE.PlaneGeometry(80, 100, 1, 1).rotateX(-Math.PI / 2);
    const seabedMat = new THREE.MeshStandardMaterial({
      color: '#D4B376',
      roughness: 0.95,
    });
    const seabed = new THREE.Mesh(seabedGeom, seabedMat);
    seabed.position.set(-35, -2.5, 6);
    this.beachWorldGroup.add(seabed);

    // Underwater Colorful Coral Clusters & Sea Stones
    const coralColors = ['#F97316', '#EF4444', '#10B981', '#EC4899', '#8B5CF6'];
    const coralMat = (c: string) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.75 });
    for (let i = 0; i < 28; i++) {
      const cx = -6.0 - Math.random() * 45.0;
      const cz = -28.0 + Math.random() * 70.0;
      const coral = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.35 + Math.random() * 0.45, 1),
        coralMat(coralColors[i % coralColors.length])
      );
      coral.position.set(cx, -1.9, cz);
      coral.scale.set(1.2, 0.8, 1.2);
      this.beachWorldGroup.add(coral);
    }

    // 2. Translucent Tropical Turquoise Ocean Surface (Air Laut Tropis)
    const oceanGeom = new THREE.PlaneGeometry(80, 100, 1, 1).rotateX(-Math.PI / 2);
    const oceanMat = new THREE.MeshLambertMaterial({
      color: '#0284C7',
      transparent: true,
      opacity: 0.86,
      depthWrite: false,
    });
    const ocean = new THREE.Mesh(oceanGeom, oceanMat);
    ocean.position.set(-35, -0.05, 6);
    this.beachWorldGroup.add(ocean);

    // 3. Dynamic Beach Wave Foams (Ombak Garis Buih Putih Panjang Mengikuti Garis Pantai)
    for (let f = 0; f < 3; f++) {
      const foamGeom = new THREE.PlaneGeometry(0.85 + f * 0.35, 86, 1, 1).rotateX(-Math.PI / 2);
      const foamMat = new THREE.MeshBasicMaterial({
        color: '#FFFFFF',
        transparent: true,
        opacity: 0.65 - f * 0.15,
        depthWrite: false,
      });
      const foamMesh = new THREE.Mesh(foamGeom, foamMat);
      foamMesh.position.set(-0.35 - f * 0.7, 0.01 + f * 0.005, 6);
      this.beachWaveFoams.push(foamMesh);
      this.beachWorldGroup.add(foamMesh);
    }

    // 4. Wet Sand Shoreline (Tideline ribbon di tepi air pasang)
    const wetSand = new THREE.Mesh(
      new THREE.BoxGeometry(2.5, 0.35, 86),
      new THREE.MeshStandardMaterial({ color: '#D2B079', roughness: 0.95 })
    );
    wetSand.position.set(1.25, -0.15, 6);
    this.beachWorldGroup.add(wetSand);

    // 5. Fine Golden Creamy Sand Beach (Hamparan Pasir Putih Bersih)
    const sandBeach = new THREE.Mesh(
      new THREE.BoxGeometry(14.0, 1.4, 86),
      new THREE.MeshStandardMaterial({ color: '#F7E7C4', roughness: 0.98 })
    );
    sandBeach.position.set(9.5, -0.65, 6);
    this.beachWorldGroup.add(sandBeach);

    // Scattered Seashells on the Sand
    const shellMat1 = new THREE.MeshStandardMaterial({ color: '#FFF5EB', roughness: 0.6 });
    const shellMat2 = new THREE.MeshStandardMaterial({ color: '#FFE4E6', roughness: 0.6 });
    for (let i = 0; i < 40; i++) {
      const sx = 2.8 + Math.random() * 11.5;
      const sz = -22.0 + Math.random() * 55.0;
      const shell = new THREE.Mesh(
        new THREE.ConeGeometry(0.12, 0.18, 5),
        i % 2 === 0 ? shellMat1 : shellMat2
      );
      shell.rotation.set(Math.PI / 2, 0, Math.random() * Math.PI);
      shell.position.set(sx, 0.06, sz);
      this.beachWorldGroup.add(shell);
    }

    // 6. Inland Green Grassy Bank & Promenade (Kawasan Rumput Hijau Pedalaman)
    const greenBank = new THREE.Mesh(
      new THREE.BoxGeometry(10.0, 1.6, 86),
      new THREE.MeshStandardMaterial({ color: '#76B055', roughness: 0.9 })
    );
    greenBank.position.set(21.5, -0.55, 6);
    this.beachWorldGroup.add(greenBank);

    // 7. North River Channel & Arched Road Bridge (Muara Sungai Kali Netizen & Jembatan Lengkung)
    const riverChannel = new THREE.Mesh(
      new THREE.BoxGeometry(26.0, 0.4, 6.2),
      new THREE.MeshStandardMaterial({ color: '#38BDF8', roughness: 0.3 })
    );
    riverChannel.position.set(13.0, -0.04, -28.0);
    this.beachWorldGroup.add(riverChannel);

    const riverBridge = this.makeRiverBridge();
    riverBridge.position.set(9.5, 0, -28.0);
    this.beachWorldGroup.add(riverBridge);

    // 8. Pantai Netizen Beach Zone: Swimming Buoy Boundary (Pelampung Area Berenang)
    const buoyPerimeter: Array<[number, number]> = [];
    // North edge (Z = -14)
    for (let bx = -18; bx <= -2; bx += 2.2) buoyPerimeter.push([bx, -14]);
    // South edge (Z = 8)
    for (let bx = -18; bx <= -2; bx += 2.2) buoyPerimeter.push([bx, 8]);
    // West deep edge (X = -18)
    for (let bz = -12; bz < 8; bz += 2.2) buoyPerimeter.push([-18, bz]);
    // East shoreline edge (X = -2)
    for (let bz = -12; bz < 8; bz += 2.2) buoyPerimeter.push([-2, bz]);

    buoyPerimeter.forEach(([bx, bz], i) => {
      const buoy = new THREE.Group();
      const isRed = i % 2 === 0;
      const sphereMat = new THREE.MeshStandardMaterial({
        color: isRed ? '#F28C7A' : '#FFFFFF',
        roughness: 0.4,
      });
      const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.24, 8, 8), sphereMat);
      sphere.position.set(0, 0.12, 0);
      buoy.add(sphere);

      const ringMat = new THREE.MeshStandardMaterial({
        color: isRed ? '#FFFFFF' : '#F28C7A',
        roughness: 0.5,
      });
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 0.08, 8), ringMat);
      ring.position.set(0, 0.02, 0);
      buoy.add(ring);

      buoy.position.set(bx, 0.05, bz);
      this.beachBuoys.push(buoy);
      this.beachWorldGroup.add(buoy);
    });

    // 9. Two Neat Rows of Striped Beach Umbrellas & Loungers (Deretan Payung & Kursi Pantai)
    const umbrellaColors = ['#F2A88A', '#A8DCC8', '#F7D772', '#C9B8E8', '#F2B8C6', '#A9C8EC'];
    const loungerColors = ['#F7ECD6', '#A9C8EC', '#F2B8C6', '#F7D772', '#A8DCC8'];

    // Row 1 (Closer to shoreline, X = 5.2)
    const row1Z = [-13.0, -9.0, -5.0, -1.0, 3.0, 7.0, 11.0];
    row1Z.forEach((z, i) => {
      const uGroup = new THREE.Group();
      uGroup.position.set(5.2, 0, z);

      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 2.0, 6),
        new THREE.MeshStandardMaterial({ color: '#E8E2D5', roughness: 0.5 })
      );
      pole.position.set(0, 1.0, 0);
      pole.rotation.z = -0.06;
      uGroup.add(pole);

      const canopy = this.makeStripedCanopy(umbrellaColors[i % umbrellaColors.length], 1.45, 0.65);
      canopy.position.set(-0.06, 1.95, 0);
      uGroup.add(canopy);

      const lounger = this.makeSunLounger(loungerColors[i % loungerColors.length]);
      lounger.position.set(0.95, 0, 0.15);
      lounger.rotation.y = Math.PI / 2 + 0.1;
      uGroup.add(lounger);

      this.beachWorldGroup.add(uGroup);
    });

    // Row 2 (Staggered inland, X = 8.8)
    const row2Z = [-11.0, -7.0, -3.0, 1.0, 5.0, 9.0];
    row2Z.forEach((z, i) => {
      const uGroup = new THREE.Group();
      uGroup.position.set(8.8, 0, z);

      const pole = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 2.0, 6),
        new THREE.MeshStandardMaterial({ color: '#E8E2D5', roughness: 0.5 })
      );
      pole.position.set(0, 1.0, 0);
      pole.rotation.z = -0.05;
      uGroup.add(pole);

      const canopy = this.makeStripedCanopy(umbrellaColors[(i + 3) % umbrellaColors.length], 1.45, 0.65);
      canopy.position.set(-0.05, 1.95, 0);
      uGroup.add(canopy);

      const lounger = this.makeSunLounger(loungerColors[(i + 2) % loungerColors.length]);
      lounger.position.set(0.95, 0, 0.15);
      lounger.rotation.y = Math.PI / 2 + 0.1;
      uGroup.add(lounger);

      this.beachWorldGroup.add(uGroup);
    });

    // 10. Lifeguard Watchtower (Menara Penjaga Pantai Netizen - Coral & Cream)
    const lifeguardTower = this.makeLifeguardTower();
    lifeguardTower.position.set(12.0, 0, -2.0);
    lifeguardTower.rotation.y = -Math.PI / 2; // Facing West towards sea
    this.beachWorldGroup.add(lifeguardTower);

    // 11. Safety Warning Board ("HATI-HATI! BERENANG DI AREA YANG DIJAGA")
    const safetyBoard = this.makeSafetyBoard();
    safetyBoard.position.set(12.0, 0, -7.5);
    safetyBoard.rotation.y = -Math.PI / 2;
    this.beachWorldGroup.add(safetyBoard);

    // 12. Wooden Entrance Gate ("NETIZEN BEACH" Berpita Pink)
    const beachGate = this.makeBeachGate();
    beachGate.position.set(15.2, 0, -11.0);
    beachGate.rotation.y = -Math.PI / 2;
    this.beachWorldGroup.add(beachGate);

    // 13. Pelabuhan / Port Zone (Quay Concrete Apron - Dermaga Pelabuhan)
    const quay = new THREE.Mesh(
      new THREE.BoxGeometry(15.0, 0.45, 28.0),
      new THREE.MeshStandardMaterial({ color: '#E6DED0', roughness: 0.92 })
    );
    quay.position.set(8.0, 0.1, 30.0);
    quay.castShadow = true;
    quay.receiveShadow = true;
    this.beachWorldGroup.add(quay);

    const quayCurb = new THREE.Mesh(
      new THREE.BoxGeometry(0.35, 0.25, 28.0),
      new THREE.MeshStandardMaterial({ color: '#CFC6B8', roughness: 0.85 })
    );
    quayCurb.position.set(0.65, 0.4, 30.0);
    this.beachWorldGroup.add(quayCurb);

    // 14. Stacked Pastel Cargo Containers (Tumpukan Peti Kemas Pastel Pelabuhan)
    const contCols = ['#F2A88A', '#A8DCC8', '#C9B8E8', '#F7D772', '#A9C8EC', '#F2B8C6'];
    const containerLayout: Array<{ x: number; y: number; z: number; c: string }> = [
      // Block 1 (North of Pier, Z in 18..24)
      { x: 7.0, y: 0.35, z: 19.0, c: contCols[0] },
      { x: 7.0, y: 1.55, z: 19.0, c: contCols[1] },
      { x: 8.5, y: 0.35, z: 19.0, c: contCols[2] },
      { x: 10.0, y: 0.35, z: 19.0, c: contCols[3] },
      { x: 7.0, y: 0.35, z: 22.2, c: contCols[4] },
      { x: 8.5, y: 0.35, z: 22.2, c: contCols[5] },
      { x: 8.5, y: 1.55, z: 22.2, c: contCols[0] },
      { x: 10.0, y: 0.35, z: 22.2, c: contCols[1] },
      { x: 11.5, y: 0.35, z: 22.2, c: contCols[2] },
      { x: 8.5, y: 0.35, z: 24.8, c: contCols[3] },
      { x: 10.0, y: 0.35, z: 24.8, c: contCols[4] },

      // Block 2 (South of Pier, Z in 32..40)
      { x: 7.0, y: 0.35, z: 32.5, c: contCols[5] },
      { x: 8.5, y: 0.35, z: 32.5, c: contCols[0] },
      { x: 8.5, y: 1.55, z: 32.5, c: contCols[1] },
      { x: 10.0, y: 0.35, z: 32.5, c: contCols[2] },
      { x: 7.0, y: 0.35, z: 35.5, c: contCols[3] },
      { x: 8.5, y: 0.35, z: 35.5, c: contCols[4] },
      { x: 10.0, y: 0.35, z: 35.5, c: contCols[5] },
      { x: 10.0, y: 1.55, z: 35.5, c: contCols[0] },
      { x: 11.5, y: 0.35, z: 35.5, c: contCols[1] },
      { x: 8.5, y: 0.35, z: 38.5, c: contCols[2] },
      { x: 10.0, y: 0.35, z: 38.5, c: contCols[3] },
      { x: 8.5, y: 1.55, z: 38.5, c: contCols[4] },
      { x: 11.5, y: 0.35, z: 38.5, c: contCols[5] },
    ];

    containerLayout.forEach((pos) => {
      const box = this.makeContainer(pos.c);
      box.position.set(pos.x, pos.y + 0.6, pos.z);
      this.beachWorldGroup.add(box);
    });

    // 15. Harbour Cargo Crane (Derek Bongkar Muat Pelabuhan)
    const crane = this.makeHarbourCrane();
    crane.position.set(4.0, 0.35, 20.5);
    crane.rotation.y = 0;
    this.beachWorldGroup.add(crane);

    // 16. Wooden Ocean Angling Pier (Dermaga Pancing Samudra Menjorok ke Laut di Z = 28.0)
    const pierDeckGroup = new THREE.Group();
    const woodPlankMat1 = new THREE.MeshStandardMaterial({ color: '#7A4B26', roughness: 0.85 });
    const woodPlankMat2 = new THREE.MeshStandardMaterial({ color: '#8C562E', roughness: 0.85 });

    // Transition ramp from Sand/Quay (X = 2.2, Y = 0.1) up to Pier deck (X = 1.0, Y = 0.35)
    for (let step = 0; step < 4; step++) {
      const stepPlank = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.12, 3.6),
        step % 2 === 0 ? woodPlankMat1 : woodPlankMat2
      );
      stepPlank.position.set(2.0 - step * 0.3, 0.12 + step * 0.07, 28.0);
      pierDeckGroup.add(stepPlank);
    }

    // Pier main wooden planks spanning X from -16.4 to 1.0
    const plankWidth = 0.36;
    const pierSpan = 17.4;
    const plankCount = Math.floor(pierSpan / plankWidth);
    for (let i = 0; i < plankCount; i++) {
      const px = -16.3 + i * plankWidth;
      const plank = new THREE.Mesh(
        new THREE.BoxGeometry(0.32, 0.14, 3.6),
        i % 2 === 0 ? woodPlankMat1 : woodPlankMat2
      );
      plank.position.set(px, 0.35, 28.0);
      pierDeckGroup.add(plank);
    }

    // Heavy timber pilings anchored into sea bottom
    const pilingMat = new THREE.MeshStandardMaterial({ color: '#4E2F17', roughness: 0.9 });
    for (let px = -16.0; px <= 0.5; px += 2.8) {
      [-1.6, 1.6].forEach((pzOffset) => {
        const piling = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 3.4, 8), pilingMat);
        piling.position.set(px, -1.0, 28.0 + pzOffset);
        pierDeckGroup.add(piling);
      });
    }

    // Pier railing posts & nautical brass lanterns
    const postMat = new THREE.MeshStandardMaterial({ color: '#5A351B', roughness: 0.8 });
    const lampBrassMat = new THREE.MeshStandardMaterial({ color: '#D4AF37', metalness: 0.7, roughness: 0.3 });
    const lampGlowMat = new THREE.MeshStandardMaterial({
      color: '#FFF8E7',
      emissive: '#FFB84D',
      emissiveIntensity: 0.25,
      roughness: 0.3,
    });

    for (let px = -16.2; px <= 0.8; px += 3.2) {
      [-1.75, 1.75].forEach((pzOffset) => {
        const pz = 28.0 + pzOffset;
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.1, 0.16), postMat);
        post.position.set(px, 0.85, pz);
        pierDeckGroup.add(post);

        const lantern = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.24), lampBrassMat);
        lantern.position.set(px, 1.45, pz);
        pierDeckGroup.add(lantern);

        const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), lampGlowMat);
        bulb.position.set(px, 1.45, pz);
        pierDeckGroup.add(bulb);

        const pLight = new THREE.PointLight('#FFD180', 0.0, 7.0, 1.5);
        pLight.position.set(px, 1.5, pz);
        pierDeckGroup.add(pLight);
        this.beachLamps.push({ root: lantern, headMat: lampGlowMat, light: pLight });
      });
    }

    // Pier props: bait barrel, tackle box, lifebuoy
    const barrelMat = new THREE.MeshStandardMaterial({ color: '#5B371B', roughness: 0.85 });
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.4, 0.82, 10), barrelMat);
    barrel.position.set(-14.5, 0.76, 26.8);
    pierDeckGroup.add(barrel);

    const crateMat = new THREE.MeshStandardMaterial({ color: '#A06E3B', roughness: 0.85 });
    const tackleBox = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.45, 0.55), crateMat);
    tackleBox.position.set(-11.5, 0.6, 29.2);
    pierDeckGroup.add(tackleBox);

    const buoyRingMat = new THREE.MeshStandardMaterial({ color: '#EF4444', roughness: 0.5 });
    const lifebuoy = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.07, 8, 16), buoyRingMat);
    lifebuoy.position.set(-16.3, 0.95, 26.3);
    lifebuoy.rotation.y = Math.PI / 2;
    pierDeckGroup.add(lifebuoy);

    this.beachWorldGroup.add(pierDeckGroup);

    // 17. Docked Cargo Ship / Ferry ("KOTA NETIZEN" Sandar di Dermaga)
    const cargoShip = this.makeCargoShip();
    cargoShip.position.set(-9.5, 0, 34.0);
    cargoShip.rotation.y = 0;
    this.beachWorldGroup.add(cargoShip);

    // 18. Striped Stone Lighthouse (Mercusuar Karang Laut dengan Sorot Lampu Berputar)
    const lighthouse = this.makeLighthouse();
    lighthouse.position.set(-5.0, 0, 44.0);
    this.beachWorldGroup.add(lighthouse);

    // 19. Lush Coconut Palms & Coastal Pines along Inland Bank
    const palmPositions = [
      { x: 18.0, z: -18.0, tilt: 0.16 },
      { x: 22.0, z: -8.0, tilt: -0.15 },
      { x: 19.0, z: 4.0, tilt: 0.14 },
      { x: 23.0, z: 14.0, tilt: -0.16 },
      { x: 18.0, z: 26.0, tilt: 0.15 },
      { x: 22.0, z: 38.0, tilt: -0.14 },
      { x: 20.0, z: 45.0, tilt: 0.12 },
    ];
    palmPositions.forEach((pos) => {
      const palm = this.createPalmTree(pos.tilt);
      palm.position.set(pos.x, 0, pos.z);
      this.beachWorldGroup.add(palm);
    });

    // 20. Exit Portal Gate ("← KEMBALI KE KOTA UTAMA")
    const portalArch = this.createBeachExitPortal();
    portalArch.position.set(16.5, 0, 0);
    portalArch.rotation.y = -Math.PI / 2;
    this.beachWorldGroup.add(portalArch);

    // 21. Swimming Marine Fish Schools (Kawanan Ikan Samudra Renang)
    this.setupBeachFish();
  }

  private makeStripedCanopy(colorHex: string, radius = 1.4, height = 0.65): THREE.Group {
    const group = new THREE.Group();
    const matColor = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.7, side: THREE.DoubleSide });
    const matWhite = new THREE.MeshStandardMaterial({ color: '#FFFDF9', roughness: 0.7, side: THREE.DoubleSide });

    const segs = 8;
    for (let k = 0; k < segs; k++) {
      const a0 = (k * Math.PI * 2) / segs;
      const a1 = ((k + 1) * Math.PI * 2) / segs;

      const p0 = new THREE.Vector3(0, height, 0);
      const p1 = new THREE.Vector3(Math.cos(a0) * radius, 0, Math.sin(a0) * radius);
      const p2 = new THREE.Vector3(Math.cos(a1) * radius, 0, Math.sin(a1) * radius);

      const geom = new THREE.BufferGeometry();
      const vertices = new Float32Array([
        p0.x, p0.y, p0.z,
        p1.x, p1.y, p1.z,
        p2.x, p2.y, p2.z,
      ]);
      geom.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
      geom.computeVertexNormals();

      const mesh = new THREE.Mesh(geom, k % 2 === 0 ? matColor : matWhite);
      mesh.castShadow = true;
      group.add(mesh);
    }
    return group;
  }

  private makeSunLounger(towelColor: string): THREE.Group {
    const group = new THREE.Group();
    const whiteMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.85 });
    const woodLegMat = new THREE.MeshStandardMaterial({ color: '#E2D5C3', roughness: 0.85 });
    const towelMat = new THREE.MeshStandardMaterial({ color: towelColor, roughness: 0.7 });

    const bed = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 1.4), whiteMat);
    bed.position.set(0, 0.22, 0);
    bed.castShadow = true;
    group.add(bed);

    const headrest = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.09, 0.55), whiteMat);
    headrest.position.set(0, 0.36, -0.85);
    headrest.rotation.x = 0.45;
    headrest.castShadow = true;
    group.add(headrest);

    [-0.3, 0.3].forEach((lx) => {
      [-0.45, 0.45].forEach((lz) => {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.22, 0.08), woodLegMat);
        leg.position.set(lx, 0.11, lz);
        group.add(leg);
      });
    });

    const towel = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.03, 1.0), towelMat);
    towel.position.set(0, 0.28, 0.05);
    group.add(towel);

    return group;
  }

  private makeLifeguardTower(): THREE.Group {
    const tower = new THREE.Group();
    const coralMat = new THREE.MeshStandardMaterial({ color: '#F28C7A', roughness: 0.6 });
    const creamMat = new THREE.MeshStandardMaterial({ color: '#FFF6E6', roughness: 0.7 });
    const woodMat = new THREE.MeshStandardMaterial({ color: '#8C562E', roughness: 0.85 });
    const glassMat = new THREE.MeshStandardMaterial({ color: '#8FB7D8', roughness: 0.2 });

    [
      [-0.8, -0.8],
      [0.8, -0.8],
      [-0.8, 0.8],
      [0.8, 0.8],
    ].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.8, 0.16), creamMat);
      leg.position.set(x, 1.4, z);
      leg.castShadow = true;
      tower.add(leg);
    });

    [-0.8, 0.8].forEach((z) => {
      const diag1 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 2.2, 0.09), creamMat);
      diag1.position.set(0, 1.3, z);
      diag1.rotation.z = 0.58;
      const diag2 = new THREE.Mesh(new THREE.BoxGeometry(0.09, 2.2, 0.09), creamMat);
      diag2.position.set(0, 1.3, z);
      diag2.rotation.z = -0.58;
      tower.add(diag1, diag2);
    });

    const deck = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.16, 2.3), coralMat);
    deck.position.set(0, 2.85, 0);
    deck.castShadow = true;
    tower.add(deck);

    const railF = new THREE.Mesh(new THREE.BoxGeometry(2.3, 0.08, 0.08), coralMat);
    railF.position.set(0, 3.4, 1.1);
    const railL = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 2.3), coralMat);
    railL.position.set(-1.1, 3.4, 0);
    const railR = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 2.3), coralMat);
    railR.position.set(1.1, 3.4, 0);
    tower.add(railF, railL, railR);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 1.4), creamMat);
    cabin.position.set(0, 3.5, -0.3);
    cabin.castShadow = true;
    tower.add(cabin);

    [-0.4, 0.4].forEach((wx) => {
      const win = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.48, 0.04), glassMat);
      win.position.set(wx, 3.6, 0.42);
      tower.add(win);
    });

    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.6, 0.9, 4), coralMat);
    roof.position.set(0, 4.5, -0.2);
    roof.rotation.y = Math.PI / 4;
    roof.castShadow = true;
    tower.add(roof);

    const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6), creamMat);
    flagPole.position.set(0, 5.2, 0);
    tower.add(flagPole);

    const flag = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.42, 0.02),
      new THREE.MeshStandardMaterial({ color: '#F7D772', roughness: 0.6 })
    );
    flag.position.set(0.35, 5.5, 0);
    tower.add(flag);
    this.separateBeachFlag = flag;

    for (let r = 0; r < 6; r++) {
      const rung = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.06, 0.09), woodMat);
      rung.position.set(0, 0.4 + r * 0.48, -1.25);
      tower.add(rung);
    }
    [-0.35, 0.35].forEach((lx) => {
      const ladderPost = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.9, 0.08), woodMat);
      ladderPost.position.set(lx, 1.45, -1.25);
      tower.add(ladderPost);
    });

    const lanternMat = new THREE.MeshStandardMaterial({
      color: '#FFF8E7',
      emissive: '#FFB84D',
      emissiveIntensity: 0.3,
    });
    const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), lanternMat);
    lantern.position.set(0, 4.1, 0.85);
    tower.add(lantern);

    const guardBody = new THREE.Mesh(new THREE.CapsuleGeometry(0.25, 0.42, 6, 12), coralMat);
    guardBody.position.set(0, 3.25, 0.5);
    guardBody.castShadow = true;
    tower.add(guardBody);

    const whistleMat = new THREE.MeshStandardMaterial({ color: '#F7D772', metalness: 0.5, roughness: 0.3 });
    const whistle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.045, 0.05, 0.16, 8).rotateX(Math.PI / 2),
      whistleMat
    );
    whistle.position.set(0, 3.32, 0.78);
    tower.add(whistle);

    return tower;
  }

  private makeSafetyBoard(): THREE.Group {
    const boardGroup = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: '#5A351B', roughness: 0.85 });

    [-0.7, 0.7].forEach((px) => {
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.8, 0.1), woodMat);
      post.position.set(px, 0.9, 0);
      post.castShadow = true;
      boardGroup.add(post);
    });

    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFF4DA';
      ctx.fillRect(0, 0, 512, 300);
      ctx.strokeStyle = '#F28C7A';
      ctx.lineWidth = 18;
      ctx.strokeRect(9, 9, 512 - 18, 300 - 18);

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#E2604F';
      ctx.font = 'bold 78px sans-serif';
      ctx.fillText('HATI-HATI!', 256, 95);

      ctx.fillStyle = '#4B3A36';
      ctx.font = 'bold 40px sans-serif';
      ctx.fillText('BERENANG DI AREA', 256, 185);
      ctx.fillText('YANG DIJAGA', 256, 240);
    }
    const tex = new THREE.CanvasTexture(canvas);
    const sideMat = new THREE.MeshStandardMaterial({ color: '#F7ECD6', roughness: 0.8 });
    const faceMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75 });
    const signPlate = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.18, 0.08), [
      sideMat, sideMat, sideMat, sideMat, faceMat, sideMat
    ]);
    signPlate.position.set(0, 1.55, 0.06);
    signPlate.castShadow = true;
    boardGroup.add(signPlate);

    return boardGroup;
  }

  private makeBeachGate(): THREE.Group {
    const gateGroup = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: '#8C562E', roughness: 0.85 });
    const darkWoodMat = new THREE.MeshStandardMaterial({ color: '#5A351B', roughness: 0.85 });
    const mintCapMat = new THREE.MeshStandardMaterial({ color: '#A8DCC8', roughness: 0.6 });
    const lampGlowMat = new THREE.MeshStandardMaterial({
      color: '#FFF4D8',
      emissive: '#FFD58A',
      emissiveIntensity: 0.3,
    });
    const ribbonMat = new THREE.MeshStandardMaterial({ color: '#F2A0B4', roughness: 0.5 });

    const half = 2.45;
    [-1, 1].forEach((s) => {
      const p = new THREE.Mesh(new THREE.BoxGeometry(0.38, 3.4, 0.38), woodMat);
      p.position.set(s * half, 1.7, 0);
      p.castShadow = true;
      gateGroup.add(p);

      const cap = new THREE.Mesh(new THREE.ConeGeometry(0.32, 0.4, 4), mintCapMat);
      cap.position.set(s * half, 3.6, 0);
      cap.rotation.y = Math.PI / 4;
      gateGroup.add(cap);

      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 8), lampGlowMat);
      lamp.position.set(s * half, 3.25, 0.3);
      gateGroup.add(lamp);
    });

    const beam = new THREE.Mesh(new THREE.BoxGeometry(half * 2 + 1.0, 0.28, 0.34), darkWoodMat);
    beam.position.set(0, 3.15, 0);
    gateGroup.add(beam);

    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 220;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#FFF4DA';
      ctx.fillRect(0, 0, 1024, 220);
      ctx.strokeStyle = '#F2A0B4';
      ctx.lineWidth = 16;
      ctx.strokeRect(8, 8, 1024 - 16, 220 - 16);

      ctx.fillStyle = '#4B3A36';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = 'bold 110px sans-serif';
      ctx.fillText('NETIZEN BEACH', 512, 118);

      ctx.fillStyle = '#7FC3E8';
      for (const sx of [70, 1024 - 70]) {
        ctx.beginPath();
        ctx.arc(sx, 110, 26, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    const tex = new THREE.CanvasTexture(canvas);
    const sideMat = new THREE.MeshStandardMaterial({ color: '#FFF4DA' });
    const faceMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.75 });
    const plate = new THREE.Mesh(new THREE.BoxGeometry(4.6, 0.98, 0.12), [
      sideMat, sideMat, sideMat, sideMat, faceMat, faceMat
    ]);
    plate.position.set(0, 2.55, 0);
    gateGroup.add(plate);

    for (const s of [-1, 1]) {
      const r = new THREE.Mesh(new THREE.BoxGeometry(half - 0.2, 0.2, 0.03), ribbonMat);
      r.position.set(s * (half - 0.2) / 2, 1.1, 0.25);
      gateGroup.add(r);
    }
    const bow = new THREE.Group();
    bow.position.set(0, 1.1, 0.27);
    for (const s of [-1, 1]) {
      const loop = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.055, 6, 12), ribbonMat);
      loop.position.x = s * 0.19;
      loop.scale.set(1.1, 0.8, 0.6);
      const tail = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.03), ribbonMat);
      tail.position.set(s * 0.08, -0.2, 0);
      tail.rotation.z = s * 0.35;
      bow.add(loop, tail);
    }
    bow.add(new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 6), ribbonMat));
    gateGroup.add(bow);

    return gateGroup;
  }

  private makeCargoShip(): THREE.Group {
    const ship = new THREE.Group();
    const hullMat = new THREE.MeshStandardMaterial({ color: '#F2A88A', roughness: 0.5 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: '#FFF9F1', roughness: 0.7 });
    const windowMat = new THREE.MeshStandardMaterial({ color: '#5E7CA6', roughness: 0.2 });
    const mintMat = new THREE.MeshStandardMaterial({ color: '#A8DCC8', roughness: 0.6 });
    const yellowMat = new THREE.MeshStandardMaterial({ color: '#F7D772', roughness: 0.6 });
    const blackMat = new THREE.MeshStandardMaterial({ color: '#2B2B2B', roughness: 0.8 });

    const hull = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.3, 9.6), hullMat);
    hull.position.set(0, 0.25, 0);
    hull.castShadow = true;
    ship.add(hull);

    const bow = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 1.3, 14, 1, false, 0, Math.PI), hullMat);
    bow.position.set(0, 0.25, -4.8);
    bow.rotation.y = Math.PI;
    bow.castShadow = true;
    ship.add(bow);

    const trim = new THREE.Mesh(new THREE.BoxGeometry(3.25, 0.22, 9.65), whiteMat);
    trim.position.set(0, 0.95, 0);
    ship.add(trim);

    const cabin = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.25, 4.8), whiteMat);
    cabin.position.set(0, 1.65, 0.6);
    cabin.castShadow = true;
    ship.add(cabin);

    for (let i = 0; i < 5; i++) {
      [-1, 1].forEach((s) => {
        const win = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.42, 0.55), windowMat);
        win.position.set(s * 1.27, 1.75, 2.2 - i * 0.85);
        ship.add(win);
      });
    }

    const bridge = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.85, 1.8), mintMat);
    bridge.position.set(0, 2.65, 1.2);
    bridge.castShadow = true;
    ship.add(bridge);

    const funnel = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 1.3, 10), yellowMat);
    funnel.position.set(0, 3.5, 2.2);
    funnel.castShadow = true;
    ship.add(funnel);

    const funnelBand = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.28, 10), blackMat);
    funnelBand.position.set(0, 3.95, 2.2);
    ship.add(funnelBand);

    return ship;
  }

  private makeHarbourCrane(): THREE.Group {
    const crane = new THREE.Group();
    const yellowMat = new THREE.MeshStandardMaterial({ color: '#F7D772', roughness: 0.6 });
    const pinkMat = new THREE.MeshStandardMaterial({ color: '#F2A88A', roughness: 0.6 });
    const cabinMat = new THREE.MeshStandardMaterial({ color: '#FFF9F1', roughness: 0.8 });
    const cableMat = new THREE.MeshStandardMaterial({ color: '#6A6670', metalness: 0.7, roughness: 0.4 });
    const containerMat = new THREE.MeshStandardMaterial({ color: '#A8DCC8', roughness: 0.7 });

    [
      [-1.4, -1.4],
      [-1.4, 1.4],
      [1.4, -1.4],
      [1.4, 1.4],
    ].forEach(([x, z]) => {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.28, 6.8, 0.28), yellowMat);
      leg.position.set(x, 3.4, z);
      leg.castShadow = true;
      crane.add(leg);
    });

    const boom = new THREE.Mesh(new THREE.BoxGeometry(12.5, 0.5, 0.5), pinkMat);
    boom.position.set(-3.5, 6.9, 0);
    boom.castShadow = true;
    crane.add(boom);

    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.1, 1.4), cabinMat);
    cab.position.set(0.8, 7.6, 0);
    cab.castShadow = true;
    crane.add(cab);

    const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 3.6, 4), cableMat);
    cable.position.set(-7.5, 5.0, 0);
    crane.add(cable);

    const suspendedContainer = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.2, 2.7), containerMat);
    suspendedContainer.position.set(-7.5, 2.6, 0);
    suspendedContainer.castShadow = true;
    crane.add(suspendedContainer);

    return crane;
  }

  private makeLighthouse(): THREE.Group {
    const lh = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: '#BFB7A8', roughness: 0.9 });
    const baseMat = new THREE.MeshStandardMaterial({ color: '#CFC6B8', roughness: 0.85 });
    const creamMat = new THREE.MeshStandardMaterial({ color: '#FFF4E2', roughness: 0.7 });
    const pinkMat = new THREE.MeshStandardMaterial({ color: '#F2A0B4', roughness: 0.6 });
    const balconyMat = new THREE.MeshStandardMaterial({ color: '#F2A88A', roughness: 0.6 });
    const lampGlowMat = new THREE.MeshStandardMaterial({
      color: '#FFF7D6',
      emissive: '#FFE7A0',
      emissiveIntensity: 0.6,
      roughness: 0.2,
    });

    for (let i = 0; i < 10; i++) {
      const angle = (i / 10) * Math.PI * 2;
      const dist = 2.4 + (i % 3) * 0.4;
      const rock = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.85 + ((i * 7) % 5) * 0.12, 0),
        stoneMat
      );
      rock.position.set(Math.cos(angle) * dist, 0.35, Math.sin(angle) * dist);
      rock.scale.set(1.1, 0.75, 1.1);
      rock.castShadow = true;
      lh.add(rock);
    }

    const base = new THREE.Mesh(new THREE.CylinderGeometry(2.1, 2.5, 1.0, 12), baseMat);
    base.position.set(0, 0.5, 0);
    base.castShadow = true;
    lh.add(base);

    for (let k = 0; k < 6; k++) {
      const rTop = 1.25 - (k + 1) * 0.08;
      const rBottom = 1.25 - k * 0.08;
      const tier = new THREE.Mesh(
        new THREE.CylinderGeometry(rTop, rBottom, 1.4, 14),
        k % 2 === 0 ? creamMat : pinkMat
      );
      tier.position.set(0, 1.0 + 0.7 + k * 1.4, 0);
      tier.castShadow = true;
      lh.add(tier);
    }

    const balcony = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.2, 14), balconyMat);
    balcony.position.set(0, 9.8, 0);
    balcony.castShadow = true;
    lh.add(balcony);

    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 1.0, 12), lampGlowMat);
    lamp.position.set(0, 10.4, 0);
    lh.add(lamp);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(0.95, 0.85, 12), pinkMat);
    roof.position.set(0, 11.3, 0);
    roof.castShadow = true;
    lh.add(roof);

    const beamM = new THREE.MeshBasicMaterial({
      color: '#FFF3C4',
      transparent: true,
      opacity: 0.24,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const beamGroup = new THREE.Group();
    beamGroup.position.set(0, 10.4, 0);

    [-1, 1].forEach((s) => {
      const b = new THREE.Mesh(
        new THREE.ConeGeometry(2.4, 32, 16, 1, true).rotateZ(s * Math.PI / 2).translate(s * 16, 0, 0),
        beamM
      );
      beamGroup.add(b);
    });
    lh.add(beamGroup);
    this.separateLighthouseBeam = beamGroup;

    return lh;
  }

  private makeRiverBridge(): THREE.Group {
    const bridgeGroup = new THREE.Group();
    const stoneMat = new THREE.MeshStandardMaterial({ color: '#CFC6B8', roughness: 0.85 });
    const asphaltMat = new THREE.MeshStandardMaterial({ color: '#64748B', roughness: 0.9 });
    const railMat = new THREE.MeshStandardMaterial({ color: '#F8FAFC', roughness: 0.7 });
    const stripeMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });

    [-3.4, 3.4].forEach((pz) => {
      const pier = new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.6, 1.2), stoneMat);
      pier.position.set(0, 0.8, pz);
      pier.castShadow = true;
      bridgeGroup.add(pier);
    });

    const deck = new THREE.Mesh(new THREE.BoxGeometry(6.8, 0.35, 7.6), asphaltMat);
    deck.position.set(0, 1.6, 0);
    deck.castShadow = true;
    bridgeGroup.add(deck);

    for (let i = -2; i <= 2; i++) {
      const dash = new THREE.Mesh(new THREE.PlaneGeometry(0.18, 0.9).rotateX(-Math.PI / 2), stripeMat);
      dash.position.set(0, 1.79, i * 1.5);
      bridgeGroup.add(dash);
    }

    [-3.45, 3.45].forEach((rx) => {
      const topRail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 7.6), railMat);
      topRail.position.set(rx, 2.2, 0);
      bridgeGroup.add(topRail);

      for (let z = -3.5; z <= 3.5; z += 1.2) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.08), railMat);
        post.position.set(rx, 1.85, z);
        bridgeGroup.add(post);
      }
    });

    return bridgeGroup;
  }

  private makeContainer(colorHex: string): THREE.Mesh {
    const geom = new THREE.BoxGeometry(1.3, 1.2, 2.7);
    const mat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.7 });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    return mesh;
  }

  private createPalmTree(tilt = 0.15): THREE.Group {
    const palmGroup = new THREE.Group();
    const trunkMat = new THREE.MeshStandardMaterial({ color: '#8D6E63', roughness: 0.85 });
    const leafMat = new THREE.MeshStandardMaterial({ color: '#2E7D32', roughness: 0.6 });
    const coconutMat = new THREE.MeshStandardMaterial({ color: '#4E342E', roughness: 0.8 });

    let curY = 0;
    let curX = 0;
    for (let s = 0; s < 7; s++) {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.24 - s * 0.018, 0.28 - s * 0.018, 0.85, 7), trunkMat);
      curY += 0.75;
      curX += tilt * 0.5;
      seg.position.set(curX, curY, 0);
      seg.rotation.z = tilt * (s + 1) * 0.12;
      palmGroup.add(seg);
    }

    for (let c = 0; c < 4; c++) {
      const coconut = new THREE.Mesh(new THREE.SphereGeometry(0.18, 6, 6), coconutMat);
      const ca = (c * Math.PI) / 2;
      coconut.position.set(curX + Math.cos(ca) * 0.28, curY + 0.1, Math.sin(ca) * 0.28);
      palmGroup.add(coconut);
    }

    for (let f = 0; f < 6; f++) {
      const fa = (f * Math.PI * 2) / 6;
      const frond = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.06, 2.6), leafMat);
      frond.position.set(curX + Math.sin(fa) * 1.1, curY + 0.35, Math.cos(fa) * 1.1);
      frond.rotation.y = fa;
      frond.rotation.x = 0.45;
      palmGroup.add(frond);
    }

    return palmGroup;
  }

  private createBeachExitPortal(): THREE.Group {
    const archGroup = new THREE.Group();

    const woodMat = new THREE.MeshStandardMaterial({ color: '#8C562E', roughness: 0.85 });
    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 4.2, 8), woodMat);
    postL.position.set(-2.8, 2.1, 0);
    const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.25, 4.2, 8), woodMat);
    postR.position.set(2.8, 2.1, 0);
    archGroup.add(postL, postR);

    const beam = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.38, 0.45), woodMat);
    beam.position.set(0, 4.1, 0);
    archGroup.add(beam);

    const signBoardMat = new THREE.MeshStandardMaterial({ color: '#FEF3C7', roughness: 0.8 });
    const signBoard = new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.85, 0.12), signBoardMat);
    signBoard.position.set(0, 3.5, 0);
    archGroup.add(signBoard);

    const pinkRibbonMat = new THREE.MeshStandardMaterial({ color: '#F472B6', roughness: 0.5 });
    const ribbonKnot = new THREE.Mesh(new THREE.SphereGeometry(0.35, 8, 8), pinkRibbonMat);
    ribbonKnot.position.set(0, 4.65, 0);
    archGroup.add(ribbonKnot);

    const bowWingL = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.14, 8, 16), pinkRibbonMat);
    bowWingL.position.set(-0.55, 4.75, 0);
    bowWingL.rotation.y = Math.PI / 2;
    bowWingL.rotation.z = -0.35;
    const bowWingR = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.14, 8, 16), pinkRibbonMat);
    bowWingR.position.set(0.55, 4.75, 0);
    bowWingR.rotation.y = Math.PI / 2;
    bowWingR.rotation.z = 0.35;
    archGroup.add(bowWingL, bowWingR);

    const padMat = new THREE.MeshStandardMaterial({
      color: '#F472B6',
      emissive: '#EC4899',
      emissiveIntensity: 0.6,
      roughness: 0.3,
    });
    const exitPad = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.08, 16), padMat);
    exitPad.position.set(0, 0.04, 0);
    archGroup.add(exitPad);

    return archGroup;
  }

  private setupBeachFish() {
    this.beachFishList = [];
    const fishColors = ['#F97316', '#38BDF8', '#FBBF24', '#EF4444', '#A855F7', '#34D399'];
    const swimCenters = [
      new THREE.Vector3(-8.0, -0.75, 22.0),
      new THREE.Vector3(-12.0, -0.8, 30.0),
      new THREE.Vector3(-18.0, -0.9, 28.0),
      new THREE.Vector3(-8.0, -0.7, 4.0),
      new THREE.Vector3(-12.0, -0.85, -6.0),
      new THREE.Vector3(-6.0, -0.7, -12.0),
      new THREE.Vector3(-10.0, -0.8, 42.0),
      new THREE.Vector3(-14.0, -0.75, 14.0),
      new THREE.Vector3(-22.0, -0.9, 10.0),
      new THREE.Vector3(-6.0, -0.75, 34.0),
    ];

    swimCenters.forEach((center, i) => {
      const color = fishColors[i % fishColors.length];
      const fishGroup = new THREE.Group();

      const bodyMat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.4,
        metalness: 0.3,
      });
      const bodyGeom = new THREE.ConeGeometry(0.15, 0.48, 8);
      bodyGeom.rotateX(Math.PI / 2);
      const body = new THREE.Mesh(bodyGeom, bodyMat);
      fishGroup.add(body);

      const tailGeom = new THREE.ConeGeometry(0.13, 0.24, 3);
      tailGeom.rotateZ(Math.PI / 2);
      const tail = new THREE.Mesh(tailGeom, bodyMat);
      tail.position.set(0, 0, 0.3);
      fishGroup.add(tail);

      const eyeMat = new THREE.MeshBasicMaterial({ color: '#111827' });
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), eyeMat);
      eyeL.position.set(0.08, 0.04, -0.15);
      const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), eyeMat);
      eyeR.position.set(-0.08, 0.04, -0.15);
      fishGroup.add(eyeL, eyeR);

      fishGroup.position.copy(center);
      this.beachWorldGroup.add(fishGroup);

      this.beachFishList.push({
        mesh: fishGroup,
        tail,
        center,
        radius: 2.2 + Math.random() * 2.0,
        angle: Math.random() * Math.PI * 2,
        speed: 0.65 + Math.random() * 0.5,
        depth: center.y,
      });
    });
  }

  private setupRiverFish() {
    this.riverFishList = [];
    const fishColors = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
    const swimCenters = [
      new THREE.Vector3(-4.5, -0.65, -8.5),
      new THREE.Vector3(4.5, -0.75, -9.0),
      new THREE.Vector3(0, -0.85, -12.5),
      new THREE.Vector3(-6.5, -0.6, -13.0),
      new THREE.Vector3(5.5, -0.9, -14.0),
      new THREE.Vector3(1.5, -0.7, -7.5),
    ];

    swimCenters.forEach((center, i) => {
      const color = fishColors[i % fishColors.length];
      const fishGroup = new THREE.Group();

      const bodyMat = new THREE.MeshStandardMaterial({
        color,
        roughness: 0.4,
        metalness: 0.3,
      });
      const bodyGeom = new THREE.ConeGeometry(0.14, 0.45, 8);
      bodyGeom.rotateX(Math.PI / 2);
      const body = new THREE.Mesh(bodyGeom, bodyMat);
      fishGroup.add(body);

      const tailGeom = new THREE.ConeGeometry(0.12, 0.22, 3);
      tailGeom.rotateZ(Math.PI / 2);
      const tail = new THREE.Mesh(tailGeom, bodyMat);
      tail.position.set(0, 0, 0.28);
      fishGroup.add(tail);

      const eyeMat = new THREE.MeshBasicMaterial({ color: '#111827' });
      const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), eyeMat);
      eyeL.position.set(0.08, 0.04, -0.15);
      const eyeR = new THREE.Mesh(new THREE.SphereGeometry(0.025, 6, 6), eyeMat);
      eyeR.position.set(-0.08, 0.04, -0.15);
      fishGroup.add(eyeL, eyeR);

      fishGroup.position.copy(center);
      this.riverWorldGroup.add(fishGroup);

      this.riverFishList.push({
        mesh: fishGroup,
        tail,
        center,
        radius: 1.8 + Math.random() * 1.6,
        angle: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 0.5,
        depth: center.y,
      });
    });
  }

  private setupFishingGear() {
    this.fishingRodGroup = new THREE.Group();
    this.fishingRodGroup.name = 'FishingRod';

    const rodConfig = this.currentEquippedRod || FISHING_RODS[0];

    // Handle (cork grip) centered at (0, 0, 0)
    const handleMat = new THREE.MeshStandardMaterial({
      color: rodConfig.handleColor,
      roughness: 0.8,
    });
    this.rodHandleMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.032, 0.036, 0.38, 8),
      handleMat
    );
    this.rodHandleMesh.position.set(0, 0, 0);
    this.fishingRodGroup.add(this.rodHandleMesh);

    // Reel seat & mini reel
    const reelMat = new THREE.MeshStandardMaterial({
      color: rodConfig.reelColor,
      metalness: 0.8,
      roughness: 0.25,
    });
    this.rodReelMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.05, 0.08, 12),
      reelMat
    );
    this.rodReelMesh.rotation.z = Math.PI / 2;
    this.rodReelMesh.position.set(0.05, 0.12, 0);
    this.fishingRodGroup.add(this.rodReelMesh);

    // Blank (tapered flexible rod shaft, height 2.0, center at y = 1.19)
    const rodMat = new THREE.MeshStandardMaterial({
      color: rodConfig.color,
      roughness: 0.4,
      metalness: rodConfig.rarity === 'legendary' || rodConfig.rarity === 'immortal' ? 0.85 : 0.3,
      emissive: new THREE.Color(rodConfig.glowColor || '#000000'),
      emissiveIntensity: rodConfig.glowColor ? 0.55 : 0,
    });
    this.rodBlankMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.028, 2.0, 8),
      rodMat
    );
    this.rodBlankMesh.position.set(0, 1.19, 0);
    this.fishingRodGroup.add(this.rodBlankMesh);

    // Line Guide rings
    const ringMat = new THREE.MeshStandardMaterial({
      color: '#D1D5DB',
      metalness: 0.9,
      roughness: 0.2,
    });
    const rod = this.fishingRodGroup;
    [0.55, 0.95, 1.35, 1.75, 2.15].forEach((gy) => {
      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.022, 0.005, 6, 8),
        ringMat
      );
      ring.position.set(0, gy, 0.03);
      rod.add(ring);
    });

    // Rod Tip Marker (EXACT 3D tip of the fishing rod at y = 2.2)
    this.rodTip = new THREE.Object3D();
    this.rodTip.name = 'RodTipMarker';
    this.rodTip.position.set(0, 2.2, 0);

    // Glowing tip bead for enchanted / higher tier rods
    const glowMat = new THREE.MeshBasicMaterial({
      color: rodConfig.glowColor || '#FFFFFF',
    });
    this.rodTipGlowMesh = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), glowMat);
    this.rodTipGlowMesh.visible = Boolean(rodConfig.glowColor);
    this.rodTip.add(this.rodTipGlowMesh);

    this.fishingRodGroup.add(this.rodTip);

    // Fishing Bobber (Classic red & white float)
    this.fishingBobber = new THREE.Group();
    this.fishingBobber.name = 'FishingBobber';
    const redMat = new THREE.MeshStandardMaterial({ color: '#EF4444', roughness: 0.3 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 });

    const topHemisphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 14, 14, 0, Math.PI * 2, 0, Math.PI / 2),
      redMat
    );
    const bottomHemisphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.12, 14, 14, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      whiteMat
    );
    const bobberPin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.28, 6),
      new THREE.MeshStandardMaterial({ color: '#1F2937' })
    );
    this.fishingBobber.add(topHemisphere, bottomHemisphere, bobberPin);
    this.fishingBobber.position.set(0, -0.05, -7.5);
    this.fishingBobber.visible = false;
    this.riverWorldGroup.add(this.fishingBobber);

    // Dynamic 3D Fishing Line with 12 points and DynamicDrawUsage
    const LINE_POINT_COUNT = 12;
    const linePositions = new Float32Array(LINE_POINT_COUNT * 3);
    const lineGeom = new THREE.BufferGeometry();
    const linePosAttr = new THREE.BufferAttribute(linePositions, 3);
    linePosAttr.setUsage(THREE.DynamicDrawUsage);
    lineGeom.setAttribute('position', linePosAttr);
    const lineMat = new THREE.LineBasicMaterial({
      color: '#FFFFFF',
      transparent: true,
      opacity: 0.95,
      linewidth: 2,
      depthTest: true,
      depthWrite: false,
    });
    this.fishingLine = new THREE.Line(lineGeom, lineMat);
    this.fishingLine.frustumCulled = false;
    this.fishingLine.visible = false;
    this.riverWorldGroup.add(this.fishingLine);

    // Caught Fish Trophy mesh
    this.caughtFishMesh = new THREE.Group();
    this.caughtFishMesh.name = 'CaughtFishTrophy';
    const fishBody = new THREE.Mesh(
      new THREE.ConeGeometry(0.14, 0.45, 8).rotateX(Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: '#F59E0B', roughness: 0.4, metalness: 0.3 })
    );
    const fishTail = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.2, 3).rotateZ(Math.PI / 2),
      new THREE.MeshStandardMaterial({ color: '#F59E0B', roughness: 0.4 })
    );
    fishTail.position.set(0, 0, 0.26);
    this.caughtFishMesh.add(fishBody, fishTail);
    this.caughtFishMesh.visible = false;
    this.riverWorldGroup.add(this.caughtFishMesh);
  }

  private createRiverExitPortal(): THREE.Group {
    const group = new THREE.Group();
    const woodMat = new THREE.MeshStandardMaterial({ color: '#6A4122', roughness: 0.85 });

    const postL = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 3.2, 8), woodMat);
    postL.position.set(-2.2, 1.6, 0);
    const postR = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 3.2, 8), woodMat);
    postR.position.set(2.2, 1.6, 0);

    const crossbeam = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.35, 0.35), woodMat);
    crossbeam.position.set(0, 3.0, 0);
    group.add(postL, postR, crossbeam);

    const ringMat = new THREE.MeshBasicMaterial({
      color: '#4ADE80',
      transparent: true,
      opacity: 0.65,
    });
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.4, 1.8, 24).rotateX(-Math.PI / 2), ringMat);
    ring.position.set(0, 0.06, 0);
    group.add(ring);

    const signSprite = makeNameTagSprite('← Keluar ke Netizen City', false, true);
    signSprite.position.set(0, 3.6, 0);
    signSprite.scale.set(3.2, 0.75, 1);
    group.add(signSprite);

    return group;
  }

  private setupCharacters() {
    const profile = useCitizenStore.getState().profile;
    this.isPlayerAdmin = profile?.role === 'admin' || profile?.role === 'mayor';

    if (this.isPlayerAdmin) {
      this.mayorPlayer = makeMayor();
      this.mayorPlayer.root.position.set(0, 0, 13);
      this.tuguWorldGroup.add(this.mayorPlayer.root);
    } else {
      const avatarColors = resolveAvatarColors(profile?.avatarConfig);
      this.playerCitizen = makeCitizen3D(avatarColors);
      this.playerCitizen.root.position.set(0, 0, 13);
      this.tuguWorldGroup.add(this.playerCitizen.root);

      this.mayorNPC = createPakMayorNPC(this.tuguWorldGroup, new THREE.Vector3(0, 0, 11.2));
      const mayorTag = makeNameTagSprite('✦ Pak Mayor (Walikota) ✦', false, false);
      mayorTag.position.set(0, 1.7, 0);
      this.mayorNPC.root.add(mayorTag);
    }

    // Attach local player nametag
    const localName = profile?.displayName || profile?.username || 'Kamu';
    const localTag = makeNameTagSprite(localName + ' (Kamu)', !profile, true);
    localTag.position.set(0, 1.55, 0);
    if (this.isPlayerAdmin && this.mayorPlayer) {
      this.mayorPlayer.root.add(localTag);
    } else if (this.playerCitizen) {
      this.playerCitizen.root.add(localTag);
    }

    this.cat = makeCat();
    this.cat.root.position.set(1.2, 0, 13.2);
    this.tuguWorldGroup.add(this.cat.root);

    this.spawnTuguCitizens();

    this.unsubscribeCitizen = useCitizenStore.subscribe((state) => {
      if (this.playerCitizen && state.profile?.avatarConfig) {
        const colors = resolveAvatarColors(state.profile.avatarConfig);
        this.playerCitizen.updateColors(colors);
      }
    });
  }

  private spawnTuguCitizens() {
    const tuguSpots: { pA: [number, number]; pB: [number, number]; isStationary?: boolean }[] = [
      { pA: [9.7, 9.7], pB: [9.7, 9.7], isStationary: true },
      { pA: [-9.7, 9.7], pB: [-9.7, 9.7], isStationary: true },
      { pA: [9.7, -9.7], pB: [9.7, -9.7], isStationary: true },
      { pA: [-9.7, -9.7], pB: [-9.7, -9.7], isStationary: true },
    ];

    const skinTones = ['#f5d0b0', '#e0ac69', '#8d5524', '#c68642', '#fcd5b5'];
    const hairColors = ['#1e293b', '#b45309', '#f59e0b', '#9333ea', '#ef4444', '#475569'];
    const shirtColors = ['#2563eb', '#10b981', '#f97316', '#8b5cf6', '#ef4444', '#ec4899', '#06b6d4'];
    const pantsColors = ['#1e293b', '#334155', '#1e3a8a', '#14532d', '#7c2d12'];
    const shoesColors = ['#f1f5f9', '#0f172a', '#78350f', '#dc2626'];
    const hairStyles = ['short', 'long', 'spiky', 'curly', 'bob'];

    this.tuguCitizens = [];
    tuguSpots.forEach((spot, i) => {
      const colors: CitizenAvatarColors = {
        skin: skinTones[i % skinTones.length],
        hair: hairColors[(i * 2) % hairColors.length],
        shirt: shirtColors[(i * 3) % shirtColors.length],
        pants: pantsColors[(i * 4) % pantsColors.length],
        shoes: shoesColors[i % shoesColors.length],
        hairStyle: hairStyles[i % hairStyles.length],
        accessory: i % 4 === 0 ? 'glasses' : i % 6 === 0 ? 'backpack' : null,
      };

      const instance = makeCitizen3D(colors);
      const pA = new THREE.Vector3(spot.pA[0], 0, spot.pA[1]);
      const pB = new THREE.Vector3(spot.pB[0], 0, spot.pB[1]);

      instance.root.position.copy(pA);
      this.tuguWorldGroup.add(instance.root);

      const dir = pB.clone().sub(pA);
      const facing = dir.lengthSq() > 0.001 ? Math.atan2(dir.x, dir.z) : -Math.PI / 2;
      instance.root.rotation.y = facing;

      this.tuguCitizens.push({
        instance,
        pA,
        pB,
        state: 'walk_to_B',
        timer: 0,
        speed: 1.2 + Math.random() * 0.4,
        facing,
        isStationary: spot.isStationary,
      });
    });
  }

  private setupCityLandmarkNPCs() {
    this.cityLandmarkNPCs = [];

    const specs: CityLandmarkNPCSpec[] = [
      // 1. Alun-Alun (Pusat Kota & Monumen)
      {
        id: 'alun_rian',
        name: 'Rian (Fotografer Alun-Alun)',
        role: 'Fotografer Wisata',
        location: 'alun_alun',
        colors: { skin: '#f5d0b0', hair: '#1e293b', hairStyle: 'short', shirt: '#2563eb', pants: '#1e293b', shoes: '#f1f5f9', accessory: 'glasses' },
        activity: 'photo',
        basePos: [-41, 0, -82],
        facing: -Math.PI * 0.85,
        phase: 0.2,
      },
      {
        id: 'alun_siti',
        name: 'Siti (Piknik Taman)',
        role: 'Warga Santai',
        location: 'alun_alun',
        colors: { skin: '#fcd5b5', hair: '#9333ea', hairStyle: 'long', shirt: '#ec4899', pants: '#fbcfe8', shoes: '#ffffff' },
        activity: 'sit',
        basePos: [-35.5, 0, -90],
        facing: -Math.PI * 0.4,
        phase: 1.5,
      },
      {
        id: 'alun_budi',
        name: 'Budi (Jalan Sore Alun-Alun)',
        role: 'Warga Pejalan Kaki',
        location: 'alun_alun',
        colors: { skin: '#e0ac69', hair: '#475569', hairStyle: 'spiky', shirt: '#10b981', pants: '#1e3a8a', shoes: '#334155' },
        activity: 'walk_patrol',
        basePos: [-46, 0, -84],
        targetPos: [-46, 0, -68],
        facing: 0,
        speed: 1.1,
        phase: 0.5,
      },
      {
        id: 'alun_nadia',
        name: 'Nadia (Pemandu Alun-Alun)',
        role: 'Pemandu Wisata',
        location: 'alun_alun',
        colors: { skin: '#f5d0b0', hair: '#b45309', hairStyle: 'bob', shirt: '#f97316', pants: '#f5d0b0', shoes: '#7c2d12', backpack: 'backpack' },
        activity: 'wave_greet',
        basePos: [-52, 0, -94],
        facing: Math.PI * 0.35,
        phase: 2.1,
      },
      {
        id: 'alun_dimas',
        name: 'Dimas (Jogging Sore)',
        role: 'Pelari Santai',
        location: 'alun_alun',
        colors: { skin: '#c68642', hair: '#1e293b', hairStyle: 'short', shirt: '#06b6d4', pants: '#0f172a', shoes: '#ef4444' },
        activity: 'walk_patrol',
        basePos: [-34, 0, -98],
        targetPos: [-34, 0, -88],
        facing: 0,
        speed: 1.7,
        phase: 3.2,
      },

      // 2. Rumah Ibadah (Kawasan Kerukunan: KERUK = -75, 0, -35)
      {
        id: 'ibadah_mansur',
        name: 'Ustadz Mansur (Imam Masjid)',
        role: 'Tokoh Agama',
        location: 'rumah_ibadah',
        colors: { skin: '#e0ac69', hair: '#1e293b', hairStyle: 'short', shirt: '#ffffff', pants: '#065f46', shoes: '#78350f' },
        activity: 'wave_greet',
        basePos: [-75, 0, -45],
        facing: 0,
        phase: 0.8,
      },
      {
        id: 'ibadah_anton',
        name: 'Pastor Anton (Gereja Damai)',
        role: 'Pemuka Agama',
        location: 'rumah_ibadah',
        colors: { skin: '#f5d0b0', hair: '#475569', hairStyle: 'short', shirt: '#334155', pants: '#1e293b', shoes: '#0f172a' },
        activity: 'idle_look',
        basePos: [-69.5, 0, -40],
        facing: -Math.PI * 0.6,
        phase: 1.2,
      },
      {
        id: 'ibadah_maria',
        name: 'Ibu Maria (Warga Kerukunan)',
        role: 'Jemaat Kerukunan',
        location: 'rumah_ibadah',
        colors: { skin: '#fcd5b5', hair: '#b45309', hairStyle: 'curly', shirt: '#c084fc', pants: '#f8fafc', shoes: '#e2e8f0' },
        activity: 'sit',
        basePos: [-78, 0, -33],
        facing: Math.PI * 0.5,
        phase: 2.7,
      },
      {
        id: 'ibadah_made',
        name: 'Bli Made (Pengurus Pura)',
        role: 'Tokoh Budaya',
        location: 'rumah_ibadah',
        colors: { skin: '#c68642', hair: '#1e293b', hairStyle: 'short', shirt: '#fde047', pants: '#ffffff', shoes: '#78350f' },
        activity: 'walk_patrol',
        basePos: [-79, 0, -28],
        targetPos: [-74, 0, -25],
        facing: Math.PI * 0.4,
        speed: 1.0,
        phase: 0.3,
      },
      {
        id: 'ibadah_aisyah',
        name: 'Aisyah (Relawan Kerukunan)',
        role: 'Relawan Pemuda',
        location: 'rumah_ibadah',
        colors: { skin: '#f5d0b0', hair: '#1e293b', hairStyle: 'long', shirt: '#a7f3d0', pants: '#fef3c7', shoes: '#f1f5f9', backpack: 'backpack' },
        activity: 'walk_patrol',
        basePos: [-71, 0, -33],
        targetPos: [-73, 0, -37],
        facing: -Math.PI * 0.5,
        speed: 0.9,
        phase: 1.9,
      },

      // 3. Universitas Netizen City (UNI = 58, 0, -80)
      {
        id: 'uni_hendra',
        name: 'Prof. Hendra (Rektorat UNC)',
        role: 'Dosen & Peneliti',
        location: 'universitas',
        colors: { skin: '#e0ac69', hair: '#475569', hairStyle: 'short', shirt: '#1e3a8a', pants: '#d97706', shoes: '#0f172a', accessory: 'glasses' },
        activity: 'idle_look',
        basePos: [58, 0, -86],
        facing: 0,
        phase: 0.4,
      },
      {
        id: 'uni_tiara',
        name: 'Tiara (Mahasiswi UNC)',
        role: 'Mahasiswi Berprestasi',
        location: 'universitas',
        colors: { skin: '#fcd5b5', hair: '#9333ea', hairStyle: 'long', shirt: '#fbbf24', pants: '#3b82f6', shoes: '#ffffff', backpack: 'backpack' },
        activity: 'sit',
        basePos: [55, 0, -78],
        facing: Math.PI * 0.3,
        phase: 1.6,
      },
      {
        id: 'uni_aldi',
        name: 'Aldi (Mahasiswa Teknik)',
        role: 'Mahasiswa UNC',
        location: 'universitas',
        colors: { skin: '#c68642', hair: '#1e293b', hairStyle: 'spiky', shirt: '#ef4444', pants: '#18181b', shoes: '#e4e4e7' },
        activity: 'walk_patrol',
        basePos: [62, 0, -84],
        targetPos: [62, 0, -72],
        facing: 0,
        speed: 1.2,
        phase: 2.5,
      },
      {
        id: 'uni_farhan',
        name: 'Farhan (Ketua BEM UNC)',
        role: 'Aktivis Kampus',
        location: 'universitas',
        colors: { skin: '#f5d0b0', hair: '#b45309', hairStyle: 'short', shirt: '#1e40af', pants: '#e2e8f0', shoes: '#713f12' },
        activity: 'wave_greet',
        basePos: [53, 0, -74],
        facing: -Math.PI * 0.4,
        phase: 3.1,
      },
      {
        id: 'uni_dina',
        name: 'Dina (Peneliti Muda)',
        role: 'Asisten Lab',
        location: 'universitas',
        colors: { skin: '#fcd5b5', hair: '#1e293b', hairStyle: 'bob', shirt: '#f8fafc', pants: '#0d9488', shoes: '#334155', accessory: 'glasses' },
        activity: 'walk_patrol',
        basePos: [65, 0, -80],
        targetPos: [72, 0, -80],
        facing: Math.PI / 2,
        speed: 1.1,
        phase: 0.7,
      },

      // 4. Bandara Internasional Netizen (AIR.term = 189, 0, -42)
      {
        id: 'air_arya',
        name: 'Kapten Arya (Pilot Netizen Air)',
        role: 'Pilot Komersial',
        location: 'bandara',
        colors: { skin: '#e0ac69', hair: '#1e293b', hairStyle: 'short', shirt: '#0f172a', pants: '#0f172a', shoes: '#020617', accessory: 'glasses' },
        activity: 'idle_look',
        basePos: [184, 0, -40],
        facing: Math.PI * 0.5,
        phase: 1.1,
      },
      {
        id: 'air_sari',
        name: 'Sari (Awak Kabin)',
        role: 'Pramugari Ramah',
        location: 'bandara',
        colors: { skin: '#fcd5b5', hair: '#b45309', hairStyle: 'long', shirt: '#be185d', pants: '#831843', shoes: '#0f172a' },
        activity: 'wave_greet',
        basePos: [186, 0, -38],
        facing: Math.PI * 0.2,
        phase: 2.3,
      },
      {
        id: 'air_joko',
        name: 'Pak Joko (Wisatawan Mancanegara)',
        role: 'Turis Kedatangan',
        location: 'bandara',
        colors: { skin: '#c68642', hair: '#475569', hairStyle: 'short', shirt: '#c2410c', pants: '#334155', shoes: '#78350f', backpack: 'backpack' },
        activity: 'walk_patrol',
        basePos: [178, 0, -44],
        targetPos: [187, 0, -44],
        facing: Math.PI / 2,
        speed: 1.0,
        phase: 0.9,
      },
      {
        id: 'air_kevin',
        name: 'Kevin (Backpacker)',
        role: 'Petualang Wisata',
        location: 'bandara',
        colors: { skin: '#f5d0b0', hair: '#9333ea', hairStyle: 'spiky', shirt: '#0284c7', pants: '#64748b', shoes: '#f8fafc', backpack: 'backpack' },
        activity: 'photo',
        basePos: [180, 0, -36],
        facing: -Math.PI * 0.25,
        phase: 1.8,
      },
      {
        id: 'air_budi',
        name: 'Budi (Ground Handling)',
        role: 'Staf Bandara',
        location: 'bandara',
        colors: { skin: '#8d5524', hair: '#1e293b', hairStyle: 'short', shirt: '#facc15', pants: '#1f2937', shoes: '#111827' },
        activity: 'idle_look',
        basePos: [195, 0, -45],
        facing: -Math.PI * 0.5,
        phase: 3.0,
      },

      // 5. Pantai Netizen Beach (Pesisir & Menara Pantai)
      {
        id: 'beach_bayu',
        name: 'Bayu (Lifeguard Pantai)',
        role: 'Penjaga Pantai',
        location: 'pantai',
        colors: { skin: '#c68642', hair: '#1e293b', hairStyle: 'short', shirt: '#ef4444', pants: '#ef4444', shoes: '#f59e0b', accessory: 'glasses' },
        activity: 'idle_look',
        basePos: [-209, 0, 177],
        facing: -Math.PI * 0.75,
        phase: 0.5,
      },
      {
        id: 'beach_cindy',
        name: 'Cindy (Wisatawan Pantai)',
        role: 'Wisatawan Santai',
        location: 'pantai',
        colors: { skin: '#fcd5b5', hair: '#b45309', hairStyle: 'long', shirt: '#fde047', pants: '#2dd4bf', shoes: '#ffffff' },
        activity: 'sit',
        basePos: [-213, 0, 172],
        facing: -Math.PI * 0.6,
        phase: 1.4,
      },
      {
        id: 'beach_rangga',
        name: 'Rangga (Pencari Kerang)',
        role: 'Pecinta Alam Pesisir',
        location: 'pantai',
        colors: { skin: '#e0ac69', hair: '#1e293b', hairStyle: 'spiky', shirt: '#38bdf8', pants: '#f8fafc', shoes: '#78350f' },
        activity: 'walk_patrol',
        basePos: [-221, 0, 170],
        targetPos: [-217, 0, 180],
        facing: Math.PI * 0.3,
        speed: 1.1,
        phase: 2.2,
      },
      {
        id: 'beach_maya',
        name: 'Maya (Piknik Pantai)',
        role: 'Wisatawan Kuliner',
        location: 'pantai',
        colors: { skin: '#f5d0b0', hair: '#9333ea', hairStyle: 'bob', shirt: '#fb7185', pants: '#d97706', shoes: '#78350f' },
        activity: 'sit',
        basePos: [-214, 0, 166],
        facing: -Math.PI * 0.4,
        phase: 0.1,
      },
      {
        id: 'beach_geri',
        name: 'Geri (Sunset Chaser)',
        role: 'Fotografer Alam',
        location: 'pantai',
        colors: { skin: '#f5d0b0', hair: '#475569', hairStyle: 'short', shirt: '#fef3c7', pants: '#d97706', shoes: '#78350f', accessory: 'glasses' },
        activity: 'photo',
        basePos: [-217, 0, 164],
        facing: -Math.PI * 0.8,
        phase: 2.9,
      },
    ];

    specs.forEach((spec) => {
      const instance = makeCitizen3D(spec.colors);
      const basePos = new THREE.Vector3(...spec.basePos);
      const targetPos = spec.targetPos ? new THREE.Vector3(...spec.targetPos) : undefined;

      instance.root.position.copy(basePos);
      instance.root.rotation.y = spec.facing;

      // Disable frustum culling on child meshes so they don't vanish on screen edges
      instance.root.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          obj.frustumCulled = false;
        }
      });

      // Pose adjustments for sitting or holding camera
      if (spec.activity === 'sit') {
        instance.leftLeg.rotation.x = -Math.PI / 2.2;
        instance.rightLeg.rotation.x = -Math.PI / 2.2;
        instance.body.position.y = -0.16;
        instance.leftArm.rotation.x = -0.3;
        instance.rightArm.rotation.x = -0.3;
      } else if (spec.activity === 'photo') {
        instance.leftArm.rotation.x = -1.2;
        instance.rightArm.rotation.x = -1.2;
        instance.leftArm.rotation.z = 0.35;
        instance.rightArm.rotation.z = -0.35;
      }

      // Add hovering nametag
      const nameTag = makeNameTagSprite(spec.name, false, false);
      nameTag.position.set(0, 1.5, 0);
      nameTag.scale.set(3.4, 0.78, 1);
      instance.root.add(nameTag);

      this.cityWorldGroup.add(instance.root);

      this.cityLandmarkNPCs.push({
        id: spec.id,
        name: spec.name,
        role: spec.role,
        location: spec.location,
        instance,
        nameTag,
        activity: spec.activity,
        basePos,
        targetPos,
        facing: spec.facing,
        speed: spec.speed || 1.0,
        phase: spec.phase || 0,
      });
    });
  }

  private updateCityLandmarkNPCs(delta: number, elapsed: number) {
    if (this.viewMode !== 'city' || this.cityLandmarkNPCs.length === 0) return;

    for (let i = 0; i < this.cityLandmarkNPCs.length; i++) {
      const npc = this.cityLandmarkNPCs[i];
      const { instance, activity, basePos, targetPos, speed, phase, facing } = npc;

      // Handle speech bubble lifespan
      if (npc.bubble) {
        npc.bubbleTimer = (npc.bubbleTimer || 0) - delta;
        if (npc.bubbleTimer <= 0) {
          instance.root.remove(npc.bubble);
          npc.bubble = null;
        }
      }

      if (activity === 'walk_patrol' && targetPos) {
        const t = (Math.sin(elapsed * speed + phase) + 1) * 0.5;
        instance.root.position.lerpVectors(basePos, targetPos, t);

        const movingTowardsTarget = Math.cos(elapsed * speed + phase) > 0;
        const targetYaw = movingTowardsTarget
          ? Math.atan2(targetPos.x - basePos.x, targetPos.z - basePos.z)
          : Math.atan2(basePos.x - targetPos.x, basePos.z - targetPos.z);
        instance.root.rotation.y = targetYaw;

        instance.pose(true, elapsed, 4.0);
      } else if (activity === 'sit') {
        const breath = Math.sin(elapsed * 1.8 + phase) * 0.015;
        instance.body.position.y = -0.16 + breath;
        instance.head.rotation.y = Math.sin(elapsed * 0.7 + phase) * 0.28;
      } else if (activity === 'wave_greet') {
        instance.pose(false, elapsed);
        const wave = Math.sin(elapsed * 1.8 + phase);
        if (wave > 0.2) {
          instance.rightArm.rotation.x = -0.2;
          instance.rightArm.rotation.z = Math.PI - 0.5 + Math.sin(elapsed * 8) * 0.35;
        } else {
          instance.rightArm.rotation.z = THREE.MathUtils.lerp(instance.rightArm.rotation.z, 0, 0.1);
        }
        instance.head.rotation.y = Math.sin(elapsed * 0.8 + phase) * 0.2;
      } else if (activity === 'photo') {
        instance.leftArm.rotation.x = -1.2 + Math.sin(elapsed * 1.2 + phase) * 0.05;
        instance.rightArm.rotation.x = -1.2 + Math.sin(elapsed * 1.2 + phase) * 0.05;
        instance.head.rotation.x = -0.15 + Math.sin(elapsed * 0.9 + phase) * 0.08;
        instance.head.rotation.y = Math.sin(elapsed * 0.5 + phase) * 0.15;
        instance.body.position.y = Math.sin(elapsed * 1.5 + phase) * 0.01;
      } else {
        instance.pose(false, elapsed);
        instance.root.rotation.y = facing + Math.sin(elapsed * 0.6 + phase) * 0.3;
        instance.head.rotation.y = Math.sin(elapsed * 0.9 + phase) * 0.25;
      }
    }

    // Occasional ambient dialog bubbles from city NPCs
    this.cityNPCBubbleTimer -= delta;
    if (this.cityNPCBubbleTimer <= 0) {
      this.cityNPCBubbleTimer = 5.0 + Math.random() * 4.0;
      this.triggerRandomCityNPCBubble();
    }
  }

  private triggerRandomCityNPCBubble() {
    if (this.cityLandmarkNPCs.length === 0) return;
    const available = this.cityLandmarkNPCs.filter((c) => !c.bubble);
    if (available.length === 0) return;

    const npc = available[Math.floor(Math.random() * available.length)];
    const dialogues = CITY_LANDMARK_DIALOGUES[npc.location] || [
      'Netizen City kotaku tercinta!',
      'Suasananya menyenangkan sekali hari ini!',
    ];
    const text = dialogues[Math.floor(Math.random() * dialogues.length)];

    const bubble = makeSpeechBubbleSprite(text, '#FFFDF9', '#343B35');
    bubble.position.set(0, 2.3, 0);
    npc.instance.root.add(bubble);
    npc.bubble = bubble;
    npc.bubbleTimer = 5.0;
  }

  public updateGatePopulation(count: number) {
    if (this.gateBoard) {
      this.gateBoard.set(count.toLocaleString('id-ID'));
    }
  }

  public enterTuguArea() {
    this.viewMode = 'tugu';
    this.cityWorldGroup.visible = false;
    this.riverWorldGroup.visible = false;
    this.tuguWorldGroup.visible = true;

    // Slight random spawn offset so multiple entering citizens do not overlap identically
    const spawnOffsetX = (Math.random() - 0.5) * 5;
    const spawnOffsetZ = (Math.random() - 0.5) * 2;
    this.playerPos.set(spawnOffsetX, 0, 13 + spawnOffsetZ);
    this.playerFacing = Math.PI;

    if (this.playerCitizen) {
      this.tuguWorldGroup.add(this.playerCitizen.root);
      this.playerCitizen.root.position.copy(this.playerPos);
      this.playerCitizen.root.rotation.y = this.playerFacing;
      this.playerCitizen.root.visible = true;
      if (this.fishingRodGroup) {
        this.fishingRodGroup.visible = false;
        this.fishingRodGroup.parent?.remove(this.fishingRodGroup);
      }
    }
    if (this.mayorPlayer) {
      this.tuguWorldGroup.add(this.mayorPlayer.root);
      this.mayorPlayer.root.position.copy(this.playerPos);
      this.mayorPlayer.root.rotation.y = this.playerFacing;
      this.mayorPlayer.root.visible = true;
    }
    if (this.cat) {
      this.tuguWorldGroup.add(this.cat.root);
      this.cat.root.position.set(1.2, 0, 13.2);
      this.cat.root.visible = true;
    }
    if (this.mayorNPC?.root) {
      this.mayorNPC.root.visible = true;
    }

    this.tuguCitizens.forEach((wc) => (wc.instance.root.visible = true));

    this.cameraMode = 'follow';
    this.onCameraModeChange?.('follow');
    this.target.copy(this.playerPos).add(new THREE.Vector3(0, 1.4, 0));
    this.spherical.radius = 18;
    this.spherical.phi = Math.PI / 3.4;
    this.spherical.theta = this.playerFacing + Math.PI;
    this.updateCameraTransform();

    // Re-apply time of day atmosphere to Tugu scene
    this.applyTimeOfDay(this.timeOfDay);

    useGameStore.getState().setViewMode('tugu');
    useGameStore.getState().setSelectedBuilding('monument');
    useGameStore.getState().setCurrentDistrict('Pusat Kota');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tugu-mode-changed', { detail: { mode: 'tugu' } }));
    }
  }

  public updateRemotePlayers(
    players: Array<{
      id: string;
      name: string;
      isGuest: boolean;
      x: number;
      z: number;
      facing: number;
      avatarConfig?: any;
      isFishing?: boolean;
      isMoving?: boolean;
      lastChat?: { id?: string; text: string; time: number };
    }>,
    myClientId: string
  ) {
    if (this.viewMode !== 'tugu' && this.viewMode !== 'river' && this.viewMode !== 'beach') return;

    const activeIds = new Set<string>();
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const nowMs = Date.now();
    const isRiver = this.viewMode === 'river';
    const isBeach = this.viewMode === 'beach';
    const isFishingMode = isRiver || isBeach;
    const activeGroup = isBeach ? this.beachWorldGroup : isRiver ? this.riverWorldGroup : this.tuguWorldGroup;

    for (const p of players) {
      if (!p || !p.id || p.id === myClientId) continue; // Don't duplicate local player
      if (typeof p.x !== 'number' || typeof p.z !== 'number' || !Number.isFinite(p.x) || !Number.isFinite(p.z)) continue;
      activeIds.add(p.id);

      const existing = this.remotePlayers.get(p.id);
      if (existing) {
        existing.missingSince = 0; // Reset missing timer
        const targetY = isFishingMode && p.z < 2.5 ? 0.35 : 0;
        const targetV = new THREE.Vector3(p.x, targetY, p.z);
        const dist = existing.root.position.distanceTo(targetV);
        existing.lastServerTime = now;
        existing.isMoving = Boolean(p.isMoving);

        // If distance is large (e.g. initial spawn or teleport > 6.0 units), snap immediately
        if (dist > 6.0) {
          existing.root.position.copy(targetV);
          existing.targetPos.copy(targetV);
          existing.root.rotation.y = p.facing;
          existing.targetFacing = p.facing;
        } else {
          existing.targetPos.copy(targetV);
          if (typeof p.facing === 'number' && Number.isFinite(p.facing)) {
            existing.targetFacing = p.facing;
          }
        }

        // Update fishing state & nametag if changed
        if (typeof p.isFishing === 'boolean' && p.isFishing !== existing.isFishing) {
          existing.isFishing = p.isFishing;
          existing.root.remove(existing.nameTag);
          existing.nameTag = makeNameTagSprite(p.name, p.isGuest, false, p.isFishing);
          existing.nameTag.position.set(0, 1.55, 0);
          existing.root.add(existing.nameTag);
        }

        // Display new chat speech bubbles with reliable ID matching
        if (p.lastChat && p.lastChat.text) {
          const chatId = p.lastChat.id || `msg_${p.lastChat.time || 0}_${p.lastChat.text}`;
          if (chatId !== existing.lastChatId) {
            existing.lastChatId = chatId;
            existing.lastChatTime = p.lastChat.time || nowMs;
            if (existing.bubble) {
              existing.root.remove(existing.bubble);
              existing.bubble = null;
            }
            const bubble = makeSpeechBubbleSprite(p.lastChat.text, '#FFFDF9', '#343B35');
            bubble.position.set(0, 2.15, 0);
            existing.root.add(bubble);
            existing.bubble = bubble;
            existing.bubbleTimer = 6.0;
          }
        }
      } else {
        // Spawn new remote citizen
        const colors = resolveAvatarColors(p.avatarConfig);
        const citizen = makeCitizen3D(colors);
        // Disable frustum culling so Three.js never clips or hides avatar meshes during rotation
        citizen.root.traverse((obj) => {
          if ((obj as THREE.Mesh).isMesh) {
            obj.frustumCulled = false;
          }
        });

        const targetY = isFishingMode && p.z < 2.5 ? 0.35 : 0;
        citizen.root.position.set(p.x, targetY, p.z);
        citizen.root.rotation.y = typeof p.facing === 'number' && Number.isFinite(p.facing) ? p.facing : 0;

        // Add nametag (with 🎣 indicator if currently fishing)
        const nameTag = makeNameTagSprite(p.name, p.isGuest, false, Boolean(p.isFishing));
        nameTag.position.set(0, 1.55, 0);
        citizen.root.add(nameTag);

        let anglerRodTip: THREE.Object3D | undefined;
        let remoteBobber: THREE.Group | undefined;
        let remoteLine: THREE.Line | undefined;

        // In River & Beach modes, attach low-poly angler rod to right hand & prepare 3D line + bobber!
        if (isFishingMode) {
          const rod = this.createAnglerRod();
          rod.group.position.set(0, -0.32, 0.05);
          rod.group.rotation.set(1.2, 0, 0);
          citizen.rightArm.add(rod.group);
          anglerRodTip = rod.tip;

          remoteBobber = this.createRemoteBobber();
          activeGroup.add(remoteBobber);

          remoteLine = this.createRemoteFishingLine();
          activeGroup.add(remoteLine);
        }

        // Check if newly spawned player has an active recent speech bubble!
        let initialBubble: THREE.Sprite | null = null;
        let initialBubbleTimer = 0;
        const initialChatId = p.lastChat?.id || (p.lastChat?.text ? `msg_${p.lastChat.time || 0}_${p.lastChat.text}` : undefined);
        const chatTime = p.lastChat?.time || 0;
        if (p.lastChat && p.lastChat.text && (nowMs - chatTime < 8000 || chatTime === 0)) {
          initialBubble = makeSpeechBubbleSprite(p.lastChat.text, '#FFFDF9', '#343B35');
          initialBubble.position.set(0, 2.15, 0);
          citizen.root.add(initialBubble);
          initialBubbleTimer = 6.0;
        }

        activeGroup.add(citizen.root);

        this.remotePlayers.set(p.id, {
          root: citizen.root,
          citizen,
          targetPos: new THREE.Vector3(p.x, targetY, p.z),
          targetFacing: p.facing,
          nameTag,
          bubble: initialBubble,
          bubbleTimer: initialBubbleTimer,
          lastChatTime: chatTime,
          lastChatId: initialChatId,
          lastServerTime: now,
          missingSince: 0,
          isFishing: Boolean(p.isFishing),
          isMoving: Boolean(p.isMoving),
          fishingLine: remoteLine,
          bobber: remoteBobber,
          rodTip: anglerRodTip,
        });
      }
    }

    // Graceful disconnect: Only remove remote players if missing for 4.0 consecutive seconds!
    // Prevents sudden glitching / blinking / disappearing on packet jitter or dropped frames
    for (const [id, remote] of this.remotePlayers.entries()) {
      if (activeIds.has(id)) {
        remote.missingSince = 0;
      } else {
        if (!remote.missingSince) {
          remote.missingSince = nowMs;
        } else if (nowMs - remote.missingSince > 4000) {
          if (remote.bobber) {
            this.riverWorldGroup.remove(remote.bobber);
            this.beachWorldGroup.remove(remote.bobber);
          }
          if (remote.fishingLine) {
            this.riverWorldGroup.remove(remote.fishingLine);
            this.beachWorldGroup.remove(remote.fishingLine);
          }
          this.tuguWorldGroup.remove(remote.root);
          this.riverWorldGroup.remove(remote.root);
          this.beachWorldGroup.remove(remote.root);
          this.remotePlayers.delete(id);
        }
      }
    }
  }

  public clearRemotePlayers() {
    for (const [, remote] of this.remotePlayers.entries()) {
      if (remote.bobber) {
        this.riverWorldGroup.remove(remote.bobber);
        this.beachWorldGroup.remove(remote.bobber);
      }
      if (remote.fishingLine) {
        this.riverWorldGroup.remove(remote.fishingLine);
        this.beachWorldGroup.remove(remote.fishingLine);
      }
      this.tuguWorldGroup.remove(remote.root);
      this.riverWorldGroup.remove(remote.root);
      this.beachWorldGroup.remove(remote.root);
    }
    this.remotePlayers.clear();
  }

  private createAnglerRod(): { group: THREE.Group; tip: THREE.Object3D } {
    const rodGroup = new THREE.Group();
    rodGroup.name = 'RemoteAnglerRod';

    const handleMat = new THREE.MeshStandardMaterial({ color: '#8B5A2B', roughness: 0.8 });
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.018, 0.28, 6), handleMat);
    rodGroup.add(handle);

    const reelMat = new THREE.MeshStandardMaterial({ color: '#D4AF37', metalness: 0.8, roughness: 0.2 });
    const reel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.03, 8), reelMat);
    reel.rotation.z = Math.PI / 2;
    reel.position.set(0.03, 0.08, 0);
    rodGroup.add(reel);

    const blankMat = new THREE.MeshStandardMaterial({ color: '#2B4C3F', roughness: 0.4 });
    const blank = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.014, 1.8, 6), blankMat);
    blank.position.set(0, 1.05, 0);
    rodGroup.add(blank);

    // Tip marker for exact 3D line anchoring
    const tip = new THREE.Object3D();
    tip.position.set(0, 1.95, 0);
    rodGroup.add(tip);

    return { group: rodGroup, tip };
  }

  private createRemoteBobber(): THREE.Group {
    const bobber = new THREE.Group();
    bobber.name = 'RemoteBobber';
    const redMat = new THREE.MeshStandardMaterial({ color: '#EF4444', roughness: 0.3 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.3 });

    const topHemisphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 8, 0, Math.PI * 2, 0, Math.PI / 2),
      redMat
    );
    const bottomHemisphere = new THREE.Mesh(
      new THREE.SphereGeometry(0.09, 8, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
      whiteMat
    );
    const bobberPin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.22, 6),
      new THREE.MeshStandardMaterial({ color: '#1F2937' })
    );
    bobber.add(topHemisphere, bottomHemisphere, bobberPin);
    bobber.position.set(0, -0.05, 0);
    bobber.visible = false;
    return bobber;
  }

  private createRemoteFishingLine(): THREE.Line {
    const linePositions = new Float32Array(8 * 3);
    const lineGeom = new THREE.BufferGeometry();
    const linePosAttr = new THREE.BufferAttribute(linePositions, 3);
    linePosAttr.setUsage(THREE.DynamicDrawUsage);
    lineGeom.setAttribute('position', linePosAttr);
    const lineMat = new THREE.LineBasicMaterial({
      color: '#FFFFFF',
      transparent: true,
      opacity: 0.9,
      depthTest: true,
      depthWrite: false,
    });
    const line = new THREE.Line(lineGeom, lineMat);
    line.frustumCulled = false;
    line.visible = false;
    return line;
  }

  private updateRemotePlayersAnimation(delta: number, elapsed: number) {
    const isRiver = this.viewMode === 'river';
    for (const [, remote] of this.remotePlayers.entries()) {
      // 1. Dead Reckoning: Extrapolate targetPos forward between network packets while moving
      if (remote.isMoving) {
        const extrapolateSpeed = 4.2;
        remote.targetPos.x += Math.sin(remote.targetFacing) * extrapolateSpeed * delta;
        remote.targetPos.z += Math.cos(remote.targetFacing) * extrapolateSpeed * delta;

        // Keep extrapolated target within safe bounds
        if (isRiver) {
          remote.targetPos.x = Math.max(-3.5, Math.min(3.5, remote.targetPos.x));
          remote.targetPos.z = Math.max(-18.0, Math.min(4.0, remote.targetPos.z));
        } else {
          remote.targetPos.x = Math.max(-35.0, Math.min(35.0, remote.targetPos.x));
          remote.targetPos.z = Math.max(-35.0, Math.min(35.0, remote.targetPos.z));
        }
      }

      const cur = remote.root.position;
      const target = remote.targetPos;
      const dist = cur.distanceTo(target);

      // Smooth exponential damping towards target position (silky smooth, no dashing or stopping)
      const smoothFactor = Math.min(1.0, delta * 9.0);
      cur.x += (target.x - cur.x) * smoothFactor;
      cur.y += (target.y - cur.y) * smoothFactor;
      cur.z += (target.z - cur.z) * smoothFactor;

      const isPlayerWalking = Boolean(remote.isMoving) || dist > 0.06;

      // 2. Smooth shortest-arc rotation towards movement direction or target facing
      let targetAngle = remote.targetFacing;
      const dirX = target.x - cur.x;
      const dirZ = target.z - cur.z;
      if (dist > 0.08 && Math.hypot(dirX, dirZ) > 0.04) {
        targetAngle = Math.atan2(dirX, dirZ);
      }

      const angleDiff = Math.atan2(
        Math.sin(targetAngle - remote.root.rotation.y),
        Math.cos(targetAngle - remote.root.rotation.y)
      );
      remote.root.rotation.y += angleDiff * Math.min(1.0, delta * 9.0);

      // 3. Pose animation: walking vs idle vs fishing
      if (remote.isFishing) {
        // While fishing, citizen stance is held steady (rod forward towards river)
        // Legs & body step if moving, but arms hold angling posture
        remote.citizen.pose(isPlayerWalking, elapsed, 4.5);
        remote.citizen.rightArm.rotation.set(-1.15, 0.15, -0.05);
        remote.citizen.leftArm.rotation.set(-0.85, 0.45, 0.1);
      } else {
        remote.citizen.pose(isPlayerWalking, elapsed, 4.5);
      }

      // 4. Fishing Visuals for Remote Players (River & Beach)
      if ((this.viewMode === 'river' || this.viewMode === 'beach') && remote.rodTip && remote.bobber && remote.fishingLine) {
        if (remote.isFishing) {
          remote.bobber.visible = true;
          remote.fishingLine.visible = true;

          // Position bobber ~4.5 units in front of avatar in water
          const facing = remote.root.rotation.y;
          const forwardX = Math.sin(facing);
          const forwardZ = Math.cos(facing);
          const bobberWaveY = -0.05 + Math.sin(elapsed * 3.5 + cur.x) * 0.025;

          const targetBobberX = cur.x + forwardX * 4.5;
          const targetBobberZ = cur.z + forwardZ * 4.5;
          remote.bobber.position.set(targetBobberX, bobberWaveY, targetBobberZ);

          // Update 3D fishing line curve from rod tip to bobber
          remote.rodTip.updateWorldMatrix(true, false);
          const rodTipWorld = new THREE.Vector3();
          remote.rodTip.getWorldPosition(rodTipWorld);
          this.activeFishingWorldGroup.worldToLocal(rodTipWorld);

          const endPos = new THREE.Vector3(targetBobberX, bobberWaveY + 0.12, targetBobberZ);
          const midPos = rodTipWorld.clone().lerp(endPos, 0.5);
          midPos.y -= 0.18; // Natural catenary line sag

          const curve = new THREE.QuadraticBezierCurve3(rodTipWorld, midPos, endPos);
          const points = curve.getPoints(7); // 8 points
          const posAttr = remote.fishingLine.geometry.attributes.position as THREE.BufferAttribute;
          for (let i = 0; i < points.length; i++) {
            posAttr.setXYZ(i, points[i].x, points[i].y, points[i].z);
          }
          posAttr.needsUpdate = true;
          remote.fishingLine.geometry.computeBoundingSphere();
        } else {
          // Not fishing: reset rod to resting side pose if stopped
          if (dist <= 0.05) {
            remote.citizen.rightArm.rotation.set(-0.55, 0.1, 0);
            remote.citizen.leftArm.rotation.set(0, 0, 0);
          }
          remote.bobber.visible = false;
          remote.fishingLine.visible = false;
        }
      }

      // 5. Speech Bubble Lifespan
      if (remote.bubble) {
        remote.bubbleTimer = (remote.bubbleTimer || 0) - delta;
        if (remote.bubbleTimer <= 0) {
          remote.root.remove(remote.bubble);
          remote.bubble = null;
        }
      }
    }
  }

  public getPlayerTuguState(): { x: number; z: number; facing: number; isMoving: boolean } {
    const root = this.isPlayerAdmin ? this.mayorPlayer?.root : this.playerCitizen?.root;
    if (!root) {
      return { x: this.playerPos.x, z: this.playerPos.z, facing: this.playerFacing, isMoving: Boolean(this.isPlayerWalking) };
    }
    return {
      x: root.position.x,
      z: root.position.z,
      facing: root.rotation.y,
      isMoving: Boolean(this.isPlayerWalking),
    };
  }

  public exitTuguArea() {
    this.viewMode = 'city';
    this.targetPosition = null;

    this.clearRemotePlayers();

    this.tuguWorldGroup.visible = false;
    this.riverWorldGroup.visible = false;
    this.cityWorldGroup.visible = true;

    if (this.playerCitizen) this.playerCitizen.root.visible = false;
    if (this.mayorPlayer) this.mayorPlayer.root.visible = false;
    if (this.cat) this.cat.root.visible = false;
    if (this.mayorNPC?.root) this.mayorNPC.root.visible = false;

    this.tuguCitizens.forEach((wc) => (wc.instance.root.visible = false));

    this.cameraMode = 'orbit';
    this.onCameraModeChange?.('orbit');
    this.target.set(0, 0, 0);
    this.spherical.radius = 120;
    this.spherical.phi = Math.PI / 3.5;
    this.spherical.theta = Math.PI * 0.75;
    this.updateCameraTransform();

    // Re-apply time of day atmosphere to main city
    this.applyTimeOfDay(this.timeOfDay);

    useGameStore.getState().setViewMode('city');
    useGameStore.getState().setSelectedBuilding(null);
    useGameStore.getState().setCurrentDistrict('town_square');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tugu-mode-changed', { detail: { mode: 'city' } }));
    }
  }

  public enterRiverArea() {
    this.clearRemotePlayers();
    this.viewMode = 'river';
    this.cityWorldGroup.visible = false;
    this.tuguWorldGroup.visible = false;
    this.beachWorldGroup.visible = false;
    this.riverWorldGroup.visible = true;

    // Reparent fishing gear to riverWorldGroup
    if (this.fishingBobber) this.riverWorldGroup.add(this.fishingBobber);
    if (this.fishingLine) this.riverWorldGroup.add(this.fishingLine);
    if (this.caughtFishMesh) this.riverWorldGroup.add(this.caughtFishMesh);

    // Spawn player avatar on the pier facing North towards the river
    this.playerPos.set(0, 0.35, -5.5);
    this.playerFacing = Math.PI;

    if (this.playerCitizen) {
      this.riverWorldGroup.add(this.playerCitizen.root);
      this.playerCitizen.root.position.copy(this.playerPos);
      this.playerCitizen.root.rotation.y = this.playerFacing;
      this.playerCitizen.root.visible = true;

      // Attach rod directly to citizen's right hand!
      if (this.fishingRodGroup) {
        this.playerCitizen.rightArm.add(this.fishingRodGroup);
        // Hand sphere center is at y = -0.32 in rightArm
        this.fishingRodGroup.position.set(0, -0.32, 0.05);
        // Tilt rod forward in a natural ready angling pose (forward and angled upward into the water)
        this.fishingRodGroup.rotation.set(1.2, 0, 0);
        this.fishingRodGroup.visible = true;
      }
      // Set initial arm pose: reaching forward holding rod with both hands
      this.playerCitizen.rightArm.rotation.set(-0.55, -0.1, 0);
      this.playerCitizen.leftArm.rotation.set(-0.45, 0.3, 0);
    }
    if (this.mayorPlayer) {
      if (this.isPlayerAdmin) {
        this.riverWorldGroup.add(this.mayorPlayer.root);
        this.mayorPlayer.root.position.copy(this.playerPos);
        this.mayorPlayer.root.rotation.y = this.playerFacing;
        this.mayorPlayer.root.visible = true;
        if (this.playerCitizen) this.playerCitizen.root.visible = false;
      } else {
        this.mayorPlayer.root.visible = false;
      }
    }
    if (this.cat) {
      this.riverWorldGroup.add(this.cat.root);
      this.cat.root.position.set(1.2, 0.35, -5.2);
      this.cat.root.visible = true;
    }

    this.resetFishing();

    this.cameraMode = 'follow';
    this.onCameraModeChange?.('follow');
    this.target.copy(this.playerPos).add(new THREE.Vector3(0, 1.2, 0));
    this.spherical.radius = 16;
    this.spherical.phi = Math.PI / 3.4;
    this.spherical.theta = this.playerFacing + Math.PI;
    this.updateCameraTransform();

    this.applyTimeOfDay(this.timeOfDay);

    useGameStore.getState().setViewMode('river');
    useGameStore.getState().setSelectedBuilding('river_spot');
    useGameStore.getState().setCurrentDistrict('Kawasan Alam');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('river-mode-changed', { detail: { mode: 'river' } }));
      window.dispatchEvent(new CustomEvent('river-fishing-state', { detail: { state: 'idle' } }));
    }
  }

  public exitRiverArea() {
    this.clearRemotePlayers();
    this.resetFishing();
    this.viewMode = 'city';
    this.targetPosition = null;

    if (this.fishingRodGroup) {
      this.fishingRodGroup.visible = false;
      this.fishingRodGroup.parent?.remove(this.fishingRodGroup);
    }

    this.riverWorldGroup.visible = false;
    this.beachWorldGroup.visible = false;
    this.tuguWorldGroup.visible = false;
    this.cityWorldGroup.visible = true;

    if (this.playerCitizen) this.playerCitizen.root.visible = false;
    if (this.mayorPlayer) this.mayorPlayer.root.visible = false;
    if (this.cat) this.cat.root.visible = false;

    this.cameraMode = 'orbit';
    this.onCameraModeChange?.('orbit');
    this.target.set(0, 0, 0);
    this.spherical.radius = 120;
    this.spherical.phi = Math.PI / 3.5;
    this.spherical.theta = Math.PI * 0.75;
    this.updateCameraTransform();

    this.applyTimeOfDay(this.timeOfDay);

    useGameStore.getState().setViewMode('city');
    useGameStore.getState().setSelectedBuilding(null);
    useGameStore.getState().setCurrentDistrict('town_square');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('river-mode-changed', { detail: { mode: 'city' } }));
    }
  }

  public enterBeachArea() {
    this.clearRemotePlayers();
    this.viewMode = 'beach';
    this.cityWorldGroup.visible = false;
    this.tuguWorldGroup.visible = false;
    this.riverWorldGroup.visible = false;
    this.stadiumWorldGroup.visible = false;
    this.beachWorldGroup.visible = true;

    // Reparent fishing gear to beachWorldGroup
    if (this.fishingBobber) this.beachWorldGroup.add(this.fishingBobber);
    if (this.fishingLine) this.beachWorldGroup.add(this.fishingLine);
    if (this.caughtFishMesh) this.beachWorldGroup.add(this.caughtFishMesh);

    // Spawn player avatar on the wooden angling pier facing West towards open ocean
    this.playerPos.set(-8.0, 0.35, 28.0);
    this.playerFacing = -Math.PI / 2;

    if (this.playerCitizen) {
      this.beachWorldGroup.add(this.playerCitizen.root);
      this.playerCitizen.root.position.copy(this.playerPos);
      this.playerCitizen.root.rotation.y = this.playerFacing;
      this.playerCitizen.root.visible = true;

      if (this.fishingRodGroup) {
        this.playerCitizen.rightArm.add(this.fishingRodGroup);
        this.fishingRodGroup.position.set(0, -0.32, 0.05);
        this.fishingRodGroup.rotation.set(1.2, 0, 0);
        this.fishingRodGroup.visible = true;
      }
      this.playerCitizen.rightArm.rotation.set(-0.55, -0.1, 0);
      this.playerCitizen.leftArm.rotation.set(-0.45, 0.3, 0);
    }
    if (this.mayorPlayer) {
      if (this.isPlayerAdmin) {
        this.beachWorldGroup.add(this.mayorPlayer.root);
        this.mayorPlayer.root.position.copy(this.playerPos);
        this.mayorPlayer.root.rotation.y = this.playerFacing;
        this.mayorPlayer.root.visible = true;
        if (this.playerCitizen) this.playerCitizen.root.visible = false;
      } else {
        this.mayorPlayer.root.visible = false;
      }
    }
    if (this.cat) {
      this.beachWorldGroup.add(this.cat.root);
      this.cat.root.position.set(-6.8, 0.35, 28.8);
      this.cat.root.visible = true;
    }

    this.resetFishing();

    this.cameraMode = 'follow';
    this.onCameraModeChange?.('follow');
    this.target.copy(this.playerPos).add(new THREE.Vector3(0, 1.2, 0));
    this.spherical.radius = 16;
    this.spherical.phi = Math.PI / 3.4;
    this.spherical.theta = this.playerFacing + Math.PI;
    this.updateCameraTransform();

    this.applyTimeOfDay(this.timeOfDay);

    useGameStore.getState().setViewMode('beach');
    useGameStore.getState().setSelectedBuilding('netizen_beach');
    useGameStore.getState().setCurrentDistrict('Pantai Netizen Beach');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('beach-mode-changed', { detail: { mode: 'beach' } }));
      window.dispatchEvent(new CustomEvent('river-fishing-state', { detail: { state: 'idle' } }));
    }
  }

  public exitBeachArea() {
    this.clearRemotePlayers();
    this.resetFishing();
    this.viewMode = 'city';
    this.targetPosition = null;

    if (this.fishingRodGroup) {
      this.fishingRodGroup.visible = false;
      this.fishingRodGroup.parent?.remove(this.fishingRodGroup);
    }

    this.beachWorldGroup.visible = false;
    this.riverWorldGroup.visible = false;
    this.tuguWorldGroup.visible = false;
    this.stadiumWorldGroup.visible = false;
    this.cityWorldGroup.visible = true;

    if (this.playerCitizen) this.playerCitizen.root.visible = false;
    if (this.mayorPlayer) this.mayorPlayer.root.visible = false;
    if (this.cat) this.cat.root.visible = false;

    this.cameraMode = 'orbit';
    this.onCameraModeChange?.('orbit');
    this.target.set(0, 0, 0);
    this.spherical.radius = 120;
    this.spherical.phi = Math.PI / 3.5;
    this.spherical.theta = Math.PI * 0.75;
    this.updateCameraTransform();

    this.applyTimeOfDay(this.timeOfDay);

    useGameStore.getState().setViewMode('city');
    useGameStore.getState().setSelectedBuilding(null);
    useGameStore.getState().setCurrentDistrict('town_square');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('beach-mode-changed', { detail: { mode: 'city' } }));
    }
  }

  public enterStadiumArea() {
    this.viewMode = 'stadium';
    this.cityWorldGroup.visible = false;
    this.tuguWorldGroup.visible = false;
    this.riverWorldGroup.visible = false;
    this.stadiumWorldGroup.visible = true;

    // Spawn player avatar at the freekick penalty kick spot (Z = -3.2) facing North toward goal (Z = -12.3)
    this.playerPos.set(0, 0.1, -3.2);
    this.playerFacing = Math.PI;

    if (this.playerCitizen) {
      this.stadiumWorldGroup.add(this.playerCitizen.root);
      this.playerCitizen.root.position.copy(this.playerPos);
      this.playerCitizen.root.rotation.y = this.playerFacing;
      this.playerCitizen.root.visible = true;
      if (this.fishingRodGroup) {
        this.fishingRodGroup.visible = false;
        this.fishingRodGroup.parent?.remove(this.fishingRodGroup);
      }
    }
    if (this.mayorPlayer) {
      if (this.isPlayerAdmin) {
        this.stadiumWorldGroup.add(this.mayorPlayer.root);
        this.mayorPlayer.root.position.copy(this.playerPos);
        this.mayorPlayer.root.rotation.y = this.playerFacing;
        this.mayorPlayer.root.visible = true;
        if (this.playerCitizen) this.playerCitizen.root.visible = false;
      }
    }

    this.resetSoccerBall();

    // Camera in sports follow perspective behind player looking at goal
    this.cameraMode = 'follow';
    this.onCameraModeChange?.('follow');
    this.target.copy(this.playerPos).add(new THREE.Vector3(0, 1.2, 0));
    this.spherical.radius = 12;
    this.spherical.phi = Math.PI / 3.4;
    this.spherical.theta = this.playerFacing + Math.PI;
    this.updateCameraTransform();

    this.applyTimeOfDay(this.timeOfDay);

    useGameStore.getState().setViewMode('stadium');
    useGameStore.getState().setSelectedBuilding('sports_stadium');
    useGameStore.getState().setCurrentDistrict('Kawasan Olahraga');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('stadium-mode-changed', { detail: { mode: 'stadium' } }));
    }
  }

  public exitStadiumArea() {
    this.resetSoccerBall();
    this.viewMode = 'city';
    this.targetPosition = null;

    this.stadiumWorldGroup.visible = false;
    this.riverWorldGroup.visible = false;
    this.tuguWorldGroup.visible = false;
    this.cityWorldGroup.visible = true;

    if (this.playerCitizen) this.playerCitizen.root.visible = false;
    if (this.mayorPlayer) this.mayorPlayer.root.visible = false;

    this.cameraMode = 'orbit';
    this.onCameraModeChange?.('orbit');
    this.spherical.radius = 120;
    this.spherical.phi = Math.PI / 3.2;
    this.spherical.theta = Math.PI / 4;
    this.target.set(0, 0, 0);
    this.updateCameraTransform();

    this.applyTimeOfDay(this.timeOfDay);

    useGameStore.getState().setViewMode('city');
    useGameStore.getState().setSelectedBuilding(null);
    useGameStore.getState().setCurrentDistrict('town_square');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('stadium-mode-changed', { detail: { mode: 'city' } }));
    }
  }

  public shootSoccerBall(
    dir: 'left' | 'center' | 'right' | 'top_left' | 'top_right' = 'center',
    power: number = 85
  ) {
    if (this.viewMode !== 'stadium' || this.isBallKicked) return;
    this.isBallKicked = true;
    this.isBallCaught = false;
    this.hasResolvedPenaltyShot = false;

    // 1. Set initial ball trajectory toward North Goal (Z = -12.3)
    let targetX = 0;
    let targetY = 1.1;
    if (dir === 'left') {
      targetX = -1.5;
      targetY = 0.65;
    } else if (dir === 'right') {
      targetX = 1.5;
      targetY = 0.65;
    } else if (dir === 'top_left') {
      targetX = -1.6;
      targetY = 1.6;
    } else if (dir === 'top_right') {
      targetX = 1.6;
      targetY = 1.6;
    } else {
      targetX = 0;
      targetY = 1.15;
    }

    const t = 0.44; // flight duration
    const vz = -7.8 / t; // distance from -4.5 to -12.3 is 7.8m -> ~ -17.7 m/s
    const vx = targetX / t;
    const vy = (targetY - 0.2) / t + 0.5 * 9.8 * t;
    this.ballVelocity.set(vx, vy, vz);

    // Defender wall jumps in unison to block the penalty shot!
    this.defenderJumpTimer = 0.55;

    // Kicking avatar arm & leg swing animation
    if (this.playerCitizen) {
      this.playerCitizen.rightLeg.rotation.x = -1.2;
      setTimeout(() => {
        if (this.playerCitizen) this.playerCitizen.rightLeg.rotation.x = 0.8;
      }, 120);
      setTimeout(() => {
        if (this.playerCitizen) this.playerCitizen.rightLeg.rotation.x = 0;
      }, 350);
    }

    // 2. Intelligent Goalkeeper AI dive decision & penalty outcome
    let keeperDives: Array<'dive_left' | 'dive_right' | 'jump' | 'idle'>;
    if (dir === 'left' || dir === 'top_left') {
      keeperDives = ['dive_left', 'dive_left', 'jump', 'dive_right'];
    } else if (dir === 'right' || dir === 'top_right') {
      keeperDives = ['dive_right', 'dive_right', 'jump', 'dive_left'];
    } else {
      keeperDives = ['jump', 'jump', 'idle', 'dive_left', 'dive_right'];
    }

    this.goalkeeperState = keeperDives[Math.floor(Math.random() * keeperDives.length)];
    this.goalkeeperAnimTimer = 0;

    // Determine if keeper guessed the shot direction
    const keeperGuessedCorrectly =
      (dir.includes('left') && this.goalkeeperState === 'dive_left') ||
      (dir.includes('right') && this.goalkeeperState === 'dive_right') ||
      (dir === 'center' && (this.goalkeeperState === 'jump' || this.goalkeeperState === 'idle'));

    if (keeperGuessedCorrectly) {
      if (dir === 'top_left' || dir === 'top_right') {
        // High corner shot: 55% saved, 45% goal
        if (Math.random() < 0.55) {
          this.penaltyOutcome = Math.random() < 0.5 ? 'saved_catch' : 'saved_deflect';
        } else {
          this.penaltyOutcome = 'goal';
        }
      } else {
        // Normal side shot: 80% saved
        if (Math.random() < 0.8) {
          this.penaltyOutcome = Math.random() < 0.65 ? 'saved_catch' : 'saved_deflect';
        } else {
          this.penaltyOutcome = 'goal';
        }
      }
    } else {
      // Keeper dived wrong way: GOAL!
      this.penaltyOutcome = 'goal';
    }

    // Dispatch event indicating ball was kicked
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('stadium-ball-kicked', {
          detail: { dir, power },
        })
      );
    }

    // Reset ball position after 2.4 seconds
    setTimeout(() => {
      this.resetSoccerBall();
    }, 2400);
  }

  public resetSoccerBall() {
    this.isBallKicked = false;
    this.isBallCaught = false;
    this.hasResolvedPenaltyShot = false;
    this.penaltyOutcome = null;
    this.ballVelocity.set(0, 0, 0);
    if (this.soccerBall) {
      this.soccerBall.position.set(0, 0.2, -4.5);
      this.soccerBall.rotation.set(0, 0, 0);
    }
    if (this.goalkeeper) {
      this.goalkeeper.position.set(0, 0.08, -11.9);
      this.goalkeeper.rotation.set(0, 0, 0);
    }
    if (this.keeperArmL) this.keeperArmL.rotation.set(0.3, 0, 0.35);
    if (this.keeperArmR) this.keeperArmR.rotation.set(0.3, 0, -0.35);
    if (this.keeperGloveL) {
      this.keeperGloveL.position.set(-0.46, 0.78, 0.22);
      this.keeperGloveL.rotation.set(-0.2, 0.3, 0.4);
    }
    if (this.keeperGloveR) {
      this.keeperGloveR.position.set(0.46, 0.78, 0.22);
      this.keeperGloveR.rotation.set(-0.2, -0.3, -0.4);
    }
    this.goalkeeperState = 'idle';
    this.goalkeeperAnimTimer = 0;
    this.defenderJumpTimer = 0;
    for (const def of this.stadiumDefenders) {
      def.position.y = 0.08;
    }
  }

  private updateStadium(delta: number, elapsed: number) {
    // 1. Ball physics update
    if (this.soccerBall && this.isBallKicked) {
      if (!this.isBallCaught) {
        this.soccerBall.position.addScaledVector(this.ballVelocity, delta);
        // Gravity
        this.ballVelocity.y -= 9.8 * delta;

        // Ground bounce
        if (this.soccerBall.position.y < 0.2) {
          this.soccerBall.position.y = 0.2;
          this.ballVelocity.y = -this.ballVelocity.y * 0.45;
          this.ballVelocity.x *= 0.8;
          this.ballVelocity.z *= 0.8;
        }

        // Check Goalkeeper Save at Z <= -11.5
        if (
          !this.hasResolvedPenaltyShot &&
          this.penaltyOutcome &&
          this.penaltyOutcome.startsWith('saved') &&
          this.soccerBall.position.z <= -11.5
        ) {
          this.hasResolvedPenaltyShot = true;
          if (this.penaltyOutcome === 'saved_catch') {
            this.isBallCaught = true;
            this.ballVelocity.set(0, 0, 0);
          } else {
            // Deflected off goalkeeper gloves away from goal!
            const bounceX = this.goalkeeper ? (this.goalkeeper.position.x > 0 ? 4.5 : -4.5) : 3.0;
            this.ballVelocity.set(bounceX, 4.0, 8.5);
          }

          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('stadium-freekick-result', {
                detail: {
                  isGoal: false,
                  saveType: this.penaltyOutcome === 'saved_catch' ? 'catch' : 'deflect',
                },
              })
            );
          }
        }

        // Check Goal when ball crosses goal line (Z <= -12.3)
        if (
          !this.hasResolvedPenaltyShot &&
          this.penaltyOutcome === 'goal' &&
          this.soccerBall.position.z <= -12.3
        ) {
          this.hasResolvedPenaltyShot = true;
          this.stadiumGoalCheerTimer = 4.5;
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('stadium-freekick-result', {
                detail: {
                  isGoal: true,
                  saveType: null,
                },
              })
            );
          }
        }

        // Net / goal back collision
        if (this.soccerBall.position.z < -12.6) {
          this.soccerBall.position.z = -12.6;
          this.ballVelocity.set(0, -2.5, 0); // drops straight down
        }

        // Ball rotation while rolling / flying
        this.soccerBall.rotation.x += this.ballVelocity.z * delta * 2;
        this.soccerBall.rotation.z -= this.ballVelocity.x * delta * 2;
      } else if (this.goalkeeper) {
        // Ball is firmly caught in the goalkeeper's gloves!
        const gX = this.goalkeeper.position.x;
        const gY = this.goalkeeper.position.y + (this.goalkeeperState === 'jump' ? 0.9 : 0.68);
        const gZ = this.goalkeeper.position.z + 0.32;
        this.soccerBall.position.set(gX, gY, gZ);
        this.soccerBall.rotation.set(0, 0, 0);

        // Keeper gloves clutching the ball
        if (this.keeperGloveL) this.keeperGloveL.position.set(-0.2, 0.72, 0.28);
        if (this.keeperGloveR) this.keeperGloveR.position.set(0.2, 0.72, 0.28);
      }
    }

    // 2. Goalkeeper dive & idle animation
    if (this.goalkeeper) {
      if (this.goalkeeperState !== 'idle') {
        this.goalkeeperAnimTimer += delta;
        const t = Math.min(this.goalkeeperAnimTimer / 0.45, 1.0);

        if (this.goalkeeperState === 'dive_left') {
          this.goalkeeper.position.x = THREE.MathUtils.lerp(0, -1.3, t);
          this.goalkeeper.position.y = THREE.MathUtils.lerp(0.08, 0.45, Math.sin(t * Math.PI));
          this.goalkeeper.rotation.z = THREE.MathUtils.lerp(0, -0.65, t);
        } else if (this.goalkeeperState === 'dive_right') {
          this.goalkeeper.position.x = THREE.MathUtils.lerp(0, 1.3, t);
          this.goalkeeper.position.y = THREE.MathUtils.lerp(0.08, 0.45, Math.sin(t * Math.PI));
          this.goalkeeper.rotation.z = THREE.MathUtils.lerp(0, 0.65, t);
        } else if (this.goalkeeperState === 'jump') {
          this.goalkeeper.position.y = THREE.MathUtils.lerp(0.08, 0.85, Math.sin(t * Math.PI));
        }
      } else {
        // Idle goalkeeper ready bounce on toes
        const toeBounce = Math.abs(Math.sin(elapsed * 4.5)) * 0.03;
        this.goalkeeper.position.y = 0.08 + toeBounce;
      }
    }

    // 3. Defender Wall jumping during free-kick
    if (this.defenderJumpTimer > 0) {
      this.defenderJumpTimer -= delta;
      const jumpNorm = Math.max(0, this.defenderJumpTimer / 0.55);
      const wallHop = Math.sin((1 - jumpNorm) * Math.PI) * 0.38;
      for (const def of this.stadiumDefenders) {
        def.position.y = 0.08 + wallHop;
      }
    } else {
      for (const def of this.stadiumDefenders) {
        def.position.y = 0.08;
      }
    }

    // 4. Moving Stadium Spectators across Oval Stands (Ombak Suporter / Mexican Wave & Goal Cheer)
    const isGoalCheering = this.stadiumGoalCheerTimer > 0;
    if (isGoalCheering) {
      this.stadiumGoalCheerTimer -= delta;
    }

    const waveCycle = (elapsed * 2.2) % (Math.PI * 2) - Math.PI;

    for (let i = 0; i < this.stadiumCrowd.length; i++) {
      const spec = this.stadiumCrowd[i];

      if (isGoalCheering) {
        // Goal scored: entire crowd erupts in wild jumping, fist-pumping, and flag waving!
        const cheerJump = Math.abs(Math.sin(elapsed * 7.5 + spec.phase)) * (spec.jumpHeight * 1.3);
        spec.root.position.y = spec.baseY + cheerJump;

        if (spec.armL) spec.armL.rotation.x = -2.7 + Math.sin(elapsed * 8 + spec.phase) * 0.4;
        if (spec.armR) spec.armR.rotation.x = -2.7 + Math.cos(elapsed * 8 + spec.phase) * 0.4;
        if (spec.flag) {
          spec.flag.rotation.z = Math.sin(elapsed * 9 + spec.phase) * 0.6;
          spec.flag.rotation.x = Math.cos(elapsed * 8) * 0.4;
        }
      } else {
        // Continuous Mexican Wave rolling smoothly around the stadium stands
        let angDiff = Math.abs(spec.waveAngle - waveCycle);
        if (angDiff > Math.PI) angDiff = 2 * Math.PI - angDiff;

        if (angDiff < 0.48) {
          // In the wave: stand up and raise both arms into the air!
          const waveHeight = 1 - angDiff / 0.48;
          spec.root.position.y = spec.baseY + waveHeight * spec.jumpHeight;
          if (spec.armL) spec.armL.rotation.x = THREE.MathUtils.lerp(-0.2, -2.8, waveHeight);
          if (spec.armR) spec.armR.rotation.x = THREE.MathUtils.lerp(-0.2, -2.8, waveHeight);
          if (spec.flag) spec.flag.rotation.z = Math.sin(elapsed * 7 + i) * 0.45;
        } else {
          // Seated: rhythmic supporter swaying & clapping
          const gentleBop = Math.sin(elapsed * spec.speed + spec.phase) * 0.03;
          spec.root.position.y = spec.baseY + Math.max(0, gentleBop);
          if (spec.armL) spec.armL.rotation.x = -0.2 + Math.sin(elapsed * 3 + spec.phase) * 0.2;
          if (spec.armR) spec.armR.rotation.x = -0.2 + Math.sin(elapsed * 3 + spec.phase + 1) * 0.2;
          if (spec.flag) spec.flag.rotation.z = Math.sin(elapsed * 4 + i) * 0.2;
        }
      }
    }

    // 5. Corner flags flutter in the breeze
    for (let f = 0; f < this.stadiumCornerFlags.length; f++) {
      this.stadiumCornerFlags[f].rotation.y = Math.sin(elapsed * 4.5 + f * 1.5) * 0.25;
    }
  }

  public spawnRiverRipple(pos: THREE.Vector3) {
    const rippleMat = new THREE.MeshBasicMaterial({
      color: '#FFFFFF',
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const rippleGeom = new THREE.RingGeometry(0.08, 0.14, 24).rotateX(-Math.PI / 2);
    const ripple = new THREE.Mesh(rippleGeom, rippleMat);
    ripple.position.set(pos.x, 0.02, pos.z);
    this.activeFishingWorldGroup.add(ripple);
    this.riverRipples.push({
      mesh: ripple,
      curScale: 1.0,
      maxScale: 3.5 + Math.random() * 1.5,
      speed: 1.6 + Math.random() * 0.8,
    });
  }

  public castFishingLine(targetWaterPos?: THREE.Vector3) {
    if (!this.currentEquippedRod) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('fishing-no-rod', {
            detail: {
              message:
                'Kamu belum memasang Joran Pancing! Buka Tas Barang (🎒) dan pasang joran terlebih dahulu.',
            },
          })
        );
      }
      return;
    }
    if (this.fishingState !== 'idle') return;

    // 1. Determine landing spot on water surface (River vs Beach open water)
    const isBeach = this.viewMode === 'beach';
    let targetX = isBeach ? -12.0 : 0;
    let targetZ = isBeach ? 28.0 : -13.0;

    if (targetWaterPos) {
      if (isBeach) {
        targetX = THREE.MathUtils.clamp(targetWaterPos.x, -35.0, -2.5);
        targetZ = THREE.MathUtils.clamp(targetWaterPos.z, -30.0, 42.0);
      } else {
        const isSideWater = Math.abs(targetWaterPos.x) >= 3.0 && targetWaterPos.z <= 0.0 && targetWaterPos.z >= -25.0;
        const isFrontWater = targetWaterPos.z <= -10.2 && Math.abs(targetWaterPos.x) <= 25.0;

        if (isSideWater) {
          targetX = THREE.MathUtils.clamp(targetWaterPos.x, -22.0, 22.0);
          targetZ = THREE.MathUtils.clamp(targetWaterPos.z, -22.0, -0.8);
        } else if (isFrontWater) {
          targetX = THREE.MathUtils.clamp(targetWaterPos.x, -22.0, 22.0);
          targetZ = THREE.MathUtils.clamp(targetWaterPos.z, -25.0, -10.5);
        } else {
          targetX = THREE.MathUtils.clamp((Math.random() - 0.5) * 2.0, -1.8, 1.8);
          targetZ = -13.2 - Math.random() * 2.8;
        }
      }
    } else {
      if (isBeach) {
        targetX = this.playerPos.x - (5.0 + Math.random() * 4.0);
        targetZ = this.playerPos.z + (Math.random() - 0.5) * 3.5;
        targetX = THREE.MathUtils.clamp(targetX, -35.0, -2.5);
        targetZ = THREE.MathUtils.clamp(targetZ, -30.0, 42.0);
      } else {
        targetX = THREE.MathUtils.clamp((Math.random() - 0.5) * 2.0, -1.8, 1.8);
        targetZ = -13.5 - Math.random() * 3.0;
      }
    }

    this.targetBobberPos.set(targetX, -0.05, targetZ);

    // 2. Rotate avatar to face the exact water target direction!
    const dx = this.targetBobberPos.x - this.playerPos.x;
    const dz = this.targetBobberPos.z - this.playerPos.z;
    this.playerFacing = Math.atan2(dx, dz);
    if (this.playerCitizen) {
      this.playerCitizen.root.rotation.y = this.playerFacing;
    }
    if (this.mayorPlayer) {
      this.mayorPlayer.root.rotation.y = this.playerFacing;
    }

    // 3. Initiate casting state & timers
    this.fishingState = 'casting';
    this.castAnimTimer = 0;

    // Get current rod tip world position converted to active fishing world group space!
    if (this.rodTip) {
      this.rodTip.updateWorldMatrix(true, false);
      const tipWorld = new THREE.Vector3();
      this.rodTip.getWorldPosition(tipWorld);
      this.castStartTipPos.copy(tipWorld);
      this.activeFishingWorldGroup.worldToLocal(this.castStartTipPos);
    } else {
      this.castStartTipPos.copy(this.playerPos).add(new THREE.Vector3(0, 1.4, 0));
    }

    if (this.fishingBobber) {
      this.fishingBobber.position.copy(this.castStartTipPos);
      this.fishingBobber.visible = true;
    }
    if (this.fishingLine) {
      this.fishingLine.visible = true;
    }
    if (this.caughtFishMesh) {
      this.caughtFishMesh.visible = false;
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('river-fishing-state', { detail: { state: 'casting' } }));
    }
  }

  public reelFishingTap() {
    if (this.fishingState === 'bite') {
      this.fishingState = 'reeling';
      this.reelProgress = 38;
      this.spawnRiverRipple(this.targetBobberPos);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('river-fishing-state', {
            detail: { state: 'reeling', progress: this.reelProgress },
          })
        );
      }
      return;
    }

    if (this.fishingState === 'reeling') {
      // Tap power scales with rod speed and decreases for heavier/rarer fish
      const tier = this.pendingHookedFish?.tier || 'common';
      let tapGain = 8.5;
      if (tier === 'uncommon') tapGain = 8.0;
      else if (tier === 'rare') tapGain = 7.2;
      else if (tier === 'epic') tapGain = 6.4;
      else if (tier === 'legendary') tapGain = 5.6;
      else if (tier === 'mythic') tapGain = 4.8;
      else if (tier === 'immortal') tapGain = 4.2;

      const rodSpeed = this.currentEquippedRod?.fishingSpeed ?? 1.0;
      tapGain *= Math.min(2.0, Math.max(0.8, rodSpeed * 0.95));

      this.reelProgress = Math.min(100, this.reelProgress + tapGain);
      this.spawnRiverRipple(this.targetBobberPos);

      if (this.reelProgress >= 100) {
        this.fishingState = 'caught';
        this.activeCaughtFish = this.pendingHookedFish || this.determineCaughtFish();
        this.pendingHookedFish = null;

        if (this.fishingBobber) {
          this.fishingBobber.visible = false;
        }
        if (this.caughtFishMesh) {
          this.caughtFishMesh.visible = true;
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('river-fishing-state', {
              detail: { state: 'caught', fish: this.activeCaughtFish },
            })
          );
          window.dispatchEvent(
            new CustomEvent('river-fish-caught', {
              detail: { fish: this.activeCaughtFish },
            })
          );
        }
      } else {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('river-fishing-state', {
              detail: { state: 'reeling', progress: this.reelProgress },
            })
          );
        }
      }
    }
  }

  private determineCaughtFish(): RiverFishCatch {
    // Read stats from equipped fishing rod
    const luck = this.currentEquippedRod ? this.currentEquippedRod.luck : 0;
    const maxRodWeight = this.currentEquippedRod ? this.currentEquippedRod.maxWeight : 5.0;

    // Exponential RPG Rarity Curve:
    // Higher rarity is genuinely challenging and prestigious to catch!
    // Base Rates:
    // Immortal:  0.08% (1 in 1,250)
    // Mythic:    0.35% (1 in 285)
    // Legendary: 1.20% (1 in 83)
    // Epic:      4.50% (1 in 22)
    // Rare:      12.00% (1 in 8)
    // Uncommon:  25.00% (1 in 4)
    // Common:    56.87% (Bulk of catches)
    const pImmortal = 0.0008 * (1 + luck * 0.8);
    const pMythic = pImmortal + 0.0035 * (1 + luck * 0.7);
    const pLegendary = pMythic + 0.0120 * (1 + luck * 0.6);
    const pEpic = pLegendary + 0.0450 * (1 + luck * 0.5);
    const pRare = pEpic + 0.1200 * (1 + luck * 0.4);
    const pUncommon = pRare + 0.2500 * (1 + luck * 0.2);

    const rand = Math.random();
    let selectedTier: FishRarityTier = 'common';

    if (rand < pImmortal) {
      selectedTier = 'immortal';
    } else if (rand < pMythic) {
      selectedTier = 'mythic';
    } else if (rand < pLegendary) {
      selectedTier = 'legendary';
    } else if (rand < pEpic) {
      selectedTier = 'epic';
    } else if (rand < pRare) {
      selectedTier = 'rare';
    } else if (rand < pUncommon) {
      selectedTier = 'uncommon';
    } else {
      selectedTier = 'common';
    }

    const isBeach = this.viewMode === 'beach';
    const speciesPool = isBeach ? BEACH_FISH_SPECIES : RIVER_FISH_SPECIES;
    let tierSpecies = speciesPool.filter((s) => s.tier === selectedTier);

    // Rod Capacity Requirement:
    // Colossal legendary & mythical monsters require strong upgraded rods!
    if (selectedTier === 'immortal' || selectedTier === 'mythic' || selectedTier === 'legendary') {
      const minWeightInTier = tierSpecies.length > 0 ? Math.min(...tierSpecies.map((s) => s.weight)) : 0;
      if (minWeightInTier > maxRodWeight * 1.5) {
        // Fallback to highest tier species the rod can physically handle
        const compatibleSpecies = speciesPool.filter((s) => s.weight <= maxRodWeight * 1.5);
        if (compatibleSpecies.length > 0) {
          tierSpecies = [compatibleSpecies[compatibleSpecies.length - 1]];
          selectedTier = tierSpecies[0].tier;
        }
      }
    }

    const selected =
      tierSpecies.length > 0
        ? tierSpecies[Math.floor(Math.random() * tierSpecies.length)]
        : speciesPool[0];

    // Weight calculation
    const weightBonus = 1.0 + Math.min(0.35, luck * 0.08);
    const weightVariation = (0.9 + Math.random() * 0.22) * weightBonus;
    const calculatedWeight = selected.weight * weightVariation;
    // Bounded by rod max weight tolerance with margin
    const finalWeight = Number(
      Math.min(maxRodWeight * 1.5, Math.max(0.4, calculatedWeight)).toFixed(2)
    );
    const finalReward = Math.round(selected.rewardCoins * (finalWeight / selected.weight));

    return {
      id: selected.id,
      name: selected.name,
      rarity: selected.rarity,
      tier: selected.tier,
      rarityColor: selected.rarityColor,
      weight: finalWeight,
      rewardCoins: finalReward,
      icon: selected.icon,
      desc: selected.desc,
      caughtLocation: isBeach ? 'Pantai Netizen Beach' : 'Sungai Kali Netizen',
    };
  }

  public updateEquippedRod(rodDef: FishingRodDefinition | null) {
    this.currentEquippedRod = rodDef;
    if (!rodDef) {
      if (this.fishingRodGroup) {
        this.fishingRodGroup.visible = false;
      }
      return;
    }

    if (this.fishingRodGroup) {
      this.fishingRodGroup.visible = this.viewMode === 'river' || this.viewMode === 'beach';

      if (this.rodBlankMesh) {
        const mat = this.rodBlankMesh.material as THREE.MeshStandardMaterial;
        mat.color.set(rodDef.color);
        mat.metalness =
          rodDef.rarity === 'legendary' || rodDef.rarity === 'immortal' ? 0.85 : 0.25;
        mat.roughness =
          rodDef.rarity === 'rare' || rodDef.rarity === 'epic' ? 0.25 : 0.45;
        if (rodDef.glowColor) {
          mat.emissive.set(rodDef.glowColor);
          mat.emissiveIntensity = 0.55;
        } else {
          mat.emissive.set('#000000');
          mat.emissiveIntensity = 0;
        }
      }

      if (this.rodHandleMesh) {
        const mat = this.rodHandleMesh.material as THREE.MeshStandardMaterial;
        mat.color.set(rodDef.handleColor);
      }

      if (this.rodReelMesh) {
        const mat = this.rodReelMesh.material as THREE.MeshStandardMaterial;
        mat.color.set(rodDef.reelColor);
        mat.metalness = rodDef.rarity === 'common' ? 0.5 : 0.85;
      }

      if (this.rodTipGlowMesh) {
        if (rodDef.glowColor) {
          this.rodTipGlowMesh.visible = true;
          (this.rodTipGlowMesh.material as THREE.MeshBasicMaterial).color.set(rodDef.glowColor);
        } else {
          this.rodTipGlowMesh.visible = false;
        }
      }
    }
  }

  public getEquippedRod(): FishingRodDefinition | null {
    return this.currentEquippedRod;
  }

  public resetFishing() {
    this.fishingState = 'idle';
    this.reelProgress = 0;
    this.activeCaughtFish = null;
    this.pendingHookedFish = null;
    this.fishBiteTimer = 0;
    this.biteReactTimer = 0;
    this.castAnimTimer = 0;

    if (this.fishingBobber) {
      this.fishingBobber.visible = false;
    }
    if (this.fishingLine) {
      this.fishingLine.visible = false;
    }
    if (this.caughtFishMesh) {
      this.caughtFishMesh.visible = false;
    }
    if (this.playerCitizen) {
      this.playerCitizen.rightArm.rotation.set(-0.55, -0.1, 0);
      this.playerCitizen.leftArm.rotation.set(-0.45, 0.3, 0);
      this.playerCitizen.body.rotation.set(0, 0, 0);
      this.playerCitizen.body.position.set(0, 0, 0);
    }
    if (this.fishingRodGroup) {
      this.fishingRodGroup.rotation.set(1.2, 0, 0);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('river-fishing-state', { detail: { state: 'idle' } }));
    }
  }

  private updateRiver(delta: number, elapsed: number) {
    // 1. Update Water Ripples
    for (let i = this.riverRipples.length - 1; i >= 0; i--) {
      const rip = this.riverRipples[i];
      rip.curScale += rip.speed * delta;
      rip.mesh.scale.set(rip.curScale, rip.curScale, rip.curScale);
      const op = Math.max(0, 1 - rip.curScale / rip.maxScale);
      (rip.mesh.material as THREE.MeshBasicMaterial).opacity = op * 0.7;
      if (rip.curScale >= rip.maxScale) {
        this.activeFishingWorldGroup.remove(rip.mesh);
        rip.mesh.geometry.dispose();
        (rip.mesh.material as THREE.Material).dispose();
        this.riverRipples.splice(i, 1);
      }
    }

    // 2. Update Swimming Fish & Marine Dynamics
    if (this.viewMode === 'beach') {
      this.beachFishList.forEach((fish) => {
        fish.angle += fish.speed * delta;
        const fx = fish.center.x + Math.cos(fish.angle) * fish.radius;
        const fz = fish.center.z + Math.sin(fish.angle) * fish.radius;
        fish.mesh.position.set(fx, fish.depth + Math.sin(elapsed * 2 + fish.angle) * 0.05, fz);
        fish.mesh.rotation.y = -fish.angle + Math.PI / 2;
        fish.tail.rotation.y = Math.sin(elapsed * 9 + fish.angle) * 0.42;
      });

      this.beachWaveFoams.forEach((foam, idx) => {
        const wave = Math.sin(elapsed * 2.2 + idx * 1.4);
        foam.position.x = -0.35 - idx * 0.7 - wave * 0.45;
        foam.scale.z = 1.0 + wave * 0.06;
        (foam.material as THREE.MeshBasicMaterial).opacity = 0.4 + Math.max(0, wave) * 0.35;
      });

      this.beachBuoys.forEach((buoy, idx) => {
        buoy.position.y = 0.05 + Math.sin(elapsed * 2.8 + idx * 1.5) * 0.06;
        buoy.rotation.z = Math.sin(elapsed * 2.0 + idx) * 0.1;
        buoy.rotation.x = Math.cos(elapsed * 2.0 + idx) * 0.1;
      });

      if (this.separateBeachFlag) {
        this.separateBeachFlag.rotation.y = 0.3 * Math.sin(elapsed * 3);
      }
      if (this.separateLighthouseBeam) {
        this.separateLighthouseBeam.rotation.y = elapsed * 1.1;
      }
    } else {
      this.riverFishList.forEach((fish) => {
        fish.angle += fish.speed * delta;
        const fx = fish.center.x + Math.cos(fish.angle) * fish.radius;
        const fz = fish.center.z + Math.sin(fish.angle) * fish.radius;
        fish.mesh.position.set(fx, fish.depth + Math.sin(elapsed * 2 + fish.angle) * 0.05, fz);
        fish.mesh.rotation.y = -fish.angle + Math.PI / 2;
        fish.tail.rotation.y = Math.sin(elapsed * 9 + fish.angle) * 0.42;
      });
    }

    // 3. CASTING ANIMATION (3-Phase Dynamic Motion)
    if (this.fishingState === 'casting') {
      this.castAnimTimer += delta;
      const totalCastDuration = 1.15;

      if (this.playerCitizen) {
        if (this.castAnimTimer < 0.4) {
          // Phase 1 (0.0s - 0.4s): Wind-up / Tarik ke Belakang
          const p = this.castAnimTimer / 0.4;
          const ease = p * p * (3 - 2 * p);
          this.playerCitizen.rightArm.rotation.set(
            THREE.MathUtils.lerp(-0.55, 0.85, ease),
            -0.1,
            0
          );
          this.playerCitizen.leftArm.rotation.set(
            THREE.MathUtils.lerp(-0.45, 0.2, ease),
            0.3,
            0
          );
          if (this.fishingRodGroup) {
            this.fishingRodGroup.rotation.set(THREE.MathUtils.lerp(1.2, 0.35, ease), 0, 0);
          }
          this.playerCitizen.body.rotation.x = THREE.MathUtils.lerp(0, -0.15, ease);

          if (this.rodTip && this.fishingBobber) {
            this.rodTip.updateWorldMatrix(true, false);
            const tipWorld = new THREE.Vector3();
            this.rodTip.getWorldPosition(tipWorld);
            this.castStartTipPos.copy(tipWorld);
            this.activeFishingWorldGroup.worldToLocal(this.castStartTipPos);
            this.fishingBobber.position.copy(this.castStartTipPos);
          }
        } else if (this.castAnimTimer < 0.65) {
          // Phase 2 (0.4s - 0.65s): Power Whip Forward / Ayunan Bertenaga ke Depan!
          const p = (this.castAnimTimer - 0.4) / 0.25;
          const whip = Math.sin((p * Math.PI) / 2);
          this.playerCitizen.rightArm.rotation.set(
            THREE.MathUtils.lerp(0.85, -0.95, whip),
            -0.1,
            0
          );
          this.playerCitizen.leftArm.rotation.set(
            THREE.MathUtils.lerp(0.2, -0.5, whip),
            0.3,
            0
          );
          if (this.fishingRodGroup) {
            this.fishingRodGroup.rotation.set(THREE.MathUtils.lerp(0.35, 1.45, whip), 0, 0);
          }
          this.playerCitizen.body.rotation.x = THREE.MathUtils.lerp(-0.15, 0.12, whip);

          if (this.rodTip && this.fishingBobber) {
            this.rodTip.updateWorldMatrix(true, false);
            const tipWorld = new THREE.Vector3();
            this.rodTip.getWorldPosition(tipWorld);
            this.castStartTipPos.copy(tipWorld);
            this.activeFishingWorldGroup.worldToLocal(this.castStartTipPos);
            this.fishingBobber.position.copy(this.castStartTipPos);
          }
        } else if (this.castAnimTimer < totalCastDuration) {
          // Phase 3 (0.65s - 1.15s): Parabolic flight of bobber & arm settling
          const p = (this.castAnimTimer - 0.65) / (totalCastDuration - 0.65);

          this.playerCitizen.rightArm.rotation.set(
            THREE.MathUtils.lerp(-0.95, -0.55, p),
            -0.1,
            0
          );
          this.playerCitizen.leftArm.rotation.set(
            THREE.MathUtils.lerp(-0.5, -0.45, p),
            0.3,
            0
          );
          if (this.fishingRodGroup) {
            this.fishingRodGroup.rotation.set(THREE.MathUtils.lerp(1.45, 1.2, p), 0, 0);
          }
          this.playerCitizen.body.rotation.x = THREE.MathUtils.lerp(0.12, 0, p);

          if (this.fishingBobber) {
            const arcHeight = 3.2 * Math.sin(p * Math.PI);
            this.fishingBobber.position.x = THREE.MathUtils.lerp(this.castStartTipPos.x, this.targetBobberPos.x, p);
            this.fishingBobber.position.z = THREE.MathUtils.lerp(this.castStartTipPos.z, this.targetBobberPos.z, p);
            this.fishingBobber.position.y = THREE.MathUtils.lerp(this.castStartTipPos.y, this.targetBobberPos.y, p) + arcHeight;
          }
        } else {
          // Splashdown!
          if (this.fishingBobber) {
            this.fishingBobber.position.copy(this.targetBobberPos);
            this.spawnRiverRipple(this.targetBobberPos);
            setTimeout(() => this.spawnRiverRipple(this.targetBobberPos), 150);
          }
          this.fishingState = 'waiting';
          const speedMult = this.currentEquippedRod?.fishingSpeed ?? 1.0;
          this.fishBiteTimer = (2.8 + Math.random() * 3.5) / speedMult;

          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('river-fishing-state', { detail: { state: 'waiting' } }));
          }
        }
      }
    } else if (this.fishingState === 'waiting') {
      // Steady Angler Stance
      if (this.playerCitizen && !this.isPlayerWalking) {
        this.playerCitizen.rightArm.rotation.set(
          -0.55 + Math.sin(elapsed * 1.5) * 0.02,
          -0.1,
          0
        );
        this.playerCitizen.leftArm.rotation.set(
          -0.45 + Math.sin(elapsed * 1.5) * 0.02,
          0.3,
          0
        );
        this.playerCitizen.body.rotation.set(0, 0, 0);
      }
      if (this.fishingRodGroup) {
        this.fishingRodGroup.rotation.set(1.2, 0, 0);
      }
      if (this.fishingBobber) {
        this.fishingBobber.position.y = -0.05 + Math.sin(elapsed * 3.5) * 0.035;
      }

      this.fishBiteTimer -= delta;
      if (this.fishBiteTimer <= 0) {
        this.fishingState = 'bite';
        this.pendingHookedFish = this.determineCaughtFish();
        this.biteReactTimer = 2.8;
        this.spawnRiverRipple(this.targetBobberPos);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('river-fishing-state', { detail: { state: 'bite' } }));
        }
      }
    } else if (this.fishingState === 'bite') {
      // Urgent Strike Twitch!
      if (this.playerCitizen) {
        this.playerCitizen.rightArm.rotation.set(-0.65 + Math.sin(elapsed * 25) * 0.06, -0.1, 0);
        this.playerCitizen.leftArm.rotation.set(-0.45 + Math.sin(elapsed * 25) * 0.06, 0.3, 0);
      }
      if (this.fishingRodGroup) {
        this.fishingRodGroup.rotation.set(1.25 + Math.sin(elapsed * 25) * 0.1, 0, 0);
      }
      if (this.fishingBobber) {
        this.fishingBobber.position.y = -0.25 + Math.sin(elapsed * 16) * 0.06;
        if (Math.random() < 0.15) {
          this.spawnRiverRipple(this.targetBobberPos);
        }
      }

      this.biteReactTimer -= delta;
      if (this.biteReactTimer <= 0) {
        this.resetFishing();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('river-fishing-state', { detail: { state: 'escaped' } }));
        }
      }
    } else if (this.fishingState === 'reeling') {
      // Active Reeling Animation (pumping rod + cranking reel)
      if (this.playerCitizen) {
        this.playerCitizen.rightArm.rotation.set(-0.75 + Math.sin(elapsed * 12) * 0.18, -0.1, 0);
        this.playerCitizen.leftArm.rotation.set(-0.45 + Math.sin(elapsed * 18) * 0.12, 0.3 + Math.cos(elapsed * 18) * 0.15, 0);
      }
      if (this.fishingRodGroup) {
        this.fishingRodGroup.rotation.set(1.1 + Math.sin(elapsed * 12) * 0.15, 0, 0);
      }
      if (this.fishingBobber) {
        this.fishingBobber.position.y = -0.15 + Math.sin(elapsed * 12) * 0.05;
      }

      // Dynamic line tension decay based on hooked fish rarity tier
      let decayRate = 13.0;
      const tier = this.pendingHookedFish?.tier || 'common';
      if (tier === 'uncommon') decayRate = 16.0;
      else if (tier === 'rare') decayRate = 20.0;
      else if (tier === 'epic') decayRate = 24.0;
      else if (tier === 'legendary') decayRate = 28.0;
      else if (tier === 'mythic') decayRate = 32.0;
      else if (tier === 'immortal') decayRate = 36.0;

      this.reelProgress = Math.max(0, this.reelProgress - decayRate * delta);

      if (this.reelProgress <= 0) {
        this.resetFishing();
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('river-fishing-state', { detail: { state: 'escaped' } }));
        }
      } else {
        if (typeof window !== 'undefined' && Math.random() < 0.15) {
          window.dispatchEvent(
            new CustomEvent('river-fishing-state', {
              detail: { state: 'reeling', progress: this.reelProgress },
            })
          );
        }
      }
    } else if (this.fishingState === 'caught') {
      // Victory Pose: Arms Raised in Triumph!
      if (this.playerCitizen) {
        this.playerCitizen.rightArm.rotation.set(-2.2, -0.1, 0);
        this.playerCitizen.leftArm.rotation.set(-2.2, 0.1, 0);
        this.playerCitizen.body.position.y = 0.08 * Math.abs(Math.sin(elapsed * 8));
      }
      if (this.fishingRodGroup) {
        this.fishingRodGroup.rotation.set(0.5, 0, 0);
      }
      if (this.rodTip && this.caughtFishMesh) {
        this.rodTip.updateWorldMatrix(true, false);
        const tipWorld = new THREE.Vector3();
        this.rodTip.getWorldPosition(tipWorld);
        const tipLocal = tipWorld.clone();
        this.activeFishingWorldGroup.worldToLocal(tipLocal);
        this.caughtFishMesh.position.set(tipLocal.x, tipLocal.y - 0.75, tipLocal.z);
        this.caughtFishMesh.rotation.y = elapsed * 3;
        this.caughtFishMesh.visible = true;
      }
    } else if (this.fishingState === 'idle') {
      // Idle rod holding pose
      if (this.playerCitizen && !this.isPlayerWalking) {
        this.playerCitizen.rightArm.rotation.set(-0.55, -0.1, 0);
        this.playerCitizen.leftArm.rotation.set(0, 0, 0);
        this.playerCitizen.body.rotation.set(0, 0, 0);
      }
      if (this.fishingRodGroup) {
        this.fishingRodGroup.rotation.set(1.2, 0, 0);
      }
    }

    // 4. PRECISE 3D FISHING LINE GEOMETRY UPDATE (Anchored directly to Rod Tip Marker)
    if (
      this.fishingLine &&
      this.fishingLine.visible &&
      this.rodTip &&
      this.fishingBobber &&
      this.fishingBobber.visible
    ) {
      // Always force matrix update for exact current frame coordinates
      this.rodTip.updateWorldMatrix(true, false);
      const rodTipWorld = new THREE.Vector3();
      this.rodTip.getWorldPosition(rodTipWorld);
      const startPos = rodTipWorld.clone();
      this.activeFishingWorldGroup.worldToLocal(startPos);

      this.fishingBobber.updateWorldMatrix(true, false);
      const bobberWorld = new THREE.Vector3();
      this.fishingBobber.getWorldPosition(bobberWorld);
      const endPos = bobberWorld.clone();
      this.activeFishingWorldGroup.worldToLocal(endPos);
      endPos.y += 0.14; // Top pin of bobber float

      // Midpoint for catenary sag or tension
      const midPos = startPos.clone().lerp(endPos, 0.5);
      const dist = startPos.distanceTo(endPos);

      if (this.fishingState === 'waiting') {
        midPos.y -= Math.min(0.35, dist * 0.04);
      } else if (this.fishingState === 'bite' || this.fishingState === 'reeling') {
        midPos.y += Math.sin(elapsed * 50) * 0.02;
        midPos.x += Math.cos(elapsed * 50) * 0.02;
      } else if (this.fishingState === 'casting') {
        if (this.castAnimTimer > 0.4) {
          midPos.y += 0.25;
        }
      }

      // Smooth 12-point quadratic bezier curve
      const curve = new THREE.QuadraticBezierCurve3(startPos, midPos, endPos);
      const points = curve.getPoints(11); // 12 points

      const posAttr = this.fishingLine.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < points.length; i++) {
        posAttr.setXYZ(i, points[i].x, points[i].y, points[i].z);
      }
      posAttr.needsUpdate = true;
      this.fishingLine.geometry.computeBoundingSphere();
    }
  }

private setupAirplanes() {
    // 1. Landing airplane (periodically approaches and lands on runway)
    this.landingPlane = makePlane();
    this.landingPlane.root.position.set(AIR.x, 60, 160);
    this.cityWorldGroup.add(this.landingPlane.root);

    // 2. High altitude sky cruising airplane
    this.skyPlane = makePlane();
    this.skyPlane.root.scale.setScalar(1.6);
    this.skyPlane.root.position.set(-350, 175, -50);
    this.skyPlane.root.rotation.set(0, Math.PI / 2, 0);
    this.cityWorldGroup.add(this.skyPlane.root);

    // Contrails behind the sky jet
    const trailMat = new THREE.LineBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0.65 });
    for (const offset of [-1.2, 1.2]) {
      const trailGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, -32),
      ]);
      const trail = new THREE.LineSegments(trailGeo, trailMat);
      trail.position.set(offset, 0.8, -2.5);
      this.skyPlane.root.add(trail);
    }
  }

  private setupColliders() {
    // Populate solid building colliders for specific buildings
    // 1. General buildings (excluding large open parks / stadiums that have their own sub-colliders)
    const openAreaIds = new Set(['zoo', 'sports_stadium', 'university', 'nature_mountain', 'monument', 'worship_place']);
    this.landmarks.forEach((lm) => {
      if (!openAreaIds.has(lm.id)) {
        this.colliders.push({
          x: lm.position.x,
          z: lm.position.z,
          radius: Math.min(8.0, Math.max(3.2, lm.radius * 0.65)),
        });
      }
    });

    // 2. Balai kota & Kantor Mayor
    this.colliders.push({ x: 0, z: 9.3, radius: 5.5 });
    this.colliders.push({ x: 0, z: 27.6, radius: 2.2 });

    // 3. Monumen Netizen City (center plinth and fountain)
    this.colliders.push({ x: -44, z: -94, radius: 4.8 });

    // 4. Mall Perbelanjaan Netizen
    this.colliders.push({ x: MALL.x, z: MALL.z, radius: 9.2 });

    // 5. Rusunawa blocks
    this.colliders.push({ x: 26, z: 19.5, radius: 6.5 });
    this.colliders.push({ x: 44, z: 19.5, radius: 6.5 });

    // 6. Sports Complex: GOR and Basketball court
    this.colliders.push({ x: SPORT.gor.x, z: SPORT.gor.z, radius: 6.0 });
    this.colliders.push({ x: SPORT.court.x, z: SPORT.court.z, radius: 4.5 });

    // 7. Universitas campus buildings: Rectorate & faculties
    this.colliders.push({ x: UNI.x, z: UNI.z - 10, radius: 4.5 });
    this.colliders.push({ x: UNI.x - 11, z: UNI.z + 2, radius: 3.5 });
    this.colliders.push({ x: UNI.x + 11, z: UNI.z + 2, radius: 3.5 });
    this.colliders.push({ x: UNI.x - 11, z: UNI.z + 11, radius: 3.5 });
    this.colliders.push({ x: UNI.x + 11, z: UNI.z + 11, radius: 4.0 });

    // 8. Zoo animal enclosure fences (prevent entering animal pens)
    const enclAngles = [-2.618, -1.571, -0.524, 0.524, 1.571, 2.618];
    const enclRadii = [4.3, 3.8, 3.4, 3.0, 3.4, 3.6];
    enclAngles.forEach((a, idx) => {
      const r = enclRadii[idx];
      const d = r + 7.5;
      this.colliders.push({
        x: ZOO.x + Math.sin(a) * d,
        z: ZOO.z + Math.cos(a) * d,
        radius: r * 0.95,
      });
    });

    // 9. Kawasan Kerukunan houses of worship
    const worshipOffsets = [[0, -12.8], [5.8, -6.3], [5.8, 6.3], [0, 12.8], [-5.8, 6.3], [-5.8, -6.3]];
    worshipOffsets.forEach(([ox, oz]) => {
      this.colliders.push({
        x: KERUK.x + ox,
        z: KERUK.z + oz,
        radius: 3.2,
      });
    });
  }

  private registerInteractiveLandmarks() {
    this.interactiveMeshes = [];
    this.landmarks.forEach((lm) => {
      // Cylinder hitbox wrapping each landmark - accurately separating monument (X=0) and investor tower (X=22)
      let radius = Math.max(lm.radius * 1.2, 12.0);
      let height = Math.max(20, radius * 1.2);

      if (lm.id === 'monument') {
        radius = 15.0; // Central fountain park radius
        height = 36.0;
      } else if (lm.id === 'investor_tower') {
        radius = 8.5; // Monumen Investor tower radius
        height = 28.0;
      }

      const geo = new THREE.CylinderGeometry(radius, radius, height, 16);
      const mat = new THREE.MeshBasicMaterial({ visible: false });
      const hitBox = new THREE.Mesh(geo, mat);
      hitBox.position.copy(lm.position).add(new THREE.Vector3(0, height / 2, 0));
      this.cityWorldGroup.add(hitBox);
      this.interactiveMeshes.push({ mesh: hitBox, landmark: lm });
    });
  }

  // ============================================================
  // TIME OF DAY & LIGHTING
  // ============================================================
  public applyTimeOfDay(time: TimeOfDay) {
    this.timeOfDay = time;
    let sunIntensity = 2.5;
    let sunColor = new THREE.Color('#FFF0D8');
    let skyTop = new THREE.Color('#7FC0EE');
    let skyHor = new THREE.Color('#FBE9D6');
    let nightAmount = 0;

    switch (time) {
      case 'morning':
        sunIntensity = 2.2;
        sunColor.set('#FFE8C8');
        skyTop.set('#8CC6EE');
        skyHor.set('#FCE3C8');
        nightAmount = 0;
        break;
      case 'noon':
        sunIntensity = 2.6;
        sunColor.set('#FFF8E8');
        skyTop.set('#7FC0EE');
        skyHor.set('#FBE9D6');
        nightAmount = 0;
        break;
      case 'sunset':
        sunIntensity = 1.6;
        sunColor.set('#FF9E68');
        skyTop.set('#B7A3DC');
        skyHor.set('#F8C0A0');
        nightAmount = 0.35;
        break;
      case 'night':
        sunIntensity = 0.1;
        sunColor.set('#3A4B7C');
        skyTop.set('#182042');
        skyHor.set('#2D3B6B');
        nightAmount = 1.0;
        break;
    }

    this.sunLight.intensity = sunIntensity;
    this.sunLight.color.copy(sunColor);
    this.moonLight.intensity = nightAmount * 1.4;

    if (this.hemiLight) {
      if (nightAmount > 0.5) {
        this.hemiLight.intensity = 0.35;
        this.hemiLight.color.set('#2E3E66');
        this.hemiLight.groundColor.set('#111827');
      } else if (nightAmount > 0.2) {
        this.hemiLight.intensity = 0.75;
        this.hemiLight.color.set('#E6C6A0');
        this.hemiLight.groundColor.set('#B08D68');
      } else {
        this.hemiLight.intensity = 1.05;
        this.hemiLight.color.set('#D3E8FF');
        this.hemiLight.groundColor.set('#EAD6B4');
      }
    }

    if (this.skyUniforms) {
      this.skyUniforms.top.value.copy(skyTop);
      this.skyUniforms.hor.value.copy(skyHor);
    }
    this.scene.fog!.color.copy(skyHor);

    (this.stars.material as THREE.PointsMaterial).opacity = nightAmount;

    const lk = nightAmount > 0.3 ? 1.0 : 0.0;
    this.town?.night(0, lk);
    this.metro?.night(0, lk, 0);
    this.mall?.night(lk);
    this.library?.night(lk);
    this.airport?.night(lk, 0);
    this.port?.night(lk, 0);
    this.sports?.night(lk, 0);
    this.separateSports?.night(lk, 0);
    this.vet?.night(lk);
    this.uni?.night(lk);
    this.zoo?.night(lk);
    this.lab?.night(lk, 0);

    if (this.tower) {
      if (nightAmount > 0.5) {
        this.tower.light(() => 1, 1, 0);
        this.tower.crowns.forEach((c: any, j: number) => this.tower.crown(j, 1, 1, 0));
        this.tower.haloOn(1, 0);
        this.tower.neon(1);
        this.tower.env(0.3);
      } else {
        this.tower.light(() => 0.55, 0, 0);
        this.tower.crowns.forEach((c: any, j: number) => this.tower.crown(j, 0.8, 0, 0));
        this.tower.haloOn(0.5, 0);
        this.tower.neon(0.35);
        this.tower.env(1);
      }
    }

    if (this.metro?.monument) {
      const mon = this.metro.monument;
      mon.obM.emissiveIntensity = 1.6 * nightAmount;
      mon.bubM.emissiveIntensity = 0.9 * nightAmount;
      mon.heartM.emissiveIntensity = 1.0 * nightAmount;
      mon.glow.intensity = 60 * nightAmount;
    }
    if (this.tuguMonument) {
      this.tuguMonument.obM.emissiveIntensity = 1.6 * nightAmount;
      this.tuguMonument.bubM.emissiveIntensity = 0.9 * nightAmount;
      this.tuguMonument.heartM.emissiveIntensity = 1.0 * nightAmount;
      this.tuguMonument.glow.intensity = 60 * nightAmount;
    }
    if (this.tuguMpark) {
      this.tuguMpark.lampM.emissiveIntensity = 2.0 * nightAmount;
    }
    if (this.tuguLamps) {
      this.tuguLamps.forEach((lamp) => {
        if (lamp.globeMat) {
          lamp.globeMat.emissiveIntensity = nightAmount > 0.3 ? 3.5 : 0.4;
        }
        if (lamp.light) {
          lamp.light.intensity = nightAmount > 0.3 ? 1.6 : 0.0;
        }
      });
    }
    if (this.riverLamps) {
      this.riverLamps.forEach((lamp) => {
        if (lamp.headMat) {
          lamp.headMat.emissiveIntensity = nightAmount > 0.3 ? 1.2 : 0.15;
        }
        if (lamp.light) {
          lamp.light.intensity = nightAmount > 0.3 ? 0.6 : 0.0;
        }
      });
    }
    if (this.beachLamps) {
      this.beachLamps.forEach((lamp) => {
        if (lamp.headMat) {
          lamp.headMat.emissiveIntensity = nightAmount > 0.3 ? 1.4 : 0.2;
        }
        if (lamp.light) {
          lamp.light.intensity = nightAmount > 0.3 ? 0.75 : 0.0;
        }
      });
    }
    if (this.stadiumLamps) {
      this.stadiumLamps.forEach((lamp) => {
        if (lamp.light) {
          lamp.light.intensity = nightAmount > 0.3 ? 2.5 : 0.0;
        }
      });
    }
  }

  public zoomIn(factor = 0.82) {
    this.spherical.radius = THREE.MathUtils.clamp(this.spherical.radius * factor, 8, 300);
    this.updateCameraTransform();
  }

  public zoomOut(factor = 1.22) {
    this.spherical.radius = THREE.MathUtils.clamp(this.spherical.radius * factor, 8, 300);
    this.updateCameraTransform();
  }

  public rotateCamera(deltaTheta: number, deltaPhi: number) {
    this.spherical.theta += deltaTheta;
    this.spherical.phi = THREE.MathUtils.clamp(
      this.spherical.phi + deltaPhi,
      0.15,
      Math.PI / 2 - 0.05
    );
    this.updateCameraTransform();
  }

  public rotateLeft(step = Math.PI / 14) {
    this.rotateCamera(step, 0);
  }

  public rotateRight(step = Math.PI / 14) {
    this.rotateCamera(-step, 0);
  }

  public tiltUp(step = 0.08) {
    this.rotateCamera(0, -step);
  }

  public tiltDown(step = 0.08) {
    this.rotateCamera(0, step);
  }

  public resetCamera() {
    if (this.viewMode === 'city') {
      if (this.cameraMode === 'follow') {
        this.target.copy(this.playerPos).add(new THREE.Vector3(0, 1.4, 0));
        this.spherical.radius = 22;
        this.spherical.phi = Math.PI / 3.4;
        this.spherical.theta = this.playerFacing + Math.PI;
      } else {
        this.target.set(0, 0, 0);
        this.spherical.radius = 120;
        this.spherical.phi = Math.PI / 3.5;
        this.spherical.theta = Math.PI * 0.75;
      }
    } else if (this.viewMode === 'tugu') {
      this.target.copy(this.playerPos).add(new THREE.Vector3(0, 1.4, 0));
      this.spherical.radius = 18;
      this.spherical.phi = Math.PI / 3.4;
      this.spherical.theta = this.playerFacing + Math.PI;
    } else if (this.viewMode === 'stadium') {
      this.target.copy(this.playerPos).add(new THREE.Vector3(0, 1.2, 0));
      this.spherical.radius = 12;
      this.spherical.phi = Math.PI / 3.4;
      this.spherical.theta = this.playerFacing + Math.PI;
    } else if (this.viewMode === 'river' || this.viewMode === 'beach') {
      this.target.copy(this.playerPos).add(new THREE.Vector3(0, 1.2, 0));
      this.spherical.radius = 16;
      this.spherical.phi = Math.PI / 3.4;
      this.spherical.theta = this.playerFacing + Math.PI;
    }
    this.updateCameraTransform();
  }

  public setVirtualMovement(move: { x: number; y: number } | null) {
    this.virtualMove = move;
  }

  // ============================================================
  // CAMERA & CONTROLS
  // ============================================================
  public setCameraMode(mode: CameraMode) {
    this.cameraMode = mode;
    if (mode === 'follow') {
      this.target.copy(this.playerPos).add(new THREE.Vector3(0, 1.4, 0));
      this.spherical.radius = 22;
      this.spherical.phi = Math.PI / 3.4;
      this.spherical.theta = this.playerFacing + Math.PI;
      this.updateCameraTransform();
    }
    this.onCameraModeChange?.(mode);
  }

  public flyToLandmark(landmarkId: string) {
    const lm = this.landmarks.find((l) => l.id === landmarkId);
    if (!lm) return;

    this.cameraMode = 'orbit';
    this.onCameraModeChange?.('orbit');
    this.target.copy(lm.cameraTarget);

    const offset = lm.cameraPos.clone().sub(lm.cameraTarget);
    this.spherical.radius = offset.length();
    this.spherical.phi = Math.acos(offset.y / this.spherical.radius);
    this.spherical.theta = Math.atan2(offset.x, offset.z);
    this.updateCameraTransform();

    useGameStore.getState().setSelectedBuilding(lm.id);
    useGameStore.getState().setCurrentDistrict(lm.district);
  }

  private updateCameraTransform() {
    this.spherical.phi = Math.max(0.15, Math.min(Math.PI / 2 - 0.05, this.spherical.phi));
    this.spherical.radius = Math.max(8, Math.min(320, this.spherical.radius));

    const x =
      this.target.x +
      this.spherical.radius * Math.sin(this.spherical.phi) * Math.sin(this.spherical.theta);
    const y = this.target.y + this.spherical.radius * Math.cos(this.spherical.phi);
    const z =
      this.target.z +
      this.spherical.radius * Math.sin(this.spherical.phi) * Math.cos(this.spherical.theta);

    this.camera.position.set(x, y, z);
    this.camera.lookAt(this.target);
  }

  // ============================================================
  // EVENT LISTENERS
  // ============================================================
  private setupEventListeners() {
    const el = this.container;

    el.addEventListener('contextmenu', this.onContextMenu);
    el.addEventListener('pointerdown', this.onPointerDown);
    window.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);
    el.addEventListener('wheel', this.onWheel, { passive: false });
    el.addEventListener('click', this.onClick);
    this.handleEnterTuguEvent = () => this.enterTuguArea();
    this.handleExitTuguEvent = () => this.exitTuguArea();
    window.addEventListener('enter-tugu-area', this.handleEnterTuguEvent);
    window.addEventListener('exit-tugu-area', this.handleExitTuguEvent);

    this.handleEnterRiverEvent = () => this.enterRiverArea();
    this.handleExitRiverEvent = () => this.exitRiverArea();
    window.addEventListener('enter-river-area', this.handleEnterRiverEvent);
    window.addEventListener('exit-river-area', this.handleExitRiverEvent);

    this.handleEnterBeachEvent = () => this.enterBeachArea();
    this.handleExitBeachEvent = () => this.exitBeachArea();
    window.addEventListener('enter-beach-area', this.handleEnterBeachEvent);
    window.addEventListener('exit-beach-area', this.handleExitBeachEvent);
    this.handlePlayerChat = (e: any) => {
      const text = e.detail?.text;
      if (text) this.showPlayerSpeechBubble(text);
    };
    window.addEventListener('player-chat-sent', this.handlePlayerChat);

    this.handleTimeOfDayEvent = (e: any) => {
      const time = e.detail?.time;
      if (time) this.applyTimeOfDay(time);
    };
    this.handleToggleDayNightEvent = () => {
      const nextTime: TimeOfDay = this.timeOfDay === 'night' ? 'noon' : 'night';
      this.applyTimeOfDay(nextTime);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('time-of-day-changed', { detail: { time: nextTime } }));
      }
    };
    window.addEventListener('time-of-day-changed', this.handleTimeOfDayEvent);
    window.addEventListener('toggle-day-night', this.handleToggleDayNightEvent);

    this.handleAdjustCameraPOV = (e: any) => {
      const { preset, yaw, pitch, distance } = e.detail || {};
      this.handlePhotoStudioPOV(preset, yaw, pitch, distance);
    };
    window.addEventListener('adjust-camera-pov', this.handleAdjustCameraPOV);

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('blur', this.onWindowBlur);
    window.addEventListener('resize', this.onResize);
    this.renderer.domElement.addEventListener('webglcontextlost', this.onContextLost, false);
    this.renderer.domElement.addEventListener('webglcontextrestored', this.onContextRestored, false);
  }

  private onContextLost = (e: Event) => {
    e.preventDefault();
    cancelAnimationFrame(this.reqId);
  };

  private onContextRestored = () => {
    this.animate();
  };

  private onContextMenu = (e: MouseEvent) => {
    e.preventDefault();
  };

  private onPointerDown = (e: PointerEvent) => {
    this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

    const isTouch = e.pointerType === 'touch';

    if (this.activePointers.size === 1) {
      this.isPointerDown = true;
      // MOBILE: 1 finger is ALWAYS PAN (geser map)! On desktop mouse: right click or shift is pan, left click is orbit.
      this.isPanning = isTouch || e.button === 2 || e.shiftKey;
      this.pointerStart = { x: e.clientX, y: e.clientY };
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
    } else if (this.activePointers.size === 2) {
      const [p1, p2] = Array.from(this.activePointers.values());
      this.pinchStartDistance = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      this.pinchStartRadius = this.spherical.radius;
      this.pinchStartMidpoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      this.pinchStartAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      this.isPanning = false; // 2 fingers does camera rotation / muter-muter!
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (this.activePointers.has(e.pointerId)) {
      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // MULTI-TOUCH GESTURES: 2 fingers = ROTATE / MUTER-MUTER KAMERA & pinch zoom for mobile
    if (this.activePointers.size >= 2) {
      const [p1, p2] = Array.from(this.activePointers.values());
      const currentDist = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      if (this.pinchStartDistance > 5 && currentDist > 5) {
        const factor = this.pinchStartDistance / currentDist;
        this.spherical.radius = THREE.MathUtils.clamp(this.pinchStartRadius * factor, 8, 300);
      }

      const curMid = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      const mdx = curMid.x - this.pinchStartMidpoint.x;
      const mdy = curMid.y - this.pinchStartMidpoint.y;
      this.pinchStartMidpoint = curMid;

      const curAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
      let deltaAngle = curAngle - this.pinchStartAngle;
      if (deltaAngle > Math.PI) deltaAngle -= Math.PI * 2;
      if (deltaAngle < -Math.PI) deltaAngle += Math.PI * 2;
      this.pinchStartAngle = curAngle;

      // 2 fingers muter-muter camera orbit
      this.spherical.theta -= (mdx * 0.007 + deltaAngle * 1.2);
      this.spherical.phi -= mdy * 0.007;
      this.spherical.phi = THREE.MathUtils.clamp(this.spherical.phi, 0.1, Math.PI / 2 - 0.05);

      this.updateCameraTransform();
      return;
    }

    if (this.viewMode === 'city') {
      this.raycaster.setFromCamera(this.mouse, this.camera);
      const intersects = this.raycaster.intersectObjects(
        this.interactiveMeshes.map((m) => m.mesh)
      );

      if (intersects.length > 0) {
        const hit = this.interactiveMeshes.find((m) => m.mesh === intersects[0].object);
        if (hit) {
          this.hoveredLandmark = hit.landmark;
          this.container.style.cursor = 'pointer';
        }
      } else {
        this.hoveredLandmark = null;
        this.container.style.cursor = 'default';
      }
    } else {
      this.hoveredLandmark = null;
      this.container.style.cursor = 'default';
    }

    if (!this.isPointerDown) return;

    const dx = e.clientX - this.pointerStart.x;
    const dy = e.clientY - this.pointerStart.y;
    this.pointerStart = { x: e.clientX, y: e.clientY };

    if (this.isPanning && this.cameraMode !== 'follow') {
      const forward = new THREE.Vector3();
      this.camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();

      const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
      const panSpeed = this.spherical.radius * 0.0022;

      this.target.addScaledVector(right, -dx * panSpeed);
      this.target.addScaledVector(forward, dy * panSpeed);
    } else {
      this.spherical.theta -= dx * 0.005;
      this.spherical.phi -= dy * 0.005;
      this.spherical.phi = THREE.MathUtils.clamp(this.spherical.phi, 0.1, Math.PI / 2 - 0.05);
    }

    this.updateCameraTransform();
  };

  private onPointerUp = (e?: PointerEvent) => {
    if (e && this.activePointers.has(e.pointerId)) {
      this.activePointers.delete(e.pointerId);
    } else if (!e) {
      this.activePointers.clear();
    }

    if (e && this.viewMode === 'tugu') {
      const dragDist = Math.hypot(
        e.clientX - (this.pointerDownPos?.x ?? e.clientX),
        e.clientY - (this.pointerDownPos?.y ?? e.clientY)
      );
      // Tap responsif seketika (zero-delay di mobile/touch/mouse)
      if (dragDist <= 12) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Cek interaksi Pak Mayor
        if (this.mayorNPC?.root && this.mayorNPC.root.visible) {
          const hits = this.raycaster.intersectObject(this.mayorNPC.root, true);
          if (hits.length > 0) {
            const dir = this.playerPos.clone().sub(this.mayorNPC.root.position);
            if (dir.lengthSq() > 0.01) {
              this.mayorNPC.root.rotation.y = Math.atan2(dir.x, dir.z);
            }
            this.triggerMayorSpeech('Senang sekali bertemu denganmu di sini, warga tercinta!');
            this.isPointerDown = false;
            this.isPanning = false;
            return;
          }
        }

        // Tap tanah: Buat langkahnya jadi sedikit (pendek & terkontrol maksimal 2.0 meter per tap)
        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const target = new THREE.Vector3();
        if (this.raycaster.ray.intersectPlane(plane, target)) {
          const distFromCenter = Math.hypot(target.x, target.z);
          if (distFromCenter <= 24) {
            const diff = target.clone().sub(this.playerPos);
            diff.y = 0;
            const dist = diff.length();
            if (dist > 0.2) {
              const maxStep = Math.min(dist, 2.0);
              this.targetPosition = this.playerPos.clone().add(diff.normalize().multiplyScalar(maxStep));
            }
          }
        }
      }
    } else if (e && (this.viewMode === 'river' || this.viewMode === 'beach')) {
      const dragDist = Math.hypot(
        e.clientX - (this.pointerDownPos?.x ?? e.clientX),
        e.clientY - (this.pointerDownPos?.y ?? e.clientY)
      );
      if (dragDist <= 12) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const target = new THREE.Vector3();
        if (this.raycaster.ray.intersectPlane(plane, target)) {
          // If fish is biting or reeling, tapping screen also reels it in!
          if (this.fishingState === 'bite' || this.fishingState === 'reeling') {
            this.reelFishingTap();
            this.isPointerDown = false;
            this.isPanning = false;
            return;
          }

          // Differentiate between open water vs pier deck vs shore
          const isBeach = this.viewMode === 'beach';
          const isPier = isBeach
            ? target.x >= -16.5 && target.x <= 2.2 && target.z >= 26.0 && target.z <= 30.0
            : Math.abs(target.x) <= 2.85 && target.z >= -9.8 && target.z <= 2.5;
          const isShore = isBeach
            ? target.x >= 1.2 && target.x <= 16.8 && target.z >= -30.0 && target.z <= 46.0
            : target.z > 0.0;
          const isWater = isBeach
            ? target.x < 1.2 && !isPier
            : !isPier && !isShore && (target.z < -9.8 || Math.abs(target.x) > 2.85);

          // If tap in water area and fishing state is idle, directly cast!
          if (isWater && this.fishingState === 'idle') {
            this.castFishingLine(target);
            this.isPointerDown = false;
            this.isPanning = false;
            return;
          }

          // If tap on pier or shore, step avatar towards tap position (clamped to 2.0m max step)
          const diff = target.clone().sub(this.playerPos);
          diff.y = 0;
          const dist = diff.length();
          if (dist > 0.2) {
            const maxStep = Math.min(dist, 2.0);
            this.targetPosition = this.playerPos.clone().add(diff.normalize().multiplyScalar(maxStep));
          }
        }
      }
    } else if (e && this.viewMode === 'stadium') {
      const dragDist = Math.hypot(
        e.clientX - (this.pointerDownPos?.x ?? e.clientX),
        e.clientY - (this.pointerDownPos?.y ?? e.clientY)
      );
      if (dragDist <= 12) {
        const rect = this.container.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const target = new THREE.Vector3();
        if (this.raycaster.ray.intersectPlane(plane, target)) {
          // If tap near ball (distance < 2.5m) and not kicked yet, shoot toward target!
          const ballSpot = new THREE.Vector3(0, 0.2, -4.5);
          const distToBall = target.distanceTo(ballSpot);
          if (distToBall < 2.5 && !this.isBallKicked) {
            let shootDir: 'left' | 'center' | 'right' = 'center';
            if (target.x < -1.0) shootDir = 'left';
            else if (target.x > 1.0) shootDir = 'right';
            this.shootSoccerBall(shootDir, 85);
            return;
          }

          // Step avatar towards tap position on pitch
          const diff = target.clone().sub(this.playerPos);
          diff.y = 0;
          const dist = diff.length();
          if (dist > 0.2) {
            const maxStep = Math.min(dist, 2.0);
            this.targetPosition = this.playerPos.clone().add(diff.normalize().multiplyScalar(maxStep));
          }
        }
      }
    }

    if (this.activePointers.size === 0) {
      this.isPointerDown = false;
      this.isPanning = false;
    } else if (this.activePointers.size === 1) {
      const remaining = Array.from(this.activePointers.values())[0];
      this.pointerStart = { x: remaining.x, y: remaining.y };
      this.isPanning = e ? (e.pointerType === 'touch' || e.button === 2 || e.shiftKey) : false;
    }
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1 + Math.sign(e.deltaY) * 0.09;
    this.spherical.radius *= zoomFactor;
    this.updateCameraTransform();
  };

  private onClick = (e: MouseEvent) => {
    const dragDist = Math.hypot(
      e.clientX - (this.pointerDownPos?.x ?? e.clientX),
      e.clientY - (this.pointerDownPos?.y ?? e.clientY)
    );
    // Generous tap tolerance for touch devices (up to 16px finger slip)
    if (dragDist > 16) return;

    if (this.viewMode === 'city') {
      const rect = this.container.getBoundingClientRect();
      const clickMouse = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1
      );
      this.raycaster.setFromCamera(clickMouse, this.camera);

      // 0. Raycast against Scavenger Hunt Cats
      if (this.interactiveCatMeshes.length > 0) {
        const catHits = this.raycaster.intersectObjects(
          this.interactiveCatMeshes.map((c) => c.mesh)
        );
        if (catHits.length > 0) {
          const hit = this.interactiveCatMeshes.find((c) => c.mesh === catHits[0].object);
          if (hit) {
            const cat = this.cats.find((c) => c.id === hit.catId);
            if (cat) {
              cat.bounceTimer = 1.0;
              if (typeof window !== 'undefined') {
                window.dispatchEvent(
                  new CustomEvent('cat-clicked', {
                    detail: {
                      id: cat.id,
                      name: cat.name,
                      hint: cat.locationHint,
                    },
                  })
                );
              }
              return;
            }
          }
        }
      }

      // 1. Raycast directly against interactive landmark hitboxes
      const intersects = this.raycaster.intersectObjects(
        this.interactiveMeshes.map((m) => m.mesh)
      );

      let targetLandmark: LandmarkLocation | null = null;

      if (intersects.length > 0) {
        const hit = this.interactiveMeshes.find((m) => m.mesh === intersects[0].object);
        if (hit) {
          targetLandmark = hit.landmark;
        }
      }

      // 2. If no direct cylinder hit, check ground ray intersection distance
      if (!targetLandmark) {
        const groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
        const groundHit = new THREE.Vector3();
        if (this.raycaster.ray.intersectPlane(groundPlane, groundHit)) {
          // Find closest landmark within its proper radius
          let closestDist = Infinity;
          for (const lm of this.landmarks) {
            const d = groundHit.distanceTo(lm.position);
            const maxDist = lm.id === 'monument' ? 15.0 : lm.id === 'investor_tower' ? 10.0 : Math.max(lm.radius * 1.3, 12.0);
            if (d <= maxDist && d < closestDist) {
              closestDist = d;
              targetLandmark = lm;
            }
          }
        }
      }

      // Fallback to hoveredLandmark if any
      if (!targetLandmark && this.hoveredLandmark) {
        targetLandmark = this.hoveredLandmark;
      }

      if (targetLandmark) {
        if (targetLandmark.id === 'monument') {
          useGameStore.getState().setSelectedBuilding('monument');
          useGameStore.getState().setCurrentDistrict('Pusat Kota');
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('open-tugu-confirm'));
          }
          return;
        }

        // For every other landmark: update Zustand store and dispatch landmark-selected
        useGameStore.getState().setSelectedBuilding(targetLandmark.id);
        useGameStore.getState().setCurrentDistrict(targetLandmark.district);
        useUIStore.getState().openModal('building_details');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('landmark-selected', { detail: targetLandmark })
          );
        }
        return;
      }
    }

    if (this.viewMode === 'tugu' || this.viewMode === 'river' || this.viewMode === 'stadium' || this.viewMode === 'beach') {
      // Tap input di alun-alun tugu, sungai, dermaga, pantai, dan stadion sudah ditangani instan (0ms delay) di onPointerUp
      return;
    }
  };

  private onKeyDown = (e: KeyboardEvent) => {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return;
    }
    const key = e.key.toLowerCase();
    const code = e.code.toLowerCase();
    this.keysPressed[key] = true;
    this.keysPressed[code] = true;

    if (
      ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(code) ||
      ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)
    ) {
      e.preventDefault();
    }
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    const code = e.code.toLowerCase();
    this.keysPressed[key] = false;
    this.keysPressed[code] = false;
  };

  private onWindowBlur = () => {
    this.keysPressed = {};
    this.virtualMove = null;
    this.targetPosition = null;
  };

  private onResize = () => {
    if (!this.container || this.isDestroyed) return;
    const W = this.container.clientWidth;
    const H = this.container.clientHeight;
    this.camera.aspect = W / H;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(W, H);
  };

  // ============================================================
  // UPDATE & ANIMATION LOOP
  // ============================================================

  private showPlayerSpeechBubble(text: string) {
    if (this.playerSpeechBubble) {
      this.playerSpeechBubble.parent?.remove(this.playerSpeechBubble);
      this.playerSpeechBubble = null;
    }
    const sprite = makeSpeechBubbleSprite(text, '#FFF0EB', '#D97858');
    sprite.position.set(0, 2.15, 0);
    const targetRoot = this.isPlayerAdmin ? this.mayorPlayer?.root : this.playerCitizen?.root;
    if (targetRoot) {
      targetRoot.add(sprite);
      this.playerSpeechBubble = sprite;
      this.playerBubbleTimer = 6.0;
    }
  }

  private triggerRandomNPCBubble() {
    if (this.tuguCitizens.length === 0) return;
    const available = this.tuguCitizens.filter((c) => !c.bubble);
    if (available.length === 0) return;
    const citizen = available[Math.floor(Math.random() * available.length)];

    const dialogue = TUGU_DIALOGUES[Math.floor(Math.random() * TUGU_DIALOGUES.length)];
    const sprite = makeSpeechBubbleSprite(dialogue, '#FFFDF9', '#3B3340');
    sprite.position.set(0, 2.7, 0);
    citizen.instance.root.add(sprite);
    citizen.bubble = sprite;
    citizen.bubbleTimer = 4.5;
  }

  private updateTuguCitizens(delta: number, elapsed: number) {
    this.tuguCitizens.forEach((wc) => {
      if (wc.bubble) {
        wc.bubbleTimer = (wc.bubbleTimer || 0) - delta;
        if (wc.bubbleTimer <= 0) {
          wc.instance.root.remove(wc.bubble);
          wc.bubble = null;
        }
      }

      if (wc.isStationary) {
        wc.instance.pose(false, elapsed);
        return;
      }

      if (wc.state === 'walk_to_B') {
        const cur = wc.instance.root.position;
        const dist = cur.distanceTo(wc.pB);
        if (dist < 0.25) {
          wc.instance.root.position.copy(wc.pB);
          wc.state = 'idle_at_B';
          wc.timer = 2.5 + Math.random() * 2.5;
          wc.instance.pose(false, elapsed);
        } else {
          const dir = wc.pB.clone().sub(cur).normalize();
          wc.facing = Math.atan2(dir.x, dir.z);
          wc.instance.root.rotation.y = wc.facing;
          wc.instance.root.position.addScaledVector(dir, wc.speed * delta);
          wc.instance.pose(true, elapsed, 5.2);
        }
      } else if (wc.state === 'idle_at_B') {
        wc.timer -= delta;
        wc.instance.pose(false, elapsed);
        if (wc.timer <= 0) wc.state = 'walk_to_A';
      } else if (wc.state === 'walk_to_A') {
        const cur = wc.instance.root.position;
        const dist = cur.distanceTo(wc.pA);
        if (dist < 0.25) {
          wc.instance.root.position.copy(wc.pA);
          wc.state = 'idle_at_A';
          wc.timer = 2.5 + Math.random() * 2.5;
          wc.instance.pose(false, elapsed);
        } else {
          const dir = wc.pA.clone().sub(cur).normalize();
          wc.facing = Math.atan2(dir.x, dir.z);
          wc.instance.root.rotation.y = wc.facing;
          wc.instance.root.position.addScaledVector(dir, wc.speed * delta);
          wc.instance.pose(true, elapsed, 5.2);
        }
      } else if (wc.state === 'idle_at_A') {
        wc.timer -= delta;
        wc.instance.pose(false, elapsed);
        if (wc.timer <= 0) wc.state = 'walk_to_B';
      }
    });

    this.npcBubbleTimer -= delta;
    if (this.npcBubbleTimer <= 0) {
      this.npcBubbleTimer = 5.0 + Math.random() * 4.0;
      this.triggerRandomNPCBubble();
    }
  }

  public triggerMayorSpeech(customText?: string) {
    if (!this.mayorNPC?.root) return;
    if (this.mayorSpeechBubble) {
      this.mayorNPC.root.remove(this.mayorSpeechBubble);
      this.mayorSpeechBubble = null;
    }
    const quotes = [
      'Halo warga netizen yang terhormat!',
      'Selamat datang di Alun-Alun Tugu!',
      'Kota Netizen semakin asri berkat kebersamaan warga!',
      'Jaga kebersihan taman kota kita bersama ya!',
      'Mampir juga ke Balai Kota dan Grand Mall warga!',
      'Kucing oranye saya suka sekali bermain di sekitar sini hehe.',
      'Senang melihat seluruh warga berkumpul dengan rukun!',
    ];
    const text = customText || quotes[Math.floor(Math.random() * quotes.length)];
    const bubble = makeSpeechBubbleSprite(text, '#FFFBF0', '#343B35');
    bubble.position.set(0, 2.35, 0);
    this.mayorNPC.root.add(bubble);
    this.mayorSpeechBubble = bubble;
    this.mayorBubbleTimer = 6.0;
  }

  private updatePakMayor(delta: number, elapsed: number) {
    if (!this.mayorNPC?.root || !this.mayorNPC.root.visible) return;

    if (this.mayorSpeechBubble) {
      this.mayorBubbleTimer -= delta;
      if (this.mayorBubbleTimer <= 0) {
        this.mayorNPC.root.remove(this.mayorSpeechBubble);
        this.mayorSpeechBubble = null;
      }
    }

    this.mayorSpeechTimer -= delta;
    if (this.mayorSpeechTimer <= 0) {
      this.mayorSpeechTimer = 16.0 + Math.random() * 8.0;
      this.triggerMayorSpeech();
    }

    const cur = this.mayorNPC.root.position;
    const target = this.mayorWaypoints[this.mayorWaypointIndex];
    const dist = cur.distanceTo(target);

    if (this.mayorIsMoving) {
      if (dist < 0.25) {
        cur.copy(target);
        this.mayorIsMoving = false;
        this.mayorPauseTimer = 3.5 + Math.random() * 2.5;
        this.mayorNPC.pose(false, elapsed);
      } else {
        const dir = target.clone().sub(cur).normalize();
        const moveFacing = Math.atan2(dir.x, dir.z);
        let diff = (moveFacing - this.mayorNPC.root.rotation.y) % (Math.PI * 2);
        if (diff > Math.PI) diff -= Math.PI * 2;
        if (diff < -Math.PI) diff += Math.PI * 2;
        this.mayorNPC.root.rotation.y += diff * Math.min(1, delta * 5.0);

        const walkSpeed = 1.9;
        cur.addScaledVector(dir, walkSpeed * delta);
        this.mayorNPC.pose(true, elapsed, 4.0);
      }
    } else {
      this.mayorPauseTimer -= delta;
      this.mayorNPC.pose(false, elapsed);

      if (this.mayorPauseTimer <= 0) {
        this.mayorWaypointIndex = (this.mayorWaypointIndex + 1) % this.mayorWaypoints.length;
        this.mayorIsMoving = true;
      }
    }
  }

  private updateCharacter(delta: number, elapsed: number) {
    if (this.viewMode !== 'tugu' && this.viewMode !== 'river' && this.viewMode !== 'beach') {
      return;
    }

    if (this.playerSpeechBubble) {
      this.playerBubbleTimer -= delta;
      if (this.playerBubbleTimer <= 0) {
        this.playerSpeechBubble.parent?.remove(this.playerSpeechBubble);
        this.playerSpeechBubble = null;
      }
    }

    const camDir = new THREE.Vector3();
    this.camera.getWorldDirection(camDir);
    camDir.y = 0;
    camDir.normalize();

    const camRight = new THREE.Vector3().crossVectors(camDir, new THREE.Vector3(0, 1, 0)).normalize();

    let moveVec = new THREE.Vector3();
    let analogFactor = 1.0;
    if (this.virtualMove) {
      const vx = THREE.MathUtils.clamp(this.virtualMove.x, -1, 1);
      const vy = THREE.MathUtils.clamp(this.virtualMove.y, -1, 1);
      const mag = Math.hypot(vx, vy);
      if (mag > 0.05) {
        analogFactor = Math.min(1.0, mag);
        moveVec.addScaledVector(camDir, -vy);
        moveVec.addScaledVector(camRight, vx);
      }
    }
    if (this.keysPressed['w'] || this.keysPressed['arrowup'] || this.keysPressed['keyw']) moveVec.add(camDir);
    if (this.keysPressed['s'] || this.keysPressed['arrowdown'] || this.keysPressed['keys']) moveVec.sub(camDir);
    if (this.keysPressed['d'] || this.keysPressed['arrowright'] || this.keysPressed['keyd']) moveVec.add(camRight);
    if (this.keysPressed['a'] || this.keysPressed['arrowleft'] || this.keysPressed['keya']) moveVec.sub(camRight);

    if ((this.viewMode === 'river' || this.viewMode === 'beach') && this.fishingState !== 'idle') {
      moveVec.set(0, 0, 0);
      this.targetPosition = null;
      // Lock avatar orientation directly facing the fishing bobber!
      const dx = this.targetBobberPos.x - this.playerPos.x;
      const dz = this.targetBobberPos.z - this.playerPos.z;
      this.playerFacing = Math.atan2(dx, dz);
    }

    let isMoving = false;
    const speed = 4.5 * delta * analogFactor;

    if (moveVec.lengthSq() > 0.001) {
      this.targetPosition = null;
      moveVec.normalize().multiplyScalar(speed);

      const nextPos = this.playerPos.clone().add(moveVec);
      if (this.viewMode === 'tugu') {
        const dist = Math.hypot(nextPos.x, nextPos.z);
        if (dist > 23.5) {
          const angle = Math.atan2(nextPos.z, nextPos.x);
          nextPos.x = Math.cos(angle) * 23.5;
          nextPos.z = Math.sin(angle) * 23.5;
        }
        if (dist < 4.2) {
          const angle = Math.atan2(nextPos.z, nextPos.x);
          nextPos.x = Math.cos(angle) * 4.2;
          nextPos.z = Math.sin(angle) * 4.2;
        }
      } else if (this.viewMode === 'river') {
        if (nextPos.z < 2.0) {
          nextPos.x = THREE.MathUtils.clamp(nextPos.x, -2.2, 2.2);
          nextPos.z = THREE.MathUtils.clamp(nextPos.z, -9.2, 2.0);
          nextPos.y = 0.35;
        } else if (nextPos.z <= 3.0) {
          nextPos.x = THREE.MathUtils.clamp(nextPos.x, -2.2, 2.2);
          const t = (nextPos.z - 2.0) / (3.0 - 2.0);
          nextPos.y = THREE.MathUtils.lerp(0.35, 0.0, t);
        } else {
          nextPos.x = THREE.MathUtils.clamp(nextPos.x, -28.0, 28.0);
          nextPos.z = THREE.MathUtils.clamp(nextPos.z, 3.0, 18.0);
          nextPos.y = 0.0;
        }
      } else if (this.viewMode === 'beach') {
        const onPier = nextPos.x <= 1.2 && nextPos.z >= 26.2 && nextPos.z <= 29.8;
        const onRamp = nextPos.x > 1.2 && nextPos.x <= 2.2 && nextPos.z >= 26.2 && nextPos.z <= 29.8;

        if (onPier) {
          nextPos.x = THREE.MathUtils.clamp(nextPos.x, -16.0, 1.2);
          nextPos.z = THREE.MathUtils.clamp(nextPos.z, 26.4, 29.6);
          nextPos.y = 0.35;
        } else if (onRamp) {
          nextPos.x = THREE.MathUtils.clamp(nextPos.x, 1.2, 2.2);
          nextPos.z = THREE.MathUtils.clamp(nextPos.z, 26.4, 29.6);
          const t = (nextPos.x - 1.2) / (2.2 - 1.2);
          nextPos.y = THREE.MathUtils.lerp(0.35, 0.0, t);
        } else {
          nextPos.x = THREE.MathUtils.clamp(nextPos.x, 1.2, 16.5);
          nextPos.z = THREE.MathUtils.clamp(nextPos.z, -28.0, 44.0);
          nextPos.y = 0.0;
        }
      } else if (this.viewMode === 'stadium') {
        nextPos.x = THREE.MathUtils.clamp(nextPos.x, -34.0, 34.0);
        nextPos.z = THREE.MathUtils.clamp(nextPos.z, -22.0, 56.0);
        nextPos.y = 0.1;
        if (nextPos.z > 53.5 && Math.abs(nextPos.x) < 3.5) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('exit-stadium-area'));
          }
        }
      }

      this.playerPos.copy(nextPos);
      this.playerFacing = Math.atan2(moveVec.x, moveVec.z);
      isMoving = true;
    } else if (this.targetPosition) {
      const diff = this.targetPosition.clone().sub(this.playerPos);
      diff.y = 0;
      const remainingDist = diff.length();
      if (remainingDist > 0.12) {
        this.playerFacing = Math.atan2(diff.x, diff.z);
        const moveDist = Math.min(speed, remainingDist);
        diff.normalize().multiplyScalar(moveDist);

        const nextPos = this.playerPos.clone().add(diff);
        if (this.viewMode === 'tugu') {
          const dist = Math.hypot(nextPos.x, nextPos.z);
          if (dist > 23.5) {
            const angle = Math.atan2(nextPos.z, nextPos.x);
            nextPos.x = Math.cos(angle) * 23.5;
            nextPos.z = Math.sin(angle) * 23.5;
          }
          if (dist < 4.2) {
            const angle = Math.atan2(nextPos.z, nextPos.x);
            nextPos.x = Math.cos(angle) * 4.2;
            nextPos.z = Math.sin(angle) * 4.2;
          }
        } else if (this.viewMode === 'river') {
          if (nextPos.z < 2.0) {
            nextPos.x = THREE.MathUtils.clamp(nextPos.x, -2.2, 2.2);
            nextPos.z = THREE.MathUtils.clamp(nextPos.z, -9.2, 2.0);
            nextPos.y = 0.35;
          } else if (nextPos.z <= 3.0) {
            nextPos.x = THREE.MathUtils.clamp(nextPos.x, -2.2, 2.2);
            const t = (nextPos.z - 2.0) / (3.0 - 2.0);
            nextPos.y = THREE.MathUtils.lerp(0.35, 0.0, t);
          } else {
            nextPos.x = THREE.MathUtils.clamp(nextPos.x, -28.0, 28.0);
            nextPos.z = THREE.MathUtils.clamp(nextPos.z, 3.0, 18.0);
            nextPos.y = 0.0;
          }
        } else if (this.viewMode === 'beach') {
          const onPier = nextPos.x <= 1.2 && nextPos.z >= 26.2 && nextPos.z <= 29.8;
          const onRamp = nextPos.x > 1.2 && nextPos.x <= 2.2 && nextPos.z >= 26.2 && nextPos.z <= 29.8;

          if (onPier) {
            nextPos.x = THREE.MathUtils.clamp(nextPos.x, -16.0, 1.2);
            nextPos.z = THREE.MathUtils.clamp(nextPos.z, 26.4, 29.6);
            nextPos.y = 0.35;
          } else if (onRamp) {
            nextPos.x = THREE.MathUtils.clamp(nextPos.x, 1.2, 2.2);
            nextPos.z = THREE.MathUtils.clamp(nextPos.z, 26.4, 29.6);
            const t = (nextPos.x - 1.2) / (2.2 - 1.2);
            nextPos.y = THREE.MathUtils.lerp(0.35, 0.0, t);
          } else {
            nextPos.x = THREE.MathUtils.clamp(nextPos.x, 1.2, 16.5);
            nextPos.z = THREE.MathUtils.clamp(nextPos.z, -28.0, 44.0);
            nextPos.y = 0.0;
          }
        } else if (this.viewMode === 'stadium') {
          nextPos.x = THREE.MathUtils.clamp(nextPos.x, -34.0, 34.0);
          nextPos.z = THREE.MathUtils.clamp(nextPos.z, -22.0, 56.0);
          nextPos.y = 0.1;
          if (nextPos.z > 53.5 && Math.abs(nextPos.x) < 3.5) {
            if (typeof window !== 'undefined') {
              window.dispatchEvent(new CustomEvent('exit-stadium-area'));
            }
          }
        }

        this.playerPos.copy(nextPos);
        isMoving = true;
      } else {
        this.targetPosition = null;
      }
    }

    this.isPlayerWalking = isMoving;

    if (this.isPlayerAdmin && this.mayorPlayer) {
      this.mayorPlayer.root.position.copy(this.playerPos);
      this.mayorPlayer.root.rotation.y = this.playerFacing;
      this.mayorPlayer.pose?.(isMoving, elapsed, 4.5);
    } else if (this.playerCitizen) {
      this.playerCitizen.root.position.copy(this.playerPos);
      this.playerCitizen.root.rotation.y = this.playerFacing;
      this.playerCitizen.pose(isMoving, elapsed, 4.5);
      if (this.viewMode === 'river' || this.viewMode === 'beach') {
        if (isMoving) {
          this.playerCitizen.rightArm.rotation.set(-0.45 + Math.sin(elapsed * 4.5) * 0.08, -0.1, 0);
        } else if (this.fishingState !== 'idle') {
          // Do not allow idle breathing pose to overwrite steady angler arm stance
          this.playerCitizen.rightArm.rotation.set(-0.55, -0.1, 0);
          this.playerCitizen.leftArm.rotation.set(-0.45, 0.3, 0);
        }
      }
    }

    if (this.cat) {
      const catOffset = new THREE.Vector3(-1.1, 0, -1.0).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.playerFacing
      );
      const catTarget = this.playerPos.clone().add(catOffset);
      this.cat.root.position.lerp(catTarget, 0.25);
      this.cat.root.rotation.y = this.playerFacing;
    }

    if (this.cameraMode === 'follow') {
      this.target.copy(this.playerPos).add(new THREE.Vector3(0, 1.4, 0));
      this.updateCameraTransform();
    }

    // Exit portal check
    if (this.viewMode === 'tugu') {
      if (Math.hypot(this.playerPos.x - 0, this.playerPos.z - 22) <= 2.2) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('exit-tugu-area'));
        }
      }
    } else if (this.viewMode === 'river') {
      if (Math.hypot(this.playerPos.x - 0, this.playerPos.z - 13.5) <= 2.0) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('exit-river-area'));
        }
      }
    } else if (this.viewMode === 'beach') {
      if (Math.hypot(this.playerPos.x - 16.5, this.playerPos.z - 0) <= 2.2) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('exit-beach-area'));
        }
      }
    }
  }

  private updateAnimals(elapsed: number) {
    if (this.zoo?.animals) {
      this.zoo.animals.forEach((an: any) => {
        if (an.k === 'elephant') {
          // 1. Elephant: walks circular patrol in pen, swings trunk, flaps ears, heavy footsteps
          const walkAngle = elapsed * 0.45;
          an.g.position.x = (an.home?.x || 0) + Math.cos(walkAngle) * 1.8;
          an.g.position.z = (an.home?.z || 0) + Math.sin(walkAngle) * 1.8;
          an.g.rotation.y = -walkAngle + Math.PI / 2;
          an.g.position.y = 0.06 + Math.abs(Math.sin(elapsed * 2.5)) * 0.08;

          if (an.legs) {
            an.legs.forEach((leg: any, li: number) => {
              leg.rotation.x = Math.sin(elapsed * 2.5 + (li === 0 || li === 3 ? 0 : Math.PI)) * 0.45;
            });
          }
          if (an.trunk) {
            an.trunk.rotation.x = Math.sin(elapsed * 2.2) * 0.45 - 0.2;
            an.trunk.rotation.z = Math.sin(elapsed * 1.8) * 0.25;
          }
          if (an.head) {
            an.head.rotation.y = Math.sin(elapsed * 1.2) * 0.2;
            an.head.rotation.x = Math.sin(elapsed * 2.5) * 0.12;
          }
          if (an.ears) {
            an.ears.forEach((ear: any, ei: number) => {
              ear.rotation.y = (ei === 0 ? 1 : -1) * (0.35 + Math.sin(elapsed * 3.0) * 0.3);
            });
          }
        } else if (an.k === 'giraffe') {
          // 2. Giraffe: walks oval patrol, long legs stride, long neck bends to graze and stretches tall
          const gAngle = elapsed * 0.38;
          an.g.position.x = (an.home?.x || 0) + Math.sin(gAngle) * 1.5;
          an.g.position.z = (an.home?.z || 0) + Math.cos(gAngle) * 1.2;
          an.g.rotation.y = Math.atan2(Math.cos(gAngle) * 1.5, -Math.sin(gAngle) * 1.2);
          an.g.position.y = 0.06 + Math.abs(Math.sin(elapsed * 2.0)) * 0.06;

          if (an.legs) {
            an.legs.forEach((leg: any, li: number) => {
              leg.rotation.x = Math.sin(elapsed * 2.0 + (li === 0 || li === 3 ? 0 : Math.PI)) * 0.38;
            });
          }
          if (an.neck) {
            const neckCycle = Math.sin(elapsed * 0.7);
            an.neck.rotation.x = 0.35 + neckCycle * 0.38;
            an.neck.rotation.z = Math.sin(elapsed * 1.1) * 0.12;
          }
          if (an.head) {
            an.head.rotation.x = -Math.sin(elapsed * 0.7) * 0.25;
          }
        } else if (an.k === 'flamingo') {
          // 3. Flamingos: 3 distinct behaviors (wading, filter-feeding with neck dip, preening)
          if (an.i === 0) {
            const dip = Math.sin(elapsed * 1.8);
            if (an.neck) an.neck.rotation.x = 0.6 + dip * 0.5;
            if (an.head) an.head.rotation.y = Math.sin(elapsed * 5.0) * 0.25;
            an.g.position.y = (an.home?.y || 0.06) + Math.sin(elapsed * 1.5) * 0.03;
          } else if (an.i === 1) {
            const fAngle = elapsed * 0.6;
            an.g.position.x = (an.home?.x || 0) + Math.cos(fAngle) * 1.0;
            an.g.position.z = (an.home?.z || 0) + Math.sin(fAngle) * 0.8;
            an.g.rotation.y = -fAngle + Math.PI / 2;
            an.g.position.y = 0.06 + Math.abs(Math.sin(elapsed * 3.0)) * 0.08;
            if (an.neck) an.neck.rotation.z = Math.sin(elapsed * 3.0) * 0.15;
            if (an.bent) an.bent.rotation.x = 1.2 + Math.sin(elapsed * 3.0) * 0.35;
          } else {
            an.g.rotation.y = (an.ry || 0) + Math.sin(elapsed * 0.8) * 0.4;
            if (an.neck) an.neck.rotation.x = 0.2 + Math.sin(elapsed * 1.2) * 0.25;
            if (an.head) an.head.rotation.z = Math.sin(elapsed * 2.0) * 0.2;
          }
        } else if (an.k === 'lion') {
          // 4. Lion: paces back and forth along front fence, pauses to raise head and ROAR with open jaw
          const paceT = elapsed * 0.65;
          const pacePhase = Math.sin(paceT);
          const isRoaring = Math.sin(elapsed * 0.28) > 0.72;

          if (isRoaring) {
            if (an.head) an.head.rotation.x = -0.38;
            if (an.jaw) an.jaw.rotation.x = 0.45;
            if (an.tail) an.tail.rotation.x = -0.5 + Math.sin(elapsed * 10) * 0.2;
            if (an.legs) an.legs.forEach((leg: any) => (leg.rotation.x = 0));
          } else {
            const paceX = pacePhase * 1.5;
            const paceDir = Math.cos(paceT) >= 0 ? 1 : -1;
            an.g.position.x = (an.home?.x || 0) + paceX;
            an.g.position.z = (an.home?.z || 0) + Math.abs(pacePhase) * 0.35;
            an.g.rotation.y = (an.ry || 0) + (paceDir > 0 ? Math.PI / 2 : -Math.PI / 2);
            an.g.position.y = 0.06 + Math.abs(Math.sin(elapsed * 3.2)) * 0.05;
            if (an.head) {
              an.head.rotation.x = Math.sin(elapsed * 1.5) * 0.1;
              an.head.rotation.y = Math.sin(elapsed * 0.8) * 0.15;
            }
            if (an.jaw) an.jaw.rotation.x = 0.05;
            if (an.tail) an.tail.rotation.y = Math.sin(elapsed * 3.0) * 0.35;
            if (an.legs) {
              an.legs.forEach((leg: any, li: number) => {
                leg.rotation.x = Math.sin(elapsed * 3.2 + (li === 0 || li === 3 ? 0 : Math.PI)) * 0.45;
              });
            }
          }
        } else if (an.k === 'penguin') {
          // 5. Penguins: Rock penguin hops and flaps flippers; other penguins waddle in parade around ice pool
          if (an.i === 0) {
            const hop = Math.abs(Math.sin(elapsed * 4.0));
            an.g.position.y = 0.36 + (hop > 0.8 ? (hop - 0.8) * 0.5 : 0);
            an.g.rotation.y = (an.ry || 0) + Math.sin(elapsed * 1.2) * 0.4;
            if (an.flippers) {
              an.flippers.forEach((f: any, fi: number) => {
                f.rotation.z = (fi === 0 ? 1 : -1) * (0.3 + Math.sin(elapsed * 8.0) * 0.45);
              });
            }
          } else {
            const pAngle = elapsed * 0.85 + an.i * 2.1;
            an.g.position.x = (an.home?.x || 0) + Math.cos(pAngle) * 1.3;
            an.g.position.z = (an.home?.z || 0) + Math.sin(pAngle) * 1.3;
            an.g.rotation.y = -pAngle + Math.PI / 2;
            an.g.rotation.z = Math.sin(elapsed * 7.5 + an.i) * 0.35;
            an.g.position.y = 0.06 + Math.abs(Math.sin(elapsed * 7.5 + an.i)) * 0.12;
            if (an.flippers) {
              an.flippers.forEach((f: any, fi: number) => {
                f.rotation.z = (fi === 0 ? 1 : -1) * (0.3 + Math.sin(elapsed * 7.5 + an.i) * 0.35);
              });
            }
          }
        } else if (an.k === 'komodo') {
          // 6. Komodo Dragon: Crawls in an S-curve across enclosure, wiggles body & tail, legs crawl
          const kt = elapsed * 0.45;
          const kx = Math.sin(kt) * 1.6;
          const kz = Math.sin(kt * 2) * 0.9;
          an.g.position.x = (an.home?.x || 0) + kx;
          an.g.position.z = (an.home?.z || 0) + kz;
          const dkx = Math.cos(kt) * 1.6 * 0.45;
          const dkz = Math.cos(kt * 2) * 1.8 * 0.45;
          an.g.rotation.y = Math.atan2(dkx, dkz);
          an.g.rotation.z = Math.sin(elapsed * 3.5) * 0.12;
          if (an.head) an.head.rotation.y = Math.sin(elapsed * 3.5) * 0.25;
          if (an.tail) an.tail.rotation.y = -Math.sin(elapsed * 3.5) * 0.45;
          if (an.legs) {
            an.legs.forEach((leg: any, li: number) => {
              leg.rotation.y = Math.sin(elapsed * 3.5 + (li % 2 ? 0 : Math.PI)) * 0.4;
            });
          }
        }
      });
    }
  }

  // Animate landing airplane (every 10 minutes) and high-altitude sky jet (every 5 minutes)
  private updateAirplanes(elapsed: number) {
    // 1. Landing airplane loop: runs once every 10 minutes (600 seconds)
    if (this.landingPlane) {
      const LANDING_CYCLE = 600; // 10 minutes = 600 seconds
      const t = elapsed % LANDING_CYCLE;

      if (t < 35) {
        // Approach & glide slope descent
        const progress = t / 35;
        const y = THREE.MathUtils.lerp(65, 0.4, progress);
        const z = THREE.MathUtils.lerp(180, 0, progress);
        this.landingPlane.root.position.set(AIR.x, y, z);
        this.landingPlane.root.rotation.set(-0.06, Math.PI, 0);
        this.landingPlane.root.visible = true;
      } else if (t < 65) {
        // Runway deceleration roll out
        const progress = (t - 35) / 30;
        const z = THREE.MathUtils.lerp(0, -75, progress);
        this.landingPlane.root.position.set(AIR.x, 0.2, z);
        this.landingPlane.root.rotation.set(0, Math.PI, 0);
        this.landingPlane.root.visible = true;
      } else if (t < 95) {
        // Taxi towards airport terminal apron
        const progress = (t - 65) / 30;
        const x = THREE.MathUtils.lerp(AIR.x, AIR.term.x + 9.5, progress);
        const z = THREE.MathUtils.lerp(-75, AIR.term.z, progress);
        this.landingPlane.root.position.set(x, 0.2, z);
        this.landingPlane.root.rotation.set(0, Math.PI * 0.75, progress < 0.5 ? 0 : -Math.PI / 2);
        this.landingPlane.root.visible = true;
      } else if (t < 300) {
        // Parked at gate for 3.5 minutes
        this.landingPlane.root.position.set(AIR.term.x + 9.5, 0.2, AIR.term.z);
        this.landingPlane.root.rotation.set(0, -Math.PI / 2, 0);
        this.landingPlane.root.visible = true;
      } else {
        // Departed / off-screen awaiting next flight
        this.landingPlane.root.visible = false;
      }
    }

    // 2. High altitude sky cruising airplane: runs once every 5 minutes (300 seconds)
    if (this.skyPlane) {
      const SKY_CYCLE = 300; // 5 minutes = 300 seconds
      const t = elapsed % SKY_CYCLE;

      if (t < 45) {
        // Flies across the sky during the first 45 seconds of the 5-minute interval
        const progress = t / 45;
        const skyX = THREE.MathUtils.lerp(-350, 350, progress);
        this.skyPlane.root.position.set(skyX, 175, -50);
        this.skyPlane.root.rotation.set(0, Math.PI / 2, 0);
        this.skyPlane.root.visible = true;
      } else {
        this.skyPlane.root.visible = false;
      }
    }
  }

  private checkDistrictProximity() {
    if (this.viewMode === 'tugu') {
      useGameStore.getState().setViewMode('tugu');
      useGameStore.getState().setSelectedBuilding('monument');
      useGameStore.getState().setCurrentDistrict('Pusat Kota');
    } else if (this.viewMode === 'river') {
      useGameStore.getState().setViewMode('river');
      useGameStore.getState().setSelectedBuilding('river_spot');
      useGameStore.getState().setCurrentDistrict('Kawasan Alam');
    } else if (this.viewMode === 'beach') {
      useGameStore.getState().setViewMode('beach');
      useGameStore.getState().setSelectedBuilding('netizen_beach');
      useGameStore.getState().setCurrentDistrict('Pantai Netizen Beach');
    } else if (this.viewMode === 'stadium') {
      useGameStore.getState().setViewMode('stadium');
      useGameStore.getState().setSelectedBuilding('sports_stadium');
      useGameStore.getState().setCurrentDistrict('Kawasan Olahraga');
    } else {
      useGameStore.getState().setViewMode('city');
      useGameStore.getState().setSelectedBuilding(null);
    }
  }

  private animate = () => {
    if (this.isDestroyed) return;
    this.reqId = requestAnimationFrame(this.animate);

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const delta = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;
    const elapsed = (now - this.startTime) / 1000;

    if (this.viewMode === 'tugu') {
      this.updateCharacter(delta, elapsed);
      this.updateTuguCitizens(delta, elapsed);
      this.updateRemotePlayersAnimation(delta, elapsed);
      this.updatePakMayor(delta, elapsed);
      if (this.tuguMpark?.jets) {
        this.tuguMpark.jets.children.forEach((j: any, i: number) => {
          j.scale.y = 0.5 + Math.sin(elapsed * 4 + i * 0.4) * 0.4;
        });
      }
    } else if (this.viewMode === 'river' || this.viewMode === 'beach') {
      this.updateCharacter(delta, elapsed);
      this.updateRemotePlayersAnimation(delta, elapsed);
      this.updateRiver(delta, elapsed);
    } else if (this.viewMode === 'stadium') {
      this.updateCharacter(delta, elapsed);
      this.updateStadium(delta, elapsed);
    } else {
      this.updateAirplanes(elapsed);
      this.updateAnimals(elapsed);
      this.updateCats(delta, elapsed);
      if (this.metro?.mpark?.jets) {
        this.metro.mpark.jets.children.forEach((j: any, i: number) => {
          j.scale.y = 0.5 + Math.sin(elapsed * 4 + i * 0.4) * 0.4;
        });
      }
    }

    // City animations: ONLY execute in City mode to maximize performance in Tugu mode
    if (this.viewMode === 'city') {
      if (this.metro) {
        this.metro.update(elapsed, elapsed, 1e9, elapsed + 40, 1e9, 1e9, 1e9, [], 1e9);
      }
      if (this.clouds) {
        this.clouds.position.x = elapsed * 0.6;
      }
      if (this.river) {
        this.river.build(1, elapsed);
      }
      if (this.mtn) {
        this.mtn.build(1, 1, elapsed);
      }
      if (this.beach) {
        this.beach.build(1, 1, 1, elapsed);
      }
      if (this.lab) {
        this.lab.update(elapsed);
      }
      if (this.tower) {
        this.tower.env(1);
      }
      if (this.fireflies && (this.timeOfDay === 'night' || this.timeOfDay === 'sunset')) {
        this.fireflies.update(elapsed, 1.0);
      }
      this.updateCityLandmarkNPCs(delta, elapsed);
    }

    // Render 3D Scene
    this.renderer.render(this.scene, this.camera);
  };

  // ============================================================
  // SCAVENGER HUNT CATS & ANIMAL LOGIC
  // ============================================================
  private setupCats() {
    this.cats = [];
    this.interactiveCatMeshes = [];

    const CAT_SPECS = [
      {
        id: 'cat_oren',
        name: 'Si Oren Alun-Alun',
        color: '#E67E22',
        earColor: '#D35400',
        hint: 'Suka berjemur di dekat Taman Monumen Alun-Alun',
        pos: new THREE.Vector3(-40, 0, -90),
      },
      {
        id: 'cat_mimi',
        name: 'Mimi Si Manis',
        color: '#F5B041',
        earColor: '#E67E22',
        hint: 'Sering mengawasi dari teras dekat Balai Kota',
        pos: new THREE.Vector3(-46, 0.4, -54),
      },
      {
        id: 'cat_kuro',
        name: 'Kuro Si Penjaga',
        color: '#2C3E50',
        earColor: '#1A252F',
        hint: 'Bersembunyi santai di dekat Perumahan Rusunawa',
        pos: new THREE.Vector3(56, 0, 46),
      },
      {
        id: 'cat_mochi',
        name: 'Mochi Si Belanja',
        color: '#FDFEFE',
        earColor: '#FADBD8',
        hint: 'Nongkrong di pelataran Netizen Grand Mall',
        pos: new THREE.Vector3(-30, 0, 22),
      },
      {
        id: 'cat_cimot',
        name: 'Cimot Si Petualang',
        color: '#7F8C8D',
        earColor: '#5D6D7E',
        hint: 'Menunggu kereta tiba di dekat Stasiun Netizen Express',
        pos: new THREE.Vector3(6, 0, 106),
      },
    ];

    CAT_SPECS.forEach((spec) => {
      const model = this.createCatModel(spec.color, spec.earColor);
      model.root.position.copy(spec.pos);
      model.root.rotation.y = Math.random() * Math.PI * 2;
      this.cityWorldGroup.add(model.root);

      const catEntry = {
        id: spec.id,
        name: spec.name,
        locationHint: spec.hint,
        root: model.root,
        tail: model.tail,
        head: model.head,
        baseY: spec.pos.y,
        bounceTimer: 0,
      };
      this.cats.push(catEntry);

      // Hitbox for easy clicking/tapping
      const hitGeo = new THREE.CylinderGeometry(2.2, 2.2, 3.5, 8);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitBox = new THREE.Mesh(hitGeo, hitMat);
      hitBox.position.copy(spec.pos).add(new THREE.Vector3(0, 1.7, 0));
      this.cityWorldGroup.add(hitBox);

      this.interactiveCatMeshes.push({ mesh: hitBox, catId: spec.id });
    });
  }

  private createCatModel(furColor: string, earColor: string): { root: THREE.Group; tail: THREE.Mesh; head: THREE.Group } {
    const root = new THREE.Group();

    const furMat = new THREE.MeshStandardMaterial({ color: furColor, roughness: 0.75 });
    const earMat = new THREE.MeshStandardMaterial({ color: earColor, roughness: 0.7 });
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x111111 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });

    // Body
    const body = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.6, 1.25), furMat);
    body.position.y = 0.55;
    root.add(body);

    // Belly patch
    const belly = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.35, 0.85), whiteMat);
    belly.position.set(0, 0.42, 0);
    root.add(belly);

    // Head
    const head = new THREE.Group();
    head.position.set(0, 0.9, 0.7);
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.68, 0.58, 0.62), furMat);
    head.add(headMesh);

    // Muzzle & Nose
    const muzzle = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.22, 0.18), whiteMat);
    muzzle.position.set(0, -0.1, 0.34);
    head.add(muzzle);

    const nose = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.08), earMat);
    nose.position.set(0, -0.04, 0.44);
    head.add(nose);

    // Eyes
    const eyeGeo = new THREE.BoxGeometry(0.09, 0.09, 0.05);
    const eyeL = new THREE.Mesh(eyeGeo, eyeMat);
    eyeL.position.set(-0.18, 0.08, 0.32);
    const eyeR = new THREE.Mesh(eyeGeo, eyeMat);
    eyeR.position.set(0.18, 0.08, 0.32);
    head.add(eyeL);
    head.add(eyeR);

    // Triangular Ears
    const earGeo = new THREE.ConeGeometry(0.16, 0.3, 4);
    const earL = new THREE.Mesh(earGeo, earMat);
    earL.position.set(-0.22, 0.38, 0.05);
    earL.rotation.z = 0.25;
    const earR = new THREE.Mesh(earGeo, earMat);
    earR.position.set(0.22, 0.38, 0.05);
    earR.rotation.z = -0.25;
    head.add(earL);
    head.add(earR);

    root.add(head);

    // 4 Paws
    const legGeo = new THREE.BoxGeometry(0.2, 0.38, 0.2);
    const legPositions = [
      [-0.28, 0.2, 0.4],
      [0.28, 0.2, 0.4],
      [-0.28, 0.2, -0.4],
      [0.28, 0.2, -0.4],
    ];
    legPositions.forEach(([lx, ly, lz]) => {
      const leg = new THREE.Mesh(legGeo, whiteMat);
      leg.position.set(lx, ly, lz);
      root.add(leg);
    });

    // Tail (pivots from back)
    const tailPivot = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.65, 6), furMat);
    tailPivot.position.set(0, 0.5, -0.75);
    tailPivot.rotation.x = -Math.PI / 3;
    root.add(tailPivot);

    return { root, tail: tailPivot, head };
  }

  private updateCats(delta: number, elapsed: number) {
    if (!this.cats || this.cats.length === 0) return;

    this.cats.forEach((cat, idx) => {
      // Gentle breathing & tail wag
      const wagSpeed = 3.5 + (idx % 3) * 0.5;
      cat.tail.rotation.z = Math.sin(elapsed * wagSpeed + idx) * 0.45;
      cat.head.rotation.y = Math.sin(elapsed * 1.5 + idx * 0.8) * 0.2;

      // Click bounce animation
      if (cat.bounceTimer > 0) {
        cat.bounceTimer -= delta * 2.5;
        const bounce = Math.sin(Math.max(0, cat.bounceTimer) * Math.PI) * 0.6;
        cat.root.position.y = cat.baseY + bounce;
      } else {
        cat.root.position.y = cat.baseY + Math.sin(elapsed * 2.0 + idx) * 0.03;
      }
    });
  }

  // ============================================================
  // PHOTO STUDIO CAMERA POV
  // ============================================================
  public handlePhotoStudioPOV(
    preset?: 'selfie' | 'normal' | 'drone' | 'wide',
    yaw?: number,
    pitch?: number,
    distance?: number
  ) {
    if (preset === 'selfie') {
      if (this.viewMode !== 'city') {
        this.target.copy(this.playerPos).add(new THREE.Vector3(0, 1.2, 0));
        this.spherical.radius = 4.0;
        this.spherical.phi = Math.PI / 2.25;
        this.spherical.theta = this.playerFacing + Math.PI;
      } else {
        this.target.set(-44, 2, -94);
        this.spherical.radius = 7.5;
        this.spherical.phi = Math.PI / 2.25;
        this.spherical.theta = 0;
      }
    } else if (preset === 'normal') {
      if (this.viewMode !== 'city') {
        this.target.copy(this.playerPos).add(new THREE.Vector3(0, 0.8, 0));
        this.spherical.radius = 12.0;
        this.spherical.phi = Math.PI / 3.2;
        this.spherical.theta = Math.PI * 0.75;
      } else {
        this.target.set(-44, 4, -94);
        this.spherical.radius = 32.0;
        this.spherical.phi = Math.PI / 3.2;
        this.spherical.theta = Math.PI * 0.75;
      }
    } else if (preset === 'drone') {
      if (this.viewMode !== 'city') {
        this.target.copy(this.playerPos);
        this.spherical.radius = 26.0;
        this.spherical.phi = Math.PI / 6.5;
      } else {
        this.target.set(-44, 0, -94);
        this.spherical.radius = 60.0;
        this.spherical.phi = Math.PI / 6.5;
      }
    } else if (preset === 'wide') {
      if (this.viewMode !== 'city') {
        this.target.copy(this.playerPos).add(new THREE.Vector3(0, 0.6, 0));
        this.spherical.radius = 8.0;
        this.spherical.phi = Math.PI / 2.05;
      } else {
        this.target.set(-44, 1, -94);
        this.spherical.radius = 20.0;
        this.spherical.phi = Math.PI / 2.05;
      }
    }

    if (yaw !== undefined) {
      this.spherical.theta = (yaw * Math.PI) / 180;
    }
    if (pitch !== undefined) {
      this.spherical.phi = (pitch * Math.PI) / 180;
    }
    if (distance !== undefined) {
      this.spherical.radius = distance;
    }

    this.updateCameraTransform();
  }

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.reqId);
    if (typeof window !== 'undefined' && (window as any).__city3DManager === this) {
      (window as any).__city3DManager = null;
    }

    this.unsubscribeCitizen?.();
    this.unsubscribeGameStore?.();
    this.cityLandmarkNPCs = [];

    const el = this.container;
    el.removeEventListener('contextmenu', this.onContextMenu);
    el.removeEventListener('pointerdown', this.onPointerDown);
    window.removeEventListener('pointermove', this.onPointerMove);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    el.removeEventListener('wheel', this.onWheel);
    el.removeEventListener('click', this.onClick);
    if (this.handleEnterTuguEvent) window.removeEventListener('enter-tugu-area', this.handleEnterTuguEvent);
    if (this.handleExitTuguEvent) window.removeEventListener('exit-tugu-area', this.handleExitTuguEvent);
    if (this.handleEnterRiverEvent) window.removeEventListener('enter-river-area', this.handleEnterRiverEvent);
    if (this.handleExitRiverEvent) window.removeEventListener('exit-river-area', this.handleExitRiverEvent);
    if (this.handleEnterBeachEvent) window.removeEventListener('enter-beach-area', this.handleEnterBeachEvent);
    if (this.handleExitBeachEvent) window.removeEventListener('exit-beach-area', this.handleExitBeachEvent);
    if (this.handleTimeOfDayEvent) window.removeEventListener('time-of-day-changed', this.handleTimeOfDayEvent);
    if (this.handleToggleDayNightEvent) window.removeEventListener('toggle-day-night', this.handleToggleDayNightEvent);
    if (this.handleAdjustCameraPOV) window.removeEventListener('adjust-camera-pov', this.handleAdjustCameraPOV);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('blur', this.onWindowBlur);
    window.removeEventListener('resize', this.onResize);
    this.activePointers.clear();
    this.renderer?.domElement?.removeEventListener('webglcontextlost', this.onContextLost);
    this.renderer?.domElement?.removeEventListener('webglcontextrestored', this.onContextRestored);

    if (this.renderer?.domElement?.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
    this.renderer.dispose();
  }
}
