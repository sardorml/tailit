import type { Resume } from "@/lib/resume/schema";
import { degreeLine, profileHandle, profileUrl, skillGroups, stripProtocol } from "../shared";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2020-03" -> "Mar 2020"; "2020" -> "2020"; else as-is. (shared has no exported single-date fmt.) */
function fmtDate(d?: string): string {
  if (!d) return "";
  const m = /^(\d{4})-(\d{2})/.exec(d);
  if (m) return `${MONTHS[parseInt(m[2], 10) - 1] ?? ""} ${m[1]}`.trim();
  return d;
}

/**
 * Adapter for @preview/simple-xd-resume:0.1.0 (markup-driven via `make-resume.with`).
 *
 * The package's `make-resume` show rule takes structured args:
 *   firstname, lastname, headlines, phone-number, email, github/linkedin/
 *   telegram ({username}), homepage ({url, display}), experiences, educations,
 *   skills. Experience/education items are {organization, startdate, enddate,
 *   title, responsibilities[], label}. `enddate: none` renders "Present".
 *
 * Two gotchas handled here:
 *  - `responsibilities` are `eval`-ed in markup mode by the package, so any
 *    Typst-special chars in user text must be escaped (done via `esc`).
 *  - The package checks `!= none` for optional contacts but defaults them to an
 *    empty dict; we pass real values or omit, and the .typ coerces empties to
 *    none, so we just emit "" / absent and let resume.typ decide.
 */

/** Escape characters that are significant in Typst markup mode. */
function esc(s: string): string {
  return s.replace(/([\\#$*_`<>@~\[\]])/g, "\\$1");
}

/** Split a full name into first + the rest (everything after the first token). */
function splitName(name: string): { first: string; last: string } {
  const trimmed = (name || "").trim();
  if (!trimmed) return { first: "Your", last: "Name" };
  const parts = trimmed.split(/\s+/);
  if (parts.length === 1) return { first: parts[0], last: "" };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

export function adapt(resume: Resume) {
  const { basics, work, education, projects } = resume;
  const { first, last } = splitName(basics.name || "");

  const headlines = (basics.label ? [basics.label] : []).map((name) => ({
    name,
    linkto: "",
  }));

  const github = profileHandle(resume, "github");
  const linkedin = profileHandle(resume, "linkedin");
  const homepageUrl = basics.url || profileUrl(resume, "website") || "";

  // Each experience/education item needs a UNIQUE label string for the package.
  let labelSeq = 0;
  const nextLabel = (prefix: string) => `${prefix}-${labelSeq++}`;

  const experiences = work.map((w) => ({
    organization: w.name || "",
    startdate: fmtDate(w.startDate),
    enddate: w.endDate ? fmtDate(w.endDate) : null,
    title: w.position || "",
    label: nextLabel("work"),
    responsibilities: [w.summary, ...(w.highlights ?? [])]
      .filter(Boolean)
      .map((h) => esc(h as string)),
  }));

  // Fold projects into the experience section so they aren't dropped.
  for (const p of projects) {
    const rels = [p.description, ...(p.highlights ?? [])].filter(Boolean) as string[];
    if (p.url) rels.push(`Link: ${stripProtocol(p.url)}`);
    experiences.push({
      organization: p.url ? stripProtocol(p.url) : "Project",
      startdate: fmtDate(p.startDate),
      enddate: p.endDate ? fmtDate(p.endDate) : null,
      title: p.name || "Project",
      label: nextLabel("project"),
      responsibilities: rels.map(esc),
    });
  }

  const educations = education.map((e) => ({
    organization: e.institution || "",
    startdate: fmtDate(e.startDate),
    enddate: e.endDate ? fmtDate(e.endDate) : null,
    title: degreeLine(e.studyType, e.area, e.score) || e.institution || "",
    label: nextLabel("edu"),
    responsibilities: (e.courses ?? []).filter(Boolean).map((c) => esc(c)),
  }));

  const skills = skillGroups(resume).map((g) => ({
    title: g.label || "Skills",
    items: g.items,
  }));

  return {
    firstname: first,
    lastname: last,
    headlines,
    phone: basics.phone || "",
    email: basics.email || "",
    github,
    linkedin,
    homepageUrl,
    homepageDisplay: homepageUrl ? stripProtocol(homepageUrl) : "",
    experiences,
    educations,
    skills,
  };
}
