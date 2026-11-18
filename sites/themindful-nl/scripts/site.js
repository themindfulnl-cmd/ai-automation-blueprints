/* The Mindful Kids — small behaviours for the static rebuild (menus, FAQ, language, forms, cookies). */
(function () {
  var NL = document.documentElement.lang === 'nl';
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* Desktop dropdowns */
  $$('header button[aria-haspopup]').forEach(function (btn) {
    var wrap = btn.parentElement, panel = btn.nextElementSibling;
    if (!panel) return;
    var open = function () { panel.classList.add('tm-dd-open'); btn.setAttribute('aria-expanded', 'true'); };
    var close = function () { panel.classList.remove('tm-dd-open'); btn.setAttribute('aria-expanded', 'false'); };
    wrap.addEventListener('mouseenter', open);
    wrap.addEventListener('mouseleave', close);
    btn.addEventListener('click', function (e) { e.preventDefault(); panel.classList.contains('tm-dd-open') ? close() : open(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  });

  /* Language switch: go to the same page in the other language */
  function altHref(lang) {
    var l = $('link[rel="alternate"][hreflang="' + lang + '"]');
    if (l) { try { return new URL(l.getAttribute('href')).pathname; } catch (e) { return l.getAttribute('href'); } }
    var p = location.pathname;
    return lang === 'nl' ? (p.indexOf('/nl') === 0 ? p : '/nl' + (p === '/' ? '' : p)) : (p.replace(/^\/nl(?=\/|$)/, '') || '/');
  }
  $$('header button').forEach(function (b) {
    var t = b.textContent.trim();
    if (t === 'NL' || t === 'EN') b.addEventListener('click', function () { location.href = altHref(t.toLowerCase()); });
  });

  /* Mobile menu, built from the desktop menu */
  var menuBtn = $('header button[aria-label="Menu"]');
  if (menuBtn) {
    var panel = document.createElement('nav');
    panel.className = 'tm-mobile-menu tm-hidden';
    var desk = $('header nav > div.hidden') || $('header nav');
    $$('a, button[aria-haspopup]', desk).forEach(function (el) {
      if (el.tagName === 'BUTTON') {
        var h = document.createElement('h4'); h.textContent = el.textContent.trim(); panel.appendChild(h); return;
      }
      var a = document.createElement('a'); a.href = el.getAttribute('href'); a.textContent = el.textContent.trim();
      var bg = getComputedStyle(el).backgroundColor; if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') a.className = 'tm-cta';
      panel.appendChild(a);
    });
    document.body.appendChild(panel);
    menuBtn.addEventListener('click', function () {
      var open = panel.classList.toggle('tm-hidden') === false;
      menuBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
  }

  /* FAQ accordions */
  $$('[data-acc]').forEach(function (b) {
    b.addEventListener('click', function () {
      var body = document.getElementById(b.getAttribute('aria-controls'));
      var open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (body) body.hidden = !open;
    });
  });

  /* Class registration panels (schedule page) */
  $$('[data-reg]').forEach(function (b) {
    b.addEventListener('click', function () {
      var body = document.getElementById(b.getAttribute('aria-controls'));
      var open = b.getAttribute('aria-expanded') !== 'true';
      b.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (body) { body.hidden = !open; if (open) { var i = body.querySelector('input:not([type=hidden])'); if (i) i.focus(); } }
    });
  });

  /* Schedule page: filter by place */
  var sections = $$('section.scroll-mt-24');
  function filterPlace(place) {
    sections.forEach(function (s) {
      var show = !place || s.textContent.toLowerCase().indexOf(place.toLowerCase()) > -1;
      s.classList.toggle('tm-hidden', !show);
    });
  }
  var pills = $$('button[aria-pressed]');
  pills.forEach(function (b, i) {
    b.addEventListener('click', function () {
      pills.forEach(function (o) {
        var on = o === b;
        o.setAttribute('aria-pressed', on ? 'true' : 'false');
        o.classList.toggle('bg-sage', on); o.classList.toggle('text-white', on); o.classList.toggle('shadow-sm', on);
        o.classList.toggle('bg-gray-50', !on); o.classList.toggle('text-gray-600', !on);
      });
      filterPlace(i === 0 ? '' : b.textContent.trim());
    });
  });
  var finder = $('#class-finder-location');
  if (finder && finder.form) {
    var go = finder.form.querySelector('button[type="submit"]');
    finder.addEventListener('change', function () { if (go) go.disabled = !finder.value; });
    finder.form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = finder.options[finder.selectedIndex] ? finder.options[finder.selectedIndex].text : '';
      filterPlace(finder.value ? v : '');
      var first = sections.filter(function (s) { return !s.classList.contains('tm-hidden'); })[0];
      if (first) first.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* Mindful Monday: picking a class fills the form */
  var mm = document.getElementById('mm-class-name');
  if (mm) {
    var form = mm.form;
    var classBtns = $$('button[type="button"]').filter(function (b) { return form && !form.contains(b) && /—/.test(b.textContent); });
    classBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        mm.value = b.textContent.replace(/^[^A-Za-z]+/, '').trim();
        classBtns.forEach(function (o) { o.classList.toggle('ring-2', o === b); o.classList.toggle('ring-sage', o === b); });
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    if (classBtns[0] && !mm.value) mm.value = classBtns[0].textContent.replace(/^[^A-Za-z]+/, '').trim();
  }

  /* Cookie consent (same banner, wording and storage key as the old site); trackers load only after "Accept All" */
  var KEY = 'cookie-consent';
  function loadTrackers() {
    if (window.__tmTrackers) return; window.__tmTrackers = true;
    var g = document.createElement('script'); g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=G-M54QKYLW25';
    document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', 'G-M54QKYLW25');
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    window.fbq('init', '1710569233416440'); window.fbq('track', 'PageView');
  }
  var choice = null;
  try { choice = localStorage.getItem(KEY); } catch (e) {}
  if (choice === 'accepted') loadTrackers();
  else if (!choice) setTimeout(function () {
    var c = document.createElement('div');
    c.className = 'fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 animate-slideUp';
    c.setAttribute('role', 'dialog');
    c.innerHTML = '<div class="max-w-2xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-6">' +
      '<div class="flex items-start gap-3 mb-4"><span class="text-2xl flex-shrink-0">🍪</span><div>' +
      '<h3 class="font-heading font-bold text-sage-dark text-lg mb-1">Cookies &amp; Privacy</h3>' +
      '<p class="font-body text-sm text-gray-600 leading-relaxed">We use essential cookies for the website to function and analytics cookies (Google Analytics) to understand how you use our site. We never use advertising cookies. ' +
      '<a href="/privacy" class="text-sage underline hover:text-coral transition-colors">Privacy Policy</a></p></div></div>' +
      '<div class="flex flex-wrap gap-3 justify-end">' +
      '<button type="button" data-c="essential" class="px-5 py-2.5 rounded-full border border-gray-200 font-body text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">Essential Only</button>' +
      '<button type="button" data-c="accepted" class="px-5 py-2.5 rounded-full bg-sage text-white font-body text-sm font-semibold hover:bg-sage-dark transition-colors">Accept All</button>' +
      '</div></div>';
    document.body.appendChild(c);
    $$('button[data-c]', c).forEach(function (b) {
      b.onclick = function () {
        var v = b.getAttribute('data-c');
        try { localStorage.setItem(KEY, v); } catch (e) {}
        c.parentNode.removeChild(c);
        if (v === 'accepted') loadTrackers();
      };
    });
  }, 1000);
})();
