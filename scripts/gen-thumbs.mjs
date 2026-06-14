// Pre-generate static preview thumbnails for every template into
// public/thumbs/<id>.webp. Each is the SAME PDF the live preview/export
// produces (Typst → PDF), rasterized with unpdf + @napi-rs/canvas as the FULL
// first page (A4/Letter portrait) so the homepage carousel can show true
// page-shaped previews; the modal picker top-crops the same image via CSS.
// Served as plain <img> so previews appear instantly with no runtime
// compilation or flash. Rerun whenever templates, fonts, or the sample resume
// change:
//   npx tsx scripts/gen-thumbs.mjs
import { NodeCompiler } from "@myriaddreamin/typst-ts-node-compiler";
import { renderPageAsImage } from "unpdf";
import sharp from "sharp";
import path from "node:path";
import fs from "node:fs";

const ROOT = process.cwd();
const TEMPLATE_ROOT = path.join(ROOT, "src", "templates");
const OUT = path.join(ROOT, "public", "thumbs");
const WIDTH = 600; // raster width (~2.5× display for crisp text)

fs.mkdirSync(OUT, { recursive: true });

const ids = fs
  .readdirSync(TEMPLATE_ROOT)
  .filter((d) => fs.existsSync(path.join(TEMPLATE_ROOT, d, "meta.json")))
  .sort();

const { SAMPLE_RESUME } = await import(path.join(ROOT, "src/lib/resume/sample.ts"));

const $typst = NodeCompiler.create({
  workspace: TEMPLATE_ROOT,
  fontArgs: [{ fontPaths: [path.join(TEMPLATE_ROOT, "vantage", "fonts"), path.join(TEMPLATE_ROOT, "_fonts")] }],
});
const canvasImport = () => import("@napi-rs/canvas");

let ok = 0;
const fails = [];
for (const id of ids) {
  try {
    const { adapt } = await import(path.join(TEMPLATE_ROOT, id, "adapter.ts"));
    const inputs = { resume: JSON.stringify(adapt(SAMPLE_RESUME)) };
    const pdf = $typst.pdf({ mainFilePath: path.join(TEMPLATE_ROOT, id, "resume.typ"), inputs });
    if (!pdf || pdf.length < 100) throw new Error("empty pdf");

    const png = await renderPageAsImage(new Uint8Array(pdf), 1, { canvasImport, width: WIDTH });
    const webp = await sharp(Buffer.from(png))
      .flatten({ background: "#ffffff" })
      .webp({ quality: 82 })
      .toBuffer();
    fs.writeFileSync(path.join(OUT, `${id}.webp`), webp);
    ok++;
    process.stdout.write(".");
  } catch (e) {
    fails.push(`${id}: ${String(e.message || e).slice(0, 140)}`);
    process.stdout.write("x");
  }
}
process.stdout.write("\n");
const files = fs.readdirSync(OUT).filter((f) => f.endsWith(".webp"));
const bytes = files.reduce((n, f) => n + fs.statSync(path.join(OUT, f)).size, 0);
console.log(`Wrote ${ok}/${ids.length} thumbnails (${(bytes / 1024).toFixed(0)} KB total, avg ${(bytes / files.length / 1024).toFixed(1)} KB)`);
if (fails.length) console.log("FAILED:\n" + fails.join("\n"));
