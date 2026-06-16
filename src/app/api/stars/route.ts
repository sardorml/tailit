import { NextResponse } from "next/server";
import { GITHUB_REPO } from "@/lib/site";

export const runtime = "nodejs";

/**
 * GET /api/stars -> { stars: number | null }
 *
 * Server-side, cached star count for the GitHub repo. The fetch is revalidated
 * every 5 minutes — fresh enough to watch the count climb during a launch, while
 * keeping GitHub's unauthenticated API (60 req/hr per IP) to ~12 calls/hr no
 * matter how much visitor traffic hits the page (a naive per-visitor client
 * fetch would rate-limit during a spike). Failures degrade to `null` (the UI
 * just hides the count) rather than erroring.
 */
export async function GET() {
  try {
    const res = await fetch(`https://api.github.com/repos/${GITHUB_REPO}`, {
      headers: { Accept: "application/vnd.github+json" },
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
