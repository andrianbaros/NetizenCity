// The diorama: ground, road, far hills and trees, and every prop and actor of Day 1.
// Units are toy metres: the Mayor capsule is ~1.05 tall. The town centre is the origin; the camera side is +z.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry, vnoise, clamp, lerp } from './core/lib.js';
import { MT, riverDist, shoreS, airK } from './land.js';

export const PAL = {
  sage: '#A9C79A', sageDark: '#8FB383', dirt: '#E2C49A', dirtEdge: '#CDAA7E',
  cream: '#F7ECD6', peach: '#F2A88A', peachDeep: '#E58F72', lavender: '#C4B3E3', butter: '#F7D772',
  wood: '#E8C79E', woodDark: '#C99E72', mint: '#A8DCC8', sky: '#BFE2F4', glass: '#3B4356',
  mayor: '#5E86C1', hat: '#8C9099', hatBand: '#43464E', gold: '#E6B64C', ink: '#3A3340'
};
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .78, metalness: 0, flatShading: true, ...o });
const shadowed = m => { m.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } }); return m; };
// Day 2: the dirt road now arrives from the south, straight into the city gate (the ledger's layout: gate south, main road north to the office)
export const ROAD = new THREE.CatmullRomCurve3([[-170, 240], [-100, 160], [-46, 96], [-14, 56], [-2, 40], [0, 33], [0, 28.8]]
  .map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'catmullrom', .5);

// ---------- ground: flat in the middle, gently faceted further out ----------
function ground() {
  const g = new THREE.PlaneGeometry(900, 900, 150, 150); g.rotateX(-Math.PI / 2);
  const p = g.attributes.position, R = mulberry(4), col = [], c1 = new THREE.Color(PAL.sage), c2 = new THREE.Color(PAL.sageDark), c3 = new THREE.Color('#BCD3A2');
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), d = Math.hypot(x, z);
    const j = (R() - .5) * .25 * clamp((d - 178) / 20);
    p.setY(i, groundY(x, z) + j * natureK(x, z));
  }
  g.computeVertexNormals();
  const ng = g.toNonIndexed(), q = ng.attributes.position;
  for (let i = 0; i < q.count; i += 3) {
    const x = q.getX(i), z = q.getZ(i), n = vnoise(x * .05 + z * .031) * .6 + R() * .4;
    const c = c1.clone().lerp(n < .5 ? c2 : c3, Math.abs(n - .5) * 1.3);
    for (let k = 0; k < 3; k++) col.push(c.r, c.g, c.b);
  }
  ng.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); ng.computeVertexNormals();
  const m = new THREE.Mesh(ng, mat('#ffffff', { vertexColors: true, roughness: .95 })); m.receiveShadow = true; return m;
}
// Day 5: the land is flat around the mountain's foot and along the river, and goes down under the sea
function natureK(x, z) { const dm = Math.hypot(x - MT.x, z - MT.z), [dr] = riverDist(x, z); return Math.min(clamp((dm - MT.R0 - 12) / 30),clamp((dr - 10) / 14), clamp((-shoreS(x, z) - 24) / 8), airK(x, z)); }
export function groundY(x, z) {
  const d = Math.hypot(x, z), k = clamp((d - 180) / 120), s = shoreS(x, z);
  let y = k * k * (vnoise(x * .03 + 7) * vnoise(z * .03 + 3) * 14 - 2) * natureK(x, z);
  if (s > -24) y = lerp(y, s < -8 ? 0 : Math.max(-4, -(s + 8) * .1), clamp((s + 24) / 8));
  return y;
}
export const inNature = (x, z, m = 0) => shoreS(x, z) > -22 - m || riverDist(x, z)[0] < 9 + m || Math.hypot(x - MT.x, z - MT.z) < MT.R0 + 8 + m;

