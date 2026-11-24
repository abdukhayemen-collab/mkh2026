/* ═══════════════════════════════════════════════════════════════
   كيف تخدع صورة واحدة ملايين العقول — محرك العرض
   ═══════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ── تنبيه ───────────────────────────────────────────────── */
  const toastEl = $('#toast');
  let toastTimer = null;
  function toast(msg, ms = 3200) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-on'), ms);
  }

  /* ── محرك الشرائح ────────────────────────────────────────── */
  const deck = $('#deck');
  const slides = $$('.slide');
  const total = slides.length;
  let current = 0;
  let locked = false;

  const curNum = $('#curNum');
  const prevBtn = $('#prevBtn');
  const nextBtn = $('#nextBtn');
  const progressFill = $('#progressFill');
  const rail = $('#rail');

  // بناء السكة
  if (rail) {
    slides.forEach((s, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'rail__dot';
      b.dataset.label = s.dataset.title || `شريحة ${i + 1}`;
      b.setAttribute('aria-label', `الشريحة ${i + 1}: ${s.dataset.title || ''}`);
      b.addEventListener('click', () => go(i));
      rail.appendChild(b);
    });
  }
  const railDots = $$('.rail__dot');

  function emit(name, extra = {}) {
    document.dispatchEvent(new CustomEvent(`deck:${name}`, { detail: { index: current, slide: slides[current], ...extra } }));
  }

  function go(n, force = false) {
    n = clamp(n, 0, total - 1);
    if (n === current && !force) return;
    const old = slides[current];
    if (old && old !== slides[n]) emit('leave', { from: current, to: n });
    current = n;
    slides.forEach((s, i) => {
      s.classList.toggle('is-active', i === current);
      s.classList.toggle('is-prev', i < current);
      s.classList.toggle('is-next', i > current);
      s.setAttribute('aria-hidden', i === current ? 'false' : 'true');
      if (i !== current) s.scrollTop = 0;
    });
    document.body.classList.toggle('on-light', slides[current].dataset.theme === 'light');
    if (curNum) curNum.textContent = String(current + 1).padStart(2, '0');
    if (progressFill) progressFill.style.width = `${((current + 1) / total) * 100}%`;
    railDots.forEach((d, i) => d.classList.toggle('is-active', i === current));
    if (prevBtn) prevBtn.disabled = current === 0;
    if (nextBtn) nextBtn.disabled = current === total - 1;
    history.replaceState(null, '', `#slide-${current + 1}`);
    emit('enter', { from: -1 });
    locked = true;
    setTimeout(() => { locked = false; }, reduced ? 120 : 900);
  }
  const next = () => go(current + 1);
  const prev = () => go(current - 1);
  window.deck = { go, next, prev, get index() { return current; }, total };

  if (prevBtn) prevBtn.addEventListener('click', prev);
  if (nextBtn) nextBtn.addEventListener('click', next);
  $$('[data-next]').forEach(b => b.addEventListener('click', next));

  /* ── لوحة المفاتيح ───────────────────────────────────────── */
  const NEXT_KEYS = ['ArrowLeft', 'ArrowDown', 'PageDown', ' ', 'Spacebar', 'Enter'];
  const PREV_KEYS = ['ArrowRight', 'ArrowUp', 'PageUp'];
  document.addEventListener('keydown', (e) => {
    const t = e.target;
    if (t && t.closest('input,textarea,select,[contenteditable]')) return;
    if (!helpEl.hidden) {
      if (e.key === 'Escape') closeHelp();
      return;
    }
    if (NEXT_KEYS.includes(e.key)) { e.preventDefault(); next(); return; }
    if (PREV_KEYS.includes(e.key)) { e.preventDefault(); prev(); return; }
    if (e.key === 'Home') { e.preventDefault(); go(0); return; }
    if (e.key === 'End')  { e.preventDefault(); go(total - 1); return; }
    if (e.key === 'f' || e.key === 'F') { e.preventDefault(); toggleFS(); return; }
    if (e.key === '?' || (e.key === '/' && e.shiftKey)) { e.preventDefault(); openHelp(); }
  });

  /* ── عجلة الفأرة واللمس ──────────────────────────────────── */
  let wheelAcc = 0;
  window.addEventListener('wheel', (e) => {
    if (window.innerWidth <= 1020) return;
    if (locked) return;
    if (e.ctrlKey) return;
    wheelAcc += e.deltaY;
    if (Math.abs(wheelAcc) < 60) return;
    const dir = wheelAcc > 0 ? 1 : -1;
    wheelAcc = 0;
    dir > 0 ? next() : prev();
  }, { passive: true });

  let tx = 0, ty = 0, tt = 0;
  window.addEventListener('touchstart', (e) => {
    const p = e.changedTouches[0]; tx = p.clientX; ty = p.clientY; tt = Date.now();
  }, { passive: true });
  window.addEventListener('touchend', (e) => {
    const p = e.changedTouches[0];
    const dx = p.clientX - tx, dy = p.clientY - ty;
    if (Date.now() - tt > 700) return;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      dx < 0 ? next() : prev();
    }
  }, { passive: true });

  /* ── ملء الشاشة ──────────────────────────────────────────── */
  const fsBtn = $('#fsBtn');
  function toggleFS() {
    if (!document.fullscreenElement) {
      (document.documentElement.requestFullscreen || (() => {})).call(document.documentElement).catch(() => {});
    } else {
      document.exitFullscreen && document.exitFullscreen().catch(() => {});
    }
  }
  if (fsBtn) fsBtn.addEventListener('click', toggleFS);
  document.addEventListener('fullscreenchange', () => {
    if (fsBtn) fsBtn.setAttribute('aria-pressed', document.fullscreenElement ? 'true' : 'false');
  });

  /* ── المساعدة ────────────────────────────────────────────── */
  const helpEl = $('#help');
  const helpBtn = $('#helpBtn');
  const helpClose = $('#helpClose');
  function openHelp() { if (helpEl) { helpEl.hidden = false; helpClose && helpClose.focus(); } }
  function closeHelp() { if (helpEl) { helpEl.hidden = true; helpBtn && helpBtn.focus(); } }
  if (helpBtn) helpBtn.addEventListener('click', openHelp);
  if (helpClose) helpClose.addEventListener('click', closeHelp);
  if (helpEl) helpEl.addEventListener('click', (e) => { if (e.target === helpEl) closeHelp(); });

  /* ── المؤشر المخصص ───────────────────────────────────────── */
  const cursor = $('#cursor');
  const cursorDot = $('#cursorDot');
  if (cursor && cursorDot && !isTouch) {
    document.body.classList.add('has-cursor');
    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let cx = mx, cy = my;
    window.addEventListener('pointermove', (e) => {
      mx = e.clientX; my = e.clientY;
      cursorDot.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
    }, { passive: true });
    (function raf() {
      cx += (mx - cx) * 0.16;
      cy += (my - cy) * 0.16;
      cursor.style.transform = `translate3d(${cx}px,${cy}px,0) translate(-50%,-50%)`;
      requestAnimationFrame(raf);
    })();
    document.addEventListener('pointerover', (e) => {
      const t = e.target;
      cursor.classList.toggle('is-link', !!t.closest('a,button,[data-cursor]') && t.closest('[data-cursor="drag"]') === null);
      cursor.classList.toggle('is-drag', !!t.closest('[data-cursor="drag"]'));
    });
    document.addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    document.addEventListener('pointerup', () => cursor.classList.remove('is-down'));
    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; cursorDot.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; cursorDot.style.opacity = '1'; });
  }

  /* ── الغبار الذهبي ───────────────────────────────────────── */
  const canvas = $('#dust');
  if (canvas && !reduced) {
    const ctx = canvas.getContext('2d');
    let W = 0, H = 0, dpr = 1, motes = [], bursts = [];
    let mx = 0.5, my = 0.5;
    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = W < 700 ? 34 : 68;
      motes = Array.from({ length: count }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        r: Math.random() * 1.7 + 0.4,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(Math.random() * 0.16 + 0.03),
        a: Math.random() * 0.5 + 0.1,
        p: Math.random() * Math.PI * 2
      }));
    }
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', (e) => { mx = e.clientX / W; my = e.clientY / H; }, { passive: true });
    resize();

    window.burst = (x, y, n = 46) => {
      for (let i = 0; i < n; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = Math.random() * 6 + 1.5;
        bursts.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 1, r: Math.random() * 2.4 + 0.8, life: 1 });
      }
    };

    const light = () => document.body.classList.contains('on-light');
    (function loop() {
      ctx.clearRect(0, 0, W, H);
      const ox = (mx - 0.5) * 22, oy = (my - 0.5) * 22;
      ctx.globalCompositeOperation = light() ? 'source-over' : 'lighter';
      for (const m of motes) {
        m.p += 0.01;
        m.x += m.vx + Math.sin(m.p) * 0.06;
        m.y += m.vy;
        if (m.y < -10) { m.y = H + 10; m.x = Math.random() * W; }
        if (m.x < -10) m.x = W + 10;
        if (m.x > W + 10) m.x = -10;
        const col = light() ? `rgba(122,79,20,${m.a * 0.5})` : `rgba(216,178,106,${m.a})`;
        ctx.beginPath();
        ctx.fillStyle = col;
        ctx.arc(m.x + ox * m.r, m.y + oy * m.r, m.r, 0, Math.PI * 2);
        ctx.fill();
      }
      for (let i = bursts.length - 1; i >= 0; i--) {
        const b = bursts[i];
        b.x += b.vx; b.y += b.vy; b.vy += 0.12; b.vx *= 0.99; b.life -= 0.016;
        if (b.life <= 0) { bursts.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.fillStyle = `rgba(243,212,147,${b.life})`;
        ctx.arc(b.x, b.y, b.r * b.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(loop);
    })();
  }

  /* ── الغلاف: العين تتبع المؤشر ───────────────────────────── */
  const hero = $('.slide--hero');
  const medallion = $('#eyeMedallion');
  if (hero && medallion && !isTouch) {
    let raf = null;
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      if (raf) return;
      raf = requestAnimationFrame(() => {
        hero.style.setProperty('--mx', nx.toFixed(3));
        hero.style.setProperty('--my', ny.toFixed(3));
        raf = null;
      });
    });
    const blink = () => {
      medallion.classList.add('blink');
      setTimeout(() => medallion.classList.remove('blink'), 420);
    };
    document.addEventListener('deck:enter', (e) => {
      if (e.detail.index === 0) setTimeout(blink, reduced ? 100 : 760);
    });
    setTimeout(blink, 1400);
  }

  /* ── التشغيل الأولي ─────────────────────────────────────── */
  function boot() {
    const m = location.hash.match(/slide-(\d+)/);
    const start = m ? clamp(parseInt(m[1], 10) - 1, 0, total - 1) : 0;
    go(start, true);
    if (!isTouch) setTimeout(() => toast('استخدم ← → للتنقل · اضغط ؟ للاختصارات', 4200), 2200);
    setTimeout(() => {
      ['field.jpg','crowd.jpg','city.jpg','stars.jpg','deepfake.jpg','ai-face.jpg','mars-1976.jpg','mars-hirise-raw.jpg','snakes.png','duck-rabbit.png']
        .forEach(f => { const i = new Image(); i.src = `assets/img/${f}`; });
    }, 1800);
  }
  boot();

  /* ── 02 · الالتباس ───────────────────────────────────────── */
  (() => {
    const card = $('.duck-card');
    const reveal = $('#duckReveal');
    if (!card) return;
    const texts = {
      duck: 'رأيت بطة. الآن جرّب أن ترى الأرنب… قد لا تستطيع بسهولة. الدماغ يحمي تفسيره الأول.',
      rabbit: 'رأيت أرنبًا. الآن جرّب أن ترى البطة… هل انقلب المعنى؟ هذا هو الالتباس: نفس البيانات، هويّتان.',
      none: 'اختر تفسيرًا… ثم جرّب أن ترى الآخر. هل استطعت؟ هذا هو الجهد الذي يبذله عقلك كل يوم ليختار لك عالمًا واحدًا.'
    };
    function choose(v) {
      card.dataset.choice = v;
      $$('.duck-card').forEach(() => {});
      $$('.chip[data-choice]').forEach(c => c.setAttribute('aria-pressed', c.dataset.choice === v ? 'true' : 'false'));
      if (reveal) reveal.textContent = texts[v] || texts.none;
    }
    $$('.chip[data-choice]').forEach(b => b.addEventListener('click', () => choose(b.dataset.choice)));
    card.addEventListener('click', () => {
      const cur = card.dataset.choice;
      choose(cur === 'duck' ? 'rabbit' : 'duck');
    });
  })();

  /* ── 03 · الفراغ ─────────────────────────────────────────── */
  (() => {
    const btn = $('#kanizsaToggle');
    const inner = $('#kanizsaCard');
    const note = $('#kanizsaNote');
    if (!btn || !inner) return;
    btn.addEventListener('click', () => {
      const on = inner.classList.toggle('show-edges');
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      const label = btn.querySelector('span');
      if (label) label.textContent = on ? 'أخفِ الحواف' : 'أظهر ما رسمه عقلك';
      if (note) note.textContent = on ? 'هذه حواف أضافها عقلك.' : 'لكنك تراها.';
    });
  })();

  /* ── 04 · اللون ──────────────────────────────────────────── */
  (() => {
    const board = $('#checkerboard');
    const grid = $('#checkerGrid');
    if (!board || !grid) return;
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const s = document.createElement('span');
        if ((r + c) % 2 === 1) s.className = 'is-light';
        grid.appendChild(s);
      }
    }
    const range = $('#shadowRange');
    const out = $('#shadowOut');
    const bHex = $('#bHex');
    const bHexSide = $('#bHexSide');
    const badge = $('#matchBadge');
    const proofBtn = $('#checkerProof');
    const BASE_LIGHT = 188; // #BC
    const A_HEX = '#7A7A7A';

    function update() {
      const v = Math.round(parseFloat(range.value));
      const bVal = Math.round(BASE_LIGHT * (1 - v / 100));
      const hex = '#' + [bVal, bVal, bVal].map(x => x.toString(16).padStart(2, '0').toUpperCase()).join('');
      board.style.setProperty('--shadow', (v / 100).toFixed(2));
      if (out) out.textContent = v + '%';
      if (bHex) bHex.textContent = hex;
      if (bHexSide) bHexSide.textContent = hex;
      const match = Math.abs(v - 35) <= 1;
      if (badge) badge.classList.toggle('is-match', match);
      const r = range.value;
      range.style.setProperty('--fill', r + '%');
    }
    range && range.addEventListener('input', update);
    proofBtn && proofBtn.addEventListener('click', () => {
      const on = board.classList.toggle('is-proof');
      proofBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
      const label = proofBtn.querySelector('span');
      if (label) label.textContent = on ? 'أخفِ الدليل' : 'اكشف الخدعة';
      if (on) {
        if (range) { range.value = 35; }
        update();
        toast('A و B الآن: ' + A_HEX + ' بالضبط.', 3600);
      }
    });
    update();
  })();

  /* ── 05 · الحركة ─────────────────────────────────────────── */
  (() => {
    const stage = $('.snake-stage');
    const fix = $('#fixation');
    const count = $('#snakeCount');
    const verdict = $('#snakeVerdict');
    if (!fix || !stage) return;
    let timer = null, left = 10, running = false;

    function reset() {
      clearInterval(timer); timer = null; running = false; left = 10;
      fix.classList.remove('is-running');
      if (count) count.textContent = '10';
      $$('.snake-actions .chip').forEach(c => c.classList.remove('is-chosen'));
      if (verdict) verdict.textContent = 'جاهز؟ اضغط النقطة وابدأ التثبيت.';
    }
    function start() {
      if (running) return;
      running = true; left = 10;
      fix.classList.add('is-running');
      if (count) count.textContent = '10';
      if (verdict) verdict.textContent = 'ثبّت نظرك… لا تتبع الشكل.';
      timer = setInterval(() => {
        left -= 1;
        if (count) count.textContent = String(Math.max(left, 0));
        if (left <= 0) {
          clearInterval(timer); timer = null; running = false;
          fix.classList.remove('is-running');
          if (verdict) verdict.textContent = 'انتهى الوقت. هل خفّ الدوران؟';
          toast('الصورة لم تتحرك ولو بكسلاً واحد.', 4200);
        }
      }, 1000);
    }
    fix.addEventListener('click', start);
    $$('.snake-actions .chip').forEach(btn => btn.addEventListener('click', () => {
      $$('.snake-actions .chip').forEach(c => c.classList.remove('is-chosen'));
      btn.classList.add('is-chosen');
      if (!verdict) return;
      verdict.textContent = btn.dataset.snake === 'stopped'
        ? 'إذن الدماغ توقف عن ملء الحركة… والعين هي التي كانت تدور.'
        : 'طبيعي. دماغك يترجم التغيّر إلى حركة. الصورة ساكنة تمامًا.';
    }));
    document.addEventListener('deck:leave', () => reset());
  })();

  /* ── 06 · الوجه ──────────────────────────────────────────── */
  (() => {
    const card = $('#marsCard');
    const btn = $('#marsFlip');
    const label = $('#marsFlipLabel');
    const caption = $('#marsCaption');
    if (!card) return;
    function flip() {
      const on = card.classList.toggle('is-flipped');
      if (btn) btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      if (label) label.textContent = on ? 'ارجع إلى 1976' : 'اقلب الصورة';
      if (caption) caption.textContent = on
        ? 'صورة أوضح: جبل، ظلّ، وحفرة. لا وجه.'
        : 'اسحب أو اضغط لقلب الصورة.';
    }
    btn && btn.addEventListener('click', (e) => { e.stopPropagation(); flip(); });
    card.addEventListener('click', flip);
    document.addEventListener('deck:leave', () => {
      card.classList.remove('is-flipped');
      if (label) label.textContent = 'اقلب الصورة';
      if (caption) caption.textContent = 'اسحب أو اضغط لقلب الصورة.';
    });
  })();

  /* MORE_JS */
})();
