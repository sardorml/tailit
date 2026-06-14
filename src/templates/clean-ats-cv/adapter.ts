import type { Resume } from "@/lib/resume/schema";
import {
  degreeLine,
  findProfile,
  fmtLocation,
  fmtRange,
  languageLines,
  skillGroups,
  stripProtocol,
} from "../shared";

/**
 * JSON shape consumed by clean-ats-cv/resume.typ (markup-driven template).
 * The package's `conf` show rule renders a contact header from a `details`
 * dict; section bodies are plain `=`/`==` headings with `date`/`date-location`
 * helpers, so we precompute every display string here.
 */
export function adapt(resume: Resume) {
  const { basics, work, education, projects, certificates } = resume;

  const linkedin = findProfile(resume, "linkedin");
  const github = findProfile(resume, "github");
  const twitter = findProfile(resume, "twitter") ?? findProfile(resume, "x");

  // The package prefixes links with "https://", so URLs must be bare hosts.
  const linkedinUrl = linkedin?.url ? stripProtocol(linkedin.url) : "";
  const githubUrl = github?.url ? stripProtocol(github.url) : "";
  const twitterUrl = twitter?.url ? stripProtocol(twitter.url) : "";

  const profileLabel = (handle?: string, url?: string, fallback = "") => {
    if (handle) return handle;
    if (url) {
      const path = url.replace(/^[^/]*\/?/, "");
      return path ? `/${path}` : url;
    }
    return fallback;
  };

  return {
    details: {
      name: basics.name || "Your Name",
      address: fmtLocation(basics),
      email: basics.email || "",
      phonenumber: basics.phone || "",
      linkedin: linkedinUrl,
      "linkedin-label": linkedin
        ? profileLabel(linkedin.username, linkedinUrl, "/in/profile")
        : "",
      github: githubUrl,
      "github-label": github
        ? profileLabel(github.username, githubUrl, "/username")
        : "",
      twitter: twitterUrl,
      "twitter-label": twitter
        ? profileLabel(twitter.username, twitterUrl, "/username")
        : "",
    },
    label: basics.label || "",
    site: basics.url ? stripProtocol(basics.url) : "",
    summary: basics.summary || "",
    work: work.map((w) => ({
      title: w.position || "",
      company: w.name || "",
      location: w.location || "",
      dates: fmtRange(w.startDate, w.endDate),
      highlights: [w.summary, ...(w.highlights ?? [])].filter(Boolean),
    })),
    education: education.map((e) => ({
      institution: e.institution || "",
      degree: degreeLine(e.studyType, e.area, e.score),
      dates: fmtRange(e.startDate, e.endDate),
      highlights: (e.courses ?? []).filter(Boolean),
    })),
    projects: projects.map((p) => ({
      name: p.name || "Project",
      url: p.url ? stripProtocol(p.url) : "",
      dates: fmtRange(p.startDate, p.endDate),
      highlights: [p.description, ...(p.highlights ?? [])].filter(Boolean),
    })),
    skills: skillGroups(resume),
    certificates: certificates.map((c) => ({
      name: c.name || "",
      issuer: c.issuer || "",
      date: c.date || "",
    })),
    languages: languageLines(resume),
  };
}
