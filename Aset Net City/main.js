// NetizenCity.id — Day 9. Every frame is a function of t (seconds); cues come from timeline.json.
// Morning on the sidewalk by the Kantor Mayor: a tiny orange cat follows the Mayor and freezes like a statue every time he turns.
// Day 9's hook; 53.000 (the reel, the board, three towers and six rusun growing). The second freeze, the blink. @aftone_moon's zoo (x24;
// a penguin marches in with the citizens, nobody notices; the cat and the lion tilt at each other). @muh_adnan_11's animal hospital and
// adoption corner (x24): SEHAT; the cat left at the adoption corner... and sitting on the Mayor's hat. @z_hr.da's university beside the
// lab (x24): the Professor is the rector; the first graduation cap lands on the cat. Afternoon at the Kantor Mayor: the Mayor adopts it.
// Name the cat; the hat raised, the cat hops on; the tagline; the zoom out at dusk; the lights; the Monument last.
import * as THREE from 'three';
import { makePost } from '/core/three/post.js';
import { clamp, lerp, seg, ss, eio, eo, ei, back, track, hash, mulberry } from '/core/lib.js';
import { buildWorld, PAL, signTex, makeMayor, makeGate, makeOffice } from './world.js';
import { buildCity, makeCrowd } from './city.js';
import { buildMetro, RAIL_Z } from './metro.js';
import { makeMountain, makeRiver, makeBeach, makeMistBelt, makeCapsule } from './nature.js';
import { MT } from './land.js';
import { makeForest, makeFireflies } from './forest.js';
import { makeMall } from './mall.js';
import { makeLibrary, makeAirport, makePort, makeSports, makePrasasti } from './day7.js';
import { makeLab, makeProfessor, LAB } from './day8.js';
import { makeTower, TOWER } from './menara.js';
import { makeCat, makePet, makeGradCap, makeZoo, makeVet, makeUni, ZOO, VET, UNI, ENCL } from './day9.js';
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
const noAO = [];
{ const ao = post.dof.ao; if (ao) { const ov = ao.overrideVisibility.bind(ao); ao.overrideVisibility = () => { ov(); noAO.forEach(o => o.visible = false); }; } }
const vu = post.vig.uniforms; vu.amt.value = .3; vu.sat.value = 1.42; vu.contrast.value = .3; vu.warm.value = .25;
post.bloom.strength = .12;
const stars = (() => { const R = mulberry(31), p = []; for (let i = 0; i < 500; i++) { const a = R() * 6.283, e = .15 + R() * 1.3; p.push(Math.cos(a) * Math.cos(e) * 900, Math.sin(e) * 900, Math.sin(a) * Math.cos(e) * 900); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(p, 3));
  const m = new THREE.PointsMaterial({ color: '#FFF6E0', size: 3.2, sizeAttenuation: false, transparent: true, opacity: 0, fog: false, depthWrite: false });
  const s = new THREE.Points(g, m); scene.add(s); return s; })();

