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
 * JSON shape consumed by pesha/resume.typ (markup-driven template:
 * `pesha.with(...)` show rule + `=== Section` headings + `#experience(...)`).
 * All human formatting (dates, contacts, degree lines) happens here so the
 * .typ stays declarative.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const github = profileHandle(resume, "github");
  const linkedin = profileHandle(resume, "linkedin");
  const contacts: string[] = [];
  if (basics.phone) contacts.push(basics.phone);
  if (basics.email) contacts.push(basics.email);
  if (basics.url) contacts.push(stripProtocol(basics.url));
  if (linkedin) contacts.push(linkedin);
  if (github) contacts.push(github);

  return {
    name: basics.name || "Your Name",
    // pesha shows a single `address` line under the name; use the headline +
    // location so the header isn't empty.
    address: [basics.label, fmtLocation(basics)].filter(Boolean).join(" · "),
    contacts,
    summary: basics.summary || "",
    work: work.map((w) => ({
      place: w.name || "",
      title: w.position || "",
      location: w.location || "",
      time: fmtRange(w.startDate, w.endDate),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      place: e.institution || "",
      title: degreeLine(e.studyType, e.area, e.score),
      location: "",
      time: fmtRange(e.startDate, e.endDate),
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    projects: projects.map((p) => ({
      place: p.name || "Project",
      title: p.url ? stripProtocol(p.url) : "",
      location: "",
      time: fmtRange(p.startDate, p.endDate),
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
