// ============================================================
// NETIZENCITY 3D - Modular Citizen & NPC Avatar Engine
// Quaternius CC0 Low-Poly 3D Character Models & Skeletal Animations
// With Real-Time Skin Switching, Material Tinting & Seamless Fallback
// ============================================================

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { clone as skeletonClone } from 'three/examples/jsm/utils/SkeletonUtils.js';
import { PAL } from './world.js';

export interface CitizenAvatarColors {
  skin: string;
  hair: string;
  hairStyle: string;
  shirt: string;
  pants: string;
  shoes: string;
  accessory?: string | null;
  backpack?: string | null;
  outfitPattern?: string | null;
}

export interface Citizen3DInstance {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  updateColors: (colors: CitizenAvatarColors) => void;
  pose: (isMoving: boolean, elapsed: number, speedMultiplier?: number) => void;
  playAction?: (actionName: string) => void;
  isModelReady?: () => boolean;
}

export interface PakMayorNPCInstance {
  root: THREE.Group;
  body: THREE.Group;
  head: THREE.Group;
  leftArm: THREE.Group;
  rightArm: THREE.Group;
  leftLeg: THREE.Group;
  rightLeg: THREE.Group;
  pose: (isMoving: boolean, elapsed: number, speedMultiplier?: number) => void;
  update: (elapsed: number) => void;
}

// ============================================================
// 10 QUATERNIUS CC0 LOW-POLY 3D SKINS & SKELETAL ANIMATIONS
// ============================================================
export const CHARACTER_SKINS: Record<string, string> = {
  casual_male: '/models/characters/skin_casual_male.glb',
  casual_female: '/models/characters/skin_casual_female.glb',
  suit: '/models/characters/skin_suit.glb',
  beach: '/models/characters/skin_beach.glb',
  punk: '/models/characters/skin_punk.glb',
  worker: '/models/characters/skin_worker.glb',
  king: '/models/characters/skin_king.glb',
  adventurer: '/models/characters/skin_adventurer.glb',
  farmer: '/models/characters/skin_farmer.glb',
};

export const ANIMATIONS_GLB_PATH = '/models/characters/animations.glb';

/**
 * Resolves the optimal 3D model skin key based on citizen wardrobe / patterns
 */
export function resolveSkinModelKey(colors: CitizenAvatarColors): string {
  const pattern = (colors.outfitPattern || '').toLowerCase();
  const hairStyle = (colors.hairStyle || '').toLowerCase();
  const acc = (colors.accessory || '').toLowerCase();
  const bp = (colors.backpack || '').toLowerCase();
  const shirt = (colors.shirt || '').toLowerCase();

  if (pattern.includes('tuxedo') || pattern.includes('suit') || shirt === '#020617') {
    return 'suit';
  }
  if (
    pattern.includes('beach') ||
    pattern.includes('hawaii') ||
    pattern.includes('swallow') ||
    acc.includes('snorkel')
  ) {
    return 'beach';
  }
  if (
    pattern.includes('punk') ||
    pattern.includes('cyber') ||
    pattern.includes('techwear') ||
    shirt === '#0f172a'
  ) {
    return 'punk';
  }
  if (
    pattern.includes('worker') ||
    pattern.includes('ojol') ||
    pattern.includes('vest') ||
    shirt === '#16a34a'
  ) {
    return 'worker';
  }
  if (
    pattern.includes('armor') ||
    pattern.includes('ksatria') ||
    pattern.includes('king') ||
    acc.includes('crown')
  ) {
    return 'king';
  }
  if (
    pattern.includes('adventurer') ||
    pattern.includes('safari') ||
    pattern.includes('parka') ||
    acc.includes('safari') ||
    acc.includes('rimba')
  ) {
    return 'adventurer';
  }
  if (
    pattern.includes('farmer') ||
    pattern.includes('kebun') ||
    pattern.includes('sarung') ||
    acc.includes('caping') ||
    acc.includes('straw')
  ) {
    return 'farmer';
  }
  if (
    pattern.includes('skirt') ||
    hairStyle.includes('long') ||
    hairStyle.includes('ponytail') ||
    hairStyle.includes('pigtail') ||
    acc.includes('cat')
  ) {
    return 'casual_female';
  }

  return 'casual_male';
}

