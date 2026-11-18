// Hand-drawn ink + watercolour reel: friendship series launch (30 s, 1080x1920).
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

const TXT = {
  en: { t1: ["You can’t make friends", 'for your child.'], t2: ['But you can', 'light the way.'], t3: ['Not by pushing.', 'By giving them', 'room to grow.'],
    t4: ['Friendship is a skill.', 'Saying hi. Sharing.', 'Saying sorry.'], tags: ['hi', 'share', 'sorry'], t5: ['Your child leads.', 'You stay close.'],
    title: ['The friendship series'], sub: ['for parents · starts 30 November'], brand: 'The Mindful NL' },
  nl: { t1: ['Je kunt geen vrienden', 'maken voor je kind.'], t2: ['Maar je kunt wel', 'het pad verlichten.'], t3: ['Niet door te duwen.', 'Wel door ruimte', 'te geven om te groeien.'],
    t4: ['Vriendschap kun je leren.', 'Hoi zeggen. Delen.', 'Sorry zeggen.'], tags: ['hoi', 'delen', 'sorry'], t5: ['Je kind gaat voorop.', 'Jij blijft dichtbij.'],
    title: ['De vriendschapsserie'], sub: ['voor ouders · vanaf 30 november'], brand: 'The Mindful NL' },
};

// ---------- scenes ----------
const playGroup = (t, k) => [740, 850, 960].map((x, i) => fig(x, 1232 - i * 6, .55, { k, armL: 130 + Math.sin(t * 5 + i) * 25, armR: 140 + Math.cos(t * 5 + i) * 25, smile: 1, look: i === 0 ? 4 : -4 }).svg).join('') +
  (k > .5 ? `<circle cx="${850 + Math.sin(t * 2.4) * 90}" cy="${1020 - Math.abs(Math.sin(t * 4.8)) * 70}" r="11" fill="${TERRA}" stroke="${INK}" stroke-width="3"/>` : '');
const sky = (t, k) => cloud(250 + t * 5, 760, 1, k) + cloud(850 + t * 4, 660, .75, P(k, .2, 1)) +
  [[560, 860, 1], [610, 830, .7], [650, 870, .8]].map(([x, y, s]) => bird(x + t * 14, y - t * 2, s * 1.3, k)).join('');

