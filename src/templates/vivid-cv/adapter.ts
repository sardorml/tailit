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
 * JSON shape consumed by vivid-cv/resume.typ (markup-driven template based on
 * basic-resume, with a banner header + optional photo). We drive `show: resume`
 * plus the package's `work` / `edu` / `project` / `certificates` helpers via
 * #for loops over this object. The photo is disabled (no image asset).
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;
  return {
    name: basics.name || "Your Name",
    title: basics.label || "",
    location: fmtLocation(basics),
    email: basics.email || "",
    phone: basics.phone || "",
    github: profileHandle(resume, "github"),
    linkedin: profileHandle(resume, "linkedin"),
    site: basics.url ? stripProtocol(basics.url) : "",
    summary: basics.summary || "",
    education: education.map((e) => ({
      institution: e.institution || "",
      location: "",
      dates: fmtRange(e.startDate, e.endDate),
      degree: degreeLine(e.studyType, e.area, e.score),
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    work: work.map((w) => ({
      title: w.position || "",
      company: w.name || "",
      location: w.location || "",
      dates: fmtRange(w.startDate, w.endDate),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      role: "",
      dates: fmtRange(p.startDate, p.endDate),
      url: p.url ? stripProtocol(p.url) : "",
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
