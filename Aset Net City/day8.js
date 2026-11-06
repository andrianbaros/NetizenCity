// Day 8: Festival 50K. @sidddiq_s's Laboratorium Netizen City in the new Distrik Riset (north-east), built before Day 8 and never
// spilled by the Mayor: a cream and lavender dome with a giant powder-blue telescope on top, antennas, a dish, glass tubes of mint liquid
// piped to tanks, a little chimney and a "LAB NETIZEN CITY" sign. The Professor (milk-white capsule, an oversized lab coat with mint
// trim, big round goggles that sit crooked, pastel soot). The fireworks rockets (the giant burnt one "UNTUK FESTIVAL", the right-sized
// one with its big button). The festival's temporary dressing: bazaar tents (food, clothes, toys), the banner, the stage, pastel bunting
// and lanterns between the street lamps, balloons, the sack race. Pastel smoke, fireworks over the Monument, sky lanterns, birds.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry, clamp, lerp, seg, back, eo, eio, hash } from '/core/lib.js';
import { PAL, signTex } from './world.js';
import { makePlaster } from './nature.js';

const TAU = Math.PI * 2;
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .78, metalness: 0, flatShading: true, ...o });
const sh = m => { m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return m; };
const M4 = new THREE.Matrix4(), QQ = new THREE.Quaternion(), EE = new THREE.Euler(), PV = new THREE.Vector3(), SV = new THREE.Vector3();
const setM = (m, i, x, y, z, ry, s, rx = 0, rz = 0) => { QQ.setFromEuler(EE.set(rx, ry, rz, 'YXZ')); m.setMatrixAt(i, M4.compose(PV.set(x, y, z), QQ, typeof s === 'number' ? SV.set(s, s, s) : SV.set(...s))); };
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
const blobTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), R = mulberry(5);
  for (let i = 0; i < 9; i++) { const cx = 64 + (R() - .5) * 40, cy = 64 + (R() - .5) * 40, r = 26 + R() * 30, g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128); }
  const t = new THREE.CanvasTexture(c); return t; })();
export const SMOKE = ['#C9B8E8', '#F2B8C6', '#E3D3F2', '#F6CFE0', '#D8CCEE'];

