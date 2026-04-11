// ============================================================
//  STREAMVAULT — Shared layout injection
// ============================================================

function injectLayout() {
  const navHTML = `
  <nav class="navbar" id="navbar">
    <a class="nav-logo" href="index.html">STREAM<span>VAULT</span></a>
    <div class="nav-links" id="desktopNav">
      <a class="nav-link" href="index.html">Home</a>
      <a class="nav-link" href="movies.html">Movies</a>
      <a class="nav-link" href="shows.html">TV Shows</a>
      <a class="nav-link" href="watchlist.html">Watchlist</a>
    </div>
    <div class="nav-actions">
      <a href="search.html" class="nav-search-btn" aria-label="Search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </a>
      <button class="nav-hamburger" id="navToggle" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
  <div id="navMenu">
    <a class="nav-link" href="index.html">Home</a>
    <a class="nav-link" href="movies.html">Movies</a>
    <a class="nav-link" href="shows.html">TV Shows</a>
    <a class="nav-link" href="watchlist.html">Watchlist</a>
    <a class="nav-link" href="search.html">Search</a>
  </div>`;

  const footerHTML = `
  <footer class="footer">
    <div class="footer-logo">STREAM<span style="color:var(--text)">VAULT</span></div>
    <div class="footer-links">
      <a href="index.html">Home</a>
      <a href="movies.html">Movies</a>
      <a href="shows.html">TV Shows</a>
      <a href="watchlist.html">Watchlist</a>
      <a href="search.html">Search</a>
    </div>
    <p class="footer-disclaimer">
      StreamVault does not host any video content. All media is served via third-party players.
      Content metadata provided by <a href="https://www.themoviedb.org" target="_blank" style="color:var(--accent)">TMDB</a>.
      This product uses the TMDB API but is not endorsed or certified by TMDB.
    </p>
  </footer>`;

  // Prepend nav
  const navEl = document.createElement("div");
  navEl.innerHTML = navHTML;
  document.body.prepend(...navEl.childNodes);

  // Append footer
  const footerEl = document.createElement("div");
  footerEl.innerHTML = footerHTML;
  document.body.appendChild(footerEl.firstElementChild);

  UI.initNav();
}

document.addEventListener("DOMContentLoaded", injectLayout);
