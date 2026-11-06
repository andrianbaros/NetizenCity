// Side video (between Day 8 and Day 9): the Menara Investor Netizen City, a thank-you to the 103 Investor Kota.
// An 11-storey twisted tower (each floor turned a little from the one below) in a pearlescent opal finish, the only glossy building in
// the city; ten round windows a floor, one window = one investor (100 lit on floors 1-10; on floor 11 the three big Crown Windows of the
// Investor Utama Musim 1, gold, silver and rose gold, and seven windows still dark); a floating butter-yellow halo ring over the roof;
// the roof terrace with its neon "TERIMA KASIH, INVESTOR KOTA"; a tall arched lobby door, a blush-pink carpet, a round fountain; a round
// glass lift up the south face. Shorter than the Monument. The lobby inside is a set of its own: the fountain, the carpet and the
// two-storey name wall, the three crown panels at the top.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { hash, clamp } from '/core/lib.js';
import { signTex } from './world.js';

const TAU = Math.PI * 2;
const mat = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: .78, metalness: 0, flatShading: true, ...o });
const sh = m => { m.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } }); return m; };
function canvasTex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; }

const OPAL = ['#DCCBF4', '#D3E6F4', '#C8EEDF', '#E4F0D2', '#F6DCCB', '#F4CFE0'];
export const TOWER = { x: 22, z: -80, floors: 11, fh: 1.9, w: 5.4, twist: 6 * Math.PI / 180 };
TOWER.top = TOWER.floors * TOWER.fh;                                                // the roof (world y)
export const TOP = ['Ruchan', 'ARIF AL. A', 'Riiki_ajah'];
export const CROWN = [{ name: 'Ruchan', rim: '#E8B84A', glow: '#FFD878', a: 0 }, { name: 'ARIF AL. A', rim: '#CDD2DC', glow: '#E8F0FF', a: -2 * Math.PI / 3 }, { name: 'Riiki_ajah', rim: '#E8A598', glow: '#FFC4B8', a: 2 * Math.PI / 3 }];
export const NAMES = ['Denis BP', 'Desmonddash', 'padill', 'Tegasadi', 'KhieRaz', 'Robby', 'Ezra Naufanza', 'amd afd', 'wilzstone', 'Crispi', 'risky070327', '@mulkesukanabung', 'kautsar', 'zaki',
  'Fdzz Ganteng', 'Ken', '_tempelode', 'Serda Yudha', 'Dikaa', 'Junn', 'nauraanuraa', 'Dhisky', 'Andreanzipa', 'Fdepaul', 'HAIRAL', 'Suliong', 'Ilmiya', 'thesanzampah', 'Ageng Setyono', 'Cwaalopbecky',
  'Jalil/ubay', 'Daryl', 'DANAR CEO', 'Hikaruseiji', 'atroxx', 'sasau', 'Iky', 'luthfinichol', 'Widia Andayani kusuma', 'Ridho kirana', 'Muhammad Zulfikar', 'orang baik', 'ropz imut',
  'Alvin7331_netizencity', 'cenzioo', 'Sir Zay', 'Fiqri', 'Dewanda Yudistira', 'AmdAfd', 'AQILAIMUT', 'muhammd rizky m.d', 'Sidiqq', 'Seseorang', 'Orang. Baik', 'kiaaa', 'Luna', 'Hansennn', 'thiago',
  'Matthew L.', 'Rafifa', 'Lintang Pratama', 'jakaSembiring', 'NassYukio', 'hadi', 'Fauzi', 'Fayyadl', 'Putra', 'Someone', 'Michael louis', 'Salman Gantenkxx', 'bugroq', 'SekhAlbert', 'mairaaa', 'Zaidan',
  'Ezzar Kalea Arfianda', 'Satria Aprilio', 'Seseorang', 'blesstakece', 'Kobe', 'Muhammad Ridwan', 'Evan', 'Vyns', 'Ishigami Senku', 'Darma', 'Sheena semira', 'junet', 'LieGabeiel', 'Seseorang', 'Jemy',
  'edward muharom', 'ian blair', 'Christiansss:)', 'M.priyo_b.p', 'Itz_Iz', 'Joy_AJa', 'aeri', 'caca', 'Elseid', 'Seseorang', 'lutfi'];

