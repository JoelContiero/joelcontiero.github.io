// Laufkopf: markiert das Kapitel, in dem man gerade liest. Menü auf dem Handy schliesst nach Klick.
(function () {
  var links = Array.prototype.slice.call(document.querySelectorAll('.runhead__nav a[href^="#"]'));
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  if (sections.length) {
    var current = null;
    var ticking = false;
    var update = function () {
      ticking = false;
      var line = window.innerHeight * 0.35;
      var active = null;
      sections.forEach(function (s) { if (s.getBoundingClientRect().top <= line) active = s.id; });
      if (active === current) return;
      current = active;
      links.forEach(function (a) {
        if (a.getAttribute('href') === '#' + active) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; window.requestAnimationFrame(update); }
    }, { passive: true });
    update();
  }

  var menu = document.querySelector('.menu');
  if (menu) {
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) menu.removeAttribute('open');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.hasAttribute('open')) {
        menu.removeAttribute('open');
        menu.querySelector('summary').focus();
      }
    });
  }
})();

// Bewegung: der Bericht wird beim Lesen gesetzt. Grundzustand bleibt sichtbar;
// nur Elemente unterhalb des ersten Bildschirms bekommen einen Startzustand.
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var root = document.documentElement;
  var bar = document.querySelector('.runhead .progress');

  var onScroll = [];
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { ticking = false; onScroll.forEach(function (f) { f(); }); });
  }, { passive: true });

  // Lesefortschritt im Laufkopf
  if (bar) {
    var prog = function () {
      var max = root.scrollHeight - window.innerHeight;
      bar.style.setProperty('--p', max > 0 ? Math.min(1, window.scrollY / max).toFixed(4) : 0);
    };
    onScroll.push(prog); prog();
  }

  if (reduce || !('IntersectionObserver' in window)) return;
  root.classList.add('motion');

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.remove('is-pending');
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0 });

  var fold = window.innerHeight * 0.9;
  Array.prototype.forEach.call(document.querySelectorAll('[data-anim="bars"], [data-anim="units"], [data-anim="sort"]'), function (el) {
    if (el.getBoundingClientRect().top > fold) {
      el.classList.add('is-pending');
      io.observe(el);
    }
  });

  // K2: im Kontaktkapitel steigt das Blau beim Hineinscrollen auf
  var fill = document.querySelector('[data-fill]');
  if (fill) {
    var fillTick = function () {
      var r = fill.getBoundingClientRect(), vh = window.innerHeight;
      var k = Math.max(0, Math.min(1, (vh - r.top) / (vh * 0.55)));
      fill.style.setProperty('--k', k.toFixed(3));
      fill.style.setProperty('--k2', Math.max(0, Math.min(1, (k - 0.55) / 0.45)).toFixed(3));
    };
    onScroll.push(fillTick); fillTick();
  }

  // K3: Magnet-Knopf folgt leicht der Maus
  var magnet = document.querySelector('.magnet');
  if (magnet && window.matchMedia('(pointer: fine)').matches) {
    var area = magnet.closest('section');
    area.addEventListener('mousemove', function (e) {
      var r = magnet.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      var k = Math.max(0, 1 - Math.hypot(dx, dy) / 420);
      magnet.style.transform = 'translate(' + (dx * 0.22 * k).toFixed(1) + 'px,' + (dy * 0.22 * k).toFixed(1) + 'px)';
      magnet.firstChild.style.transform = 'translate(' + (dx * 0.08 * k).toFixed(1) + 'px,' + (dy * 0.08 * k).toFixed(1) + 'px)';
    });
    area.addEventListener('mouseleave', function () { magnet.style.transform = ''; magnet.firstChild.style.transform = ''; });
  }

  // Drucken und PDF: alles sofort sichtbar
  window.addEventListener('beforeprint', function () {
    Array.prototype.forEach.call(document.querySelectorAll('.is-pending'), function (el) { el.classList.remove('is-pending'); });
  });

})();

// Regler-Panel nur lokal mit ?tweak (Ordner tweak/ wird nicht hochgeladen)
if (/[?&]tweak\b/.test(location.search)) {
  var t = document.createElement('script'); t.src = '/tweak/tweak.js'; document.head.appendChild(t);
}

// K3: Klick auf die Adresse kopiert sie, ein Stempel bestätigt (funktioniert auch ohne Bewegung)
(function () {
  var cp = document.querySelector('.copy');
  if (!cp) return;
  var status = cp.parentNode.querySelector('[role="status"]');
  cp.addEventListener('click', function () {
    var done = function () {
      var s = cp.querySelector('.stamp');
      s.classList.remove('go'); void s.offsetWidth; s.classList.add('go');
      if (status) status.textContent = 'E-Mail-Adresse kopiert';
    };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(cp.getAttribute('data-copy')).then(done, function () { location.href = 'mailto:' + cp.getAttribute('data-copy'); });
    else location.href = 'mailto:' + cp.getAttribute('data-copy');
  });
})();
