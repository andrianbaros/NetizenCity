// NetizenCity.id — Day 7. Every frame is a function of t (seconds); cues come from timeline.json.
// A clarification press conference in front of the Kantor Mayor ("Netizen City lagi darurat kas"); Day 7's hook; 49.000, a thousand
// to the festival. Yesterday: three requests stamped DISETUJUI in the office; the library, the airport, the harbour with its lighthouse
// and the sports complex built at full size (x24). Night: the cash box opens on a moth and one coin, the calculator prints an endless
// receipt; instant noodles under the desk lamp. Morning: the podium again, the board flips (DICARI: INVESTOR KOTA!), the Prasasti,
// the game; 1 repost = Rp1 juta of toy city budget. CTA, the tagline, the city at night (runway lights, floodlights, the lighthouse),
// the Monument last.
import * as THREE from 'three';
import { makePost } from '/core/three/post.js';
import { clamp, lerp, seg, ss, eio, eo, ei, back, track, hash, mulberry } from '/core/lib.js';
import { buildWorld, PAL, signTex, makeMayor, makeGate, makeOffice, makePuffs } from './world.js';
import { buildCity, makeCrowd } from './city.js';
import { buildMetro, RAIL_Z } from './metro.js';
import { makeMountain, makeRiver, makeBeach, makeMistBelt, makeCapsule } from './nature.js';
import { MT, INLAND, ALONG } from './land.js';
import { makeForest, makeFireflies } from './forest.js';
import { makeMall } from './mall.js';
import { makeLibrary, makeAirport, makePort, makeSports, makePodium, makePressCam, makeRoom, makeStamp, makePrasasti, LIB, AIR, PORT, SPORT, ROOM, PRAS, seatAt } from './day7.js';
import { makeUI } from './ui.js';

const Q = new URLSearchParams(location.search);
const W = innerWidth, H = innerHeight, SS = +(Q.get('ss') || 2);
const TL = await (await fetch('timeline.json')).json();
const C = TL.cue;
window.DUR = TL.dur;
await Promise.all(['600 40px Fredoka', '700 40px Fredoka', '40px "Lilita One"', '40px "IM Fell English"'].map(f => document.fonts.load(f)));

