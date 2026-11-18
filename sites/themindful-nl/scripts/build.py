#!/usr/bin/env python3
"""Turn the downloaded themindful.nl pages into static pages for the Co1 site `home`."""
import json, os, re, glob, urllib.parse, shutil
from bs4 import BeautifulSoup, Comment, NavigableString

ROOT = os.path.dirname(os.path.abspath(__file__))
RAW = os.path.join(ROOT, 'raw')
OUT = os.path.join(ROOT, 'out')
IMGMAP = json.load(open(os.path.join(ROOT, 'imgmap.json')))
TURNSTILE_KEY = os.environ.get('TURNSTILE_KEY', '1x00000000000000000000AA')

# ---------------------------------------------------------------- forms
FORMS = {
    "contact": {"fields": {
        "name": {"type": "text", "required": True},
        "email": {"type": "email", "required": True},
        "inquiry_type": {"type": "text", "required": True},
        "subject": {"type": "text", "required": True},
        "message": {"type": "long_text", "required": True, "max": 5000}}},
    "trial-class": {"fields": {
        "parent_name": {"type": "text", "required": True},
        "email": {"type": "email", "required": True},
        "phone": {"type": "phone", "required": True},
        "child_name": {"type": "text", "required": True},
        "child_age": {"type": "text", "required": True},
        "location": {"type": "text", "required": True},
        "referral": {"type": "text"},
        "notes": {"type": "long_text"}}},
    "free-guide": {"fields": {
        "name": {"type": "text", "required": True},
        "email": {"type": "email", "required": True}}},
    "play-guide": {"fields": {
        "name": {"type": "text", "required": True},
        "email": {"type": "email", "required": True}}},
    "recommend-school": {"fields": {
        "school_name": {"type": "text", "required": True},
        "school_type": {"type": "text"},
        "city": {"type": "text"},
        "school_email": {"type": "email"},
        "may_share_name": {"type": "text"},
        "parent_name": {"type": "text", "required": True},
        "email": {"type": "email", "required": True}}},
    "school-presentation": {"fields": {
        "name": {"type": "text", "required": True},
        "school_name": {"type": "text"},
        "email": {"type": "email", "required": True}}},
    "ois-petition": {"fields": {
        "parent_name": {"type": "text", "required": True},
        "child_age": {"type": "text"},
        "email": {"type": "email", "required": True},
        "whatsapp": {"type": "phone"},
        "timing": {"type": "text", "required": True},
        "would_enrol": {"type": "text", "required": True}}},
    "mindful-monday": {"fields": {
        "class_name": {"type": "text"},
        "parent_name": {"type": "text", "required": True},
        "email": {"type": "email", "required": True},
        "phone": {"type": "phone", "required": True},
        "child_name": {"type": "text", "required": True},
        "child_age": {"type": "text", "required": True},
        "notes": {"type": "long_text"}}},
    "class-register": {"fields": {
        "class_name": {"type": "text", "required": True},
        "parent_name": {"type": "text", "required": True},
        "email": {"type": "email", "required": True},
        "phone": {"type": "phone"},
        "child_name": {"type": "text"},
        "child_age": {"type": "text"},
        "notes": {"type": "long_text"}}},
    "online-register": {"fields": {
        "parent_name": {"type": "text", "required": True},
        "email": {"type": "email", "required": True},
        "phone": {"type": "phone"},
        "child_name": {"type": "text", "required": True},
        "child_age": {"type": "text", "required": True},
        "class_name": {"type": "text", "required": True},
        "notes": {"type": "long_text"}}},
}
for f in FORMS.values():
    f["thanks"] = "/thanks"

# old field name -> new field name, per form
RENAME = {
    "contact": {"inquiryType": "inquiry_type"},
    "trial-class": {"parentName": "parent_name", "childName": "child_name", "childAge": "child_age"},
    "recommend-school": {"schoolName": "school_name", "schoolType": "school_type", "schoolEmail": "school_email",
                         "mayShareName": "may_share_name", "parentName": "parent_name"},
    "school-presentation": {"schoolName": "school_name"},
    "ois-petition": {"parentName": "parent_name", "childAge": "child_age", "wouldEnrol": "would_enrol"},
    "mindful-monday": {"parentName": "parent_name", "childName": "child_name", "childAgeMonths": "child_age"},
}
PAGE_FORM = {  # page key (no /nl) -> form name
    "contact": "contact", "lessen/proefles": "trial-class", "gratis-gids": "free-guide",
    "mindful-play-guide": "play-guide", "vraag-jouw-school": "recommend-school",
    "voor-scholen": "school-presentation", "ois-yoga": "ois-petition", "mindful-monday": "mindful-monday",
}

