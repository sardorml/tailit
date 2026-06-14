import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtLocation,
  fmtRange,
  languageLines,
  profileHandle,
  profileUrl,
  skillFlat,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by typographic-resume/resume.typ (markup-driven, two
 * columns: an aside with contact/skills/languages and a main column with work
 * and education). All human formatting happens here so the .typ stays dumb.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects } = resume;

  const full = (basics.name || "Your Name").trim().split(/\s+/);
  const firstName = full.length > 1 ? full.slice(0, -1).join(" ") : full[0] || "Your";
  const lastName = full.length > 1 ? full[full.length - 1] : "Name";

  const githubUrl = profileUrl(resume, "github");
  const githubHandle = profileHandle(resume, "github");
  const linkedinUrl = profileUrl(resume, "linkedin");
  const linkedinHandle = profileHandle(resume, "linkedin");

  return {
    firstName,
    lastName,
    profession: basics.label || "",
    bio: basics.summary || "",
    contact: {
      phone: basics.phone || "",
      email: basics.email || "",
      site: basics.url ? stripProtocol(basics.url) : "",
      siteUrl: basics.url || "",
      githubUrl: githubUrl || (githubHandle ? `https://github.com/${githubHandle}` : ""),
      githubHandle,
      linkedinUrl,
      linkedinHandle,
    },
    location: fmtLocation(basics),
    skills: skillFlat(resume),
    languages: languageLines(resume).map((l) => {
      const m = l.match(/^(.*) \((.*)\)$/);
      return m ? { language: m[1], level: m[2] } : { language: l, level: "" };
    }),
    work: work.map((w) => ({
      timeframe: fmtRange(w.startDate, w.endDate),
      title: w.position || "",
      organization: w.name || "",
      location: w.location || "",
      body: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      timeframe: fmtRange(e.startDate, e.endDate),
      title: degreeLine(e.studyType, e.area, e.score) || e.area || "",
      institution: e.institution || "",
      body: (e.courses ?? []).filter(Boolean),
    })),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      url: p.url || "",
      label: p.url ? stripProtocol(p.url) : p.name || "Project",
    })),
  };
}
