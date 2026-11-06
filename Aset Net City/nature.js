// Day 5: the Kawasan Alam outside the west side of the city. @bilalzharkasi's mountain (green, low-poly, quiet: no smoke, no crater,
// no lava) with the Mayor's zig-zag trail, the waterfall from a gap in its south face into a round pool, the river the Mayor added,
// and @njemaa_28's Netizen Beach: cream sand, a pastel sea, umbrellas and loungers, the lifeguard tower with its safety board,
// the NETIZEN BEACH gate with a blush pink ribbon. Everything grows on the time-lapse clock and lights up at night.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry, clamp, lerp, seg, back, eo, eio, hash, vnoise } from '/core/lib.js';
import { PAL, signTex, groundY } from './world.js';
import { MT, TW, POOL, riverCurve, riverWidth, riverDist, SHORE, shoreS, ALONG, INLAND, shoreAt, alongOf, sandY, BEACH } from './land.js';

const TAU = Math.PI * 2;
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .8, metalness: 0, flatShading: true, ...o });
const sh = m => { m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return m; };
const pop = (k, t0, d = .25) => k < t0 ? 0 : back(seg(k, t0, t0 + d), 2.2);
const vc = (g, c) => { const col = new THREE.Color(c), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) col.toArray(a, i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; };
const B = (w, h, d, x, y, z, c) => vc(new THREE.BoxGeometry(w, h, d).translate(x, y, z), c);
const M4 = new THREE.Matrix4(), QQ = new THREE.Quaternion(), EE = new THREE.Euler(), PV = new THREE.Vector3(), SV = new THREE.Vector3();
const setM = (m, i, x, y, z, ry, s, rx = 0, rz = 0) => { QQ.setFromEuler(EE.set(rx, ry, rz, 'YXZ')); m.setMatrixAt(i, M4.compose(PV.set(x, y, z), QQ, typeof s === 'number' ? SV.set(s, s, s) : SV.set(...s))); };
const hide = (m, i) => m.setMatrixAt(i, M4.makeScale(0, 0, 0));
const yawTo = (dx, dz) => Math.atan2(dx, dz);                           // the rotation.y that turns local +z toward (dx, dz)