// ---------- the gate's board: 50.001, it spins to 53.001; at night "53.001 -> ?" ----------
const boardText = v => v === 'night' ? 'POPULASI: 53.001 → ?' : String(v).startsWith('spin') ? `POPULASI: ${(+v.slice(4)).toLocaleString('id-ID')}` : v === 'p50' ? 'POPULASI: 50.001' : 'POPULASI: 53.001';
const board = signTex((x, v, w, h) => {
  x.fillStyle = '#FFF4DA'; x.fillRect(0, 0, w, h); x.strokeStyle = '#D9A877'; x.lineWidth = 14; x.strokeRect(7, 7, w - 14, h - 14);
  const txt = boardText(v); let size = 66; x.font = `${size}px "Lilita One"`;
  while (x.measureText(v === 'night' ? txt : 'POPULASI: 53.001').width > w - 70 && size > 30) { size -= 2; x.font = `${size}px "Lilita One"`; }
  x.fillStyle = '#4B3A36'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, w / 2, h * .4);
  x.fillStyle = '#5FA88A'; x.font = '44px "Lilita One"'; x.fillText('KOTA', w / 2, h * .76);
}, 640, 200); board.set('p50');
const clock = signTex((x, v, w, h) => {
  x.fillStyle = '#FFFBF2'; x.beginPath(); x.arc(w / 2, h / 2, w / 2 - 4, 0, 7); x.fill(); x.lineWidth = 10; x.strokeStyle = '#E58F72'; x.stroke();
  x.fillStyle = '#4B3A36'; for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; x.beginPath(); x.arc(w / 2 + Math.cos(a) * w * .36, h / 2 + Math.sin(a) * h * .36, 5, 0, 7); x.fill(); }
  const hand = (a, L, lw) => { x.lineWidth = lw; x.lineCap = 'round'; x.strokeStyle = '#4B3A36'; x.beginPath(); x.moveTo(w / 2, h / 2); x.lineTo(w / 2 + Math.sin(a) * L, h / 2 - Math.cos(a) * L); x.stroke(); };
  hand(v / 720 * 6.283, w * .22, 12); hand((v % 60) / 60 * 6.283, w * .33, 7);
}, 256, 256); clock.set(8 * 60);
const kantorSign = signTex((x, v, w, h) => { x.fillStyle = '#F2A88A'; x.fillRect(0, 0, w, h); x.fillStyle = '#FFF7EA'; x.font = '62px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('KANTOR MAYOR', w / 2, h / 2 + 4); }, 512, 110); kantorSign.set(1);
const GATE_Z = 27.6;
const mayor = makeMayor(); scene.add(mayor.root);
const gate = makeGate(board); gate.root.position.set(0, 0, GATE_Z); scene.add(gate.root);
const boardMat = gate.hang.children.find(c => c.isMesh && Array.isArray(c.material)).material[4];
boardMat.emissiveMap = board.t; boardMat.emissive = new THREE.Color('#FFE7B0'); boardMat.emissiveIntensity = 0;
const office = makeOffice(clock); office.root.position.set(0, 0, 9.3); scene.add(office.root);
{ const s = new THREE.Mesh(new THREE.BoxGeometry(1.5, .32, .05), new THREE.MeshStandardMaterial({ map: kantorSign.t, roughness: .7 })); s.position.set(0, 1.62, 1.24); s.castShadow = true; office.root.add(s); }
const officeWin = []; office.root.traverse(o => { if (o.isMesh && o.material.color && o.material.color.getHexString() === '9fd0e8') { o.material = o.material.clone(); o.material.emissive = new THREE.Color('#FFCB7A'); officeWin.push(o.material); } });

// ---------- the city of Days 1-8 and the Menara Investor, all standing ----------
const K2 = { infill: true, S3: -100, S6: -100, S7: -100, S8: -100, pohon: -100, lampu: -100, modern: -100, ruko: -100, lapangan: -100, atSchool: -100, rolldoor: -100, lights: C.lights + .95 };
const town = buildCity(scene, K2); town.ball.visible = false; town.rollers.forEach(r => r.visible = false);
const metro = buildMetro(scene, { ...C, grow: -100 });
metro.buildWorship(9); metro.buildParts(metro.hosp, 9); metro.buildParts(metro.police, 9); metro.buildParts(metro.fire, 9);
metro.fire.doors.forEach(d => d.scale.y = 1);
metro.myst.root.visible = false; metro.northCrane.root.visible = false;
metro.monument.root.visible = metro.mpark.root.visible = metro.promenade.visible = true; (metro.promenadeTrees || []).forEach(o => o.visible = true);
metro.mpark.jets.children.forEach(j => j.scale.y = .85);
metro.cranes.forEach(k => k.root.visible = false); metro.trucks.forEach(k => k.root.visible = false);
const mtn = makeMountain(); scene.add(mtn.root);
const river = makeRiver(RAIL_Z); scene.add(river.root);
const beach = makeBeach(); scene.add(beach.root); beach.ribbon.forEach(r => r.visible = false); beach.gate.userData.bow.visible = false;
const belt = makeMistBelt(); scene.add(belt.root); noAO.push(belt.root);
const forest = makeForest(); scene.add(forest.root); forest.grow(1, 0);
const flies = makeFireflies(forest); scene.add(flies.root); noAO.push(flies.root);
const mall = makeMall(); scene.add(mall.root); mall.build(1);
const library = makeLibrary(); scene.add(library.root); library.build(1);
const airport = makeAirport(); scene.add(airport.root); airport.build(1);
const port = makePort(); scene.add(port.root); noAO.push(port.beam); port.build(1);
const sports = makeSports(); scene.add(sports.root); sports.build(1);
const prasasti = makePrasasti(); scene.add(prasasti);
const lab = makeLab(); scene.add(lab.root);
const tower = makeTower(renderer); scene.add(tower.root);
// ---------- Day 9: the zoo, the animal hospital, the university; the cat; the Professor (rector); the vet; pets; the graduation cap ----------
const zoo = makeZoo(); scene.add(zoo.root);
const vet = makeVet(); scene.add(vet.root);
const uni = makeUni(); scene.add(uni.root);
const cat = makeCat(); scene.add(cat.root);
const prof = makeProfessor(); scene.add(prof.root); prof.plaster.visible = true;
const rektor = (() => { const g = new THREE.Group(), t = signTex((x, v, w, h) => { x.fillStyle = '#FFF9F1'; x.fillRect(0, 0, w, h); x.strokeStyle = '#B6A4D8'; x.lineWidth = 10; x.strokeRect(5, 5, w - 10, h - 10); x.fillStyle = '#7A5BB0'; x.font = '64px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('REKTOR', w / 2, h / 2 + 4); }, 320, 110); t.set(1);
  g.add(new THREE.Mesh(new THREE.CylinderGeometry(.03, .03, .9, 6).translate(0, .45, 0), new THREE.MeshStandardMaterial({ color: '#B9B6C2' })));
  g.add(new THREE.Mesh(new THREE.BoxGeometry(.62, .22, .03), [0, 0, 0, 0, 1, 0].map(k => k ? new THREE.MeshStandardMaterial({ map: t.t, roughness: .6 }) : new THREE.MeshStandardMaterial({ color: '#B6A4D8' }))).translate(0, .95, 0));
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(g); return g; })();
const vetDoc = makeCapsule('#FFFFFF'); scene.add(vetDoc.root);
{ const st = new THREE.Mesh(new THREE.TorusGeometry(.2, .018, 6, 20, Math.PI * 1.2), new THREE.MeshStandardMaterial({ color: '#5E86C1' })); st.position.set(0, .62, .05); st.rotation.set(Math.PI / 2 + .3, 0, Math.PI * .9); vetDoc.body.add(st);
  const cr = new THREE.Mesh(new THREE.BoxGeometry(.12, .04, .02), new THREE.MeshStandardMaterial({ color: '#7FCFB2' })); cr.position.set(0, .4, .245); vetDoc.body.add(cr); }
const cap = makeGradCap(); scene.add(cap);
const walkers = [['#F2B8C6', 'dog', '#D9B48C'], ['#A9C8EC', 'cat', '#C9C3D3'], ['#F7DD8C', 'dog', '#F4E6D0'], ['#C9B8E8', 'cat', '#F4D6B8']].map(([c, k, pc], i) => { const w = makeCapsule(c), p = makePet(k, pc); scene.add(w.root, p.root); return { w, p, i }; });
// ---------- crowds: the sidewalks; the zoo queue (with one penguin); the students; the curious capsules ----------
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const SPOTS = metro.walkSpots(), big = makeCrowd(scene, SPOTS.length);
{ const cols = ['#F2A88A', '#F2B8C6', '#A9C8EC', '#C9B8E8', '#F7DD8C', '#E8B4A0', '#F6C28B', '#B5C4E8', '#E9A7D0', '#9EC9E8', '#FFD1A6', '#D7B8E0'], Rc = mulberry(808);
  for (let i = 0; i < SPOTS.length; i++) big.setColor(i, cols[Math.floor(Rc() * cols.length)]); }
const NQ = 280, fc = makeCrowd(scene, NQ);
const qPenguin = (() => { const g = new THREE.Group(); const body = new THREE.Mesh(new THREE.CapsuleGeometry(.2, .3, 4, 10).translate(0, .38, 0), new THREE.MeshStandardMaterial({ color: '#5E7FB0', roughness: .5 }));
  g.add(body, new THREE.Mesh(new THREE.CapsuleGeometry(.16, .24, 4, 10).translate(0, .37, .07), new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: .5 })), new THREE.Mesh(new THREE.ConeGeometry(.05, .12, 6).rotateX(Math.PI / 2).translate(0, .6, .22), new THREE.MeshStandardMaterial({ color: '#F6B26B' })));
  for (const s of [-1, 1]) { const e = new THREE.Mesh(new THREE.SphereGeometry(.025, 6, 4), new THREE.MeshStandardMaterial({ color: '#2C2A33' })); e.position.set(s * .07, .66, .17); g.add(e); const f = new THREE.Mesh(new THREE.BoxGeometry(.04, .22, .12), new THREE.MeshStandardMaterial({ color: '#5E7FB0' })); f.position.set(s * .21, .38, 0); f.rotation.z = s * .3; g.add(f); }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; }); scene.add(g); return g; })();

