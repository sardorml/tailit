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
 * JSON shape consumed by humanistically/resume.typ (markup-driven academic CV).
 * The package exposes `humanistically` (show rule), `experience`, and `paper`.
 * We pre-format every human-readable string here so the .typ stays dumb.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // En-dash date ranges fit the template's "2024--26" aesthetic.
  const range = (start?: string, end?: string) =>
    fmtRange(start, end).replace(/\s*[–-]\s*/g, "–");

  // The template lays contacts out in equal-width columns, so keep the list
  // short to avoid crowding the header line.
  const contacts: string[] = [];
  if (basics.email) contacts.push(basics.email);
  if (basics.phone) contacts.push(basics.phone);
  if (basics.url) contacts.push(stripProtocol(basics.url));
  const gh = profileHandle(resume, "github");
  if (gh) contacts.push(gh);

  return {
    name: basics.name || "Your Name",
    address: basics.label || fmtLocation(basics) || "",
    location: fmtLocation(basics),
    updated: "June 2026",
    footer: `${(basics.name || "CV").split(/\s+/).slice(-1)[0]} — Page`,
    contacts,
    summary: basics.summary || "",
    work: work.map((w) => ({
      place: w.name || "",
      title: w.position || "",
      location: w.location || "",
      time: range(w.startDate, w.endDate),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      place: degreeLine(e.studyType, e.area, e.score) || e.institution || "",
      institution: e.institution || "",
      time: range(e.startDate, e.endDate),
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    projects: projects.map((p) => ({
      place: p.name || "Project",
      title: p.url ? stripProtocol(p.url) : "",
      time: range(p.startDate, p.endDate),
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    certificates: certificates.map((c) => ({
      title: c.name || "",
      venue: c.issuer || "",
      date: c.date || "",
    })),
    skills: skillGroups(resume).map((g) => ({
      label: g.label,
      items: g.items.join(", "),
    })),
    languages: languageLines(resume).join(", "),
  };
}
