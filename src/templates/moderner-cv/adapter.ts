import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtLocation,
  fmtRange,
  languageLines,
  profileHandle,
  profileUrl,
  skillGroups,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by moderner-cv/resume.typ (markup-driven template based on
 * the moderncv LaTeX class). The .typ file drives the `moderner-cv` show rule
 * plus `= Section` headings and the package's `cv-entry` / `cv-double-item` /
 * `cv-line` helpers from this data.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  return {
    name: basics.name || "Your Name",
    subtitle: basics.label || "Curriculum Vitae",
    // Predefined socials in the package: email, phone, github, linkedin.
    // `website` is a custom (icon, link, body) tuple; `address` renders with a
    // house icon. Empty strings are filtered out in the .typ file.
    email: basics.email || "",
    phone: basics.phone || "",
    github: profileHandle(resume, "github"),
    linkedin: profileHandle(resume, "linkedin"),
    websiteUrl: basics.url || profileUrl(resume, "github") || "",
    websiteLabel: basics.url ? stripProtocol(basics.url) : "",
    address: fmtLocation(basics),
    summary: basics.summary || "",
    education: education.map((e) => ({
      date: fmtRange(e.startDate, e.endDate),
      title: degreeLine(e.studyType, e.area) || e.institution || "",
      employer: degreeLine(e.studyType, e.area) ? e.institution || "" : "",
      detail: e.score || "",
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    work: work.map((w) => ({
      date: fmtRange(w.startDate, w.endDate),
      title: w.position || "",
      employer: [w.name, w.location].filter(Boolean).join(" — "),
      summary: w.summary || "",
      highlights: (w.highlights ?? []).filter(Boolean),
    })),
    projects: projects.map((p) => ({
      date: fmtRange(p.startDate, p.endDate),
      title: p.name || "Project",
      employer: p.url ? stripProtocol(p.url) : "",
      summary: p.description || "",
      highlights: (p.highlights ?? []).filter(Boolean),
    })),
    skills: skillGroups(resume).map((g) => ({
      label: g.label,
      items: g.items.join(", "),
    })),
    certificates: certificates.map((c) => ({
      date: c.date || "",
      title: c.name || "",
      employer: c.issuer || "",
    })),
    languages: languageLines(resume),
  };
}
