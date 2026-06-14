import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtLocation,
  fmtRange,
  languageLines,
  profileUrl,
  skillGroups,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by acadennial-cv/resume.typ. The package is markup-driven
 * (a `resume.with(...)` show rule + `== Section` headings + `*-item-list`
 * helpers using a 3-column grid: c1 = dates/label, c2 = title, c3 = location).
 * We map the canonical Resume onto those academic primitives. All formatting
 * (dates, degree lines, contact strings) is done here so the .typ stays dumb.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  return {
    name: basics.name || "Your Name",
    // Header left block: target role + location, line by line.
    primaryInfo: [basics.label || "", fmtLocation(basics)].filter(Boolean),
    // Header right block: contact + links.
    email: basics.email || "",
    phone: basics.phone || "",
    site: basics.url ? stripProtocol(basics.url) : "",
    siteUrl: basics.url || "",
    linkedin: profileUrl(resume, "linkedin"),
    github: profileUrl(resume, "github"),
    scholar: profileUrl(resume, "scholar"),
    orcid: profileUrl(resume, "orcid"),
    x: profileUrl(resume, "twitter") || profileUrl(resume, "x"),
    summary: basics.summary || "",
    // Education -> employment-head-item-list: c2 institution, c3 location, body degree.
    education: education.map((e) => ({
      institution: e.institution || "",
      location: "",
      body: [degreeLine(e.studyType, e.area, e.score), fmtRange(e.startDate, e.endDate)]
        .filter(Boolean)
        .join(", "),
    })),
    // Work -> meta-entry-item-list: c1 dates, c2 title, c3 company+location, body bullets.
    work: work.map((w) => ({
      dates: fmtRange(w.startDate, w.endDate),
      title: w.position || "",
      company: [w.name, w.location].filter(Boolean).join(", "),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    // Projects -> meta-entry-item-list: c1 dates, c2 name, c3 url, body bullets.
    projects: projects.map((p) => ({
      dates: fmtRange(p.startDate, p.endDate),
      name: p.name || "Project",
      url: p.url ? stripProtocol(p.url) : "",
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    // Skills -> "Group: a, b, c" lines.
    skills: skillGroups(resume).map((g) => ({ label: g.label, items: g.items })),
    // Certificates -> meta-entry-item-list: c1 date, c2 name, c3 issuer.
    certificates: certificates.map((c) => ({
      date: c.date || "",
      name: c.name || "",
      issuer: c.issuer || "",
    })),
    languages: languageLines(resume),
  };
}