// ---------- the lab: Distrik Riset, at the north end of the x = 96 street; the door looks south down the access road ----------
export const LAB = { x: 96, z: -80, r: 7.5 };
LAB.front = LAB.z + LAB.r + 2.8;                                                // the vestibule's door plane (world z)
LAB.door = new THREE.Vector3(LAB.x, 0, LAB.front);
LAB.rocket = new THREE.Vector3(LAB.x + 3.6, 0, LAB.front + 1.1);                 // where the burnt rocket stands, right of the door
function labSign() {
  const s = signTex((x, v, w, h) => { x.fillStyle = '#FFF9F1'; x.fillRect(0, 0, w, h); x.strokeStyle = '#A9C8EC'; x.lineWidth = 16; x.strokeRect(8, 8, w - 16, h - 16);
    x.fillStyle = '#7A5BB0'; x.font = `${Math.round(h * .52)}px "Lilita One"`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('LAB NETIZEN CITY', w / 2, h / 2 + 5);
    x.fillStyle = '#8FC9B4'; for (const sx of [70, w - 70]) { x.beginPath(); x.arc(sx, h / 2, 22, 0, 7); x.fill(); } }, 1024, 200); s.set(1);
  const m = new THREE.MeshStandardMaterial({ map: s.t, roughness: .6, emissiveMap: s.t, emissive: '#FFFFFF', emissiveIntensity: 0 }), side = mat('#A9C8EC');
  return { mesh: new THREE.Mesh(new THREE.BoxGeometry(5.4, 1.05, .16), [side, side, side, side, m, side]), m };
}
export function makeLab() {
  const root = new THREE.Group(); root.position.set(LAB.x, 0, LAB.z);
  const cream = mat('#F7ECD6'), lav = mat('#C9B8E8', { roughness: .6 }), lavD = mat('#B6A4D8'), powder = mat('#A9C8EC', { roughness: .55 }), dark = mat('#4A4650'),
    white = mat('#FBF8F2'), coral = mat('#F2A88A'), mintM = mat('#A8DCC8');
  const winM = mat('#9FD0E8', { roughness: .25, emissive: '#FFCB7A', emissiveIntensity: 0 });
  const add = (geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); root.add(o); return o; };
  const R = LAB.r;
  add(new THREE.CylinderGeometry(R + .7, R + .9, .3, 48), mat('#E6DED0'), 0, .15, 0);                     // plinth
  add(new THREE.CylinderGeometry(R, R, 3.3, 48), cream, 0, .3 + 1.65, 0);                                // the drum
  add(new THREE.CylinderGeometry(R + .06, R + .06, .35, 48), lavD, 0, 3.55, 0);                          // a lavender band under the dome
  add(new THREE.SphereGeometry(R, 48, 20, 0, TAU, 0, Math.PI / 2), lav, 0, 3.6, 0);                      // the dome
  for (let i = 0; i < 12; i++) {                                                                          // round portholes all round, not at the door
    const a = (i + .5) / 12 * TAU; if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a))) < .45) continue;
    const w = add(new THREE.CylinderGeometry(.48, .48, .12, 20), winM, Math.sin(a) * (R + .02), 2.2, Math.cos(a) * (R + .02)); w.rotation.set(Math.PI / 2, a, 0, 'YXZ');
    const rim = add(new THREE.TorusGeometry(.5, .06, 6, 20), white, Math.sin(a) * (R + .06), 2.2, Math.cos(a) * (R + .06)); rim.rotation.y = a; }
  // the vestibule: a frame round a deep dark doorway, two door leaves that swing in
  const vz = R + 1.4;
  add(new THREE.BoxGeometry(.9, 3.9, 2.8), cream, -1.95, 1.95, vz); add(new THREE.BoxGeometry(.9, 3.9, 2.8), cream, 1.95, 1.95, vz);
  add(new THREE.BoxGeometry(3.0, .3, 2.8), mat('#E6DED0'), 0, .15, vz);                                       // the doorway's floor
  add(new THREE.BoxGeometry(4.8, .9, 2.8), cream, 0, .3 + 3.15, vz);
  add(new THREE.BoxGeometry(5.0, .14, 3.0), lavD, 0, .3 + 3.66, vz);
  const recess = add(new THREE.BoxGeometry(3.0, 2.7, .1), new THREE.MeshStandardMaterial({ color: '#2E2836', roughness: 1, emissive: '#B79BD8', emissiveIntensity: .15 }), 0, .3 + 1.35, vz - 1.2);
  add(new THREE.BoxGeometry(3.0, .1, 2.6), dark, 0, .3 + 2.72, vz - .1);
  const doors = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * 1.5, .3, vz + 1.38); root.add(g);
    const leaf = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.7, .1).translate(-s * .75, 1.35, 0), mat('#D8CCEE', { roughness: .5 })); g.add(leaf);
    const pane = new THREE.Mesh(new THREE.CircleGeometry(.28, 18), winM); pane.position.set(-s * .75, 1.85, .06); g.add(pane);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(.06, 8, 6), mat('#D9A877', { metalness: .5, roughness: .4 })); knob.position.set(-s * 1.3, 1.25, .08); g.add(knob);
    for (const y of [.5, 2.2]) { const b = new THREE.Mesh(new THREE.BoxGeometry(1.45, .06, .03), mat('#B6A4D8')); b.position.set(-s * .75, y, .06); g.add(b); }
    return g; });
  add(new THREE.BoxGeometry(3.4, .2, 1.4), mat('#E6DED0'), 0, .1, vz + 2.1);                             // the step out of the door
  const sign = labSign(); sign.mesh.position.set(0, .3 + 4.3, vz + 1.2); root.add(sign.mesh);
  for (const s of [-1, 1]) add(new THREE.CylinderGeometry(.05, .05, .7, 6), white, s * 2.2, .3 + 3.85, vz + 1.2);
  // the telescope on the crown of the dome: a turret, a fork and a long powder-blue tube aimed at the sky
  const scope = new THREE.Group(); scope.position.set(0, 3.6 + R * .97, -.4); root.add(scope);
  scope.add(new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.7, .9, 24).translate(0, .45, 0), powder));
  for (const s of [-1, 1]) scope.add(new THREE.Mesh(new THREE.BoxGeometry(.25, 1.6, .5).translate(s * .95, 1.6, 0), white));
  const tilt = new THREE.Group(); tilt.position.y = 2.1; tilt.rotation.x = -.78; scope.add(tilt);
  tilt.add(new THREE.Mesh(new THREE.CylinderGeometry(.62, .78, 6.6, 24).rotateX(Math.PI / 2).translate(0, 0, -1.2), powder));
  tilt.add(new THREE.Mesh(new THREE.TorusGeometry(.66, .1, 8, 24).translate(0, 0, 0), white).translateZ(-4.5));
  tilt.add(new THREE.Mesh(new THREE.CylinderGeometry(.6, .6, .1, 24).rotateX(Math.PI / 2), mat('#2E2836')).translateZ(-4.53));
  tilt.add(new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, 1.6, 10).rotateX(Math.PI / 2), white).translateX(.8).translateZ(.6));
  for (const z of [-3.2, -.2, 1.6]) tilt.add(new THREE.Mesh(new THREE.TorusGeometry(.8, .07, 6, 24), white).translateZ(z));
  // antennas with little lights on the dome's shoulder
  const beacons = [];
  [[-.9, 4.0], [-1.25, 2.6], [1.15, 3.2]].forEach(([a, hgt]) => { const x = Math.sin(a) * R * .62, z = Math.cos(a) * R * .62 - 1.0, y = 3.6 + R * .78;
    add(new THREE.CylinderGeometry(.06, .08, hgt, 6), white, x, y + hgt / 2, z);
    for (let k = 1; k < 4; k++) add(new THREE.BoxGeometry(.7 - k * .15, .04, .04), white, x, y + hgt * k / 4, z);
    beacons.push(add(new THREE.SphereGeometry(.13, 8, 6), mat('#F2737B', { emissive: '#F2737B', emissiveIntensity: .2 }), x, y + hgt + .1, z)); });
  // the annex on the east side: the dish on its roof, the little chimney
  add(new THREE.BoxGeometry(4.4, 2.8, 5.4), cream, R + 1.2, .3 + 1.4, -1.2); add(new THREE.BoxGeometry(4.7, .18, 5.7), lavD, R + 1.2, .3 + 2.89, -1.2);
  for (const z of [-2.6, .2]) add(new THREE.BoxGeometry(.06, .7, .9), winM, R + 3.43, 1.9, z);
  const dish = new THREE.Group(); dish.position.set(R + 1.6, 3.2, -2.4); root.add(dish);
  dish.add(new THREE.Mesh(new THREE.CylinderGeometry(.12, .16, 1.0, 8).translate(0, .5, 0), white));
  const bowl = new THREE.Mesh(new THREE.SphereGeometry(1.6, 28, 10, 0, TAU, 0, .85), mat('#FBF8F2', { side: THREE.DoubleSide, roughness: .5 })); bowl.rotation.x = Math.PI + .55; bowl.position.y = 2.2; dish.add(bowl);
  dish.add(new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1.3, 5).rotateX(-.55).translate(0, 1.6, .35), white));
  const chimney = add(new THREE.CylinderGeometry(.38, .44, 1.9, 12), coral, R + 2.4, 3.2 + .95, .6);
  add(new THREE.CylinderGeometry(.46, .46, .16, 12), dark, R + 2.4, 3.2 + 1.95, .6);
  // the glass tubes of mint liquid on the west side, piped to two tanks and into the drum
  const liquid = mat('#9FE8C8', { emissive: '#7FE0B8', emissiveIntensity: .25, roughness: .3 });
  const glass = new THREE.MeshStandardMaterial({ color: '#E8F6FF', roughness: .1, transparent: true, opacity: .35, depthWrite: false });
  const tubes = [];
  [[-R - 1.5, 2.4], [-R - 1.6, 1.0], [-R - 1.55, -.4]].forEach(([x, z], i) => {
    add(new THREE.CylinderGeometry(.55, .6, .35, 16), white, x, .3 + .18, z);
    const lq = add(new THREE.CylinderGeometry(.4, .4, 2.6 - i * .4, 16), liquid, x, .3 + .35 + (2.6 - i * .4) / 2, z); tubes.push(lq);
    const gl = add(new THREE.CylinderGeometry(.47, .47, 3.2, 16), glass, x, .3 + .35 + 1.6, z); gl.castShadow = false;
    add(new THREE.CylinderGeometry(.52, .52, .2, 16), white, x, .3 + .35 + 3.25, z);
    add(new THREE.CylinderGeometry(.08, .08, 1.6, 8).rotateZ(Math.PI / 2), white, x + .9, .3 + 3.3, z); });
  [[-R - 4.2, 1.8, '#A9C8EC'], [-R - 4.4, -1.3, '#C9B8E8']].forEach(([x, z, c]) => { const m = mat(c, { roughness: .5 });
    add(new THREE.CylinderGeometry(1.15, 1.15, 2.7, 20), m, x, .3 + 1.35, z); add(new THREE.SphereGeometry(1.15, 20, 8, 0, TAU, 0, Math.PI / 2), m, x, .3 + 2.7, z);
    for (const y of [.8, 2.0]) add(new THREE.TorusGeometry(1.17, .05, 6, 24).rotateX(Math.PI / 2), white, x, .3 + y, z);
    add(new THREE.CylinderGeometry(.09, .09, 2.6, 8).rotateZ(Math.PI / 2), white, x + 1.9, .3 + 2.2, (z + .9) / 2); });
  // the forecourt and the access road from the end of the x = 96 street
  const pave = mat('#E9DFCD', { roughness: .95 }), asph = mat('#8F9BAD', { roughness: .95 });
  const court = new THREE.Mesh(new THREE.BoxGeometry(16, .06, 9), pave); court.position.set(0, .03, R + 6.8); court.receiveShadow = true; root.add(court);
  const road = new THREE.Mesh(new THREE.BoxGeometry(3.4, .05, 18), asph); road.position.set(0, .025, R + 11.3 + 9); road.receiveShadow = true; root.add(road);
  for (let k = 0; k < 6; k++) { const l = new THREE.Mesh(new THREE.BoxGeometry(.12, .055, 1.2), mat('#F4F1EA')); l.position.set(0, .03, R + 12 + k * 3); root.add(l); }
  sh(root); recess.castShadow = false;
  const lab = { root, doors, scope, tilt, beacons, winM, sign: sign.m, liquid, tubes, chimney };
  lab.chimneyTop = new THREE.Vector3(LAB.x + R + 2.4, 5.3, LAB.z + .6);
  lab.domeTop = new THREE.Vector3(LAB.x, 3.6 + R, LAB.z);
  lab.open = k => doors.forEach((g, i) => g.rotation.y = (i ? 1 : -1) * 1.75 * k);        // the leaves swing in, away from us
  lab.night = (k, t) => { winM.emissiveIntensity = 1.4 * k; sign.m.emissiveIntensity = .9 * k; liquid.emissiveIntensity = .25 + 1.1 * k;
    beacons.forEach((b, i) => b.material.emissiveIntensity = .2 + 2.0 * k * (Math.sin(t * 3 + i * 2) > .3 ? 1 : .15)); };
  lab.update = t => { tubes.forEach((m, i) => m.scale.y = 1 + .03 * Math.sin(t * 2 + i)); };
  return lab;
}

