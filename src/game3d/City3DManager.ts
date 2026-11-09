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
import { makeLibrary, makeAirport, makePort, makeSports, makePrasasti, makePlane, LIB, AIR, SPORT } from './day7.js';
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

function makeNameTagSprite(name: string, isGuest = false, isSelf = false): THREE.Sprite {
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
  ctx.fillText(name.slice(0, 15), x + 52, y + h / 2);

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
  public viewMode: 'city' | 'tugu' | 'river' | 'stadium' = 'city';
  public cityWorldGroup = new THREE.Group();
  public tuguWorldGroup = new THREE.Group();
  public riverWorldGroup = new THREE.Group();
  public stadiumWorldGroup = new THREE.Group();

  // 3D Stadium & Freekick State
  public soccerBall: THREE.Mesh | null = null;
  public ballVelocity = new THREE.Vector3();
  public ballPos = new THREE.Vector3(0, 0.22, -18);
  public isBallKicked = false;
  public goalkeeper: THREE.Group | null = null;
  public goalkeeperState: 'idle' | 'dive_left' | 'dive_right' | 'jump' = 'idle';
  public goalkeeperAnimTimer = 0;
  public stadiumLamps: Array<{
    root: THREE.Group;
    light: THREE.SpotLight | THREE.PointLight;
  }> = [];

  // 3D River Map & Fishing System State
  public fishingState: FishingState = 'idle';
  public reelProgress = 0;
  public activeCaughtFish: RiverFishCatch | null = null;
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
      lastServerTime?: number;
      moveSpeed?: number;
      missingSince?: number;
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
      position: new THREE.Vector3(0, 0, -82),
      cameraTarget: new THREE.Vector3(0, 6, -82),
      cameraPos: new THREE.Vector3(0, 16, -50),
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

    // 1. Surrounding Ground (Warm concrete stadium apron)
    const apronGeom = new THREE.PlaneGeometry(160, 160, 1, 1).rotateX(-Math.PI / 2);
    const apronMat = new THREE.MeshStandardMaterial({ color: '#556059', roughness: 0.95 });
    const apron = new THREE.Mesh(apronGeom, apronMat);
    apron.position.set(0, -0.05, 0);
    this.stadiumWorldGroup.add(apron);

    // 2. Tartan Athletic Running Track (Red-orange running track encircling the pitch)
    const trackGeom = new THREE.BoxGeometry(86, 0.08, 62);
    const trackMat = new THREE.MeshStandardMaterial({ color: '#C84B31', roughness: 0.9 });
    const track = new THREE.Mesh(trackGeom, trackMat);
    track.position.set(0, 0.02, 0);
    this.stadiumWorldGroup.add(track);

    // 3. Green Pitch (Lapangan Sepakbola 68m x 44m)
    // Striped turf pattern (14 stripes alternating dark & light lush green)
    const pitchGroup = new THREE.Group();
    const turfMat1 = new THREE.MeshStandardMaterial({ color: '#276E2F', roughness: 0.85 });
    const turfMat2 = new THREE.MeshStandardMaterial({ color: '#33883C', roughness: 0.85 });
    const stripeCount = 14;
    const stripeLength = 68 / stripeCount; // ~4.85m each
    for (let i = 0; i < stripeCount; i++) {
      const zPos = -34 + (i + 0.5) * stripeLength;
      const stripe = new THREE.Mesh(
        new THREE.BoxGeometry(44, 0.1, stripeLength),
        i % 2 === 0 ? turfMat1 : turfMat2
      );
      stripe.position.set(0, 0.05, zPos);
      pitchGroup.add(stripe);
    }
    this.stadiumWorldGroup.add(pitchGroup);

    // 4. White Pitch Markings (Raised slightly at Y = 0.11 to prevent Z-fighting)
    const lineMat = new THREE.MeshBasicMaterial({ color: '#FFFFFF' });
    const createLine = (w: number, d: number, x: number, z: number) => {
      const line = new THREE.Mesh(new THREE.BoxGeometry(w, 0.02, d), lineMat);
      line.position.set(x, 0.11, z);
      this.stadiumWorldGroup.add(line);
      return line;
    };

    // Touchlines & Goal lines
    createLine(0.18, 68, -22, 0); // West sideline
    createLine(0.18, 68, 22, 0);  // East sideline
    createLine(44, 0.18, 0, -34); // North goal line
    createLine(44, 0.18, 0, 34);  // South goal line
    createLine(44, 0.18, 0, 0);   // Halfway line

    // Center circle & center spot
    const circleGeom = new THREE.RingGeometry(5.85, 6.05, 32).rotateX(-Math.PI / 2);
    const centerCircle = new THREE.Mesh(circleGeom, lineMat);
    centerCircle.position.set(0, 0.11, 0);
    this.stadiumWorldGroup.add(centerCircle);

    const centerSpot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.02, 12), lineMat);
    centerSpot.position.set(0, 0.11, 0);
    this.stadiumWorldGroup.add(centerSpot);

    // North Penalty Box (Z = -34 to -18, X = [-14, 14])
    createLine(28, 0.18, 0, -18);   // Front penalty box line
    createLine(0.18, 16, -14, -26); // Left penalty box line
    createLine(0.18, 16, 14, -26);  // Right penalty box line

    // North 6-yard Goal Box (Z = -34 to -28.5, X = [-7, 7])
    createLine(14, 0.18, 0, -28.5);  // Front 6-yard line
    createLine(0.18, 5.5, -7, -31.25);
    createLine(0.18, 5.5, 7, -31.25);

    // Penalty Spot (11m from goal line: Z = -23, X = 0)
    const penSpot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 0.02, 12), lineMat);
    penSpot.position.set(0, 0.11, -23);
    this.stadiumWorldGroup.add(penSpot);

    // Penalty D Arc at top of box (Z = -18, radius 6)
    const arcGeom = new THREE.RingGeometry(5.85, 6.05, 24, 1, 0, Math.PI).rotateX(-Math.PI / 2);
    const arc = new THREE.Mesh(arcGeom, lineMat);
    arc.position.set(0, 0.11, -23);
    this.stadiumWorldGroup.add(arc);

    // Corner Flags (4 corners)
    const flagMat = new THREE.MeshStandardMaterial({ color: '#FFD700', roughness: 0.4 });
    const poleMat = new THREE.MeshStandardMaterial({ color: '#E0E0E0', roughness: 0.3 });
    [
      { x: -22, z: -34 },
      { x: 22, z: -34 },
      { x: -22, z: 34 },
      { x: 22, z: 34 },
    ].forEach((pos) => {
      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.4, 6), poleMat);
      pole.position.set(pos.x, 0.75, pos.z);
      const flag = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.25, 0.02), flagMat);
      flag.position.set(pos.x + 0.18, 1.3, pos.z);
      this.stadiumWorldGroup.add(pole, flag);
    });

    // 5. 3D Goal Post (Gawang Sepakbola 7.32m x 2.44m)
    const goalGroup = new THREE.Group();
    const postMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.25 });
    // Left post, right post, crossbar
    const leftPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.5, 10), postMat);
    leftPost.position.set(-3.66, 1.25, -34);
    const rightPost = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.5, 10), postMat);
    rightPost.position.set(3.66, 1.25, -34);
    const crossbar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 7.5, 10).rotateZ(Math.PI / 2), postMat);
    crossbar.position.set(0, 2.48, -34);
    goalGroup.add(leftPost, rightPost, crossbar);

    // Goal net support frame & net
    const netMat = new THREE.MeshBasicMaterial({
      color: '#FFFFFF',
      wireframe: true,
      transparent: true,
      opacity: 0.45,
    });
    const netBox = new THREE.Mesh(new THREE.BoxGeometry(7.32, 2.44, 2.2), netMat);
    netBox.position.set(0, 1.22, -35.1);
    goalGroup.add(netBox);
    this.stadiumWorldGroup.add(goalGroup);

    // 6. 3D Soccer Ball (Bola Sepak)
    const ballMat = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: 0.35 });
    this.soccerBall = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), ballMat);
    this.soccerBall.position.set(0, 0.22, -18); // Default freekick spot (18m out from goal)
    this.soccerBall.castShadow = true;
    this.stadiumWorldGroup.add(this.soccerBall);

    // Ball drop shadow blob
    const shadowMat = new THREE.MeshBasicMaterial({ color: '#000000', transparent: true, opacity: 0.35 });
    const ballShadow = new THREE.Mesh(new THREE.CircleGeometry(0.24, 16).rotateX(-Math.PI / 2), shadowMat);
    ballShadow.position.set(0, 0.11, -18);
    this.stadiumWorldGroup.add(ballShadow);

    // 7. 3D Goalkeeper NPC (Kiper Siap Tangkap)
    const keeper = new THREE.Group();
    const jerseyMat = new THREE.MeshStandardMaterial({ color: '#00E5FF', roughness: 0.6 });
    const skinMat = new THREE.MeshStandardMaterial({ color: '#F5C6A5', roughness: 0.7 });
    const shortsMat = new THREE.MeshStandardMaterial({ color: '#1A237E', roughness: 0.7 });
    const gloveMat = new THREE.MeshStandardMaterial({ color: '#FF3D00', roughness: 0.4 });

    // Body & Head
    const keeperBody = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.7, 0.3), jerseyMat);
    keeperBody.position.y = 1.05;
    const keeperHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10), skinMat);
    keeperHead.position.y = 1.6;
    // Shorts & Legs
    const keeperShorts = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.35, 0.32), shortsMat);
    keeperShorts.position.y = 0.58;
    // Left & Right Arms (extended in athletic diving ready stance)
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.55, 0.16), jerseyMat);
    armL.position.set(-0.38, 1.0, 0);
    armL.rotation.z = 0.45;
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.55, 0.16), jerseyMat);
    armR.position.set(0.38, 1.0, 0);
    armR.rotation.z = -0.45;
    // Gloves
    const gloveL = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), gloveMat);
    gloveL.position.set(-0.54, 0.75, 0);
    const gloveR = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.18, 0.18), gloveMat);
    gloveR.position.set(0.54, 0.75, 0);

    keeper.add(keeperBody, keeperHead, keeperShorts, armL, armR, gloveL, gloveR);
    keeper.position.set(0, 0.1, -33.6);
    this.goalkeeper = keeper;
    this.stadiumWorldGroup.add(keeper);

    // 8. Freekick Defender Wall Dummies (3 mannequin defenders at Z = -26.5)
    const wallGroup = new THREE.Group();
    const wallJerseyMat = new THREE.MeshStandardMaterial({ color: '#E53935', roughness: 0.7 });
    [-0.7, 0, 0.7].forEach((wx) => {
      const dummy = new THREE.Group();
      const body = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.75, 0.28), wallJerseyMat);
      body.position.y = 1.0;
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 8), skinMat);
      head.position.y = 1.55;
      const legs = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.65, 0.26), shortsMat);
      legs.position.y = 0.35;
      dummy.add(body, head, legs);
      dummy.position.set(wx, 0.1, -26.5);
      wallGroup.add(dummy);
    });
    this.stadiumWorldGroup.add(wallGroup);

    // 9. Grandstands / Stadium Tribunes Surrounding Pitch
    const concreteMat = new THREE.MeshStandardMaterial({ color: '#A0A7A3', roughness: 0.9 });
    const seatMatRed = new THREE.MeshStandardMaterial({ color: '#D32F2F', roughness: 0.7 });
    const seatMatBlue = new THREE.MeshStandardMaterial({ color: '#1976D2', roughness: 0.7 });
    const seatMatYellow = new THREE.MeshStandardMaterial({ color: '#FBC02D', roughness: 0.7 });

    // North Tribune (Behind goal, Z = -45)
    const northStand = new THREE.Group();
    for (let tier = 0; tier < 8; tier++) {
      const tierStep = new THREE.Mesh(
        new THREE.BoxGeometry(76, 0.8, 1.6),
        concreteMat
      );
      tierStep.position.set(0, 0.4 + tier * 0.8, -39 - tier * 1.5);
      northStand.add(tierStep);

      // Colorful seats on step
      const seatRow = new THREE.Mesh(
        new THREE.BoxGeometry(72, 0.25, 0.6),
        tier % 3 === 0 ? seatMatRed : tier % 3 === 1 ? seatMatBlue : seatMatYellow
      );
      seatRow.position.set(0, 0.9 + tier * 0.8, -39 - tier * 1.5);
      northStand.add(seatRow);
    }
    this.stadiumWorldGroup.add(northStand);

    // South Tribune (Behind penalty kicker, Z = 45)
    const southStand = new THREE.Group();
    for (let tier = 0; tier < 8; tier++) {
      const tierStep = new THREE.Mesh(
        new THREE.BoxGeometry(76, 0.8, 1.6),
        concreteMat
      );
      tierStep.position.set(0, 0.4 + tier * 0.8, 39 + tier * 1.5);
      southStand.add(tierStep);

      const seatRow = new THREE.Mesh(
        new THREE.BoxGeometry(72, 0.25, 0.6),
        tier % 2 === 0 ? seatMatBlue : seatMatRed
      );
      seatRow.position.set(0, 0.9 + tier * 0.8, 39 + tier * 1.5);
      southStand.add(seatRow);
    }
    this.stadiumWorldGroup.add(southStand);

    // East & West Tribunes (Sidelines, X = ±30)
    [-30, 30].forEach((sx) => {
      const sideStand = new THREE.Group();
      const dir = sx > 0 ? 1 : -1;
      for (let tier = 0; tier < 7; tier++) {
        const tierStep = new THREE.Mesh(
          new THREE.BoxGeometry(1.6, 0.8, 70),
          concreteMat
        );
        tierStep.position.set(sx + dir * tier * 1.5, 0.4 + tier * 0.8, 0);
        sideStand.add(tierStep);
      }
      this.stadiumWorldGroup.add(sideStand);
    });

    // 10. Cantilevered Stadium Canopy Roofs (Above North & South Stands)
    const roofMat = new THREE.MeshStandardMaterial({ color: '#E8ECF0', metalness: 0.3, roughness: 0.4 });
    const northRoof = new THREE.Mesh(new THREE.BoxGeometry(82, 0.45, 18), roofMat);
    northRoof.position.set(0, 11.5, -45);
    northRoof.rotation.x = 0.12;
    const southRoof = new THREE.Mesh(new THREE.BoxGeometry(82, 0.45, 18), roofMat);
    southRoof.position.set(0, 11.5, 45);
    southRoof.rotation.x = -0.12;
    this.stadiumWorldGroup.add(northRoof, southRoof);

    // 11. Giant Stadium Scoreboard (Papan Skor Raksasa)
    const boardGroup = new THREE.Group();
    const boardBack = new THREE.Mesh(
      new THREE.BoxGeometry(16, 5.5, 0.5),
      new THREE.MeshStandardMaterial({ color: '#1B2022', roughness: 0.8 })
    );
    boardBack.position.set(0, 15, -49);
    boardGroup.add(boardBack);

    const screenMat = new THREE.MeshStandardMaterial({
      color: '#0D1117',
      emissive: '#161B22',
      emissiveIntensity: 0.5,
    });
    const screen = new THREE.Mesh(new THREE.BoxGeometry(15.2, 4.8, 0.2), screenMat);
    screen.position.set(0, 15, -48.7);
    boardGroup.add(screen);
    this.stadiumWorldGroup.add(boardGroup);

    // 12. Four Corner Floodlight Towers (Menara Lampu Sorot Stadion)
    const towerMat = new THREE.MeshStandardMaterial({ color: '#4B5563', metalness: 0.6, roughness: 0.4 });
    const lampMat = new THREE.MeshStandardMaterial({
      color: '#FFFFFF',
      emissive: '#FFF9E6',
      emissiveIntensity: 1.0,
      roughness: 0.2,
    });

    [
      { x: -32, z: -38 },
      { x: 32, z: -38 },
      { x: -32, z: 38 },
      { x: 32, z: 38 },
    ].forEach((pos) => {
      const tower = new THREE.Group();
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.7, 24, 8), towerMat);
      post.position.set(pos.x, 12, pos.z);
      tower.add(post);

      const head = new THREE.Mesh(new THREE.BoxGeometry(3.2, 1.8, 0.8), towerMat);
      head.position.set(pos.x, 24, pos.z);
      head.lookAt(0, 2, 0);
      tower.add(head);

      const bulb = new THREE.Mesh(new THREE.BoxGeometry(2.8, 1.4, 0.2), lampMat);
      bulb.position.set(pos.x, 24, pos.z);
      bulb.lookAt(0, 2, 0);
      tower.add(bulb);

      const light = new THREE.SpotLight('#FFF8E7', 1.4, 90, Math.PI / 4, 0.5, 1.2);
      light.position.set(pos.x, 24, pos.z);
      light.target.position.set(0, 0, pos.z > 0 ? 10 : -15);
      this.stadiumWorldGroup.add(light.target);
      tower.add(light);

      this.stadiumLamps.push({ root: tower, light });
      this.stadiumWorldGroup.add(tower);
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
      lastChat?: { text: string; time: number };
    }>,
    myClientId: string
  ) {
    if (this.viewMode !== 'tugu' && this.viewMode !== 'river') return;

    const activeIds = new Set<string>();
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const nowMs = Date.now();
    const isRiver = this.viewMode === 'river';
    const activeGroup = isRiver ? this.riverWorldGroup : this.tuguWorldGroup;

    for (const p of players) {
      if (p.id === myClientId) continue; // Don't duplicate local player
      activeIds.add(p.id);

      const existing = this.remotePlayers.get(p.id);
      if (existing) {
        existing.missingSince = 0; // Reset missing timer
        const targetY = isRiver && p.z < 2.5 ? 0.35 : 0;
        const targetV = new THREE.Vector3(p.x, targetY, p.z);
        const dist = existing.root.position.distanceTo(targetV);
        existing.lastServerTime = now;

        // If distance is large (e.g. initial spawn or teleport > 6.0 units), snap immediately
        if (dist > 6.0) {
          existing.root.position.copy(targetV);
          existing.targetPos.copy(targetV);
          existing.root.rotation.y = p.facing;
          existing.targetFacing = p.facing;
        } else {
          existing.targetPos.copy(targetV);
          existing.targetFacing = p.facing;
        }

        // Check if there is new chat to display (allowing for mobile clock skew up to 25s)
        if (p.lastChat && p.lastChat.text) {
          const chatTime = p.lastChat.time || 0;
          if (chatTime > (existing.lastChatTime || 0)) {
            existing.lastChatTime = chatTime;
            const ageMs = Math.abs(nowMs - chatTime);
            if (ageMs < 25000) {
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
        }
      } else {
        // Spawn new remote citizen
        const colors = resolveAvatarColors(p.avatarConfig);
        const citizen = makeCitizen3D(colors);
        const targetY = isRiver && p.z < 2.5 ? 0.35 : 0;
        citizen.root.position.set(p.x, targetY, p.z);
        citizen.root.rotation.y = p.facing;

        // Add nametag
        const nameTag = makeNameTagSprite(p.name, p.isGuest, false);
        nameTag.position.set(0, 1.55, 0);
        citizen.root.add(nameTag);

        // In River mode, attach low-poly angler rod to right hand!
        if (isRiver) {
          const anglerRod = this.createAnglerRod();
          anglerRod.position.set(0, -0.32, 0.05);
          anglerRod.rotation.set(1.2, 0, 0);
          citizen.rightArm.add(anglerRod);
          citizen.rightArm.rotation.set(-0.6, 0.1, 0);
          citizen.leftArm.rotation.set(-0.45, 0.3, 0);
        }

        // Check if newly spawned player has an active recent speech bubble!
        let initialBubble: THREE.Sprite | null = null;
        let initialBubbleTimer = 0;
        const chatTime = p.lastChat?.time || 0;
        if (p.lastChat && p.lastChat.text && Math.abs(nowMs - chatTime) < 20000) {
          initialBubble = makeSpeechBubbleSprite(p.lastChat.text, '#FFFDF9', '#343B35');
          initialBubble.position.set(0, 2.15, 0);
          citizen.root.add(initialBubble);
          initialBubbleTimer = Math.max(1.5, 6.0 - Math.max(0, (nowMs - chatTime) / 1000));
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
          lastServerTime: now,
          missingSince: 0,
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
          this.tuguWorldGroup.remove(remote.root);
          this.riverWorldGroup.remove(remote.root);
          this.remotePlayers.delete(id);
        }
      }
    }
  }

  public clearRemotePlayers() {
    for (const [, remote] of this.remotePlayers.entries()) {
      this.tuguWorldGroup.remove(remote.root);
      this.riverWorldGroup.remove(remote.root);
    }
    this.remotePlayers.clear();
  }

  private createAnglerRod(): THREE.Group {
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

    return rodGroup;
  }

  private updateRemotePlayersAnimation(delta: number, elapsed: number) {
    for (const [, remote] of this.remotePlayers.entries()) {
      const cur = remote.root.position;
      const target = remote.targetPos;
      const dist = cur.distanceTo(target);

      if (dist > 0.05) {
        // Continuous smooth exponential damping towards target (eliminates jerky dash & stop)
        const lerpFactor = Math.min(1.0, delta * 9.5);
        cur.x += (target.x - cur.x) * lerpFactor;
        cur.y += (target.y - cur.y) * lerpFactor;
        cur.z += (target.z - cur.z) * lerpFactor;

        // Turn body smoothly towards the direction of travel
        const dirX = target.x - cur.x;
        const dirZ = target.z - cur.z;
        if (Math.hypot(dirX, dirZ) > 0.02) {
          const moveAngle = Math.atan2(dirX, dirZ);
          let diff = (moveAngle - remote.root.rotation.y) % (Math.PI * 2);
          if (diff > Math.PI) diff -= Math.PI * 2;
          if (diff < -Math.PI) diff += Math.PI * 2;
          remote.root.rotation.y += diff * Math.min(1.0, delta * 10.0);
        }

        // Animate citizen walking pose smoothly
        remote.citizen.pose(true, elapsed, 4.5);
      } else {
        // Reached destination: stand still and face the player's last reported orientation smoothly
        let diff = (remote.targetFacing - remote.root.rotation.y) % (Math.PI * 2);
        if (diff > Math.PI) diff -= Math.PI * 2;
        if (diff < -Math.PI) diff += Math.PI * 2;
        remote.root.rotation.y += diff * Math.min(1.0, delta * 8.0);

        remote.citizen.pose(false, elapsed);
      }

      if (remote.bubble) {
        remote.bubbleTimer = (remote.bubbleTimer || 0) - delta;
        if (remote.bubbleTimer <= 0) {
          remote.root.remove(remote.bubble);
          remote.bubble = null;
        }
      }
    }
  }

  public getPlayerTuguState(): { x: number; z: number; facing: number } {
    const root = this.isPlayerAdmin ? this.mayorPlayer?.root : this.playerCitizen?.root;
    if (!root) {
      return { x: this.playerPos.x, z: this.playerPos.z, facing: this.playerFacing };
    }
    return {
      x: root.position.x,
      z: root.position.z,
      facing: root.rotation.y,
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
    this.riverWorldGroup.visible = true;

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

  public enterStadiumArea() {
    this.viewMode = 'stadium';
    this.cityWorldGroup.visible = false;
    this.tuguWorldGroup.visible = false;
    this.riverWorldGroup.visible = false;
    this.stadiumWorldGroup.visible = true;

    // Spawn player avatar at the freekick penalty spot (Z = -16.5) facing North toward goal (Z = -34)
    this.playerPos.set(0, 0.1, -16.5);
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
    this.target.copy(this.playerPos).add(new THREE.Vector3(0, 1.4, 0));
    this.spherical.radius = 16;
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

    // Set initial ball trajectory
    let targetX = 0;
    let targetY = 1.8;
    if (dir === 'left') {
      targetX = -2.8;
      targetY = 0.5;
    } else if (dir === 'right') {
      targetX = 2.8;
      targetY = 0.5;
    } else if (dir === 'top_left') {
      targetX = -2.6;
      targetY = 2.1;
    } else if (dir === 'top_right') {
      targetX = 2.6;
      targetY = 2.1;
    } else {
      targetX = 0;
      targetY = 1.4;
    }

    const speed = (power / 100) * 32 + 10;
    this.ballVelocity.set(targetX * 0.8, targetY * 1.2, -speed);

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

    // Goalkeeper AI dive decision
    const keeperChoices: Array<'idle' | 'dive_left' | 'dive_right' | 'jump'> = [
      'dive_left',
      'dive_right',
      'jump',
      'idle',
    ];
    this.goalkeeperState = keeperChoices[Math.floor(Math.random() * keeperChoices.length)];
    this.goalkeeperAnimTimer = 0;

    // Check goal outcome after ball flight
    setTimeout(() => {
      const isSaved =
        (dir.includes('left') && this.goalkeeperState === 'dive_left') ||
        (dir.includes('right') && this.goalkeeperState === 'dive_right');
      const isGoal = !isSaved;

      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('stadium-freekick-result', {
            detail: { isGoal, dir, power },
          })
        );
      }

      // Reset ball position after 2 seconds
      setTimeout(() => {
        this.resetSoccerBall();
      }, 1800);
    }, 850);
  }

  public resetSoccerBall() {
    this.isBallKicked = false;
    this.ballVelocity.set(0, 0, 0);
    if (this.soccerBall) {
      this.soccerBall.position.set(0, 0.22, -18);
      this.soccerBall.rotation.set(0, 0, 0);
    }
    if (this.goalkeeper) {
      this.goalkeeper.position.set(0, 0.1, -33.6);
      this.goalkeeper.rotation.set(0, 0, 0);
    }
    this.goalkeeperState = 'idle';
    this.goalkeeperAnimTimer = 0;
  }

  private updateStadium(delta: number, elapsed: number) {
    // 1. Ball physics update
    if (this.soccerBall && this.isBallKicked) {
      this.soccerBall.position.addScaledVector(this.ballVelocity, delta);
      // Gravity
      this.ballVelocity.y -= 9.8 * delta;

      // Ground bounce
      if (this.soccerBall.position.y < 0.22) {
        this.soccerBall.position.y = 0.22;
        this.ballVelocity.y = -this.ballVelocity.y * 0.55;
        this.ballVelocity.x *= 0.85;
        this.ballVelocity.z *= 0.85;
      }

      // Net / goal back collision
      if (this.soccerBall.position.z < -35.2) {
        this.soccerBall.position.z = -35.2;
        this.ballVelocity.set(0, 0, 0);
      }

      // Ball rotation while rolling / flying
      this.soccerBall.rotation.x += this.ballVelocity.z * delta * 2;
      this.soccerBall.rotation.z -= this.ballVelocity.x * delta * 2;
    }

    // 2. Goalkeeper dive animation
    if (this.goalkeeper && this.goalkeeperState !== 'idle') {
      this.goalkeeperAnimTimer += delta;
      const t = Math.min(this.goalkeeperAnimTimer / 0.45, 1.0);

      if (this.goalkeeperState === 'dive_left') {
        this.goalkeeper.position.x = THREE.MathUtils.lerp(0, -2.2, t);
        this.goalkeeper.position.y = THREE.MathUtils.lerp(0.1, 0.6, Math.sin(t * Math.PI));
        this.goalkeeper.rotation.z = THREE.MathUtils.lerp(0, -0.65, t);
      } else if (this.goalkeeperState === 'dive_right') {
        this.goalkeeper.position.x = THREE.MathUtils.lerp(0, 2.2, t);
        this.goalkeeper.position.y = THREE.MathUtils.lerp(0.1, 0.6, Math.sin(t * Math.PI));
        this.goalkeeper.rotation.z = THREE.MathUtils.lerp(0, 0.65, t);
      } else if (this.goalkeeperState === 'jump') {
        this.goalkeeper.position.y = THREE.MathUtils.lerp(0.1, 1.2, Math.sin(t * Math.PI));
      }
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
    this.riverWorldGroup.add(ripple);
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

    // 1. Determine landing spot on river water surface (GUARANTEED OPEN WATER - NEVER ON PIER WOOD OR SHORE)
    // Pier bounds: X [-2.85, 2.85], Z [-9.8, 2.5]
    let targetX = 0;
    let targetZ = -13.0;

    if (targetWaterPos) {
      const isSideWater = Math.abs(targetWaterPos.x) >= 3.0 && targetWaterPos.z <= 0.0 && targetWaterPos.z >= -25.0;
      const isFrontWater = targetWaterPos.z <= -10.2 && Math.abs(targetWaterPos.x) <= 25.0;

      if (isSideWater) {
        targetX = THREE.MathUtils.clamp(targetWaterPos.x, -22.0, 22.0);
        targetZ = THREE.MathUtils.clamp(targetWaterPos.z, -22.0, -0.8);
      } else if (isFrontWater) {
        targetX = THREE.MathUtils.clamp(targetWaterPos.x, -22.0, 22.0);
        targetZ = THREE.MathUtils.clamp(targetWaterPos.z, -25.0, -10.5);
      } else {
        // Tap fell on pier wood or grass shore! Safely project out into open river water in front of pier center
        targetX = THREE.MathUtils.clamp((Math.random() - 0.5) * 2.0, -1.8, 1.8);
        targetZ = -13.2 - Math.random() * 2.8;
      }
    } else {
      // Cast forward into the center of the river channel in front of pier
      targetX = THREE.MathUtils.clamp((Math.random() - 0.5) * 2.0, -1.8, 1.8);
      targetZ = -13.5 - Math.random() * 2.8;
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

    // Get current rod tip world position converted to riverWorldGroup space!
    if (this.rodTip) {
      this.rodTip.updateWorldMatrix(true, false);
      const tipWorld = new THREE.Vector3();
      this.rodTip.getWorldPosition(tipWorld);
      this.castStartTipPos.copy(tipWorld);
      this.riverWorldGroup.worldToLocal(this.castStartTipPos);
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
      this.reelProgress = Math.min(100, this.reelProgress + 8.5);
      this.spawnRiverRipple(this.targetBobberPos);

      if (this.reelProgress >= 100) {
        this.fishingState = 'caught';
        this.activeCaughtFish = this.determineCaughtFish();

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

    // 7 RPG Rarity Tiers dynamically scaled by rod Luck
    // Base chances: Immortal 0.4%, Mythic 1.6%, Legendary 5%, Epic 10%, Rare 18%, Uncommon 25%
    const pImmortal = 0.004 * (1 + luck * 1.5);
    const pMythic = pImmortal + 0.016 * (1 + luck * 1.2);
    const pLegendary = pMythic + 0.050 * (1 + luck * 1.0);
    const pEpic = pLegendary + 0.100 * (1 + luck * 0.7);
    const pRare = pEpic + 0.180 * (1 + luck * 0.5);
    const pUncommon = pRare + 0.250 * (1 + luck * 0.2);

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

    const tierSpecies = RIVER_FISH_SPECIES.filter((s) => s.tier === selectedTier);
    const selected =
      tierSpecies.length > 0
        ? tierSpecies[Math.floor(Math.random() * tierSpecies.length)]
        : RIVER_FISH_SPECIES[0];

    // High luck rods give bonus weight potential
    const weightBonus = 1.0 + Math.min(0.5, luck * 0.12);
    const weightVariation = (0.88 + Math.random() * 0.28) * weightBonus;
    const calculatedWeight = selected.weight * weightVariation;
    // Bounded by rod max weight tolerance with margin
    const finalWeight = Number(
      Math.min(maxRodWeight * 1.35, Math.max(0.4, calculatedWeight)).toFixed(2)
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
      this.fishingRodGroup.visible = this.viewMode === 'river';

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
    // 1. Update River Ripples
    for (let i = this.riverRipples.length - 1; i >= 0; i--) {
      const rip = this.riverRipples[i];
      rip.curScale += rip.speed * delta;
      rip.mesh.scale.set(rip.curScale, rip.curScale, rip.curScale);
      const op = Math.max(0, 1 - rip.curScale / rip.maxScale);
      (rip.mesh.material as THREE.MeshBasicMaterial).opacity = op * 0.7;
      if (rip.curScale >= rip.maxScale) {
        this.riverWorldGroup.remove(rip.mesh);
        rip.mesh.geometry.dispose();
        (rip.mesh.material as THREE.Material).dispose();
        this.riverRipples.splice(i, 1);
      }
    }

    // 2. Update Swimming Fish
    this.riverFishList.forEach((fish) => {
      fish.angle += fish.speed * delta;
      const fx = fish.center.x + Math.cos(fish.angle) * fish.radius;
      const fz = fish.center.z + Math.sin(fish.angle) * fish.radius;
      fish.mesh.position.set(fx, fish.depth + Math.sin(elapsed * 2 + fish.angle) * 0.05, fz);
      fish.mesh.rotation.y = -fish.angle + Math.PI / 2;
      fish.tail.rotation.y = Math.sin(elapsed * 9 + fish.angle) * 0.42;
    });

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
            this.riverWorldGroup.worldToLocal(this.castStartTipPos);
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
            this.riverWorldGroup.worldToLocal(this.castStartTipPos);
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

      this.reelProgress = Math.max(0, this.reelProgress - 15.0 * delta);

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
        this.riverWorldGroup.worldToLocal(tipLocal);
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
      this.riverWorldGroup.worldToLocal(startPos);

      this.fishingBobber.updateWorldMatrix(true, false);
      const bobberWorld = new THREE.Vector3();
      this.fishingBobber.getWorldPosition(bobberWorld);
      const endPos = bobberWorld.clone();
      this.riverWorldGroup.worldToLocal(endPos);
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
    this.colliders.push({ x: 0, z: -82, radius: 4.8 });

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
  }

  public zoomIn(factor = 0.82) {
    this.spherical.radius = THREE.MathUtils.clamp(this.spherical.radius * factor, 8, 300);
    this.updateCameraTransform();
  }

  public zoomOut(factor = 1.22) {
    this.spherical.radius = THREE.MathUtils.clamp(this.spherical.radius * factor, 8, 300);
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
    } else if (e && this.viewMode === 'river') {
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
          const isPier = Math.abs(target.x) <= 2.85 && target.z >= -9.8 && target.z <= 2.5;
          const isShore = target.z > 0.0;
          const isWater = !isPier && !isShore && (target.z < -9.8 || Math.abs(target.x) > 2.85);

          // If tap in the river water area and fishing state is idle, directly cast!
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
          const ballSpot = new THREE.Vector3(0, 0.22, -18);
          const distToBall = target.distanceTo(ballSpot);
          if (distToBall < 3.0 && !this.isBallKicked) {
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

    if (this.viewMode === 'tugu' || this.viewMode === 'river' || this.viewMode === 'stadium') {
      // Tap input di alun-alun tugu, sungai, dan stadion sudah ditangani instan (0ms delay) di onPointerUp
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
    if (this.viewMode !== 'tugu' && this.viewMode !== 'river') {
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

    if (this.viewMode === 'river' && this.fishingState !== 'idle') {
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
      } else if (this.viewMode === 'stadium') {
        nextPos.x = THREE.MathUtils.clamp(nextPos.x, -21.0, 21.0);
        nextPos.z = THREE.MathUtils.clamp(nextPos.z, -33.0, 33.0);
        nextPos.y = 0.1;
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
        } else if (this.viewMode === 'stadium') {
          nextPos.x = THREE.MathUtils.clamp(nextPos.x, -21.0, 21.0);
          nextPos.z = THREE.MathUtils.clamp(nextPos.z, -33.0, 33.0);
          nextPos.y = 0.1;
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
      if (this.viewMode === 'river') {
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
    } else if (this.viewMode === 'river') {
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
      if (this.lab) {
        this.lab.update(elapsed);
      }
      if (this.tower) {
        this.tower.env(1);
      }
      if (this.fireflies && (this.timeOfDay === 'night' || this.timeOfDay === 'sunset')) {
        this.fireflies.update(elapsed, 1.0);
      }
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
        pos: new THREE.Vector3(12, 0, -78),
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
      if (this.viewMode === 'tugu') {
        this.target.copy(this.playerPos).add(new THREE.Vector3(0, 1.2, 0));
        this.spherical.radius = 4.0;
        this.spherical.phi = Math.PI / 2.25;
        this.spherical.theta = this.playerFacing + Math.PI;
      } else {
        this.target.set(0, 2, -82);
        this.spherical.radius = 7.5;
        this.spherical.phi = Math.PI / 2.25;
        this.spherical.theta = 0;
      }
    } else if (preset === 'normal') {
      if (this.viewMode === 'tugu') {
        this.target.copy(this.playerPos).add(new THREE.Vector3(0, 0.8, 0));
        this.spherical.radius = 12.0;
        this.spherical.phi = Math.PI / 3.2;
        this.spherical.theta = Math.PI * 0.75;
      } else {
        this.target.set(0, 4, -82);
        this.spherical.radius = 32.0;
        this.spherical.phi = Math.PI / 3.2;
        this.spherical.theta = Math.PI * 0.75;
      }
    } else if (preset === 'drone') {
      if (this.viewMode === 'tugu') {
        this.target.copy(this.playerPos);
        this.spherical.radius = 26.0;
        this.spherical.phi = Math.PI / 6.5;
      } else {
        this.target.set(0, 0, -82);
        this.spherical.radius = 60.0;
        this.spherical.phi = Math.PI / 6.5;
      }
    } else if (preset === 'wide') {
      if (this.viewMode === 'tugu') {
        this.target.copy(this.playerPos).add(new THREE.Vector3(0, 0.6, 0));
        this.spherical.radius = 8.0;
        this.spherical.phi = Math.PI / 2.05;
      } else {
        this.target.set(0, 1, -82);
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
