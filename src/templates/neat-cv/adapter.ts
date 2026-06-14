import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtLocation,
  fmtRange,
  languageLines,
  profileHandle,
  skillGroups,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by neat-cv/resume.typ. neat-cv is markup-driven: a
 * `cv.with(author: ...)` show rule plus a `cv-with-side[sidebar][body]`
 * two-column layout built from `= Section` headings and `#entry(...)` calls.
 * The package pulls contact/social links from the `author` dict via state, so
 * we shape that here; everything else drives the markup loops.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const fullName = basics.name || "Your Name";
  const parts = fullName.trim().split(/\s+/);
  const firstname = parts.length > 1 ? parts.slice(0, -1).join(" ") : fullName;
  const lastname = parts.length > 1 ? parts[parts.length - 1] : "";

  // Address: location string + optional contact lines (phone shown via author).
  const address = fmtLocation(basics);

  const github = profileHandle(resume, "github");
  const linkedin = profileHandle(resume, "linkedin");
  const website = basics.url ? stripProtocol(basics.url) : "";

  // author dict — keys neat-cv recognises (firstname, lastname, email, phone,
  // address, position, website, github, linkedin). Omit empty keys so the
  // package's `"key" in author` checks skip them.
  const author: Record<string, unknown> = { firstname, lastname };
  if (basics.label) author.position = basics.label;
  if (basics.email) author.email = basics.email;
  if (basics.phone) author.phone = basics.phone;
  if (address) author.address = address;
  if (website) author.website = website;
  if (github) author.github = github;
  if (linkedin) author.linkedin = linkedin;

  return {
    author,
    summary: basics.summary || "",
    // Sidebar skill groups -> item-with-level rows. We don't have numeric
    // levels, so render each keyword as a pill group instead (label heading +
    // pills) to stay truthful.
    skills: skillGroups(resume),
    languages: languageLines(resume),
    education: education.map((e) => ({
      title: degreeLine(e.studyType, e.area) || e.institution || "",
      date: fmtRange(e.startDate, e.endDate),
      institution: e.studyType || e.area ? e.institution || "" : "",
      location: "",
      score: e.score || "",
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    work: work.map((w) => ({
      title: w.position || "",
      date: fmtRange(w.startDate, w.endDate),
      institution: w.name || "",
      location: w.location || "",
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    projects: projects.map((p) => ({
      title: p.name || "Project",
      date: fmtRange(p.startDate, p.endDate),
      institution: p.url ? stripProtocol(p.url) : "",
      location: "",
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    certificates: certificates.map((c) => ({
      title: c.name || "",
      date: c.date || "",
      institution: c.issuer || "",
      location: "",
      highlights: [] as string[],
    })),
  };
}
