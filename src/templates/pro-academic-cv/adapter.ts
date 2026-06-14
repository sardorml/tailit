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
 * JSON shape consumed by pro-academic-cv/resume.typ (markup-driven academic CV
 * template). The .typ builds the package's `author-info` content rows plus
 * `r2c2-entry-list` / `single-line-entry` sections from this dumb JSON.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // Secondary-info row: linkable profile handles (LinkedIn, GitHub, etc.).
  const profiles = (basics.profiles ?? [])
    .map((p) => {
      const label = (p.network || "").trim();
      const url = (p.url || "").trim();
      const handle = label || (url ? stripProtocol(url) : "");
      if (!handle || !url) return null;
      return { label: handle.toLowerCase(), url };
    })
    .filter((x): x is { label: string; url: string } => x !== null);

  return {
    name: basics.name || "Your Name",
    label: basics.label || "",
    email: basics.email || "",
    phone: basics.phone || "",
    site: basics.url ? stripProtocol(basics.url) : "",
    siteUrl: basics.url || "",
    location: fmtLocation(basics),
    profiles,
    summary: basics.summary || "",
    work: work.map((w) => ({
      company: w.name || "",
      companyUrl: w.url || "",
      title: w.position || "",
      location: w.location || "",
      dates: fmtRange(w.startDate, w.endDate),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      institution: e.institution || "",
      institutionUrl: e.url || "",
      degree: degreeLine(e.studyType, e.area),
      location: "",
      dates: fmtRange(e.startDate, e.endDate),
      highlights: [e.score, ...(e.courses ?? [])].filter(Boolean) as string[],
    })),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      url: p.url || "",
      urlLabel: p.url ? stripProtocol(p.url) : "",
      tools: (p.keywords ?? []).filter(Boolean),
      dates: fmtRange(p.startDate, p.endDate),
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    skills: skillGroups(resume).map((g) => ({
      label: g.label ? `${g.label}:` : "",
      items: g.items.join(", "),
    })),
    certificates: certificates.map((c) => ({
      name: [c.name, c.issuer].filter(Boolean).join(" — "),
      date: c.date || "",
    })),
    languages: languageLines(resume),
  };
}
