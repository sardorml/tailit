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
 * JSON shape consumed by lavandula/resume.typ (markup-driven, two-column
 * sidebar + main layout). All formatting happens here; the .typ just loops.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const github = findProfile(resume, "github");
  const linkedin = findProfile(resume, "linkedin");

  const contacts: { icon: string; solid: boolean; text: string; url: string }[] = [];
  if (basics.email)
    contacts.push({ icon: "at", solid: true, text: basics.email, url: `mailto:${basics.email}` });
  if (basics.phone) contacts.push({ icon: "phone", solid: true, text: basics.phone, url: "" });
  if (basics.url)
    contacts.push({ icon: "globe", solid: true, text: stripProtocol(basics.url), url: basics.url });
  if (linkedin) {
    const handle = linkedin.url ? stripProtocol(linkedin.url) : linkedin.username || "";
    contacts.push({ icon: "linkedin", solid: false, text: handle, url: linkedin.url || "" });
  }
  if (github) {
    const handle = github.url ? stripProtocol(github.url) : github.username || "";
    contacts.push({ icon: "github", solid: false, text: handle, url: github.url || "" });
  }

  // Pick an icon per skill group from a small set of safe Font Awesome names.
  const groupIcons = ["code", "layer-group", "cloud", "wrench", "gears", "database"];
  const skills = skillGroups(resume).map((g, i) => ({
    name: g.label || "Skills",
    icon: groupIcons[i % groupIcons.length],
    solid: true,
    items: g.items,
  }));

  return {
    name: basics.name || "Your Name",
    label: basics.label || "",
    summary: basics.summary || "",
    location: fmtLocation(basics),
    contacts,
    skills,
    languages: languageLines(resume),
    work: work.map((w) => ({
      title: [w.position, w.name].filter(Boolean).join(" @ "),
      info: fmtRange(w.startDate, w.endDate),
      location: w.location || "",
      summary: w.summary || "",
      highlights: (w.highlights ?? []).filter(Boolean),
    })),
    projects: projects.map((p) => ({
      title: p.name || "Project",
      info: fmtRange(p.startDate, p.endDate),
      url: p.url ? stripProtocol(p.url) : "",
      summary: p.description || "",
      highlights: (p.highlights ?? []).filter(Boolean),
    })),
    education: education.map((e) => ({
      title: e.institution || "",
      info: fmtRange(e.startDate, e.endDate),
      degree: degreeLine(e.studyType, e.area, e.score),
      courses: (e.courses ?? []).filter(Boolean),
    })),
    certificates: certificates.map((c) => ({
      title: c.name || "",
      issuer: c.issuer || "",
      date: c.date || "",
    })),
  };
}
