import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtRange,
  profileHandle,
  skillGroups,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by mrbogo-cv/resume.typ. mrbogo-cv is a markup-driven,
 * two-column template (sidebar + main) built around a `cv.with(...)` show rule,
 * a `side[...]` block, `= Heading` sections, and `entry(...)` items. The
 * profile picture is optional, so we omit it. All human formatting (dates,
 * degree strings, contact handles) happens here so the .typ stays declarative.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // mrbogo-cv's header renders firstname (light) + lastname (medium).
  const fullName = basics.name?.trim() || "Your Name";
  const nameParts = fullName.split(/\s+/);
  const firstname = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : fullName;
  const lastname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

  const github = profileHandle(resume, "github");
  const linkedin = profileHandle(resume, "linkedin");

  // Spread skill groups across the sidebar; the template shows proficiency
  // bars (1-5). We don't track levels, so give every keyword a strong, even 4.
  const technical = skillGroups(resume).map((g) => ({
    label: g.label || "Skills",
    items: g.items.map((name) => ({ name, level: 4 })),
  }));

  const languages = resume.languages
    .map((l) => l.language || "")
    .filter(Boolean)
    .map((name, i, arr) => ({
      name,
      // First language assumed native-level, others professional.
      level: arr.length > 1 && i === 0 ? 5 : 4,
    }));

  return {
    author: {
      firstname,
      lastname,
      position: basics.label || "",
      email: basics.email || "",
      phone: basics.phone || "",
      website: basics.url ? stripProtocol(basics.url) : "",
      github,
      linkedin,
    },
    aboutMe: basics.summary || "",
    summary: basics.summary || "",
    accent: "#057dcd",
    headerColor: "#1e3d58",
    labels: {
      about: "About Me",
      contact: "Contact",
      skills: "Skills",
      languages: "Languages",
      intro: "Profile",
      experience: "Professional Experience",
      projects: "Projects",
      education: "Education",
      certifications: "Certifications",
    },
    skillBlocks: technical,
    languages,
    work: work.map((w) => ({
      title: w.position || "",
      institution: w.name || "",
      location: w.location || "",
      date: fmtRange(w.startDate, w.endDate),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    projects: projects.map((p) => ({
      title: p.name || "Project",
      institution: "",
      location: p.url ? stripProtocol(p.url) : "",
      date: fmtRange(p.startDate, p.endDate),
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      title: degreeLine(e.studyType, e.area, e.score) || e.institution || "",
      institution: e.institution || "",
      location: "",
      date: fmtRange(e.startDate, e.endDate),
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    certificates: certificates.map((c) => ({
      title: c.name || "",
      institution: c.issuer || "",
      location: "",
      date: c.date || "",
      highlights: [] as string[],
    })),
  };
}
