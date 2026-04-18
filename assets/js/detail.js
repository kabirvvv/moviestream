// ============================================================
//  STREAMVAULT — Detail Pages (Movie & TV)
// ============================================================

const Detail = {
  data: null,
  type: null,
  currentSeason: 1,

  async init(type) {
    this.type = type;
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    if (!id) { location.href = "index.html"; return; }

    const wrap = document.getElementById("detailWrap");
    wrap.innerHTML = `<div style="padding:4rem 2rem">${UI.spinner()}</div>`;

    try {
      this.data = type === "movie" ? await API.getMovie(id) : await API.getTV(id);
      this.render();
      document.body.classList.add("page-enter");
    } catch (e) {
      wrap.innerHTML = `<p style="padding:4rem 2rem;color:var(--text-muted)">Failed to load content.</p>`;
    }
  },

  render() {
    const d = this.data;
    const title = d.title || d.name;
    const date = d.release_date || d.first_air_date;
    const runtime = d.runtime ? UI.runtime(d.runtime) : (d.episode_run_time?.[0] ? UI.runtime(d.episode_run_time[0]) + "/ep" : "");
    const trailer = d.videos?.results?.find(v => v.type === "Trailer" && v.site === "YouTube");

    document.title = `${title} — StreamVault`;

    const watchURL = this.type === "movie"
      ? `watch.html?type=movie&id=${d.id}`
      : `watch.html?type=tv&id=${d.id}&season=1&episode=1`;

    const inWL = UI.inWatchlist(d.id, this.type);

    document.getElementById("detailWrap").innerHTML = `
      <div class="detail-backdrop">
        ${d.backdrop_path ? `<img src="${API.img(d.backdrop_path, "original")}" alt="">` : ""}
      </div>
      <div class="detail-wrap">
        <div class="detail-hero">
          <div class="detail-poster">
            <img src="${d.poster_path ? API.img(d.poster_path, "w342") : 'https://placehold.co/342x513/111/333?text=No+Poster'}" alt="${title}">
          </div>
          <div class="detail-info">
            <div class="detail-genre-tags">
              ${(d.genres || []).map(g => `<span class="genre-tag">${g.name}</span>`).join("")}
            </div>
            <h1 class="detail-title">${title}</h1>
            <div class="detail-meta">
              ${UI.ratingBadge(d.vote_average)}
              ${date ? `<span>${UI.year(date)}</span>` : ""}
              ${runtime ? `<span>${runtime}</span>` : ""}
              ${this.type === "tv" ? `<span>${d.number_of_seasons} Season${d.number_of_seasons !== 1 ? "s" : ""}</span>` : ""}
              ${this.type === "tv" ? `<span>${d.number_of_episodes} Episodes</span>` : ""}
              ${d.status ? `<span style="color:var(--accent)">${d.status}</span>` : ""}
            </div>
            <p class="detail-overview">${d.overview || "No description available."}</p>
            <div class="detail-actions">
              <a class="btn btn-primary" href="${watchURL}">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Watch Now
              </a>
              ${trailer ? `
                <a class="btn btn-secondary" href="https://www.youtube.com/watch?v=${trailer.key}" target="_blank" rel="noopener noreferrer">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0zM10 8.5l5 3.5-5 3.5V8.5z"/></svg>
                  Trailer
                </a>` : ""}
              <button class="btn btn-secondary watchlist-btn" id="wlBtn" onclick="Detail.toggleWL()">
                <svg viewBox="0 0 24 24" fill="${inWL ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                ${inWL ? "In Watchlist" : "Add to Watchlist"}
              </button>
            </div>
          </div>
        </div>

        ${this.renderCast()}
        <hr class="section-divider">

        ${this.type === "tv" ? this.renderSeasons() : ""}
        ${this.renderSimilar()}
      </div>`;

    if (this.type === "tv") this.loadSeason(1);
  },

  renderCast() {
    const cast = this.data.credits?.cast?.slice(0, 12) || [];
    if (!cast.length) return "";
    return `
      <div class="content-row" style="margin-top:2.5rem">
        <div class="row-header"><h2 class="row-title">Cast</h2></div>
        <div class="cast-strip">
          ${cast.map(p => `
            <div class="cast-card">
              <div class="cast-avatar">
                <img src="${p.profile_path ? API.img(p.profile_path, "w185") : 'https://placehold.co/80x80/111/333?text=?'}" alt="${p.name}" loading="lazy">
              </div>
              <div class="cast-name">${p.name}</div>
              <div class="cast-character">${p.character || ""}</div>
            </div>`).join("")}
        </div>
      </div>`;
  },

  renderSeasons() {
    const d = this.data;
    const seasons = (d.seasons || []).filter(s => s.season_number > 0);
    return `
      <div class="content-row">
        <div class="row-header"><h2 class="row-title">Episodes</h2></div>
        <div class="season-tabs">
          ${seasons.map(s => `
            <button class="season-tab ${s.season_number === 1 ? "active" : ""}"
              onclick="Detail.switchSeason(this, ${s.season_number})">
              Season ${s.season_number}
            </button>`).join("")}
        </div>
        <div class="episodes-list" id="episodesList">
          ${UI.spinner()}
        </div>
      </div>`;
  },

  async switchSeason(el, num) {
    document.querySelectorAll(".season-tab").forEach(b => b.classList.remove("active"));
    el.classList.add("active");
    this.currentSeason = num;
    await this.loadSeason(num);
  },

  async loadSeason(num) {
    const list = document.getElementById("episodesList");
    if (!list) return;
    list.innerHTML = UI.spinner();
    try {
      const season = await API.getSeason(this.data.id, num);
      list.innerHTML = (season.episodes || []).map(ep => `
        <div class="episode-card" onclick="location.href='watch.html?type=tv&id=${this.data.id}&season=${num}&episode=${ep.episode_number}'">
          <div class="episode-still">
            <img src="${ep.still_path ? API.img(ep.still_path, "w300") : 'https://placehold.co/300x169/111/333?text=EP'}" alt="" loading="lazy">
          </div>
          <div class="episode-details">
            <div class="episode-num">S${String(num).padStart(2,"0")}E${String(ep.episode_number).padStart(2,"0")}</div>
            <div class="episode-title">${ep.name || `Episode ${ep.episode_number}`}</div>
            <p class="episode-overview">${ep.overview || ""}</p>
          </div>
        </div>`).join("");
    } catch {
      list.innerHTML = `<p style="color:var(--text-muted)">Could not load episodes.</p>`;
    }
  },

  renderSimilar() {
    const items = [...(this.data.recommendations?.results || []), ...(this.data.similar?.results || [])]
      .filter((v, i, a) => a.findIndex(x => x.id === v.id) === i)
      .filter(i => i.poster_path)
      .slice(0, 20);
    if (!items.length) return "";
    return UI.row("More Like This", items, this.type);
  },

  toggleWL() {
    const d = this.data;
    const item = {
      id: d.id,
      type: this.type,
      title: d.title || d.name,
      poster_path: d.poster_path,
      vote_average: d.vote_average,
      release_date: d.release_date || d.first_air_date,
    };
    const added = UI.toggleWatchlist(item);
    const btn = document.getElementById("wlBtn");
    if (btn) {
      btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="${added ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        ${added ? "In Watchlist" : "Add to Watchlist"}`;
    }
  },
};
