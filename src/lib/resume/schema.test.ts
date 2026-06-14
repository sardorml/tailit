import { describe, expect, it } from "vitest";
import {
  applyResumePatch,
  completeness,
  emptyResume,
  isComplete,
  missingRequirements,
} from "./schema";

describe("resume schema", () => {
  it("emptyResume has defaulted empty sections", () => {
    const r = emptyResume();
    expect(r.basics).toEqual({});
    expect(r.work).toEqual([]);
    expect(r.skills).toEqual([]);
    expect(completeness(r)).toBe(0);
    expect(isComplete(r)).toBe(false);
  });

  it("applyResumePatch shallow-merges basics and replaces arrays", () => {
    let r = emptyResume();
    r = applyResumePatch(r, { basics: { name: "Ada Lovelace", email: "ada@x.com" } });
    expect(r.basics.name).toBe("Ada Lovelace");

    // A second patch keeps prior basics fields and overrides only what's given.
    r = applyResumePatch(r, { basics: { label: "Software Engineer" } });
    expect(r.basics.name).toBe("Ada Lovelace");
    expect(r.basics.label).toBe("Software Engineer");

    // Arrays are replaced wholesale.
    r = applyResumePatch(r, { skills: [{ name: "TypeScript" }] });
    expect(r.skills).toHaveLength(1);
    r = applyResumePatch(r, { skills: [{ name: "TypeScript" }, { name: "Go" }] });
    expect(r.skills.map((s) => s.name)).toEqual(["TypeScript", "Go"]);
  });

  it("applyResumePatch strips unknown keys", () => {
    const r = applyResumePatch(emptyResume(), {
      basics: { name: "X" },
      // @ts-expect-error unknown section should be ignored after validation
      bogus: { foo: 1 },
    });
    expect("bogus" in r).toBe(false);
  });

  it("tracks completeness as requirements are met", () => {
    let r = emptyResume();
    expect(missingRequirements(r).map((m) => m.key)).toContain("name");

    r = applyResumePatch(r, {
      basics: { name: "Ada", email: "a@x.com", label: "Engineer", summary: "Builds things." },
      work: [{ name: "Acme", position: "Engineer", highlights: ["Shipped"] }],
      education: [{ institution: "MIT", area: "CS" }],
      skills: [{ name: "TypeScript" }],
    });

    expect(isComplete(r)).toBe(true);
    expect(completeness(r)).toBe(1);
    expect(missingRequirements(r)).toHaveLength(0);
  });
});
