import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtLocation,
  languageLines,
  skillGroups,
  stripProtocol,
} from "../shared";
import { fmtDate } from "../format";

/**
 * JSON shape consumed by fantastic-cv/resume.typ. fantastic-cv is markup-driven:
 * a `config` show rule plus `render-*` functions, each taking arrays of dicts
 * whose fields it accesses directly (e.g. `.url.len()`, `.highlights.map(..)`,
 * `.courses.join(..)`). So every item must carry ALL required keys as strings
 * or arrays — we never leave a field absent. The package joins start/end dates
 * itself, so we pass already-formatted date strings.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const profiles = (basics.profiles ?? [])
    .map((p) => ({
      network: p.network || "",
      username: p.username || (p.url ? stripProtocol(p.url) : ""),
      url: p.url ? stripProtocol(p.url) : "",
    }))
    .filter((p) => p.network && p.username);

  const educations = education.map((e) => ({
    institution: e.institution || "",
    location: "",
    url: e.url ? stripProtocol(e.url) : "",
    area: e.area || "",
    studyType: e.studyType || "",
    startDate: fmtDate(e.startDate),
    endDate: e.endDate ? fmtDate(e.endDate) : "Present",
    score: e.score || "",
    courses: (e.courses ?? []).filter(Boolean),
  }));

  const works = work.map((w) => ({
    name: w.name || "",
    location: w.location || "",
    url: w.url ? stripProtocol(w.url) : "",
    description: w.summary || "",
    position: w.position || "",
    startDate: fmtDate(w.startDate),
    endDate: w.endDate ? fmtDate(w.endDate) : "Present",
    highlights: (w.highlights ?? []).filter(Boolean),
  }));

  const projectsOut = projects.map((p) => ({
    name: p.name || "Project",
    url: p.url ? stripProtocol(p.url) : "",
    source_code: "",
    roles: [] as string[],
    startDate: fmtDate(p.startDate),
    endDate: p.endDate ? fmtDate(p.endDate) : "",
    description: p.description || "",
    highlights: (p.highlights ?? []).filter(Boolean),
  }));

  const certificatesOut = certificates.map((c) => ({
    name: c.name || "",
    issuer: c.issuer || "",
    url: c.url ? stripProtocol(c.url) : "",
    date: c.date || "",
  }));

  // fantastic-cv has no summary/skills/languages sections; map those onto its
  // flexible custom-section API ({ title, highlights: [{ summary, description }] }).
  const customSections: {
    title: string;
    highlights: { summary: string; description: string }[];
  }[] = [];

  if (basics.summary) {
    customSections.push({
      title: "Summary",
      highlights: [{ summary: "", description: basics.summary }],
    });
  }

  const skills = skillGroups(resume).map((g) => ({
    summary: g.label || "Skills",
    description: g.items.join(", "),
  }));
  if (skills.length) {
    customSections.push({ title: "Skills", highlights: skills });
  }

  const languages = languageLines(resume);
  if (languages.length) {
    customSections.push({
      title: "Languages",
      highlights: [{ summary: "", description: languages.join(", ") }],
    });
  }

  return {
    name: basics.name || "Your Name",
    location: fmtLocation(basics),
    email: basics.email || "",
    phone: basics.phone || "",
    url: basics.url ? stripProtocol(basics.url) : "",
    profiles,
    educations,
    works,
    projects: projectsOut,
    certificates: certificatesOut,
    customSections,
    accent: "#26428b",
    // Surface the degree line for any consumer that wants it; resume.typ builds
    // the description from studyType/area/score directly.
    _degree: education.map((e) => degreeLine(e.studyType, e.area, e.score)),
  };
}
