// Scene scripts for the three sample reels (posts 1, 11 and 23), NL + EN.
(() => {
const { C, prog, easeOut, easeInOut, lerp, pop, kid, mixPose, bubble, chip, headline, place } = FS;

const bob = (t, ph = 0, amp = 6) => Math.sin(t * 2.2 + ph) * amp;
const wave = (t, ph = 0) => 150 + Math.sin(t * 9 + ph) * 18;
const label = (text, x, y, t, at) => { const P = pop(t, at); return P.o <= 0 ? '' : `<div class="label" style="left:${x}px;top:${y}px;opacity:${P.o};transform:translate(-50%,-50%) scale(${P.s})">${text}</div>`; };
const credit = (text, y) => `<div class="credit" style="top:${y}px">${text}</div>`;
const sub = (text, y, t, at) => { const k = easeOut(prog(t, at, at + 0.5)); return k <= 0 ? '' : `<div class="sub" style="top:${y}px;opacity:${k}">${text}</div>`; };

const SHY = { headDrop: 14, headTilt: 9, lookX: 7, lookY: 8, smile: -0.15, armL: -38, armR: -38, hunch: 1 };
const FRIENDLY = { headDrop: 0, headTilt: 0, lookX: 0, lookY: 0, smile: 0.9, armL: 34, armR: 34, hunch: 0 };
const SAD = { headDrop: 10, headTilt: -6, lookY: 7, smile: -0.8, armL: 4, armR: 4, hunch: 0.6 };

window.REELS = {
  // ---------------- POST 1: series launch ----------------
  '01': {
    duration: 26,
    text: {
      en: { s1: 'Can you *teach* a child how to be a good friend?', s2: 'Yes. Friendship is made of *small skills*.',
        chips: ['Saying hi', 'Sharing', 'Taking turns', 'Saying sorry', 'Noticing feelings'],
        s3: 'For 7 weeks we explore *Alles over vrienden* together', by: 'Felicity Brooks · Mar Ferrero · Usborne',
        s4: 'Every post:', c1: 'skill, explained', c2: 'thing to try at home',
        s5: 'Start tonight with *one question*:', q: 'Who made you smile today?', follow: 'Follow the series · The Mindful NL', cr: 'Inspired by Alles over vrienden (Usborne)' },
      nl: { s1: 'Kun je een kind *leren* hoe je een goede vriend bent?', s2: 'Ja. Vriendschap bestaat uit *kleine vaardigheden*.',
        chips: ['Hoi zeggen', 'Delen', 'Om de beurt', 'Sorry zeggen', 'Gevoelens zien'],
        s3: '7 weken lang ontdekken we samen *Alles over vrienden*', by: 'Felicity Brooks · Mar Ferrero · Usborne',
        s4: 'Elke post:', c1: 'vaardigheid, uitgelegd', c2: 'tip om thuis te doen',
        s5: 'Begin vanavond met *één vraag*:', q: 'Wie liet jou vandaag lachen?', follow: 'Volg de serie · The Mindful NL', cr: 'Geïnspireerd op Alles over vrienden (Usborne)' },
    },
    scenes: [
      { start: 0, end: 3.6, draw: (t, L) =>
        headline(L.s1, { y: 330, t, at: 0, size: 96 }) +
        place(kid('noor', { armR: t > 0.8 ? wave(t) : 12 }, { scale: 1.6 }), 330, 1180 + bob(t)) +
        place(kid('finn', { armL: t > 1.4 ? wave(t, 1) : 12, lookX: -4 }, { scale: 1.6 }), 750, 1180 + bob(t, 1.5)) },
      { start: 3.6, end: 9.2, draw: (t, L) =>
        headline(L.s2, { y: 300, t, at: 3.7, size: 84 }) +
        L.chips.map((c, i) => chip(c, { x: i % 2 ? 690 : 390, y: 720 + i * 170, color: [C.sun, C.sage, C.sky, C.peach, C.blush][i], t, at: 4.4 + i * 0.75, size: 54 })).join('') },
      { start: 9.2, end: 15.2, draw: (t, L) => {
        const k = easeOut(prog(t, 9.4, 10.4));
        return headline(L.s3, { y: 280, t, at: 9.3, size: 78 }) +
          `<div style="opacity:${k}">` + place(`<img src="../../assets/book-cover.jpg" style="width:540px;border-radius:18px;box-shadow:0 22px 0 rgba(47,74,58,.10)">`, 540, 1080 + (1 - k) * 160, `rotate(${lerp(-10, -3, k) + Math.sin(t) * 1.2}deg) scale(${lerp(0.85, 1, k)})`) + `</div>` +
          sub(L.by, 1460, t, 10.6); } },
      { start: 15.2, end: 20.2, draw: (t, L) => {
        const c = (n, txt, x, col, at) => { const P = pop(t, at, 0.5); return P.o <= 0 ? '' : `<div class="card" style="left:${x}px;top:1000px;width:400px;height:420px;opacity:${P.o};transform:translate(-50%,-50%) scale(${P.s}) rotate(${x < 540 ? -3 : 3}deg)"><div style="margin:50px auto 10px;width:150px;height:150px;border-radius:50%;background:${col};font:600 100px/150px Fredoka;text-align:center">${n}</div><div style="font:600 50px/1.15 Fredoka;text-align:center;padding:10px 34px">${txt}</div></div>`; };
        return headline(L.s4, { y: 380, t, at: 15.3, size: 96 }) + c('1', L.c1, 320, C.sun, 15.9) + c('1', L.c2, 760, C.sage, 16.7) +
          place(kid('mila', { armR: wave(t), smile: 1 }, { scale: 0.9 }), 540, 1500 + bob(t)); } },
      { start: 20.2, end: 26, last: true, draw: (t, L) => {
        const hi = easeInOut(prog(t, 21.6, 22.3));
        return headline(L.s5, { y: 300, t, at: 20.3, size: 80 }) +
          bubble(L.q, { x: 540, y: 650, w: 760, t, at: 20.9, size: 68, color: C.paper }) +
          place(kid('noor', { armR: lerp(12, 155, hi), smile: 1, eyesClosed: t > 22.3 ? 1 : 0 }, { scale: 1.45 }), 420, 1130 + bob(t)) +
          place(kid('finn', { armL: lerp(12, 155, hi), smile: 1, eyesClosed: t > 22.3 ? 1 : 0 }, { scale: 1.45 }), 660, 1130 + bob(t, 1)) +
          sub(L.follow, 1470, t, 22.6) + (t > 22.6 ? credit(L.cr, 1545) : ''); } },
    ],
  },

  // ---------------- POST 11: shy body vs friendly body ----------------
  '11': {
    duration: 26,
    text: {
      en: { s1: 'Your child wants to join in… but *freezes*?', s2: 'This is a *shy body*', shy: ['Head down', 'Looks away', 'Arms closed', 'Says nothing'],
        s3: 'This is a *friendly body*', fr: ['Head up', 'Looks at you', 'Smiles', 'Says hi + name'], hi: 'Hi! I’m Noor.',
        s4: 'Practise at home: *the mirror game*', steps: ['1  Look', '2  Smile', '3  Hi + your name'],
        s5: 'Praise the *try*, not the result:', praise: 'You said hi. That was brave!', follow: 'Friendship series · The Mindful NL', cr: 'Inspired by Alles over vrienden (Usborne)' },
      nl: { s1: 'Wil je kind meedoen… maar *blijft het staan*?', s2: 'Dit is een *verlegen lijf*', shy: ['Hoofd omlaag', 'Kijkt weg', 'Armen dicht', 'Zegt niets'],
        s3: 'Dit is een *vriendelijk lijf*', fr: ['Hoofd omhoog', 'Kijkt je aan', 'Glimlacht', 'Zegt hoi + naam'], hi: 'Hoi! Ik ben Noor.',
        s4: 'Oefen thuis: *het spiegelspel*', steps: ['1  Kijk', '2  Lach', '3  Hoi + je naam'],
        s5: 'Prijs de *poging*, niet het resultaat:', praise: 'Je zei hoi. Dat was dapper!', follow: 'Vriendschapsserie · The Mindful NL', cr: 'Geïnspireerd op Alles over vrienden (Usborne)' },
    },
    scenes: [
      { start: 0, end: 3.6, draw: (t, L) =>
        headline(L.s1, { y: 330, t, at: 0, size: 92 }) +
        `<div style="opacity:.45">${place(kid('finn', { armR: wave(t), smile: 1 }, { scale: 0.95 }), 190, 1250 + bob(t, 2))}${place(kid('mila', { armL: wave(t, 2), smile: 1 }, { scale: 0.95 }), 890, 1250 + bob(t))}</div>` +
        place(kid('noor', SHY, { scale: 1.9 }), 540, 1160) },
      { start: 3.6, end: 9.6, draw: (t, L) =>
        headline(L.s2, { y: 330, t, at: 3.7, size: 84, w: 980 }) + place(kid('noor', SHY, { scale: 1.9 }), 540, 1160) +
        L.shy.map((s, i) => label(s, [250, 840, 240, 850][i], [800, 920, 1230, 1350][i], t, 4.4 + i * 0.85)).join('') },
      { start: 9.6, end: 16, draw: (t, L) => {
        const m = easeInOut(prog(t, 9.9, 11.0));
        const pose = mixPose(SHY, FRIENDLY, m);
        if (t > 12.9) pose.armR = wave(t);
        if (t > 13.4 && t < 14.6) pose.mouthOpen = Math.abs(Math.sin((t - 13.4) * 8)) * 0.8;
        return headline(L.s3, { y: 330, t, at: 9.7, size: 84, w: 980 }) + place(kid('noor', pose, { scale: 1.9 }), 540, 1160 + (m > 0.99 ? bob(t) : 0)) +
          L.fr.map((s, i) => label(s, [250, 840, 240, 850][i], [800, 920, 1230, 1350][i], t, 11.2 + i * 0.6)).join('') +
          bubble(L.hi, { x: 770, y: 650, w: 480, t, at: 13.3, size: 54, color: C.paper }); } },
      { start: 16, end: 21.6, draw: (t, L) => {
        const ph = t < 17.2 ? 0 : t < 18.6 ? 1 : t < 20 ? 2 : 3;
        const pose = { ...FRIENDLY, smile: ph >= 2 ? 1 : 0.2, armL: 12, armR: ph >= 3 ? wave(t) : 12, lookX: ph >= 1 ? 0 : 6, headDrop: ph >= 1 ? 0 : 10, mouthOpen: ph >= 3 && t < 21 ? Math.abs(Math.sin(t * 8)) * 0.7 : 0 };
        return headline(L.s4, { y: 330, t, at: 16.1, size: 86 }) +
          L.steps.map((s, i) => chip(s, { x: 300, y: 860 + i * 190, color: [C.sky, C.sun, C.sage][i], t, at: 17.2 + i * 1.4, size: 52 })).join('') +
          place(kid('noor', pose, { scale: 1.5 }), 790, 1140 + bob(t)); } },
      { start: 21.6, end: 26, last: true, draw: (t, L) =>
        headline(L.s5, { y: 300, t, at: 21.7, size: 80 }) +
        bubble(L.praise, { x: 540, y: 690, w: 780, t, at: 22.3, size: 70, color: C.sun }) +
        place(kid('noor', { smile: 1, eyesClosed: 1, armL: 30, armR: 30 }, { scale: 1.45 }), 540, 1150 + bob(t) - Math.max(0, Math.sin((t - 22.6) * 6)) * (t > 22.6 && t < 23.4 ? 30 : 0)) +
        sub(L.follow, 1470, t, 23) + (t > 23 ? credit(L.cr, 1545) : '') },
    ],
  },

  // ---------------- POST 23: 5 check-in questions ----------------
  '23': {
    duration: 25,
    text: {
      en: { s1: 'A friend looks sad. What does *your child* say?', s2: 'Give your child *5 check-in questions*',
        qs: ['What’s wrong?', 'Are you OK?', 'What’s the matter?', 'How do you feel?', 'Do you need help?'],
        s3: 'Make it a game: *question of the day* at dinner', qod: 'Question of the day',
        s4: 'See them do it? *Name it*:', praise: 'You noticed your friend was sad. That was kind.', follow: 'Friendship series · The Mindful NL', cr: 'Inspired by Alles over vrienden (Usborne)' },
      nl: { s1: 'Een vriendje kijkt verdrietig. Wat zegt *jouw kind*?', s2: 'Geef je kind *5 check-in vragen*',
        qs: ['Wat is er?', 'Gaat het?', 'Wat scheelt er?', 'Hoe voel je je?', 'Heb je hulp nodig?'],
        s3: 'Maak er een spel van: *de vraag van de dag* aan tafel', qod: 'Vraag van de dag',
        s4: 'Zie je het gebeuren? *Benoem het*:', praise: 'Je zag dat je vriendje verdrietig was. Dat was lief.', follow: 'Vriendschapsserie · The Mindful NL', cr: 'Geïnspireerd op Alles over vrienden (Usborne)' },
    },
    scenes: [
      { start: 0, end: 3.6, draw: (t, L) =>
        headline(L.s1, { y: 330, t, at: 0, size: 92 }) +
        place(kid('noor', { lookX: 8, smile: 0.1, headTilt: 6 }, { scale: 1.6 }), 340, 1180 + bob(t)) +
        place(kid('finn', SAD, { scale: 1.6 }), 740, 1190) },
      { start: 3.6, end: 13, draw: (t, L) =>
        headline(L.s2, { y: 290, t, at: 3.7, size: 78, w: 980 }) +
        L.qs.map((q, i) => bubble(q, { x: i % 2 ? 660 : 420, y: 680 + i * 185, w: 620, t, at: 4.5 + i * 1.5, size: 56, color: [C.sage, C.sun, C.peach, C.sky, C.lilac][i], tail: i % 2 ? 'br' : 'bl', rot: i % 2 ? 2 : -2 })).join('') },
      { start: 13, end: 19, draw: (t, L) => {
        const idx = Math.floor(Math.max(0, t - 14) / 1.0) % 5;
        const P = pop(t, 13.7, 0.5);
        return headline(L.s3, { y: 290, t, at: 13.1, size: 80 }) +
          (P.o > 0 ? `<div class="card" style="left:540px;top:830px;width:760px;height:330px;opacity:${P.o};transform:translate(-50%,-50%) scale(${P.s})">
            <div style="font:700 38px Nunito;color:#5E7566;text-align:center;margin-top:52px">${L.qod}</div>
            <div style="font:600 82px Fredoka;text-align:center;margin-top:30px">${t > 14 ? L.qs[idx] : '?'}</div></div>` : '') +
          ['noor', 'finn', 'mila'].map((n, i) => place(kid(n, { smile: 0.9, lookX: [6, 0, -6][i], mouthOpen: i === idx % 3 && t > 14 ? Math.abs(Math.sin(t * 8)) * 0.6 : 0 }, { scale: 1.05 }), 260 + i * 280, 1300 + bob(t, i))).join(''); } },
      { start: 19, end: 25, last: true, draw: (t, L) => {
        const m = easeInOut(prog(t, 19.3, 20.3));
        return headline(L.s4, { y: 300, t, at: 19.1, size: 84 }) +
          bubble(L.praise, { x: 540, y: 690, w: 820, t, at: 20.2, size: 62, color: C.sun }) +
          place(kid('noor', { smile: 1, armR: lerp(12, 62, m), lookX: 6 }, { scale: 1.4 }), 430, 1160 + bob(t)) +
          place(kid('finn', mixPose(SAD, { smile: 1, eyesClosed: 1 }, m), { scale: 1.4 }), 650, 1165 + bob(t, 1) * m) +
          sub(L.follow, 1470, t, 21) + (t > 21 ? credit(L.cr, 1545) : ''); } },
    ],
  },
};
})();
