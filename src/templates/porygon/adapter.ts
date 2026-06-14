import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  fmtLocation,
  fmtRange,
  profileHandle,
  profileUrl,
  skillFlat,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by porygon/resume.typ. porygon is a DATA-DRIVEN package:
 * `show-cv(data)` reads one big dictionary. Every visible string is formatted
 * here so the .typ stays a thin wrapper. We feed plain strings for translatable
 * fields (porygon's `__translate` returns a str as-is) which neutralizes its
 * multi-language machinery and keeps everything English. The default lang "en"
 * means no profile photo is required.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const nameParts = (basics.name || "Your Name").trim().split(/\s+/);
  const firstName = nameParts[0] || "Your";
  // Empty for single-word names — don't fabricate a "Name" surname.
  const lastName = nameParts.slice(1).join(" ");

  const linkedinUrl = profileUrl(resume, "linkedin");
  const linkedinName = profileHandle(resume, "linkedin");
  const githubUrl = profileUrl(resume, "github");
  const githubName = profileHandle(resume, "github");

  // Split skills: first group becomes "Programming languages", the rest "Tools".
  const flat = skillFlat(resume);
  const half = Math.ceil(flat.length / 2);
  const langSkills = flat.slice(0, half);
  const toolSkills = flat.slice(half);

  // Spoken languages -> langs section ({ name, level }).
  const spokenLangs = resume.languages
    .map((l) => ({ name: l.language || "", level: l.fluency || "" }))
    .filter((l) => l.name);

  // Combine projects + certificates into the bulleted "Projects" / "Personal" lists.
  const projectItems = projects.map((p) => {
    const head = [p.name, fmtRange(p.startDate, p.endDate)].filter(Boolean).join(" — ");
    const body = [p.description, ...(p.highlights ?? [])].filter(Boolean).join(" ");
    const url = p.url ? ` (${stripProtocol(p.url)})` : "";
    return { description: [head, body].filter(Boolean).join(": ") + url };
  });

  const certItems = certificates.map((c) => ({
    description: [c.name, c.issuer, c.date].filter(Boolean).join(" — "),
  }));

  return {
    margin: { top: "1cm", bottom: "0.6cm" },
    me: {
      firstname: firstName,
      lastname: lastName,
      title: basics.label || "",
      subtitle: basics.summary || "",
      bio: basics.summary || "",
      sidebar: "Contact",
      mail: basics.email || "",
      phone: basics.phone || "",
      location: fmtLocation(basics) || "",
      driving: "",
      // porygon calls `link()` on these unconditionally and crashes on an empty
      // URL. Fall back to a space so the link is valid; the wrapper's show rule
      // then renders whitespace-only links as plain text (no broken link).
      website: basics.url || " ",
      picture: "",
      linkedin: { link: linkedinUrl || " ", name: linkedinName || "" },
      github: { link: githubUrl || " ", name: githubName || "" },
      keywords: [basics.label || "Resume"].filter(Boolean),
    },
    school: {
      title: "Education",
      data: education.map((e) => ({
        date: fmtRange(e.startDate, e.endDate) || "",
        name: e.institution || "",
        location: "",
        description: degreeLine(e.studyType, e.area, e.score) || "",
      })),
    },
    work: {
      title: "Experience",
      data: work.map((w) => ({
        date: fmtRange(w.startDate, w.endDate) || "",
        name: [w.position, w.name].filter(Boolean).join(", ") || "",
        description: [w.summary, ...(w.highlights ?? [])].filter(Boolean).join(" "),
      })),
    },
    project: {
      title: "Projects",
      data: projectItems,
    },
    personal: {
      title: "Certifications",
      data: certItems,
    },
    languages: {
      title: "Programming languages",
      data: langSkills.map((name) => ({ name })),
    },
    tools: {
      title: "Tools",
      data: toolSkills.map((name) => ({ name })),
    },
    langs: {
      title: "Languages",
      data: spokenLangs,
    },
    hobbies: {
      title: "Interests",
      data: [] as { ico: string; name: string }[],
    },
  };
}