// ---------- a material that is revealed along an attribute (the river flows in; the sand spreads from the middle of the beach) ----------
function revealed(m, key) {
  const U = { uRev: { value: 0 } };
  m.onBeforeCompile = s => {
    Object.assign(s.uniforms, U);
    s.vertexShader = 'attribute float au; varying float vAu;\n' + s.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vAu = au;');
    s.fragmentShader = 'uniform float uRev; varying float vAu;\n' + s.fragmentShader.replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n if (vAu > uRev) discard;');
  };
  m.customProgramCacheKey = () => 'rev-' + key; m.userData.U = U; return m;
}
function waterTex(base = '#93D0EC', seed = 8) {
  const c = document.createElement('canvas'); c.width = 64; c.height = 256; const x = c.getContext('2d'), R = mulberry(seed);
  x.fillStyle = base; x.fillRect(0, 0, 64, 256);
  for (let i = 0; i < 10; i++) { x.fillStyle = i % 3 ? 'rgba(255,255,255,.8)' : 'rgba(214,241,251,.95)'; const X = R() * 60, w = 2 + R() * 3, y0 = R() * 256, L = 50 + R() * 150; x.fillRect(X, y0, w, L); if (y0 + L > 256) x.fillRect(X, 0, w, y0 + L - 256); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
}

// ---------- the mountain: rings of a faceted cone, one band per ring, so it can be built layer by layer like pastel blocks ----------
const F = MT.F, YS = [-2, 4, 10, 16, 22, 28, 34, 40, 46, 52, 58].map(y => y * F), NS = 18;
const prof = y => MT.R0 * Math.pow(clamp(1 - Math.max(0, y) / MT.H), .78) - Math.min(0, y);
const RING = YS.map((y, i) => Array.from({ length: NS }, (_, j) => { const th = j / NS * TAU;
  return prof(y) * (1 + .1 * Math.sin(2 * th + 1) + .06 * Math.sin(3 * th + 2.4) + (i ? (hash(i * 13.1 + j * 7.3) - .5) * .12 : 0)); }));
export function surfR(th, y) {                                          // the mountain's radius at a bearing and a height (as the mesh is built)
  th = ((th % TAU) + TAU) % TAU; const f = th / TAU * NS, j = Math.floor(f) % NS, fj = f - Math.floor(f), j1 = (j + 1) % NS;
  const top = YS[YS.length - 1];
  if (y >= top) return lerp(RING[YS.length - 1][j], RING[YS.length - 1][j1], fj) * clamp(1 - (y - top) / (MT.H - top));
  let i = 0; while (i < YS.length - 2 && y > YS[i + 1]) i++;
  const v = clamp((y - YS[i]) / (YS[i + 1] - YS[i]));
  return lerp(lerp(RING[i][j], RING[i][j1], fj), lerp(RING[i + 1][j], RING[i + 1][j1], fj), v);
}
export const onMt = (th, r, y) => new THREE.Vector3(MT.x + Math.cos(th) * r, y, MT.z + Math.sin(th) * r);
const BANDC = ['#93BF84', '#9CC48A', '#A2CB91', '#9FD2AE', '#A8DCC8', '#B1E0CC', '#BCE5D3', '#C8EADA', '#D4EEE1', '#DFF3E8', '#EAF7EF'];

// the trail: switchbacks on the south-east face, between two bearings; a stone path on a ledge with a low rock wall on its outer side
const TA = 1.12, TB = 1.32, RISE = 4;
export const TRAIL_LEGS = 8;                                             // legs 0..7; the top bend (node 8) is a lookout
export const TRAIL = Array.from({ length: TRAIL_LEGS + 1 }, (_, k) => [k % 2 ? TA : TB, .55 + k * RISE]);
export const TRAIL_OUT = .95;                                            // the walking line: this far out from the slope
function trailPath() {
  const pts = [];
  for (let k = 0; k < TRAIL.length - 1; k++) { const [a0, y0] = TRAIL[k], [a1, y1] = TRAIL[k + 1];
    for (let i = k ? 1 : 0; i <= 40; i++) { const u = i / 40, th = lerp(a0, a1, u), y = lerp(y0, y1, u); pts.push({ th, y, r: surfR(th, y) + TRAIL_OUT, leg: k, u }); } }
  let acc = 0; pts.forEach((p, i) => { p.v = onMt(p.th, p.r, p.y + .05); if (i) acc += p.v.distanceTo(pts[i - 1].v); p.s = acc; });
  return pts;
}
export const PATH = trailPath(), PATH_LEN = PATH[PATH.length - 1].s;
export function pathAt(s) {                                              // position and walking direction at a distance along the trail
  s = clamp(s, 0, PATH_LEN); let i = 1; while (i < PATH.length - 1 && PATH[i].s < s) i++;
  const a = PATH[i - 1], b = PATH[i], k = (s - a.s) / Math.max(1e-6, b.s - a.s);
  return { p: a.v.clone().lerp(b.v, k), dir: b.v.clone().sub(a.v).normalize(), leg: a.leg, th: lerp(a.th, b.th, k), y: lerp(a.y, b.y, k) };
}
export const sAtNode = k => k === 0 ? 0 : PATH.find(p => p.leg === k - 1 && p.u === 1).s;
export function legYAt(k, th) { const [a0, y0] = TRAIL[k], [a1, y1] = TRAIL[k + 1]; return lerp(y0, y1, (th - a0) / (a1 - a0)); }
// the stone path to the mountain: from the foot of the trail out onto the grass, then east toward the city (straight at its end, where the ambulance stops)
const O0 = [Math.cos(TB), Math.sin(TB)];
export const APPROACH = new THREE.CatmullRomCurve3([[0, 0], [5, 0], [9, 4], [10, 14], [9.6, 28], [9.6, 46]]
  .map(([o, e]) => new THREE.Vector3(PATH[0].v.x + O0[0] * o + e, 0, PATH[0].v.z + O0[1] * o)), false, 'catmullrom', .5);

export function makeMountain() {
  const root = new THREE.Group(), bands = [], c = new THREE.Color(), R = mulberry(55), bm = mat('#ffffff', { vertexColors: true, roughness: .95 });
  const P = (i, j) => { const th = (j % NS) / NS * TAU, r = RING[i][j % NS]; return [Math.cos(th) * r, YS[i], Math.sin(th) * r]; };
  for (let i = 0; i < YS.length; i++) {
    const pos = [], col = [], base = new THREE.Color(BANDC[i]);
    for (let j = 0; j < NS; j++) {
      const a = P(i, j), b = P(i, j + 1), tris = i < YS.length - 1 ? [[a, P(i + 1, j), b], [b, P(i + 1, j), P(i + 1, j + 1)]] : [[a, [0, MT.H, 0], b]];
      for (const t of tris) { c.copy(base).offsetHSL(0, 0, (R() - .5) * .05 + (i % 2 ? .012 : -.012)); for (const v of t) { pos.push(v[0], v[1] - YS[i], v[2]); col.push(c.r, c.g, c.b); } }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, bm); m.position.set(MT.x, YS[i], MT.z); m.castShadow = m.receiveShadow = true; root.add(m); bands.push(m);
  }
  // soft white clouds around the peak
  const clouds = new THREE.Group(), cm = mat('#FFFFFF', { roughness: 1, emissive: '#ffffff', emissiveIntensity: .3 }), Rc = mulberry(9);
  for (let i = 0; i < 7; i++) { const cl = new THREE.Group(), a = i / 7 * TAU + Rc() * .4, r = 13 + Rc() * 7;
    for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(2.6 + Rc() * 2.2, 0), cm); b.position.set(k * 3.2 - 4.8, Rc() * 1.4, Rc() * 2); b.scale.y = .62; cl.add(b); }
    cl.position.set(Math.cos(a) * r, 52 + Rc() * 7, Math.sin(a) * r); cl.rotation.y = -a; clouds.add(cl); }
  clouds.position.set(MT.x, 0, MT.z); clouds.scale.setScalar(F); root.add(clouds);
  // the trail: tread and outer wall per leg, flat stones laid on the tread, small boulders along the edge
  const tread = [], wall = [];
  for (let k = 0; k < TRAIL_LEGS; k++) { const P2 = PATH.filter(p => p.leg === k);
    for (let i = 0; i < P2.length - 1; i++) { const a = P2[i], b = P2[i + 1], q = [];
      for (const p of [a, b]) { const r0 = p.r - TRAIL_OUT - .35, r1 = p.r + .95; q.push(onMt(p.th, r0, p.y), onMt(p.th, r1, p.y)); }
      const [ai, ao, bi, bo] = q, y0 = new THREE.Vector3(0, -3.2, 0);
      tread.push(ai, ao, bi, bi, ao, bo);
      wall.push(ao, ao.clone().add(y0), bo, bo, ao.clone().add(y0), bo.clone().add(y0)); } }
  const tg = new THREE.BufferGeometry().setFromPoints(tread); tg.computeVertexNormals();
  const wg = new THREE.BufferGeometry().setFromPoints(wall); wg.computeVertexNormals();
  const trail = new THREE.Group(); trail.add(new THREE.Mesh(tg, mat('#D9CBAE', { side: THREE.DoubleSide, roughness: 1 })), new THREE.Mesh(wg, mat('#B6B9A2', { side: THREE.DoubleSide, roughness: 1 })));
  { const [th, y] = TRAIL[TRAIL_LEGS], r = surfR(th, y), c = onMt(th, r + .8, y), land = new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, 3.3, 14).translate(0, -1.6, 0), mat('#D9CBAE', { roughness: 1 }));
    land.position.copy(c); trail.add(land); const rimM = mat('#B6B9A2', { roughness: 1 }), rim = new THREE.Mesh(new THREE.CylinderGeometry(1.95, 1.95, 3.25, 14, 1, true).translate(0, -1.65, 0), rimM); rim.position.copy(c); trail.add(rim);
    for (let i = 0; i < 7; i++) { const a = th + .2 + i / 7 * Math.PI * 1.1 - .2; const p = new THREE.Mesh(new THREE.CylinderGeometry(.05, .06, .55, 5).translate(0, .28, 0), mat(PAL.woodDark)); p.position.set(c.x + Math.cos(a) * 1.75, y, c.z + Math.sin(a) * 1.75); trail.add(p); } }
  const slabs = [], edge = [], Rs = mulberry(77);
  for (let k = 0; k < TRAIL_LEGS; k++) for (let s = sAtNode(k) + .25; s < sAtNode(k + 1) - .1; s += .6) { const q = pathAt(s), rr = surfR(q.th, q.y) + TRAIL_OUT;
    for (const o of [-.72, 0, .7]) if (Rs() > .1) slabs.push([onMt(q.th, rr + o + (Rs() - .5) * .16, q.y + .03), .25 + Rs() * .1, Rs() * 6, Rs()]);
    if (Rs() < .75) edge.push([onMt(q.th, rr + 1.02, q.y + .08), .15 + Rs() * .13, Rs()]); }
  // the way out to the trail: stepping stones over the grass, two across
  { const AL = APPROACH.getLength();
    for (let d = 2.2; d < AL - .3; d += .72) { const u = d / AL, c = APPROACH.getPointAt(u), tg2 = APPROACH.getTangentAt(u);
      for (const o of [-.42, .42]) if (Rs() > .08) { const x = c.x - tg2.z * o + (Rs() - .5) * .14, z = c.z + tg2.x * o + (Rs() - .5) * .14; slabs.push([new THREE.Vector3(x, groundY(x, z) + .03, z), .27 + Rs() * .1, Rs() * 6, Rs()]); } } }
  const SC = ['#E6E0D4', '#D3CDC0', '#C6C1B4', '#DCD6CA', '#BEC4B7'], RC = ['#BDB9A3', '#CFCBB8', '#B5C2A0'], col0 = new THREE.Color();
  const slabM = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1.1, .1, 7), mat('#ffffff', { roughness: .9 }), slabs.length);
  slabs.forEach(([v, s, ry, c], i) => { setM(slabM, i, v.x, v.y, v.z, ry, [s, 1, s]); slabM.setColorAt(i, col0.set(SC[Math.floor(c * SC.length)])); });
  const edgeM = new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1, 0), mat('#ffffff', { roughness: .95 }), edge.length);
  edge.forEach(([v, s, c], i) => { setM(edgeM, i, v.x, v.y, v.z, c * 9, [s, s * .75, s], c * 5, c * 3); edgeM.setColorAt(i, col0.set(RC[Math.floor(c * RC.length)])); });
  for (const m of [slabM, edgeM]) { m.instanceColor.needsUpdate = true; m.frustumCulled = false; trail.add(m); }
  trail.traverse(o => { if (o.isMesh) { o.receiveShadow = true; o.castShadow = true; } }); root.add(trail);
  // the waterfall's buttress: a rock block on the south face with a sheer front, its top running back into the slope
  const cliff = new THREE.Group(); root.add(cliff);
  { const shp = new THREE.Shape([[30, -1], [53.2, -1], [53.2, 24], [47, 27.4], [30, 32.6]].map(([r, y]) => new THREE.Vector2(r, y)));
    const g = new THREE.ExtrudeGeometry(shp, { depth: 10, bevelEnabled: false }).translate(0, 0, -5);
    const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const h = hash(Math.round(p.getX(i) * 3) * 1.7 + Math.round(p.getY(i) * 3) * 3.1 + Math.round(p.getZ(i) * 3) * 5.3); if (p.getX(i) < 53 && p.getY(i) > 0) { p.setY(i, p.getY(i) + (h - .5) * .8); } }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, mat('#C9C6B0', { roughness: .95 })); m.rotation.y = -TW; cliff.add(m);
    const rk = new THREE.Group(); rk.rotation.y = -TW; cliff.add(rk); const Rr = mulberry(12);
    for (const [r, y, z, s] of [[53, 3, 5.4, 2.6], [53.2, 11, -5.3, 2.2], [52.8, 19, 5.2, 2.0], [53, 23.5, -5.0, 1.8], [50, 26, 4.8, 2.2], [44, 28.5, -5.0, 2.4], [38, 31, 4.6, 2.0], [53.5, .5, -5.6, 2.8], [55, .4, 4.2, 1.6], [56, .3, -3.8, 1.3]]) {
      const b = new THREE.Mesh(new THREE.DodecahedronGeometry(s, 0), mat(['#BDB9A3', '#D2CFBA', '#B5C2A0'][Math.floor(Rr() * 3)], { roughness: .95 })); b.position.set(r, y, z); b.rotation.set(Rr() * 3, Rr() * 3, Rr() * 3); b.scale.y = .8; rk.add(b); }
    const gap = new THREE.Mesh(new THREE.BoxGeometry(1.4, 3.4, 4.2).translate(30.6, 34, 0), mat('#5C8E8B', { roughness: .9 })); gap.rotation.y = -TW; cliff.add(gap);
    cliff.position.set(MT.x, 0, MT.z); cliff.scale.setScalar(F); sh(cliff); }
  // the water: a stream over the top of the buttress, the fall down its front, the round pool with foam
  const wt = waterTex(), fallM = new THREE.MeshStandardMaterial({ map: wt, roughness: .25, emissive: '#6FB6D6', emissiveIntensity: .25, side: THREE.DoubleSide });
  const water = new THREE.Group(); water.position.set(MT.x, 0, MT.z); water.rotation.y = -TW; water.scale.setScalar(F); root.add(water);
  const stream = new THREE.Group(); water.add(stream);
  { const seg2 = (r0, y0, r1, y1) => { const L = Math.hypot(r1 - r0, y1 - y0), g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute([r0, y0 + .14, -1.7, r0, y0 + .14, 1.7, r1, y1 + .14, -1.7, r1, y1 + .14, 1.7], 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute([0, L / 24, 1, L / 24, 0, 0, 1, 0], 2)); g.setIndex([0, 1, 2, 2, 1, 3]); g.computeVertexNormals(); return new THREE.Mesh(g, fallM); };
    stream.add(seg2(30.8, 32.4, 47, 27.4), seg2(47, 27.4, 53.2, 24)); }
  const fall = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 24).translate(0, -12, 0), fallM); fall.position.set(53.38, 24.1, 0); fall.rotation.y = Math.PI / 2; water.add(fall);
  const pool = new THREE.Group(); pool.position.set(POOL.x, 0, POOL.z); pool.scale.setScalar(F); root.add(pool);
  const PR = POOL.r / F;                                                  // the pool is built at the first size and scaled with the mountain
  const poolW = new THREE.Mesh(new THREE.CircleGeometry(PR, 32).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#8FCDEA', roughness: .15, metalness: .1, emissive: '#3E8FB8', emissiveIntensity: .12 })); poolW.position.y = .08; pool.add(poolW);
  const rim = new THREE.Mesh(new THREE.RingGeometry(PR - .1, PR + 1.3, 32).rotateX(-Math.PI / 2), mat('#D9CEB4', { roughness: 1, side: THREE.DoubleSide })); rim.position.y = .07; pool.add(rim);
  const foam = new THREE.Group(); pool.add(foam);
  { const fm = mat('#FFFFFF', { emissive: '#ffffff', emissiveIntensity: .25 }); const back_ = new THREE.Vector3(-Math.cos(TW), 0, -Math.sin(TW)).multiplyScalar(PR - 1.2);
    for (let i = 0; i < 11; i++) { const f = new THREE.Mesh(new THREE.IcosahedronGeometry(.55 + hash(i) * .5, 0), fm); f.position.set(back_.x + (hash(i * 3) - .5) * 4, .2, back_.z + (hash(i * 7) - .5) * 1.6); f.scale.y = .55; foam.add(f); } }
  const pebbles = new THREE.Group(); pool.add(pebbles);
  for (let i = 0; i < 18; i++) { const a = i / 18 * TAU, r = PR + .6 + hash(i * 5) * .5, p = new THREE.Mesh(new THREE.DodecahedronGeometry(.35 + hash(i) * .3, 0), mat(['#CFC6B8', '#E3DACB', '#BFB7A8'][i % 3])); p.position.set(Math.cos(a) * r, .15, Math.sin(a) * r); pebbles.add(p); }
  sh(pebbles);
  const mtn = { root, bands, clouds, trail, cliff, water, stream, fall, fallM, wt, pool, poolW, foam, rim, pebbles };
  // build: k runs 0..1 over the layers; w: the waterfall (0..1)
  mtn.build = (k, w, t) => {
    root.visible = k > 0;
    bands.forEach((b, i) => { const u = pop(k * (bands.length + 1.2), i, 1.15); b.visible = u > 0; b.scale.set(1, Math.max(.001, u), 1); });
    clouds.visible = k >= 1; clouds.children.forEach((c, i) => c.scale.setScalar(Math.max(.001, pop(k >= 1 ? 1 + (t % 1e3) : 0, 1 + 0 * i, .4))));
    clouds.rotation.y = t * .02;
    const kt = clamp(k * 1.15 - .15); trail.visible = kt > .75; trail.scale.setScalar(1); cliff.visible = k > .25; cliff.scale.set(F, F * Math.max(.001, pop(k, .25, .4)), F);
    stream.visible = fall.visible = w > 0; stream.scale.set(1, 1, 1); fall.scale.y = Math.max(.001, eo(seg(w, .15, .7)));
    pool.visible = k > .3; poolW.scale.setScalar(Math.max(.001, eo(seg(w, .45, 1)))); foam.visible = w > .6; foam.children.forEach((f, i) => f.scale.setScalar(.8 + .3 * Math.sin(t * 9 + i * 1.7)));
    wt.offset.y = t * 1.3;
  };
  return mtn;
}

