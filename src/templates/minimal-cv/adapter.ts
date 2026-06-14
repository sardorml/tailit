import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtLocation,
  fmtRange,
  languageLines,
  profileHandle,
  profileUrl,
  skillGroups,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by minimal-cv/resume.typ.
 *
 * `@preview/minimal-cv` is markup-driven: a `#show: cv.with(theme: ...)` show
 * rule plus a two-column `#grid`, where each block is built from `#section`
 * (title + body) and `#entry(right:, [gutter], [title], [body])`. The .typ
 * file generates that markup from this object; all human formatting lives here.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const linkedin = profileHandle(resume, "linkedin");
  const linkedinUrl = profileUrl(resume, "linkedin");
  const github = profileHandle(resume, "github");
  const githubUrl = profileUrl(resume, "github");

  return {
    name: basics.name || "Your Name",
    headline: basics.label || "",
    summary: basics.summary || "",

    contact: {
      location: fmtLocation(basics),
      email: basics.email || "",
      phone: basics.phone || "",
      site: basics.url ? stripProtocol(basics.url) : "",
      siteUrl: basics.url || "",
      linkedin,
      linkedinUrl,
      github,
      githubUrl,
    },

    work: work.map((w) => ({
      // Gutter (small left cell): the date range.
      dates: fmtRange(w.startDate, w.endDate),
      // Title (main heading): the role.
      title: w.position || "",
      // Right floating cell: the company + location.
      company: w.name || "",
      location: w.location || "",
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),

    education: education.map((e) => ({
      dates: fmtRange(e.startDate, e.endDate),
      degree: degreeLine(e.studyType, e.area, e.score) || "Education",
      institution: e.institution || "",
      highlights: (e.courses ?? []).filter(Boolean),
    })),

    projects: projects.map((p) => ({
      dates: fmtRange(p.startDate, p.endDate),
      name: p.name || "Project",
      url: p.url ? stripProtocol(p.url) : "",
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),

    // Skills as { label, items } groups for the right column.
    skills: skillGroups(resume).map((g) => ({
      label: g.label,
      items: g.items.join(", "),
    })),

    certificates: certificates.map((c) => ({
      name: c.name || "",
      issuer: c.issuer || "",
      date: c.date || "",
    })),

    languages: languageLines(resume),
  };
}
