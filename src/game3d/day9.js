// Day 9: the Mayor's cat (a fixed character from now on), @aftone_moon's zoo at the south edge of the forest, @muh_adnan_11's animal
// hospital with its adoption corner on the Fasilitas sidewalk, @z_hr.da's university beside the lab (the Professor is its rector).
// The cat: a tiny round low-poly peach-orange cat, about half a capsule tall, cream belly, paws and tail tip, little triangle ears with
// blush-pink insides, two dot eyes and a blush-pink triangle nose. Its shape and colours never change.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { mulberry, clamp, lerp, seg, back, eo, eio, hash } from './core/lib.js';
import { PAL, signTex } from './world.js';
import { cityMat } from './metro.js';

const TAU = Math.PI * 2;
// a mesh offset in place (the signs are built as boxes and moved onto their faces)
if (!THREE.Object3D.prototype.translate) THREE.Object3D.prototype.translate = function (x, y, z) { this.position.x += x; this.position.y += y; this.position.z += z; return this; };
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .78, metalness: 0, flatShading: true, ...o });
const sh = m => { m.traverse(o => { if (o.isMesh) { o.castShadow = false; o.receiveShadow = false; } }); return m; };
const pop = (k, t0, d = .22) => k < t0 ? 0 : back(seg(k, t0, t0 + d), 2.2);
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }
function parts() { const root = new THREE.Group(), list = [];
  const add = (m, x = 0, y = 0, z = 0, order = 0) => { m.position.set(x, y, z); const p = new THREE.Group(); p.add(m); p.userData.order = order; root.add(p); list.push(p); return m; };
  const build = (k, n = 8) => { root.visible = k > 0; list.forEach(p => { const u = pop(k, p.userData.order / n * .85, .2); p.visible = u > 0; p.scale.set(1, Math.max(.001, u), 1); }); };
  return { root, list, add, build }; }
function billboard(text, w, h, fg = '#5FA88A', border = '#A8DCC8') {
  const s = signTex((x, v, cw, ch) => { x.fillStyle = '#FFF9F1'; x.fillRect(0, 0, cw, ch); x.strokeStyle = border; x.lineWidth = 16; x.strokeRect(8, 8, cw - 16, ch - 16);
    let size = Math.round(ch * .56); x.font = `${size}px "Lilita One"`; while (x.measureText(text).width > cw - 90 && size > 20) { size -= 2; x.font = `${size}px "Lilita One"`; }
    x.fillStyle = fg; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, cw / 2, ch / 2 + 5); }, 1024, Math.round(1024 * h / w)); s.set(1);
  const m = new THREE.MeshStandardMaterial({ map: s.t, roughness: .6, emissiveMap: s.t, emissive: '#FFFFFF', emissiveIntensity: 0 }), side = mat(border);
  return { mesh: new THREE.Mesh(new THREE.BoxGeometry(w, h, .14), [side, side, side, side, m, side]), m };
}

