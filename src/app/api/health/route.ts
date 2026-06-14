import { NextResponse } from "next/server";
import { getGroq, llmErrorMessage, MODELS } from "@/lib/llm/provider";

export const runtime = "nodejs";

/**
 * GET /api/health        -> reports whether GROQ_API_KEY is configured.
 * GET /api/health?ping=1 -> also makes a tiny real call to verify the key works.
 */
export async function GET(req: Request) {
  const hasKey = !!process.env.GROQ_API_KEY;
  const base = { hasKey, models: MODELS };
  const ping = new URL(req.url).searchParams.get("ping");

  if (!ping) return NextResponse.json({ ok: hasKey, ...base });

  try {
    const groq = getGroq();
    const res = await groq.chat.completions.create({
      model: MODELS.fast,
      max_tokens: 5,
      messages: [{ role: "user", content: 'Reply with exactly: ok' }],
    });
    return NextResponse.json({ ok: true, ...base, reply: res.choices[0]?.message?.content });
  } catch (err) {
    const { status, message } = llmErrorMessage(err);
    return NextResponse.json({ ok: false, ...base, error: message }, { status });
  }
}
