import type { Resume } from "@/lib/resume/schema";
import { contactParts, fmtLocation, fmtRange } from "./format";

/**
 * Shared building blocks for template adapters. An "adapter" maps the canonical
 * `Resume` into whatever JSON shape a given Typst template expects. All human
 * formatting (dates, degree strings, contact lines) lives here so the .typ
 * files stay dumb. Keep everything pure — adapters are imported by both the
 * server (compile) and the client (registry metadata).
 */

export { contactParts, fmtLocation, fmtRange };

/** Strip protocol + trailing slash for display, e.g. "https://x.com/" -> "x.com". */
export function stripProtocol(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

/** "B.Sc. in Computer Science · 3.9 GPA" from an education entry. */
export function degreeLine(studyType?: string, area?: string, score?: string): string {
  const head = [studyType, area].filter(Boolean).join(" in ");
  return [head, score].filter(Boolean).join(" · ");
}

/** The first profile whose network name contains `kind` (case-insensitive). */
export function findProfile(resume: Resume, kind: string) {
  return (resume.basics.profiles ?? []).find((p) =>
    (p.network ?? "").toLowerCase().includes(kind.toLowerCase()),
  );
}

/** "GitHub: handle" style line for a profile, or "" if absent. */
export function profileLine(resume: Resume, kind: string, label = kind): string {
  const p = findProfile(resume, kind);
  if (!p) return "";
  const handle = p.username || (p.url ? stripProtocol(p.url) : "");
  return handle ? `${label}: ${handle}` : "";
}

/** A profile's best display handle (username, else stripped url). */
export function profileHandle(resume: Resume, kind: string): string {
  const p = findProfile(resume, kind);
  if (!p) return "";
  return p.username || (p.url ? stripProtocol(p.url) : "");
}

/** A profile's URL, or "". */
export function profileUrl(resume: Resume, kind: string): string {
  return findProfile(resume, kind)?.url || "";
}

/** Flatten skills into "Group: a, b, c" lines (or bare names/keywords). */
export function skillLines(resume: Resume): string[] {
  const out: string[] = [];
  for (const s of resume.skills) {
    const kws = (s.keywords ?? []).filter(Boolean);
    if (s.name && kws.length) out.push(`${s.name}: ${kws.join(", ")}`);
    else if (s.name) out.push(s.name);
    else out.push(...kws);
  }
  return out;
}

/** Skills as { label, items } groups (label may be empty). */
export function skillGroups(resume: Resume): { label: string; items: string[] }[] {
  return resume.skills
    .map((s) => {
      const items = (s.keywords ?? []).filter(Boolean);
      if (items.length) return { label: s.name || "", items };
      if (s.name) return { label: "", items: [s.name] };
      return { label: "", items: [] as string[] };
    })
    .filter((g) => g.items.length > 0);
}

/** Every individual skill keyword/name as a flat list. */
export function skillFlat(resume: Resume): string[] {
  const out: string[] = [];
  for (const s of resume.skills) {
    if (s.name && !(s.keywords ?? []).length) out.push(s.name);
    for (const k of s.keywords ?? []) if (k) out.push(k);
  }
  return out;
}

/** "English (Native)" style language strings. */
export function languageLines(resume: Resume): string[] {
  return resume.languages
    .map((l) => (l.fluency ? `${l.language} (${l.fluency})` : l.language || ""))
    .filter(Boolean);
}
