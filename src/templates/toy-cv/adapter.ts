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
 * JSON shape consumed by toy-cv/resume.typ. toy-cv is a 2-column template:
 * a colored left sidebar (contact + languages + skills + certificates) and a
 * right column (experience / projects / education) driven by `cv-entry`.
 * The .typ file builds that markup with #for loops over this object.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // Contact entries for the left "Contact" section. Each needs an icon name
  // (Font Awesome glyph name), display text, optional link + brand font.
  const contact: {
    logo: string;
    text: string;
    link: string;
    brand: boolean;
  }[] = [];

  if (basics.email) {
    contact.push({
      logo: "envelope",
      text: basics.email,
      link: `mailto:${basics.email}`,
      brand: false,
    });
  }
  if (basics.phone) {
    contact.push({
      logo: "phone",
      text: basics.phone,
      link: `tel:${basics.phone.replace(/[^+\d]/g, "")}`,
      brand: false,
    });
  }
  const loc = fmtLocation(basics);
  if (loc) {
    contact.push({ logo: "location-dot", text: loc, link: "", brand: false });
  }
  if (basics.url) {
    contact.push({
      logo: "globe",
      text: stripProtocol(basics.url),
      link: basics.url,
      brand: false,
    });
  }
  const gh = findProfile(resume, "github");
  if (gh) {
    const handle = gh.username || (gh.url ? stripProtocol(gh.url) : "");
    contact.push({
      logo: "github",
      text: handle ? `GitHub - ${handle}` : "GitHub",
      link: gh.url || "",
      brand: true,
    });
  }
  const li = findProfile(resume, "linkedin");
  if (li) {
    const handle = li.username || (li.url ? stripProtocol(li.url) : "");
    contact.push({
      logo: "linkedin",
      text: handle ? `LinkedIn - ${handle}` : "LinkedIn",
      link: li.url || "",
      brand: true,
    });
  }

  return {
    name: basics.name || "Your Name",
    subtitle: [basics.label, basics.summary].filter(Boolean).join("\n"),
    contact,
    languages: languageLines(resume),
    skills: skillGroups(resume),
    certificates: certificates
      .map((c) => [c.name, c.issuer].filter(Boolean).join(" — "))
      .filter(Boolean),
    work: work.map((w) => ({
      title: w.position || "",
      subtitle: [w.name, w.location].filter(Boolean).join(", "),
      date: fmtRange(w.startDate, w.endDate),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    projects: projects.map((p) => ({
      title: p.name || "Project",
      subtitle: p.url ? stripProtocol(p.url) : "",
      date: fmtRange(p.startDate, p.endDate),
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      title: degreeLine(e.studyType, e.area, e.score) || e.institution || "",
      subtitle: e.institution || "",
      date: fmtRange(e.startDate, e.endDate),
      highlights: (e.courses ?? []).filter(Boolean),
    })),
  };
}
