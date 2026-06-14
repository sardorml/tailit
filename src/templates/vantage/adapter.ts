import type { Resume } from "@/lib/resume/schema";
import {
  contactParts,
  degreeLine,
  fmtLocation,
  fmtRange,
  skillLines,
  stripProtocol,
} from "../shared";

/** The JSON shape consumed by vantage/resume.typ. */
export interface VantageData {
  name: string;
  position: string;
  tagline: string;
  links: { name: string; link: string; display: string }[];
  experience: {
    position: string;
    company: string;
    companyLink: string;
    dates: string;
    location: string;
    summary: string;
    highlights: string[];
  }[];
  projects: { name: string; link: string; dates: string; description: string; highlights: string[] }[];
  education: { institution: string; link: string; dates: string; location: string; degree: string }[];
  skills: string[];
  languages: string[];
  certificates: { name: string; description: string }[];
}

/** Pick an icon name (must exist in vantage/icons/) for a profile network. */
function profileIcon(network?: string): string {
  const n = (network ?? "").toLowerCase();
  if (n.includes("github")) return "github";
  if (n.includes("linkedin")) return "linkedin";
  return "website";
}

/** Build the header contact links (only those present), mapped to known icons. */
function buildLinks(resume: Resume): VantageData["links"] {
  const { basics } = resume;
  const links: VantageData["links"] = [];
  if (basics.email) links.push({ name: "email", link: `mailto:${basics.email}`, display: basics.email });
  const loc = fmtLocation(basics);
  if (loc) links.push({ name: "location", link: "", display: loc });
  if (basics.phone) links.push({ name: "website", link: `tel:${basics.phone}`, display: basics.phone });
  if (basics.url) links.push({ name: "website", link: basics.url, display: stripProtocol(basics.url) });
  for (const p of basics.profiles ?? []) {
    const url = p.url || "";
    const display = p.username || (url ? stripProtocol(url) : "");
    if (!url && !display) continue;
    links.push({ name: profileIcon(p.network), link: url, display });
  }
  return links;
}

export function adapt(resume: Resume): VantageData {
  const { basics, work, education, projects, certificates, languages } = resume;
  const links = buildLinks(resume);
  return {
    name: basics.name || "Your Name",
    position: basics.label || "",
    tagline: basics.summary || "",
    links:
      links.length > 0
        ? links
        : contactParts(basics).map((p) => ({ name: "website", link: "", display: p })),
    experience: work.map((w) => ({
      position: w.position || "",
      company: w.name || "",
      companyLink: w.url || "",
      dates: fmtRange(w.startDate, w.endDate),
      location: w.location || "",
      summary: w.summary || "",
      highlights: (w.highlights ?? []).filter(Boolean),
    })),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      link: p.url || "",
      dates: fmtRange(p.startDate, p.endDate),
      description: p.description || "",
      highlights: (p.highlights ?? []).filter(Boolean),
    })),
    education: education.map((e) => ({
      institution: e.institution || "",
      link: e.url || "",
      dates: fmtRange(e.startDate, e.endDate),
      location: "",
      degree: degreeLine(e.studyType, e.area, e.score),
    })),
    skills: skillLines(resume),
    languages: languages
      .map((l) => (l.fluency ? `${l.language} (${l.fluency})` : l.language || ""))
      .filter(Boolean),
    certificates: certificates.map((c) => ({
      name: c.name || "",
      description: [c.issuer, c.date].filter(Boolean).join(" · "),
    })),
  };
}