// ---------- helpers ----------
const lerpAng = (a, b, k) => { let d = (b - a) % (2 * Math.PI); if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; return a + d * k; };
const yawTo = (from, to) => Math.atan2(to.x - from.x, to.z - from.z);
function hopShape(t, t0, d) { const u = (t - t0) / d; if (u >= 0 && u < 1) { const s = 1 + .14 * Math.sin(Math.PI * u); return [1 / Math.sqrt(s), s]; } return [1, 1]; }
const tw8 = (t, c0) => c0 + Math.floor(Math.max(0, t - c0) * 8) / 8;
const scene_ = t => t < C.S2 ? 'walk' : t < C.S3 ? 'drone' : t < C.boardCut ? 'reel' : t < C.grow ? 'board' : t < C.S4 ? 'grow' : t < C.S5 ? 'freeze' : t < C.queue ? 'zoo' : t < C.S6 ? 'queue'
  : t < C.exam ? 'vetTL' : t < C.S7 ? 'vet' : t < C.rektor ? 'uniTL' : t < C.S8 ? 'uni' : t < C.S9 ? 'adopt' : t < C.S10 ? 'cta' : 'outro';
const LAPSE = sc => ['grow', 'zoo', 'vetTL', 'uniTL'].includes(sc);
// the walk: the Mayor hops west along the north sidewalk of the Kampung street; the cat tiptoes after him
const WALK_Z = 13.4, mayorX = t => 2.0 - .9 * Math.min(t, C.look1) - .9 * Math.max(0, t - C.back1), catX = t => mayorX(Math.min(t, C.freeze1)) + 1.7 - (t > C.back1 + .25 ? .9 * (t - C.back1 - .25) : 0);   // across the plaza, westward
const CTA = V3(.9, 0, 14.0), CAT_CTA = V3(.15, 0, 14.25);
const VETWALK = t => V3(VET.x - 7.2 + 1.0 * Math.max(0, t - C.walk), 0, 17.2);   // from the adoption house (west of the hospital) east along its sidewalk
const STUDENT0 = V3(UNI.x, 0, UNI.z + 22), HALL = uni.hall;

