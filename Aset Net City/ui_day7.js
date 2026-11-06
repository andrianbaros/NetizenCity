// Day 7's 2D layer over the diorama: DAY label, the news lower third of the clarification, the follower reel to 49.000 with the bar to
// 50.000, "KEMARIN...", the request chat boxes and their DISETUJUI stamps, the time-lapse HUD and username cards, the investor cards
// (the Trakteer address and the plain-language disclaimer, always legible), the chart that goes flat, the laptop with the game, the repost
// button and the KAS KOTA meter, the CTA, the tagline, the night callout, the end card, the handle watermark, subtitles.
import { clamp, lerp, seg, eo, eio, ei, back, hash } from '/core/lib.js';

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
  [[7, 'postingan'], [null, 'pengikut'], [0, 'mengikuti']].forEach(([n, l], i) => {
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
const SPIN = [45000, 45900, 46800, 47600, 48300, 48800, 49000];
const REQ = [['@ji_hann09', 'bikin perpustakaan', '#C9B8E8'], ['@andramuhammad_09', 'bikin bandara dan pelabuhan', '#A9C8EC'], ['@rznn8619', 'bikin sarana olahraga', '#F7D772']];
const game = new Image(); let gameOk = false; game.onload = () => gameOk = true; game.src = 'game_shot.jpg';

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
    const txt = 'DAY 7', n = clamp(Math.floor((t - t0) / .07) + 1, 0, txt.length);
    font(x, 46, 700); const tw = x.measureText(txt).width;
    x.fillStyle = 'rgba(46,40,54,.55)'; rr(x, 64, 128, tw + 64, 78, 18); x.fill();
    x.fillStyle = CREAM; x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(txt.slice(0, n), 96, 169);
    if (t < t0 + 1.2 && Math.floor(t * 4) % 2 === 0) { const cw = x.measureText(txt.slice(0, n)).width; x.fillRect(100 + cw, 148, 6, 42); }
  }
  // the news lower third of the clarification
  function lowerThird(t) {
    if (t > C.S2 + .2) return; const a = eo(seg(t, .1, .45)) * (1 - seg(t, C.S2 - .15, C.S2 + .1)), y = 1300;
    x.save(); x.globalAlpha = a; x.translate((1 - a) * -200, 0);
    x.fillStyle = '#D9475E'; rr(x, 40, y, 250, 76, [20, 0, 0, 20]); x.fill(); x.fillStyle = 'rgba(255,249,241,.97)'; rr(x, 290, y, W - 330, 76, [0, 20, 20, 0]); x.fill();
    x.fillStyle = '#FFFFFF'; x.beginPath(); x.arc(78, y + 38, 12 * (.7 + .3 * Math.abs(Math.sin(t * 4))), 0, 7); x.fill();
    font(x, 34, 400, 'Lilita One'); x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText('KLARIFIKASI', 102, y + 40);
    x.fillStyle = INK; font(x, 33, 400, 'Lilita One'); x.fillText('MAYOR • NETIZEN CITY DARURAT KAS', 312, y + 40);
    x.restore();
  }
  function hud(t, tw, on) {
    if (!on) return;
    const hrs = 9 + 7 * seg(tw, C.S5, C.S6), hh = Math.floor(hrs), mm = Math.floor((hrs - hh) * 60), a = popIn(t, C.S5, .3);
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
    x.fillStyle = col; x.beginPath(); x.arc(-w + 68, 0, 44, 0, 7); x.fill(); icon(x, ic, -w + 68, 2, 1.25);
    x.fillStyle = INK; x.textAlign = 'left'; x.textBaseline = 'middle'; font(x, 40, 700); x.fillText(user, -w + 130, -20);
    x.fillStyle = '#7B6F78'; font(x, 30, 600); x.fillText(label, -w + 130, 26); x.restore();
  }
  // the bar to 50.000: it fills and stops a hair short
  function progress(t) {
    if (t < C.bar - .2 || t > C.boardCut + .3) return; const s = popIn(t, C.bar - .2) * popOut(t, C.boardCut), u = .98 * eo(seg(t, C.bar, C.bar + 1.0)), w = 760;
    x.save(); x.translate(W / 2, 870); x.scale(s, s);
    x.shadowColor = 'rgba(70,50,60,.25)'; x.shadowBlur = 30; x.shadowOffsetY = 12; x.fillStyle = '#FFF9F1'; rr(x, -w / 2, -70, w, 140, 36); x.fill(); x.shadowColor = 'transparent';
    x.fillStyle = INK; font(x, 40, 400, 'Lilita One'); x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText(`${fmt(lerp(45000, 49000, Math.min(1, u / .98)))} / 50.000`, -w / 2 + 40, -26);
    x.textAlign = 'right'; x.fillText('FESTIVAL 🎉', w / 2 - 40, -26);
    x.fillStyle = '#ECE3D6'; rr(x, -w / 2 + 40, 6, w - 80, 34, 17); x.fill(); x.fillStyle = '#F2A0B4'; rr(x, -w / 2 + 40, 6, Math.max(34, (w - 80) * u), 34, 17); x.fill();
    x.restore();
  }
  function kemarin(t) { if (t < C.S4 || t > C.S5) return; const txt = 'KEMARIN…', n = clamp(Math.floor((t - C.S4 - .05) / .08) + 1, 0, txt.length), a = 1 - seg(t, C.chat1 - .4, C.chat1);
    if (a <= 0) return; x.save(); x.globalAlpha = a; font(x, 64, 400, 'IM Fell English'); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = 'rgba(46,40,54,.55)'; rr(x, W / 2 - 200, 300, 400, 100, 22); x.fill(); x.fillStyle = CREAM; x.fillText(txt.slice(0, n), W / 2, 352); x.restore(); }
  function requests(t) {
    if (t < C.chat1 || t > C.S5 + .3) return;
    const sets = [[C.chat1, C.stamp1, C.chat2], [C.chat2, C.stamp2, C.chat3], [C.chat3, C.stamp3, C.S5 - .2]];
    sets.forEach(([c0, s0, c1], i) => { if (t < c0 || t > c1 + .4) return; const s = popIn(t, c0, .4), out = seg(t, c1, c1 + .35), [user, text, col] = REQ[i];
      x.save(); x.globalAlpha = 1 - out; x.translate(-out * 140, -out * 120); chatBox(x, W / 2, 450, s * (1 - .15 * out), { user, text, col, tilt: (i - 1) * .02, stamp: t < s0 ? 0 : seg(t, s0, s0 + .12) * 1.0001 }); x.restore(); });
  }
  // scene 8
  function invest(t) {
    if (t < C.card1 || t > C.S9 + .2) return; const out = popOut(t, C.S9 - .1, .25), gameOn = t > C.game && t < C.back;
    if (!gameOn && t < C.back) {                                              // the opening: the job and the address; the disclaimer under them
      const s1 = popIn(t, C.card1) * out; chip(x, 60, 300, s1, ['LOWONGAN INVESTOR KOTA', { icon: 'chart' }], BUTTER, 44, true);
      chip(x, 60, 425, popIn(t, C.card1 + .15) * out, [{ icon: 'cup' }, ADDRESS], '#FFF9F1', 50, true);
      note(x, W / 2, 600, popIn(t, C.disc) * out, 'Dukungan sukarela untuk kreator & game web Netizen City. Bukan investasi finansial, tanpa imbal hasil.', { size: 40, w: 940, border: '#D9A877' });
      if (t > C.chart - .1 && t < C.pras) chart(t);
    }
    if (gameOn) laptop(t);
    if (t > C.back) {
      meter(t);
      const s6 = popIn(t, C.card6) * out; chip(x, W / 2, 560, s6, [{ icon: 'repost' }, '1 REPOST = Rp1 JUTA ANGGARAN KOTA'], '#BFD8F2', 38);
      note(x, W / 2, 655, s6, 'uang mainan di cerita, saldo diumumkan di Day 8', { size: 34, w: 820, bg: 'rgba(255,249,241,.92)' });
      chip(x, W / 2, 775, popIn(t, C.card7) * out, [{ icon: 'check' }, 'REQUEST TETAP DIBANGUN, GRATIS'], '#CFEBDD', 38);
      chip(x, W / 2, 890, popIn(t, C.card8) * out, [{ icon: 'warn' }, 'Netizen City tidak pernah minta transfer lewat DM'], '#FFF9F1', 31);
      note(x, W / 2, 1230, popIn(t, C.back + .3) * out + .0001, `${ADDRESS} • dukungan sukarela, bukan investasi, tanpa imbal hasil`, { size: 32, w: 960, bg: 'rgba(255,249,241,.9)' });
      tap(t);
    }
  }
  // revisi1, by the empty cash box: the game project's card gets stamped DITUNDA; then where to help, with the disclaimer
  function sorry(t) {
    if (t < C.proj || t > C.S7 + .1) return; const out = popOut(t, C.S7 - .2, .2);
    if (t < C.trak + .3) {
      const s = popIn(t, C.proj, .4) * popOut(t, C.trak - .05, .25), w = 860, h = 560;
      x.save(); x.translate(W / 2, 560); x.rotate(-.02); x.scale(s, s);
      x.shadowColor = 'rgba(40,30,40,.35)'; x.shadowBlur = 44; x.shadowOffsetY = 20; x.fillStyle = '#FFF9F1'; rr(x, -w / 2, -h / 2, w, h, 40); x.fill(); x.shadowColor = 'transparent';
      x.fillStyle = LAV; x.beginPath(); x.arc(-w / 2 + 72, -h / 2 + 66, 40, 0, 7); x.fill(); icon(x, 'game', -w / 2 + 72, -h / 2 + 68, 1.1);
      x.fillStyle = INK; font(x, 50, 400, 'Lilita One'); x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText('PROYEK GAME NETIZEN CITY', -w / 2 + 130, -h / 2 + 70);
      const sx = -w / 2 + 30, sy = -h / 2 + 128, sw = w - 60, sh = h - 158, g = seg(t, C.ditunda, C.ditunda + .3);
      x.save(); rr(x, sx, sy, sw, sh, 24); x.clip(); x.filter = `grayscale(${g * .85}) brightness(${1 - .15 * g})`;
      if (gameOk) { const r = Math.max(sw / game.width, sh / game.height); x.drawImage(game, sx + sw / 2 - game.width * r / 2, sy + sh / 2 - game.height * r / 2, game.width * r, game.height * r); }
      else { x.fillStyle = '#A9D69A'; x.fillRect(sx, sy, sw, sh); }
      x.filter = 'none'; x.restore();
      if (t > C.ditunda) { const k = seg(t, C.ditunda, C.ditunda + .12), sc = 2.2 - 1.2 * k; x.save(); x.translate(10, 70); x.rotate(-.14); x.scale(sc, sc); x.globalAlpha = Math.min(1, k * 1.5);
        x.fillStyle = 'rgba(255,228,232,.9)'; rr(x, -250, -92, 500, 184, 24); x.fill(); x.strokeStyle = '#D9475E'; x.lineWidth = 12; x.stroke();
        x.fillStyle = '#D9475E'; x.textAlign = 'center'; x.textBaseline = 'middle'; font(x, 104, 400, 'Lilita One'); x.fillText('DITUNDA', 0, -16); font(x, 38, 400, 'Lilita One'); x.fillText('MASALAH ANGGARAN', 0, 58); x.restore(); }
      x.restore();
    }
    if (t > C.trak) {
      chip(x, 60, 300, popIn(t, C.trak) * out, ['BANTU GAME NETIZEN CITY', { icon: 'game' }], BUTTER, 44, true);
      chip(x, 60, 425, popIn(t, C.trak + .15) * out, [{ icon: 'cup' }, ADDRESS], '#FFF9F1', 50, true);
      note(x, W / 2, 600, popIn(t, C.trak + .45) * out, 'Dukungan sukarela untuk kreator & game web Netizen City. Bukan investasi finansial, tanpa imbal hasil.', { size: 40, w: 940, border: '#D9A877' });
      chip(x, W / 2, 760, popIn(t, C.trak + .6) * out, [{ icon: 'warn' }, 'Netizen City tidak pernah minta transfer lewat DM'], '#FFF9F1', 31);
    }
  }
  function chart(t) {
    const s = popIn(t, C.chart - .1), w = 520, h = 260; x.save(); x.translate(W - 60 - w / 2, 880); x.scale(s, s);
    x.shadowColor = 'rgba(70,50,60,.2)'; x.shadowBlur = 24; x.fillStyle = '#FFF9F1'; rr(x, -w / 2, -h / 2, w, h, 28); x.fill(); x.shadowColor = 'transparent';
    x.strokeStyle = '#ECE3D6'; x.lineWidth = 3; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(-w / 2 + 30, -h / 2 + 40 + i * 50); x.lineTo(w / 2 - 30, -h / 2 + 40 + i * 50); x.stroke(); }
    const u = seg(t, C.chart, C.chart + 1.1), pts = []; for (let i = 0; i <= 40; i++) { const f = i / 40, up = Math.min(f / .45, 1); pts.push([-w / 2 + 40 + f * (w - 80), h / 2 - 40 - (f < .45 ? up * 150 * (1 - .2 * Math.sin(f * 30)) : 150 - Math.min(1, (f - .45) / .15) * 150 * 0)]); }
    // up, up... then flat on the floor: after the climb the line drops to the bottom and lies there
    const n = Math.floor(u * pts.length); x.strokeStyle = '#3FA986'; x.lineWidth = 8; x.lineJoin = 'round'; x.beginPath();
    pts.slice(0, Math.max(1, n)).forEach(([X, Y], i) => { const f = i / 40, Yy = f < .45 ? Y : h / 2 - 40; i ? x.lineTo(X, Yy) : x.moveTo(X, Yy); }); x.stroke();
    [['BUNGA', C.xbunga, -70], ['DIVIDEN', C.xdiv, 70]].forEach(([lab, t0, dx]) => { const k = popIn(t, t0); if (k <= 0) return; x.save(); x.translate(dx * 1.6, -h / 2 - 34); x.scale(k, k);
      x.fillStyle = '#FFE1E6'; rr(x, -95, -30, 190, 60, 30); x.fill(); x.fillStyle = '#D9475E'; font(x, 34, 400, 'Lilita One'); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('✕ ' + lab, 0, 3); x.restore(); });
    x.restore();
  }
  function laptop(t) {
    const s = popIn(t, C.game, .45) * popOut(t, C.back - .1, .2), w = 900, h = 560;
    x.save(); x.translate(W / 2, 760); x.scale(s, s);
    x.shadowColor = 'rgba(40,30,40,.4)'; x.shadowBlur = 50; x.shadowOffsetY = 24; x.fillStyle = '#4A4650'; rr(x, -w / 2, -h / 2, w, h, 30); x.fill(); x.shadowColor = 'transparent';
    x.fillStyle = '#8C97A8'; x.beginPath(); x.moveTo(-w / 2 - 60, h / 2 + 4); x.lineTo(w / 2 + 60, h / 2 + 4); x.lineTo(w / 2 + 90, h / 2 + 46); x.lineTo(-w / 2 - 90, h / 2 + 46); x.closePath(); x.fill();
    const sx = -w / 2 + 24, sy = -h / 2 + 24, sw = w - 48, sh = h - 48;
    x.save(); rr(x, sx, sy, sw, sh, 10); x.clip();
    if (gameOk) { const r = Math.max(sw / game.width, sh / game.height); x.drawImage(game, -game.width * r / 2, -game.height * r / 2 + 10 * Math.sin(t), game.width * r, game.height * r); }
    else { x.fillStyle = '#A9D69A'; x.fillRect(sx, sy, sw, sh); }
    for (let i = 0; i < 18; i++) { const px = sx + ((hash(i) * sw + t * 40 * (hash(i * 3) - .5)) % sw + sw) % sw, py = sy + 60 + hash(i * 7) * (sh - 90); x.fillStyle = ['#F2A88A', '#A9C8EC', '#F7DD8C', '#C9B8E8'][i % 4]; rr(x, px - 6, py - 10 + Math.abs(Math.sin(t * 8 + i)) * -4, 12, 20, 6); x.fill(); }
    x.fillStyle = 'rgba(46,40,54,.72)'; rr(x, sx + 14, sy + 14, 330, 54, 14); x.fill(); x.fillStyle = CREAM; font(x, 28, 400, 'Lilita One'); x.textAlign = 'left'; x.textBaseline = 'middle'; x.fillText('POPULASI 49.001', sx + 32, sy + 42);
    mayorIcon(x, sx + sw - 50, sy + 50, 34);
    x.restore();
    x.fillStyle = '#FFF9F1'; font(x, 52, 400, 'Lilita One'); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('NETIZEN CITY: THE GAME', 0, -h / 2 - 70);
    x.fillStyle = '#F7D772'; font(x, 40, 400, 'Lilita One'); x.fillText('— COMING SOON —', 0, h / 2 + 100);
    x.restore();
  }
  function meter(t) {
    const s = popIn(t, C.back + .1), v = t < C.kaching ? 0 : 1e6, pulse = t > C.kaching ? Math.exp(-(t - C.kaching) * 4) : 0;
    x.save(); x.translate(W / 2, 330); x.scale(s * (1 + .15 * pulse), s * (1 + .15 * pulse));
    x.shadowColor = 'rgba(70,50,60,.25)'; x.shadowBlur = 30; x.fillStyle = '#2E2836'; rr(x, -330, -80, 660, 160, 34); x.fill(); x.shadowColor = 'transparent';
    x.fillStyle = '#F7C66A'; font(x, 34, 400, 'Lilita One'); x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('KAS KOTA', 0, -44);
    x.fillStyle = v ? '#9BE3B8' : '#FFF6E6'; font(x, 76, 400, 'Lilita One'); x.fillText('Rp' + fmt(v), 0, 22); x.restore();
    if (t > C.kaching) burst(x, W / 2, 330, seg(t, C.kaching, C.kaching + 1.1), 21);
  }
  function tap(t) {                                                           // the repost button, a finger taps it
    const s = popIn(t, C.tap - .5) * popOut(t, C.kaching + .6), k = t > C.tap ? Math.exp(-(t - C.tap) * 5) : 0; if (s <= 0) return;
    x.save(); x.translate(W - 190, 1000); x.scale(s, s);
    if (t > C.tap) { const u = seg(t, C.tap, C.tap + .6); x.strokeStyle = `rgba(221,42,123,${(1 - u) * .7})`; x.lineWidth = 10 * (1 - u) + 2; x.beginPath(); x.arc(0, 0, 70 + 70 * eo(u), 0, 7); x.stroke(); }   // a ripple on the tap
    x.fillStyle = '#FFFFFF'; x.shadowColor = 'rgba(70,50,60,.3)'; x.shadowBlur = 26; x.shadowOffsetY = 8; x.beginPath(); x.arc(0, 0, 78 * (1 - .12 * k), 0, 7); x.fill(); x.shadowColor = 'transparent';
    igBadge(x, 0, 0, 66 * (1 - .12 * k));
    const fx = 30 + 50 * (1 - seg(t, C.tap - .4, C.tap)), fy = 50 + 60 * (1 - seg(t, C.tap - .4, C.tap)); x.font = '80px serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('👆', fx, fy + 40);
    x.restore();
  }
  function cta(t) { if (t < C.cta || t > C.S10 + .1) return; const out = popOut(t, C.S10 - .1, .2);
    chip(x, 60, 300, popIn(t, C.cta) * out, ['FOLLOW @netizencity.id', { icon: 'insta' }], BUTTER, 40, true);
    chip(x, 60, 410, popIn(t, C.cta + .15) * out, ['KOMEN REQUEST', { icon: 'down' }], '#BFD8F2', 40, true);
    chip(x, 60, 520, popIn(t, C.cta + .3) * out, ['REPOST', { icon: 'repost' }], '#F6CFD9', 40, true); }
  function endCard(t) { if (t < C.endcard) return; const a = eo(seg(t, C.endcard, C.endcard + .4));
    x.save(); x.globalAlpha = a; x.translate(0, (1 - a) * 40);
    const y = 1400; x.fillStyle = 'rgba(46,40,54,.78)'; rr(x, 40, y - 30, W - 80, 230, 30); x.fill();
    x.fillStyle = '#FFF6E6'; font(x, 40, 400, 'Lilita One'); x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText('Instagram @netizencity.id', W / 2, y + 20); x.fillStyle = '#F7C66A'; x.fillText(ADDRESS, W / 2, y + 85); x.fillStyle = '#BFE6D6'; font(x, 36, 400, 'Lilita One');
    const rp = '1 REPOST = Rp1 JUTA ANGGARAN KOTA', rw = x.measureText(rp).width; x.fillText(rp, W / 2 - 30, y + 148); igBadge(x, W / 2 - 30 + rw / 2 + 40, y + 146, 25); x.restore(); }
  const WM = [[.32, .42], [.68, .56], [.36, .63], [.66, .38], [.5, .5], [.3, .53], [.7, .45], [.4, .4]];
  function watermark(t) {
    const i = Math.floor(t / 10), u = eio(seg(t - i * 10, 0, 1.2)), a = WM[(i + WM.length - 1) % WM.length], b = WM[i % WM.length];
    const X = lerp(a[0], b[0], i ? u : 1) * W, Y = lerp(a[1], b[1], i ? u : 1) * H;
    x.save(); x.globalAlpha = .2; font(x, 36, 600); x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round'; x.strokeStyle = 'rgba(40,30,40,.6)'; x.lineWidth = 5; x.strokeText('@netizencity.id', X, Y); x.fillStyle = '#FFFFFF'; x.fillText('@netizencity.id', X, Y); x.restore();
  }
  return {
    draw(t, P) {
      x.clearRect(0, 0, W, H);
      dayLabel(t); lowerThird(t);
      hud(t, P.tw, P.TLs);
      if (t >= C.S3 && t < C.boardCut + .3) {
        const s = popIn(t, C.S3) * popOut(t, C.boardCut), tilt = lerp(-.12, -.05, eo(seg(t, C.S3, C.S3 + .5))), st = { followers: '45.000' };
        if (t >= C.spin0 && t < C.spin1) { const u = seg(t, C.spin0, C.spin1), e = u * (SPIN.length - 1), i = Math.min(SPIN.length - 2, Math.floor(e)); st.spin = { a: fmt(SPIN[i]), b: fmt(SPIN[i + 1]), f: eo(e - i) }; }
        if (t >= C.spin1) { st.followers = '49.000'; st.pulse = Math.exp(-(t - C.spin1) * 3) * .5; }
        igCard(x, W / 2, 520, s, tilt, st);
      }
      progress(t); kemarin(t); requests(t);
      userCard(t, C.lib + .1, C.air - .15, '@ji_hann09', 'PERPUSTAKAAN', 'book', '#E7DEF5');
      userCard(t, C.air + .1, C.sport - .15, '@andramuhammad_09', 'BANDARA + PELABUHAN', 'plane', '#DCEAF7');
      userCard(t, C.sport + .1, C.S6 - .2, '@rznn8619', 'SARANA OLAHRAGA', 'ball', '#FFF1C6');
      sorry(t); invest(t); cta(t);
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
      if (gv) { star(x, gx + 8, gy - 6, 26, Math.sin(Math.PI * seg(t, C.glasses - .05, C.glasses + .4)) * (P.sc === 'office' ? 1 : 0)); star(x, gx + 14, gy - 10, 46, Math.sin(Math.PI * seg(t, C.sparkle, C.sparkle + .6))); }
      if (t >= C.boardGlow && P.board[2] && t < C.endcard) {
        const [bx, by] = P.board, a = popIn(t, C.boardGlow + .25, .4);
        x.save(); x.translate(clamp(bx, 330, W - 330), clamp(by - 70, 600, H - 620) + Math.sin(t * 3) * 6); x.scale(a, a);
        font(x, 52, 400, 'Lilita One'); const txt = 'POPULASI: 49.001 → ?', tw = x.measureText(txt).width;
        x.shadowColor = 'rgba(255,214,140,.9)'; x.shadowBlur = 40; x.fillStyle = '#FFF4DA'; rr(x, -tw / 2 - 34, -50, tw + 68, 100, 26); x.fill();
        x.shadowColor = 'transparent'; x.strokeStyle = '#D9A877'; x.lineWidth = 6; rr(x, -tw / 2 - 26, -42, tw + 52, 84, 20); x.stroke();
        x.fillStyle = '#4B3A36'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(txt, 0, 4);
        x.fillStyle = '#FFF4DA'; x.beginPath(); x.moveTo(-16, 50); x.lineTo(16, 50); x.lineTo(0, 74); x.closePath(); x.fill(); x.restore();
      }
      endCard(t);
      watermark(t);
      subtitle(t);
    }
  };
}
