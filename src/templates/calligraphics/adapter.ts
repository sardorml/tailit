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
 * JSON shape consumed by calligraphics/resume.typ. The package is markup-driven:
 * a `#resume(author: ...)[left-col][right-col]` call where the two columns are
 * generated content. We build the `author` dict here plus pre-formatted section
 * arrays, and the .typ emits `= Heading` blocks with `#resume-entry` /
 * `#resume-item` / `#aside-skill-item` calls.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // The package renders the name as `lastname firstname` (lastname first), so
  // to read naturally ("Jordan Rivera") we put the leading words in `lastname`
  // and the final word in `firstname`.
  const fullName = basics.name || "Your Name";
  const parts = fullName.trim().split(/\s+/);
  const lastname = parts.length > 1 ? parts.slice(0, -1).join(" ") : fullName;
  const firstname = parts.length > 1 ? parts[parts.length - 1] : "";

  const positions = basics.label ? [basics.label] : [];

  const author: Record<string, unknown> = { firstname, lastname, positions };
  if (basics.email) author.email = basics.email;
  if (basics.phone) author.phone = basics.phone;
  if (fmtLocation(basics)) author.address = fmtLocation(basics);
  const github = profileHandle(resume, "github");
  if (github) author.github = github;
  const linkedin = profileHandle(resume, "linkedin");
  if (linkedin) author.linkedin = linkedin;
  if (basics.url) author.website = stripProtocol(basics.url);

  return {
    author,
    summary: basics.summary || "",
    skills: skillGroups(resume).map((g) => ({
      category: g.label || "Skills",
      items: g.items,
    })),
    languages: languageLines(resume),
    work: work.map((w) => ({
      title: w.position || "",
      location: w.location || "",
      date: fmtRange(w.startDate, w.endDate),
      description: w.name || "",
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      title: degreeLine(e.studyType, e.area, e.score) || e.institution || "",
      location: "",
      date: fmtRange(e.startDate, e.endDate),
      description: e.institution || "",
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    projects: projects.map((p) => ({
      title: p.name || "Project",
      url: p.url || "",
      urlLabel: p.url ? stripProtocol(p.url) : "",
      date: fmtRange(p.startDate, p.endDate),
      description: p.description || "",
      highlights: (p.highlights ?? []).filter(Boolean),
    })),
    certificates: certificates.map((c) => ({
      title: c.name || "",
      date: c.date || "",
      description: c.issuer || "",
    })),
  };
}
