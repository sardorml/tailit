import { NextResponse } from "next/server";
import { extractText, getDocumentProxy } from "unpdf";
import mammoth from "mammoth";
import { chatJSON, llmErrorMessage, MODELS } from "@/lib/llm/provider";
import { resumePatchSchema } from "@/lib/resume/schema";
import { RESUME_SHAPE } from "@/lib/resume/prompt";

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const MAX_CHARS = 16000;

const SYSTEM = `You convert raw resume text into structured JSON.
${RESUME_SHAPE}

Rules:
- Output ONLY the JSON object — no prose, no markdown.
- Include only information clearly present in the text. Do NOT invent, infer, or embellish.
- Convert dates to the formats shown above when possible.
- Put individual skills into skills[].keywords.
- If the text does not look like a resume, return {}.`;

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "File is too large (max 5 MB)." }, { status: 413 });
    }

    const name = file.name.toLowerCase();
    const ab = await file.arrayBuffer();

    let text = "";
    if (name.endsWith(".pdf") || file.type === "application/pdf") {
      const pdf = await getDocumentProxy(new Uint8Array(ab));
      const result = await extractText(pdf, { mergePages: true });
      text = Array.isArray(result.text) ? result.text.join("\n") : result.text;
    } else if (name.endsWith(".docx") || file.type.includes("word") || file.type.includes("officedocument")) {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(ab) });
      text = result.value;
    } else if (name.endsWith(".txt") || file.type === "text/plain") {
      text = Buffer.from(ab).toString("utf8");
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Upload a PDF, DOCX, or TXT." },
        { status: 415 },
      );
    }

    text = text.replace(/\s+\n/g, "\n").trim();
    if (text.length < 30) {
      return NextResponse.json(
        { error: "Couldn't read any text from that file. It may be a scanned image." },
        { status: 422 },
      );
    }
    const clipped = text.slice(0, MAX_CHARS);

    const raw = await chatJSON<unknown>({
      system: SYSTEM,
      messages: [{ role: "user", content: clipped }],
      model: MODELS.reasoning,
      temperature: 0.1,
    });

    const parsed = resumePatchSchema.safeParse(raw);
    const resume = parsed.success ? parsed.data : {};

    return NextResponse.json({ resume, text: clipped, chars: text.length });
  } catch (err) {
    const { status, message } = llmErrorMessage(err);
    return NextResponse.json({ error: message }, { status });
  }
}
