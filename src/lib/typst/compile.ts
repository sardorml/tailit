import path from "node:path";
import { NodeCompiler } from "@myriaddreamin/typst-ts-node-compiler";
import type { Resume } from "@/lib/resume/schema";
import { DEFAULT_TEMPLATE_ID, getTemplateDef } from "@/templates/registry";

/**
 * Server-only Typst → PDF compilation. The native NodeCompiler is created once
 * (workspace rooted at src/templates so every template's relative imports,
 * icons, and fonts resolve) and reused; it caches parsed source and fonts
 * across requests, so we evict periodically to bound memory.
 *
 * Templates that wrap a Typst Universe package import it as `@preview/<pkg>`;
 * the compiler downloads those into the Typst package cache on first use
 * (needs network once, then cached). Bundled assets (vendored .typ, icons,
 * fonts) are read from disk — fine for `next dev`/`next start`; a bundled
 * serverless deploy would need those files traced into the output.
 */

const TEMPLATE_ROOT = path.join(process.cwd(), "src", "templates");
const FONT_DIRS = [
  path.join(TEMPLATE_ROOT, "vantage", "fonts"),
  path.join(TEMPLATE_ROOT, "_fonts"),
];

// Hold the compiler on globalThis, not a module-level `let`. Next/Turbopack can
// bundle this module into more than one server chunk (e.g. the API route AND the
// instrumentation warm-up); a per-module singleton would then init the expensive
// native compiler once per chunk. A process-global singleton is shared by all of
// them, so warming it at boot (instrumentation.register) makes the first request fast.
const globalForTypst = globalThis as typeof globalThis & {
  __typstCompiler?: NodeCompiler;
  __typstCompileCount?: number;
};

function getCompiler(): NodeCompiler {
  if (!globalForTypst.__typstCompiler) {
    globalForTypst.__typstCompiler = NodeCompiler.create({
      workspace: TEMPLATE_ROOT,
      fontArgs: [{ fontPaths: FONT_DIRS }],
    });
  }
  return globalForTypst.__typstCompiler;
}

/** Compile a resume to PDF bytes using the selected template. */
export function renderResumePdf(
  resume: Resume,
  templateId: string = DEFAULT_TEMPLATE_ID,
): Uint8Array {
  const def = getTemplateDef(templateId);
  const $typst = getCompiler();

  const pdf = $typst.pdf({
    mainFilePath: path.join(TEMPLATE_ROOT, def.id, "resume.typ"),
    inputs: { resume: JSON.stringify(def.adapt(resume)) },
  });

  if (!pdf) throw new Error("Typst produced no PDF output.");

  evictPeriodically($typst);
  return pdf;
}

/**
 * Compile a resume to a standalone SVG (all pages stacked in one document) using
 * the selected template. This is Typst's OWN renderer — glyphs are emitted as
 * vector outlines, so it's pixel-faithful to the PDF and free of the embedded-font
 * / ligature artifacts a browser PDF re-implementation (pdf.js) introduces. The
 * live preview uses this: vector = crisp, and a static SVG in the DOM scrolls
 * smoothly (no per-frame re-rasterization like the native PDF plugin).
 */
export function renderResumeSvg(
  resume: Resume,
  templateId: string = DEFAULT_TEMPLATE_ID,
): string {
  const def = getTemplateDef(templateId);
  const $typst = getCompiler();

  const svg = $typst.plainSvg({
    mainFilePath: path.join(TEMPLATE_ROOT, def.id, "resume.typ"),
    inputs: { resume: JSON.stringify(def.adapt(resume)) },
  });

  if (!svg) throw new Error("Typst produced no SVG output.");

  evictPeriodically($typst);
  return svg;
}

/** Free cached source/incremental state every so often to keep memory flat. */
function evictPeriodically($typst: NodeCompiler) {
  globalForTypst.__typstCompileCount = (globalForTypst.__typstCompileCount ?? 0) + 1;
  if (globalForTypst.__typstCompileCount % 50 === 0) $typst.evictCache(10);
}
