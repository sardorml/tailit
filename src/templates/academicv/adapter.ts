import type { Resume } from "@/lib/resume/schema";
import { degreeLine, fmtRange, skillGroups, stripProtocol } from "../shared";

/**
 * JSON shape consumed by academicv/resume.typ. academicv is a DATA-DRIVEN
 * package: its entrypoint reads a `cv-data` dict (parsed from YAML) with
 * `settings`, `personal`, and a `sections` array, then renders each section
 * with a named layout (header / prose / timeline / bullet-list). We build that
 * exact dict here so resume.typ can mirror the package's entrypoint logic.
 *
 * Dates are formatted to plain strings (the timeline layout joins start/end
 * itself, so we pass them separately). All human formatting lives here.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const locationParts = {
    city: basics.location?.city || "",
    region: basics.location?.region || "",
    country: basics.location?.countryCode || "",
  };

  const titles = [basics.label].filter((t): t is string => !!t);

  // Only include contact keys that have a value — the header layout's `website`
  // path calls `.split("//")`, which would crash on an empty string.
  const contact: Record<string, string> = {};
  if (basics.email) contact.email = basics.email;
  if (basics.phone) contact.phone = basics.phone;
  if (basics.url) contact.website = basics.url;

  const profiles = (basics.profiles ?? [])
    .filter((p) => p.url)
    .map((p) => ({
      network: p.network || "",
      username: p.username || "",
      url: p.url || "",
    }));

  // Experience entries (timeline). Description holds summary + highlights as
  // one block; the timeline layout renders it as the tertiary element.
  const experience = work.map((w) => ({
    institution: w.name || "",
    location: w.location || "",
    title: w.position || "",
    "start-date": fmtRange(w.startDate),
    "end-date": w.endDate ? fmtRange(w.endDate) : "Present",
    description: [w.summary, ...(w.highlights ?? [])].filter(Boolean).join(" "),
  }));

  const educationEntries = education.map((e) => ({
    institution: e.institution || "",
    location: "",
    title: degreeLine(e.studyType, e.area, e.score),
    "start-date": fmtRange(e.startDate),
    "end-date": e.endDate ? fmtRange(e.endDate) : "",
  }));

  const projectEntries = projects.map((p) => ({
    institution: p.name || "Project",
    title: p.url ? stripProtocol(p.url) : "",
    "start-date": fmtRange(p.startDate),
    "end-date": p.endDate ? fmtRange(p.endDate) : "",
    description: [p.description, ...(p.highlights ?? [])].filter(Boolean).join(" "),
  }));

  // Skills rendered as a bullet list: "Group: a, b, c" lines.
  const skillItems = skillGroups(resume).map((g) =>
    g.label ? `*${g.label}:* ${g.items.join(", ")}` : g.items.join(", "),
  );

  const certificateItems = certificates
    .map((c) =>
      [c.name, c.issuer, c.date].filter(Boolean).join(", "),
    )
    .filter(Boolean);

  // Build the sections array dynamically so empty sections are omitted.
  const sections: Array<Record<string, unknown>> = [
    { key: "personal", layout: "header", show: true, include: ["titles", "location", "contact"] },
  ];

  if (basics.summary) {
    sections.push({
      key: "statement",
      layout: "prose",
      title: "Summary",
      show: true,
      entries: [basics.summary],
    });
  }
  if (experience.length) {
    sections.push({
      key: "experience",
      layout: "timeline",
      "primary-element": ["institution"],
      "secondary-element": ["title"],
      "tertiary-element": ["description"],
      title: "Experience",
      show: true,
      entries: experience,
    });
  }
  if (educationEntries.length) {
    sections.push({
      key: "education",
      layout: "timeline",
      "primary-element": ["institution"],
      "secondary-element": ["title"],
      title: "Education",
      show: true,
      entries: educationEntries,
    });
  }
  if (projectEntries.length) {
    sections.push({
      key: "projects",
      layout: "timeline",
      "primary-element": ["institution"],
      "secondary-element": ["title"],
      "tertiary-element": ["description"],
      title: "Projects",
      show: true,
      entries: projectEntries,
    });
  }
  if (skillItems.length) {
    sections.push({
      key: "skills",
      layout: "bullet-list",
      title: "Skills",
      show: true,
      entries: skillItems,
    });
  }
  if (certificateItems.length) {
    sections.push({
      key: "certificates",
      layout: "bullet-list",
      title: "Certifications",
      show: true,
      entries: certificateItems,
    });
  }

  return {
    settings: {
      "font-heading": "Libertinus Serif",
      "font-body": "Libertinus Serif",
      fontsize: "10pt",
      "spacing-section": "12pt",
      "spacing-entry": "0.5em",
      "spacing-element": "3pt",
      "spacing-line": "5pt",
      "color-hyperlink": "rgb(50, 120, 180)",
      page: {
        paper: "a4",
        numbering: "1 / 1",
        "number-align": "center",
        margin: "2.5cm",
      },
    },
    personal: {
      name: basics.name || "Your Name",
      titles,
      location: locationParts,
      contact,
      profiles,
    },
    sections,
  };
}