# ---------------------------------------------------------------- helpers
def page_path(rawname):
    """raw/nl__lessen__proefles.html -> ('/nl/lessen/proefles', 'nl/lessen/proefles/index.html')"""
    n = rawname[:-5]
    if n == 'index':
        return '/', 'index.html'
    url = '/' + n.replace('__', '/')
    return url, url.lstrip('/') + '/index.html'

def payload_of(html):
    out = []
    for c in re.findall(r'self\.__next_f\.push\((\[.*?\])\)</script>', html, flags=re.S):
        try:
            a = json.loads(c)
            if len(a) > 1 and isinstance(a[1], str):
                out.append(a[1])
        except Exception:
            pass
    return ''.join(out)

STR = r'"((?:[^"\\]|\\.)*)"'

def find_answer(payload, q, lang):
    jq = json.dumps(q, ensure_ascii=False)[1:-1]
    i = payload.find('"' + jq + '"')
    if i < 0:
        return None
    after = payload[i + len(jq) + 2:]
    m = re.match(r',"(\w+)":' + STR, after)
    if m and re.search(r'(^a\d+|\dA|^answer\w*)$', m.group(1)):
        return json.loads('"' + m.group(2) + '"')
    m = re.match(r',"(?:answer|a)(?:' + ('En' if lang == 'en' else 'Nl') + r')?":' + STR, after)
    if m:
        return json.loads('"' + m.group(1) + '"')
    window = payload[max(0, i - 4000):i]
    key = '"answerEn":' if lang == 'en' else '"answerNl":'
    j = window.rfind(key)
    if j >= 0:
        m = re.match(STR, window[j + len(key):])
        if m:
            return json.loads('"' + m.group(1) + '"')
    m = re.match(r',"answer":' + STR, after)
    if m:
        return json.loads('"' + m.group(1) + '"')
    return None

def ld_faq(soup):
    qa = {}
    for sc in soup.find_all('script', type='application/ld+json'):
        try:
            d = json.loads(sc.string)
        except Exception:
            continue
        items = d if isinstance(d, list) else d.get('@graph', [d])
        for x in items:
            if isinstance(x, dict) and x.get('@type') == 'FAQPage':
                for q in x.get('mainEntity', []):
                    qa[q['name'].strip()] = q['acceptedAnswer']['text']
    return qa

def img_url(u):
    u = u.replace('&amp;', '&')
    m = re.match(r'/_next/image\?url=([^&]+)', u)
    if m:
        u = urllib.parse.unquote(m.group(1))
    if u.startswith('https://www.themindful.nl/'):
        u = u[len('https://www.themindful.nl'):]
    return IMGMAP.get(u, u)

def resolve_suspense(soup, html):
    for b, s in re.findall(r'\$RC\("([^"]+)","([^"]+)"\)', html):
        t = soup.find(id=b)
        src = soup.find(id=s)
        if not t or not src:
            continue
        n = t.next_sibling
        while n is not None:
            nx = n.next_sibling
            if isinstance(n, Comment) and n.strip() == '/$':
                break
            n.extract()
            n = nx
        for ch in list(src.contents):
            t.insert_before(ch.extract())
        t.decompose()
        src.decompose()
    for d in soup.find_all('div', attrs={'hidden': True}):
        if d.get('id', '').startswith('S:'):
            d.decompose()

