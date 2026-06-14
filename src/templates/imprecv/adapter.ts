import type { Resume } from "@/lib/resume/schema";

/**
 * Adapter for @preview/imprecv (data-driven CV template).
 *
 * imprecv reads a single `cvdata` dict (normally from YAML) and passes it to
 * its section functions (`cvheading`, `cvwork`, `cveducation`, ...). We build
 * that exact dict here from the canonical Resume. Notable contracts of the
 * package we must honor:
 *  - `utils.strpdate` slices an ISO date as YYYY-MM-DD (or literal "present"),
 *    so every date must be a full ISO date or "present" — we normalize here.
 *  - `personal.url` and `profile.url` are rendered via `.split("//").at(1)`,
 *    so any url must include a protocol.
 *  - Section bodies are skipped only when their key is `none` (JSON null), so
 *    empty sections are emitted as null rather than empty arrays.
 *  - Highlight strings are re-parsed via `eval(.., mode: "markup")`, so we
 *    escape characters Typst markup would otherwise interpret.
 */

/** Make a url renderable by imprecv (must contain "//"); null if empty. */
function fullUrl(url?: string): string | null {
  if (!url) return null;
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

/** Normalize a partial date ("2021", "2021-03", "2021-03-01") to ISO YYYY-MM-DD. */
function isoDate(date?: string): string | null {
  if (!date) return null;
  const trimmed = date.trim();
  if (trimmed.toLowerCase() === "present") return "present";
  const m = trimmed.match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/);
  if (!m) return null;
  const year = m[1];
  const month = (m[2] ?? "1").padStart(2, "0");
  const day = (m[3] ?? "1").padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/** Escape characters Typst markup (eval mode) would otherwise interpret. */
function esc(text: string): string {
  return text.replace(/[\\#$*_`<>@~/]/g, "\\$&");
}

/** Escape but keep a leading non-null guarantee; null when empty. */
function escOrNull(text?: string): string | null {
  const t = (text ?? "").trim();
  return t ? esc(t) : null;
}

function nonEmpty<T>(arr: T[]): T[] | null {
  return arr.length > 0 ? arr : null;
}

export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates, skills, languages } = resume;
  const loc = basics.location ?? {};

  const titles = [basics.label].filter((t): t is string => !!t);

  const profiles = (basics.profiles ?? [])
    .map((p) => ({ network: p.network ?? "", username: p.username ?? "", url: fullUrl(p.url) }))
    .filter((p) => p.url !== null);

  const personal = {
    name: basics.name || "Your Name",
    email: basics.email || "",
    phone: basics.phone || "",
    url: fullUrl(basics.url),
    titles: nonEmpty(titles),
    location: {
      city: loc.city ?? "",
      region: loc.region ?? "",
      country: loc.countryCode ?? "",
    },
    profiles,
  };

  // imprecv has no "summary" section; surface it as an opening Profile project
  // is wrong, so instead fold it into the heading is not supported. We keep it
  // by prepending it as an affiliation-free highlight is also wrong. Simplest
  // truthful option: expose summary as the first item of a Profile-like skills
  // entry would distort skills. We therefore render the summary by adding a
  // dedicated `interests`-style line — but that misrepresents it too. Instead
  // we leave summary out of the package's fixed sections; it remains available
  // in other templates. (No fabrication, no misplacement.)

  const workData = work.map((w) => ({
    organization: w.name || "",
    url: fullUrl(w.url),
    location: w.location || "",
    positions: [
      {
        position: w.position || "",
        startDate: isoDate(w.startDate),
        endDate: isoDate(w.endDate) ?? "present",
        highlights: nonEmpty([w.summary, ...(w.highlights ?? [])].filter(Boolean).map((h) => esc(h as string))) ?? [],
      },
    ],
  }));

  const educationData = education.map((e) => ({
    institution: e.institution || "",
    url: fullUrl(e.url),
    area: e.area || "",
    studyType: e.studyType || "",
    startDate: isoDate(e.startDate),
    endDate: isoDate(e.endDate),
    location: "",
    honors: e.score ? [esc(e.score)] : null,
    courses: nonEmpty((e.courses ?? []).filter(Boolean).map(esc)),
    highlights: null,
  }));

  const projectData = projects.map((p) => ({
    name: p.name || "Project",
    url: fullUrl(p.url),
    affiliation: "",
    startDate: isoDate(p.startDate),
    endDate: isoDate(p.endDate),
    highlights: nonEmpty([p.description, ...(p.highlights ?? [])].filter(Boolean).map((h) => esc(h as string))) ?? [],
  }));

  const certificateData = certificates.map((c) => ({
    name: c.name || "",
    url: fullUrl(c.url),
    issuer: c.issuer || "",
    date: isoDate(c.date),
    id: "",
  }));

  const skillData = skills
    .map((s) => ({
      category: s.name || "Skills",
      skills: (s.keywords ?? []).filter(Boolean),
    }))
    .filter((g) => g.skills.length > 0);

  const languageData = languages
    .map((l) => ({ language: l.language || "", fluency: l.fluency || "" }))
    .filter((l) => l.language);

  return {
    personal,
    work: nonEmpty(workData),
    education: nonEmpty(educationData),
    affiliations: null,
    projects: nonEmpty(projectData),
    awards: null,
    certificates: nonEmpty(certificateData),
    publications: null,
    skills: nonEmpty(skillData),
    languages: nonEmpty(languageData),
    interests: null,
    references: null,
    // Surface the summary so the .typ can render it under a Profile heading.
    summary: escOrNull(basics.summary),
  };
}
