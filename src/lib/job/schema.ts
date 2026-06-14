import { z } from "zod";

/** Structured job posting the AI extracts from a URL or pasted text. */
export const jobSchema = z.object({
  title: z.string().optional(),
  company: z.string().optional(),
  location: z.string().optional(),
  /** 1-2 sentence summary of the role. */
  summary: z.string().optional(),
  responsibilities: z.array(z.string()).default([]),
  requiredSkills: z.array(z.string()).default([]),
  niceToHaveSkills: z.array(z.string()).default([]),
  /** ATS keywords worth mirroring in the resume. */
  keywords: z.array(z.string()).default([]),
  /** The source job-description text the extraction was based on. */
  rawText: z.string().optional(),
  sourceUrl: z.string().optional(),
});

export type JobData = z.infer<typeof jobSchema>;
