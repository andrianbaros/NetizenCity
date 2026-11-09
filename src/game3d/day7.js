// Day 7: the three requests the Mayor approved and built at full size, and the props of the press conference and the empty cash box.
// @ji_hann09's library (Distrik Fasilitas, on the sidewalk), @andramuhammad_09's airport (outside the east of the city) and harbour
// (the coast south of Netizen Beach, apart from it, with the Mayor's lighthouse), @rznn8619's sports complex (south-east: stadium with
// a running track, the GOR, an open basketball court). The podium with its toy microphones, the reporters and their flashes; the
// office interior (desk, request scroll, stamp, the butter-yellow cash box, the calculator and its endless receipt, the desk lamp and
// the instant noodles); the Prasasti Investor Kota at the entrance of the Monument garden (the Monument itself never changes).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry, clamp, lerp, seg, back, eo, eio, hash } from './core/lib.js';
import { PAL, signTex, groundY } from './world.js';
import { cityMat } from './metro.js';
import { shoreAt, ALONG, INLAND, sandY } from './land.js';

const TAU = Math.PI * 2;
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .78, metalness: 0, flatShading: true, ...o });
const sh = m => { m.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } }); return m; };
const pop = (k, t0, d = .22) => k < t0 ? 0 : back(seg(k, t0, t0 + d), 2.2);
const M4 = new THREE.Matrix4(), QQ = new THREE.Quaternion(), EE = new THREE.Euler(), PV = new THREE.Vector3(), SV = new THREE.Vector3();
const setM = (m, i, x, y, z, ry, s, rx = 0, rz = 0) => { QQ.setFromEuler(EE.set(rx, ry, rz, 'YXZ')); m.setMatrixAt(i, M4.compose(PV.set(x, y, z), QQ, typeof s === 'number' ? SV.set(s, s, s) : SV.set(...s))); };
function canvasTex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; return t; }
// a part list that builds up on a 0..1 clock (each part grows up from its base in its turn)
function parts() { const root = new THREE.Group(), list = [];
  const add = (m, x = 0, y = 0, z = 0, order = 0) => { m.position.set(x, y, z); const p = new THREE.Group(); p.add(m); p.userData.order = order; root.add(p); list.push(p); return m; };
  const build = (k, n = 8) => { root.visible = k > 0; list.forEach(p => { const u = pop(k, p.userData.order / n * .85, .2); p.visible = u > 0; p.scale.set(1, Math.max(.001, u), 1); }); };
  return { root, list, add, build }; }
// a rooftop sign in the family of RS / POLISI / DAMKAR / NETIZEN MALL, lit at night
function billboard(text, w, h, fg = '#7A5BB0', border = '#C9B8E8') {
  const s = signTex((x, v, cw, ch) => { x.fillStyle = '#FFF9F1'; x.fillRect(0, 0, cw, ch); x.strokeStyle = border; x.lineWidth = 16; x.strokeRect(8, 8, cw - 16, ch - 16);
    let size = Math.round(ch * .56); x.font = `${size}px "Lilita One"`; while (x.measureText(text).width > cw - 90 && size > 20) { size -= 2; x.font = `${size}px "Lilita One"`; }
    x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, cw / 2, ch / 2 + 5); }, 1024, Math.round(1024 * h / w)); s.set(1);
  const m = new THREE.MeshStandardMaterial({ map: s.t, roughness: .6, emissiveMap: s.t, emissive: '#FFFFFF', emissiveIntensity: 0 }), side = mat(border);
  return { mesh: new THREE.Mesh(new THREE.BoxGeometry(w, h, .14), [side, side, side, side, m, side]), m };
}

// ---------- the library: three floors of cream and lavender on the sidewalk of the west street, pastel shelves behind big windows ----------
export const LIB = { x: -84, z: 11.7, w: 14, d: 8 };                    // its front at z = 15.7, facing the street (z = 19.5)
const shelfTex = () => canvasTex(512, 256, (x, w, h) => {
  x.fillStyle = '#FFF3DE'; x.fillRect(0, 0, w, h); const R = mulberry(5), cols = ['#F2A88A', '#A8DCC8', '#C9B8E8', '#F7D772', '#A9C8EC', '#F2B8C6', '#9CC48A', '#FFD1A6'];
  for (let r = 0; r < 4; r++) { const y0 = 14 + r * 60; x.fillStyle = '#C99E72'; x.fillRect(0, y0 + 50, w, 8);
    for (let X = 6; X < w - 10;) { const bw = 8 + R() * 12, bh = 30 + R() * 18; x.fillStyle = cols[Math.floor(R() * cols.length)]; x.fillRect(X, y0 + 50 - bh, bw, bh); X += bw + 2; } }
  x.fillStyle = 'rgba(255,255,255,.35)'; x.beginPath(); x.moveTo(40, h); x.lineTo(150, 0); x.lineTo(190, 0); x.lineTo(80, h); x.fill(); }, true);
