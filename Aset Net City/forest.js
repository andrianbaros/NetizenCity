// Day 6: @aarisandi_99's forest with its whole ecosystem, round the foot of the mountain and along the upper river, and the deer
// who wandered into the city (one of a family of three adults and a fawn). Everything is low-poly pastel and toy-like: no
// expressive faces. The forest grows on the time-lapse clock outward from the waterfall's pool; fireflies come out at night.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry, clamp, lerp, seg, back, eo, eio, hash, vnoise } from '/core/lib.js';
import { groundY } from './world.js';
import { MT, TW, POOL, riverCurve, riverWidth, riverDist, shoreS } from './land.js';
import { surfR, onMt, TRAIL, APPROACH, PATH } from './nature.js';

const TAU = Math.PI * 2;
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .8, metalness: 0, flatShading: true, ...o });
const sh = m => { m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return m; };
const pop = (k, t0, d = .2) => k < t0 ? 0 : back(seg(k, t0, t0 + d), 2.2);
const M4 = new THREE.Matrix4(), QQ = new THREE.Quaternion(), EE = new THREE.Euler(), PV = new THREE.Vector3(), SV = new THREE.Vector3();
const setM = (m, i, x, y, z, ry, s, rx = 0, rz = 0) => { QQ.setFromEuler(EE.set(rx, ry, rz, 'YXZ')); m.setMatrixAt(i, M4.compose(PV.set(x, y, z), QQ, typeof s === 'number' ? SV.set(s, s, s) : SV.set(...s))); };
const hide = (m, i) => m.setMatrixAt(i, M4.makeScale(0, 0, 0));
const vc = (g, c) => { const col = new THREE.Color(c), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) col.toArray(a, i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; };

// ---------- where things are ----------
// the clearing on the east bank of the upper river: the animals' glade, and where the deer finds its family
const UG = .17;
export const GLADE = (() => { const c = riverCurve.getPointAt(UG), t = riverCurve.getTangentAt(UG); let n = new THREE.Vector3(-t.z, 0, t.x); if (n.x < 0) n.negate();
  const w = riverWidth(UG) / 2; return { river: c.clone(), tan: t.clone(), east: n.clone(), w, c: c.clone().addScaledVector(n, w + 10), u: UG }; })();
const near = (x, z, p, r) => Math.hypot(x - p.x, z - p.z) < r;
const APTS = APPROACH.getSpacedPoints(60);
// the mountain's height at a point inside its foot (inverts surfR along the bearing), or null outside it
function slopeY(x, z) { const th = Math.atan2(z - MT.z, x - MT.x), d = Math.hypot(x - MT.x, z - MT.z);
  if (d >= surfR(th, 0)) return null; let a = 0, b = MT.H; for (let k = 0; k < 22; k++) { const m = (a + b) / 2; if (surfR(th, m) > d) a = m; else b = m; } return (a + b) / 2; }
const angD = (a, b) => { let d = ((a - b) % TAU + TAU) % TAU; return d > Math.PI ? TAU - d : d; };
// how much forest a point gets (0..1), and what keeps it clear
function forestK(x, z) {
  if (x > -152 || shoreS(x, z) > -27) return 0;
  const dm = Math.hypot(x - MT.x, z - MT.z), th = Math.atan2(z - MT.z, x - MT.x), [dr, ur] = riverDist(x, z);
  if (dr < riverWidth(ur) / 2 + 2.4) return 0;                                          // the water and its banks
  if (Math.hypot(x - POOL.x, z - POOL.z) < POOL.r + 5) return 0;                         // the pool
  if (angD(th, TW) < .17 && dm < 61 * MT.F + POOL.r) return 0;                          // the waterfall's buttress and its fall
  if (APTS.some(p => near(x, z, p, 3.4))) return 0;                                      // the stepping-stone path
  if (near(x, z, GLADE.c, 8.5) || near(x, z, GLADE.c.clone().addScaledVector(GLADE.east, 9), 7)) return 0;   // the glade, open toward the city
  const sy = slopeY(x, z);
  if (sy !== null && (sy > 26 || (th > TRAIL[1][0] - .08 && th < TRAIL[0][0] + .09))) return 0;   // only the lower slope; the trail's face stays open
  const n = vnoise(x * .045 + 11) * vnoise(z * .045 + 5);
  const ring = clamp((MT.R0 + 24 + n * 14 - dm) / 10);
  const rivr = ur < .34 ? clamp((20 + n * 10 - dr) / 8) * clamp((.34 - ur) / .06) : 0;
  return Math.max(ring, rivr);
}

