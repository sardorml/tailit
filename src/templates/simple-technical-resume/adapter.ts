import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtLocation,
  profileHandle,
  skillGroups,
  stripProtocol,
} from "../shared";

/**
 * Date triple the .typ turns into a `datetime(year:, month:, day:)`.
 * The simple-technical-resume package hard-requires `datetime` values for
 * the start/end of every work + education entry, so all date parsing happens
 * here and the .typ just reconstructs the datetime from these numbers.
 */
type DateParts = { year: number; month: number; day: number };

/** "2021-03" -> {2021,3,1}; "2014" -> {2014,1,1}; "2014-07-15" -> {2014,7,15}. */
function parseDate(d?: string): DateParts | null {
  if (!d) return null;
  const m = /^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/.exec(d.trim());
  if (!m) return null;
  const year = parseInt(m[1], 10);
  if (!Number.isFinite(year)) return null;
  const month = m[2] ? Math.min(12, Math.max(1, parseInt(m[2], 10))) : 1;
  const day = m[3] ? Math.min(28, Math.max(1, parseInt(m[3], 10))) : 1;
  return { year, month, day };
}

/**
 * Resolve an entry's start/end into datetime triples.
 * end === null in the JSON signals "Present" (the package accepts the string
 * "Present" for an ongoing end-date). Start always falls back to end (or a
 * neutral year) so the package's `datetime` assertion never fails.
 */
function range(start?: string, end?: string): { start: DateParts; end: DateParts | null } {
  const s = parseDate(start);
  const e = parseDate(end);
  if (end) {
    // Both dates known.
    return { start: s ?? e ?? { year: 1970, month: 1, day: 1 }, end: e };
  }
  // No end date -> ongoing. Need a valid start datetime regardless.
  return { start: s ?? { year: 1970, month: 1, day: 1 }, end: null };
}

/** JSON shape consumed by simple-technical-resume/resume.typ (markup-driven). */
export function adapt(resume: Resume) {
  const { basics, work, education, projects } = resume;

  // The package's website/linkedin/github args prepend the host themselves,
  // so we feed bare handles/paths (no protocol, no host).
  const site = basics.url ? stripProtocol(basics.url) : "";

  return {
    name: basics.name || "Your Name",
    phone: basics.phone || "",
    location: fmtLocation(basics),
    email: basics.email || "",
    website: site,
    github: profileHandle(resume, "github"),
    linkedin: profileHandle(resume, "linkedin"),
    education: education.map((e) => {
      const r = range(e.startDate, e.endDate);
      return {
        institution: e.institution || "",
        location: "",
        degree: degreeLine(e.studyType, undefined, e.score),
        major: e.area || "",
        start: r.start,
        end: r.end,
        highlights: (e.courses ?? []).filter(Boolean),
      };
    }),
    work: work.map((w) => {
      const r = range(w.startDate, w.endDate);
      return {
        title: w.position || "",
        company: w.name || "",
        location: w.location || "",
        start: r.start,
        end: r.end,
        highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
      };
    }),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      stack: (p.keywords ?? []).filter(Boolean).join(", "),
      url: p.url ? (/^https?:\/\//.test(p.url) ? p.url : `https://${p.url}`) : "",
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    // The package renders a single bullet list of "Label: items" lines.
    skills: skillGroups(resume).map((g) => ({
      label: g.label,
      items: g.items.join(", "),
    })),
  };
}
