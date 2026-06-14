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
 * JSON shape consumed by modern-cv/resume.typ.
 *
 * modern-cv is markup-driven: a `resume.with(author: ...)` show rule plus
 * `= Section` headings and per-item functions (`resume-entry`, `resume-item`,
 * `resume-skill-item`, `resume-certification`). We build an `author` dict
 * (firstname/lastname split, positions array, contact fields) plus arrays for
 * each section, and the .typ generates the markup with #for loops.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const fullName = (basics.name || "Your Name").trim();
  const spaceIdx = fullName.lastIndexOf(" ");
  const firstname = spaceIdx > 0 ? fullName.slice(0, spaceIdx) : fullName;
  const lastname = spaceIdx > 0 ? fullName.slice(spaceIdx + 1) : "";

  const positions = [basics.label].filter((p): p is string => !!p);

  return {
    author: {
      firstname,
      lastname,
      positions,
      email: basics.email || "",
      phone: basics.phone || "",
      address: fmtLocation(basics),
      homepage: basics.url ? stripProtocol(basics.url) : "",
      github: profileHandle(resume, "github"),
      // linkedin: package renders the name as text and prefixes the username
      // with https://www.linkedin.com/in/, so pass the username/handle.
      linkedin: profileHandle(resume, "linkedin"),
    },
    summary: basics.summary || "",
    work: work.map((w) => ({
      title: w.position || "",
      company: w.name || "",
      location: w.location || "",
      dates: fmtRange(w.startDate, w.endDate),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      institution: e.institution || "",
      location: "",
      dates: fmtRange(e.startDate, e.endDate),
      degree: degreeLine(e.studyType, e.area, e.score),
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      url: p.url ? stripProtocol(p.url) : "",
      dates: fmtRange(p.startDate, p.endDate),
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
