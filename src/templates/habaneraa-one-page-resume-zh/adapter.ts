import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtLocation,
  fmtRange,
  languageLines,
  profileHandle,
  profileUrl,
  skillGroups,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by habaneraa-one-page-resume-zh/resume.typ.
 *
 * The package is markup-driven: `setup-styles()` returns `resume-header` and
 * `resume-entry`. We feed the header's contact fields (telephone/email/
 * github-id/other-link/location) plus a `basic-info` line (headline + LinkedIn)
 * and then emit `= Section` headings with `resume-entry(...)` items, mirroring
 * its template/main.typ. All formatting is done here so the .typ stays dumb.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // Header "basic-info" line: target role plus LinkedIn handle if present.
  const linkedin = profileHandle(resume, "linkedin");
  const basicInfo = [basics.label || "", linkedin ? `LinkedIn: ${linkedin}` : ""].filter(Boolean);

  return {
    name: basics.name || "Your Name",
    basicInfo,
    telephone: basics.phone || "",
    email: basics.email || "",
    // github-id auto-expands to github.com/<id>, so pass just the handle.
    github: profileHandle(resume, "github"),
    // other-link wants a full URL.
    otherLink: basics.url || profileUrl(resume, "linkedin") || "",
    location: fmtLocation(basics),
    summary: basics.summary || "",
    work: work.map((w) => ({
      title: w.name || "",
      subtitle: w.position || "",
      date: [fmtRange(w.startDate, w.endDate), w.location || ""].filter(Boolean).join(" · "),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      title: e.institution || "",
      subtitle: degreeLine(e.studyType, e.area, e.score),
      date: fmtRange(e.startDate, e.endDate),
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    projects: projects.map((p) => ({
      title: p.name || "Project",
      subtitle: p.url ? stripProtocol(p.url) : "",
      date: fmtRange(p.startDate, p.endDate),
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    skills: skillGroups(resume),
    certificates: certificates.map((c) => ({
      title: c.name || "",
      subtitle: c.issuer || "",
      date: c.date || "",
    })),
    languages: languageLines(resume),
  };
}
