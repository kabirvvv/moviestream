// ============================================================
//  STREAMVAULT — Animations & Mobile Enhancements
// ============================================================

const Anim = {

  // ── Scroll reveal (IntersectionObserver) ──────────────────
  initReveal() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(el => {
        if (el.isIntersecting) {
          el.target.classList.add("visible");
          obs.unobserve(el.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });

    document.querySelectorAll(".reveal").forEach(el => obs.observe(el));

    // Auto-add reveal to content rows
    document.querySelectorAll(".content-row").forEach((row, i) => {
      if (!row.classList.contains("reveal")) {
        row.classList.add("reveal");
        if (i < 3) row.classList.add(`reveal-delay-${i + 1}`);
        obs.observe(row);
      }
    });
  },

  // ── Button ripple ──────────────────────────────────────────
  initRipple() {
    document.addEventListener("click", e => {
      const btn = e.target.closest(".btn");
      if (!btn) return;
      const r = document.createElement("span");
      r.className = "ripple-effect";
      const rect = btn.getBoundingClientRect();
      r.style.left = (e.clientX - rect.left) + "px";
      r.style.top  = (e.clientY - rect.top)  + "px";
      btn.appendChild(r);
      setTimeout(() => r.remove(), 500);
    });
  },

  // ── Drag-to-scroll on card tracks ─────────────────────────
  initDragScroll() {
    document.querySelectorAll(".cards-track").forEach(track => {
      let isDown = false, startX = 0, scrollLeft = 0;

      track.addEventListener("mousedown", e => {
        isDown = true;
        track.classList.add("dragging");
        startX    = e.pageX - track.offsetLeft;
        scrollLeft = track.scrollLeft;
      });
      const end = () => { isDown = false; track.classList.remove("dragging"); };
      track.addEventListener("mouseleave", end);
      track.addEventListener("mouseup",   end);
      track.addEventListener("mousemove", e => {
        if (!isDown) return;
        e.preventDefault();
        const x    = e.pageX - track.offsetLeft;
        const walk = (x - startX) * 1.4;
        track.scrollLeft = scrollLeft - walk;
      });
    });
  },

  // ── Hero background parallax on scroll ────────────────────
  initHeroParallax() {
    const bg = document.getElementById("heroBg");
    if (!bg) return;
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (ticking) return;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        if (y < window.innerHeight) {
          bg.style.transform = `translateY(${y * 0.35}px)`;
        }
        ticking = false;
      });
      ticking = true;
    }, { passive: true });
  },

  // ── Hero auto-rotation with progress bar ──────────────────
  heroTimer: null,
  heroDuration: 7000,
  heroStart: 0,
  heroRafId: null,

  startHeroProgress() {
    const bar = document.getElementById("heroProgressBar");
    if (!bar) return;
    this.heroStart = performance.now();
    const tick = (now) => {
      const pct = Math.min(100, ((now - this.heroStart) / this.heroDuration) * 100);
      bar.style.width = pct + "%";
      if (pct < 100) this.heroRafId = requestAnimationFrame(tick);
    };
    cancelAnimationFrame(this.heroRafId);
    this.heroRafId = requestAnimationFrame(tick);
  },

  // ── Card stagger on first load ─────────────────────────────
  staggerCards(container) {
    const cards = container.querySelectorAll(".card");
    cards.forEach((card, i) => {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      setTimeout(() => {
        card.style.transition = "opacity 0.4s ease, transform 0.4s ease";
        card.style.opacity = "1";
        card.style.transform = "";
      }, i * 45);
    });
  },

  // ── Navbar active on scroll + hide/show ───────────────────
  initNavScroll() {
    const nav = document.querySelector(".navbar");
    if (!nav) return;
    let lastY = 0;
    window.addEventListener("scroll", () => {
      const y = window.scrollY;
      nav.classList.toggle("scrolled", y > 50);
      lastY = y;
    }, { passive: true });
  },

  // ── Image lazy load with fade-in ──────────────────────────
  initLazyImages() {
    const imgs = document.querySelectorAll("img[loading='lazy']");
    imgs.forEach(img => {
      img.style.opacity = "0";
      img.style.transition = "opacity 0.4s ease";
      if (img.complete) {
        img.style.opacity = "1";
      } else {
        img.addEventListener("load", () => { img.style.opacity = "1"; });
        img.addEventListener("error", () => { img.style.opacity = "1"; });
      }
    });
  },

  // ── Touch swipe for hero ───────────────────────────────────
  initHeroSwipe() {
    const hero = document.getElementById("hero");
    if (!hero) return;
    let touchStartX = 0;
    hero.addEventListener("touchstart", e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    hero.addEventListener("touchend", e => {
      const dx = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(dx) < 40) return;
      if (typeof renderHero === "function" && typeof heroItems !== "undefined") {
        const next = dx < 0
          ? (heroIndex + 1) % heroItems.length
          : (heroIndex - 1 + heroItems.length) % heroItems.length;
        renderHero(next);
        if (typeof resetTimer === "function") resetTimer();
      }
    }, { passive: true });
  },

  // ── Bottom nav active state ────────────────────────────────
  updateBottomNav() {
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".bottom-nav-item").forEach(item => {
      const href = item.getAttribute("href")?.split("/").pop() || "";
      item.classList.toggle("active", href === path);
    });
  },

  // ── Init all ──────────────────────────────────────────────
  init() {
    this.initReveal();
    this.initRipple();
    this.initDragScroll();
    this.initHeroParallax();
    this.initNavScroll();
    this.initLazyImages();
    this.initHeroSwipe();
    this.updateBottomNav();
  },
};

document.addEventListener("DOMContentLoaded", () => Anim.init());

// Re-run lazy + reveal + drag after dynamic content loads
const _origInnerHTML = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