// ---------- the Professor: a milk-white capsule in an oversized lab coat with mint trim, big round goggles worn crooked, pastel soot ----------
export function makeProfessor() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const skin = mat('#F8F4EC', { roughness: .45, flatShading: false }), coatM = mat('#FFFFFF', { roughness: .7, side: THREE.DoubleSide, flatShading: false }),
    mintM = mat('#8FD3B8', { side: THREE.DoubleSide, flatShading: false }), sootM = mat('#8E8A96', { roughness: 1 });
  const cap = new THREE.Mesh(new THREE.CapsuleGeometry(.24, .42, 6, 14), skin); cap.position.y = .45; body.add(cap);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 6), mat('#2C2A33', { roughness: .3, flatShading: false })); e.position.set(s * .09, .66, .228); body.add(e); }
  // the goggles, big and crooked, on a dark strap
  const gog = new THREE.Group(); gog.position.set(0, .67, 0); gog.rotation.z = .22; body.add(gog);
  const brass = mat('#D9A877', { metalness: .45, roughness: .35, flatShading: false }), lens = new THREE.MeshStandardMaterial({ color: '#CFEFF6', roughness: .1, transparent: true, opacity: .45, depthWrite: false });
  for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.TorusGeometry(.088, .024, 8, 22), brass); r.position.set(s * .1, 0, .24); gog.add(r);
    const l = new THREE.Mesh(new THREE.CircleGeometry(.078, 22), lens); l.position.set(s * .1, 0, .243); gog.add(l);
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .05, 16, 1, true).rotateX(Math.PI / 2), brass); cup.position.set(s * .1, 0, .22); gog.add(cup); }
  const strap = new THREE.Mesh(new THREE.TorusGeometry(.244, .017, 6, 30).rotateX(Math.PI / 2), mat('#4A4650')); gog.add(strap);
  // wild white hair at the sides of the crown
  [[-.19, .84, -.04, .085], [.18, .86, -.02, .075], [-.08, .95, -.09, .07], [.1, .93, -.11, .065], [-.21, .74, -.06, .06]].forEach(([x, y, z, r]) => {
    const h = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), mat('#FFFFFF', { roughness: .9 })); h.position.set(x, y, z); body.add(h); });
  // the coat: open at the front, a little too big, mint collar, hem and front edges, a pocket with pens, sleeves
  const A0 = .5, AL = TAU - 1.0;
  body.add(new THREE.Mesh(new THREE.CylinderGeometry(.268, .305, .42, 28, 1, true, A0, AL).translate(0, .29, 0), coatM));
  body.add(new THREE.Mesh(new THREE.CylinderGeometry(.262, .272, .06, 28, 1, true, A0, AL).translate(0, .50, 0), mintM));
  body.add(new THREE.Mesh(new THREE.CylinderGeometry(.306, .31, .05, 28, 1, true, A0, AL).translate(0, .1, 0), mintM));
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.BoxGeometry(.035, .42, .02), mintM); e.position.set(s * Math.sin(A0) * .29, .29, Math.cos(A0) * .29); e.rotation.y = s * A0; body.add(e); }
  const pocket = new THREE.Mesh(new THREE.BoxGeometry(.11, .1, .02), coatM); pocket.position.set(-.2, .38, .2); pocket.rotation.y = -.75; body.add(pocket);
  ['#F2A88A', '#A9C8EC'].forEach((c, i) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .1, 5), mat(c)); p.position.set(-.21 + i * .025, .44, .21 - i * .02); body.add(p); });
  const sleeves = [-1, 1].map(s => { const g = new THREE.Group(); g.position.set(s * .28, .49, .02); body.add(g);
    g.add(new THREE.Mesh(new THREE.CapsuleGeometry(.062, .2, 4, 10).translate(0, -.17, 0), coatM));
    const cuff = new THREE.Mesh(new THREE.CylinderGeometry(.066, .066, .04, 12).translate(0, -.32, 0), mintM); g.add(cuff); g.rotation.z = s * .22; return g; });
  // pastel soot: little grey smudges on the face, the body and the coat
  [[.16, .52, .5], [-.4, .38, .45], [2.4, .7, .5], [-2.2, .3, .7], [.9, .25, .4], [-.15, .78, .35], [3.0, .5, .55]].forEach(([a, y, s]) => {
    const r = y > .5 ? .246 : .31, m = new THREE.Mesh(new THREE.SphereGeometry(.035 * (1 + s), 8, 6), sootM); m.position.set(Math.sin(a) * r, y, Math.cos(a) * r); m.scale.set(1, .6, .35); m.lookAt(0, y, 0); body.add(m); });
  const plaster = makePlaster(); plaster.position.set(.12, .76, .228); plaster.rotation.z = .5; plaster.scale.setScalar(.75); plaster.visible = false; body.add(plaster);
  return { root: sh(root), body, gog, sleeves, plaster };
}

