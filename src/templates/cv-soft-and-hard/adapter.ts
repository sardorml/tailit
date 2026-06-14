import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtRange,
  languageLines,
  profileHandle,
  profileUrl,
  skillGroups,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by cv-soft-and-hard/resume.typ.
 *
 * cv-soft-and-hard is a markup-driven package: a `styling` show rule, a
 * hand-rolled centered header (name + contact links), then `#section(title)`
 * headings followed by `#entry(left, right)` two-column rows. We do all human
 * formatting here and emit plain strings the .typ assembles with #for loops.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const site = basics.url ? stripProtocol(basics.url) : "";
  const github = profileHandle(resume, "github");
  const linkedin = profileHandle(resume, "linkedin");

  // Centered header contact links: { label (display), href (clickable target) }.
  const contacts: { label: string; href: string }[] = [];
  if (site) contacts.push({ label: site, href: basics.url ?? `https://${site}` });
  if (github) {
    const url = profileUrl(resume, "github") || `https://github.com/${github}`;
    contacts.push({ label: stripProtocol(url), href: url });
  }
  if (linkedin) {
    const url = profileUrl(resume, "linkedin") || `https://linkedin.com/in/${linkedin}`;
    contacts.push({ label: stripProtocol(url), href: url });
  }
  if (basics.email) contacts.push({ label: basics.email, href: `mailto:${basics.email}` });
  if (basics.phone) contacts.push({ label: basics.phone, href: `tel:${basics.phone.replace(/[^+\d]/g, "")}` });

  return {
    name: basics.name || "Your Name",
    title: basics.label || "Curriculum Vitae",
    contacts,
    summary: basics.summary || "",
    work: work.map((w) => ({
      // Left column: bold title (company), then accomplishment bullets.
      title: w.position || "",
      company: w.name || "",
      location: w.location || "",
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
      // Right column: the date range, italicised by the .typ.
      dates: fmtRange(w.startDate, w.endDate),
    })),
    education: education.map((e) => ({
      institution: e.institution || "",
      degree: degreeLine(e.studyType, e.area, e.score),
      highlights: (e.courses ?? []).filter(Boolean),
      dates: fmtRange(e.startDate, e.endDate),
    })),
    skills: skillGroups(resume).map((g) => ({
      label: g.label || "Skills",
      items: g.items.join(", "),
    })),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      url: p.url ? stripProtocol(p.url) : "",
      href: p.url ?? "",
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
      dates: fmtRange(p.startDate, p.endDate),
    })),
    certificates: certificates.map((c) => ({
      name: c.name || "",
      issuer: c.issuer || "",
      dates: c.date || "",
    })),
    languages: languageLines(resume),
  };
}
