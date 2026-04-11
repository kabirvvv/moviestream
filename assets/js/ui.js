// ============================================================
//  STREAMVAULT — Shared UI Utilities
// ============================================================

const UI = {
  // ── Rating badge ───────────────────────────────────────────
  ratingBadge(score) {
    const pct = Math.round(score * 10);
    const cls = pct >= 70 ? "good" : pct >= 50 ? "mid" : "low";
    return `<span class="rating-badge rating-${cls}">${pct}%</span>`;
  },

  // ── Year from date ─────────────────────────────────────────
  year(dateStr) {
    return dateStr ? dateStr.slice(0, 4) : "—";
  },

  // ── Runtime formatter ──────────────────────────────────────
  runtime(mins) {
    if (!mins) return "";
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h ? `${h}h ${m}m` : `${m}m`;
  },

  // ── Card HTML ──────────────────────────────────────────────
  card(item, mediaType) {
    const type = mediaType || item.media_type || "movie";
    if (type === "person") return "";
    const title = item.title || item.name;
    const date = item.release_date || item.first_air_date;
    const poster = item.poster_path
      ? API.img(item.poster_path, "w342")
      : `https://placehold.co/342x513/111/333?text=${encodeURIComponent(title)}`;
    const href = type === "movie"
      ? `movie.html?id=${item.id}`
      : `tv.html?id=${item.id}`;
    const savedKey = `progress_${type}_${item.id}`;
    const saved = JSON.parse(localStorage.getItem(savedKey) || "null");
    const progressBar = saved
      ? `<div class="card-progress"><div class="card-progress-fill" style="width:${Math.min(100, Math.round(saved.progress))}%"></div></div>`
      : "";

    return `
      <a class="card" href="${href}" data-id="${item.id}" data-type="${type}">
        <div class="card-poster">
          <img src="${poster}" alt="${title}" loading="lazy" onerror="this.src='https://placehold.co/342x513/111/333?text=No+Image'">
          <div class="card-overlay">
            <div class="card-play"><svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></div>
            <div class="card-meta-overlay">
              ${this.ratingBadge(item.vote_average)}
              <span class="card-type-tag">${type === "movie" ? "MOVIE" : "SERIES"}</span>
            </div>
          </div>
          ${progressBar}
        </div>
        <div class="card-info">
          <h3 class="card-title">${title}</h3>
          <p class="card-year">${this.year(date)}</p>
        </div>
      </a>`;
  },

  // ── Row section ────────────────────────────────────────────
  row(title, items, mediaType, showAll = null) {
    const cards = items
      .filter(i => (i.media_type !== "person"))
      .slice(0, 20)
      .map(i => this.card(i, mediaType))
      .join("");
    return `
      <section class="content-row">
        <div class="row-header">
          <h2 class="row-title">${title}</h2>
          ${showAll ? `<a class="row-more" href="${showAll}">See all →</a>` : ""}
        </div>
        <div class="cards-track">${cards}</div>
      </section>`;
  },

  // ── Toast notification ─────────────────────────────────────
  toast(msg, type = "info") {
    const t = document.createElement("div");
    t.className = `toast toast-${type}`;
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add("toast-show"));
    setTimeout(() => {
      t.classList.remove("toast-show");
      setTimeout(() => t.remove(), 400);
    }, 3000);
  },

  // ── Spinner ────────────────────────────────────────────────
  spinner() {
    return `<div class="spinner"><div></div><div></div><div></div></div>`;
  },

  // ── Skeleton cards ─────────────────────────────────────────
  skeletons(n = 8) {
    return Array(n).fill(`
      <div class="card skeleton-card">
        <div class="card-poster skeleton-block"></div>
        <div class="card-info">
          <div class="skeleton-line" style="width:80%"></div>
          <div class="skeleton-line" style="width:40%"></div>
        </div>
      </div>`).join("");
  },

  // ── Watchlist helpers ──────────────────────────────────────
  getWatchlist() {
    return JSON.parse(localStorage.getItem("sv_watchlist") || "[]");
  },
  inWatchlist(id, type) {
    return this.getWatchlist().some(i => i.id == id && i.type === type);
  },
  toggleWatchlist(item) {
    let list = this.getWatchlist();
    const exists = list.findIndex(i => i.id == item.id && i.type === item.type);
    if (exists >= 0) {
      list.splice(exists, 1);
      this.toast("Removed from watchlist");
    } else {
      list.unshift(item);
      this.toast("Added to watchlist ✓", "success");
    }
    localStorage.setItem("sv_watchlist", JSON.stringify(list));
    return exists < 0;
  },

  // ── Nav active state ───────────────────────────────────────
  setActiveNav() {
    const path = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-link").forEach(a => {
      const href = a.getAttribute("href").split("/").pop();
      a.classList.toggle("active", href === path);
    });
  },

  // ── Initialize mobile nav ──────────────────────────────────
  initNav() {
    this.setActiveNav();
    // Mobile hamburger
    const btn = document.getElementById("navToggle");
    const menu = document.getElementById("navMenu");
    if (btn && menu) {
      btn.addEventListener("click", () => menu.classList.toggle("open"));
      document.addEventListener("click", e => {
        if (!menu.contains(e.target) && !btn.contains(e.target)) {
          menu.classList.remove("open");
        }
      });
    }
    // Scroll shrink
    window.addEventListener("scroll", () => {
      document.querySelector(".navbar")?.classList.toggle("scrolled", window.scrollY > 60);
    }, { passive: true });
  },

  // ── Infinite-scroll helper ─────────────────────────────────
  initInfiniteScroll(callback) {
    let loading = false;
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !loading) {
        loading = true;
        callback().finally(() => { loading = false; });
      }
    }, { rootMargin: "400px" });
    const sentinel = document.getElementById("scroll-sentinel");
    if (sentinel) observer.observe(sentinel);
  },
};

// ── Progress tracking listener (global, used in watch.html) ──
window.addEventListener("message", e => {
  try {
    const data = JSON.parse(e.data);
    if (!data || !data.id) return;
    const key = `progress_${data.type}_${data.id}${data.season ? `_s${data.season}e${data.episode}` : ""}`;
    localStorage.setItem(key, JSON.stringify(data));
    // Also save top-level key for card badge
    const topKey = `progress_${data.type}_${data.id}`;
    localStorage.setItem(topKey, JSON.stringify(data));
  } catch {}
});
