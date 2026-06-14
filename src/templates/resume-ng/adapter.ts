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
 * JSON shape consumed by resume-ng/resume.typ (markup-driven template:
 * `project.with(...)` show rule + `#resume-section` / `#resume-education` /
 * `#resume-work` / `#resume-project` item functions). We pre-format every
 * human string here and let the .typ stay dumb.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // The package renders a centered contact line joined by " | ".
  const contacts: { text: string; url: string }[] = [];
  if (basics.phone) contacts.push({ text: basics.phone, url: "" });
  if (basics.email) contacts.push({ text: basics.email, url: `mailto:${basics.email}` });
  if (basics.url) contacts.push({ text: stripProtocol(basics.url), url: basics.url });
  const addProfile = (kind: string, label: string) => {
    const handle = profileHandle(resume, kind);
    if (!handle) return;
    const url = profileUrl(resume, kind);
    const text = url ? stripProtocol(url) : `${label}/${handle}`;
    contacts.push({ text, url });
  };
  addProfile("github", "github.com");
  addProfile("linkedin", "linkedin.com");

  return {
    name: basics.name || "Your Name",
    label: basics.label || "",
    contacts,
    summary: basics.summary || "",
    education: education.map((e) => ({
      university: e.institution || "",
      degree: degreeLine(e.studyType, e.area, e.score),
      school: "",
      dates: fmtRange(e.startDate, e.endDate),
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    skills: skillGroups(resume),
    work: work.map((w) => ({
      company: w.name || "",
      duty: [w.position, w.location].filter(Boolean).join(" · "),
      dates: fmtRange(w.startDate, w.endDate),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    projects: projects.map((p) => ({
      title: p.name || "Project",
      duty: p.url ? stripProtocol(p.url) : "",
      dates: fmtRange(p.startDate, p.endDate),
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    certificates: certificates.map((c) => ({
      text: [c.name, c.issuer].filter(Boolean).join(" — "),
      date: c.date || "",
    })),
    languages: languageLines(resume),
  };
}