function road() {
  const N = 600, pos = [], idx = [], col = [], W = 1.55, ce = new THREE.Color(PAL.dirt), cs = new THREE.Color(PAL.dirtEdge);
  for (let i = 0; i <= N; i++) {
    const u = i / N, a = ROAD.getPointAt(u), t = ROAD.getTangentAt(u), n = new THREE.Vector3(-t.z, 0, t.x);
    for (const [s, c] of [[-1.25, cs], [-1, ce], [1, ce], [1.25, cs]]) {
      const x = a.x + n.x * W * s, z = a.z + n.z * W * s; pos.push(x, groundY(x, z) + .035 + (Math.abs(s) > 1.1 ? -.02 : 0), z); col.push(c.r, c.g, c.b);
    }
    if (i < N) for (let k = 0; k < 3; k++) { const b = i * 4 + k; idx.push(b, b + 4, b + 1, b + 1, b + 4, b + 5); }
  }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setIndex(idx); g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat('#fff', { vertexColors: true, roughness: 1 })); m.receiveShadow = true; return m;
}

function tree(R, s) {
  const g = new THREE.Group(), tone = ['#7FB37A', '#93C48A', '#6FA77A', '#A7CF8E'][Math.floor(R() * 4)];
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(.12 * s, .16 * s, .9 * s, 5), mat('#B48A68')); trunk.position.y = .45 * s; g.add(trunk);
  if (R() < .5) { const c = new THREE.Mesh(new THREE.ConeGeometry(.9 * s, 2.2 * s, 6), mat(tone)); c.position.y = 1.9 * s; g.add(c); }
  else { const c = new THREE.Mesh(new THREE.IcosahedronGeometry(.95 * s, 0), mat(tone)); c.position.y = 1.6 * s; g.add(c); }
  return shadowed(g);
}
function scenery(scene) {
  const R = mulberry(11);
  for (let i = 0; i < 46; i++) {                                    // trees only far away: the land must read empty
    const a = R() * Math.PI * 2, d = 200 + R() * 110, x = Math.cos(a) * d, z = Math.sin(a) * d;
    if (ROAD.getPoints(80).some(p => Math.hypot(p.x - x, p.z - z) < 8) || inNature(x, z, 6) || shoreS(x, z) > -60 || airK(x, z) < 1) continue;   // the coast and the airfield stay open
    const n = 1 + Math.floor(R() * 4);
    for (let k = 0; k < n; k++) { const t = tree(R, 1.4 + R() * 1.6), xx = x + (R() - .5) * 9, zz = z + (R() - .5) * 9; if (inNature(xx, zz)) continue; t.position.set(xx, groundY(xx, zz), zz); t.rotation.y = R() * 6; scene.add(t); }
  }
  const hillC = ['#B9D3A8', '#A6C7A4', '#C9C3E3', '#B5CFC8'];
  for (let i = 0; i < 26; i++) {                                    // a ring of soft low-poly hills on the horizon
    const a = i / 26 * Math.PI * 2 + R() * .2, d = 330 + R() * 60;
    const h = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), mat(hillC[i % 4], { roughness: 1 }));
    h.scale.set(60 + R() * 50, 26 + R() * 30, 50 + R() * 30); h.position.set(Math.cos(a) * d, -6, Math.sin(a) * d);
    if (shoreS(h.position.x, h.position.z) > -70 || Math.hypot(h.position.x - MT.x, h.position.z - MT.z) < MT.R0 + 68 || Math.hypot(h.position.x - 212, h.position.z + 55) < 150) continue; scene.add(h);
  }
  const rocks = new THREE.Group();
  for (let i = 0; i < 6; i++) { const a = R() * 6.28, d = 185 + R() * 40, r = new THREE.Mesh(new THREE.DodecahedronGeometry(.25 + R() * .4, 0), mat(['#D9D2C3', '#CFC6B8'][i % 2])); const x = Math.cos(a) * d, z = Math.sin(a) * d; r.position.set(x, groundY(x, z) + .1, z); r.rotation.set(R(), R(), R()); if (!inNature(x, z)) rocks.add(r); }
  scene.add(shadowed(rocks));
  // a few grass tufts close by, so the ground has scale
  const tuft = [];
  for (let i = 0; i < 140; i++) {
    const a = R() * 6.28, d = 160 + R() * 40, x = Math.cos(a) * d, z = Math.sin(a) * d;     // Day 3: the city covers the near ground; tufts only at its edge
    for (let k = 0; k < 3; k++) { const c = new THREE.ConeGeometry(.05, .28 + R() * .2, 3); c.rotateZ((R() - .5) * .6); c.translate(x + (R() - .5) * .25, .14 + groundY(x, z), z + (R() - .5) * .25); if (!inNature(x, z) && airK(x, z) >= 1) tuft.push(c); }
  }
  const tm = new THREE.Mesh(mergeGeometries(tuft), mat('#8DBA7E')); tm.castShadow = false; scene.add(tm);
}