// the floor plate: a rounded square, w x w, corners rounded
function plate(w, r) { const s = new THREE.Shape(), h = w / 2;
  s.moveTo(-h + r, -h); s.lineTo(h - r, -h); s.quadraticCurveTo(h, -h, h, -h + r); s.lineTo(h, h - r); s.quadraticCurveTo(h, h, h - r, h);
  s.lineTo(-h + r, h); s.quadraticCurveTo(-h, h, -h, h - r); s.lineTo(-h, -h + r); s.quadraticCurveTo(-h, -h, -h + r, -h); return s; }
// ten windows a floor on the faces of the plate (3 on south and north, 2 on east and west), as [x, z, outward yaw] in the floor's frame
const SLOTS = (() => { const h = TOWER.w / 2 + .02, o = [];
  for (const x of [-1.5, 0, 1.5]) o.push([x, h, 0]); for (const z of [-1, 1]) o.push([h, z, Math.PI / 2]);
  for (const x of [1.5, 0, -1.5]) o.push([x, -h, Math.PI]); for (const z of [1, -1]) o.push([-h, z, -Math.PI / 2]); return o; })();
export const CROWN_SLOTS = [1, 9, 4];                                          // floor 11: the Crown Windows face front, left (west) and right (east)
const TOP_DARK = [0, 2, 3, 5, 6, 7, 8];                                              // ... and the seven windows still dark
export function makeTower(renderer) {
  const root = new THREE.Group(); root.position.set(TOWER.x, 0, TOWER.z);
  const env = new THREE.PMREMGenerator(renderer).fromScene(new RoomEnvironment(), .04).texture;
  const pearl = new THREE.MeshPhysicalMaterial({ color: '#E2D2F6', roughness: .12, metalness: .15, clearcoat: 1, clearcoatRoughness: .06, iridescence: 1, iridescenceIOR: 2.0,
    iridescenceThicknessRange: [250, 900], envMap: env, envMapIntensity: 1.1, sheen: .8, sheenRoughness: .4, sheenColor: new THREE.Color('#BFF2DE') });
  const band = new THREE.MeshPhysicalMaterial({ color: '#FFFFFF', roughness: .25, metalness: .2, clearcoat: 1, envMap: env, envMapIntensity: .7 });
  const floors = [];
  const slab = new THREE.ExtrudeGeometry(plate(TOWER.w, 1.2), { depth: TOWER.fh - .16, bevelEnabled: true, bevelThickness: .06, bevelSize: .06, bevelSegments: 2, curveSegments: 6 }).rotateX(-Math.PI / 2);
  const ring = new THREE.ExtrudeGeometry(plate(TOWER.w + .22, 1.3), { depth: .14, bevelEnabled: false, curveSegments: 6 }).rotateX(-Math.PI / 2);
  // windows: one instanced mesh of round panes (gold when lit, dusk-blue when dark), white rims
  const nWin = TOWER.floors * 10, pane = new THREE.InstancedMesh(new THREE.CircleGeometry(.34, 20), new THREE.MeshBasicMaterial({ color: '#ffffff' }), nWin);
  const rims = new THREE.InstancedMesh(new THREE.TorusGeometry(.36, .05, 6, 20), mat('#FFFFFF', { roughness: .3, metalness: .3 }), nWin);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), E = new THREE.Euler(), P = new THREE.Vector3(), Sv = new THREE.Vector3(1, 1, 1);
  const WIN = [];                                                                     // per window: floor, slot, world-ish local position
  for (let f = 0; f < TOWER.floors; f++) {
    const g = new THREE.Group(); g.position.y = f * TOWER.fh; g.rotation.y = f * TOWER.twist; root.add(g); floors.push(g);
    const op = pearl.clone(); op.color.set(OPAL[f % OPAL.length]); op.sheenColor = new THREE.Color(OPAL[(f + 2) % OPAL.length]);
    g.add(new THREE.Mesh(slab, op)); const r = new THREE.Mesh(ring, band); r.position.y = TOWER.fh - .16; g.add(r);
    SLOTS.forEach(([x, z, yaw], k) => { const crown = f === TOWER.floors - 1 && CROWN_SLOTS.includes(k); const i = f * 10 + k;
      const c = Math.cos(g.rotation.y), s = Math.sin(g.rotation.y), lx = x * c + z * s, lz = -x * s + z * c, ly = f * TOWER.fh + TOWER.fh * .52;
      E.set(0, yaw + g.rotation.y, 0); Q.setFromEuler(E); const out = new THREE.Vector3(Math.sin(yaw + g.rotation.y), 0, Math.cos(yaw + g.rotation.y));
      M.compose(P.set(lx + out.x * .02, ly, lz + out.z * .02), Q, crown ? Sv.set(0, 0, 0) : Sv.set(1, 1, 1)); pane.setMatrixAt(i, M);
      M.compose(P.set(lx + out.x * .03, ly, lz + out.z * .03), Q, crown ? Sv.set(0, 0, 0) : Sv.set(1, 1, 1)); rims.setMatrixAt(i, M);
      WIN.push({ f, k, crown, dark: f === TOWER.floors - 1 && TOP_DARK.includes(k), p: new THREE.Vector3(lx, ly, lz), out }); });
  }
  root.add(pane, rims);
  // the Crown Windows on floor 11: three times the size, gold / silver / rose-gold rims with the names, a soft beam to the sky each
  const crowns = CROWN.map((cw, j) => { const w = WIN.find(o => o.f === TOWER.floors - 1 && o.k === CROWN_SLOTS[j]);
    const g = new THREE.Group(); g.position.copy(w.p).addScaledVector(w.out, .05); g.rotation.y = Math.atan2(w.out.x, w.out.z); root.add(g);
    const glass = new THREE.MeshBasicMaterial({ color: '#2A3050' }); const d = new THREE.Mesh(new THREE.CircleGeometry(.78, 32), glass); g.add(d);
    const rimM = new THREE.MeshPhysicalMaterial({ color: cw.rim, metalness: .9, roughness: .22, clearcoat: 1, envMap: env, envMapIntensity: 1.2, emissive: cw.glow, emissiveIntensity: 0 });
    g.add(new THREE.Mesh(new THREE.TorusGeometry(.82, .1, 10, 40), rimM));
    for (let k = 0; k < 12; k++) { const a = k / 12 * TAU, gem = new THREE.Mesh(new THREE.OctahedronGeometry(.07, 0), rimM); gem.position.set(Math.cos(a) * .82, Math.sin(a) * .82, .08); g.add(gem); }
    const label = canvasTex(512, 96, (x, cw2, ch) => { x.fillStyle = cw.rim; x.font = '60px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(cw.name, cw2 / 2, ch / 2 + 3); });
    const lm = new THREE.Mesh(new THREE.PlaneGeometry(1.5, .28), new THREE.MeshBasicMaterial({ map: label, transparent: true, depthWrite: false })); lm.position.set(0, -1.05, .03); g.add(lm);
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(.5, 2.2, 22, 20, 1, true).translate(0, 11, 0), new THREE.MeshBasicMaterial({ color: cw.glow, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }));
    beam.rotation.x = -.95; beam.position.z = .2; g.add(beam);
    return { g, glass, rimM, beam, label: lm, glow: new THREE.Color(cw.glow) }; });
  // the roof terrace, the railing, the neon "TERIMA KASIH, INVESTOR KOTA"
  const roof = new THREE.Group(); roof.position.y = TOWER.top; roof.rotation.y = TOWER.floors * TOWER.twist; root.add(roof);
  roof.add(new THREE.Mesh(new THREE.ExtrudeGeometry(plate(TOWER.w + .3, 1.3), { depth: .22, bevelEnabled: false, curveSegments: 6 }).rotateX(-Math.PI / 2), band));
  roof.add(new THREE.Mesh(new THREE.BoxGeometry(TOWER.w - .6, .04, TOWER.w - .6).translate(0, .25, 0), mat('#E9DFCD', { roughness: .9 })));
  for (let k = 0; k < 28; k++) { const u = k / 28, side = Math.floor(u * 4), v = (u * 4) % 1, h = TOWER.w / 2 + .05, a = -h + v * 2 * h;
    const [px, pz] = [[a, h], [h, -a], [-a, -h], [-h, a]][side]; roof.add(new THREE.Mesh(new THREE.CylinderGeometry(.025, .025, .55, 5).translate(px, .5, pz), band)); }
  for (const [x, z, ry] of [[0, TOWER.w / 2 + .05, 0], [TOWER.w / 2 + .05, 0, Math.PI / 2], [0, -TOWER.w / 2 - .05, 0], [-TOWER.w / 2 - .05, 0, Math.PI / 2]]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(TOWER.w, .05, .05), band); rail.position.set(x, .78, z); rail.rotation.y = ry; roof.add(rail); }
  const neonT = signTex((x, v, w, h) => { x.clearRect(0, 0, w, h); x.fillStyle = 'rgba(40,30,60,.85)'; x.beginPath(); x.roundRect(6, 6, w - 12, h - 12, 30); x.fill();
    x.strokeStyle = '#FFD878'; x.lineWidth = 8; x.stroke(); x.shadowColor = '#FFB3D6'; x.shadowBlur = 26; x.fillStyle = '#FFE6F2'; x.font = '74px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('TERIMA KASIH,', w / 2, h * .34); x.fillStyle = '#FFF4C8'; x.shadowColor = '#FFD878'; x.fillText('INVESTOR KOTA', w / 2, h * .7); }, 1024, 300); neonT.set(1);
  const neonM = new THREE.MeshStandardMaterial({ map: neonT.t, emissiveMap: neonT.t, emissive: '#FFFFFF', emissiveIntensity: .2, transparent: true, roughness: .5 });
  const neon = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 1.23), neonM); neon.position.set(0, 1.55, -TOWER.w / 2 + .45); neon.rotation.y = 0; roof.add(neon);
  for (const s of [-1, 1]) roof.add(new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, 1.2, 6).translate(s * 1.8, .8, -TOWER.w / 2 + .4), band));
  // the halo: a floating butter-yellow ring that turns slowly over the roof
  const halo = new THREE.Group(); halo.position.y = TOWER.top + 3.0; root.add(halo);
  const haloM = new THREE.MeshStandardMaterial({ color: '#F7D772', emissive: '#FFE08A', emissiveIntensity: .1, roughness: .3, metalness: .3 });
  const haloR = new THREE.Mesh(new THREE.TorusGeometry(2.4, .17, 14, 64), haloM); haloR.rotation.x = Math.PI / 2 - .12; halo.add(haloR);
  for (let k = 0; k < 8; k++) { const s = new THREE.Mesh(new THREE.OctahedronGeometry(.16, 0), haloM); const a = k / 8 * TAU; s.position.set(Math.cos(a) * 2.4, .0, Math.sin(a) * 2.4); haloR.add(s); s.position.set(Math.cos(a) * 2.4, Math.sin(a) * 2.4, 0); }
  // the lobby door: a tall arch on the south face, blush-pink frame, glass; the carpet and the round fountain in front
  const lobby = new THREE.Group(); lobby.position.set(0, 0, TOWER.w / 2 + .02); root.add(lobby);
  const archS = new THREE.Shape(); archS.moveTo(-1.0, 0); archS.lineTo(-1.0, 2.2); archS.absarc(0, 2.2, 1.0, Math.PI, 0, true); archS.lineTo(1.0, 0); archS.lineTo(1.25, 0); archS.lineTo(1.25, 2.2); archS.absarc(0, 2.2, 1.25, 0, Math.PI, false); archS.lineTo(-1.25, 0);
  lobby.add(new THREE.Mesh(new THREE.ExtrudeGeometry(archS, { depth: .25, bevelEnabled: false, curveSegments: 16 }), mat('#F2B8C6', { roughness: .4 })));
  const doorS = new THREE.Shape(); doorS.moveTo(-1.0, 0); doorS.lineTo(-1.0, 2.2); doorS.absarc(0, 2.2, 1.0, Math.PI, 0, true); doorS.lineTo(1.0, 0);
  const doorM = new THREE.MeshStandardMaterial({ color: '#BFE3F2', roughness: .1, metalness: .2, emissive: '#FFD9A0', emissiveIntensity: 0 });
  lobby.add(new THREE.Mesh(new THREE.ShapeGeometry(doorS, 16), doorM).translateZ(.05));
  lobby.add(new THREE.Mesh(new THREE.BoxGeometry(.04, 3.2, .02).translate(0, 1.6, .07), mat('#FFFFFF')));
  root.add(new THREE.Mesh(new THREE.BoxGeometry(1.6, .03, 6.0).translate(0, .03, TOWER.w / 2 + 3.0), mat('#F2A0B4', { roughness: .9 })));
  root.add(new THREE.Mesh(new THREE.BoxGeometry(10, .05, 9).translate(0, .025, TOWER.w / 2 + 3.6), mat('#E9DFCD', { roughness: .95 })));
  const basin = new THREE.Group(); basin.position.set(0, 0, TOWER.w / 2 + 7.2); root.add(basin);
  basin.add(new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.6, .45, 32).translate(0, .22, 0), mat('#F7ECD6')));
  basin.add(new THREE.Mesh(new THREE.CylinderGeometry(1.32, 1.32, .06, 32).translate(0, .42, 0), mat('#9FD3EC', { roughness: .15, emissive: '#9FD3EC', emissiveIntensity: .1 })));
  basin.add(new THREE.Mesh(new THREE.CylinderGeometry(.12, .2, 1.2, 10).translate(0, .6, 0), mat('#F7ECD6')));
  const jet = new THREE.Mesh(new THREE.ConeGeometry(.22, 1.0, 10).translate(0, 1.7, 0), new THREE.MeshStandardMaterial({ color: '#E8F6FC', transparent: true, opacity: .75, roughness: .1 })); basin.add(jet);
  // the glass lift: a round glass tube up the south face, a little cabin that rides it
  const liftX = 2.9, liftZ = TOWER.w / 2 + 1.25;
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(.62, .62, TOWER.top + .6, 24, 1, true).translate(liftX, (TOWER.top + .6) / 2, liftZ),
    new THREE.MeshStandardMaterial({ color: '#E8F6FF', roughness: .05, metalness: .1, transparent: true, opacity: .28, depthWrite: false, side: THREE.DoubleSide })); root.add(tube);
  for (let k = 0; k <= TOWER.floors; k++) root.add(new THREE.Mesh(new THREE.TorusGeometry(.63, .035, 6, 24).rotateX(Math.PI / 2).translate(liftX, k * TOWER.fh + .05, liftZ), band));
  root.add(new THREE.Mesh(new THREE.BoxGeometry(.5, TOWER.top, .1).translate(liftX, TOWER.top / 2, liftZ - .7), band));
  const cabin = new THREE.Group(); cabin.position.set(liftX, 0, liftZ); root.add(cabin);
  cabin.add(new THREE.Mesh(new THREE.CylinderGeometry(.52, .52, .12, 20).translate(0, .06, 0), mat('#F7D772', { metalness: .4, roughness: .3 })));
  cabin.add(new THREE.Mesh(new THREE.CylinderGeometry(.52, .52, .1, 20).translate(0, 1.65, 0), mat('#F7D772', { metalness: .4, roughness: .3 })));
  const cabinLight = new THREE.PointLight('#FFE0B0', 0, 4, 2); cabinLight.position.y = 1.4; cabin.add(cabinLight);
  sh(root); tube.castShadow = false;
  const T = { root, floors, pane, rims, WIN, crowns, halo, haloM, neonM, doorM, jet, cabin, cabinLight, env, liftX, liftZ, pearl };
  const cOn = new THREE.Color('#FFD27A'), cOff = new THREE.Color('#2E3656'), cDay = new THREE.Color('#BFD6EE'), tmp = new THREE.Color();
  // windows: lit(i) -> 0..1 for each of the 110 windows (the crown slots are separate); night: how much the lit ones glow
  T.light = (lit, night, t) => {
    WIN.forEach((w, i) => { if (w.crown) return; const k = w.dark ? 0 : lit(w); tmp.copy(night > .5 ? cOff : cDay).lerp(cOn, k).multiplyScalar(1 + (night > .5 ? 1.3 * k : .25 * k)); pane.setColorAt(i, tmp); });
    pane.instanceColor.needsUpdate = true; };
  T.crown = (j, k, night, t) => { const c = crowns[j]; c.glass.color.set('#2A3050').lerp(c.glow, k).multiplyScalar(1 + 1.4 * k * night); c.rimM.emissiveIntensity = .9 * k;
    c.beam.material.opacity = .22 * k * night * (.85 + .15 * Math.sin(t * 3 + j)); c.label.material.opacity = .4 + .6 * k; };
  T.haloOn = (k, t) => { haloM.emissiveIntensity = .1 + 2.0 * k; halo.rotation.y = t * .35; halo.position.y = TOWER.top + 3.0 + Math.sin(t * 1.2) * .12; };
  T.neon = k => { neonM.emissiveIntensity = .2 + 1.6 * k; };
  const opals = []; floors.forEach(g => g.traverse(o => { if (o.isMesh && o.material.iridescence) opals.push(o.material); }));
  T.env = k => opals.forEach(m => { m.envMapIntensity = 1.1 * k; m.sheen = .8 * k; });               // dark city: the pearl only catches a little light
  return T;
}

