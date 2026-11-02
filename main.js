/* Amir M. Hamza portfolio: scroll behaviour and project viewer.
   Project text and image lists live in js/projects.js. */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('js');
  if (reduce) root.classList.add('rm');

  /* 1. fade in as sections enter the screen */
  var items = [].slice.call(document.querySelectorAll('[data-reveal]'));
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) {
      el.style.setProperty('--d', (el.getAttribute('data-delay') || 0) + 'ms');
      io.observe(el);
    });
  }

  /* 2. projects: the page is pinned and the row moves sideways while you scroll down */
  var hs = reduce ? [] : [].slice.call(document.querySelectorAll('[data-hscroll]')).map(function (sec) {
    var pin = sec.querySelector('[data-pin]');
    var track = sec.querySelector('[data-track]');
    var bar = sec.querySelector('[data-bar]');
    var count = sec.querySelector('[data-count]');
    var n = track.children.length;
    var o = { dist: 0 };
    o.size = function () {
      o.dist = Math.max(0, track.scrollWidth - pin.clientWidth);
      sec.style.height = (o.dist + window.innerHeight) + 'px';
    };
    o.update = function () {
      var r = sec.getBoundingClientRect();
      var span = Math.max(1, sec.offsetHeight - window.innerHeight);
      var p = Math.min(1, Math.max(0, -r.top / span));
      track.style.transform = 'translate3d(' + (-p * o.dist).toFixed(1) + 'px,0,0)';
      if (bar) bar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
      if (count) {
        var k = Math.min(n, Math.round(p * (n - 1)) + 1);
        count.textContent = (k < 10 ? '0' : '') + k + ' / ' + (n < 10 ? '0' : '') + n;
      }
    };
    return o;
  });

  /* 3. hero text fades out as you scroll away; progress line; active menu item */
  var fades = [].slice.call(document.querySelectorAll('[data-fadeout]'));
  var prog = document.querySelector('[data-progress]');
  var links = [].slice.call(document.querySelectorAll('[data-nav]'));
  var secs = links.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  var ticking = false;

  function frame() {
    ticking = false;
    var y = window.scrollY, h = window.innerHeight;
    hs.forEach(function (o) { o.update(); });
    if (!reduce) {
      fades.forEach(function (el) {
        el.style.opacity = (1 - Math.min(1, Math.max(0, y / (h * 0.7)))).toFixed(3);
      });
    }
    if (prog) {
      var max = document.documentElement.scrollHeight - h;
      prog.style.transform = 'scaleX(' + (max > 0 ? y / max : 0).toFixed(3) + ')';
    }
    var cur = 0;
    secs.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < h * 0.5) cur = i; });
    links.forEach(function (a, i) { a.classList.toggle('on', i === cur); });
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }
  function size() { hs.forEach(function (o) { o.size(); }); req(); }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', size);
  window.addEventListener('load', size);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(size);
  size();

  /* 4. project viewer */
  var D = window.PROJECTS || {};
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var modal = el('div', 'pm');
  modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-labelledby', 'pm-title');
  document.body.appendChild(modal);
  var lastFocus = null, S = null;

  function open(key, trigger) {
    var p = D[key]; if (!p) return;
    lastFocus = trigger; S = { p: p, g: 0, c: 0, i: 0 };
    var has = p.groups && p.groups.length;
    modal.innerHTML = '';
    var back = el('div', 'pm-back'), box = el('div', 'pm-box' + (has ? '' : ' noimg'));
    var x = el('button', 'pm-x', '&times;'); x.type = 'button'; x.setAttribute('aria-label', 'Close');
    var info = el('div', 'pm-info',
      '<div class="pm-role">' + esc(p.role) + '</div><h3 id="pm-title">' + esc(p.title) + '</h3><p>' + esc(p.desc) + '</p>' +
      '<ul>' + p.bullets.map(function (b) { return '<li>' + esc(b) + '</li>'; }).join('') + '</ul>' +
      (p.links ? '<div class="pm-links">' + p.links.map(function (l) { return '<a href="' + l[1] + '" target="_blank" rel="noopener"><span>' + esc(l[0]) + '</span><span aria-hidden="true">&nearr;</span></a>'; }).join('') + '</div>' : '') +
      (has ? '' : '<div class="pm-note">' + (p.links ? 'Videos open on YouTube.' : 'Project images will be added here.') + '</div>'));
    box.appendChild(x); box.appendChild(info);
    if (has) {
      var view = el('div', 'pm-view');
      view.innerHTML = '<div class="pm-bar"><div class="pm-row t"></div><div class="pm-row c"></div></div>' +
        '<div class="pm-stage"><button type="button" class="pm-nav pm-prev" aria-label="Previous image">&lsaquo;</button><img alt="" decoding="async"><button type="button" class="pm-nav pm-next" aria-label="Next image">&rsaquo;</button><span class="pm-count" aria-live="polite"></span></div><div class="pm-thumbs"></div>';
      box.appendChild(view);
    }
    modal.appendChild(back); modal.appendChild(box);
    modal.classList.add('on'); document.body.style.overflow = 'hidden';
    x.onclick = close; back.onclick = close;
    if (has) { renderTabs(); renderCats(); show(0); bind(); }
    x.focus();
  }
  function cur() { return S.p.groups[S.g].cats[S.c]; }
  function renderTabs() {
    var row = modal.querySelector('.pm-row.t'); row.innerHTML = '';
    if (S.p.groups.length < 2) { row.style.display = 'none'; return; }
    S.p.groups.forEach(function (g, i) {
      var b = el('button', i === S.g ? 'on' : '', esc(g.name)); b.type = 'button';
      b.onclick = function () { S.g = i; S.c = 0; renderTabs(); renderCats(); show(0); }; row.appendChild(b);
    });
  }
  function renderCats() {
    var row = modal.querySelector('.pm-row.c'); row.innerHTML = '';
    var cats = S.p.groups[S.g].cats;
    if (cats.length < 2) { row.style.display = 'none'; return; } row.style.display = '';
    cats.forEach(function (c, i) {
      var b = el('button', i === S.c ? 'on' : '', esc(c.name) + ' <span style="opacity:.6">' + c.imgs.length + '</span>'); b.type = 'button';
      b.onclick = function () { S.c = i; renderCats(); show(0); }; row.appendChild(b);
    });
  }
  function show(i) {
    var imgs = cur().imgs; S.i = (i + imgs.length) % imgs.length;
    var st = modal.querySelector('.pm-stage'); st.classList.remove('z'); st.scrollTo(0, 0);
    var im = st.querySelector('img'); im.style.opacity = 0; im.onload = function () { im.style.opacity = 1; };
    im.src = imgs[S.i]; im.alt = S.p.title + ', image ' + (S.i + 1) + ' of ' + imgs.length;
    modal.querySelector('.pm-count').textContent = (S.i + 1) + ' / ' + imgs.length;
    var th = modal.querySelector('.pm-thumbs'); th.innerHTML = '';
    imgs.forEach(function (src, k) {
      var b = el('button', k === S.i ? 'on' : '', '<img loading="lazy" alt="" src="' + src + '">'); b.type = 'button'; b.setAttribute('aria-label', 'Image ' + (k + 1));
      b.onclick = function () { show(k); }; th.appendChild(b);
    });
    var on = th.querySelector('.on'); if (on && on.scrollIntoView) on.scrollIntoView({ block: 'nearest', inline: 'center' });
    var multi = imgs.length > 1;
    modal.querySelector('.pm-prev').style.display = modal.querySelector('.pm-next').style.display = multi ? '' : 'none';
    if (multi) { new Image().src = imgs[(S.i + 1) % imgs.length]; }
  }
  function bind() {
    modal.querySelector('.pm-prev').onclick = function () { show(S.i - 1); };
    modal.querySelector('.pm-next').onclick = function () { show(S.i + 1); };
    var st = modal.querySelector('.pm-stage');
    st.querySelector('img').onclick = function () { st.classList.toggle('z'); };
    var sx = null;
    st.addEventListener('touchstart', function (e) { sx = e.touches.length === 1 && !st.classList.contains('z') ? e.touches[0].clientX : null; }, { passive: true });
    st.addEventListener('touchend', function (e) {
      if (sx == null) return;
      var dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 50) show(S.i + (dx < 0 ? 1 : -1));
    }, { passive: true });
  }
  function close() {
    modal.classList.remove('on'); document.body.style.overflow = ''; S = null;
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener('keydown', function (e) {
    if (!modal.classList.contains('on')) return;
    if (e.key === 'Escape') { close(); return; }
    if (S && S.p.groups.length) {
      if (e.key === 'ArrowRight') show(S.i + 1);
      else if (e.key === 'ArrowLeft') show(S.i - 1);
    }
    if (e.key === 'Tab') { /* keep keyboard focus inside the viewer */
      var f = [].slice.call(modal.querySelectorAll('button, a[href]')).filter(function (n) { return n.offsetParent !== null; });
      if (!f.length) return;
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (!modal.contains(document.activeElement)) { e.preventDefault(); first.focus(); }
    }
  });

  [].forEach.call(document.querySelectorAll('[data-open]'), function (c) {
    var key = c.getAttribute('data-open'), p = D[key]; if (!p) return;
    c.setAttribute('tabindex', '0'); c.setAttribute('role', 'button'); c.setAttribute('aria-label', 'Open ' + p.title);
    (c.querySelector('.body') || c).appendChild(el('span', 'open-hint', (p.groups && p.groups.length ? 'View gallery' : 'View details') + ' &rarr;'));
    c.addEventListener('click', function () { open(key, c); });
    c.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(key, c); } });
  });
})();
