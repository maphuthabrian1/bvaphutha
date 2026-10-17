(() => {
  "use strict";
  const root = document.documentElement;

  /* Mobile navigation */
  const menuToggle = document.querySelector(".menu-toggle");
  const navLinks = document.querySelector(".nav-links");
  const menuIcon = menuToggle ? menuToggle.querySelector("i") : null;

  function setMenu(open) {
    navLinks.classList.toggle("open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    if (menuIcon) menuIcon.className = open ? "ph ph-x" : "ph ph-list";
  }

  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
    navLinks.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setMenu(false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navLinks.classList.contains("open")) {
        setMenu(false);
        menuToggle.focus();
      }
    });
  }

  /* Light / dark theme: follows the system until the visitor chooses */
  const themeBtn = document.querySelector(".theme-toggle");
  const themeIcon = themeBtn ? themeBtn.querySelector("i") : null;
  const systemDark = window.matchMedia("(prefers-color-scheme: dark)");
  const currentTheme = () => root.dataset.theme || (systemDark.matches ? "dark" : "light");

  function syncThemeButton() {
    if (!themeBtn) return;
    const dark = currentTheme() === "dark";
    if (themeIcon) themeIcon.className = dark ? "ph ph-sun" : "ph ph-moon";
    themeBtn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      const next = currentTheme() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) { /* storage unavailable */ }
      syncThemeButton();
    });
    systemDark.addEventListener("change", syncThemeButton);
    syncThemeButton();
  }

  /* Footer year */
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* Scroll reveal on the hero and project cards (content stays visible without JS/IntersectionObserver) */
  const revealEls = document.querySelectorAll(".fade-in-up");
  if ("IntersectionObserver" in window) {
    const reveal = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -50px 0px", threshold: 0.1 });
    revealEls.forEach((el) => reveal.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  /* Highlight the nav link for the section being read */
  const navAnchors = Array.from(document.querySelectorAll('.nav-links a[href^="#"]'));
  const sections = navAnchors.map((a) => document.querySelector(a.getAttribute("href"))).filter(Boolean);
  const clearCurrent = () => navAnchors.forEach((a) => a.removeAttribute("aria-current"));

  if ("IntersectionObserver" in window && sections.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        clearCurrent();
        const link = navAnchors.find((a) => a.getAttribute("href") === "#" + entry.target.id);
        if (link) link.setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => spy.observe(s));
  }

  /* Scroll progress bar + sticky header state */
  const bar = document.getElementById("scroll-progress");
  const header = document.querySelector(".site-header");
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    if (bar) bar.style.width = (max > 0 ? Math.min(100, (y / max) * 100) : 0) + "%";
    if (header) header.classList.toggle("is-scrolled", y > 8);
    if (y < 150) clearCurrent();
    ticking = false;
  };
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* Optional analytics hook (works once the Plausible snippet in index.html is enabled) */
  const cvLink = document.getElementById("cvLink");
  if (cvLink) {
    cvLink.addEventListener("click", () => {
      if (typeof window.plausible === "function") window.plausible("CV Download");
    });
  }
})();
