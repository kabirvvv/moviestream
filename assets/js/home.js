// ============================================================
//  STREAMVAULT — Homepage
// ============================================================

let heroItems = [];
let heroIndex = 0;
let heroTimer;
const HERO_DURATION = 7000;

async function initHero() {
  const data = await API.getTrending("all", "day");
  heroItems = data.results.filter(i => i.media_type !== "person" && i.backdrop_path).slice(0, 6);
  renderHero(0);
  renderHeroThumbs();
  startHeroRotation();
}

function renderHero(idx) {
  heroIndex = idx;
  const item = heroItems[idx];
  if (!item) return;

  const type = item.media_type;
  const title = item.title || item.name;
  const date = item.release_date || item.first_air_date;
  const detailURL = type === "movie" ? `movie.html?id=${item.id}` : `tv.html?id=${item.id}`;
  const watchURL  = type === "movie"
    ? `watch.html?type=movie&id=${item.id}`
    : `watch.html?type=tv&id=${item.id}&season=1&episode=1`;

  const bg = document.getElementById("heroBg");
  bg.style.transition = "opacity 0.7s ease";
  bg.style.opacity = "0";
  setTimeout(() => {
    bg.style.backgroundImage = `url(${API.img(item.backdrop_path, "original")})`;
    bg.style.opacity = "1";
    bg.classList.add("animating");
  }, 350);

  document.getElementById("heroBadge").innerHTML =
    `<span class="hero-badge-dot"></span>${type === "movie" ? "Trending Film" : "Trending Series"}`;
  document.getElementById("heroTitle").textContent = title;
  document.getElementById("heroYear").textContent = UI.year(date);
  document.getElementById("heroRating").innerHTML = UI.ratingBadge(item.vote_average);
  document.getElementById("heroOverview").textContent = item.overview || "";
  document.getElementById("heroWatchBtn").href  = watchURL;
  document.getElementById("heroDetailBtn").href = detailURL;

  document.querySelectorAll(".hero-thumb").forEach((el, i) => {
    el.classList.toggle("active", i === idx);
  });

  if (typeof Anim !== "undefined") Anim.startHeroProgress();
}

function renderHeroThumbs() {
  const strip = document.getElementById("heroThumbs");
  strip.innerHTML = heroItems.map((item, i) => `
    <div class="hero-thumb ${i === 0 ? "active" : ""}" onclick="renderHero(${i}); resetTimer()">
      <img src="${API.img(item.poster_path, "w92")}" alt="${item.title || item.name}">
    </div>`).join("");
}

function startHeroRotation() {
  heroTimer = setInterval(() => {
    const next = (heroIndex + 1) % heroItems.length;
    renderHero(next);
  }, HERO_DURATION);
}

function resetTimer() {
  clearInterval(heroTimer);
  if (typeof Anim !== "undefined") cancelAnimationFrame(Anim.heroRafId);
  startHeroRotation();
}

async function loadHomeRows() {
  const main = document.getElementById("homeContent");
  main.innerHTML = `<div class="content-section">${UI.skeletons(20)}</div>`;

  const [trending, nowPlaying, topMovies, popularTV, topTV] = await Promise.all([
    API.getTrending("movie", "week"),
    API.getNowPlaying(),
    API.getTopRatedMovies(),
    API.getPopularTV(),
    API.getTopRatedTV(),
  ]);

  main.innerHTML = `<div class="content-section" id="rowsWrap"></div>`;
  const wrap = document.getElementById("rowsWrap");

  wrap.innerHTML = [
    UI.row("Trending This Week",      trending.results,   "movie", "movies.html"),
    UI.row("Now Playing",             nowPlaying.results, "movie", "movies.html"),
    UI.row("Top Rated Films",         topMovies.results,  "movie", "movies.html"),
    UI.row("Popular TV Shows",        popularTV.results,  "tv",    "shows.html"),
    UI.row("Top Rated Series",        topTV.results,      "tv",    "shows.html"),
  ].join("");

  if (typeof Anim !== "undefined") {
    Anim.initDragScroll();
    Anim.initLazyImages();
    Anim.initReveal();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await Promise.all([initHero(), loadHomeRows()]);
  document.body.classList.add("page-enter");
});
