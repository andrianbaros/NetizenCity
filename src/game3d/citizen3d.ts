// ============================================================
// NETIZENCITY 3D - Modular Citizen & NPC Avatar Engine
// Iconic Chibi Capsule Artstyle with Master-Crafted 3D Accessories
// Animated Wings Flutter, Divine Halo Glow, RGB Headset, Caping & Tackle Box
// ============================================================

import * as THREE from 'three';
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

const mat = (color: string | number, options: THREE.MeshStandardMaterialParameters = {}) =>
  new THREE.MeshStandardMaterial({
    color,
    roughness: 0.55,
    metalness: 0.05,
    flatShading: false,
    ...options,
  });

export function makeCitizen3D(initialColors: CitizenAvatarColors): Citizen3DInstance {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  // Dynamic Materials
  const skinMat = mat(initialColors.skin);
  const hairMat = mat(initialColors.hair);
  const shirtMat = mat(initialColors.shirt);
  const pantsMat = mat(initialColors.pants);
  const shoesMat = mat(initialColors.shoes);
  const eyesMat = mat('#1E293B', { roughness: 0.2 });
  const glintMat = mat('#FFFFFF', { roughness: 0.1 });
  const blushMat = mat('#F472B6', { transparent: true, opacity: 0.6 });
  const accessoryMat = mat('#F59E0B', { metalness: 0.6, roughness: 0.3 });

  // ------------------------------------------------------------
  // 1. TORSO (Iconic Chibi Capsule Body)
  // ------------------------------------------------------------
  const torsoGroup = new THREE.Group();
  torsoGroup.position.y = 0.52;
  body.add(torsoGroup);

  const torsoGeo = new THREE.CapsuleGeometry(0.22, 0.28, 8, 16);
  const torsoMesh = new THREE.Mesh(torsoGeo, shirtMat);
  torsoMesh.castShadow = false;
  torsoMesh.receiveShadow = false;
  torsoGroup.add(torsoMesh);

  // Shirt collar / neck trim
  const collarGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.08, 12);
  const collarMesh = new THREE.Mesh(collarGeo, skinMat);
  collarMesh.position.y = 0.2;
  torsoGroup.add(collarMesh);

  // ------------------------------------------------------------
  // 2. HEAD & CUTE CHIBI FACE
  // ------------------------------------------------------------
  const head = new THREE.Group();
  head.position.y = 0.94;
  body.add(head);

  const headGeo = new THREE.SphereGeometry(0.24, 16, 14);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = false;
  headMesh.receiveShadow = false;
  head.add(headMesh);

  // Chibi Anime Eyes with expressive sparkle
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), eyesMat);
    eye.position.set(s * 0.085, 0.02, 0.22);
    eye.scale.set(1, 1.25, 0.4);
    head.add(eye);

    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.011, 6, 6), glintMat);
    glint.position.set(s * 0.085 + 0.01, 0.035, 0.23);
    head.add(glint);

    // Blushing cheeks
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), blushMat);
    blush.position.set(s * 0.15, -0.06, 0.185);
    blush.scale.set(1, 0.5, 0.3);
    head.add(blush);
  }

  // Cute nose button
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), skinMat);
  nose.position.set(0, -0.01, 0.24);
  head.add(nose);

  // ------------------------------------------------------------
  // 3. HAIRSTYLES (Rebuildable)
  // ------------------------------------------------------------
  const hairGroup = new THREE.Group();
  head.add(hairGroup);

  const buildHair = (style: string) => {
    while (hairGroup.children.length > 0) {
      hairGroup.remove(hairGroup.children[0]);
    }

    const baseCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.252, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.56),
      hairMat
    );
    hairGroup.add(baseCap);

    if (style === 'spiky') {
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 1.8 - 0.9;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 5), hairMat);
        spike.position.set(Math.sin(a) * 0.18, 0.22 + Math.cos(a) * 0.04, Math.cos(a) * 0.16);
        spike.rotation.set(0.3, a * 0.5, -a * 0.4);
        hairGroup.add(spike);
      }
    } else if (style === 'long' || style === 'ponytail') {
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

      if (style === 'ponytail') {
        const knot = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.02, 6, 12), mat('#F43F5E'));
        knot.position.set(0, 0.06, -0.25);
        const tail = new THREE.Mesh(
          new THREE.ConeGeometry(0.09, 0.32, 8).translate(0, -0.14, 0),
          hairMat
        );
        tail.position.set(0, 0.06, -0.27);
        tail.rotation.x = -0.3;
        hairGroup.add(knot, tail);
      }
    } else if (style === 'curly' || style === 'afro') {
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
      // Default: Neat layered fringe
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

  // ------------------------------------------------------------
  // 4. ARMS & CHIBI SPHERICAL HANDS
  // ------------------------------------------------------------
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.25, 0.64, 0);
  body.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.25, 0.64, 0);
  body.add(rightArm);

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

  // ------------------------------------------------------------
  // 5. LEGS & SHOES
  // ------------------------------------------------------------
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.11, 0.36, 0);
  body.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.11, 0.36, 0);
  body.add(rightLeg);

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
  // 6. MASTER-CRAFTED 3D ACCESSORY ENGINE (UPGRADED)
  // ------------------------------------------------------------
  const accGroup = new THREE.Group();
  body.add(accGroup);

  // References for dynamic animated accessories
  const animatedWings: Array<{ wing: THREE.Group; side: number }> = [];
  let haloMeshRef: THREE.Mesh | null = null;
  let propellerSpinRef: THREE.Mesh | null = null;

  const buildAccessory = (acc?: string | null, bp?: string | null) => {
    while (accGroup.children.length > 0) {
      accGroup.remove(accGroup.children[0]);
    }
    animatedWings.length = 0;
    haloMeshRef = null;
    propellerSpinRef = null;

    const accessoryKey = (acc || '').toLowerCase();
    const backpackKey = (bp || '').toLowerCase();

    // ----------------------------------------------------------
    // A. ANGEL WINGS (Layered Sculpted Feathers with Flutter)
    // ----------------------------------------------------------
    if (backpackKey === 'wings' || accessoryKey === 'wings') {
      const wingWhiteMat = mat('#FFFFFF', { roughness: 0.25, metalness: 0.1 });
      const wingSheenMat = mat('#F8FAFC', { roughness: 0.4, emissive: '#E2E8F0', emissiveIntensity: 0.25 });

      for (const s of [-1, 1]) {
        const wingPivot = new THREE.Group();
        wingPivot.position.set(s * 0.15, 0.56, -0.14);

        // Wing bone armature joint
        const joint = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), wingSheenMat);
        wingPivot.add(joint);

        // Tier 1: Primary flight feathers (long sweep)
        for (let i = 0; i < 4; i++) {
          const p = i / 3;
          const feather = new THREE.Mesh(
            new THREE.ConeGeometry(0.055 - p * 0.015, 0.42 - p * 0.08, 5).translate(0, 0.2, 0),
            wingWhiteMat
          );
          feather.position.set(s * (0.05 + p * 0.14), 0.05 + p * 0.16, -p * 0.05);
          feather.rotation.set(-0.25, s * 0.15, -s * (0.75 + p * 0.45));
          wingPivot.add(feather);
        }

        // Tier 2: Secondary coverts (fuller middle volume)
        for (let i = 0; i < 3; i++) {
          const p = i / 2;
          const covert = new THREE.Mesh(
            new THREE.ConeGeometry(0.05, 0.26, 4).translate(0, 0.12, 0),
            wingSheenMat
          );
          covert.position.set(s * (0.04 + p * 0.08), 0.02 + p * 0.1, -0.02);
          covert.rotation.set(-0.2, s * 0.1, -s * (0.55 + p * 0.35));
          wingPivot.add(covert);
        }

        accGroup.add(wingPivot);
        animatedWings.push({ wing: wingPivot, side: s });
      }
    }

    // ----------------------------------------------------------
    // B. FLOATING DIVINE HALO (Radiant Gold Core + Sparkle Starlets)
    // ----------------------------------------------------------
    if (accessoryKey === 'halo' || accessoryKey === 'acc_halo') {
      const haloGroup = new THREE.Group();
      haloGroup.position.set(0, 1.34, 0);

      const haloMat = mat('#FACC15', {
        metalness: 0.85,
        roughness: 0.15,
        emissive: '#EAB308',
        emissiveIntensity: 0.75,
      });

      const haloRing = new THREE.Mesh(new THREE.TorusGeometry(0.18, 0.024, 12, 32), haloMat);
      haloRing.rotation.x = Math.PI / 2;
      haloGroup.add(haloRing);
      haloMeshRef = haloRing;

      // 4 floating divine light starlets along circumference
      const gemMat = mat('#FEF08A', { emissive: '#FFFFFF', emissiveIntensity: 1.0 });
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.022), gemMat);
        star.position.set(Math.cos(a) * 0.18, 0, Math.sin(a) * 0.18);
        haloGroup.add(star);
      }

      accGroup.add(haloGroup);
    }

    // ----------------------------------------------------------
    // C. ANGLER TACKLE BOX (Marine Reinforced Case & Brass Latches)
    // ----------------------------------------------------------
    if (backpackKey === 'tackle_box' || accessoryKey === 'tackle_box') {
      const boxMat = mat('#0284C7', { roughness: 0.45, metalness: 0.25 });
      const darkRimMat = mat('#0369A1', { roughness: 0.6 });
      const brassMat = mat('#F59E0B', { metalness: 0.9, roughness: 0.2 });

      // Main box body
      const box = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.26, 0.14).translate(0, 0.52, -0.16), boxMat);
      // Molded bottom tray reinforcement
      const rim = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.04, 0.15).translate(0, 0.4, -0.16), darkRimMat);
      // Top lid edge
      const lid = new THREE.Mesh(new THREE.BoxGeometry(0.29, 0.03, 0.15).translate(0, 0.64, -0.16), darkRimMat);

      // Dual front flip brass latches
      for (const s of [-1, 1]) {
        const latch = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.05, 0.02).translate(s * 0.08, 0.58, -0.235),
          brassMat
        );
        accGroup.add(latch);
      }

      // Sturdy carrying handle
      const handle = new THREE.Mesh(
        new THREE.TorusGeometry(0.05, 0.012, 6, 12, Math.PI),
        mat('#0F172A', { roughness: 0.5 })
      );
      handle.position.set(0, 0.66, -0.16);
      handle.rotation.x = -Math.PI / 2;

      // Padded back harness straps
      for (const s of [-1, 1]) {
        const strap = new THREE.Mesh(
          new THREE.BoxGeometry(0.04, 0.28, 0.03).translate(s * 0.11, 0.54, -0.08),
          mat('#1E293B', { roughness: 0.8 })
        );
        accGroup.add(strap);
      }

      accGroup.add(box, rim, lid, handle);
    }

    // ----------------------------------------------------------
    // D. CANVAS TRAVEL BACKPACK (Zippers, Pockets & Drink Sleeve)
    // ----------------------------------------------------------
    else if (backpackKey === 'backpack' || accessoryKey === 'backpack') {
      const packMat = mat('#2563EB', { roughness: 0.65 });
      const pocketMat = mat('#1D4ED8', { roughness: 0.7 });
      const trimMat = mat('#F59E0B', { roughness: 0.5 });

      const pack = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.13).translate(0, 0.52, -0.16), packMat);
      // Front zipper pocket
      const pocket = new THREE.Mesh(
        new THREE.BoxGeometry(0.18, 0.14, 0.05).translate(0, 0.46, -0.24),
        pocketMat
      );
      // Leather patch diamond
      const patch = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.04, 0.01).translate(0, 0.58, -0.226), trimMat);
      patch.rotation.z = Math.PI / 4;

      // Side water bottle flask
      const bottle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, 0.12, 8).translate(0.135, 0.48, -0.16),
        mat('#10B981', { metalness: 0.5, roughness: 0.3 })
      );

      accGroup.add(pack, pocket, patch, bottle);
    }

    // ----------------------------------------------------------
    // E. TRADITIONAL CAPING / STRAW HAT (Indonesian Woven Bamboo)
    // ----------------------------------------------------------
    if (
      accessoryKey === 'caping' ||
      accessoryKey === 'straw_hat' ||
      accessoryKey === 'acc_straw' ||
      accessoryKey === 'acc_caping'
    ) {
      const bambooConeMat = mat('#EAB308', { roughness: 0.82 });
      const trimDarkMat = mat('#A16207', { roughness: 0.9 });

      // Wide elegant conical cone
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.38, 0.16, 20), bambooConeMat);
      cone.position.set(0, 1.18, 0);

      // Woven outer rim edge
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.385, 0.385, 0.022, 20), trimDarkMat);
      brim.position.set(0, 1.1, 0);

      // Apex crown knot
      const apexKnot = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 8), trimDarkMat);
      apexKnot.position.set(0, 1.27, 0);

      // Chin strap
      const strap = new THREE.Mesh(
        new THREE.TorusGeometry(0.16, 0.008, 4, 16, Math.PI),
        mat('#78350F', { roughness: 0.8 })
      );
      strap.position.set(0, 0.94, 0.02);
      strap.rotation.x = Math.PI;

      accGroup.add(cone, brim, apexKnot, strap);
    }

    // ----------------------------------------------------------
    // F. SAFARI RANGER EXPLORER HAT (Curved Brim & Stitched Band)
    // ----------------------------------------------------------
    else if (
      accessoryKey === 'safari_hat' ||
      accessoryKey === 'topi_rimba' ||
      accessoryKey === 'acc_safari'
    ) {
      const safariMat = mat('#85754E', { roughness: 0.78 });
      const leatherBandMat = mat('#524426', { roughness: 0.7 });
      const badgeMat = mat('#F59E0B', { metalness: 0.85, roughness: 0.25 });

      // Indented crown
      const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.26, 0.13, 16), safariMat);
      crown.position.set(0, 1.19, 0);

      // Stitched leather band
      const band = new THREE.Mesh(new THREE.CylinderGeometry(0.264, 0.264, 0.04, 16), leatherBandMat);
      band.position.set(0, 1.14, 0);

      // Wide safari sun-shield brim
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.024, 20), safariMat);
      brim.position.set(0, 1.12, 0);

      // Ranger expedition badge
      const badge = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.01, 8), badgeMat);
      badge.rotation.x = Math.PI / 2;
      badge.position.set(0, 1.15, 0.268);

      accGroup.add(crown, band, brim, badge);
    }

    // ----------------------------------------------------------
    // G. IMPERIAL GOLDEN CROWN (Fleur Tines, Ruby & Sapphire Jewels)
    // ----------------------------------------------------------
    else if (accessoryKey === 'crown' || accessoryKey === 'acc_crown') {
      const goldMat = mat('#F59E0B', { metalness: 0.9, roughness: 0.18 });
      const rubyMat = mat('#EF4444', { roughness: 0.15, emissive: '#B91C1C', emissiveIntensity: 0.4 });
      const sapphireMat = mat('#3B82F6', { roughness: 0.15, emissive: '#1D4ED8', emissiveIntensity: 0.4 });

      // Crown base circlet
      const circlet = new THREE.Mesh(new THREE.CylinderGeometry(0.23, 0.22, 0.07, 16, 1, true), goldMat);
      circlet.position.set(0, 1.18, 0);

      // 5 Sculpted imperial crown tines
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        const tine = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.12, 4), goldMat);
        tine.position.set(Math.cos(a) * 0.22, 1.25, Math.sin(a) * 0.22);
        const jewelSphere = new THREE.Mesh(new THREE.SphereGeometry(0.02, 6, 6), goldMat);
        jewelSphere.position.set(Math.cos(a) * 0.22, 1.31, Math.sin(a) * 0.22);
        accGroup.add(tine, jewelSphere);
      }

      // Center ruby and flanking sapphires
      const centerRuby = new THREE.Mesh(new THREE.OctahedronGeometry(0.035), rubyMat);
      centerRuby.position.set(0, 1.18, 0.23);
      const leftSapphire = new THREE.Mesh(new THREE.OctahedronGeometry(0.026), sapphireMat);
      leftSapphire.position.set(-0.13, 1.18, 0.19);
      const rightSapphire = new THREE.Mesh(new THREE.OctahedronGeometry(0.026), sapphireMat);
      rightSapphire.position.set(0.13, 1.18, 0.19);

      accGroup.add(circlet, centerRuby, leftSapphire, rightSapphire);
    }

    // ----------------------------------------------------------
    // H. RGB CAT EAR GAMER HEADSET (Padded Ear Cups + Mic)
    // ----------------------------------------------------------
    else if (accessoryKey === 'cat_ears' || accessoryKey === 'acc_cat') {
      const chassisMat = mat('#1E293B', { roughness: 0.5 });
      const rgbPinkMat = mat('#EC4899', {
        roughness: 0.2,
        emissive: '#DB2777',
        emissiveIntensity: 0.8,
      });

      // Cushioned headband arch
      const band = new THREE.Mesh(
        new THREE.TorusGeometry(0.24, 0.02, 8, 20, Math.PI),
        chassisMat
      );
      band.position.set(0, 1.02, 0);

      // Padded side ear cups
      for (const s of [-1, 1]) {
        const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 12), chassisMat);
        cup.rotation.z = Math.PI / 2;
        cup.position.set(s * 0.25, 0.94, 0);
        const cushion = new THREE.Mesh(new THREE.TorusGeometry(0.06, 0.015, 6, 12), mat('#0F172A', { roughness: 0.8 }));
        cushion.rotation.y = Math.PI / 2;
        cushion.position.set(s * 0.24, 0.94, 0);

        // Glowing RGB cat ear peak
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.14, 4), rgbPinkMat);
        ear.position.set(s * 0.14, 1.25, 0);
        ear.rotation.set(0, 0, -s * 0.35);

        accGroup.add(cup, cushion, ear);
      }

      // Curved boom microphone with LED indicator
      const micArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.16, 6).translate(0, 0.08, 0),
        chassisMat
      );
      micArm.position.set(-0.24, 0.92, 0.05);
      micArm.rotation.set(0.6, 0, 0.3);
      const micTip = new THREE.Mesh(
        new THREE.SphereGeometry(0.016, 6, 6),
        mat('#06B6D4', { emissive: '#06B6D4', emissiveIntensity: 0.9 })
      );
      micTip.position.set(-0.16, 0.82, 0.18);

      accGroup.add(band, micArm, micTip);
    }

    // ----------------------------------------------------------
    // I. SCUBA DIVING MASK & SNORKEL (Glass Lenses & Purge Tube)
    // ----------------------------------------------------------
    else if (accessoryKey === 'snorkel' || accessoryKey === 'acc_snorkel') {
      const frameMat = mat('#0891B2', { metalness: 0.4, roughness: 0.3 });
      const glassMat = mat('#67E8F9', {
        roughness: 0.05,
        transparent: true,
        opacity: 0.65,
        metalness: 0.2,
      });

      // Contoured dual-lens frame
      const mask = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.09, 0.04), frameMat);
      mask.position.set(0, 0.96, 0.24);

      // Tempered glass lens plate
      const glass = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.07, 0.01), glassMat);
      glass.position.set(0, 0.96, 0.262);

      // Curved breathing tube
      const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.34, 8), mat('#FACC15', { roughness: 0.4 }));
      tube.position.set(0.16, 1.06, 0.15);
      tube.rotation.z = -0.15;

      // Orange splash guard cap
      const guard = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 8), mat('#EA580C'));
      guard.position.set(0.18, 1.23, 0.15);

      // Silicone head strap
      const strap = new THREE.Mesh(
        new THREE.TorusGeometry(0.24, 0.01, 4, 16, Math.PI),
        mat('#0891B2', { roughness: 0.6 })
      );
      strap.position.set(0, 0.96, 0);
      strap.rotation.x = Math.PI / 2;

      accGroup.add(mask, glass, tube, guard, strap);
    }

    // ----------------------------------------------------------
    // J. COOL SPECTACLES / GLASSES (Gold Wireframes & Clear Glint)
    // ----------------------------------------------------------
    else if (accessoryKey === 'glasses' || accessoryKey === 'acc_glasses') {
      for (const s of [-1, 1]) {
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.011, 8, 20), accessoryMat);
        rim.position.set(s * 0.088, 0.96, 0.23);
        const lens = new THREE.Mesh(
          new THREE.CircleGeometry(0.048, 16),
          mat('#E0F2FE', { transparent: true, opacity: 0.35, roughness: 0.1 })
        );
        lens.position.set(s * 0.088, 0.96, 0.23);
        accGroup.add(rim, lens);
      }
      const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.05, 4).rotateZ(Math.PI / 2), accessoryMat);
      bridge.position.set(0, 0.96, 0.235);
      accGroup.add(bridge);
    }

    // ----------------------------------------------------------
    // K. PROPELLER BEANIE HAT (Fun Spinning Cap)
    // ----------------------------------------------------------
    else if (accessoryKey === 'propeller' || accessoryKey === 'propeller_hat') {
      const capMat = mat('#3B82F6', { roughness: 0.6 });
      const cap = new THREE.Mesh(new THREE.SphereGeometry(0.255, 16, 10, 0, Math.PI * 2, 0, Math.PI * 0.45), capMat);
      cap.position.set(0, 1.06, 0);

      const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 6), mat('#94A3B8', { metalness: 0.8 }));
      shaft.position.set(0, 1.25, 0);

      const blade = new THREE.Mesh(
        new THREE.BoxGeometry(0.22, 0.012, 0.035),
        mat('#EF4444', { roughness: 0.4 })
      );
      blade.position.set(0, 1.29, 0);
      propellerSpinRef = blade;

      accGroup.add(cap, shaft, blade);
    }
  };

  buildAccessory(initialColors.accessory, initialColors.backpack);

  // ------------------------------------------------------------
  // 7. PUBLIC API & ANIMATION LOOP
  // ------------------------------------------------------------
  const updateColors = (newColors: CitizenAvatarColors) => {
    if (newColors.skin) skinMat.color.set(newColors.skin);
    if (newColors.hair) hairMat.color.set(newColors.hair);
    if (newColors.shirt) shirtMat.color.set(newColors.shirt);
    if (newColors.pants) pantsMat.color.set(newColors.pants);
    if (newColors.shoes) shoesMat.color.set(newColors.shoes);

    if (newColors.hairStyle) {
      buildHair(newColors.hairStyle);
    }
    buildAccessory(newColors.accessory, newColors.backpack);
  };

  const pose = (isMoving: boolean, elapsed: number, speedMultiplier = 5.2) => {
    const isArmManuallyControlled = rightArm.children.length > 0 || Math.abs(rightArm.rotation.x) > 0.05;

    // A. Body hop, breathing and walking cycles
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

    // B. Animate Angel Wings Flutter
    if (animatedWings.length > 0) {
      const flapSpeed = isMoving ? 14 : 3.5;
      const flapAmp = isMoving ? 0.35 : 0.12;
      const flap = Math.sin(elapsed * flapSpeed) * flapAmp;

      for (const { wing, side } of animatedWings) {
        wing.rotation.y = side * (0.35 + flap);
        wing.rotation.z = side * (0.15 + flap * 0.5);
      }
    }

    // C. Animate Divine Halo Gentle Float & Orbit
    if (haloMeshRef) {
      haloMeshRef.position.y = Math.sin(elapsed * 2.5) * 0.025;
      haloMeshRef.rotation.z = Math.sin(elapsed * 1.5) * 0.08;
    }

    // D. Animate Propeller Cap Spin
    if (propellerSpinRef) {
      propellerSpinRef.rotation.y = elapsed * (isMoving ? 30 : 6);
    }
  };

  const playAction = (actionName: string) => {
    // Soccer kick animation for penalty shots in stadium
    if (actionName === 'Kick_Right' || actionName === 'kick') {
      rightLeg.rotation.x = -1.25;
      setTimeout(() => {
        rightLeg.rotation.x = 0.85;
      }, 120);
      setTimeout(() => {
        rightLeg.rotation.x = 0;
      }, 350);
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
  };
}

