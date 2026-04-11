// ============================================================
//  STREAMVAULT — Watch Page
// ============================================================

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(location.search);
  const type = params.get("type"); // "movie" | "tv"
  const id = params.get("id");
  const season = params.get("season");
  const episode = params.get("episode");

  if (!type || !id) { location.href = "index.html"; return; }

  // Build player URL
  const src = API.playerURL(type, id, season, episode);
  document.getElementById("playerFrame").src = src;

  // Back link
  const backHref = type === "movie" ? `movie.html?id=${id}` : `tv.html?id=${id}`;
  document.getElementById("playerBack").href = backHref;

  // Fetch metadata
  try {
    const data = type === "movie" ? await API.getMovie(id) : await API.getTV(id);
    const title = data.title || data.name;
    document.title = `${title} — StreamVault`;
    document.getElementById("playerTitle").textContent = title;

    let metaStr = type === "movie"
      ? `${UI.year(data.release_date)} · ${UI.runtime(data.runtime)}`
      : `Season ${season} · Episode ${episode}`;

    // For TV, get episode name
    if (type === "tv" && season && episode) {
      try {
        const seasonData = await API.getSeason(id, season);
        const ep = seasonData.episodes?.find(e => e.episode_number == episode);
        if (ep) metaStr += ` · ${ep.name}`;
      } catch {}
    }

    document.getElementById("playerMeta").textContent = metaStr;

    // Next/prev episode buttons for TV
    if (type === "tv" && season && episode) {
      renderEpisodeNav(data, +season, +episode, id);
    }
  } catch (e) {
    console.error("Could not load metadata", e);
  }

  document.body.classList.add("page-enter");
});

function renderEpisodeNav(show, season, episode, id) {
  const nav = document.getElementById("episodeNav");
  if (!nav) return;

  const seasons = (show.seasons || []).filter(s => s.season_number > 0);
  const currentSeasonData = seasons.find(s => s.season_number === season);
  const epCount = currentSeasonData?.episode_count || 1;

  const prevEp = episode > 1
    ? `watch.html?type=tv&id=${id}&season=${season}&episode=${episode - 1}`
    : season > 1 ? `watch.html?type=tv&id=${id}&season=${season - 1}&episode=1` : null;

  const nextEp = episode < epCount
    ? `watch.html?type=tv&id=${id}&season=${season}&episode=${episode + 1}`
    : seasons.find(s => s.season_number === season + 1)
      ? `watch.html?type=tv&id=${id}&season=${season + 1}&episode=1`
      : null;

  nav.innerHTML = `
    <div class="episode-nav-btns">
      ${prevEp ? `<a class="btn btn-secondary" href="${prevEp}">← Previous</a>` : ""}
      ${nextEp ? `<a class="btn btn-primary" href="${nextEp}">Next Episode →</a>` : ""}
    </div>`;
}
