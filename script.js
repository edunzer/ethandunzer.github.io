// Ethan Dunzer: personal site
// No dependencies. Smooth scrolling is handled in CSS (scroll-behavior).

(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  // ==========================================================================
  // Mobile menu
  // ==========================================================================

  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav__toggle');
  var linkList = document.getElementById('nav-links');

  function setMenu(open) {
    nav.setAttribute('data-open', String(open));
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Close' : 'Menu';
  }

  if (nav && toggle && linkList) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    linkList.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
  }

  // ==========================================================================
  // Highlight the nav link for the section in view
  // ==========================================================================

  var navLinks = linkList ? Array.prototype.slice.call(linkList.querySelectorAll('a[href^="#"]')) : [];
  var linkFor = {};
  var sections = [];

  navLinks.forEach(function (a) {
    var section = document.getElementById(a.hash.slice(1));
    if (section) { linkFor[section.id] = a; sections.push(section); }
  });

  function setActive(id) {
    navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
    if (id && linkFor[id]) linkFor[id].setAttribute('aria-current', 'true');
  }

  if ('IntersectionObserver' in window && sections.length) {
    var band = { rootMargin: '-45% 0px -50% 0px' };
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) setActive(entry.target.id); });
    }, band);
    sections.forEach(function (s) { spy.observe(s); });

    var top = document.getElementById('top');
    if (top) {
      new IntersectionObserver(function (entries) {
        if (entries[0].isIntersecting) setActive(null);
      }, band).observe(top);
    }
  }

  // ==========================================================================
  // Hero truss: a load follows the pointer and the truss deflects under it.
  // Deflection uses the simply supported beam formula for a point load, and
  // members are tinted by how hard they're working (moment for chords,
  // shear for the diagonals).
  // ==========================================================================

  var hero = document.querySelector('.hero');

  function Truss(svg) {
    var g = JSON.parse(svg.getAttribute('data-truss'));
    this.svg = svg;
    this.g = g;
    this.L = g.n * g.p;
    this.width = svg.viewBox.baseVal.width;
    this.base = {};
    for (var i = 0; i <= g.n; i++) this.base['b' + i] = { x: g.pad + i * g.p, y: g.bot };
    for (var j = 0; j < g.n; j++) this.base['t' + j] = { x: g.pad + (j + 0.5) * g.p, y: g.top };

    this.members = Array.prototype.map.call(svg.querySelectorAll('[data-a]'), function (el) {
      return { el: el, a: el.getAttribute('data-a'), b: el.getAttribute('data-b'), web: el.getAttribute('data-kind') === 'web' };
    });
    this.nodes = Array.prototype.map.call(svg.querySelectorAll('[data-n]'), function (el) {
      return { el: el, n: el.getAttribute('data-n') };
    });
    this.load = svg.querySelector('.truss__load');

    this.amp = 0; this.vel = 0; this.ampTarget = 0;
    this.pos = this.L / 2; this.posTarget = this.L / 2;
    this.running = false;
  }

  // normalised deflection at x for a unit load at a (1.0 = midspan load at midspan)
  Truss.prototype.deflect = function (x, a) {
    var L = this.L, L4 = L * L * L * L;
    x = clamp(x, 0, L);
    if (x <= a) { var b = L - a; return 8 * b * x * (L * L - b * b - x * x) / L4; }
    var xr = L - x;
    return 8 * a * xr * (L * L - a * a - xr * xr) / L4;
  };

  Truss.prototype.visible = function () {
    return this.svg.getBoundingClientRect().width > 0;
  };

  Truss.prototype.aim = function (clientX, clientY, pressure) {
    var r = this.svg.getBoundingClientRect();
    if (!r.width) return;
    var x = (clientX - r.left) * (this.width / r.width) - this.g.pad;
    this.posTarget = clamp(x, this.L * 0.04, this.L * 0.96);
    // the closer the pointer gets to the bridge, the heavier the load
    var above = Math.max(0, r.top - clientY);
    var near = 1 - clamp(above / (window.innerHeight * 0.75), 0, 1);
    this.ampTarget = this.g.amax * (pressure != null ? pressure : 0.35 + 0.65 * near);
    this.start();
  };

  Truss.prototype.release = function () {
    this.ampTarget = 0;
    this.start();
  };

  Truss.prototype.start = function () {
    if (this.running) return;
    this.running = true;
    var self = this;
    requestAnimationFrame(function tick() {
      // damped spring on the load size gives a little wobble on release
      self.vel = (self.vel + (self.ampTarget - self.amp) * 0.09) * 0.8;
      self.amp += self.vel;
      self.pos += (self.posTarget - self.pos) * 0.16;
      self.render();
      var settled = Math.abs(self.vel) < 0.002 && Math.abs(self.ampTarget - self.amp) < 0.005 &&
                    Math.abs(self.posTarget - self.pos) < 0.05;
      if (settled) { self.running = false; return; }
      requestAnimationFrame(tick);
    });
  };

  Truss.prototype.render = function () {
    var self = this, L = this.L, a = this.pos, pad = this.g.pad;
    var load = clamp(this.amp / this.g.amax, -0.3, 1.3);
    var y = {};

    Object.keys(this.base).forEach(function (k) {
      var n = self.base[k];
      y[k] = n.y + self.amp * self.deflect(n.x - pad, a);
    });

    this.nodes.forEach(function (n) { n.el.setAttribute('cy', y[n.n].toFixed(2)); });

    this.members.forEach(function (m) {
      var A = self.base[m.a], B = self.base[m.b];
      m.el.setAttribute('d', 'M' + A.x + ' ' + y[m.a].toFixed(2) + 'L' + B.x + ' ' + y[m.b].toFixed(2));
      var mid = (A.x + B.x) / 2 - pad, s;
      if (m.web) {
        s = mid < a ? (L - a) / L : a / L;               // shear, 0..1
      } else {
        s = (mid <= a ? (L - a) * mid : a * (L - mid)) / L / (L / 4);  // moment, 0..1
      }
      s = clamp(s * Math.abs(load), 0, 1);
      if (s < 0.02) {
        m.el.style.stroke = '';
        m.el.style.strokeWidth = '';
      } else {
        var t = Math.pow(s, 1.3);
        var c = [139 + (112 - 139) * t, 141 + (181 - 141) * t, 144 + (249 - 144) * t].map(Math.round);
        m.el.style.stroke = 'rgb(' + c.join(',') + ')';
        m.el.style.strokeWidth = (1.5 + t * 1.1).toFixed(2);
      }
    });

    if (this.load) {
      var tipY = this.g.top + this.amp * this.deflect(a, a);
      this.load.setAttribute('transform', 'translate(' + (a + pad).toFixed(1) + ' ' + tipY.toFixed(2) + ')');
      this.load.style.opacity = clamp(load * 1.6, 0, 1).toFixed(2);
    }
  };

  if (hero && !reduceMotion.matches) {
    var trusses = Array.prototype.map.call(hero.querySelectorAll('[data-truss]'), function (svg) { return new Truss(svg); });
    var ready = false;
    var touching = false;

    // let the draw-in animation finish before the bridge can be loaded
    setTimeout(function () { ready = true; }, 1900);

    function each(fn) { trusses.forEach(function (t) { if (t.visible()) fn(t); }); }

    hero.addEventListener('pointermove', function (e) {
      if (!ready) return;
      if (e.pointerType === 'mouse') each(function (t) { t.aim(e.clientX, e.clientY); });
      else if (touching) each(function (t) { t.aim(e.clientX, e.clientY, 1); });
    });
    hero.addEventListener('pointerdown', function (e) {
      if (!ready || e.pointerType === 'mouse') return;
      touching = true;
      each(function (t) { t.aim(e.clientX, e.clientY, 1); });
    });
    ['pointerup', 'pointercancel'].forEach(function (type) {
      hero.addEventListener(type, function (e) {
        if (e.pointerType === 'mouse') return;
        touching = false;
        each(function (t) { t.release(); });
      });
    });
    hero.addEventListener('pointerleave', function () {
      touching = false;
      each(function (t) { t.release(); });
    });
  }

  // ==========================================================================
  // Stack diagram: hovering an integration sends a packet from Salesforce,
  // along the bus, to that system.
  // ==========================================================================

  var stack = document.querySelector('.stack');

  if (stack && !reduceMotion.matches && 'animate' in Element.prototype) {
    var packet = document.createElement('span');
    packet.className = 'packet';
    packet.setAttribute('aria-hidden', 'true');
    stack.appendChild(packet);
    var flight = null;

    function send(li) {
      var link = stack.querySelector('.layer__link');
      if (!link || getComputedStyle(link).display === 'none') return;   // stacked layout on phones

      var s = stack.getBoundingClientRect();
      var l = link.getBoundingClientRect();
      var bus = li.parentElement.getBoundingClientRect();
      var box = li.getBoundingClientRect();

      var pts = [
        [l.left - s.left, l.top - s.top],
        [bus.left - s.left, l.top - s.top],
        [bus.left - s.left, box.top + box.height / 2 - s.top],
        [box.left - s.left, box.top + box.height / 2 - s.top]
      ];
      var lens = [], total = 0;
      for (var i = 1; i < pts.length; i++) {
        var d = Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]);
        lens.push(d); total += d;
      }

      var travel = 0.72;   // share of each loop spent moving; the rest is a pause
      var frames = [], run = 0;
      pts.forEach(function (p, idx) {
        if (idx > 0) run += lens[idx - 1];
        frames.push({
          transform: 'translate(' + p[0] + 'px,' + p[1] + 'px)',
          opacity: idx === pts.length - 1 ? 0.9 : 1,
          offset: (run / total) * travel
        });
      });
      frames[0].opacity = 0;
      frames.splice(1, 0, { transform: frames[0].transform, opacity: 1, offset: 0.04 * travel });
      frames.push({ transform: frames[frames.length - 1].transform, opacity: 0, offset: 1 });

      if (flight) flight.cancel();
      flight = packet.animate(frames, { duration: 520 + total * 2.2, iterations: Infinity, easing: 'linear' });
    }

    function stop() { if (flight) { flight.cancel(); flight = null; } }

    Array.prototype.forEach.call(stack.querySelectorAll('.integrations li'), function (li) {
      li.addEventListener('mouseenter', function () { send(li); });
      li.addEventListener('mouseleave', stop);
      li.addEventListener('focusin', function () { send(li); });
      li.addEventListener('focusout', stop);
    });
  }

  // ==========================================================================
  // Experience timeline: the spine fills as you scroll and each node fills
  // in once you've passed it.
  // ==========================================================================

  var timeline = document.querySelector('.timeline');

  if (timeline) {
    var roles = Array.prototype.slice.call(timeline.querySelectorAll('.role'));
    var dots = [], t0 = 0, span = 0, queued = false;

    function measure() {
      var rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
      var off = 0.75 * rem;
      dots = roles.map(function (r) { return r.offsetTop + off; });
      t0 = dots[0];
      span = Math.max(1, dots[dots.length - 1] - t0);
      timeline.style.setProperty('--t0', t0 + 'px');
      timeline.style.setProperty('--h', span + 'px');
      update();
    }

    function update() {
      queued = false;
      var reading = window.innerHeight * 0.6 - timeline.getBoundingClientRect().top;
      timeline.style.setProperty('--p', clamp((reading - t0) / span, 0, 1).toFixed(4));
      roles.forEach(function (r, i) { r.classList.toggle('is-passed', reading >= dots[i] - 1); });
    }

    function queue() {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }

    measure();
    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', measure);
    if ('ResizeObserver' in window) new ResizeObserver(measure).observe(timeline);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  }

  // ==========================================================================
  // Dashed leader lines draw in when their list scrolls into view
  // ==========================================================================

  Array.prototype.forEach.call(document.querySelectorAll('.leaders'), function (list) {
    Array.prototype.forEach.call(list.querySelectorAll('.leaders__row'), function (row, i) {
      row.style.setProperty('--i', i);
    });
  });

  if ('IntersectionObserver' in window) {
    var drawer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-drawn');
          drawer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });
    Array.prototype.forEach.call(document.querySelectorAll('.leaders'), function (l) { drawer.observe(l); });
  } else {
    Array.prototype.forEach.call(document.querySelectorAll('.leaders'), function (l) { l.classList.add('is-drawn'); });
  }

  // Leaders reached by a link (e.g. from the stack diagram) should already be drawn
  if (location.hash) {
    var target = document.getElementById(location.hash.slice(1));
    var list = target && target.closest('.leaders');
    if (list) list.classList.add('is-drawn');
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#int-"]');
    if (!a) return;
    var row = document.getElementById(a.hash.slice(1));
    if (row) row.closest('.leaders').classList.add('is-drawn');
  });

  // ==========================================================================
  // Footer year
  // ==========================================================================

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
