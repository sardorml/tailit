import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  findProfile,
  fmtLocation,
  fmtRange,
  languageLines,
  skillGroups,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by acorn-resume/resume.typ (markup-driven template):
 * a `resume.with` show rule plus `#header`, `#exp`, `#edu`, `#project` calls.
 * Contacts are (url, label) tuples; education uses degree/institution/gpa.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // Contact tuples: [url, label]. mailto/tel for email/phone.
  const contacts: [string, string][] = [];
  if (basics.email) contacts.push([`mailto:${basics.email}`, basics.email]);
  if (basics.phone) contacts.push([`tel:${basics.phone.replace(/\s+/g, "")}`, basics.phone]);
  const loc = fmtLocation(basics);
  if (loc) contacts.push(["", loc]);
  if (basics.url) contacts.push([basics.url, stripProtocol(basics.url)]);
  const gh = findProfile(resume, "github");
  if (gh?.url) contacts.push([gh.url, stripProtocol(gh.url)]);
  const li = findProfile(resume, "linkedin");
  if (li?.url) contacts.push([li.url, stripProtocol(li.url)]);

  return {
    name: basics.name || "Your Name",
    contacts,
    // Skills as "*Label:* a, b, c" groups for the Skills block.
    skills: skillGroups(resume),
    work: work.map((w) => ({
      role: w.position || "",
      organization: w.name || "",
      location: w.location || "",
      date: fmtRange(w.startDate, w.endDate),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      technologies: (p.keywords ?? []).filter(Boolean),
      liveUrl: p.url ? p.url : "",
      repoUrl: "",
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      degree: degreeLine(e.studyType, e.area),
      institution: e.institution || "",
      gpa: e.score || "",
      location: "",
      date: fmtRange(e.startDate, e.endDate),
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    certificates: certificates.map((c) => ({
      name: c.name || "",
      issuer: c.issuer || "",
      date: c.date || "",
    })),
    languages: languageLines(resume),
  };
}