// ---------- renderer, scene, post ----------
const gl = document.getElementById('gl');
const renderer = new THREE.WebGLRenderer({ canvas: gl, antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(SS); renderer.setSize(W, H);
renderer.toneMapping = THREE.NeutralToneMapping; renderer.toneMappingExposure = 1.0;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#F4E6D4', 260, 900);
const camera = new THREE.PerspectiveCamera(36, W / H, .1, 3200);
const { clouds } = buildWorld(scene);
const cloudM = clouds.children[0].children[0].material;
const sky = scene.children[0].material.uniforms;
const hemi = new THREE.HemisphereLight('#D3E8FF', '#EAD6B4', 1.05); scene.add(hemi);
const sun = new THREE.DirectionalLight('#FFF0D8', 2.5); sun.castShadow = !Q.has('noshadow');
sun.shadow.mapSize.set(4096, 4096); sun.shadow.bias = -0.0004; sun.shadow.normalBias = .03; scene.add(sun, sun.target);
const moon = new THREE.DirectionalLight('#9FB4FF', 0); moon.position.set(-40, 80, 30); scene.add(moon);
const post = makePost(renderer, scene, camera, W, H, { ssaa: SS, ao: !Q.has('noao'), aoRadius: .5, aoScale: 1.6, aoAmt: .7 });
// see-through things (the mist round the mountain, the fireflies, the lighthouse beam, the flashes) must not darken the ambient-occlusion pass
const noAO = [];
{ const ao = post.dof.ao; if (ao) { const ov = ao.overrideVisibility.bind(ao); ao.overrideVisibility = () => { ov(); noAO.forEach(o => o.visible = false); }; } }
const vu = post.vig.uniforms; vu.amt.value = .3; vu.sat.value = 1.42; vu.contrast.value = .3; vu.warm.value = .25;
post.bloom.strength = .12;
const stars = (() => { const R = mulberry(31), p = []; for (let i = 0; i < 500; i++) { const a = R() * 6.283, e = .15 + R() * 1.3; p.push(Math.cos(a) * Math.cos(e) * 900, Math.sin(e) * 900, Math.sin(a) * Math.cos(e) * 900); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  const m = new THREE.PointsMaterial({ color: '#FFF6E0', size: 3.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  const s = new THREE.Points(g, m); scene.add(s); return s; })();

// ---------- the gate's board: one plank, two centred lines (the population, the status), lit at night ----------
const boardText = v => v === 'night' ? 'POPULASI: 49.001 → ?' : String(v).startsWith('spin') ? `POPULASI: ${(+v.slice(4)).toLocaleString('id-ID')}` : v === 'p45' ? 'POPULASI: 45.001' : 'POPULASI: 49.001';
const board = signTex((x, v, w, h) => {
  x.fillStyle = '#FFF4DA'; x.fillRect(0, 0, w, h); x.strokeStyle = '#D9A877'; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14);
  const txt = boardText(v); let size = 66; x.font = `${size}px "Lilita One"`;
  while (x.measureText(v === 'night' ? txt : 'POPULASI: 49.001').width > w - 70 && size > 30) { size -= 2; x.font = `${size}px "Lilita One"`; }
  x.fillStyle = '#4B3A36'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, w / 2, h * .4);
  x.fillStyle = '#5FA88A'; x.font = '44px "Lilita One"'; x.fillText('KOTA', w / 2, h * .76);
}, 640, 200);
board.set('p45');
const clock = signTex((x, v, w, h) => {
  x.fillStyle = '#FFFBF2'; x.beginPath(); x.arc(w / 2, h / 2, w / 2 - 4, 0, 7); x.fill();
  x.lineWidth = 10; x.strokeStyle = '#E58F72'; x.stroke();
  x.fillStyle = '#4B3A36'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; x.beginPath(); x.arc(w / 2 + Math.cos(a) * w * .36, h / 2 + Math.sin(a) * h * .36, 5, 0, 7); x.fill(); }
  const hand = (a, L, lw) => { x.lineWidth = lw; x.lineCap = 'round'; x.strokeStyle = '#4B3A36'; x.beginPath(); x.moveTo(w / 2, h / 2); x.lineTo(w / 2 + Math.sin(a) * L, h / 2 - Math.cos(a) * L); x.stroke(); };
  hand(v / 720 * 6.283, w * .22, 12); hand((v % 60) / 60 * 6.283, w * .33, 7);
}, 256, 256);
clock.set(8 * 60);
const kantorSign = signTex((x, v, w, h) => { x.fillStyle = '#F2A88A'; x.fillRect(0, 0, w, h); x.fillStyle = '#FFF7EA'; x.font = '62px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('KANTOR MAYOR', w / 2, h / 2 + 4); }, 512, 110);
kantorSign.set(1);

const GATE_Z = 27.6;
const mayor = makeMayor(); scene.add(mayor.root);
const gate = makeGate(board); gate.root.position.set(0, 0, GATE_Z); scene.add(gate.root);
const plate = gate.hang.children.find(c => c.isMesh && Array.isArray(c.material));
const boardMat = plate.material[4];
boardMat.emissiveMap = board.t; boardMat.emissive = new THREE.Color('#FFE7B0'); boardMat.emissiveIntensity = 0;
const office = makeOffice(clock); office.root.position.set(0, 0, 9.3); scene.add(office.root);
{ const s = new THREE.Mesh(new THREE.BoxGeometry(1.5, .32, .05), new THREE.MeshStandardMaterial({ map: kantorSign.t, roughness: .7 })); s.position.set(0, 1.62, 1.24); s.castShadow = true; office.root.add(s); }
const officeWin = []; office.root.traverse(o => { if (o.isMesh && o.material.color && o.material.color.getHexString() === '9fd0e8') { o.material = o.material.clone(); o.material.emissive = new THREE.Color('#FFCB7A'); officeWin.push(o.material); } });

// Kampung Angkatan 1 and the city of Days 3-6, all standing; the Monument stands for good
const K2 = { infill: true, S3: -100, S6: -100, S7: -100, S8: -100, pohon: -100, lampu: -100, modern: -100, ruko: -100, lapangan: -100, atSchool: -100, rolldoor: -100, lights: C.lights + .95 };
const town = buildCity(scene, K2); town.ball.visible = false; town.rollers.forEach(r => r.visible = false);
const metro = buildMetro(scene, { ...C, grow: -100 });
metro.buildWorship(9); metro.buildParts(metro.hosp, 9); metro.buildParts(metro.police, 9); metro.buildParts(metro.fire, 9);
metro.fire.doors.forEach(d => d.scale.y = 1);
metro.myst.root.visible = false; metro.northCrane.root.visible = false; metro.amb.visible = false;
metro.monument.root.visible = metro.mpark.root.visible = metro.promenade.visible = true; (metro.promenadeTrees || []).forEach(o => o.visible = true);
metro.mpark.jets.children.forEach(j => j.scale.y = .85);
metro.cranes.forEach(k => k.root.visible = false); metro.trucks.forEach(k => k.root.visible = false);

// ---------- the west (Days 5-6) and the mall (Day 6), standing ----------
const mtn = makeMountain(); scene.add(mtn.root);
const river = makeRiver(RAIL_Z); scene.add(river.root);
const beach = makeBeach(); scene.add(beach.root);
beach.ribbon.forEach(r => r.visible = false); beach.gate.userData.bow.visible = false;
const belt = makeMistBelt(); scene.add(belt.root); noAO.push(belt.root);
const forest = makeForest(); scene.add(forest.root); forest.grow(1, 0);
const flies = makeFireflies(forest); scene.add(flies.root); noAO.push(flies.root);
const mall = makeMall(); scene.add(mall.root); mall.build(1);

// ---------- Day 7: the requests, built on the time-lapse clock of scene 5 ----------
const library = makeLibrary(); scene.add(library.root);
const airport = makeAirport(); scene.add(airport.root);
const port = makePort(); scene.add(port.root); noAO.push(port.beam);
const sports = makeSports(); scene.add(sports.root);
const prasasti = makePrasasti(); scene.add(prasasti);
// ---------- the props: the podium and the reporters; the office interior; the stamp ----------
const podium = makePodium(); podium.root.position.set(0, 0, 12.05); scene.add(podium.root);
const room = makeRoom(); scene.add(room.root); room.root.updateMatrixWorld(true);   // its places are used before the first frame
const stamp = makeStamp(); stamp.position.set(.32, .42, .12); stamp.rotation.z = .25; mayor.body.add(stamp);
const steam = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'), g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64);
  const tex = new THREE.CanvasTexture(c), root = new THREE.Group(), list = Array.from({ length: 7 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 })); root.add(s); return s; }); scene.add(root); noAO.push(root); return { root, list }; })();
const REP = Array.from({ length: 12 }, (_, i) => { const row = Math.floor(i / 6), k = i % 6, side = k < 3 ? -1 : 1, x = side * (1.55 + (k % 3) * .95 + row * .45), z = 14.6 + row * 1.1 + (k % 3) * .25;   // two groups, the aisle to the podium kept clear
  const c = makeCapsule(['#F2B8C6', '#A9C8EC', '#F7DD8C', '#C9B8E8', '#F6C28B', '#9EC9E8'][(i * 5) % 6]), cam = makePressCam();
  cam.root.position.set(0, .7 + (row ? .25 : 0), .32); cam.root.rotation.x = row ? .15 : 0; c.body.add(cam.root); c.root.position.set(x, 0, z); c.root.rotation.y = Math.atan2(-x, 12 - z); scene.add(c.root);
  noAO.push(cam.flash); return { ...c, cam, x, z, ph: hash(i * 3.7) }; });

