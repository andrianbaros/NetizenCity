// Math and animation utilities for NetizenCity 3D

export function clamp(v, a = 0, b = 1) {
  const min = Math.min(a, b);
  const max = Math.max(a, b);
  return Math.max(min, Math.min(max, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function seg(t, a, b) {
  if (a === b) return t >= a ? 1 : 0;
  return clamp((t - a) / (b - a));
}

export function ss(t) {
  const c = clamp(t);
  return c * c * (3 - 2 * c);
}

export function eo(t) {
  const c = clamp(t);
  return 1 - Math.pow(1 - c, 3);
}

export function ei(t) {
  const c = clamp(t);
  return c * c * c;
}

export function eio(t) {
  const c = clamp(t);
  return c < 0.5 ? 4 * c * c * c : 1 - Math.pow(-2 * c + 2, 3) / 2;
}

export function back(t, s = 1.70158) {
  const c = clamp(t) - 1;
  return c * c * ((s + 1) * c + s) + 1;
}

export function hash(n) {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
}

export function vnoise(x) {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash(i), hash(i + 1), u);
}

export function mulberry(seed) {
  let a = seed | 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function track(keys) {
  return function (t) {
    if (!keys || keys.length === 0) return [];
    if (t <= keys[0][0]) return keys[0][1];
    if (t >= keys[keys.length - 1][0]) return keys[keys.length - 1][1];

    for (let i = 0; i < keys.length - 1; i++) {
      const k0 = keys[i];
      const k1 = keys[i + 1];
      if (t >= k0[0] && t <= k1[0]) {
        const u = (t - k0[0]) / (k1[0] - k0[0]);
        const v0 = k0[1];
        const v1 = k1[1];
        if (Array.isArray(v0) && Array.isArray(v1)) {
          return v0.map((val, idx) => val + (v1[idx] - val) * u);
        }
        return v0 + (v1 - v0) * u;
      }
    }
    return keys[keys.length - 1][1];
  };
}