// ---------- the river: a ribbon that flows in from the pool, sandy banks, round trees, little lamps, a rail bridge ----------
export function makeRiver(railZ) {
  const root = new THREE.Group(), N = 320, pts = riverCurve.getSpacedPoints(N), L = riverCurve.getLength();
  const wpos = [], wuv = [], wau = [], bpos = [], bau = [];
  for (let i = 0; i <= N; i++) { const u = i / N, c = pts[i], t = riverCurve.getTangentAt(u), nx = -t.z, nz = t.x, w = riverWidth(u) / 2;
    wpos.push(c.x + nx * w, .07, c.z + nz * w, c.x - nx * w, .07, c.z - nz * w); wuv.push(0, u * L / 7, 1, u * L / 7); wau.push(u, u);
    for (const s of [1, -1]) { bpos.push(c.x + s * nx * w, .055, c.z + s * nz * w, c.x + s * nx * (w + 1.6), .045, c.z + s * nz * (w + 1.6)); bau.push(u, u); } }
  const idx = n => { const out = []; for (let i = 0; i < N; i++) { const a = i * n, b = (i + 1) * n; out.push(a, b, a + 1, a + 1, b, b + 1); } return out; };
  const wg = new THREE.BufferGeometry(); wg.setAttribute('position', new THREE.Float32BufferAttribute(wpos, 3)); wg.setAttribute('uv', new THREE.Float32BufferAttribute(wuv, 2)); wg.setAttribute('au', new THREE.Float32BufferAttribute(wau, 1)); wg.setIndex(idx(2)); wg.computeVertexNormals();
  const rt = waterTex('#96D2EC', 21); rt.repeat.set(1, 1);
  const wm = revealed(new THREE.MeshStandardMaterial({ map: rt, roughness: .2, metalness: .05, emissive: '#5FA8C8', emissiveIntensity: .12, side: THREE.DoubleSide }), 'river');
  const water = new THREE.Mesh(wg, wm); water.receiveShadow = true; root.add(water);
  const bidx = []; for (let i = 0; i < N; i++) for (const s of [0, 2]) { const a = i * 4 + s, b = (i + 1) * 4 + s; bidx.push(a, b, a + 1, a + 1, b, b + 1); }
  const bg = new THREE.BufferGeometry(); bg.setAttribute('position', new THREE.Float32BufferAttribute(bpos, 3)); bg.setAttribute('au', new THREE.Float32BufferAttribute(bau, 1)); bg.setIndex(bidx); bg.computeVertexNormals();
  const bmat = revealed(new THREE.MeshStandardMaterial({ color: '#DCCFB0', roughness: 1, side: THREE.DoubleSide }), 'bank');
  const banks = new THREE.Mesh(bg, bmat); banks.receiveShadow = true; root.add(banks);
  // trees and lamps along both banks (not on the rails, not on the beach)
  const trees = [], lamps = [], R = mulberry(61);
  for (let d = 4; d < L - 6; d += 7.5) { const u = d / L, c = riverCurve.getPointAt(u), t = riverCurve.getTangentAt(u), w = riverWidth(u) / 2;
    for (const s of [1, -1]) { const off = w + 3.2 + R() * 3.4, x = c.x - t.z * s * off, z = c.z + t.x * s * off;
      if (Math.abs(z - railZ) < 4 || shoreS(x, z) > -20 || R() < .18) continue; trees.push({ x, z, u, s: .9 + R() * .5, ry: R() * 6, c: R() < .5 ? '#8FD3B8' : '#9CC48A' }); }
    if (Math.round(d / 7.5) % 2 === 0) for (const s of [1, -1]) { const off = w + 1.9, x = c.x - t.z * s * off, z = c.z + t.x * s * off; if (Math.abs(z - railZ) > 3 && shoreS(x, z) < -18) lamps.push({ x, z, u }); } }
  const trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(.12, .16, .9, 6).translate(0, .45, 0), mat('#B48A68'), trees.length);
  const crown = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(.95, 0).translate(0, 1.55, 0), mat('#ffffff'), trees.length);
  const col = new THREE.Color(); trees.forEach((tr, i) => crown.setColorAt(i, col.set(tr.c))); crown.instanceColor.needsUpdate = true;
  for (const m of [trunk, crown]) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; root.add(m); }
  const lampM = mat('#FFF4D8', { emissive: '#FFD58A', emissiveIntensity: 0 });
  const lpost = new THREE.InstancedMesh(new THREE.CylinderGeometry(.05, .06, 1.1, 6).translate(0, .55, 0), mat('#EEE6F6'), lamps.length);
  const lhead = new THREE.InstancedMesh(new THREE.SphereGeometry(.17, 10, 8).translate(0, 1.2, 0), lampM, lamps.length);
  for (const m of [lpost, lhead]) { m.frustumCulled = false; root.add(m); }
  // the little rail bridge where the river passes under the railway
  const bridge = new THREE.Group(); root.add(bridge);
  { let ub = 0, bd = 1e9; for (let i = 0; i <= 400; i++) { const p = riverCurve.getPointAt(i / 400), d = Math.abs(p.z - railZ); if (d < bd) { bd = d; ub = i / 400; } }
    const c = riverCurve.getPointAt(ub), w = riverWidth(ub) + 3.5, pink = mat('#F2A88A'), cream = mat('#FFF6E6');
    for (const s of [-1.12, 1.12]) {
      const arch = new THREE.Mesh(new THREE.TorusGeometry(w / 2, .2, 6, 16, Math.PI), pink); arch.scale.y = .32; arch.position.set(0, -.05, s); bridge.add(arch);
      const rail = new THREE.Mesh(new THREE.BoxGeometry(w + .6, .1, .1), cream); rail.position.set(0, .62, s); bridge.add(rail);
      for (let k = 0; k <= 6; k++) { const p = new THREE.Mesh(new THREE.BoxGeometry(.1, .62, .1).translate(0, .31, 0), cream); p.position.set(-w / 2 - .3 + k * (w + .6) / 6, 0, s); bridge.add(p); } }
    const deck = new THREE.Mesh(new THREE.BoxGeometry(w + .6, .12, 2.36), mat('#E7DCCB')); deck.position.y = .0; bridge.add(deck);
    bridge.position.set(c.x, .05, railZ); bridge.userData.u = ub; sh(bridge); }
  const rv = { root, water, banks, trees, lamps, trunk, crown, lpost, lhead, lampM, bridge, rt, L };
  rv.build = (k, t) => {                                                    // k: 0..1, the water reaching the sea
    root.visible = k > 0; wm.userData.U.uRev.value = k; bmat.userData.U.uRev.value = k; rt.offset.y = -t * .9;
    trees.forEach((tr, i) => { const s = tr.s * pop(k, tr.u + .03, .12); if (s <= .001) { hide(trunk, i); hide(crown, i); return; } setM(trunk, i, tr.x, .05, tr.z, tr.ry, s); setM(crown, i, tr.x, .05, tr.z, tr.ry, s); });
    lamps.forEach((l, i) => { const s = pop(k, l.u + .05, .12); if (s <= .001) { hide(lpost, i); hide(lhead, i); return; } setM(lpost, i, l.x, .05, l.z, 0, [1, s, 1]); setM(lhead, i, l.x, .05, l.z, 0, [1, s, 1]); });
    for (const m of [trunk, crown, lpost, lhead]) m.instanceMatrix.needsUpdate = true;
    const bk = pop(k, bridge.userData.u + .02, .2); bridge.visible = bk > 0; bridge.scale.setScalar(Math.max(.001, bk));
  };
  return rv;
}

