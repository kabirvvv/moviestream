// ============================================================
//  STREAMVAULT — Layout Injection (Redesigned)
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
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
      </a>
      <button class="nav-hamburger" id="navToggle" aria-label="Menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>
  <div id="navMenu" role="navigation" aria-label="Mobile menu">
    <a class="nav-link" href="index.html">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
      Home
    </a>
    <a class="nav-link" href="movies.html">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/></svg>
      Movies
    </a>
    <a class="nav-link" href="shows.html">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/></svg>
      TV Shows
    </a>
    <a class="nav-link" href="watchlist.html">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
      Watchlist
    </a>
    <a class="nav-link" href="search.html">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
      Search
    </a>
  </div>`;

  const bottomNavHTML = `
  <nav class="bottom-nav" aria-label="Bottom navigation">
    <div class="bottom-nav-inner">
      <a class="bottom-nav-item" href="index.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
        <span>Home</span>
      </a>
      <a class="bottom-nav-item" href="movies.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="2"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/>
        </svg>
        <span>Movies</span>
      </a>
      <a class="bottom-nav-item" href="shows.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <rect x="2" y="7" width="20" height="15" rx="2"/><polyline points="17 2 12 7 7 2"/>
        </svg>
        <span>Shows</span>
      </a>
      <a class="bottom-nav-item" href="search.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <span>Search</span>
      </a>
      <a class="bottom-nav-item" href="watchlist.html">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        <span>Saved</span>
      </a>
    </div>
  </nav>`;

  const footerHTML = `
  <footer class="footer">
    <div class="footer-logo">STREAM<span>VAULT</span></div>
    <div class="footer-links">
      <a href="index.html">Home</a>
      <a href="movies.html">Movies</a>
      <a href="shows.html">TV Shows</a>
      <a href="watchlist.html">Watchlist</a>
      <a href="search.html">Search</a>
    </div>
    <p class="footer-disclaimer">
      StreamVault does not host any video content. All media is served via third-party players.
      Content metadata provided by <a href="https://www.themoviedb.org" target="_blank" style="color:var(--accent);opacity:0.7">TMDB</a>.
      This product uses the TMDB API but is not endorsed or certified by TMDB.
    </p>
  </footer>`;

  const navEl = document.createElement("div");
  navEl.innerHTML = navHTML;
  document.body.prepend(...navEl.childNodes);

  const bnEl = document.createElement("div");
  bnEl.innerHTML = bottomNavHTML;
  document.body.appendChild(bnEl.firstElementChild);

  const footerEl = document.createElement("div");
  footerEl.innerHTML = footerHTML;
  document.body.appendChild(footerEl.firstElementChild);

  UI.initNav();
}

document.addEventListener("DOMContentLoaded", injectLayout);
