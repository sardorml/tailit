import type { Resume } from "@/lib/resume/schema";
import { degreeLine, fmtLocation, fmtRange, profileHandle, stripProtocol } from "../shared";

/**
 * JSON shape consumed by brilliant-cv/resume.typ.
 *
 * brilliant-cv is a data-driven package: its `cv()` show rule takes a metadata
 * dict (normally read from a profile's metadata.toml) and stores it in a state
 * that the per-section component functions (cv-section / cv-entry / cv-skill /
 * cv-honor) read back. We can't ship a TOML file, so the .typ assembles that
 * same metadata dict from `personal` + `layout` below, then drives the body
 * markup from `work` / `education` / `projects` / `skills` / `certificates`.
 *
 * All human formatting (dates, degree strings, contact handles) is done here so
 * the .typ stays declarative.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // Split name into first/last for the header's light+bold treatment.
  const fullName = basics.name?.trim() || "Your Name";
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts.length > 1 ? nameParts.slice(0, -1).join(" ") : fullName;
  const lastName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : "";

  const github = profileHandle(resume, "github");
  const linkedin = profileHandle(resume, "linkedin");
  const homepage = basics.url ? stripProtocol(basics.url) : "";

  // Contact line entries, in header display order. Each becomes an icon+link.
  const info: { key: string; value: string }[] = [];
  if (basics.email) info.push({ key: "email", value: basics.email });
  if (basics.phone) info.push({ key: "phone", value: basics.phone });
  if (github) info.push({ key: "github", value: github });
  if (linkedin) info.push({ key: "linkedin", value: linkedin });
  if (homepage) info.push({ key: "homepage", value: homepage });
  const loc = fmtLocation(basics);
  if (loc) info.push({ key: "location", value: loc });

  return {
    personal: {
      first_name: firstName,
      last_name: lastName,
      header_quote: basics.label || basics.summary || "",
      info,
    },
    summary: basics.summary || "",
    work: work.map((w) => ({
      title: w.position || "",
      society: w.name || "",
      location: w.location || "",
      date: fmtRange(w.startDate, w.endDate),
      description: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      title: degreeLine(e.studyType, e.area, e.score) || e.area || "Education",
      society: e.institution || "",
      location: "",
      date: fmtRange(e.startDate, e.endDate),
      description: (e.courses ?? []).filter(Boolean),
    })),
    projects: projects.map((p) => ({
      title: p.name || "Project",
      society: p.url ? stripProtocol(p.url) : "",
      location: "",
      date: fmtRange(p.startDate, p.endDate),
      description: [p.description, ...(p.highlights ?? [])].filter(Boolean),
      tags: (p.keywords ?? []).filter(Boolean),
    })),
    // Skills as { type, items } rows; each renders as "Type   a | b | c".
    skills: resume.skills
      .map((s) => ({
        type: s.name || "",
        items: (s.keywords ?? []).filter(Boolean),
      }))
      .filter((s) => s.items.length > 0 || s.type),
    languages: resume.languages
      .map((l) => (l.fluency ? `${l.language} (${l.fluency})` : l.language || ""))
      .filter(Boolean),
    certificates: certificates.map((c) => ({
      date: c.date || "",
      title: c.name || "",
      issuer: c.issuer || "",
      url: c.url || "",
      location: "",
    })),
    // Accent + ATS keywords (skill keywords, flattened) for the hidden inject layer.
    accent: "#0395DE",
    keywords: Array.from(
      new Set(resume.skills.flatMap((s) => (s.keywords ?? []).filter(Boolean))),
    ),
  };
}
