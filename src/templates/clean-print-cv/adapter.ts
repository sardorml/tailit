import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtLocation,
  fmtRange,
  profileHandle,
  skillGroups,
  stripProtocol,
} from "../shared";

/** Map a fluency word to a 0..5 proficiency dot count for cv-languages. */
function fluencyDots(fluency?: string): number {
  const f = (fluency ?? "").toLowerCase();
  if (!f) return 3;
  if (f.includes("native") || f.includes("mother") || f.includes("bilingual")) return 5;
  if (f.includes("fluent") || f.includes("full professional") || f.includes("advanced")) return 5;
  if (f.includes("professional") || f.includes("proficient") || f.includes("upper")) return 4;
  if (f.includes("intermediate") || f.includes("conversational") || f.includes("working")) return 3;
  if (f.includes("limited") || f.includes("basic") || f.includes("elementary")) return 2;
  if (f.includes("beginner") || f.includes("novice")) return 1;
  return 3;
}

/**
 * JSON shape consumed by clean-print-cv/resume.typ. The package is markup-
 * driven via per-section functions (cv-header, cv-experience, ...). We build
 * the exact dicts each function expects; all human formatting happens here.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates, languages } = resume;

  const linkedin = profileHandle(resume, "linkedin");
  const github = profileHandle(resume, "github");

  return {
    personal: {
      name: basics.name || "Your Name",
      title: basics.label || "",
      email: basics.email || "",
      phone: basics.phone || "",
      location: fmtLocation(basics),
      linkedin,
      github,
      website: basics.url ? stripProtocol(basics.url) : "",
    },
    summary: basics.summary || "",
    experience: work.map((w) => ({
      role: w.position || "",
      company: w.name || "",
      location: w.location || "",
      period: fmtRange(w.startDate, w.endDate),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    skills: skillGroups(resume).map((g) => ({
      category: g.label || "Skills",
      items: g.items,
    })),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      url: p.url ? stripProtocol(p.url) : "",
      description: [p.description, ...(p.highlights ?? [])].filter(Boolean).join(" "),
    })),
    certifications: certificates.map((c) => ({
      name: c.name || "",
      issuer: c.issuer || "",
      year: c.date || "",
    })),
    education: education.map((e) => ({
      degree: degreeLine(e.studyType, e.area, e.score) || e.institution || "",
      institution: e.institution || "",
      location: "",
      period: fmtRange(e.startDate, e.endDate),
      details: (e.courses ?? []).filter(Boolean).join(", "),
    })),
    languages: languages
      .filter((l) => l.language)
      .map((l) => ({
        language: l.language || "",
        level: l.fluency || "",
        dots: fluencyDots(l.fluency),
      })),
  };
}