// ---------- Netizen Beach ----------
function signBoard(w, h, draw) { const s = signTex(draw, w, h); s.set(1); return new THREE.MeshStandardMaterial({ map: s.t, roughness: .75 }); }
export function makeBeach() {
  const root = new THREE.Group(), R = mulberry(71);
  // the sand: along the whole coast, the inland edge a little wavy; spreads from the middle of the beach
  const A0 = -70, A1 = 175, NA = 140, NSs = 8, spos = [], scol = [], sau = [], cDry = new THREE.Color('#F5E6C4'), cWet = new THREE.Color('#E3CEA2'), c = new THREE.Color();
  const sOf = (a, j) => { const s0 = -16.5 - 2.6 * vnoise(a * .09 + 3); return lerp(s0, 7, j / NSs); };
  const vert = (a, j) => { const s = sOf(a, j), [x, z] = shoreAt(a, s); return [x, sandY(s), z, s]; };
  for (let i = 0; i < NA; i++) for (let j = 0; j < NSs; j++) {
    const a0 = lerp(A0, A1, i / NA), a1 = lerp(A0, A1, (i + 1) / NA), q = [vert(a0, j), vert(a1, j), vert(a0, j + 1), vert(a1, j + 1)];
    const cx = (q[0][0] + q[3][0]) / 2, cz = (q[0][2] + q[3][2]) / 2, [dr, ur] = riverDist(cx, cz); if (dr < riverWidth(ur) / 2 + 1.2) continue;
    for (const tri of [[0, 2, 1], [1, 2, 3]]) { const sm = (q[tri[0]][3] + q[tri[1]][3] + q[tri[2]][3]) / 3; c.copy(sm < -4.5 ? cDry : cWet).offsetHSL(0, 0, (R() - .5) * .025);
      for (const v of tri) { spos.push(q[v][0], q[v][1], q[v][2]); scol.push(c.r, c.g, c.b); sau.push(Math.abs((a0 + a1) / 2 - 22) / 155); } }
  }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.Float32BufferAttribute(spos, 3)); sg.setAttribute('color', new THREE.Float32BufferAttribute(scol, 3)); sg.setAttribute('au', new THREE.Float32BufferAttribute(sau, 1)); sg.computeVertexNormals();
  const sandM = revealed(mat('#ffffff', { vertexColors: true, roughness: 1, side: THREE.DoubleSide }), 'sand');
  const sand = new THREE.Mesh(sg, sandM); sand.receiveShadow = true; root.add(sand);
  // the sea: pastel blue going mint at the shore; rises into the hollow when it forms
  const sea = new THREE.Group(); root.add(sea);
  { const g = new THREE.PlaneGeometry(1800, 1500, 36, 30).rotateX(-Math.PI / 2), p = g.attributes.position, cols = [];
    const cs = [[-6, '#AEE6D7'], [8, '#A2DFDA'], [40, '#8FD0EA'], [160, '#84C3E6'], [800, '#7EB7DE']];
    for (let i = 0; i < p.count; i++) { const along = p.getX(i), s = p.getZ(i) + 750 - 6; const [x, z] = shoreAt(along, s); p.setXYZ(i, x, 0, z);
      let k = 0; while (k < cs.length - 2 && s > cs[k + 1][0]) k++; c.set(cs[k][1]).lerp(new THREE.Color(cs[k + 1][1]), clamp((s - cs[k][0]) / (cs[k + 1][0] - cs[k][0]))); cols.push(c.r, c.g, c.b); }
    g.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3)); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .22, metalness: .06, side: THREE.DoubleSide })); m.receiveShadow = true; sea.add(m); }
  // foam: thin white lines that wash in and out along the waterline
  const foam = []; for (let k = 0; k < 3; k++) { const g = new THREE.PlaneGeometry(A1 - A0, .45 - k * .1).rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: .85 - k * .2, depthWrite: false }));
    const mid = (A0 + A1) / 2; m.userData.mid = mid; m.rotation.y = Math.atan2(-ALONG[1], ALONG[0]); root.add(m); foam.push(m); }
  // umbrellas and loungers in two rows, towels
  const ums = []; for (let a = 2; a < 64; a += 4.6 + R() * 1.8) for (const s of [-12.6, -8.6]) { if (R() < .22) continue; ums.push({ a: a + (s > -10 ? 2.2 : 0), s: s + (R() - .5) * .8, c: ['#F2A88A', '#A8DCC8', '#F7D772', '#C4B3E3', '#F2B8C6', '#A9C8EC'][Math.floor(R() * 6)], ry: R() * 6, lc: ['#F7ECD6', '#A9C8EC', '#F2B8C6', '#F7D772'][Math.floor(R() * 4)] }); }
  ums.sort((p, q) => p.a - q.a);
  const cone = new THREE.ConeGeometry(1.0, .48, 8, 1, true).toNonIndexed(); { const p = cone.attributes.position, cols = []; for (let i = 0; i < p.count; i += 3) { const ang = Math.atan2((p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3, (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3), white = Math.floor((ang + Math.PI) / (TAU / 8)) % 2; for (let k = 0; k < 3; k++) cols.push(white, white, white); } cone.setAttribute('wh', new THREE.Float32BufferAttribute(cols, 3)); }
  cone.translate(0, 1.85, 0);
  const umM = mat('#ffffff', { side: THREE.DoubleSide });
  umM.onBeforeCompile = s => { s.vertexShader = 'attribute vec3 wh; varying vec3 vWh;\n' + s.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vWh = wh;');
    s.fragmentShader = 'varying vec3 vWh;\n' + s.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.0, .98, .95), vWh.x);'); };
  umM.customProgramCacheKey = () => 'umbrella';
  const canopy = new THREE.InstancedMesh(cone, umM, ums.length), pole = new THREE.InstancedMesh(new THREE.CylinderGeometry(.04, .04, 1.9, 5).translate(0, .95, 0), mat('#F4F1EA'), ums.length);
  const lounger = new THREE.InstancedMesh(mergeGeometries([B(1.4, .1, .55, 0, .28, 0, '#ffffff'), B(.08, .26, .5, -.6, .14, 0, '#E9E2D8'), B(.08, .26, .5, .5, .14, 0, '#E9E2D8'), B(.5, .1, .55, -.82, .5, 0, '#ffffff').rotateZ(.0)]), mat('#ffffff', { vertexColors: true }), ums.length);
  ums.forEach((u, i) => { canopy.setColorAt(i, c.set(u.c)); lounger.setColorAt(i, c.set(u.lc)); }); canopy.instanceColor.needsUpdate = true; lounger.instanceColor.needsUpdate = true;
  for (const m of [canopy, pole, lounger]) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; root.add(m); }
  // the lifeguard tower (coral and cream), its lamp, the lifeguard (a coral capsule with a whistle), the safety board
  const tower = new THREE.Group(); root.add(tower);
  { const coral = mat('#F28C7A'), cream = mat('#FFF6E6'), wood = mat(PAL.woodDark);
    for (const [x, z] of [[-.7, -.7], [.7, -.7], [-.7, .7], [.7, .7]]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.14, 2.6, .14).translate(0, 1.3, 0), cream); l.position.set(x, 0, z); tower.add(l); }
    for (const z of [-.7, .7]) { const x1 = new THREE.Mesh(new THREE.BoxGeometry(.08, 2.0, .08), cream); x1.position.set(0, 1.1, z); x1.rotation.z = .62; tower.add(x1); }
    tower.add(new THREE.Mesh(new THREE.BoxGeometry(1.9, .14, 1.9).translate(0, 2.65, 0), coral));
    const cab = new THREE.Mesh(new THREE.BoxGeometry(1.5, .9, 1.3).translate(0, 3.2, -.25), cream); tower.add(cab);
    for (const s of [-1, 1]) tower.add(new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .02).translate(s * .4, 3.3, .41), mat('#8FB7D8', { roughness: .2 })));
    const roof = new THREE.Mesh(new THREE.ConeGeometry(1.45, .8, 4).rotateY(Math.PI / 4).translate(0, 4.05, -.15), coral); tower.add(roof);
    const rail = new THREE.Mesh(new THREE.BoxGeometry(1.9, .08, .08).translate(0, 3.05, .9), coral); tower.add(rail);
    for (let k = 0; k < 5; k++) { const r = new THREE.Mesh(new THREE.BoxGeometry(.6, .05, .1), wood); r.position.set(0, .3 + k * .48, -1.25 - k * .05); tower.add(r); }
    for (const s of [-1, 1]) { const st = new THREE.Mesh(new THREE.BoxGeometry(.07, 2.8, .07), wood); st.position.set(s * .32, 1.3, -1.35); st.rotation.x = -.12; tower.add(st); }
    const flagP = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 1.2, 5).translate(0, 4.7, 0), cream); tower.add(flagP);
    const flag = new THREE.Mesh(new THREE.BoxGeometry(.6, .36, .02).translate(.3, 5.1, 0), mat('#F7D772')); tower.add(flag); tower.userData.flag = flag; }
  const towerLampM = mat('#FFF4D8', { emissive: '#FFD58A', emissiveIntensity: 0 }); { const l = new THREE.Mesh(new THREE.SphereGeometry(.16, 10, 8).translate(0, 4.6, .35), towerLampM); tower.add(l); }
  const guard = makeCapsule('#F28C7A'); guard.root.position.set(0, 2.72, .45); tower.add(guard.root);
  { const w = new THREE.Mesh(new THREE.CylinderGeometry(.045, .05, .16, 8).rotateX(Math.PI / 2), mat('#F7D772', { metalness: .3, roughness: .4 })); w.position.set(.0, .62, .3); guard.body.add(w); guard.whistle = w; }
  sh(tower);
  const safety = new THREE.Group(); root.add(safety);
  { const face = signBoard(512, 300, (x, v, w, h) => { x.fillStyle = '#FFF4DA'; x.fillRect(0, 0, w, h); x.strokeStyle = '#F28C7A'; x.lineWidth = 18; x.strokeRect(9, 9, w - 18, h - 18);
      x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = '#E2604F'; x.font = '84px "Lilita One"'; x.fillText('HATI-HATI!', w / 2, h * .32);
      x.fillStyle = '#4B3A36'; x.font = '44px "Lilita One"'; x.fillText('BERENANG DI AREA', w / 2, h * .6); x.fillText('YANG DIJAGA', w / 2, h * .79); });
    const side = mat('#F7ECD6'); const b = new THREE.Mesh(new THREE.BoxGeometry(1.9, 1.12, .07), [side, side, side, side, face, side]); b.position.y = 1.55; safety.add(b);
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.09, 1.6, .09).translate(0, .8, 0), mat(PAL.woodDark)); p.position.set(s * .7, 0, -.06); safety.add(p); }
    sh(safety); }
  // a line of floats around the guarded swimming area
  const floats = []; { const a0 = 24, a1 = 46; for (let a = a0; a <= a1; a += 1.1) floats.push([a, 9.5]); for (const a of [a0, a1]) for (let s = -1; s < 9.5; s += 1.1) floats.push([a, s]); }
  const fl = new THREE.InstancedMesh(new THREE.SphereGeometry(.24, 10, 8), mat('#ffffff', { flatShading: false, roughness: .4 }), floats.length);
  floats.forEach((f, i) => fl.setColorAt(i, c.set(i % 2 ? '#FFFFFF' : '#F28C7A'))); fl.instanceColor.needsUpdate = true; fl.frustumCulled = false; root.add(fl);
  // the gate: NETIZEN BEACH, wooden, on the inland edge of the sand; a blush pink ribbon across it
  const gate = new THREE.Group(); root.add(gate);
  const gateLampM = mat('#FFF4D8', { emissive: '#FFD58A', emissiveIntensity: 0 }), ribbonM = mat('#F2A0B4', { roughness: .5 });
  const ribbon = [];
  { const wood = mat(PAL.wood), dark = mat(PAL.woodDark), half = 2.45;
    for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.38, 3.4, .38).translate(0, 1.7, 0), wood); p.position.x = s * half; gate.add(p);
      const cap = new THREE.Mesh(new THREE.ConeGeometry(.32, .4, 4).rotateY(Math.PI / 4).translate(0, 3.6, 0), mat('#A8DCC8')); cap.position.x = s * half; gate.add(cap);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(.16, 10, 8), gateLampM); lamp.position.set(s * half, 3.25, .3); gate.add(lamp); }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(2 * half + 1.0, .28, .34), dark); beam.position.y = 3.15; gate.add(beam);
    const face = signBoard(1024, 220, (x, v, w, h) => { x.fillStyle = '#FFF4DA'; x.fillRect(0, 0, w, h); x.strokeStyle = '#F2A0B4'; x.lineWidth = 16; x.strokeRect(8, 8, w - 16, h - 16);
      x.fillStyle = '#4B3A36'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '120px "Lilita One"'; x.fillText('NETIZEN BEACH', w / 2, h / 2 + 8);
      x.fillStyle = '#7FC3E8'; for (const sx of [70, w - 70]) { x.beginPath(); x.arc(sx, h / 2, 26, 0, 7); x.fill(); } });
    const side = mat('#FFF4DA'); const plate = new THREE.Mesh(new THREE.BoxGeometry(4.4, .95, .12), [side, side, side, side, face, face]); plate.position.y = 2.55; gate.add(plate);
    // the ribbon, in two halves that swing down when it is cut, and the bow in the middle
    for (const s of [-1, 1]) { const piv = new THREE.Group(); piv.position.set(s * (half - .2), 1.1, .25); gate.add(piv);
      const r = new THREE.Mesh(new THREE.BoxGeometry(half - .2, .2, .03).translate(-s * (half - .2) / 2, 0, 0), ribbonM); piv.add(r); ribbon.push(piv); }
    const bow = new THREE.Group(); bow.position.set(0, 1.1, .27); gate.add(bow);
    for (const s of [-1, 1]) { const loop = new THREE.Mesh(new THREE.TorusGeometry(.17, .055, 6, 12), ribbonM); loop.position.x = s * .19; loop.scale.set(1.1, .8, .6); bow.add(loop);
      const tail = new THREE.Mesh(new THREE.BoxGeometry(.1, .4, .03).translate(0, -.2, 0), ribbonM); tail.position.x = s * .08; tail.rotation.z = s * .35; bow.add(tail); }
    bow.add(new THREE.Mesh(new THREE.SphereGeometry(.08, 8, 6), ribbonM));
    gate.userData.bow = bow; sh(gate); }
  // place everything on the shore frame
  const place = (o, a, s, face) => { const [x, z] = shoreAt(a, s); o.position.set(x, s > -16 ? sandY(s) : .02, z); o.rotation.y = face; };
  const faceInland = yawTo(INLAND[0], INLAND[1]), faceSea = yawTo(-INLAND[0], -INLAND[1]);
  place(gate, BEACH.gate, -18.6, faceInland);
  place(tower, BEACH.tower, -9.2, faceSea);
  place(safety, BEACH.tower - 4.5, -13.2, faceInland + .25);
  const bc = { root, sand, sandM, sea, foam, ums, canopy, pole, lounger, tower, towerLampM, guard, safety, floats, fl, gate, gateLampM, ribbon, faceInland, faceSea };
  bc.build = (kSea, kSand, kStuff, t) => {
    root.visible = kSea > 0 || kSand > 0;
    sea.visible = kSea > 0; sea.position.y = lerp(-4.2, 0, eo(kSea));
    sandM.userData.U.uRev.value = kSand; sand.visible = kSand > 0;
    foam.forEach((f, k) => { const s = -3.4 + 1.1 * Math.sin(t * 1.15 + k * 2.1) + k * .9, [x, z] = shoreAt(f.userData.mid, s); f.position.set(x, .03, z); f.visible = kSea >= 1 && kSand > .3; f.material.opacity = (.85 - k * .2) * (.6 + .4 * Math.cos(t * 1.15 + k * 2.1)); });
    ums.forEach((u, i) => { const k = pop(kStuff, (u.a - 2) / 64 * .55, .12), [x, z] = shoreAt(u.a, u.s), y = sandY(u.s);
      if (k <= .001) { hide(canopy, i); hide(pole, i); hide(lounger, i); return; }
      setM(pole, i, x, y, z, 0, [1, k, 1]); setM(canopy, i, x, y, z, u.ry, [k, k, k], .06, 0); const [lx, lz] = shoreAt(u.a + 1.1, u.s + .4); setM(lounger, i, lx, y, lz, faceSea + Math.PI / 2 + (u.ry - 3) * .08, k); });
    for (const m of [canopy, pole, lounger]) m.instanceMatrix.needsUpdate = true;
    const tk = pop(kStuff, .55, .2), sk = pop(kStuff, .62, .2), gk = pop(kStuff, .7, .25);
    tower.visible = tk > 0; tower.scale.setScalar(Math.max(.001, tk)); safety.visible = sk > 0; safety.scale.setScalar(Math.max(.001, sk)); gate.visible = gk > 0; gate.scale.setScalar(Math.max(.001, gk));
    tower.userData.flag.rotation.y = .3 * Math.sin(t * 3);
    floats.forEach(([a, s], i) => { const k = pop(kStuff, .78 + i / floats.length * .1, .15), [x, z] = shoreAt(a, s); if (k <= .001) { hide(fl, i); return; } setM(fl, i, x, .06 + .05 * Math.sin(t * 2 + i), z, 0, k); }); fl.instanceMatrix.needsUpdate = true;
  };
  return bc;
}

