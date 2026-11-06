// ============================================================
// NETIZENCITY 3D - Modular Citizen & NPC Avatar Engine
// Generates stylized 3D characters with hair, clothes & accessories
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
  const blushMat = mat('#F472B6', { transparent: true, opacity: 0.55 });
  const accessoryMat = mat('#F59E0B', { metalness: 0.6, roughness: 0.3 });

  // 1. Torso / Shirt
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

  // 2. Head & Face
  const head = new THREE.Group();
  head.position.y = 0.94;
  body.add(head);

  const headGeo = new THREE.SphereGeometry(0.24, 16, 14);
  const headMesh = new THREE.Mesh(headGeo, skinMat);
  headMesh.castShadow = false;
  headMesh.receiveShadow = false;
  head.add(headMesh);

  // Eyes (Chibi style with cute glint)
  for (const s of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.032, 10, 8), eyesMat);
    eye.position.set(s * 0.085, 0.02, 0.22);
    eye.scale.set(1, 1.25, 0.4);
    head.add(eye);

    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.01, 6, 6), glintMat);
    glint.position.set(s * 0.085 + 0.01, 0.035, 0.23);
    head.add(glint);

    // Blushing cheeks
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.035, 8, 6), blushMat);
    blush.position.set(s * 0.15, -0.06, 0.185);
    blush.scale.set(1, 0.5, 0.3);
    head.add(blush);
  }

  // Cute nose
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.018, 6, 6), skinMat);
  nose.position.set(0, -0.01, 0.24);
  head.add(nose);

  // 3. Hair Group (Rebuildable for different styles)
  const hairGroup = new THREE.Group();
  head.add(hairGroup);

  const buildHair = (style: string) => {
    // Clear previous hair
    while (hairGroup.children.length > 0) {
      hairGroup.remove(hairGroup.children[0]);
    }

    // Base skullcap
    const baseCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.252, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.56),
      hairMat
    );
    baseCap.castShadow = false;
    hairGroup.add(baseCap);

    if (style === 'spiky') {
      // Anime spiky locks
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 1.8 - 0.9;
        const spike = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.18, 5), hairMat);
        spike.position.set(Math.sin(a) * 0.18, 0.22 + Math.cos(a) * 0.04, Math.cos(a) * 0.16);
        spike.rotation.set(0.3, a * 0.5, -a * 0.4);
        spike.castShadow = false;
        hairGroup.add(spike);
      }
    } else if (style === 'long') {
      // Long hair back & sides
      const backHair = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.42, 0.1).translate(0, -0.16, -0.16),
        hairMat
      );
      backHair.castShadow = false;
      hairGroup.add(backHair);

      for (const s of [-1, 1]) {
        const sideLock = new THREE.Mesh(
          new THREE.BoxGeometry(0.08, 0.32, 0.1).translate(s * 0.2, -0.12, 0.06),
          hairMat
        );
        sideLock.castShadow = false;
        hairGroup.add(sideLock);
      }
    } else if (style === 'curly') {
      // Puffy afro/curly clusters
      for (let i = 0; i < 14; i++) {
        const a = (i / 14) * Math.PI * 2;
        const puff = new THREE.Mesh(new THREE.SphereGeometry(0.08, 8, 8), hairMat);
        puff.position.set(Math.cos(a) * 0.2, 0.15 + (i % 2) * 0.06, Math.sin(a) * 0.18);
        hairGroup.add(puff);
      }
    } else if (style === 'bob') {
      // Bob cut / helmet fringe
      const bob = new THREE.Mesh(
        new THREE.CylinderGeometry(0.27, 0.29, 0.24, 16, 1, true, -Math.PI * 0.75, Math.PI * 1.5),
        hairMat
      );
      bob.position.y = -0.04;
      hairGroup.add(bob);
    } else {
      // Default: Short neat hair with front fringe
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

  // 4. Arms & Hands
  const leftArm = new THREE.Group();
  leftArm.position.set(-0.25, 0.64, 0);
  body.add(leftArm);

  const rightArm = new THREE.Group();
  rightArm.position.set(0.25, 0.64, 0);
  body.add(rightArm);

  [leftArm, rightArm].forEach((arm) => {
    // Upper arm sleeve
    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.06, 0.18, 8).translate(0, -0.09, 0),
      shirtMat
    );
    sleeve.castShadow = false;
    arm.add(sleeve);

    // Forearm skin
    const armSkin = new THREE.Mesh(
      new THREE.CylinderGeometry(0.05, 0.045, 0.16, 8).translate(0, -0.22, 0),
      skinMat
    );
    arm.add(armSkin);

    // Hand
    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.055, 8, 8), skinMat);
    hand.position.y = -0.32;
    arm.add(hand);
  });

  // 5. Legs & Shoes
  const leftLeg = new THREE.Group();
  leftLeg.position.set(-0.11, 0.36, 0);
  body.add(leftLeg);

  const rightLeg = new THREE.Group();
  rightLeg.position.set(0.11, 0.36, 0);
  body.add(rightLeg);

  [leftLeg, rightLeg].forEach((leg) => {
    // Pants leg
    const pantMesh = new THREE.Mesh(
      new THREE.CylinderGeometry(0.075, 0.07, 0.28, 8).translate(0, -0.14, 0),
      pantsMat
    );
    pantMesh.castShadow = false;
    leg.add(pantMesh);

    // Shoe
    const shoe = new THREE.Mesh(
      new THREE.BoxGeometry(0.12, 0.09, 0.2).translate(0, -0.32, 0.03),
      shoesMat
    );
    shoe.castShadow = false;
    leg.add(shoe);
  });

  // 6. Accessories / Backpacks
  const accGroup = new THREE.Group();
  body.add(accGroup);

  const buildAccessory = (acc?: string | null, bp?: string | null) => {
    while (accGroup.children.length > 0) {
      accGroup.remove(accGroup.children[0]);
    }

    if (bp === 'wings' || acc === 'wings') {
      // Angel wings
      for (const s of [-1, 1]) {
        const wing = new THREE.Mesh(
          new THREE.ConeGeometry(0.12, 0.45, 4).translate(0, 0.22, 0),
          mat('#FFFFFF', { roughness: 0.3 })
        );
        wing.position.set(s * 0.16, 0.58, -0.16);
        wing.rotation.set(-0.3, 0, -s * 0.8);
        accGroup.add(wing);
      }
    } else if (bp || acc === 'backpack') {
      // Cute backpack
      const pack = new THREE.Mesh(
        new THREE.BoxGeometry(0.24, 0.26, 0.12).translate(0, 0.52, -0.16),
        mat('#3B82F6', { roughness: 0.6 })
      );
      pack.castShadow = false;
      accGroup.add(pack);
    }

    if (acc === 'glasses') {
      // Stylish spectacles
      for (const s of [-1, 1]) {
        const rim = new THREE.Mesh(new THREE.TorusGeometry(0.048, 0.012, 6, 16), accessoryMat);
        rim.position.set(s * 0.085, 0.96, 0.23);
        accGroup.add(rim);
      }
      const bridge = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.05, 4).rotateZ(Math.PI / 2),
        accessoryMat
      );
      bridge.position.set(0, 0.96, 0.235);
      accGroup.add(bridge);
    }
  };

  buildAccessory(initialColors.accessory, initialColors.backpack);

  // Update colors dynamically
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

  // Walk and idle animation (natural human walking pace ~5.2 rad/s)
  const pose = (isMoving: boolean, elapsed: number, speedMultiplier = 5.2) => {
    if (isMoving) {
      const walkCycle = Math.sin(elapsed * speedMultiplier);
      const hop = Math.abs(Math.sin(elapsed * speedMultiplier)) * 0.04;
      const lean = Math.sin(elapsed * speedMultiplier) * 0.03;

      body.position.y = hop;
      body.rotation.z = lean;

      // Arms & legs swing in opposition naturally
      leftArm.rotation.x = -walkCycle * 0.42;
      rightArm.rotation.x = walkCycle * 0.42;

      leftLeg.rotation.x = walkCycle * 0.48;
      rightLeg.rotation.x = -walkCycle * 0.48;

      head.rotation.y = Math.sin(elapsed * speedMultiplier * 0.5) * 0.05;
    } else {
      // Gentle breathing idle
      const breath = Math.sin(elapsed * 2.0) * 0.012;
      body.position.y = breath;
      body.rotation.z = 0;

      leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0, 0.15);
      rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0, 0.15);
      leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0, 0.15);
      rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0, 0.15);
      head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, 0, 0.1);
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
  };
}

