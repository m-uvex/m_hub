/* ============================================================
   MUVEX.OS boot, background field, navigation
   ============================================================ */

(function () {
  "use strict";

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const WORLDS = {
    studio: { index: "01", name: "STUDIO" },
    tooling: { index: "02", name: "TOOLING" },
    potato: { index: "03", name: "POTATO" },
    log: { index: "04", name: "LOG" },
    signal: { index: "05", name: "SIGNAL" }
  };

  const body = document.body;
  const screens = Array.from(document.querySelectorAll(".screen"));
  const menuItems = Array.from(document.querySelectorAll(".menu__item"));
  const pathLabel = document.querySelector("[data-path]");
  const backBtn = document.querySelector("[data-back]");
  const brandBtn = document.querySelector("[data-brand]");
  const veil = document.querySelector("[data-veil]");
  const veilIndex = document.querySelector("[data-veil-index]");
  const veilName = document.querySelector("[data-veil-name]");
  const boot = document.querySelector("[data-boot]");
  const bootLog = document.querySelector("[data-boot-log]");
  const clockEl = document.querySelector("[data-clock]");

  let current = "menu";
  let transitioning = false;
  let booted = false;

  /* ---------------- clock ---------------- */

  const clockFormat = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false
  });

  function tickClock() {
    if (clockEl) clockEl.textContent = clockFormat.format(new Date());
  }

  tickClock();
  setInterval(tickClock, 1000);

  /* ---------------- screen switching ---------------- */

  function activate(id) {
    screens.forEach(function (screen) {
      const on = screen.id === id;
      if (on) {
        screen.hidden = false;
        void screen.offsetWidth;
        screen.classList.add("is-active");
        const scroller = screen.querySelector(".world__scroll");
        if (scroller) scroller.scrollTop = 0;
      } else {
        screen.classList.remove("is-active");
        screen.hidden = true;
      }
    });
  }

  function transitionTo(id, done) {
    if (transitioning || id === current) return;
    transitioning = true;

    const isWorld = id !== "menu";
    const meta = isWorld ? WORLDS[id] : null;

    if (veil && meta) {
      veilIndex.textContent = meta.index;
      veilName.textContent = meta.name;
    }

    if (veil) veil.classList.add("is-on");

    const wait = reduceMotion ? 40 : 620;

    window.setTimeout(function () {
      activate(id);
      current = id;

      if (isWorld) {
        document.documentElement.setAttribute("data-world", id);
        if (pathLabel) pathLabel.textContent = "~/" + id;
        if (backBtn) backBtn.hidden = false;
        history.replaceState(null, "", "#" + id);
        if (backBtn) backBtn.focus();
      } else {
        document.documentElement.removeAttribute("data-world");
        if (pathLabel) pathLabel.textContent = "~/index";
        if (backBtn) backBtn.hidden = true;
        history.replaceState(null, "", location.pathname + location.search);
      }

      if (veil) veil.classList.remove("is-on");

      window.setTimeout(function () {
        transitioning = false;
        if (typeof done === "function") done();
      }, reduceMotion ? 20 : 380);
    }, wait);
  }

  function openWorld(id) {
    if (!WORLDS[id]) return;
    transitionTo(id);
  }

  function closeWorld() {
    transitionTo("menu");
  }

  /* ---------------- menu interaction ---------------- */

  menuItems.forEach(function (item) {
    item.addEventListener("click", function (event) {
      event.preventDefault();
      openWorld(item.getAttribute("data-world"));
    });
  });

  if (backBtn) backBtn.addEventListener("click", closeWorld);

  if (brandBtn) {
    brandBtn.style.cursor = "pointer";
    brandBtn.addEventListener("click", function () {
      if (current !== "menu") closeWorld();
    });
  }

  document.addEventListener("keydown", function (event) {
    const key = event.key;
    const inMenu = current === "menu";

    if (key === "Escape") {
      if (!inMenu) closeWorld();
      return;
    }

    if (inMenu && (key === "ArrowDown" || key === "ArrowUp" || key === "j" || key === "k")) {
      event.preventDefault();
      const active = document.activeElement;
      let i = menuItems.indexOf(active);
      if (i === -1) i = 0;
      const dir = key === "ArrowDown" || key === "j" ? 1 : -1;
      const next = (i + dir + menuItems.length) % menuItems.length;
      menuItems[next].focus();
    }
  });

  window.addEventListener("hashchange", function () {
    const id = location.hash.replace("#", "");
    if (WORLDS[id]) openWorld(id);
    else if (id === "" && current !== "menu") closeWorld();
  });

  /* ---------------- background field ---------------- */

  function initField() {
    const canvas = document.getElementById("field");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let w = 0;
    let h = 0;
    let dpr = 1;
    let particles = [];
    let rings = [];
    let travelers = [];

    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
    }

    function build() {
      const count = Math.round(Math.min(w, h) / 14);
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: 0.25 + Math.random() * 0.75,
          r: Math.random() * 1.4 + 0.3,
          tw: Math.random() * Math.PI * 2,
          tws: 0.004 + Math.random() * 0.01
        });
      }

      const cx = w * 0.5;
      const cy = h * 0.62;
      rings = [
        { rx: Math.min(w, h) * 0.32, ry: Math.min(w, h) * 0.14, rot: 0.5, speed: 0.00018 },
        { rx: Math.min(w, h) * 0.46, ry: Math.min(w, h) * 0.2, rot: -0.35, speed: -0.00012 },
        { rx: Math.min(w, h) * 0.6, ry: Math.min(w, h) * 0.26, rot: 0.9, speed: 0.00009 }
      ];
      travelers = rings.map(function (ring, i) {
        return { ring: ring, a: Math.random() * Math.PI * 2, size: i === 1 ? 3.2 : 2, accent: i === 1 };
      });

      ctx._cx = cx;
      ctx._cy = cy;
    }

    function drawStatic() {
      ctx.clearRect(0, 0, w, h);
      drawRings(0);
      drawParticles(0, true);
    }

    function drawParticles(t, staticish) {
      const ox = (mouse.x - 0.5) * 40;
      const oy = (mouse.y - 0.5) * 40;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        if (!staticish) {
          p.tw += p.tws;
          p.x += 0.04 * p.z;
          p.y -= 0.02 * p.z;
          if (p.x > w + 4) p.x = -4;
          if (p.y < -4) p.y = h + 4;
        }
        const alpha = 0.12 + Math.abs(Math.sin(p.tw)) * 0.5;
        const px = p.x + ox * p.z;
        const py = p.y + oy * p.z;
        ctx.beginPath();
        ctx.arc(px, py, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(237,237,240," + alpha.toFixed(3) + ")";
        ctx.fill();
      }
    }

    function drawRings(t) {
      const cx = w * 0.5;
      const cy = h * 0.62;
      ctx.save();
      ctx.translate(cx, cy);
      rings.forEach(function (ring) {
        ctx.save();
        ctx.rotate(ring.rot + t * ring.speed * 1000);
        ctx.beginPath();
        ctx.ellipse(0, 0, ring.rx, ring.ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.045)";
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.restore();
      });
      ctx.restore();
    }

    function drawTravelers(t) {
      const cx = w * 0.5;
      const cy = h * 0.62;
      const ox = (mouse.x - 0.5) * 20;
      const oy = (mouse.y - 0.5) * 20;
      travelers.forEach(function (tr) {
        tr.a += 0.0016 * (tr.ring.speed > 0 ? 1 : -1);
        const ring = tr.ring;
        const lx = Math.cos(tr.a) * ring.rx;
        const ly = Math.sin(tr.a) * ring.ry;
        const cos = Math.cos(ring.rot);
        const sin = Math.sin(ring.rot);
        const x = cx + lx * cos - ly * sin + ox;
        const y = cy + lx * sin + ly * cos + oy;

        ctx.beginPath();
        ctx.arc(x, y, tr.size, 0, Math.PI * 2);
        ctx.fillStyle = tr.accent ? "#ff4d1f" : "rgba(237,237,240,0.85)";
        if (tr.accent) {
          ctx.shadowColor = "rgba(255,77,31,0.9)";
          ctx.shadowBlur = 16;
        }
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    }

    let raf = null;
    let t = 0;

    function frame() {
      t += 1;
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;
      ctx.clearRect(0, 0, w, h);
      drawRings(t);
      drawParticles(t, false);
      drawTravelers(t);
      raf = requestAnimationFrame(frame);
    }

    window.addEventListener("pointermove", function (event) {
      mouse.tx = event.clientX / window.innerWidth;
      mouse.ty = event.clientY / window.innerHeight;
    }, { passive: true });

    let resizeTimer = null;
    window.addEventListener("resize", function () {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        resize();
        if (reduceMotion) drawStatic();
      }, 120);
    });

    resize();

    if (reduceMotion) {
      drawStatic();
    } else {
      raf = requestAnimationFrame(frame);
    }
  }

  /* ---------------- boot sequence ---------------- */

  function bootNow() {
    if (booted) return;
    booted = true;

    if (reduceMotion || !boot || !bootLog) {
      if (boot) boot.classList.add("is-done");
      body.classList.remove("is-locked");
      initField();
      return;
    }

    const lines = [
      "MUVEX.OS <b>v1.0</b>",
      "init kernel ................ ok",
      "mount worlds ............... ok",
      "spawn drift field .......... ok",
      "locate operator ............ musa@istanbul",
      "uplink ..................... <b>online</b>"
    ];

    let i = 0;
    let out = "";

    function step() {
      if (i >= lines.length) {
        window.setTimeout(function () {
          boot.classList.add("is-done");
          body.classList.remove("is-locked");
          initField();
          const first = menuItems[0];
          if (first) first.focus();
        }, 420);
        return;
      }
      out += (i > 0 ? "\n" : "") + lines[i];
      bootLog.innerHTML = out;
      i += 1;
      window.setTimeout(step, 150);
    }

    step();
  }

  window.addEventListener("DOMContentLoaded", function () {
    body.classList.add("is-locked");

    const hashId = location.hash.replace("#", "");
    const deepLink = WORLDS[hashId];

    window.setTimeout(function () {
      bootNow();
      if (deepLink) {
        window.setTimeout(function () { openWorld(hashId); }, 900);
      }
    }, reduceMotion ? 0 : 250);
  });
})();