// Shared loader & memory cache
let gltfLoaderInstance: GLTFLoader | null = null;
function getGLTFLoader(): GLTFLoader {
  if (!gltfLoaderInstance) {
    gltfLoaderInstance = new GLTFLoader();
  }
  return gltfLoaderInstance;
}

const skinTemplateCache = new Map<string, THREE.Group>();
const skinLoadingPromises = new Map<string, Promise<THREE.Group | null>>();
let animationClipsCache: Record<string, THREE.AnimationClip> | null = null;
let animationLoadingPromise: Promise<Record<string, THREE.AnimationClip>> | null = null;

/**
 * Loads and caches shared skeletal animation clips from animations.glb
 * Automatically retargets Body -> Hips and strips blender pole target tracks
 */
export function loadSharedAnimations(): Promise<Record<string, THREE.AnimationClip>> {
  if (animationClipsCache) return Promise.resolve(animationClipsCache);
  if (animationLoadingPromise) return animationLoadingPromise;

  animationLoadingPromise = new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({});
      return;
    }
    const loader = getGLTFLoader();
    loader.load(
      ANIMATIONS_GLB_PATH,
      (gltf) => {
        const clips: Record<string, THREE.AnimationClip> = {};
        for (const clip of gltf.animations) {
          const cleanTracks: THREE.KeyframeTrack[] = [];
          for (const track of clip.tracks) {
            // Filter out blender IK pole target tracks that have no corresponding skeleton bone
            if (track.name.startsWith('PTL') || track.name.startsWith('PTR')) continue;
            const newName = track.name.replace(/^Body\./, 'Hips.');
            const clonedTrack = track.clone();
            clonedTrack.name = newName;
            cleanTracks.push(clonedTrack);
          }
          const shortName = clip.name.replace(/^CharacterArmature\|/, '');
          clips[shortName] = new THREE.AnimationClip(shortName, clip.duration, cleanTracks);
        }
        animationClipsCache = clips;
        resolve(clips);
      },
      undefined,
      (err) => {
        console.warn('Failed to load shared animations:', err);
        resolve({});
      }
    );
  });

  return animationLoadingPromise;
}

/**
 * Loads and caches GLTF skin model template
 */
export function loadSkinTemplate(skinKey: string): Promise<THREE.Group | null> {
  const url = CHARACTER_SKINS[skinKey] || CHARACTER_SKINS.casual_male;
  if (skinTemplateCache.has(url)) {
    return Promise.resolve(skinTemplateCache.get(url)!);
  }
  if (skinLoadingPromises.has(url)) {
    return skinLoadingPromises.get(url)!;
  }

  const promise = new Promise<THREE.Group | null>((resolve) => {
    if (typeof window === 'undefined') {
      resolve(null);
      return;
    }
    const loader = getGLTFLoader();
    loader.load(
      url,
      (gltf) => {
        skinTemplateCache.set(url, gltf.scene);
        resolve(gltf.scene);
      },
      undefined,
      (err) => {
        console.warn(`Failed to load 3D skin model ${url}:`, err);
        resolve(null);
      }
    );
  });

  skinLoadingPromises.set(url, promise);
  return promise;
}

const mat = (color: string | number, options: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness: 0.55,
    metalness: 0.05,
    flatShading: false,
    ...options,
  });

/**
 * Tints a cloned material with citizen custom avatar colors
 */
function tintSkinMaterial(m: THREE.Material, colors: CitizenAvatarColors): THREE.Material {
  if (!(m instanceof THREE.MeshStandardMaterial)) return m;
  const name = (m.name || '').toLowerCase();

  if (name.includes('skin') && colors.skin) {
    m.color.set(colors.skin);
  } else if (name.includes('hair') && colors.hair) {
    m.color.set(colors.hair);
  } else if (name === 'eyebrows' && colors.hair) {
    m.color.set(colors.hair);
  } else if (
    (name === 'purple' || name === 'orange' || name === 'red_dark' || name === 'suit') &&
    colors.shirt
  ) {
    m.color.set(colors.shirt);
  } else if (
    (name === 'lightblue' || name === 'grey' || name === 'lightbrown') &&
    colors.pants
  ) {
    m.color.set(colors.pants);
  } else if (name === 'white' && colors.shoes && colors.shoes !== '#f1f5f9') {
    m.color.set(colors.shoes);
  }

  return m;
}

