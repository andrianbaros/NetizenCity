// Day 3-4: the city around Kampung Angkatan 1 (the whole of Day 2, kept as it was). Day 4 adds a district south of the railway
// (built under tower cranes), takes the mysterious building down and puts up the Monumen Netizen City in its place.
// Layout (north = -z): downtown offices north of the Mayor's office, Perumahan Baru east (rusun, apartments, rumah tapak),
// Fasilitas and the Kawasan Kerukunan west, the station by the gate in the south, and the mysterious building alone in the far north.
// The city grows outward from the old village on the time-lapse clock. Windows are drawn by the shader on a world grid,
// so a few materials cover thousands of buildings, and they light up at night district by district.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry, clamp, lerp, seg, back, eo, eio, hash } from './core/lib.js';
import { PAL, signTex } from './world.js';

const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .78, metalness: 0, flatShading: true, ...o });
const sh = m => { m.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } }); return m; };
const pop = (tw, t0, d = .22) => tw < t0 ? 0 : back(seg(tw, t0, t0 + d), 2.2);
export const MYST = new THREE.Vector3(0, 0, -82), CENTER = new THREE.Vector2(0, 16);
export const KERUK = new THREE.Vector3(-75, 0, -35), HOSP = new THREE.Vector3(-60, 0, 12.6), POLICE = new THREE.Vector3(-72, 0, 25.6), FIRE = new THREE.Vector3(-55, 0, 25.9);   // fronts right on the sidewalks
export const STATION = new THREE.Vector3(12, 0, 39.3), GAPURA = new THREE.Vector3(39.5, 0, 19.5), RAIL_Z = 44;
// Day 6: the lot of Netizen Mall (mall.js) and its parking, at the north-west corner of the crossing (-44, -3): no trees or street furniture there
const inMallLot = (x, z) => x > -72 && x < -47.6 && z > -20 && z < -6.0;
const PASTEL = ['#F2A88A', '#F7D772', '#A8DCC8', '#C4B3E3', '#F2B8C6', '#A9C8EC', '#F7ECD6', '#FFD1A6'];

// ---------- the road network: avenues (5 wide, 4 lanes), streets (3.4, 2 lanes) ----------
export const ROADS = [
  { ax: 'x', c: -3, a0: -150, a1: 189, w: 5 }, { ax: 'x', c: 33, a0: -150, a1: 150, w: 5 },
  { ax: 'z', c: 44, a0: -59, a1: 55, w: 4.8 }, { ax: 'z', c: -44, a0: -59, a1: 33, w: 5 }, { ax: 'z', c: 0, a0: -59, a1: -3, w: 5 },
  { ax: 'x', c: 19.5, a0: 36.2, a1: 150, w: 3.4 }, { ax: 'x', c: 19.5, a0: -150, a1: -36.2, w: 3.4 },
  { ax: 'z', c: 96, a0: -59, a1: 135, w: 3.6 }, { ax: 'z', c: -96, a0: -59, a1: 33, w: 3.4 },
  { ax: 'z', c: 0, a0: 27.4, a1: 33, w: 2.4, plain: true },
  { ax: 'x', c: 55, a0: 44, a1: 150, w: 3.8 },
  { ax: 'x', c: -59, a0: -126, a1: 104, w: 4.2 },
  { ax: 'z', c: 49, a0: 55, a1: 135, w: 3.8 },
  { ax: 'x', c: 135, a0: 10, a1: 96, w: 3.8 },
  { ax: 'x', c: -42, a0: 140, a1: 195, w: 4.2 },
  { ax: 'z', c: 150, a0: -42, a1: 33, w: 3.4 },
];
const XS = [];                                                        // intersections
for (const a of ROADS) for (const b of ROADS) if (a.ax === 'x' && b.ax === 'z' && b.c >= a.a0 - .01 && b.c <= a.a1 + .01 && a.c >= b.a0 - .01 && a.c <= b.a1 + .01)
  XS.push({ x: b.c, z: a.c, wx: b.w, wz: a.w, big: a.w > 4 || b.w > 4, plain: b.plain });
const SW = 1.6;                                                       // sidewalk width

// ---------- shader patches ----------
const VHEAD = 'varying vec3 vWP; varying vec3 vWN;\n';
const VBODY = `#include <project_vertex>
  vec4 cwp = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    cwp = instanceMatrix * cwp;
  #endif
  cwp = modelMatrix * cwp; vWP = cwp.xyz;
  vec3 cwn = objectNormal;
  #ifdef USE_INSTANCING
    cwn = mat3(instanceMatrix) * cwn;
  #endif
  vWN = normalize(mat3(modelMatrix) * cwn);`;