// ---------- the crowd: the city's sidewalks; fans in the stands; a few readers in the library garden ----------
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const SPOTS = metro.walkSpots();
const big = makeCrowd(scene, SPOTS.length);
{ const cols = ['#F2A88A', '#F2B8C6', '#A9C8EC', '#C9B8E8', '#F7DD8C', '#E8B4A0', '#F6C28B', '#B5C4E8', '#E9A7D0', '#9EC9E8', '#FFD1A6', '#D7B8E0'], Rc = mulberry(808);
  for (let i = 0; i < SPOTS.length; i++) big.setColor(i, cols[Math.floor(Rc() * cols.length)]); }
const SEATS = []; for (let k = 0; k < 4; k++) for (let i = 0; i < 120; i++) { const th = (i + .5 * (k % 2)) / 120 * Math.PI * 2; SEATS.push({ p: seatAt(k, th), th, k, t: hash(i * 7.3 + k) }); }
const fans = makeCrowd(scene, SEATS.length);
const READ = [[-2.0, -.6], [-2.0, .9], [-1.2, 2.2], [-.6, -1.9], [.4, .4]].map(([dx, dz]) => library.garden.clone().add(V3(dx, 0, dz)));
const readers = makeCrowd(scene, READ.length + 6);

// ---------- helpers ----------
const tw8 = (t, c0) => c0 + Math.floor(Math.max(0, t - c0) * 8) / 8;
const lerpAng = (a, b, k) => { let d = (b - a) % (2 * Math.PI); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; return a + d * k; };
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
function hopShape(t, t0, d) {
  const a = (t - t0 + .12) / .12, u = (t - t0) / d, l = (t - t0 - d) / .22;
  if (a >= 0 && a < 1 && t < t0) return [1.12, .84];
  if (u >= 0 && u < 1) { const s = 1 + .14 * Math.sin(Math.PI * u); return [1 / Math.sqrt(s), s]; }
  if (l >= 0 && l < 1) { const k = Math.sin(Math.PI * l) * (1 - l) * .9; return [1 + .2 * k, 1 - .26 * k]; }
  return [1, 1];
}
const scene_ = t => t < C.S2 ? 'press' : t < C.S3 ? 'drone' : t < C.S4 ? 'reel' : t < C.S5 ? 'office' : t < C.S6 ? 'tl' : t < C.S7 ? 'vault' : t < C.S8 ? 'noodle' : t < C.S9 ? 'invest' : t < C.S10 ? 'cta' : 'outro';
const sub = t => t < C.air ? 'lib' : t < C.port ? 'air' : t < C.sport ? 'port' : 'sport';           // the four shots of the time-lapse
const R = p => room.root.localToWorld(p.clone());                                                   // a place in the office set
const SAFE = V3(-2.6, 0, .3), SF = V3(1, 0, 0), SR = V3(0, 0, -1);                                // the cash box by the left wall, its front (+x) and its right side (in the set)
const BEHIND = V3(0, .3, -1.55), SAFE_AT = V3(-1.5, 0, .05);                                       // the Mayor behind the desk; in front of the cash box
const CTA = V3(1.75, 0, 12.1);
const ASIDE = V3(1.0, 0, 12.55);                                                                   // revisi1: beside the podium, where a deep bow is clear of it
const SORRY_CAM = [V3(-1.8, 1.25, .1), V3(-1.15, 1.6, 3.65)];                                       // the apology by the empty cash box: target, camera (in the set)
const PLANE0 = V3(AIR.x, 0, AIR.z1 - 10);

