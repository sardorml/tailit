import { describe, expect, it } from "vitest";
import { emptyResume } from "@/lib/resume/schema";
import { SAMPLE_RESUME } from "@/lib/resume/sample";
import { renderResumePdf } from "@/lib/typst/compile";

const sample = SAMPLE_RESUME;

function assertPdf(buf: Uint8Array) {
  expect(buf.length).toBeGreaterThan(1000);
  expect(Buffer.from(buf.subarray(0, 5)).toString("latin1")).toBe("%PDF-");
}

const TEMPLATE_IDS = ["vantage", "swe"] as const;

describe("typst templates", () => {
  for (const id of TEMPLATE_IDS) {
    it(`${id} renders a populated resume to a valid PDF`, () => {
      assertPdf(renderResumePdf(sample, id));
    });

    it(`${id} renders an empty resume without throwing`, () => {
      assertPdf(renderResumePdf(emptyResume(), id));
    });
  }
});
