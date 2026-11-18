// Friendship series: tiny deterministic animation engine.
// renderAt(t) draws the whole frame for time t (seconds), so every frame is reproducible.

const C = {
  cream: '#FBF6EE', paper: '#FFFDF8', ink: '#2F4A3A', inkSoft: '#5E7566',
  sage: '#8FB89A', sageDeep: '#5F9470', peach: '#F4B69C', sun: '#F7D774',
  sky: '#A9CBE6', blush: '#F2A7B5', lilac: '#C9B6E4', cheek: '#F29C8F',
};

// ---------- easing ----------
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const easeOut = k => 1 - Math.pow(1 - k, 3);
const easeInOut = k => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const easeBack = k => { const c1 = 1.5, c3 = c1 + 1; return 1 + c3 * Math.pow(k - 1, 3) + c1 * Math.pow(k - 1, 2); };
// pop-in: scale + fade, starting at time a
const pop = (t, a, d = 0.45) => { const k = prog(t, a, a + d); return { s: k <= 0 ? 0 : easeBack(k), o: clamp(k * 2.5) }; };
const rise = (t, a, d = 0.6, dist = 40) => { const k = easeOut(prog(t, a, a + d)); return { y: (1 - k) * dist, o: k }; };

// ---------- characters ----------
// pose: headDrop, headTilt, lookX, lookY, smile(-1..1), eyesClosed(0..1), armL, armR (deg, 0 = down, + = outward), hunch(0..1), mouthOpen(0..1)
const KIDS = {
  noor: { skin: '#8D5B3E', hair: '#2B2220', shirt: C.sun, pants: '#6E86A8', hairStyle: 'curly' },
  finn: { skin: '#F1C7A5', hair: '#D9773B', shirt: C.sage, pants: '#7A6A5A', hairStyle: 'short' },
  mila: { skin: '#C98E62', hair: '#3A2A22', shirt: C.sky, pants: '#B5838D', hairStyle: 'bob' },
};
const BASE_POSE = { headDrop: 0, headTilt: 0, lookX: 0, lookY: 0, smile: 0.7, eyesClosed: 0, armL: 12, armR: 12, hunch: 0, mouthOpen: 0 };
const mixPose = (a, b, k) => { const o = {}; for (const key in BASE_POSE) o[key] = lerp(a[key] ?? BASE_POSE[key], b[key] ?? BASE_POSE[key], k); return o; };