# ---------------------------------------------------------------- main per-page
def convert(rawfile):
    name = os.path.basename(rawfile)
    url, outpath = page_path(name)
    html = open(rawfile, encoding='utf-8').read()
    lang = 'nl' if url == '/nl' or url.startswith('/nl/') else 'en'
    key = url[3:] if lang == 'nl' else url
    key = key.strip('/')
    payload = payload_of(html)
    soup = BeautifulSoup(html, 'lxml')
    resolve_suspense(soup, html)
    faq = ld_faq(soup)

    for sc in soup.find_all('script'):
        if sc.get('type') != 'application/ld+json':
            sc.decompose()
    for l in soup.find_all('link'):
        rel = ' '.join(l.get('rel', []))
        if rel == 'stylesheet' or (rel == 'preload'):
            l.decompose()
    for m in soup.find_all('meta', attrs={'name': 'next-size-adjust'}):
        m.decompose()
    for ns in soup.find_all('noscript'):
        if 'facebook.com/tr' in str(ns):
            ns.decompose()
    for c in soup.find_all(string=lambda x: isinstance(x, Comment)):
        c.extract()
    head = soup.head
    head.append(soup.new_tag('link', rel='stylesheet', href='/assets/site.css'))
    head.append(soup.new_tag('script', src='/assets/site.js', defer=True))

    for im in soup.find_all('img'):
        if im.get('src'):
            im['src'] = img_url(im['src'])
        for a in ('srcset', 'sizes', 'data-nimg'):
            if a in im.attrs:
                del im[a]
        if not im.get('loading') and im.get('fetchpriority') != 'high':
            im['loading'] = 'lazy'
    for tag in soup.find_all(style=True):
        if '_next/image' in tag['style']:
            tag['style'] = re.sub(r'/_next/image\?url=[^)"\']+', lambda m: img_url(m.group(0)), tag['style'])
    for tag in soup.find_all(['a', 'link']):
        h = tag.get('href', '')
        if h in IMGMAP:
            tag['href'] = IMGMAP[h]
    for m in soup.find_all('meta', content=True):
        c = m['content']
        for k, v in IMGMAP.items():
            c = c.replace(k, v)
        m['content'] = c

    # FAQ accordions (answers from JSON-LD, else from the page data)
    n_acc = 0
    for b in soup.find_all('button'):
        if b.get('type') or b.has_attr('aria-expanded') or b.get('aria-label') == 'Menu':
            continue
        q = b.get_text(' ', strip=True)
        span = b.find('span')
        if span:
            q = span.get_text(' ', strip=True)
        ans = faq.get(q) or find_answer(payload, q, lang)
        if not ans:
            continue
        n_acc += 1
        aid = f'faq-{n_acc}'
        b['type'] = 'button'
        b['aria-expanded'] = 'false'
        b['aria-controls'] = aid
        b['data-acc'] = ''
        d = soup.new_tag('div', id=aid, hidden=True)
        d['class'] = 'tm-acc-body'
        for para in [p for p in ans.split('\n') if p.strip()]:
            p = soup.new_tag('p')
            p.string = para.strip()
            d.append(p)
        b.insert_after(d)

    fname = PAGE_FORM.get(key)
    forms = soup.find_all('form')
    if fname and forms:
        fm = [f for f in forms if f.find(['input', 'textarea'], attrs={'type': lambda t: t != 'hidden'})][0]
        rewrite_form(soup, fm, fname)
    if key == 'online':
        add_online_form(soup, lang)
    if key == 'lessen':
        mark_lessen(soup, lang)

    soup.html['lang'] = lang
    out = str(soup)
    out = out.replace('https://www.themindful.nl/_next/image', '/_next/image')
    os.makedirs(os.path.dirname(os.path.join(OUT, outpath)), exist_ok=True)
    open(os.path.join(OUT, outpath), 'w', encoding='utf-8').write(out)
    return url, outpath, n_acc

def turnstile(soup):
    d = soup.new_tag('div')
    d['class'] = 'cf-turnstile tm-turnstile'
    d['data-sitekey'] = TURNSTILE_KEY
    return d

def rewrite_form(soup, fm, fname):
    ren = RENAME.get(fname, {})
    fm['method'] = 'post'
    fm['action'] = f'/api/v1/forms/{fname}'
    for x in fm.find_all('input', type='hidden'):
        x.decompose()
    for x in fm.find_all(['input', 'select', 'textarea']):
        n = x.get('name')
        if n == 'website':  # old hidden trap field, replaced by the person check
            wrap = x
            for _ in range(3):
                if wrap.parent and wrap.parent.name == 'div' and len(wrap.parent.find_all(['input', 'select', 'textarea'])) == 1:
                    wrap = wrap.parent
            wrap.decompose()
            continue
        if n:
            x['name'] = ren.get(n, n)
    for s in fm.find_all('select'):
        for o in s.find_all('option'):
            if o.get('value'):
                o['value'] = o.get_text(strip=True)
    btn = fm.find('button', type='submit') or fm.find('button')
    ts = turnstile(soup)
    if btn:
        btn.insert_before(ts)
    else:
        fm.append(ts)
    if fname == 'mindful-monday' and not fm.find('input', attrs={'name': 'class_name'}):
        h = soup.new_tag('input', type='hidden')
        h['name'] = 'class_name'
        h['id'] = 'mm-class-name'
        fm.insert(0, h)
    ensure_turnstile_script(soup)

def ensure_turnstile_script(soup):
    if not soup.find('script', src=re.compile('challenges.cloudflare.com')):
        s = soup.new_tag('script', src='https://challenges.cloudflare.com/turnstile/v0/api.js', defer=True)
        s['async'] = ''
        soup.head.append(s)