function skyDome() {
  const g = new THREE.SphereGeometry(800, 32, 16);
  const m = new THREE.ShaderMaterial({ side: THREE.BackSide, depthWrite: false, fog: false, uniforms: { top: { value: new THREE.Color('#7FC0EE') }, hor: { value: new THREE.Color('#FBE9D6') }, warm: { value: 0 } },
    vertexShader: `varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.); }`,
    fragmentShader: `varying vec3 vP; uniform vec3 top, hor; uniform float warm; void main(){ float h = clamp(normalize(vP).y, 0., 1.); vec3 c = mix(hor, top, pow(h, .42)); c = mix(c, c * vec3(1.08, .96, .86), warm); gl_FragColor = vec4(c, 1.); }` });
  return new THREE.Mesh(g, m);
}
function clouds(scene) {
  const R = mulberry(5), grp = new THREE.Group(), m = mat('#FFFFFF', { roughness: 1, emissive: '#ffffff', emissiveIntensity: .35 });
  for (let i = 0; i < 9; i++) {
    const c = new THREE.Group();
    for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.IcosahedronGeometry(4 + R() * 4, 0), m); b.position.set(k * 5 - 8, R() * 2, R() * 3); b.scale.y = .6; c.add(b); }
    const a = R() * 6.28, d = 140 + R() * 120; c.position.set(Math.cos(a) * d, 55 + R() * 35, Math.sin(a) * d); grp.add(c);
  }
  scene.add(grp); return grp;
}

// ---------- canvas textures (signs) ----------
export function signTex(draw, w = 512, h = 160) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  const api = { cv, t, x: cv.getContext('2d'), last: null, set(v) { if (v === api.last) return; api.last = v; draw(api.x, v, w, h); t.needsUpdate = true; } };
  return api;
}

// ---------- actors ----------
export function makeMayor() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);   // root: position + facing; body: lean/squash about the feet
  const bm = mat(PAL.mayor, { roughness: .45, flatShading: false });
  const cap = new THREE.Mesh(new THREE.CapsuleGeometry(.27, .5, 8, 20), bm); cap.position.y = .52; body.add(cap);
  const sash = new THREE.Mesh(new THREE.TorusGeometry(.275, .035, 6, 28), mat('#F5E3B8', { flatShading: false })); sash.position.y = .5; sash.rotation.set(Math.PI / 2 + .55, 0, 0); body.add(sash);
  const badge = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .02, 12), mat(PAL.gold, { metalness: .7, roughness: .3, flatShading: false })); badge.rotation.x = Math.PI / 2; badge.position.set(.1, .56, .262); body.add(badge);
  const head = new THREE.Group(); head.position.y = .82; body.add(head);
  const eyeM = mat('#2C2A33', { flatShading: false, roughness: .3 });
  const goldM = mat(PAL.gold, { metalness: .85, roughness: .22, flatShading: false, emissive: '#000000' });
  for (const s of [-1, 1]) {
    const e = new THREE.Mesh(new THREE.SphereGeometry(.035, 12, 8), eyeM); e.position.set(s * .095, .02, .255); e.scale.z = .5; head.add(e);
    const r = new THREE.Mesh(new THREE.TorusGeometry(.075, .014, 8, 24), goldM); r.position.set(s * .095, .02, .282); head.add(r);
  }
  const bridge = new THREE.Mesh(new THREE.CylinderGeometry(.008, .008, .05, 6), goldM); bridge.rotation.z = Math.PI / 2; bridge.position.set(0, .03, .285); head.add(bridge);
  const cheeks = mat('#F3A6A0', { flatShading: false, transparent: true, opacity: .55 });
  for (const s of [-1, 1]) { const c = new THREE.Mesh(new THREE.SphereGeometry(.04, 10, 8), cheeks); c.position.set(s * .17, -.07, .225); c.scale.set(1, .6, .35); head.add(c); }
  const hat = new THREE.Group(); hat.position.y = .31; head.add(hat);
  const hm = mat(PAL.hat, { roughness: .6, flatShading: false });
  const brim = new THREE.Mesh(new THREE.CylinderGeometry(.33, .33, .03, 28), hm); hat.add(brim);
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(.2, .21, .34, 28), hm); crown.position.y = .18; hat.add(crown);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(.213, .213, .06, 28), mat(PAL.hatBand, { flatShading: false })); band.position.y = .06; hat.add(band);
  shadowed(root);
  return { root, body, head, hat, goldM, glasses: head };
}

