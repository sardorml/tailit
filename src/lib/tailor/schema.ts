import { z } from "zod";
import { resumeSchema } from "../resume/schema";

/** Honest report of how the tailored resume matches the job. */
export const matchReportSchema = z.object({
  /** Overall match estimate, 0-100. */
  score: z.number().min(0).max(100).default(0),
  /** Job keywords now genuinely reflected in the resume. */
  coveredKeywords: z.array(z.string()).default([]),
  /** Job keywords we could NOT truthfully cover (real gaps — never faked). */
  missingKeywords: z.array(z.string()).default([]),
  /** Human-readable list of the edits that were made. */
  changes: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

export const tailorResultSchema = z.object({
  resume: resumeSchema,
  report: matchReportSchema,
});

export type MatchReport = z.infer<typeof matchReportSchema>;
export type TailorResult = z.infer<typeof tailorResultSchema>;
