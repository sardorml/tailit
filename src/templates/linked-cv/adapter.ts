import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  languageLines,
  profileHandle,
  skillGroups,
  stripProtocol,
} from "../shared";

/**
 * Wraps @preview/linked-cv (a LinkedIn-styled, timeline-based CV). The package
 * is markup-driven: a `linked-cv.with(...)` show rule plus `components.section`
 * headers, `components.employer-info`, `frame.connected-frames` timelines and a
 * `components.qualification` table. We generate that markup from this JSON.
 *
 * The package's duration helpers (`time-in-company`, `format-duration`) call
 * `parse-date`, which REQUIRES a "MM-YYYY" string (split on "-", both parts
 * must be ints). So every date we hand the .typ must be normalised to that
 * shape here, and a missing end date becomes the literal "current".
 */

/** Normalise any JSON-Resume date ("YYYY-MM", "YYYY", "YYYY-MM-DD") -> "MM-YYYY". */
function monthYear(date?: string): string | null {
  if (!date) return null;
  const m = date.match(/^(\d{4})(?:-(\d{1,2}))?/);
  if (!m) return null;
  const year = m[1];
  const month = m[2] ? String(Number(m[2])).padStart(2, "0") : "01";
  return `${month}-${year}`;
}

/** A duration tuple [start, end] the package can parse; end falls back to "current". */
function duration(startDate?: string, endDate?: string): [string, string] {
  const start = monthYear(startDate) ?? "01-2020";
  const end = monthYear(endDate) ?? "current";
  return [start, end];
}

/** Just the display year for qualification rows ("2014" from "2014-06"). */
function year(date?: string): string {
  if (!date) return "—";
  const m = date.match(/^(\d{4})/);
  return m ? m[1] : "—";
}

/** JSON shape consumed by linked-cv/resume.typ. */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const fullName = (basics.name || "Your Name").trim();
  const parts = fullName.split(/\s+/);
  const firstname = parts.shift() ?? "Your";
  const lastname = parts.join(" ") || "";

  return {
    firstname,
    lastname,
    socials: {
      email: basics.email || "",
      mobile: basics.phone || "",
      github: profileHandle(resume, "github"),
      linkedin: profileHandle(resume, "linkedin"),
    },
    summary: basics.summary || "",
    work: work.map((w) => ({
      company: w.name || "Company",
      title: w.position || "",
      duration: duration(w.startDate, w.endDate),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      degree: degreeLine(e.studyType, e.area) || e.institution || "Education",
      grade: e.score || "—",
      date: year(e.endDate || e.startDate),
      institution: e.institution || "",
    })),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      url: p.url ? stripProtocol(p.url) : "",
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    skills: skillGroups(resume).map((g) => ({
      label: g.label,
      items: g.items,
    })),
    certificates: certificates.map((c) => ({
      name: c.name || "",
      issuer: c.issuer || "",
      date: c.date || "",
    })),
    languages: languageLines(resume),
  };
}
