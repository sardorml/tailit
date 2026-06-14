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
 * JSON shape consumed by finely-crafted-cv/resume.typ — a markup-driven
 * package (`resume.with` show rule + `= Section` headings + `company-heading`
 * / `job-heading` / `school-heading` / `degree-heading` calls). All human
 * formatting happens here; the .typ just loops over these arrays.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const email = basics.email || "";
  const phone = basics.phone || "";
  const site = basics.url ? stripProtocol(basics.url) : "";
  const github = profileHandle(resume, "github");
  const githubUrl = profileUrl(resume, "github");
  const linkedin = profileHandle(resume, "linkedin");
  const linkedinUrl = profileUrl(resume, "linkedin");

  // Contact header entries: { label, text, url } — url is "" when not linkable.
  const contacts: { label: string; text: string; url: string }[] = [];
  if (email) contacts.push({ label: "Email", text: email, url: `mailto:${email}` });
  if (phone) contacts.push({ label: "Phone", text: phone, url: `tel:${phone.replace(/[^+\d]/g, "")}` });
  if (site) contacts.push({ label: "Web", text: site, url: basics.url || "" });
  if (github) contacts.push({ label: "GitHub", text: github, url: githubUrl });
  if (linkedin) contacts.push({ label: "LinkedIn", text: linkedin, url: linkedinUrl });

  const keywords = [
    basics.label,
    ...resume.skills.flatMap((s) => (s.keywords ?? []).filter(Boolean)),
  ]
    .filter(Boolean)
    .join(", ");

  return {
    name: basics.name || "Your Name",
    tagline: basics.label || basics.summary || "",
    keywords,
    location: fmtLocation(basics),
    contacts,
    summary: basics.summary || "",
    work: work.map((w) => ({
      company: w.name || "",
      title: w.position || "",
      location: w.location || "",
      dates: fmtRange(w.startDate, w.endDate),
      start: w.startDate ? fmtRange(w.startDate, w.endDate) : "",
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      institution: e.institution || "",
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
