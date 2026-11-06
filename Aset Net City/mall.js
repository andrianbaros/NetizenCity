// Day 6: @ill_luvv's Netizen Mall on the commercial avenue: four floors right on the sidewalk, a pastel glass front in cream frames,
// a tall atrium whose escalators show through the glass, a lobby canopy, automatic doors, parking at the side and the
// NETIZEN MALL billboard on the roof (the same family as the RS / POLISI / DAMKAR signs). Also the Mayor's tower of shopping bags.
import * as THREE from 'three';
import { mulberry, clamp, seg, back, eo, hash } from '/core/lib.js';
import { signTex } from './world.js';
import { cityMat } from './metro.js';

const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .78, metalness: 0, flatShading: true, ...o });
const sh = m => { m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return m; };
const pop = (k, t0, d = .22) => k < t0 ? 0 : back(seg(k, t0, t0 + d), 2.2);
// where it stands: the north-west corner of the crossing where the deer was found, its front on the avenue's sidewalk (facing south)
export const MALL = { x: -55.4, z: -13.1, w: 13, d: 10, rot: 0 };
export const MALL_DOOR = new THREE.Vector3(MALL.x, 0, MALL.z + MALL.d / 2 + .1);
const G0 = 1.9, FH = 1.25, NF = 3, TOP = G0 + NF * FH;                    // ground floor tall enough for the Mayor's hat; three more floors