export function makeForest() {
  const root = new THREE.Group(), R = mulberry(606), pines = [], rounds = [], bushes = [], shrooms = [], flowers = [];
  const growT = (x, z) => clamp(Math.hypot(x - POOL.x, z - POOL.z) / 170) * .72;       // it spreads out from the waterfall's pool
  for (let x = -350; x < -150; x += 3.7) for (let z = -310; z < 0; z += 3.7) {
    const xx = x + (R() - .5) * 3.0, zz = z + (R() - .5) * 3.0, k = forestK(xx, zz), r = R();
    if (k <= 0 || r > k * .92) continue;
    const sy = slopeY(xx, zz), y = sy !== null ? sy - .25 : groundY(xx, zz);
    const it = { x: xx, y, z: zz, s: 1.45 + R() * 1.2, ry: R() * TAU, t0: growT(xx, zz) + R() * .18, c: R() };
    (R() < .58 ? pines : rounds).push(it);
    if (sy === null && R() < .16) shrooms.push({ x: xx + (R() - .5) * 2.4, y: groundY(xx, zz), z: zz + (R() - .5) * 2.4, s: .7 + R() * .6, ry: R() * TAU, t0: it.t0 + .06, c: R() });
  }
  // bushes and flowers: thick at the forest's edge and in the glade
  for (let i = 0; i < 2600; i++) { const x = -345 + R() * 195, z = -305 + R() * 305, k = forestK(x, z), edge = k > 0 && k < .7, glade = near(x, z, GLADE.c, 13) && !near(x, z, GLADE.c, 3.2) && riverDist(x, z)[0] > GLADE.w + 1.6;
    if (!(edge && R() < .5) && !glade) continue; const sy = slopeY(x, z); if (sy !== null) continue;
    const y = groundY(x, z), t0 = growT(x, z) + .08 + R() * .15;
    if (R() < .4) bushes.push({ x, y, z, s: .55 + R() * .55, ry: R() * TAU, t0, c: R() }); else flowers.push({ x, y, z, s: .8 + R() * .5, ry: R() * TAU, t0, c: R() }); }
  const tint = (m, list, cols) => { const c = new THREE.Color(); list.forEach((it, i) => m.setColorAt(i, c.set(cols[Math.floor(it.c * cols.length)]))); m.instanceColor.needsUpdate = true; };
  const inst = (geo, material, list, cols) => { const m = new THREE.InstancedMesh(geo, material, Math.max(1, list.length)); m.castShadow = m.receiveShadow = true; m.frustumCulled = false; if (cols) tint(m, list, cols); root.add(m); return m; };
  // pines: three stacked cones; round trees: a faceted ball; both on a little trunk
  const pineGeo = mergeGeometries([new THREE.ConeGeometry(.98, 1.35, 7).translate(0, 1.3, 0), new THREE.ConeGeometry(.76, 1.15, 7).translate(0, 2.05, 0), new THREE.ConeGeometry(.5, .95, 7).translate(0, 2.7, 0)]);
  const trunkGeo = new THREE.CylinderGeometry(.1, .14, .8, 6).translate(0, .4, 0);
  const meshes = {
    pTrunk: inst(trunkGeo, mat('#B48A68'), pines), pine: inst(pineGeo, mat('#ffffff'), pines, ['#8FC48A', '#7FB37A', '#9CD3B0', '#A7CF8E', '#86BFA0']),
    rTrunk: inst(trunkGeo, mat('#B48A68'), rounds), round: inst(new THREE.IcosahedronGeometry(.95, 0).translate(0, 1.55, 0), mat('#ffffff'), rounds, ['#8FD3B8', '#9CC48A', '#A8DCC8', '#B5D98F']),
    bush: inst(new THREE.IcosahedronGeometry(.6, 0).scale(1, .7, 1).translate(0, .3, 0), mat('#ffffff'), bushes, ['#8FC48A', '#9CD3B0', '#7FB37A', '#A7CF8E', '#F6A7C1']),
    stem: inst(new THREE.CylinderGeometry(.06, .08, .28, 6).translate(0, .14, 0), mat('#FFF6E6'), shrooms),
    cap: inst(new THREE.SphereGeometry(.2, 8, 5, 0, TAU, 0, Math.PI / 2).scale(1, .75, 1).translate(0, .27, 0), mat('#ffffff'), shrooms, ['#F2A88A', '#F2B8C6', '#C9B8E8', '#F7D772']),
    flower: inst(new THREE.IcosahedronGeometry(.11, 0).translate(0, .2, 0), mat('#ffffff', { roughness: .6 }), flowers, ['#F6A7C1', '#F7DD8C', '#C9B8E8', '#FFFFFF', '#A9C8EC', '#F2A88A'])
  };
  const groups = [[pines, ['pTrunk', 'pine']], [rounds, ['rTrunk', 'round']], [bushes, ['bush']], [shrooms, ['stem', 'cap']], [flowers, ['flower']]];
  const f = { root, pines, rounds, bushes, shrooms, flowers, meshes };
  // k: 0..1 on the time-lapse clock (1 = all grown); a little sway in the wind
  f.grow = (k, t) => {
    root.visible = k > 0;
    for (const [list, keys] of groups) { list.forEach((it, i) => { const s = it.s * pop(k, it.t0, .16); for (const key of keys) { if (s <= .001) hide(meshes[key], i); else setM(meshes[key], i, it.x, it.y, it.z, it.ry, s, keys.length > 1 && key !== keys[0] ? .02 * Math.sin(t * 1.3 + it.c * 9) : 0); } });
      for (const key of keys) meshes[key].instanceMatrix.needsUpdate = true; }
  };
  return f;
}

