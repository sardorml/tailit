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
 * JSON shape consumed by gloat/resume.typ.
 *
 * gloat is a markup-driven academic-CV package: a `cv.with(...)` show rule plus
 * `= Section` headings and per-item functions (`edu`, `exp`, `award`, `skills`).
 * We map our generic resume onto those functions and do every bit of human
 * formatting (dates, contact lines, degree strings) here so the .typ stays dumb.
 * All dates are passed as pre-formatted strings (the functions accept str).
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // Header contact chips, rendered as "label" strings inside the .typ.
  const contacts: { text: string; href: string }[] = [];
  if (basics.email) contacts.push({ text: basics.email, href: `mailto:${basics.email}` });
  if (basics.phone) contacts.push({ text: basics.phone, href: "" });
  if (basics.url) contacts.push({ text: stripProtocol(basics.url), href: basics.url });
  const gh = profileHandle(resume, "github");
  if (gh) contacts.push({ text: `gh/${gh}`, href: `https://github.com/${gh}` });
  const li = profileHandle(resume, "linkedin");
  if (li) contacts.push({ text: `in/${li}`, href: `https://linkedin.com/in/${li}` });

  return {
    name: basics.name || "Your Name",
    address: fmtLocation(basics),
    contacts,
    summary: basics.summary || "",
    education: education.map((e) => ({
      institution: e.institution || "",
      location: "",
      date: fmtRange(e.startDate, e.endDate),
      degrees: [degreeLine(e.studyType, e.area)].filter(Boolean),
      gpa: e.score || "",
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    work: work.map((w) => ({
      role: w.position || "",
      org: w.name || "",
      location: w.location || "",
      // gloat's exp prints "start - end"; collapse our range into the start slot.
      start: fmtRange(w.startDate, w.endDate),
      end: "",
      summary: w.summary || "",
      highlights: (w.highlights ?? []).filter(Boolean),
    })),
    projects: projects.map((p) => ({
      role: p.name || "Project",
      org: p.url ? stripProtocol(p.url) : "",
      location: "",
      start: fmtRange(p.startDate, p.endDate),
      end: "",
      summary: "",
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    skills: skillGroups(resume).map((g) => ({
      label: g.label || "Skills",
      items: g.items,
    })),
    awards: certificates.map((c) => ({
      name: c.name || "",
      from: c.issuer || "",
      date: c.date || "",
    })),
    languages: languageLines(resume),
  };
}
