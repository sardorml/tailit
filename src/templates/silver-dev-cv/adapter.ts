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
 * JSON shape consumed by silver-dev-cv/resume.typ. The package is markup-driven:
 * a `cv.with(...)` show rule (name, address, contacts array) plus `#section`,
 * `#job`, `#education`, `#project`, `#descript`, `#oneline-title-item` calls.
 * We build the contacts list and pre-format every string here.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // contacts: ordered list of { text, link? } the template renders as "a | b | c".
  const contacts: { text: string; link?: string }[] = [];
  if (basics.email) contacts.push({ text: basics.email, link: `mailto:${basics.email}` });
  if (basics.phone) contacts.push({ text: basics.phone });
  if (basics.url) contacts.push({ text: stripProtocol(basics.url), link: basics.url });
  for (const p of basics.profiles ?? []) {
    const label = p.network || (p.username ? p.username : "");
    const url = p.url || profileUrl(resume, p.network ?? "");
    if (label && url) contacts.push({ text: label, link: url });
    else if (label) contacts.push({ text: label });
  }

  return {
    name: basics.name || "Your Name",
    address: fmtLocation(basics),
    contacts,
    summary: basics.summary || "",
    work: work.map((w) => ({
      position: w.position || "",
      institution: w.name || "",
      location: w.location || "",
      dates: fmtRange(w.startDate, w.endDate),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      institution: e.institution || "",
      location: "",
      dates: fmtRange(e.startDate, e.endDate),
      major: degreeLine(e.studyType, e.area, e.score),
    })),
    skills: skillGroups(resume),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      dates: fmtRange(p.startDate, p.endDate),
      url: p.url ? stripProtocol(p.url) : "",
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    certificates: certificates.map((c) => ({
      name: c.name || "",
      issuer: c.issuer || "",
      date: c.date || "",
    })),
    languages: languageLines(resume),
  };
}
