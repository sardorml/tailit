import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  findProfile,
  fmtLocation,
  fmtRange,
  languageLines,
  skillFlat,
  stripProtocol,
} from "../shared";

/** Map a language fluency phrase to a 1-5 dot rating for chuli-cv's `language`. */
function fluencyLevel(fluency?: string): number {
  const f = (fluency ?? "").toLowerCase();
  if (/native|mother|bilingual|fluent|c2/.test(f)) return 5;
  if (/profession|advanced|c1|full/.test(f)) return 4;
  if (/conversation|intermediate|b2|working|limited/.test(f)) return 3;
  if (/basic|element|beginner|a1|a2|b1/.test(f)) return 2;
  return f ? 3 : 2;
}

/**
 * JSON shape consumed by chuli-cv/resume.typ (markup-driven template that
 * exposes #header / #section / #entry / #education-entry / #skill / #language).
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects } = resume;

  // Social/contact rows: each has an icon key + display text + link.
  const socials: { icon: string; text: string; link: string }[] = [];
  if (basics.email) {
    socials.push({ icon: "mail", text: basics.email, link: `mailto:${basics.email}` });
  }
  if (basics.phone) {
    socials.push({ icon: "phone", text: basics.phone, link: `tel:${basics.phone.replace(/\s+/g, "")}` });
  }
  const gh = findProfile(resume, "github");
  if (gh) {
    const handle = gh.username || (gh.url ? stripProtocol(gh.url) : "");
    if (handle) socials.push({ icon: "github", text: handle, link: gh.url || `https://github.com/${handle}` });
  }
  const li = findProfile(resume, "linkedin");
  if (li) {
    const handle = li.username || (li.url ? stripProtocol(li.url) : "");
    if (handle) socials.push({ icon: "linkedin", text: handle, link: li.url || `https://linkedin.com/in/${handle}` });
  }
  if (basics.url) {
    socials.push({ icon: "homepage", text: stripProtocol(basics.url), link: basics.url });
  }

  return {
    name: basics.name || "Your Name",
    jobTitle: basics.label || "",
    location: fmtLocation(basics),
    summary: basics.summary || "",
    socials,
    work: work.map((w) => ({
      title: w.position || "",
      company: w.name || "",
      date: fmtRange(w.startDate, w.endDate),
      location: w.location || "",
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    projects: projects.map((p) => ({
      title: p.name || "Project",
      company: p.url ? stripProtocol(p.url) : "Project",
      date: fmtRange(p.startDate, p.endDate),
      location: "",
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      title: degreeLine(e.studyType, e.area) || e.area || "",
      institution: e.institution || "",
      date: fmtRange(e.startDate, e.endDate),
      location: "",
      gpa: e.score || "",
    })),
    skills: skillFlat(resume),
    languages: resume.languages
      .filter((l) => l.language)
      .map((l) => ({
        name: l.language || "",
        label: l.fluency || "",
        level: fluencyLevel(l.fluency),
      })),
    // Fallback flat language strings (unused by .typ but handy for parity).
    languageLines: languageLines(resume),
  };
}
