// ============================================================
//  STREAMVAULT — TMDB API Proxy (Vercel Serverless)
//  Set TMDB_API_KEY in your Vercel project environment variables.
//  This function proxies all TMDB requests so the key is never
//  exposed to the browser.
// ============================================================

export default async function handler(req, res) {
  const apiKey = process.env.TMDB_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "TMDB_API_KEY is not configured." });
  }

  const { endpoint, ...params } = req.query;

  // Validate endpoint — must be a relative path starting with "/"
  if (!endpoint || typeof endpoint !== "string" || !endpoint.startsWith("/")) {
    return res.status(400).json({ error: "Missing or invalid endpoint parameter." });
  }

  // Build the upstream TMDB URL
  const tmdbURL = new URL(`https://api.themoviedb.org/3${endpoint}`);
  tmdbURL.searchParams.set("api_key", apiKey);
  for (const [k, v] of Object.entries(params)) {
    tmdbURL.searchParams.set(k, String(v));
  }

  try {
    const upstream = await fetch(tmdbURL.toString());
    const data = await upstream.json();

    // Cache successful responses for 5 minutes at the CDN edge
    if (upstream.ok) {
      res.setHeader("Cache-Control", "s-maxage=300, stale-while-revalidate=600");
    }

    return res.status(upstream.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: "Failed to reach TMDB." });
  }
}
