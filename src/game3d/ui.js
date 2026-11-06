// Day 9's 2D layer: the DAY label, the reel to 53.000, the x24 time-lapse clock and the username cards (@aftone_moon, @muh_adnan_11, @z_hr.da),
// SEHAT over the cat, "Warga kecil baru: Kucing Mayor", the CTA (name the cat), the tagline, the night callout, the end card, the watermark, subtitles.
import { clamp, lerp, seg, eo, eio, ei, back, hash } from './core/lib.js';

const INK = '#3B3340', CREAM = '#FFF6E6', PEACH = '#F4A98C', MINT = '#A8DCC8', LAV = '#C9B8E8', BUTTER = '#F7D772';
const ADDRESS = 'trakteer.id/Pak_Mayor';
function rr(x, X, Y, w, h, r) { x.beginPath(); x.roundRect(X, Y, w, h, r); }
function font(x, size, w = 700, fam = 'Fredoka') { x.font = `${fam === 'Fredoka' ? w + ' ' : ''}${size}px ${fam === 'Fredoka' ? 'Fredoka' : `"${fam}"`}`; }
const popIn = (t, t0, d = .38) => t < t0 ? 0 : back(seg(t, t0, t0 + d), 2.6);
const popOut = (t, t1, d = .22) => t < t1 ? 1 : 1 - ei(seg(t, t1, t1 + d));
const fmt = n => Math.round(n).toLocaleString('id-ID');
function wrap(x, text, maxw) { const words = text.split(' '), lines = []; let cur = ''; for (const w of words) { const n = cur ? cur + ' ' + w : w; if (x.measureText(n).width > maxw && cur) { lines.push(cur); cur = w; } else cur = n; } lines.push(cur); return lines; }