// ---------- the fireworks rockets: the giant one that went off too soon (burnt), the right-sized one with its big button ----------
function festLabel() {
  return canvasTex(512, 180, (x, w, h) => { x.fillStyle = '#FFF4DA'; x.fillRect(0, 0, w, h); x.strokeStyle = '#D9A877'; x.lineWidth = 12; x.strokeRect(6, 6, w - 12, h - 12);
    x.fillStyle = '#D9475E'; x.font = '50px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('UNTUK FESTIVAL 🎆', w / 2, h / 2 + 4); });
}
export function makeRocket({ burnt = false, label = false } = {}) {
  const root = new THREE.Group(), grey = new THREE.Color('#6E6A76');
  const tone = (c, o) => { const col = new THREE.Color(c); if (burnt) col.lerp(grey, .45); return mat(col, o); };
  const bands = ['#F2B8C6', '#FFF6E6', '#C9B8E8', '#FFF6E6', '#F2B8C6', '#FFF6E6'];
  bands.forEach((c, i) => root.add(new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .4, 20).translate(0, .75 + i * .4, 0), tone(c, { roughness: .5 }))));
  root.add(new THREE.Mesh(new THREE.ConeGeometry(.3, .75, 20).translate(0, .75 + 2.4 - .2 + .375, 0), tone('#A8DCC8', { roughness: .5 })));
  root.add(new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6).translate(0, 3.35, 0), tone('#F7D772')));
  root.add(new THREE.Mesh(new THREE.CylinderGeometry(.2, .27, .3, 16).translate(0, .4, 0), mat(burnt ? '#3A3640' : '#4A4650')));
  for (let k = 0; k < 4; k++) { const f = new THREE.Mesh(new THREE.BoxGeometry(.05, .6, .42).translate(0, .72, .42), tone('#F4A98C')); f.rotation.y = k * Math.PI / 2 + Math.PI / 4; root.add(f); }
  for (let k = 0; k < 3; k++) { const a = k / 3 * TAU, l = new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, 1.0, 6), mat('#B9B6C2')); l.position.set(Math.sin(a) * .5, .45, Math.cos(a) * .5); l.rotation.set(Math.cos(a) * -.45, 0, Math.sin(a) * .45); root.add(l); }
  if (burnt) { const soot = mat('#5E5A66', { roughness: 1 });
    for (let i = 0; i < 14; i++) { const a = hash(i * 3.3) * TAU, y = .5 + hash(i * 7.1) * 2.6, m = new THREE.Mesh(new THREE.SphereGeometry(.06 + hash(i) * .08, 8, 6), soot); m.position.set(Math.sin(a) * .3, y, Math.cos(a) * .3); m.scale.set(1, .7, .3); m.lookAt(0, y, 0); root.add(m); } }
  if (label) { const lm = new THREE.MeshStandardMaterial({ map: festLabel(), roughness: .7 }), sd = mat('#D9A877');
    const tag = new THREE.Mesh(new THREE.BoxGeometry(1.15, .4, .03), [sd, sd, sd, sd, lm, sd]); tag.position.set(0, 1.55, .38); tag.rotation.x = -.06; root.add(tag);
    root.add(new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .5, 4).translate(0, 1.95, .34), mat('#8E8A96'))); }
  return { root: sh(root), nozzle: new THREE.Vector3(0, .3, 0) };
}
export function makeButton() {                                                   // a big red button on a box, a cable to the rocket
  const root = new THREE.Group();
  root.add(new THREE.Mesh(new THREE.BoxGeometry(.5, .36, .4).translate(0, .18, 0), mat('#B6A4D8')));
  root.add(new THREE.Mesh(new THREE.BoxGeometry(.44, .02, .34).translate(0, .37, 0), mat('#F7D772')));
  const btn = new THREE.Mesh(new THREE.SphereGeometry(.13, 16, 8, 0, TAU, 0, Math.PI / 2), mat('#E8645A', { roughness: .35, emissive: '#E8645A', emissiveIntensity: .25 })); btn.position.y = .38; root.add(btn);
  return { root: sh(root), btn };
}

// ---------- the festival dressing (temporary: not in Day 9's base image) ----------
const STRIPES = [['#F2B8C6', '#FFF6E6'], ['#A8DCC8', '#FFF6E6'], ['#C9B8E8', '#FFF6E6'], ['#F7D772', '#FFF6E6'], ['#A9C8EC', '#FFF6E6'], ['#F4A98C', '#FFF6E6']];
const stripeTex = ([a, b], n = 8) => canvasTex(256, 64, (x, w, h) => { for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? b : a; x.fillRect(i * w / n, 0, w / n + 1, h); }
  x.fillStyle = a; for (let i = 0; i < n; i++) { x.beginPath(); x.arc((i + .5) * w / n, h, w / n / 2, Math.PI, 0); x.fill(); } });