// ============================================================
// PAK MAYOR NPC CREATOR (Balai Kota / Alun-Alun Tugu)
// Iconic Chibi Mayoral Capsule with Blue Suit, Sash & Top Hat
// ============================================================
export function createPakMayorNPC(
  scene: THREE.Scene | THREE.Group,
  position: THREE.Vector3
): PakMayorNPCInstance {
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);

  // 1. Mayoral Blue Suit Coat
  const bm = mat(PAL.mayor, { roughness: 0.45, flatShading: false });
  const cap = new THREE.Mesh(new THREE.CapsuleGeometry(0.27, 0.48, 8, 20), bm);
  cap.position.y = 0.52;
  cap.castShadow = false;
  body.add(cap);

  // White inner shirt & gold collar
  const shirtInner = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.22, 0.05).translate(0, 0.65, 0.25),
    mat('#FFFFFF', { roughness: 0.7 })
  );
  body.add(shirtInner);

  // Ceremonial Sash
  const sash = new THREE.Mesh(
    new THREE.TorusGeometry(0.275, 0.035, 6, 28),
    mat('#F5E3B8', { flatShading: false })
  );
  sash.position.y = 0.5;
  sash.rotation.set(Math.PI / 2 + 0.55, 0, 0);
  body.add(sash);

  // Golden Medal Badge
  const badge = new THREE.Mesh(
    new THREE.CylinderGeometry(0.05, 0.05, 0.02, 12),
    mat(PAL.gold, { metalness: 0.7, roughness: 0.3, flatShading: false })
  );
  badge.rotation.x = Math.PI / 2;
  badge.position.set(0.1, 0.56, 0.262);
  body.add(badge);

  // 2. Arms & Sleeves
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.25, 0.64, 0);
  body.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.25, 0.64, 0);
  body.add(rightArm);

  const skinMat = mat('#F5D0B0');
  const whiteMat = mat('#FFFFFF');

  [leftArm, rightArm].forEach((arm) => {
    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.06, 0.18, 8).translate(0, -0.09, 0),
      bm
    );
    sleeve.castShadow = false;
    arm.add(sleeve);

    const cuff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.04, 8).translate(0, -0.19, 0),
      whiteMat
    );
    arm.add(cuff);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), skinMat);
    hand.position.y = -0.24;
    arm.add(hand);
  });

  // 3. Legs & Polished Shoes
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.11, 0.36, 0);
  body.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.11, 0.36, 0);
  body.add(rightLeg);

  const pantsMat = mat('#1E293B');
  const shoeMat = mat('#0F172A', { roughness: 0.4, metalness: 0.2 });

  [leftLeg, rightLeg].forEach((leg) => {
    const pantMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.07, 0.28, 8).translate(0, -0.14, 0),
      pantsMat
    );
    pantMesh.castShadow = false;
    leg.add(pantMesh);

    const shoe = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.09, 0.2).translate(0, -0.32, 0.03),
      shoeMat
    );
    shoe.castShadow = false;
    leg.add(shoe);
  });

  // 4. Head, Spectacles & Hat
  const head = new THREE.Group();
  head.position.y = 0.82;
  body.add(head);

  const eyeM = mat('#2C2A33', { flatShading: false, roughness: 0.3 });
  const goldM = mat(PAL.gold, { metalness: 0.85, roughness: 0.22, flatShading: false });

  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), eyeM);
    e.position.set(s * 0.095, 0.02, 0.255);
    e.scale.z = 0.5;
    head.add(e);

    const r = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.014, 8, 24), goldM);
    r.position.set(s * 0.095, 0.02, 0.282);
    head.add(r);
  }

  const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.05, 6), goldM);
  bridge.rotation.z = Math.PI / 2;
  bridge.position.set(0, 0.03, 0.285);
  head.add(bridge);

  const cheeks = mat('#F3A6A0', { flatShading: false, transparent: true, opacity: 0.55 });
  for (const s of [-1, 1]) {
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.04, 10, 8), cheeks);
    c.position.set(s * 0.17, -0.07, 0.225);
    c.scale.set(1, 0.6, 0.35);
    head.add(c);
  }

  const hat = new THREE.Group();
  hat.position.y = 0.31;
  head.add(hat);

  const hm = mat(PAL.hat, { roughness: 0.6, flatShading: false });
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.03, 28), hm);
  hat.add(brim);

  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.21, 0.34, 28), hm);
  crown.position.y = 0.18;
  hat.add(crown);

  const band = new THREE.Mesh(
    new THREE.CylinderGeometry(0.213, 0.213, 0.06, 28),
    mat(PAL.hatBand, { flatShading: false })
  );
  band.position.y = 0.06;
  hat.add(band);

  root.position.copy(position);
  scene.add(root);

  const pose = (isMoving: boolean, elapsed: number, speedMultiplier = 4.2) => {
    if (isMoving) {
      const walkCycle = Math.sin(elapsed * speedMultiplier);
      const hop = Math.abs(Math.sin(elapsed * speedMultiplier)) * 0.035;
      const lean = Math.sin(elapsed * speedMultiplier) * 0.025;

      body.position.y = hop;
      body.rotation.z = lean;

      leftArm.rotation.x = -walkCycle * 0.38;
      rightArm.rotation.x = walkCycle * 0.38;

      leftLeg.rotation.x = walkCycle * 0.44;
      rightLeg.rotation.x = -walkCycle * 0.44;

      head.rotation.y = Math.sin(elapsed * speedMultiplier * 0.5) * 0.04;
    } else {
      const breath = Math.sin(elapsed * 2.0) * 0.012;
      body.position.y = breath;
      body.rotation.z = 0;

      leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0, 0.35);
      rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0, 0.35);
      leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0, 0.35);
      rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0, 0.35);
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
