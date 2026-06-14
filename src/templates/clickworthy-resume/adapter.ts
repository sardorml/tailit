import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtRange,
  languageLines,
  profileHandle,
  skillGroups,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by clickworthy-resume/resume.typ (markup-driven template:
 * a `resume.with` show rule plus `= Section` headings and #edu/#exp/#skills
 * calls). All human formatting (dates, contact strings, degree tuples) is done
 * here so the .typ stays declarative.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // Contacts render as a centered "  |  "-joined row of links under the name.
  const contacts: { text: string; href: string }[] = [];
  if (basics.email) contacts.push({ text: basics.email, href: `mailto:${basics.email}` });
  if (basics.phone) contacts.push({ text: basics.phone, href: "" });
  if (basics.url) {
    const site = stripProtocol(basics.url);
    contacts.push({ text: site, href: `https://${site}` });
  }
  const github = profileHandle(resume, "github");
  if (github) contacts.push({ text: github, href: `https://${github}` });
  const linkedin = profileHandle(resume, "linkedin");
  if (linkedin) contacts.push({ text: linkedin, href: `https://${linkedin}` });

  return {
    name: basics.name || "Your Name",
    location: basics.label || "",
    contacts,
    summary: basics.summary || "",
    education: education.map((e) => ({
      institution: e.institution || "",
      date: fmtRange(e.startDate, e.endDate),
      location: "",
      // `degrees` is a list of [level, field] tuples. Fall back to a single
      // combined degree line when we can't split cleanly.
      degrees: degreeTuples(e.studyType, e.area),
      gpa: e.score || "",
      extra: "",
    })),
    work: work.map((w) => ({
      title: w.position || "",
      organization: w.name || "",
      date: fmtRange(w.startDate, w.endDate),
      location: w.location || "",
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    projects: projects.map((p) => ({
      title: p.name || "Project",
      organization: p.url ? stripProtocol(p.url) : "",
      date: fmtRange(p.startDate, p.endDate),
      location: "",
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    skills: skillGroups(resume).map((g) => ({
      label: g.label || "Skills",
      items: g.items,
    })),
    certificates: certificates.map((c) => ({
      title: c.name || "",
      organization: [c.issuer, c.date].filter(Boolean).join(" · "),
    })),
    languages: languageLines(resume),
  };
}

/**
 * Turn studyType + area into the package's [level, field] tuple list.
 * e.g. ("B.S.", "Computer Science") -> [["B.S.", "Computer Science"]].
 */
function degreeTuples(studyType?: string, area?: string): [string, string][] {
  if (studyType && area) return [[studyType, area]];
  const line = degreeLine(studyType, area);
  if (line) return [["", line]];
  return [];
}
