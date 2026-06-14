import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtLocation,
  languageLines,
  profileHandle,
  skillFlat,
  stripProtocol,
} from "../shared";

/**
 * Parse a JSON Resume date string ("2021", "2021-03", "2021-03-15") into the
 * numeric `(year, month, day)` array that min-resume's `#entry(time:)` wants.
 * Returns null if no usable year is present.
 */
function dateParts(date?: string): number[] | null {
  if (!date) return null;
  const m = date.match(/^(\d{4})(?:-(\d{1,2}))?(?:-(\d{1,2}))?/);
  if (!m) return null;
  const year = Number(m[1]);
  const month = m[2] ? Number(m[2]) : 1;
  const day = m[3] ? Number(m[3]) : 1;
  return [year, month, day];
}

/**
 * JSON shape consumed by min-resume/resume.typ (markup-driven template). All
 * dates are pre-parsed into numeric arrays for `#entry`, and the phone is only
 * forwarded when it carries the `+country-code` the package asserts on.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  // The package requires `name` and `address` to be non-none.
  const name = basics.name || "Your Name";
  const address = fmtLocation(basics) || "—";
  const phone = basics.phone && basics.phone.trim().startsWith("+") ? basics.phone.trim() : "";

  const summary = basics.summary || "";
  const site = basics.url ? stripProtocol(basics.url) : "";
  const github = profileHandle(resume, "github");
  const linkedin = profileHandle(resume, "linkedin");

  const entries = (
    items: { title: string; organization: string; location: string; from?: string; to?: string; skills: string[] }[],
  ) =>
    items.map((e) => ({
      title: e.title,
      organization: e.organization || "—",
      location: e.location,
      from: dateParts(e.from),
      to: dateParts(e.to),
      // Whether this is an ongoing role (no end date -> render "Since ...").
      ongoing: !e.to,
      skills: e.skills.filter(Boolean),
    }));

  return {
    name,
    title: basics.label || "",
    address,
    email: basics.email || "",
    phone,
    info: [github ? `GitHub: ${github}` : "", site].filter(Boolean).join("  |  "),
    summary,
    linkedin,
    work: entries(
      work.map((w) => ({
        title: w.position || w.name || "Role",
        organization: w.name || "",
        location: w.location || "",
        from: w.startDate,
        to: w.endDate,
        skills: [w.summary, ...(w.highlights ?? [])].filter((s): s is string => !!s),
      })),
    ),
    education: entries(
      education.map((e) => ({
        title: degreeLine(e.studyType, e.area, e.score) || e.institution || "Education",
        organization: e.institution || "",
        location: "",
        from: e.startDate,
        to: e.endDate,
        skills: (e.courses ?? []).filter(Boolean),
      })),
    ),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      url: p.url ? stripProtocol(p.url) : "",
      items: [p.description, ...(p.highlights ?? [])].filter((s): s is string => !!s),
    })),
    skills: skillFlat(resume),
    certificates: certificates.map((c) =>
      [c.name, c.issuer, c.date].filter(Boolean).join(", "),
    ),
    languages: languageLines(resume),
  };
}
