import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtLocation,
  languageLines,
  profileHandle,
  profileUrl,
  skillFlat,
  stripProtocol,
} from "../shared";

/** "Mar 2021" style label from an ISO-ish date string, or "" if absent. */
function fmtDate(date?: string): string {
  if (!date) return "";
  const m = /^(\d{4})-(\d{2})/.exec(date);
  if (m) {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const mi = parseInt(m[2], 10) - 1;
    return months[mi] ? `${months[mi]} ${m[1]}` : m[1];
  }
  const y = /^(\d{4})$/.exec(date);
  if (y) return y[1];
  return date;
}

/**
 * JSON shape consumed by modern-resume/resume.typ. The package is markup-driven
 * (a `modern-resume.with` show rule plus `== Section` headings and `#experience`
 * / `#project` / `#pill` calls). We do all human formatting here so the .typ
 * stays declarative.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const linkedinHandle = profileHandle(resume, "linkedin");
  const linkedinUrl = profileUrl(resume, "linkedin");
  const githubHandle = profileHandle(resume, "github");
  const githubUrl = profileUrl(resume, "github");

  return {
    name: basics.name || "Your Name",
    jobTitle: basics.label || "",
    bio: basics.summary || "",
    contact: {
      email: basics.email || "",
      mobile: basics.phone || "",
      location: fmtLocation(basics),
      linkedin: linkedinHandle
        ? { label: linkedinHandle, url: linkedinUrl || `https://${linkedinHandle}` }
        : null,
      github: githubHandle
        ? { label: githubHandle, url: githubUrl || `https://${githubHandle}` }
        : null,
      website: basics.url ? { label: stripProtocol(basics.url), url: basics.url } : null,
    },
    work: work.map((w) => ({
      title: w.position || "",
      subtitle: w.name || "",
      subtitleUrl: w.url || "",
      dateFrom: fmtDate(w.startDate),
      dateTo: w.endDate ? fmtDate(w.endDate) : "Present",
      facility: w.location || "",
      label: "Highlights",
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      title: degreeLine(e.studyType, e.area, e.score) || e.institution || "",
      subtitle: e.institution || "",
      dateFrom: fmtDate(e.startDate),
      dateTo: e.endDate ? fmtDate(e.endDate) : "Present",
      label: "Courses",
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    projects: projects.map((p) => ({
      title: p.name || "Project",
      titleUrl: p.url || "",
      subtitle: "",
      dateFrom: fmtDate(p.startDate),
      dateTo: p.endDate ? fmtDate(p.endDate) : "",
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    skills: skillFlat(resume),
    certificates: certificates.map((c) => ({
      title: c.name || "",
      subtitle: c.issuer || "",
      dateFrom: c.date ? fmtDate(c.date) : "",
      dateTo: "",
    })),
    languages: languageLines(resume),
  };
}
