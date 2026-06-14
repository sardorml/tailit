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
 * JSON shape consumed by light-cv/resume.typ (markup-driven template).
 * The package exposes `cv` / `header` / `section` / `entry` / `skill`
 * functions; the .typ builds the markup from this object. Font Awesome icons
 * (Typst content) are selected in the .typ from the contact fields here.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const entryFromWork = (w: Resume["work"][number]) => ({
    title: w.position || "",
    org: w.name || "",
    date: fmtRange(w.startDate, w.endDate),
    location: w.location || "",
    description: [w.summary, ...(w.highlights ?? [])].filter(Boolean) as string[],
  });

  const entryFromEdu = (e: Resume["education"][number]) => ({
    title: degreeLine(e.studyType, e.area, e.score) || e.institution || "",
    org: degreeLine(e.studyType, e.area) ? e.institution || "" : "",
    date: fmtRange(e.startDate, e.endDate),
    location: "",
    description: (e.courses ?? []).filter(Boolean) as string[],
  });

  const entryFromProject = (p: Resume["projects"][number]) => ({
    title: p.name || "Project",
    org: p.url ? stripProtocol(p.url) : "",
    date: fmtRange(p.startDate, p.endDate),
    location: "",
    description: [p.description, ...(p.highlights ?? [])].filter(Boolean) as string[],
  });

  const entryFromCert = (c: Resume["certificates"][number]) => ({
    title: c.name || "",
    org: c.issuer || "",
    date: c.date || "",
    location: "",
    description: [] as string[],
  });

  // Skills as { category, items } groups for the tag-based skill() function.
  const skillCategories = skillGroups(resume).map((g) => ({
    category: g.label || "Skills",
    items: g.items,
  }));

  const languages = languageLines(resume);

  return {
    name: basics.name || "Your Name",
    jobTitle: basics.label || "",
    contact: {
      email: basics.email || "",
      phone: basics.phone || "",
      site: basics.url ? stripProtocol(basics.url) : "",
      siteUrl: basics.url || "",
      github: profileHandle(resume, "github"),
      githubUrl: (resume.basics.profiles ?? []).find((p) =>
        (p.network ?? "").toLowerCase().includes("github"),
      )?.url || "",
      linkedin: profileHandle(resume, "linkedin"),
      linkedinUrl: (resume.basics.profiles ?? []).find((p) =>
        (p.network ?? "").toLowerCase().includes("linkedin"),
      )?.url || "",
      location: fmtLocation(basics),
    },
    summary: basics.summary || "",
    work: work.map(entryFromWork),
    education: education.map(entryFromEdu),
    projects: projects.map(entryFromProject),
    certificates: certificates.map(entryFromCert),
    skills: skillCategories,
    languages,
  };
}
