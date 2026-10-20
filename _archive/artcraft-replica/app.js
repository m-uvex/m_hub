(function () {
  "use strict";

  var root = document.documentElement;
  var stored = null;
  try { stored = localStorage.getItem("theme"); } catch (e) {}
  var theme = stored === "light" || stored === "dark" ? stored : "dark";
  root.setAttribute("data-theme", theme);

  var themeBtn = document.querySelector("[data-theme-toggle]");
  var themeIcon = document.querySelector("[data-theme-icon]");
  function paintTheme() {
    root.setAttribute("data-theme", theme);
    if (themeIcon) themeIcon.className = theme === "dark" ? "ph ph-moon" : "ph ph-sun";
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#121316" : "#f2f1ee");
  }
  paintTheme();

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      theme = theme === "dark" ? "light" : "dark";
      try { localStorage.setItem("theme", theme); } catch (e) {}
      paintTheme();
    });
  }

  var menuBtn = document.querySelector("[data-menu-toggle]");
  var menu = document.querySelector("[data-mobile-menu]");
  function setMenu(open) {
    if (!menu || !menuBtn) return;
    menu.hidden = !open;
    menuBtn.setAttribute("data-active", open ? "true" : "false");
    document.body.style.overflow = open ? "hidden" : "";
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener("click", function () {
      setMenu(menu.hidden);
    });
    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { setMenu(false); });
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  requestAnimationFrame(function () {
    requestAnimationFrame(function () {
      document.body.classList.add("is-ready");
    });
  });

  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }
})();
