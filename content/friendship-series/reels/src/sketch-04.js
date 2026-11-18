// Hand-drawn ink + watercolour reel: post 4, why kids need friends (30 s, 1080x1920).
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
  const fo = clamp(k * 1.6);
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
    <circle cx="0" cy="-246" r="34" fill="${PAPER}" opacity="${fo}"/>
    ${ln('M0 -280 A34 34 0 1 1 -0.1 -280', k)}${hair}${eyes}${mouth}
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


// ================= POST 4: Why do kids need friends? =================
const TXT = {
  en: { t1: ['Why does your child', 'need friends?'], t2: ['Long ago, people needed', 'each other to find food', 'and to stay safe.'],
    t3: ['Today, friends', 'still help.'], t4: ['They help your child', 'feel safe, seen', 'and a little braver.'],
    t5: ['This week, notice', 'when a friend helps.', 'Then say it out loud.'], say: 'That was kind of Sam!',
    title: ['The friendship series'], sub: ['for parents · new posts every weekday'], brand: 'The Mindful NL' },
  nl: { t1: ['Waarom heeft je kind', 'vrienden nodig?'], t2: ['Lang geleden hadden', 'mensen elkaar nodig voor', 'eten en veiligheid.'],
    t3: ['Vandaag helpen', 'vrienden nog steeds.'], t4: ['Ze helpen je kind', 'zich veilig en gezien', 'te voelen. En dapper.'],
    t5: ['Let deze week op', 'wanneer een vriendje helpt.', 'En zeg het hardop.'], say: 'Wat lief van Sam!',
    title: ['De vriendschapsserie'], sub: ['voor ouders · elke werkdag een nieuwe post'], brand: 'The Mindful NL' },
};

function tree(x, y, k) {
  return wash(`M${x - 150} ${y - 300} q-30 -150 110 -190 q60 -110 170 -20 q120 20 60 170 q20 90 -120 70 q-100 50 -220 -30 Z`, SAGE, .6 * k) +
    ln(`M${x - 150} ${y - 300} q-30 -150 110 -190 q60 -110 170 -20 q120 20 60 170 q20 90 -120 70 q-100 50 -220 -30 Z`, k, 4) +
    wash(`M${x - 18} ${y} l6 -260 h24 l6 260 Z`, SOIL, .45 * k) + ln(`M${x - 18} ${y} q6 -130 2 -260 M${x + 18} ${y} q-6 -130 2 -260 M${x} ${y - 200} l-40 -50 M${x + 6} ${y - 170} l44 -46`, k, 4);
}
const stars = (t, k) => [[120, 700], [260, 620], [400, 760], [560, 640], [700, 720], [860, 610], [960, 760], [330, 860], [820, 880], [180, 920]]
  .map(([x, y], i) => { const o = k * (.55 + .45 * Math.sin(t * 3 + i * 1.7)); return `<g opacity="${o}">${ln(`M${x - 9} ${y} h18 M${x} ${y - 9} v18`, k, 2.6)}</g>`; }).join('');
const flame = (x, y, h, col, op) => wash(`M${x - h * .32} ${y} Q${x - h * .42} ${y - h * .5} ${x} ${y - h} Q${x + h * .42} ${y - h * .5} ${x + h * .32} ${y} Z`, col, op);
function bubbleSay(x, y, w, h, txt, k) {
  if (k <= 0) return '';
  const d = `M${x - w / 2 + 30} ${y - h / 2} h${w - 60} q30 0 30 30 v${h - 60} q0 30 -30 30 h${-w / 2 + 70} l-34 40 l6 -40 h${-w / 2 + 58} q-30 0 -30 -30 v${-(h - 60)} q0 -30 30 -30 Z`;
  return `<g opacity="${clamp(k * 2)}">${`<path d="${d}" fill="${PAPER}"/>`}${ln(d, k, 4)}<text x="${x}" y="${y + 20}" text-anchor="middle" font-family="Caveat" font-weight="700" font-size="62" fill="${INK}">${txt}</text></g>`;
}