export function makeLibrary() {
  const P = parts(), { w: W, d: D } = LIB, cream = mat('#FFF4E2'), lav = mat('#C9B8E8'), lavD = mat('#B6A4D8');
  const wall = cityMat('#FBF1E3', { fh: 1.35, base: 1.7, sx: 1.2, box: [.2, .8, .25, .75], glass: '#B9C3E6', lit: .8 });
  const shelves = shelfTex(), glassMs = [];
  const glass = (w, h) => { const t = shelves.clone(); t.needsUpdate = true; t.repeat.set(w / 3, 1); const m = new THREE.MeshStandardMaterial({ map: t, roughness: .3, emissive: '#FFE2B8', emissiveIntensity: 0 }); glassMs.push(m); return m; };
  P.add(new THREE.Mesh(new THREE.BoxGeometry(W + .6, .18, D + .6).translate(0, .09, 0), mat('#E9DFCD')), 0, 0, 0, 0);
  const floors = [[0, 1.7], [1.7, 1.35], [3.05, 1.35]];
  floors.forEach(([y, h], f) => {
    P.add(new THREE.Mesh(new THREE.BoxGeometry(W, h, D).translate(0, h / 2, 0), wall), 0, .18 + y, 0, 1 + f);
    P.add(new THREE.Mesh(new THREE.BoxGeometry(W + .12, .14, D + .12), lav), 0, .18 + y + h - .07, 0, 1 + f);
    for (const s of [-1, 1]) P.add(new THREE.Mesh(new THREE.PlaneGeometry(4.6, h - .45), glass(4.6, h - .45)), s * 3.9, .18 + y + h / 2 - .05, D / 2 + .02, 1 + f);
    if (f) P.add(new THREE.Mesh(new THREE.PlaneGeometry(2.4, h - .45), glass(2.4, h - .45)), 0, .18 + y + h / 2 - .05, D / 2 + .02, 1 + f);
  });
  // the entrance: a dark glass door, two lavender pillars and a little pediment; wide steps down to the sidewalk
  P.add(new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.35, .06), mat('#6C7A9C', { roughness: .2, metalness: .2 })), 0, .18 + .68, D / 2 + .03, 1);
  for (const s of [-1, 1]) P.add(new THREE.Mesh(new THREE.CylinderGeometry(.16, .18, 1.62, 10).translate(0, .81, 0), lavD), s * 1.3, .18, D / 2 + .45, 2);
  P.add(new THREE.Mesh(new THREE.BoxGeometry(3.2, .2, 1.0), lav), 0, .18 + 1.68, D / 2 + .45, 2);
  for (let k = 0; k < 3; k++) P.add(new THREE.Mesh(new THREE.BoxGeometry(5.2 - k * .5, .07, .32), mat('#EFE6D6')), 0, .03 + k * .06, D / 2 + .55 + (2 - k) * .26, 1);
  // the roof cap and the billboard
  P.add(new THREE.Mesh(new THREE.BoxGeometry(W + .3, .3, D + .3), cream), 0, .18 + 4.4 + .15, 0, 4);
  const sign = billboard('PERPUSTAKAAN NETIZEN CITY', 10.5, 1.3);
  for (const x of [-4, 4]) P.add(new THREE.Mesh(new THREE.BoxGeometry(.16, 1.1, .16).translate(0, .55, 0), mat('#C9CED6')), x, .18 + 4.7, D / 2 - 1.2, 5);
  P.add(sign.mesh, 0, .18 + 4.7 + 1.65, D / 2 - 1.2, 6);
  // the reading garden on the east side: a lawn, two benches, little trees, a few open books (the readers come from the crowd)
  const gx = W / 2 + 4.0;
  P.add(new THREE.Mesh(new THREE.BoxGeometry(6.4, .08, 6.6), mat('#A9D69A', { roughness: 1 })), gx, .04, .3, 2);
  for (const z of [-1.4, 1.6]) { const b = new THREE.Group(); b.add(new THREE.Mesh(new THREE.BoxGeometry(1.3, .07, .36).translate(0, .36, 0), mat(PAL.woodDark)), new THREE.Mesh(new THREE.BoxGeometry(1.3, .3, .06).translate(0, .58, -.16), mat(PAL.woodDark)));
    for (const x of [-.55, .55]) b.add(new THREE.Mesh(new THREE.BoxGeometry(.07, .36, .3).translate(x, .18, 0), mat('#6A6670'))); b.rotation.y = -Math.PI / 2; P.add(b, gx - 2.2, 0, z, 3); }
  for (const [x, z] of [[1.9, -2.4], [2.2, 2.3]]) { const t = new THREE.Group(); t.add(new THREE.Mesh(new THREE.CylinderGeometry(.1, .14, .8, 6).translate(0, .4, 0), mat('#B48A68')), new THREE.Mesh(new THREE.IcosahedronGeometry(.8, 0).translate(0, 1.4, 0), mat('#9CC48A'))); P.add(t, gx + x, 0, z, 3); }
  const bookM = mat('#FFFFFF', { side: THREE.DoubleSide }), books = [];
  for (let i = 0; i < 4; i++) { const b = new THREE.Group(); for (const s of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(.2, .26), bookM); p.position.x = s * .1; p.rotation.y = s * -.35; b.add(p); }
    const cv = new THREE.Mesh(new THREE.BoxGeometry(.42, .02, .28), mat(['#F2A88A', '#A8DCC8', '#C9B8E8', '#F7D772'][i])); cv.position.set(0, -.14, -.02); cv.rotation.x = -Math.PI / 2 + .2; b.add(cv); books.push(b); P.root.add(b); }
  sh(P.root); P.root.position.set(LIB.x, 0, LIB.z);
  return { ...P, sign: sign.m, glassMs, wall, books, garden: new THREE.Vector3(LIB.x + gx, 0, LIB.z + .3), door: new THREE.Vector3(LIB.x, 0, LIB.z + D / 2 + .3),
    night(k) { sign.m.emissiveIntensity = k; glassMs.forEach(m => m.emissiveIntensity = .55 * k); wall.userData.U.uNight.value = k; } };
}

