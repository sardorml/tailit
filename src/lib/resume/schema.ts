import { z } from "zod";

/**
 * Canonical resume data model, based on the JSON Resume schema
 * (https://jsonresume.org/schema). Every field is optional so partial
 * resumes (mid-onboarding) always validate; "completeness" is checked
 * separately via REQUIREMENTS.
 */

export const locationSchema = z.object({
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  region: z.string().optional(),
  countryCode: z.string().optional(),
});

export const profileSchema = z.object({
  network: z.string().optional(),
  username: z.string().optional(),
  url: z.string().optional(),
});

export const basicsSchema = z.object({
  name: z.string().optional(),
  /** Headline / target role, e.g. "Senior Frontend Engineer". */
  label: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  url: z.string().optional(),
  location: locationSchema.optional(),
  summary: z.string().optional(),
  profiles: z.array(profileSchema).optional(),
});

export const workSchema = z.object({
  /** Company name. */
  name: z.string().optional(),
  position: z.string().optional(),
  url: z.string().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).optional(),
});

export const educationSchema = z.object({
  institution: z.string().optional(),
  url: z.string().optional(),
  area: z.string().optional(),
  studyType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  score: z.string().optional(),
  courses: z.array(z.string()).optional(),
});

export const skillSchema = z.object({
  name: z.string().optional(),
  level: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

export const projectSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  keywords: z.array(z.string()).optional(),
  url: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export const certificateSchema = z.object({
  name: z.string().optional(),
  date: z.string().optional(),
  issuer: z.string().optional(),
  url: z.string().optional(),
});

export const languageSchema = z.object({
  language: z.string().optional(),
  fluency: z.string().optional(),
});

export const resumeSchema = z.object({
  basics: basicsSchema.default({}),
  work: z.array(workSchema).default([]),
  education: z.array(educationSchema).default([]),
  skills: z.array(skillSchema).default([]),
  projects: z.array(projectSchema).default([]),
  certificates: z.array(certificateSchema).default([]),
  languages: z.array(languageSchema).default([]),
});

/** A partial resume "patch" the AI returns each onboarding turn. */
export const resumePatchSchema = z.object({
  basics: basicsSchema.optional(),
  work: z.array(workSchema).optional(),
  education: z.array(educationSchema).optional(),
  skills: z.array(skillSchema).optional(),
  projects: z.array(projectSchema).optional(),
  certificates: z.array(certificateSchema).optional(),
  languages: z.array(languageSchema).optional(),
});

export type Resume = z.infer<typeof resumeSchema>;
export type ResumePatch = z.infer<typeof resumePatchSchema>;
export type Basics = z.infer<typeof basicsSchema>;
export type Work = z.infer<typeof workSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Certificate = z.infer<typeof certificateSchema>;
export type Language = z.infer<typeof languageSchema>;

/** A fully-defaulted empty resume. */
export function emptyResume(): Resume {
  return resumeSchema.parse({});
}

const ARRAY_SECTIONS = [
  "work",
  "education",
  "skills",
  "projects",
  "certificates",
  "languages",
] as const;

/**
 * Merge an AI-produced patch into the current resume.
 * `basics` is shallow-merged (location nested-merged); array sections are
 * REPLACED when present (the AI is instructed to return the full array it
 * wants to set, since it always receives the current resume as context).
 * The result is re-validated so unknown keys are stripped and defaults filled.
 */
export function applyResumePatch(current: Resume, patch: ResumePatch): Resume {
  const merged: Record<string, unknown> = { ...current };

  if (patch.basics) {
    merged.basics = {
      ...current.basics,
      ...patch.basics,
      location: patch.basics.location
        ? { ...current.basics.location, ...patch.basics.location }
        : current.basics.location,
      profiles: patch.basics.profiles ?? current.basics.profiles,
    };
  }

  for (const key of ARRAY_SECTIONS) {
    if (patch[key] !== undefined) merged[key] = patch[key];
  }

  return resumeSchema.parse(merged);
}

export interface FieldRequirement {
  key: string;
  label: string;
  /** True once this requirement is satisfied by the resume. */
  done: (r: Resume) => boolean;
  /** Plain-language description the AI uses to know what to collect. */
  hint: string;
}

/** The fields a resume needs before it is considered "ready to tailor". */
export const REQUIREMENTS: FieldRequirement[] = [
  { key: "name", label: "Full name", hint: "the candidate's full name", done: (r) => !!r.basics.name },
  { key: "email", label: "Email", hint: "a contact email address", done: (r) => !!r.basics.email },
  {
    key: "label",
    label: "Target role",
    hint: "the role/title they are targeting (used as the resume headline)",
    done: (r) => !!r.basics.label,
  },
  {
    key: "summary",
    label: "Professional summary",
    hint: "a 2-3 sentence professional summary",
    done: (r) => !!r.basics.summary,
  },
  {
    key: "work",
    label: "Work experience",
    hint: "at least one job with company, title, dates, and 2-4 accomplishment bullet points",
    done: (r) => r.work.some((w) => !!w.name && !!w.position),
  },
  {
    key: "education",
    label: "Education",
    hint: "education history (institution, degree/area, dates)",
    done: (r) => r.education.length > 0,
  },
  {
    key: "skills",
    label: "Skills",
    hint: "a list of professional/technical skills",
    done: (r) => r.skills.length > 0,
  },
];

/** Requirements not yet satisfied — what the AI should still ask about. */
export function missingRequirements(r: Resume): FieldRequirement[] {
  return REQUIREMENTS.filter((req) => !req.done(r));
}

/** Fraction (0..1) of requirements satisfied. */
export function completeness(r: Resume): number {
  const done = REQUIREMENTS.filter((req) => req.done(r)).length;
  return done / REQUIREMENTS.length;
}

/** True once every required field is present. */
export function isComplete(r: Resume): boolean {
  return REQUIREMENTS.every((req) => req.done(r));
}
