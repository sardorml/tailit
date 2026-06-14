import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtLocation,
  fmtRange,
  languageLines,
  profileHandle,
  skillFlat,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by metronic/resume.typ (markup-driven template).
 * Metronic has a colored sidebar (name, role, summary, contact, education,
 * skills, languages) and a main column (work experience, projects). All human
 * formatting is done here so the .typ stays declarative.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects } = resume;
  return {
    name: basics.name || "Your Name",
    role: basics.label || "",
    summary: basics.summary || "",
    contact: {
      email: basics.email || "",
      phone: basics.phone || "",
      location: fmtLocation(basics),
      github: profileHandle(resume, "github"),
      linkedin: profileHandle(resume, "linkedin"),
      website: basics.url ? stripProtocol(basics.url) : "",
      x: profileHandle(resume, "twitter") || profileHandle(resume, "x"),
    },
    education: education.map((e) => ({
      degree: degreeLine(e.studyType, e.area, e.score),
      institution: e.institution || "",
      dates: fmtRange(e.startDate, e.endDate),
    })),
    // Flat skill keywords rendered as tag chips in the sidebar.
    skills: skillFlat(resume),
    languages: languageLines(resume),
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
      keywords: (p.keywords ?? []).filter(Boolean),
    })),
  };
}