const shirtTex = c => canvasTex(128, 128, (x, w, h) => { x.fillStyle = c; x.beginPath();
  x.moveTo(36, 10); x.lineTo(52, 18); x.quadraticCurveTo(64, 26, 76, 18); x.lineTo(92, 10); x.lineTo(124, 34); x.lineTo(108, 52); x.lineTo(96, 44); x.lineTo(96, 122); x.lineTo(32, 122); x.lineTo(32, 44); x.lineTo(20, 52); x.lineTo(4, 34); x.closePath(); x.fill();
  x.fillStyle = '#4B3A36'; x.font = '15px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('I ❤', 64, 62); x.font = '12px "Lilita One"'; x.fillText('NETIZEN', 64, 80); x.fillText('CITY', 64, 95); });
// one tent: four poles, a striped pyramid canopy with a scalloped valance, a counter, and its goods (food, clothes or toys)
function tent(kind, ci, w = 1.5, d = 1.0) {
  const g = new THREE.Group(), [ca] = STRIPES[ci % STRIPES.length], pole = mat('#FBF8F2'), cream = mat('#FFF6E6');
  const top = new THREE.Group(); g.add(top);                                     // the canopy opens (scales up) when the tent is set up
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) g.add(new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1.62, 6).translate(sx * (w / 2 - .05), .81, sz * (d / 2 - .05)), pole));
  const tex = stripeTex(STRIPES[ci % STRIPES.length]); tex.wrapS = THREE.RepeatWrapping;
  const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.hypot(w, d) / 2 + .08, .5, 4, 1).rotateY(Math.PI / 4), new THREE.MeshStandardMaterial({ map: tex, roughness: .75 }));
  roof.scale.set(w / Math.hypot(w, d) * 1.414, 1, d / Math.hypot(w, d) * 1.414); roof.position.y = 1.62 + .25; top.add(roof);
  const val = new THREE.MeshStandardMaterial({ map: stripeTex(STRIPES[ci % STRIPES.length], 6), roughness: .75, side: THREE.DoubleSide, transparent: true, alphaTest: .5 });
  for (const [px, pz, ry, L] of [[0, d / 2 + .04, 0, w + .1], [0, -d / 2 - .04, Math.PI, w + .1], [w / 2 + .04, 0, Math.PI / 2, d + .1], [-w / 2 - .04, 0, -Math.PI / 2, d + .1]]) {
    const v = new THREE.Mesh(new THREE.PlaneGeometry(L, .2), val); v.position.set(px, 1.56, pz); v.rotation.y = ry; top.add(v); }
  const counter = new THREE.Mesh(new THREE.BoxGeometry(w - .1, .62, .42).translate(0, .31, d / 2 - .25), cream); g.add(counter);
  g.add(new THREE.Mesh(new THREE.BoxGeometry(w - .08, .12, .44).translate(0, .52, d / 2 - .25), mat(ca)));
  const out = { g, top, kind, balloons: [], wheels: [], steam: null };
  if (kind === 'food') {
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(.13, .11, .16, 12).translate(-w * .25, .7, d / 2 - .25), mat('#B9B6C2', { roughness: .4 })); g.add(pot);
    out.steam = new THREE.Vector3(-w * .25, .85, d / 2 - .25);
    for (let k = 0; k < 4; k++) { const s = new THREE.Group(); s.position.set(w * .02 + k * .06, .64, d / 2 - .2); s.rotation.z = Math.PI / 2 - .2; g.add(s);
      s.add(new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .3, 4), mat('#D9B98C')));
      for (let j = 0; j < 3; j++) s.add(new THREE.Mesh(new THREE.BoxGeometry(.04, .04, .04).translate(0, -.08 + j * .06, 0), mat(['#C9875E', '#E3A06E', '#B8734E'][j]))); }
    for (let k = 0; k < 3; k++) { const c = new THREE.Group(); c.position.set(w * .3 + (k - 1) * .1, .62, d / 2 - .32 + (k % 2) * .08); g.add(c);
      c.add(new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .3, 4).translate(0, .15, 0), mat('#FFFFFF')));
      c.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.09, 1).translate(0, .34, 0), mat(['#F6B6CF', '#F2A0C0', '#C9B8E8'][k], { roughness: 1 }))); }
  } else if (kind === 'clothes') {
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, w - .15, 6).rotateZ(Math.PI / 2).translate(0, 1.38, -.05), pole));
    ['#F2B8C6', '#A9C8EC', '#F7D772', '#A8DCC8'].forEach((c, k) => { const p = new THREE.Mesh(new THREE.PlaneGeometry(.34, .34), new THREE.MeshStandardMaterial({ map: shirtTex(c), transparent: true, alphaTest: .5, side: THREE.DoubleSide, roughness: .8 }));
      p.position.set(-w / 2 + .28 + k * (w - .5) / 3, 1.2, -.05 + (k % 2) * .02); g.add(p); });
    for (let k = 0; k < 3; k++) g.add(new THREE.Mesh(new THREE.BoxGeometry(.24, .05, .18).translate(-.35 + k * .35, .61 + (k % 2) * .05, d / 2 - .26), mat(['#F2B8C6', '#FFF6E6', '#A9C8EC'][k])));
  } else {
    for (let k = 0; k < 6; k++) { const b = new THREE.Group(); b.position.set(-w / 2 + .2 + (k % 3) * .3, 1.62 + .1, -d / 2 + .25 + Math.floor(k / 3) * .3); g.add(b);
      const ball = new THREE.Mesh(new THREE.SphereGeometry(.12, 12, 10).scale(1, 1.18, 1).translate(0, .62 + (k % 2) * .12, 0), mat(['#F2A0B4', '#A9C8EC', '#F7D772', '#A8DCC8', '#C9B8E8', '#F4A98C'][k], { roughness: .35, flatShading: false }));
      b.add(ball); b.add(new THREE.Mesh(new THREE.CylinderGeometry(.004, .004, .55, 3).translate(0, .28, 0), mat('#FFFFFF'))); out.balloons.push(b); }
    for (let k = 0; k < 3; k++) { const p = new THREE.Group(); p.position.set(w * .1 + k * .2, .62, d / 2 - .18); g.add(p);
      p.add(new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .34, 4).translate(0, .17, 0), mat('#FFFFFF')));
      const wh = new THREE.Group(); wh.position.y = .34; p.add(wh); out.wheels.push(wh);
      for (let j = 0; j < 4; j++) { const v = new THREE.Mesh(new THREE.ConeGeometry(.05, .1, 3).rotateZ(Math.PI / 2).translate(.05, 0, 0), mat(['#F2A0B4', '#A8DCC8', '#F7D772', '#A9C8EC'][j])); v.rotation.z = j * Math.PI / 2; wh.add(v); } }
    for (let k = 0; k < 2; k++) g.add(new THREE.Mesh(new THREE.ConeGeometry(.06, .1, 10).rotateX(Math.PI).translate(-w * .3 + k * .14, .69, d / 2 - .26), mat(['#F4A98C', '#C9B8E8'][k])));
  }
  sh(g); return out;
}
// lamp heads along the Kampung branch street (city.js): north lamps at x = 5.7 + 6k, south at 7.2 + 6k; the heads lean over the street
const lampN = x => new THREE.Vector3(x, 1.95, 18.16), lampS = x => new THREE.Vector3(x, 1.95, 20.84);
export const TENTS = (() => {                                                   // [x, z, ry, kind]: the plaza's edges, and the sidewalk gaps between the street trees
  const out = [];
  [12.3, 14.3, 16.2].forEach((z, i) => { out.push([-4.65, z, Math.PI / 2, ['food', 'toys', 'clothes'][i]]); out.push([4.65, z, -Math.PI / 2, ['clothes', 'food', 'toys'][i]]); });
  for (const s of [-1, 1]) { [8.7, 14.7, 20.7].forEach((x, i) => out.push([s * x, 17.05, 0, ['food', 'toys', 'clothes'][(i + (s > 0)) % 3]]));
    [10.2, 16.2, 22.2].forEach((x, i) => out.push([s * x, 21.95, Math.PI, ['clothes', 'food', 'toys'][(i + (s > 0)) % 3]])); }
  return out; })();