T = {
    'en': dict(name='Your name', email='Email address', phone='Phone number', child='Child’s name', age='Child’s age',
               cls='Which class?', notes='Notes (optional)', send='Register', choose='Choose…',
               reg_title='Register for this class', secure='\U0001F512 Your data is stored securely and never shared with third parties.',
               online_title='Register for Online Classes'),
    'nl': dict(name='Je naam', email='E-mailadres', phone='Telefoonnummer', child='Naam van je kind', age='Leeftijd van je kind',
               cls='Welke les?', notes='Opmerkingen (optioneel)', send='Aanmelden', choose='Kies…',
               reg_title='Aanmelden voor deze les', secure='\U0001F512 Je gegevens worden veilig bewaard en nooit gedeeld met derden.',
               online_title='Aanmelden voor online lessen'),
}

def field(soup, label, name, typ='text', required=False, options=None, textarea=False):
    w = soup.new_tag('label')
    w['class'] = 'tm-field'
    sp = soup.new_tag('span')
    sp.string = label + (' *' if required else '')
    w.append(sp)
    if options:
        el = soup.new_tag('select')
        o = soup.new_tag('option', value='')
        o.string = '…'
        el.append(o)
        for op in options:
            o = soup.new_tag('option', value=op)
            o.string = op
            el.append(o)
    elif textarea:
        el = soup.new_tag('textarea', rows='3')
    else:
        el = soup.new_tag('input', type=typ)
    el['name'] = name
    if required:
        el['required'] = ''
    w.append(el)
    return w

def build_form(soup, fname, lang, class_options=None, class_value=None, title=None):
    t = T[lang]
    fm = soup.new_tag('form', method='post', action=f'/api/v1/forms/{fname}')
    fm['class'] = 'tm-form'
    if title:
        h = soup.new_tag('h3')
        h['class'] = 'tm-form-title'
        h.string = title
        fm.append(h)
    if class_value is not None:
        h = soup.new_tag('input', type='hidden', value=class_value)
        h['name'] = 'class_name'
        fm.append(h)
    fm.append(field(soup, t['name'], 'parent_name', required=True))
    fm.append(field(soup, t['email'], 'email', 'email', required=True))
    fm.append(field(soup, t['phone'], 'phone', 'tel'))
    fm.append(field(soup, t['child'], 'child_name', required=(fname == 'online-register')))
    fm.append(field(soup, t['age'], 'child_age', required=(fname == 'online-register')))
    if class_options:
        fm.append(field(soup, t['cls'], 'class_name', required=True, options=class_options))
    fm.append(field(soup, t['notes'], 'notes', textarea=True))
    fm.append(turnstile(soup))
    p = soup.new_tag('p')
    p['class'] = 'tm-secure'
    p.string = t['secure']
    fm.append(p)
    b = soup.new_tag('button', type='submit')
    b['class'] = 'tm-submit'
    b.string = t['send']
    fm.append(b)
    ensure_turnstile_script(soup)
    return fm

def add_online_form(soup, lang):
    """The old Tally embed (tally.so/r/ODJM28) becomes a Co1 form."""
    ifr = soup.find('iframe', src=re.compile('tally.so'))
    if not ifr:
        return
    opts_en = ['Mom & Baby Yoga (1.5–3 years) · Wednesday 10:00–10:45', 'Mom & Baby Yoga (3–4 years) · Wednesday 11:00–11:45',
               'Parent & Child Yoga (5–12 years) · Thursday 16:30–17:15', 'Children Yoga & Mindfulness (5–12 years) · Wednesday 16:30–17:15']
    opts_nl = ['Mama & Baby Yoga (1,5–3 jaar) · woensdag 10:00–10:45', 'Mama & Baby Yoga (3–4 jaar) · woensdag 11:00–11:45',
               'Ouder & Kind Yoga (5–12 jaar) · donderdag 16:30–17:15', 'Kinderyoga & Mindfulness (5–12 jaar) · woensdag 16:30–17:15']
    fm = build_form(soup, 'online-register', lang, class_options=opts_en if lang == 'en' else opts_nl,
                    title=T[lang]['online_title'])
    ifr.replace_with(fm)
    p = fm.parent
    if p is not None:
        p['class'] = [c for c in p.get('class', []) if not c.startswith('h-[')] + ['bg-white', 'p-6']
        if p.get('style') and 'height' in p['style']:
            del p['style']