// ---------- the deer: cream, small antlers, a white tail; legs that walk and run; a head that turns and tilts ----------
export function makeDeer(o = {}) {
  const fawn = !!o.fawn, S = fawn ? .66 : 1;
  const coat = mat(o.coat || (fawn ? '#EBCDA4' : '#EED7B2'), { flatShading: true, roughness: .7 }), belly = mat('#FFF4E2', { roughness: .7 }), dark = mat('#C9A27C', { roughness: .7 });
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body); root.scale.setScalar(S);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(.23, .5, 4, 8).rotateX(Math.PI / 2), coat); torso.position.y = .74; torso.scale.set(1, 1.02, 1); body.add(torso);
  const under = new THREE.Mesh(new THREE.CapsuleGeometry(.17, .42, 4, 8).rotateX(Math.PI / 2), belly); under.position.set(0, .66, .02); body.add(under);
  const tail = new THREE.Mesh(new THREE.ConeGeometry(.07, .17, 5).rotateX(-2.3), belly); tail.position.set(0, .86, -.5); body.add(tail);
  // the neck and head, on a pivot at the shoulders
  const neckP = new THREE.Group(); neckP.position.set(0, .86, .36); body.add(neckP);
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(.085, .12, .46, 7).translate(0, .2, 0), coat); neck.rotation.x = .42; neckP.add(neck);
  const head = new THREE.Group(); head.position.set(0, .4, .17); neckP.add(head);
  const skull = new THREE.Mesh(new THREE.IcosahedronGeometry(.15, 1), coat); skull.scale.set(.95, .9, 1.05); head.add(skull);
  const snout = new THREE.Mesh(new THREE.IcosahedronGeometry(.095, 1), belly); snout.position.set(0, -.045, .15); snout.scale.set(.9, .8, 1.2); head.add(snout);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 6), mat('#4A3B3A', { flatShading: false, roughness: .4 })); nose.position.set(0, -.03, .26); head.add(nose);
  const eyeM = mat('#2C2A33', { flatShading: false, roughness: .3 });
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.026, 10, 8), eyeM); e.position.set(s * .1, .035, .08); head.add(e); }
  const ears = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * .11, .09, -.02); head.add(p);
    const e = new THREE.Mesh(new THREE.ConeGeometry(.055, .19, 5).translate(0, .095, 0), coat); e.scale.z = .45; p.add(e);
    const inner = new THREE.Mesh(new THREE.ConeGeometry(.035, .13, 5).translate(0, .075, .012), mat('#F3C1B8')); inner.scale.z = .3; p.add(inner);
    p.rotation.set(-.2, 0, s * -1.05); return p; });
  if (!fawn) for (const s of [-1, 1]) {                                     // small antlers: a main beam with two tines
    const a = new THREE.Group(); a.position.set(s * .06, .13, -.03); a.rotation.set(-.25, 0, s * -.35); head.add(a);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(.016, .022, .22, 5).translate(0, .11, 0), dark); a.add(beam);
    for (const [y, rz, L] of [[.1, s * -.9, .1], [.17, s * .7, .08]]) { const t = new THREE.Mesh(new THREE.CylinderGeometry(.012, .016, L, 5).translate(0, L / 2, 0), dark); t.position.y = y; t.rotation.z = rz; a.add(t); } }
  if (fawn) { const R = mulberry(3); for (let i = 0; i < 9; i++) { const sp = new THREE.Mesh(new THREE.SphereGeometry(.03, 6, 4), belly); const u = R() * .5 - .25, sd = R() < .5 ? -1 : 1; sp.position.set(sd * (.12 + R() * .07), .9 + R() * .03, u); sp.scale.y = .5; body.add(sp); } }
  // legs on hip and shoulder pivots, little dark hooves
  const legs = [[-.13, .38], [.13, .38], [-.13, -.36], [.13, -.36]].map(([x, z]) => { const p = new THREE.Group(); p.position.set(x, .66, z); body.add(p);
    const up = new THREE.Mesh(new THREE.CylinderGeometry(.05, .04, .36, 6).translate(0, -.18, 0), coat); p.add(up);
    const low = new THREE.Group(); low.position.y = -.34; p.add(low);
    const ln = new THREE.Mesh(new THREE.CylinderGeometry(.035, .03, .3, 6).translate(0, -.15, 0), coat); low.add(ln);
    const hoof = new THREE.Mesh(new THREE.CylinderGeometry(.034, .04, .05, 6).translate(0, -.3, 0), mat('#7A6152')); low.add(hoof);
    return { p, low }; });
  sh(root);
  const d = { root, body, neckP, head, ears, legs, tail, S };
  // pose: gait 0 stand, 1 walk, 2 run; ph: the stride's phase; yaw/pitch/tilt of the head; flick: an ear twitch (0..1)
  d.pose = ({ gait = 0, ph = 0, yaw = 0, pitch = 0, tilt = 0, flick = 0, crouch = 0, step = 0 } = {}) => {
    const run = clamp(gait - 1), walk = clamp(gait) * (1 - run);
    const offs = [0, Math.PI, Math.PI, 0], runOffs = [0, .35, Math.PI, Math.PI + .35];
    legs.forEach((L, i) => { const a = walk * .38 * Math.sin(ph + offs[i]) + run * .8 * Math.sin(ph + runOffs[i]) + (i < 2 ? -step * .5 : 0);
      L.p.rotation.x = a; L.low.rotation.x = Math.max(0, -Math.sin(ph + (run ? runOffs[i] : offs[i]) + .9)) * (walk * .5 + run * 1.0) + crouch * (i < 2 ? .4 : -.4); });
    body.position.y = walk * .025 * Math.abs(Math.sin(ph)) + run * .16 * Math.max(0, Math.sin(ph)) - crouch * .12;
    body.rotation.x = run * .12 * Math.sin(ph + 1.2) + step * .06;
    neckP.rotation.set(-pitch - run * .25, yaw, 0); head.rotation.set(-run * .2, 0, tilt);
    ears.forEach((e, k) => { e.rotation.x = -.2 - (k ? flick * .7 : 0) + run * .5; });
    tail.rotation.x = run * .4 * Math.sin(ph * 2) + walk * .15 * Math.sin(ph * 2);
  };
  d.pose();
  return d;
}