function hair(style, col) {
  if (style === 'curly') return `<g fill="${col}">${[[-40,-22],[-26,-42],[-6,-50],[16,-46],[34,-32],[44,-12],[-46,0],[46,6]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="20"/>`).join('')}</g>`;
  if (style === 'bob') return `<path fill="${col}" d="M-52 18 C-58 -40 -30 -58 0 -58 C30 -58 58 -40 52 18 L40 18 C42 -8 30 -26 0 -28 C-30 -26 -42 -8 -40 18 Z"/>`;
  return `<path fill="${col}" d="M-48 -6 C-50 -44 -20 -56 4 -54 C30 -52 50 -36 48 -8 C34 -24 14 -30 -4 -26 C-20 -24 -34 -18 -48 -6 Z"/>`;
}

function kid(name, pose = {}, opts = {}) {
  const k = KIDS[name], p = { ...BASE_POSE, ...pose };
  const eyeY = -2 + p.lookY, eyeDX = p.lookX;
  const eye = x => p.eyesClosed > 0.5
    ? `<path d="M${x - 7} ${eyeY} q7 6 14 0" stroke="${C.ink}" stroke-width="4" fill="none" stroke-linecap="round"/>`
    : `<ellipse cx="${x + eyeDX}" cy="${eyeY}" rx="5.5" ry="${6.5 * (1 - p.eyesClosed)}" fill="${C.ink}"/>`;
  const sm = p.smile * 12;
  const mouth = p.mouthOpen > 0.05
    ? `<ellipse cx="0" cy="24" rx="${9 + p.mouthOpen * 3}" ry="${4 + p.mouthOpen * 7}" fill="#7A3B33"/>`
    : `<path d="M-13 ${22 - sm * 0.2} Q0 ${22 + sm} 13 ${22 - sm * 0.2}" stroke="${C.ink}" stroke-width="4.5" fill="none" stroke-linecap="round"/>`;
  const arm = (side, ang) => {
    const sx = side * 40, a = side * ang;
    return `<g transform="translate(${sx} 150) rotate(${-a})"><rect x="-11" y="-6" width="22" height="78" rx="11" fill="${k.shirt}" stroke="rgba(0,0,0,.06)"/><circle cx="0" cy="76" r="12" fill="${k.skin}"/></g>`;
  };
  const sw = opts.scale ?? 1;
  return `<svg viewBox="-100 -40 200 330" width="${200 * sw}" height="${330 * sw}" style="overflow:visible">
    <ellipse cx="0" cy="282" rx="58" ry="9" fill="rgba(47,74,58,.10)"/>
    <g transform="translate(0 ${p.hunch * 10}) scale(1 ${1 - p.hunch * 0.05})">
      <rect x="-32" y="200" width="26" height="76" rx="12" fill="${k.pants}"/><rect x="6" y="200" width="26" height="76" rx="12" fill="${k.pants}"/>
      ${p.armL >= 0 ? arm(-1, p.armL) : ''}${p.armR >= 0 ? arm(1, p.armR) : ''}
      <rect x="-44" y="128" width="88" height="96" rx="34" fill="${k.shirt}"/>
      ${p.armL < 0 ? arm(-1, p.armL) : ''}${p.armR < 0 ? arm(1, p.armR) : ''}
      <g transform="translate(0 ${70 + p.headDrop}) rotate(${p.headTilt})">
        <rect x="-10" y="38" width="20" height="22" rx="8" fill="${k.skin}"/>
        <circle r="52" fill="${k.skin}"/>
        ${hair(k.hairStyle, k.hair)}
        ${eye(-18)}${eye(18)}
        <ellipse cx="-30" cy="14" rx="9" ry="6" fill="${C.cheek}" opacity=".55"/><ellipse cx="30" cy="14" rx="9" ry="6" fill="${C.cheek}" opacity=".55"/>
        ${mouth}
      </g>
    </g></svg>`;
}

// ---------- UI pieces ----------
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/\*(.+?)\*/g, '<b>$1</b>');
function bubble(text, { x, y, w = 600, color = C.paper, tail = 'bl', t, at, size = 54, rot = 0 }) {
  const P = pop(t, at);
  if (P.o <= 0) return '';
  const tails = { bl: 'left:70px;bottom:-26px', br: 'right:70px;bottom:-26px', none: 'display:none' };
  return `<div class="bubble" style="left:${x}px;top:${y}px;width:${w}px;background:${color};font-size:${size}px;opacity:${P.o};transform:translate(-50%,-50%) rotate(${rot}deg) scale(${P.s})">
    ${esc(text)}<i style="${tails[tail]};border-top-color:${color}"></i></div>`;
}
function chip(text, { x, y, color, t, at, size = 46 }) {
  const P = pop(t, at);
  if (P.o <= 0) return '';
  return `<div class="chip" style="left:${x}px;top:${y}px;opacity:${P.o};transform:translate(-50%,-50%) scale(${P.s});font-size:${size}px"><span style="background:${color}"></span>${esc(text)}</div>`;
}
function headline(text, { y = 330, t, at, size = 84, w = 900, color = C.ink, align = 'center' }) {
  const R = rise(t, at);
  if (R.o <= 0) return '';
  return `<div class="headline" style="top:${y}px;width:${w}px;font-size:${size}px;color:${color};text-align:${align};opacity:${R.o};transform:translate(-50%, ${R.y}px)">${esc(text)}</div>`;
}
function place(html, x, y, extra = '') { return `<div class="abs" style="left:${x}px;top:${y}px;transform:translate(-50%,-50%) ${extra}">${html}</div>`; }

function background(t) {
  const blobs = [[160, 260, 220, C.sun, 0.18], [930, 520, 260, C.sky, 0.20], [120, 1380, 280, C.blush, 0.16], [960, 1600, 240, C.sage, 0.20], [560, 980, 420, C.peach, 0.08]];
  return blobs.map(([x, y, r, c, o], i) => {
    const dx = Math.sin(t * 0.35 + i) * 26, dy = Math.cos(t * 0.3 + i * 2) * 22;
    return `<div class="blob" style="left:${x + dx}px;top:${y + dy}px;width:${r * 2}px;height:${r * 2}px;background:${c};opacity:${o}"></div>`;
  }).join('');
}
function brandTop() { return `<div class="brand"><span class="dot"></span>The Mindful NL</div>`; }
function progress(t, dur) { return `<div class="prog"><div style="width:${(t / dur) * 100}%"></div></div>`; }

// ---------- scene runner ----------
function renderReel(reel, lang, t) {
  const L = reel.text[lang];
  let html = background(t) + brandTop();
  for (const s of reel.scenes) {
    if (t < s.start - 0.01 || t > s.end + 0.4) continue;
    const fadeIn = s.start === 0 ? 1 : easeOut(prog(t, s.start, s.start + 0.35));
    const fadeOut = 1 - easeInOut(prog(t, s.end, s.end + 0.35));
    const o = Math.min(fadeIn, s.last ? 1 : fadeOut);
    if (o <= 0) continue;
    html += `<div class="scene" style="opacity:${o}">${s.draw(t, L, t - s.start)}</div>`;
  }
  html += progress(t, reel.duration);
  document.getElementById('stage').innerHTML = html;
}

window.FS = { C, clamp, lerp, prog, easeOut, easeInOut, easeBack, pop, rise, kid, mixPose, bubble, chip, headline, place, renderReel };