/**
 * Creates a high-fidelity 3D Citizen Avatar instance.
 * Integrates Quaternius CC0 3D low-poly models, humanoid animations,
 * dynamic skin mapping, and procedural fallback for instant display.
 */
export function makeCitizen3D(initialColors: CitizenAvatarColors): Citizen3DInstance {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  // ------------------------------------------------------------
  // A. PROCEDURAL FALLBACK MESH (Displays instantly while GLB downloads)
  // ------------------------------------------------------------
  const fallbackGroup = new THREE.Group();
  body.add(fallbackGroup);

  const skinMat = mat(initialColors.skin);
  const hairMat = mat(initialColors.hair);
  const shirtMat = mat(initialColors.shirt);
  const pantsMat = mat(initialColors.pants);
  const shoesMat = mat(initialColors.shoes);
  const eyesMat = mat('#1E293B', { roughness: 0.2 });
  const glintMat = mat('#FFFFFF', { roughness: 0.1 });
  const blushMat = mat('#F472B6', { transparent: true, opacity: 0.55 });
  const accessoryMat = mat('#F59E0B', { metalness: 0.6, roughness: 0.3 });

  // Torso
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 0.52;
  fallbackGroup.add(torsoGroup);
  const torsoMesh = new THREE.Mesh(new THREE.CapsuleGeometry(0.22, 0.28, 8, 16), shirtMat);
  torsoGroup.add(torsoMesh);
  const collarMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, 0.08, 12), skinMat);
  collarMesh.position.y = 0.2;
  torsoGroup.add(collarMesh);

  // Head & Face
  const head = new THREE.Group();
  head.position.y = 0.94;
  fallbackGroup.add(head);
  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.24, 16, 14), skinMat);
  head.add(headMesh);

  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), eyesMat);
    eye.position.set(s * 0.085, 0.02, 0.22);
    eye.scale.set(1, 1.25, 0.4);
    head.add(eye);

    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.01, 6, 6), glintMat);
    glint.position.set(s * 0.085 + 0.01, 0.035, 0.23);
    head.add(glint);

    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), blushMat);
    blush.position.set(s * 0.15, -0.06, 0.185);
    blush.scale.set(1, 0.5, 0.3);
    head.add(blush);
  }

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), skinMat);
  nose.position.set(0, -0.01, 0.24);
  head.add(nose);

  // Hair
  const hairGroup = new THREE.Group();
  head.add(hairGroup);
  const buildHair = (style: string) => {
    while (hairGroup.children.length > 0) hairGroup.remove(hairGroup.children[0]);
    const baseCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.252, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.56),
      hairMat
    );
    hairGroup.add(baseCap);

    if (style === 'spiky') {
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 1.8 - 0.9;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 5), hairMat);
        spike.position.set(Math.sin(a) * 0.18, 0.22 + Math.cos(a) * 0.04, Math.sin(a) * 0.16);
        spike.rotation.set(0.3, a * 0.5, -a * 0.4);
        hairGroup.add(spike);
      }
    } else if (style === 'long') {
      const backHair = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.42, 0.1).translate(0, -0.16, -0.16),
        hairMat
      );
      hairGroup.add(backHair);
      for (const s of [-1, 1]) {
        const sideLock = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.32, 0.1).translate(s * 0.2, -0.12, 0.06),
          hairMat
        );
        hairGroup.add(sideLock);
      }
    } else if (style === 'curly') {
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const puff = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), hairMat);
        puff.position.set(Math.cos(a) * 0.2, 0.15 + (i % 2) * 0.06, Math.sin(a) * 0.18);
        hairGroup.add(puff);
      }
    } else if (style === 'bob') {
      const bob = new THREE.Mesh(
        new THREE.CylinderGeometry(0.27, 0.29, 0.24, 16, 1, true, -Math.PI * 0.75, Math.PI * 1.5),
        hairMat
      );
      bob.position.y = -0.04;
      hairGroup.add(bob);
    } else {
      const fringe = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.08, 0.12).translate(0, 0.15, 0.18),
        hairMat
      );
      hairGroup.add(fringe);
      for (const s of [-1, 1]) {
        const sideBurn = new THREE.Mesh(
          new THREE.BoxGeometry(0.05, 0.14, 0.09).translate(s * 0.22, 0.02, 0.04),
          hairMat
        );
        hairGroup.add(sideBurn);
      }
    }
  };
  buildHair(initialColors.hairStyle || 'short');

  // Arms & Legs
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.25, 0.64, 0);
  fallbackGroup.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.25, 0.64, 0);
  fallbackGroup.add(rightArm);

  [leftArm, rightArm].forEach((arm) => {
    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.06, 0.18, 8).translate(0, -0.09, 0),
      shirtMat
    );
    arm.add(sleeve);
    const armSkin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.045, 0.16, 8).translate(0, -0.22, 0),
      skinMat
    );
    arm.add(armSkin);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), skinMat);
    hand.position.y = -0.32;
    arm.add(hand);
  });

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.11, 0.36, 0);
  fallbackGroup.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.11, 0.36, 0);
  fallbackGroup.add(rightLeg);

  [leftLeg, rightLeg].forEach((leg) => {
    const pantMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.07, 0.28, 8).translate(0, -0.14, 0),
      pantsMat
    );
    leg.add(pantMesh);
    const shoe = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.09, 0.2).translate(0, -0.32, 0.03),
      shoesMat
    );
    leg.add(shoe);
  });

  // ------------------------------------------------------------
  // B. ACCESSORY & BACKPACK ENGINE (Floating Halo, Wings, Tackle Box)
  // ------------------------------------------------------------
  const accGroup = new THREE.Group();
  body.add(accGroup);

  const buildAccessory = (acc?: string | null, bp?: string | null) => {
    while (accGroup.children.length > 0) accGroup.remove(accGroup.children[0]);

    if (bp === 'wings' || acc === 'wings') {
      for (const s of [-1, 1]) {
        const wing = new THREE.Mesh(
          new THREE.ConeGeometry(0.12, 0.45, 4).translate(0, 0.22, 0),
          mat('#FFFFFF', { roughness: 0.3 })
        );
        wing.position.set(s * 0.16, 0.58, -0.16);
        wing.rotation.set(-0.3, 0, -s * 0.8);
        accGroup.add(wing);
      }
    } else if (bp === 'tackle_box' || acc === 'tackle_box') {
      const pack = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.28, 0.14).translate(0, 0.52, -0.16),
        mat('#0284C7', { roughness: 0.5, metalness: 0.2 })
      );
      const latch = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.05, 0.02).translate(0, 0.55, -0.235),
        mat('#F59E0B', { metalness: 0.8 })
      );
      accGroup.add(pack, latch);
    } else if (bp || acc === 'backpack') {
      const pack = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.26, 0.12).translate(0, 0.52, -0.16),
        mat('#3B82F6', { roughness: 0.6 })
      );
      accGroup.add(pack);
    }

    if (acc === 'caping' || acc === 'straw_hat' || acc === 'acc_straw' || acc === 'acc_caping') {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.15, 16), mat('#EAB308', { roughness: 0.85 }));
      cone.position.set(0, 1.18, 0);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.02, 16), mat('#CA8A04', { roughness: 0.9 }));
      brim.position.set(0, 1.12, 0);
      accGroup.add(cone, brim);
    } else if (acc === 'safari_hat' || acc === 'topi_rimba' || acc === 'acc_safari') {
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.27, 0.12, 16), mat('#85754E', { roughness: 0.8 }));
      crown.position.set(0, 1.18, 0);
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.02, 16), mat('#6B5E3C', { roughness: 0.85 }));
      brim.position.set(0, 1.12, 0);
      accGroup.add(crown, brim);
    } else if (acc === 'crown' || acc === 'acc_crown') {
      const crownMesh = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.22, 0.12, 6, 1, true),
        mat('#F59E0B', { metalness: 0.85, roughness: 0.2 })
      );
      crownMesh.position.set(0, 1.2, 0);
      accGroup.add(crownMesh);
    } else if (acc === 'halo' || acc === 'acc_halo') {
      const haloMesh = new THREE.Mesh(
        new THREE.TorusGeometry(0.18, 0.022, 8, 24),
        mat('#FEF08A', { emissive: '#FACC15', emissiveIntensity: 0.6 })
      );
      haloMesh.position.set(0, 1.34, 0);
      haloMesh.rotation.x = Math.PI / 2;
      accGroup.add(haloMesh);
    } else if (acc === 'cat_ears' || acc === 'acc_cat') {
      for (const s of [-1, 1]) {
        const ear = new THREE.Mesh(
          new THREE.ConeGeometry(0.06, 0.12, 4),
          mat('#EC4899', { emissive: '#EC4899', emissiveIntensity: 0.5 })
        );
        ear.position.set(s * 0.14, 1.22, 0);
        ear.rotation.set(0, 0, -s * 0.3);
        accGroup.add(ear);
      }
    } else if (acc === 'snorkel' || acc === 'acc_snorkel') {
      const mask = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.09, 0.04), mat('#06B6D4', { metalness: 0.5, roughness: 0.3 }));
      mask.position.set(0, 0.96, 0.24);
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.32, 8), mat('#FACC15', { roughness: 0.4 }));
      tube.position.set(0.16, 1.06, 0.15);
      accGroup.add(mask, tube);
    } else if (acc === 'glasses' || acc === 'acc_glasses') {
      for (const s of [-1, 1]) {
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.012, 6, 16), accessoryMat);
        rim.position.set(s * 0.085, 0.96, 0.23);
        accGroup.add(rim);
      }
      const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.05, 4).rotateZ(Math.PI / 2), accessoryMat);
      bridge.position.set(0, 0.96, 0.235);
      accGroup.add(bridge);
    }
  };
  buildAccessory(initialColors.accessory, initialColors.backpack);

  // ------------------------------------------------------------
  // C. 3D GLTF LOW-POLY MODEL & ANIMATION MIXER ENGINE
  // ------------------------------------------------------------
  let activeSkinKey = resolveSkinModelKey(initialColors);
  let activeModelGroup: THREE.Group | null = null;
  let mixer: THREE.AnimationMixer | null = null;
  let actions: Record<string, THREE.AnimationAction> = {};
  let currentAction: THREE.AnimationAction | null = null;
  let isMovingState = false;
  let lastPoseTime = 0;
  let isReady = false;

  // Key skeletal bones
  let upperArmRBone: THREE.Bone | null = null;
  let upperArmLBone: THREE.Bone | null = null;
  let handRBone: THREE.Bone | null = null;

  const loadAndApplySkin = async (skinKey: string, colors: CitizenAvatarColors) => {
    try {
      const [template, clips] = await Promise.all([
        loadSkinTemplate(skinKey),
        loadSharedAnimations(),
      ]);

      if (!template) return;

      // Clean up previous 3D model if hot-swapping
      if (activeModelGroup) {
        body.remove(activeModelGroup);
        activeModelGroup = null;
      }
      if (mixer) {
        mixer.stopAllAction();
        mixer = null;
      }
      actions = {};
      currentAction = null;

      // Clone skeleton and meshes cleanly
      const clonedSkin = skeletonClone(template) as THREE.Group;
      clonedSkin.scale.set(0.63, 0.63, 0.63);
      clonedSkin.position.set(0, 0, 0);

      // Clone and tint materials
      clonedSkin.traverse((child) => {
        if ((child as THREE.Mesh).isMesh || (child as THREE.SkinnedMesh).isSkinnedMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((m) => tintSkinMaterial(m.clone(), colors));
          } else if (mesh.material) {
            mesh.material = tintSkinMaterial(mesh.material.clone(), colors);
          }
        }
      });

      // Find critical bones
      upperArmRBone = clonedSkin.getObjectByName('UpperArmR') as THREE.Bone | null;
      upperArmLBone = clonedSkin.getObjectByName('UpperArmL') as THREE.Bone | null;
      handRBone = clonedSkin.getObjectByName('HandR') as THREE.Bone | null;

      // Initialize Animation Mixer
      if (Object.keys(clips).length > 0) {
        mixer = new THREE.AnimationMixer(clonedSkin);
        for (const [name, clip] of Object.entries(clips)) {
          actions[name] = mixer.clipAction(clip);
        }

        const idle = actions['Idle_Neutral'];
        const walk = actions['Walk'];
        if (idle && walk) {
          idle.play();
          walk.play();
          idle.weight = isMovingState ? 0 : 1;
          walk.weight = isMovingState ? 1 : 0;
          currentAction = isMovingState ? walk : idle;
        }
      }

      body.add(clonedSkin);
      activeModelGroup = clonedSkin;

      // Hide the procedural placeholder once the high-res 3D model is active
      fallbackGroup.visible = false;
      isReady = true;
    } catch (err) {
      console.warn('Failed to initialize 3D skin:', err);
      fallbackGroup.visible = true;
    }
  };

  // Kick off asynchronous model load
  loadAndApplySkin(activeSkinKey, initialColors);

  // ------------------------------------------------------------
  // D. PUBLIC API METHODS
  // ------------------------------------------------------------
  const updateColors = (newColors: CitizenAvatarColors) => {
    if (newColors.skin) skinMat.color.set(newColors.skin);
    if (newColors.hair) hairMat.color.set(newColors.hair);
    if (newColors.shirt) shirtMat.color.set(newColors.shirt);
    if (newColors.pants) pantsMat.color.set(newColors.pants);
    if (newColors.shoes) shoesMat.color.set(newColors.shoes);

    if (newColors.hairStyle) buildHair(newColors.hairStyle);
    buildAccessory(newColors.accessory, newColors.backpack);

    const targetSkinKey = resolveSkinModelKey(newColors);
    if (targetSkinKey !== activeSkinKey || !activeModelGroup) {
      activeSkinKey = targetSkinKey;
      loadAndApplySkin(activeSkinKey, newColors);
    } else if (activeModelGroup) {
      // Re-tint existing materials on the current model
      activeModelGroup.traverse((child) => {
        if ((child as THREE.Mesh).isMesh || (child as THREE.SkinnedMesh).isSkinnedMesh) {
          const mesh = child as THREE.Mesh;
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => tintSkinMaterial(m, newColors));
          } else if (mesh.material) {
            tintSkinMaterial(mesh.material, newColors);
          }
        }
      });
    }
  };

  const pose = (isMoving: boolean, elapsed: number, speedMultiplier = 5.2) => {
    isMovingState = isMoving;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const delta = lastPoseTime > 0 ? Math.min(0.06, (now - lastPoseTime) / 1000) : 0.016;
    lastPoseTime = now;

    // Check if rightArm has attached items (e.g. fishing rod) or is explicitly rotated by game actions
    const hasFishingRod = rightArm.children.length > 0;
    const isArmManuallyControlled = hasFishingRod || Math.abs(rightArm.rotation.x) > 0.05;

    if (mixer && activeModelGroup) {
      // Skeletal animation crossfade
      const idle = actions['Idle_Neutral'];
      const walk = actions['Walk'];
      const run = actions['Run'];

      const targetAction = isMoving
        ? speedMultiplier > 6 && run
          ? run
          : walk
        : idle;

      if (targetAction && currentAction !== targetAction) {
        if (currentAction) currentAction.fadeOut(0.18);
        targetAction.reset().fadeIn(0.18).play();
        currentAction = targetAction;
      }

      mixer.update(delta);

      // Synchronize manual arm poses (angling rod whip, cast, reel, victory raise) onto the 3D model
      if (isArmManuallyControlled && upperArmRBone) {
        upperArmRBone.rotation.x = rightArm.rotation.x;
        upperArmRBone.rotation.y = rightArm.rotation.y;
        upperArmRBone.rotation.z = rightArm.rotation.z;
      }
      if (Math.abs(leftArm.rotation.x) > 0.05 && upperArmLBone) {
        upperArmLBone.rotation.x = leftArm.rotation.x;
        upperArmLBone.rotation.y = leftArm.rotation.y;
        upperArmLBone.rotation.z = leftArm.rotation.z;
      }

      // If a fishing rod is attached to rightArm proxy group, update proxy group position near hand
      if (hasFishingRod && handRBone) {
        const handPos = new THREE.Vector3();
        handRBone.getWorldPosition(handPos);
        body.worldToLocal(handPos);
        rightArm.position.copy(handPos);
      }
    } else {
      // Procedural fallback animation loop
      if (isMoving) {
        const walkCycle = Math.sin(elapsed * speedMultiplier);
        const hop = Math.abs(Math.sin(elapsed * speedMultiplier)) * 0.04;
        const lean = Math.sin(elapsed * speedMultiplier) * 0.03;

        body.position.y = hop;
        body.rotation.z = lean;

        if (!isArmManuallyControlled) {
          leftArm.rotation.x = -walkCycle * 0.42;
          rightArm.rotation.x = walkCycle * 0.42;
        }
        leftLeg.rotation.x = walkCycle * 0.48;
        rightLeg.rotation.x = -walkCycle * 0.48;
        head.rotation.y = Math.sin(elapsed * speedMultiplier * 0.5) * 0.05;
      } else {
        const breath = Math.sin(elapsed * 2.0) * 0.012;
        body.position.y = breath;
        body.rotation.z = 0;

        if (!isArmManuallyControlled) {
          leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0, 0.35);
          rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0, 0.35);
        }
        leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0, 0.35);
        rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0, 0.35);
        head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, 0, 0.25);
      }
    }
  };

  const playAction = (actionName: string) => {
    const action = actions[actionName];
    if (action && mixer) {
      action.reset().fadeIn(0.12).play();
      if (currentAction && currentAction !== action) {
        currentAction.fadeOut(0.12);
      }
      currentAction = action;
    }
  };

  return {
    root,
    body,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    updateColors,
    pose,
    playAction,
    isModelReady: () => isReady,
  };
}