// ---------- the little ones of the ecosystem ----------
function makeRabbit() { const g = new THREE.Group(), w = mat('#FFFFFF', { roughness: .7 }), pink = mat('#F6C5CC');
  const b = new THREE.Mesh(new THREE.IcosahedronGeometry(.16, 1), w); b.position.y = .16; b.scale.set(.9, .85, 1.15); g.add(b);
  const h = new THREE.Group(); h.position.set(0, .3, .14); g.add(h); const hd = new THREE.Mesh(new THREE.IcosahedronGeometry(.1, 1), w); h.add(hd);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.CapsuleGeometry(.025, .14, 3, 6).translate(0, .1, 0), w); e.position.set(s * .04, .06, -.02); e.rotation.set(-.2, 0, s * -.15); h.add(e);
    const ie = new THREE.Mesh(new THREE.CapsuleGeometry(.012, .1, 3, 6).translate(0, .1, .014), pink); ie.position.copy(e.position); ie.rotation.copy(e.rotation); h.add(ie);
    const ey = new THREE.Mesh(new THREE.SphereGeometry(.016, 6, 5), mat('#2C2A33')); ey.position.set(s * .055, .02, .07); h.add(ey); }
  const tl = new THREE.Mesh(new THREE.IcosahedronGeometry(.055, 0), w); tl.position.set(0, .2, -.18); g.add(tl);
  return { root: sh(g), body: b }; }
