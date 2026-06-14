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
 * JSON shape consumed by grotesk-cv/resume.typ.
 *
 * grotesk-cv is a data-driven package: its `cv` show-rule takes a `metadata`
 * dict (normally parsed from info.toml) plus pre-rendered left/right pane
 * content. We rebuild that same `metadata` dict here and also pass the resume
 * sections as plain arrays; resume.typ turns those arrays into the pane
 * content with the package's exported entry functions (experience-entry,
 * education-entry, skill-entry, language-entry).
 *
 * Photos are disabled (use_photo:false) and icons are disabled
 * (include_icons:false) so no image/FontAwesome asset is required at render.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, skills, certificates } = resume;

  const fullName = (basics.name || "Your Name").trim();
  const firstSpace = fullName.indexOf(" ");
  const firstName = firstSpace === -1 ? fullName : fullName.slice(0, firstSpace);
  const lastName = firstSpace === -1 ? "" : fullName.slice(firstSpace + 1);

  // The header info table: each entry is either a plain string or a
  // {link, label} dict (rendered as a hyperlink). Keys are arbitrary but every
  // key must also have a matching entry in `icon` because the package looks up
  // an icon per key even when icons are disabled.
  const info: Record<string, string | { link: string; label: string }> = {};
  const icon: Record<string, string> = {};

  const location = fmtLocation(basics);
  if (location) {
    info.address = location;
    icon.address = "house";
  }
  if (basics.phone) {
    info.telephone = basics.phone;
    icon.telephone = "phone";
  }
  if (basics.email) {
    info.email = { link: `mailto:${basics.email}`, label: basics.email };
    icon.email = "envelope";
  }
  if (basics.url) {
    info.homepage = { link: basics.url, label: stripProtocol(basics.url) };
    icon.homepage = "globe";
  }
  const linkedinHandle = profileHandle(resume, "linkedin");
  if (linkedinHandle) {
    info.linkedin = { link: profileUrl(resume, "linkedin") || `https://${linkedinHandle}`, label: linkedinHandle };
    icon.linkedin = "linkedin";
  }
  const githubHandle = profileHandle(resume, "github");
  if (githubHandle) {
    info.github = { link: profileUrl(resume, "github") || `https://${githubHandle}`, label: githubHandle };
    icon.github = "github";
  }

  const metadata = {
    personal: {
      first_name: firstName,
      last_name: lastName,
      profile_image: "",
      language: "en",
      include_icons: false,
      info,
      icon,
      ia: {
        inject_ai_prompt: false,
        inject_keywords: false,
        keywords_list: [] as string[],
      },
    },
    section: {
      icon: {
        education: "graduation-cap",
        experience: "briefcase",
        languages: "language",
        other_experience: "wrench",
        personal: "brain",
        profile: "id-card",
        projects: "lightbulb",
        references: "users",
        skills: "cogs",
      },
    },
    layout: {
      fill_color: "#f4f1eb",
      paper_size: "a4",
      accent_color: "#d4d2cc",
      left_pane_width: "71%",
      text: {
        font: "HK Grotesk",
        size: "10pt",
        cover_letter_size: "11pt",
        color: {
          light: "#ededef",
          medium: "#78787e",
          dark: "#3c3c42",
        },
      },
    },
    language: {
      en: {
        subtitle: basics.label || "",
        ai_prompt: "",
        cv_document_name: "Resume",
        cover_letter_document_name: "Cover letter",
      },
    },
  };

  return {
    metadata,
    summary: basics.summary || "",
    experience: work.map((w) => ({
      title: w.position || "",
      company: w.name || "",
      location: w.location || "",
      date: fmtRange(w.startDate, w.endDate),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      degree: degreeLine(e.studyType, e.area, e.score) || e.institution || "",
      institution: e.institution || "",
      location: "",
      date: fmtRange(e.startDate, e.endDate),
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    skills: skillGroups(resume).map((g) => ({
      label: g.label,
      items: g.items,
    })),
    projects: projects.map((p) => ({
      title: p.name || "Project",
      company: p.url ? stripProtocol(p.url) : "",
      location: "",
      date: fmtRange(p.startDate, p.endDate),
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    certificates: certificates.map((c) => ({
      title: c.name || "",
      company: c.issuer || "",
      location: "",
      date: c.date || "",
      highlights: [] as string[],
    })),
    languages: languageLines(resume),
    languagePairs: resume.languages
      .map((l) => ({ language: l.language || "", proficiency: l.fluency || "" }))
      .filter((l) => l.language),
    hasSkills: skills.length > 0,
  };
}