// ---------- acting ----------
let catOnHat = false;
function act(t) {
  const sc = scene_(t), lapse = LAPSE(sc);
  const tw = sc === 'grow' ? tw8(t, C.grow) : sc === 'zoo' ? tw8(t, C.S5) : sc === 'vetTL' ? tw8(t, C.S6) : sc === 'uniTL' ? tw8(t, C.S7) : t;
  // Day 9's towers grow in scene 3; the three requests grow in their own time-lapses
  const bt9 = t < C.grow ? -1 : sc === 'grow' ? seg(tw, C.grow + .1, C.S4 - .2) * 1.3 : 1e9;
  metro.update(t, tw, 1e9, t + 40, 1e9, 1e9, 1e9, t > C.adopt - .7 && t < C.S7 ? [[VET.x - 6, 19.5, 9]] : [], bt9);   // the adoption and walk shots: no car across the lens
  town.appear(t, 1000);
  const hh = t < C.S8 ? (lapse ? 9 + 7 * (sc === 'zoo' ? seg(tw, C.S5, C.queue) : sc === 'vetTL' ? seg(tw, C.S6, C.exam) : sc === 'uniTL' ? seg(tw, C.S7, C.rektor) : seg(tw, C.grow, C.S4)) : 8.3) : t < C.S10 ? 16.5 : 17 + 2.5 * seg(t, C.S10, TL.dur);
  clock.set(Math.round(hh * 60)); uni.clock.set(Math.round(hh * 60));
  const bc = C.boardCut;
  if (t >= bc + .5) board.set(t >= C.boardGlow ? 'night' : 'p53'); else if (t >= bc) board.set('spin' + Math.floor(lerp(50001, 53001, seg(t, bc, bc + .45)) + hash(Math.floor(t * 30)) * 300)); else board.set('p50');
  gate.hang.rotation.x = t >= bc && t < bc + .5 ? eio(seg(t, bc, bc + .5)) * Math.PI * 2 : 0;
  mtn.build(1, 1, t); river.build(1, t); beach.build(1, 1, 1, t); lab.update(t); lab.open(0);
  tower.light(() => .55, 0, t); tower.crowns.forEach((c, j) => tower.crown(j, .8, 0, t)); tower.haloOn(.5, t); tower.neon(.35); tower.env(1);
  // the builds: nothing before their time-lapse, then they grow in their own shot
  const kb = (s0, s1) => t < s0 ? 0 : t < s1 ? seg(tw, s0 + .1, s0 + (s1 - s0) * .75) : 1;
  zoo.build(kb(C.S5, C.queue)); vet.build(kb(C.S6, C.exam)); uni.build(kb(C.S7, C.rektor));
  // the zoo's animals: they pop up as they are named, and move a little (the trunk sprays, the giraffe stretches, the lion yawns)
  const named = { elephant: C.gajah, giraffe: C.jerapah, flamingo: C.flamingo, komodo: C.komodo, lion: C.S5 + 1.4, penguin: C.S5 + 1.0 };
  zoo.animals.forEach((a, i) => { const t0 = named[a.k], u = t < t0 ? 0 : back(seg(t, t0, t0 + .35), 2.2); a.g.visible = u > .01; a.g.scale.setScalar(Math.max(.001, u));
    if (a.trunk) a.trunk.rotation.x = -.4 * Math.max(0, Math.sin((t - t0) * 2.5));
    if (a.neck) a.neck.rotation.x = .35 - .15 * Math.max(0, Math.sin((t - t0) * 1.5));
    if (a.jaw) a.jaw.position.y = -.08 * Math.max(0, Math.sin((t - C.komodo) * 3)) * (t > C.komodo && t < C.komodo + 1.2 ? 1 : 0);
    if (a.head && a.k === 'lion') a.head.rotation.z = sc === 'queue' && t > C.queue + 1.5 ? -.35 * eio(seg(t, C.queue + 1.5, C.queue + 1.9)) : 0;
    if (a.k === 'penguin') a.g.position.y = a.home.y + Math.abs(Math.sin(t * 5 + i)) * .05;
    if (a.k === 'komodo') a.g.position.z = a.home.z + Math.sin(t * .6) * .4; });
  // the animal hospital's pets with their capsules, walking the sidewalk
  walkers.forEach(({ w, p, i }) => { const on = sc === 'vetTL' || sc === 'vet'; w.root.visible = p.root.visible = on; if (!on) return;
    const x = VET.x - 9 + ((t * (.6 + i * .08) + i * 4.5) % 18), z = 17.0 + (i % 2) * .45, ph = t * 9 + i;
    w.root.position.set(x, Math.abs(Math.sin(ph)) * .06, z); w.root.rotation.y = Math.PI / 2; p.root.position.set(x + .55, 0, z + .1); p.root.rotation.y = Math.PI / 2; p.pose({ walk: 1, ph, t }); });
  // the vet: by the examination table in the play yard
  vetDoc.root.visible = sc === 'vet'; vetDoc.root.position.copy(vet.table).add(V3(.7, -.65, -.1)); vetDoc.root.rotation.y = -Math.PI / 2; vetDoc.body.rotation.x = t > C.exam && t < C.sehat ? .25 * Math.abs(Math.sin((t - C.exam) * 6)) : 0;
  // the Professor, the rector, in front of the rectorate (with his REKTOR board); the students marching in
  const rk = sc === 'uni'; prof.root.visible = rektor.visible = rk; rektor.position.copy(uni.front).add(V3(1.1, 0, 1.2));
  if (rk) { prof.root.position.copy(uni.front).add(V3(0, 0, 1.4)); prof.root.rotation.y = 0; prof.body.rotation.set(0, 0, 0);
    if (t > C.toss - 1.0) { prof.root.position.copy(HALL).add(V3(-1.6, 0, 1.0)); prof.root.rotation.y = yawTo(prof.root.position, HALL.clone().add(V3(1.2, 0, 2.5))); const k = seg(t, C.toss - .2, C.toss + .1); prof.body.rotation.x = -.4 * Math.sin(Math.PI * k); } }
  for (let i = 0; i < NQ; i++) {
    let p = null, ry = 0, y = 0, rz = 0;
    if (sc === 'queue') { if (i < 34 && i !== 17) { const row = Math.floor(i / 2), col = i % 2, z = ZOO.z + ZOO.r + 9 - row * .75 - (t - C.queue) * 1.1; if (z > ZOO.z + 6) p = V3(ZOO.x + (col ? .45 : -.45), 0, z); ry = Math.PI; y = Math.abs(Math.sin(t * 9 + i)) * .08; } }
    else if (sc === 'uni' || (sc === 'uniTL' && t > C.rektor - 1.5)) { const row = Math.floor(i / 4), col = i % 4; const z = STUDENT0.z + 6 - row * .8 - (t - C.rektor) * 1.0; if (z > UNI.z - 2 && row < 60) { p = V3(UNI.x - 1.2 + col * .8, 0, z); ry = Math.PI; y = Math.abs(Math.sin(t * 9 + i)) * .07;
        if (t > C.tiltAll) { rz = .3 * eio(seg(t, C.tiltAll + (i % 7) * .03, C.tiltAll + .3 + (i % 7) * .03)); } } }
    fc.pose(i, p ? { vis: true, x: p.x, y, z: p.z, ry, rz } : { vis: false }); }
  fc.commit();
  qPenguin.visible = sc === 'queue'; if (qPenguin.visible) { const z = ZOO.z + ZOO.r + 9 - 8 * .75 - (t - C.queue) * 1.1; qPenguin.position.set(ZOO.x + .45, Math.abs(Math.sin(t * 7)) * .06, z); qPenguin.rotation.set(0, Math.PI, .12 * Math.sin(t * 7)); }
  for (let i = 0; i < SPOTS.length; i++) { const [x, z] = SPOTS[i], P = big.people[i];
    const clear = (sc === 'walk' || sc === 'freeze') && Math.abs(x) < 9 && z > 10 && z < 21 || (sc === 'vet' || sc === 'vetTL') && Math.abs(x - VET.x) < 14 && Math.abs(z - 17) < 3 || (sc === 'adopt' || sc === 'cta' || sc === 'outro') && Math.abs(x) < 6 && z < 20;
    big.pose(i, !clear && t < C.dusk ? { vis: true, x: x + Math.sin(t * .4 + P.ph) * .25, y: .1 + Math.abs(Math.sin(t * P.sp * .45 + P.ph)) * .06, z, ry: hash(i * 1.7) * 6.283 } : { vis: false }); }
  big.commit();

  // ---------- the Mayor ----------
  const M = mayor; let pos = V3(0, 0, 14), ry = 0, rz = 0, rx = 0, sq = [1, 1], hatY = 0, hatRx = 0, headY = 0, vis = true;
  if (sc === 'walk') { const turn = t > C.look1 && t < C.back1 + .2; pos = V3(mayorX(t), 0, WALK_Z); ry = -Math.PI / 2;
    if (!turn) { const u = (t % .42) / .42; pos.y = .1 * Math.sin(Math.PI * u); sq = hopShape(t, Math.floor(t / .42) * .42, .42); }
    else { ry = lerpAng(-Math.PI / 2, Math.PI / 2, eio(seg(t, C.look1, C.look1 + .35)) * (1 - eio(seg(t, C.back1 - .2, C.back1 + .15)))); rz = .25 * eio(seg(t, C.freeze1 + .3, C.freeze1 + .6)) * (1 - eio(seg(t, C.back1 - .4, C.back1 - .1))); } }
  else if (sc === 'freeze') { pos = V3(-.2, 0, WALK_Z); ry = lerpAng(-Math.PI / 2, Math.PI / 2, eio(seg(t, C.look2, C.look2 + .18)));
    if (t > C.ting - .3) { pos.x += .35 * eio(seg(t, C.ting - .3, C.ting + .2)); rx = .22 * eio(seg(t, C.ting - .3, C.ting + .2)); } }
  else if (sc === 'vet') { pos = vet.table.clone().add(V3(-.75, -.65, .2)); ry = Math.PI / 2;
    if (t > C.adopt - .6) { const u = seg(t, C.adopt - .6, C.adopt + .3); pos = pos.lerp(vet.adopt.clone().add(V3(-.9, 0, .4)), eio(u)); ry = yawTo(pos, vet.adopt); pos.y = .08 * Math.abs(Math.sin(u * Math.PI * 6)); }
    if (t > C.adopt + .9) { const p0 = vet.adopt.clone().add(V3(-.9, 0, .4)); pos = p0.lerp(VETWALK(t), eio(seg(t, C.adopt + .9, C.walk))); if (t > C.walk) pos = VETWALK(t); ry = Math.PI / 2; const u = (t % .5) / .5; pos.y = .05 * Math.sin(Math.PI * u); } }
  else if (sc === 'uni') { pos = HALL.clone().add(V3(1.2, 0, 2.5)); ry = yawTo(pos, prof.root.position); if (t > C.land + .3) rz = .25 * eio(seg(t, C.tiltAll, C.tiltAll + .3)); }
  else if (sc === 'adopt') { pos = V3(.0, 0, 11.6); ry = 0; hatRx = 0;
    if (t > C.lookUp) { rx = -.3 * eio(seg(t, C.lookUp, C.lookUp + .3)) * (1 - eio(seg(t, C.nod - .4, C.nod - .1))); headY = .02 * (t < C.nod ? 1 : 0); }
    if (t > C.nod) { rx = .18 * Math.sin(Math.PI * seg(t, C.nod, C.nod + .5)) + .1 * Math.sin(Math.PI * seg(t, C.nod + .5, C.nod + 1.0)); headY = -.02; } }
  else if (sc === 'cta') { pos = CTA.clone(); const k = Math.floor((t - C.S9) / .6), u = ((t - C.S9) % .6) / .6; pos.y = Math.sin(Math.PI * u) * .08; sq = hopShape(t, C.S9 + k * .6, .6); }
  else if (sc === 'outro') { pos = CTA.clone(); const h = seg(t, C.hatTip, C.hatTip + .3) * (1 - seg(t, C.hatTip + 1.0, C.hatTip + 1.4)); hatY = .3 * eo(h); hatRx = .35 * eo(h); }
  else vis = false;
  M.root.visible = vis; M.root.position.copy(pos); M.root.rotation.y = ry; M.body.rotation.set(rx, 0, rz); M.body.scale.set(sq[0], sq[1], sq[0]);
  M.hat.position.y = .27 + hatY; M.hat.rotation.set(-hatRx, 0, 0); M.head.position.y = .82 + headY;
  const glint = Math.max(seg(t, C.ting, C.ting + .1) * (1 - seg(t, C.ting + .25, C.ting + .6)), seg(t, C.lookUp + .3, C.lookUp + .4) * (1 - seg(t, C.lookUp + .55, C.lookUp + .9)), seg(t, C.sparkle, C.sparkle + .1) * (1 - seg(t, C.sparkle + .25, C.sparkle + .6)));
  M.goldM.emissive.setRGB(glint * .9, glint * .7, glint * .3);
  mayor.root.updateMatrixWorld(true);

  // ---------- the cat ----------
  let onHat = (sc === 'vet' && t > C.hat - .2) || sc === 'uni' || (sc === 'adopt' && t < C.catDown + .1) || (sc === 'outro' && t > C.hatTip + .35);
  let cp = null, cry = 0, pose = { t };
  if (sc === 'walk') { const frozen = t > C.freeze1 && t < C.back1 + .25; cp = V3(catX(t), 0, WALK_Z + .05); cry = -Math.PI / 2;
    pose = frozen ? { t, freeze: 1, tilt: .1 } : { t, walk: 1, ph: t * 16, tailUp: 1 }; if (!frozen) cp.y = .015 * Math.abs(Math.sin(t * 16)); }
  else if (sc === 'freeze') { cp = V3(-.2 + 1.55, .16, WALK_Z + .05); cry = -Math.PI / 2; pose = { t, freeze: 1, tailUp: 1.5, tilt: -.15, blink: t > C.blink && t < C.blink + .25 ? Math.sin(Math.PI * seg(t, C.blink, C.blink + .25)) : 0 }; }
  else if (sc === 'queue') { const LE = ENCL.find(e => e.k === 'lion'), lionEnc = LE.pos; cp = lionEnc.clone().add(V3(.55, 0, .84).normalize().multiplyScalar(LE.r)).setY(.55); cry = yawTo(cp, lionEnc) ; pose = { t, sit: 1, tilt: t > C.queue + 1.5 ? .35 * eio(seg(t, C.queue + 1.5, C.queue + 1.9)) : 0 }; }
  else if (sc === 'vet' && !onHat) { if (t < C.adopt) { cp = vet.table.clone().add(V3(0, .02, 0)); cry = Math.PI / 2; pose = { t, sit: 1, look: t > C.exam && t < C.sehat ? -.2 : 0 }; }
    else { const u = seg(t, C.adopt - .6, C.adopt + .3); cp = vet.table.clone().lerp(vet.adopt.clone().add(V3(-.6, .0, .45)), eio(u)); cp.y = Math.max(0, .65 * (1 - u)) + .1 * Math.sin(Math.PI * u); cry = yawTo(vet.table, vet.adopt); pose = { t, walk: u < 1 ? 1 : 0, ph: t * 14, sit: u >= 1 ? 1 : 0 };
      if (t > C.adopt + .6) { cp = vet.adopt.clone().add(V3(-.15, .02, .55)); cry = Math.PI / 2; pose = { t, sit: 1 }; } } }
  else if (sc === 'adopt' && !onHat) { const u = seg(t, C.catDown, C.catDown + .5); cp = V3(.0, 0, 11.6).add(V3(.25 + .35 * eio(u), 1.6 * (1 - u) + .3 * Math.sin(Math.PI * u), .1)); cry = -.8 + .6 * u;
    pose = { t, sit: t > C.catDown + .9 ? 1 : 0, purr: t > C.catDown + .5 ? 1 : 0, walk: t > C.catDown + .5 && t < C.catDown + .9 ? 1 : 0, ph: t * 10 };
    if (t > C.catDown + .5 && t < C.catDown + .9) { cp = V3(.6 - .3 * Math.sin(Math.PI * seg(t, C.catDown + .5, C.catDown + .9)), 0, 11.75); cry = -Math.PI / 2; } }
  else if (sc === 'cta') { cp = CAT_CTA.clone(); cry = 0; pose = { t, sit: 1, tilt: .3 * Math.sin(Math.PI * seg(t, C.card1, C.card1 + 1.0)) }; }
  else if (sc === 'outro' && !onHat) { const u = seg(t, C.hatTip + .1, C.hatTip + .35); cp = CAT_CTA.clone().add(V3(.4 * u, 1.7 * Math.sin(Math.PI * u * .5), 0)); pose = { t, sit: u < .2 ? 1 : 0 }; }
  if (onHat) { if (cat.root.parent !== mayor.hat) mayor.hat.add(cat.root); cat.root.position.set(0, .35, 0); cat.root.rotation.set(0, sc === 'outro' ? 0 : .4, 0); cat.root.scale.setScalar(1); cat.root.visible = true;
    pose = { t, sit: 1, look: sc === 'vet' && t > C.hat + .2 ? .3 * Math.max(0, Math.sin((t - C.hat) * 6)) : 0 }; }
  else { if (cat.root.parent !== scene) scene.add(cat.root); cat.root.visible = !!cp; if (cp) { cat.root.position.copy(cp); cat.root.rotation.set(0, cry, 0); } }
  cat.pose(pose);
  // the graduation cap: thrown by the Professor, it lands on the cat's head; later it lies by the Mayor's feet
  cap.visible = (sc === 'uni' && t > C.toss) || (sc === 'adopt');
  if (sc === 'uni' && t > C.toss) { const head = cat.head.getWorldPosition(V3(0, 0, 0)).add(V3(0, .1, 0)), from = prof.root.position.clone().add(V3(0, 1.0, 0)), u = clamp((t - C.toss) / (C.land - C.toss));
    const p = from.clone().lerp(head, u); p.y += Math.sin(Math.PI * u) * 2.2; cap.position.copy(t < C.land ? p : head); cap.rotation.set(t < C.land ? u * 9 : 0, t < C.land ? u * 4 : .6, t < C.land ? u * 3 : .25); }
  if (sc === 'adopt') { const u = seg(t, C.capDrop, C.capDrop + .4); cap.position.set(-.55, Math.max(.01, 1.5 * (1 - u * u)), 11.9); cap.rotation.set(0, .5, u < 1 ? u * 5 : 0); }
  return { sc, tw, lapse };
}

