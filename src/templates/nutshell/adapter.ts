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
 * JSON shape consumed by nutshell/resume.typ (markup-driven template).
 * nutshell is a single-column résumé built from `== Section` headings and
 * Typst term lists (`/ term: description`). We pre-format everything here.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // contact-details is rendered as a key/value table in the header.
  const contact: { key: string; value: string }[] = [];
  if (basics.location) {
    const loc = fmtLocation(basics);
    if (loc) contact.push({ key: "address", value: loc });
  }
  if (basics.phone) contact.push({ key: "mobile", value: basics.phone });
  if (basics.email) contact.push({ key: "email", value: basics.email });
  const github = profileHandle(resume, "github");
  if (github) contact.push({ key: "github", value: github });
  const linkedin = profileHandle(resume, "linkedin");
  if (linkedin) contact.push({ key: "linkedin", value: linkedin });
  if (basics.url) contact.push({ key: "web", value: stripProtocol(basics.url) });

  return {
    name: basics.name || "Your Name",
    title: basics.label || "",
    statement: basics.summary || "",
    lastUpdated: new Date().getFullYear().toString(),
    resumeUrl: basics.url ? stripProtocol(basics.url) : "",
    contact,
    work: work.map((w) => ({
      dates: fmtRange(w.startDate, w.endDate),
      role: w.position || "",
      company: w.name || "",
      location: w.location || "",
      lines: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    skills: skillGroups(resume).map((g) => ({
      label: g.label,
      items: g.items,
    })),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      url: p.url ? stripProtocol(p.url) : "",
      dates: fmtRange(p.startDate, p.endDate),
      lines: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      dates: fmtRange(e.startDate, e.endDate),
      degree: degreeLine(e.studyType, e.area, e.score) || "Studies",
      institution: e.institution || "",
      lines: (e.courses ?? []).filter(Boolean),
    })),
    certificates: certificates.map((c) => ({
      name: c.name || "",
      issuer: c.issuer || "",
      date: c.date || "",
    })),
    languages: languageLines(resume),
  };
}