// ---------- acting ----------
function act(t) {
  const sc = scene_(t), tl = sc === 'tl', interior = sc === 'office' || sc === 'vault' || sc === 'noodle';
  const tw = tl ? tw8(t, C.S5) : t;
  metro.update(t, tw, 1e9, t + 40, 1e9, 1e9, 1e9, []);
  town.appear(t, 1000);
  clock.set(Math.round(sc === 'press' ? 8 * 60 + 5 : t < C.S4 ? 8 * 60 + 20 : tl ? (9 + 7 * seg(tw, C.S5, C.S6)) * 60 : sc === 'invest' ? 8 * 60 + 40 : t < C.S10 ? 16.5 * 60 : (17 + 2.5 * seg(t, C.S10, TL.dur)) * 60));
  // the gate's board: 45.001; it spins to 49.001; at night "49.001 -> ?"
  const bc = C.boardCut;
  if (t >= bc + .5) board.set(t >= C.boardGlow ? 'night' : 'p49'); else if (t >= bc) board.set('spin' + Math.floor(lerp(45001, 49001, seg(t, bc, bc + .45)) + hash(Math.floor(t * 30)) * 300)); else board.set('p45');
  gate.hang.rotation.x = t >= bc && t < bc + .5 ? eio(seg(t, bc, bc + .5)) * Math.PI * 2 : 0;
  mtn.build(1, 1, t); river.build(1, t); beach.build(1, 1, 1, t);

  // ---------- the four projects: nothing before the time-lapse (the lots are empty in the drone); each grows in its own shot ----------
  const before = t < C.S5, kb = (a, d) => before ? 0 : tl ? seg(tw, a + .1, a + d) : 1;
  library.build(kb(C.lib, 1.3)); airport.build(kb(C.air, .8)); port.build(kb(C.port, 1.1)); sports.build(kb(C.sport, 1.0));
  // the plane: on the apron; in the time-lapse it rolls up the runway and climbs out to the north
  { const pl = airport.plane, u = t - C.takeoff;
    if (tl && t >= C.takeoff) { const s = 22 * u * u + 8 * u, lift = Math.max(0, s - 14); pl.root.position.set(AIR.x, Math.min(60, lift * .32 + lift * lift * .004), PLANE0.z - s); pl.root.rotation.set(0, Math.PI, 0); pl.body.rotation.x = -Math.min(.22, lift * .02); }
    else if (before || (tl && t < C.takeoff)) { pl.root.position.copy(PLANE0); pl.root.rotation.set(0, Math.PI, 0); pl.body.rotation.x = 0; }
    else { pl.root.position.set(AIR.term.x + 9.5, 0, AIR.term.z + 6); pl.root.rotation.set(0, Math.PI / 2, 0); pl.body.rotation.x = 0; }
    pl.root.visible = !before || t < 0; }
  // the ferry rocks at the pier; the lighthouse turns at night (set in light())
  port.ferry.body.rotation.z = .03 * Math.sin(t * 1.3); port.ferry.body.position.y = .05 * Math.sin(t * 1.1);
  // the stands fill up sector by sector, then cheer
  const fill = before ? 0 : tl ? seg(t, C.fill - .2, C.fill + 1.0) : 1;
  SEATS.forEach((s, i) => { const on = fill > (s.th / (Math.PI * 2)) * .8 + s.t * .2; if (!on || before) { fans.pose(i, { vis: false }); return; }
    const ch = Math.abs(Math.sin(t * 8 + s.t * 20)) * .18 * (tl ? 1 : .2); fans.pose(i, { vis: true, x: s.p.x, y: s.p.y + ch, z: s.p.z, ry: Math.atan2(SPORT.x - s.p.x, SPORT.z - s.p.z), sx: .82, sy: .82 }); });
  fans.commit();
  // readers in the library garden, an open book each; a few walking in through the door during its shot
  const libOn = !before && (!tl || t > C.lib + 1.2);
  READ.forEach((p, i) => readers.pose(i, libOn ? { vis: true, x: p.x, y: -.12, z: p.z, ry: Math.PI / 2 + (hash(i) - .5) * .8, sy: .86 } : { vis: false }));
  library.books.forEach((b, i) => { b.visible = libOn && i < READ.length; if (!b.visible) return; const p = READ[i]; b.position.set(p.x + Math.sin(Math.PI / 2 + (hash(i) - .5) * .8) * .38, .62, p.z + Math.cos(Math.PI / 2 + (hash(i) - .5) * .8) * .38); b.rotation.y = Math.PI / 2 + (hash(i) - .5) * .8; });
  for (let k = 0; k < 6; k++) { const u = ((t - C.lib - 1.1 - k * .25) % 1.5) / 1.5, door = library.door, from = door.clone().add(V3((k % 3 - 1) * 2.5, 0, 3.6));
    const on = tl && sub(t) === 'lib' && t > C.lib + 1.1 + k * .25; const q = from.lerp(door, u); readers.pose(READ.length + k, on && u < .95 ? { vis: true, x: q.x, y: .1 + Math.abs(Math.sin(u * 16)) * .08, z: q.z, ry: Math.PI } : { vis: false }); }
  readers.commit();

  // ---------- the city's crowd (outside only) ----------
  const outside = !interior && sc !== 'tl';
  for (let i = 0; i < SPOTS.length; i++) { const [x, z] = SPOTS[i], P = big.people[i];
    const nearPress = (sc === 'press' || sc === 'invest') && Math.abs(x) < 5.5 && z > 12.5 && z < 19;      // the reporters stand there
    big.pose(i, outside && !nearPress && !(sc === 'cta' && Math.hypot(x - 3.2, z - 15.5) < 4) ? { vis: true, x: x + Math.sin(t * .4 + P.ph) * .25, y: .1 + Math.abs(Math.sin(t * P.sp * .45 + P.ph)) * .06, z, ry: hash(i * 1.7) * 6.283 } : { vis: false }); }
  big.commit();
  // the reporters and their flashes
  const press = sc === 'press' || sc === 'invest';
  REP.forEach((r, i) => { r.root.visible = press; if (!press) return;
    r.body.position.y = Math.abs(Math.sin(t * 3 + r.ph * 9)) * .03;
    const rate = sc === 'press' ? 2.4 : .5, ph = (t * rate + r.ph * 7) % 1.6, f = ph < .09 ? 1 - ph / .09 : 0, bowing = t > C.bow && t < C.bow + 1.7 && sc === 'press';
    r.cam.flash.material.opacity = f * (sc === 'press' || (t > C.S8 && t < C.S8 + .5) ? 1 : .0) * (bowing ? 1.3 : 1); r.cam.flash.scale.setScalar(.6 + 1.6 * f); });
  podium.root.visible = press;
  podium.flip.rotation.y = sc === 'invest' ? Math.PI * eio(seg(t, C.flip, C.flip + .45)) : 0;   // turned round on its post: the poster side faces out

  // ---------- the office set ----------
  room.root.visible = interior;
  const nightIn = sc === 'vault' || sc === 'noodle';
  room.setNight(nightIn ? 1 : 0);
  room.scroll.visible = sc === 'office'; room.cup.visible = sc === 'noodle'; room.stack.visible = sc === 'noodle';
  room.printed(sc === 'vault' ? eo(seg(t, C.print, C.sorry - .1)) : sc === 'noodle' ? 1 : 0); room.receipt.visible = nightIn;
  const open = sc === 'vault' ? eio(seg(t, C.open, C.open + 1.4)) : 0;
  room.door.rotation.y = open * 1.9; room.dial.rotation.z = sc === 'vault' ? -Math.PI * 3 * eio(seg(t, C.key, C.key + .9)) : 0;
  // the moth: out of the box, round the Mayor's glasses, up and away; the coin: rolls out, falls, spins flat
  const mu = sc === 'vault' ? (t - C.moth) : -1; room.moth.visible = mu > 0 && mu < 2.6;
  if (room.moth.visible) { const safeW = R(SAFE.clone().addScaledVector(SF, .2).setY(.7)), headW = R(SAFE_AT.clone().setY(1.05)), a = mu * 7;
    const c = safeW.clone().lerp(headW, eo(clamp(mu / .6))), p = c.add(V3(Math.cos(a) * .32 * clamp(mu / .5), Math.sin(mu * 9) * .08 + (mu > 1.6 ? (mu - 1.6) * 1.2 : 0), Math.sin(a) * .32 * clamp(mu / .5)));
    room.moth.position.copy(room.root.worldToLocal(p)); room.moth.rotation.y = -a; room.mw.forEach((w, k) => w.rotation.z = (k ? -1 : 1) * .9 * Math.sin(t * 40)); }
  { const cu = sc === 'vault' ? t - C.coin : sc === 'noodle' ? 9 : -1; room.coin.visible = cu > 0;
    if (cu > 0) { const s = Math.min(cu, 1.1), p0 = SAFE.clone().addScaledVector(SF, .3).setY(.62), p1 = SAFE.clone().addScaledVector(SF, 1.15).addScaledVector(SR, -.7).setY(.01), k = eo(s / 1.1); room.coin.position.copy(p0.lerp(p1, k)); room.coin.position.y = cu < .45 ? .62 - (cu / .45) ** 2 * .6 + .02 : .02 + Math.abs(Math.sin(cu * 9)) * .06 * Math.max(0, 1 - (cu - .45) * 1.5);
      const flat = clamp((cu - 1.0) / .5); room.coin.rotation.set(Math.PI / 2 * flat, cu * 12 * (1 - flat), 0); room.coin.position.y = Math.max(.008, room.coin.position.y * (1 - flat) + .008 * flat); } }
  // the noodles: slurped away, steam rising
  room.noodle.position.y = .18 - .1 * eio(seg(t, C.slurp, C.S8 - .3)); room.noodle.scale.setScalar(1 - .2 * seg(t, C.slurp, C.S8));
  steam.list.forEach((pf, k) => { const u = ((t - C.S7) * .7 + k / 6) % 1; pf.visible = sc === 'noodle'; if (!pf.visible) return; const base = R(V3(.05, .9, -.78));
    pf.position.copy(base).add(V3(Math.sin(t * 1.5 + k) * .06 + .1, u * .45, .12)); pf.scale.setScalar(.14 + u * .24); pf.material.opacity = .42 * Math.sin(Math.PI * u); });

  // ---------- the Mayor ----------
  const M = mayor; let pos = V3(0, .3, 11.4), ry = 0, rz = 0, rx = 0, sq = [1, 1], hatY = 0, hatRx = 0, headY = 0, vis = true, stampOn = false;
  if (sc === 'drone' || sc === 'reel' || tl) vis = false;
  else if (sc === 'press') {                                                       // he hops out from behind the podium (sideways first, then forward), then bows beside it
    const h = seg(t, C.bow - .7, C.bow - .1);                                     // out past the podium's corner, then forward in front of it
    pos = V3(lerp(0, ASIDE.x, eio(seg(h, 0, .6))), lerp(.3, 0, h) + .34 * Math.sin(Math.PI * h), lerp(11.4, ASIDE.z, eio(seg(h, .45, 1))));
    if (h > 0 && h < 1) { sq = hopShape(t, C.bow - .7, .6); ry = .45 * Math.sin(Math.PI * h); }
    rx = .95 * eio(seg(t, C.bow, C.bow + .5)) * (1 - eio(seg(t, C.S2 - .35, C.S2))); headY = -.04 * rx; if (t > C.bow + .5) rx += .02 * Math.sin(t * 2); }
  else if (sc === 'office') {                                                       // the desk; a stamp per "disetujui", each hop higher; the glasses before the third
    pos = R(BEHIND); ry = 0; stampOn = true;
    [[C.stamp1, .18], [C.stamp2, .28], [C.stamp3, .42]].forEach(([s, h]) => { const u = seg(t, s - .32, s + .12); if (u > 0 && u < 1) { pos.y += h * Math.sin(Math.PI * u); rx = .45 * Math.max(0, Math.sin(Math.PI * clamp((t - s + .1) / .3))); sq = u > .7 ? [1.14, .84] : [1, 1]; } });
    if (t > C.glasses - .2 && t < C.stamp3 - .3) headY = .02;
  } else if (sc === 'vault') { pos = R(SAFE_AT); ry = yawTo(pos, R(SAFE.clone().addScaledVector(SF, .45)));
    rx = .1 * eio(seg(t, C.open, C.open + .6)); if (t > C.moth) { ry = lerpAng(ry, yawTo(pos, RW(-.6, 0, 3.0)), .65 * eio(seg(t, C.moth + .15, C.moth + .5))) + .25 * Math.sin((t - C.moth) * 7) * (1 - seg(t, C.moth + 1.6, C.moth + 2.2)); hatY = .06 * Math.abs(Math.sin((t - C.moth) * 7)) * (t < C.moth + 1.5 ? 1 : 0); }   // he turns after the moth, face to us
    if (t > C.coin + .9) { rx = .25 * eio(seg(t, C.coin + .9, C.coin + 1.4)); headY = -.04; }
    if (t > C.sorry) {                                                              // revisi1: face to us; a small bow on "Maaf"; a flinch at the stamp; a hopeful hop on "Bagi kalian"
      ry = yawTo(pos, R(SORRY_CAM[1])); hatY = 0; headY = -.03;
      rx = .12 + .45 * eio(seg(t, C.bow3, C.bow3 + .35)) * (1 - eio(seg(t, C.bow3 + 1.0, C.bow3 + 1.4))) - .12 * eio(seg(t, C.trak - .2, C.trak + .2));
      const d = seg(t, C.ditunda, C.ditunda + .35); if (d > 0 && d < 1) sq = [1 + .12 * Math.sin(Math.PI * d), 1 - .14 * Math.sin(Math.PI * d)];
      const j = seg(t, C.trak, C.trak + .45); pos.y += .16 * Math.sin(Math.PI * j); if (j > 0 && j < 1) sq = hopShape(t, C.trak, .45);
      if (t > C.trak + .45) { rz = .04 * Math.sin((t - C.trak) * 3); headY = .0; } } }
  else if (sc === 'noodle') { pos = R(BEHIND); rx = .12 + .1 * Math.max(0, Math.sin((t - C.slurp) * 5)) * (t > C.slurp ? 1 : 0); headY = -.02; }
  else if (sc === 'invest') {                                                      // (revisi1: the apology moved to the cash box, so no bow here)
    const j = seg(t, C.flip - .1, C.flip + .35); pos.y += .25 * Math.sin(Math.PI * j); sq = j > 0 && j < 1 ? hopShape(t, C.flip - .1, .45) : [1, 1];
    if (t > C.tap + .25) { const u = seg(t, C.tap + .25, C.tap + .7); pos.y += .3 * Math.sin(Math.PI * u); }
    if (t > C.back) rz = .05 * Math.sin(t * 2.5); }
  else if (sc === 'cta') { pos = CTA.clone(); const k = Math.floor((t - C.S9) / .55), u = ((t - C.S9) % .55) / .55; pos.y = Math.sin(Math.PI * u) * .1; sq = hopShape(t, C.S9 + k * .55, .55); }
  else { pos = CTA.clone(); const h = seg(t, C.hatTip, C.hatTip + .3) * (1 - seg(t, C.zoom + 1.2, C.zoom + 1.6)); hatY = .1 * eo(h); hatRx = .5 * eo(h); }
  M.root.visible = vis; M.root.position.copy(pos); M.root.rotation.y = ry;
  M.body.rotation.set(rx, 0, rz); M.body.scale.set(sq[0], sq[1], sq[0]);
  M.hat.position.y = .27 + hatY; M.hat.rotation.set(-hatRx, 0, 0); M.head.position.y = .82 + headY;
  stamp.visible = stampOn;
  const glint = Math.max(seg(t, C.glasses, C.glasses + .1) * (1 - seg(t, C.glasses + .25, C.glasses + .6)), seg(t, C.sparkle, C.sparkle + .1) * (1 - seg(t, C.sparkle + .25, C.sparkle + .6)));
  M.goldM.emissive.setRGB(glint * .9, glint * .7, glint * .3);
  return { tw, TLs: tl, sc };
}
const V_ = id => TL.voice.find(v => v.id === id).t;