function makeSquirrel() { const g = new THREE.Group(), c = mat('#F2B48C', { roughness: .7 }), lt = mat('#FFE6CC');
  const b = new THREE.Mesh(new THREE.CapsuleGeometry(.07, .14, 3, 7), c); b.position.y = .12; g.add(b);
  const h = new THREE.Mesh(new THREE.IcosahedronGeometry(.075, 1), c); h.position.set(0, .26, .03); g.add(h);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.ConeGeometry(.025, .06, 4), c); e.position.set(s * .04, .33, .02); g.add(e); const ey = new THREE.Mesh(new THREE.SphereGeometry(.012, 6, 5), mat('#2C2A33')); ey.position.set(s * .04, .27, .095); g.add(ey); }
  const tail = new THREE.Group(); tail.position.set(0, .06, -.07); g.add(tail);
  [[0, .04, -.04, .07], [0, .13, -.09, .085], [0, .23, -.08, .08], [0, .3, -.03, .065]].forEach(([x, y, z, r], i) => { const s = new THREE.Mesh(new THREE.IcosahedronGeometry(r, 0), i === 3 ? lt : c); s.position.set(x, y, z); tail.add(s); });
  return { root: sh(g), tail }; }
function makeBird() { const g = new THREE.Group(), c = mat('#A9C8EC', { roughness: .6 });
  const b = new THREE.Mesh(new THREE.IcosahedronGeometry(.12, 1), c); b.scale.set(.8, .75, 1.3); g.add(b);
  const h = new THREE.Mesh(new THREE.IcosahedronGeometry(.075, 1), c); h.position.set(0, .07, .13); g.add(h);
  const bk = new THREE.Mesh(new THREE.ConeGeometry(.025, .07, 4).rotateX(Math.PI / 2), mat('#F7D772')); bk.position.set(0, .06, .22); g.add(bk);
  const wings = [-1, 1].map(s => { const p = new THREE.Group(); p.position.set(s * .07, .03, 0); g.add(p); const w = new THREE.Mesh(new THREE.BoxGeometry(.24, .02, .14).translate(s * .12, 0, 0), mat('#C5DBF3')); p.add(w); return p; });
  return { root: sh(g), wings }; }
