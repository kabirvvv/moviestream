// ============================================================
//  STREAMVAULT — Search Suggestions
// ============================================================

// ── Inject premium drawer styles ─────────────────────────────
(function () {
  const s = document.createElement("style");
  s.textContent = `
    .sv-wrap {
      position: relative;
      max-width: 580px;
      margin: 0 auto;
      animation: fadeUp 0.5s var(--ease-out) 0.15s both;
    }
    .sv-wrap .search-box { max-width: 100%; margin: 0; animation: none; }

    /* ── Drawer container ─────────────────────────── */
    .sv-dropdown {
      position: absolute;
      top: calc(100% + 10px);
      left: 0; right: 0;
      z-index: 400;
      background: rgba(13, 13, 20, 0.96);
      backdrop-filter: blur(28px) saturate(1.8);
      -webkit-backdrop-filter: blur(28px) saturate(1.8);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      overflow: hidden;
      box-shadow:
        0 2px 4px rgba(0,0,0,0.3),
        0 16px 40px rgba(0,0,0,0.6),
        0 40px 64px rgba(0,0,0,0.35),
        inset 0 1px 0 rgba(255,255,255,0.05);

      /* closed — clip wipes upward (true drawer feel) */
      clip-path: inset(0 0 100% 0 round 16px);
      opacity: 0;
      pointer-events: none;
      transition:
        clip-path 0.36s cubic-bezier(0.4, 0, 0.15, 1),
        opacity   0.2s  ease;
    }

    /* accent line at drawer top */
    .sv-dropdown::before {
      content: '';
      position: absolute;
      top: 0; left: 8%; right: 8%;
      height: 1px;
      background: linear-gradient(90deg, transparent, rgba(217,51,71,0.5), transparent);
      pointer-events: none; z-index: 1;
    }

    .sv-dropdown.sv-open {
      clip-path: inset(0 0 0% 0 round 16px);
      opacity: 1;
      pointer-events: all;
    }

    /* ── Item entrance stagger ─────────────────────── */
    @keyframes svItemDrop {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .sv-item {
      display: flex; align-items: center; gap: 11px;
      padding: 8px 14px;
      text-decoration: none; color: var(--text);
      position: relative;
      opacity: 0;
      animation: svItemDrop 0.26s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
    }
    .sv-item:nth-child(1) { animation-delay: 0.03s; }
    .sv-item:nth-child(2) { animation-delay: 0.07s; }
    .sv-item:nth-child(3) { animation-delay: 0.11s; }
    .sv-item:nth-child(4) { animation-delay: 0.15s; }
    .sv-item:nth-child(5) { animation-delay: 0.19s; }
    .sv-item:nth-child(6) { animation-delay: 0.23s; }
    .sv-item:nth-child(7) { animation-delay: 0.27s; }

    .sv-item::after {
      content: ''; position: absolute; inset: 0;
      background: transparent; transition: background var(--t1);
    }
    .sv-item:hover::after,
    .sv-item--active::after { background: rgba(255,255,255,0.04); }
    .sv-item + .sv-item { border-top: 1px solid rgba(255,255,255,0.04); }

    /* ── Poster ────────────────────────────────────── */
    .sv-poster {
      width: 34px; height: 51px; flex-shrink: 0;
      border-radius: 5px; overflow: hidden;
      background: var(--surface); border: 1px solid var(--border);
    }
    .sv-poster img {
      width: 100%; height: 100%; object-fit: cover; display: block;
      transition: transform 0.3s var(--ease);
    }
    .sv-item:hover .sv-poster img,
    .sv-item--active .sv-poster img { transform: scale(1.06); }
    .sv-poster--ph { background: var(--surface); }
    .sv-poster-icon {
      width: 100%; height: 100%;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-dim);
    }
    .sv-poster-icon svg { width: 14px; height: 14px; }

    /* ── Text ──────────────────────────────────────── */
    .sv-info { flex: 1; min-width: 0; }
    .sv-title {
      font-size: 0.855rem; font-weight: 500; color: var(--text);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      margin-bottom: 5px; transition: color var(--t1);
    }
    .sv-item:hover .sv-title,
    .sv-item--active .sv-title { color: #fff; }
    .sv-meta { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
    .sv-badge {
      font-size: 0.58rem; font-weight: 600; letter-spacing: 0.09em;
      text-transform: uppercase; padding: 2px 6px; border-radius: 3px;
    }
    .sv-badge--movie { background: rgba(217,51,71,0.14); color: #f26070; }
    .sv-badge--tv    { background: rgba(61,184,130,0.12); color: #5dd4a0; }
    .sv-year { font-size: 0.73rem; color: var(--text-muted); }
    .sv-rating {
      display: flex; align-items: center; gap: 3px;
      font-size: 0.72rem; color: var(--text-muted);
    }
    .sv-rating svg { width: 9px; height: 9px; color: #e8b44b; flex-shrink: 0; }

    /* ── Chevron ───────────────────────────────────── */
    .sv-chevron {
      flex-shrink: 0; color: var(--text-dim);
      transform: translateX(-4px); opacity: 0;
      transition: transform var(--t2) var(--ease-out), opacity var(--t2);
    }
    .sv-chevron svg { width: 14px; height: 14px; display: block; }
    .sv-item:hover .sv-chevron,
    .sv-item--active .sv-chevron { transform: translateX(0); opacity: 1; color: var(--text-muted); }

    /* ── Footer ────────────────────────────────────── */
    .sv-footer {
      display: flex; align-items: center; gap: 8px;
      padding: 11px 14px;
      border-top: 1px solid rgba(255,255,255,0.06);
      font-size: 0.77rem; color: var(--text-muted);
      cursor: pointer; transition: background var(--t1), color var(--t1);
    }
    .sv-footer:hover { background: rgba(255,255,255,0.03); color: var(--text); }
    .sv-footer svg { width: 12px; height: 12px; flex-shrink: 0; }
    .sv-footer strong { color: var(--text); font-weight: 500; margin-left: 2px; }

    /* ── Loading dots ──────────────────────────────── */
    @keyframes svDot {
      0%, 80%, 100% { transform: scale(0.7); opacity: 0.3; }
      40%           { transform: scale(1.25); opacity: 1; background: var(--accent2); }
    }
    .sv-loading {
      display: flex; align-items: center; justify-content: center;
      gap: 6px; padding: 22px;
    }
    .sv-loading span {
      width: 5px; height: 5px; border-radius: 50%;
      background: var(--text-dim); animation: svDot 1.1s var(--ease) infinite;
    }
    .sv-loading span:nth-child(2) { animation-delay: 0.18s; }
    .sv-loading span:nth-child(3) { animation-delay: 0.36s; }

    /* ── Empty state ───────────────────────────────── */
    .sv-empty { padding: 24px 16px; text-align: center; }
    .sv-empty-icon {
      width: 36px; height: 36px; border-radius: 50%;
      background: var(--surface); border: 1px solid var(--border);
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto 10px; color: var(--text-muted);
    }
    .sv-empty-icon svg { width: 15px; height: 15px; }
    .sv-empty p { font-size: 0.83rem; color: var(--text-muted); margin-bottom: 4px; }
    .sv-empty p strong { color: var(--text); font-weight: 500; }
    .sv-empty span { font-size: 0.7rem; color: var(--text-dim); }
  `;
  document.head.appendChild(s);
})();