// ---------- camera: shots with their own keys; a key is [t, [tx, ty, tz, dist, pitch°, az°, fov°]] ----------
const S = (t0, keys, o = {}) => ({ t0, tr: track(keys), ...o });
const deg = r => r * 180 / Math.PI;
const toOrbit = (T, P, fov) => { const d = P.distanceTo(T); return [T.x, T.y, T.z, d, deg(Math.asin((P.y - T.y) / d)), deg(Math.atan2(P.x - T.x, P.z - T.z)), fov]; };
const RW = (x, y, z) => R(V3(x, y, z));
const portAt = (a, s, y) => { const p = port.at(a, s, y); return p; };
const PORT_T = portAt(PORT.pier + 16, -1, 3), PORT_P = PORT_T.clone().addScaledVector(V3(INLAND[0], 0, INLAND[1]), 44).addScaledVector(V3(ALONG[0], 0, ALONG[1]), 30).add(V3(0, 17, 0));
const SHOTS = [
  S(0, [[0, [0, 1.25, 11.8, 10.8, 14, 0, 34]], [C.bow - .7, [.1, 1.2, 11.9, 10.3, 13.5, 0, 34]], [C.bow, [.75, 1.05, 12.3, 9.6, 13, 0, 34]], [C.S2, [.8, 1.05, 12.3, 9.1, 13, 0, 34]]], { dofA: 5 }),
  S(C.S2, [[C.S2, [10, 0, -5, 330, 42, 18, 44]], [C.S3, [8, 0, -8, 315, 41, 22, 44]]], { far: true }),
  S(C.S3, [[C.S3, [0, 0, -18, 100, 32, 2, 38]], [C.boardCut, [0, 0, -16, 94, 33, 0, 38]]], { far: true }),
  S(C.boardCut, [[C.boardCut, [0, 1.6, GATE_Z, 7.6, 5, 0, 34]], [C.S4, [0, 1.6, GATE_Z, 6.9, 5, 0, 34]]], { near: true }),
  S(C.S4, [[C.S4, toOrbit(RW(0, .95, -1.1), RW(0, 1.75, 3.6), 38)], [C.chat3, toOrbit(RW(0, .95, -1.2), RW(.2, 1.55, 2.9), 38)], [C.S5, toOrbit(RW(0, .95, -1.25), RW(.1, 1.45, 2.4), 38)]], { dofA: 6 }),
  S(C.lib, [[C.lib, [LIB.x + 1.5, 2.6, LIB.z + 2, 30, 14, 28, 40]], [C.air, [LIB.x + 1.5, 2.6, LIB.z + 2, 27, 13, 24, 40]]], { far: true }),
  S(C.air, [[C.air, [AIR.x - 11, 2, -24, 62, 20, -40, 42]], [C.port, [AIR.x - 8, 6, -36, 66, 18, -34, 42]]], { far: true }),
  S(C.port, [[C.port, toOrbit(PORT_T, PORT_P, 42)], [C.sport, toOrbit(PORT_T.clone().addScaledVector(V3(ALONG[0], 0, ALONG[1]), 3), PORT_P.clone().addScaledVector(V3(ALONG[0], 0, ALONG[1]), -6), 42)]], { far: true }),
  S(C.sport, [[C.sport, [SPORT.x, 2, SPORT.z + 8, 78, 36, -22, 42]], [C.S6, [SPORT.x, 2, SPORT.z + 6, 70, 34, -16, 42]]], { far: true }),
  S(C.S6, [[C.S6, toOrbit(RW(-2.05, .72, .2), RW(-.55, 1.4, 3.3), 44)], [C.moth, toOrbit(RW(-1.95, .9, .15), RW(-.7, 1.35, 2.85), 44)], [C.print - .05, toOrbit(RW(-1.9, .85, .15), RW(-.75, 1.3, 2.75), 44)]], { dofA: 4 }),
  S(C.print, [[C.print, toOrbit(RW(1.0, .5, -.6), RW(-.4, 2.6, 3.2), 40)], [C.sorry, toOrbit(RW(2.2, .2, .4), RW(-.6, 2.8, 3.8), 42)]], { dofA: 5 }),
  S(C.sorry, [[C.sorry, toOrbit(R(SORRY_CAM[0]), R(SORRY_CAM[1]), 50)], [C.S7, toOrbit(R(SORRY_CAM[0].clone().add(V3(.05, -.02, 0))), R(SORRY_CAM[1].clone().add(V3(-.05, -.04, -.3))), 50)]], { dofA: 4 }),
  S(C.S7, [[C.S7, toOrbit(RW(0, 1.05, -1.2), RW(-.45, 1.75, 1.9), 36)], [C.S8, toOrbit(RW(0, 1.02, -1.2), RW(-.3, 1.65, 1.45), 36)]], { dofA: 7 }),
  S(C.S8, [[C.S8, [0, 1.25, 11.9, 8.0, 11, 4, 34]], [C.flip, [0, 1.2, 11.9, 6.8, 10, 6, 34]], [C.pras, [0, 1.2, 11.9, 6.6, 10, 6, 34]]], { dofA: 6 }),
  S(C.pras, [[C.pras, toOrbit(V3(3.4, 3.4, -74), V3(7.4, 1.25, -59.2), 42)], [C.game, toOrbit(V3(3.3, 3.6, -74), V3(7.0, 1.3, -60.2), 42)]], { dofA: 1.0 }),
  S(C.game, [[C.game, [0, 1.2, 11.9, 6.6, 10, 6, 34]], [C.S9, [0, 1.25, 11.9, 7.4, 11, 4, 34]]], { dofA: 6 }),
  S(C.S9, [[C.S9, [CTA.x, 1.4, CTA.z, 5.4, 0, 8, 36]], [C.S10, [CTA.x, 1.4, CTA.z, 5.0, 0, 8, 36]]], { near: true, dofA: 7 }),
  S(C.S10, [[C.S10, [CTA.x, .95, CTA.z, 4.4, 5, 0, 32]], [C.zoom, [CTA.x, .95, CTA.z, 4.0, 5, 0, 32]], [C.zoom + 1.2, [-2, 4, 4, 44, 26, 6, 36]], [C.zoom + 3.4, [96, 0, 4, 500, 64, -4, 50]], [TL.dur, [98, 0, 2, 516, 65, -5, 50]]], { outro: true }),
];
function orbit([tx, ty, tz, d, pitch, az, fov]) {
  const p = pitch * Math.PI / 180, a = az * Math.PI / 180, T = V3(tx, ty, tz);
  return { pos: V3(tx + Math.sin(a) * Math.cos(p) * d, ty + Math.sin(p) * d, tz + Math.cos(a) * Math.cos(p) * d), T, fov, d };
}
function shot(t) {
  let s = SHOTS[0]; for (const x of SHOTS) if (t >= x.t0) s = x;
  const o = orbit(s.tr(t));
  const lift = s.outro ? lerp(0, .04, seg(t, C.zoom, C.zoom + 2.6)) * o.d : (s.near || s.dofA ? .0 : .085 * o.d);
  const dr = V3(Math.sin(t * .7) * .012 * o.d, Math.sin(t * .53 + 1) * .008 * o.d, 0);
  const far = s.far || (s.outro && t > C.zoom + 1);
  return { pos: o.pos.add(dr), look: o.T.clone().add(V3(0, lift, 0)), fov: o.fov, focus: o.d, A: s.dofA ?? (far ? 12 : 20), s };
}

