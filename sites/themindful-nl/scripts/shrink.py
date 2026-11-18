#!/usr/bin/env python3
"""Shrink the built site for upload: replace each long utility-class list with one short class,
and teach the stylesheet those short classes. Pictures point to their web-sized .webp copies."""
import os, re, glob, json, shutil, string

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'out')
DST = os.path.join(ROOT, 'up')
KEEP = {'group', 'peer', 'scroll-mt-24', 'hidden', 'cf-turnstile'}  # used by selectors or scripts

def css_unescape(s):
    return re.sub(r'\\(.)', r'\1', s)

def short(n):
    chars = string.ascii_lowercase
    out = ''
    n += 26
    while True:
        out = chars[n % 26] + out
        n = n // 26 - 1
        if n < 0:
            break
    return '_' + out

def split_selectors(s):
    parts, depth, cur = [], 0, ''
    for ch in s:
        if ch in '([':
            depth += 1
        elif ch in ')]':
            depth -= 1
        if ch == ',' and depth == 0:
            parts.append(cur)
            cur = ''
        else:
            cur += ch
    parts.append(cur)
    return [p.strip() for p in parts]

def main():
    if os.path.exists(DST):
        shutil.rmtree(DST)
    shutil.copytree(SRC, DST)
    pages = glob.glob(os.path.join(DST, '**', '*.html'), recursive=True)
    combos, texts = {}, {}
    for p in pages:
        h = open(p, encoding='utf-8').read()
        texts[p] = h
        for m in re.findall(r' class="([^"]*)"', h):
            toks = m.split()
            if any(t.startswith('tm-') for t in toks) or len(m) < 12 or 'min-h-11 px-4 py-2 rounded-full' in m:
                continue
            combos.setdefault(m, None)
    token_aliases = {}
    for i, combo in enumerate(sorted(combos)):
        a = short(i)
        combos[combo] = a
        for t in combo.split():
            if t not in KEEP:
                token_aliases.setdefault(t, []).append(a)

    def repl(m):
        c = m.group(1)
        a = combos.get(c)
        if not a:
            return m.group(0)
        keep = [t for t in c.split() if t in KEEP]
        return ' class="%s"' % ' '.join([a] + keep)

    def webp(m):
        path = m.group(1)
        if path.startswith('/icons/') or path.startswith('/downloads/'):
            return m.group(0)
        return path  # library web copies keep the original type

    for p, h in texts.items():
        h = re.sub(r' class="([^"]*)"', repl, h)
        h = re.sub(r'(/images/[A-Za-z0-9_\-./]+\.(?:jpe?g|png|webp))', lambda m: webp(m), h)
        h = re.sub(r'>\s+<', '><', h)
        open(p, 'w', encoding='utf-8').write(h)

    css = open(os.path.join(DST, 'assets', 'site.css'), encoding='utf-8').read()
    css = re.sub(r'/\*.*?\*/', '', css, flags=re.S)
    out, buf = [], ''
    for ch in css:
        if ch == '{':
            prelude = buf.strip()
            if prelude and not prelude.startswith('@') and '.' in prelude:
                sels = split_selectors(prelude)
                extra = []
                for s in sels:
                    for m in re.finditer(r'\.((?:\\.|[A-Za-z0-9_\-])+)', s):
                        tok = css_unescape(m.group(1))
                        for a in token_aliases.get(tok, []):
                            extra.append(s[:m.start()] + '.' + a + s[m.end():])
                if extra:
                    prelude = ','.join(sels + extra)
            out.append(prelude + '{')
            buf = ''
        elif ch == '}' or ch == ';':
            out.append(buf + ch)
            buf = ''
        else:
            buf += ch
    out.append(buf)
    open(os.path.join(DST, 'assets', 'site.css'), 'w', encoding='utf-8').write(''.join(out))

if __name__ == '__main__':
    main()
