import type { Basics, Resume } from "@/lib/resume/schema";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/** "2020-03" -> "Mar 2020"; "2020" -> "2020"; anything else returned as-is. */
export function fmtDate(d?: string): string {
  if (!d) return "";
  const m = /^(\d{4})-(\d{2})/.exec(d);
  if (m) {
    const mi = parseInt(m[2], 10) - 1;
    return `${MONTHS[mi] ?? ""} ${m[1]}`.trim();
  }
  return d;
}

/** "Mar 2020 – Present" style date range. */
export function fmtRange(start?: string, end?: string): string {
  const s = fmtDate(start);
  const e = end ? fmtDate(end) : start ? "Present" : "";
  if (s && e) return `${s} – ${e}`;
  return s || e || "";
}

/** Flatten a basics.location into a single human string. */
export function fmtLocation(basics: Basics): string {
  const loc = basics.location;
  if (!loc) return "";
  return [loc.city, loc.region, loc.countryCode].filter(Boolean).join(", ");
}

/** The contact line parts (email · phone · location · links). */
export function contactParts(basics: Basics): string[] {
  const parts = [basics.email, basics.phone, fmtLocation(basics), basics.url].filter(
    (p): p is string => !!p && p.length > 0,
  );
  for (const p of basics.profiles ?? []) {
    const v = p.url || p.username;
    if (v) parts.push(v);
  }
  return parts;
}

/** "React · TypeScript · Node.js" from the skills section. */
export function skillLine(resume: Resume): string {
  const labels: string[] = [];
  for (const s of resume.skills) {
    if (s.name) labels.push(s.name);
    for (const k of s.keywords ?? []) labels.push(k);
  }
  return labels.join(" · ");
}
