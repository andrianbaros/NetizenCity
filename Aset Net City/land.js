// Day 5: where the Kawasan Alam lies, outside the west side of the city (shared by the ground in world.js and the scenery in nature.js).
// The mountain in the north-west, its waterfall on the south face into a round pool, the river winding south outside the city
// (behind the Kawasan Kerukunan and the Fasilitas district), into the sea in the south-west, where Netizen Beach is.
import * as THREE from 'three';
import { clamp } from '/core/lib.js';

// the mountain: far higher than the Monument, outside the city. F: its scale over the first build (R0 52, H 66), which the revision found too small
export const MT = { x: -228, z: -190, F: 1.6 }; MT.R0 = 52 * MT.F; MT.H = 66 * MT.F;
export const TW = Math.PI / 2 + .08;                                   // the waterfall's bearing on the mountain (south face)
export const POOL = { x: MT.x + Math.cos(TW) * 61 * MT.F, z: MT.z + Math.sin(TW) * 61 * MT.F, r: 6.5 * MT.F };
export const RIVER = [[POOL.x + .8, POOL.z + 9], [-226, -64], [-206, -40], [-184, -14], [-171, 12], [-175, 36], [-172, 60], [-180, 84], [-196, 106], [-215, 122], [-241, 135]];
export const riverCurve = new THREE.CatmullRomCurve3(RIVER.map(([x, z]) => new THREE.Vector3(x, 0, z)), false, 'catmullrom', .5);
const RP = riverCurve.getSpacedPoints(240);
export const riverWidth = u => 3.4 + 3.2 * u;
export function riverDist(x, z) {                                       // distance to the river's centre line, and where along it (0..1)
  let best = 1e9, bu = 0;
  for (let i = 0; i < RP.length - 1; i++) {
    const a = RP[i], b = RP[i + 1], dx = b.x - a.x, dz = b.z - a.z, L2 = dx * dx + dz * dz;
    const k = clamp(((x - a.x) * dx + (z - a.z) * dz) / L2), px = a.x + dx * k, pz = a.z + dz * k, d = Math.hypot(x - px, z - pz);
    if (d < best) { best = d; bu = (i + k) / (RP.length - 1); }
  }
  return [best, bu];
}
// the coast: a straight shore, the sea on the west (s > 0 is out at sea)
export const SHORE = { x: -232, z: 150, nx: -.958, nz: .287 };
export const shoreS = (x, z) => (x - SHORE.x) * SHORE.nx + (z - SHORE.z) * SHORE.nz;
export const ALONG = [SHORE.nz, -SHORE.nx];                            // along the shore, pointing south
export const INLAND = [-SHORE.nx, -SHORE.nz];
export const shoreAt = (along, s) => [SHORE.x + ALONG[0] * along + SHORE.nx * s, SHORE.z + ALONG[1] * along + SHORE.nz * s];
export const alongOf = (x, z) => (x - SHORE.x) * ALONG[0] + (z - SHORE.z) * ALONG[1];
export const sandY = s => s < -4 ? .16 - (s + 16) * .0125 : .01 - (s + 4) * .085;     // dry sand to the waterline (s = -4), then under the water
// the beach of Njema: its gate (NETIZEN BEACH), the lifeguard tower; "along" coordinates on the shore
export const BEACH = { gate: 18, tower: 34, a0: -4, a1: 66 };
// Day 7: the airport's ground east of the city is kept flat (1 = flat, fading out over 14 units round its edge)
export const AIRFIELD = { x0: 160, x1: 252, z0: -132, z1: 22 };
export const airK = (x, z) => clamp(Math.max(AIRFIELD.x0 - x, x - AIRFIELD.x1, AIRFIELD.z0 - z, z - AIRFIELD.z1, 0) / 14);
