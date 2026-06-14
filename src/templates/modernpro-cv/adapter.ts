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
 * JSON shape consumed by modernpro-cv/resume.typ (markup-driven template based
 * on the Deedy-inspired `@preview/modernpro-cv` package). We build the header
 * args (name, address, contact lines) plus per-section arrays and let the .typ
 * drive the package's `cv-single` show rule and `#job`/`#education`/etc helpers.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // Plain-text contact line entries (avoids the fontawesome dependency the
  // package's example uses — passing { text, link } strings is enough).
  const contacts: { text: string; link?: string }[] = [];
  if (basics.email) contacts.push({ text: basics.email, link: `mailto:${basics.email}` });
  if (basics.phone) contacts.push({ text: basics.phone, link: `tel:${basics.phone}` });
  if (basics.url) contacts.push({ text: stripProtocol(basics.url), link: basics.url });
  const gh = profileHandle(resume, "github");
  if (gh) contacts.push({ text: `GitHub: ${gh}` });
  const li = profileHandle(resume, "linkedin");
  if (li) contacts.push({ text: `LinkedIn: ${li}` });

  return {
    name: basics.name || "Your Name",
    // Header "address" line — use the headline/target role if present, else location.
    address: basics.label || fmtLocation(basics),
    location: fmtLocation(basics),
    contacts,
    summary: basics.summary || "",
    work: work.map((w) => ({
      position: w.position || "",
      institution: w.name || "",
      location: w.location || "",
      date: fmtRange(w.startDate, w.endDate),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      institution: e.institution || "",
      major: degreeLine(e.studyType, e.area, e.score),
      date: fmtRange(e.startDate, e.endDate),
      location: "",
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      date: fmtRange(p.startDate, p.endDate),
      url: p.url ? stripProtocol(p.url) : "",
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    skills: skillGroups(resume).map((g) => ({
      label: g.label || "Skills",
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