// ---------- the airport, outside the east of the city: a runway (north-south), the terminal with a curved roof, the ATC tower, a plane ----------
export const AIR = { x: 212, z0: -116, z1: 6, w: 9, term: new THREE.Vector3(189, 0, -42), atc: new THREE.Vector3(186.5, 0, -66) };
export function makeAirport() {
  const P = parts(), L = AIR.z1 - AIR.z0, zc = (AIR.z0 + AIR.z1) / 2;
  const rw = canvasTex(128, 1024, (x, w, h) => { x.fillStyle = '#8C98AA'; x.fillRect(0, 0, w, h); x.fillStyle = '#F4F1EA'; x.fillRect(6, 0, 5, h); x.fillRect(w - 11, 0, 5, h);
    for (let y = 70; y < h - 70; y += 44) x.fillRect(w / 2 - 2, y, 4, 24);
    for (const y0 of [8, h - 52]) for (let i = 0; i < 6; i++) x.fillRect(18 + i * 16, y0, 9, 44);
    x.font = '700 30px Fredoka'; x.textAlign = 'center'; x.fillText('36', w / 2, h - 70); x.save(); x.translate(w / 2, 70); x.rotate(Math.PI); x.fillText('18', 0, 0); x.restore(); });
  const runway = new THREE.Mesh(new THREE.PlaneGeometry(AIR.w, L).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: rw, roughness: .9 })); runway.receiveShadow = true;
  P.add(runway, AIR.x, .06, zc, 0);
  const asph = mat('#9AA5B5', { roughness: .95 });
  P.add(new THREE.Mesh(new THREE.BoxGeometry(14, .05, 30).translate(0, .025, 0), asph), AIR.term.x + 9.5, .02, AIR.term.z, 0);                 // the apron
  P.add(new THREE.Mesh(new THREE.BoxGeometry(AIR.x - AIR.term.x - 14, .05, 3.2).translate(0, .025, 0), asph), (AIR.term.x + 16.5 + AIR.x - 4.5) / 2, .02, AIR.term.z - 12, 0);   // the taxiway
  P.add(new THREE.Mesh(new THREE.BoxGeometry(AIR.term.x - 152, .05, 4.2).translate(0, .025, 0), asph), (AIR.term.x + 150) / 2 - 2, .02, -3, 0);       // the road from the avenue
  P.add(new THREE.Mesh(new THREE.BoxGeometry(10, .05, 9).translate(0, .025, 0), asph), AIR.term.x - 9, .02, AIR.term.z + 8, 0);                    // parking
  // edge lights along the runway (they blink in order at night)
  const nl = Math.floor(L / 4), lm = new THREE.InstancedMesh(new THREE.SphereGeometry(.13, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffffff', toneMapped: false }), nl * 2);
  for (let i = 0; i < nl; i++) for (const s of [0, 1]) setM(lm, i * 2 + s, AIR.x + (s ? 1 : -1) * (AIR.w / 2 + .35), .14, AIR.z1 - 2 - i * 4, 0, 1);
  lm.frustumCulled = false; P.root.add(lm);
  // the terminal: a pastel hall, a glass front toward the apron, a curved mint roof; the sign on its city side
  const tm = cityMat('#FBEFE0', { fh: 1.4, base: .3, sx: 1.6, box: [.1, .9, .15, .85], glass: '#BFD6EE', lit: .8 });
  P.add(new THREE.Mesh(new THREE.BoxGeometry(9, 2.8, 24).translate(0, 1.4, 0), tm), AIR.term.x, .05, AIR.term.z, 1);
  const roof = new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 25, 24, 1, false, -Math.PI / 2, Math.PI).rotateZ(Math.PI / 2).rotateY(Math.PI / 2), mat('#A8DCC8', { side: THREE.DoubleSide }));
  roof.scale.set(1, .42, 1); P.add(roof, AIR.term.x, 2.85, AIR.term.z, 3);
  P.add(new THREE.Mesh(new THREE.BoxGeometry(.08, 2.2, 22), mat('#CFE6F2', { roughness: .1, metalness: .2, emissive: '#FFE6B8', emissiveIntensity: 0 })), AIR.term.x + 4.55, 1.2, AIR.term.z, 2);
  const tsign = billboard('BANDARA NETIZEN CITY', 8, 1.1, '#3E7FB3', '#A9C8EC'); tsign.mesh.rotation.y = -Math.PI / 2; P.add(tsign.mesh, AIR.term.x - 4.62, 2.2, AIR.term.z, 4);
  // the ATC tower
  const atc = new THREE.Group(); atc.add(new THREE.Mesh(new THREE.CylinderGeometry(.55, .75, 8, 10).translate(0, 4, 0), mat('#FFF4E2')), new THREE.Mesh(new THREE.CylinderGeometry(1.25, .9, .5, 10).translate(0, 8.2, 0), mat('#F2A88A')));
  const cab = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 1.15, 1.1, 10).translate(0, 9.0, 0), mat('#9FC4E0', { roughness: .15, metalness: .2, emissive: '#BEE3FF', emissiveIntensity: 0 })); atc.add(cab);
  atc.add(new THREE.Mesh(new THREE.ConeGeometry(1.4, .7, 10).translate(0, 9.9, 0), mat('#F2A88A')), new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 1.2, 5).translate(0, 10.8, 0), mat('#C9CED6')));
  P.add(atc, AIR.atc.x, 0, AIR.atc.z, 5);
  // a windsock
  const ws = new THREE.Group(); ws.add(new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, 2.6, 5).translate(0, 1.3, 0), mat('#EEE6F6')), new THREE.Mesh(new THREE.ConeGeometry(.2, .9, 8, 1, true).rotateZ(Math.PI / 2).translate(.45, 2.5, 0), mat('#F2A88A', { side: THREE.DoubleSide })));
  P.add(ws, AIR.x - 8, 0, AIR.z1 - 20, 5);
  // the plane: powder blue, round windows, a peach tail
  const plane = makePlane(); plane.root.position.set(AIR.term.x + 9.5, 0, AIR.term.z); plane.root.rotation.y = -Math.PI / 2; P.root.add(plane.root);
  sh(P.root);
  return { ...P, lights: lm, nl, cab, plane, tsign: tsign.m, tm,
    night(k, t) { tsign.m.emissiveIntensity = k; cab.material.emissiveIntensity = .9 * k; tm.userData.U.uNight.value = k;
      const c = new THREE.Color(); for (let i = 0; i < nl; i++) { const on = k > 0 ? (((Math.floor(t * 10) - i) % 12 + 12) % 12 < 2 ? 2.2 : .55) : .15; for (const s of [0, 1]) lm.setColorAt(i * 2 + s, c.setRGB(on, on * .9, on * .55)); }
      lm.instanceColor.needsUpdate = true; } };
}
export function makePlane() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const blue = mat('#A9C8EC', { roughness: .45 }), cream = mat('#FFF9F1'), peach = mat('#F2A88A');
  const fus = new THREE.Mesh(new THREE.CapsuleGeometry(.55, 4.4, 6, 16).rotateX(Math.PI / 2), cream); fus.position.y = 1.0; body.add(fus);
  const belly = new THREE.Mesh(new THREE.CapsuleGeometry(.56, 4.4, 6, 16, ).rotateX(Math.PI / 2), blue); belly.position.y = .9; belly.scale.set(1.0, .6, 1.0); body.add(belly);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(7.2, .12, 1.3), blue); wing.position.set(0, .82, .2); body.add(wing);
  const tw = new THREE.Mesh(new THREE.BoxGeometry(2.6, .1, .8), blue); tw.position.set(0, 1.25, -2.55); body.add(tw);
  const fin = new THREE.Mesh(new THREE.BoxGeometry(.12, 1.3, 1.0).translate(0, .65, 0), peach); fin.position.set(0, 1.35, -2.6); fin.rotation.x = -.3; body.add(fin);
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.CylinderGeometry(.26, .22, .9, 10).rotateX(Math.PI / 2), peach); e.position.set(s * 1.8, .58, .45); body.add(e); }
  const winM = mat('#4E5B72', { roughness: .2 }); for (let i = 0; i < 7; i++) for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.SphereGeometry(.09, 8, 6), winM); w.position.set(s * .53, 1.18, 1.6 - i * .48); w.scale.x = .4; body.add(w); }
  const cock = new THREE.Mesh(new THREE.SphereGeometry(.42, 12, 8, 0, TAU, 0, Math.PI / 2), mat('#4E5B72', { roughness: .2 })); cock.rotation.x = .9; cock.position.set(0, 1.25, 2.55); cock.scale.set(.9, .55, .8); body.add(cock);
  for (const [x, z] of [[0, 2.2], [-1, -.2], [1, -.2]]) { const g = new THREE.Mesh(new THREE.CylinderGeometry(.14, .14, .14, 10).rotateZ(Math.PI / 2), mat('#3D3A42')); g.position.set(x, .16, z); body.add(g);
    const st = new THREE.Mesh(new THREE.BoxGeometry(.06, .5, .06), mat('#9A938A')); st.position.set(x, .4, z); body.add(st); }
  sh(root); return { root, body };
}