// ---------- small actors and props ----------
export function makeCapsule(color, o = {}) {                              // a citizen capsule with eyes (the same size as the crowd's)
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(.24, .42, 6, 14), mat(color, { roughness: .45, flatShading: false })); m.position.y = .45; body.add(m);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.03, 8, 6), mat('#2C2A33', { roughness: .3, flatShading: false })); e.position.set(s * .085, .65, .225); body.add(e); }
  if (o.medic) { const cm = mat('#7FCFB2'); body.add(new THREE.Mesh(new THREE.BoxGeometry(.2, .06, .02).translate(0, .42, .245), cm), new THREE.Mesh(new THREE.BoxGeometry(.06, .2, .02).translate(0, .42, .245), cm));
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(.2, .22, .12, 14), mat('#A8DCC8')); cap.position.y = .93; body.add(cap); }
  return { root: sh(root), body, mesh: m };
}
export function makePlaster() {                                         // a little beige plaster, crossed
  const g = new THREE.Group(), m = mat('#EBC9A4', { roughness: .7 });
  g.add(new THREE.Mesh(new THREE.BoxGeometry(.22, .07, .02), m)); const b = new THREE.Mesh(new THREE.BoxGeometry(.22, .07, .02), m); b.rotation.z = Math.PI / 2; g.add(b);
  return g;
}
export function makeStars(n = 4) {                                        // dizzy stars that spin over a head
  const g = new THREE.Group(), sh2 = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? .05 : .13, a = i / 10 * TAU + Math.PI / 2; i ? sh2.lineTo(Math.cos(a) * r, Math.sin(a) * r) : sh2.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
  const m = mat('#F7D772', { emissive: '#F7D772', emissiveIntensity: .5 });
  for (let i = 0; i < n; i++) { const s = new THREE.Mesh(new THREE.ExtrudeGeometry(sh2, { depth: .03, bevelEnabled: false }), m); g.add(s); }
  return g;
}
export function makeAmbulance5() {                                       // the toy ambulance: cream and mint, "RS. NETIZEN CITY" painted on its sides
  const g = new THREE.Group(), cream = mat('#FBF6EC', { roughness: .45 }), mint = mat('#8FD3B8'), pink = mat('#F2A0B4');
  const side = signTex((x, v, w, h) => { x.fillStyle = '#FBF6EC'; x.fillRect(0, 0, w, h); x.fillStyle = '#8FD3B8'; x.fillRect(0, h * .62, w, h * .16);
    x.fillStyle = '#3E8F75'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '62px "Lilita One"'; x.fillText('RS. NETIZEN CITY', w * .54, h * .36);
    x.fillStyle = '#F2A0B4'; x.fillRect(w * .07, h * .2, 18, 62); x.fillRect(w * .07 - 22, h * .2 + 22, 62, 18); }, 640, 220); side.set(1);
  const sm = new THREE.MeshStandardMaterial({ map: side.t, roughness: .45 });
  const body = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.15, 1.1).translate(-.15, .82, 0), [cream, cream, cream, cream, sm, sm]); g.add(body);
  g.add(new THREE.Mesh(new THREE.BoxGeometry(.75, .72, 1.06).translate(1.33, .62, 0), cream));
  g.add(new THREE.Mesh(new THREE.BoxGeometry(.08, .38, .92).translate(1.72, .78, 0), mat('#5A6680', { roughness: .3 })));
  g.add(new THREE.Mesh(new THREE.BoxGeometry(.04, .3, .06).translate(1.33, .8, .54), mat('#5A6680', { roughness: .3 })));
  g.add(new THREE.Mesh(new THREE.BoxGeometry(3.1, .24, 1.0).translate(.2, .16, 0), mat('#3D3A42')));
  const beacon = mat('#F2737B', { emissive: '#F2737B', emissiveIntensity: .4 }), beacon2 = mat('#8FC7F2', { emissive: '#8FC7F2', emissiveIntensity: .4 });
  g.add(new THREE.Mesh(new THREE.BoxGeometry(.26, .14, .3).translate(.35, 1.47, -.2), beacon), new THREE.Mesh(new THREE.BoxGeometry(.26, .14, .3).translate(.35, 1.47, .2), beacon2));
  for (const [x, z] of [[1.1, .52], [-.75, .52], [1.1, -.52], [-.75, -.52]]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.24, .24, .16, 12).rotateX(Math.PI / 2), mat('#3D3A42')); w.position.set(x, .24, z); g.add(w); }
  // the rear doors (they open), the stretcher
  const doors = [-1, 1].map(s => { const piv = new THREE.Group(); piv.position.set(-1.31, .82, s * .55); g.add(piv);
    const d = new THREE.Mesh(new THREE.BoxGeometry(.05, 1.0, .54).translate(0, 0, -s * .27), cream); piv.add(d);
    const cross = new THREE.Mesh(new THREE.BoxGeometry(.02, .18, .06).translate(-.03, .15, -s * .27), pink); piv.add(cross); return piv; });
  const stretcher = new THREE.Group(); { stretcher.add(new THREE.Mesh(new THREE.BoxGeometry(1.15, .08, .46).translate(0, .3, 0), mat('#FFFFFF')));
    stretcher.add(new THREE.Mesh(new THREE.BoxGeometry(1.2, .05, .5).translate(0, .24, 0), mat('#9A938A', { metalness: .4 })));
    for (const [x, z] of [[-.5, -.2], [.5, -.2], [-.5, .2], [.5, .2]]) stretcher.add(new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .24).translate(x, .12, z), mat('#9A938A'))); }
  return { root: sh(g), doors, beacon, beacon2, stretcher: sh(stretcher) };
}
export function makeScissors() {                                          // big pastel scissors, stuck to the Mayor's side (toy logic)
  const g = new THREE.Group(), blade = mat('#E9EEF4', { metalness: .4, roughness: .3, flatShading: false }), handle = mat('#C4B3E3', { flatShading: false });
  const halves = [-1, 1].map(s => { const piv = new THREE.Group(); g.add(piv);
    const b = new THREE.Mesh(new THREE.BoxGeometry(.06, .5, .03).translate(0, .27, 0), blade); b.rotation.z = s * .08; piv.add(b);
    const h = new THREE.Mesh(new THREE.TorusGeometry(.09, .03, 6, 14), handle); h.position.set(s * .06, -.12, 0); piv.add(h); return piv; });
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .06, 8).rotateX(Math.PI / 2), mat(PAL.gold, { metalness: .6, roughness: .3 })));
  return { root: sh(g), halves, open: k => { halves[0].rotation.z = .35 * k; halves[1].rotation.z = -.35 * k; } };
}