def mark_lessen(soup, lang):
    """Each "Register ..." button on the schedule opens a Co1 form for that class."""
    for b in soup.find_all('button', attrs={'aria-controls': True}):
        cid = b['aria-controls']
        card = b
        title = None
        for _ in range(8):
            card = card.parent
            if card is None:
                break
            h = card.find(['h3'])
            if h:
                title = h.get_text(' ', strip=True)
                break
        title = title or cid
        fm = build_form(soup, 'class-register', lang, class_value=title, title=T[lang]['reg_title'])
        wrap = soup.new_tag('div', id=cid, hidden=True)
        wrap['class'] = 'tm-reg'
        wrap.append(fm)
        b.insert_after(wrap)
        b['data-reg'] = ''

def co1_app():
    return {"v": 1, "id": "home", "kind": "static", "addresses": "plain",
            "permissions": ["forms.submit"], "forms": FORMS}

def finish():
    # thank-you pages, built on the contact page's frame
    for lang, src, dst, title, h1, body in [
        ('en', 'contact/index.html', 'thanks/index.html', 'Thank you | The Mindful Kids', 'Thank you!',
         'We have received your message and will get back to you soon. Keep an eye on your inbox (and your spam folder, just in case).'),
        ('nl', 'nl/contact/index.html', 'nl/thanks/index.html', 'Bedankt | The Mindful Kids', 'Bedankt!',
         'We hebben je bericht ontvangen en nemen snel contact met je op. Houd je inbox in de gaten (en voor de zekerheid ook je spammap).')]:
        s = BeautifulSoup(open(os.path.join(OUT, src), encoding='utf-8').read(), 'lxml')
        s.title.string = title
        for m in s.find_all('meta', attrs={'name': 'description'}):
            m['content'] = h1
        for l in s.find_all('link', rel='canonical') + s.find_all('link', rel='alternate'):
            l.decompose()
        for sc in s.find_all('script', type='application/ld+json'):
            sc.decompose()
        for sc in s.find_all('script', src=re.compile('turnstile')):
            sc.decompose()
        s.head.append(s.new_tag('meta', attrs={'name': 'robots', 'content': 'noindex'}))
        main = s.find('main')
        main.clear()
        sec = BeautifulSoup(f'''<section class="py-20 md:py-28 bg-cream"><div class="max-w-2xl mx-auto px-4 text-center">
<div class="text-5xl mb-4">🌈</div><h1 class="font-heading font-bold text-3xl md:text-4xl text-sage-dark mb-4">{h1}</h1>
<p class="font-body text-gray-600 text-lg leading-relaxed mb-8">{body}</p>
<a class="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-sage text-white font-heading font-semibold" href="{'/nl' if lang=='nl' else '/'}">{'Terug naar de homepage' if lang=='nl' else 'Back to the home page'}</a>
</div></section>''', 'html.parser')
        main.append(sec)
        os.makedirs(os.path.dirname(os.path.join(OUT, dst)), exist_ok=True)
        open(os.path.join(OUT, dst), 'w', encoding='utf-8').write(str(s))
    css = ''
    for c in ['453409bdc191cf98.css', 'a7cce86061cbbe68.css']:
        css += open(os.path.join(ROOT, c), encoding='utf-8').read() + '\n'
    css = re.sub(r'url\(/_next/static/media/([^)]+)\)', r'url(/assets/fonts/\1)', css)
    css += open(os.path.join(ROOT, 'extra.css'), encoding='utf-8').read()
    os.makedirs(os.path.join(OUT, 'assets'), exist_ok=True)
    open(os.path.join(OUT, 'assets', 'site.css'), 'w', encoding='utf-8').write(css)
    shutil.copy(os.path.join(ROOT, 'site.js'), os.path.join(OUT, 'assets', 'site.js'))
    A = os.path.join(ROOT, 'assets')
    for item in os.listdir(A):
        s = os.path.join(A, item)
        d = os.path.join(OUT, 'assets', 'fonts') if item == 'fonts' else os.path.join(OUT, item)
        if os.path.isdir(s):
            shutil.copytree(s, d, dirs_exist_ok=True)
        else:
            shutil.copy(s, d)

if __name__ == '__main__':
    if os.path.exists(OUT):
        shutil.rmtree(OUT)
    os.makedirs(OUT)
    for f in sorted(glob.glob(os.path.join(RAW, '*.html'))):
        print(convert(f))
    json.dump(co1_app(), open(os.path.join(OUT, 'co1-app.json'), 'w'), indent=1, ensure_ascii=False)
    finish()
