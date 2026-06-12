(function () {
  'use strict';

  /* ── Partículas ──────────────────────────────────────── */

  const PARTICLE_COUNT = 28;
  const particles = [];

  function initParticles(W, H) {
    particles.length = 0;
    const colors = [
      'rgba(80,80,204,',
      'rgba(46,198,166,',
      'rgba(123,94,167,',
      'rgba(75,107,255,',
    ];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x:      Math.random() * W,
        y:      Math.random() * H,
        r:      1.5 + Math.random() * 2.5,
        vx:     (Math.random() - 0.5) * 0.35,
        vy:     -0.15 - Math.random() * 0.3,
        alpha:  0.3 + Math.random() * 0.5,
        color:  colors[Math.floor(Math.random() * colors.length)],
        phase:  Math.random() * Math.PI * 2,
      });
    }
  }

  function updateParticles(W, H, t) {
    particles.forEach(function (p) {
      p.x += p.vx + Math.sin(t * 0.7 + p.phase) * 0.18;
      p.y += p.vy;
      if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
      if (p.x < -10) { p.x = W + 10; }
      if (p.x > W + 10) { p.x = -10; }
    });
  }

  function drawParticles(ctx, t) {
    particles.forEach(function (p) {
      const pulse = p.alpha * (0.7 + 0.3 * Math.sin(t * 1.8 + p.phase));
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color + pulse.toFixed(2) + ')';
      ctx.fill();
    });
  }

  /* ── Hero canvas ──────────────────────────────────────── */

  let heroW = 0, heroH = 0;

  function drawHero(canvas) {
    const W = canvas.offsetWidth || 880;
    const H = canvas.offsetHeight || 340;

    if (canvas.width !== Math.round(W * devicePixelRatio)) {
      canvas.width  = Math.round(W * devicePixelRatio);
      canvas.height = Math.round(H * devicePixelRatio);
      heroW = W; heroH = H;
      initParticles(W, H);
    }

    const ctx = canvas.getContext('2d');
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, '#f0f2ff');
    bg.addColorStop(1, '#e8f8f4');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const t = Date.now() / 1000;

    const waves = [
      { amp: 38,  freq: 0.018, phase: 0.0, color: 'rgba(80,80,204,0.22)',   lw: 2.5, yOff: 0.35 },
      { amp: 28,  freq: 0.024, phase: 1.2, color: 'rgba(46,198,166,0.28)',  lw: 2.0, yOff: 0.48 },
      { amp: 50,  freq: 0.012, phase: 0.5, color: 'rgba(123,94,167,0.18)',  lw: 3.0, yOff: 0.55 },
      { amp: 20,  freq: 0.032, phase: 2.1, color: 'rgba(75,107,255,0.20)',  lw: 1.5, yOff: 0.65 },
      { amp: 42,  freq: 0.009, phase: 0.8, color: 'rgba(46,198,166,0.15)',  lw: 2.0, yOff: 0.28 },
      { amp: 16,  freq: 0.045, phase: 3.0, color: 'rgba(216,90,48,0.15)',   lw: 1.5, yOff: 0.72 },
    ];

    waves.forEach(function (w) {
      ctx.beginPath();
      ctx.strokeStyle = w.color;
      ctx.lineWidth   = w.lw;
      ctx.lineCap     = 'round';
      const yBase = H * w.yOff;
      for (let x = 0; x <= W; x += 2) {
        const y = yBase + Math.sin(x * w.freq + w.phase + t * 0.9) * w.amp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });

    updateParticles(W, H, t);
    drawParticles(ctx, t);

    const vTop = ctx.createLinearGradient(0, 0, 0, H * 0.35);
    vTop.addColorStop(0, 'rgba(240,242,255,0.88)');
    vTop.addColorStop(1, 'rgba(240,242,255,0)');
    ctx.fillStyle = vTop;
    ctx.fillRect(0, 0, W, H * 0.35);

    const vBot = ctx.createLinearGradient(0, H * 0.65, 0, H);
    vBot.addColorStop(0, 'rgba(232,248,244,0)');
    vBot.addColorStop(1, 'rgba(232,248,244,0.85)');
    ctx.fillStyle = vBot;
    ctx.fillRect(0, H * 0.65, W, H * 0.35);
  }

  /* ── Mini canvas (cards) ─────────────────────────────── */

  function drawMini(canvas) {
    const parent = canvas.parentElement;
    const W = parent ? parent.offsetWidth  || 240 : 240;
    const H = parent ? parent.offsetHeight || 90  : 90;

    if (canvas.width !== Math.round(W * devicePixelRatio)) {
      canvas.width  = Math.round(W * devicePixelRatio);
      canvas.height = Math.round(H * devicePixelRatio);
    }

    const ctx = canvas.getContext('2d');
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    ctx.clearRect(0, 0, W, H);

    const c1 = canvas.dataset.color1;
    const c2 = canvas.dataset.color2;
    const t  = Date.now() / 1000;

    const miniWaves = [
      { amp: 14, freq: 0.040, phase: 0.0, color: c1 + 'aa', lw: 2.0, yOff: 0.40 },
      { amp: 10, freq: 0.060, phase: 1.5, color: c2 + '88', lw: 1.5, yOff: 0.60 },
      { amp: 18, freq: 0.025, phase: 0.7, color: c1 + '55', lw: 3.0, yOff: 0.50 },
    ];

    miniWaves.forEach(function (w) {
      ctx.beginPath();
      ctx.strokeStyle = w.color;
      ctx.lineWidth   = w.lw;
      const yBase = H * w.yOff;
      for (let x = 0; x <= W; x += 2) {
        const y = yBase + Math.sin(x * w.freq + w.phase + t * 1.1) * w.amp;
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    });
  }

  /* ── Shimmer en cards ────────────────────────────────── */

  function initShimmer() {
    const style = document.createElement('style');
    style.textContent = `
      .card { isolation: isolate; }
      .card::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(
          110deg,
          transparent 30%,
          rgba(255,255,255,0.55) 50%,
          transparent 70%
        );
        background-size: 220% 100%;
        background-position: 200% 0;
        opacity: 0;
        transition: opacity 0.25s;
        pointer-events: none;
        z-index: 5;
      }
      .card:hover::after {
        opacity: 1;
        animation: shimmerSlide 0.6s ease forwards;
      }
      @keyframes shimmerSlide {
        from { background-position: 200% 0; }
        to   { background-position: -50% 0; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ── Contador animado de stats ───────────────────────── */

  const STAT_TARGETS = [
    { el: null, target: 3,    decimals: 0, suffix: '' },
    { el: null, target: null, decimals: 0, suffix: '' }, // ∞ — solo fade
    { el: null, target: null, decimals: 0, suffix: '' }, // λ — solo fade
    { el: null, target: null, decimals: 0, suffix: '' }, // c — solo fade
  ];

  function animateStats() {
    const nums = document.querySelectorAll('.stat-num');
    if (!nums.length) return;

    nums.forEach(function (el, i) {
      const cfg = STAT_TARGETS[i];
      if (!cfg) return;
      cfg.el = el;

      if (cfg.target === null) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(10px)';
        el.style.transition = 'opacity 0.6s ease ' + (0.1 + i * 0.12) + 's, transform 0.6s ease ' + (0.1 + i * 0.12) + 's';
        requestAnimationFrame(function () {
          el.style.opacity = '1';
          el.style.transform = 'translateY(0)';
        });
        return;
      }

      const duration = 1200;
      const delay    = 150 + i * 120;
      const start    = performance.now() + delay;
      const from     = 0;
      const to       = cfg.target;

      el.textContent = '0';
      el.style.opacity = '0';

      setTimeout(function () {
        el.style.transition = 'opacity 0.3s ease';
        el.style.opacity = '1';

        function tick(now) {
          const elapsed = now - start;
          if (elapsed < 0) { requestAnimationFrame(tick); return; }
          const progress = Math.min(elapsed / duration, 1);
          const ease = 1 - Math.pow(1 - progress, 3);
          const val  = from + (to - from) * ease;
          el.textContent = val.toFixed(cfg.decimals) + cfg.suffix;
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = to.toFixed(cfg.decimals) + cfg.suffix;
        }
        requestAnimationFrame(tick);
      }, delay);
    });
  }

  /* ── IntersectionObserver para stats ─────────────────── */

  function observeStats() {
    const bar = document.querySelector('.stats-bar');
    if (!bar) return;
    const obs = new IntersectionObserver(function (entries) {
      if (entries[0].isIntersecting) {
        animateStats();
        obs.disconnect();
      }
    }, { threshold: 0.5 });
    obs.observe(bar);
  }

  /* ── Loop principal ──────────────────────────────────── */

  const heroCvs = document.getElementById('heroCvs');
  const miniCvs = document.querySelectorAll('.card-mini-cvs');

  function loop() {
    drawHero(heroCvs);
    miniCvs.forEach(drawMini);
    requestAnimationFrame(loop);
  }

  initShimmer();
  observeStats();
  setTimeout(loop, 80);

})();