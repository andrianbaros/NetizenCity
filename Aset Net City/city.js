// Day 2's town, laid out as the ledger says: the gate in the south, the main road straight north to the Mayor's office,
// two branches at z = 19.5: east = Perumahan (houses, ruko), west = Fasilitas (park, field, school).
// Every piece knows when it appears; appear(tw) runs on the time-lapse clock, night(k) lights the town.
import * as THREE from 'three';
import { mulberry, clamp, lerp, seg, back, eo, eio, hash } from '/core/lib.js';
import { PAL, signTex } from './world.js';

const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .78, metalness: 0, flatShading: true, ...o });
const sh = m => { m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return m; };
export const C2 = { asphalt: '#8F9BAD', line: '#F4F1EA', plaza: '#E9DFCD', blush: '#F2B8C6', powder: '#A9C8EC', butter: '#F7DD8C', treeMint: '#8FD3B8', treeSage: '#9CC48A', grass: '#A3D08F', pond: '#9FD3EC' };
export const BRANCH_Z = 19.5, MAIN_Z0 = 27.4, MAIN_Z1 = 17.4, BRANCH_X = 36;
export const PARK = [-21.5, 13.7], COURT = [-13.6, 12.0];             // Fasilitas lots: fronts on the west branch's sidewalk (z = 16.5)
// sidewalks run from the curb to the house fronts, so no strip of grass is left between the houses and the road
const WALK_N = [16.5, 18.28], WALK_S = [20.72, 22.5], WALK_E = [1.32, 2.3], WALK_W = [-2.9, -1.32], PLAZA_X = 5.5, PLAZA_Z = 17.4;
const pop = (tw, t0, d = .22) => tw < t0 ? 0 : back(seg(tw, t0, t0 + d), 2.2);
const paveTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'), R = mulberry(4);
  x.fillStyle = '#D6CBB8'; x.fillRect(0, 0, 128, 128);                  // one world unit: 2 x 2 pavers and their joints
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { x.fillStyle = `hsl(37, 32%, ${88 + R() * 4}%)`; x.fillRect(i * 64 + 3, j * 64 + 3, 58, 58); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t; })();
const walkM = new THREE.MeshStandardMaterial({ map: paveTex, roughness: .92 });
// a sidewalk slab given in world coordinates, parented to a road tile so it rolls out with the asphalt; UVs are world-aligned so the pavers line up
function walk(g, x0, x1, z0, z1) {
  if (x1 - x0 < .01 || z1 - z0 < .01) return;
  const geo = new THREE.BoxGeometry(x1 - x0, .08, z1 - z0), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, p = geo.attributes.position, uv = geo.attributes.uv;
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) + cx, -(p.getZ(i) + cz));
  const m = new THREE.Mesh(geo, walkM); m.position.set(cx - g.position.x, .04, cz - g.position.z); m.receiveShadow = true; g.add(m);
}
const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d'); const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,236,190,1)'); g.addColorStop(.25, 'rgba(255,214,150,.55)'); g.addColorStop(1, 'rgba(255,200,130,0)'); x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })();

