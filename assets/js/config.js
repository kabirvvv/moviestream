// ============================================================
//  STREAMVAULT — Configuration
//
//  Option A — Vercel deployment (recommended for production):
//    Leave TMDB_API_KEY as "" and set TMDB_API_KEY as an
//    environment variable in your Vercel project settings.
//    The serverless proxy at /api/tmdb will pick it up.
//
//  Option B — Local / non-Vercel hosting:
//    Paste your TMDB API key (v3 auth) into TMDB_API_KEY below.
//    The app will call TMDB directly from the browser.
//    Get a free key at: https://www.themoviedb.org/settings/api
// ============================================================

const CONFIG = {
  TMDB_API_KEY:  "",                    // ← paste your TMDB v3 API key here for local dev
  TMDB_PROXY:    "/api/tmdb",           // Vercel serverless proxy (used when key is empty)
  TMDB_IMG_BASE: "https://image.tmdb.org/t/p",
  PLAYER_BASE:   "https://player.videasy.net",
  PLAYER_COLOR:  "E8B44B",             // Amber accent — change to any hex (no #)
  SITE_NAME:     "STREAMVAULT",
};
