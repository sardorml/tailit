import { NextResponse } from "next/server";
import { chatJSON, llmErrorMessage, MODELS } from "@/lib/llm/provider";
import { jobSchema } from "@/lib/job/schema";
import { extractJobText, normalizeUrl } from "@/lib/job/extract";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_CHARS = 16000;

const SYSTEM = `You extract structured data from a job posting. Output ONLY a JSON object:
{
  "title": string,
  "company": string,
  "location": string,
  "summary": string,                 // 1-2 sentence description of the role
  "responsibilities": [string],      // key responsibilities
  "requiredSkills": [string],        // must-have skills/qualifications
  "niceToHaveSkills": [string],      // preferred / bonus
  "keywords": [string]               // 8-20 most important ATS keywords (skills, tools, methods, qualifications) a strong resume should contain
}
Rules:
- Only include information present in the posting. Use [] or omit when unknown.
- Ignore site navigation, cookie banners, and unrelated boilerplate.
- keywords should be concise terms (e.g. "React", "CI/CD", "stakeholder management"), not sentences.`;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    let text = typeof body?.text === "string" ? body.text.trim() : "";
    let sourceUrl = "";

    if (!text && typeof body?.url === "string" && body.url.trim()) {
      let norm: string;
      try {
        norm = normalizeUrl(body.url);
      } catch {
        return NextResponse.json({ error: "That doesn't look like a valid URL." }, { status: 400 });
      }
      const result = await extractJobText(norm);
      text = result.text;
      sourceUrl = norm;
    }

    if (!text || text.length < 50) {
      return NextResponse.json(
        { error: "Provide a job link or paste the job description." },
        { status: 400 },
      );
    }

    const clipped = text.slice(0, MAX_CHARS);
    const raw = await chatJSON<unknown>({
      system: SYSTEM,
      messages: [{ role: "user", content: clipped }],
      model: MODELS.reasoning,
      temperature: 0.1,
    });

    const parsed = jobSchema.safeParse(raw);
    const base = parsed.success ? parsed.data : jobSchema.parse({});
    const job = { ...base, rawText: clipped, sourceUrl: sourceUrl || undefined };

    return NextResponse.json({ job });
  } catch (err) {
    const { status, message } = llmErrorMessage(err);
    return NextResponse.json({ error: message }, { status });
  }
}
