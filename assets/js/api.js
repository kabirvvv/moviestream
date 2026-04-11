// ============================================================
//  STREAMVAULT — TMDB API Layer
// ============================================================

const API = {
  async fetch(endpoint, params = {}) {
    const url = new URL(`${CONFIG.TMDB_BASE_URL}${endpoint}`);
    url.searchParams.set("api_key", CONFIG.TMDB_API_KEY);
    for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
    const res = await fetch(url);
    if (!res.ok) throw new Error(`TMDB API error: ${res.status}`);
    return res.json();
  },

  img(path, size = "w500") {
    if (!path) return "/assets/img/placeholder.jpg";
    return `${CONFIG.TMDB_IMG_BASE}/${size}${path}`;
  },

  playerURL(type, id, season, episode) {
    let src = `${CONFIG.PLAYER_BASE}/${type}/${id}`;
    if (type === "tv" && season && episode) src += `/${season}/${episode}`;
    src += `?color=${CONFIG.PLAYER_COLOR}&nextEpisode=true&episodeSelector=true&autoplayNextEpisode=true&overlay=true`;
    // Restore progress from localStorage
    const key = `progress_${type}_${id}${season ? `_s${season}e${episode}` : ""}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const { timestamp } = JSON.parse(saved);
      if (timestamp > 30) src += `&progress=${Math.floor(timestamp)}`;
    }
    return src;
  },

  // ── Movies ─────────────────────────────────────────────────
  async getTrending(mediaType = "movie", time = "week") {
    return this.fetch(`/trending/${mediaType}/${time}`);
  },
  async getPopularMovies(page = 1) {
    return this.fetch("/movie/popular", { page });
  },
  async getTopRatedMovies(page = 1) {
    return this.fetch("/movie/top_rated", { page });
  },
  async getNowPlaying(page = 1) {
    return this.fetch("/movie/now_playing", { page });
  },
  async getUpcoming(page = 1) {
    return this.fetch("/movie/upcoming", { page });
  },
  async getMovie(id) {
    return this.fetch(`/movie/${id}`, {
      append_to_response: "credits,videos,similar,recommendations,images",
    });
  },
  async getMoviesByGenre(genreId, page = 1) {
    return this.fetch("/discover/movie", {
      with_genres: genreId,
      sort_by: "popularity.desc",
      page,
    });
  },

  // ── TV Shows ───────────────────────────────────────────────
  async getPopularTV(page = 1) {
    return this.fetch("/tv/popular", { page });
  },
  async getTopRatedTV(page = 1) {
    return this.fetch("/tv/top_rated", { page });
  },
  async getAiringToday(page = 1) {
    return this.fetch("/tv/airing_today", { page });
  },
  async getOnAir(page = 1) {
    return this.fetch("/tv/on_the_air", { page });
  },
  async getTV(id) {
    return this.fetch(`/tv/${id}`, {
      append_to_response: "credits,videos,similar,recommendations,images",
    });
  },
  async getSeason(id, season) {
    return this.fetch(`/tv/${id}/season/${season}`);
  },
  async getTVByGenre(genreId, page = 1) {
    return this.fetch("/discover/tv", {
      with_genres: genreId,
      sort_by: "popularity.desc",
      page,
    });
  },

  // ── Search ─────────────────────────────────────────────────
  async search(query, page = 1) {
    return this.fetch("/search/multi", {
      query,
      page,
      include_adult: false,
    });
  },

  // ── Genres ─────────────────────────────────────────────────
  async getGenres(type = "movie") {
    return this.fetch(`/genre/${type}/list`);
  },
};