export const STAGE = { z0: 10.7, z1: 13.1, w: 5.4, h: .45 };
export function makeFestival() {
  const root = new THREE.Group(), R = mulberry(88);
  const tents = TENTS.map(([x, z, ry, kind], i) => { const t = tent(kind, i, Math.abs(x) < 6 ? 1.7 : 1.5, Math.abs(x) < 6 ? 1.0 : .82); t.g.position.set(x, 0, z); t.g.rotation.y = ry; root.add(t.g); t.x = x; t.z = z; t.ry = ry; return t; });
  // the stage in front of the Kantor Mayor: skirt with scallops, little bulbs on its edge, speakers, a balloon arch at the back corners
  const stage = new THREE.Group(); root.add(stage);
  const sw = STAGE.w, sd = STAGE.z1 - STAGE.z0, sz = (STAGE.z0 + STAGE.z1) / 2;
  stage.add(new THREE.Mesh(new THREE.BoxGeometry(sw, STAGE.h, sd).translate(0, STAGE.h / 2, sz), mat('#C9B8E8')));
  stage.add(new THREE.Mesh(new THREE.BoxGeometry(sw + .1, .06, sd + .1).translate(0, STAGE.h + .03, sz), mat('#FFF6E6')));
  const skirt = new THREE.MeshStandardMaterial({ map: stripeTex(['#F2B8C6', '#FFF6E6'], 10), roughness: .8, side: THREE.DoubleSide, transparent: true, alphaTest: .5 });
  const sk = new THREE.Mesh(new THREE.PlaneGeometry(sw, .3), skirt); sk.position.set(0, STAGE.h - .1, STAGE.z1 + .06); stage.add(sk);
  stage.add(new THREE.Mesh(new THREE.BoxGeometry(1.4, .22, .5).translate(0, .11, STAGE.z1 + .25), mat('#FFF6E6')));     // a step
  const bulbM = new THREE.MeshStandardMaterial({ color: '#FFF4D8', emissive: '#FFD58A', emissiveIntensity: .2 });
  for (let k = 0; k < 13; k++) stage.add(new THREE.Mesh(new THREE.SphereGeometry(.05, 8, 6).translate(-sw / 2 + .2 + k * (sw - .4) / 12, STAGE.h + .1, STAGE.z1 + .04), bulbM));
  for (const s of [-1, 1]) { stage.add(new THREE.Mesh(new THREE.BoxGeometry(.6, .9, .5).translate(s * (sw / 2 + .45), .45, STAGE.z1 - .3), mat('#4A4650')));
    for (const y of [.25, .62]) stage.add(new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .03, 14).rotateX(Math.PI / 2).translate(s * (sw / 2 + .45), y, STAGE.z1 - .04), mat('#B9B6C2')));
    for (let k = 0; k < 9; k++) { const a = k / 8 * Math.PI * .5; stage.add(new THREE.Mesh(new THREE.SphereGeometry(.17, 10, 8), mat(['#F2A0B4', '#FFF6E6', '#A9C8EC', '#F7D772'][k % 4], { roughness: .35, flatShading: false }))
      .translateX(s * (sw / 2 - .1 - Math.cos(a) * 0)).translateY(STAGE.h + .2 + Math.sin(a) * 2.0).translateZ(STAGE.z0 + .25 + (1 - Math.cos(a)) * .3)); } }
  // the banner over the stage, on two poles
  const bt = canvasTex(1024, 300, (x, w, h) => { x.fillStyle = '#FFF4DA'; x.fillRect(0, 0, w, h); x.fillStyle = '#F2B8C6'; for (let i = 0; i < 20; i++) { x.beginPath(); x.moveTo(i * w / 20, 0); x.lineTo((i + .5) * w / 20, 22); x.lineTo((i + 1) * w / 20, 0); x.fill(); }
    x.strokeStyle = '#E58F72'; x.lineWidth = 12; x.strokeRect(6, 6, w - 12, h - 12);
    x.fillStyle = '#7A5BB0'; x.font = '96px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('FESTIVAL NETIZEN CITY', w / 2, 112); x.fillStyle = '#E58F72'; x.font = '104px "Lilita One"'; x.fillText('50K 🎉', w / 2, 222); });
  const banner = new THREE.Mesh(new THREE.BoxGeometry(3.7, 1.08, .05), [mat('#E58F72'), mat('#E58F72'), mat('#E58F72'), mat('#E58F72'), new THREE.MeshStandardMaterial({ map: bt, roughness: .7, emissiveMap: bt, emissive: '#FFFFFF', emissiveIntensity: 0 }), mat('#E58F72')]);
  banner.position.set(0, STAGE.h + 2.5, STAGE.z0 + .2); root.add(banner);
  for (const s of [-1, 1]) root.add(new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, 3.6, 6).translate(s * 1.95, 1.8, STAGE.z0 + .2), mat('#FBF8F2')));
  // bunting and lanterns: zig-zags between the street lamps of the branch street, and across the main road and the plaza
  const spans = [];
  for (const s of [-1, 1]) for (let k = 0; k < 4; k++) { const n = lampN(s * (5.7 + 6 * k)), so = lampS(s * (7.2 + 6 * k)), n2 = lampN(s * (11.7 + 6 * k)); spans.push([n, so]); if (k < 3) spans.push([so, n2]); }
  spans.push([new THREE.Vector3(-1.75, 1.95, 25.6), new THREE.Vector3(1.75, 1.95, 22.4)], [new THREE.Vector3(1.75, 1.95, 25.6), new THREE.Vector3(-1.75, 1.95, 22.4)]);
  spans.push([new THREE.Vector3(-1.95, 3.5, STAGE.z0 + .2), new THREE.Vector3(-4.65, 1.95, 16.2)], [new THREE.Vector3(1.95, 3.5, STAGE.z0 + .2), new THREE.Vector3(4.65, 1.95, 16.2)]);
  spans.push([new THREE.Vector3(-4.65, 1.95, 16.6), lampN(-5.7)], [new THREE.Vector3(4.65, 1.95, 16.6), lampN(5.7)]);
  const cord = [], flagSpots = [], lanternSpots = [];
  spans.forEach(([a, b], si) => { const L = a.distanceTo(b), pts = [];
    for (let i = 0; i <= 12; i++) { const u = i / 12, p = a.clone().lerp(b, u); p.y -= Math.sin(Math.PI * u) * .22 * L / 4; pts.push(p); }
    cord.push(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, .008, 3));
    const nf = Math.max(3, Math.round(L / .32));
    for (let i = 1; i < nf; i++) { const u = i / nf, p = a.clone().lerp(b, u); p.y -= Math.sin(Math.PI * u) * .22 * L / 4; flagSpots.push({ p, yaw: Math.atan2(b.x - a.x, b.z - a.z), c: i % 6, ph: hash(si * 13 + i) }); }
    for (const u of [.33, .66]) { const p = a.clone().lerp(b, u); p.y -= Math.sin(Math.PI * u) * .22 * L / 4 + .18; lanternSpots.push(p); } });
  root.add(new THREE.Mesh(mergeGeometries(cord), mat('#FBF8F2')));
  const tri = new THREE.BufferGeometry(); tri.setAttribute('position', new THREE.Float32BufferAttribute([-.11, 0, 0, .11, 0, 0, 0, -.2, 0], 3)); tri.computeVertexNormals();
  const flags = new THREE.InstancedMesh(tri, new THREE.MeshStandardMaterial({ roughness: .7, side: THREE.DoubleSide }), flagSpots.length);
  const fc = ['#F2A0B4', '#A8DCC8', '#F7D772', '#C9B8E8', '#A9C8EC', '#F4A98C'].map(c => new THREE.Color(c));
  flagSpots.forEach((f, i) => { flags.setColorAt(i, fc[f.c]); setM(flags, i, f.p.x, f.p.y, f.p.z, f.yaw + Math.PI / 2, 1); });
  flags.castShadow = true; root.add(flags);
  const lanGeo = mergeGeometries([new THREE.CylinderGeometry(.13, .1, .26, 10), new THREE.CylinderGeometry(.06, .06, .04, 8).translate(0, .15, 0), new THREE.CylinderGeometry(.06, .06, .04, 8).translate(0, -.15, 0)]);
  const lanM = new THREE.MeshBasicMaterial({ color: '#ffffff' });
  const lanterns = new THREE.InstancedMesh(lanGeo, lanM, lanternSpots.length);
  const lc = ['#FFC2D6', '#FFE6A0', '#C9F2DE', '#E2D2FF', '#FFD3B8'].map(c => new THREE.Color(c));
  lanternSpots.forEach((p, i) => { lanterns.setColorAt(i, lc[i % lc.length]); setM(lanterns, i, p.x, p.y, p.z, 0, 1); });
  root.add(lanterns);
  const fest = { root, tents, stage, banner, flags, flagSpots, lanterns, lanternSpots, lanM, bannerM: banner.material[4], bulbM };
  fest.open = (t, t0) => tents.forEach((tn, i) => { const u = t0 == null ? 1 : back(seg(t, t0 + i * .07, t0 + i * .07 + .35), 2.2); tn.top.scale.set(1, Math.max(.001, u), 1); tn.top.visible = u > .01; });
  // sway: the bunting flutters (a gust after the BOOM), the lanterns swing, the pinwheels spin
  fest.sway = (t, gust) => { flagSpots.forEach((f, i) => setM(flags, i, f.p.x, f.p.y, f.p.z, f.yaw + Math.PI / 2, 1, (.15 + gust * .9) * Math.sin(t * (3 + gust * 9) + f.ph * 9)));
    flags.instanceMatrix.needsUpdate = true;
    lanternSpots.forEach((p, i) => setM(lanterns, i, p.x + Math.sin(t * 1.3 + i) * .02 * (1 + gust * 6), p.y, p.z, t * .2 + i, 1, 0, (.04 + gust * .5) * Math.sin(t * (2 + gust * 6) + i * 1.7)));
    lanterns.instanceMatrix.needsUpdate = true;
    tents.forEach(tn => tn.wheels.forEach((w, k) => w.rotation.z = -t * (3 + k) * (1 + gust * 3))); };
  fest.night = k => { lanM.color.setScalar(lerp(.92, 1.05, k)); bulbM.emissiveIntensity = .2 + 2.2 * k; fest.bannerM.emissiveIntensity = .35 * k; };
  return fest;
}
// the podium's festival ribbon: a pink sash across its front and a big bow
export function ribbonFor(podium) {
  const g = new THREE.Group(), pink = mat('#F2A0B4', { roughness: .5, flatShading: false });
  g.add(new THREE.Mesh(new THREE.BoxGeometry(1.2, .09, .02).translate(0, .62, .285), pink));
  for (const s of [-1, 1]) { const loop = new THREE.Mesh(new THREE.TorusGeometry(.11, .035, 8, 16), pink); loop.scale.set(1.3, .8, .5); loop.position.set(s * .13, .64, .3); loop.rotation.z = s * .3; g.add(loop);
    const tail = new THREE.Mesh(new THREE.BoxGeometry(.06, .24, .02), pink); tail.position.set(s * .07, .5, .3); tail.rotation.z = s * .35; g.add(tail); }
  g.add(new THREE.Mesh(new THREE.SphereGeometry(.05, 10, 8).translate(0, .64, .31), pink));
  podium.root.add(sh(g)); return g;
}
// the sack race: lanes down the branch street (east), the start line, the finish ribbon, empty sacks, and one sack with a capsule in it
export const RACE = { x0: 7.0, x1: 19.0, lanes: [18.65, 19.25, 19.85, 20.45] };
export function makeRace() {
  const root = new THREE.Group(), white = mat('#FBF8F2'), sackM = mat('#D9B98C', { roughness: 1 });
  root.add(new THREE.Mesh(new THREE.BoxGeometry(.08, .02, 2.3).translate(RACE.x0, .045, 19.55), white));
  for (const s of [-1, 1]) root.add(new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1.3, 6).translate(RACE.x1, .65, 19.55 + s * 1.2), white));
  const tape = new THREE.Mesh(new THREE.BoxGeometry(.02, .05, 2.4).translate(RACE.x1, 1.0, 19.55), mat('#F2737B')); root.add(tape);
  const rt = canvasTex(512, 128, (x, w, h) => { x.fillStyle = '#FFF4DA'; x.fillRect(0, 0, w, h); x.strokeStyle = '#E58F72'; x.lineWidth = 10; x.strokeRect(5, 5, w - 10, h - 10);
    x.fillStyle = '#7A5BB0'; x.font = '54px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('BALAP KARUNG', w / 2, h / 2 + 4); });
  const rm = new THREE.MeshStandardMaterial({ map: rt, roughness: .7, emissiveMap: rt, emissive: '#FFFFFF', emissiveIntensity: .25 }), rs = mat('#E58F72');
  const rb = new THREE.Mesh(new THREE.BoxGeometry(.04, .5, 2.2), [rm, rm, rs, rs, rs, rs]); rb.position.set(RACE.x1, 1.55, 19.55); root.add(rb);
  for (const s of [-1, 1]) root.add(new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .55, 6).translate(RACE.x1, 1.55, 19.55 + s * 1.2), white));
  const sackGeo = new THREE.CylinderGeometry(.22, .26, .55, 12, 1, true).translate(0, .3, 0);
  const sacks = RACE.lanes.map((z, i) => { const s = new THREE.Mesh(sackGeo, new THREE.MeshStandardMaterial({ color: '#D9B98C', roughness: 1, side: THREE.DoubleSide })); s.position.set(RACE.x0 - .1, .0, z); s.rotation.set(0, i * .7, .06 * (i % 2 ? 1 : -1)); s.scale.set(1.15, 1, 1.15); root.add(s); return s; });   // the empty sacks, left standing at the line
  for (const z of [18.35, 18.95, 19.55, 20.15, 20.75]) root.add(new THREE.Mesh(new THREE.BoxGeometry(RACE.x1 - RACE.x0, .012, .04).translate((RACE.x0 + RACE.x1) / 2, .045, z), white));   // lane lines
  const worn = new THREE.Mesh(sackGeo, new THREE.MeshStandardMaterial({ color: '#CDAA78', roughness: 1, side: THREE.DoubleSide })); worn.scale.set(1.25, 1.1, 1.25);   // the one capsule that wears its sack
  const tie = new THREE.Mesh(new THREE.TorusGeometry(.2, .02, 5, 16).rotateX(Math.PI / 2).translate(0, .56, 0), mat('#B48A68')); worn.add(tie); root.add(worn);
  sh(root); worn.castShadow = true;
  return { root, sacks, worn, tape };
}

