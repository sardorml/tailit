import { NextResponse } from "next/server";
import { resumeSchema } from "@/lib/resume/schema";
import { DEFAULT_TEMPLATE, isTemplateId } from "@/lib/templates";
import { renderResumePdf, renderResumeSvg } from "@/lib/typst/compile";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/render — body: { resume, templateId?, format? }. Compiles the resume
 * with Typst and returns it. `format: "svg"` returns a standalone vector SVG used
 * by the live preview (crisp + smooth-scrolling, no pdf.js font artifacts); the
 * default (PDF) backs the export/download button. Both come from the SAME Typst
 * layout, so the preview stays WYSIWYG with the downloaded file.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = resumeSchema.safeParse((body as { resume?: unknown })?.resume);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid resume payload." }, { status: 422 });
  }

  const requested = (body as { templateId?: unknown })?.templateId;
  const templateId = isTemplateId(requested) ? requested : DEFAULT_TEMPLATE;
  const format = (body as { format?: unknown })?.format === "svg" ? "svg" : "pdf";

  try {
    if (format === "svg") {
      const svg = renderResumeSvg(parsed.data, templateId);
      return new Response(svg, {
        headers: {
          "Content-Type": "image/svg+xml; charset=utf-8",
          "Cache-Control": "no-store",
        },
      });
    }

    const pdf = renderResumePdf(parsed.data, templateId);
    return new Response(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=resume.pdf",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to render resume.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