const SCENES = [
  { start: 0, end: 5, draw: (t, L) => {
    const child = fig(300, 1420, 1.2, { k: P(t, .3, 1.4), armR: 40 + Math.sin(t * 2) * 8, look: 6, smile: -.3, tilt: 2 });
    const [hx, hy] = child.hands[1];
    return { svg: hills(t, P(t, 0, 1.2)) + tree(790, 1260, P(t, .2, 1.4)) + cloud(300 + t * 5, 720, .9, P(t, .3, 1.4)) +
      ln(`M${hx} ${hy} Q${(hx + 785) / 2} ${1400 + Math.sin(t * 2) * 25} 785 1130`, P(t, 1.2, 2.4), 5, TERRA) + child.svg,
      html: text(L.t1, 260, 112, t, .4) }; } },
  { start: 5, end: 11, draw: (t, L) => {
    const fl = 1 + Math.sin(t * 11) * .08 + Math.sin(t * 7) * .05, kf = P(t, 5.6, 6.6);
    const a = fig(330, 1440, 1.2, { k: P(t, 5.8, 7), armR: 68, look: 6, smile: .8, hair: true }), b = fig(750, 1440, 1.2, { k: P(t, 6.1, 7.3), armL: 60, look: -6, smile: .9, bun: true });
    const [bx, by] = a.hands[1];
    const bowl = P(t, 7.2, 8) <= 0 ? '' : wash(`M${bx - 10} ${by - 6} q46 50 92 0 Z`, SOIL, .5) + ln(`M${bx - 10} ${by - 6} q46 50 92 0 Z`, P(t, 7.2, 8), 3.6) +
      [0, 1, 2, 3].map(i => `<circle cx="${bx + 14 + i * 20}" cy="${by - 12 - (i % 2) * 8}" r="9" fill="${TERRA}" stroke="${INK}" stroke-width="2.5" opacity="${P(t, 7.6 + i * .15, 7.9 + i * .15)}"/>`).join('');
    return { svg: blot(540, 800, 620, 380, BLUE, .32 * P(t, 5, 6)) + stars(t, P(t, 5.4, 6.4)) +
      blot(860, 640, 70, 70, OCHRE, .45 * P(t, 5.3, 6.2)) + ln('M860 586 a54 54 0 1 1 -0.1 0', P(t, 5.3, 6.4), 3.6) +
      wash('M-40 1330 L180 1060 L330 1220 L470 1100 L700 1330 Z', SHADE, .4 * P(t, 5.2, 6.2)) + ln('M-40 1330 L180 1060 L330 1220 L470 1100 L700 1330', P(t, 5.2, 6.4), 4) +
      wash('M-40 1330 L1130 1310 L1130 1540 C700 1600 300 1520 -40 1580 Z', SOIL, .35 * P(t, 5.2, 6.2)) + ln('M-40 1330 L1130 1310', P(t, 5.2, 6.2), 4) +
      blot(540, 1360, 190 * fl, 120 * fl, OCHRE, .5 * kf) + flame(540, 1440, 150 * fl * kf, TERRA, .75) + flame(540, 1440, 90 * fl * kf, OCHRE, .9) +
      ln('M470 1450 L610 1420 M470 1420 L610 1452', kf, 6) + a.svg + b.svg + bowl,
      html: text(L.t2, 240, 100, t, 5.4) }; } },
  { start: 11, end: 16.6, draw: (t, L) => {
    const a = fig(470, 1430, 1.15, { k: P(t, 11.3, 12.3), armR: 160, look: 4, smile: 1 }), b = fig(612, 1430, 1.15, { k: P(t, 11.5, 12.5), armL: 160, look: -4, smile: 1, bun: true });
    const ku = P(t, 12.2, 13.2), canopy = 'M300 1000 Q541 760 782 1000 Q742 975 702 1000 Q661 975 621 1000 Q581 975 541 1000 Q501 975 461 1000 Q421 975 381 1000 Q341 975 300 1000 Z';
    const rain = Array.from({ length: 34 }, (_, i) => { const x = (i * 97) % 1080, y = 520 + ((i * 263 + t * 1100) % 1000);
      return (x > 290 && x < 790 && y > 860) ? '' : `<path d="M${x} ${y} l-10 36" stroke="${BLUE}" stroke-width="4" stroke-linecap="round"/>`; }).join('');
    const ripple = (x, i) => { const ph = (t * .9 + i * .37) % 1; return `<ellipse cx="${x}" cy="1460" rx="${20 + ph * 60}" ry="${5 + ph * 12}" fill="none" stroke="${INK}" stroke-width="2.5" opacity="${(1 - ph) * .8}"/>`; };
    return { svg: blot(540, 760, 560, 300, BLUE, .25 * P(t, 11, 12)) + (P(t, 11.6, 12) > 0 ? rain : '') +
      blot(200, 1460, 150, 30, BLUE, .5) + blot(900, 1470, 130, 28, BLUE, .45) + ripple(200, 0) + ripple(900, 1) + ripple(240, 2) +
      ln('M-40 1440 C300 1425 700 1445 1130 1430', P(t, 11, 11.8), 4) + blot(540, 1520, 420, 50, SAGE, .3) +
      a.svg + b.svg + wash(canopy, TERRA, .7 * ku) + ln(canopy, ku, 4.5) + ln('M541 880 L541 1130 q0 26 -22 22', ku, 4.5),
      html: text(L.t3, 260, 112, t, 11.4) }; } },
  { start: 16.6, end: 22.6, draw: (t, L) => {
    const u = eio(P(t, 17.4, 22.4)), cx = lerp(330, 610, u), wob = Math.sin(t * 3.4) * 7, walk = Math.sin(t * 6) * 14 * (u > 0 && u < 1 ? 1 : 0);
    const c = fig(cx, 1300, 1.05, { k: P(t, 16.8, 17.8), armL: 95 + wob, armR: 70 - wob, tilt: wob * .6, legL: walk, legR: -walk, smile: lerp(-.2, .8, u), look: 3 });
    const f = fig(cx + 150, 1460, 1.05, { k: P(t, 17, 18), armL: 110, look: -5, smile: .9, bun: true, legL: walk, legR: -walk });
    const [h1x, h1y] = c.hands[1], [h2x, h2y] = f.hands[0], kh = P(t, 18, 18.6);
    return { svg: hills(t, 1).replace(/<path d="M620 1233[^>]*>/, '') +
      wash('M220 1310 h620 v46 h-620 Z', SOIL, .5 * P(t, 16.7, 17.6)) + ln('M220 1310 h620 M220 1356 h620', P(t, 16.7, 17.6), 4.5) +
      ln('M220 1333 m-12 0 a12 23 0 1 0 24 0 a12 23 0 1 0 -24 0 M840 1333 m-12 0 a12 23 0 1 0 24 0 a12 23 0 1 0 -24 0', P(t, 16.9, 17.7), 3.6) +
      ln('M260 1356 l-20 100 M800 1356 l20 100', P(t, 16.9, 17.7), 4) +
      c.svg + f.svg + (kh > 0 ? ln(`M${h1x} ${h1y} Q${(h1x + h2x) / 2} ${(h1y + h2y) / 2 + 14} ${h2x} ${h2y}`, kh, 4.5) : ''),
      html: text(L.t4, 240, 104, t, 16.9) }; } },
  { start: 22.6, end: 27.4, draw: (t, L) => {
    const walk = Math.sin(t * 6) * 16, dx = (t - 22.6) * 22;
    return { svg: wash('M-40 1460 L1130 1450 L1130 1560 C700 1600 300 1540 -40 1580 Z', SAGE, .4) + ln('M-40 1460 C300 1452 700 1462 1130 1450', P(t, 22.6, 23.3), 4) +
      wash('M800 1460 v-200 l110 -90 l110 90 v200 Z', OCHRE, .3 * P(t, 22.8, 23.8)) + ln('M800 1460 v-200 l110 -90 l110 90 v200 M870 1460 v-100 h50 v100 M820 1268 l-20 16 M1000 1268 l20 16', P(t, 22.8, 24), 4) +
      ln('M120 1460 v-420 q0 -40 50 -40 h30', P(t, 22.7, 23.6), 4) + blot(200, 1030, 50, 40, OCHRE, .45 * P(t, 23.4, 24)) + ln('M186 1000 h30 l-6 30 h-18 Z', P(t, 23.2, 23.9), 3.6) +
      fig(340 + dx, 1470, 1.5, { k: P(t, 22.8, 23.8), armR: 20, armL: 14 - walk * .4, legL: walk, legR: -walk, look: 7, smile: 1, hair: true }).svg +
      fig(500 + dx, 1470, 1.1, { k: P(t, 23, 24), armL: 20, armR: 14 + walk * .4, legL: -walk, legR: walk, look: -6, smile: 1 }).svg +
      bubbleSay(470 + dx * .5, 870, 620, 140, L.say, P(t, 24.4, 25.2)),
      html: text(L.t5, 230, 94, t, 22.9) }; } },
  { start: 27.4, end: 30, last: true, draw: (t, L) => {
    const a = fig(250, 1360, .95, { armR: 120 + Math.sin(t * 7) * 30, look: 5, smile: 1, hair: true }), b = fig(830, 1360, .95, { armL: 120 + Math.sin(t * 7) * 30, look: -5, smile: 1, bun: true });
    const [ax, ay] = a.hands[1], [bx, by] = b.hands[0], cyR = (ay + by) / 2 + Math.cos(t * 7) * 300 + 40;
    const jump = Math.max(0, Math.sin(t * 7 + 1.4)) * 70;
    return { svg: wash('M-40 1370 L1130 1360 L1130 1460 C700 1500 300 1440 -40 1480 Z', SAGE, .45) + ln('M-40 1370 C300 1362 700 1372 1130 1360', P(t, 27.4, 28), 4) +
      a.svg + b.svg + fig(540, 1360 - jump, .95, { armL: 60, armR: 60, legL: jump * .25, legR: jump * .25, smile: 1, closed: true }).svg +
      ln(`M${ax} ${ay} Q540 ${cyR} ${bx} ${by}`, 1, 5, TERRA) + blot(540, 1380, 120, 18, SHADE, .3),
      html: text(L.title, 260, 128, t, 27.6) + text(L.sub, 1480, 52, t, 28.3, 'small') + text([L.brand], 1560, 72, t, 28.8) }; } },
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
