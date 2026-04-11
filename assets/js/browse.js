// ============================================================
//  STREAMVAULT — Browse Pages (Movies & TV)
// ============================================================

const Browse = {
  mediaType: "movie",
  currentPage: 1,
  currentGenre: "",
  currentSort: "popularity.desc",
  totalPages: 1,
  genres: [],

  async init(type) {
    this.mediaType = type;
    document.title = type === "movie" ? "Movies — StreamVault" : "TV Shows — StreamVault";
    document.getElementById("pageTypeTitle").textContent = type === "movie" ? "Movies" : "TV Shows";

    await this.loadGenres();
    await this.load(1);
    UI.initInfiniteScroll(() => this.loadMore());
  },

  async loadGenres() {
    const data = await API.getGenres(this.mediaType);
    this.genres = data.genres;
    const genreBar = document.getElementById("genreBar");
    genreBar.innerHTML = `<button class="filter-chip active" data-genre="" onclick="Browse.setGenre(this, '')">All</button>`
      + data.genres.map(g =>
        `<button class="filter-chip" data-genre="${g.id}" onclick="Browse.setGenre(this, ${g.id})">${g.name}</button>`
      ).join("");
  },

  setGenre(el, genreId) {
    this.currentGenre = genreId;
    this.currentPage = 1;
    document.querySelectorAll(".filter-chip").forEach(b => b.classList.remove("active"));
    el.classList.add("active");
    document.getElementById("contentGrid").innerHTML = UI.skeletons(20);
    this.load(1, true);
  },

  setSort(val) {
    this.currentSort = val;
    this.currentPage = 1;
    document.getElementById("contentGrid").innerHTML = UI.skeletons(20);
    this.load(1, true);
  },

  async fetchPage(page) {
    if (this.currentGenre) {
      const fn = this.mediaType === "movie" ? API.getMoviesByGenre : API.getTVByGenre;
      return fn.call(API, this.currentGenre, page);
    }
    if (this.mediaType === "movie") {
      switch (this.currentSort) {
        case "vote_average.desc": return API.getTopRatedMovies(page);
        case "primary_release_date.desc": return API.getNowPlaying(page);
        default: return API.getPopularMovies(page);
      }
    } else {
      switch (this.currentSort) {
        case "vote_average.desc": return API.getTopRatedTV(page);
        case "first_air_date.desc": return API.getAiringToday(page);
        default: return API.getPopularTV(page);
      }
    }
  },

  async load(page, reset = false) {
    const grid = document.getElementById("contentGrid");
    if (reset) grid.innerHTML = "";
    if (page === 1 && !reset) grid.innerHTML = UI.skeletons(20);

    const data = await this.fetchPage(page);
    this.totalPages = data.total_pages;
    this.currentPage = page;

    if (page === 1 && !reset) grid.innerHTML = "";
    const items = data.results.filter(i => i.poster_path);
    grid.insertAdjacentHTML("beforeend", items.map(i => UI.card(i, this.mediaType)).join(""));
  },

  async loadMore() {
    if (this.currentPage >= this.totalPages) return;
    await this.load(this.currentPage + 1);
  },
};
