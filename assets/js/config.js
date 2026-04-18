// ============================================================
//  STREAMVAULT — Configuration
//  Set TMDB_API_KEY as an environment variable in Vercel.
//  Never put the API key here — it ships to every browser.
// ============================================================

const CONFIG = {
  TMDB_PROXY:    "/api/tmdb",           // Vercel serverless proxy
  TMDB_IMG_BASE: "https://image.tmdb.org/t/p",
  PLAYER_BASE:   "https://player.videasy.net",
  PLAYER_COLOR:  "E8B44B",             // Amber accent — change to any hex (no #)
  SITE_NAME:     "STREAMVAULT",
};
