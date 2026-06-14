import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtLocation,
  fmtRange,
  languageLines,
  skillGroups,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by ttq-classic-resume/resume.typ (markup-driven template
 * built on @preview/ttq-classic-resume). The package exposes resume-header
 * (name + flat contacts), section-header, timeline-entry (work/education),
 * project-entry, and a table that auto-detects flat vs categorized items.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // Flat contact list rendered in the header, separated by ❖ by the package.
  const location = fmtLocation(basics);
  const contacts = [
    basics.email,
    basics.phone,
    basics.url ? stripProtocol(basics.url) : "",
    ...(basics.profiles ?? []).map((p) =>
      p.url ? stripProtocol(p.url) : p.username || "",
    ),
    location,
  ].filter(Boolean);

  return {
    name: basics.name || "Your Name",
    contacts,
    summary: basics.summary || "",
    work: work.map((w) => ({
      company: w.name || "",
      dates: fmtRange(w.startDate, w.endDate),
      title: w.position || "",
      location: w.location || "",
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      institution: e.institution || "",
      dates: fmtRange(e.startDate, e.endDate),
      degree: degreeLine(e.studyType, e.area, e.score),
      location: "",
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      url: p.url ? stripProtocol(p.url) : "",
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    // Categorized skills -> table with {category, text} items.
    skills: skillGroups(resume).map((g) => ({
      category: g.label || "Skills",
      text: g.items.join(", "),
    })),
    // Flat lists for the auto-detecting table.
    certificates: certificates
      .map((c) => [c.name, c.issuer, c.date].filter(Boolean).join(" — "))
      .filter(Boolean),
    languages: languageLines(resume),
  };
}
