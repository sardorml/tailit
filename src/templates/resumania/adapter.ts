import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  findProfile,
  fmtLocation,
  fmtRange,
  profileHandle,
  profileUrl,
  skillGroups,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by resumania/resume.typ. Resumania is a markup/constructor
 * driven package: we build `contact-section`, `education-section`, `work-section`,
 * `project-section`, and `skills-section` from this data in the .typ file. All
 * human formatting (dates, degree lines, contact handles) happens here.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects } = resume;

  const githubUrl = profileUrl(resume, "github");
  const linkedinUrl = profileUrl(resume, "linkedin");
  const linkedinProfile = findProfile(resume, "linkedin");

  return {
    name: basics.name || "Your Name",
    contact: {
      phone: basics.phone || "",
      email: basics.email || "",
      location: fmtLocation(basics),
      site: basics.url ? stripProtocol(basics.url) : "",
      siteUrl: basics.url || "",
      github: profileHandle(resume, "github"),
      githubUrl: githubUrl || (profileHandle(resume, "github") ? `https://github.com/${profileHandle(resume, "github")}` : ""),
      linkedin: profileHandle(resume, "linkedin"),
      linkedinUrl: linkedinUrl || (linkedinProfile?.username ? `https://linkedin.com/in/${linkedinProfile.username}` : ""),
    },
    summary: basics.summary || "",
    education: education.map((e) => ({
      institution: e.institution || "",
      location: e.url ? stripProtocol(e.url) : "",
      degree: degreeLine(e.studyType, e.area, e.score),
      timeframe: fmtRange(e.startDate, e.endDate),
      courses: (e.courses ?? []).filter(Boolean),
    })),
    work: work.map((w) => ({
      company: w.name || "",
      position: w.position || "",
      location: w.location || "",
      timeframe: fmtRange(w.startDate, w.endDate),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    projects: projects.map((p) => ({
      title: p.name || "Project",
      location: p.url ? stripProtocol(p.url) : "",
      timeframe: fmtRange(p.startDate, p.endDate),
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    skills: skillGroups(resume).map((g) => ({
      category: g.label || "Skills",
      items: g.items,
    })),
  };
}
