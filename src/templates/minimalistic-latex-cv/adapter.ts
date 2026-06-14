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
 * JSON shape consumed by minimalistic-latex-cv/resume.typ. The package is
 * markup-driven: a `cv.with` show rule that takes `name` + a `metadata` dict
 * for the header, plus `= Section` headings and `#entry(...)` calls. We build
 * the metadata dict and per-section rows here so the .typ stays dumb.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // Header metadata dict — rendered as "Key: value | Key: value". Keys are
  // capitalized by the package itself, so use plain lowercase labels.
  const metadata: { label: string; value: string }[] = [];
  if (basics.email) metadata.push({ label: "email", value: basics.email });
  if (basics.phone) metadata.push({ label: "telephone", value: basics.phone });
  const loc = fmtLocation(basics);
  if (loc) metadata.push({ label: "location", value: loc });
  if (basics.url) metadata.push({ label: "website", value: stripProtocol(basics.url) });
  for (const p of basics.profiles ?? []) {
    const handle = p.username || (p.url ? stripProtocol(p.url) : "");
    if (handle && p.network) metadata.push({ label: p.network.toLowerCase(), value: handle });
  }

  return {
    name: basics.name || "Your Name",
    metadata,
    headline: basics.label || "",
    summary: basics.summary || "",
    work: work.map((w) => ({
      title: w.position || "",
      name: w.name || "",
      date: fmtRange(w.startDate, w.endDate),
      location: w.location || "",
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      title: degreeLine(e.studyType, e.area, e.score) || e.area || "",
      name: e.institution || "",
      date: fmtRange(e.startDate, e.endDate),
      location: "",
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    projects: projects.map((p) => ({
      title: p.name || "Project",
      name: p.url ? stripProtocol(p.url) : "",
      date: fmtRange(p.startDate, p.endDate),
      location: "",
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    skills: skillGroups(resume).map((g) => ({
      label: g.label,
      items: g.items.join(", "),
    })),
    certificates: certificates.map((c) => ({
      name: c.name || "",
      meta: [c.issuer, c.date].filter(Boolean).join(" · "),
    })),
    languages: languageLines(resume),
  };
}
