// ============================================================
//  STREAMVAULT — Search
// ============================================================

let searchPage = 1;
let searchTotalPages = 1;
let currentQuery = "";
let searchAbortController = null;

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function doSearch(query, page = 1, append = false) {
  if (!query.trim()) return;

  if (searchAbortController) searchAbortController.abort();
  searchAbortController = new AbortController();
  const { signal } = searchAbortController;

  currentQuery = query;

  const grid     = document.getElementById("searchGrid");
  const label    = document.getElementById("searchLabel");
  const loadMore = document.getElementById("loadMoreBtn");

  if (!append) {
    grid.innerHTML = UI.skeletons(16);
    label.textContent = "";
    history.replaceState(null, "", `?q=${encodeURIComponent(query)}`);
  }

  try {
    const data = await API.search(query, page, signal);
    searchPage = page;
    searchTotalPages = data.total_pages;

    const items = data.results
      .filter(i => i.media_type !== "person" && i.poster_path)
      .map(i => UI.card(i));

    if (!append) grid.innerHTML = "";
    grid.insertAdjacentHTML(
      "beforeend",
      items.join("") || `<p style="color:var(--text-muted)">No results found.</p>`
    );

    label.innerHTML = `Showing results for <strong>&ldquo;${escapeHTML(query)}&rdquo;</strong> — ${data.total_results.toLocaleString()} found`;

    if (loadMore) {
      loadMore.style.display = searchPage < searchTotalPages ? "flex" : "none";
    }
  } catch (err) {
    if (err.name === "AbortError") return;
    grid.innerHTML = `<p style="color:var(--text-muted)">Search failed. Please try again.</p>`;
    label.textContent = "";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const input    = document.getElementById("searchInput");
  const form     = document.getElementById("searchForm");
  const loadMore = document.getElementById("loadMoreBtn");
  const grid     = document.getElementById("searchGrid");
  const label    = document.getElementById("searchLabel");

  // Pre-fill from URL
  const params = new URLSearchParams(location.search);
  const q = params.get("q");
  if (q) {
    input.value = q;
    doSearch(q);
  }

  // Submit (Enter / Search button) → run full search
  form?.addEventListener("submit", e => {
    e.preventDefault();
    if (typeof Suggest !== "undefined") Suggest.hide();
    doSearch(input.value.trim());
  });

  // Clear grid immediately when input is emptied
  input?.addEventListener("input", () => {
    if (!input.value.trim()) {
      if (searchAbortController) searchAbortController.abort();
      grid.innerHTML = "";
      label.textContent = "";
      if (loadMore) loadMore.style.display = "none";
      currentQuery = "";
      history.replaceState(null, "", location.pathname);
    }
  });

  // Load more
  loadMore?.addEventListener("click", () => {
    doSearch(currentQuery, searchPage + 1, true);
  });

  document.body.classList.add("page-enter");
});