function mayorIcon(x, cx, cy, r) {
  x.save(); x.beginPath(); x.arc(cx, cy, r, 0, 7); x.clip();
  const g = x.createLinearGradient(0, cy - r, 0, cy + r); g.addColorStop(0, '#CFE9F7'); g.addColorStop(1, '#BFDDB0'); x.fillStyle = g; x.fillRect(cx - r, cy - r, 2 * r, 2 * r);
  x.fillStyle = '#5E86C1'; rr(x, cx - r * .42, cy - r * .32, r * .84, r * 1.6, r * .42); x.fill();
  x.fillStyle = '#8C9099'; rr(x, cx - r * .5, cy - r * .36, r, r * .1, r * .05); x.fill(); rr(x, cx - r * .3, cy - r * .8, r * .6, r * .48, r * .06); x.fill();
  x.fillStyle = '#43464E'; x.fillRect(cx - r * .3, cy - r * .5, r * .6, r * .1);
  x.strokeStyle = '#E6B64C'; x.lineWidth = r * .07; for (const s of [-1, 1]) { x.beginPath(); x.arc(cx + s * r * .17, cy - r * .02, r * .13, 0, 7); x.stroke(); }
  x.fillStyle = '#2C2A33'; for (const s of [-1, 1]) { x.beginPath(); x.arc(cx + s * r * .17, cy - r * .02, r * .045, 0, 7); x.fill(); }
  x.restore();
}
function igCard(x, cx, cy, s, tilt, st) {
  const w = 880, h = 520;
  x.save(); x.translate(cx, cy); x.transform(1, Math.sin(tilt) * .25, -Math.sin(tilt) * .12, 1, 0, 0); x.rotate(tilt * .5); x.scale(s, s);
  x.shadowColor = 'rgba(70,50,60,.28)'; x.shadowBlur = 50; x.shadowOffsetY = 24;
  x.fillStyle = '#FFF9F1'; rr(x, -w / 2, -h / 2, w, h, 54); x.fill(); x.shadowColor = 'transparent';
  x.fillStyle = '#F6E9DC'; rr(x, -w / 2, -h / 2, w, 96, [54, 54, 0, 0]); x.fill();
  x.fillStyle = INK; font(x, 42, 700); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('@netizencity.id', 0, -h / 2 + 50);
  x.strokeStyle = INK; x.lineWidth = 6; x.lineCap = 'round'; x.beginPath(); x.moveTo(-w / 2 + 62, -h / 2 + 36); x.lineTo(-w / 2 + 46, -h / 2 + 50); x.lineTo(-w / 2 + 62, -h / 2 + 64); x.stroke();
  const ay = -h / 2 + 230;
  const ring = x.createLinearGradient(-w / 2 + 60, ay - 110, -w / 2 + 280, ay + 110); ring.addColorStop(0, PEACH); ring.addColorStop(.5, '#F2C1D6'); ring.addColorStop(1, LAV);
  x.fillStyle = ring; x.beginPath(); x.arc(-w / 2 + 170, ay, 112, 0, 7); x.fill();
  x.fillStyle = '#FFF9F1'; x.beginPath(); x.arc(-w / 2 + 170, ay, 101, 0, 7); x.fill();
  mayorIcon(x, -w / 2 + 170, ay, 94);
  [[9, 'postingan'], [null, 'pengikut'], [0, 'mengikuti']].forEach(([n, l], i) => {
    const X = -w / 2 + 400 + i * 175; x.save(); x.translate(X, ay - 22);
    if (i === 1) {
      if (st.pulse) x.scale(1 + .4 * st.pulse, 1 + .4 * st.pulse);
      x.save(); x.beginPath(); x.rect(-120, -46, 240, 92); x.clip(); x.fillStyle = INK; font(x, 64, 700);
      if (st.spin) { const f = st.spin.f; x.globalAlpha = 1 - f; x.fillText(st.spin.a, 0, -f * 80); x.globalAlpha = f; x.fillText(st.spin.b, 0, (1 - f) * 80); }
      else x.fillText(st.followers, 0, 0);
      x.restore();
    } else { x.fillStyle = INK; font(x, 70, 700); x.fillText(String(n), 0, 0); }
    x.restore();
    x.fillStyle = '#7B6F78'; font(x, 30, 600); x.fillText(l, X, ay + 40);
  });
  x.textAlign = 'left'; x.fillStyle = INK; font(x, 36, 700); x.fillText('Mayor NetizenCity', -w / 2 + 60, ay + 160);
  x.fillStyle = '#7B6F78'; font(x, 32, 600); x.fillText('Kota yang isinya diatur netizen.', -w / 2 + 60, ay + 206);
  x.restore();
}
function chatBox(x, cx, cy, s, o) {
  const fs = 46, maxw = 690; font(x, fs, 600); const lines = wrap(x, o.text, maxw);
  const w = 920, lh = fs * 1.25, h = 124 + lines.length * lh;
  x.save(); x.translate(cx, cy); x.rotate(o.tilt || 0); x.scale(s, s);
  x.shadowColor = 'rgba(70,50,60,.28)'; x.shadowBlur = 40; x.shadowOffsetY = 18; x.fillStyle = '#FFF9F1'; rr(x, -w / 2, -h / 2, w, h, 44); x.fill(); x.shadowColor = 'transparent';
  const ax = -w / 2 + 80, ay = -h / 2 + 76;
  x.save(); x.beginPath(); x.arc(ax, ay, 48, 0, 7); x.clip(); x.fillStyle = '#F3EEF6'; x.fillRect(ax - 50, ay - 50, 100, 100);
  x.fillStyle = o.col; rr(x, ax - 22, ay - 26, 44, 84, 22); x.fill(); x.fillStyle = '#2C2A33'; for (const sx of [-8, 8]) { x.beginPath(); x.arc(ax + sx, ay - 6, 4.5, 0, 7); x.fill(); }
  x.restore();
  x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.fillStyle = INK; font(x, 36, 700); x.fillText(o.user, ax + 70, ay - 22);
  const uw = x.measureText(o.user).width; x.fillStyle = '#9A8F98'; font(x, 28, 600); x.fillText('baru saja', ax + 86 + uw, ay - 22);
  font(x, fs, 600); x.fillStyle = INK; lines.forEach((L, i) => x.fillText(L, ax + 70, ay + 30 + i * lh));
  if (o.stamp > 0) { const k = o.stamp; x.save(); x.translate(w / 2 - 190, 8); x.rotate(-.18); x.scale(2.2 - 1.2 * Math.min(1, k), 2.2 - 1.2 * Math.min(1, k)); x.globalAlpha = Math.min(1, k * 1.5);
    x.strokeStyle = '#3FA986'; x.lineWidth = 9; rr(x, -170, -52, 340, 104, 18); x.stroke(); x.fillStyle = 'rgba(168,220,200,.35)'; x.fill();
    x.fillStyle = '#2F9474'; font(x, 52, 400, 'Lilita One'); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('DISETUJUI ✓', 0, 4); x.restore(); }
  x.restore();
}
export function icon(x, kind, X, Y, s, col = INK) {
  x.save(); x.translate(X, Y); x.scale(s, s); x.lineWidth = 6; x.strokeStyle = col; x.lineJoin = 'round'; x.lineCap = 'round';
  if (kind === 'down') { x.fillStyle = '#F2A0B4'; x.beginPath(); x.moveTo(-9, -22); x.lineTo(9, -22); x.lineTo(9, 2); x.lineTo(20, 2); x.lineTo(0, 24); x.lineTo(-20, 2); x.lineTo(-9, 2); x.closePath(); x.fill(); x.stroke(); }
  if (kind === 'book') { x.fillStyle = '#C9B8E8'; x.beginPath(); x.moveTo(0, -12); x.quadraticCurveTo(-12, -20, -24, -14); x.lineTo(-24, 16); x.quadraticCurveTo(-12, 10, 0, 18); x.quadraticCurveTo(12, 10, 24, 16); x.lineTo(24, -14); x.quadraticCurveTo(12, -20, 0, -12); x.closePath(); x.fill(); x.stroke(); x.beginPath(); x.moveTo(0, -12); x.lineTo(0, 18); x.stroke(); }
  if (kind === 'plane') { x.fillStyle = '#A9C8EC'; x.beginPath(); x.moveTo(-24, 4); x.lineTo(18, -10); x.quadraticCurveTo(28, -12, 24, -4); x.lineTo(-18, 12); x.closePath(); x.fill(); x.stroke(); x.beginPath(); x.moveTo(-4, 0); x.lineTo(-10, 20); x.moveTo(-2, -2); x.lineTo(-14, -16); x.stroke(); }
  if (kind === 'ball') { x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(0, 0, 20, 0, 7); x.fill(); x.stroke(); x.fillStyle = INK; x.beginPath(); for (let i = 0; i < 5; i++) { const a = i / 5 * 6.283 - Math.PI / 2; x.lineTo(Math.cos(a) * 8, Math.sin(a) * 8); } x.fill(); }
  if (kind === 'chart') { x.strokeStyle = '#3FA986'; x.beginPath(); x.moveTo(-22, 14); x.lineTo(-8, 2); x.lineTo(2, 8); x.lineTo(20, -14); x.stroke(); x.beginPath(); x.moveTo(10, -14); x.lineTo(20, -14); x.lineTo(20, -4); x.stroke(); }
  if (kind === 'cup') { x.fillStyle = '#F2A88A'; rr(x, -18, -10, 30, 28, 6); x.fill(); x.stroke(); x.beginPath(); x.arc(14, 2, 8, -Math.PI / 2, Math.PI / 2); x.stroke(); x.strokeStyle = '#9A8F98'; x.lineWidth = 4; for (const sx of [-8, 2]) { x.beginPath(); x.moveTo(sx, -16); x.quadraticCurveTo(sx + 6, -22, sx, -28); x.stroke(); } }
  if (kind === 'repost') {                                                    // two rounded L-arrows chasing each other, filled heads (revisi1)
    x.fillStyle = col; const arm = sg => { x.save(); x.scale(sg, sg);
      x.lineWidth = 6.5; x.beginPath(); x.moveTo(-15, 7); x.lineTo(-15, -3); x.arcTo(-15, -12, -6, -12, 9); x.lineTo(8, -12); x.stroke();
      x.lineWidth = 3; x.beginPath(); x.moveTo(7, -21.5); x.lineTo(20.5, -12); x.lineTo(7, -2.5); x.closePath(); x.fill(); x.stroke(); x.restore(); };
    arm(1); arm(-1); }
  if (kind === 'game') { x.fillStyle = '#FFFFFF'; rr(x, -24, -14, 48, 30, 15); x.fill(); x.stroke(); x.fillStyle = col;
    rr(x, -16, -2.5, 13, 5, 2); x.fill(); rr(x, -12, -6.5, 5, 13, 2); x.fill(); for (const [bx, by] of [[9, -3], [15.5, 3]]) { x.beginPath(); x.arc(bx, by, 3.4, 0, 7); x.fill(); } }
  if (kind === 'check') { x.fillStyle = '#7FCFB2'; x.beginPath(); x.arc(0, 0, 20, 0, 7); x.fill(); x.strokeStyle = '#FFFFFF'; x.lineWidth = 7; x.beginPath(); x.moveTo(-9, 1); x.lineTo(-2, 8); x.lineTo(10, -7); x.stroke(); }
  if (kind === 'warn') { x.fillStyle = '#F7D772'; x.beginPath(); x.moveTo(0, -20); x.lineTo(22, 18); x.lineTo(-22, 18); x.closePath(); x.fill(); x.stroke(); x.fillStyle = INK; x.fillRect(-3, -6, 6, 13); x.fillRect(-3, 11, 6, 5); }
  if (kind === 'insta') { x.strokeStyle = '#D9677F'; rr(x, -18, -18, 36, 36, 10); x.stroke(); x.beginPath(); x.arc(0, 0, 8, 0, 7); x.stroke(); x.fillStyle = '#D9677F'; x.beginPath(); x.arc(11, -11, 3, 0, 7); x.fill(); }
  x.restore();
}
function chip(x, cx, cy, s, parts, bg, size = 50, left = false) {   // a pill of text with drawn icons in it; left: cx is its left edge
  font(x, size, 400, 'Lilita One'); const gap = 14, iw = 56;
  const ws = parts.map(p => typeof p === 'string' ? x.measureText(p).width : iw), w = ws.reduce((a, b) => a + b + gap, 0) + 70, h = Math.round(size * 2.15);
  x.save(); x.translate(left ? cx + w / 2 * s : cx, cy); x.scale(s, s);
  x.shadowColor = 'rgba(70,50,60,.22)'; x.shadowBlur = 28; x.shadowOffsetY = 12; x.fillStyle = bg; rr(x, -w / 2, -h / 2, w, h, h / 2); x.fill(); x.shadowColor = 'transparent';
  let X = -w / 2 + 35; x.fillStyle = INK; x.textAlign = 'left'; x.textBaseline = 'middle';
  parts.forEach((p, i) => { if (typeof p === 'string') { x.fillStyle = INK; x.fillText(p, X, 4); } else if (p.icon === 'repost') igBadge(x, X + iw / 2, 0, 30); else { x.fillStyle = 'rgba(255,255,255,.85)'; x.beginPath(); x.arc(X + iw / 2, 0, 30, 0, 7); x.fill(); icon(x, p.icon, X + iw / 2, 2, .95); } X += ws[i] + gap; });
  x.restore(); return w * s;
}
// the repost badge: Instagram's orange-pink-purple gradient with the white arrows
function igBadge(x, cx, cy, r) {
  const g = x.createLinearGradient(cx - r, cy + r, cx + r, cy - r); g.addColorStop(0, '#F58529'); g.addColorStop(.5, '#DD2A7B'); g.addColorStop(1, '#8134AF');
  x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); icon(x, 'repost', cx, cy, r / 33, '#FFFFFF');
}
// a cream note card of small text that must read clearly (the disclaimer, the toy-money note)
function note(x, cx, cy, s, text, o = {}) {
  const fs = o.size || 34, maxw = o.w || 860; font(x, fs, 600); const lines = wrap(x, text, maxw - 60);
  const h = 36 + lines.length * fs * 1.3, w = maxw;
  x.save(); x.translate(cx, cy); x.scale(s, s);
  x.shadowColor = 'rgba(70,50,60,.2)'; x.shadowBlur = 22; x.shadowOffsetY = 8; x.fillStyle = o.bg || 'rgba(255,249,241,.96)'; rr(x, -w / 2, -h / 2, w, h, 24); x.fill(); x.shadowColor = 'transparent';
  if (o.border) { x.strokeStyle = o.border; x.lineWidth = 4; rr(x, -w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 20); x.stroke(); }
  x.fillStyle = o.col || INK; x.textAlign = 'center'; x.textBaseline = 'middle'; lines.forEach((L, i) => x.fillText(L, 0, -h / 2 + 18 + fs * .65 + i * fs * 1.3)); x.restore();
  return h * s;
}
function burst(x, X, Y, u, seed) {
  if (u <= 0 || u >= 1) return; const cols = [PEACH, MINT, LAV, BUTTER, '#F2B8C6', '#A9C8EC'];
  for (let i = 0; i < 60; i++) { const a = hash(i * 3.1 + seed) * 6.283, sp = 200 + hash(i * 7.7 + seed) * 520, r = sp * eo(u), g = 600 * u * u;
    x.save(); x.translate(X + Math.cos(a) * r, Y + Math.sin(a) * r * .8 + g); x.rotate(a + u * 9); x.globalAlpha = 1 - u * u; x.fillStyle = cols[i % 6]; x.fillRect(-9, -5, 18, 10); x.restore(); }
}
function star(x, X, Y, r, a) { if (a <= 0) return; x.save(); x.translate(X, Y); x.globalAlpha = a; x.fillStyle = '#FFF7D1'; x.shadowColor = '#FFE58A'; x.shadowBlur = 30;
  x.beginPath(); for (let i = 0; i < 8; i++) { const rad = i % 2 ? r * .22 : r, an = i / 8 * 6.283; x.lineTo(Math.cos(an) * rad, Math.sin(an) * rad); } x.fill(); x.restore(); }
