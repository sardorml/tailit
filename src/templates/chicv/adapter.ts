import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtLocation,
  fmtRange,
  languageLines,
  profileLine,
  skillGroups,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by chicv/resume.typ. The @preview/chicv package is
 * markup-driven (its template is plain Typst: a `= Name` heading, a contact
 * line, then `== Section` + `#chiline()` blocks with `*Title* #h(1fr) dates`
 * rows). We mirror that structure from this object. All human formatting
 * (dates, degree lines, contact links) is done here so the .typ stays dumb.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // Contact line: email, profile links (github/linkedin), and personal site.
  const links: string[] = [];
  const github = profileLine(resume, "github", "github");
  if (github) links.push(stripProtocol(github.replace(/^github:\s*/i, "")));
  const linkedin = profileLine(resume, "linkedin", "linkedin");
  if (linkedin) links.push(stripProtocol(linkedin.replace(/^linkedin:\s*/i, "")));
  const site = basics.url ? stripProtocol(basics.url) : "";

  return {
    name: basics.name || "Your Name",
    email: basics.email || "",
    phone: basics.phone || "",
    location: fmtLocation(basics),
    site,
    links,
    summary: basics.summary || "",
    education: education.map((e) => ({
      institution: e.institution || "",
      url: e.url ? stripProtocol(e.url) : "",
      dates: fmtRange(e.startDate, e.endDate),
      degree: degreeLine(e.studyType, e.area, e.score),
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    work: work.map((w) => ({
      company: w.name || "",
      title: w.position || "",
      location: w.location || "",
      dates: fmtRange(w.startDate, w.endDate),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      url: p.url ? stripProtocol(p.url) : "",
      dates: fmtRange(p.startDate, p.endDate),
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    skills: skillGroups(resume),
    certificates: certificates.map((c) => ({
      name: c.name || "",
      issuer: c.issuer || "",
      date: c.date || "",
    })),
    languages: languageLines(resume),
  };
}
