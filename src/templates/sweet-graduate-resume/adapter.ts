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

/** A clickable link shown in the header (rendered as `name` + optional fa icon). */
interface HeaderUrl {
  name: string;
  url: string;
  /** FontAwesome icon name (or "" to render no icon). */
  icon: string;
  brand: boolean;
  solid: boolean;
}

/** "Mon YYYY" / "Present" pieces for a dated-section. */
function dateBounds(start?: string, end?: string): {
  start: string;
  end: string;
  ongoing: boolean;
} {
  const range = fmtRange(start, end);
  // fmtRange yields "Start – End" or "Start – Present"; split it back out.
  const [s = "", rest = ""] = range.split("–").map((p) => p.trim());
  if (!s) return { start: "", end: "", ongoing: false };
  if (rest === "Present" || rest === "") return { start: s, end: "", ongoing: true };
  return { start: s, end: rest, ongoing: false };
}

/**
 * JSON shape consumed by sweet-graduate-resume/resume.typ (markup-driven
 * template built on `header`, `section-header`, `education`, `points`,
 * `dual`, `dated-section`).
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const urls: HeaderUrl[] = [];
  if (basics.email) {
    urls.push({ name: basics.email, url: `mailto:${basics.email}`, icon: "envelope", brand: false, solid: true });
  }
  if (basics.url) {
    urls.push({ name: stripProtocol(basics.url), url: basics.url, icon: "link", brand: false, solid: true });
  }
  const gh = profileUrl(resume, "github");
  if (gh) {
    urls.push({ name: profileHandle(resume, "github"), url: gh, icon: "github", brand: true, solid: false });
  }
  const li = profileUrl(resume, "linkedin");
  if (li) {
    urls.push({ name: profileHandle(resume, "linkedin"), url: li, icon: "linkedin", brand: true, solid: false });
  }

  // Skills + certificates collapsed into a single bullet list.
  const skillPoints = skillGroups(resume).map((g) =>
    g.label ? `${g.label}: ${g.items.join(", ")}` : g.items.join(", "),
  );
  const certPoints = certificates
    .map((c) => [c.name, c.issuer, c.date].filter(Boolean).join(" — "))
    .filter(Boolean);

  // Relevant coursework (two-column) drawn from any education `courses`.
  const courses = education.flatMap((e) => (e.courses ?? []).filter(Boolean));

  return {
    name: basics.name || "Your Name",
    roll: basics.label || "",
    school: fmtLocation(basics) || basics.summary || "",
    urls,
    summary: basics.summary || "",
    education: education.map((e) => ({
      prog: degreeLine(e.studyType, e.area, e.score) || e.area || "Degree",
      school: [e.institution, fmtRange(e.startDate, e.endDate)].filter(Boolean).join(" · ") || "—",
      grade: e.score || "",
    })),
    courses,
    skills: skillPoints,
    certificates: certPoints,
    work: work.map((w) => {
      const { start, end, ongoing } = dateBounds(w.startDate, w.endDate);
      return {
        title: w.position || w.name || "Role",
        subtitle: [w.name, w.location].filter(Boolean).join(", "),
        start,
        end,
        ongoing,
        points: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
      };
    }),
    projects: projects.map((p) => {
      const { start, end, ongoing } = dateBounds(p.startDate, p.endDate);
      return {
        title: p.name || "Project",
        subtitle: p.url ? stripProtocol(p.url) : "",
        start,
        end,
        ongoing,
        points: [p.description, ...(p.highlights ?? [])].filter(Boolean),
      };
    }),
    languages: languageLines(resume),
  };
}
