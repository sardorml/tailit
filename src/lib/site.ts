/**
 * Canonical base URL for this deployment. Local dev and forks fall back to
 * localhost; set NEXT_PUBLIC_SITE_URL in the environment (e.g.
 * `https://tailit.xyz` in production) so canonical links, robots.txt, the
 * sitemap, and the Open Graph card all point at the right host.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Bare host (no protocol/trailing slash) — used as a display label. */
export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "").replace(/\/$/, "");

/** GitHub repo (`owner/name`) this project lives in. Forks can override it. */
export const GITHUB_REPO = process.env.NEXT_PUBLIC_GITHUB_REPO ?? "sardorml/tailit";

/** Canonical GitHub URL for the repo. */
export const GITHUB_URL = `https://github.com/${GITHUB_REPO}`;