function glassTex(cols) {                                                  // pastel glass panels in cream frames, one floor high per row
  const c = document.createElement('canvas'); c.width = 512; c.height = 256; const x = c.getContext('2d'), R = mulberry(14);
  x.fillStyle = '#FFF4E2'; x.fillRect(0, 0, 512, 256);
  for (let j = 0; j < 2; j++) for (let i = 0; i < 4; i++) { const g = x.createLinearGradient(0, j * 128, 0, j * 128 + 128); const base = cols[Math.floor(R() * cols.length)];
    g.addColorStop(0, base); g.addColorStop(1, '#F7FBFF'); x.fillStyle = g; x.fillRect(i * 128 + 9, j * 128 + 9, 110, 110);
    x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.moveTo(i * 128 + 20, j * 128 + 108); x.lineTo(i * 128 + 60, j * 128 + 20); x.lineTo(i * 128 + 74, j * 128 + 20); x.lineTo(i * 128 + 34, j * 128 + 108); x.fill(); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8; return t;
}
function billboard(text) {
  const s = signTex((x, v, w, h) => { x.fillStyle = '#FFF9F1'; x.fillRect(0, 0, w, h); x.strokeStyle = '#F2A0B4'; x.lineWidth = 16; x.strokeRect(8, 8, w - 16, h - 16);
    // a little shopping bag before the name
    x.fillStyle = '#F2A88A'; x.beginPath(); x.roundRect(60, h / 2 - 34, 70, 74, 10); x.fill(); x.strokeStyle = '#E58F72'; x.lineWidth = 8; x.beginPath(); x.arc(95, h / 2 - 34, 20, Math.PI, 0); x.stroke();
    let size = Math.round(h * .6); x.font = `${size}px "Lilita One"`; while (x.measureText(text).width > w - 260 && size > 20) { size -= 2; x.font = `${size}px "Lilita One"`; }
    x.fillStyle = '#D9677F'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(text, w / 2 + 50, h / 2 + 6); }, 1024, 205);
  s.set(1); return new THREE.MeshStandardMaterial({ map: s.t, roughness: .6, emissiveMap: s.t, emissive: '#FFFFFF', emissiveIntensity: 0 });
}

export function makeMall() {
  const root = new THREE.Group(), parts = [], add = (m, x = 0, y = 0, z = 0, order = 0) => { m.position.set(x, y, z); const p = new THREE.Group(); p.add(m); p.userData.order = order; root.add(p); parts.push(p); return m; };
  const { w: W, d: D } = MALL, cream = mat('#FFF4E2'), frame = mat('#F4E6CF');
  const wall = cityMat('#FBEFE0', { fh: FH, base: G0, sx: 1.1, box: [.18, .82, .25, .75], glass: '#B9CFE6', lit: .7 });
  const glass = glassTex(['#BFE6D6', '#D8CCEE', '#F7D4DC', '#BFD6EE', '#FFE2C2']);
  const front = (w, h) => { const t = glass.clone(); t.needsUpdate = true; t.repeat.set(w / 2.6, h / (FH * 2)); return new THREE.MeshStandardMaterial({ map: t, roughness: .25, metalness: .1, emissive: '#FFD9A0', emissiveIntensity: 0 }); };
  const fronts = [];
  // the plinth, then the two wings either side of the atrium, floor by floor
  add(new THREE.Mesh(new THREE.BoxGeometry(W + .6, .18, D + .6).translate(0, .09, 0), mat('#E9DFCD')), 0, 0, 0, 0);
  const AW = 4.2, WW = (W - AW) / 2;
  for (const s of [-1, 1]) {
    const cx = s * (AW / 2 + WW / 2);
    add(new THREE.Mesh(new THREE.BoxGeometry(WW, G0, D).translate(0, G0 / 2, 0), wall), cx, .18, 0, 1);
    const fm = front(WW - .3, G0 - .5); fronts.push(fm); add(new THREE.Mesh(new THREE.PlaneGeometry(WW - .3, G0 - .5), fm), cx, .18 + G0 / 2 + .05, D / 2 + .02, 1);
    for (let f = 0; f < NF; f++) {
      add(new THREE.Mesh(new THREE.BoxGeometry(WW, FH, D).translate(0, FH / 2, 0), wall), cx, .18 + G0 + f * FH, 0, 2 + f);
      const g2 = front(WW - .3, FH - .25); fronts.push(g2); add(new THREE.Mesh(new THREE.PlaneGeometry(WW - .3, FH - .25), g2), cx, .18 + G0 + f * FH + FH / 2, D / 2 + .02, 2 + f);
      add(new THREE.Mesh(new THREE.BoxGeometry(WW + .1, .12, .2), frame), cx, .18 + G0 + f * FH, D / 2 + .08, 2 + f);
    }
  }
  // the atrium: a tall glass box with the escalators criss-crossing inside it, lit warm
  const inside = mat('#FFF8EE', { emissive: '#FFE6C0', emissiveIntensity: .25 });
  add(new THREE.Mesh(new THREE.BoxGeometry(AW, TOP, .2).translate(0, TOP / 2, 0), inside), 0, .18, -D / 2 + 1.5, 1);
  for (let f = 1; f <= NF; f++) add(new THREE.Mesh(new THREE.BoxGeometry(AW, .14, 2.2), mat('#F2E4CF')), 0, .18 + G0 + (f - 1) * FH, -D / 2 + 2.6, 1 + f);
  const escM = mat('#B9C2D0', { metalness: .3, roughness: .4 }), railM = mat('#7FD0C0', { roughness: .3 });
  for (let f = 0; f < NF; f++) { const y0 = f ? G0 + (f - 1) * FH : 0, y1 = G0 + f * FH, dir = f % 2 ? 1 : -1, run = 2.6, L = Math.hypot(run, y1 - y0), a = Math.atan2(y1 - y0, run);
    const e = new THREE.Group(); const deck = new THREE.Mesh(new THREE.BoxGeometry(L, .12, .6), escM); e.add(deck);
    for (const z of [-.32, .32]) { const r = new THREE.Mesh(new THREE.BoxGeometry(L, .1, .06), railM); r.position.set(0, .42, z); e.add(r); const sd = new THREE.Mesh(new THREE.BoxGeometry(L, .4, .04), mat('#E4F4F0', { transparent: true, opacity: .6 })); sd.position.set(0, .22, z); e.add(sd); }
    e.rotation.z = a * dir; add(e, dir * -.0, .18 + (y0 + y1) / 2, -D / 2 + 2.3 + (f % 2) * .9, 1 + f); }
  const atriumGlass = new THREE.MeshStandardMaterial({ color: '#DDEFF6', roughness: .05, metalness: .2, transparent: true, opacity: .28, depthWrite: false });
  add(new THREE.Mesh(new THREE.PlaneGeometry(AW, TOP - G0 + .1), atriumGlass), 0, .18 + G0 + (TOP - G0) / 2, D / 2 - .02, 4);
  for (let f = 0; f <= NF; f++) add(new THREE.Mesh(new THREE.BoxGeometry(AW + .1, .1, .14), frame), 0, .18 + G0 + f * FH - .05, D / 2, 4);
  for (const s of [-1, 0, 1]) add(new THREE.Mesh(new THREE.BoxGeometry(.1, TOP - G0, .14), frame), s * AW / 2, .18 + G0 + (TOP - G0) / 2, D / 2, 4);
  // the roof: a cream parapet, a mint cap band
  add(new THREE.Mesh(new THREE.BoxGeometry(W + .2, .35, D + .2).translate(0, .175, 0), cream), 0, .18 + TOP, 0, 5);
  add(new THREE.Mesh(new THREE.BoxGeometry(W + .3, .12, D + .3), mat('#A8DCC8')), 0, .18 + TOP + .35, 0, 5);
  // the lobby: a glass wall at the back of the entrance, automatic doors, the canopy on two posts
  const doorGlass = new THREE.MeshStandardMaterial({ color: '#CFE6F2', roughness: .05, metalness: .2, transparent: true, opacity: .5 });
  add(new THREE.Mesh(new THREE.PlaneGeometry(AW, G0 - .1), new THREE.MeshStandardMaterial({ color: '#FFE9CC', emissive: '#FFD9A6', emissiveIntensity: .3 })), 0, .18 + (G0 - .1) / 2, D / 2 - .8, 1);
  const doorFr = mat('#8C97A8', { roughness: .4, metalness: .3 });
  const doors = [-1, 1].map(s => { const d = new THREE.Mesh(new THREE.BoxGeometry(.9, 1.7, .05), doorGlass); for (const [w, h, x, y] of [[.94, .07, 0, .85], [.94, .07, 0, -.85], [.07, 1.74, -.45, 0], [.07, 1.74, .45, 0]]) { const fr = new THREE.Mesh(new THREE.BoxGeometry(w, h, .07), doorFr); fr.position.set(x, y, 0); d.add(fr); }
    const h = new THREE.Mesh(new THREE.BoxGeometry(.05, .5, .1), doorFr); h.position.set(s * -.36, 0, .05); d.add(h); return d; });
  const doorG = new THREE.Group(); doorG.position.set(0, .18 + .85, D / 2 + .03); doors.forEach(d => doorG.add(d)); const dp = new THREE.Group(); dp.add(doorG); root.add(dp); parts.push(dp); dp.userData.order = 1;
  add(new THREE.Mesh(new THREE.BoxGeometry(AW + 1.6, .16, 1.9), mat('#A8DCC8')), 0, .18 + G0 + .05, D / 2 + .95, 2);
  for (const s of [-1, 1]) add(new THREE.Mesh(new THREE.CylinderGeometry(.06, .06, G0, 6).translate(0, G0 / 2, 0), mat('#FFFFFF')), s * (AW / 2 + .5), .18, D / 2 + 1.75, 2);
  const fascia = signTex((x, v, w, h) => { x.fillStyle = '#F2A0B4'; x.fillRect(0, 0, w, h); x.fillStyle = '#FFF9F1'; x.font = `${Math.round(h * .62)}px "Lilita One"`; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('NETIZEN MALL', w / 2, h / 2 + 4); }, 512, 64); fascia.set(1);
  add(new THREE.Mesh(new THREE.BoxGeometry(AW + 1.0, .42, .06), [mat('#F2A0B4'), mat('#F2A0B4'), mat('#F2A0B4'), mat('#F2A0B4'), new THREE.MeshStandardMaterial({ map: fascia.t, roughness: .6 }), mat('#F2A0B4')]), 0, .18 + G0 + .34, D / 2 + 1.88, 2);
  // the billboard on the roof
  const signM = billboard('NETIZEN MALL'), side = mat('#F2A0B4');
  for (const x of [-2.8, 2.8]) add(new THREE.Mesh(new THREE.BoxGeometry(.16, 1.2, .16).translate(0, .6, 0), mat('#C9CED6')), x, .18 + TOP + .35, D / 2 - 1.2, 6);
  add(new THREE.Mesh(new THREE.BoxGeometry(7.2, 1.45, .16), [side, side, side, side, signM, side]), 0, .18 + TOP + 1.85, D / 2 - 1.2, 6);
  // parking at the west side: a lot, lines, a few toy cars
  const lot = add(new THREE.Mesh(new THREE.BoxGeometry(8.6, .06, 7.4), mat('#B9C0CC', { roughness: .95 })), -W / 2 - 4.7, .03, 1.2, 0);
  for (let k = 0; k < 5; k++) add(new THREE.Mesh(new THREE.BoxGeometry(.07, .065, 2.6), mat('#FFFFFF')), -W / 2 - 8.4 + k * 1.85, .035, -.4, 0);
  const cc = ['#F2A88A', '#A9C8EC', '#F7D772', '#C4B3E3'];
  for (let k = 0; k < 4; k++) { const car = new THREE.Group(); const b = new THREE.Mesh(new THREE.BoxGeometry(.55, .32, 1.1).translate(0, .3, 0), mat(cc[k], { roughness: .45 })); car.add(b);
    const cab = new THREE.Mesh(new THREE.BoxGeometry(.5, .26, .6).translate(0, .58, -.06), mat('#5A6680', { roughness: .3 })); car.add(cab); if (k !== 2) add(car, -W / 2 - 7.5 + k * 1.85, .06, -.4, 7); }
  sh(root); root.position.set(MALL.x, 0, MALL.z);
  const mall = { root, parts, doors, signM, fronts, wall, lot };
  // k: the build (0..1); open: the doors (0 shut .. 1 open)
  mall.build = k => { root.visible = k > 0; parts.forEach(p => { const o = p.userData.order, u = pop(k, o / 8 * .85, .2); p.visible = u > 0; p.scale.set(1, Math.max(.001, u), 1); }); };
  mall.open = u => { doors[0].position.x = -.45 - .85 * u; doors[1].position.x = .45 + .85 * u; };
  mall.night = k => { signM.emissiveIntensity = 1.0 * k; wall.userData.U.uNight.value = k; fronts.forEach(m => m.emissiveIntensity = .35 * k); };
  mall.open(0);
  return mall;
}

// the shopping bags: a pastel tower on top of the Mayor's hat; each one leans a little more than the one under it
export function makeBags() {
  const root = new THREE.Group(), R = mulberry(23), cols = ['#F2B8C6', '#A8DCC8', '#F7D772', '#C9B8E8', '#A9C8EC', '#F2A88A', '#FFF4E2', '#F6C28B'], list = [];
  let y = 0;
  for (let i = 0; i < 8; i++) { const w = .36 + R() * .18, h = .26 + R() * .14, d = .18 + R() * .08, g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d).translate(0, h / 2, 0), mat(cols[i], { roughness: .7 })); g.add(b);
    const hd = new THREE.Mesh(new THREE.TorusGeometry(w * .22, .012, 4, 10, Math.PI), mat('#5A5560')); hd.position.y = h; g.add(hd);
    const label = new THREE.Mesh(new THREE.BoxGeometry(w * .45, h * .3, .005), mat('#FFFFFF')); label.position.set(0, h * .55, d / 2 + .003); g.add(label);
    g.position.y = y; g.userData = { y, h, rz: (R() - .5) * .2, ry: (R() - .5) * .8 }; root.add(g); list.push(g); y += h + .01; }
  sh(root);
  return { root, list, H: y, wobble(t, amp) { list.forEach((g, i) => { const k = i / list.length; g.rotation.z = g.userData.rz + amp * k * Math.sin(t * 9 - i * .5); g.rotation.y = g.userData.ry; g.position.x = amp * k * k * .35 * Math.sin(t * 9 - i * .6); }); } };
}
