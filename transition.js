/*
 * Page transition between the work list and project pages, after dionpieters.dev:
 * a black panel sweeps up from the bottom with a bulging, liquid top edge and covers the page,
 * the next page loads underneath, then the panel carries on up and off the top.
 */
(function () {
  var reduce = false;
  var KEY = 'fa-wipe', NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(NS, 'svg'), path = document.createElementNS(NS, 'path');
  svg.setAttribute('id', 'wipe'); svg.setAttribute('aria-hidden', 'true'); svg.appendChild(path);
  svg.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;z-index:300;pointer-events:none;display:none';
  path.setAttribute('fill', '#111');
  document.documentElement.appendChild(svg);

  function size() { var W = innerWidth, H = innerHeight; svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); return [W, H]; }
  function inOut(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  // covering: the panel's top edge climbs from the bottom; its middle leads, so the edge bows upward
  function cover(done) {
    var s = size(), W = s[0], H = s[1]; svg.style.display = 'block'; svg.style.pointerEvents = 'auto';
    animate(650, function (p) {
      var y = H * (1 - p), b = H * 0.22 * Math.sin(Math.PI * p);
      path.setAttribute('d', 'M0 ' + H + ' L0 ' + y + ' Q' + W / 2 + ' ' + (y - b) + ' ' + W + ' ' + y + ' L' + W + ' ' + H + 'Z');
    }, done);
  }
  // revealing: the panel's bottom edge climbs off the top, bowing the same way
  function reveal(done) {
    var s = size(), W = s[0], H = s[1]; svg.style.display = 'block';
    path.setAttribute('d', 'M0 0H' + W + 'V' + H + 'H0Z');
    animate(750, function (p) {
      var y = H * (1 - p), b = H * 0.22 * Math.sin(Math.PI * p);
      path.setAttribute('d', 'M0 0 L' + W + ' 0 L' + W + ' ' + y + ' Q' + W / 2 + ' ' + (y - b) + ' 0 ' + y + 'Z');
    }, function () { svg.style.display = 'none'; svg.style.pointerEvents = 'none'; if (done) done(); });
  }
  function animate(ms, draw, done) {
    var t0 = null;
    function f(now) { if (t0 === null) t0 = now; var k = Math.min(1, (now - t0) / ms); draw(inOut(k)); if (k < 1) requestAnimationFrame(f); else if (done) done(); }
    requestAnimationFrame(f);
  }


  // ---- Smart animate: the project name you click flies into the project page's title ----
  var SKEY = 'fa-smart', root = document.documentElement, leftover = null;
  function projectOf(slug) { return (window.FA_PROJECTS || []).filter(function (p) { return p.slug === slug; })[0]; }
  function ease(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  // the on-screen boxes of each title line inside the clicked name ('payload' -> 'pay' + 'load')
  function sourceBoxes(el, lines) {
    var tn = el.firstChild; if (!tn || tn.nodeType !== 3) return null;
    var text = tn.data, pos = 0, out = [];
    for (var k = 0; k < lines.length; k++) {
      var at = text.indexOf(lines[k], pos); if (at < 0) return null;
      var r = document.createRange(); r.setStart(tn, at); r.setEnd(tn, at + lines[k].length);
      var b = r.getBoundingClientRect(); out.push({ l: b.left, t: b.top, w: b.width, h: b.height }); pos = at + lines[k].length;
    }
    return out;
  }
  function textBox(node) { var r = document.createRange(); r.selectNodeContents(node); return r.getBoundingClientRect(); }
  function paper() { var s = document.getElementById('sheet') || document.querySelector('.sheet'); return s ? getComputedStyle(s).backgroundColor : '#fff'; }
  // a copy of the name, line by line, held where it was clicked
  function holdClone(text, box, cs) {
    var d = document.createElement('div');
    d.style.cssText = 'position:fixed;left:' + box.l + 'px;top:' + box.t + 'px;z-index:301;pointer-events:none;white-space:pre;margin:0;' +
      'font:' + cs.fontWeight + ' ' + cs.fontSize + '/1 ' + cs.fontFamily + ';letter-spacing:' + cs.letterSpacing + ';color:' + cs.color + ';text-transform:lowercase';
    d.textContent = text; document.body.appendChild(d); return d;
  }
  function leaveSmart(a, url) {
    var p = projectOf(url.hash.slice(1)), src = a.querySelector('.wl-t') || a.querySelector('.p-next > span');
    if (!p || !src) return false;
    var boxes = sourceBoxes(src, p.lines); if (!boxes) return false;
    var cs = getComputedStyle(src), all = src.getBoundingClientRect();
    var data = { slug: p.slug, boxes: boxes, color: cs.color };
    // the page fades to plain paper under the held name
    var veil = document.createElement('div');
    veil.style.cssText = 'position:fixed;inset:0;z-index:300;background:' + paper() + ';opacity:0;transition:opacity .38s ease';
    document.body.appendChild(veil);
    var held = holdClone(src.textContent, { l: all.left, t: all.top }, cs);
    // pin the copy exactly over the name (the clicked row may be shifted on hover)
    var hb = textBox(held.firstChild); held.style.left = (parseFloat(held.style.left) + boxes[0].l - hb.left) + 'px'; held.style.top = (parseFloat(held.style.top) + boxes[0].t - hb.top) + 'px';
    held.style.fontStyle = 'normal';
    data.held = held.style.cssText; data.text = src.textContent;
    src.style.visibility = 'hidden';
    leftover = function () { veil.remove(); held.remove(); src.style.visibility = ''; };
    requestAnimationFrame(function () { veil.style.opacity = '1'; });
    setTimeout(function () {
      if (url.pathname === location.pathname) {
        root.classList.add('smart');
        // wait for the project to render, then fly from a page sitting still at the top
        addEventListener('hashchange', function once() {
          removeEventListener('hashchange', once);
          scrollTo(0, 0); if (window.__glideJump) window.__glideJump();
          requestAnimationFrame(function () { if (window.__glideJump) window.__glideJump(); requestAnimationFrame(function () {
            arriveSmart(data, function () { veil.remove(); held.remove(); leftover = null; }); }); });
        });
        location.hash = url.hash;
      } else {
        try { sessionStorage.setItem(SKEY, JSON.stringify(data)); } catch (er) {}
        location.href = url.href;
      }
    }, 400);
    return true;
  }
  // lines fly from where the name was to the title's lines, then everything else rises in
  function arriveSmart(data, ready) {
    var lines = document.querySelectorAll('.p-title span i');
    if (!lines.length || lines.length !== data.boxes.length) { finish(); return; }
    var flyers = [].map.call(lines, function (li, k) {
      var r = li.getBoundingClientRect(), cs = getComputedStyle(li);
      var f = document.createElement('div');
      f.style.cssText = 'position:fixed;left:' + r.left + 'px;top:' + r.top + 'px;z-index:302;pointer-events:none;white-space:pre;margin:0;transform-origin:0 0;will-change:transform;' +
        'font:' + cs.fontWeight + ' ' + cs.fontSize + '/' + cs.lineHeight + ' ' + cs.fontFamily + ';letter-spacing:' + cs.letterSpacing + ';color:' + cs.color + ';padding-left:' + cs.paddingLeft;
      f.textContent = li.textContent; document.body.appendChild(f);
      var L = r.left, T = r.top, tb = textBox(f.firstChild), sb = data.boxes[k], s = sb.h / tb.height;
      return { el: f, s: s, x: sb.l - L - s * (tb.left - L), y: sb.t - T - s * (tb.top - T) };
    });
    function place(p) {
      flyers.forEach(function (f, k) {
        var q = ease(Math.max(0, Math.min(1, (p - k * 0.06) / 0.94)));
        var s = f.s + (1 - f.s) * q, x = f.x * (1 - q), y = f.y * (1 - q);
        f.el.style.transform = 'translate3d(' + x.toFixed(2) + 'px,' + y.toFixed(2) + 'px,0) scale(' + s.toFixed(4) + ')';
      });
    }
    place(0); if (ready) ready();
    var t0 = null, MS = 1000, went = false;
    function f(now) {
      if (t0 === null) t0 = now; var k = Math.min(1, (now - t0) / MS); place(k);
      if (k > 0.55 && !went) { went = true; root.classList.add('smart-go'); }
      if (k < 1) requestAnimationFrame(f); else { finish(); flyers.forEach(function (x) { x.el.remove(); }); }
    }
    requestAnimationFrame(f);
    function finish() {
      root.classList.add('smart-go');
      var titles = document.querySelector('.p-title'); if (titles) titles.style.visibility = 'visible';
      // the title is already in place: don't let its rise-in play once the hand-off ends
      document.querySelectorAll('.p-title span i').forEach(function (i) { i.style.animation = 'none'; });
      if (ready && !flyers) ready();
      setTimeout(function () { root.classList.remove('smart', 'smart-go'); if (titles) titles.style.visibility = ''; }, 1300);
    }
  }
  var smartIn = null;
  try { smartIn = JSON.parse(sessionStorage.getItem(SKEY) || 'null'); sessionStorage.removeItem(SKEY); } catch (e) {}
  if (smartIn) {
    // show the name where it was straight away, then fly once the fonts are in
    // keep the name on screen where it was while the page and fonts settle
    var keep = null;
    if (smartIn.held) { keep = document.createElement('div'); keep.style.cssText = smartIn.held; keep.textContent = smartIn.text; document.body.appendChild(keep); }
    var start = function () { if (window.__glideJump) window.__glideJump(); arriveSmart(smartIn, function () { if (keep) keep.remove(); }); };
    var fonts = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    if (document.fonts && document.fonts.status === 'loaded') start(); else fonts.then(function () { requestAnimationFrame(start); });
  } else if (root.classList.contains('smart')) root.classList.remove('smart');


  // ---- Logo home: the logo holds its place in the nav while the homepage appears around it ----
  var HKEY = 'fa-home';
  function logoCopy(el, r) {
    var c = el.cloneNode(true); c.removeAttribute('href'); c.setAttribute('aria-hidden', 'true');
    c.style.cssText = 'position:fixed;left:' + r.l + 'px;top:' + r.t + 'px;width:' + r.w + 'px;height:' + r.h + 'px;z-index:302;pointer-events:none;display:block;margin:0';
    var sv = c.querySelector('svg'); if (sv) sv.style.cssText = 'display:block;width:100%;height:100%;fill:' + r.fill;
    document.body.appendChild(c); return c;
  }
  function leaveHome(a, url) {
    var sv = a.querySelector('svg') || a, b = sv.getBoundingClientRect();
    var r = { l: b.left, t: b.top, w: b.width, h: b.height, fill: getComputedStyle(sv).fill };
    var veil = document.createElement('div');
    veil.style.cssText = 'position:fixed;inset:0;z-index:300;background:' + paper() + ';opacity:0;transition:opacity .4s ease';
    document.body.appendChild(veil);
    var held = logoCopy(a, r);
    leftover = function () { veil.remove(); held.remove(); };
    requestAnimationFrame(function () { veil.style.opacity = '1'; });
    setTimeout(function () { try { sessionStorage.setItem(HKEY, JSON.stringify(r)); } catch (er) {} location.href = url.href; }, 420);
  }
  var homeIn = null;
  try { homeIn = JSON.parse(sessionStorage.getItem(HKEY) || 'null'); sessionStorage.removeItem(HKEY); } catch (e) {}
  if (homeIn) {
    var logo = document.querySelector('.navlogo'), keepLogo = window.__homeLogo || (logo ? logoCopy(logo, homeIn) : null);
    var shown = false, show = function () {
      if (shown) return; shown = true;
      scrollTo(0, 0); if (window.__glideJump) window.__glideJump();
      requestAnimationFrame(function () {
        root.classList.add('home-go');
        setTimeout(function () { if (window.__onArrive) window.__onArrive(); }, 150);
        setTimeout(function () { if (keepLogo) keepLogo.remove(); root.classList.remove('homing', 'home-go'); }, 900);
      });
    };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(show);
    setTimeout(show, 700);
  } else root.classList.remove('homing');

  // Arriving from a transition: start covered, then lift the panel away
  var arriving = false;
  try { arriving = sessionStorage.getItem(KEY) === '1'; sessionStorage.removeItem(KEY); } catch (e) {}
  if (arriving && !reduce) {
    document.documentElement.classList.add('arriving');
    var s0 = size(); svg.style.display = 'block'; path.setAttribute('d', 'M0 0H' + s0[0] + 'V' + s0[1] + 'H0Z');
    document.documentElement.classList.remove('wiping');
    var go = function () {
      // land on the section named in the address (the page scrolls a moving layer, so do it by hand)
      if (location.hash.length > 1) {
        var t = document.getElementById(location.hash.slice(1));
        if (t && document.getElementById('smooth')) { var y = 0, n = t; while (n && n.id !== 'smooth') { y += n.offsetTop; n = n.offsetParent; } scrollTo(0, Math.max(0, y - 16)); }
      }
      if (window.__glideJump) window.__glideJump();
      setTimeout(function () { reveal(); setTimeout(function () { if (window.__onArrive) window.__onArrive(); }, 200); }, 60);
    };
    // lift as soon as the text is ready; don't hold the panel up for images or the 3D model
    var went = false, once = function () { if (!went) { went = true; requestAnimationFrame(go); } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(once);
    setTimeout(once, 700);
  }

  // Leaving: links to project pages, the work list and back home get the wipe
  document.addEventListener('click', function (e) {
    if (reduce || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    var href = a.getAttribute('href');
    if (!/^(work\.html|index\.html)/.test(href) || a.target === '_blank') return;
    var url = new URL(href, location.href);
    if (url.pathname === location.pathname && url.hash === location.hash) return;
    if (a.classList.contains('navlogo') && /^index\.html$/.test(href)) { e.preventDefault(); leaveHome(a, url); return; }
    if (/^work\.html#./.test(href) && document.querySelector('.p-title, .worklist')) { e.preventDefault(); if (leaveSmart(a, url)) return; }
    e.preventDefault();
    var samePage = url.pathname === location.pathname;
    cover(function () {
      if (samePage) {
        location.hash = url.hash;
        // let the new content render and settle under the panel, with no scroll easing left to show
        requestAnimationFrame(function () { scrollTo(0, 0); if (window.__glideJump) window.__glideJump();
          setTimeout(function () { if (window.__glideJump) window.__glideJump(); reveal(); }, 120); });
      }
      else { try { sessionStorage.setItem(KEY, '1'); } catch (er) {} location.href = url.href; }
    });
  });
  // coming back with the browser's back button from a cached page: make sure the panel isn't left up
  addEventListener('pageshow', function (e) { if (e.persisted) { if (leftover) { leftover(); leftover = null; } svg.style.display = 'none'; svg.style.pointerEvents = 'none'; } });
})();