// ---------- light ----------
const cDay = [new THREE.Color('#7FC0EE'), new THREE.Color('#FBE9D6')], cMorn = [new THREE.Color('#8CC6EE'), new THREE.Color('#FCE3C8')], cDusk = [new THREE.Color('#B7A3DC'), new THREE.Color('#F8C0A0')], cNight = [new THREE.Color('#283563'), new THREE.Color('#4E5E92')];
const cGold = [new THREE.Color('#9DB8E8'), new THREE.Color('#FAD3A6')];
const tmpA = new THREE.Color(), tmpB = new THREE.Color();
function nightK(t) { return { dusk: seg(t, C.dusk, C.dusk + 1.4), night: seg(t, C.dusk + 1.2, C.night) }; }
function light(t, s, tw, sc) {
  let az = 30, el = 48, warm = 0, I = 2.5, morn = 0, gold = 0;
  const nightIn = sc === 'vault' || sc === 'noodle';
  if (sc === 'press' || sc === 'invest') { az = 150; el = 34; morn = .5; warm = .15; }
  if (sc === 'drone' || sc === 'reel') { az = 70; el = 34; morn = .7; warm = .2; }
  if (sc === 'office') { az = 165; el = 58; }
  if (sc === 'tl') { const p = seg(tw, C.S5, C.S6); az = lerp(80, 200, p); el = lerp(40, 58, Math.sin(Math.PI * p)); }
  if (sc === 'cta') { az = 215; el = 28; warm = .4; gold = .6; I = 2.3; }
  if (s.s.outro) { az = 230; el = lerp(18, 14, seg(t, C.S10, C.zoom)); warm = .55 * (1 - seg(t, C.zoom, C.dusk)); gold = 1 - seg(t, C.zoom, C.dusk + .4); }
  const { dusk, night: nk0 } = nightK(t), night = nightIn ? 1 : nk0;
  warm = Math.max(warm, dusk * (1 - night)); el = lerp(el, 10, dusk); I = lerp(I, 1.4, dusk) * (1 - night);
  const a = az * Math.PI / 180, e = el * Math.PI / 180, T = s.look.clone(); T.y = 0;
  const half = clamp(s.focus * .75, 9, 170);
  sun.target.position.copy(T); sun.position.copy(T).add(V3(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)).multiplyScalar(half * 2.5));
  const scm = sun.shadow.camera; scm.left = scm.bottom = -half; scm.right = scm.top = half; scm.near = 1; scm.far = half * 6; scm.updateProjectionMatrix();
  sun.intensity = I; sun.color.setRGB(1, lerp(.95, .72, warm), lerp(.86, .55, warm));
  const farK = clamp((s.focus - 60) / 200);
  moon.intensity = (nightIn ? .35 : lerp(.8, 1.35, farK)) * night; renderer.toneMappingExposure = nightIn ? 1.05 : lerp(1, 1.18, night);
  hemi.intensity = nightIn ? .42 : lerp(1.05, lerp(.8, 1.0, farK), night); hemi.color.set('#D3E8FF').lerp(tmpA.set('#8697D8'), night); hemi.groundColor.set('#EAD6B4').lerp(tmpB.set('#46507A'), night);
  sky.top.value.copy(cDay[0]).lerp(cMorn[0], morn).lerp(cGold[0], gold * .6).lerp(cDusk[0], dusk).lerp(cNight[0], night);
  sky.hor.value.copy(cDay[1]).lerp(cMorn[1], morn).lerp(cGold[1], gold * .8).lerp(cDusk[1], dusk).lerp(cNight[1], night);
  sky.warm.value = 0; scene.fog.color.copy(sky.hor.value);
  scene.fog.near = Math.max(260, s.focus * 1.1); scene.fog.far = Math.max(900, s.focus * 3.2);
  stars.material.opacity = nightIn ? 0 : night;
  cloudM.emissiveIntensity = .35 * (1 - night); cloudM.color.setScalar(1 - .45 * night); mtn.clouds.children[0].children[0].material.emissiveIntensity = .3 * (1 - night);
  vu.warm.value = nightIn ? .45 : .25 + .35 * warm - .2 * night; vu.sat.value = lerp(1.42, 1.25, night);
  post.bloom.strength = nightIn ? .3 : .12 + .55 * night; post.bloom.threshold = nightIn ? 1.0 : lerp(1.6, .7, night);
  const lk = t >= C.lights ? Math.max(.6, seg(t, C.lights - .05, C.lights + .1) * clamp(dusk * 2)) : 0;
  metro.night(t, lk, C.lights); town.night(t, lk);
  for (const m of officeWin) m.emissiveIntensity = t >= C.lights + .4 ? 1.6 : 0;                     // the Mayor is still working late
  boardMat.emissiveIntensity = t >= C.boardGlow - .3 ? .85 * seg(t, C.boardGlow - .3, C.boardGlow) : 0;
  const nk = t >= C.nature ? 1 : 0;
  river.lampM.emissiveIntensity = 2.2 * nk * lk; beach.towerLampM.emissiveIntensity = 2.4 * nk * lk; beach.gateLampM.emissiveIntensity = 2.4 * (t >= C.nature + .2 ? 1 : 0) * lk;
  mall.night((t >= C.lights + .45 ? 1 : 0) * lk); library.night((t >= C.lights + .5 ? 1 : 0) * lk);
  airport.night(nk * lk, t); port.night((t >= C.nature + .15 ? 1 : 0) * lk, t); sports.night((t >= C.nature + .3 ? 1 : 0) * lk);
  flies.update(t, nk0 * seg(t, C.nature, C.nature + 1.2));
  const mo = nk0 * seg(t, C.monument, C.monument + .35), mon = metro.monument;
  mon.obM.emissiveIntensity = 1.6 * mo; mon.bubM.emissiveIntensity = .9 * mo; mon.heartM.emissiveIntensity = 1.0 * mo; mon.glow.intensity = 60 * mo;
}

