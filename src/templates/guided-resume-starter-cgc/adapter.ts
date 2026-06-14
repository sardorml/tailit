import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtLocation,
  fmtRange,
  languageLines,
  profileUrl,
  skillGroups,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by guided-resume-starter-cgc/resume.typ (markup-driven:
 * `resume.with` show rule + `= Section` headings + #edu / #skills / #exp calls).
 *
 * contacts: list of { label, url } the .typ renders as #link(url)[label].
 * education[].degrees: list of [title, subject] pairs (the #edu API shape).
 * skills: list of { label, items } groups for #skills.
 * experience: merged work + projects, each with a bullet `details` list.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const contacts: { label: string; url: string }[] = [];
  if (basics.email) contacts.push({ label: "Email", url: `mailto:${basics.email}` });
  if (basics.phone) contacts.push({ label: basics.phone, url: `tel:${basics.phone.replace(/[^+\d]/g, "")}` });
  if (basics.url) contacts.push({ label: "Website", url: basics.url });
  const github = profileUrl(resume, "github");
  if (github) contacts.push({ label: "GitHub", url: github });
  const linkedin = profileUrl(resume, "linkedin");
  if (linkedin) contacts.push({ label: "LinkedIn", url: linkedin });

  const experience = [
    ...work.map((w) => ({
      role: w.position || "",
      project: w.name || "",
      date: fmtRange(w.startDate, w.endDate),
      location: w.location || "",
      summary: "",
      details: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    ...projects.map((p) => ({
      role: p.name || "Project",
      project: p.url ? stripProtocol(p.url) : "Personal Project",
      date: fmtRange(p.startDate, p.endDate),
      location: "",
      summary: "",
      details: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
  ];

  return {
    author: basics.name || "Your Name",
    location: fmtLocation(basics),
    contacts,
    summary: basics.summary || "",
    education: education.map((e) => ({
      institution: e.institution || "",
      date: fmtRange(e.startDate, e.endDate),
      location: "",
      gpa: e.score || "",
      degrees: [[degreeLine(e.studyType), e.area || ""]].filter(
        (d) => d[0] || d[1],
      ),
    })),
    skills: skillGroups(resume),
    experience,
    certificates: certificates.map((c) => ({
      name: c.name || "",
      issuer: c.issuer || "",
      date: c.date || "",
    })),
    languages: languageLines(resume),
  };
}
