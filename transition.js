/*
 * Page transition between the work list and project pages, after dionpieters.dev:
 * a black panel sweeps up from the bottom with a bulging, liquid top edge and covers the page,
 * the next page loads underneath, then the panel carries on up and off the top.
 */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
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

  // Arriving from a transition: start covered, then lift the panel away
  var arriving = false;
  try { arriving = sessionStorage.getItem(KEY) === '1'; sessionStorage.removeItem(KEY); } catch (e) {}
  if (arriving && !reduce) {
    document.documentElement.classList.add('arriving');
    var s0 = size(); svg.style.display = 'block'; path.setAttribute('d', 'M0 0H' + s0[0] + 'V' + s0[1] + 'H0Z');
    var go = function () {
      // land on the section named in the address (the page scrolls a moving layer, so do it by hand)
      if (location.hash.length > 1) {
        var t = document.getElementById(location.hash.slice(1));
        if (t && document.getElementById('smooth')) { var y = 0, n = t; while (n && n.id !== 'smooth') { y += n.offsetTop; n = n.offsetParent; } scrollTo(0, Math.max(0, y - 16)); }
      }
      setTimeout(function () { reveal(); }, 120);
    };
    if (document.readyState === 'complete') go(); else addEventListener('load', go);
  }

  // Leaving: links to project pages, the work list and back home get the wipe
  document.addEventListener('click', function (e) {
    if (reduce || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
    var href = a.getAttribute('href');
    if (!/^(work\.html|index\.html)/.test(href) || a.target === '_blank') return;
    var url = new URL(href, location.href);
    if (url.pathname === location.pathname && url.hash === location.hash) return;
    e.preventDefault();
    var samePage = url.pathname === location.pathname;
    cover(function () {
      if (samePage) { location.hash = url.hash; setTimeout(function () { reveal(); }, 80); }
      else { try { sessionStorage.setItem(KEY, '1'); } catch (er) {} location.href = url.href; }
    });
  });
  // coming back with the browser's back button from a cached page: make sure the panel isn't left up
  addEventListener('pageshow', function (e) { if (e.persisted) { svg.style.display = 'none'; svg.style.pointerEvents = 'none'; } });
})();