// ---------- the Mayor's cat ----------
export function makeCat(o = {}) {
  const body = o.body || '#F4A97A', cream = o.cream || '#FFF1DC', pink = '#F2A0B4';
  const root = new THREE.Group(), g = new THREE.Group(); root.add(g);                // g: lean, squash; root: position, facing (the cat looks along +z)
  const M = mat(body, { roughness: .7 }), Cm = mat(cream, { roughness: .7 }), Pm = mat(pink), Em = mat('#2C2A33', { roughness: .3 });
  const torso = new THREE.Group(); torso.position.y = .17; g.add(torso);
  torso.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.15, 1).scale(1, .9, 1.3), M));
  torso.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.11, 1).scale(1, .7, 1.15).translate(0, -.045, .02), Cm));   // the cream belly
  const legs = [[-.075, .11], [.075, .11], [-.075, -.11], [.075, -.11]].map(([x, z]) => { const L = new THREE.Group(); L.position.set(x, .1, z); g.add(L);
    L.add(new THREE.Mesh(new THREE.CylinderGeometry(.034, .03, .1, 6).translate(0, -.05, 0), M)); L.add(new THREE.Mesh(new THREE.SphereGeometry(.036, 6, 4).scale(1, .6, 1.2).translate(0, -.1, .01), Cm)); return L; });
  const head = new THREE.Group(); head.position.set(0, .3, .15); g.add(head);
  head.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.115, 1).scale(1.1, .95, .95), M));
  head.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.06, 1).scale(1.3, .8, .7).translate(0, -.035, .07), Cm));
  for (const s of [-1, 1]) { const ear = new THREE.Group(); ear.position.set(s * .068, .085, -.01); ear.rotation.z = -s * .25; head.add(ear);
    ear.add(new THREE.Mesh(new THREE.ConeGeometry(.045, .08, 3).translate(0, .04, 0), M)); ear.add(new THREE.Mesh(new THREE.ConeGeometry(.027, .055, 3).translate(0, .03, .012), Pm)); }
  const eyes = [-1, 1].map(s => { const e = new THREE.Mesh(new THREE.SphereGeometry(.017, 8, 6), Em); e.position.set(s * .045, .015, .098); head.add(e); return e; });
  const nose = new THREE.Mesh(new THREE.ConeGeometry(.016, .02, 3).rotateX(Math.PI).translate(0, -.012, .108), Pm); head.add(nose);
  const tail = new THREE.Group(); tail.position.set(0, .2, -.17); g.add(tail);
  const tc = new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, .08, -.06), new THREE.Vector3(0, .18, -.05), new THREE.Vector3(0, .24, .01)]);
  tail.add(new THREE.Mesh(new THREE.TubeGeometry(tc, 10, .022, 6), M));
  const tip = new THREE.Mesh(new THREE.SphereGeometry(.03, 6, 4).translate(0, .245, .015), Cm); tail.add(tip);
  sh(root);
  const cat = { root, g, torso, legs, head, eyes, tail };
  // poses: walk (u: the gait phase), freeze (one front paw up, tail stiff), sit, blink, purr, tilt
  cat.pose = (p = {}) => { const w = p.walk || 0, ph = p.ph || 0;
    legs.forEach((L, i) => L.rotation.x = w * .7 * Math.sin(ph + (i === 0 || i === 3 ? 0 : Math.PI)));
    if (p.freeze) { legs[0].rotation.x = -1.1 * p.freeze; tail.rotation.x = .5 * p.freeze; }
    g.rotation.x = -(p.sit || 0) * .5; torso.position.y = .17 - (p.sit || 0) * .03; legs[2].rotation.x += (p.sit || 0) * 1.2; legs[3].rotation.x += (p.sit || 0) * 1.2;
    tail.rotation.x = (p.freeze ? .5 * p.freeze : 0) + (p.tailUp || 0) * .4 + Math.sin(p.t * 3 || 0) * .15 * (1 - (p.freeze || 0));
    head.rotation.z = p.tilt || 0; head.rotation.x = p.look || 0;
    eyes.forEach(e => e.scale.y = p.blink ? Math.max(.08, 1 - p.blink) : 1);
    g.scale.setScalar(1 + (p.purr || 0) * .03 * Math.sin((p.t || 0) * 30)); };
  return cat;
}
// a few pets walking with their capsules on the sidewalks since Day 9: little dogs and cats
export function makePet(kind, col) {
  if (kind === 'cat') return makeCat({ body: col || '#C9C3D3', cream: '#FFFFFF' });
  const root = new THREE.Group(), g = new THREE.Group(); root.add(g); const M = mat(col || '#D9B48C'), Cm = mat('#FFF6E6');
  g.add(new THREE.Mesh(new THREE.CapsuleGeometry(.08, .16, 4, 8).rotateX(Math.PI / 2).translate(0, .16, 0), M));
  const head = new THREE.Group(); head.position.set(0, .25, .14); g.add(head); head.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.08, 1), M)); head.add(new THREE.Mesh(new THREE.BoxGeometry(.06, .05, .07).translate(0, -.02, .07), Cm));
  for (const s of [-1, 1]) { const ear = new THREE.Mesh(new THREE.BoxGeometry(.03, .08, .05).translate(0, -.03, 0), mat('#8C6A4E')); ear.position.set(s * .07, .03, 0); ear.rotation.z = s * .3; head.add(ear); }
  const legs = [[-.05, .08], [.05, .08], [-.05, -.08], [.05, -.08]].map(([x, z]) => { const L = new THREE.Group(); L.position.set(x, .1, z); g.add(L); L.add(new THREE.Mesh(new THREE.CylinderGeometry(.022, .02, .1, 5).translate(0, -.05, 0), M)); return L; });
  const tail = new THREE.Mesh(new THREE.CylinderGeometry(.012, .018, .12, 5).rotateX(-.8).translate(0, .22, -.17), M); g.add(tail);
  sh(root); return { root, g, legs, head, tail, pose: p => { legs.forEach((L, i) => L.rotation.x = (p.walk || 0) * .7 * Math.sin((p.ph || 0) + (i === 0 || i === 3 ? 0 : Math.PI))); tail.rotation.z = Math.sin((p.t || 0) * 12) * .4; } };
}
// the graduation cap (the Professor's first one lands on the cat)
export function makeGradCap() {
  const g = new THREE.Group(), navy = mat('#4A4A6A', { roughness: .6 }), gold = mat('#F7D772');
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(.075, .08, .05, 12).translate(0, .025, 0), navy));
  const board = new THREE.Mesh(new THREE.BoxGeometry(.2, .018, .2).translate(0, .06, 0), navy); board.rotation.y = Math.PI / 4; g.add(board);
  g.add(new THREE.Mesh(new THREE.SphereGeometry(.014, 6, 4).translate(0, .072, 0), gold));
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(.006, .006, .09, 4).translate(.09, .03, 0), gold));
  g.add(new THREE.Mesh(new THREE.ConeGeometry(.016, .035, 6).rotateX(Math.PI).translate(.09, -.02, 0), gold));
  return sh(g);
}