// ---------- camera ----------
const S = (t0, keys, o = {}) => ({ t0, tr: track(keys), ...o });
const deg = r => r * 180 / Math.PI;
const toOrbit = (T, P, fov) => { const d = P.distanceTo(T); return [T.x, T.y, T.z, d, deg(Math.asin((P.y - T.y) / d)), deg(Math.atan2(P.x - T.x, P.z - T.z)), fov]; };
const ZG = zoo.gate;
const SHOTS = [
  S(0, [[0, toOrbit(V3(1.6, .4, WALK_Z), V3(5.3, .9, WALK_Z + .1), 46)], [C.S2, toOrbit(V3(.9, .4, WALK_Z), V3(5.1, .9, WALK_Z + .1), 46)]], { near: true, dofA: 4 }),
  S(C.S2, [[C.S2, [30, 0, -24, 250, 46, 8, 50]], [C.S3, [30, 0, -26, 240, 45, 8, 50]]], { far: true }),
  S(C.S3, [[C.S3, [0, 0, -18, 100, 32, 2, 38]], [C.boardCut, [0, 0, -16, 94, 33, 0, 38]]], { far: true }),
  S(C.boardCut, [[C.boardCut, [0, 1.6, GATE_Z, 7.6, 5, 0, 34]], [C.grow, [0, 1.6, GATE_Z, 6.9, 5, 0, 34]]], { near: true }),
  S(C.grow, [[C.grow, [120, 2, 110, 58, 26, 28, 44]], [C.S4, [120, 2, 110, 54, 25, 24, 44]]], { far: true }),
  S(C.S4, [[C.S4, toOrbit(V3(.75, .5, WALK_Z), V3(.85, 1.2, WALK_Z + 3.9), 50)], [C.S5, toOrbit(V3(.85, .45, WALK_Z), V3(.9, 1.05, WALK_Z + 3.3), 50)]], { near: true, dofA: 4 }),
  S(C.S5, [[C.S5, [ZOO.x, 1.5, ZOO.z + 2, 44, 36, 25, 44]], [C.queue, [ZOO.x, 1.5, ZOO.z + 2, 40, 33, 15, 44]]], { far: true, dofA: 1 }),
  S(C.queue, [[C.queue, toOrbit(ZG.clone().add(V3(-1.5, 1.0, -4)), ZG.clone().add(V3(2.6, 2.4, 6.5)), 42)], [C.S6, toOrbit(ZG.clone().add(V3(-1.8, 1.0, -5)), ZG.clone().add(V3(2.2, 2.2, 5.4)), 42)]], { dofA: 3 }),
  S(C.S6, [[C.S6, toOrbit(V3(VET.x - 1, 2.5, VET.z + 1), V3(VET.x + 9, 7, VET.z + 20), 44)], [C.exam, toOrbit(V3(VET.x - 1, 2.3, VET.z + 1), V3(VET.x + 8, 6, VET.z + 18), 44)]], { far: true, dofA: 1 }),
  S(C.exam, [[C.exam, toOrbit(vet.table.clone().add(V3(.2, .1, 0)), vet.table.clone().add(V3(2.2, .9, 3.2)), 38)], [C.adopt - .6, toOrbit(vet.table.clone().add(V3(.2, .1, 0)), vet.table.clone().add(V3(2.0, .8, 2.8)), 38)]], { dofA: 4 }),
  S(C.adopt - .6, [[C.adopt - .6, toOrbit(vet.adopt.clone().add(V3(-1.5, .7, 0)), vet.adopt.clone().add(V3(1.5, 1.6, 5.5)), 40)], [C.walk, toOrbit(vet.adopt.clone().add(V3(-.5, .7, 1)), vet.adopt.clone().add(V3(2.5, 1.5, 5.5)), 40)]], { dofA: 4 }),
  S(C.walk, [[C.walk, toOrbit(VETWALK(C.walk).add(V3(0, .5, 0)), VETWALK(C.walk).add(V3(1.6, .8, 3.2)), 38)], [C.hat - .4, toOrbit(VETWALK(C.hat - .4).add(V3(0, .6, 0)), VETWALK(C.hat - .4).add(V3(1.4, .8, 3.0)), 38)], [C.hat + .2, toOrbit(VETWALK(C.hat).add(V3(0, 1.6, 0)), VETWALK(C.hat).add(V3(1.2, 2.0, 2.6)), 38)], [C.S7, toOrbit(VETWALK(C.S7).add(V3(0, 1.65, 0)), VETWALK(C.S7).add(V3(1.0, 2.05, 2.5)), 38)]], { dofA: 4 }),
  S(C.S7, [[C.S7, [UNI.x, 2, UNI.z, 60, 32, 20, 44]], [C.rektor, [UNI.x, 2, UNI.z, 54, 30, 14, 44]]], { far: true, dofA: 1 }),
  S(C.rektor, [[C.rektor, toOrbit(uni.front.clone().add(V3(0, 1.1, 1.2)), uni.front.clone().add(V3(2.6, 1.8, 6.5)), 40)], [C.toss - 1.0, toOrbit(uni.front.clone().add(V3(0, 1.0, 1.2)), uni.front.clone().add(V3(2.3, 1.7, 5.8)), 40)]], { dofA: 4 }),
  S(C.toss - 1.0, [[C.toss - 1.0, toOrbit(HALL.clone().add(V3(0, 1.2, 1.8)), HALL.clone().add(V3(4.5, 2.6, 7.0)), 42)], [C.S8, toOrbit(HALL.clone().add(V3(1.0, 1.5, 2.5)), HALL.clone().add(V3(3.6, 2.3, 6.4)), 40)]], { dofA: 3 }),
  S(C.S8, [[C.S8, toOrbit(V3(.1, 1.05, 11.7), V3(.4, 1.5, 15.6), 36)], [C.S9, toOrbit(V3(.15, .9, 11.8), V3(.4, 1.4, 15.0), 36)]], { near: true, dofA: 6 }),
  S(C.S9, [[C.S9, [CTA.x - .35, .95, CTA.z, 4.4, 4, 0, 36]], [C.S10, [CTA.x - .35, .95, CTA.z, 4.0, 4, 0, 36]]], { near: true, dofA: 7 }),
  S(C.S10, [[C.S10, [CTA.x - .2, 1.1, CTA.z, 4.4, 5, 0, 32]], [C.zoom, [CTA.x - .2, 1.1, CTA.z, 4.0, 5, 0, 32]], [C.zoom + 1.2, [-2, 4, 4, 44, 26, 6, 36]], [C.zoom + 3.4, [10, 0, -20, 470, 62, -6, 50]], [TL.dur, [12, 0, -22, 486, 63, -7, 50]]], { outro: true }),
];
function orbit([tx, ty, tz, d, pitch, az, fov]) { const p = pitch * Math.PI / 180, a = az * Math.PI / 180, T = V3(tx, ty, tz); return { pos: V3(tx + Math.sin(a) * Math.cos(p) * d, ty + Math.sin(p) * d, tz + Math.cos(a) * Math.cos(p) * d), T, fov, d }; }
function shot(t) {
  let s = SHOTS[0]; for (const x of SHOTS) if (t >= x.t0) s = x;
  const o = orbit(s.tr(t));
  const lift = s.outro ? lerp(0, .04, seg(t, C.zoom, C.zoom + 2.6)) * o.d : (s.near || s.dofA ? .0 : .085 * o.d);
  const dr = V3(Math.sin(t * .7) * .012 * o.d, Math.sin(t * .53 + 1) * .008 * o.d, 0);
  const far = s.far || (s.outro && t > C.zoom + 1);
  return { pos: o.pos.add(dr), look: o.T.clone().add(V3(0, lift, 0)), fov: o.fov, focus: o.d, A: s.dofA ?? (far ? 12 : 20), s };
}

