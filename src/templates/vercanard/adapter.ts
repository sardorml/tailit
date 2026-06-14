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
 * JSON shape consumed by vercanard/resume.typ (markup-driven, colorful CV
 * template). The package exposes a `resume.with(...)` show rule (name, title,
 * accent-color, margin, aside) plus `= Section` headings and an `entry(title,
 * body, details)` function for the main body. We put contact/skills/languages/
 * certificates in the right `aside` and experience/projects/education in body.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const contact: string[] = [];
  if (basics.email) contact.push(basics.email);
  if (basics.phone) contact.push(basics.phone);
  const loc = fmtLocation(basics);
  if (loc) contact.push(loc);
  if (basics.url) contact.push(stripProtocol(basics.url));
  const gh = profileHandle(resume, "github");
  if (gh) contact.push(`GitHub: ${gh}`);
  const li = profileHandle(resume, "linkedin");
  if (li) contact.push(`LinkedIn: ${li}`);

  return {
    name: basics.name || "Your Name",
    title: basics.label || "",
    summary: basics.summary || "",
    contact,
    languages: languageLines(resume),
    skills: skillGroups(resume).map((g) =>
      g.label ? `${g.label}: ${g.items.join(", ")}` : g.items.join(", "),
    ),
    certificates: certificates
      .map((c) => [c.name, c.issuer, c.date].filter(Boolean).join(" · "))
      .filter(Boolean),
    work: work.map((w) => ({
      title: w.position || "",
      company: w.name || "",
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
    education: education.map((e) => ({
      institution: e.institution || "",
      degree: degreeLine(e.studyType, e.area, e.score),
      dates: fmtRange(e.startDate, e.endDate),
      highlights: (e.courses ?? []).filter(Boolean),
    })),
  };
}