function makeButterfly() { const g = new THREE.Group(), c = mat('#C9B8E8', { side: THREE.DoubleSide, roughness: .6 }), c2 = mat('#E3D6F5', { side: THREE.DoubleSide });
  const tri = (pts) => { const ge = new THREE.BufferGeometry(); ge.setAttribute('position', new THREE.Float32BufferAttribute(pts.flat(), 3)); ge.computeVertexNormals(); return ge; };
  const wings = [-1, 1].map(s => { const p = new THREE.Group(); g.add(p);
    p.add(new THREE.Mesh(tri([[0, 0, .02], [s * .16, 0, .14], [s * .17, 0, -.02]]), c), new THREE.Mesh(tri([[0, 0, -.01], [s * .13, 0, -.02], [s * .09, 0, -.13]]), c2)); return p; });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(.012, .1, 3, 5).rotateX(Math.PI / 2), mat('#5E5470')); g.add(body);
  return { root: g, wings }; }
function makeFish() { const g = new THREE.Group(), c = mat('#FFC9A8', { roughness: .25, metalness: .35, emissive: '#FFB48A', emissiveIntensity: .15 });
  const b = new THREE.Mesh(new THREE.IcosahedronGeometry(.1, 1), c); b.scale.set(.55, .8, 1.4); g.add(b);
  const tl = new THREE.Mesh(new THREE.ConeGeometry(.07, .1, 4).rotateX(-Math.PI / 2), c); tl.position.z = -.17; tl.scale.x = .3; g.add(tl);
  return { root: sh(g) }; }
function makeTurtle() { const g = new THREE.Group(), shell = mat('#A8DCC8', { roughness: .6 }), skin = mat('#CDE7B9');
  const s = new THREE.Mesh(new THREE.SphereGeometry(.22, 7, 4, 0, TAU, 0, Math.PI / 2), shell); s.scale.y = .7; s.position.y = .05; g.add(s);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(.23, .23, .04, 7), mat('#8FC9B4')); rim.position.y = .05; g.add(rim);
  const head = new THREE.Group(); head.position.set(0, .07, .2); g.add(head); const hd = new THREE.Mesh(new THREE.IcosahedronGeometry(.065, 1), skin); hd.position.z = .04; head.add(hd);
  for (const sx of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.012, 6, 5), mat('#2C2A33')); e.position.set(sx * .03, .02, .09); head.add(e); }
  for (const [x, z] of [[-.16, .12], [.16, .12], [-.16, -.12], [.16, -.12]]) { const f = new THREE.Mesh(new THREE.IcosahedronGeometry(.045, 0), skin); f.position.set(x, .02, z); g.add(f); }
  return { root: sh(g), head }; }
export const critters = { makeRabbit, makeSquirrel, makeBird, makeButterfly, makeFish, makeTurtle };

// ---------- fireflies: soft yellow points over the forest at night ----------
export function makeFireflies(forest, n = 900) {
  const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,250,200,1)'); gr.addColorStop(.25, 'rgba(255,236,140,.75)'); gr.addColorStop(1, 'rgba(255,220,100,0)'); x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c), R = mulberry(88), trees = [...forest.pines, ...forest.rounds].filter(t => !t.y || t.y < 6), p = [], seed = [];
  for (let i = 0; i < n; i++) { const t = trees[Math.floor(R() * trees.length)], a = R() * TAU, r = 1 + R() * 3; p.push(t.x + Math.cos(a) * r, t.y + .6 + R() * 3.5, t.z + Math.sin(a) * r); seed.push(R()); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  const m = new THREE.PointsMaterial({ map: tex, color: '#FFE89A', size: 1.25, sizeAttenuation: true, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, fog: false });
  const pts = new THREE.Points(g, m); pts.frustumCulled = false; const base = p.slice();
  return { root: pts, update(t, k) { pts.visible = k > 0; m.opacity = k; if (k <= 0) return; const a = g.attributes.position;
    for (let i = 0; i < n; i++) { const s = seed[i] * 40; a.setXYZ(i, base[i * 3] + Math.sin(t * .7 + s) * .6, base[i * 3 + 1] + Math.sin(t * 1.1 + s * 1.7) * .4, base[i * 3 + 2] + Math.cos(t * .6 + s) * .6); }
    a.needsUpdate = true; m.size = 1.25 * (.75 + .25 * Math.sin(t * 3)); } };
}
