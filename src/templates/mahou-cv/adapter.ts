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
 * JSON shape consumed by mahou-cv/resume.typ.
 *
 * mahou-cv is a composable, markup-driven template: `cv(name, bio, main, aside)`
 * with `section()`, `label()`, and `item()` building blocks. We split content
 * into a `main` column (work, education, projects) and an `aside` column
 * (contact, skills, certificates, languages), and the .typ generates the markup
 * by looping over these arrays. All human formatting lives here.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const contact: { label: string; value: string }[] = [];
  const loc = fmtLocation(basics);
  if (loc) contact.push({ label: "Location", value: loc });
  if (basics.email) contact.push({ label: "Email", value: basics.email });
  if (basics.phone) contact.push({ label: "Phone", value: basics.phone });
  if (basics.url) contact.push({ label: "Web", value: stripProtocol(basics.url) });
  const gh = profileHandle(resume, "github");
  if (gh) contact.push({ label: "GitHub", value: gh });
  const li = profileHandle(resume, "linkedin");
  if (li) contact.push({ label: "LinkedIn", value: li });

  return {
    name: basics.name || "Your Name",
    bio: basics.label || "",
    summary: basics.summary || "",
    contact,
    work: work.map((w) => ({
      title: w.position || "",
      company: w.name || "",
      location: w.location || "",
      dates: fmtRange(w.startDate, w.endDate),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      institution: e.institution || "",
      degree: degreeLine(e.studyType, e.area, e.score),
      dates: fmtRange(e.startDate, e.endDate),
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      url: p.url ? stripProtocol(p.url) : "",
      dates: fmtRange(p.startDate, p.endDate),
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
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
