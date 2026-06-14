import type { Resume } from "@/lib/resume/schema";
import { degreeLine, fmtLocation, stripProtocol } from "../shared";

/**
 * Adapter for @preview/kiresume (0.1.17). This is a DATA-DRIVEN package: its
 * `resume(..)` function takes `candidate-name`, `job-title`, `links`,
 * `sections`, and `style`. Each section has a `title` and `subsections`; each
 * subsection may carry `title`, `subtitle`, `location`, `from`/`to` (each a
 * `{ year, month }` dict), `text` (rendered as markup), and `items` (either an
 * array of bullet strings or a `{ label: value }` dict for skill groups).
 *
 * We build exactly that object here so resume.typ can spread it into `resume`.
 */

type KiDate = { year: number; month: number };

/** Parse "2021-03" / "2021/03" / "2021" into kiresume's { year, month } dict. */
function kiDate(value?: string): KiDate | undefined {
  if (!value) return undefined;
  const m = value.match(/(\d{4})(?:[-/](\d{1,2}))?/);
  if (!m) return undefined;
  const year = Number(m[1]);
  if (!Number.isFinite(year) || year <= 0) return undefined;
  const month = m[2] ? Math.min(Math.max(Number(m[2]), 1), 12) : 1;
  return { year, month };
}

interface KiSubsection {
  title?: string;
  subtitle?: string;
  location?: string;
  from?: KiDate;
  to?: KiDate;
  text?: string;
  items?: string[] | Record<string, string>;
}

interface KiSection {
  title: string;
  subsections: KiSubsection[];
}

/** Build the header link row (email, phone, location, site, profiles). */
function buildLinks(resume: Resume): { display: string; destination?: string }[] {
  const { basics } = resume;
  const links: { display: string; destination?: string }[] = [];

  if (basics.email) {
    links.push({ display: basics.email, destination: `mailto:${basics.email}` });
  }
  if (basics.phone) links.push({ display: basics.phone });
  const location = fmtLocation(basics);
  if (location) links.push({ display: location });
  if (basics.url) {
    links.push({ display: stripProtocol(basics.url), destination: basics.url });
  }
  for (const p of basics.profiles ?? []) {
    const url = p.url || "";
    const display = url ? stripProtocol(url) : p.username || p.network || "";
    if (!display) continue;
    links.push(url ? { display, destination: url } : { display });
  }
  return links;
}

export function adapt(resume: Resume): unknown {
  const { basics, work, education, projects, skills, certificates, languages } = resume;

  const sections: KiSection[] = [];

  if (basics.summary) {
    sections.push({
      title: "Summary",
      subsections: [{ text: basics.summary }],
    });
  }

  if (work.length) {
    sections.push({
      title: "Experience",
      subsections: work.map((w) => {
        const items = [w.summary, ...(w.highlights ?? [])].filter(Boolean) as string[];
        return {
          title: w.position || w.name || "",
          subtitle: w.name || "",
          location: w.location || undefined,
          from: kiDate(w.startDate),
          to: kiDate(w.endDate),
          items,
        };
      }),
    });
  }

  if (projects.length) {
    sections.push({
      title: "Projects",
      subsections: projects.map((p) => {
        const items = [p.description, ...(p.highlights ?? [])].filter(Boolean) as string[];
        return {
          title: p.name || "Project",
          subtitle: p.url ? stripProtocol(p.url) : undefined,
          from: kiDate(p.startDate),
          to: kiDate(p.endDate),
          items,
        };
      }),
    });
  }

  if (skills.length) {
    // kiresume renders a dict subsection as "- *key:* value" lines. Keys must
    // be unique; a group with no name (just keywords) lists them as a bullet.
    const map: Record<string, string> = {};
    const bullets: string[] = [];
    for (const s of skills) {
      const kws = (s.keywords ?? []).filter(Boolean);
      if (s.name && kws.length) {
        let key = s.name;
        while (key in map) key += " ";
        map[key] = kws.join(", ");
      } else if (kws.length) {
        bullets.push(kws.join(", "));
      } else if (s.name) {
        bullets.push(s.name);
      }
    }
    const subsections: KiSubsection[] = [];
    if (Object.keys(map).length) subsections.push({ items: map });
    if (bullets.length) subsections.push({ items: bullets });
    if (subsections.length) sections.push({ title: "Skills", subsections });
  }

  if (education.length) {
    sections.push({
      title: "Education",
      subsections: education.map((e) => {
        const items = (e.courses ?? []).filter(Boolean) as string[];
        return {
          title: degreeLine(e.studyType, e.area, e.score) || e.institution || "",
          subtitle: e.institution || undefined,
          from: kiDate(e.startDate),
          to: kiDate(e.endDate),
          items,
        };
      }),
    });
  }

  if (certificates.length) {
    // A cert has a single date, not a range, so fold it into the subtitle
    // rather than passing `from` (which would render as "<date> — Present").
    sections.push({
      title: "Certifications",
      subsections: certificates.map((c) => {
        const subtitle = [c.issuer, c.date].filter(Boolean).join(" · ");
        return {
          title: c.name || "",
          subtitle: subtitle || undefined,
          items: [] as string[],
        };
      }),
    });
  }

  if (languages.length) {
    const map: Record<string, string> = {};
    for (const l of languages) {
      if (!l.language) continue;
      map[l.language] = l.fluency || "—";
    }
    if (Object.keys(map).length) {
      sections.push({ title: "Languages", subsections: [{ items: map }] });
    }
  }

  return {
    "candidate-name": basics.name || "Your Name",
    "job-title": basics.label || "",
    links: buildLinks(resume),
    sections,
    style: {
      font: "Noto Sans",
      "header-color": "#1a3c6e",
      "divider-color": "#1a3c6e",
      "link-color": "#1a3c6e",
    },
  };
}