const SPIN = [50000, 50500, 51000, 51600, 52200, 52700, 53000];
// small drawn icons for Day 9's cards: a paw, a hospital cross, a graduation cap, a cat face
function icon9(x, kind, X, Y, s) { x.save(); x.translate(X, Y); x.scale(s, s); x.lineJoin = 'round'; x.lineCap = 'round';
  if (kind === 'paw') { x.fillStyle = '#E58F72'; x.beginPath(); x.ellipse(0, 6, 11, 9, 0, 0, 7); x.fill(); for (const [px, py] of [[-12, -6], [-4, -13], [5, -13], [13, -6]]) { x.beginPath(); x.ellipse(px, py, 4.2, 5.2, 0, 0, 7); x.fill(); } }
  if (kind === 'cross') { x.fillStyle = '#7FCFB2'; x.fillRect(-5, -15, 10, 30); x.fillRect(-15, -5, 30, 10); x.fillStyle = '#E58F72'; x.beginPath(); x.ellipse(8, 9, 6, 5, 0, 0, 7); x.fill(); }
  if (kind === 'grad') { x.fillStyle = '#4A4A6A'; x.beginPath(); x.moveTo(-18, -4); x.lineTo(0, -13); x.lineTo(18, -4); x.lineTo(0, 5); x.closePath(); x.fill(); x.fillRect(-9, 0, 18, 10); x.strokeStyle = '#F7D772'; x.lineWidth = 2.5; x.beginPath(); x.moveTo(14, -3); x.lineTo(14, 12); x.stroke(); }
  if (kind === 'cat') { x.fillStyle = '#F4A97A'; x.beginPath(); x.moveTo(-15, -6); x.lineTo(-11, -18); x.lineTo(-4, -10); x.lineTo(4, -10); x.lineTo(11, -18); x.lineTo(15, -6); x.quadraticCurveTo(17, 14, 0, 14); x.quadraticCurveTo(-17, 14, -15, -6); x.fill();
    x.fillStyle = '#FFF1DC'; x.beginPath(); x.ellipse(0, 7, 8, 5.5, 0, 0, 7); x.fill(); x.fillStyle = '#2C2A33'; for (const s of [-1, 1]) { x.beginPath(); x.arc(s * 6, -1, 2.2, 0, 7); x.fill(); } x.fillStyle = '#F2A0B4'; x.beginPath(); x.moveTo(-2.5, 3); x.lineTo(2.5, 3); x.lineTo(0, 6); x.fill(); }
  x.restore(); }