export function makeTaxi() {
  const root = new THREE.Group(), y = mat(PAL.butter, { roughness: .4 }), dark = mat(PAL.glass, { roughness: .15, metalness: .3 });
  const lower = new THREE.Mesh(new THREE.BoxGeometry(2.3, .55, 1.15), y); lower.position.y = .5; root.add(lower);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.3, .5, 1.05), dark); cabin.position.set(-.12, 1.0, 0); root.add(cabin);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(1.22, .06, 1.02), y); roof.position.set(-.12, 1.27, 0); root.add(roof);
  const sign = new THREE.Mesh(new THREE.BoxGeometry(.42, .16, .2), mat('#FFF7E6')); sign.position.set(-.12, 1.38, 0); root.add(sign);
  const check = new THREE.Mesh(new THREE.BoxGeometry(2.32, .08, 1.17), mat('#4A4550')); check.position.y = .58; root.add(check);
  const wheels = [];
  for (const [x, z] of [[.72, .56], [-.72, .56], [.72, -.56], [-.72, -.56]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(.22, .22, .16, 12), mat('#3D3A42')); w.rotation.x = Math.PI / 2; w.position.set(x, .23, z); root.add(w); wheels.push(w);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .17, 8), mat('#E9E4DA')); hub.rotation.x = Math.PI / 2; hub.position.copy(w.position); root.add(hub);
  }
  for (const s of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(.04, .1, .22), mat('#FFF8DA', { emissive: '#FFF2B0', emissiveIntensity: .6 })); l.position.set(1.16, .6, s * .36); root.add(l);
    const b = new THREE.Mesh(new THREE.BoxGeometry(.04, .1, .2), mat('#E2595A', { emissive: '#ff3b3b', emissiveIntensity: .0 })); b.position.set(-1.16, .6, s * .38); root.add(b); if (s > 0) root.userData.brake = b.material; }
  const doorPivot = new THREE.Group(); doorPivot.position.set(.42, .75, -.6); root.add(doorPivot);   // the door on the far side, facing the gate
  const door = new THREE.Mesh(new THREE.BoxGeometry(.66, .78, .05), y); door.position.set(-.33, 0, 0); doorPivot.add(door);
  const dwin = new THREE.Mesh(new THREE.BoxGeometry(.5, .3, .06), dark); dwin.position.set(-.33, .22, 0); doorPivot.add(dwin);
  shadowed(root);
  return { root, wheels, doorPivot };
}

export function makeSuitcase(color) {
  const g = new THREE.Group(), m = mat(color, { roughness: .5 });
  const b = new THREE.Mesh(new THREE.BoxGeometry(.46, .5, .24), m); b.position.y = .29; g.add(b);
  const rib = mat(new THREE.Color(color).multiplyScalar(.85));
  for (const x of [-.12, .12]) { const r = new THREE.Mesh(new THREE.BoxGeometry(.04, .51, .25), rib); r.position.set(x, .29, 0); g.add(r); }
  const h = new THREE.Mesh(new THREE.TorusGeometry(.08, .018, 6, 12, Math.PI), mat('#5A5560')); h.position.y = .55; g.add(h);
  for (const x of [-.17, .17]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .03, 8), mat('#3D3A42')); w.rotation.z = Math.PI / 2; w.position.set(x, .035, -.08); g.add(w); }
  return shadowed(g);
}

