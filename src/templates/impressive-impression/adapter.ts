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
import { fmtDate } from "../format";

/**
 * JSON shape consumed by impressive-impression/resume.typ.
 *
 * The package is data-driven through helper functions (`cv`, `make-aside-*`,
 * `make-main-content-block-with-timeline`). It expects a left/right aside with
 * shorter info (persona, contact, social, languages, skills) and a main column
 * (summary, work, education, projects, certificates). The default template also
 * uses a profile photo and FontAwesome icons, but both are optional extras
 * layered on top of the package — we omit them and rely on text labels, which
 * still produces a faithful CV.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const githubHandle = profileHandle(resume, "github");
  const linkedinHandle = profileHandle(resume, "linkedin");

  const social: { label: string; text: string; url: string }[] = [];
  if (linkedinHandle) {
    social.push({
      label: "LinkedIn",
      text: linkedinHandle,
      url: profileUrl(resume, "linkedin"),
    });
  }
  if (githubHandle) {
    social.push({
      label: "GitHub",
      text: githubHandle,
      url: profileUrl(resume, "github"),
    });
  }

  const contact: { label: string; text: string; url: string }[] = [];
  if (fmtLocation(basics)) contact.push({ label: "Location", text: fmtLocation(basics), url: "" });
  if (basics.url)
    contact.push({ label: "Web", text: stripProtocol(basics.url), url: basics.url });
  if (basics.phone)
    contact.push({ label: "Phone", text: basics.phone, url: `tel:${basics.phone}` });
  if (basics.email)
    contact.push({ label: "Email", text: basics.email, url: `mailto:${basics.email}` });

  return {
    name: basics.name || "Your Name",
    role: basics.label || "",
    summary: basics.summary || "",
    contact,
    social,
    languages: languageLines(resume),
    skills: skillFlat(resume),
    work: work.map((w) => ({
      title: w.position || "",
      company: w.name || "",
      url: w.url || "",
      start: fmtDate(w.startDate),
      end: w.endDate ? fmtDate(w.endDate) : w.startDate ? "Present" : "",
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      title: degreeLine(e.studyType, e.area, e.score) || e.institution || "Education",
      institution: e.institution || "",
      url: e.url || "",
      start: fmtDate(e.startDate),
      end: e.endDate ? fmtDate(e.endDate) : e.startDate ? "Present" : "",
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    projects: projects.map((p) => ({
      title: p.name || "Project",
      url: p.url ? stripProtocol(p.url) : "",
      start: fmtDate(p.startDate),
      end: p.endDate ? fmtDate(p.endDate) : "",
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    certificates: certificates.map((c) => ({
      title: c.name || "",
      issuer: c.issuer || "",
      date: c.date || "",
    })),
  };
}
