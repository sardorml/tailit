import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtRange,
  languageLines,
  profileLine,
  skillGroups,
  stripProtocol,
} from "../shared";

/** The JSON shape consumed by swe/resume.typ. */
export interface SweData {
  header: {
    name: string;
    email: string;
    emailDisplay: string;
    phone: string;
    website: string;
    websiteDisplayName: string;
    github: string;
    linkedin: string;
  };
  summary: string;
  education: { location: string; name: string; date: string; degree: string }[];
  employment: { location: string; company: string; position: string; date: string; responsibilities: string[] }[];
  projects: { title: string; website: string; contributions: string[] }[];
  skills: { label: string; items: string[] }[];
  languages: string[];
  certificates: { name: string; description: string }[];
}

export function adapt(resume: Resume): SweData {
  const { basics, work, education, projects, certificates } = resume;
  return {
    header: {
      name: basics.name || "Your Name",
      email: basics.email ? `mailto:${basics.email}` : "",
      emailDisplay: basics.email || "",
      phone: basics.phone || "",
      website: basics.url || "",
      websiteDisplayName: basics.url ? stripProtocol(basics.url) : "",
      github: profileLine(resume, "github", "GitHub"),
      linkedin: profileLine(resume, "linkedin", "LinkedIn"),
    },
    summary: basics.summary || "",
    education: education.map((e) => ({
      location: "",
      name: e.institution || "",
      date: fmtRange(e.startDate, e.endDate),
      degree: degreeLine(e.studyType, e.area, e.score),
    })),
    employment: work.map((w) => {
      const highlights = (w.highlights ?? []).filter(Boolean);
      return {
        location: w.location || "",
        company: w.name || "",
        position: w.position || "",
        date: fmtRange(w.startDate, w.endDate),
        responsibilities: highlights.length ? highlights : w.summary ? [w.summary] : [],
      };
    }),
    projects: projects.map((p) => {
      const highlights = (p.highlights ?? []).filter(Boolean);
      return {
        title: p.name || "Project",
        website: p.url || "",
        contributions: p.description ? [p.description, ...highlights] : highlights,
      };
    }),
    skills: skillGroups(resume),
    languages: languageLines(resume),
    certificates: certificates.map((c) => ({
      name: c.name || "",
      description: [c.issuer, c.date].filter(Boolean).join(" · "),
    })),
  };
}