// ---------- pastel smoke: soft blobs (sprites) for the plume, the door, the chimney, the Professor's head ----------
export function makeSmoke(n, cols = SMOKE) {
  const root = new THREE.Group(), list = [];
  for (let i = 0; i < n; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: blobTex, color: cols[i % cols.length], transparent: true, depthWrite: false, opacity: 0, fog: false }));
    s.userData = { a: hash(i * 1.37) * TAU, r: hash(i * 2.11), sp: hash(i * 3.7), ph: hash(i * 5.3) }; root.add(s); list.push(s); }
  return { root, list };
}

// ---------- fireworks: additive points; every burst is computed from its own clock (flower, heart, ring, sphere, the "50K" formation) ----------
const FW = ['#FF9EC4', '#8FF0C8', '#C9A8FF', '#FFE27A', '#FFB08A', '#9ED2FF', '#FFFFFF'];
function textPoints(txt, n) {                                                     // n points on the strokes of a word, in -1..1 (x) units
  const c = document.createElement('canvas'); c.width = 600; c.height = 240; const x = c.getContext('2d');
  x.fillStyle = '#000'; x.fillRect(0, 0, 600, 240); x.fillStyle = '#fff'; x.font = '200px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 300, 128);
  const d = x.getImageData(0, 0, 600, 240).data, pts = [], R = mulberry(50);
  for (let tries = 0; pts.length < n && tries < n * 60; tries++) { const px = Math.floor(R() * 600), py = Math.floor(R() * 240); if (d[(py * 600 + px) * 4] > 128) pts.push([(px - 300) / 300, -(py - 120) / 300]); }
  return pts;
}
export function makeFireworks(max = 9000) {
  const g = new THREE.BufferGeometry(), pos = new Float32Array(max * 3), col = new Float32Array(max * 3), al = new Float32Array(max), sz = new Float32Array(max);
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.BufferAttribute(col, 3)); g.setAttribute('alpha', new THREE.BufferAttribute(al, 1)); g.setAttribute('size', new THREE.BufferAttribute(sz, 1));
  const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uH: { value: 1000 } },
    vertexShader: `attribute vec3 color; attribute float alpha; attribute float size; uniform float uH; varying vec3 vC; varying float vA;
      void main(){ vC = color; vA = alpha; vec4 mv = modelViewMatrix * vec4(position, 1.); gl_PointSize = clamp(size * uH * projectionMatrix[1][1] * .5 / -mv.z, 1., 220.); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `varying vec3 vC; varying float vA; void main(){ float d = length(gl_PointCoord - .5); float a = smoothstep(.5, .05, d); if (a <= 0.) discard; gl_FragColor = vec4(vC * (a * a * 1.6 + a * .4) * vA, 1.); }` });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false;
  const K50 = textPoints('50K', 900), HEART = Array.from({ length: 260 }, (_, i) => { const a = i / 260 * TAU; return [16 * Math.sin(a) ** 3 / 17, (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) / 17]; });
  const tmpC = new THREE.Color();
  // burst: {t0, c: Vector3, kind, col: [hex, hex], n, R, life}; returns the number of points written
  const fw = { points: pts, mat: m };
  fw.update = (t, bursts, uH) => {
    m.uniforms.uH.value = uH; let k = 0;
    for (const b of bursts) {
      const u = (t - b.t0) / b.life, up = b.t0 - t;
      if (up > 0 && up < b.rise) {                                                   // the rocket going up: a short sparkling trail
        const f = 1 - up / b.rise;
        for (let j = 0; j < 14 && k < max; j++, k++) { const q = Math.max(0, f - j * .025); pos.set([b.from.x + (b.c.x - b.from.x) * q, b.from.y + (b.c.y - b.from.y) * (1 - (1 - q) ** 2), b.from.z + (b.c.z - b.from.z) * q], k * 3);
          tmpC.set('#FFE6B0'); col.set([tmpC.r, tmpC.g, tmpC.b], k * 3); al[k] = (1 - j / 14) * .9; sz[k] = .5 - j * .02; } continue; }
      if (u < 0 || u > 1) continue;
      const ex = b.kind === 'k50' || b.kind === 'heart' ? eo(Math.min(1, u / .3)) : eo(Math.min(1, u / .45)), fall = Math.max(0, u - (b.kind === 'k50' ? .62 : .35)) ** 2 * b.R * .9;
      const fade = (1 - seg(u, b.kind === 'k50' ? .7 : .5, 1)) * (u < .02 ? u / .02 : 1);
      const pal = b.col.map(c => new THREE.Color(c));
      for (let j = 0; j < b.n && k < max; j++, k++) {
        let dx, dy, dz;
        if (b.kind === 'k50') { const [px, py] = K50[j % K50.length]; dx = px; dy = py; dz = 0; }
        else if (b.kind === 'heart') { const [px, py] = HEART[j % HEART.length]; dx = px; dy = py; dz = (hash(j * 3.1) - .5) * .1; }
        else if (b.kind === 'ring') { const a = j / b.n * TAU; dx = Math.cos(a); dy = Math.sin(a) * .35; dz = Math.sin(a); }
        else { const y = 1 - 2 * (j + .5) / b.n, r = Math.sqrt(1 - y * y), a = j * 2.39996; dx = Math.cos(a) * r; dy = y; dz = Math.sin(a) * r;
          if (b.kind === 'flower') { const pet = .72 + .28 * Math.abs(Math.cos(Math.atan2(dy, dx) * 3)); dx *= pet; dy *= pet; dz *= pet; } }
        const tw = .75 + .25 * Math.sin(t * 40 + j * 7.7);
        pos.set([b.c.x + dx * b.R * ex, b.c.y + dy * b.R * ex - fall, b.c.z + dz * b.R * ex], k * 3);
        const cc = pal[(b.kind === 'flower' ? (Math.abs(Math.cos(Math.atan2(dy, dx) * 3)) > .5 ? 0 : 1) : j % pal.length)];
        col.set([cc.r, cc.g, cc.b], k * 3); al[k] = fade * tw; sz[k] = b.size * (1 - .4 * u);
      }
    }
    for (let j = k; j < max; j++) al[j] = 0;
    g.setDrawRange(0, Math.max(1, k));
    g.attributes.position.needsUpdate = g.attributes.color.needsUpdate = g.attributes.alpha.needsUpdate = g.attributes.size.needsUpdate = true;
    return k;
  };
  return fw;
}

// ---------- sky lanterns: hundreds of warm pastel paper lanterns let go all over the city (the outro) ----------
export function makeSkyLanterns(n = 700) {
  const geo = mergeGeometries([new THREE.CylinderGeometry(.42, .32, .8, 8), new THREE.CylinderGeometry(.2, .2, .04, 8).translate(0, -.42, 0)]);
  const m = new THREE.MeshBasicMaterial({ color: '#ffffff' }), im = new THREE.InstancedMesh(geo, m, n), R = mulberry(61);
  const lc = ['#FFC2D6', '#FFE6A0', '#FFD3B8', '#E2D2FF', '#C9F2DE', '#FFF1C2'].map(c => new THREE.Color(c));
  const L = [];
  for (let i = 0; i < n; i++) { const x = -70 + R() * 220, z = -75 + R() * 140; L.push({ x, z, d: R() * 2.8, v: 1.3 + R() * 1.6, ph: R() * 6, s: .8 + R() * .5 }); im.setColorAt(i, lc[i % lc.length]); }
  im.frustumCulled = false;
  const sky = { mesh: im, mat: m };
  sky.update = (t, t0, k = 1) => { m.color.setScalar(1.7 * k);
    L.forEach((p, i) => { const u = t - t0 - p.d; if (u < 0) { setM(im, i, 0, -50, 0, 0, .0001); return; }
      setM(im, i, p.x + u * .6 + Math.sin(u * .9 + p.ph) * .5, 1.5 + u * p.v + u * u * .05, p.z + Math.cos(u * .7 + p.ph) * .4, p.ph, p.s * Math.min(1, u / .3)); });
    im.instanceMatrix.needsUpdate = true; };
  return sky;
}

// ---------- birds: little V-winged shapes flapping up out of the trees after the BOOM ----------
export function makeBirds(n = 12) {
  const root = new THREE.Group(), m = mat('#F7F3EA', { side: THREE.DoubleSide }), birds = [];
  for (let i = 0; i < n; i++) { const b = new THREE.Group(); root.add(b);
    b.add(new THREE.Mesh(new THREE.SphereGeometry(.07, 8, 6).scale(1, .8, 1.6), m));
    const wings = [-1, 1].map(s => { const w = new THREE.Group(); b.add(w); const tri = new THREE.Mesh(new THREE.BufferGeometry().setAttribute('position', new THREE.Float32BufferAttribute([0, 0, -.06, s * .26, 0, 0, 0, 0, .08], 3)), m); w.add(tri); return w; });
    birds.push({ b, wings, ph: hash(i * 2.9), x: (hash(i * 4.4) - .5) * 30, z: 14 + (hash(i * 6.1) - .5) * 14, a: hash(i * 8.3) * TAU }); }
  return { root, birds };
}