// ---------- the harbour on the coast south of the beach (shore coordinates: along the coast, s: + out to sea) ----------
export const PORT = { a0: 100, a1: 138, pier: 117, light: 143 };
export function makePort() {
  const P = parts(), at = (a, s, y = 0) => { const [x, z] = shoreAt(a, s); return new THREE.Vector3(x, y, z); }, rotA = Math.atan2(ALONG[0], ALONG[1]);   // local +z along the coast
  const place = (m, a, s, y, order, ry = 0) => { const p = at(a, s, y); P.add(m, p.x, p.y, p.z, order); m.rotation.y = rotA + ry; return m; };
  // the quay: a cream concrete apron on the sand, a curb at the water
  place(new THREE.Mesh(new THREE.BoxGeometry(12, .55, PORT.a1 - PORT.a0).translate(0, .27, 0), mat('#E6DED0', { roughness: .95 })), (PORT.a0 + PORT.a1) / 2, -9.5, .0, 0, 0);
  // the pier: planks on posts, out into the sea
  const deck = canvasTex(64, 256, (x, w, h) => { x.fillStyle = '#C99E72'; x.fillRect(0, 0, w, h); x.fillStyle = '#B4865C'; for (let y = 0; y < h; y += 16) x.fillRect(0, y, w, 2); }, true);
  const dm = new THREE.MeshStandardMaterial({ map: deck, roughness: .9 }); deck.repeat.set(1, 4);
  const pier = new THREE.Group(); pier.add(new THREE.Mesh(new THREE.BoxGeometry(18, .16, 3.2).translate(9, .55, 0), dm));
  for (let k = 0; k <= 6; k++) for (const s of [-1, 1]) pier.add(new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, 2.2, 6).translate(0, -.4, 0), mat('#8A6A4E')).translateX(k * 3).translateZ(s * 1.4));
  for (let k = 0; k <= 6; k++) for (const s of [-1, 1]) pier.add(new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, .5, 5).translate(0, .85, 0), mat('#FFF9F1')).translateX(k * 3).translateZ(s * 1.5));
  { const p = at(PORT.pier, -3.5, 0); P.add(pier, p.x, 0, p.z, 1); pier.rotation.y = Math.atan2(INLAND[0], INLAND[1]) + Math.PI / 2 + Math.PI; }
  // containers: pastel stacks on the quay
  const cols = ['#F2A88A', '#A8DCC8', '#C9B8E8', '#F7D772', '#A9C8EC', '#F2B8C6'], R = mulberry(17), cont = [];
  for (let a = PORT.a0 + 2; a < PORT.pier - 3; a += 1.5) for (let s = -14; s < -6; s += 2.8) { const n = 1 + Math.floor(R() * 3); for (let k = 0; k < n; k++) cont.push([a, s, .55 + k * 1.2, cols[Math.floor(R() * 6)]]); }
  for (let a = PORT.pier + 5; a < PORT.a1 - 2; a += 1.5) for (let s = -14; s < -9; s += 2.8) { const n = 1 + Math.floor(R() * 2); for (let k = 0; k < n; k++) cont.push([a, s, .55 + k * 1.2, cols[Math.floor(R() * 6)]]); }
  const cm = new THREE.InstancedMesh(new THREE.BoxGeometry(1.25, 1.15, 2.6).translate(0, .575, 0), mat('#ffffff', { roughness: .7 }), cont.length), c = new THREE.Color();
  cont.forEach(([a, s, y, col], i) => { const p = at(a, s); setM(cm, i, p.x, y, p.z, rotA + Math.PI / 2, 1); cm.setColorAt(i, c.set(col)); }); cm.instanceColor.needsUpdate = true; cm.frustumCulled = false;
  const cg = new THREE.Group(); cg.add(cm); P.add(cg, 0, 0, 0, 2);
  // a mini harbour crane: four legs, a beam over the quay edge, a hook
  const crane = new THREE.Group(), cy = mat('#F7D772'), cp = mat('#F2A88A');
  for (const [x, z] of [[-1.6, -1.6], [-1.6, 1.6], [1.6, -1.6], [1.6, 1.6]]) crane.add(new THREE.Mesh(new THREE.BoxGeometry(.28, 6.5, .28).translate(x, 3.25, z), cy));
  crane.add(new THREE.Mesh(new THREE.BoxGeometry(.5, .5, 12).translate(0, 6.6, 3.5), cp), new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.0, 1.6).translate(0, 7.3, -.8), mat('#FFF9F1')));
  crane.add(new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, 3.5, 4).translate(0, 4.7, 7.5), mat('#6A6670')), new THREE.Mesh(new THREE.BoxGeometry(1.25, 1.15, 2.6).translate(0, 2.4, 7.5), mat('#A8DCC8')));
  { const p = at(PORT.pier - 7, -4.5); P.add(crane, p.x, .55, p.z, 3); crane.rotation.y = Math.atan2(-INLAND[0], -INLAND[1]); }
  // the ferry, docked beside the pier
  const ferry = makeFerry(); { const p = at(PORT.pier + 3.6, 9.5); ferry.root.position.copy(p); ferry.root.rotation.y = Math.atan2(-INLAND[0], -INLAND[1]); P.root.add(ferry.root); }
  // the lighthouse (the Mayor's addition): cream with blush pink bands on a rocky foot at the water's edge; its beam turns at night
  const lh = new THREE.Group(), lc = mat('#FFF4E2'), lp = mat('#F2A0B4');
  lh.add(new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.4, .9, 10).translate(0, .45, 0), mat('#CFC6B8')));
  for (let k = 0; k < 6; k++) lh.add(new THREE.Mesh(new THREE.CylinderGeometry(1.15 - (k + 1) * .07, 1.15 - k * .07, 1.5, 14).translate(0, .9 + .75 + k * 1.5, 0), k % 2 ? lp : lc));
  lh.add(new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, .18, 14).translate(0, 9.9, 0), mat('#F2A88A')));
  const lampM = mat('#FFF7D6', { emissive: '#FFE7A0', emissiveIntensity: .1, roughness: .2 }); lh.add(new THREE.Mesh(new THREE.CylinderGeometry(.6, .6, 1.0, 12).translate(0, 10.5, 0), lampM));
  lh.add(new THREE.Mesh(new THREE.ConeGeometry(.85, .8, 12).translate(0, 11.4, 0), lp));
  const beamM = new THREE.MeshBasicMaterial({ color: '#FFF3C4', transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false });
  const beam = new THREE.Group(); beam.position.y = 10.5; for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.ConeGeometry(2.2, 34, 16, 1, true).rotateZ(s * Math.PI / 2).translate(s * 17, 0, 0), beamM); beam.add(b); } lh.add(beam);
  for (let i = 0; i < 9; i++) { const r = new THREE.Mesh(new THREE.DodecahedronGeometry(.8 + hash(i) * .6, 0), mat('#BFB7A8')); const a = i / 9 * TAU; r.position.set(Math.cos(a) * 2.6, .2, Math.sin(a) * 2.6); lh.add(r); }
  { const p = at(PORT.light, 1.2); P.add(lh, p.x, 0, p.z, 4); }
  sh(P.root);
  return { ...P, ferry, beam, beamM, lampM, at,
    night(k, t) { lampM.emissiveIntensity = .1 + 2.4 * k; beamM.opacity = .22 * k; beam.rotation.y = t * 1.1; } };
}
function makeFerry() {
  const root = new THREE.Group(), body = new THREE.Group(); root.add(body);
  const hull = new THREE.Mesh(new THREE.BoxGeometry(3.0, 1.2, 9).translate(0, .25, 0), mat('#F2A88A', { roughness: .5 })); body.add(hull);
  const bow = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 1.2, 12, 1, false, 0, Math.PI).translate(0, .25, 0), mat('#F2A88A')); bow.position.z = 4.5; body.add(bow);
  body.add(new THREE.Mesh(new THREE.BoxGeometry(3.04, .3, 9.04).translate(0, .82, 0), mat('#FFF9F1')));
  const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.2, 4.6).translate(0, 1.55, -.6), mat('#FFF9F1')); body.add(cab);
  for (let i = 0; i < 5; i++) for (const s of [-1, 1]) { const w = new THREE.Mesh(new THREE.BoxGeometry(.04, .4, .55), mat('#5E7CA6', { roughness: .2 })); w.position.set(s * 1.21, 1.65, 1.1 - i * .85); body.add(w); }
  body.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, .8, 1.6).translate(0, 2.55, -1.2), mat('#A8DCC8')));
  const fun = new THREE.Mesh(new THREE.CylinderGeometry(.35, .4, 1.2, 10).translate(0, 3.4, -2.2), mat('#F7D772')); body.add(fun);
  sh(root); return { root, body };
}

