import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtLocation,
  fmtRange,
  profileHandle,
  profileUrl,
  skillGroups,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by cobalt-cv/resume.typ. The @preview/cobalt-cv package
 * is markup-driven: its entrypoint is a full example document that defines the
 * helper functions `experience`, `education`, and `skill-category` plus a
 * two-column layout (shaded sidebar + main content) with Font Awesome contact
 * icons in the header. We replicate that structure in resume.typ and drive
 * every value from this object.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, skills } = resume;

  const siteUrl = basics.url || "";
  const githubUrl = profileUrl(resume, "github");
  const linkedinUrl = profileUrl(resume, "linkedin");

  return {
    name: basics.name || "Your Name",
    // Contact links: each has display text + href. Empty display => hidden.
    site: siteUrl ? stripProtocol(siteUrl) : "",
    siteUrl: siteUrl,
    email: basics.email || "",
    github: profileHandle(resume, "github"),
    githubUrl: githubUrl,
    linkedin: profileHandle(resume, "linkedin"),
    linkedinUrl: linkedinUrl,
    summary: basics.summary || "",
    education: education.map((e) => ({
      institution: e.institution || "",
      location: "",
      dates: fmtRange(e.startDate, e.endDate),
      // The package renders a list of degree strings, one per line.
      degrees: [degreeLine(e.studyType, e.area, e.score)].filter(Boolean),
    })),
    skills: skillGroups(resume).map((g) => ({
      category: g.label || "Skills",
      items: g.items,
    })),
    work: work.map((w) => ({
      company: w.name || "",
      role: w.position || "",
      location: w.location || fmtLocation(basics),
      dates: fmtRange(w.startDate, w.endDate),
      bullets: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    // Keep skill grouping count available so .typ never indexes empties.
    hasSkills: skills.length > 0,
  };
}