// ---------- mist and wind ----------
// soft white puffs that always face the camera (main.js keeps the ambient-occlusion pass from seeing them)
function whiteAlpha(c) {                                                  // a texture from a canvas's alpha, its colour white everywhere
  const id = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, a = new Uint8Array(id.length);
  for (let i = 0; i < id.length; i += 4) { a[i] = a[i + 1] = a[i + 2] = 255; a[i + 3] = id[i + 3]; }
  const t = new THREE.DataTexture(a, c.width, c.height); t.flipY = true; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.needsUpdate = true; return t;
}
function mistTex() {
  const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d'), R = mulberry(19);
  for (let i = 0; i < 9; i++) { const cx = 128 + (R() - .5) * 70, cy = 128 + (R() - .5) * 30, r = 45 + R() * 45, g = x.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, 'rgba(255,255,255,.5)'); g.addColorStop(.55, 'rgba(255,255,255,.2)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 256, 256); }
  return whiteAlpha(c);
}
export function makeMist(specs, o = {}) {                                  // specs: { s: size, o: opacity, ... } (the caller places and drifts them)
  const root = new THREE.Group(), tex = mistTex();
  const list = specs.map((sp, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, .55), new THREE.MeshBasicMaterial({ map: tex, color: '#F8FAFF', transparent: true, opacity: 0, depthWrite: false, depthTest: o.depthTest ?? true }));
    m.scale.setScalar(sp.s); m.userData = { ...sp, ph: hash(i * 3.7 + 1) * TAU }; m.frustumCulled = false; root.add(m); return m; });
  return { root, list };
}
// two bands of mist hugging the mountain's shoulders: soft puffs on a ring that follows the slope a little way out; the puffs drift round with the wind
export function makeMistBelt() {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 128; const x = c.getContext('2d'), R = mulberry(23);
  for (let i = 0; i < 70; i++) { const cx = R() * 1024, cy = 64 + (R() - .5) * 24, r = 20 + R() * 24;
    for (const dx of [-1024, 0, 1024]) { const g = x.createRadialGradient(cx + dx, cy, 0, cx + dx, cy, r); g.addColorStop(0, 'rgba(255,255,255,.45)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(cx + dx - r, cy - r, 2 * r, 2 * r); } }
  const tex = whiteAlpha(c); tex.wrapS = THREE.RepeatWrapping;
  const root = new THREE.Group(), bands = [[18, 34, 2.6, 1], [38, 52, 2.2, -1]].map(([y0, y1, rep, dir]) => {
    const NH = 96, NV = 8, pos = [], uv = [], idx = [];
    for (let j = 0; j <= NV; j++) for (let i = 0; i <= NH; i++) { const v = j / NV, th = i / NH * TAU, y = lerp(y0, y1, v) * F, r = surfR(th, y) + (2 + 6 * Math.sin(Math.PI * v)) * F;
      pos.push(MT.x + Math.cos(th) * r, y, MT.z + Math.sin(th) * r); uv.push(i / NH * rep, v);
      if (i < NH && j < NV) { const a = j * (NH + 1) + i, b2 = a + NH + 1; idx.push(a, b2, a + 1, a + 1, b2, b2 + 1); } }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx);
    const t2 = tex.clone(); t2.needsUpdate = true;
    const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ map: t2, color: '#F8FAFF', transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }));
    m.frustumCulled = false; m.userData.dir = dir; root.add(m); return m; });
  return { root, bands, update(t, k, night) { root.visible = k > 0; bands.forEach((m, i) => { m.material.map.offset.x = t * .006 * m.userData.dir; m.material.opacity = k * (i ? .6 : .75) * (1 - .55 * night); m.material.color.setScalar(1 - .5 * night); }); } };
}
// a wind streak: a thin ribbon facing a point of view; it draws itself on and off along its length (U.uHead runs 0 .. 1 + U.uLen)
export function makeWind(pts, w, eye) {
  const cv = new THREE.CatmullRomCurve3(pts), N = 90, pos = [], au = [], av = [], idx = [];
  for (let i = 0; i <= N; i++) { const u = i / N, p = cv.getPointAt(u), tg = cv.getTangentAt(u), side = tg.clone().cross(eye.clone().sub(p)).normalize().multiplyScalar(w * (.35 + .65 * Math.sin(Math.PI * u)) / 2);
    pos.push(p.x - side.x, p.y - side.y, p.z - side.z, p.x + side.x, p.y + side.y, p.z + side.z); au.push(u, u); av.push(0, 1);
    if (i < N) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('au', new THREE.Float32BufferAttribute(au, 1)); g.setAttribute('av', new THREE.Float32BufferAttribute(av, 1)); g.setIndex(idx);
  const m = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, side: THREE.DoubleSide, uniforms: { uHead: { value: 0 }, uLen: { value: .45 }, uOp: { value: 0 } },
    vertexShader: 'attribute float au; attribute float av; varying float vU; varying float vV; void main() { vU = au; vV = av; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: 'uniform float uHead; uniform float uLen; uniform float uOp; varying float vU; varying float vV; void main() { float a = smoothstep(uHead - uLen, uHead - uLen * .35, vU) * (1.0 - smoothstep(uHead - .03, uHead, vU)); a *= smoothstep(0.0, .4, vV) * smoothstep(1.0, .6, vV); gl_FragColor = vec4(1.0, 1.0, 1.0, a * uOp); }' });
  const mesh = new THREE.Mesh(g, m); mesh.frustumCulled = false; return { mesh, U: m.uniforms };
}
