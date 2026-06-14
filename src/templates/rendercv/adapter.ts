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
 * JSON shape consumed by rendercv/resume.typ. rendercv is markup-driven: a
 * `rendercv.with(...)` show rule plus `= Name`, `#connections(...)`, `==`
 * section headings and `#regular-entry` / `#education-entry` / `#summary`
 * per-item functions. We do all human formatting here and emit plain data
 * the .typ loops over.
 */

/** A connection (header contact link): a label, the display text, and an optional href. */
function connection(text: string, href = ""): { text: string; href: string } {
  return { text, href };
}

export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const connections: { text: string; href: string }[] = [];
  const location = fmtLocation(basics);
  if (location) connections.push(connection(location));
  if (basics.email) connections.push(connection(basics.email, `mailto:${basics.email}`));
  if (basics.phone) connections.push(connection(basics.phone, `tel:${basics.phone.replace(/\s+/g, "")}`));
  if (basics.url) connections.push(connection(stripProtocol(basics.url), basics.url));
  for (const p of basics.profiles ?? []) {
    const url = p.url || "";
    const display = p.username || (url ? stripProtocol(url) : "");
    if (display) connections.push(connection(display, url));
  }

  return {
    name: basics.name || "Your Name",
    headline: basics.label || "",
    connections,
    summary: basics.summary || "",
    education: education.map((e) => ({
      institution: e.institution || "",
      degree: e.studyType || "",
      area: e.area || "",
      location: "",
      dates: fmtRange(e.startDate, e.endDate),
      degreeLine: degreeLine(e.studyType, e.area, e.score),
      highlights: [e.score ? `${e.score}` : "", ...(e.courses ?? [])].filter(Boolean),
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
      url: p.url || "",
      dates: fmtRange(p.startDate, p.endDate),
      summary: p.description || "",
      highlights: (p.highlights ?? []).filter(Boolean),
    })),
    skills: skillGroups(resume).map((g) => ({
      label: g.label,
      items: g.items.join(", "),
    })),
    certificates: certificates.map((c) => ({
      name: c.name || "",
      issuer: c.issuer || "",
      url: c.url || "",
      date: c.date || "",
    })),
    languages: languageLines(resume),
  };
}
