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
 * JSON shape consumed by free-cv/resume.typ.
 *
 * free-cv is data-driven: `makeContacts(introduction)`, `makeSection(items)`,
 * and `makeSectionCompact(items)`. The package runs every title / subtitle /
 * description / point through `eval(mode: "markup", ...)`, so any text we feed
 * it is treated as Typst markup. We therefore escape the special markup
 * characters here so arbitrary resume text renders literally.
 */

/** Escape Typst markup so eval(mode: "markup") prints the text literally. */
function esc(s: string): string {
  return (s ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/([#*_`$<>@\[\]])/g, "\\$1");
}

interface Contact {
  displayText: string;
  icon: string;
  link: string;
}

interface Item {
  title: string;
  subtitle: string;
  icon: string;
  duration: string;
  location: string;
  description: string;
  points: string[] | "";
}

interface CompactItem {
  title: string;
  icon: string;
  description: string;
}

export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // --- Introduction / contacts -------------------------------------------
  const contacts: Record<string, Contact> = {};
  if (basics.email) {
    contacts.email = {
      displayText: esc(basics.email),
      icon: "envelope regular",
      link: `mailto:${basics.email}`,
    };
  }
  if (basics.phone) {
    contacts.phone = {
      displayText: esc(basics.phone),
      icon: "phone-flip",
      link: `tel:${basics.phone.replace(/[^+\d]/g, "")}`,
    };
  }
  const loc = fmtLocation(basics);
  if (loc) {
    contacts.location = { displayText: esc(loc), icon: "location-dot", link: "" };
  }
  if (basics.url) {
    contacts.website = {
      displayText: esc(stripProtocol(basics.url)),
      icon: "globe",
      link: basics.url,
    };
  }
  const github = findProfile(resume, "github");
  if (github) {
    const handle = github.username || (github.url ? stripProtocol(github.url) : "");
    contacts.github = {
      displayText: esc(handle),
      icon: "github",
      link: github.url || "",
    };
  }
  const linkedin = findProfile(resume, "linkedin");
  if (linkedin) {
    const handle = linkedin.username || (linkedin.url ? stripProtocol(linkedin.url) : "");
    contacts.linkedin = {
      displayText: esc(handle),
      icon: "linkedin",
      link: linkedin.url || "",
    };
  }

  const introduction = {
    name: esc(basics.name || "Your Name"),
    summary: esc(basics.summary || ""),
    contacts,
  };

  // --- Sections ----------------------------------------------------------
  const employment: Item[] = work.map((w) => {
    const points = (w.highlights ?? []).filter(Boolean).map(esc);
    return {
      title: w.position ? `*${esc(w.position)}*` : "",
      subtitle: esc(w.name || ""),
      icon: "briefcase",
      duration: fmtRange(w.startDate, w.endDate),
      location: esc(w.location || ""),
      description: esc(w.summary || ""),
      points: points.length ? points : "",
    };
  });

  const educationItems: Item[] = education.map((e) => {
    const degree = degreeLine(e.studyType, e.area, e.score);
    const courses = (e.courses ?? []).filter(Boolean);
    return {
      title: degree ? `*${esc(degree)}*` : `*${esc(e.institution || "")}*`,
      subtitle: degree ? esc(e.institution || "") : "",
      icon: "graduation-cap",
      duration: fmtRange(e.startDate, e.endDate),
      location: "",
      description: courses.length ? `Relevant coursework: ${esc(courses.join(", "))}` : "",
      points: "",
    };
  });

  const projectItems: Item[] = projects.map((p) => {
    const points = (p.highlights ?? []).filter(Boolean).map(esc);
    const desc = [p.description, p.url ? stripProtocol(p.url) : ""].filter(Boolean).join(" — ");
    return {
      title: p.name ? `*${esc(p.name)}*` : "",
      subtitle: "",
      icon: "star",
      duration: fmtRange(p.startDate, p.endDate),
      location: "",
      description: esc(desc),
      points: points.length ? points : "",
    };
  });

  // skills as compact items (title = group, description = items)
  const skills: CompactItem[] = skillGroups(resume).map((g) => ({
    title: g.label ? `*${esc(g.label)}*` : "",
    icon: "code",
    description: esc(g.items.join(", ")),
  }));

  const certs: CompactItem[] = certificates.map((c) => ({
    title: "",
    icon: "award",
    description: esc([c.name, c.issuer, c.date].filter(Boolean).join(" | ")),
  }));

  const languages: CompactItem[] = languageLines(resume).map((l) => ({
    title: "",
    icon: "language",
    description: esc(l),
  }));

  return {
    introduction,
    employment,
    education: educationItems,
    projects: projectItems,
    skills,
    certificates: certs,
    languages,
  };
}