export function makeUI(cv, TL) {
  const W = cv.width = innerWidth, H = cv.height = innerHeight, x = cv.getContext('2d'), C = TL.cue;
  const vstart = id => TL.voice.find(v => v.id === id).t;
  function subtitle(t) {
    const s = TL.subs.find(s => t >= s.t0 && t < s.t1); if (!s) return;
    const k = eo(seg(t, s.t0, s.t0 + .12));
    font(x, 60, 700); x.textAlign = 'center'; x.textBaseline = 'alphabetic';
    const lines = wrap(x, s.text, 900), y0 = 1560 - (lines.length - 1) * 74;
    x.save(); x.translate(W / 2, y0); x.scale(.94 + .06 * k, .94 + .06 * k); x.globalAlpha = k;
    lines.forEach((L, i) => { x.lineJoin = 'round'; x.shadowColor = 'rgba(60,40,40,.35)'; x.shadowBlur = 14; x.shadowOffsetY = 4;
      x.strokeStyle = '#5A4636'; x.lineWidth = 13; x.strokeText(L, 0, i * 74); x.shadowColor = 'transparent'; x.fillStyle = '#FFF4DC'; x.fillText(L, 0, i * 74); });
    x.restore();
  }
  function dayLabel(t) {
    const t0 = C.S2 + .45; if (t < t0) return;
    const txt = 'DAY 9', n = clamp(Math.floor((t - t0) / .07) + 1, 0, txt.length);
    font(x, 46, 700); const tw = x.measureText(txt).width;
    x.fillStyle = 'rgba(46,40,54,.55)'; rr(x, 64, 128, tw + 64, 78, 18); x.fill();
    x.fillStyle = CREAM; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(txt.slice(0, n), 96, 169);
    if (t < t0 + 1.2 && Math.floor(t * 4) % 2 === 0) { const cw = x.measureText(txt.slice(0, n)).width; x.fillRect(100 + cw, 148, 6, 42); }
  }
  // the x24 time-lapse clock (the towers, the zoo, the animal hospital, the university)
  function hud(t, tw, on, sc) {
    if (!on) return; const [a0, a1] = sc === 'grow' ? [C.grow, C.S4] : sc === 'zoo' ? [C.S5, C.queue] : sc === 'vetTL' ? [C.S6, C.exam] : [C.S7, C.rektor];
    const hrs = 9 + 7 * seg(tw, a0, a1), hh = Math.floor(hrs), mm = Math.floor((hrs - hh) * 60), a = popIn(t, a0, .3);
    x.save(); x.translate(64, 230); x.scale(a, a);
    x.fillStyle = 'rgba(46,40,54,.62)'; rr(x, 0, 0, 330, 150, 22); x.fill(); x.strokeStyle = 'rgba(255,246,230,.35)'; x.lineWidth = 3; rr(x, 6, 6, 318, 138, 17); x.stroke();
    x.fillStyle = CREAM; font(x, 74, 700); x.textAlign = 'left'; x.textBaseline = 'alphabetic'; x.fillText(`${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`, 26, 86);
    font(x, 34, 600); x.fillStyle = 'rgba(255,246,230,.7)'; x.fillText(String(Math.floor(hash(Math.floor(tw * 8)) * 60)).padStart(2, '0'), 232, 86);
    font(x, 32, 700); x.fillStyle = '#F7C66A'; x.fillText('×24 TIME-LAPSE', 26, 128); x.restore();
  }
  function userCard(t, t0, t1, user, label, ic, col) {
    if (t < t0 || t > t1 + .3) return; const s = popIn(t, t0) * popOut(t, t1);
    font(x, 40, 700); const u1 = x.measureText(user).width; font(x, 30, 600); const u2 = x.measureText(label).width, w = Math.max(u1, u2) + 170, h = 130;
    x.save(); x.translate(W - 64, 300); x.scale(s, s);
    x.shadowColor = 'rgba(70,50,60,.26)'; x.shadowBlur = 30; x.shadowOffsetY = 12; x.fillStyle = '#FFF9F1'; rr(x, -w, -h / 2, w, h, 34); x.fill(); x.shadowColor = 'transparent';
    x.fillStyle = col; x.beginPath(); x.arc(-w + 68, 0, 44, 0, 7); x.fill(); icon9(x, ic, -w + 68, 2, 1.3);
    x.fillStyle = INK; x.textAlign = 'left'; x.textBaseline = 'middle'; font(x, 40, 700); x.fillText(user, -w + 130, -20);
    x.fillStyle = '#7B6F78'; font(x, 30, 600); x.fillText(label, -w + 130, 26); x.restore();
  }
  // ✅ SEHAT over the cat on the examination table
  function sehat(t, P) { if (t < C.sehat || t > C.adopt - .2 || !P.cat[2]) return; const s = popIn(t, C.sehat, .35) * popOut(t, C.adopt - .4);
    x.save(); x.translate(P.cat[0], P.cat[1] - 170); x.scale(s, s); x.shadowColor = 'rgba(70,50,60,.25)'; x.shadowBlur = 20; x.fillStyle = '#FFF9F1'; rr(x, -150, -50, 300, 100, 50); x.fill(); x.shadowColor = 'transparent';
    icon(x, 'check', -92, 0, 1.4); x.fillStyle = '#2F9474'; font(x, 52, 400, 'Lilita One'); x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText('SEHAT', -55, 4); x.restore(); }
  // "Warga kecil baru: Kucing Mayor 🐾"
  function newCitizen(t) { if (t < C.label || t > C.S9 + .1) return; const s = popIn(t, C.label, .4) * popOut(t, C.S9 - .15);
    chip(x, W / 2, 330, s, [{ icon: 'check' }, 'Warga kecil baru: Kucing Mayor 🐾'], '#FFF1DC', 40); }
  // the CTA: name the cat
  function cta(t) { if (t < C.card1 || t > C.S10 + .1) return; const out = popOut(t, C.S10 - .1, .2);
    chip(x, 60, 300, popIn(t, C.card1) * out, ['🐱 KUCING MAYOR BELUM PUNYA NAMA!'], BUTTER, 38, true);
    chip(x, 60, 420, popIn(t, C.card2) * out, ['💬 KASIH NAMA DI KOMEN + REQUEST BUAT BESOK'], '#BFD8F2', 30, true);
    chip(x, 60, 530, popIn(t, C.card3) * out, ['FOLLOW @netizencity.id •', 'REPOST', { icon: 'repost' }], '#F6CFD9', 36, true); }
  function endCard(t) { if (t < C.endcard) return; const a = eo(seg(t, C.endcard, C.endcard + .4));
    x.save(); x.globalAlpha = a; x.translate(0, (1 - a) * 40);
    const y = 1420; x.fillStyle = 'rgba(46,40,54,.78)'; rr(x, 40, y - 30, W - 80, 170, 30); x.fill();
    x.fillStyle = '#FFF6E6'; font(x, 42, 400, 'Lilita One'); x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('Instagram @netizencity.id', W / 2, y + 20); x.fillStyle = '#F7C66A'; x.fillText('Kasih nama Kucing Mayor di komen 🐾', W / 2, y + 88); x.restore(); }
  const WM = [[.32, .42], [.68, .56], [.36, .63], [.66, .38], [.5, .5], [.3, .53], [.7, .45], [.4, .4]];
  function watermark(t) {
    const i = Math.floor(t / 10), u = eio(seg(t - i * 10, 0, 1.2)), a = WM[(i + WM.length - 1) % WM.length], b = WM[i % WM.length];
    const X = lerp(a[0], b[0], i ? u : 1) * W, Y = lerp(a[1], b[1], i ? u : 1) * H;
    x.save(); x.globalAlpha = .2; font(x, 36, 600); x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.strokeStyle = 'rgba(40,30,40,.6)'; x.lineWidth = 5; x.strokeText('@netizencity.id', X, Y); x.fillStyle = '#FFFFFF'; x.fillText('@netizencity.id', X, Y); x.restore();
  }
  return {
    draw(t, P) {
      x.clearRect(0, 0, W, H);
      dayLabel(t); hud(t, P.tw, P.lapse && P.sc !== 'grow', P.sc);
      if (t >= C.S3 && t < C.boardCut + .3) {
        const s = popIn(t, C.S3) * popOut(t, C.boardCut), tilt = lerp(-.12, -.05, eo(seg(t, C.S3, C.S3 + .5))), st = { followers: '50.000' };
        if (t >= C.spin0 && t < C.spin1) { const u = seg(t, C.spin0, C.spin1), e = u * (SPIN.length - 1), i = Math.min(SPIN.length - 2, Math.floor(e)); st.spin = { a: fmt(SPIN[i]), b: fmt(SPIN[i + 1]), f: eo(e - i) }; }
        if (t >= C.spin1) { st.followers = '53.000'; st.pulse = Math.exp(-(t - C.spin1) * 3) * .5; }
        igCard(x, W / 2, 520, s, tilt, st);
      }
      userCard(t, C.S5 + .1, C.S6 - .2, '@aftone_moon', 'KEBUN BINATANG', 'paw', '#FFE3D2');
      userCard(t, C.S6 + .1, C.S7 - .2, '@muh_adnan_11', 'RS HEWAN + PUSAT ADOPSI', 'cross', '#DCF2E8');
      userCard(t, C.S7 + .1, C.S8 - .2, '@z_hr.da', 'UNIVERSITAS', 'grad', '#E7DEF5');
      sehat(t, P); newCitizen(t); cta(t);
      // the tagline (Day 1's master voice)
      const tg = vstart('tag');
      if (t >= tg - .1 && t < C.fanfare + .6) {
        const a = seg(t, tg - .1, tg + .25) * (1 - seg(t, C.fanfare + .25, C.fanfare + .6)), lines = [['Kita', 'tidak', 'pernah', 'meragukan', 'warga,'], ['meski', 'permintaannya', 'aneh-aneh.']], tags = TL.tag || []; let wi = 0;
        x.save(); x.globalAlpha = a; const band = x.createLinearGradient(0, 1330, 0, 1680); band.addColorStop(0, 'rgba(48,32,28,0)'); band.addColorStop(.45, 'rgba(48,32,28,.38)'); band.addColorStop(1, 'rgba(48,32,28,0)'); x.fillStyle = band; x.fillRect(0, 1330, W, 350);
        x.textAlign = 'left'; x.textBaseline = 'alphabetic'; font(x, 58, 400, 'IM Fell English');
        lines.forEach((L, li) => { const tw2 = x.measureText(L.join(' ')).width; let X = W / 2 - tw2 / 2; const Y = 1480 + li * 80;
          for (const w of L) { const wt = tags[wi] ? tags[wi].t0 : tg + wi * .3, k = eo(seg(t, wt - .08, wt + .25)); x.save(); x.globalAlpha = a * k; x.shadowColor = 'rgba(60,40,30,.55)'; x.shadowBlur = 18; x.shadowOffsetY = 3; x.fillStyle = '#FFF1D6'; x.fillText(w, X, Y + (1 - k) * 14); x.restore(); X += x.measureText(w + ' ').width; wi++; } });
        x.strokeStyle = `rgba(255,241,214,${a * .85})`; x.lineWidth = 3; const lw = 240 * eo(seg(t, tg, tg + .8)); for (const s of [-1, 1]) { x.beginPath(); x.moveTo(W / 2 + s * 40, 1380); x.lineTo(W / 2 + s * (40 + lw), 1380); x.stroke(); }
        star(x, W / 2, 1380, 16, a); x.restore();
      }
      const [gx, gy, gv] = P.glasses;
      if (gv) { star(x, gx + 8, gy - 6, 26, Math.max(Math.sin(Math.PI * seg(t, C.ting - .05, C.ting + .4)), Math.sin(Math.PI * seg(t, C.lookUp + .25, C.lookUp + .65)))); star(x, gx + 14, gy - 10, 46, Math.sin(Math.PI * seg(t, C.sparkle, C.sparkle + .6))); }
      if (t >= C.boardGlow && P.board[2] && t < C.endcard) {
        const [bx, by] = P.board, a = popIn(t, C.boardGlow + .25, .4);
        x.save(); x.translate(clamp(bx, 330, W - 330), clamp(by - 70, 600, H - 620) + Math.sin(t * 3) * 6); x.scale(a, a);
        font(x, 52, 400, 'Lilita One'); const txt = 'POPULASI: 53.001 → ?', tw = x.measureText(txt).width;
        x.shadowColor = 'rgba(255,214,140,.9)'; x.shadowBlur = 40; x.fillStyle = '#FFF4DA'; rr(x, -tw / 2 - 34, -50, tw + 68, 100, 26); x.fill();
        x.shadowColor = 'transparent'; x.strokeStyle = '#D9A877'; x.lineWidth = 6; rr(x, -tw / 2 - 26, -42, tw + 52, 84, 20); x.stroke();
        x.fillStyle = '#4B3A36'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 0, 4);
        x.fillStyle = '#FFF4DA'; x.beginPath(); x.moveTo(-16, 50); x.lineTo(16, 50); x.lineTo(0, 74); x.closePath(); x.fill(); x.restore();
      }
      endCard(t); watermark(t); subtitle(t);
    }
  };
}