// ---------- light: morning, the afternoon at the Kantor Mayor, dusk and night in the outro ----------
const cDay = [new THREE.Color('#7FC0EE'), new THREE.Color('#FBE9D6')], cMorn = [new THREE.Color('#8CC6EE'), new THREE.Color('#FCE3C8')], cDusk = [new THREE.Color('#B7A3DC'), new THREE.Color('#F8C0A0')], cNight = [new THREE.Color('#283563'), new THREE.Color('#4E5E92')];
const cGold = [new THREE.Color('#9DB8E8'), new THREE.Color('#FAD3A6')];
const tmpA = new THREE.Color(), tmpB = new THREE.Color();
function nightK(t) { return { dusk: seg(t, C.dusk, C.dusk + 1.4), night: seg(t, C.dusk + 1.2, C.night) }; }
function light(t, s, tw, sc, lapse) {
  let az = 70, el = 40, warm = 0, I = 2.5, morn = .5, gold = 0;
  if (lapse) { const p = clamp((tw % 3) / 3); az = lerp(80, 200, p); el = lerp(40, 58, Math.sin(Math.PI * p)); morn = 0; }
  if (sc === 'adopt' || sc === 'cta') { az = 215; el = 28; warm = .4; gold = .6; I = 2.3; morn = 0; }
  if (s.s.outro) { az = 230; el = lerp(18, 14, seg(t, C.S10, C.zoom)); warm = .55 * (1 - seg(t, C.zoom, C.dusk)); gold = 1 - seg(t, C.zoom, C.dusk + .4); morn = 0; }
  const { dusk, night } = nightK(t);
  warm = Math.max(warm, dusk * (1 - night)); el = lerp(el, 10, dusk); I = lerp(I, 1.4, dusk) * (1 - night);
  const a = az * Math.PI / 180, e = el * Math.PI / 180, T = s.look.clone(); T.y = 0;
  const half = clamp(s.focus * .75, 9, 170);
  sun.target.position.copy(T); sun.position.copy(T).add(V3(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)).multiplyScalar(half * 2.5));
  const scm = sun.shadow.camera; scm.left = scm.bottom = -half; scm.right = scm.top = half; scm.near = 1; scm.far = half * 6; scm.updateProjectionMatrix();
  sun.intensity = I; sun.color.setRGB(1, lerp(.95, .72, warm), lerp(.86, .55, warm));
  const farK = clamp((s.focus - 60) / 200);
  moon.intensity = lerp(.8, 1.35, farK) * night; renderer.toneMappingExposure = lerp(1, 1.18, night);
  hemi.intensity = lerp(1.05, lerp(.8, 1.0, farK), night); hemi.color.set('#D3E8FF').lerp(tmpA.set('#8697D8'), night); hemi.groundColor.set('#EAD6B4').lerp(tmpB.set('#46507A'), night);
  sky.top.value.copy(cDay[0]).lerp(cMorn[0], morn).lerp(cGold[0], gold * .6).lerp(cDusk[0], dusk).lerp(cNight[0], night);
  sky.hor.value.copy(cDay[1]).lerp(cMorn[1], morn).lerp(cGold[1], gold * .8).lerp(cDusk[1], dusk).lerp(cNight[1], night);
  sky.warm.value = 0; scene.fog.color.copy(sky.hor.value); scene.fog.near = Math.max(260, s.focus * 1.1); scene.fog.far = Math.max(900, s.focus * 3.2);
  stars.material.opacity = night;
  cloudM.emissiveIntensity = .35 * (1 - night); cloudM.color.setScalar(1 - .45 * night); mtn.clouds.children[0].children[0].material.emissiveIntensity = .3 * (1 - night);
  vu.warm.value = .25 + .35 * warm - .2 * night; vu.sat.value = lerp(1.42, 1.25, night);
  post.bloom.strength = .12 + .55 * night; post.bloom.threshold = lerp(1.6, .7, night);
  const lk = t >= C.lights ? Math.max(.6, seg(t, C.lights - .05, C.lights + .1) * clamp(dusk * 2)) : 0;
  metro.night(t, lk, C.lights); town.night(t, lk);
  for (const m of officeWin) m.emissiveIntensity = t >= C.lights + .4 ? 1.6 : 0;
  boardMat.emissiveIntensity = t >= C.boardGlow - .3 ? .85 * seg(t, C.boardGlow - .3, C.boardGlow) : 0;
  const nk = t >= C.nature ? 1 : 0;
  river.lampM.emissiveIntensity = 2.2 * nk * lk; beach.towerLampM.emissiveIntensity = 2.4 * nk * lk; beach.gateLampM.emissiveIntensity = 2.4 * (t >= C.nature + .2 ? 1 : 0) * lk;
  mall.night((t >= C.lights + .45 ? 1 : 0) * lk); library.night((t >= C.lights + .5 ? 1 : 0) * lk);
  airport.night(nk * lk, t); port.night((t >= C.nature + .15 ? 1 : 0) * lk, t); sports.night((t >= C.nature + .3 ? 1 : 0) * lk);
  vet.night((t >= C.lights + .55 ? 1 : 0) * lk); uni.night((t >= C.lights + .7 ? 1 : 0) * lk); zoo.night(nk * lk); lab.night((t >= C.nature + .2 ? 1 : 0) * lk, t);
  if (night > 0) { tower.light(() => 1, 1, t); tower.crowns.forEach((c, j) => tower.crown(j, 1, 1, t)); tower.haloOn(nk, t); tower.neon(lk); tower.env(.3); }
  flies.update(t, night * seg(t, C.nature, C.nature + 1.2));
  const mo = night * seg(t, C.monument, C.monument + .35), mon = metro.monument;
  mon.obM.emissiveIntensity = 1.6 * mo; mon.bubM.emissiveIntensity = .9 * mo; mon.heartM.emissiveIntensity = 1.0 * mo; mon.glow.intensity = 60 * mo;
}