// ---------- the zoo: on the open land north-west of the city, between the forest's edge and the Kawasan Kerukunan, its gate toward the city ----------
export const ZOO = { x: -122, z: -80, r: 17 };                                 // north of the city's north-west blocks, between the forest's edge and the Kawasan Kerukunan
const pastelFence = (r0, n, h = .55, col = '#E9D3B0') => { const g = new THREE.Group(), m = mat(col);
  for (let i = 0; i < n; i++) { const a = i / n * TAU; g.add(new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, h, 5).translate(Math.cos(a) * r0, h / 2, Math.sin(a) * r0), m)); }
  for (const y of [h * .45, h * .9]) g.add(new THREE.Mesh(new THREE.TorusGeometry(r0, .03, 4, n * 2).rotateX(Math.PI / 2).translate(0, y, 0), m)); return g; };
function animal(kind) {
  const g = new THREE.Group(), add = (geo, c, o = {}) => { const m = new THREE.Mesh(geo, mat(c, o)); g.add(m); return m; }, legs = [];
  const leg = (x, z, r, h, c) => { const L = new THREE.Group(); L.position.set(x, h, z); g.add(L); L.add(new THREE.Mesh(new THREE.CylinderGeometry(r, r * .9, h, 6).translate(0, -h / 2, 0), mat(c))); legs.push(L); return L; };
  const parts = { g, legs };
  if (kind === 'elephant') { const c = '#B8B2CC'; add(new THREE.IcosahedronGeometry(1, 1).scale(1.05, .85, 1.35).translate(0, 1.55, 0), c);
    for (const [x, z] of [[-.5, .65], [.5, .65], [-.5, -.65], [.5, -.65]]) leg(x, z, .26, .9, c);
    const head = new THREE.Group(); head.position.set(0, 1.9, 1.25); g.add(head); head.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.62, 1), mat(c)));
    const ears = []; for (const s of [-1, 1]) { const earG = new THREE.Group(); earG.position.set(s * .6, .05, -.15); const ear = new THREE.Mesh(new THREE.CylinderGeometry(.55, .55, .06, 10).rotateZ(Math.PI / 2), mat('#C9C3DD')); ear.rotation.y = s * .4; earG.add(ear); head.add(earG); ears.push(earG); }
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.05, 6, 4), mat('#2C2A33')); e.position.set(s * .28, .15, .5); head.add(e); }
    const trunk = new THREE.Group(); trunk.position.set(0, -.15, .5); head.add(trunk);
    trunk.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -.45, .2), new THREE.Vector3(0, -.75, .45), new THREE.Vector3(0, -.6, .75)]), 12, .12, 7), mat(c)));
    parts.trunk = trunk; parts.head = head; parts.ears = ears;
  } else if (kind === 'giraffe') { const c = '#F7D772', sp = mat('#E8A95A'); add(new THREE.IcosahedronGeometry(.7, 1).scale(.9, .75, 1.3).translate(0, 2.0, 0), c);
    for (const [x, z] of [[-.3, .55], [.3, .55], [-.3, -.55], [.3, -.55]]) leg(x, z, .1, 1.6, c);
    const neck = new THREE.Group(); neck.position.set(0, 2.3, .65); g.add(neck); neck.add(new THREE.Mesh(new THREE.CylinderGeometry(.16, .22, 2.2, 8).translate(0, 1.1, 0), mat(c)));
    neck.rotation.x = .35; const head = new THREE.Group(); head.position.set(0, 2.25, .1); neck.add(head); head.add(new THREE.Mesh(new THREE.BoxGeometry(.28, .26, .55).translate(0, 0, .12), mat(c)));
    for (const s of [-1, 1]) { const h = new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .22, 5).translate(s * .08, .2, -.05), mat('#C9875E')); head.add(h); const e = new THREE.Mesh(new THREE.SphereGeometry(.035, 6, 4), mat('#2C2A33')); e.position.set(s * .14, .06, .18); head.add(e); }
    for (let i = 0; i < 14; i++) { const s = new THREE.Mesh(new THREE.CircleGeometry(.1 + hash(i) * .06, 6), sp); const a = hash(i * 3) * TAU; s.position.set(Math.cos(a) * .62, 2.0 + (hash(i * 7) - .5) * .7, Math.sin(a) * .9); s.lookAt(s.position.clone().multiplyScalar(2).setY(s.position.y)); g.add(s); }
    parts.neck = neck; parts.head = head;
  } else if (kind === 'flamingo') { const c = '#F2A0B4'; add(new THREE.IcosahedronGeometry(.3, 1).scale(.8, .7, 1.2).translate(0, 1.2, 0), c);
    leg(0, .02, .025, 1.0, '#F08AA4'); const neckG = new THREE.Group(); neckG.position.set(0, 1.25, .2); const neck = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(0, .05, .05), new THREE.Vector3(0, .5, .15), new THREE.Vector3(0, .7, -.05), new THREE.Vector3(0, .75, .1)]), 10, .05, 6), mat(c)); neckG.add(neck); g.add(neckG); parts.neck = neckG;
    const head = new THREE.Group(); head.position.set(0, .77, .12); head.add(new THREE.Mesh(new THREE.SphereGeometry(.1, 8, 6), mat(c)), new THREE.Mesh(new THREE.ConeGeometry(.04, .14, 6).rotateX(Math.PI / 2 + .6).translate(0, -.05, .13), mat('#3A3340'))); neckG.add(head); parts.head = head;
    const bent = new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .45, 5).rotateX(1.2).translate(0, .72, -.12), mat('#F08AA4')); g.add(bent); parts.bent = bent;
  } else if (kind === 'lion') { const c = '#F4B98C'; add(new THREE.IcosahedronGeometry(.6, 1).scale(.85, .75, 1.4).translate(0, .9, 0), c);
    for (const [x, z] of [[-.28, .5], [.28, .5], [-.28, -.5], [.28, -.5]]) leg(x, z, .11, .55, c);
    const head = new THREE.Group(); head.position.set(0, 1.25, .75); g.add(head); head.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.48, 1), mat('#E58F72')));
    head.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.32, 1).translate(0, 0, .2), mat(c)));
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.04, 6, 4), mat('#2C2A33')); e.position.set(s * .12, .08, .48); head.add(e); }
    const jaw = new THREE.Mesh(new THREE.BoxGeometry(.2, .1, .12).translate(0, -.14, .44), mat('#FFE6D0')); head.add(jaw); parts.head = head; parts.jaw = jaw;
    const tail = new THREE.Group(); tail.position.set(0, 1.05, -.95); tail.add(new THREE.Mesh(new THREE.CylinderGeometry(.04, .03, .7, 5).rotateX(-.9), mat(c))); g.add(tail); parts.tail = tail;
  } else if (kind === 'komodo') { const c = '#9CC48A'; add(new THREE.CapsuleGeometry(.22, 1.1, 4, 8).rotateX(Math.PI / 2).translate(0, .32, 0), c);
    const tail = new THREE.Group(); tail.position.set(0, .3, -1.25); tail.add(new THREE.Mesh(new THREE.ConeGeometry(.17, 1.2, 6).rotateX(-Math.PI / 2), mat(c))); g.add(tail); parts.tail = tail;
    const head = new THREE.Group(); head.position.set(0, .36, .85); head.add(new THREE.Mesh(new THREE.BoxGeometry(.3, .2, .45), mat(c))); g.add(head); parts.head = head;
    for (const [x, z] of [[-.25, .4], [.25, .4], [-.25, -.4], [.25, -.4]]) { const L = leg(x, z, .06, .22, c); L.rotation.z = (x < 0 ? 1 : -1) * .5; }
    for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.03, 6, 4), mat('#2C2A33')); e.position.set(s * .13, .45, .95); g.add(e); }
  } else if (kind === 'penguin') { add(new THREE.CapsuleGeometry(.2, .3, 4, 10).translate(0, .38, 0), '#5E7FB0', { flatShading: false }); add(new THREE.CapsuleGeometry(.16, .24, 4, 10).translate(0, .37, .07), '#FFFFFF', { flatShading: false });
    add(new THREE.ConeGeometry(.05, .12, 6).rotateX(Math.PI / 2).translate(0, .6, .22), '#F6B26B');
    const flippers = []; for (const s of [-1, 1]) { add(new THREE.SphereGeometry(.025, 6, 4).translate(s * .07, .66, .17), '#2C2A33'); const f = new THREE.Mesh(new THREE.BoxGeometry(.04, .22, .12), mat('#5E7FB0')); f.position.set(s * .21, .38, 0); f.rotation.z = s * .3; g.add(f); flippers.push(f); } parts.flippers = flippers;
    for (const s of [-1, 1]) add(new THREE.BoxGeometry(.09, .03, .13).translate(s * .08, .015, .05), '#F6B26B');
  }
  sh(g); return parts;
}
// the enclosures sit outside the round path (ring 5.8 ± .9, so it ends at 6.7) with .8 to spare (d = r + 7.5), and clear of the
// entry path from the gate (x ± .9, where the queue walks) by at least 2 units: the fences never cross a walkway
export const ENCL = [{ k: 'elephant', a: -2.618, r: 4.3 }, { k: 'giraffe', a: -1.571, r: 3.8 }, { k: 'lion', a: -.524, r: 3.4 }, { k: 'flamingo', a: .524, r: 3.0 }, { k: 'komodo', a: 1.571, r: 3.4 }, { k: 'penguin', a: 2.618, r: 3.6 }].map(e => ({ ...e, d: e.r + 7.5 }));
export function makeZoo() {
  const P = parts(), root = P.root; root.position.set(ZOO.x, 0, ZOO.z);
  const lawn = new THREE.Mesh(new THREE.CylinderGeometry(ZOO.r, ZOO.r, .06, 64), mat('#A9D69A', { roughness: 1 })); P.add(lawn, 0, .03, 0, 0); lawn.receiveShadow = true;
  P.add(new THREE.Mesh(new THREE.TorusGeometry(5.8, .9, 4, 64).rotateX(Math.PI / 2).scale(1, .03, 1), mat('#E9DFCD', { roughness: .95 })), 0, .06, 0, 1);    // the round path
  P.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, .05, 11.0), mat('#E9DFCD', { roughness: .95 })), 0, .05, 11.3, 1);
  // the gate: a wooden pastel arch with the sign, facing south to the avenue
  const gate = new THREE.Group(), wood = mat('#E3C59A'), mint = mat('#A8DCC8');
  for (const s of [-1, 1]) { gate.add(new THREE.Mesh(new THREE.CylinderGeometry(.22, .26, 3.4, 8).translate(s * 2.2, 1.7, 0), wood)); gate.add(new THREE.Mesh(new THREE.ConeGeometry(.4, .5, 8).translate(s * 2.2, 3.65, 0), mint)); }
  gate.add(new THREE.Mesh(new THREE.TorusGeometry(2.2, .16, 6, 24, Math.PI).translate(0, 3.0, 0), wood));
  const zs = signTex((x, v, w, h) => { x.fillStyle = '#FFF4DA'; x.fillRect(0, 0, w, h); x.strokeStyle = '#8FC48A'; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14);
    x.fillStyle = '#5C8F4E'; x.font = '62px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('KEBUN BINATANG', w / 2, h * .38); x.fillStyle = '#E58F72'; x.font = '52px "Lilita One"'; x.fillText('NETIZEN CITY', w / 2, h * .74); }, 768, 230); zs.set(1);
  const zsM = new THREE.MeshStandardMaterial({ map: zs.t, roughness: .7, emissiveMap: zs.t, emissive: '#FFFFFF', emissiveIntensity: 0 });
  gate.add(new THREE.Mesh(new THREE.BoxGeometry(3.6, 1.08, .12), [wood, wood, wood, wood, zsM, wood]).translate(0, 3.0, .08));
  P.add(gate, 0, 0, ZOO.r - .3, 2);
  // the enclosures round the path: low pastel fences, a lawn or a pool each, and their animals
  const animals = [];
  ENCL.forEach((e, i) => { const x = Math.sin(e.a) * e.d, z = Math.cos(e.a) * e.d, g = new THREE.Group();
    if (e.k === 'penguin') { g.add(new THREE.Mesh(new THREE.CylinderGeometry(e.r - .3, e.r - .3, .05, 32).translate(0, .06, 0), mat('#9FD3EC', { roughness: .2, emissive: '#9FD3EC', emissiveIntensity: .12 }))); g.add(new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.3, .35, 10).translate(.8, .18, -.6), mat('#F4F1EA'))); }
    else g.add(new THREE.Mesh(new THREE.CylinderGeometry(e.r - .2, e.r - .2, .04, 32).translate(0, .07, 0), mat(e.k === 'komodo' ? '#E8D9B8' : '#B9DDA4', { roughness: 1 })));
    g.add(pastelFence(e.r, 20, .55, ['#E9D3B0', '#F2D0D8', '#D8CCEE'][i % 3]));
    const n = e.k === 'penguin' ? 4 : e.k === 'flamingo' ? 3 : 1;
    for (let k = 0; k < n; k++) { const an = animal(e.k); const off = n > 1 ? [(hash(i * 5 + k) - .5) * e.r * 1.0, (hash(i * 7 + k) - .5) * e.r * 1.0] : [0, 0];
      an.g.position.set(off[0], .06, off[1]); an.g.rotation.y = -e.a + Math.PI + (hash(i + k * 3) - .5) * .8; if (e.k === 'penguin' && k === 0) an.g.position.set(.8, .36, -.6); g.add(an.g); animals.push({ ...an, k: e.k, i, home: an.g.position.clone(), ry: an.g.rotation.y }); }
    P.add(g, x, 0, z, 3 + i * .6); e.pos = new THREE.Vector3(ZOO.x + x, 0, ZOO.z + z); });
  // garden lamps and round trees
  const lampM = mat('#FFF4D8', { emissive: '#FFD58A', emissiveIntensity: 0 });
  // the lamps stand on the grass between the path and the fences (radius 7.1), in the gaps between enclosures and either side of the entry
  for (const a of [-.2, .2, -1.05, 1.05, -2.1, 2.1, Math.PI - .2, Math.PI + .2]) { const l = new THREE.Group(); l.add(new THREE.Mesh(new THREE.CylinderGeometry(.04, .05, 1.4, 5).translate(0, .7, 0), mat('#EEE6F6'))); l.add(new THREE.Mesh(new THREE.SphereGeometry(.12, 8, 6).translate(0, 1.45, 0), lampM)); P.add(l, Math.sin(a) * 7.1, 0, Math.cos(a) * 7.1, 6); }
  for (let i = 0; i < 16; i++) { const a = hash(i * 4.4) * TAU, d = 14.5 + hash(i * 2.2) * 1.8; if (Math.abs(Math.atan2(Math.sin(a), Math.cos(a)) - Math.PI / 2) < .3) continue;
    if (ENCL.some(e => Math.hypot(Math.cos(a) * d - Math.sin(e.a) * e.d, Math.sin(a) * d - Math.cos(e.a) * e.d) < e.r + 1.3)) continue; const t = new THREE.Group();   // no tree inside a fence
    t.add(new THREE.Mesh(new THREE.CylinderGeometry(.12, .16, .9, 5).translate(0, .45, 0), mat('#B48A68'))); t.add(new THREE.Mesh(new THREE.IcosahedronGeometry(.95, 0).translate(0, 1.5, 0), mat(['#8FD3B8', '#9CC48A'][i % 2]))); P.add(t, Math.cos(a) * d, 0, Math.sin(a) * d, 7); }
  sh(root); lawn.castShadow = false;
  return { root, build: P.build, animals, gateM: zsM, lampM, gate: new THREE.Vector3(ZOO.x, 0, ZOO.z + ZOO.r - .3), night: k => { zsM.emissiveIntensity = .8 * k; lampM.emissiveIntensity = 2.2 * k; } };
}

