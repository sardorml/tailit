import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtLocation,
  fmtRange,
  profileHandle,
  skillGroups,
  stripProtocol,
} from "../shared";

/** JSON shape consumed by ats-friendly-resume/resume.typ (markup-driven template). */
export function adapt(resume: Resume) {
  const { basics, work, education, projects } = resume;
  return {
    name: basics.name || "Your Name",
    location: fmtLocation(basics),
    email: basics.email || "",
    phone: basics.phone || "",
    github: profileHandle(resume, "github"),
    linkedin: profileHandle(resume, "linkedin"),
    portfolio: basics.url ? stripProtocol(basics.url) : "",
    skills: skillGroups(resume),
    work: work.map((w) => ({
      company: w.name || "",
      role: w.position || "",
      location: w.location || "",
      dates: fmtRange(w.startDate, w.endDate),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      url: p.url ? stripProtocol(p.url) : "",
      dates: fmtRange(p.startDate, p.endDate),
      techUsed: (p.keywords ?? []).filter(Boolean).join(" | "),
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      institution: e.institution || "",
      location: "",
      degree: degreeLine(e.studyType, e.area, e.score),
      dates: fmtRange(e.startDate, e.endDate),
    })),
  };
}
