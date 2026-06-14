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
 * JSON shape consumed by bone-resume/resume.typ. The package is markup-driven:
 * a `resume-init` show rule plus `= Section` headings and `resume-section`
 * calls (each renders a bordered box with a title, a right-aligned detail
 * string, and a body). The header is built manually (the package's `info`
 * helper wants a photo.png we don't have). All formatting happens here so the
 * .typ file stays dumb.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const contacts: { label: string; value: string; url: string }[] = [];
  if (basics.phone) contacts.push({ label: "Phone", value: basics.phone, url: "" });
  if (basics.email)
    contacts.push({ label: "Email", value: basics.email, url: `mailto:${basics.email}` });

  const links: { label: string; value: string; url: string }[] = [];
  const gh = profileHandle(resume, "github");
  if (gh) links.push({ label: "GitHub", value: gh, url: profileUrl(resume, "github") });
  const li = profileHandle(resume, "linkedin");
  if (li) links.push({ label: "LinkedIn", value: li, url: profileUrl(resume, "linkedin") });
  if (basics.url) links.push({ label: "Site", value: stripProtocol(basics.url), url: basics.url });

  return {
    name: basics.name || "Your Name",
    label: basics.label || "",
    summary: basics.summary || "",
    contacts,
    links,
    education: education.map((e) => ({
      institution: e.institution || "",
      degree: degreeLine(e.studyType, e.area, e.score),
      dates: fmtRange(e.startDate, e.endDate),
    })),
    work: work.map((w) => ({
      title: w.position || "",
      company: w.name || "",
      detail: [w.location, fmtRange(w.startDate, w.endDate)].filter(Boolean).join(" · "),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      url: p.url || "",
      urlText: p.url ? stripProtocol(p.url) : "",
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