// ============================================================
// ============================================================
// PAK MAYOR NPC CREATOR (Balai Kota / Alun-Alun Tugu)
// ============================================================
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

export function createPakMayorNPC(scene: THREE.Scene | THREE.Group, position: THREE.Vector3): PakMayorNPCInstance {
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
    // Suit sleeve
    const sleeve = new THREE.Mesh(
      new THREE.CylinderGeometry(0.065, 0.06, 0.18, 8).translate(0, -0.09, 0),
      bm
    );
    sleeve.castShadow = false;
    arm.add(sleeve);

    // White cuff
    const cuff = new THREE.Mesh(
      new THREE.CylinderGeometry(0.055, 0.055, 0.04, 8).translate(0, -0.19, 0),
      whiteMat
    );
    arm.add(cuff);

    // Hand
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

      // Arms & legs swing in opposition naturally
      leftArm.rotation.x = -walkCycle * 0.38;
      rightArm.rotation.x = walkCycle * 0.38;

      leftLeg.rotation.x = walkCycle * 0.44;
      rightLeg.rotation.x = -walkCycle * 0.44;

      head.rotation.y = Math.sin(elapsed * speedMultiplier * 0.5) * 0.04;
    } else {
      // Dignified breathing and occasional greeting head nod
      const breath = Math.sin(elapsed * 2.0) * 0.012;
      body.position.y = breath;
      body.rotation.z = 0;

      leftArm.rotation.x = THREE.MathUtils.lerp(leftArm.rotation.x, 0, 0.15);
      rightArm.rotation.x = THREE.MathUtils.lerp(rightArm.rotation.x, 0, 0.15);
      leftLeg.rotation.x = THREE.MathUtils.lerp(leftLeg.rotation.x, 0, 0.15);
      rightLeg.rotation.x = THREE.MathUtils.lerp(rightLeg.rotation.x, 0, 0.15);
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
