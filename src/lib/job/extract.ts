import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

/**
 * Pull readable job-posting text from a URL using a layered strategy:
 *   1. Jina Reader (https://r.jina.ai/<url>) — free, handles most JS-heavy pages.
 *   2. Direct fetch + Mozilla Readability (via linkedom) — for simple pages.
 *   3. Raw body text — last resort.
 * Throws if nothing usable is found (caller should fall back to pasted text).
 */

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

const MAX_CHARS = 16000;
const MIN_USABLE = 200;

export type ExtractSource = "jina" | "readability" | "raw";
export interface ExtractResult {
  text: string;
  source: ExtractSource;
}

function clip(t: string): string {
  return t.replace(/\n{3,}/g, "\n\n").trim().slice(0, MAX_CHARS);
}

async function fetchWithTimeout(url: string, init: RequestInit, ms: number): Promise<Response> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(id);
  }
}

export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  // Throws if not a valid URL — caller handles.
  return new URL(withScheme).toString();
}

export async function extractJobText(url: string): Promise<ExtractResult> {
  // 1. Jina Reader
  try {
    const res = await fetchWithTimeout(
      `https://r.jina.ai/${url}`,
      { headers: { "User-Agent": UA, "X-Return-Format": "markdown" } },
      15000,
    );
    if (res.ok) {
      const text = clip(await res.text());
      if (text.length > MIN_USABLE) return { text, source: "jina" };
    }
  } catch {
    /* fall through */
  }

  // 2. Direct fetch + Readability
  try {
    const res = await fetchWithTimeout(
      url,
      { headers: { "User-Agent": UA, Accept: "text/html,application/xhtml+xml" } },
      15000,
    );
    if (res.ok) {
      const html = await res.text();
      const { document } = parseHTML(html);
      try {
        // linkedom's document is structurally compatible with Readability.
        const article = new Readability(document as unknown as Document).parse();
        const text = clip(article?.textContent ?? "");
        if (text.length > MIN_USABLE) return { text, source: "readability" };
      } catch {
        /* fall through to raw */
      }
      const body = clip(document.body?.textContent ?? "");
      if (body.length > MIN_USABLE) return { text: body, source: "raw" };
    }
  } catch {
    /* fall through */
  }

  throw new Error(
    "Couldn't read that job posting automatically (the site may block bots). Paste the job description text instead.",
  );
}
