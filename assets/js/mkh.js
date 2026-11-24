/* ============================================================================
   MKH · منطق الموقع الكامل
   ----------------------------------------------------------------------------
   - المظهر: تبديل ناعم + حفظ في المتصفح + احترام إعداد النظام.
   - الحركات: ظهور عند التمرير، مؤشّر ذهبي، مغناطيس الأزرار، ميلان الإطارات.
   - الخدمات والحاسبة والأعمال والمواقع: تُبنى من assets/js/works-data.js.
   - نافذة المعاينة: صور · فيديو · PDF · معاينة موقع حيّة مع تبديل جوال/كمبيوتر.
   ========================================================================== */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var TG = window.MKH_TELEGRAM || 'https://t.me/MKH_ksa';

  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function on(t, e, f, o) { if (t) t.addEventListener(e, f, o || false); }

  /* ينفّذ الدالة بعد أول رسم، ومع ضمان تنفيذ حتى لو تعطّل طلب الإطار */
  function afterPaint(fn) {
    var done = false;
    var run = function () { if (done) return; done = true; fn(); };
    if (window.requestAnimationFrame) window.requestAnimationFrame(run);
    setTimeout(run, 120);
  }
  /* تخفيف تنفيذ الدوال عند التمرير (يعمل حتى في التبويبات غير المرئية) */
  function throttle(fn, ms) {
    var timer = 0, last = 0;
    return function () {
      var now = Date.now();
      if (now - last >= ms) { last = now; fn(); return; }
      if (timer) return;
      timer = setTimeout(function () { timer = 0; last = Date.now(); fn(); }, ms - (now - last));
    };
  }

  var mqReduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  var reduce = !!(mqReduce && mqReduce.matches);
  var mqCoarse = window.matchMedia ? window.matchMedia('(hover: none), (pointer: coarse)') : null;
  var coarse = !!(mqCoarse && mqCoarse.matches);
  if (mqReduce && mqReduce.addEventListener) {
    mqReduce.addEventListener('change', function (e) { reduce = e.matches; });
  }

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (ch) {
      return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch];
    });
  }
  function fmt(n) {
    n = Math.round(Number(n) || 0);
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function orderUrl(label) {
    var base = TG;
    if (!label) return base;
    return base + '?text=' + encodeURIComponent(label);
  }

  /* ------------------------------------------------------------ مجموعة الأيقونات */
  var PATHS = {
    search: '<circle cx="10.8" cy="10.8" r="6.6"/><path d="M15.6 15.6 20.5 20.5"/>',
    slides: '<rect x="3" y="4.5" width="18" height="12.5" rx="2"/><path d="M12 17v3.5M8.5 20.5h7"/><path d="M7.6 12.6l2.6-3.4 2.2 2.6 1.7-2.2 2.4 3"/>',
    spark: '<path d="M11.5 3.4l1.8 4.7 4.7 1.8-4.7 1.8-1.8 4.7-1.8-4.7L5 9.9l4.7-1.8z"/><path d="M18.3 15.2l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    id: '<rect x="2.5" y="4.5" width="19" height="15" rx="2.4"/><circle cx="8.6" cy="11" r="2.3"/><path d="M5 16.4a4 4 0 0 1 7.2 0"/><path d="M15 9.8h4M15 12.8h4M15 15.8h2.6"/>',
    game: '<rect x="2.5" y="7" width="19" height="10" rx="4"/><path d="M7.2 10.6v2.8M5.8 12h2.8"/><circle cx="15.6" cy="11.2" r=".9"/><circle cx="17.7" cy="13.1" r=".9"/>',
    megaphone: '<path d="M4 10.6v2.8a1.6 1.6 0 0 0 1.6 1.6H7l1 5h2.4l-1-5h1.2l7 3.6V4.4L9.6 8H5.6A1.6 1.6 0 0 0 4 9.6z"/><path d="M19.5 9.8v4.4"/>',
    pen: '<path d="M4 20l4.4-1.1 9.9-9.9a2.3 2.3 0 0 0-3.3-3.3L5.1 15.6z"/><path d="M13.9 6.9l3.2 3.2"/>',
    layers: '<path d="M12 3.5 21 8l-9 4.5L3 8z"/><path d="M4.9 12.4 12 16l7.1-3.6"/><path d="M4.9 16.4 12 20l7.1-3.6"/>',
    film: '<rect x="2.5" y="4.5" width="19" height="15" rx="2.4"/><path d="M7.2 4.5v15M16.8 4.5v15M2.5 9.4h4.7M2.5 14.6h4.7M16.8 9.4h4.7M16.8 14.6h4.7"/>',
    card: '<rect x="3" y="5.5" width="18" height="13" rx="2.4"/><path d="M3 9.8h18"/><path d="M6.6 14.4h4.2"/>',
    browser: '<rect x="2.5" y="4" width="19" height="16" rx="2.4"/><path d="M2.5 8.6h19"/><circle cx="5.7" cy="6.3" r=".7"/><circle cx="8" cy="6.3" r=".7"/>',
    tag: '<path d="M12.6 3.5H20v7.4l-9 9.1a2 2 0 0 1-2.9 0l-4.6-4.6a2 2 0 0 1 0-2.9z"/><circle cx="16.2" cy="7.4" r="1.3"/>',
    target: '<circle cx="12" cy="12" r="8.6"/><circle cx="12" cy="12" r="4.6"/><circle cx="12" cy="12" r="1.1"/>',
    grid: '<rect x="3.2" y="3.2" width="7.4" height="7.4" rx="2"/><rect x="13.4" y="3.2" width="7.4" height="7.4" rx="2"/><rect x="3.2" y="13.4" width="7.4" height="7.4" rx="2"/><rect x="13.4" y="13.4" width="7.4" height="7.4" rx="2"/>',
    shuffle: '<path d="M3.5 7.5h3.2l3 3.3M20.5 7.5h-5.3l-6.8 9.1H4"/><path d="M17 5.2l3.5 2.3L17 10"/><path d="M17 13.9l3.5 2.4L17 18.7"/>',
    chat: '<path d="M4 5h16v11a2 2 0 0 1-2 2h-7l-4.6 3.1A.6.6 0 0 1 5.4 21v-3H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2z"/><circle cx="8.6" cy="11.4" r="1.2"/><circle cx="12" cy="11.4" r="1.2"/><circle cx="15.4" cy="11.4" r="1.2"/>',
    check: '<path d="M4.6 12.6l4.6 4.6L19.4 6.8"/>',
    zoom: '<circle cx="10.8" cy="10.8" r="6.6"/><path d="M15.6 15.6 20.5 20.5M10.8 7.9v5.8M7.9 10.8h5.8"/>',
    play: '<path d="M8.2 5.3v13.4L19 12z"/>',
    doc: '<path d="M13.5 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z"/><path d="M13.5 3.5V9H19"/><path d="M8.6 13h6.8M8.6 16.2h6.8"/>',
    image: '<rect x="3" y="4.5" width="18" height="15" rx="2.4"/><circle cx="8.7" cy="9.7" r="1.7"/><path d="M3.7 17.6 9 12.4l3.2 3 3-2.6 5.1 4.8"/>',
    video: '<rect x="2.6" y="5.6" width="13.4" height="12.8" rx="2.4"/><path d="M16 10.4l5.4-2.8v8.8L16 13.6z"/>',
    download: '<path d="M12 3.8v11.4M7.7 11 12 15.3 16.3 11"/><path d="M4.6 19.6h14.8"/>',
    external: '<path d="M13.8 4.5h5.7v5.7"/><path d="M19.5 4.5 11 13"/><path d="M18 14.4v3.6a2 2 0 0 1-2 2H6.5a2 2 0 0 1-2-2V8.5a2 2 0 0 1 2-2H10"/>',
    telegram: '<path d="M21.6 4.3 2.9 11.5c-.8.3-.8 1.4 0 1.7l4.5 1.5 1.7 5.4c.2.7 1.1.9 1.6.3l2.4-2.7 4.5 3.3c.6.4 1.4.1 1.6-.6l3.1-14.8c.2-.9-.7-1.6-1.5-1.3z"/>',
    info: '<circle cx="12" cy="12" r="9.4"/><path d="M12 10.6v6M12 7.4v.2"/>',
    monitor: '<rect x="2.5" y="4" width="19" height="13" rx="2"/><path d="M8 20.5h8M12 17v3.5"/>',
    phone: '<rect x="6.5" y="2.5" width="11" height="19" rx="2.6"/><path d="M10.6 18.6h2.8"/>',
    mail: '<rect x="2.6" y="4.6" width="18.8" height="14.8" rx="2.4"/><path d="M3.4 6.4 12 12.6l8.6-6.2"/>',
    refresh: '<path d="M20.4 12a8.4 8.4 0 1 1-2.46-5.94"/><path d="M20.8 4.3v4.4h-4.4"/>'
  };
  function ic(name, extra) {
    var p = PATHS[name] || '';
    return '<svg class="ic' + (extra ? ' ' + extra : '') + '" viewBox="0 0 24 24" aria-hidden="true">' + p + '</svg>';
  }

  /* ---------------------------------------------------------- قفل تمرير الصفحة */
  var locks = {};
  function lock(key, isOn) {
    if (isOn) locks[key] = 1; else delete locks[key];
    doc.body.classList.toggle('is-locked', Object.keys(locks).length > 0);
  }

  /* ------------------------------------------------------------------- التنبيه */
  var toastTimer = 0;
  function toast(msg, iconName) {
    var el = $('#toast');
    if (!el) return;
    el.innerHTML = ic(iconName || 'check') + '<span>' + esc(msg) + '</span>';
    el.hidden = false;
    afterPaint(function () { el.classList.add('is-on'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove('is-on');
      setTimeout(function () { el.hidden = true; }, 420);
    }, 2800);
  }

  /* ------------------------------------------------------------------ المظهر */
  var META_LIGHT = '#F7F4EE';
  var META_DARK = '#0B1622';
  function metaThemeColor(t) {
    var m = doc.querySelector('meta[name="theme-color"]:not([media])');
    if (!m) {
      m = doc.createElement('meta');
      m.setAttribute('name', 'theme-color');
      doc.head.appendChild(m);
    }
    m.setAttribute('content', t === 'dark' ? META_DARK : META_LIGHT);
  }
  function initTheme() {
    var btn = $('#themeToggle');
    var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
    var userSet = false;
    try { userSet = !!localStorage.getItem('mkh:theme'); } catch (e) { }
    var animTimer = 0;

    function apply(t, animate) {
      root.setAttribute('data-theme', t);
      root.style.colorScheme = t;
      metaThemeColor(t);
      if (btn) {
        btn.setAttribute('aria-pressed', t === 'dark' ? 'true' : 'false');
        btn.setAttribute('title', t === 'dark' ? 'التبديل إلى المظهر النهاري' : 'التبديل إلى المظهر الليلي');
      }
      if (animate && !reduce) {
        root.classList.add('theme-anim');
        clearTimeout(animTimer);
        animTimer = setTimeout(function () { root.classList.remove('theme-anim'); }, 620);
      }
    }

    apply(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light', false);

    on(btn, 'click', function () {
      var t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem('mkh:theme', t); } catch (e) { }
      userSet = true;
      apply(t, true);
      toast(t === 'dark' ? 'المظهر الليلي اشتغل' : 'المظهر النهاري اشتغل', 'spark');
    });

    if (mq) {
      var onSys = function (e) { if (!userSet) apply(e.matches ? 'dark' : 'light', true); };
      if (mq.addEventListener) mq.addEventListener('change', onSys);
      else if (mq.addListener) mq.addListener(onSys);
    }
  }

  /* --------------------------------------------------------- شاشة الافتتاح */
  function initBoot() {
    var box = $('#boot');
    if (!box) return;
    lock('boot', true);
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      box.classList.add('is-done');
      box.setAttribute('aria-hidden', 'true');
      lock('boot', false);
      // ضمان أخير: نشيل الغطاء من المسار تمامًا بعد انتهاء الانتقال
      setTimeout(function () { box.style.display = 'none'; }, 700);
    }
    // نربط مدة الافتتاحية بمسار الحركة نفسه (يبدأ من أول تحميل) عشان الانتقال يطلع ثابت وناعم
    var hold = reduce ? 150 : 2500;                 // مدة حركة ظهور الشعار
    var elapsed = (window.performance && performance.now) ? performance.now() : 0;
    var wait = Math.max(0, hold - elapsed);
    setTimeout(finish, wait);
    // شبكة أمان فقط: لا نترك الغطاء أكثر من اللازم لو تأخّر أي شيء
    setTimeout(finish, wait + 1800);
  }

  /* ------------------------------------------------------------------ الهيدر */
  function initHeader() {
    var head = $('#siteHead');
    var nav = $('#headNav');
    var burger = $('#navBurger');
    var stuck = false;

    function scrollState() {
      var y = window.pageYOffset || root.scrollTop || 0;
      var s = y > 14;
      if (s !== stuck) { stuck = s; if (head) head.classList.toggle('is-stuck', s); }
      var fab = $('#fabTg');
      if (fab) fab.classList.toggle('is-open', y > 620);
      var top = $('#toTop');
      if (top) top.classList.toggle('is-on', y > 700);
      var rail = $('#readRail');
      if (rail) rail.classList.toggle('is-on', y > 240);
    }
    on(window, 'scroll', scrollState, { passive: true });
    on(window, 'resize', scrollState);
    scrollState();

    function closeNav() {
      if (!nav) return;
      nav.classList.remove('is-open');
      if (burger) {
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'فتح القائمة');
      }
      lock('nav', false);
    }
    on(burger, 'click', function () {
      if (!nav) return;
      var open = !nav.classList.contains('is-open');
      nav.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      burger.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
      lock('nav', open);
    });
    $$('a', nav).forEach(function (a) { on(a, 'click', closeNav); });
    on(doc, 'keydown', function (e) { if (e.key === 'Escape') closeNav(); });
    on(window, 'resize', function () { if (window.innerWidth > 860) closeNav(); });

    var top = $('#toTop');
    on(top, 'click', function () {
      try { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }
      catch (e) { window.scrollTo(0, 0); }
    });
  }

  /* ------------------------------------------------------ شريط تقدّم القراءة */
  function initRail() {
    var fill = $('#rrFill');
    var num = $('#rrNum');
    if (!fill && !num) return;
    function upd() {
      var max = root.scrollHeight - root.clientHeight;
      var p = max > 0 ? Math.min(100, Math.max(0, ((window.pageYOffset || root.scrollTop) / max) * 100)) : 0;
      if (fill) fill.style.height = p.toFixed(1) + '%';
      if (num) num.textContent = Math.round(p) + '%';
    }
    var throttled = throttle(upd, 80);
    on(window, 'scroll', throttled, { passive: true });
    on(window, 'resize', throttled);
    upd();
  }

  /* ------------------------------------------------------------ تتبّع الأقسام */
  function initSpy() {
    var nav = $('#headNav');
    if (!nav) return;
    var links = $$('a[href^="#"]', nav);
    var marks = [];
    links.forEach(function (a) {
      var s = doc.getElementById(a.getAttribute('href').slice(1));
      if (s) marks.push({ el: s, a: a });
    });
    if (!marks.length) return;

    var current = null;
    function upd() {
      var y = window.pageYOffset || root.scrollTop || 0;
      var vh = root.clientHeight || window.innerHeight || 0;
      var mark = y + Math.min(vh * 0.4, 340);
      var pick = marks[0];
      marks.forEach(function (m) {
        if (m.el.getBoundingClientRect().top + y <= mark) pick = m;
      });
      if (y + vh >= root.scrollHeight - 6) pick = marks[marks.length - 1];
      if (pick === current) return;
      current = pick;
      marks.forEach(function (m) { m.a.classList.remove('is-current'); });
      pick.a.classList.add('is-current');
    }
    var throttled = throttle(upd, 90);
    on(window, 'scroll', throttled, { passive: true });
    on(window, 'resize', throttled);
    upd();
  }

  /* -------------------------------------------------------------- حركة الظهور */
  var revealIO = null;
  var revealTimer = 0;
  var revealLeft = -1;

  function revealNow(el) {
    if (el.classList.contains('is-in')) return;
    el.classList.add('is-in');
    revealLeft--;
    if (revealIO) { try { revealIO.unobserve(el); } catch (e) { } }
  }
  function revealPending() {
    if (revealLeft <= 0) return;
    var pending = $$('[data-reveal]:not(.is-in)');
    if (!pending.length) {
      revealLeft = 0;
      if (revealTimer) { clearInterval(revealTimer); revealTimer = 0; }
      return;
    }
    var vh = root.clientHeight || window.innerHeight || 0;
    var now = Date.now();
    pending.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.bottom <= 0 || r.top >= vh) { el._mkhSeen = 0; return; }
      // العنصر داخل الشاشة: إذا ما ظهر خلال المراقب، ننتظر لحظة ثم نُظهره بأنفسنا
      if (!el._mkhSeen) { el._mkhSeen = now; return; }
      if (now - el._mkhSeen >= 800) revealNow(el);
    });
  }
  function initReveal() {
    var els = $$('[data-reveal]');
    revealLeft = els.length;
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('is-in'); });
      return;
    }
    revealIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var d = parseInt(el.getAttribute('data-delay') || '0', 10) || 0;
        setTimeout(function () { revealNow(el); }, d);
        revealIO.unobserve(el);
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.1 });
    els.forEach(function (e) { revealIO.observe(e); });

    // شبكة أمان: أي عنصر وصل فوق منتصف الشاشة لازم يكون ظاهر، حتى لو تأخر المراقب
    var throttled = throttle(revealPending, 110);
    on(window, 'scroll', throttled, { passive: true });
    on(window, 'load', function () { setTimeout(revealPending, 60); });
    revealTimer = setInterval(revealPending, 900);
  }

  /* ------------------------------------------------------- الشريط المتحرك */
  function initMarquee() {
    var track = $('#marqueeTrack');
    if (!track || reduce) return;
    track.innerHTML = track.innerHTML + track.innerHTML;
  }

  /* --------------------------------------------------------- السنة في التذييل */
  function initYear() {
    var y = $('#year');
    if (y) y.textContent = String(new Date().getFullYear());
  }

  /* ------------------------------------------------------ مؤشّر الفأرة الذهبي */
  function initCursor() {
    if (reduce || coarse) return;
    var halo = doc.createElement('span');
    halo.className = 'cursor-halo';
    halo.setAttribute('aria-hidden', 'true');
    doc.body.appendChild(halo);
    var x = 0, y = 0, cx = 0, cy = 0, raf = 0, seen = false;

    function loop() {
      raf = 0;
      cx += (x - cx) * 0.22;
      cy += (y - cy) * 0.22;
      halo.style.transform = 'translate3d(' + cx.toFixed(2) + 'px,' + cy.toFixed(2) + 'px,0)';
      if (Math.abs(x - cx) > 0.6 || Math.abs(y - cy) > 0.6) raf = requestAnimationFrame(loop);
    }
    on(window, 'mousemove', function (e) {
      x = e.clientX; y = e.clientY;
      if (!seen) { seen = true; cx = x; cy = y; halo.classList.add('is-on'); }
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    on(doc, 'mouseleave', function () { halo.classList.remove('is-on'); seen = false; });
    var HOT = 'a,button,[data-magnetic],.work-card,.filter,.lb-thumb,input,[role="button"]';
    on(doc, 'mouseover', function (e) {
      if (e.target && e.target.closest && e.target.closest(HOT)) halo.classList.add('is-hot');
    });
    on(doc, 'mouseout', function (e) {
      if (e.target && e.target.closest && e.target.closest(HOT)) halo.classList.remove('is-hot');
    });
  }

  /* ----------------------------------------- مغناطيس الأزرار · ميلان · بارالاكس */
  function initMotion() {
    if (reduce) return;

    if (!coarse) {
      $$('[data-magnetic]').forEach(function (el) {
        on(el, 'mousemove', function (e) {
          var r = el.getBoundingClientRect();
          var mx = (e.clientX - r.left) / r.width - 0.5;
          var my = (e.clientY - r.top) / r.height - 0.5;
          el.style.transform = 'translate(' + (mx * 9).toFixed(2) + 'px,' + (my * 7 - 2).toFixed(2) + 'px)';
        });
        on(el, 'mouseleave', function () { el.style.transform = ''; });
      });
    }

    $$('[data-tilt]').forEach(function (el) {
      el.classList.add('tilt');
      if (!el.querySelector('.tilt-shine')) {
        var sh = doc.createElement('span');
        sh.className = 'tilt-shine';
        sh.setAttribute('aria-hidden', 'true');
        el.appendChild(sh);
      }
      if (coarse) return;
      on(el, 'mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
        el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
        el.style.transform = 'perspective(1000px) rotateY(' + ((px - 0.5) * 7).toFixed(2) +
          'deg) rotateX(' + ((0.5 - py) * 6).toFixed(2) + 'deg) translateY(-5px)';
      });
      on(el, 'mouseleave', function () { el.style.transform = ''; });
    });

    var art = $('.hero-art');
    var stage = $('#artStage');
    if (art && stage && !coarse) {
      var raf = 0, tx = 0, ty = 0;
      on(window, 'mousemove', function (e) {
        tx = (e.clientX / window.innerWidth - 0.5) * 26;
        ty = (e.clientY / window.innerHeight - 0.5) * 20;
        if (!raf) raf = requestAnimationFrame(function () {
          raf = 0;
          stage.style.transform = 'translate3d(' + tx.toFixed(2) + 'px,' + ty.toFixed(2) + 'px,0)';
        });
      }, { passive: true });
    }
  }

  /* ---------------------------------------------------------------- الخدمات */
  function renderServices() {
    var grid = $('#servicesGrid');
    if (!grid) return;
    var list = window.MKH_SERVICES || [];
    var h = '';
    list.forEach(function (s, i) {
      var ask = 'مرحبًا MKH، ودي أطلب خدمة: ' + s.name;
      h += '<article class="svc reveal" data-reveal data-delay="' + ((i % 3) * 80) + '">';
      if (s.tag) h += '<span class="svc-tag">' + esc(s.tag) + '</span>';
      h += '<span class="svc-icon">' + ic(s.icon) + '</span>';
      h += '<h3 class="svc-name">' + esc(s.name) + '</h3>';
      h += '<p class="svc-desc">' + esc(s.desc) + '</p>';
      h += '<div class="svc-prices">';
      (s.options || []).forEach(function (o) {
        h += '<div class="svc-price"><span class="svc-price-label">' + esc(o.label) + '</span>';
        h += '<span class="svc-price-val">' + (o.price == null
          ? esc(o.unit)
          : '<b>' + fmt(o.price) + '</b> <small>ريال ' + esc(o.unit) + '</small>') + '</span></div>';
      });
      h += '</div>';
      h += '<a class="svc-order" href="' + esc(orderUrl(ask)) + '" target="_blank" rel="noopener noreferrer">' +
        ic('telegram', 'ic-solid') + '<span>اطلب هذي الخدمة</span></a>';
      h += '</article>';
    });
    grid.innerHTML = h;
    var note = $('#priceNote');
    if (note) note.textContent = window.MKH_PRICE_NOTE || '';
  }

  /* ------------------------------------------------------------ حاسبة الطلب */
  function initPlanner() {
    var listBox = $('#plannerList');
    if (!listBox) return;

    var OPTS = [];
    (window.MKH_SERVICES || []).forEach(function (s) {
      (s.options || []).forEach(function (o) {
        OPTS.push({ id: o.id, svc: s.name, label: o.label, price: o.price, unit: o.unit, max: o.qtyMax || 99 });
      });
    });

    var h = '';
    OPTS.forEach(function (o) {
      var rate = o.price == null
        ? '<b>' + esc(o.unit) + '</b>'
        : '<b>' + fmt(o.price) + '</b> ريال ' + esc(o.unit);
      h += '<div class="pl-row" data-opt="' + esc(o.id) + '" data-max="' + o.max + '">' +
        '<button type="button" class="pl-check" role="checkbox" aria-checked="false" aria-label="إضافة: ' + esc(o.svc + ' — ' + o.label) + '">' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.6 12.6l4.6 4.6L19.4 6.8"/></svg></button>' +
        '<div class="pl-info"><div class="pl-name">' + esc(o.svc) + '</div>' +
        '<div class="pl-rate">' + esc(o.label) + ' — ' + rate + '</div></div>' +
        '<div class="pl-qty">' +
        '<button type="button" data-step="-1" aria-label="إنقاص الكمية">−</button>' +
        '<input type="number" inputmode="numeric" value="1" min="1" max="' + o.max + '" aria-label="الكمية">' +
        '<button type="button" data-step="1" aria-label="زيادة الكمية">+</button>' +
        '</div></div>';
    });
    listBox.innerHTML = h;

    var state = {};
    OPTS.forEach(function (o) { state[o.id] = { on: false, qty: 1 }; });

    var itemsBox = $('#plannerItems');
    var emptyBox = $('#plannerEmpty');
    var totalEl = $('#plannerTotal');
    var unitEl = $('#plannerUnit');
    var copyBtn = $('#plannerCopy');
    var sendBtn = $('#plannerSend');
    var clearBtn = $('#plannerClear');
    var sumBox = $('#plannerSum');
    var noteText = window.MKH_PRICE_NOTE || '';
    var lastTotal = 0;

    function rowOf(id) { return $('.pl-row[data-opt="' + id + '"]', listBox); }

    function summaryLines() {
      var out = [];
      OPTS.forEach(function (o) {
        var st = state[o.id];
        if (!st.on) return;
        var line = '- ' + o.svc + ' (' + o.label + ') × ' + st.qty;
        if (o.price == null) line += ' = السعر حسب المشروع';
        else line += ' = ' + fmt(o.price * st.qty) + ' ريال (' + fmt(o.price) + ' ريال ' + o.unit + ')';
        out.push(line);
      });
      return out;
    }

    function sync(popIt) {
      var lines = summaryLines();
      var total = 0;
      var hasFlexible = false;
      var html = '';
      OPTS.forEach(function (o) {
        var st = state[o.id];
        if (!st.on) return;
        var val;
        if (o.price == null) { hasFlexible = true; val = 'حسب المشروع'; }
        else { total += o.price * st.qty; val = fmt(o.price * st.qty) + ' ريال'; }
        html += '<li><span class="psi-n">' + esc(o.svc) + ' <b>× ' + st.qty + '</b></span>' +
          '<span class="psi-v">' + esc(val) + '</span></li>';
      });
      if (itemsBox) itemsBox.innerHTML = html;
      if (emptyBox) emptyBox.classList.toggle('is-hidden', lines.length > 0);
      if (totalEl) totalEl.textContent = fmt(total);
      if (unitEl) unitEl.textContent = hasFlexible && total === 0 ? 'حسب المشروع' : 'ريال';
      if (copyBtn) copyBtn.disabled = lines.length === 0;
      if (sendBtn) {
        sendBtn.href = lines.length
          ? orderUrl('ملخص طلب MKH:\n' + lines.join('\n') + '\n\nالمجموع التقديري: ' + fmt(total) + ' ريال\n(' + noteText + ')')
          : TG;
      }
      if (popIt && totalEl && total !== lastTotal && sumBox) {
        sumBox.classList.remove('is-pop');
        void sumBox.offsetWidth;
        sumBox.classList.add('is-pop');
        setTimeout(function () { sumBox.classList.remove('is-pop'); }, 520);
      }
      lastTotal = total;
    }

    function toggle(id) {
      var st = state[id];
      st.on = !st.on;
      var row = rowOf(id);
      if (row) {
        row.classList.toggle('is-on', st.on);
        var chk = $('.pl-check', row);
        if (chk) chk.setAttribute('aria-checked', st.on ? 'true' : 'false');
      }
      sync(true);
    }

    function setQty(id, q) {
      var st = state[id];
      var row = rowOf(id);
      var max = row ? parseInt(row.getAttribute('data-max'), 10) || 99 : 99;
      st.qty = Math.max(1, Math.min(max, Math.round(q) || 1));
      if (row) {
        var inp = $('input', row);
        if (inp) inp.value = String(st.qty);
      }
      sync(false);
    }

    on(listBox, 'click', function (e) {
      var t = e.target;
      if (!t || !t.closest) return;
      var row = t.closest('.pl-row');
      if (!row) return;
      var id = row.getAttribute('data-opt');
      var stepBtn = t.closest('[data-step]');
      if (stepBtn) {
        setQty(id, (state[id].qty || 1) + parseInt(stepBtn.getAttribute('data-step'), 10));
        return;
      }
      if (t.closest('.pl-info') || t.closest('.pl-check')) toggle(id);
    });
    on(listBox, 'change', function (e) {
      if (e.target && e.target.tagName === 'INPUT' && e.target.type === 'number') {
        var row = e.target.closest('.pl-row');
        if (row) setQty(row.getAttribute('data-opt'), parseInt(e.target.value, 10));
      }
    });

    on(clearBtn, 'click', function () {
      OPTS.forEach(function (o) { state[o.id] = { on: false, qty: 1 }; });
      $$('.pl-row', listBox).forEach(function (row) {
        row.classList.remove('is-on');
        var chk = $('.pl-check', row);
        if (chk) chk.setAttribute('aria-checked', 'false');
        var inp = $('input', row);
        if (inp) inp.value = '1';
      });
      sync(false);
      toast('تم تفريغ الطلب');
    });

    function copyText(text) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { toast('تم نسخ ملخص الطلب'); },
          function () { fallbackCopy(text); });
      } else fallbackCopy(text);
    }
    function fallbackCopy(text) {
      var ta = doc.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.insetBlockStart = '-2000px';
      doc.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = doc.execCommand('copy'); } catch (e) { ok = false; }
      doc.body.removeChild(ta);
      toast(ok ? 'تم نسخ ملخص الطلب' : 'تعذّر النسخ، انسخه يدويًا', ok ? 'check' : 'info');
    }
    on(copyBtn, 'click', function () {
      var lines = summaryLines();
      if (!lines.length) return;
      var total = 0, flex = false;
      OPTS.forEach(function (o) {
        var st = state[o.id];
        if (!st.on) return;
        if (o.price == null) flex = true; else total += o.price * st.qty;
      });
      copyText('ملخص طلب MKH:\n' + lines.join('\n') +
        '\n\nالمجموع التقديري: ' + (flex ? fmt(total) + ' ريال + خدمة حسب المشروع' : fmt(total) + ' ريال') +
        '\n(' + noteText + ')');
    });

    sync(false);
  }

  /* ------------------------------------------------------ معرض الأعمال */
  var GAL = { cat: 'all', limit: 9, PER: 9, items: [], raf: 0, lastW: 0 };
  var KIND_LABEL = { live: 'معاينة حيّة', video: 'فيديو', pdf: 'ملف PDF', image: 'معرض صور' };

  function workKind(w) {
    var g = w.gallery || [];
    var has = function (t) { return g.some(function (x) { return x.type === t; }); };
    if (has('live') && (w.cats || []).indexOf('websites') >= 0) return 'live';
    if (has('video')) return 'video';
    if (has('pdf')) return 'pdf';
    return 'image';
  }
  function catLabel(id) {
    var found = (window.MKH_CATEGORIES || []).filter(function (c) { return c.id === id; })[0];
    return found ? found.label : '';
  }

  function renderFilters() {
    var box = $('#filters');
    if (!box) return;
    box.removeAttribute('role');
    var works = window.MKH_WORKS || [];
    var h = '';
    (window.MKH_CATEGORIES || []).forEach(function (c) {
      var n = c.id === 'all' ? works.length
        : works.filter(function (w) { return (w.cats || []).indexOf(c.id) >= 0; }).length;
      if (c.id !== 'all' && n === 0) return;
      var on0 = c.id === 'all';
      h += '<button type="button" class="filter' + (on0 ? ' is-on' : '') + '" data-cat="' + esc(c.id) +
        '" aria-pressed="' + (on0 ? 'true' : 'false') + '">' + esc(c.label) +
        '<span class="f-count">' + n + '</span></button>';
    });
    box.innerHTML = h;
  }

  function workBadges(w) {
    var g = w.gallery || [];
    var kind = workKind(w);
    var h = '';
    if (w.eyebrow) h += '<span class="work-badge">' + esc(w.eyebrow) + '</span>';
    if (kind === 'live') h += '<span class="work-badge is-gold">' + ic('browser') + '<span>معاينة حيّة</span></span>';
    else if (kind === 'video') h += '<span class="work-badge is-gold">' + ic('video') + '<span>فيديو</span></span>';
    else if (kind === 'pdf') h += '<span class="work-badge is-gold">' + ic('doc') + '<span>ملف PDF</span></span>';
    if (g.length > 1) h += '<span class="work-badge">' + ic('image') + '<span>' + g.length + '</span></span>';
    return h;
  }

  function renderWorks() {
    var box = $('#masonry');
    if (!box) return;
    var works = window.MKH_WORKS || [];
    var h = '';
    works.forEach(function (w, i) {
      var fit = w.coverFit === 'contain' ? ' fit-contain' : '';
      h += '<article class="work" data-i="' + i + '" data-cats="' + esc((w.cats || []).join(' ')) + '">' +
        '<div class="work-card" role="button" tabindex="0" aria-label="افتح معاينة: ' + esc(w.title) + '">' +
        '<div class="work-media"><img src="' + esc(w.cover) + '" alt="' + esc(w.title) + '" loading="lazy" decoding="async" class="' + fit.trim() + '"></div>' +
        '<div class="work-badges">' + workBadges(w) + '</div>' +
        '<div class="work-body"><h3 class="work-title">' + esc(w.title) + '</h3>' +
        '<p class="work-sub">' + esc(w.desc) + '</p></div>' +
        '<span class="work-zoom" aria-hidden="true">' + ic('zoom') + '</span>' +
        '</div></article>';
    });
    box.innerHTML = h;

    GAL.items = $$('.work', box).map(function (el) {
      var data = works[parseInt(el.getAttribute('data-i'), 10)];
      var card = $('.work-card', el);
      on(card, 'click', function () { openLightbox(data); });
      on(card, 'keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
          e.preventDefault();
          openLightbox(data);
        }
      });
      return { data: data, el: el, card: card, fresh: false };
    });
  }

  function galVisible() {
    return GAL.items.filter(function (o) {
      return GAL.cat === 'all' || (o.data.cats || []).indexOf(GAL.cat) >= 0;
    });
  }

  function layoutWorks() {
    var box = $('#masonry');
    if (!box || !GAL.items.length) return;
    var vis = galVisible();
    var show = vis.slice(0, GAL.limit);

    GAL.items.forEach(function (o) {
      var idx = show.indexOf(o);
      if (idx >= 0) {
        if (o.el.style.display === 'none') {
          o.el.style.display = '';
          o.el.classList.add('no-anim');
          o.el.classList.add('is-out');
          o.fresh = true;
        }
        afterPaint(function () { o.el.classList.remove('is-out'); });
      } else if (o.el.style.display !== 'none') {
        o.el.classList.add('is-out');
        o.el.style.display = 'none';
      }
    });

    var W = box.clientWidth;
    GAL.lastW = W;
    var cols = W >= 1120 ? 4 : W >= 780 ? 3 : W >= 520 ? 2 : 1;
    var gap = cols > 1 ? 16 : 0;
    var colW = (W - gap * (cols - 1)) / cols;
    var hs = [];
    for (var i = 0; i < cols; i++) hs.push(0);

    show.forEach(function (o) {
      var c = 0, min = Infinity;
      for (var k = 0; k < cols; k++) { if (hs[k] < min - 0.6) { min = hs[k]; c = k; } }
      var r = o.data.ratio || [1, 1];
      var hh = Math.round(colW * (r[1] / r[0]));
      o.el.style.width = colW + 'px';
      o.el.style.height = hh + 'px';
      o.el.style.transform = 'translate3d(' + (-(c * (colW + gap))).toFixed(2) + 'px,' + hs[c].toFixed(2) + 'px,0)';
      hs[c] += hh + gap;
    });

    var maxH = 0;
    hs.forEach(function (v) { if (v > maxH) maxH = v; });
    box.style.height = Math.max(0, maxH - (maxH > 0 ? gap : 0)) + 'px';

    afterPaint(function () {
      show.forEach(function (o) { if (o.fresh) { o.el.classList.remove('no-anim'); o.fresh = false; } });
    });

    var more = $('#worksMore');
    if (more) more.style.display = vis.length > GAL.limit ? '' : 'none';

    var cnt = $('#worksCount');
    if (cnt) {
      cnt.textContent = 'نعرض ' + show.length + ' من ' + vis.length + ' عمل' +
        (GAL.cat === 'all' ? '' : ' · ' + catLabel(GAL.cat));
    }
  }

  function initGallery() {
    var box = $('#masonry');
    if (!box) return;
    var more = $('#worksMore');
    var filters = $('#filters');

    on(filters, 'click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('.filter') : null;
      if (!b) return;
      var cat = b.getAttribute('data-cat');
      if (cat === GAL.cat) return;
      GAL.cat = cat;
      GAL.limit = GAL.PER;
      $$('.filter', filters).forEach(function (f) {
        var on0 = f === b;
        f.classList.toggle('is-on', on0);
        f.setAttribute('aria-pressed', on0 ? 'true' : 'false');
      });
      layoutWorks();
    });

    on(more, 'click', function () {
      GAL.limit += GAL.PER;
      layoutWorks();
      var y = box.getBoundingClientRect().top + (window.pageYOffset || root.scrollTop) - 120;
      try { window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' }); } catch (err) { window.scrollTo(0, y); }
    });

    on(window, 'resize', throttle(function () { layoutWorks(); }, 140));

    // إعادة القياس لما يتغيّر عرض الحاوية (شريط التمرير أو دوران الجوال… إلخ)
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(function (entries) {
        var w = entries[0].contentRect.width;
        if (Math.abs(w - GAL.lastW) < 0.5) return;
        layoutWorks();
      });
      ro.observe(box);
    }
    if (doc.fonts && doc.fonts.ready && doc.fonts.ready.then) {
      doc.fonts.ready.then(function () { layoutWorks(); });
    }
    on(window, 'load', function () { layoutWorks(); });

    layoutWorks();
  }

  /* ------------------------------------------------------- نافذة المعاينة */
  var LB = { open: false, list: [], wi: 0, si: 0, device: 'desktop', last: null, slides: [] };

  function slidesOf(work) {
    var g = (work.gallery || []).slice();
    if (!g.length && work.cover) g = [{ type: 'image', src: work.coverFull || work.cover, label: work.title }];
    return g;
  }
  function thumbFor(work, slide) {
    if (slide.type === 'image') return slide.src;
    if (slide.type === 'video') return slide.poster || work.cover;
    return work.coverFull || work.cover;
  }
  function kindTag(slide) {
    if (slide.type === 'pdf') return 'PDF';
    if (slide.type === 'video') return 'فيديو';
    if (slide.type === 'live') return 'حيّ';
    return 'صورة';
  }

  function renderStage() {
    var stage = $('#lbStage');
    if (!stage) return;
    var work = LB.list[LB.wi];
    if (!work) return;
    var slide = LB.slides[LB.si] || LB.slides[0];
    var h = '';
    if (slide.type === 'video') {
      h += '<video controls playsinline preload="metadata"' + (slide.vertical ? ' class="vertical"' : '') +
        (slide.poster ? ' poster="' + esc(slide.poster) + '"' : '') + '>' +
        '<source src="' + esc(slide.src) + '"></video>';
      h += '<span class="lb-slide-note">' + esc(slide.label || 'فيديو') + '</span>';
    } else if (slide.type === 'pdf') {
      h += '<embed class="pdf-embed" type="application/pdf" src="' + esc(slide.src) + '#view=FitH&toolbar=1&navpanes=0">';
      h += '<span class="lb-slide-note">' + esc(slide.label || 'ملف PDF') + ' — تقدر تمرّر داخل الملف</span>';
    } else if (slide.type === 'live') {
      h += '<iframe src="' + esc(slide.src) + '" title="' + esc(work.title) + '" loading="lazy" ' +
        'referrerpolicy="no-referrer" allow="fullscreen"' + (LB.device === 'mobile' ? ' class="is-mobile"' : '') + '></iframe>';
      h += '<span class="lb-slide-note">' + esc(slide.label || 'معاينة مباشرة') + ' — المعاينة حيّة من الموقع نفسه</span>';
    } else {
      h += '<img src="' + esc(slide.src) + '" alt="' + esc(work.title + ' — ' + (slide.label || '')) + '"' +
        (slide.fit === 'contain' ? ' class="fit-contain"' : '') + ' decoding="async">';
      if (slide.label) h += '<span class="lb-slide-note">' + esc(slide.label) + '</span>';
    }
    stage.innerHTML = h;

    var frame = $('iframe', stage);
    if (frame) {
      var note = $('.lb-slide-note', stage);
      var loadTimer = 0;
      var loaded = false;
      var clear = function () { if (note && note.parentNode) note.parentNode.removeChild(note); };
      on(frame, 'load', function () {
        loaded = true;
        if (loadTimer) { clearTimeout(loadTimer); loadTimer = 0; }
        setTimeout(clear, 320);
      });
      // لو ما اشتغلت المعاينة خلال مهلة معقولة (الموقع يمنع الإطار أو الاتصال تعطّل) نعرض بديلًا واضحًا
      loadTimer = setTimeout(function () {
        if (loaded) return;
        showLiveFallback(stage, slide, work);
      }, 9000);
      setTimeout(clear, 6000);
    }
  }

  function showLiveFallback(stage, slide, work) {
    if (!stage || !slide) return;
    var url = slide.src || (work && work.live && work.live.url) || TG;
    stage.innerHTML = '<div class="lb-fallback">' + ic('browser') +
      '<div><b>تعذّر عرض المعاينة الحيّة داخل الإطار</b>' +
      'يمكن الموقع يمنع العرض داخل إطار، أو صار تعطّل مؤقت في الاتصال. ما فيه مشكلة، تفتحه مباشرة في تبويب جديد.</div>' +
      '<div class="fb-actions">' +
      '<a class="btn btn-gold btn-sm" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' +
      ic('external') + '<span>افتح الموقع في تبويب</span></a>' +
      '<button type="button" class="btn btn-outline btn-sm" data-live-retry>' +
      ic('refresh') + '<span>إعادة المحاولة</span></button>' +
      '</div></div>';
    var retry = $('[data-live-retry]', stage);
    if (retry) on(retry, 'click', function () { renderStage(); });
  }

  function renderMeta() {
    var work = LB.list[LB.wi];
    var meta = $('#lbMeta');
    if (!meta || !work) return;
    var slide = LB.slides[LB.si] || LB.slides[0];
    var h = '<p>' + esc(work.desc) + '</p>';
    if (work.detail) h += '<p>' + esc(work.detail) + '</p>';
    if (slide.label) h += '<p>' + esc(slide.label) + ' · ' + (LB.si + 1) + ' / ' + LB.slides.length + '</p>';
    if (work.facts && work.facts.length) {
      h += '<div class="lb-facts">';
      work.facts.forEach(function (f) {
        h += '<span><b>' + esc(f.k) + '</b> ' + esc(f.v) + '</span>';
      });
      h += '</div>';
    }
    if (work.swatches && work.swatches.length) {
      h += '<div class="lb-swatches" aria-label="ألوان الهوية">';
      work.swatches.forEach(function (s) {
        h += '<i style="--c:' + esc(s.hex) + '" title="' + esc(s.name) + '"></i>';
      });
      h += '</div>';
    }
    if (work.note) h += '<p class="lb-note">' + ic('info') + ' ' + esc(work.note) + '</p>';
    meta.innerHTML = h;
  }

  function renderThumbs() {
    var box = $('#lbThumbs');
    var work = LB.list[LB.wi];
    if (!box || !work) return;
    if (LB.slides.length < 2) { box.innerHTML = ''; return; }
    var h = '';
    LB.slides.forEach(function (s, i) {
      h += '<button type="button" class="lb-thumb" data-slide="' + i + '" aria-current="' + (i === LB.si) +
        '" aria-label="' + esc(s.label || ('عنصر ' + (i + 1))) + '">' +
        '<img src="' + esc(thumbFor(work, s)) + '" alt="" loading="lazy" decoding="async" class="' +
        (s.type === 'image' && s.fit !== 'contain' ? '' : 'fit-contain') + '">' +
        '<span class="t-kind">' + esc(kindTag(s)) + '</span></button>';
    });
    box.innerHTML = h;
  }

  function renderActions() {
    var box = $('#lbActions');
    var work = LB.list[LB.wi];
    if (!box || !work) return;
    var slide = LB.slides[LB.si] || LB.slides[0];
    var h = '';
    if (slide.type === 'live') {
      h += '<a class="btn btn-outline btn-sm" href="' + esc(slide.src) + '" target="_blank" rel="noopener noreferrer">' +
        ic('external') + '<span>افتح الموقع في تبويب</span></a>';
    }
    if (slide.type === 'pdf') {
      h += '<a class="btn btn-outline btn-sm" href="' + esc(slide.src) + '" target="_blank" rel="noopener noreferrer">' +
        ic('external') + '<span>افتح الملف في تبويب</span></a>';
    }
    if (work.file) {
      h += '<a class="btn btn-outline btn-sm" href="' + esc(work.file.href) + '" download>' +
        ic('download') + '<span>' + esc(work.file.label) + '</span></a>';
    }
    h += '<a class="btn btn-gold btn-sm" href="' + esc(orderUrl('مرحبًا MKH، شفت عمل «' + work.title + '» وودي أطلب شي مشابه.')) +
      '" target="_blank" rel="noopener noreferrer">' + ic('telegram', 'ic-solid') + '<span>اطلب مثل هذا</span></a>';
    box.innerHTML = h;
  }

  function renderAll() {
    var work = LB.list[LB.wi];
    if (!work) return;
    LB.slides = slidesOf(work);
    if (LB.si >= LB.slides.length) LB.si = 0;
    var eb = $('#lbEyebrow');
    var tt = $('#lbTitle');
    if (eb) eb.textContent = work.eyebrow || '';
    if (tt) tt.textContent = work.title;

    var slide = LB.slides[LB.si] || LB.slides[0];
    var dev = $('#lbDevices');
    // toggle the attribute (not inline display) so `.lb-devices[hidden]` controls it
    if (dev) dev.hidden = slide.type !== 'live';
    $$('.lb-device', dev).forEach(function (b) {
      b.setAttribute('aria-pressed', b.getAttribute('data-device') === LB.device ? 'true' : 'false');
    });

    var prev = $('#lbPrev'), next = $('#lbNext');
    var multiWork = LB.list.length > 1;
    var many = LB.slides.length > 1 || multiWork;
    if (prev) prev.disabled = !many;
    if (next) next.disabled = !many;

    renderStage();
    renderMeta();
    renderThumbs();
    renderActions();
  }

  function step(dir) {
    if (!LB.list.length) return;
    if (dir > 0) {
      if (LB.si < LB.slides.length - 1) LB.si++;
      else if (LB.wi < LB.list.length - 1) { LB.wi++; LB.si = 0; }
      else return;
    } else {
      if (LB.si > 0) LB.si--;
      else if (LB.wi > 0) { LB.wi--; LB.si = Math.max(0, slidesOf(LB.list[LB.wi]).length - 1); }
      else return;
    }
    renderAll();
  }

  function openLightbox(work, slideIndex) {
    var box = $('#lightbox');
    if (!box || !work) return;
    var list = galVisible().length ? galVisible() : [{ data: work, el: null, card: null }];
    var wi = 0;
    for (var i = 0; i < list.length; i++) { if (list[i].data === work) { wi = i; break; } }
    LB.list = list.map(function (o) { return o.data; });
    LB.wi = wi;
    LB.si = slideIndex || 0;
    LB.device = 'desktop';
    var active = doc.activeElement;
    LB.last = (active && active !== doc.body && !box.contains(active)) ? active : null;
    LB.open = true;
    box.hidden = false;
    lock('lb', true);
    renderAll();
    afterPaint(function () { box.classList.add('is-open'); });
    setTimeout(function () { var c = $('#lbClose'); if (c) c.focus(); }, 80);
  }

  function closeLightbox() {
    var box = $('#lightbox');
    if (!box || !LB.open) return;
    LB.open = false;
    box.classList.remove('is-open');
    lock('lb', false);
    setTimeout(function () {
      if (LB.open) return;
      box.hidden = true;
      var stage = $('#lbStage');
      if (stage) stage.innerHTML = '';
      var tb = $('#lbThumbs'); if (tb) tb.innerHTML = '';
      var ac = $('#lbActions'); if (ac) ac.innerHTML = '';
    }, 420);
    if (LB.last && LB.last.focus) { try { LB.last.focus(); } catch (e) { } }
  }

  function initLightbox() {
    var box = $('#lightbox');
    if (!box) return;
    on($('#lbClose'), 'click', closeLightbox);
    on($('#lbBackdrop'), 'click', closeLightbox);
    on($('#lbPrev'), 'click', function () { step(-1); });
    on($('#lbNext'), 'click', function () { step(1); });

    on($('#lbThumbs'), 'click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('[data-slide]') : null;
      if (!b) return;
      LB.si = parseInt(b.getAttribute('data-slide'), 10) || 0;
      renderAll();
    });

    var dev = $('#lbDevices');
    on(dev, 'click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('.lb-device') : null;
      if (!b) return;
      LB.device = b.getAttribute('data-device') || 'desktop';
      renderAll();
    });

    on(doc, 'keydown', function (e) {
      if (!LB.open) return;
      if (e.key === 'Escape') { e.preventDefault(); closeLightbox(); return; }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); return; }
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); return; }
      if (e.key === 'Tab') {
        var shell = $('.lb-shell', box);
        if (!shell) return;
        var f = $$('a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])', shell)
          .filter(function (el) { return el.offsetParent !== null; });
        if (!f.length) return;
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });

    var sx = 0, sy = 0, tracking = false;
    var stage = $('#lbStage');
    on(stage, 'touchstart', function (e) {
      if (e.touches.length !== 1) return;
      sx = e.touches[0].clientX; sy = e.touches[0].clientY; tracking = true;
    }, { passive: true });
    on(stage, 'touchend', function (e) {
      if (!tracking) return;
      tracking = false;
      var t = e.changedTouches[0];
      var dx = t.clientX - sx, dy = t.clientY - sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) step(dx < 0 ? 1 : -1);
    }, { passive: true });
  }

  /* ------------------------------------------------------- مشاريع المواقع */
  function renderSites() {
    var wrap = $('#siteCards');
    if (!wrap) return;
    var sites = (window.MKH_WORKS || []).filter(function (w) {
      return (w.cats || []).indexOf('websites') >= 0 && w.live;
    });
    var h = '';
    sites.forEach(function (w, i) {
      var url = w.live.url;
      var host = w.live.label || url.replace(/^https?:\/\//, '').replace(/\/$/, '');
      h += '<article class="site-card reveal" data-reveal data-delay="' + (i * 90) + '">' +
        '<div class="site-visual">' +
        '<div class="browser-frame" data-tilt>' +
        '<div class="bf-bar"><span class="bf-dots" aria-hidden="true"><i></i><i></i><i></i></span>' +
        '<span class="bf-url">' + esc(host) + '</span>' +
        '<span class="bf-live">حيّ</span></div>' +
        '<div class="bf-screen"><img src="' + esc(w.coverFull || w.cover) + '" alt="' + esc(w.title) +
        '" loading="lazy" decoding="async">' +
        (w.coverTag ? '<span class="bf-tagline">' + esc(w.coverTag) + '</span>' : '') +
        '</div></div>' +
        '<div class="phone-frame" aria-hidden="true"><img src="' + esc(w.coverFull || w.cover) +
        '" alt="" loading="lazy" decoding="async"></div>' +
        '</div>' +
        '<div class="site-info">' +
        '<h3>' + esc(w.title) + '</h3>' +
        '<p class="site-desc">' + esc(w.desc) + '</p>' +
        '<p class="site-detail">' + esc(w.detail || '') + '</p>' +
        (w.facts && w.facts.length ? '<ul class="site-facts">' + w.facts.map(function (f) {
          return '<li><b>' + esc(f.k) + '</b><span>' + esc(f.v) + '</span></li>';
        }).join('') + '</ul>' : '') +
        '<div class="site-actions">' +
        '<a class="btn btn-gold btn-sm" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer" data-magnetic>' +
        ic('external') + '<span>استكشف الموقع</span></a>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-preview="' + i + '">' +
        ic('browser') + '<span>معاينة المشروع</span></button>' +
        '</div></div></article>';
    });
    wrap.innerHTML = h;

    wrap.addEventListener('click', function (e) {
      var b = e.target && e.target.closest ? e.target.closest('[data-preview]') : null;
      if (!b) return;
      var w = sites[parseInt(b.getAttribute('data-preview'), 10)];
      if (!w) return;
      var liveIdx = 0;
      (w.gallery || []).forEach(function (g, gi) { if (g.type === 'live') liveIdx = gi; });
      openLightbox(w, liveIdx);
    });
  }

  /* ------------------------------------------------------------ ليش MKH */
  function renderWhy() {
    var grid = $('#whyGrid');
    if (!grid) return;
    var h = '';
    (window.MKH_WHY || []).forEach(function (w, i) {
      var n = (i + 1) < 10 ? '0' + (i + 1) :
        (i + 1) < 20 ? (i + 1) : (i + 1);
      h += '<article class="why reveal" data-reveal data-delay="' + (i * 70) + '">' +
        '<span class="why-n" aria-hidden="true">' + n + '</span>' +
        '<span class="why-icon">' + ic(w.icon) + '</span>' +
        '<h3>' + esc(w.title) + '</h3><p>' + esc(w.text) + '</p></article>';
    });
    grid.innerHTML = h;
  }

  /* ---------------------------------------------------------- طريقة الطلب */
  function renderSteps() {
    var list = $('#stepsList');
    if (!list) return;
    var h = '';
    (window.MKH_STEPS || []).forEach(function (s, i) {
      h += '<li class="step reveal" data-reveal data-delay="' + (i * 90) + '">' +
        '<span class="step-n" aria-hidden="true">' + esc(s.n) + '</span>' +
        '<div><h3>' + esc(s.title) + '</h3><p>' + esc(s.text) + '</p></div></li>';
    });
    list.innerHTML = h;
  }

  /* ------------------------------------------------------------------ التشغيل */
  function boot() {
    initBoot();
    renderServices();
    initPlanner();
    renderFilters();
    renderWorks();
    renderSites();
    renderWhy();
    renderSteps();
    initGallery();
    initLightbox();
    initReveal();
    initTheme();
    initHeader();
    initRail();
    initSpy();
    initCursor();
    initMotion();
    initMarquee();
    initYear();
  }

  try {
    if (doc.readyState === 'loading') on(doc, 'DOMContentLoaded', boot);
    else boot();
  } catch (err) {
    lock('boot', false);
    var b = $('#boot');
    if (b) b.classList.add('is-done');
    if (window.console && console.error) console.error('[MKH] خطأ في التشغيل:', err);
  }


})();
