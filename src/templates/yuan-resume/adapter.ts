import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtRange,
  languageLines,
  skillGroups,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by yuan-resume/resume.typ.
 *
 * yuan-resume is a markup-driven academic template: it exposes `section-block`,
 * `edu-heading`, `proj-heading`, `intern-heading`, and `award` helpers and builds
 * its own header (name + suffix, contact lines, divider). We map our resume into
 * those academic sections and let the .typ generate the markup with #for loops.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // Contact column: phone / email / site on their own lines.
  const contact = [
    basics.phone || "",
    basics.email || "",
    basics.url ? stripProtocol(basics.url) : "",
  ].filter(Boolean);

  return {
    name: basics.name || "Your Name",
    // shown small next to the name (e.g. "Ph.D." in the original) — use the role label
    suffix: basics.label || "",
    contact,
    summary: basics.summary || "",
    education: education.map((e) => ({
      department: e.institution || "",
      location: "",
      role: degreeLine(e.studyType, e.area, e.score),
      time: fmtRange(e.startDate, e.endDate),
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    work: work.map((w) => ({
      company: w.name || "",
      location: w.position || "",
      time: fmtRange(w.startDate, w.endDate),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    projects: projects.map((p) => ({
      title: p.name || "Project",
      institution: p.url ? stripProtocol(p.url) : "",
      time: fmtRange(p.startDate, p.endDate),
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    skills: skillGroups(resume).map((g) => ({
      label: g.label,
      items: g.items.join(", "),
    })),
    certificates: certificates.map((c) => ({
      title: [c.name, c.issuer].filter(Boolean).join(", "),
      time: c.date || "",
    })),
    languages: languageLines(resume),
  };
}