// ---------- the sports complex, south-east of the city past the railway: stadium (track, pastel stands, floodlights), GOR, basketball ----------
export const SPORT = { x: 24, z: 88, gor: new THREE.Vector3(17, 0, 124), court: new THREE.Vector3(35, 0, 124) };
const TIERS = 5, AX = 12.6, AZ = 17.6;                                    // the inner edge of the stands (ellipse radii, x and z)
export const seatAt = (k, th, x0 = SPORT.x, z0 = SPORT.z) => new THREE.Vector3(x0 + Math.cos(th) * (AX + .5 + k * 1.15), .62 + k * .78, z0 + Math.sin(th) * (AZ + .5 + k * 1.15));
export function makeSports() {
  const P = parts(), { x: X, z: Z } = SPORT;
  const field = canvasTex(256, 400, (x, w, h) => { for (let i = 0; i < 10; i++) { x.fillStyle = i % 2 ? '#8FCB7E' : '#9AD389'; x.fillRect(0, i * h / 10, w, h / 10); }
    x.strokeStyle = '#FFFFFF'; x.lineWidth = 4; x.strokeRect(10, 10, w - 20, h - 20); x.beginPath(); x.moveTo(10, h / 2); x.lineTo(w - 10, h / 2); x.stroke(); x.beginPath(); x.arc(w / 2, h / 2, 34, 0, TAU); x.stroke();
    for (const y of [10, h - 10]) { x.strokeRect(w / 2 - 60, y === 10 ? 10 : h - 70, 120, 60); } });
  P.add(new THREE.Mesh(new THREE.PlaneGeometry(16, 25).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: field, roughness: 1 })), X, .08, Z, 0);
  const track = new THREE.Mesh(new THREE.RingGeometry(1, 1.32, 64).rotateX(-Math.PI / 2), mat('#E79E86', { roughness: 1 })); track.scale.set(9.3, 1, 13.1); P.add(track, X, .07, Z, 0);
  const lanes = new THREE.Mesh(new THREE.RingGeometry(1.155, 1.165, 64).rotateX(-Math.PI / 2), mat('#FFFFFF')); lanes.scale.set(9.3, 1, 13.1); P.add(lanes, X, .075, Z, 0);
  // the stands: tiers of pastel blocks round an ellipse, colours by sector
  const n = 84, cols = ['#F2A88A', '#A9C8EC', '#F7D772', '#A8DCC8', '#C9B8E8', '#F2B8C6'], st = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat('#ffffff', { roughness: .8 }), n * TIERS), c = new THREE.Color();
  for (let k = 0; k < TIERS; k++) for (let i = 0; i < n; i++) { const th = i / n * TAU, p = seatAt(k, th), L = TAU * Math.hypot(AX + k * 1.15, AZ + k * 1.15) / Math.SQRT2 / n * 1.12;
    setM(st, k * n + i, p.x, 0, p.z, -th + Math.PI / 2, [L, .62 + k * .78, 1.2]); st.setColorAt(k * n + i, c.set(cols[Math.floor(i / n * 12) % 6]).offsetHSL(0, 0, -k * .015)); }
  st.geometry.translate(0, .5, 0); st.instanceColor.needsUpdate = true; st.frustumCulled = false;
  const sg = new THREE.Group(); sg.add(st); P.add(sg, 0, 0, 0, 2);
  const rim = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 1.0, 64, 1, true), mat('#FFF4E2', { side: THREE.DoubleSide })); rim.scale.set(AX + TIERS * 1.15 + .2, 1, AZ + TIERS * 1.15 + .2); rim.geometry.translate(0, .5, 0);
  P.add(rim, X, 0, Z, 3); rim.scale.y = .62 + TIERS * .78 + .6;
  // four floodlight towers
  const fl = [], flM = mat('#FFFBEA', { emissive: '#FFF3C0', emissiveIntensity: 0 });
  for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.CylinderGeometry(.18, .26, 11, 6).translate(0, 5.5, 0), mat('#C9CED6')));
    const panel = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.3, .3).translate(0, 11.4, 0), flM); g.add(panel); g.lookAt(new THREE.Vector3(-sx, 0, -sz).multiplyScalar(10)); g.rotation.x = 0;
    P.add(g, X + sx * (AX + 7), 0, Z + sz * (AZ + 5), 4); g.rotation.y = Math.atan2(-sx, -sz); fl.push(g); }
  const sign = billboard('STADION NETIZEN CITY', 8, 1.0, '#3E8C78', '#A8DCC8'); P.add(sign.mesh, X, .62 + TIERS * .78 + 1.4, Z + AZ + TIERS * 1.15 + .3, 4);
  // the GOR: a hall with a curved lavender roof, a glass front, its name over the door
  const gw = 14, gd = 10, gm = cityMat('#FBEFE0', { fh: 1.2, base: .6, sx: 1.4, box: [.15, .85, .2, .8], glass: '#BFD6EE', lit: .8 });
  P.add(new THREE.Mesh(new THREE.BoxGeometry(gw, 3.0, gd).translate(0, 1.5, 0), gm), SPORT.gor.x, 0, SPORT.gor.z, 5);
  const gr = new THREE.Mesh(new THREE.CylinderGeometry(gd / 2 + .3, gd / 2 + .3, gw + .4, 24, 1, false, -Math.PI / 2, Math.PI).rotateZ(Math.PI / 2), mat('#C9B8E8', { side: THREE.DoubleSide })); gr.scale.set(1, .5, 1);
  P.add(gr, SPORT.gor.x, 3.0, SPORT.gor.z, 6);
  P.add(new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.0, .08), mat('#CFE6F2', { roughness: .1, metalness: .2 })), SPORT.gor.x, 1.0, SPORT.gor.z - gd / 2 - .02, 5);
  const gs = billboard('GOR', 2.6, 1.0, '#7A5BB0', '#C9B8E8'); gs.mesh.rotation.y = Math.PI; P.add(gs.mesh, SPORT.gor.x, 2.55, SPORT.gor.z - gd / 2 - .1, 6);
  // the open basketball court beside it
  const court = canvasTex(200, 340, (x, w, h) => { x.fillStyle = '#F2A86E'; x.fillRect(0, 0, w, h); x.fillStyle = '#A9C8EC'; x.fillRect(w / 2 - 34, 0, 68, 70); x.fillRect(w / 2 - 34, h - 70, 68, 70);
    x.strokeStyle = '#FFFFFF'; x.lineWidth = 4; x.strokeRect(6, 6, w - 12, h - 12); x.beginPath(); x.moveTo(6, h / 2); x.lineTo(w - 6, h / 2); x.stroke(); x.beginPath(); x.arc(w / 2, h / 2, 26, 0, TAU); x.stroke(); });
  P.add(new THREE.Mesh(new THREE.PlaneGeometry(7, 12).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: court, roughness: .9 })), SPORT.court.x, .06, SPORT.court.z, 1);
  for (const s of [-1, 1]) { const h = new THREE.Group(); h.add(new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, 2.4, 6).translate(0, 1.2, 0), mat('#7F7A86')), new THREE.Mesh(new THREE.BoxGeometry(1.1, .7, .06).translate(0, 2.4, .25), mat('#FFFFFF')));
    h.add(new THREE.Mesh(new THREE.TorusGeometry(.2, .025, 6, 16).rotateX(Math.PI / 2).translate(0, 2.15, .52), mat('#F2737B'))); h.rotation.y = s > 0 ? Math.PI : 0; P.add(h, SPORT.court.x, 0, SPORT.court.z + s * 6.3, 3); }
  sh(P.root);
  return { ...P, flM, sign: sign.m, gs: gs.m, gm, fl,
    night(k) { flM.emissiveIntensity = 2.4 * k; sign.m.emissiveIntensity = k; gs.m.emissiveIntensity = k; gm.userData.U.uNight.value = k; } };
}

