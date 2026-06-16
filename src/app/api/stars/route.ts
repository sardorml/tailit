import { NextResponse } from "next/server";
import { GITHUB_REPO } from "@/lib/site";

export const runtime = "nodejs";

/**
 * GET /api/stars -> { stars: number | null }
 *
 * Server-side, cached star count for the GitHub repo, revalidated every 5
 * minutes — fresh enough to watch the count climb during a launch while keeping
 * us to ~12 upstream calls/hr no matter how much visitor traffic hits the page.
 *
 * GitHub's REST API allows only 60 req/hr *per IP* unauthenticated, and shared
 * hosts (Render's free tier and most PaaS) route every tenant's traffic through
 * a handful of outbound IPs — so that quota is usually already spent by other
 * apps and the call 403s, leaving the count blank. Setting GITHUB_TOKEN (any
 * token works — even a classic PAT with no scopes, since the repo is public)
 * authenticates the request and raises the limit to 5,000/hr tied to the token
 * instead of the IP. Without it we still try unauthenticated (fine from a
 * residential dev IP). Any failure degrades to `null` and the UI hides the
 * count rather than erroring.
 */
export async function GET() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
      headers: {
        Accept: "application/vnd.github+json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      next: { revalidate: 300 },
    });
    if (!res.ok) return NextResponse.json({ stars: null });
    const data = await res.json();
    const stars = typeof data?.stargazers_count === "number" ? data.stargazers_count : null;
    return NextResponse.json({ stars });
  } catch {
    return NextResponse.json({ stars: null });
  }
}
