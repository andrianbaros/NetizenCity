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
import { makeCitizen3D, createPakMayorNPC, Citizen3DInstance, CitizenAvatarColors } from './citizen3d';
import { resolveAvatarColors } from '@/game/utils/characterRenderer';
import { useGameStore } from '@/lib/stores/useGameStore';
import { useUIStore } from '@/lib/stores/useUIStore';
import { useCitizenStore } from '@/lib/stores/useCitizenStore';

export type TimeOfDay = 'morning' | 'noon' | 'sunset' | 'night';
export type CameraMode = 'orbit' | 'follow' | 'cinematic';

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
  private mayorNPC: any = null;
  private isPlayerAdmin = false;
  private cat: any = null;
  private petDogs: any[] = [];
  private bigCrowd: any = null;
  private walkingCitizens: WalkingCitizen[] = [];

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
  private clock = new THREE.Clock();
  private timeOfDay: TimeOfDay = 'noon';
  private cameraMode: CameraMode = 'orbit'; // Main city starts in free Orbit overview
  public viewMode: 'city' | 'tugu' = 'city';
  public cityWorldGroup = new THREE.Group();
  public tuguWorldGroup = new THREE.Group();
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
  private virtualMove: { x: number; y: number } | null = null;
  private tuguLamps: Array<{
    root: THREE.Group;
    globeMat: THREE.MeshStandardMaterial;
    light: THREE.PointLight | null;
  }> = [];
  private handleTimeOfDayEvent?: (e: any) => void;
  private handleToggleDayNightEvent?: () => void;

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
      name: 'Menara Investor (103 Investor Kota)',
      district: 'Distrik Investor',
      type: 'investor',
      position: new THREE.Vector3(TOWER.x, 0, TOWER.z),
      cameraTarget: new THREE.Vector3(TOWER.x, 10, TOWER.z),
      cameraPos: new THREE.Vector3(TOWER.x + 20, 18, TOWER.z + 22),
      radius: 10,
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
  ];

  constructor(container: HTMLElement, options?: City3DOptions) {
    this.container = container;
    this.onCameraModeChange = options?.onCameraModeChange;
    this.init();
  }

  private init() {
    const W = this.container.clientWidth || window.innerWidth;
    const H = this.container.clientHeight || window.innerHeight;

    // 1. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      powerPreference: 'high-performance',
      antialias: true,
      preserveDrawingBuffer: false,
      logarithmicDepthBuffer: true,
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

    // 3. Camera Setup (near 0.5 and far 1400 combined with logarithmic depth eliminates Z-fighting & flicker)
    this.camera = new THREE.PerspectiveCamera(40, W / H, 0.5, 1400);
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

    // 6. Setup Characters, Living Citizens & Airplanes
    this.setupCharacters();
    this.setupAirplanes();

    // 7. Setup Interactive Raycasting & Colliders for Buildings
    this.registerInteractiveLandmarks();
    this.setupColliders();

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

      this.mayorNPC = createPakMayorNPC(this.tuguWorldGroup, new THREE.Vector3(3.2, 0, 3.5));
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
    this.tuguWorldGroup.visible = true;

    // Slight random spawn offset so multiple entering citizens do not overlap identically
    const spawnOffsetX = (Math.random() - 0.5) * 5;
    const spawnOffsetZ = (Math.random() - 0.5) * 2;
    this.playerPos.set(spawnOffsetX, 0, 13 + spawnOffsetZ);
    this.playerFacing = Math.PI;

    if (this.playerCitizen) {
      this.playerCitizen.root.position.copy(this.playerPos);
      this.playerCitizen.root.rotation.y = this.playerFacing;
      this.playerCitizen.root.visible = true;
    }
    if (this.mayorPlayer) {
      this.mayorPlayer.root.position.copy(this.playerPos);
      this.mayorPlayer.root.rotation.y = this.playerFacing;
      this.mayorPlayer.root.visible = true;
    }
    if (this.cat) {
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
      lastChat?: { text: string; time: number };
    }>,
    myClientId: string
  ) {
    if (this.viewMode !== 'tugu') return;

    const activeIds = new Set<string>();

    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();

    for (const p of players) {
      if (p.id === myClientId) continue; // Don't duplicate local player
      activeIds.add(p.id);

      const existing = this.remotePlayers.get(p.id);
      if (existing) {
        const targetV = new THREE.Vector3(p.x, 0, p.z);
        const dist = existing.root.position.distanceTo(targetV);
        const dt = Math.max(0.15, (now - (existing.lastServerTime || now - 400)) / 1000);
        existing.lastServerTime = now;

        // If distance is huge (e.g. initial spawn or teleport > 18 units), snap immediately
        if (dist > 18) {
          existing.root.position.copy(targetV);
          existing.targetPos.copy(targetV);
          existing.root.rotation.y = p.facing;
          existing.targetFacing = p.facing;
          existing.moveSpeed = 0;
        } else {
          existing.targetPos.copy(targetV);
          existing.targetFacing = p.facing;
          // Calculate natural walking speed (local player moves at 12 u/s)
          // Clamped between 8 and 14 u/s to smoothly cover distance without sudden dashes
          existing.moveSpeed = Math.min(14.5, Math.max(8.0, dist / dt));
        }

        // Check if there is new chat to display
        if (p.lastChat && p.lastChat.time > (existing.lastChatTime || 0)) {
          existing.lastChatTime = p.lastChat.time;
          if (Date.now() - p.lastChat.time < 8000) {
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
        citizen.root.position.set(p.x, 0, p.z);
        citizen.root.rotation.y = p.facing;

        // Add nametag
        const nameTag = makeNameTagSprite(p.name, p.isGuest, false);
        nameTag.position.set(0, 1.55, 0);
        citizen.root.add(nameTag);

        this.tuguWorldGroup.add(citizen.root);

        this.remotePlayers.set(p.id, {
          root: citizen.root,
          citizen,
          targetPos: new THREE.Vector3(p.x, 0, p.z),
          targetFacing: p.facing,
          nameTag,
          lastChatTime: p.lastChat?.time || 0,
          lastServerTime: now,
          moveSpeed: 11.5,
        });
      }
    }

    // Remove disconnected players
    for (const [id, remote] of this.remotePlayers.entries()) {
      if (!activeIds.has(id)) {
        this.tuguWorldGroup.remove(remote.root);
        this.remotePlayers.delete(id);
      }
    }
  }

  public clearRemotePlayers() {
    for (const [, remote] of this.remotePlayers.entries()) {
      this.tuguWorldGroup.remove(remote.root);
    }
    this.remotePlayers.clear();
  }

  private updateRemotePlayersAnimation(delta: number, elapsed: number) {
    for (const [, remote] of this.remotePlayers.entries()) {
      const cur = remote.root.position;
      const target = remote.targetPos;
      const dist = cur.distanceTo(target);

      if (dist > 0.06) {
        // Linear smooth movement at natural walking speed (prevents instant exponential lerp dashing)
        const speed = remote.moveSpeed || 11.5;
        const step = Math.min(dist, speed * delta);
        const dir = target.clone().sub(cur).normalize();
        cur.addScaledVector(dir, step);

        // Turn body smoothly towards the direction of travel
        const moveAngle = Math.atan2(dir.x, dir.z);
        let diff = (moveAngle - remote.root.rotation.y) % (Math.PI * 2);
        if (diff > Math.PI) diff -= Math.PI * 2;
        if (diff < -Math.PI) diff += Math.PI * 2;
        remote.root.rotation.y += diff * Math.min(1, delta * 12);

        // Animate citizen legs and arms walking
        remote.citizen.pose(true, elapsed, 5.0);
      } else {
        // Reached destination: stand still and face the player's last reported orientation
        let diff = (remote.targetFacing - remote.root.rotation.y) % (Math.PI * 2);
        if (diff > Math.PI) diff -= Math.PI * 2;
        if (diff < -Math.PI) diff += Math.PI * 2;
        remote.root.rotation.y += diff * Math.min(1, delta * 8);

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

    useGameStore.getState().setSelectedBuilding(null);
    useGameStore.getState().setCurrentDistrict('town_square');

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('tugu-mode-changed', { detail: { mode: 'city' } }));
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
      // Cylinder hitbox wrapping each landmark - generous sizing for effortless tapping on mobile
      const radius = lm.id === 'monument' ? 38.0 : Math.max(lm.radius * 1.3, 14.0);
      const height = lm.id === 'monument' ? 34.0 : Math.max(22, radius * 1.2);
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

    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
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

    if (this.activePointers.size === 1) {
      this.isPointerDown = true;
      this.isPanning = e.button === 2 || e.shiftKey;
      this.pointerStart = { x: e.clientX, y: e.clientY };
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
    } else if (this.activePointers.size === 2) {
      const [p1, p2] = Array.from(this.activePointers.values());
      this.pinchStartDistance = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      this.pinchStartRadius = this.spherical.radius;
      this.pinchStartMidpoint = { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 };
      this.isPanning = true;
    }
  };

  private onPointerMove = (e: PointerEvent) => {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    if (this.activePointers.has(e.pointerId)) {
      this.activePointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    }

    // MULTI-TOUCH GESTURES: Pinch zoom & 2-finger pan for mobile
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

      if (this.cameraMode !== 'follow') {
        const forward = new THREE.Vector3();
        this.camera.getWorldDirection(forward);
        forward.y = 0;
        forward.normalize();
        const right = new THREE.Vector3().crossVectors(forward, new THREE.Vector3(0, 1, 0)).normalize();
        const panSpeed = this.spherical.radius * 0.0018;

        this.target.addScaledVector(right, -mdx * panSpeed);
        this.target.addScaledVector(forward, mdy * panSpeed);
      }
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
      const panSpeed = this.spherical.radius * 0.0016;

      this.target.addScaledVector(right, -dx * panSpeed);
      this.target.addScaledVector(forward, dy * panSpeed);
    } else {
      this.spherical.theta -= dx * 0.005;
      this.spherical.phi -= dy * 0.005;
    }

    this.updateCameraTransform();
  };

  private onPointerUp = (e?: PointerEvent) => {
    if (e && this.activePointers.has(e.pointerId)) {
      this.activePointers.delete(e.pointerId);
    } else if (!e) {
      this.activePointers.clear();
    }

    if (this.activePointers.size === 0) {
      this.isPointerDown = false;
      this.isPanning = false;
    } else if (this.activePointers.size === 1) {
      const remaining = Array.from(this.activePointers.values())[0];
      this.pointerStart = { x: remaining.x, y: remaining.y };
      this.isPanning = false;
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
          // Check proximity to any landmark, prioritizing monument (Tugu)
          const monumentLm = this.landmarks.find((lm) => lm.id === 'monument');
          if (monumentLm && groundHit.distanceTo(monumentLm.position) <= 38.0) {
            targetLandmark = monumentLm;
          } else {
            // Find closest landmark within its generous radius
            let closestDist = Infinity;
            for (const lm of this.landmarks) {
              const d = groundHit.distanceTo(lm.position);
              const maxDist = lm.id === 'monument' ? 38.0 : Math.max(lm.radius * 1.5, 16.0);
              if (d <= maxDist && d < closestDist) {
                closestDist = d;
                targetLandmark = lm;
              }
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
        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('landmark-selected', { detail: targetLandmark })
          );
        }
        return;
      }
    }

    if (this.viewMode === 'tugu') {
      const rect = this.container.getBoundingClientRect();
      this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      this.raycaster.setFromCamera(this.mouse, this.camera);
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
      const target = new THREE.Vector3();
      if (this.raycaster.ray.intersectPlane(plane, target)) {
        const distFromCenter = Math.hypot(target.x, target.z);
        if (distFromCenter <= 24) {
          this.targetPosition = target;
        }
      }
    }
  };

  private onKeyDown = (e: KeyboardEvent) => {
    this.keysPressed[e.key.toLowerCase()] = true;
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this.keysPressed[e.key.toLowerCase()] = false;
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

  private updateCharacter(delta: number, elapsed: number) {
    if (this.viewMode !== 'tugu') {
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
    if (this.keysPressed['w'] || this.keysPressed['arrowup']) moveVec.add(camDir);
    if (this.keysPressed['s'] || this.keysPressed['arrowdown']) moveVec.sub(camDir);
    if (this.keysPressed['d'] || this.keysPressed['arrowright']) moveVec.add(camRight);
    if (this.keysPressed['a'] || this.keysPressed['arrowleft']) moveVec.sub(camRight);

    let isMoving = false;
    const speed = 12 * delta * analogFactor;

    if (moveVec.lengthSq() > 0.001) {
      this.targetPosition = null;
      moveVec.normalize().multiplyScalar(speed);

      const nextPos = this.playerPos.clone().add(moveVec);
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

      this.playerPos.copy(nextPos);
      this.playerFacing = Math.atan2(moveVec.x, moveVec.z);
      isMoving = true;
    } else if (this.targetPosition) {
      const diff = this.targetPosition.clone().sub(this.playerPos);
      diff.y = 0;
      if (diff.length() > 0.4) {
        this.playerFacing = Math.atan2(diff.x, diff.z);
        diff.normalize().multiplyScalar(speed);

        const nextPos = this.playerPos.clone().add(diff);
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

        this.playerPos.copy(nextPos);
        isMoving = true;
      } else {
        this.targetPosition = null;
      }
    }

    if (this.isPlayerAdmin && this.mayorPlayer) {
      this.mayorPlayer.root.position.copy(this.playerPos);
      this.mayorPlayer.root.rotation.y = this.playerFacing;
      this.mayorPlayer.pose(isMoving, elapsed);
    } else if (this.playerCitizen) {
      this.playerCitizen.root.position.copy(this.playerPos);
      this.playerCitizen.root.rotation.y = this.playerFacing;
      this.playerCitizen.pose(isMoving, elapsed, 6.0);
    }

    if (this.cat) {
      const catOffset = new THREE.Vector3(-1.1, 0, -1.0).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        this.playerFacing
      );
      const catTarget = this.playerPos.clone().add(catOffset);
      this.cat.root.position.lerp(catTarget, 0.12);
      this.cat.root.rotation.y = this.playerFacing;
    }

    if (this.cameraMode === 'follow') {
      this.target.copy(this.playerPos).add(new THREE.Vector3(0, 1.4, 0));
      this.updateCameraTransform();
    }

    // Southern exit portal check at (0, 0, 22)
    if (Math.hypot(this.playerPos.x - 0, this.playerPos.z - 22) <= 2.2) {
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('exit-tugu-area'));
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
    if (this.viewMode !== 'tugu') {
      useGameStore.getState().setSelectedBuilding(null);
      return;
    }
    useGameStore.getState().setSelectedBuilding('monument');
    useGameStore.getState().setCurrentDistrict('Pusat Kota');
  }

  private animate = () => {
    if (this.isDestroyed) return;
    this.reqId = requestAnimationFrame(this.animate);

    const delta = Math.min(this.clock.getDelta(), 0.1);
    const elapsed = this.clock.getElapsedTime();

    if (this.viewMode === 'tugu') {
      this.updateCharacter(delta, elapsed);
      this.updateTuguCitizens(delta, elapsed);
      this.updateRemotePlayersAnimation(delta, elapsed);
      if (this.tuguMpark?.jets) {
        this.tuguMpark.jets.children.forEach((j: any, i: number) => {
          j.scale.y = 0.5 + Math.sin(elapsed * 4 + i * 0.4) * 0.4;
        });
      }
    } else {
      this.updateAirplanes(elapsed);
      this.updateAnimals(elapsed);
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

  public destroy() {
    this.isDestroyed = true;
    cancelAnimationFrame(this.reqId);

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
    if (this.handleTimeOfDayEvent) window.removeEventListener('time-of-day-changed', this.handleTimeOfDayEvent);
    if (this.handleToggleDayNightEvent) window.removeEventListener('toggle-day-night', this.handleToggleDayNightEvent);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
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
