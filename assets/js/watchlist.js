// ============================================================
//  STREAMVAULT — Watchlist Page
// ============================================================

document.addEventListener("DOMContentLoaded", () => {
  const list = UI.getWatchlist();
  const grid = document.getElementById("watchlistGrid");
  const empty = document.getElementById("watchlistEmpty");
  const count = document.getElementById("watchlistCount");

  if (!list.length) {
    grid.style.display = "none";
    empty.style.display = "block";
    count.textContent = "0 titles";
    return;
  }

  count.textContent = `${list.length} title${list.length !== 1 ? "s" : ""}`;
  empty.style.display = "none";
  grid.innerHTML = list.map(i => UI.card(i, i.type)).join("");
  document.body.classList.add("page-enter");
});