export function buildCity(scene, cue) {
  const R = mulberry(202), city = { items: [] };
  const add = (obj, t0, kind = 'pop', extra = {}) => { scene.add(obj); city.items.push({ obj, t0, kind, base: obj.scale.clone(), ...extra }); return obj; };

  // ---------- plaza (pelataran) ----------
  const plaza = new THREE.Mesh(new THREE.BoxGeometry(11, .06, 6.6), mat(C2.plaza, { roughness: .95 })); plaza.position.set(0, .03, 14.1); plaza.receiveShadow = true;
  add(plaza, cue.S3, 'always');                                       // new today: it is not there in the Day 1 opening
  for (let i = 0; i < 9; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(.04, .065, 6.6), mat('#DCCFBA')); l.position.set(-4.4 + i * 1.1, .035, 14.1); add(l, cue.S3, 'always'); }

  // ---------- roads: tiles that roll out from the gate ----------
  const asphalt = mat(C2.asphalt, { roughness: .9 }), dash = mat(C2.line), curb = mat('#D8D2C6');
  const S6 = cue.S6, mainT = (z) => S6 + .15 + (MAIN_Z0 - z) / (MAIN_Z0 - MAIN_Z1) * .45, brT = (x) => S6 + .6 + (Math.abs(x) - 1.2) / (BRANCH_X - 1.2) * .7;
  for (let z = MAIN_Z0; z > MAIN_Z1 - .01; z -= 1) {
    const g = new THREE.Group(); const t = new THREE.Mesh(new THREE.BoxGeometry(2.4, .05, 1.02), asphalt); t.position.y = .03; g.add(t);
    if (Math.round(z) % 2 === 0) { const d = new THREE.Mesh(new THREE.BoxGeometry(.12, .055, .5), dash); d.position.y = .035; g.add(d); }
    for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.BoxGeometry(.12, .09, 1.02), curb); c.position.set(s * 1.26, .045, 0); g.add(c); }
    g.position.set(0, 0, z - .5);
    const lo = Math.max(z - 1.01, WALK_S[1]), hi = z + .01;             // south of the branch sidewalks only: east to the ruko fronts, west past the trees
    if (hi > lo) { walk(g, ...WALK_E, lo, hi); walk(g, ...WALK_W, lo, hi); }
    g.traverse(o => { if (o.isMesh) o.receiveShadow = true; });
    add(g, mainT(z), 'roll', { axis: 'z' });
  }
  for (const side of [-1, 1]) for (let x = 1.2; x < BRANCH_X; x += 1) {
    const g = new THREE.Group(); const t = new THREE.Mesh(new THREE.BoxGeometry(1.02, .05, 2.2), asphalt); t.position.y = .03; g.add(t);
    if (Math.round(x) % 2 === 0) { const d = new THREE.Mesh(new THREE.BoxGeometry(.5, .055, .12), dash); d.position.y = .035; g.add(d); }
    for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.BoxGeometry(1.02, .09, .12), curb); c.position.set(0, .045, s * 1.16); g.add(c); }
    g.position.set(side * (x + .5), 0, BRANCH_Z);
    const a = Math.max(x - .01, WALK_E[0]), b = x + 1.01;
    const span = (u0, u1, z0, z1) => { if (u1 > u0) walk(g, Math.min(side * u0, side * u1), Math.max(side * u0, side * u1), z0, z1); };
    span(a, Math.min(b, PLAZA_X), PLAZA_Z, WALK_N[1]); span(Math.max(a, PLAZA_X), b, ...WALK_N);   // beside the plaza only up to its edge
    span(a, b, ...WALK_S);
    g.traverse(o => { if (o.isMesh) o.receiveShadow = true; });
    add(g, brT(x), 'roll', { axis: 'x' });
  }
  // the toy steamrollers that lay the asphalt
  const roller = () => { const g = new THREE.Group(), y = mat('#F4C95D'), dk = mat('#55505C');
    const body = new THREE.Mesh(new THREE.BoxGeometry(.9, .55, .7), y); body.position.set(-.2, .55, 0); g.add(body);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(.45, .4, .6), mat('#FFF3D6')); cab.position.set(-.3, 1.0, 0); g.add(cab);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(.6, .06, .7), y); roof.position.set(-.3, 1.23, 0); g.add(roof);
    const drum = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .9, 16), dk); drum.rotation.x = Math.PI / 2; drum.position.set(.45, .34, 0); g.add(drum);
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .76, 12), dk); wh.rotation.x = Math.PI / 2; wh.position.set(-.45, .24, 0); g.add(wh);
    g.userData.drum = drum; return sh(g); };
  city.rollers = [roller(), roller(), roller()]; city.rollers.forEach(r => scene.add(r));
  city.roll = (t, tw) => {
    const [m, w, e] = city.rollers;
    const pm = seg(tw, S6 + .15, S6 + .6), pb = seg(tw, S6 + .6, S6 + 1.3);
    m.visible = t >= S6 && pm < 1; m.position.set(0, 0, lerp(MAIN_Z0, MAIN_Z1, pm) - .3); m.rotation.y = Math.PI / 2;
    w.visible = e.visible = t >= S6 && pm >= 1 && pb < 1;
    w.position.set(-lerp(1.2, BRANCH_X, pb), 0, BRANCH_Z); w.rotation.y = Math.PI;
    e.position.set(lerp(1.2, BRANCH_X, pb), 0, BRANCH_Z); e.rotation.y = 0;
    for (const r of city.rollers) r.userData.drum.rotation.y = -tw * 9;
  };

  // ---------- trees and street lamps along every road ----------
  const treeAt = (x, z, k) => { const g = new THREE.Group(), tone = k % 2 ? C2.treeMint : C2.treeSage;
    const tr = new THREE.Mesh(new THREE.CylinderGeometry(.09, .12, .7, 6), mat('#B48A68')); tr.position.y = .35; g.add(tr);
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(.62 + R() * .12, 0), mat(tone)); c.position.y = 1.15; c.rotation.set(R(), R(), R()); g.add(c);
    const pit = new THREE.Mesh(new THREE.BoxGeometry(.5, .02, .5), pitM); pit.position.y = .09; g.add(pit);       // every street tree stands in the sidewalk
    g.position.set(x, 0, z); g.rotation.y = R() * 6; return sh(g); };
  const trees = [], pitM = mat('#CDB894');
  for (let z = 26.2; z > 21; z -= 2.6) trees.push([-2.4, z]);                      // the east side of the main road is the ruko front
  for (const s of [-1, 1]) for (let x = 4.2; x < BRANCH_X; x += 3.0) { trees.push([s * x, BRANCH_Z - 1.75]); trees.push([s * (x + 1.5), BRANCH_Z + 1.75]); }
  trees.sort((a, b) => Math.hypot(a[0], a[1] - BRANCH_Z) - Math.hypot(b[0], b[1] - BRANCH_Z));
  const tPohon = cue.pohon + .05, tTree1 = cue.pohon + 1.5;
  trees.forEach(([x, z], i) => add(treeAt(x, z, i), lerp(tPohon, tTree1, i / trees.length)));
  // lamps: pole + head + a glow sprite and a pool of light on the ground (lit at night, in order along the roads)
  city.lamps = [];
  const poleM = mat('#EEE6F6'), lampSpots = [];
  for (let z = 25.6; z > 21.5; z -= 3.2) for (const s of [-1, 1]) lampSpots.push([s * 1.75, z]);
  for (const s of [-1, 1]) { for (let x = 5.7; x < BRANCH_X; x += 6) lampSpots.push([s * x, BRANCH_Z - 1.6]); for (let x = 7.2; x < BRANCH_X; x += 6) lampSpots.push([s * x, BRANCH_Z + 1.6]); }
  lampSpots.forEach(([x, z], i) => {
    const g = new THREE.Group();
    const p = new THREE.Mesh(new THREE.CylinderGeometry(.045, .06, 1.9, 6), poleM); p.position.y = .95; g.add(p);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(.32, .05, .05), poleM); arm.position.set(.12, 1.88, 0); g.add(arm);
    const hm = mat('#FFF4D8', { emissive: '#FFD58A', emissiveIntensity: 0 });
    const head = new THREE.Mesh(new THREE.SphereGeometry(.13, 10, 8), hm); head.position.set(.26, 1.82, 0); g.add(head);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(.17, .12, 8), mat(PAL.lavender)); cap.position.set(.26, 1.95, 0); g.add(cap);
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: '#FFE0A8', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.position.set(.26, 1.82, 0); glow.scale.setScalar(1.6); g.add(glow);
    const pool = new THREE.Mesh(new THREE.CircleGeometry(1.5, 24), new THREE.MeshBasicMaterial({ map: glowTex, color: '#FFD9A0', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    pool.rotation.x = -Math.PI / 2; pool.position.set(.26, .07, 0); g.add(pool);
    g.position.set(x, 0, z); g.rotation.y = x < 0 ? 0 : Math.PI; if (Math.abs(x) > 2.5) g.rotation.y = z < BRANCH_Z ? -Math.PI / 2 : Math.PI / 2;
    g.traverse(o => { if (o.isMesh && o !== pool) o.castShadow = true; });
    const d = Math.abs(x) + Math.abs(z - BRANCH_Z) * .3 + (z > BRANCH_Z && Math.abs(x) < 2.5 ? (z - BRANCH_Z) * .6 : 0);
    add(g, cue.lampu - .15 + i * .035, 'rise');
    city.lamps.push({ hm, glow, pool, d });
  });
  city.lamps.sort((a, b) => a.d - b.d);

  // ---------- houses ----------
  city.windows = [];
  const winM = () => { const m = mat('#A9D3EA', { roughness: .2, metalness: .1, emissive: '#FFCB7A', emissiveIntensity: 0 }); city.windows.push(m); return m; };
  const house1 = (roof) => { const g = new THREE.Group(), parts = [], wm = winM();
    const w = new THREE.Mesh(new THREE.BoxGeometry(2.0, 1.25, 1.8), mat(PAL.cream)); w.position.y = .62; g.add(w); parts.push(w);
    const sh_ = new THREE.Shape([new THREE.Vector2(-1.18, 0), new THREE.Vector2(1.18, 0), new THREE.Vector2(0, .95)]);
    const r = new THREE.Mesh(new THREE.ExtrudeGeometry(sh_, { depth: 2.05, bevelEnabled: false }), mat(roof)); r.geometry.translate(0, 0, -1.025); r.position.y = 1.25; g.add(r); parts.push(r);
    const door = new THREE.Mesh(new THREE.BoxGeometry(.42, .72, .05), mat('#C08F72')); door.position.set(-.45, .36, .92); g.add(door); parts.push(door);
    const win = new THREE.Mesh(new THREE.BoxGeometry(.5, .42, .05), wm); win.position.set(.42, .72, .92); g.add(win); parts.push(win);
    const ch = new THREE.Mesh(new THREE.BoxGeometry(.22, .45, .22), mat('#E8D9C2')); ch.position.set(.55, 1.85, -.3); g.add(ch); parts.push(ch);
    return { g: sh(g), parts }; };
  const modern2 = (wall) => { const g = new THREE.Group(), parts = [], wm = winM();
    const a = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.25, 2.0), mat(wall)); a.position.y = .62; g.add(a); parts.push(a);
    const b = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.2, 1.9), mat(wall === PAL.lavender ? PAL.cream : PAL.lavender)); b.position.set(.08, 1.85, -.05); g.add(b); parts.push(b);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(2.5, .1, 2.15), mat('#F4F0EA')); slab.position.set(.08, 2.5, -.05); g.add(slab); parts.push(slab);
    const gl1 = new THREE.Mesh(new THREE.BoxGeometry(1.4, .8, .05), wm); gl1.position.set(.25, .6, 1.02); g.add(gl1); parts.push(gl1);
    const gl2 = new THREE.Mesh(new THREE.BoxGeometry(1.9, .75, .05), wm); gl2.position.set(.08, 1.85, .92); g.add(gl2); parts.push(gl2);
    const door = new THREE.Mesh(new THREE.BoxGeometry(.4, .75, .05), mat('#8C8696')); door.position.set(-.75, .38, 1.02); g.add(door); parts.push(door);
    return { g: sh(g), parts }; };
  const stripes = signTex((x, v, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#A8DCC8' : '#F2A88A'; x.fillRect(i * w / 8, 0, w / 8, h); } }, 256, 64); stripes.set(1);
  city.rukoDoors = [];
  const ruko = () => { const g = new THREE.Group(), parts = [], wm = winM();
    const a = new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.6, 2.3), mat(PAL.cream)); a.position.y = 1.3; g.add(a); parts.push(a);
    const can = new THREE.Mesh(new THREE.BoxGeometry(2.3, .08, .7), new THREE.MeshStandardMaterial({ map: stripes.t, roughness: .8 })); can.position.set(0, 1.42, 1.45); can.rotation.x = .25; g.add(can); parts.push(can);
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.15, .06), mat('#B9BCC6')); door.position.set(0, .6, 1.17); g.add(door); parts.push(door);
    for (let i = 0; i < 5; i++) { const l = new THREE.Mesh(new THREE.BoxGeometry(1.5, .02, .07), mat('#9EA2AE')); l.position.set(0, -.45 + i * .22, 0); door.add(l); }
    const win = new THREE.Mesh(new THREE.BoxGeometry(1.5, .6, .05), wm); win.position.set(0, 2.0, 1.17); g.add(win); parts.push(win);
    const top = new THREE.Mesh(new THREE.BoxGeometry(2.3, .14, 2.4), mat(PAL.peach)); top.position.y = 2.67; g.add(top); parts.push(top);
    city.rukoDoors.push(door);
    return { g: sh(g), parts }; };
  const ROOFS = [PAL.peach, C2.blush, C2.powder];
  city.houses = [];
  const T7 = cue.S7, tm = cue.modern, tr = cue.ruko;
  const slotsN = [], slotsS = [], slotsB = [];
  for (let x = 7.5; x < 35; x += 3.0) slotsN.push([x, 15.6, 0]);
  for (let x = 6.5; x < 35; x += 3.0) slotsS.push([x, 23.4, Math.PI]);
  for (let x = 9.0; x < 22; x += 3.0) slotsB.push([x, 12.0, 0]);
  const modernAt = new Set(['S12.5', 'S24.5', 'N16.5']);
  const all = [...slotsN.map(s => ['N', ...s]), ...slotsS.map(s => ['S', ...s]), ...slotsB.map(s => ['B', ...s])].slice(0, 25);
  let hi = 0, mi = 0;
  all.forEach(([row, x, z, ry], i) => {
    const isModern = modernAt.has(row + x);
    const h = isModern ? modern2(mi++ % 2 ? PAL.cream : PAL.lavender) : house1(ROOFS[hi++ % 3]);
    h.g.position.set(x, 0, z); h.g.rotation.y = ry; scene.add(h.g);
    const t0 = isModern ? tm - .25 + mi * .2 : T7 + .1 + (i / 25) * (tm - T7 - .45);
    city.houses.push({ ...h, t0, modern: isModern });
  });
  for (let k = 0; k < 3; k++) { const h = ruko(); h.g.position.set(3.45, 0, 22.3 + k * 2.4); h.g.rotation.y = -Math.PI / 2; scene.add(h.g); city.houses.push({ ...h, t0: tr - .3 + k * .22, ruko: true }); }
  // Day 3: the old village's empty lots filled in (no bare grass between the streets), and a park with a pond
  if (cue.infill) {
    const lots = [];
    for (let x = 6.5; x <= 36.6; x += 3) lots.push([x, 27.5, 0]);                   // behind the south row, facing the new avenue
    for (let x = 24; x <= 36.1; x += 3) lots.push([x, 12.0, 0]);                    // the back row, continued
    for (const z of [8.3, 4.6]) for (let x = 7.5; x <= 36.6; x += 3) lots.push([x, z, Math.PI]);
    for (const z of [15.0, 11.3, 7.6, 3.9]) for (const x of [-37.5, -34.5, -31.5, -28.5]) lots.push([x, z, z < 9 ? Math.PI : 0]);
    for (const x of [-24, -21, -18, -15, -12, -9, -6]) lots.push([x, 4.4, Math.PI]);
    lots.forEach(([x, z, ry], i) => { const m = i % 5 === 3, h = m ? modern2(i % 2 ? PAL.cream : PAL.lavender) : house1(ROOFS[(i * 7) % 3]);
      h.g.position.set(x, 0, z); h.g.rotation.y = ry; scene.add(h.g); city.houses.push({ ...h, t0: -100, modern: m, infill: true }); });
    const pond = new THREE.Group(); pond.position.set(-19.5, 0, 25.7); scene.add(pond);
    const lawn2 = new THREE.Mesh(new THREE.BoxGeometry(32, .05, 6.0), mat(C2.grass, { roughness: 1 })); lawn2.position.y = .03; lawn2.receiveShadow = true; pond.add(lawn2);
    const water = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, .06, 40), mat(C2.pond, { roughness: .1, metalness: .2 })); water.scale.set(6.5, 1, 1.9); water.position.set(1, .07, 0); pond.add(water);
    const rim2 = new THREE.Mesh(new THREE.TorusGeometry(1, .045, 6, 40), mat('#E5DCCB')); rim2.rotation.x = Math.PI / 2; rim2.scale.set(6.5, 1.9, 1); rim2.position.set(1, .08, 0); pond.add(rim2);
    const bridge = new THREE.Group(); bridge.position.set(1, 0, 0); pond.add(bridge);                     // a little wooden bridge across the pond
    { const wd = mat(PAL.woodDark), top = new THREE.Mesh(new THREE.BoxGeometry(.9, .1, 1.7), wd); top.position.y = .42; bridge.add(top);
      for (const s of [-1, 1]) { const r = new THREE.Mesh(new THREE.BoxGeometry(.9, .1, 1.25), wd); r.position.set(0, .22, s * 1.38); r.rotation.x = s * .34; bridge.add(r);
        const rail = new THREE.Mesh(new THREE.BoxGeometry(.05, .05, 1.7), mat(PAL.wood)); rail.position.set(s * .42, .72, 0); bridge.add(rail);
        for (const z of [-.8, .8]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.06, .3, .06), mat(PAL.wood)); p.position.set(s * .42, .57, z); bridge.add(p); } } }
    for (const [x, z, s] of [[-2.2, .6, 1], [3.4, -.5, .8], [5.2, .7, .7]]) { const lily = new THREE.Mesh(new THREE.CylinderGeometry(.28 * s, .28 * s, .03, 10), mat('#8FC48A')); lily.position.set(x, .1, z); pond.add(lily); }
    const gz = new THREE.Group(); gz.position.set(-11.5, 0, 0); pond.add(gz);                                   // a gazebo at the west end
    { const base = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, .2, 6), mat('#E9DFCD')); base.position.y = .1; gz.add(base);
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2, p = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 1.5, 6), mat('#FFFFFF')); p.position.set(Math.cos(a) * 1.3, .95, Math.sin(a) * 1.3); gz.add(p); }
      const rf = new THREE.Mesh(new THREE.ConeGeometry(1.9, .9, 6), mat(PAL.peach)); rf.position.y = 2.15; gz.add(rf); }
    for (let k = 0; k < 16; k++) { const x = -14 + k * 1.85 + (k % 2) * .4, z = k % 2 ? -2.4 : 2.4; if (Math.abs(x + 11.5) < 2.2) continue; pond.add(treeAt(x, z, k)); }
    for (const [x, z, ry] of [[-5.5, 2.3, Math.PI], [7.5, 2.3, Math.PI], [-5.5, -2.3, 0], [8.5, -2.3, 0]]) { const b = new THREE.Group(); const s = new THREE.Mesh(new THREE.BoxGeometry(1.0, .06, .3), mat(PAL.woodDark)); s.position.y = .35; b.add(s);
      const bk = new THREE.Mesh(new THREE.BoxGeometry(1.0, .3, .05), mat(PAL.woodDark)); bk.position.set(0, .55, -.14); b.add(bk); b.position.set(x, 0, z); b.rotation.y = ry; pond.add(b); }
    for (let k = 0; k < 40; k++) { const f = new THREE.Mesh(new THREE.IcosahedronGeometry(.09 + R() * .05, 0), mat(['#F6A7C1', '#F7DD8C', '#C9B8E8', '#FFFFFF', '#F2A88A'][k % 5])); f.position.set(-14 + R() * 28, .14, (R() - .5) * 5.2); if (Math.hypot((f.position.x - 1) / 6.8, f.position.z / 2.2) < 1) continue; pond.add(f); }
    sh(pond); lawn2.castShadow = false;
  }
  city.counts = { house: city.houses.filter(h => !h.modern && !h.ruko).length, modern: city.houses.filter(h => h.modern).length, ruko: 3 };

  // ---------- Fasilitas: park, basketball court, school (north of the west branch, west to east) ----------
  const T8 = cue.S8;
  const park = new THREE.Group(); park.position.set(PARK[0], 0, PARK[1]); scene.add(park);
  const lawn = new THREE.Mesh(new THREE.BoxGeometry(8, .05, 5.6), mat(C2.grass, { roughness: 1 })); lawn.position.y = .03; lawn.receiveShadow = true; park.add(lawn);
  const pond = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, .06, 24), mat(C2.pond, { roughness: .1, metalness: .2 })); pond.position.set(-1.8, .06, -.8); park.add(pond);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(1.12, .08, 6, 24), mat('#E5DCCB')); rim.rotation.x = Math.PI / 2; rim.position.set(-1.8, .07, -.8); park.add(rim);
  const bench = new THREE.Group(); { const s = new THREE.Mesh(new THREE.BoxGeometry(1.0, .06, .3), mat(PAL.woodDark)); s.position.y = .35; bench.add(s); const b = new THREE.Mesh(new THREE.BoxGeometry(1.0, .3, .05), mat(PAL.woodDark)); b.position.set(0, .55, -.14); bench.add(b);
    for (const x of [-.4, .4]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.05, .35, .3), mat('#6A6670')); l.position.set(x, .17, 0); bench.add(l); } } bench.position.set(.6, 0, 1.6); park.add(bench);
  const swing = new THREE.Group(); { const pm = mat(PAL.peachDeep); for (const x of [-.6, .6]) for (const z of [-.3, .3]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, 1.6, 5), pm); l.position.set(x, .78, z * .6); l.rotation.x = z > 0 ? .25 : -.25; swing.add(l); }
    const top = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 1.3, 5), pm); top.rotation.z = Math.PI / 2; top.position.y = 1.55; swing.add(top);
    const seat = new THREE.Group(); for (const x of [-.14, .14]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(.01, .01, 1.05, 4), mat('#6A6670')); r.position.set(x, -.52, 0); seat.add(r); }
    const sb = new THREE.Mesh(new THREE.BoxGeometry(.36, .04, .16), mat(PAL.mint)); sb.position.y = -1.05; seat.add(sb); seat.position.y = 1.55; swing.add(seat); swing.userData.seat = seat; }
  swing.position.set(2.2, 0, -1.2); park.add(swing); city.swing = swing;
  const slide = new THREE.Group(); { const pl = new THREE.Mesh(new THREE.BoxGeometry(.5, .05, .5), mat(PAL.lavender)); pl.position.y = .95; slide.add(pl);
    for (const [x, z] of [[-.22, -.22], [.22, -.22], [-.22, .22], [.22, .22]]) { const l = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .95, 5), mat('#EEE6F6')); l.position.set(x, .47, z); slide.add(l); }
    const ch = new THREE.Mesh(new THREE.BoxGeometry(.4, .04, 1.5), mat(C2.butter)); ch.position.set(0, .5, .95); ch.rotation.x = .62; slide.add(ch); }
  slide.position.set(-.6, 0, -1.6); park.add(slide);
  const flowerCols = ['#F6A7C1', '#F7DD8C', '#C9B8E8', '#FFFFFF', '#F2A88A'], flowers = [];
  for (let i = 0; i < 46; i++) { const f = new THREE.Mesh(new THREE.IcosahedronGeometry(.09 + R() * .05, 0), mat(flowerCols[i % 5])); f.position.set((R() - .5) * 7.4, .14, (R() - .5) * 5.0); if (Math.hypot(f.position.x + 1.8, f.position.z + .8) < 1.4) f.position.x += 2.8; park.add(f); flowers.push(f); }
  sh(park); lawn.castShadow = false;
  city.park = { root: park, lawn, flowers, props: [pond, rim, bench, swing, slide] };
  // basketball court: the long side runs north-south, so both hoops fit the portrait frame. Canvas x = world x (5.6), canvas y = world z (9)
  const courtTex = signTex((x, v, w, h) => {
    const m = 16, cx = w / 2, blue = '#9DBFE3', kw = w * .36, kd = h * .19, R3 = w * .4, ft = w * .14;
    x.fillStyle = blue; x.fillRect(0, 0, w, h); x.fillStyle = '#F4B48C'; x.fillRect(m, m, w - 2 * m, h - 2 * m);
    x.fillStyle = blue; x.fillRect(cx - kw / 2, m, kw, kd); x.fillRect(cx - kw / 2, h - m - kd, kw, kd); x.beginPath(); x.arc(cx, h / 2, ft, 0, 7); x.fill();
    x.strokeStyle = '#FFFFFF'; x.lineWidth = 5;
    x.strokeRect(m, m, w - 2 * m, h - 2 * m); x.beginPath(); x.moveTo(m, h / 2); x.lineTo(w - m, h / 2); x.stroke();
    x.beginPath(); x.arc(cx, h / 2, ft, 0, 7); x.stroke();
    x.strokeRect(cx - kw / 2, m, kw, kd); x.strokeRect(cx - kw / 2, h - m - kd, kw, kd);
    x.beginPath(); x.arc(cx, m + kd, ft, 0, Math.PI); x.stroke(); x.beginPath(); x.arc(cx, h - m - kd, ft, Math.PI, 2 * Math.PI); x.stroke();
    for (const s of [1, -1]) {                                         // three-point lines: straight from the baseline, then the arc
      const by = s > 0 ? m : h - m, hy = by + s * h * .05, a = Math.asin(.92), dy = R3 * Math.cos(a);
      x.beginPath(); x.moveTo(cx - R3 * .92, by); x.lineTo(cx - R3 * .92, hy + s * dy);
      if (s > 0) x.arc(cx, hy, R3, Math.PI - (Math.PI / 2 - a), Math.PI / 2 - a, true); else x.arc(cx, hy, R3, Math.PI + (Math.PI / 2 - a), -(Math.PI / 2 - a));
      x.lineTo(cx + R3 * .92, by); x.stroke();
    }
  }, 320, 512); courtTex.set(1);
  const court = new THREE.Group(); court.position.set(COURT[0], 0, COURT[1]); scene.add(court);
  const turf = new THREE.Mesh(new THREE.BoxGeometry(5.6, .05, 9), new THREE.MeshStandardMaterial({ map: courtTex.t, roughness: .85 })); turf.position.y = .03; turf.receiveShadow = true; court.add(turf);
  const boardTex = signTex((x, v, w, h) => { x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, w, h); x.strokeStyle = '#F08A4B'; x.lineWidth = 9; x.strokeRect(5, 5, w - 10, h - 10); x.lineWidth = 7; x.strokeRect(w * .33, h * .42, w * .34, h * .42); }, 160, 100); boardTex.set(1);
  const hoop = () => { const g = new THREE.Group(), pm = mat(PAL.lavender), orange = mat('#F08A4B'), white = mat('#FFFFFF');   // built facing +z: pole, arm, backboard, rim, net
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(.05, .065, 1.8, 8), pm); pole.position.y = .9; g.add(pole);
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(.13, .15, .1, 10), pm); pad.position.y = .05; g.add(pad);
    const arm = new THREE.Mesh(new THREE.BoxGeometry(.08, .08, .52), pm); arm.position.set(0, 1.62, .26); g.add(arm);
    const bb = new THREE.Mesh(new THREE.BoxGeometry(.8, .5, .04), [white, white, white, white, new THREE.MeshStandardMaterial({ map: boardTex.t, roughness: .5 }), white]); bb.position.set(0, 1.62, .52); g.add(bb);
    const brk = new THREE.Mesh(new THREE.BoxGeometry(.05, .03, .06), orange); brk.position.set(0, 1.45, .56); g.add(brk);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(.15, .018, 6, 20), orange); rim.rotation.x = Math.PI / 2; rim.position.set(0, 1.45, .69); g.add(rim);
    const net = new THREE.Mesh(new THREE.CylinderGeometry(.15, .1, .22, 12, 1, true), mat('#FFFFFF', { side: THREE.DoubleSide })); net.position.set(0, 1.33, .69); g.add(net);
    return sh(g); };
  const hoops = [hoop(), hoop()];
  hoops[0].position.set(0, 0, -4.45); hoops[1].position.set(0, 0, 4.45); hoops[1].rotation.y = Math.PI; court.add(...hoops);   // rims at z = -/+3.76
  const ball = new THREE.Group(); { ball.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.13, 1), mat('#F08A4B')));
    for (const r of [0, Math.PI / 2]) { const s = new THREE.Mesh(new THREE.TorusGeometry(.132, .008, 4, 20), mat('#5A3A2E')); s.rotation.y = r; ball.add(s); } }
  court.add(ball); city.ball = ball;                                   // positioned by main.js in court coordinates
  sh(court); turf.castShadow = false;
  city.court = { root: court, turf, hoops };
  // school
  const school = new THREE.Group(); school.position.set(-8, 0, 15.2); scene.add(school);
  const sparts = [];
  const sw = new THREE.Mesh(new THREE.BoxGeometry(4.2, 1.6, 2.6), mat(C2.butter)); sw.position.y = .8; school.add(sw); sparts.push(sw);
  const sroof = new THREE.Mesh(new THREE.ConeGeometry(3.2, 1.1, 4), mat(C2.powder)); sroof.rotation.y = Math.PI / 4; sroof.scale.set(1, 1, .62); sroof.position.y = 2.15; school.add(sroof); sparts.push(sroof);
  const swm = winM();
  for (const x of [-1.45, 0, 1.45]) { if (x === 0) continue; const w = new THREE.Mesh(new THREE.BoxGeometry(.7, .55, .05), swm); w.position.set(x, .95, 1.31); school.add(w); sparts.push(w); }
  const w3 = new THREE.Mesh(new THREE.BoxGeometry(.5, .45, .05), swm); w3.position.set(-.75, 1.0, 1.31); school.add(w3); sparts.push(w3);
  const sdoor = new THREE.Mesh(new THREE.BoxGeometry(.55, .85, .05), mat('#C08F72')); sdoor.position.set(.62, .43, 1.31); school.add(sdoor); sparts.push(sdoor);
  const sclock = signTex((x, v, w, h) => { x.fillStyle = '#FFFBF2'; x.beginPath(); x.arc(w / 2, h / 2, w / 2 - 4, 0, 7); x.fill(); x.lineWidth = 9; x.strokeStyle = '#7FA5D8'; x.stroke();
    x.strokeStyle = '#4B3A36'; x.lineCap = 'round'; x.lineWidth = 9; x.beginPath(); x.moveTo(w / 2, h / 2); x.lineTo(w / 2, h * .26); x.stroke(); x.lineWidth = 6; x.beginPath(); x.moveTo(w / 2, h / 2); x.lineTo(w * .7, h / 2); x.stroke(); }, 128, 128); sclock.set(1);
  const sc = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .04, 20), new THREE.MeshStandardMaterial({ map: sclock.t })); sc.rotation.x = Math.PI / 2; sc.position.set(.62, 1.27, 1.32); school.add(sc); sparts.push(sc);
  const ssign = signTex((x, v, w, h) => { x.fillStyle = '#7FA5D8'; x.fillRect(0, 0, w, h); x.fillStyle = '#FFFFFF'; x.font = '70px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('SEKOLAH', w / 2, h / 2 + 4); }, 400, 110); ssign.set(1);
  const sg = new THREE.Mesh(new THREE.BoxGeometry(1.5, .4, .05), new THREE.MeshStandardMaterial({ map: ssign.t })); sg.position.set(-.55, 1.43, 1.32); school.add(sg); sparts.push(sg);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, 2.4, 5), mat('#D9D5CF')); pole.position.set(2.6, 1.2, 1.6); school.add(pole); sparts.push(pole);
  const flag = new THREE.Group(); { const r = new THREE.Mesh(new THREE.BoxGeometry(.5, .14, .02), mat('#E5575B')); r.position.y = .07; flag.add(r); const w = new THREE.Mesh(new THREE.BoxGeometry(.5, .14, .02), mat('#FFFFFF')); w.position.y = -.07; flag.add(w); }
  flag.position.set(2.86, 2.25, 1.6); school.add(flag); sparts.push(flag);
  sh(school);
  city.school = { root: school, parts: sparts, door: sdoor };

  // ---------- appear on the time-lapse clock ----------
  city.appear = (t, tw) => {
    for (const it of city.items) {
      if (it.kind === 'always') { it.obj.visible = t >= it.t0; continue; }
      const k = it.kind === 'roll' ? eo(seg(tw, it.t0, it.t0 + .12)) : pop(tw, it.t0, it.kind === 'rise' ? .3 : .22);
      it.obj.visible = t >= cue.S6 && k > 0;
      if (it.kind === 'roll') { it.obj.scale.set(it.axis === 'x' ? Math.max(.001, k) : 1, 1, it.axis === 'z' ? Math.max(.001, k) : 1); }
      else if (it.kind === 'rise') it.obj.scale.set(1, Math.max(.001, k), 1);
      else it.obj.scale.setScalar(Math.max(.001, k));
    }
    for (const h of city.houses) {                                       // a house assembles itself like toy blocks: walls, roof, then the details
      h.g.visible = t >= cue.S6 && tw >= h.t0;
      h.parts.forEach((p, j) => { const k = pop(tw, h.t0 + j * .07, .2); p.visible = k > 0; p.scale.set(1, Math.max(.001, k), 1); });
    }
    city.rukoDoors.forEach((d, k) => { d.position.y = .6 + (k === 1 ? .95 * eio(seg(t, cue.rolldoor, cue.rolldoor + .55)) : 0); d.scale.y = k === 1 ? 1 - .7 * eio(seg(t, cue.rolldoor, cue.rolldoor + .55)) : 1; });
    // park: the lawn unrolls, flowers burst, then the props
    const P = city.park, lp = eo(seg(tw, T8 + .1, T8 + .4));
    P.root.visible = t >= T8; P.lawn.scale.set(Math.max(.001, lp), 1, 1); P.lawn.position.x = -4 * (1 - lp);
    P.flowers.forEach((f, i) => f.scale.setScalar(Math.max(.001, pop(tw, T8 + .45 + (i % 12) * .03 + Math.floor(i / 12) * .05, .2))));
    P.props.forEach((p, i) => p.scale.setScalar(Math.max(.001, pop(tw, T8 + .7 + i * .12, .25))));
    city.swing.userData.seat.rotation.z = Math.sin(t * 3.2) * .45;
    const F = city.court, fl = eo(seg(tw, cue.lapangan - .45, cue.lapangan - .15));
    F.root.visible = t >= T8; F.turf.scale.set(Math.max(.001, fl), 1, Math.max(.001, fl)); F.hoops.forEach((g, i) => g.scale.setScalar(Math.max(.001, pop(tw, cue.lapangan - .15 + i * .1, .25))));
    const S = city.school; S.root.visible = t >= T8;
    S.parts.forEach((p, j) => { const k = pop(tw, cue.atSchool - .25 + j * .05, .22); p.visible = k > 0; p.scale.set(1, Math.max(.001, k), 1); });
  };
  // ---------- night: lamps one by one along the roads, then the windows ----------
  city.night = (t, k) => {
    const n = city.lamps.length, t0 = cue.lights;
    city.lamps.forEach((L, i) => { const on = t >= t0 + i / n * 1.3 ? 1 : 0, f = on * k; L.hm.emissiveIntensity = 2.2 * f; L.glow.material.opacity = .85 * f; L.pool.material.opacity = .55 * f; });
    city.windows.forEach((m, i) => { const on = t >= t0 + .5 + (hash(i * 3.3) * .9) ? 1 : 0; m.emissiveIntensity = 1.3 * on * k; });
  };
  return city;
}