const ui = makeUI(document.getElementById('ui'), TL);
const tmp = new THREE.Vector3();
const project = v => { tmp.copy(v).project(camera); return [(tmp.x + 1) / 2 * W, (1 - tmp.y) / 2 * H, tmp.z < 1]; };
window.render = t => {
  const st = act(t);
  const camQ = Q.get('cam'), master = Q.get('master');
  const s = camQ ? (() => { const o = orbit(camQ.split(',').map(Number)); return { pos: o.pos, look: o.T, fov: o.fov, focus: o.d, A: 8, s: {} }; })() : shot(t);
  camera.fov = s.fov; camera.position.copy(s.pos); camera.lookAt(s.look); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  light(t, s, st.tw, st.sc, st.lapse);
  const mc = V3(MT.x, 40 * MT.F, MT.z), hd = Math.hypot(camera.position.x - mc.x, camera.position.z - mc.z), elev = Math.atan2(camera.position.y - mc.y, hd) * 180 / Math.PI;
  belt.update(t, Q.has('nobelt') ? 0 : clamp((26 - elev) / 10), nightK(t).night); belt.root.visible = !Q.has('nobelt') && elev < 26;
  const ck = clamp((30 - elev) / 8); mtn.clouds.visible = ck > 0; mtn.clouds.children.forEach(c => c.children.forEach(b => b.scale.set(Math.max(.001, ck), .62 * Math.max(.001, ck), Math.max(.001, ck))));
  clouds.position.x = t * .8;
  post.dof.focus = s.focus; post.dof.aper = s.A * s.focus * (Q.has('nodof') ? 0 : 1); post.dof.maxCoc = 20;
  post.composer.render();
  mayor.head.updateMatrixWorld(true);
  if (!master && !Q.has('noui')) ui.draw(t, { glasses: project(mayor.head.localToWorld(V3(0, .02, .3))), board: project(V3(0, 2.9, GATE_Z)), cat: project(cat.head.getWorldPosition(V3(0, 0, 0))), tw: st.tw, lapse: st.lapse, sc: st.sc });
};
window.READY = true;