// ---------- the lobby: a set of its own, far from the city (only seen inside) ----------
export const LOBBY = new THREE.Vector3(0, 0, -520);
function nameWall() {                                                                // the two-storey wall: three crown panels at the top, then 100 names in gold, five a row
  return canvasTex(2048, 1600, (x, w, h) => {
    const g = x.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#5A3E6E'); g.addColorStop(1, '#3E2C52'); x.fillStyle = g; x.fillRect(0, 0, w, h);
    x.strokeStyle = 'rgba(255,216,120,.55)'; x.lineWidth = 10; x.strokeRect(20, 20, w - 40, h - 40);
    // the crown panels (the middle one a little higher): their names are drawn by makeLobby's panel meshes, so they can light one by one
    x.fillStyle = 'rgba(255,230,170,.18)'; x.font = '34px "Lilita One"'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#FFE3A0'; x.fillText('INVESTOR UTAMA • MUSIM 1', w / 2, 452);
    x.strokeStyle = 'rgba(255,216,120,.4)'; x.lineWidth = 4; x.beginPath(); x.moveTo(160, 500); x.lineTo(w - 160, 500); x.stroke();
    x.fillStyle = '#FFD878'; x.font = '44px "Lilita One"'; x.fillText('INVESTOR KOTA NETIZEN CITY', w / 2, 560);
    const cols = 5, cw = (w - 200) / cols, rowH = 48, y0 = 640;
    NAMES.forEach((n, i) => { const r = Math.floor(i / cols), c = i % cols; x.font = '36px "Fredoka"'; x.fillStyle = n === 'Seseorang' ? '#FFE9B0' : '#F2D08A'; x.fillText(n, 100 + cw * (c + .5), y0 + r * rowH); });
  });
}
export const nameAt = i => ({ u: (100 + (2048 - 200) / 5 * ((i % 5) + .5)) / 2048, v: (640 + Math.floor(i / 5) * 48) / 1600 });   // a name's place on the wall (0..1)
export const WALL = { w: 9.6, h: 7.5, z: -4.0 };                                    // the wall (in the lobby's frame), centred, its foot at y = 0
export function makeLobby() {
  const root = new THREE.Group(); root.position.copy(LOBBY);
  const floorT = canvasTex(512, 512, (x, w, h) => { for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) { x.fillStyle = (i + j) % 2 ? '#F4ECE0' : '#FBF6EE'; x.fillRect(i * 64, j * 64, 64, 64); } });
  floorT.wrapS = floorT.wrapT = THREE.RepeatWrapping; floorT.repeat.set(3, 3);
  root.add(new THREE.Mesh(new THREE.BoxGeometry(14, .1, 14).translate(0, -.05, 0), new THREE.MeshStandardMaterial({ map: floorT, roughness: .3, metalness: .05 })));
  const wallM = mat('#F7ECE4', { roughness: .8 });
  for (const [x, z, w, d] of [[-7, 0, .3, 14], [7, 0, .3, 14]]) root.add(new THREE.Mesh(new THREE.BoxGeometry(w, 9, d).translate(x, 4.5, z), wallM));
  root.add(new THREE.Mesh(new THREE.BoxGeometry(14, .3, 14).translate(0, 9, 0), mat('#FBF6EE')));
  for (const x of [-5.6, 5.6]) for (const z of [-2, 2.5]) root.add(new THREE.Mesh(new THREE.CylinderGeometry(.32, .38, 9, 16).translate(x, 4.5, z), mat('#FFFFFF', { roughness: .4 })));
  // the name wall, framed in gold; three crown panels at its top
  const wall = new THREE.Mesh(new THREE.PlaneGeometry(WALL.w, WALL.h).translate(0, WALL.h / 2, 0), new THREE.MeshStandardMaterial({ map: nameWall(), roughness: .6, emissive: '#FFFFFF', emissiveIntensity: .0 }));
  wall.position.z = WALL.z; root.add(wall);
  root.add(new THREE.Mesh(new THREE.BoxGeometry(WALL.w + .4, WALL.h + .4, .2).translate(0, WALL.h / 2, WALL.z - .12), mat('#D9A24A', { metalness: .7, roughness: .3 })));
  const panels = CROWN.map((cw, j) => { const order = [1, 0, 2][j], g = new THREE.Group(); g.position.set([0, -2.05, 2.05][j], WALL.h - (j === 0 ? 1.05 : 1.35), WALL.z + .06); root.add(g);
    const tex = canvasTex(700, 300, (x, w, h) => { const gr = x.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#FFE7A8'); gr.addColorStop(1, '#E2B65C'); x.fillStyle = gr; x.beginPath(); x.roundRect(8, 8, w - 16, h - 16, 30); x.fill();
      x.strokeStyle = cw.rim; x.lineWidth = 16; x.stroke(); x.fillStyle = '#7A4E1C'; x.font = '62px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('👑', w / 2, 70);
      x.font = `${cw.name.length > 8 ? 74 : 86}px "Lilita One"`; x.fillStyle = '#5A3A14'; x.fillText(cw.name.toUpperCase(), w / 2, 168); x.font = '28px "Lilita One"'; x.fillStyle = '#7A5A2A'; x.fillText('INVESTOR UTAMA • MUSIM 1', w / 2, 248); });
    const m = new THREE.MeshStandardMaterial({ map: tex, emissiveMap: tex, emissive: '#FFFFFF', emissiveIntensity: 0, roughness: .4, metalness: .2 });
    const s = j === 0 ? 1.1 : .92; const p = new THREE.Mesh(new THREE.PlaneGeometry(1.95 * s, .84 * s), m); g.add(p); return { g, m, order }; });
  // the carpet and the round fountain in the middle of the hall
  root.add(new THREE.Mesh(new THREE.BoxGeometry(1.8, .02, 12).translate(0, .01, 2.5), mat('#F2A0B4', { roughness: .95 })));
  const f = new THREE.Group(); f.position.set(0, 0, 3.6); root.add(f);
  f.add(new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.5, .5, 32).translate(0, .25, 0), mat('#FFFFFF', { roughness: .35 })));
  f.add(new THREE.Mesh(new THREE.CylinderGeometry(1.24, 1.24, .05, 32).translate(0, .47, 0), mat('#9FD3EC', { roughness: .1, emissive: '#9FD3EC', emissiveIntensity: .15 })));
  f.add(new THREE.Mesh(new THREE.CylinderGeometry(.14, .22, 1.0, 12).translate(0, .9, 0), mat('#FFFFFF')));
  const jet = new THREE.Mesh(new THREE.ConeGeometry(.12, .7, 10).translate(0, 1.6, 0), new THREE.MeshStandardMaterial({ color: '#E8F6FC', transparent: true, opacity: .6, roughness: .1, emissive: '#BFE6F5', emissiveIntensity: .3 })); f.add(jet);
  const lamp = new THREE.PointLight('#FFE3B8', 30, 18, 2); lamp.position.set(0, 7, 3); root.add(lamp);
  const lamp2 = new THREE.PointLight('#FFE3B8', 14, 12, 2); lamp2.position.set(0, 3, -1.5); root.add(lamp2);
  sh(root);
  return { root, wall, panels, jet, fountain: f };
}