// ── Module ────────────────────────────────────────────────────
const Suggest = (() => {
  function esc(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  let input, dropEl, wrapEl;
  let items      = [];
  let activeIdx  = -1;
  let debTimer   = null;
  let controller = null;
  let isVisible  = false;

  function itemHTML(item, idx) {
    const type   = item.media_type || "movie";
    const title  = item.title || item.name;
    const year   = UI.year(item.release_date || item.first_air_date);
    const pct    = Math.round((item.vote_average || 0) * 10);
    const href   = type === "movie" ? `movie.html?id=${item.id}` : `tv.html?id=${item.id}`;
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

  function renderResults(results, query) {
    items = results; activeIdx = -1;
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

  function setActive(idx) {
    activeIdx = idx;
    dropEl.querySelectorAll(".sv-item").forEach((el, i) => {
      const on = i === idx;
      el.classList.toggle("sv-item--active", on);
      el.setAttribute("aria-selected", String(on));
      if (on) el.scrollIntoView({ block: "nearest" });
    });
  }

  function bindItemEvents() {
    dropEl.querySelectorAll(".sv-item").forEach(el => {
      el.addEventListener("mouseenter", () => setActive(+el.dataset.idx));
      el.addEventListener("mouseleave", () => {
        el.classList.remove("sv-item--active");
        el.setAttribute("aria-selected", "false");
      });
    });
  }

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

  return {
    hide,
    init(inputEl) {
      input = inputEl;

      wrapEl = document.createElement("div");
      wrapEl.className = "sv-wrap";
      input.closest("form").parentNode.insertBefore(wrapEl, input.closest("form"));
      wrapEl.appendChild(input.closest("form"));

      dropEl = document.createElement("div");
      dropEl.className = "sv-dropdown";
      dropEl.setAttribute("role", "listbox");
      dropEl.setAttribute("aria-label", "Search suggestions");
      wrapEl.appendChild(dropEl);

      input.setAttribute("role", "combobox");
      input.setAttribute("aria-autocomplete", "list");
      input.setAttribute("aria-expanded", "false");
      input.setAttribute("aria-haspopup", "listbox");

      input.addEventListener("input", () => {
        clearTimeout(debTimer);
        const q = input.value.trim();
        if (!q) { hide(); return; }
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
          if (items[next]) input.value = items[next].title || items[next].name;
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          const prev = activeIdx > 0 ? activeIdx - 1 : max;
          setActive(prev);
          if (items[prev]) input.value = items[prev].title || items[prev].name;
        } else if (e.key === "Enter" && activeIdx >= 0) {
          e.preventDefault();
          els[activeIdx]?.click();
        } else if (e.key === "Escape") {
          hide(); input.blur();
        }
      });

      document.addEventListener("pointerdown", e => {
        if (!wrapEl.contains(e.target)) hide();
      });
    },
  };
})();

document.addEventListener("DOMContentLoaded", () => {
  const inp = document.getElementById("searchInput");
  if (inp) Suggest.init(inp);
});
