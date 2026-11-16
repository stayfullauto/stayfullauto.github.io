// text reveal: split copy into lines and slide each line up out of its own mask as it scrolls into view.
// faReveal(elements) can be called again for new content (the project page re-renders on hash change).
(function () {
  var css = '.trv-on .trv:not(.trv-split){opacity:0}' +
    '.trv .ln{display:block;overflow:hidden;padding-bottom:.14em;margin-bottom:-.14em}' +
    '.trv .li{display:block;transform:translateY(112%) rotate(2.5deg);transform-origin:0 0;transition:transform 1.15s cubic-bezier(.16,1,.3,1);will-change:transform}' +
    '.trv.in .li{transform:none}.trv.now .li{transition:none}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
  var ok = 'IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches;
  var live = [], io = null, w = innerWidth, t;
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
  function split(el) {
    el.innerHTML = el.__src;
    var lines;
    if (el.children.length) lines = [el.__src];            // has markup inside: reveal it as one block
    else {
      var words = el.textContent.trim().split(/\s+/);
      el.innerHTML = words.map(function (x) { return '<span>' + esc(x) + '</span>'; }).join(' ');
      lines = []; var top = null, cur = [];
      [].forEach.call(el.children, function (sp, i) {
        if (top !== null && Math.abs(sp.offsetTop - top) > 2) { lines.push(cur.join(' ')); cur = []; }
        top = sp.offsetTop; cur.push(esc(words[i]));
      });
      lines.push(cur.join(' '));
    }
    el.innerHTML = lines.map(function (l, i) {
      return '<span class="ln"><span class="li" style="transition-delay:' + (i * 0.085).toFixed(3) + 's">' + l + '</span></span>';
    }).join('');
    el.classList.add('trv-split');
  }
  function obs() {
    return io || (io = new IntersectionObserver(function (ents) {
      var n = 0;
      ents.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target, d = n++ * 0.12; io.unobserve(el);
        [].forEach.call(el.querySelectorAll('.li'), function (li, i) { li.style.transitionDelay = (d + i * 0.085).toFixed(3) + 's'; });
        requestAnimationFrame(function () { el.classList.add('in'); });
      });
    }, { rootMargin: '0px 0px -8% 0px' }));
  }
  window.faReveal = function (list) {
    if (!ok) return;
    var els = [].slice.call(list || []);
    if (!els.length) return;
    document.documentElement.classList.add('trv-on');
    els.forEach(function (el) { el.classList.add('trv'); el.__src = el.innerHTML; });
    live = live.filter(function (el) { return el.isConnected; }).concat(els);
    var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
    Promise.race([ready, new Promise(function (r) { setTimeout(r, 1500); })]).then(function () {
      els.forEach(function (el) { if (el.isConnected) { split(el); obs().observe(el); } });
    });
  };
  // re-split when the width changes; lines already shown stay shown
  addEventListener('resize', function () {
    if (innerWidth === w) return; w = innerWidth;
    clearTimeout(t); t = setTimeout(function () {
      live.forEach(function (el) {
        if (!el.isConnected || !el.classList.contains('trv-split')) return;
        var shown = el.classList.contains('in');
        if (shown) el.classList.add('now');
        split(el);
        if (shown) requestAnimationFrame(function () { el.classList.remove('now'); });
      });
    }, 150);
  });
})();