const ui = makeUI(document.getElementById('ui'), TL);
const tmp = new THREE.Vector3();
const project = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * W, (1 - tmp.y) / 2 * H, tmp.z < 1]; };

window.render = t => {
  const st = act(t);
  const camQ = Q.get('cam'), master = Q.get('master');                               // ?cam=tx,ty,tz,d,pitch,az,fov: a look from anywhere; ?master=…: no UI
  const s = camQ ? (() => { const o = orbit(camQ.split(',').map(Number)); return { pos: o.pos, look: o.T, fov: o.fov, focus: o.d, A: 8, s: {} }; })() : shot(t);
  camera.fov = s.fov; camera.position.copy(s.pos); camera.lookAt(s.look); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  light(t, s, st.tw, st.sc);
  // the mist belts and the peak clouds fade out when the camera is high (from above they read as a white crown)
  const mc = V3(MT.x, 40 * MT.F, MT.z), hd = Math.hypot(camera.position.x - mc.x, camera.position.z - mc.z), elev = Math.atan2(camera.position.y - mc.y, hd) * 180 / Math.PI;
  belt.update(t, Q.has('nobelt') ? 0 : clamp((26 - elev) / 10), nightK(t).night); belt.root.visible = !Q.has('nobelt') && elev < 26;
  const ck = clamp((30 - elev) / 8); mtn.clouds.visible = ck > 0; mtn.clouds.children.forEach(c => c.children.forEach(b => b.scale.set(Math.max(.001, ck), .62 * Math.max(.001, ck), Math.max(.001, ck))));
  clouds.position.x = t * .8;
  post.dof.focus = s.focus; post.dof.aper = s.A * s.focus * (Q.has('nodof') ? 0 : 1); post.dof.maxCoc = 20;
  post.composer.render();
  mayor.head.updateMatrixWorld(true);
  if (!master && !Q.has('noui')) ui.draw(t, { glasses: project(mayor.head.localToWorld(V3(0, .02, .3))), board: project(V3(0, 2.9, GATE_Z)), tw: st.tw, TLs: st.TLs, sc: st.sc });
};

window.READY = true;