// ---------- the animal hospital and the adoption corner: Distrik Fasilitas, on the west street's sidewalk (front at z = 15.7) ----------
export const VET = { x: -103, z: 11.9, w: 10, d: 7.5 };
export function makeVet() {
  const P = parts(), root = P.root; root.position.set(VET.x, 0, VET.z);
  const win = cityMat('#BFE6D6', { fh: 1.25, base: .35, sx: 1.2, box: [.22, .78, .24, .74], lit: .6 });
  P.add(new THREE.Mesh(new THREE.BoxGeometry(VET.w + .4, .18, VET.d + .4).translate(0, .09, 0), mat('#E6DED0')), 0, 0, 0, 0);
  P.add(new THREE.Mesh(new THREE.BoxGeometry(VET.w, 2.6, VET.d).translate(0, 1.3, 0), win), 0, .18, 0, 1);
  P.add(new THREE.Mesh(new THREE.BoxGeometry(VET.w, 2.4, VET.d).translate(0, 1.2, 0), mat('#FFF6E6')), 0, 2.78, 0, 3);
  P.add(new THREE.Mesh(new THREE.BoxGeometry(VET.w + .3, .2, VET.d + .3), mat('#8FD3B8')), 0, 5.28, 0, 4);
  // round windows shaped like paw prints on the upper floor, a canopy and doors on the ground floor
  const pawT = canvasTex(128, 128, (x, w, h) => { x.fillStyle = '#9FD0E8'; x.beginPath(); x.arc(64, 64, 62, 0, 7); x.fill(); x.fillStyle = '#FFF6E6';
    x.beginPath(); x.ellipse(64, 78, 24, 20, 0, 0, 7); x.fill(); for (const [px, py] of [[36, 50], [54, 38], [74, 38], [92, 50]]) { x.beginPath(); x.ellipse(px, py, 9, 11, 0, 0, 7); x.fill(); } });
  const pawM = new THREE.MeshStandardMaterial({ map: pawT, roughness: .3, emissive: '#FFCB7A', emissiveIntensity: 0, transparent: true });
  for (let k = 0; k < 4; k++) { const m = new THREE.Mesh(new THREE.CircleGeometry(.62, 24), pawM); P.add(m, -3.6 + k * 2.4, 4.0, VET.d / 2 + .02, 3); }
  P.add(new THREE.Mesh(new THREE.BoxGeometry(3.4, .12, 1.2), mat('#F2A0B4')), 0, 2.4, VET.d / 2 + .6, 2);
  P.add(new THREE.Mesh(new THREE.BoxGeometry(2.2, 2.0, .06), new THREE.MeshStandardMaterial({ color: '#BFE3F2', roughness: .15, metalness: .2 })), 0, 1.18, VET.d / 2 + .03, 2);
  const bb = billboard('RS HEWAN NETIZEN CITY', 7.4, 1.2, '#4E9A7C', '#A8DCC8'); P.add(bb.mesh, 0, 5.38 + .75, VET.d / 2 - .4, 5);
  // the adoption corner: a little pastel house with its board, and the fenced play yard
  const ad = new THREE.Group(); ad.add(new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.5, 2.0).translate(0, .75, 0), mat('#F7D772')));
  ad.add(new THREE.Mesh(new THREE.ConeGeometry(1.75, .8, 4).rotateY(Math.PI / 4).scale(1, 1, .9).translate(0, 1.9, 0), mat('#E58F72')));
  const at = signTex((x, v, w, h) => { x.fillStyle = '#FFF9F1'; x.fillRect(0, 0, w, h); x.strokeStyle = '#E58F72'; x.lineWidth = 12; x.strokeRect(6, 6, w - 12, h - 12);
    x.fillStyle = '#C46A4E'; x.font = '62px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('PUSAT ADOPSI 🐾', w / 2, h / 2 + 4); }, 640, 140); at.set(1);
  const atM = new THREE.MeshStandardMaterial({ map: at.t, roughness: .6, emissiveMap: at.t, emissive: '#FFFFFF', emissiveIntensity: 0 }); ad.add(new THREE.Mesh(new THREE.BoxGeometry(2.0, .44, .06), [mat('#E58F72'), mat('#E58F72'), mat('#E58F72'), mat('#E58F72'), atM, mat('#E58F72')]).translate(0, 1.15, 1.04));
  ad.add(new THREE.Mesh(new THREE.CircleGeometry(.4, 16, 0, Math.PI).translate(0, .02, 1.01), mat('#5A4A5A')));
  // on the hospital's own lot, west of it (metro.js clears the shops from x -118 to -67 on this row; the next shop ends at x -117.3):
  // the adoption house beside the hospital facing the sidewalk, the play yard with the exam table behind it to the west. The street
  // starts at x -97.5, so nothing stands east of the hospital any more.
  const AD = [-VET.w / 2 - 2.7, 2.0], YD = [-VET.w / 2 - 6.6, -.1];
  P.add(ad, AD[0], 0, AD[1], 6);
  const yard = pastelFence(2.3, 16, .5, '#A8DCC8'); P.add(yard, YD[0], 0, YD[1], 6);
  P.add(new THREE.Mesh(new THREE.CylinderGeometry(2.2, 2.2, .04, 24), mat('#B9DDA4', { roughness: 1 })), YD[0], .04, YD[1], 6);
  const table = new THREE.Group(); table.add(new THREE.Mesh(new THREE.BoxGeometry(.9, .06, .6).translate(0, .62, 0), mat('#FFFFFF'))); table.add(new THREE.Mesh(new THREE.CylinderGeometry(.06, .08, .6, 6).translate(0, .3, 0), mat('#B9B6C2')));
  P.add(table, YD[0], 0, YD[1] + .4, 6);
  sh(root);
  return { root, build: P.build, sign: bb.m, pawM, adM: atM, win, adopt: new THREE.Vector3(VET.x + AD[0], 0, VET.z + AD[1] + 1.3), table: new THREE.Vector3(VET.x + YD[0], .65, VET.z + YD[1] + .4),
    night: k => { bb.m.emissiveIntensity = .9 * k; pawM.emissiveIntensity = .6 * k; atM.emissiveIntensity = .7 * k; win.userData.U && (win.userData.U.uNight.value = k); } };
}

// ---------- the university: Distrik Riset, beside the lab (the rectorate's clock tower stays shorter than the Monument) ----------
export const UNI = { x: 58, z: -80 };
export function makeUni() {
  const P = parts(), root = P.root; root.position.set(UNI.x, 0, UNI.z);
  P.add(new THREE.Mesh(new THREE.BoxGeometry(34, .06, 34), mat('#E9DFCD', { roughness: .95 })), 0, .03, 0, 0);
  P.add(new THREE.Mesh(new THREE.BoxGeometry(14, .07, 12), mat('#A9D69A', { roughness: 1 })), 0, .05, 2, 0);      // the quad
  P.add(new THREE.Mesh(new THREE.BoxGeometry(3, .06, 22), mat('#E9DFCD', { roughness: .95 })), 0, .06, 7, 0);
  // the rectorate: lavender, three floors, the tall clock tower in the middle
  const lav = cityMat('#C9B8E8', { fh: 1.25, base: .35, sx: 1.1, box: [.2, .8, .24, .74], lit: .7 });
  P.add(new THREE.Mesh(new THREE.BoxGeometry(14, 4.2, 5).translate(0, 2.1, 0), lav), 0, 0, -10, 1);
  P.add(new THREE.Mesh(new THREE.BoxGeometry(14.4, .3, 5.4), mat('#B6A4D8')), 0, 4.35, -10, 2);
  const clockT = signTex((x, v, w, h) => { x.fillStyle = '#FFFBF2'; x.beginPath(); x.arc(w / 2, h / 2, w / 2 - 4, 0, 7); x.fill(); x.lineWidth = 12; x.strokeStyle = '#B6A4D8'; x.stroke();
    x.fillStyle = '#4B3A36'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; x.beginPath(); x.arc(w / 2 + Math.cos(a) * w * .36, h / 2 + Math.sin(a) * h * .36, 6, 0, 7); x.fill(); }
    const hand = (a, L, lw) => { x.lineWidth = lw; x.lineCap = 'round'; x.strokeStyle = '#4B3A36'; x.beginPath(); x.moveTo(w / 2, h / 2); x.lineTo(w / 2 + Math.sin(a) * L, h / 2 - Math.cos(a) * L); x.stroke(); };
    hand(v / 720 * 6.283, w * .22, 12); hand((v % 60) / 60 * 6.283, w * .33, 7); }, 256, 256); clockT.set(8 * 60);
  const tw = new THREE.Group(); tw.add(new THREE.Mesh(new THREE.BoxGeometry(3, 13, 3).translate(0, 6.5, 0), mat('#D8CCEE'))); tw.add(new THREE.Mesh(new THREE.BoxGeometry(3.4, .3, 3.4).translate(0, 13.1, 0), mat('#B6A4D8')));
  tw.add(new THREE.Mesh(new THREE.ConeGeometry(2.4, 3.2, 4).rotateY(Math.PI / 4).translate(0, 14.85, 0), mat('#8C7FB8')));
  const clockM = new THREE.MeshStandardMaterial({ map: clockT.t, roughness: .6, emissiveMap: clockT.t, emissive: '#FFFFFF', emissiveIntensity: 0 });
  for (let k = 0; k < 4; k++) { const f = new THREE.Mesh(new THREE.CircleGeometry(1.15, 32), clockM); f.position.set(Math.sin(k * Math.PI / 2) * 1.52, 11.0, Math.cos(k * Math.PI / 2) * 1.52); f.rotation.y = k * Math.PI / 2; tw.add(f); }
  const bell = new THREE.Mesh(new THREE.CylinderGeometry(.35, .55, .6, 12).translate(0, 12.3, 0), mat('#E6B64C', { metalness: .6, roughness: .3 })); tw.add(bell);
  P.add(tw, 0, 0, -10, 2);
  const rb = billboard('UNIVERSITAS NETIZEN CITY', 8, 1.0, '#7A5BB0', '#C9B8E8'); P.add(rb.mesh, -1.0, 4.9, -7.2, 3);
  // three faculty buildings round the quad (butter, mint, peach) and the graduation hall with its arched roof
  [[-11, 2, '#F7D772'], [11, 2, '#A8DCC8'], [-11, 11, '#F4A98C']].forEach(([x, z, c], i) => { const m = cityMat(c, { fh: 1.25, base: .35, sx: 1.1, box: [.2, .8, .24, .74], lit: .7 });
    P.add(new THREE.Mesh(new THREE.BoxGeometry(5, 3.4, 7).translate(0, 1.7, 0), m), x, 0, z, 3 + i); P.add(new THREE.Mesh(new THREE.BoxGeometry(5.3, .25, 7.3), mat('#FFF6E6')), x, 3.52, z, 4 + i); });
  const hall = new THREE.Group(); hall.add(new THREE.Mesh(new THREE.BoxGeometry(7, 3, 6).translate(0, 1.5, 0), mat('#FFF6E6')));
  hall.add(new THREE.Mesh(new THREE.CylinderGeometry(3.5, 3.5, 6.2, 24, 1, false, -Math.PI / 2, Math.PI).rotateX(Math.PI / 2).rotateY(Math.PI / 2).scale(1, .55, 1).translate(0, 3, 0), mat('#F2B8C6')));
  hall.add(new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, .1).translate(0, 1.1, 3.02), mat('#BFE3F2', { roughness: .15 })));
  const hs = signTex((x, v, w, h) => { x.fillStyle = '#FFF9F1'; x.fillRect(0, 0, w, h); x.fillStyle = '#C46A8A'; x.font = '60px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('AULA WISUDA', w / 2, h / 2 + 4); }, 512, 110); hs.set(1);
  hall.add(new THREE.Mesh(new THREE.BoxGeometry(3.2, .7, .08), [mat('#F2B8C6'), mat('#F2B8C6'), mat('#F2B8C6'), mat('#F2B8C6'), new THREE.MeshStandardMaterial({ map: hs.t, roughness: .6 }), mat('#F2B8C6')]).translate(0, 2.65, 3.06));
  P.add(hall, 11, 0, 11, 6);
  // the campus gate on the south side, toward the city
  const gate = new THREE.Group(); for (const s of [-1, 1]) gate.add(new THREE.Mesh(new THREE.BoxGeometry(.7, 3.2, .7).translate(s * 2.4, 1.6, 0), mat('#D8CCEE')));
  const gs = signTex((x, v, w, h) => { x.fillStyle = '#FFF4DA'; x.fillRect(0, 0, w, h); x.strokeStyle = '#B6A4D8'; x.lineWidth = 12; x.strokeRect(6, 6, w - 12, h - 12); x.fillStyle = '#7A5BB0'; x.font = '50px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('UNIVERSITAS NETIZEN CITY', w / 2, h / 2 + 4); }, 900, 120); gs.set(1);
  const gsM = new THREE.MeshStandardMaterial({ map: gs.t, roughness: .6, emissiveMap: gs.t, emissive: '#FFFFFF', emissiveIntensity: 0 });
  gate.add(new THREE.Mesh(new THREE.BoxGeometry(5.6, .75, .25), [mat('#B6A4D8'), mat('#B6A4D8'), mat('#B6A4D8'), mat('#B6A4D8'), gsM, mat('#B6A4D8')]).translate(0, 3.2, 0));
  P.add(gate, 0, 0, 16.5, 7);
  for (let i = 0; i < 8; i++) { const t = new THREE.Group(); t.add(new THREE.Mesh(new THREE.CylinderGeometry(.14, .18, 1.0, 5).translate(0, .5, 0), mat('#B48A68'))); t.add(new THREE.Mesh(new THREE.IcosahedronGeometry(1.0, 0).translate(0, 1.6, 0), mat(['#8FD3B8', '#9CC48A'][i % 2])));
    P.add(t, (i % 2 ? 1 : -1) * 6.2, 0, -2.5 + Math.floor(i / 2) * 3.4, 7); }
  sh(root);
  return { root, build: P.build, clock: clockT, clockM, bell, sign: rb.m, gateM: gsM, mats: [lav], hall: new THREE.Vector3(UNI.x + 11, 0, UNI.z + 11 + 3.6), front: new THREE.Vector3(UNI.x, 0, UNI.z - 7.0), gatePos: new THREE.Vector3(UNI.x, 0, UNI.z + 16.5),
    night: k => { rb.m.emissiveIntensity = .9 * k; gsM.emissiveIntensity = .8 * k; clockM.emissiveIntensity = .7 * k; lav.userData.U && (lav.userData.U.uNight.value = k); } };
}

