import { NextResponse } from "next/server";
import { chatJSON, type ChatMessage, llmErrorMessage, MODELS } from "@/lib/llm/provider";
import {
  applyResumePatch,
  isComplete,
  missingRequirements,
  resumeSchema,
  resumePatchSchema,
} from "@/lib/resume/schema";
import { ARRAY_RULE, RESUME_SHAPE } from "@/lib/resume/prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

interface InterviewOut {
  reply?: string;
  patch?: unknown;
  done?: boolean;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const resume = resumeSchema.parse(body?.resume ?? {});
    const incoming: ChatMessage[] = Array.isArray(body?.messages)
      ? body.messages
          .filter((m: unknown): m is ChatMessage => {
            const t = m as ChatMessage;
            return !!t && typeof t.content === "string" && (t.role === "user" || t.role === "assistant");
          })
          .slice(-20)
      : [];

    const missing = missingRequirements(resume);
    const missingLabels = missing.length
      ? missing.map((m) => `${m.label} (${m.hint})`).join("; ")
      : "nothing — all essentials are present";

    const system = `You are a warm, concise resume coach onboarding a candidate so we can later tailor their resume to jobs. Speak directly to them, one short question at a time.

${RESUME_SHAPE}

Current resume JSON (already collected):
${JSON.stringify(resume)}

Still missing: ${missingLabels}.

Respond with ONLY a JSON object of this exact shape:
{
  "reply": string,   // your next message to the candidate — friendly, conversational, ONE question at a time
  "patch": object,   // resume sections extracted from the candidate's MOST RECENT message; {} if they gave nothing new
  "done": boolean    // true once every essential is collected
}

${ARRAY_RULE}

Guidelines:
- Ask for the most important missing item next. Never re-ask for info already in the resume.
- Mine the candidate's answers for structured data: turn described accomplishments into concise work[].highlights bullets (start with a verb, quantify when possible), map tools to skills[].keywords, etc.
- Never invent facts, employers, dates, or numbers. Only structure what they actually said.
- Keep "reply" to 1-3 sentences. Be encouraging.
- When nothing essential is missing, set "done": true and give a brief, friendly wrap-up telling them they can now switch to the Tailor tab.`;

    const convo: ChatMessage[] = incoming.length
      ? incoming
      : [{ role: "user", content: "Hi, let's get started on my resume." }];

    const out = await chatJSON<InterviewOut>({
      system,
      messages: convo,
      model: MODELS.reasoning,
      temperature: 0.5,
    });

    const parsed = resumePatchSchema.safeParse(out?.patch ?? {});
    const patch = parsed.success ? parsed.data : {};
    const nextResume = applyResumePatch(resume, patch);
    const done = !!out?.done || isComplete(nextResume);

    return NextResponse.json({
      reply: out?.reply?.trim() || "Could you tell me a bit more?",
      patch,
      done,
    });
  } catch (err) {
    const { status, message } = llmErrorMessage(err);
    return NextResponse.json({ error: message }, { status });
  }
}
