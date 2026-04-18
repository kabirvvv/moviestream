// ============================================================
//  STREAMVAULT — Search Suggestions
// ============================================================

const Suggest = (() => {
  // ── Private helpers ─────────────────────────────────────────
  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  // ── State ───────────────────────────────────────────────────
  let input, dropEl, wrapEl;
  let items        = [];
  let activeIdx    = -1;
  let debTimer     = null;
  let controller   = null;
  let trendCache   = null;
  let isVisible    = false;
  let lastQuery    = "";

  // ── Item renderer ────────────────────────────────────────────
  function itemHTML(item, idx) {
    const type  = item.media_type || "movie";
    const title = item.title || item.name;
    const year  = UI.year(item.release_date || item.first_air_date);
    const pct   = Math.round((item.vote_average || 0) * 10);
    const href  = type === "movie" ? `movie.html?id=${item.id}` : `tv.html?id=${item.id}`;
    const poster = item.poster_path ? API.img(item.poster_path, "w92") : "";

    return `<a class="sv-item" href="${href}" data-idx="${idx}" role="option" aria-selected="false">
      <div class="sv-poster">
        ${poster
          ? `<img src="${poster}" alt="" loading="lazy" onerror="this.parentNode.classList.add('sv-poster--ph')">`
          : `<div class="sv-poster-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></div>`
        }
      </div>
      <div class="sv-info">
        <div class="sv-title">${esc(title)}</div>
        <div class="sv-meta">
          <span class="sv-badge sv-badge--${type}">${type === "movie" ? "Film" : "Series"}</span>
          ${year !== "—" ? `<span class="sv-year">${year}</span>` : ""}
          ${pct > 0 ? `<span class="sv-rating"><svg viewBox="0 0 10 10"><polygon points="5,1 6.5,3.8 9.5,4.3 7.3,6.4 7.9,9.4 5,7.9 2.1,9.4 2.7,6.4 0.5,4.3 3.5,3.8" fill="currentColor"/></svg>${pct}%</span>` : ""}
        </div>
      </div>
      <div class="sv-chevron"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18l6-6-6-6"/></svg></div>
    </a>`;
  }

  // ── Render helpers ───────────────────────────────────────────
  function renderTrending() {
    if (!trendCache?.length) return;
    items = trendCache;
    activeIdx = -1;
    dropEl.innerHTML =
      `<div class="sv-header">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
        Trending now
      </div>` +
      items.map((item, i) => itemHTML(item, i)).join("") +
      `<div class="sv-footer sv-footer--browse" id="svBrowseBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        Browse all movies &amp; shows
      </div>`;
    bindItemEvents();
    document.getElementById("svBrowseBtn")?.addEventListener("click", () => {
      hide(); location.href = "movies.html";
    });
    open();
  }

  function renderResults(results, query) {
    items = results;
    activeIdx = -1;
    dropEl.innerHTML =
      items.map((item, i) => itemHTML(item, i)).join("") +
      `<div class="sv-footer" id="svAllBtn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        See all results for <strong>&ldquo;${esc(query)}&rdquo;</strong>
      </div>`;
    bindItemEvents();
    document.getElementById("svAllBtn")?.addEventListener("click", () => {
      hide();
      if (typeof doSearch === "function") doSearch(query);
    });
    open();
  }

  function renderLoading() {
    dropEl.innerHTML = `<div class="sv-loading"><span></span><span></span><span></span></div>`;
    open();
  }

  function renderEmpty(query) {
    dropEl.innerHTML =
      `<div class="sv-empty">
        <div class="sv-empty-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg></div>
        <p>No results for <strong>&ldquo;${esc(query)}&rdquo;</strong></p>
        <span>Try a different title or check the spelling</span>
      </div>`;
    open();
  }

  // ── Keyboard active item ─────────────────────────────────────
  function setActive(idx) {
    activeIdx = idx;
    dropEl.querySelectorAll(".sv-item").forEach((el, i) => {
      const on = i === idx;
      el.classList.toggle("sv-item--active", on);
      el.setAttribute("aria-selected", String(on));
      if (on) el.scrollIntoView({ block: "nearest" });
    });
  }

  // ── Bind item hover ──────────────────────────────────────────
  function bindItemEvents() {
    dropEl.querySelectorAll(".sv-item").forEach(el => {
      el.addEventListener("mouseenter", () => {
        const i = +el.dataset.idx;
        setActive(i);
      });
      el.addEventListener("mouseleave", () => {
        el.classList.remove("sv-item--active");
        el.setAttribute("aria-selected", "false");
      });
    });
  }

  // ── Open / hide ──────────────────────────────────────────────
  function open() {
    if (!isVisible) {
      dropEl.classList.add("sv-open");
      input.setAttribute("aria-expanded", "true");
      isVisible = true;
    }
  }

  function hide() {
    dropEl.classList.remove("sv-open");
    input.setAttribute("aria-expanded", "false");
    isVisible = false;
    activeIdx = -1;
  }

  // ── Fetch & render ───────────────────────────────────────────
  async function fetchQuery(q) {
    if (controller) controller.abort();
    controller = new AbortController();
    renderLoading();
    try {
      const data = await API.search(q, 1, controller.signal);
      const results = data.results
        .filter(i => i.media_type !== "person" && i.poster_path)
        .slice(0, 7);
      if (!results.length) renderEmpty(q);
      else renderResults(results, q);
    } catch (err) {
      if (err.name === "AbortError") return;
      hide();
    }
  }

  // ── Public API ───────────────────────────────────────────────
  return {
    hide,
    async init(inputEl) {
      input = inputEl;

      // Wrap in relative container for dropdown positioning
      wrapEl = document.createElement("div");
      wrapEl.className = "sv-wrap";
      input.closest("form").parentNode.insertBefore(wrapEl, input.closest("form"));
      wrapEl.appendChild(input.closest("form"));

      // Create dropdown
      dropEl = document.createElement("div");
      dropEl.className = "sv-dropdown";
      dropEl.setAttribute("role", "listbox");
      dropEl.setAttribute("aria-label", "Search suggestions");
      wrapEl.appendChild(dropEl);

      // ARIA on input
      input.setAttribute("role", "combobox");
      input.setAttribute("aria-autocomplete", "list");
      input.setAttribute("aria-expanded", "false");
      input.setAttribute("aria-haspopup", "listbox");

      // Preload trending in background
      API.getTrending("all", "day")
        .then(d => {
          trendCache = d.results
            .filter(i => i.media_type !== "person" && i.poster_path)
            .slice(0, 6);
        })
        .catch(() => {});

      // ── Events ──────────────────────────────────────────────
      input.addEventListener("focus", () => {
        if (!input.value.trim() && trendCache?.length) renderTrending();
      });

      input.addEventListener("input", () => {
        clearTimeout(debTimer);
        const q = input.value.trim();
        lastQuery = q;
        if (!q) {
          if (trendCache?.length) renderTrending();
          else hide();
          return;
        }
        debTimer = setTimeout(() => fetchQuery(q), 220);
      });

      input.addEventListener("keydown", e => {
        if (!isVisible) return;
        const els = dropEl.querySelectorAll(".sv-item");
        const max = els.length - 1;

        if (e.key === "ArrowDown") {
          e.preventDefault();
          const next = activeIdx < max ? activeIdx + 1 : 0;
          setActive(next);
          const hit = items[next];
          if (hit) input.value = hit.title || hit.name;
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const prev = activeIdx > 0 ? activeIdx - 1 : max;
          setActive(prev);
          const hit = items[prev];
          if (hit) input.value = hit.title || hit.name;
        } else if (e.key === "Enter" && activeIdx >= 0) {
          e.preventDefault();
          els[activeIdx]?.click();
        } else if (e.key === "Escape") {
          hide();
          input.blur();
        }
      });

      // Close on outside click
      document.addEventListener("pointerdown", e => {
        if (!wrapEl.contains(e.target)) hide();
      });
    },
  };
})();

// ── Bootstrap on DOMContentLoaded ──────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  const inp = document.getElementById("searchInput");
  if (inp) Suggest.init(inp);
});
