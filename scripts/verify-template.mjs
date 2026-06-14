// Compile one template's resume.typ with the sample resume and report status.
//
//   npx tsx scripts/verify-template.mjs <id> [--data <jsonPath>] [--out <pdfPath>]
//
// Imports the template's pure adapter (src/templates/<id>/adapter.ts) and the
// shared sample resume, feeds adapt(SAMPLE_RESUME) as sys.inputs.resume, and
// compiles src/templates/<id>/resume.typ. Exits non-zero with diagnostics on
// failure. Used by the template fan-out to verify each template renders.
import { NodeCompiler } from "@myriaddreamin/typst-ts-node-compiler";
import path from "node:path";
import fs from "node:fs";

const id = process.argv[2];
if (!id) {
  console.error("usage: tsx scripts/verify-template.mjs <id> [--out file.pdf]");
  process.exit(2);
}
const outFlag = process.argv.indexOf("--out");
const outPath = outFlag > -1 ? process.argv[outFlag + 1] : null;

const ROOT = process.cwd();
const TEMPLATE_ROOT = path.join(ROOT, "src", "templates");
const mainFile = path.join(TEMPLATE_ROOT, id, "resume.typ");
if (!fs.existsSync(mainFile)) {
  console.error(`MISSING: ${mainFile}`);
  process.exit(2);
}

const { SAMPLE_RESUME } = await import(path.join(ROOT, "src/lib/resume/sample.ts"));
const { adapt } = await import(path.join(TEMPLATE_ROOT, id, "adapter.ts"));

const $typst = NodeCompiler.create({
  workspace: TEMPLATE_ROOT,
  fontArgs: [{ fontPaths: [path.join(TEMPLATE_ROOT, "vantage", "fonts"), path.join(TEMPLATE_ROOT, "_fonts")] }],
});

const inputs = { resume: JSON.stringify(adapt(SAMPLE_RESUME)) };
const res = $typst.compile({ mainFilePath: mainFile, inputs });

if (res.hasError()) {
  console.error(`FAIL ${id}: compile error`);
  try {
    for (const d of $typst.fetchDiagnostics(res.takeDiagnostics())) {
      console.error(`  - ${d.message} @ ${JSON.stringify(d.range?.start)}`);
    }
  } catch {}
  process.exit(1);
}

const pdf = $typst.pdf({ mainFilePath: mainFile, inputs });
if (!pdf || pdf.length < 1000) {
  console.error(`FAIL ${id}: empty/too-small PDF (${pdf ? pdf.length : 0} bytes)`);
  process.exit(1);
}
const pages = (Buffer.from(pdf).toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length || "?";
if (outPath) fs.writeFileSync(outPath, Buffer.from(pdf));
console.log(`OK ${id}: ${pdf.length} bytes, ~${pages} page(s)${outPath ? ` -> ${outPath}` : ""}`);
