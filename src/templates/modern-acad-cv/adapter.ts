import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtLocation,
  fmtRange,
  profileHandle,
  profileUrl,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by modern-acad-cv/resume.typ.
 *
 * modern-acad-cv is a DATA-DRIVEN academic-CV package: its main function
 * `modern-acad-cv(metadata, multilingual, ...)` takes a `metadata` dict
 * (colors + personal name + socials) and a `multilingual` dict (header labels
 * keyed by language). The body is built from per-section yaml databases via
 * helper functions. We rebuild those structures here from the Resume and let
 * resume.typ pass them to the package's real API. All formatting lives here.
 */

const MAIN_COLOR = "#579D90"; // package default teal accent

/** A social entry in metadata.personal.socials (fontawesome `fa` icon set). */
interface Social {
  username: string;
  prefix: string;
  icon: string;
  set: "fa" | "ai";
}

export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates, languages } = resume;

  const name = basics.name || "Your Name";
  const headline = basics.label || "";

  // ---- socials (metadata.personal.socials) --------------------------------
  const socials: Record<string, Social> = {};
  if (basics.email) {
    socials.email = { username: basics.email, prefix: "mailto:", icon: "paper-plane", set: "fa" };
  }
  if (basics.phone) {
    // tel: link; phone shown as username
    socials.phone = { username: basics.phone, prefix: "tel:", icon: "phone", set: "fa" };
  }
  if (basics.url) {
    socials.homepage = {
      username: stripProtocol(basics.url),
      prefix: "https://",
      icon: "globe",
      set: "fa",
    };
  }
  const gh = profileHandle(resume, "github");
  if (gh) {
    socials.github = { username: gh, prefix: "https://github.com/", icon: "github", set: "fa" };
  }
  const li = profileHandle(resume, "linkedin");
  if (li) {
    socials.linkedin = {
      username: li,
      prefix: "https://linkedin.com/in/",
      icon: "linkedin",
      set: "fa",
    };
  }

  // ---- metadata -----------------------------------------------------------
  const metadata = {
    colors: {
      main_color: MAIN_COLOR,
      lightgray_color: "#d5d5d5",
      gray_color: "#737373",
    },
    personal: {
      // single-string name => package renders it as the title without splitting
      name,
      split: false,
      socials,
    },
  };

  // ---- multilingual: only the "en" header labels we actually use ----------
  const labels = {
    subtitle: headline,
    summary: "Profile",
    work: "Experience",
    education: "Education",
    projects: "Projects",
    skills: "Skills",
    certificates: "Certifications",
    languages: "Languages",
  };
  const multilingual = { lang: { en: labels } };

  // ---- section data (already fully formatted) -----------------------------
  const workEntries = work.map((w) => ({
    left: fmtRange(w.startDate, w.endDate),
    title: w.position || "",
    subtitle: w.name || "",
    location: w.location || "",
    highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean) as string[],
  }));

  const educationEntries = education.map((e) => ({
    left: fmtRange(e.startDate, e.endDate),
    title: degreeLine(e.studyType, e.area) || e.institution || "",
    subtitle: e.institution && degreeLine(e.studyType, e.area) ? e.institution : "",
    location: e.score || "",
    highlights: (e.courses ?? []).filter(Boolean) as string[],
  }));

  const projectEntries = projects.map((p) => ({
    left: fmtRange(p.startDate, p.endDate),
    title: p.name || "Project",
    subtitle: p.url ? stripProtocol(p.url) : "",
    highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean) as string[],
  }));

  const certificateEntries = certificates.map((c) => ({
    left: c.date || "",
    title: c.name || "",
    subtitle: c.issuer || "",
  }));

  // Skills as a skill-matrix grouped by the skill category name.
  // Each entry needs name + level (1-4) + description for cv-auto-skills.
  const skillGroupsOut = resume.skills
    .map((s) => ({
      category: s.name || "Skills",
      items: (s.keywords ?? []).filter(Boolean),
    }))
    .filter((g) => g.items.length > 0);

  const languageEntries = languages
    .map((l) => ({ name: l.language || "", level: l.fluency || "" }))
    .filter((l) => l.name);

  return {
    metadata,
    multilingual,
    name,
    location: fmtLocation(basics),
    summary: basics.summary || "",
    orcid: profileUrl(resume, "orcid"),
    labels,
    work: workEntries,
    education: educationEntries,
    projects: projectEntries,
    certificates: certificateEntries,
    skills: skillGroupsOut,
    languages: languageEntries,
  };
}