const SCENES = [
  { start: 0, end: 4.8, draw: (t, L) => ({
    svg: sky(t, P(t, .2, 1.4)) + hills(t, P(t, 0, 1.3)) + playGroup(t, P(t, .6, 1.6)) +
      fig(330, 1420, 1.25, { k: P(t, .3, 1.5), look: 6, smile: -.25, tilt: 3 }).svg,
    html: text(L.t1, 250, 108, t, .4) }) },
  { start: 4.8, end: 10.2, draw: (t, L) => {
    const kp = P(t, 5.0, 6.3), parent = fig(150, 1440, 1.6, { k: kp, armR: lerp(12, 158, eio(P(t, 5.8, 6.8))), look: 6, smile: .8, hair: true });
    const [hx, hy] = parent.hands[1], glow = P(t, 6.6, 7.4) * (.85 + Math.sin(t * 3) * .1);
    const lantern = kp < 1 ? '' : ln(`M${hx} ${hy} l0 30`, P(t, 6.6, 6.9), 3.5) +
      blot(hx, hy + 60, 120 * glow + 1, 110 * glow + 1, OCHRE, .55 * glow) +
      ln(`M${hx - 18} ${hy + 30} h36 l-4 50 h-28 Z M${hx - 10} ${hy + 30} q10 -12 20 0`, P(t, 6.6, 7.2), 3.5);
    const dots = Array.from({ length: 9 }, (_, i) => {
      const u = (i + 1) / 10, x = lerp(400, 740, u), y = 1400 - Math.sin(u * Math.PI) * 40 - u * 150, k = P(t, 7.0 + i * .22, 7.3 + i * .22);
      return k <= 0 ? '' : blot(x, y, 22 * k, 14 * k, OCHRE, .55 * k) + ln(`M${x - 9} ${y} L${x + 9} ${y - 2}`, k, 4);
    }).join('');
    return { svg: sky(t, 1) + hills(t, 1) + playGroup(t, 1) + dots + fig(330, 1420, 1.25, { look: 6, smile: lerp(-.25, .7, P(t, 8.5, 9.2)) }).svg + parent.svg + lantern,
      html: text(L.t2, 250, 108, t, 5.3) }; } },
  { start: 10.2, end: 16.2, draw: (t, L) => {
    const ks = eo(P(t, 11.0, 13.6)), stemTop = lerp(1380, 1060, ks);
    const leaf = (side, y, at) => { const k = P(t, at, at + .8); return k <= 0 ? '' :
      wash(`M540 ${y} q${side * 50} -40 ${side * 92} -6 q${-side * 46} 32 ${-side * 92} 6`, SAGE, .8 * k) + ln(`M540 ${y} q${side * 50} -40 ${side * 92} -6 q${-side * 46} 32 ${-side * 92} 6`, k, 3.6); };
    const child = fig(330, 1410, 1.2, { k: P(t, 10.4, 11.4), armR: 62, look: 6, smile: .7 });
    const [cx, cy] = child.hands[1];
    const can = ln(`M${cx - 6} ${cy - 8} h44 l-6 40 h-32 Z M${cx + 38} ${cy} l34 -18`, P(t, 10.8, 11.6), 3.6) + wash(`M${cx - 6} ${cy - 8} h44 l-6 40 h-32 Z`, BLUE, .5 * P(t, 10.8, 11.6));
    const drops = t < 11.2 ? '' : [0, 1, 2].map(i => { const ph = ((t * 1.4 + i / 3) % 1); return `<path d="M${cx + 74 + ph * 30} ${cy - 16 + ph * 120} q3 8 0 12 q-3 -4 0 -12" fill="${BLUE}" stroke="${INK}" stroke-width="2" opacity="${1 - ph}"/>`; }).join('');
    const sun = blot(860, 700, 90, 90, OCHRE, .5 * P(t, 10.4, 11.4)) + ln('M860 640 a60 60 0 1 1 -0.1 0', P(t, 10.4, 11.6), 3.6);
    return { svg: sun + blot(540, 1400, 360, 46, SOIL, .45) + blot(540, 1560, 300, 40, SAGE, .3) + ln('M120 1386 Q540 1330 960 1386', P(t, 10.2, 11.2), 4.5) +
      ln(`M540 1380 Q546 ${(1380 + stemTop) / 2} 540 ${stemTop}`, ks > 0 ? 1 : 0, 4.2) +
      leaf(-1, 1300, 11.8) + leaf(1, 1230, 12.4) + leaf(-1, 1160, 13.0) + leaf(1, 1100, 13.5) +
      child.svg + can + drops + fig(810, 1420, 1.55, { k: P(t, 10.6, 11.6), look: -6, smile: .9, hair: true, armL: 18, armR: 8 }).svg,
      html: text(L.t3, 230, 104, t, 10.7) }; } },
  { start: 16.2, end: 22.2, draw: (t, L) => {
    const a = fig(230, 1330, 1.15, { k: P(t, 16.3, 17.2), armR: 70, look: 6, smile: .8 }), b = fig(850, 1330, 1.15, { k: P(t, 16.5, 17.4), armL: 70, look: -6, smile: .8, bun: true });
    const [ax, ay] = a.hands[1], [bx, by] = b.hands[0];
    const rib = `M${ax} ${ay} C${ax + 40} ${ay - 260} 720 720 640 900 C610 1080 380 980 500 820 C600 700 ${bx - 30} ${by - 240} ${bx} ${by}`;
    const kr = P(t, 17.2, 19.2);
    const tags = L.tags.map((w, i) => { const k = eo(P(t, 18.4 + i * .7, 19.1 + i * .7)); return k <= 0 ? '' :
      `<g opacity="${k}" transform="translate(${[330, 540, 750][i]} ${[740, 690, 740][i] - k * 30 + Math.sin(t * 2 + i) * 6})">${blot(0, -6, 70, 34, [OCHRE, SAGE, BLUE][i], .6)}<text text-anchor="middle" y="12" font-family="Caveat" font-weight="700" font-size="64" fill="${INK}">${w}</text></g>`; }).join('');
    return { svg: wash('M-40 1330 Q260 1170 620 1330 L560 1420 L-40 1440 Z', SAGE, .5) + wash('M600 1290 Q830 1170 1130 1330 L1130 1440 L600 1420 Z', SAGE, .5) +
      ln('M-40 1330 Q260 1170 620 1330', P(t, 16.2, 17), 4.5) + ln('M460 1330 Q830 1170 1130 1330', P(t, 16.3, 17.1), 4.5) +
      ln(rib, kr, 30, INK) + ln(rib, kr, 22, TERRA) + ln(rib, kr, 2, '#E9B39C', 'transform="translate(0 -5)"') +
      a.svg + b.svg + tags, html: text(L.t4, 230, 100, t, 16.7) }; } },
  { start: 22.2, end: 26.8, draw: (t, L) => {
    const u = eio(P(t, 22.8, 26.4)), walk = Math.sin(t * 7) * 18 * (u > 0 && u < 1 ? 1 : 0);
    const road = 'M80 1760 C380 1640 260 1520 520 1440 S820 1320 760 1250', road2 = 'M300 1780 C560 1650 430 1540 640 1450 S880 1330 800 1250';
    return { svg: sky(t, 1) + wash('M-40 1250 C300 1210 700 1220 1130 1200 L1130 1520 C700 1580 300 1500 -40 1560 Z', SAGE, .45) + blot(700, 1700, 300, 60, SAGE, .3) + ln('M-40 1250 C300 1210 700 1220 1130 1200', P(t, 22.2, 23), 4) +
      wash(`${road} L800 1250 C880 1330 560 1650 300 1780 Z`, OCHRE, .3 * P(t, 22.4, 23.4)) + ln(road, P(t, 22.3, 23.4), 4) + ln(road2, P(t, 22.4, 23.5), 4) +
      fig(790, 1250, .62, { k: P(t, 22.6, 23.4), armR: 140 + Math.sin(t * 8) * 20, look: -4, smile: 1, bun: true }).svg +
      fig(lerp(380, 690, u), lerp(1600, 1330, u), lerp(1.2, .72, u), { legL: walk, legR: -walk, armL: 14 - walk * .6, armR: 14 + walk * .6, look: 5, smile: .8 }).svg +
      fig(160, 1760, 1.55, { k: P(t, 22.4, 23.2), armR: lerp(12, 45, P(t, 24, 24.8)), look: 7, smile: 1, hair: true }).svg,
      html: text(L.t5, 250, 108, t, 22.6) }; } },
  { start: 26.8, end: 30, last: true, draw: (t, L) => {
    const heart = 'M540 1000 C370 880 350 680 465 680 C515 680 540 720 540 750 C540 720 565 680 615 680 C730 680 710 880 540 1000';
    const kh = P(t, 27.2, 28.6);
    return { svg: blot(540, 820, 230, 200, TERRA, .16 * kh) + ln(heart, kh, 30) + ln(heart, kh, 22, TERRA) +
      wash('M200 1320 Q540 1250 880 1320 L880 1380 L200 1380 Z', SAGE, .5) + ln('M160 1322 Q540 1262 920 1322', P(t, 26.9, 27.6), 4) +
      fig(470, 1310, 1.05, { armR: 42, look: 4, smile: 1, closed: t > 28.8 }).svg + fig(610, 1310, 1.05, { armL: 42, look: -4, smile: 1, bun: true, closed: t > 28.8 }).svg,
      html: text(L.title, 300, 128, t, 27.0) + text(L.sub, 1440, 58, t, 28.0, 'small') + text([L.brand], 1520, 72, t, 28.5) }; } },
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
