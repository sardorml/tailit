import type { Resume } from "@/lib/resume/schema";
import {
  fmtLocation,
  fmtRange,
  languageLines,
  profileHandle,
  profileUrl,
  skillGroups,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by golixp-resume-zh-cn/resume.typ. The package is
 * markup-driven (a `resume-doc` show rule plus per-item section functions like
 * #work-item / #education-item / #skill-category). We pre-compute every display
 * string here and the .typ loops over these arrays. Section headings are emitted
 * in English to neutralize the template's default Chinese labels.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // Contact line items for #personal-header — each is { icon, content, link? }.
  const contacts: { icon: string; content: string; link?: string }[] = [];
  if (basics.phone) contacts.push({ icon: "phone", content: basics.phone });
  if (basics.email) contacts.push({ icon: "email", content: basics.email });
  const loc = fmtLocation(basics);
  if (loc) contacts.push({ icon: "location", content: loc });
  const github = profileHandle(resume, "github");
  if (github) {
    const url = profileUrl(resume, "github");
    contacts.push({ icon: "github", content: github, ...(url ? { link: url } : {}) });
  }
  const linkedin = profileHandle(resume, "linkedin");
  if (linkedin) {
    const url = profileUrl(resume, "linkedin");
    contacts.push({ icon: "linkedin", content: linkedin, ...(url ? { link: url } : {}) });
  }
  if (basics.url) {
    contacts.push({ icon: "website", content: stripProtocol(basics.url), link: basics.url });
  }

  return {
    name: basics.name || "Your Name",
    label: basics.label || "",
    contacts,
    summary: basics.summary || "",
    work: work.map((w) => ({
      period: fmtRange(w.startDate, w.endDate),
      company: w.name || "",
      position: w.position || "",
      location: w.location || "",
      // Fold the summary + highlights into one responsibility list so we avoid
      // the package's Chinese "主要成就：" achievements label.
      responsibilities: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      period: fmtRange(e.startDate, e.endDate),
      school: e.institution || "",
      degree: e.studyType || "",
      major: e.area || "",
      gpa: e.score || "",
      honors: (e.courses ?? []).filter(Boolean),
    })),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      description: p.description || "",
      link: p.url || "",
      period: fmtRange(p.startDate, p.endDate),
      responsibilities: (p.highlights ?? []).filter(Boolean),
    })),
    skills: skillGroups(resume).map((g) => ({
      category: g.label || "Skills",
      items: g.items,
    })),
    certificates: certificates.map((c) => ({
      name: c.name || "",
      date: c.date || "",
      issuer: c.issuer || "",
    })),
    languages: languageLines(resume),
  };
}