// ---------- the citizens: 103 pastel capsules (instanced), eyes included ----------
export function makeCrowd(scene, n = 103) {
  const cols = ['#F2A88A', '#F2B8C6', '#A9C8EC', '#C9B8E8', '#F7DD8C', '#E8B4A0', '#F6C28B', '#B5C4E8', '#E9A7D0', '#9EC9E8', '#FFD1A6', '#D7B8E0'];   // no mint: mint belongs to @cha_cha_awk
  const body = new THREE.InstancedMesh(new THREE.CapsuleGeometry(.24, .42, 6, 14), new THREE.MeshStandardMaterial({ roughness: .45 }), n);
  const eyes = new THREE.InstancedMesh(new THREE.SphereGeometry(.03, 8, 6), new THREE.MeshStandardMaterial({ color: '#2C2A33', roughness: .3 }), n * 2);
  body.castShadow = true; body.receiveShadow = true;
  body.frustumCulled = eyes.frustumCulled = false;                    // instances move all over town: the bounding sphere at creation would cull them
  const R = mulberry(77), col = new THREE.Color();
  const people = [];
  for (let i = 0; i < n; i++) { col.set(cols[Math.floor(R() * cols.length)]); body.setColorAt(i, col); people.push({ ph: R() * 6.28, sp: 6 + R() * 4, h: .12 + R() * .18, s: .9 + R() * .2 }); }
  body.instanceColor.needsUpdate = true;
  scene.add(body, eyes);
  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3(), em = new THREE.Matrix4();
  const crowd = { body, eyes, people, n };
  crowd.setColor = (i, c) => { col.set(c); body.setColorAt(i, col); body.instanceColor.needsUpdate = true; };
  // pose(i, {x, y, z, ry, rz, rx, sx, sy, vis})
  crowd.pose = (i, p) => {
    if (!p.vis) { m.makeScale(0, 0, 0); body.setMatrixAt(i, m); eyes.setMatrixAt(2 * i, m); eyes.setMatrixAt(2 * i + 1, m); return; }
    const s = people[i].s;
    e.set(p.rx || 0, p.ry || 0, p.rz || 0, 'YXZ'); q.setFromEuler(e);
    sc.set((p.sx || 1) * s, (p.sy || 1) * s, (p.sx || 1) * s);
    m.compose(v.set(p.x, p.y + .45 * (p.sy || 1) * s, p.z), q, sc); body.setMatrixAt(i, m);
    for (const k of [0, 1]) { em.makeTranslation(k ? .085 : -.085, .2, .225); em.premultiply(m); eyes.setMatrixAt(2 * i + k, em); }
  };
  crowd.commit = () => { body.instanceMatrix.needsUpdate = true; eyes.instanceMatrix.needsUpdate = true; };
  return crowd;
}
