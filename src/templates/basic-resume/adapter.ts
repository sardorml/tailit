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

/** JSON shape consumed by basic-resume/resume.typ (markup-driven template). */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;
  return {
    name: basics.name || "Your Name",
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
