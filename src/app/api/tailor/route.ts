import { NextResponse } from "next/server";
import { chatJSON, llmErrorMessage, MODELS } from "@/lib/llm/provider";
import { resumeSchema } from "@/lib/resume/schema";
import { jobSchema } from "@/lib/job/schema";
import { matchReportSchema } from "@/lib/tailor/schema";
import { RESUME_SHAPE } from "@/lib/resume/prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

const SYSTEM = `You tailor a candidate's resume to a specific job. You receive the candidate's current resume (JSON) and the target job (JSON), and you return a rewritten resume plus an honest match report.

HARD RULES — TRUTHFULNESS ABOVE ALL:
- NEVER invent or exaggerate. Do not add employers, job titles, dates, degrees, certifications, metrics, or skills the candidate did not provide.
- You may ONLY rephrase, reorder, and emphasize information already in the resume.
- Keep every job's company, title, and dates exactly as given.

WHAT TO DO:
- Rewrite basics.summary (2-3 sentences) to target THIS role, using the candidate's real background.
- Set basics.label to the job title only if it genuinely fits the candidate's experience.
- Rewrite work[].highlights to lead with the most relevant accomplishments and naturally use the job's terminology WHERE IT IS TRUE of the candidate. Keep them concise, verb-first, and only quantify with numbers the candidate already provided.
- Reorder skills so the most relevant appear first. Add a job keyword to skills ONLY if the candidate clearly already has it elsewhere in their resume; otherwise leave it out.
- Keep education, certificates, languages, and projects factual; you may reorder for relevance.

Then write a match report:
- score: 0-100 estimate of fit.
- coveredKeywords: job keywords genuinely reflected in the tailored resume.
- missingKeywords: important job keywords the candidate does NOT have — list them honestly. NEVER fake these in the resume.
- changes: short bullets describing the edits you made.

Output ONLY a JSON object:
{ "resume": <full resume JSON>, "report": { "score": number, "coveredKeywords": [string], "missingKeywords": [string], "changes": [string], "notes": string } }

The resume JSON uses this shape:
${RESUME_SHAPE}`;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const resume = resumeSchema.parse(body?.resume ?? {});
    const job = jobSchema.parse(body?.job ?? {});

    // Drop rawText from the job to save tokens; structured fields are enough.
    // (JSON.stringify omits the undefined key.)
    const jobLite = { ...job, rawText: undefined };

    const out = await chatJSON<{ resume?: unknown; report?: unknown }>({
      system: SYSTEM,
      messages: [
        {
          role: "user",
          content: `CANDIDATE RESUME:\n${JSON.stringify(resume)}\n\nTARGET JOB:\n${JSON.stringify(jobLite)}`,
        },
      ],
      model: MODELS.reasoning,
      temperature: 0.4,
      maxTokens: 5000,
    });

    const resParsed = resumeSchema.safeParse(out?.resume);
    const tailoredResume = resParsed.success ? resParsed.data : resume;
    const repParsed = matchReportSchema.safeParse(out?.report ?? {});
    const report = repParsed.success ? repParsed.data : matchReportSchema.parse({});

    return NextResponse.json({ resume: tailoredResume, report });
  } catch (err) {
    const { status, message } = llmErrorMessage(err);
    return NextResponse.json({ error: message }, { status });
  }
}
