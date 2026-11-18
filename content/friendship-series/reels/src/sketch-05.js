// Hand-drawn ink + watercolour reel: chapter 5, making friends, through a child's eyes (30 s, 1080x1920).
// Style: ink line art on cream paper, soft watercolour washes, simple round-headed figures,
// lines that draw themselves on, gentle "boiling" line wobble, slow camera drift, soft crossfades.
(() => {
const INK = '#2B2622', PAPER = '#F4ECDF', SAGE = '#9FB283', BLUE = '#9DB6C6', TERRA = '#C8775B', OCHRE = '#D9AE5F', SHADE = '#B9AC98', SOIL = '#A88B6A';
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const P = (t, a, b) => clamp((t - a) / (b - a));
const eo = k => 1 - Math.pow(1 - k, 3);
const eio = k => (k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
const lerp = (a, b, k) => a + (b - a) * k;
const rad = d => d * Math.PI / 180;

// ---------- drawing primitives ----------
const ln = (d, k, w = 4.5, col = INK, extra = '') => k <= 0 ? '' :
  `<path d="${d}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${1 - eo(k)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const wash = (d, col, op) => op <= 0 ? '' : `<path d="${d}" fill="${col}" opacity="${op}" filter="url(#wash)" style="mix-blend-mode:multiply"/>`;
const blot = (x, y, rx, ry, col, op) => op <= 0 ? '' : `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${col}" opacity="${op}" filter="url(#wash)" style="mix-blend-mode:multiply"/>`;

// figure: origin at feet. o: k, armL, armR, legL, legR (deg from straight down, + = outward), look, smile, closed, hair, bun, tilt
function fig(x, y, s, o = {}) {
  const k = o.k ?? 1;
  const aL = o.armL ?? 12, aR = o.armR ?? 12, gL = o.legL ?? 6, gR = o.legR ?? 6, look = o.look ?? 0, sm = o.smile ?? .5;
  const limb = (sx, sy, side, ang, len) => {
    const ex = sx + side * Math.sin(rad(ang)) * len, ey = sy + Math.cos(rad(ang)) * len;
    const cx = (sx + ex) / 2 + side * 6, cy = (sy + ey) / 2 + 4;
    return { d: `M${sx} ${sy} Q${cx} ${cy} ${ex} ${ey}`, ex, ey };
  };
  const L1 = limb(-20, -188, -1, aL, 92), R1 = limb(20, -188, 1, aR, 92);
  const L2 = limb(-9, -108, -1, gL, 104), R2 = limb(9, -108, 1, gR, 104);
  const fo = clamp(k * 1.6), dn = (o.down ?? 0);
  const eyes = o.closed
    ? ln(`M${-17 + look} -250 q6 5 12 0`, k, 3.4) + ln(`M${5 + look} -250 q6 5 12 0`, k, 3.4)
    : (fo > .5 ? `<circle cx="${-11 + look}" cy="-250" r="4" fill="${INK}"/><circle cx="${11 + look}" cy="-250" r="4" fill="${INK}"/>` : '');
  const mouth = ln(`M${-9 + look} ${-232 - sm * 2} Q${look} ${-232 + sm * 7} ${9 + look} ${-232 - sm * 2}`, k, 3.4);
  const hair = (o.hair ? ln('M-6 -279 q4 -12 12 -16 M4 -280 q6 -8 14 -9', k, 3.4) : '') + (o.bun ? ln('M18 -276 a11 11 0 1 1 14 -12', k, 3.8) : '');
  const svg = `<g transform="translate(${x} ${y}) scale(${s}) rotate(${o.tilt ?? 0} 0 -150)">
    <ellipse cx="0" cy="2" rx="46" ry="7" fill="${SHADE}" opacity="${.35 * fo}" filter="url(#wash)"/>
    ${ln(L2.d, k)}${ln(R2.d, k)}${ln(`M${L2.ex} ${L2.ey} l-12 1`, k)}${ln(`M${R2.ex} ${R2.ey} l12 1`, k)}
    <path d="M-24 -185 Q-26 -211 0 -211 Q26 -211 24 -185 L22 -122 Q20 -102 0 -102 Q-20 -102 -22 -122 Z" fill="${PAPER}" opacity="${fo}"/>
    <path d="M8 -204 Q24 -205 22 -150 L20 -118 Q12 -104 6 -106 Z" fill="${SHADE}" opacity="${.45 * fo}" filter="url(#wash2)" style="mix-blend-mode:multiply"/>
    ${ln('M-24 -185 Q-26 -211 0 -211 Q26 -211 24 -185 L22 -122 Q20 -102 0 -102 Q-20 -102 -22 -122 Z', k)}
    ${ln(L1.d, k)}${ln(R1.d, k)}
    <g transform="translate(${dn * 4} ${dn * 12}) rotate(${dn * 8} 0 -246)"><circle cx="0" cy="-246" r="34" fill="${PAPER}" opacity="${fo}"/>
    ${ln('M0 -280 A34 34 0 1 1 -0.1 -280', k)}${hair}<g transform="translate(0 ${dn * 9})">${eyes}${mouth}</g></g>
  </g>`;
  const hand = (e) => [x + e.ex * s, y + e.ey * s];
  return { svg: k <= 0 ? '' : svg, hands: [hand(L1), hand(R1)] };
}

function cloud(x, y, s, k) {
  return `<g transform="translate(${x} ${y}) scale(${s})">${blot(30, 6, 120, 34, BLUE, .5 * k)}
    ${ln('M-110 20 Q-120 -6 -84 -8 Q-80 -40 -40 -34 Q-24 -66 14 -50 Q44 -74 70 -40 Q110 -40 104 -6 Q140 0 120 20 Z', k, 3.6)}
    ${ln('M-150 30 L170 34', k * .9, 3)}</g>`;
}
const bird = (x, y, s, k) => ln(`M${x - 12 * s} ${y - 6 * s} q${7 * s} ${2 * s} ${12 * s} ${8 * s} q${4 * s} ${-7 * s} ${13 * s} ${-9 * s}`, k, 3);
const tuft = (x, y, k) => ln(`M${x - 10} ${y} l4 -16 M${x} ${y} l1 -22 M${x + 9} ${y} l-3 -15`, k, 3);

// rolling hills ground
function hills(t, k) {
  const d = 'M-40 1290 C220 1225 470 1255 700 1225 S1000 1196 1130 1214';
  return wash('M-40 1290 C220 1225 470 1255 700 1225 S1000 1196 1130 1214 L1130 1470 C800 1520 400 1440 -40 1530 Z', SAGE, .55 * k) +
    blot(260, 1600, 260, 50, SAGE, .35 * k) + blot(820, 1640, 220, 40, SAGE, .3 * k) + blot(520, 1740, 180, 30, OCHRE, .18 * k) +
    wash('M600 1236 C780 1180 960 1180 1130 1206 L1130 1300 L600 1290 Z', OCHRE, .22 * k) +
    ln(d, k, 4.5) + ln('M620 1233 C800 1170 960 1176 1130 1196', k * .9, 3.5) +
    [[90, 1300], [210, 1420], [480, 1340], [900, 1360], [1010, 1480], [620, 1520], [330, 1600]].map(([x, y], i) => tuft(x, y, P(k, .3 + i * .08, .7 + i * .08))).join('');
}

// handwritten text block: each line wipes in left to right
function text(lines, y, size, t, at, cls = '') {
  return `<div class="txt ${cls}" style="top:${y}px;font-size:${size}px">` + lines.map((l, i) => {
    const k = eio(P(t, at + i * .45, at + i * .45 + .8));
    return `<div style="clip-path:inset(-20% ${(1 - k) * 100}% -20% 0)">${l}</div>`;
  }).join('') + `</div>`;
}


// ================= Chapter 5: Making friends — through a child's eyes =================
const TXT = {
  en: {
    t1: ['“The hardest part?', 'Saying the very', 'first word.”'],
    t2: ['“When I’m shy,', 'my head goes down.', 'My arms hug me.', 'No words come out.”'],
    t3: ['“But when I feel brave,', 'I look up. I smile.', 'And I say hi.”'], hi: 'Hi! I’m Noor.',
    t4: ['“Then I tell you', 'one thing about me…', 'and ask one about you.”'], b1: 'I love drawing!', b2: 'What do you like?', b3: 'Dinosaurs!',
    t5: ['“Or I just join in.”'], p: ['Can I help?', 'Cool shoes!', 'Want to play?'],
    t6: ['When your child hangs back,', 'they’re not being rude.', 'They’re finding', 'their first word.'],
    end: ['Friendship,', 'through a child’s eyes'], brand: 'The Mindful NL' },
};
TXT.nl = TXT.en;

const crayon = (d, col, k, w = 12) => k <= 0 ? '' : `<path d="${d}" pathLength="1" stroke-dasharray="1 1" stroke-dashoffset="${1 - eo(k)}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity=".6" filter="url(#wash2)"/>`;
function say(x, y, w, h, txt, k, tail = 'l', size = 58) {
  if (k <= 0) return '';
  const tl = tail === 'l' ? `h${-w / 2 + 70} l-34 40 l6 -40 h${-w / 2 + 58}` : `h${-w / 2 + 112} l-6 40 l-34 -40 h${-w / 2 + 16}`;
  const d = `M${x - w / 2 + 30} ${y - h / 2} h${w - 60} q30 0 30 30 v${h - 60} q0 30 -30 30 ${tl} q-30 0 -30 -30 v${-(h - 60)} q0 -30 30 -30 Z`;
  const s = eo(clamp(k * 1.4));
  return `<g opacity="${clamp(k * 2)}" transform="translate(${x} ${y}) scale(${.85 + .15 * s}) translate(${-x} ${-y})"><path d="${d}" fill="${PAPER}"/>${ln(d, k, 4)}<text x="${x}" y="${y + size * .33}" text-anchor="middle" font-family="Caveat" font-weight="700" font-size="${size}" fill="${INK}">${txt}</text></g>`;
}
const SHY = { down: 1, armL: -38, armR: -38, look: 4, smile: -.25, tilt: 5 };
const BRAVE = { down: 0, armL: 30, armR: 30, look: 0, smile: 1, tilt: 0 };
const mix = (a, b, k) => { const o = {}; for (const key in a) o[key] = lerp(a[key], b[key], k); return o; };
const players = (t, k, x0 = 700) => [x0, x0 + 110, x0 + 220].map((x, i) => fig(x, 1232 - i * 6, .52, { k, armL: 130 + Math.sin(t * 5 + i) * 25, armR: 140 + Math.cos(t * 5 + i) * 25, smile: 1, look: i === 0 ? 4 : -4, bun: i === 1 }).svg).join('') +
  (k > .5 ? `<circle cx="${x0 + 110 + Math.sin(t * 2.4) * 90}" cy="${1030 - Math.abs(Math.sin(t * 4.8)) * 70}" r="11" fill="${TERRA}" stroke="${INK}" stroke-width="3"/>` : '');
function panel(i, y, t, at, L) {
  const k = P(t, at, at + .6); if (k <= 0) return '';
  const box = `M150 ${y} h780 v260 h-780 Z`, cx = 540;
  const inner = [
    () => wash(`M${cx + 40} ${y + 236} h120 v-40 h-40 v-40 h-40 v40 h-40 Z`, OCHRE, .55) + ln(`M${cx + 40} ${y + 236} h120 v-40 h-40 v-40 h-40 v40 h-40 Z`, k, 3) +
      fig(cx - 120, y + 240, .55, { armR: 60, look: 5, smile: .9 }).svg + fig(cx + 230, y + 240, .55, { armL: 40, look: -5, smile: .6, bun: true }).svg,
    () => fig(cx - 120, y + 240, .55, { armR: 30, look: 5, smile: 1, hair: true }).svg + fig(cx + 140, y + 240, .55, { look: -5, smile: 1, closed: true }).svg +
      blot(cx + 128, y + 240, 34, 10, TERRA, .7),
    () => fig(cx - 120, y + 240, .55, { armR: 70, look: 5, smile: 1 }).svg + `<circle cx="${cx - 52}" cy="${y + 150}" r="16" fill="${TERRA}" stroke="${INK}" stroke-width="3"/>` +
      fig(cx + 140, y + 240, .55, { armL: 20 + Math.sin(t * 6) * 10, look: -5, smile: .9, bun: true }).svg,
  ][i]();
  return `<g opacity="${clamp(k * 2)}">${`<path d="${box}" fill="${PAPER}"/>`}${wash(box, [SAGE, BLUE, OCHRE][i], .18)}${ln(box, k, 4)}${inner}${say(cx + 10, y + 62, 300, 84, L.p[i], P(t, at + .4, at + .9), 'l', 46)}</g>`;
}

const SCENES = [
  { start: 0, end: 4.2, draw: (t, L) => ({
    svg: hills(t, P(t, 0, 1.1)) + players(t, P(t, .4, 1.4)) + crayon('M900 640 a50 50 0 1 1 -0.1 0 M900 560 v-30 M960 590 l20 -20 M840 590 l-20 -20 M980 640 h30', OCHRE, P(t, .5, 1.8)) +
      fig(330, 1500, 1.6, { k: P(t, .2, 1.3), look: 2, smile: .3, down: .2 }).svg,
    html: text(L.t1, 250, 108, t, .3) }) },
  { start: 4.2, end: 9.6, draw: (t, L) => ({
    svg: hills(t, 1) + players(t, 1) + fig(380, 1500, 1.6, SHY).svg,
    html: text(L.t2, 220, 96, t, 4.4) }) },
  { start: 9.6, end: 15.2, draw: (t, L) => {
    const m = eio(P(t, 9.9, 11.2)), pose = mix(SHY, BRAVE, m);
    if (t > 12.3) pose.armR = 150 + Math.sin(t * 9) * 18;
    return { svg: hills(t, 1) + players(t, 1) + fig(380, 1500, 1.6, pose).svg + say(640, 960, 440, 120, L.hi, P(t, 12.4, 13)) +
      crayon('M150 900 l20 -40 l20 40 l-40 -25 h40 Z', OCHRE, P(t, 12.8, 13.8), 7) + crayon('M880 1010 l14 -28 l14 28 l-28 -18 h28 Z', TERRA, P(t, 13.1, 14), 7),
      html: text(L.t3, 230, 100, t, 9.8) }; } },
  { start: 15.2, end: 20.4, draw: (t, L) => ({
    svg: wash('M-40 1420 L1130 1410 L1130 1520 C700 1560 300 1500 -40 1540 Z', SAGE, .45) + ln('M-40 1420 C300 1412 700 1422 1130 1410', P(t, 15.2, 15.9), 4) +
      fig(330, 1430, 1.4, { k: P(t, 15.3, 16.1), armR: 25, look: 6, smile: 1 }).svg + fig(760, 1430, 1.4, { k: P(t, 15.5, 16.3), look: -6, smile: lerp(.4, 1, P(t, 18.6, 19.2)), bun: true }).svg +
      say(390, 870, 420, 110, L.b1, P(t, 16.4, 17)) + say(420, 1010, 460, 110, L.b2, P(t, 17.4, 18)) + say(760, 860, 340, 110, L.b3, P(t, 18.6, 19.2), 'r'),
    html: text(L.t4, 230, 96, t, 15.4) }) },
  { start: 20.4, end: 25, draw: (t, L) => ({
    svg: panel(0, 560, t, 21.0, L) + panel(1, 860, t, 22.0, L) + panel(2, 1160, t, 23.0, L),
    html: text(L.t5, 300, 112, t, 20.6) }) },
  { start: 25, end: 28.4, draw: (t, L) => ({
    svg: hills(t, 1) + players(t, 1, 650) +
      fig(240, 1520, 2.0, { armR: 20, look: 8, smile: .7, hair: true }).svg + fig(390, 1520, 1.1, { armL: 28, down: .6, look: 7, smile: .2, tilt: -4 }).svg +
      blot(390, 1520, 90, 14, SHADE, .3),
    html: `<div style="position:absolute;inset:0">${text(L.t6, 220, 92, t, 25.2, 'adult')}</div>` }) },
  { start: 28.4, end: 30, last: true, draw: (t, L) => ({
    svg: crayon('M540 1140 C440 1060 430 960 495 960 C525 960 540 990 540 1005 C540 990 555 960 585 960 C650 960 640 1060 540 1140', TERRA, P(t, 28.6, 29.4), 14) +
      fig(470, 1400, .9, { armR: 42, look: 4, smile: 1 }).svg + fig(610, 1400, .9, { armL: 42, look: -4, smile: 1, bun: true }).svg +
      ln('M260 1405 Q540 1385 820 1405', P(t, 28.4, 29), 4),
    html: text(L.end, 330, 118, t, 28.5) + text([L.brand], 1480, 72, t, 29.0) }) },
];

function render(t, lang) {
  const L = TXT[lang], seed = 1 + (Math.floor(t * 8) % 4);
  let svg = '', html = '';
  for (const s of SCENES) {
    if (t < s.start - .01 || t > s.end + .7) continue;
    const fi = s.start === 0 ? 1 : eio(P(t, s.start, s.start + .7)), fo = s.last ? 1 : 1 - eio(P(t, s.end, s.end + .7));
    const o = Math.min(fi, fo); if (o <= 0) continue;
    const z = 1 + .045 * P(t, s.start, s.end + .7), r = s.draw(t, L);
    svg += `<g opacity="${o}" transform="translate(540 1150) scale(${z}) translate(-540 -1150)"><g filter="url(#ink)">${r.svg}</g></g>`;
    html += `<div style="position:absolute;inset:0;opacity:${o}">${r.html}</div>`;
  }
  document.getElementById('stage').innerHTML = `<svg viewBox="0 0 1080 1920" width="1080" height="1920">
    <defs>
      <filter id="ink" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="2" seed="${seed}" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="4.5"/></filter>
      <filter id="wash" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves="4" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="34" result="d"/><feGaussianBlur in="d" stdDeviation="2.5"/></filter>
      <filter id="wash2" x="-30%" y="-30%" width="160%" height="160%"><feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="3" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="6" result="d"/><feGaussianBlur in="d" stdDeviation="1.5"/></filter>
      <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="7"/><feColorMatrix values="0 0 0 0 .35 0 0 0 0 .28 0 0 0 0 .2 0 0 0 .11 0"/></filter>
      <radialGradient id="vig" cx="50%" cy="50%" r="75%"><stop offset="60%" stop-color="#8A7458" stop-opacity="0"/><stop offset="100%" stop-color="#8A7458" stop-opacity=".22"/></radialGradient>
    </defs>${svg}
    <rect width="1080" height="1920" filter="url(#paper)"/><rect width="1080" height="1920" fill="url(#vig)"/></svg>${html}`;
}

window.SK = { duration: 30, render };
})();