export function makeGate(board) {
  const g = new THREE.Group(), w = mat(PAL.wood), wd = mat(PAL.woodDark), parts = [];
  const post = x => { const p = new THREE.Group(); const m = new THREE.Mesh(new THREE.BoxGeometry(.22, 2.6, .22), w); m.position.y = 1.3; p.add(m);
    const cap = new THREE.Mesh(new THREE.ConeGeometry(.2, .26, 4), mat(PAL.mint)); cap.position.y = 2.73; cap.rotation.y = Math.PI / 4; p.add(cap); p.position.x = x; return p; };
  const L = post(-1.55), Rr = post(1.55); g.add(L, Rr); parts.push(L, Rr);
  const beam = new THREE.Group(); const bm = new THREE.Mesh(new THREE.BoxGeometry(3.6, .2, .26), wd); beam.add(bm); beam.position.y = 2.35; g.add(beam); parts.push(beam);
  const hang = new THREE.Group(); hang.position.y = 2.25; g.add(hang); parts.push(hang);
  for (const x of [-.8, .8]) { const r = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .3, 4), mat('#8A7A6A')); r.position.set(x, -.15, 0); hang.add(r); }
  const plate = new THREE.Mesh(new THREE.BoxGeometry(2.3, .72, .08), [wd, wd, wd, wd, new THREE.MeshStandardMaterial({ map: board.t, roughness: .8 }), wd]);
  plate.position.y = -.66; hang.add(plate);
  shadowed(g);
  return { root: g, parts, hang };
}

export function makeOffice(clock) {
  const g = new THREE.Group(), cream = mat(PAL.cream), peach = mat(PAL.peach), deep = mat(PAL.peachDeep), pieces = [];
  const add = (mesh, x, y, z) => { mesh.position.set(x, y, z); const p = new THREE.Group(); p.add(mesh); p.userData.home = new THREE.Vector3(); g.add(p); pieces.push(p); return p; };
  const W = 3.0, D = 2.4, H = 1.9;
  add(new THREE.Mesh(new THREE.BoxGeometry(W + .3, .16, D + .3), mat('#E5D6BC')), 0, .08, 0);                   // plinth
  add(new THREE.Mesh(new THREE.BoxGeometry(W, H * .5, D), cream), 0, .16 + H * .25, 0);                     // walls, lower half
  add(new THREE.Mesh(new THREE.BoxGeometry(W, H * .5, D), cream), 0, .16 + H * .75, 0);                     // walls, upper half
  const door = new THREE.Mesh(new THREE.BoxGeometry(.62, 1.12, .06), mat('#B9876A')); add(door, 0, .16 + .56, D / 2 + .02);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(.035, 8, 6), mat(PAL.gold, { metalness: .7, roughness: .3 })); door.add(knob); knob.position.set(.2, 0, .04);
  for (const x of [-.95, .95]) { const win = new THREE.Mesh(new THREE.BoxGeometry(.52, .52, .05), mat('#9FD0E8', { roughness: .15, metalness: .2 }));
    const fr = new THREE.Mesh(new THREE.BoxGeometry(.62, .62, .03), mat('#FFFFFF')); fr.position.z = -.015; win.add(fr); add(win, x, 1.15, D / 2 + .02); }
  const roofShape = new THREE.Shape([new THREE.Vector2(-W / 2 - .25, 0), new THREE.Vector2(W / 2 + .25, 0), new THREE.Vector2(0, 1.0)]);
  const roof = new THREE.Mesh(new THREE.ExtrudeGeometry(roofShape, { depth: D + .35, bevelEnabled: false }), peach); roof.geometry.translate(0, 0, -(D + .35) / 2);
  add(roof, 0, .16 + H, 0);
  // the clock tower rises clear of the ridge (the roof runs front to back, so a short tower hid the clock in the gable)
  const tower = new THREE.Mesh(new THREE.BoxGeometry(.84, 1.42, .84), cream); add(tower, 0, .16 + H + 1.21, 0);
  const band = new THREE.Mesh(new THREE.BoxGeometry(.94, .08, .94), deep); add(band, 0, .16 + H + 1.9, 0);
  const cap = new THREE.Mesh(new THREE.ConeGeometry(.7, .64, 4), deep); cap.rotation.y = Math.PI / 4; add(cap, 0, .16 + H + 2.26, 0);
  const face = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .04, 24), new THREE.MeshStandardMaterial({ map: clock.t, roughness: .6 }));
  face.rotation.x = Math.PI / 2; face.rotation.y = 0; add(face, 0, .16 + H + 1.5, .43);
  face.rotation.z = 0;
  const flagPole = new THREE.Mesh(new THREE.CylinderGeometry(.02, .02, .7, 5), mat('#9A938A')); add(flagPole, 0, .16 + H + 2.88, 0);
  const flag = new THREE.Mesh(new THREE.BoxGeometry(.36, .22, .02), mat(PAL.mint)); add(flag, .19, .16 + H + 3.1, 0);
  shadowed(g);
  return { root: g, pieces };
}