// ---------- the press conference in front of the Kantor Mayor: a wooden podium, a bunch of pastel toy microphones, a board that flips ----------
export function makePodium() {
  const root = new THREE.Group(), wood = mat(PAL.wood), wd = mat(PAL.woodDark);
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.15, .8, .55).translate(0, .4, 0), wood); root.add(body);
  root.add(new THREE.Mesh(new THREE.BoxGeometry(1.0, .3, .7).translate(0, .15, -.62), wd));            // the step the Mayor stands on
  root.add(new THREE.Mesh(new THREE.BoxGeometry(1.3, .08, .7).translate(0, .84, -.02), wd));
  const logo = signTex((x, v, w, h) => { x.fillStyle = '#FFF4DA'; x.fillRect(0, 0, w, h); x.strokeStyle = '#D9A877'; x.lineWidth = 10; x.strokeRect(5, 5, w - 10, h - 10);
    x.fillStyle = '#5E86C1'; x.font = '58px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('NETIZEN CITY', w / 2, h * .42); x.fillStyle = '#E58F72'; x.font = '34px "Lilita One"'; x.fillText('KANTOR MAYOR', w / 2, h * .76); }, 512, 256); logo.set(1);
  const poster = signTex((x, v, w, h) => { x.fillStyle = '#FFF0C2'; x.fillRect(0, 0, w, h); x.strokeStyle = '#D9475E'; x.lineWidth = 12; x.setLineDash([18, 10]); x.strokeRect(8, 8, w - 16, h - 16); x.setLineDash([]);
    x.fillStyle = '#D9475E'; x.font = '62px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('DICARI:', w / 2, h * .3); x.fillStyle = '#3B3340'; x.font = '64px "Lilita One"'; x.fillText('INVESTOR KOTA!', w / 2, h * .66);
    x.fillStyle = '#F7C34A'; for (const [sx, sy, r] of [[50, 40, 18], [w - 50, 46, 14], [60, h - 40, 12], [w - 56, h - 44, 18]]) { x.beginPath(); for (let i = 0; i < 10; i++) { const rr = i % 2 ? r * .45 : r, a = i / 10 * TAU - Math.PI / 2; x.lineTo(sx + Math.cos(a) * rr, sy + Math.sin(a) * rr); } x.fill(); } }, 512, 256); poster.set(1);
  const flip = new THREE.Group(); flip.position.set(0, .7, .3); root.add(flip);
  const fm = [wd, wd, wd, wd, new THREE.MeshStandardMaterial({ map: logo.t, roughness: .7 }), new THREE.MeshStandardMaterial({ map: poster.t, roughness: .7, emissive: '#FFF0C2', emissiveIntensity: .15, emissiveMap: poster.t })];
  const board = new THREE.Mesh(new THREE.BoxGeometry(1.05, .52, .04).translate(0, -.27, 0), fm); board.rotation.x = 0; flip.add(board);
  // the microphones: stalks gathered at the front edge, pastel foam heads, all leaning toward the speaker
  const mics = new THREE.Group(); mics.position.set(0, .88, .12); root.add(mics);
  ['#F2A88A', '#A9C8EC', '#F7D772', '#A8DCC8', '#C9B8E8', '#F2B8C6'].forEach((c, i) => { const a = (i - 2.5) * .22, g = new THREE.Group();
    g.add(new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, .3, 5).translate(0, .15, 0), mat('#6A6670')), new THREE.Mesh(new THREE.SphereGeometry(.05, 10, 8).translate(0, .32, 0), mat(c, { roughness: .9 })));
    g.position.set(Math.sin(a) * .2, 0, 0); g.rotation.set(-.75, a * .6, -a * .9); mics.add(g); });
  sh(root);
  return { root, flip, board, mics };
}
// a reporter's toy camera (held in front of the capsule), with a flash that pops
export function makePressCam() {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(new THREE.BoxGeometry(.3, .2, .16), mat('#4A4650', { roughness: .4 })), new THREE.Mesh(new THREE.CylinderGeometry(.065, .075, .12, 12).rotateX(Math.PI / 2).translate(0, 0, .13), mat('#2C2A33', { roughness: .2 })));
  const fl = new THREE.Mesh(new THREE.BoxGeometry(.12, .07, .06).translate(-.08, .15, .03), mat('#E9E4DA'));
  g.add(fl);
  const flash = new THREE.Mesh(new THREE.SphereGeometry(.18, 10, 8), new THREE.MeshBasicMaterial({ color: '#FFFFFF', transparent: true, opacity: 0, toneMapped: false, depthWrite: false, blending: THREE.AdditiveBlending }));
  flash.position.set(-.08, .16, .12); g.add(flash);
  return { root: sh(g), flash };
}

// ---------- the Mayor's office, inside: desk, the request scroll, a stamp, the cash box, the calculator, the lamp, the noodles ----------
export const ROOM = new THREE.Vector3(0, 0, -400);                        // a set of its own, far north of the city (only seen in the interior scenes)
function plankTex() { return canvasTex(256, 256, (x, w, h) => { const R = mulberry(9); for (let i = 0; i < 8; i++) { x.fillStyle = `hsl(30, 45%, ${70 + R() * 6}%)`; x.fillRect(0, i * 32, w, 32); x.fillStyle = 'rgba(120,80,50,.25)'; x.fillRect(0, i * 32 + 30, w, 2); x.fillRect(R() * w, i * 32, 2, 32); } }, true); }
function windowTex(night) { return canvasTex(512, 384, (x, w, h) => {
  const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, night ? '#22305C' : '#9BCFF1'); g.addColorStop(1, night ? '#5A5E94' : '#FBE6D2'); x.fillStyle = g; x.fillRect(0, 0, w, h);
  const R = mulberry(night ? 3 : 4), cols = ['#F7ECD6', '#D8CCEE', '#BFD6EE', '#BFE6D6', '#F2D0D8'];
  for (let i = 0; i < 16; i++) { const bw = 22 + R() * 30, bh = 60 + R() * 200, X = i * 32 + R() * 10 - 10; x.fillStyle = night ? '#3A3F68' : cols[i % 5]; x.fillRect(X, h - bh, bw, bh);
    for (let yy = h - bh + 8; yy < h - 6; yy += 14) for (let xx = X + 4; xx < X + bw - 4; xx += 9) if (!night || R() < .55) { x.fillStyle = night ? '#FFD58A' : 'rgba(110,130,170,.5)'; x.fillRect(xx, yy, 4, 6); } }
  if (night) { x.fillStyle = '#FFF6E0'; for (let i = 0; i < 30; i++) x.fillRect(R() * w, R() * h * .4, 2, 2); x.beginPath(); x.arc(w * .8, h * .18, 18, 0, TAU); x.fill(); }
  // the Monument on the skyline, always
  x.fillStyle = night ? '#E8D9B6' : '#F5ECDA'; x.beginPath(); x.moveTo(w * .52 - 6, h); x.lineTo(w * .52 - 3, h * .32); x.lineTo(w * .52 + 3, h * .32); x.lineTo(w * .52 + 6, h); x.fill();
  x.fillStyle = '#F7D772'; x.beginPath(); x.roundRect(w * .52 - 15, h * .2, 30, 22, 6); x.fill(); x.fillStyle = '#F2A0B4'; x.beginPath(); x.arc(w * .52, h * .2 + 11, 5, 0, TAU); x.fill(); }); }
