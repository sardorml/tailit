import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtLocation,
  fmtRange,
  languageLines,
  profileHandle,
  skillGroups,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by butterick-resume/resume.typ. This package
 * (@preview/butterick-resume) is markup-driven: a `template` show rule, an
 * `introduction(name:, details:)` header, `= Section` headings and
 * `two-grid(left:, right:)` entry rows. We pre-format every string here so the
 * .typ stays dumb.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // Header detail lines (rendered one per line under the name).
  const location = fmtLocation(basics);
  const github = profileHandle(resume, "github");
  const linkedin = profileHandle(resume, "linkedin");
  const contact = [
    basics.phone || "",
    basics.email || "",
    basics.url ? stripProtocol(basics.url) : "",
  ].filter(Boolean);
  const handles = [
    github ? `GitHub: ${github}` : "",
    linkedin ? `LinkedIn: ${linkedin}` : "",
  ].filter(Boolean);
  const details: string[] = [];
  if (location) details.push(location);
  if (contact.length) details.push(contact.join("  ·  "));
  if (handles.length) details.push(handles.join("  ·  "));

  return {
    name: basics.name || "Your Name",
    label: basics.label || "",
    details,
    summary: basics.summary || "",
    education: education.map((e) => ({
      left: e.institution || "",
      right: fmtRange(e.startDate, e.endDate),
      subtitle: degreeLine(e.studyType, e.area, e.score),
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    work: work.map((w) => ({
      left: w.name || "",
      right: fmtRange(w.startDate, w.endDate),
      subtitle: [w.position, w.location].filter(Boolean).join("  —  "),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    projects: projects.map((p) => ({
      left: p.name || "Project",
      right: fmtRange(p.startDate, p.endDate),
      subtitle: p.url ? stripProtocol(p.url) : "",
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    skills: skillGroups(resume),
    certificates: certificates.map((c) => ({
      left: c.name || "",
      right: c.date || "",
      subtitle: c.issuer || "",
      highlights: [] as string[],
    })),
    languages: languageLines(resume),
  };
}
