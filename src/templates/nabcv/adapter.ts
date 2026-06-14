import type { Resume } from "@/lib/resume/schema";
import { degreeLine, fmtLocation, profileHandle, skillGroups } from "../shared";

/**
 * JSON shape consumed by nabcv/resume.typ (data-driven, two-column package).
 * The package's `cv()` function takes named args; resume.typ forwards each key
 * of this object to it. Dates stay as "YYYY-MM"/"YYYY" so the package can format
 * them; "present" marks an ongoing role.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates, languages } = resume;

  // Only LinkedIn/GitHub map cleanly onto the package's default profiles-config.
  const profiles = [
    { network: "GitHub", username: profileHandle(resume, "github") },
    { network: "LinkedIn", username: profileHandle(resume, "linkedin") },
  ].filter((p) => p.username);

  // Skills sidebar: { group, items } where items is a comma-joined string.
  const skills = skillGroups(resume).map((g) => ({
    group: g.label || "Skills",
    items: g.items.join(", "),
  }));
  // Spoken languages get their own skill group (the package has a "Languages" icon).
  const langItems = languages
    .map((l) => (l.fluency ? `${l.language} (${l.fluency})` : l.language || ""))
    .filter(Boolean);
  if (langItems.length) skills.push({ group: "Languages", items: langItems.join(", ") });

  const experience = work.map((w) => ({
    company: w.name || "",
    position: w.position || "",
    summary: w.summary || "",
    location: w.location || "",
    start_date: w.startDate || "",
    end_date: w.endDate || (w.startDate ? "present" : ""),
    highlights: (w.highlights ?? []).filter(Boolean),
  }));

  const educationEntries = education.map((e) => ({
    company: degreeLine(e.studyType, e.area, e.score) || e.institution || "",
    summary: e.institution || "",
    location: "",
    start_date: e.startDate || "",
    end_date: e.endDate || "",
    highlights: (e.courses ?? []).filter(Boolean),
  }));

  // Projects + certificates both become "courses"-style list entries in the
  // main column (name + italic subtitle + date), with projects first.
  const courses = [
    ...projects.map((p) => ({
      name: p.name || "Project",
      summary: [p.description, ...(p.highlights ?? [])].filter(Boolean).join(" — "),
      date: p.endDate || p.startDate || "",
    })),
    ...certificates.map((c) => ({
      name: c.name || "",
      summary: c.issuer || "",
      date: c.date || "",
    })),
  ];

  return {
    name: basics.name || "Your Name",
    headline: basics.label || "",
    location: fmtLocation(basics),
    email: basics.email || "",
    phone: basics.phone || "",
    summary: basics.summary || "",
    profiles,
    skills,
    experience,
    education: educationEntries,
    courses,
  };
}
