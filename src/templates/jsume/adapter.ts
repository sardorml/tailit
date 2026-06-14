import type { Resume } from "@/lib/resume/schema";
import { fmtLocation, skillGroups, stripProtocol } from "../shared";

/**
 * Adapter for @preview/jsume (data-driven). The package's `jsume.with()` takes a
 * single `jsume-data` dict and renders every section from it. The jsume JSON
 * shape differs from JSON Resume: dates are `{year, month}` objects (or `false`
 * for ongoing → "Present"), work uses `company`/`website`, education uses
 * `major`/`degree`/`gpa`, projects use `githubUrl`. We map all of that here.
 */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * Format a "YYYY-MM" / "YYYY-MM-DD" / "YYYY" string as a display string. jsume's
 * `date-to-str` passes strings through unchanged, so we control formatting here
 * (its dict path does integer arithmetic that breaks on year-only dates).
 */
function toDate(raw?: string): string {
  if (!raw) return "";
  const m = raw.match(/^(\d{4})(?:-(\d{1,2}))?/);
  if (!m) return raw;
  const year = m[1];
  if (m[2]) {
    const mon = MONTHS[Number(m[2]) - 1];
    return mon ? `${mon} ${year}` : year;
  }
  return year;
}

/**
 * End date: jsume renders `false` as the localized "Present". A missing end date
 * with a start date means ongoing, so emit `false`; otherwise the formatted date.
 */
function toEndDate(start?: string, end?: string): string | false {
  if (end) return toDate(end);
  if (start) return false;
  return "";
}

export function adapt(resume: Resume): unknown {
  const { basics, work, education, projects, certificates } = resume;

  const location = fmtLocation(basics);
  const portfolio = basics.url || "";

  return {
    basics: {
      name: basics.name || "Your Name",
      label: basics.label || "",
      location,
      email: basics.email || "",
      phone: basics.phone || "",
      url: portfolio ? stripProtocol(portfolio) : "",
      summary: basics.summary || "",
    },
    work: work.map((w) => ({
      company: w.name || "",
      position: w.position || "",
      location: w.location || "",
      website: w.url || "",
      startDate: toDate(w.startDate),
      endDate: toEndDate(w.startDate, w.endDate),
      summary: w.summary || "",
      highlights: (w.highlights ?? []).filter(Boolean),
    })),
    education: education.map((e) => ({
      institution: e.institution || "",
      location: "",
      major: e.area || "",
      degree: [e.studyType, e.area].filter(Boolean).join(" in "),
      gpa: e.score || "",
      startDate: toDate(e.startDate),
      endDate: toDate(e.endDate),
      activities: [],
      courses: (e.courses ?? []).filter(Boolean),
    })),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      website: p.url && !/github\.com/i.test(p.url) ? p.url : "",
      githubUrl: p.url && /github\.com/i.test(p.url) ? p.url : "",
      startDate: toDate(p.startDate),
      endDate: toDate(p.endDate),
      summary: p.description || "",
      highlights: (p.highlights ?? []).filter(Boolean),
    })),
    certificates: certificates.map((c) => ({
      name: c.name || "",
      url: c.url || "",
      issueDate: toDate(c.date),
      expDate: "",
      issuer: c.issuer || "",
    })),
    skills: skillGroups(resume).map((g) => ({
      name: g.label || "Skills",
      keywords: g.items,
    })),
    languages: resume.languages
      .filter((l) => l.language)
      .map((l) => ({ language: l.language || "", fluency: l.fluency || "" })),
  };
}