export function makeCrate() { const g = new THREE.Group(), m = mat(PAL.woodDark); const b = new THREE.Mesh(new THREE.BoxGeometry(.62, .42, .5), m); b.position.y = .21; g.add(b);
  for (const x of [-.31, .31]) { const s = new THREE.Mesh(new THREE.BoxGeometry(.04, .44, .52), mat(PAL.wood)); s.position.set(x, .21, 0); g.add(s); } return shadowed(g); }
export function makeMic() { const g = new THREE.Group(); const s = new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .9, 6), mat('#6A6670', { metalness: .5 })); s.position.y = .45; g.add(s);
  const base = new THREE.Mesh(new THREE.CylinderGeometry(.14, .16, .03, 12), mat('#6A6670')); g.add(base);
  const h = new THREE.Mesh(new THREE.SphereGeometry(.055, 12, 8), mat('#3E3B44', { roughness: .4 })); h.position.y = .93; g.add(h); return shadowed(g); }
export function makeTumbleweed() {                                     // a ball of thin twig rings (solid geometry: wireframes break the depth-of-field pass)
  const g = new THREE.Group(), R = mulberry(21), ms = [mat('#C2A16E'), mat('#B08A58'), mat('#D2B583')];
  for (let i = 0; i < 14; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(.26 + R() * .12, .016, 4, 18), ms[i % 3]); r.rotation.set(R() * 6.28, R() * 6.28, R() * 6.28); g.add(r); }
  return shadowed(g); }
export function makeBlocks() {                                           // the pastel building blocks the Mayor carries in the time-lapse
  const g = new THREE.Group(), cols = [PAL.cream, PAL.peach, PAL.cream, PAL.mint, PAL.lavender, PAL.cream, PAL.peach], R = mulberry(9), list = [];
  for (let i = 0; i < 9; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.5 + R() * .3, .3, .4), mat(cols[i % cols.length])); b.position.set((i % 3) * .55 - .55, .15 + Math.floor(i / 3) * .3, (R() - .5) * .1); b.rotation.y = (R() - .5) * .3; g.add(b); list.push(b); }
  return { root: shadowed(g), list };
}
export function makePuffs(n = 7) {
  const g = new THREE.Group(), list = [];
  for (let i = 0; i < n; i++) { const m = new THREE.Mesh(new THREE.IcosahedronGeometry(.25, 0), new THREE.MeshStandardMaterial({ color: '#F1E2C8', roughness: 1, flatShading: true, transparent: true, opacity: 0 })); g.add(m); list.push(m); }
  return { root: g, list };
}

export function buildWorld(scene, cityGroup = scene) {
  scene.add(skyDome());
  cityGroup.add(ground()); cityGroup.add(road()); scenery(cityGroup);
  const cl = clouds(scene);
  return { clouds: cl };
}

