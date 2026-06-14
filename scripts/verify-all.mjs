// Render every registered template with the sample resume using one shared
// compiler (fast, reuses the package cache). Reports OK/FAIL + page counts.
//   npx tsx scripts/verify-all.mjs
import { NodeCompiler } from "@myriaddreamin/typst-ts-node-compiler";
import path from "node:path";
import fs from "node:fs";

const ROOT = process.cwd();
const TEMPLATE_ROOT = path.join(ROOT, "src", "templates");

const ids = fs
  .readdirSync(TEMPLATE_ROOT)
  .filter((d) => fs.existsSync(path.join(TEMPLATE_ROOT, d, "meta.json")))
  .sort();

const { SAMPLE_RESUME } = await import(path.join(ROOT, "src/lib/resume/sample.ts"));

const $typst = NodeCompiler.create({
  workspace: TEMPLATE_ROOT,
  fontArgs: [{ fontPaths: [path.join(TEMPLATE_ROOT, "vantage", "fonts"), path.join(TEMPLATE_ROOT, "_fonts")] }],
});

let ok = 0;
const fails = [];
for (const id of ids) {
  try {
    const { adapt } = await import(path.join(TEMPLATE_ROOT, id, "adapter.ts"));
    const inputs = { resume: JSON.stringify(adapt(SAMPLE_RESUME)) };
    const main = path.join(TEMPLATE_ROOT, id, "resume.typ");
    const res = $typst.compile({ mainFilePath: main, inputs });
    if (res.hasError()) {
      const ds = $typst.fetchDiagnostics(res.takeDiagnostics());
      throw new Error(ds.map((d) => d.message).join("; ") || "compile error");
    }
    const pdf = $typst.pdf({ mainFilePath: main, inputs });
    if (!pdf || pdf.length < 1000) throw new Error(`tiny PDF (${pdf ? pdf.length : 0})`);
    const pages = (Buffer.from(pdf).toString("latin1").match(/\/Type\s*\/Page[^s]/g) || []).length || "?";
    console.log(`OK   ${id}  (${pages}p, ${(pdf.length / 1024).toFixed(0)}kb)`);
    ok++;
  } catch (e) {
    console.log(`FAIL ${id}: ${String(e.message || e).slice(0, 160)}`);
    fails.push(id);
  }
}
console.log(`\n${ok}/${ids.length} OK` + (fails.length ? ` | FAILED: ${fails.join(", ")}` : ""));
process.exit(fails.length ? 1 : 0);