// ============================================================
// PAK MAYOR NPC CREATOR (Balai Kota / Alun-Alun Tugu)
// Uses Quaternius Executive Suit 3D Model with Mayoral Top Hat
// ============================================================
export function createPakMayorNPC(
  scene: THREE.Scene | THREE.Group,
  position: THREE.Vector3
): PakMayorNPCInstance {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  // 1. Procedural placeholder for Mayor
  const fallbackMayor = new THREE.Group();
  body.add(fallbackMayor);

  const bm = mat(PAL.mayor, { roughness: 0.45 });
  const cap = new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.48, 8, 20), bm);
  cap.position.y = 0.52;
  fallbackMayor.add(cap);

  const shirtInner = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.22, 0.05).translate(0, 0.65, 0.25),
    mat('#FFFFFF', { roughness: 0.7 })
  );
  fallbackMayor.add(shirtInner);

  const sash = new THREE.Mesh(new THREE.TorusGeometry(0.275, 0.035, 6, 28), mat('#F5E3B8'));
  sash.position.y = 0.5;
  sash.rotation.set(Math.PI / 2 + 0.55, 0, 0);
  fallbackMayor.add(sash);

  const leftArm = new THREE.Group();
  leftArm.position.set(-0.25, 0.64, 0);
  fallbackMayor.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.25, 0.64, 0);
  fallbackMayor.add(rightArm);

  const skinMat = mat('#F5D0B0');
  const whiteMat = mat('#FFFFFF');

  [leftArm, rightArm].forEach((arm) => {
    const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.065, 0.06, 0.18, 8).translate(0, -0.09, 0), bm);
    arm.add(sleeve);
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.04, 8).translate(0, -0.19, 0), whiteMat);
    arm.add(cuff);
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), skinMat);
    hand.position.y = -0.24;
    arm.add(hand);
  });

  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.11, 0.36, 0);
  fallbackMayor.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.11, 0.36, 0);
  fallbackMayor.add(rightLeg);

  const pantsMat = mat('#1E293B');
  const shoeMat = mat('#0F172A', { roughness: 0.4, metalness: 0.2 });

  [leftLeg, rightLeg].forEach((leg) => {
    const pantMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.07, 0.28, 8).translate(0, -0.14, 0), pantsMat);
    leg.add(pantMesh);
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.09, 0.2).translate(0, -0.32, 0.03), shoeMat);
    leg.add(shoe);
  });

  const head = new THREE.Group();
  head.position.y = 0.82;
  fallbackMayor.add(head);

  // 2. Mayoral Signature Top Hat & Spectacles
  const hatGroup = new THREE.Group();
  hatGroup.position.y = 1.15;
  body.add(hatGroup);

  const hm = mat(PAL.hat, { roughness: 0.6 });
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.03, 28), hm);
  hatGroup.add(brim);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.21, 0.34, 28), hm);
  crown.position.y = 0.18;
  hatGroup.add(crown);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(0.213, 0.213, 0.06, 28), mat(PAL.hatBand));
  band.position.y = 0.06;
  hatGroup.add(band);

  // 3. Quaternius Executive Suit 3D Model
  let mayorMixer: THREE.AnimationMixer | null = null;
  let lastMayorPoseTime = 0;

  const initMayor3D = async () => {
    try {
      const [template, clips] = await Promise.all([
        loadSkinTemplate('suit'),
        loadSharedAnimations(),
      ]);

      if (!template) return;

      const clonedSuit = skeletonClone(template) as THREE.Group;
      clonedSuit.scale.set(0.63, 0.63, 0.63);
      clonedSuit.position.set(0, 0, 0);

      // Tint suit with Mayoral palette
      clonedSuit.traverse((child) => {
        if ((child as THREE.Mesh).isMesh || (child as THREE.SkinnedMesh).isSkinnedMesh) {
          const mesh = child as THREE.Mesh;
          mesh.castShadow = false;
          mesh.receiveShadow = false;
          if (Array.isArray(mesh.material)) {
            mesh.material = mesh.material.map((m) => {
              const cl = m.clone() as THREE.MeshStandardMaterial;
              if (cl.name?.toLowerCase().includes('suit')) cl.color.set(PAL.mayor);
              if (cl.name?.toLowerCase().includes('tie')) cl.color.set(PAL.gold);
              return cl;
            });
          } else if (mesh.material) {
            const cl = mesh.material.clone() as THREE.MeshStandardMaterial;
            if (cl.name?.toLowerCase().includes('suit')) cl.color.set(PAL.mayor);
            if (cl.name?.toLowerCase().includes('tie')) cl.color.set(PAL.gold);
            mesh.material = cl;
          }
        }
      });

      if (clips['Idle_Neutral']) {
        mayorMixer = new THREE.AnimationMixer(clonedSuit);
        const action = mayorMixer.clipAction(clips['Idle_Neutral']);
        action.play();
      }

      body.add(clonedSuit);
      fallbackMayor.visible = false;
    } catch (err) {
      console.warn('Failed to initialize 3D Mayor NPC:', err);
    }
  };

  initMayor3D();

  root.position.copy(position);
  scene.add(root);

  const pose = (_isMoving: boolean, elapsed: number) => {
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const delta = lastMayorPoseTime > 0 ? Math.min(0.06, (now - lastMayorPoseTime) / 1000) : 0.016;
    lastMayorPoseTime = now;

    if (mayorMixer) {
      mayorMixer.update(delta);
    } else {
      const breath = Math.sin(elapsed * 2.0) * 0.012;
      body.position.y = breath;
      body.rotation.z = 0;
      head.rotation.y = Math.sin(elapsed * 0.8) * 0.15;
    }
  };

  return {
    root,
    body,
    head,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    pose,
    update: (elapsed: number) => {
      pose(false, elapsed);
    },
  };
}