export function makeRoom() {
  const root = new THREE.Group(); root.position.copy(ROOM);
  const fl = plankTex(); fl.repeat.set(3, 3);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(8, 7).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: fl, roughness: .85 })); floor.receiveShadow = true; root.add(floor);
  const wallM = mat('#FFF1DC', { roughness: .95 }), skirt = mat('#F2A88A');
  const back = new THREE.Mesh(new THREE.BoxGeometry(8, 3.6, .2).translate(0, 1.8, -3.0), wallM); root.add(back);
  for (const s of [-1, 1]) root.add(new THREE.Mesh(new THREE.BoxGeometry(.2, 3.6, 7).translate(s * 4, 1.8, .5), wallM));
  root.add(new THREE.Mesh(new THREE.BoxGeometry(8, .2, .25).translate(0, .1, -2.88), skirt));
  // the window behind the desk (day or night outside), a framed picture, a clock
  const winDay = windowTex(false), winNight = windowTex(true);
  const winM = new THREE.MeshStandardMaterial({ map: winDay, roughness: .4, emissive: '#ffffff', emissiveMap: winDay, emissiveIntensity: .35 });
  const win = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 1.6), winM); win.position.set(.6, 1.75, -2.89); root.add(win);
  const fr = mat('#FFFFFF'); for (const [w, h, x, y] of [[2.6, .12, .6, 2.6], [2.6, .12, .6, .9], [.12, 1.8, -.64, 1.75], [.12, 1.8, 1.84, 1.75], [.06, 1.6, .6, 1.75], [2.4, .06, .6, 1.75]]) root.add(new THREE.Mesh(new THREE.BoxGeometry(w, h, .08).translate(x, y, -2.86), fr));
  const pic = signTex((x, v, w, h) => { x.fillStyle = '#C99E72'; x.fillRect(0, 0, w, h); x.fillStyle = '#BFE2F4'; x.fillRect(10, 10, w - 20, h - 20); x.fillStyle = '#9CC48A'; x.fillRect(10, h * .62, w - 20, h * .38 - 10);
    x.fillStyle = '#F2A88A'; x.beginPath(); x.moveTo(w * .3, h * .62); x.lineTo(w * .45, h * .42); x.lineTo(w * .6, h * .62); x.fill(); x.fillStyle = '#F7ECD6'; x.fillRect(w * .34, h * .62, w * .22, h * .16); }, 128, 96); pic.set(1);
  { const m = new THREE.Mesh(new THREE.BoxGeometry(.8, .6, .04), new THREE.MeshStandardMaterial({ map: pic.t })); m.position.set(-2.2, 2.0, -2.88); root.add(m); }
  // the desk
  const wood = mat(PAL.wood), wd = mat(PAL.woodDark), desk = new THREE.Group(); root.add(desk); desk.position.set(0, 0, -.9);
  desk.add(new THREE.Mesh(new THREE.BoxGeometry(2.0, .08, .9).translate(0, .62, 0), wd));
  for (const [x, z] of [[-.9, -.38], [.9, -.38], [-.9, .38], [.9, .38]]) desk.add(new THREE.Mesh(new THREE.BoxGeometry(.08, .62, .08).translate(x, .31, z), wood));
  desk.add(new THREE.Mesh(new THREE.BoxGeometry(1.9, .3, .05).translate(0, .45, .43), wood));
  root.add(new THREE.Mesh(new THREE.BoxGeometry(.9, .3, .7).translate(0, .15, -1.6), wd));                 // the step behind the desk
  // the request scroll: off the front of the desk, down to the floor and on toward the camera
  const scrollTex = canvasTex(64, 512, (x, w, h) => { x.fillStyle = '#FFF9EE'; x.fillRect(0, 0, w, h); x.fillStyle = 'rgba(90,80,90,.35)'; for (let y = 6; y < h; y += 9) x.fillRect(6, y, 20 + (y * 7 % 30), 2); }, true);
  scrollTex.repeat.set(1, 6);
  const sc = new THREE.CatmullRomCurve3([[-.35, .67, -.95], [-.35, .67, -.5], [-.35, .55, -.42], [-.3, .25, -.38], [-.25, .02, -.2], [-.15, .02, .4], [.05, .02, 1.2], [.1, .02, 1.8]].map(p => new THREE.Vector3(...p)));
  const scroll = new THREE.Mesh(ribbon(sc, .42, 120), new THREE.MeshStandardMaterial({ map: scrollTex, roughness: .9, side: THREE.DoubleSide })); root.add(scroll);
  // the stamp pad and the calculator; its receipt grows: off the desk, along the floor, out of the door on the right
  desk.add(new THREE.Mesh(new THREE.BoxGeometry(.3, .04, .2).translate(-.6, .68, .1), mat('#A8DCC8')));
  const calc = new THREE.Group(); calc.position.set(.55, .66, .05); desk.add(calc);
  calc.add(new THREE.Mesh(new THREE.BoxGeometry(.34, .1, .42).translate(0, .05, 0), mat('#F7ECD6')), new THREE.Mesh(new THREE.BoxGeometry(.26, .02, .1).translate(0, .11, -.12), mat('#9DB9A0')));
  for (let i = 0; i < 12; i++) calc.add(new THREE.Mesh(new THREE.BoxGeometry(.05, .02, .05).translate(-.09 + (i % 4) * .06, .11, .02 + Math.floor(i / 4) * .06), mat(i % 4 === 3 ? '#F2A88A' : '#FFFFFF')));
  const rc = new THREE.CatmullRomCurve3([[.55, .78, -.95 - .12], [.55, .9, -1.2], [.6, .72, -1.05], [.7, .66, -.7], [.85, .62, -.48], [.95, .3, -.42], [1.0, .02, -.2], [1.4, .02, .4], [2.4, .02, .9], [3.6, .02, 1.3], [4.6, .02, 1.5]].map(p => new THREE.Vector3(...p)));
  const rTex = canvasTex(32, 512, (x, w, h) => { x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, w, h); x.fillStyle = '#9A8F98'; for (let y = 8; y < h; y += 11) x.fillRect(4, y, 10 + (y * 13 % 14), 2); }, true); rTex.repeat.set(1, 10);
  const receiptG = ribbon(rc, .16, 300), receipt = new THREE.Mesh(receiptG, new THREE.MeshStandardMaterial({ map: rTex, roughness: .9, side: THREE.DoubleSide })); root.add(receipt);
  // the lamp: a warm cone over the desk; at night it is the light of the room
  const lamp = new THREE.Group(); lamp.position.set(-.75, .66, -.25); desk.add(lamp);
  lamp.add(new THREE.Mesh(new THREE.CylinderGeometry(.12, .14, .04, 12), mat('#C4B3E3')), new THREE.Mesh(new THREE.CylinderGeometry(.015, .015, .45, 5).translate(0, .23, 0), mat('#9A938A')));
  const shade = new THREE.Mesh(new THREE.ConeGeometry(.16, .2, 14, 1, true).translate(.06, .46, 0), mat('#C4B3E3', { side: THREE.DoubleSide })); shade.rotation.z = -.4; lamp.add(shade);
  const bulbM = mat('#FFF4D8', { emissive: '#FFD58A', emissiveIntensity: 0 }); lamp.add(new THREE.Mesh(new THREE.SphereGeometry(.05, 10, 8).translate(.1, .4, 0), bulbM));
  const light = new THREE.PointLight('#FFC97A', 0, 7, 1.6); light.position.set(.15, .35, 0); lamp.add(light);
  // the noodles: a steaming cup, a stack of empty ones at the corner
  const cup = new THREE.Group(); cup.position.set(.05, .66, .12); desk.add(cup);
  cup.add(new THREE.Mesh(new THREE.CylinderGeometry(.13, .1, .22, 16, 1, true).translate(0, .11, 0), mat('#FFF9F1', { side: THREE.DoubleSide })), new THREE.Mesh(new THREE.CylinderGeometry(.131, .12, .08, 16, 1, true).translate(0, .12, 0), mat('#F2A88A', { side: THREE.DoubleSide })));
  const noodle = new THREE.Mesh(new THREE.CylinderGeometry(.115, .115, .04, 16), mat('#F7D772', { roughness: .6 })); noodle.position.y = .18; cup.add(noodle);
  const chop = new THREE.Group(); for (const s of [-1, 1]) chop.add(new THREE.Mesh(new THREE.CylinderGeometry(.008, .01, .4, 5).translate(0, .2, 0), mat('#E8C79E')).translateX(s * .02)); chop.position.set(.04, .12, 0); chop.rotation.z = -.5; cup.add(chop);
  const stack = new THREE.Group(); stack.position.set(.82, .66, -.25); desk.add(stack);
  for (let k = 0; k < 6; k++) { const c = new THREE.Mesh(new THREE.CylinderGeometry(.13, .1, .22, 14, 1, true).translate(0, .11, 0), mat(k % 2 ? '#FFF9F1' : '#F7ECD6', { side: THREE.DoubleSide })); c.position.set((k % 3 - 1) * .27, Math.floor(k / 3) * .22, (k % 2) * .05); c.rotation.x = Math.PI; c.position.y += .22; stack.add(c); }
  // the cash box: butter yellow, a dial, a handle, the door on its left hinge; one coin; a moth
  const safe = new THREE.Group(); safe.position.set(-2.6, 0, .3); safe.rotation.y = Math.PI / 2; root.add(safe);     // by the left wall, its door toward the room
  const sy = mat('#F7D772', { roughness: .5 }), sd = mat('#E8C35A', { roughness: .5 });
  safe.add(new THREE.Mesh(new THREE.BoxGeometry(.95, 1.05, .8).translate(0, .53, 0), sy));
  safe.add(new THREE.Mesh(new THREE.BoxGeometry(.8, .9, .05).translate(0, .53, .38), mat('#3B3340')));              // the dark inside, behind the door
  const door = new THREE.Group(); door.position.set(.45, 0, .41); safe.add(door);                      // hinged on its right: it swings open to the left, clear of the Mayor
  door.add(new THREE.Mesh(new THREE.BoxGeometry(.9, .98, .07).translate(-.45, .53, 0), sd));
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(.13, .13, .05, 20).rotateX(Math.PI / 2), mat('#C9CED6', { metalness: .5, roughness: .3 })); dial.position.set(-.45, .62, .05); door.add(dial);
  for (let i = 0; i < 8; i++) { const tk = new THREE.Mesh(new THREE.BoxGeometry(.012, .035, .01), mat('#3B3340')); const a = i / 8 * TAU; tk.position.set(Math.sin(a) * .1, Math.cos(a) * .1, .03); dial.add(tk); }
  door.add(new THREE.Mesh(new THREE.BoxGeometry(.05, .26, .06).translate(-.7, .4, .06), mat('#C9CED6', { metalness: .5 })));
  const coin = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .016, 18).rotateX(Math.PI / 2), mat('#F2C14E', { metalness: .7, roughness: .3, emissive: '#7A5A10', emissiveIntensity: .2 })); root.add(coin);
  const moth = new THREE.Group(), mm = mat('#BDB4C8', { side: THREE.DoubleSide, roughness: .9 }); moth.add(new THREE.Mesh(new THREE.CapsuleGeometry(.018, .06, 3, 6).rotateX(Math.PI / 2), mat('#8E8598')));
  const mw = [-1, 1].map(s => { const p = new THREE.Group(); const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([0, 0, .03, s * .1, 0, .04, s * .09, 0, -.05], 3)); g.computeVertexNormals(); p.add(new THREE.Mesh(g, mm)); moth.add(p); return p; });
  root.add(moth);
  sh(root); [scroll, receipt].forEach(m => { m.castShadow = false; });
  const r = { root, desk, scroll, receipt, receiptG, rTotal: receiptG.index.count, lamp, light, bulbM, cup, noodle, stack, safe, door, dial, coin, moth, mw, winM, winDay, winNight,
    W: p => root.localToWorld(p.clone()) };
  r.setNight = k => { const t = k > .5 ? winNight : winDay; if (winM.map !== t) { winM.map = t; winM.emissiveMap = t; winM.needsUpdate = true; } winM.emissiveIntensity = k > .5 ? .9 : .35; bulbM.emissiveIntensity = 2.2 * k; light.intensity = 9 * k; };
  r.printed = u => receiptG.setDrawRange(0, Math.floor(clamp(u) * r.rTotal / 6) * 6);
  return r;
}
// a flat strip along a curve (paper)
function ribbon(curve, w, n) {
  const pos = [], uv = [], idx = [], up = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i <= n; i++) { const u = i / n, p = curve.getPointAt(u), t = curve.getTangentAt(u); let side = new THREE.Vector3().crossVectors(t, up); if (side.lengthSq() < 1e-4) side.set(1, 0, 0); side.normalize().multiplyScalar(w / 2);
    pos.push(p.x - side.x, p.y - side.y + .004, p.z - side.z, p.x + side.x, p.y + side.y + .004, p.z + side.z); uv.push(0, u, 1, u);
    if (i < n) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
// the stamp the Mayor holds (at his side, toy logic): a wooden handle, a mint rubber
export function makeStamp() { const g = new THREE.Group(); g.add(new THREE.Mesh(new THREE.CylinderGeometry(.05, .06, .2, 10).translate(0, .14, 0), mat(PAL.woodDark)), new THREE.Mesh(new THREE.SphereGeometry(.07, 10, 8).translate(0, .26, 0), mat(PAL.wood)), new THREE.Mesh(new THREE.BoxGeometry(.2, .05, .14).translate(0, .025, 0), mat('#7FCFB2'))); return sh(g); }

// ---------- the Prasasti Investor Kota at the entrance of the Monument garden (the Monument behind it never changes) ----------
export const PRAS = new THREE.Vector3(-39.4, 0, -66.5);
export function makePrasasti() {
  const root = new THREE.Group(), stone = mat('#EFE3CC', { roughness: .9 });
  const face = signTex((x, v, w, h) => { x.fillStyle = '#EFE3CC'; x.fillRect(0, 0, w, h); x.strokeStyle = '#CDBB98'; x.lineWidth = 10; x.strokeRect(14, 14, w - 28, h - 28);
    x.fillStyle = '#8C7556'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '56px "Lilita One"'; x.fillText('PRASASTI', w / 2, 70); x.font = '44px "Lilita One"'; x.fillText('INVESTOR KOTA', w / 2, 122);
    x.fillStyle = '#D6C6A6'; for (let i = 0; i < 6; i++) { x.fillRect(80, 172 + i * 34, w - 160, 4); } x.fillStyle = '#B79F7C'; x.font = '24px "Lilita One"'; x.fillText('NETIZEN CITY • DAY 7', w / 2, h - 40); }, 512, 420); face.set(1);
  root.add(new THREE.Mesh(new THREE.BoxGeometry(2.8, .3, 1.0).translate(0, .15, 0), mat('#E6D8BE')));
  const slab = new THREE.Mesh(new THREE.BoxGeometry(2.3, 1.9, .32), [stone, stone, stone, stone, new THREE.MeshStandardMaterial({ map: face.t, roughness: .9 }), stone]); slab.position.y = .3 + .95; slab.rotation.x = -.06; root.add(slab);
  root.position.copy(PRAS); return sh(root);
}