// windows: one grid in world space (column width, floor height, first floor), a glass colour, a share of rooms lit at night
export function cityMat(color, o = {}) {
  const m = mat(color, { roughness: o.rough ?? .8 });
  const U = { uWin: { value: new THREE.Vector4(o.sx ?? .9, o.fh ?? .7, o.base ?? .2, 0) }, uBox: { value: new THREE.Vector4(...(o.box ?? [.22, .78, .3, .76])) },
    uGlass: { value: new THREE.Color(o.glass ?? '#7D93B5') }, uNight: { value: 0 }, uLit: { value: o.lit ?? .55 }, uBand: { value: o.band ?? 0 } };
  m.onBeforeCompile = s => {
    Object.assign(s.uniforms, U);
    s.vertexShader = VHEAD + s.vertexShader.replace('#include <project_vertex>', VBODY);
    s.fragmentShader = VHEAD + 'uniform vec4 uWin; uniform vec4 uBox; uniform vec3 uGlass; uniform float uNight; uniform float uLit; uniform float uBand;\n' + s.fragmentShader
      .replace('#include <color_fragment>', `#include <color_fragment>
        float cwin = 0.; vec2 ccell = vec2(0.);
        if (abs(vWN.y) < .5) {
          float hor = abs(vWN.z) > abs(vWN.x) ? vWP.x : vWP.z;
          vec2 g = vec2(hor / uWin.x, (vWP.y - uWin.z) / uWin.y); ccell = floor(g); vec2 f = fract(g); float above = step(0., g.y);
          cwin = step(uBox.x, f.x) * step(f.x, uBox.y) * step(uBox.z, f.y) * step(f.y, uBox.w) * above;
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(1.), uBand * (1. - step(.09, f.y)) * above * .6);
          diffuseColor.rgb = mix(diffuseColor.rgb, uGlass, cwin * .86);
        } else { diffuseColor.rgb *= .9; }`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
        float clit = step(fract(sin(dot(ccell + floor(vWP.xz / 7.) * 13.7 + vWN.xz * 5.3, vec2(12.9898, 78.233))) * 43758.5453), uLit);
        totalEmissiveRadiance += vec3(1., .74, .4) * cwin * clit * uNight * .95;`);
  };
  m.customProgramCacheKey = () => 'citywin';
  m.userData.U = U; return m;
}
// roads, sidewalks and markings roll out as a growing circle around the old village
const REV = { uR: { value: 1e5 }, uC: { value: CENTER.clone() } };
function revealMat(m) {
  m.onBeforeCompile = s => {
    Object.assign(s.uniforms, REV);
    s.vertexShader = VHEAD + s.vertexShader.replace('#include <project_vertex>', VBODY);
    s.fragmentShader = VHEAD + 'uniform float uR; uniform vec2 uC;\n' + s.fragmentShader.replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n if (length(vWP.xz - uC) > uR) discard;');
  };
  m.customProgramCacheKey = () => 'cityreveal'; return m;
}

// ---------- geometry helpers ----------
function quad(x0, x1, z0, z1, y, uvf) {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
  const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, ...uvf(p.getX(i), p.getZ(i))); return g;
}
function slab(x0, x1, y0, y1, z0, z1) {
  const g = new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0); g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  const p = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i), -p.getZ(i)); return g;
}
function prism(w, h, d) {                                               // a gable roof: ridge along x, base at y = 0
  const s = new THREE.Shape([new THREE.Vector2(-d / 2, 0), new THREE.Vector2(d / 2, 0), new THREE.Vector2(0, h)]);
  const g = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false }); g.translate(0, 0, -w / 2); g.rotateY(Math.PI / 2); return g;
}
function canvasTex(w, h, draw, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), EU = new THREE.Euler(), PV = new THREE.Vector3(), SV = new THREE.Vector3();
function setM(m, i, x, y, z, ry, sx, sy, sz, rx = 0, rz = 0) { Q.setFromEuler(EU.set(rx, ry, rz, 'YXZ')); m.setMatrixAt(i, M4.compose(PV.set(x, y, z), Q, SV.set(sx, sy, sz))); }
function instanced(geo, material, n, cols) {
  const m = new THREE.InstancedMesh(geo, material, Math.max(1, n)); m.castShadow = false; m.receiveShadow = false; m.frustumCulled = false;
  if (cols) { const c = new THREE.Color(); cols.forEach((v, i) => m.setColorAt(i, c.set(v))); m.instanceColor.needsUpdate = true; }
  for (let i = 0; i < m.count; i++) m.setMatrixAt(i, M4.makeScale(0, 0, 0));
  return m;
}

export function buildMetro(scene, C) {
  const R = mulberry(303), city = {}, C4 = C;
  C = { ...C, rusun: -1e3, apartemen: -1e3, jalan: -1e3, stasiun: -1e3, S6: C.S6 ?? 0 };         // everything from Day 3 stands already
  const d0 = (x, z) => Math.hypot(x - CENTER.x, z - CENTER.y);

  // ---------- roads ----------
  const asphalt = '#8C98AA';
  const aveTex = canvasTex(128, 256, (x, w, h) => { x.fillStyle = asphalt; x.fillRect(0, 0, w, h); x.fillStyle = '#F4F1EA'; x.fillRect(5, 0, 4, h); x.fillRect(119, 0, 4, h);
    x.fillStyle = '#F6DA8A'; x.fillRect(59, 0, 3, h); x.fillRect(66, 0, 3, h); x.fillStyle = '#F4F1EA'; x.fillRect(31, 0, 3, h / 2); x.fillRect(94, 0, 3, h / 2); }, true);
  const strTex = canvasTex(128, 256, (x, w, h) => { x.fillStyle = asphalt; x.fillRect(0, 0, w, h); x.fillStyle = '#F4F1EA'; x.fillRect(6, 0, 5, h); x.fillRect(117, 0, 5, h); x.fillRect(62, 0, 4, h / 2); }, true);
  const ave = [], str = [], plain = [], walks = [];
  for (const r of ROADS) {
    const lo = r.c - r.w / 2, hi = r.c + r.w / 2;
    const g = r.ax === 'x' ? quad(r.a0, r.a1, lo, hi, .05, (x, z) => [(z - lo) / r.w, x / 4]) : quad(lo, hi, r.a0, r.a1, .05, (x, z) => [(x - lo) / r.w, z / 4]);
    (r.plain ? plain : r.w > 4 ? ave : str).push(g);
    if (r.plain) continue;
    // sidewalks on both sides, cut where another road crosses
    const cuts = XS.filter(q => r.ax === 'x' ? Math.abs(q.z - r.c) < .01 : Math.abs(q.x - r.c) < .01).map(q => r.ax === 'x' ? [q.x - q.wx / 2 - SW, q.x + q.wx / 2 + SW] : [q.z - q.wz / 2 - SW, q.z + q.wz / 2 + SW]);
    if (r.ax === 'x' && r.c === 19.5) cuts.push(r.a0 > 0 ? [36, 41.6] : [-41.6, -36]);           // the Kampung end of the streets
    cuts.sort((a, b) => a[0] - b[0]);
    let s = r.a0; const spans = [];
    for (const [a, b] of cuts) { if (a > s) spans.push([s, a]); s = Math.max(s, b); }
    if (s < r.a1) spans.push([s, r.a1]);
    for (const [a, b] of spans) for (const side of [-1, 1]) {
      if (r.ax === 'z' && r.c === 0 && r.a1 > 30) continue;
      const e0 = side < 0 ? lo - SW : hi, e1 = side < 0 ? lo : hi + SW;
      walks.push(r.ax === 'x' ? slab(a, b, 0, .1, e0, e1) : slab(e0, e1, 0, .1, a, b));
      r.spans = r.spans || []; r.spans.push({ a, b, side, off: side * (r.w / 2 + SW / 2) });
    }
  }
  for (const q of XS) plain.push(quad(q.x - q.wx / 2 - .02, q.x + q.wx / 2 + .02, q.z - q.wz / 2 - .02, q.z + q.wz / 2 + .02, .062, (x, z) => [0, 0]));
  const roadM = revealMat(new THREE.MeshStandardMaterial({ map: aveTex, roughness: .92 })), strM = revealMat(new THREE.MeshStandardMaterial({ map: strTex, roughness: .92 }));
  const plainM = revealMat(new THREE.MeshStandardMaterial({ color: asphalt, roughness: .92 }));
  const paveTex = canvasTex(128, 128, (x, w, h) => { const Rp = mulberry(4); x.fillStyle = '#D6CBB8'; x.fillRect(0, 0, w, h);
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { x.fillStyle = `hsl(37, 32%, ${88 + Rp() * 4}%)`; x.fillRect(i * 64 + 3, j * 64 + 3, 58, 58); } }, true);
  const walkM = revealMat(new THREE.MeshStandardMaterial({ map: paveTex, roughness: .92 }));
  for (const [list, m] of [[ave, roadM], [str, strM], [plain, plainM], [walks, walkM]]) { const mesh = new THREE.Mesh(mergeGeometries(list), m); mesh.receiveShadow = true; scene.add(mesh); }
  // zebra crossings on every approach
  const zeb = [];
  for (const q of XS) { if (q.plain) continue;
    for (const s of [-1, 1]) {
      for (let k = -q.wz / 2 + .45; k < q.wz / 2 - .2; k += .62) zeb.push([q.x + s * (q.wx / 2 + .75), q.z + k, 1.0, .32]);     // across the x-road, beside the crossing
      for (let k = -q.wx / 2 + .45; k < q.wx / 2 - .2; k += .62) zeb.push([q.x + k, q.z + s * (q.wz / 2 + .75), .32, 1.0]);
    } }
  const zebM = revealMat(new THREE.MeshStandardMaterial({ color: '#F6F3EC', roughness: .8 }));
  const zm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, .02, 1), zebM, zeb.length); zm.receiveShadow = true; zm.frustumCulled = false;
  zeb.forEach(([x, z, sx, sz], i) => setM(zm, i, x, .068, z, 0, sx, 1, sz)); scene.add(zm);

  // ---------- trees, lamps, traffic lights along the avenues ----------
  const trees = [], lamps = [], tl = [];
  for (const r of ROADS) for (const sp of r.spans || []) {
    const step = r.w > 4 ? 7.5 : 9;
    for (let a = sp.a + 2.5; a < sp.b - 2; a += step) {
      const [x, z] = r.ax === 'x' ? [a, r.c + sp.off] : [r.c + sp.off, a];
      if (d0(x, z) < 2) continue;
      trees.push([x, z]);
      if (r.w > 4 && Math.round(a / step) % 2 === 0) { const [lx, lz] = r.ax === 'x' ? [a + step / 2, r.c + sp.side * (r.w / 2 + .35)] : [r.c + sp.side * (r.w / 2 + .35), a + step / 2]; if (lx > -150 && lx < 150) lamps.push([lx, lz, r.ax, sp.side]); }
    }
  }
  for (const q of XS) if (q.big && !q.plain) for (const [sx, sz, ph] of [[1, 1, 0], [-1, -1, 0], [1, -1, 1], [-1, 1, 1]]) tl.push([q.x + sx * (q.wx / 2 + .55), q.z + sz * (q.wz / 2 + .55), ph]);
  // a few groves where the city is still green
  for (let i = 0; i < 90; i++) { const a = R() * 6.283, r = 15 + R() * 6, x = KERUK.x + Math.cos(a) * r, z = KERUK.z + Math.sin(a) * r; if (z < -8.5 && x < -49.5 && x > -91) trees.push([x, z]); }
  // Day 9: the sidewalk in front of the adoption house (day9.js VET, west of the hospital) stays open: no tree, no planter in the shot
  const adoptFront = (x, z) => x > -114.5 && x < -108 && z > 15.5 && z < 18.5;
  const nearRail = (x, z) => Math.abs(z - RAIL_Z) < 3.8;
  const onRoad = (x, z) => ROADS.some(r => { const lat = r.ax === 'x' ? z : x, al = r.ax === 'x' ? x : z; return Math.abs(lat - r.c) < r.w / 2 + SW + .4 && al > r.a0 - 3 && al < r.a1 + 3; });
  const treeOK = trees.filter(([x, z]) => ((x - KERUK.x) / 10.5) ** 2 + ((z - KERUK.z) / 18.5) ** 2 > 1 && !inMallLot(x, z) && !adoptFront(x, z) && !nearRail(x, z) && !onRoad(x, z));
  const trunk = instanced(new THREE.CylinderGeometry(.1, .14, .8, 6).translate(0, .4, 0), mat('#B48A68'), treeOK.length);
  const crown = instanced(new THREE.IcosahedronGeometry(.75, 0).translate(0, 1.35, 0), mat('#ffffff'), treeOK.length, treeOK.map((_, i) => i % 3 ? '#8FD3B8' : '#9CC48A'));
  scene.add(trunk, crown);
  city.trees = treeOK.map(([x, z], i) => ({ x, z, s: .85 + hash(i * 1.3) * .35, ry: hash(i * 2.7) * 6 }));
  city.treeMeshes = [trunk, crown];
  const poleM = mat('#EEE6F6'), headM = mat('#FFF4D8', { emissive: '#FFD58A', emissiveIntensity: 0 });
  const lampsOK = lamps.filter(([lx, lz]) => !nearRail(lx, lz) && !onRoad(lx, lz));
  const lpole = instanced(new THREE.CylinderGeometry(.05, .065, 2.3, 6).translate(0, 1.15, 0), poleM, lampsOK.length);
  const lhead = instanced(new THREE.SphereGeometry(.16, 10, 8).translate(.32, 2.25, 0), headM, lamps.length);
  const larm = instanced(new THREE.BoxGeometry(.4, .05, .05).translate(.16, 2.3, 0), poleM, lamps.length);
  scene.add(lpole, lhead, larm);
  city.lamps = lampsOK.map(([x, z, ax, side]) => ({ x, z, ry: ax === 'x' ? (side < 0 ? Math.PI / 2 : -Math.PI / 2) : (side < 0 ? 0 : Math.PI) }));
  const tpole = instanced(new THREE.CylinderGeometry(.05, .06, 2.4, 6).translate(0, 1.2, 0), mat('#7F7A86'), tl.length);
  const thead = instanced(new THREE.BoxGeometry(.24, .62, .24).translate(0, 2.55, 0), mat('#4E4A56'), tl.length);
  const tlamp = instanced(new THREE.SphereGeometry(.1, 10, 8).translate(0, 2.55, 0), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), tl.length, tl.map(() => '#7BE07B'));
  scene.add(tpole, thead, tlamp);
  city.tl = tl.map(([x, z, ph]) => ({ x, z, ph }));
  // street furniture on the building side of every sidewalk, between the trees (the paving should not look bare):
  // planters, benches, bus stops on the avenues, food carts with umbrellas
  const vc = (g, c) => { const col = new THREE.Color(c), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) col.toArray(a, i * 3); g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; };
  const B = (w, h, d, x, y, z, c) => vc(new THREE.BoxGeometry(w, h, d).translate(x, y, z), c);
  const furn = { planter: [], bench: [], stop: [], cart: [] };
  for (const r of ROADS) for (const sp of r.spans || []) {
    const step = r.w > 4 ? 7.5 : 9, lat = r.c + sp.side * (r.w / 2 + SW - .38);
    const ry = r.ax === 'x' ? (sp.side < 0 ? 0 : Math.PI) : (sp.side < 0 ? Math.PI / 2 : -Math.PI / 2);   // facing the road
    let n = 0;
    for (let a = sp.a + 2.5 + step / 2; a < sp.b - 2.5; a += step, n++) {
      const [x, z] = r.ax === 'x' ? [a, lat] : [lat, a], h = hash(a * .37 + r.c * 1.7 + sp.side);
      if (r.w > 4 && n % 8 === 3) furn.stop.push({ x, z, ry });
      else if (h < .45) furn.bench.push({ x, z, ry });
      else if (h < .62) furn.cart.push({ x, z, ry, c: ['#F2A88A', '#A8DCC8', '#F7D772', '#C4B3E3', '#F2B8C6'][Math.floor(hash(a) * 5)] });
      const [px, pz] = r.ax === 'x' ? [a + step / 2 - .9, lat] : [lat, a + step / 2 - .9];
      if (a + step / 2 < sp.b - 2.5) furn.planter.push({ x: px, z: pz, ry, c: ['#8FC48A', '#9CD3B0', '#F6A7C1', '#7FB37A', '#F7DD8C'][Math.floor(hash(a * 1.3 + r.c) * 5)] });
    }
  }
  for (const k in furn) furn[k] = furn[k].filter(f => !adoptFront(f.x, f.z));
  const vmat = mat('#ffffff', { vertexColors: true });
  const geoBench = mergeGeometries([B(1.1, .07, .34, 0, .36, 0, PAL.woodDark), B(1.1, .3, .06, 0, .58, -.15, PAL.woodDark), B(.08, .34, .3, -.46, .17, 0, '#6A6670'), B(.08, .34, .3, .46, .17, 0, '#6A6670')]);
  const geoStop = mergeGeometries([B(2.6, .08, 1.1, 0, 2.05, 0, '#A8DCC8'), B(2.4, 1.4, .05, 0, 1.15, -.48, '#BFD6EE'), B(.08, 2.0, .08, -1.15, 1.0, -.48, '#EEE6F6'), B(.08, 2.0, .08, 1.15, 1.0, -.48, '#EEE6F6'),
    B(1.6, .07, .3, 0, .4, -.28, '#F4F1EA'), B(.5, .7, .06, 1.15, 1.6, -.4, '#F7D772')]);
  const geoCart = mergeGeometries([B(.9, .5, .5, 0, .45, 0, '#FFF6E6'), B(.92, .1, .52, 0, .73, 0, '#F2E3CC'), B(.04, .9, .04, 0, 1.2, 0, '#9A938A'), vc(new THREE.CylinderGeometry(.16, .16, .08, 10).rotateX(Math.PI / 2).translate(-.3, .16, .26), '#4A4650'), vc(new THREE.CylinderGeometry(.16, .16, .08, 10).rotateX(Math.PI / 2).translate(.3, .16, .26), '#4A4650')]);
  for (const k in furn) furn[k] = furn[k].filter(f => !adoptFront(f.x, f.z) && !inMallLot(f.x, f.z) && !nearRail(f.x, f.z) && !onRoad(f.x, f.z));
  const mkF = (geo, list, m, tint) => { const im = instanced(geo, m || vmat, list.length, tint ? list.map(o => o.c) : null); scene.add(im); return im; };
  const fBench = mkF(geoBench, furn.bench), fStop = mkF(geoStop, furn.stop), fCart = mkF(geoCart, furn.cart);
  const fUmb = mkF(new THREE.ConeGeometry(.75, .35, 8).translate(0, 1.75, 0), furn.cart, mat('#ffffff'), true);
  const fPot = mkF(B(.62, .32, .62, 0, .16, 0, '#EDE3D2'), furn.planter);
  const fBush = mkF(new THREE.IcosahedronGeometry(.36, 0).translate(0, .55, 0), furn.planter, mat('#ffffff'), true);
  const furniture = [[fBench, furn.bench], [fStop, furn.stop], [fCart, furn.cart], [fUmb, furn.cart], [fPot, furn.planter], [fBush, furn.planter]];

  // ---------- building sets ----------
  const sets = [];
  function bset(items, material, o = {}) {                             // items: {x, z, w, d, h, c, t0, dur, floors, ry}
    const geo = new THREE.BoxGeometry(1, 1, 1).translate(0, .5, 0);
    const m = instanced(geo, material, items.length, items.map(it => it.c)); scene.add(m);
    const s = { m, items, kind: o.kind || 'stack', roof: null, extras: [] };
    if (o.roof) { const rm = instanced(o.roof.geo, mat('#ffffff'), items.length, items.map((it, i) => o.roof.cols[i % o.roof.cols.length])); scene.add(rm); s.roof = rm; }
    sets.push(s); return s;
  }
  // rusun: 5 floors, gable roofs, rows between the avenues (40 blocks)
  const rus = [];
  for (const x of [52, 61, 70, 79, 88, 104, 113, 122, 131, 140]) for (const z of [3.2, 8.8, 14.4, 25.5]) {
    if (rus.length >= 40) break;
    rus.push({ x, z, w: 7, d: 2.6, h: .15 + 5 * .7 + .2, c: PASTEL[rus.length % 6], t0: C.rusun - .15 + d0(x, z) / 150 * .9, dur: .4, floors: 5 });
  }
  const rusM = cityMat('#ffffff', { fh: .7, base: .15, sx: .9, box: [.2, .8, .32, .76], band: 1, lit: .45 });
  const rusSet = bset(rus, rusM, { roof: { geo: prism(7.4, .8, 3.0), cols: ['#E58F72', '#B6A4D8', '#E58F72', '#8FC9B4'] } });
  // apartments: 20 towers that stack up like toy blocks
  const apt = [];
  for (const x of [52, 61, 70, 79, 88]) for (const z of [-10, -20, -30, -40]) { const fl = 14 + Math.floor(hash(x * .7 + z) * 13);
    apt.push({ x, z, w: 4.6, d: 4.6, h: .3 + fl * .6 + .2, c: ['#F7ECD6', '#D8CCEE', '#BFD6EE', '#BFE6D6', '#F2D0D8'][apt.length % 5], t0: C.apartemen - .2 + (apt.length % 5) * .07 + Math.floor(apt.length / 5) * .1, dur: .62, floors: fl }); }
  const aptM = cityMat('#ffffff', { fh: .6, base: .3, sx: .76, box: [.2, .8, .26, .78], band: .7, lit: .42 });
  const aptSet = bset(apt, aptM);
  // downtown offices: glass towers on both sides of the north avenue, a clear axis down the middle
  const off = [];
  for (const s of [-1, 1]) for (const ax of [9, 18, 27, 36]) for (const z of [-10, -19, -28, -37, -46]) {
    const near = ax < 20 && z < -15 && z > -42 ? 1 : 0, fl = 16 + Math.floor(hash(ax * 1.7 + z * .3 + s) * 14) + near * 10;
    off.push({ x: s * ax, z, w: 6, d: 6, h: .4 + fl * .62 + .2, c: ['#BFD6EE', '#C9E6DA', '#F1E8DA', '#D8CCEE', '#F2D6DC'][off.length % 5], t0: C.apartemen + .1 + (ax / 40) * .35 + (-z / 50) * .3, dur: .6, floors: fl });
  }
  const offM = cityMat('#ffffff', { fh: .62, base: .4, sx: 1.0, box: [.14, .86, .2, .8], glass: '#8FAFD4', lit: .4, rough: .55 });
  const offSet = bset(off, offM);
  // west mid-rise (offices and flats) where the west districts are not facilities
  const mid = [];
  for (const x of [-104, -113, -122, -131, -140]) for (const z of [-16, -25, -34, -43]) { const fl = 6 + Math.floor(hash(x + z * 1.3) * 7);
    mid.push({ x, z, w: 6, d: 5, h: .3 + fl * .65 + .2, c: PASTEL[(mid.length * 3) % 8], t0: C.apartemen + .3 + d0(x, z) / 150 * .4, dur: .5, floors: fl }); }
  const midSet = bset(mid, cityMat('#ffffff', { fh: .65, base: .3, sx: .9, box: [.18, .82, .28, .76], band: .6, lit: .58 }));
  // shops and malls along the avenues (kawasan komersial)
  const shops = [];
  const shopRow = (x0, x1, z, dz, face) => { for (let x = x0; x < x1 - 3; ) { const big = hash(x * .37 + z) > .82, w = big ? 13 : 5 + Math.floor(hash(x * 1.1 + z) * 3);
    if (x + w > x1) break; shops.push({ x: x + w / 2, z, w: w - .5, d: dz, h: big ? 3.3 : .1 + 2 * .9 + .1, c: PASTEL[Math.floor(hash(x * 2.3 + z) * 8)], t0: C.jalan - .3 + d0(x, z) / 150 * .8, dur: .25, floors: 2, big, face }); x += w; } };
  shopRow(-148, -100.5, 39.5, 4.4, -1); shopRow(-91.5, -50, 39.5, 4.4, -1); shopRow(-36, -6, 39.5, 4.4, -1); shopRow(26, 40, 39.5, 4.4, -1); shopRow(48.5, 91.5, 39.5, 4.4, -1); shopRow(100.5, 148, 39.5, 4.4, -1);          // face: the side of the avenue
  shopRow(-148, -100, 3.2, 3.6, -1); shopRow(-92, -70, 3.2, 3.6, -1); shopRow(-148, -100, -9.6, 4, 1); shopRow(-148, -100, 27, 4, 1); shopRow(-92, -80, 27, 4, 1);
  shopRow(-148, -100, 14.4, 3.6, 1); shopRow(-92, -70, 14.4, 3.6, 1);
  for (let i = shops.length - 1; i >= 0; i--) if (Math.abs(shops[i].z - 14.4) < .1 && shops[i].x > -118 && shops[i].x < -67) shops.splice(i, 1);
  const shopCollidesRoad = (s) => {
    const hw = s.w / 2 + 0.6;
    const hd = s.d / 2 + 0.6;
    if (Math.abs(s.z - RAIL_Z) < hd + 1.8) return true;
    for (const r of ROADS) {
      if (r.ax === 'z') {
        const minX = r.c - (r.w / 2 + SW + 0.6);
        const maxX = r.c + (r.w / 2 + SW + 0.6);
        const minZ = r.a0 - 1.0;
        const maxZ = r.a1 + 1.0;
        if (s.x + hw > minX && s.x - hw < maxX && s.z + hd > minZ && s.z - hd < maxZ) return true;
      } else if (r.ax === 'x') {
        const minZ = r.c - (r.w / 2 + SW + 0.6);
        const maxZ = r.c + (r.w / 2 + SW + 0.6);
        const minX = r.a0 - 1.0;
        const maxX = r.a1 + 1.0;
        if (s.z + hd > minZ && s.z - hd < maxZ && s.x + hw > minX && s.x - hw < maxX) return true;
      }
    }
    return false;
  };
  for (let i = shops.length - 1; i >= 0; i--) {
    if (shopCollidesRoad(shops[i])) shops.splice(i, 1);
  }   // + Day 9: the animal hospital's lot (day9.js VET)   // Day 7: the library's lot (day7.js LIB) and its reading garden
  const shopM = cityMat('#ffffff', { fh: .9, base: .1, sx: 1.4, box: [.08, .92, .1, .72], glass: '#9DB6D2', band: 1, lit: .7 });
  const shopSet = bset(shops, shopM);
  const stripe = canvasTex(64, 16, (x, w, h) => { for (let i = 0; i < 8; i++) { x.fillStyle = i % 2 ? '#FFFFFF' : '#F0E6E0'; x.fillRect(i * 8, 0, 8, h); } }, true);
  const awn = instanced(new THREE.BoxGeometry(1, .06, .9), new THREE.MeshStandardMaterial({ map: stripe, roughness: .8 }), shops.length, shops.map((s, i) => ['#F2A88A', '#A8DCC8', '#C4B3E3', '#F7D772'][i % 4]));
  scene.add(awn); shopSet.awn = awn;
  // rumah tapak: 300 small houses at the north-east edge
  const hs = [];
  for (let i = 0; i < 20; i++) for (let j = 0; j < 15; j++) { const x = 101 + i * 2.5 + (j % 2) * .3, z = -8 - j * 2.8;
    hs.push({ x, z, w: 1.6, d: 1.3, h: 1.05, c: ['#F7ECD6', '#FFF3E2', '#F6E3D0', '#EEF2F8'][(i + j) % 4], t0: C.rusun + .5 + d0(x, z) / 150 * .8 + hash(i * 3 + j) * .25, dur: .2, floors: 1 }); }
  const hsSet = bset(hs, cityMat('#ffffff', { fh: 1.0, base: .3, sx: .8, box: [.3, .7, .2, .62], lit: .5 }), { kind: 'pop', roof: { geo: prism(1.8, .7, 1.5), cols: ['#F2A88A', '#F2B8C6', '#A9C8EC', '#E58F72'] } });
  // Day 4: twelve more apartment towers and thirteen rusun south of the railway, stacked floor by floor under the cranes
  const apt4 = [], rus4 = [];
  [[56, 48.5], [61, 48.5], [70, 48.5], [79, 48.5], [88, 48.5], [104, 48.5], [113, 48.5], [122, 48.5], [56, 61.5], [61, 61.5], [70, 61.5], [79, 61.5]].forEach(([x, z], i) => { const fl = 16 + Math.floor(hash(x * 1.3 + z) * 10);
    apt4.push({ x, z, w: 4.6, d: 4.6, h: .3 + fl * .6 + .2, c: ['#F7ECD6', '#D8CCEE', '#BFD6EE', '#BFE6D6', '#F2D0D8'][i % 5], t0: C4.grow + .05 + (i % 6) * .1, dur: .9, floors: fl, d4: true }); });
  [[131, 48.5], [140, 48.5], [88, 61.5], [104, 61.5], [113, 61.5], [122, 61.5], [131, 61.5], [140, 61.5], [149, 61.5], [88, 67], [104, 67], [113, 67], [122, 67]].forEach(([x, z], i) =>
    rus4.push({ x, z, w: 7, d: 2.6, h: .15 + 5 * .7 + .2, c: PASTEL[(i + 2) % 6], t0: C4.grow + .2 + (i % 5) * .12, dur: .5, floors: 5, d4: true }));
  bset(apt4, aptM); bset(rus4, rusM, { roof: { geo: prism(7.4, .8, 3.0), cols: ['#B6A4D8', '#E58F72', '#8FC9B4'] } });
  // Day 5: six more apartment towers and seven rusun at the south end of the new district (the scene 3 time-lapse)
  const apt5 = [], rus5 = [];
  [[56, 73], [61, 73], [70, 73], [79, 73], [56, 82], [61, 82]].forEach(([x, z], i) => { const fl = 15 + Math.floor(hash(x * 2.1 + z) * 10);
    apt5.push({ x, z, w: 4.6, d: 4.6, h: .3 + fl * .6 + .2, c: ['#BFE6D6', '#F2D0D8', '#F7ECD6', '#D8CCEE', '#BFD6EE'][i % 5], t0: C4.grow + .05 + i * .12, dur: .8, floors: fl, d5: true }); });
  [[131, 67], [140, 67], [149, 67], [88, 73], [104, 73], [113, 73], [122, 73]].forEach(([x, z], i) =>
    rus5.push({ x, z, w: 7, d: 2.6, h: .15 + 5 * .7 + .2, c: PASTEL[(i + 4) % 6], t0: C4.grow + .25 + i * .1, dur: .45, floors: 5, d5: true }));
  bset(apt5, aptM); bset(rus5, rusM, { roof: { geo: prism(7.4, .8, 3.0), cols: ['#8FC9B4', '#E58F72', '#B6A4D8'] } });
  // Day 6: twelve more apartment towers and twelve rusun, the next rows south (the scene 3 time-lapse)
  const apt6 = [], rus6 = [];
  [[70, 82], [79, 82], [88, 82], [104, 82], [113, 82], [56, 91], [61, 91], [70, 91], [79, 91], [88, 91], [104, 91], [113, 91]].forEach(([x, z], i) => { const fl = 14 + Math.floor(hash(x * 1.7 + z * 2.3) * 11);
    apt6.push({ x, z, w: 4.6, d: 4.6, h: .3 + fl * .6 + .2, c: ['#D8CCEE', '#BFE6D6', '#F2D0D8', '#BFD6EE', '#F7ECD6'][i % 5], t0: C4.grow + .05 + (i % 6) * .1 + Math.floor(i / 6) * .06, dur: .8, floors: fl, d6: true }); });
  [[124, 79], [133, 79], [142, 79], [115, 88], [124, 88], [133, 88], [142, 88], [115, 97], [124, 97], [133, 97], [142, 97], [124, 106]].forEach(([x, z], i) =>
    rus6.push({ x, z, w: 7, d: 2.6, h: .15 + 5 * .7 + .2, c: PASTEL[(i + 1) % 6], t0: C4.grow + .2 + (i % 6) * .1, dur: .45, floors: 5, d6: true }));
  bset(apt6, aptM); bset(rus6, rusM, { roof: { geo: prism(7.4, .8, 3.0), cols: ['#E58F72', '#8FC9B4', '#B6A4D8'] } });
  // Day 7: five more towers and four rusun at the far south of the district (standing from the start of the episode)
  const apt7 = [], rus7 = [];
  [[56, 100], [61, 100], [70, 100], [79, 100], [88, 100]].forEach(([x, z], i) => { const fl = 15 + Math.floor(hash(x * 2.7 + z) * 9); apt7.push({ x, z, w: 4.6, d: 4.6, h: .3 + fl * .6 + .2, c: ['#F2D0D8', '#BFD6EE', '#BFE6D6', '#D8CCEE', '#F7ECD6'][i % 5], t0: -1e3, dur: .8, floors: fl }); });
  [[104, 106], [115, 106], [133, 106], [142, 106]].forEach(([x, z], i) => rus7.push({ x, z, w: 7, d: 2.6, h: .15 + 5 * .7 + .2, c: PASTEL[(i + 3) % 6], t0: -1e3, dur: .45, floors: 5 }));
  bset(apt7, aptM); bset(rus7, rusM, { roof: { geo: prism(7.4, .8, 3.0), cols: ['#8FC9B4', '#B6A4D8', '#E58F72'] } });
  // Day 8: one more tower and three rusun, the next row south (standing from the start of the episode)
  const apt8 = [], rus8 = [];
  [[104, 100]].forEach(([x, z], i) => { const fl = 17; apt8.push({ x, z, w: 4.6, d: 4.6, h: .3 + fl * .6 + .2, c: '#D8CCEE', t0: -1e3, dur: .8, floors: fl }); });
  [[106, 112], [124, 112], [142, 112]].forEach(([x, z], i) => rus8.push({ x, z, w: 7, d: 2.6, h: .15 + 5 * .7 + .2, c: PASTEL[(i + 1) % 6], t0: -1e3, dur: .45, floors: 5 }));
  bset(apt8, aptM); bset(rus8, rusM, { roof: { geo: prism(7.4, .8, 3.0), cols: ['#B6A4D8', '#E58F72', '#8FC9B4'] } });
  // Day 9: three more towers and six rusun, the next rows south; they grow on their own clock (bt9) in scene 3's time-lapse
  const apt9 = [], rus9 = [];
  [[113, 100], [122, 100], [131, 100]].forEach(([x, z], i) => { const fl = 15 + i * 2; apt9.push({ x, z, w: 4.6, d: 4.6, h: .3 + fl * .6 + .2, c: ['#BFE6D6', '#F2D0D8', '#BFD6EE'][i], t0: i * .25, dur: .8, floors: fl, d9: true }); });
  [104, 113, 122, 131, 140, 149].forEach((x, i) => rus9.push({ x, z: 118, w: 7, d: 2.6, h: .15 + 5 * .7 + .2, c: PASTEL[(i + 2) % 6], t0: .3 + i * .15, dur: .45, floors: 5, d9: true }));
  bset(apt9, aptM); bset(rus9, rusM, { roof: { geo: prism(7.4, .8, 3.0), cols: ['#E58F72', '#8FC9B4', '#B6A4D8'] } });
  // crowns and rooftop tanks on the towers
  const tops = [...apt.map(a => ({ ...a, cw: 5.0, ch: .5, cc: '#ffffff' })), ...off.map(a => ({ ...a, cw: 5.2, ch: .6, cc: '#E9EEF4' })), ...apt4.map(a => ({ ...a, cw: 5.0, ch: .5, cc: '#ffffff' })), ...apt5.map(a => ({ ...a, cw: 5.0, ch: .5, cc: '#ffffff' })), ...apt6.map(a => ({ ...a, cw: 5.0, ch: .5, cc: '#ffffff' })), ...apt7.map(a => ({ ...a, cw: 5.0, ch: .5, cc: '#ffffff' })), ...apt8.map(a => ({ ...a, cw: 5.0, ch: .5, cc: '#ffffff' })), ...apt9.map(a => ({ ...a, cw: 5.0, ch: .5, cc: '#ffffff' }))];
  const crownM = instanced(new THREE.BoxGeometry(1, 1, 1).translate(0, .5, 0), mat('#ffffff'), tops.length, tops.map(a => a.cc)); scene.add(crownM);
  const tank = instanced(new THREE.CylinderGeometry(.45, .45, .7, 10).translate(0, .35, 0), mat('#C9C3D3'), tops.length); scene.add(tank);
  // shrubs at the corners of the tall buildings, so their yards are not bare (never on a road or a sidewalk)
  // onRoad defined above
  const yard = [];
  for (const it of [...rus, ...apt, ...off, ...mid, ...apt4, ...rus4, ...apt5, ...rus5, ...apt6, ...rus6, ...apt7, ...rus7, ...apt8, ...rus8, ...apt9, ...rus9]) for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const x = it.x + sx * (it.w / 2 + .55), z = it.z + sz * (it.d / 2 + .5), h = hash(it.x * 3.1 + it.z * 1.7 + sx * 5 + sz);
    if (h < .2 || onRoad(x, z)) continue;
    yard.push({ x, z, ry: h * 6, s: .75 + hash(it.z + sx) * .55, t0: it.t0 + it.dur, d4: it.d4, d5: it.d5, d6: it.d6, c: ['#8FC48A', '#9CD3B0', '#7FB37A', '#A7CF8E', '#F6A7C1'][Math.floor(h * 5)] }); }
  const yardM = instanced(new THREE.IcosahedronGeometry(.5, 0).translate(0, .42, 0), mat('#ffffff'), yard.length, yard.map(y => y.c)); scene.add(yardM);

  // ---------- the station and the railway (south, by the gate) ----------
  const station = new THREE.Group(); station.position.copy(STATION); scene.add(station); const stParts = [];
  { const stM = cityMat('#F7ECD6', { fh: 1.2, base: .3, sx: 1.2, box: [.15, .85, .2, .8], lit: .8 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(12, 2.7, 3.6).translate(0, 1.35, 0), stM); station.add(body); stParts.push(body);
    const hall = new THREE.Mesh(new THREE.BoxGeometry(4, 3.8, 3.8).translate(0, 1.9, 0), stM); station.add(hall); stParts.push(hall);
    const r1 = new THREE.Mesh(prism(12.4, 1.0, 4.2), mat('#E58F72')); r1.position.y = 2.7; station.add(r1); stParts.push(r1);
    const r2 = new THREE.Mesh(prism(4.4, 1.3, 4.4), mat('#C4B3E3')); r2.rotation.y = Math.PI / 2; r2.position.y = 3.8; station.add(r2); stParts.push(r2);
    const plat = new THREE.Mesh(new THREE.BoxGeometry(22, .35, 1.8).translate(0, .175, 0), mat('#E6DED0')); plat.position.set(0, 0, 3.0); station.add(plat); stParts.push(plat);
    const edge = new THREE.Mesh(new THREE.BoxGeometry(22, .04, .18), mat('#F7D772')); edge.position.set(0, .37, 3.8); station.add(edge); stParts.push(edge);
    const can = new THREE.Group(); for (let x = -9; x <= 9; x += 3) { const p = new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 2.0, 6).translate(0, 1.0, 0), mat('#EEE6F6')); p.position.set(x, .35, 2.4); can.add(p); }
    const cr = new THREE.Mesh(new THREE.BoxGeometry(20, .1, 1.7), mat('#A8DCC8')); cr.position.set(0, 2.4, 2.9); cr.rotation.x = -.08; can.add(cr); station.add(can); stParts.push(can);
    const clk = new THREE.Mesh(new THREE.CylinderGeometry(.42, .42, .06, 20), mat('#FFFBF2')); clk.rotation.x = Math.PI / 2; clk.position.set(0, 3.0, -1.93); station.add(clk); stParts.push(clk);
    city.stationMat = stM; }
  sh(station);
  // rails and sleepers: one long line east-west
  const rails = new THREE.Group(); scene.add(rails);
  { const bed = new THREE.Mesh(new THREE.BoxGeometry(460, .06, 2.0), mat('#CFC4B4', { roughness: 1 })); bed.position.set(0, .03, RAIL_Z); bed.receiveShadow = true; rails.add(bed);
    for (const dz of [-.4, .4]) { const r = new THREE.Mesh(new THREE.BoxGeometry(460, .08, .08), mat('#8E8A96', { metalness: .3, roughness: .5 })); r.position.set(0, .12, RAIL_Z + dz); rails.add(r); }
    const sl = instanced(new THREE.BoxGeometry(.22, .05, 1.3), mat('#B79C82'), 700); sl.castShadow = false; for (let i = 0; i < 700; i++) setM(sl, i, -230 + i * .66, .08, RAIL_Z, 0, 1, 1, 1); rails.add(sl); }
  // the toy train: a locomotive and three carriages
  const train = new THREE.Group(); scene.add(train); const cars = [];
  for (let k = 0; k < 4; k++) { const g = new THREE.Group(), c = k === 0 ? '#F2A88A' : ['#A8DCC8', '#F7ECD6', '#C4B3E3'][k - 1];
    const b = new THREE.Mesh(new THREE.BoxGeometry(3.2, .95, .95).translate(0, .72, 0), mat(c)); g.add(b);
    const band = new THREE.Mesh(new THREE.BoxGeometry(3.22, .26, .97).translate(0, .9, 0), mat('#4E5B72', { roughness: .3 })); g.add(band);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(3.25, .1, 1.02).translate(0, 1.24, 0), mat('#FFFFFF')); g.add(roof);
    const base = new THREE.Mesh(new THREE.BoxGeometry(3.0, .22, .8).translate(0, .2, 0), mat('#4A4650')); g.add(base);
    if (k === 0) { const nose = new THREE.Mesh(new THREE.CylinderGeometry(.48, .48, .95, 12, 1, false, 0, Math.PI).rotateX(Math.PI / 2).rotateY(Math.PI / 2).translate(1.6, .72, 0), mat(c)); g.add(nose); }
    g.position.x = -k * 3.35; train.add(g); cars.push(g); }
  sh(train); train.position.set(STATION.x + 4, 0, RAIL_Z);

  // ---------- cars and buses on the lanes (left-hand traffic) ----------
  const lanes = [];
  for (const r of ROADS) { if (r.plain) continue; const offs = r.w > 4 ? [.62, 1.85] : [.85];
    for (const o of offs) for (const dir of [1, -1]) { const lat = r.ax === 'x' ? r.c - dir * o : r.c + dir * o; lanes.push({ r, lat, dir, L: r.a1 - r.a0 }); } }
  const veh = [];
  lanes.forEach((ln, li) => { const n = Math.max(1, Math.floor(ln.L / 85)); for (let k = 0; k < n; k++) if (hash(li * 3.7 + k * 5.3) > 0.3) veh.push({ ln, s0: (k + hash(li * 7.1 + k) * .6) / n * ln.L, v: 4.5 + hash(li + k * 3.3) * 2, bus: hash(li * 1.7 + k * 9.1) > .92, c: ['#F2A88A', '#A9C8EC', '#F7D772', '#A8DCC8', '#C4B3E3', '#F2B8C6', '#FFFFFF'][Math.floor(hash(li * 3 + k) * 7)] }); });
  const carsL = veh.filter(v => !v.bus), buses = veh.filter(v => v.bus);
  const cBody = instanced(new THREE.BoxGeometry(1.1, .32, .55).translate(0, .3, 0), mat('#ffffff', { roughness: .45 }), carsL.length, carsL.map(v => v.c));
  const cCab = instanced(new THREE.BoxGeometry(.6, .26, .5).translate(-.06, .58, 0), mat('#ffffff', { roughness: .3 }), carsL.length, carsL.map(() => '#5A6680'));
  const cBase = instanced(new THREE.BoxGeometry(1.0, .16, .6).translate(0, .09, 0), mat('#3D3A42'), carsL.length);
  const bBody = instanced(new THREE.BoxGeometry(2.7, .75, .72).translate(0, .52, 0), mat('#ffffff', { roughness: .5 }), buses.length, buses.map((v, i) => i % 2 ? '#F7D772' : '#A8DCC8'));
  const bWin = instanced(new THREE.BoxGeometry(2.72, .24, .74).translate(0, .68, 0), mat('#4E5B72', { roughness: .3 }), buses.length);
  const bBase = instanced(new THREE.BoxGeometry(2.5, .18, .7).translate(0, .1, 0), mat('#3D3A42'), buses.length);
  scene.add(cBody, cCab, cBase, bBody, bWin, bBase);

  // ---------- the six houses of worship around a small park (Kawasan Kerukunan) ----------
  const keruk = new THREE.Group(); keruk.position.copy(KERUK); scene.add(keruk);
  const oval = new THREE.Group(); oval.scale.set(.62, 1, 1.12); keruk.add(oval);          // an oval park, long in depth, so all six fit a portrait frame
  { const lawn = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, .06, 40), mat('#A3D08F', { roughness: 1 })); lawn.position.y = .03; lawn.receiveShadow = true; oval.add(lawn);
    const ring = new THREE.Mesh(new THREE.RingGeometry(6, 7.4, 48).rotateX(-Math.PI / 2), mat('#E9DFCD', { roughness: .95, side: THREE.DoubleSide })); ring.position.y = .065; ring.receiveShadow = true; oval.add(ring);
    const plaza = new THREE.Mesh(new THREE.RingGeometry(7.4, 15.6, 48).rotateX(-Math.PI / 2), mat('#B9DA9F', { roughness: 1, side: THREE.DoubleSide })); plaza.position.y = .04; plaza.receiveShadow = true; oval.add(plaza);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + Math.PI / 6, p = new THREE.Mesh(new THREE.BoxGeometry(1.4, .05, 4.2), mat('#E9DFCD')); p.position.set(Math.cos(a) * 9.4, .068, Math.sin(a) * 9.4); p.rotation.y = -a + Math.PI / 2; p.receiveShadow = true; oval.add(p); }
    const basin = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.4, .35, 24), mat('#E9DFCD')); basin.position.y = .17; keruk.add(basin);
    const water = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, .05, 24), mat('#9FD3EC', { roughness: .1, metalness: .2 })); water.position.y = .33; keruk.add(water);
    const sp = new THREE.Mesh(new THREE.CylinderGeometry(.12, .2, .7, 10), mat('#E9DFCD')); sp.position.y = .6; keruk.add(sp);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2, b = new THREE.Group(); const s = new THREE.Mesh(new THREE.BoxGeometry(1.0, .06, .3), mat(PAL.woodDark)); s.position.y = .33; b.add(s);
      const bk = new THREE.Mesh(new THREE.BoxGeometry(1.0, .28, .05), mat(PAL.woodDark)); bk.position.set(0, .5, -.13); b.add(bk); b.position.set(Math.cos(a) * 4.6 * .62, 0, Math.sin(a) * 4.6 * 1.12); b.rotation.y = -a - Math.PI / 2; keruk.add(b); }
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2 + .26, t = new THREE.Group(); const tr = new THREE.Mesh(new THREE.CylinderGeometry(.09, .12, .7, 6), mat('#B48A68')); tr.position.y = .35; t.add(tr);
      const cn = new THREE.Mesh(new THREE.IcosahedronGeometry(.62, 0), mat(i % 2 ? '#8FD3B8' : '#9CC48A')); cn.position.y = 1.15; t.add(cn); t.position.set(Math.cos(a) * 5.4 * .62, 0, Math.sin(a) * 5.4 * 1.12); keruk.add(t); }
    const fl = ['#F6A7C1', '#F7DD8C', '#C9B8E8', '#FFFFFF'];
    for (let i = 0; i < 60; i++) { const a = R() * 6.283, r = 2 + R() * 3.4, f = new THREE.Mesh(new THREE.IcosahedronGeometry(.08, 0), mat(fl[i % 4])); f.position.set(Math.cos(a) * r * .62, .12, Math.sin(a) * r * 1.12); keruk.add(f); } }
  sh(keruk);
  const worship = [makeMasjid(), makeGereja(), makeKatedral(), makePura(), makeVihara(), makeKlenteng()];
  const WP = [[0, -12.8], [5.8, -6.3], [5.8, 6.3], [0, 12.8], [-5.8, 6.3], [-5.8, -6.3]];
  worship.forEach((w, i) => { const [x, z] = WP[i]; w.root.position.set(x, 0, z); w.root.rotation.y = Math.atan2(-x, -z); keruk.add(w.root); });
  city.worship = worship; city.worshipWin = worship.flatMap(w => w.win);

  // ---------- Fasilitas: hospital, police, fire brigade ----------
  city.hosp = makeHospital(); city.hosp.root.position.copy(HOSP); scene.add(city.hosp.root);
  city.amb = makeAmbulance(); scene.add(city.amb);
  city.police = makePolice(); city.police.root.position.copy(POLICE); city.police.root.rotation.y = Math.PI; scene.add(city.police.root);
  city.patrol = makePatrol(); city.patrol.position.set(-66.6, 0, 24.8); city.patrol.rotation.y = Math.PI / 2; scene.add(city.patrol);
  // a small car park between the police and the fire station, and the ambulance bay beside the hospital
  { const lot = new THREE.Mesh(new THREE.BoxGeometry(9.2, .06, 5.4), mat('#B9C0CC', { roughness: .95 })); lot.position.set(-63.75, .03, 25.7); lot.receiveShadow = true; scene.add(lot);
    for (const x of [-65.2, -62.5]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.08, .065, 3.2), mat('#FFFFFF')); l.position.set(x, .035, 25.4); scene.add(l); }
    const bay = new THREE.Mesh(new THREE.BoxGeometry(4, .06, 5.6), mat('#B9C0CC', { roughness: .95 })); bay.position.set(-50.6, .03, 13.4); bay.receiveShadow = true; scene.add(bay); }
  city.fire = makeFireStation(); city.fire.root.position.copy(FIRE); city.fire.root.rotation.y = Math.PI; scene.add(city.fire.root);
  city.truck = makeFireTruck(); city.truck.root.position.set(-61.2, 0, 25.2); city.truck.root.rotation.y = Math.PI / 2; scene.add(city.truck.root);
  // the gapura of Kampung Angkatan 1, across the east street where it leaves the old village
  city.gapura = makeGapura(); city.gapura.position.copy(GAPURA); scene.add(city.gapura);
  // the street pieces that join the Kampung branches to the new streets
  // ---------- the mysterious building, alone in the far north ----------
  city.myst = makeMystery(); city.myst.root.position.copy(MYST); scene.add(city.myst.root);
  // ---------- Day 4: tower cranes over the new district, one more at the north end for the Monument ----------
  city.cranes = [[74.5, 48.5, '#F7D772'], [108.5, 48.5, '#F2A88A'], [65.5, 61.5, '#A8DCC8'], [117.5, 61.5, '#F7D772']].map(([x, z, c], i) => { const k = makeCrane(c, 22 + i * 1.5); k.root.position.set(x, 0, z); k.phase = i * 1.7; scene.add(k.root); return k; });
  city.northCrane = makeCrane('#F7D772', 26); city.northCrane.root.position.set(MYST.x - 10, 0, MYST.z - 9); scene.add(city.northCrane.root);   // behind the lot, out of the camera's way
  city.trucks = [0, 1, 2].map(i => { const k = makeTruck(['#F2A88A', '#A8DCC8', '#F7D772'][i]); scene.add(k.root); return k; });
  city.monument = makeMonument(); city.monument.root.position.copy(MYST); scene.add(city.monument.root);
  city.mpark = makeMonumentPark(); city.mpark.root.position.copy(MYST); scene.add(city.mpark.root);
  // the promenade from the north avenue to the Monument garden
  { const pv = new THREE.Mesh(new THREE.BoxGeometry(5, .1, 18), mat('#E9DFCD', { roughness: .95 })); pv.position.set(0, .05, -59); pv.receiveShadow = true; scene.add(pv); city.promenade = pv;
    for (let z = -51.5; z > -67; z -= 3.5) for (const s of [-1, 1]) { const tr = makeParkTree(s * 3.4, z, z * 7 + s); scene.add(tr); city.promenadeTrees = (city.promenadeTrees || []).concat(tr); } }

  // ---------- update: growth on the time-lapse clock, traffic, the train ----------
  const stack = (bt, it) => { if (bt < it.t0) return 0; const k = seg(bt, it.t0, it.t0 + it.dur); return Math.max(1 / it.floors, Math.ceil(k * it.floors - 1e-6) / it.floors); };
  city.update = (t, tw, bt, vt, bt4 = 1e9, bt5 = 1e9, bt6 = 1e9, clear = [], bt9 = 1e9) => {   // bt9: Day 9's towers (their own time-lapse)   // bt: the build clock (huge = all built, -huge = nothing); vt: the traffic clock; bt4..bt6: Day 4's, 5's, 6's towers; clear: [x, z, r] kept free of cars
    REV.uR.value = bt > 1e8 ? 1e5 : bt < -1e8 ? -1 : lerp(-1, 230, seg(bt, C.jalan - .2, C.jalan + 1.1));
    const rr = REV.uR.value;
    for (const s of sets) {
      s.items.forEach((it, i) => {
        const b = it.d9 ? bt9 : it.d6 ? bt6 : it.d5 ? bt5 : it.d4 ? bt4 : bt, k = s.kind === 'pop' ? (b < it.t0 ? 0 : back(seg(b, it.t0, it.t0 + it.dur), 2.2)) : stack(b, it);
        if (k <= 0) { s.m.setMatrixAt(i, M4.makeScale(0, 0, 0)); if (s.roof) s.roof.setMatrixAt(i, M4.makeScale(0, 0, 0)); if (s.awn) s.awn.setMatrixAt(i, M4.makeScale(0, 0, 0)); return; }
        if (s.kind === 'pop') setM(s.m, i, it.x, 0, it.z, 0, it.w * k, it.h * k, it.d * k); else setM(s.m, i, it.x, 0, it.z, 0, it.w, it.h * k, it.d);
        const done = s.kind === 'pop' ? k : (k >= 1 ? back(seg(b, it.t0 + it.dur, it.t0 + it.dur + .25), 2.2) : 0);
        if (s.roof) { if (done > 0) setM(s.roof, i, it.x, it.h * (s.kind === 'pop' ? k : 1), it.z, 0, Math.max(.001, done), Math.max(.001, done), Math.max(.001, done)); else s.roof.setMatrixAt(i, M4.makeScale(0, 0, 0)); }
        if (s.awn) { if (done > 0 && !it.big) setM(s.awn, i, it.x, 1.05, it.z + it.face * (it.d / 2 + .38), 0, it.w * .92, 1, done); else s.awn.setMatrixAt(i, M4.makeScale(0, 0, 0)); }
      });
      s.m.instanceMatrix.needsUpdate = true; if (s.roof) s.roof.instanceMatrix.needsUpdate = true; if (s.awn) s.awn.instanceMatrix.needsUpdate = true;
    }
    tops.forEach((a, i) => { const b = a.d9 ? bt9 : a.d6 ? bt6 : a.d5 ? bt5 : a.d4 ? bt4 : bt, k = b < a.t0 + a.dur ? 0 : back(seg(b, a.t0 + a.dur, a.t0 + a.dur + .25), 2.2);
      if (k <= 0) { crownM.setMatrixAt(i, M4.makeScale(0, 0, 0)); tank.setMatrixAt(i, M4.makeScale(0, 0, 0)); return; }
      setM(crownM, i, a.x, a.h, a.z, 0, a.cw * k, a.ch * k, a.cw * k); setM(tank, i, a.x + 1.1, a.h + a.ch, a.z - .9, 0, k, k, k); });
    crownM.instanceMatrix.needsUpdate = tank.instanceMatrix.needsUpdate = true;
    // street furniture appears where the asphalt has reached
    const shown = (x, z, lag = 6) => clamp((rr - d0(x, z)) / lag);
    city.trees.forEach((tr, i) => { const k = back(shown(tr.x, tr.z), 2.2); if (k <= .001) { trunk.setMatrixAt(i, M4.makeScale(0, 0, 0)); crown.setMatrixAt(i, M4.makeScale(0, 0, 0)); return; }
      setM(trunk, i, tr.x, .1, tr.z, tr.ry, tr.s * k, tr.s * k, tr.s * k); setM(crown, i, tr.x, .1, tr.z, tr.ry, tr.s * k, tr.s * k, tr.s * k); });
    trunk.instanceMatrix.needsUpdate = crown.instanceMatrix.needsUpdate = true;
    city.lamps.forEach((l, i) => { const k = shown(l.x, l.z, 4); for (const m of [lpole, lhead, larm]) if (k <= .001) m.setMatrixAt(i, M4.makeScale(0, 0, 0)); else setM(m, i, l.x, .1, l.z, l.ry, 1, k, 1); });
    lpole.instanceMatrix.needsUpdate = lhead.instanceMatrix.needsUpdate = larm.instanceMatrix.needsUpdate = true;
    const cyc = vt % 7, col = new THREE.Color();
    city.tl.forEach((L, i) => { const k = shown(L.x, L.z, 4); for (const m of [tpole, thead, tlamp]) if (k <= .001) m.setMatrixAt(i, M4.makeScale(0, 0, 0)); else setM(m, i, L.x, .1, L.z, 0, 1, k, 1);
      const p = (cyc + L.ph * 3.5) % 7; tlamp.setColorAt(i, col.set(p < 3 ? '#7BE07B' : p < 3.5 ? '#FFD27A' : '#F2737B')); });
    tpole.instanceMatrix.needsUpdate = thead.instanceMatrix.needsUpdate = tlamp.instanceMatrix.needsUpdate = true; tlamp.instanceColor.needsUpdate = true;
    for (const [m, list] of furniture) { list.forEach((f, i) => { const k = back(shown(f.x, f.z, 5), 2.2); if (k <= .001) m.setMatrixAt(i, M4.makeScale(0, 0, 0)); else setM(m, i, f.x, .1, f.z, f.ry, k, k, k); }); m.instanceMatrix.needsUpdate = true; }
    yard.forEach((y, i) => { const b = y.d9 ? bt9 : y.d6 ? bt6 : y.d5 ? bt5 : y.d4 ? bt4 : bt, k = b < y.t0 ? 0 : back(seg(b, y.t0, y.t0 + .25), 2.2); if (k <= .001) yardM.setMatrixAt(i, M4.makeScale(0, 0, 0)); else setM(yardM, i, y.x, 0, y.z, y.ry, y.s * k, y.s * k, y.s * k); });
    yardM.instanceMatrix.needsUpdate = true;
    // traffic: cars only where the road is laid, after the roads are done
    const carsOn = bt > 1e8 || bt >= C.jalan + .4;
    const place = (list, meshes, len) => list.forEach((v, i) => {
      const s = ((v.s0 + v.v * vt) % v.ln.L + v.ln.L) % v.ln.L, a = v.ln.dir > 0 ? v.ln.r.a0 + s : v.ln.r.a1 - s;
      const [x, z] = v.ln.r.ax === 'x' ? [a, v.ln.lat] : [v.ln.lat, a];
      const ok = carsOn && shown(x, z, 2) >= 1 && !clear.some(([cx, cz, cr]) => Math.hypot(x - cx, z - cz) < cr) && Math.abs(a - (v.ln.dir > 0 ? v.ln.r.a0 : v.ln.r.a1)) > len && Math.abs(a - (v.ln.dir > 0 ? v.ln.r.a1 : v.ln.r.a0)) > len;
      const ry = v.ln.r.ax === 'x' ? (v.ln.dir > 0 ? 0 : Math.PI) : (v.ln.dir > 0 ? -Math.PI / 2 : Math.PI / 2);
      for (const m of meshes) if (!ok) m.setMatrixAt(i, M4.makeScale(0, 0, 0)); else setM(m, i, x, .05, z, ry, 1, 1, 1);
    });
    place(carsL, [cBody, cCab, cBase], 1); place(buses, [bBody, bWin, bBase], 2);
    for (const m of [cBody, cCab, cBase, bBody, bWin, bBase]) m.instanceMatrix.needsUpdate = true;
    // the station, then the train leaves
    station.visible = bt > 1e8 || bt >= C.stasiun - .15;
    city.gapura.visible = bt > 1e8 || bt >= C.jalan;
    stParts.forEach((p, j) => { p.scale.setScalar(Math.max(.001, bt > 1e8 ? 1 : pop(bt, C.stasiun - .15 + j * .04, .25))); });
    rails.visible = bt > 1e8 || shown(0, RAIL_Z, 2) > 0 || bt >= C.stasiun - .3;
    const go = bt > 1e8 ? vt - C.S6 + 30 : vt - (C.stasiun + .45);
    train.visible = bt > 1e8 || bt >= C.stasiun + .05;
    train.position.x = STATION.x + 4 + Math.max(0, go) * 9 * Math.min(1, Math.max(0, go) / 1.2 + .2);
    train.position.x = ((train.position.x + 240) % 480 + 480) % 480 - 240;
  };
  // ---------- the request buildings: houses of worship (gentle), hospital, police and fire station (time-lapse) ----------
  city.buildWorship = k => worship.forEach((w, i) => { const u = eio(seg(k, i * .16, i * .16 + .5)); w.root.visible = u > 0; w.parts.forEach((p, j) => p.scale.set(1, Math.max(.001, eio(seg(u, j / w.parts.length * .6, j / w.parts.length * .6 + .4))), 1)); });
  city.buildParts = (o, k) => { o.root.visible = k > 0; o.parts.forEach((p, j) => { const u = pop(k, j / o.parts.length * .8, .2); p.visible = u > 0; p.scale.set(1, Math.max(.001, u), 1); }); };
  // ---------- night: lights in order (lamps, traffic lights, windows, station, hospital, houses of worship) ----------
  city.night = (t, k, t0) => {
    const on = d => (t >= t0 + d ? 1 : 0) * k;
    headM.emissiveIntensity = 2.4 * on(0);
    tlamp.material.color.setScalar(.7 + .9 * on(.2));
    for (const m of [rusM, aptM, offM, shopM, midSet.m.material, hsSet.m.material]) m.userData.U.uNight.value = on(.35);
    city.stationMat.userData.U.uNight.value = on(.55);
    city.hosp.win.userData.U.uNight.value = on(.7); for (const o of [city.hosp, city.police, city.fire]) o.sign.emissiveIntensity = .9 * on(.7);
    for (const m of city.worshipWin) m.emissiveIntensity = .9 * on(.85);
    city.police.win.userData.U.uNight.value = on(.7); city.fire.win.userData.U.uNight.value = on(.7);
    city.mpark.lampM.emissiveIntensity = 2.0 * on(.95);
  };
  city.sets = { rus, apt, off, shops, hs };
  city.walkSpots = () => {                                                   // sidewalk spots for the crowd, and a few on the zebra crossings
    const P = [], Rw = mulberry(17);
    for (const r of ROADS) for (const sp of r.spans || []) { const dens = r.w > 4 ? 1.25 : 2.6;
      for (let a = sp.a + .5; a < sp.b - .5; a += dens * (.7 + Rw() * .6)) { const lat = r.c + sp.off + (Rw() - .5) * 1.1; const pt = r.ax === 'x' ? [a, lat] : [lat, a]; if (!nearRail(pt[0], pt[1])) P.push(pt); } }
    for (const q of XS) if (q.big && !q.plain) for (let k = 0; k < 6; k++) { const s = k % 2 ? 1 : -1; P.push([q.x + s * (q.wx / 2 + .75) + (Rw() - .5) * .5, q.z + (Rw() - .5) * q.wz * .8]); }
    for (let k = 0; k < 40; k++) P.push([STATION.x - 9 + Rw() * 18, STATION.z + 2.7 + Rw() * 1.0]);
    return P.filter(([x, z]) => x > -150 && x < 150);
  };
  return city;
}

// ---------- the request buildings ----------
function partsGroup() { const root = new THREE.Group(), parts = []; const add = (m, x = 0, y = 0, z = 0) => { m.position.set(x, y, z); const p = new THREE.Group(); p.add(m); root.add(p); parts.push(p); return m; }; return { root, parts, add }; }
const winGlow = c => mat(c, { emissive: '#FFCB7A', emissiveIntensity: 0 });
function makeMasjid() {
  const { root, parts, add } = partsGroup(), cream = mat('#F7F1E4'), mint = mat('#8FD3B8'), mintL = mat('#BFE6D6'), gold = mat(PAL.gold, { metalness: .5, roughness: .35 }), w = winGlow('#7FA8C8');
  add(new THREE.Mesh(new THREE.BoxGeometry(5.2, .3, 5.2).translate(0, .15, 0), mat('#EFE6D6')));
  add(new THREE.Mesh(new THREE.BoxGeometry(4, 2.1, 4).translate(0, 1.05, 0), cream), 0, .3, 0);
  add(new THREE.Mesh(new THREE.BoxGeometry(4.25, .22, 4.25).translate(0, .11, 0), mint), 0, 2.4, 0);
  add(new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, .45, 24).translate(0, .22, 0), mintL), 0, 2.62, 0);
  add(new THREE.Mesh(new THREE.SphereGeometry(1.42, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), mint), 0, 3.06, 0);
  add(new THREE.Mesh(new THREE.ConeGeometry(.08, .6, 8).translate(0, .3, 0), gold), 0, 4.45, 0);
  const min = add(new THREE.Mesh(new THREE.CylinderGeometry(.3, .36, 4.9, 12).translate(0, 2.45, 0), cream), 1.95, .3, -1.95);
  add(new THREE.Mesh(new THREE.CylinderGeometry(.48, .48, .14, 12), mint), 1.95, 4.0, -1.95);
  add(new THREE.Mesh(new THREE.SphereGeometry(.34, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mint), 1.95, 5.2, -1.95);
  add(new THREE.Mesh(new THREE.ConeGeometry(.05, .4, 6).translate(0, .2, 0), gold), 1.95, 5.5, -1.95);
  const door = add(new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.2, .06).translate(0, .6, 0), mat('#6FA898')), 0, .3, 2.02);
  add(new THREE.Mesh(new THREE.CylinderGeometry(.5, .5, .06, 16, 1, false, 0, Math.PI).rotateX(Math.PI / 2).rotateZ(Math.PI / 2).translate(0, 1.2, 0), mat('#6FA898')), 0, .3, 2.02);
  for (const x of [-1.3, 1.3]) add(new THREE.Mesh(new THREE.BoxGeometry(.5, .8, .06).translate(0, .4, 0), w), x, 1.0, 2.02);
  return { root: sh(root), parts, win: [w] };
}
function makeGereja() {
  const { root, parts, add } = partsGroup(), wall = mat('#F7F3EC'), blue = mat('#A9C8EC'), w = winGlow('#8FA8D8'), white = mat('#FFFFFF');
  add(new THREE.Mesh(new THREE.BoxGeometry(4.4, .3, 5.4).translate(0, .15, 0), mat('#EFE6D6')));
  add(new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.2, 4.4).translate(0, 1.1, 0), wall), 0, .3, -.3);
  const r = add(new THREE.Mesh(prism(4.8, 1.4, 3.9), blue), 0, 2.5, -.3); r.rotation.y = Math.PI / 2;
  add(new THREE.Mesh(new THREE.BoxGeometry(1.3, 3.7, 1.3).translate(0, 1.85, 0), wall), 0, .3, 2.0);
  add(new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.5, 4).rotateY(Math.PI / 4).translate(0, .75, 0), blue), 0, 4.0, 2.0);
  add(new THREE.Mesh(new THREE.BoxGeometry(.06, .5, .06).translate(0, .25, 0), white), 0, 5.5, 2.0);
  add(new THREE.Mesh(new THREE.BoxGeometry(.3, .06, .06), white), 0, 5.85, 2.0);
  add(new THREE.Mesh(new THREE.BoxGeometry(.6, 1.0, .06).translate(0, .5, 0), mat('#C08F72')), 0, .3, 2.67);
  add(new THREE.Mesh(new THREE.BoxGeometry(.4, .5, .06).translate(0, .25, 0), w), 0, 2.9, 2.67);
  for (const z of [-1.6, -.2]) for (const x of [-1.72, 1.72]) add(new THREE.Mesh(new THREE.BoxGeometry(.06, 1.0, .4).translate(0, .5, 0), w), x, 1.0, z);
  return { root: sh(root), parts, win: [w] };
}
function makeKatedral() {
  const { root, parts, add } = partsGroup(), wall = mat('#F1E6D8'), roof = mat('#B8AED6'), w = winGlow('#9FB2E0'), gold = mat(PAL.gold, { metalness: .5, roughness: .35 });
  add(new THREE.Mesh(new THREE.BoxGeometry(4.6, .3, 5.6).translate(0, .15, 0), mat('#E9DFCD')));
  add(new THREE.Mesh(new THREE.BoxGeometry(3.4, 2.5, 4.6).translate(0, 1.25, 0), wall), 0, .3, -.4);
  const r = add(new THREE.Mesh(prism(4.9, 1.8, 3.8), roof), 0, 2.8, -.4); r.rotation.y = Math.PI / 2;
  for (const x of [-1.25, 1.25]) {
    add(new THREE.Mesh(new THREE.BoxGeometry(1.0, 3.9, 1.0).translate(0, 1.95, 0), wall), x, .3, 2.0);
    add(new THREE.Mesh(new THREE.ConeGeometry(.72, 1.9, 4).rotateY(Math.PI / 4).translate(0, .95, 0), roof), x, 4.2, 2.0);
    add(new THREE.Mesh(new THREE.BoxGeometry(.05, .36, .05).translate(0, .18, 0), gold), x, 6.08, 2.0);
    add(new THREE.Mesh(new THREE.BoxGeometry(.22, .05, .05), gold), x, 6.32, 2.0);
    add(new THREE.Mesh(new THREE.BoxGeometry(.32, .9, .06).translate(0, .45, 0), w), x, 2.0, 2.52);
  }
  add(new THREE.Mesh(new THREE.CylinderGeometry(.48, .48, .08, 20).rotateX(Math.PI / 2), w), 0, 2.65, 1.92);
  add(new THREE.Mesh(new THREE.BoxGeometry(.8, 1.3, .06).translate(0, .65, 0), mat('#9C7A64')), 0, .3, 1.92);
  return { root: sh(root), parts, win: [w] };
}
function makePura() {
  const { root, parts, add } = partsGroup(), brick = mat('#E3A184'), trim = mat('#F4E6D2'), thatch = mat('#7D6E70'), stone = mat('#D9CBB8'), w = winGlow('#F4E6D2');
  add(new THREE.Mesh(new THREE.BoxGeometry(5.0, .25, 5.4).translate(0, .125, 0), stone));
  for (const s of [-1, 1]) {                                                 // candi bentar: the split gate
    let y = .25; for (const [wd, h] of [[1.2, .9], [1.0, .9], [.8, .8], [.6, .6], [.36, .5]]) { add(new THREE.Mesh(new THREE.BoxGeometry(wd, h, wd).translate(0, h / 2, 0), brick), s * (.38 + wd / 2), y, 2.1); add(new THREE.Mesh(new THREE.BoxGeometry(wd + .1, .08, wd + .1), trim), s * (.38 + wd / 2), y + h, 2.1); y += h; }
  }
  add(new THREE.Mesh(new THREE.BoxGeometry(1.9, .9, 1.9).translate(0, .45, 0), brick), 0, .25, -.9);
  add(new THREE.Mesh(new THREE.BoxGeometry(.9, .7, .9).translate(0, .35, 0), trim), 0, 1.15, -.9);
  let y = 1.85; [1.5, 1.25, 1.0, .78, .58].forEach((r, i) => { add(new THREE.Mesh(new THREE.ConeGeometry(r, .42, 4).rotateY(Math.PI / 4).translate(0, .21, 0), thatch), 0, y, -.9); y += .42; if (i < 4) { add(new THREE.Mesh(new THREE.BoxGeometry(.35, .16, .35).translate(0, .08, 0), w), 0, y, -.9); y += .16; } });
  add(new THREE.Mesh(new THREE.ConeGeometry(.12, .4, 6).translate(0, .2, 0), mat(PAL.gold)), 0, y, -.9);
  add(new THREE.Mesh(new THREE.BoxGeometry(1.2, .8, 1.2).translate(0, .4, 0), trim), 1.7, .25, .4);
  add(new THREE.Mesh(new THREE.ConeGeometry(1.05, .7, 4).rotateY(Math.PI / 4).translate(0, .35, 0), thatch), 1.7, 1.05, .4);
  return { root: sh(root), parts, win: [w] };
}
function makeVihara() {
  const { root, parts, add } = partsGroup(), wall = mat('#F6E3B5'), col = mat('#E8857A'), roof = mat('#F0B860'), gold = mat(PAL.gold, { metalness: .5, roughness: .35 }), white = mat('#FBF6EC'), w = winGlow('#E8857A');
  add(new THREE.Mesh(new THREE.BoxGeometry(5.2, .3, 4.6).translate(0, .15, 0), mat('#EFE6D6')));
  add(new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.8, 3.0).translate(0, .9, 0), wall), -.5, .3, -.2);
  for (const x of [-2.0, -.9, .1, 1.0]) add(new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, 1.8, 8).translate(0, .9, 0), col), x, .3, 1.45);
  add(new THREE.Mesh(new THREE.ConeGeometry(3.1, 1.0, 4).rotateY(Math.PI / 4).scale(1, 1, .82).translate(0, .5, 0), roof), -.5, 2.1, -.2);
  add(new THREE.Mesh(new THREE.BoxGeometry(1.6, .5, 1.3).translate(0, .25, 0), wall), -.5, 2.85, -.2);
  add(new THREE.Mesh(new THREE.ConeGeometry(1.7, .8, 4).rotateY(Math.PI / 4).scale(1, 1, .82).translate(0, .4, 0), roof), -.5, 3.3, -.2);
  add(new THREE.Mesh(new THREE.ConeGeometry(.08, .45, 6).translate(0, .22, 0), gold), -.5, 4.05, -.2);
  add(new THREE.Mesh(new THREE.BoxGeometry(.8, 1.2, .06).translate(0, .6, 0), w), -.5, .3, 1.31);
  // the small stupa beside it
  add(new THREE.Mesh(new THREE.CylinderGeometry(.85, 1.0, .5, 16).translate(0, .25, 0), white), 1.75, .3, -1.1);
  add(new THREE.Mesh(new THREE.SphereGeometry(.85, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2).scale(1, 1.25, 1), white), 1.75, .8, -1.1);
  add(new THREE.Mesh(new THREE.BoxGeometry(.42, .32, .42).translate(0, .16, 0), white), 1.75, 1.85, -1.1);
  add(new THREE.Mesh(new THREE.ConeGeometry(.2, 1.6, 10).translate(0, .8, 0), gold), 1.75, 2.15, -1.1);
  return { root: sh(root), parts, win: [w] };
}
function makeKlenteng() {
  const { root, parts, add } = partsGroup(), wall = mat('#F7ECD6'), red = mat('#E27272'), roof = mat('#7DBFA8'), gold = mat(PAL.gold, { metalness: .5, roughness: .35 }), w = winGlow('#E27272');
  add(new THREE.Mesh(new THREE.BoxGeometry(5.0, .35, 4.4).translate(0, .175, 0), mat('#E9DFCD')));
  add(new THREE.Mesh(new THREE.BoxGeometry(4.0, 1.9, 3.0).translate(0, .95, 0), wall), 0, .35, -.3);
  for (const x of [-1.8, -.6, .6, 1.8]) add(new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, 1.9, 8).translate(0, .95, 0), red), x, .35, 1.4);
  add(new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.3, .06).translate(0, .65, 0), red), 0, .35, 1.21);
  // a curved roof: two shallow slopes, a raised ridge with swallow-tail ends, little ornaments
  for (const s of [-1, 1]) { const sl = add(new THREE.Mesh(new THREE.BoxGeometry(5.0, .12, 2.3), roof), 0, 2.72, s * .85); sl.rotation.x = s * .42; }
  add(new THREE.Mesh(new THREE.BoxGeometry(4.4, .22, .3), roof), 0, 3.2, 0);
  for (const s of [-1, 1]) { const tail = add(new THREE.Mesh(new THREE.TorusGeometry(.35, .07, 6, 12, Math.PI * .9), roof), s * 2.3, 3.3, 0); tail.rotation.z = s > 0 ? -.4 : Math.PI + .4;
    add(new THREE.Mesh(new THREE.SphereGeometry(.13, 10, 8), gold), s * 2.62, 3.62, 0); }
  add(new THREE.Mesh(new THREE.SphereGeometry(.2, 12, 10), gold), 0, 3.48, 0);
  for (const s of [-1, 1]) add(new THREE.Mesh(new THREE.TorusGeometry(.2, .05, 6, 12, Math.PI), gold), s * .45, 3.38, 0);
  for (const x of [-1.2, 1.2]) { add(new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, .34, 10), w), x, 2.0, 1.75); }
  return { root: sh(root), parts, win: [w] };
}
// a sign board with lettering, lit at night
function signBoard(text, w, h, bg, fg, border, icon) {
  const t = signTex((x, v, cw, ch) => { x.fillStyle = bg; x.fillRect(0, 0, cw, ch); x.strokeStyle = border; x.lineWidth = 14; x.strokeRect(7, 7, cw - 14, ch - 14);
    let X = cw / 2; if (icon) { x.fillStyle = icon; x.fillRect(64, ch / 2 - 14, 64, 28); x.fillRect(82, ch / 2 - 32, 28, 64); X += 46; }
    let size = Math.round(ch * .58); x.font = `${size}px "Lilita One"`; while (x.measureText(text).width > cw - (icon ? 230 : 80) && size > 20) { size -= 2; x.font = `${size}px "Lilita One"`; }
    x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, X, ch / 2 + 5); }, 1024, Math.round(1024 * h / w)); t.set(1);
  const m = new THREE.MeshStandardMaterial({ map: t.t, roughness: .6, emissiveMap: t.t, emissive: '#FFFFFF', emissiveIntensity: 0 }), side = mat(border);
  return { mesh: new THREE.Mesh(new THREE.BoxGeometry(w, h, .14), [side, side, side, side, m, side]), m };
}
function makeHospital() {
  const { root, parts, add } = partsGroup(), win = cityMat('#F7F3EC', { fh: 1.05, base: .45, sx: 1.0, box: [.18, .82, .25, .75], band: .4, lit: .75 }), mint = cityMat('#A8DCC8', { fh: 1.05, base: .45, sx: .65, box: [.3, .7, .3, .7], lit: .5 });
  add(new THREE.Mesh(new THREE.BoxGeometry(13.8, .25, 6.6).translate(0, .125, 0), mat('#E6DED0')));
  add(new THREE.Mesh(new THREE.BoxGeometry(11, 4.45, 6).translate(0, 2.225, 0), win), 0, .25, 0);                    // the wards
  for (const s of [-1, 1]) add(new THREE.Mesh(new THREE.BoxGeometry(1.3, 5.1, 6.2).translate(0, 2.55, 0), mint), s * 6.15, .25, 0);   // mint stair towers at both ends
  add(new THREE.Mesh(new THREE.BoxGeometry(11.1, .2, 6.1).translate(0, .1, 0), mat('#EDE7DD')), 0, 4.7, 0);
  add(new THREE.Mesh(new THREE.BoxGeometry(3.4, .14, 1.5), mat('#8FD3B8')), 0, 1.6, 3.75);                           // the entrance canopy, on two posts
  for (const x of [-1.5, 1.5]) add(new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 1.28, 6).translate(0, .64, 0), mat('#FFFFFF')), x, .25, 4.35);
  add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.15, .06).translate(0, .575, 0), mat('#9FC8DE', { roughness: .2 })), 0, .25, 3.03);
  // the helipad on the roof
  add(new THREE.Mesh(new THREE.CylinderGeometry(1.9, 1.9, .06, 28).translate(0, .03, 0), mat('#9AA3AE')), 2.6, 4.9, -.7);
  add(new THREE.Mesh(new THREE.TorusGeometry(1.6, .07, 4, 32).rotateX(Math.PI / 2), mat('#FFFFFF')), 2.6, 4.98, -.7);
  for (const x of [-.45, .45]) add(new THREE.Mesh(new THREE.BoxGeometry(.18, .04, 1.3), mat('#FFFFFF')), 2.6 + x, 4.98, -.7);
  add(new THREE.Mesh(new THREE.BoxGeometry(.9, .04, .18), mat('#FFFFFF')), 2.6, 4.98, -.7);
  // the rooftop sign: RS. NETIZEN CITY
  const sign = signBoard('RS. NETIZEN CITY', 7, 1.1, '#FFFFFF', '#3E8C78', '#8FD3B8', '#F2A0B4');
  for (const x of [-2.6, 2.6]) add(new THREE.Mesh(new THREE.BoxGeometry(.14, 1.0, .14).translate(0, .5, 0), mat('#C9CED6')), x, 4.9, 2.3);
  add(sign.mesh, 0, 6.4, 2.35);
  return { root: sh(root), parts, win, sign: sign.m };
}
function makeAmbulance() {
  const g = new THREE.Group(), cream = mat('#FBF6EC', { roughness: .45 }), mint = mat('#8FD3B8'), pink = mat('#F2A0B4');
  const b = new THREE.Mesh(new THREE.BoxGeometry(1.7, .8, .8).translate(0, .55, 0), cream); g.add(b);
  const cab = new THREE.Mesh(new THREE.BoxGeometry(.5, .5, .78).translate(1.05, .45, 0), cream); g.add(cab);
  const ws = new THREE.Mesh(new THREE.BoxGeometry(.06, .28, .7).translate(1.3, .55, 0), mat('#5A6680', { roughness: .3 })); g.add(ws);
  const st = new THREE.Mesh(new THREE.BoxGeometry(1.72, .14, .82).translate(0, .5, 0), mint); g.add(st);
  for (const s of [-1, 1]) { const p1 = new THREE.Mesh(new THREE.BoxGeometry(.36, .12, .02).translate(-.2, .78, s * .41), pink), p2 = new THREE.Mesh(new THREE.BoxGeometry(.12, .36, .02).translate(-.2, .78, s * .41), pink); g.add(p1, p2); }
  const lt = new THREE.Mesh(new THREE.BoxGeometry(.3, .1, .2).translate(.2, 1.0, 0), mat('#F2737B', { emissive: '#F2737B', emissiveIntensity: .4 })); g.add(lt);
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.9, .18, .74).translate(.15, .1, 0), mat('#3D3A42')); g.add(base);
  return sh(g);
}
function makePolice() {
  const { root, parts, add } = partsGroup(), win = cityMat('#A9C8EC', { fh: 1.25, base: .35, sx: 1.1, box: [.2, .8, .24, .74], lit: .7 }), navy = mat('#4F6FA8'), white = mat('#F4F6FA');
  add(new THREE.Mesh(new THREE.BoxGeometry(7.6, .2, 5.4).translate(0, .1, 0), mat('#E6DED0')));
  add(new THREE.Mesh(new THREE.BoxGeometry(7, 2.8, 5).translate(0, 1.4, 0), win), 0, .2, 0);
  add(new THREE.Mesh(new THREE.BoxGeometry(7.08, .22, 5.08).translate(0, .11, 0), navy), 0, 1.4, 0);
  add(new THREE.Mesh(new THREE.BoxGeometry(7.3, .3, 5.3).translate(0, .15, 0), white), 0, 3.0, 0);
  // the portico: two columns, a flat canopy with the POLISI sign standing on it, glass doors
  for (const x of [-1.05, 1.05]) add(new THREE.Mesh(new THREE.BoxGeometry(.26, 2.2, .26).translate(0, 1.1, 0), white), x, .2, 3.25);
  add(new THREE.Mesh(new THREE.BoxGeometry(2.8, .18, 1.0).translate(0, .09, 0), white), 0, 2.4, 3.0);
  add(new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.5, .06).translate(0, .75, 0), mat('#5D79A8', { roughness: .25 })), 0, .2, 2.53);
  const sign = signBoard('POLISI', 2.4, .55, '#4F6FA8', '#FFFFFF', '#3E5A8E'); add(sign.mesh, 0, 2.86, 3.4);
  for (const x of [-2.6, 2.6]) add(new THREE.Mesh(new THREE.BoxGeometry(1.8, .45, .5).translate(0, .225, 0), mat('#8FC48A')), x, .2, 2.85);
  add(new THREE.Mesh(new THREE.BoxGeometry(.5, .16, .22), mat('#F2737B', { emissive: '#F2737B', emissiveIntensity: .5 })), -.26, 3.38, 0);
  add(new THREE.Mesh(new THREE.BoxGeometry(.5, .16, .22), mat('#6C8FE0', { emissive: '#6C8FE0', emissiveIntensity: .5 })), .26, 3.38, 0);
  add(new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 3.4, 6).translate(0, 1.7, 0), mat('#D9D5CF')), -3.4, .2, 3.3);
  add(new THREE.Mesh(new THREE.BoxGeometry(.6, .19, .02).translate(.3, .095, 0), mat('#E5575B')), -3.4, 3.4, 3.3);
  add(new THREE.Mesh(new THREE.BoxGeometry(.6, .19, .02).translate(.3, -.095, 0), mat('#FFFFFF')), -3.4, 3.4, 3.3);
  return { root: sh(root), parts, win, sign: sign.m };
}
function makePatrol() {
  const g = new THREE.Group(), white = mat('#F7F8FB', { roughness: .4 }), blue = mat('#5F7FB8');
  g.add(new THREE.Mesh(new THREE.BoxGeometry(1.25, .34, .6).translate(0, .32, 0), white));
  g.add(new THREE.Mesh(new THREE.BoxGeometry(1.27, .12, .62).translate(0, .25, 0), blue));
  g.add(new THREE.Mesh(new THREE.BoxGeometry(.68, .28, .55).translate(-.05, .62, 0), mat('#5A6680', { roughness: .3 })));
  g.add(new THREE.Mesh(new THREE.BoxGeometry(.18, .07, .4).translate(-.05, .8, 0), mat('#ffffff')));
  g.add(new THREE.Mesh(new THREE.BoxGeometry(.08, .08, .18).translate(-.05, .84, -.11), mat('#F2737B', { emissive: '#F2737B', emissiveIntensity: .6 })));
  g.add(new THREE.Mesh(new THREE.BoxGeometry(.08, .08, .18).translate(-.05, .84, .11), mat('#6C8FE0', { emissive: '#6C8FE0', emissiveIntensity: .6 })));
  g.add(new THREE.Mesh(new THREE.BoxGeometry(1.1, .16, .64).translate(0, .09, 0), mat('#3D3A42')));
  return sh(g);
}
function makeFireStation() {
  const { root, parts, add } = partsGroup(), coral = '#F4A08E', win = cityMat(coral, { fh: 1.25, base: 2.1, sx: 1.05, box: [.2, .8, .22, .76], lit: .7 }), cream = mat('#F7ECD6'), dark = mat('#4A4650');
  add(new THREE.Mesh(new THREE.BoxGeometry(8.6, .2, 6.2).translate(0, .1, 0), mat('#E6DED0')));
  add(new THREE.Mesh(new THREE.BoxGeometry(8, 3.5, 6).translate(0, 1.75, 0), win), 0, .2, 0);
  add(new THREE.Mesh(new THREE.BoxGeometry(8.08, .18, 6.08).translate(0, .09, 0), cream), 0, 2.0, 0);
  add(new THREE.Mesh(new THREE.BoxGeometry(8.3, .28, 6.3).translate(0, .14, 0), cream), 0, 3.7, 0);
  // two garage bays in cream frames, roller doors down
  const doors = [];
  for (const x of [-1.9, 1.7]) {
    add(new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.7, .05).translate(0, .85, 0), dark), x, .2, 3.03);
    for (const s of [-1, 1]) add(new THREE.Mesh(new THREE.BoxGeometry(.2, 1.85, .16).translate(0, .925, 0), cream), x + s * 1.34, .2, 3.05);
    add(new THREE.Mesh(new THREE.BoxGeometry(2.88, .2, .16).translate(0, .1, 0), cream), x, 1.95, 3.05);
    const d = add(new THREE.Mesh(new THREE.BoxGeometry(2.42, 1.66, .06).translate(0, -.83, 0), mat('#FBF3E8')), x, 1.88, 3.08); doors.push(d);
    for (let k = 0; k < 6; k++) { const l = new THREE.Mesh(new THREE.BoxGeometry(2.42, .03, .08), mat('#E3D3C0')); l.position.y = -.14 - k * .27; d.add(l); }
  }
  const sign = signBoard('DAMKAR', 3.2, .6, '#E8645A', '#FFFFFF', '#C94E46'); add(sign.mesh, 0, 2.9, 3.1);
  // the hose tower at the back corner, with its own little roof and siren
  add(new THREE.Mesh(new THREE.BoxGeometry(1.8, 7.6, 1.8).translate(0, 3.8, 0), win), 3.0, .2, -2.0);
  add(new THREE.Mesh(new THREE.BoxGeometry(2.05, .2, 2.05).translate(0, .1, 0), cream), 3.0, 7.8, -2.0);
  add(new THREE.Mesh(new THREE.ConeGeometry(1.5, .9, 4).rotateY(Math.PI / 4).translate(0, .45, 0), mat('#E8645A')), 3.0, 8.0, -2.0);
  add(new THREE.Mesh(new THREE.SphereGeometry(.18, 10, 8), mat('#F2737B', { emissive: '#F2737B', emissiveIntensity: .5 })), 3.0, 9.0, -2.0);
  add(new THREE.Mesh(new THREE.CylinderGeometry(.12, .14, .5, 10).translate(0, .25, 0), mat('#E8645A')), 3.75, .2, 3.4);
  return { root: sh(root), parts, win, doors, sign: sign.m };
}
function makeFireTruck() {
  const root = new THREE.Group(), red = mat('#E8645A', { roughness: .45 }), cream = mat('#F7ECD6'), grey = mat('#B9B6C2');
  root.add(new THREE.Mesh(new THREE.BoxGeometry(2.0, .7, .9).translate(-.25, .55, 0), red));
  root.add(new THREE.Mesh(new THREE.BoxGeometry(.7, .85, .88).translate(1.05, .62, 0), red));
  root.add(new THREE.Mesh(new THREE.BoxGeometry(.06, .34, .78).translate(1.41, .78, 0), mat('#5A6680', { roughness: .3 })));
  root.add(new THREE.Mesh(new THREE.BoxGeometry(2.0, .1, .92).translate(-.25, .62, 0), cream));
  for (const z of [-.25, .25]) root.add(new THREE.Mesh(new THREE.BoxGeometry(2.1, .06, .06).translate(-.3, 1.05, z), grey));
  for (let k = 0; k < 9; k++) root.add(new THREE.Mesh(new THREE.BoxGeometry(.05, .05, .5).translate(-1.25 + k * .24, 1.05, 0), grey));
  const siren = new THREE.Mesh(new THREE.BoxGeometry(.2, .12, .5).translate(1.05, 1.11, 0), mat('#4D86E8', { emissive: '#4D86E8', emissiveIntensity: 0 })); root.add(siren);
  root.add(new THREE.Mesh(new THREE.BoxGeometry(2.6, .2, .82).translate(0, .12, 0), mat('#3D3A42')));
  return { root: sh(root), siren };
}
function makeGapura() {
  const g = new THREE.Group(), cream = mat('#F7ECD6'), peach = mat(PAL.peachDeep), sign = signTex((x, v, w, h) => {
    x.fillStyle = '#FFF4DA'; x.fillRect(0, 0, w, h); x.strokeStyle = '#E58F72'; x.lineWidth = 12; x.strokeRect(6, 6, w - 12, h - 12);
    x.fillStyle = '#4B3A36'; x.font = '78px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('KAMPUNG ANGKATAN 1', w / 2, h / 2 + 5); }, 1024, 150); sign.set(1);
  for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.55, 3.1, .55).translate(0, 1.55, 0), cream); p.position.z = s * 2.5; g.add(p);
    const b = new THREE.Mesh(new THREE.BoxGeometry(.7, .4, .7).translate(0, .2, 0), peach); b.position.z = s * 2.5; g.add(b);
    const c = new THREE.Mesh(new THREE.ConeGeometry(.5, .5, 4).rotateY(Math.PI / 4).translate(0, .25, 0), peach); c.position.set(0, 3.35, s * 2.5); g.add(c);
    const k = new THREE.Mesh(new THREE.BoxGeometry(.66, .14, .66), peach); k.position.set(0, 3.1, s * 2.5); g.add(k); }
  const beam = new THREE.Mesh(new THREE.BoxGeometry(.45, .35, 5.6), peach); beam.position.y = 3.0; g.add(beam);
  const tm = new THREE.MeshStandardMaterial({ map: sign.t, roughness: .7 }), side = mat('#FFF4DA');
  const plate = new THREE.Mesh(new THREE.BoxGeometry(.1, .62, 4.2), [tm, tm, side, side, side, side]); plate.position.y = 2.45; g.add(plate);
  return sh(g);
}
// the mysterious building: a long warehouse with a low maroon hip roof over a dark ventilation band, a row of red roller shutters
// under a small canopy, a blue-grey panel and an open bay at the end (after the reference photos; no lettering anywhere)
function makeMystery() {
  const root = new THREE.Group(), L = 14, D = 6.4, H = 2.35;
  const white = mat('#F5F3EF'), red = mat('#CC3F4A', { roughness: .55 }), maroon = '#90303F', grey = mat('#8E9AAE'), dark = mat('#3F3B45', { roughness: .9 }), conc = mat('#D4D0C8', { roughness: 1 });
  const glow = [];
  const wallM = mat('#F5F3EF', { emissive: '#B9A3E8', emissiveIntensity: 0 }); glow.push(wallM);
  root.add(new THREE.Mesh(new THREE.BoxGeometry(L + 1.2, .2, D + 2.4).translate(0, .1, .6), conc));
  root.add(new THREE.Mesh(new THREE.BoxGeometry(L, H, D).translate(0, H / 2 + .2, 0), wallM));
  // the front: five shutter bays with white pillars, the panel, the open bay
  const shut = signTex((x, v, w, h) => { x.fillStyle = '#CC3F4A'; x.fillRect(0, 0, w, h); for (let y = 0; y < h; y += 10) { x.fillStyle = 'rgba(80,10,20,.28)'; x.fillRect(0, y, w, 2); x.fillStyle = 'rgba(255,255,255,.12)'; x.fillRect(0, y + 3, w, 2); } }, 64, 128); shut.set(1);
  const shutM = new THREE.MeshStandardMaterial({ map: shut.t, roughness: .55, emissive: '#B9A3E8', emissiveIntensity: 0 }); glow.push(shutM);
  const fz = D / 2 + .03, bay = 1.62;
  for (let k = 0; k < 5; k++) { const x = -L / 2 + .35 + bay / 2 + k * bay; const s = new THREE.Mesh(new THREE.BoxGeometry(bay - .26, 1.72, .06).translate(0, .86, 0), shutM); s.position.set(x, .2, fz); root.add(s); }
  for (let k = 0; k <= 5; k++) { const p = new THREE.Mesh(new THREE.BoxGeometry(.22, 2.2, .22).translate(0, 1.1, 0), white); p.position.set(-L / 2 + .35 + k * bay, .2, fz + .05); root.add(p); }
  const can = new THREE.Mesh(new THREE.BoxGeometry(5 * bay + .5, .08, 1.15), mat('#A83440', { roughness: .6 })); can.position.set(-L / 2 + .35 + 2.5 * bay, 2.2, fz + .5); can.rotation.x = .14; root.add(can);
  const panel = new THREE.Mesh(new THREE.BoxGeometry(2.7, 2.15, .08).translate(0, 1.07, 0), grey); panel.position.set(-L / 2 + .35 + 5 * bay + 1.55, .2, fz); root.add(panel);
  const ox = L / 2 - 1.35;
  const hole = new THREE.Mesh(new THREE.BoxGeometry(2.3, 2.05, .05).translate(0, 1.02, 0), dark); hole.position.set(ox, .2, fz + .01); root.add(hole);
  for (const s of [-1, 1]) { const j = new THREE.Mesh(new THREE.BoxGeometry(.22, 2.3, .26).translate(0, 1.15, 0), white); j.position.set(ox + s * 1.25, .2, fz + .04); root.add(j); }
  // side walls: blue-grey panels between white pilasters
  for (const s of [-1, 1]) for (let k = 0; k < 3; k++) { const p = new THREE.Mesh(new THREE.BoxGeometry(.06, 1.9, 1.7).translate(0, .95, 0), grey); p.position.set(s * (L / 2 + .03), .3, -D / 2 + 1.1 + k * 2.1); root.add(p); }
  // the clerestory: a dark vent band with white posts, then the big low hip roof (corrugated)
  root.add(new THREE.Mesh(new THREE.BoxGeometry(L + .05, .4, D + .05).translate(0, .2, 0), dark).translateY(H + .2));
  for (let x = -L / 2; x <= L / 2 + .01; x += 2.33) for (const z of [-D / 2, D / 2]) { const p = new THREE.Mesh(new THREE.BoxGeometry(.14, .4, .14).translate(0, .2, 0), white); p.position.set(x, H + .2, z); root.add(p); }
  const rib = signTex((x, v, w, h) => { const g = x.createLinearGradient(0, 0, w, 0); g.addColorStop(0, '#7E2635'); g.addColorStop(.5, maroon); g.addColorStop(1, '#A23A4A'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 32, 8); rib.set(1);
  rib.t.wrapS = rib.t.wrapT = THREE.RepeatWrapping;
  const a = L / 2 + .6, b = D / 2 + .7, hr = 1.35, ry0 = H + .6, ridge = a - b * .9;
  const V = [[-a, 0, b], [a, 0, b], [ridge, hr, 0], [-ridge, hr, 0], [a, 0, -b], [-a, 0, -b]];
  const tri = (p, q, r, u) => ({ pos: [...V[p], ...V[q], ...V[r]], uv: [p, q, r].map(i => [u(V[i]) / .35, 0]).flat() });
  const faces = [tri(0, 1, 2, v => v[0]), tri(0, 2, 3, v => v[0]), tri(4, 5, 3, v => v[0]), tri(4, 3, 2, v => v[0]), tri(1, 4, 2, v => v[2]), tri(5, 0, 3, v => v[2])];
  const rg = new THREE.BufferGeometry(); rg.setAttribute('position', new THREE.Float32BufferAttribute(faces.flatMap(f => f.pos), 3)); rg.setAttribute('uv', new THREE.Float32BufferAttribute(faces.flatMap(f => f.uv), 2)); rg.computeVertexNormals();
  const roof = new THREE.Mesh(rg, new THREE.MeshStandardMaterial({ map: rib.t, roughness: .6, flatShading: true, side: THREE.DoubleSide })); roof.position.y = ry0; root.add(roof);
  const fas = new THREE.Mesh(new THREE.BoxGeometry(2 * a + .05, .16, 2 * b + .05).translate(0, -.04, 0), mat('#7A2533')); fas.position.y = ry0; root.add(fas);
  const kids = root.children.slice();
  const groups = [kids.slice(39, 41), kids.slice(24, 39), kids.slice(2, 18), [kids[1], ...kids.slice(18, 24)], [kids[0]]];   // roof, vent band, front, walls, plinth
  const pieces = groups.map(list => { const g = new THREE.Group(); root.add(g); list.forEach(m => g.add(m)); const bx = new THREE.Box3().setFromObject(g); g.userData.y = bx.max.y; g.userData.min = bx.min.y; return g; });
  const light = new THREE.PointLight('#C7B2FF', 0, 26, 1.6); light.position.set(0, 3.2, D / 2 + 3.5); root.add(light);
  return { root: sh(root), glow, light, pieces };
}

// ---------- Day 4 ----------
// a toy tower crane: lattice mast, slewing jib with a counterweight, the cab, a trolley and a hook on a line
function makeCrane(color, H) {
  const root = new THREE.Group(), col = mat(color), dark = mat('#5A5662'), grey = mat('#C9C3D3');
  const lat = signTex((x, v, w, h) => { x.fillStyle = '#C7B79A'; x.fillRect(0, 0, w, h); x.strokeStyle = '#ffffff'; x.lineWidth = 12; x.strokeRect(6, 6, w - 12, h - 12); x.beginPath(); x.moveTo(0, 0); x.lineTo(w, h); x.moveTo(w, 0); x.lineTo(0, h); x.stroke(); }, 64, 64); lat.set(1);   // painted, not cut out: it must read from far away
  lat.t.wrapS = lat.t.wrapT = THREE.RepeatWrapping; lat.t.repeat.set(1, H / .9);
  const latM = new THREE.MeshStandardMaterial({ color, map: lat.t, roughness: .7 });
  root.add(new THREE.Mesh(new THREE.BoxGeometry(2.2, .5, 2.2).translate(0, .25, 0), grey));
  const mast = new THREE.Mesh(new THREE.BoxGeometry(.9, H, .9).translate(0, H / 2 + .5, 0), latM); root.add(mast);
  const top = new THREE.Group(); top.position.y = H + .5; root.add(top);
  const jlat = lat.t.clone(); jlat.repeat.set(16 / .9, 1); jlat.needsUpdate = true;
  const jibM = new THREE.MeshStandardMaterial({ color, map: jlat, roughness: .7 });
  top.add(new THREE.Mesh(new THREE.BoxGeometry(16, .7, .7).translate(5.2, .35, 0), jibM));                // the jib, reaching out to +x
  top.add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 1.2).translate(-.4, -.2, 1.0), mat('#FFF6E6')));   // the cab
  top.add(new THREE.Mesh(new THREE.BoxGeometry(1.7, 1.1, 1.0).translate(-4.6, .1, 0), dark));               // counterweight
  top.add(new THREE.Mesh(new THREE.ConeGeometry(.5, 2.2, 4).translate(0, 1.6, 0), col));                    // the apex
  const trolley = new THREE.Group(); trolley.position.set(9, 0, 0); top.add(trolley);
  trolley.add(new THREE.Mesh(new THREE.BoxGeometry(.6, .25, .8), dark));
  const line = new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, 1, 4).translate(0, -.5, 0), dark); trolley.add(line);
  const hook = new THREE.Mesh(new THREE.BoxGeometry(.35, .35, .35), mat('#F2737B')); trolley.add(hook);
  const set = (reach, drop) => { trolley.position.x = reach; line.scale.y = Math.max(.01, drop); hook.position.y = -drop - .2; };
  set(9, 6);
  return { root: sh(root), top, trolley, set, H };
}
// a toy flatbed truck: the cab at +x
function makeTruck(color) {
  const root = new THREE.Group();
  root.add(new THREE.Mesh(new THREE.BoxGeometry(.9, .8, .9).translate(1.05, .6, 0), mat(color, { roughness: .45 })));
  root.add(new THREE.Mesh(new THREE.BoxGeometry(.08, .3, .76).translate(1.51, .78, 0), mat('#5A6680', { roughness: .3 })));
  root.add(new THREE.Mesh(new THREE.BoxGeometry(2.2, .18, 1.0).translate(-.55, .45, 0), mat('#E9E2D8')));
  root.add(new THREE.Mesh(new THREE.BoxGeometry(2.9, .22, .86).translate(0, .14, 0), mat('#3D3A42')));
  const bed = new THREE.Group(); bed.position.set(-.55, .55, 0); root.add(bed);
  return { root: sh(root), bed };
}
function makeParkTree(x, z, seed) { const g = new THREE.Group(), r = .55 + hash(seed) * .25;
  const tr = new THREE.Mesh(new THREE.CylinderGeometry(.09, .12, .75, 6).translate(0, .37, 0), mat('#B48A68')); g.add(tr);
  const c = new THREE.Mesh(new THREE.IcosahedronGeometry(r + .2, 0).translate(0, 1.2, 0), mat(hash(seed * 3) > .5 ? '#8FD3B8' : '#9CC48A')); g.add(c);
  g.position.set(x, .1, z); return sh(g); }
// the Monumen Netizen City (a fixed element from Day 4 on: never change it): a three-tier round cream stone pedestal, a slender
// cream obelisk, a giant butter-yellow speech bubble with a blush pink heart on top, a ring of pastel capsule statues, a NETIZEN CITY plaque
export function makeMonument() {
  const root = new THREE.Group(), parts = [], stone = mat('#EFE3CC', { roughness: .85 }), stone2 = mat('#E6D8BE', { roughness: .85 });
  const add = (m, y = 0) => { const p = new THREE.Group(); p.add(m); p.position.y = y; root.add(p); parts.push(p); return p; };
  add(new THREE.Mesh(new THREE.CylinderGeometry(6.0, 6.25, .7, 48).translate(0, .35, 0), stone));
  add(new THREE.Mesh(new THREE.CylinderGeometry(4.8, 4.95, .7, 48).translate(0, .35, 0), stone2), .7);
  add(new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.7, .7, 48).translate(0, .35, 0), stone), 1.4);
  // the obelisk: lit from below at night (a warm gradient in its emissive map)
  const grad = signTex((x, v, w, h) => { const g = x.createLinearGradient(0, h, 0, 0); g.addColorStop(0, '#FFE2B0'); g.addColorStop(.45, '#7A5E40'); g.addColorStop(1, '#000000'); x.fillStyle = g; x.fillRect(0, 0, w, h); }, 8, 128); grad.set(1);
  const obM = new THREE.MeshStandardMaterial({ color: '#F5ECDA', roughness: .7, flatShading: true, emissive: '#FFFFFF', emissiveMap: grad.t, emissiveIntensity: 0 });
  const ob = add(new THREE.Mesh(new THREE.CylinderGeometry(.95, 1.55, 21, 4, 1).rotateY(Math.PI / 4).translate(0, 10.5, 0), obM), 2.1);
  add(new THREE.Mesh(new THREE.ConeGeometry(1.0, 1.5, 4).rotateY(Math.PI / 4).translate(0, .75, 0), obM), 23.1);
  // the speech bubble icon, facing the city (south), a heart on both faces
  const bs = new THREE.Shape(); { const w = 6.4, h = 4.4, r = 1.4, x0 = -w / 2, y0 = 0;
    bs.moveTo(x0 + r, y0); bs.lineTo(-.75, y0); bs.lineTo(0, y0 - 1.3); bs.lineTo(.75, y0); bs.lineTo(x0 + w - r, y0); bs.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
    bs.lineTo(x0 + w, y0 + h - r); bs.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h); bs.lineTo(x0 + r, y0 + h); bs.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
    bs.lineTo(x0, y0 + r); bs.quadraticCurveTo(x0, y0, x0 + r, y0); }
  const bubM = mat('#F7D772', { roughness: .5, emissive: '#F7D772', emissiveIntensity: 0 });
  const bub = new THREE.Mesh(new THREE.ExtrudeGeometry(bs, { depth: 1.0, bevelEnabled: true, bevelThickness: .22, bevelSize: .22, bevelSegments: 3, curveSegments: 10 }).translate(0, 0, -.5), bubM);
  const hs = new THREE.Shape(); hs.moveTo(0, -.9); hs.bezierCurveTo(-1.9, .3, -1.0, 1.7, 0, .75); hs.bezierCurveTo(1.0, 1.7, 1.9, .3, 0, -.9);
  const heartM = mat('#F2A0B4', { roughness: .5, emissive: '#F2A0B4', emissiveIntensity: 0 });
  const bubble = new THREE.Group(); bubble.add(bub);
  for (const s of [1, -1]) { const h = new THREE.Mesh(new THREE.ExtrudeGeometry(hs, { depth: .25, bevelEnabled: true, bevelThickness: .08, bevelSize: .08, bevelSegments: 2 }), heartM); h.position.set(0, 2.25, s * .78); if (s < 0) h.rotation.y = Math.PI; bubble.add(h); }
  const bp = add(bubble, 25.9);
  // statues ring removed for optimization
  const plaque = signTex((x, v, w, h) => { x.fillStyle = '#F7EEDC'; x.fillRect(0, 0, w, h); x.strokeStyle = '#C9B48E'; x.lineWidth = 12; x.strokeRect(6, 6, w - 12, h - 12);
    x.fillStyle = '#6B5640'; x.font = '84px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('NETIZEN CITY', w / 2, h / 2 + 5); }, 768, 160); plaque.set(1);
  const pm = new THREE.MeshStandardMaterial({ map: plaque.t, roughness: .7 }), side = mat('#E6D8BE');
  add(new THREE.Mesh(new THREE.BoxGeometry(2.8, .58, .14).translate(0, .35, 0), [side, side, side, side, pm, side]).translateZ(4.86), .7);
  const glow = new THREE.PointLight('#FFD9A0', 0, 34, 1.4); glow.position.set(0, 4, 7); root.add(glow);
  return { root: sh(root), parts, ob, bubble: bp, obM, bubM, heartM, glow };
}
// the round Monument garden: lawn, a ring-shaped fountain pool around the pedestal, a curved path ring and spokes, pastel flower beds, benches, lamps
export function makeMonumentPark() {
  const root = new THREE.Group(), parts = [], lampM = mat('#FFF4D8', { emissive: '#FFD58A', emissiveIntensity: 0 });
  const add = m => { root.add(m); parts.push(m); return m; };
  const lawn = add(new THREE.Mesh(new THREE.CylinderGeometry(15.5, 15.5, .08, 64).translate(0, .04, 0), mat('#A3D08F', { roughness: 1 }))); lawn.receiveShadow = true;
  const ring = (r0, r1, y, c, o = {}) => { const m = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 64, 1, o.a0 || 0, o.al || Math.PI * 2).rotateX(-Math.PI / 2).translate(0, y, 0), mat(c, { roughness: o.rough ?? .95, side: THREE.DoubleSide, metalness: o.metal || 0 })); m.receiveShadow = true; return add(m); };
  ring(6.5, 8.1, .1, '#E3D7C2'); ring(6.7, 7.9, .12, '#9FD3EC', { rough: .1, metal: .2 });                    // the fountain pool around the pedestal
  const jets = add(new THREE.Group()); for (let i = 0; i < 16; i++) { const a = i / 16 * Math.PI * 2, j = new THREE.Mesh(new THREE.ConeGeometry(.07, .9, 6).translate(0, .45, 0), mat('#E8F6FC', { emissive: '#CFEFFF', emissiveIntensity: .2 })); j.position.set(Math.cos(a) * 7.3, .1, Math.sin(a) * 7.3); jets.add(j); }
  ring(10.2, 11.6, .1, '#E9DFCD');                                                                           // the path ring
  for (let i = 0; i < 4; i++) { const a = i / 4 * Math.PI * 2 + Math.PI / 4, s = new THREE.Mesh(new THREE.BoxGeometry(1.5, .1, 7.6), mat('#E9DFCD', { roughness: .95 })); s.position.set(Math.cos(a) * 12, .1, Math.sin(a) * 12); s.rotation.y = -a + Math.PI / 2; s.receiveShadow = true; add(s); }
  const front = new THREE.Mesh(new THREE.BoxGeometry(5, .1, 5.5), mat('#E9DFCD', { roughness: .95 })); front.position.set(0, .1, 13.3); front.receiveShadow = true; add(front);   // the walk from the promenade
  const fc = ['#F6A7C1', '#F7DD8C', '#C9B8E8', '#FFFFFF', '#F2A88A', '#A9C8EC'], R = mulberry(44);
  const beds = add(new THREE.Group());
  for (let q = 0; q < 4; q++) { const a0 = q / 4 * Math.PI * 2 + Math.PI / 4 + .22, a1 = a0 + Math.PI / 2 - .44;
    for (const [r0, r1] of [[8.6, 9.8], [12.0, 14.8]]) { const bed = new THREE.Mesh(new THREE.RingGeometry(r0, r1, 24, 1, a0, a1 - a0).rotateX(-Math.PI / 2).translate(0, .1, 0), mat('#C9A98A', { roughness: 1, side: THREE.DoubleSide })); beds.add(bed);
      for (let k = 0; k < 3; k++) { const a = a0 + R() * (a1 - a0), r = r0 + .2 + R() * (r1 - r0 - .4), f = new THREE.Mesh(new THREE.IcosahedronGeometry(.12 + R() * .07, 0), mat(fc[(q * 2 + k) % 6])); f.position.set(Math.cos(a) * r, .2, -Math.sin(a) * r); beds.add(f); } } }
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2 + Math.PI / 8, b = new THREE.Group();
    const st = new THREE.Mesh(new THREE.BoxGeometry(1.1, .07, .34).translate(0, .38, 0), mat(PAL.woodDark)); b.add(st); const bk = new THREE.Mesh(new THREE.BoxGeometry(1.1, .3, .06).translate(0, .58, -.15), mat(PAL.woodDark)); b.add(bk);
    b.position.set(Math.cos(a) * 11.95, .1, Math.sin(a) * 11.95); b.rotation.y = -a - Math.PI / 2; add(b);
    const l = new THREE.Group(); l.add(new THREE.Mesh(new THREE.CylinderGeometry(.05, .06, 1.6, 6).translate(0, .8, 0), mat('#EEE6F6'))); l.add(new THREE.Mesh(new THREE.SphereGeometry(.17, 10, 8).translate(0, 1.7, 0), lampM));
    const a2 = a + Math.PI / 8; l.position.set(Math.cos(a2) * 11.0, .1, Math.sin(a2) * 11.0); add(l); }
  for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2 + .1; if (Math.abs(Math.sin(a) - 1) < .08) continue; add(makeParkTree(Math.cos(a) * 15.0, Math.sin(a) * 15.0, i * 3.7)); }
  return { root: sh(root), parts, jets, lampM, lawn };
}

