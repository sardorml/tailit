# tailit — AI resume builder & tailoring

Paste a link to a job, and AI rewrites your resume to match it — surfacing your real experience
and the keywords the role asks for. An AI interview builds your profile (or import an existing
resume), pick from 65 templates, and export a clean, ATS-friendly PDF.

- **Free & open-source LLM** — runs on [Groq](https://groq.com)'s free tier (Llama 3.3 70B for reasoning, Llama 3.1 8B for fast tasks; any Groq-hosted open model works). No credit card.
- **Private** — your resume lives in your browser (`localStorage`). There's no database and no account; text is only sent to the LLM to be rewritten.
- **ATS-friendly PDFs** — real selectable text via [Typst](https://typst.app), with 65 templates and a live preview.

## Quick start

**Prerequisites:** Node ≥ 22.11 (the repo pins 22.13 in `.node-version`) and pnpm 10.

```bash
pnpm install

# Get a FREE Groq API key (no credit card): https://console.groq.com/keys
cp .env.example .env.local
# then paste your key into GROQ_API_KEY=

pnpm dev          # http://localhost:3000
```

Verify your key works: open `http://localhost:3000/api/health?ping=1` — it should return `{"ok":true,...}`.

## Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Dev server |
| `pnpm build` / `pnpm start` | Production build / serve |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` / `pnpm test:watch` | Vitest (schema + PDF render tests) |
| `pnpm thumbs` | Regenerate template thumbnails into `public/thumbs/` |

## How it works

```
Onboarding ─┬─ upload PDF/DOCX ──► POST /api/parse ────► LLM ─► JSON Resume (partial)
            └─ AI interview ─────► POST /api/interview ─► reply + patch ─► fills the gaps
                                                                     │  (Zustand + localStorage, in-browser)
Job link / paste ──────────────► POST /api/job ─► Jina Reader → Readability → paste ─► LLM ─► job requirements
                                                                     │
Resume + job ──────────────────► POST /api/tailor ─► LLM ─► tailored resume + honest match report
                                                                     │
Template gallery ─► live Typst SVG preview ─► download (POST /api/render ─► Typst PDF)
```

- **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Ant Design v6 · Zustand (`persist`).
- **Data model:** [JSON Resume](https://jsonresume.org/schema) (`src/lib/resume/schema.ts`), validated with Zod.
- **LLM:** thin Groq wrapper in `src/lib/llm/provider.ts` (swap the model via `GROQ_MODEL` / `GROQ_MODEL_FAST`). Every LLM response is re-validated with Zod — raw output is never trusted.
- **Job ingest:** `src/lib/job/extract.ts` tries [Jina Reader](https://jina.ai/reader/) first, then Mozilla
  Readability, then falls back to pasted text (LinkedIn/Indeed often block bots).
- **Templates:** `src/templates/<id>/` are [Typst](https://typst.app) templates (65, mostly Typst Universe
  `@preview` CV packages). Each has an `adapter.ts` (maps the resume → the template's input JSON), a
  `resume.typ` (entry point), and a `meta.json`; these are generated into `src/templates/registry.ts`. PDFs are
  compiled server-side via `@myriaddreamin/typst-ts-node-compiler` in `POST /api/render`. The live preview uses
  the same engine rendered to SVG so it's pixel-identical to the export.
- **Truthfulness:** the tailoring prompt only rephrases/reorders your real content and reports gaps
  honestly — it never invents employers, dates, or skills.

### Adding a template

Create `src/templates/<id>/{adapter.ts,resume.typ,meta.json}`, then run `node scripts/build-registry.mjs` to
regenerate the registry. Verify one with `npx tsx scripts/verify-template.mjs <id>` (or all with
`scripts/verify-all.mjs`), and regenerate thumbnails with `pnpm thumbs`. See `CLAUDE.md` for the full details.

## Deploy (free)

The repo ships a [Render](https://render.com) Blueprint (`render.yaml`):

1. Push to GitHub.
2. In the Render dashboard: **New + → Blueprint**, connect the repo.
3. Set the **`GROQ_API_KEY`** environment variable (and optionally `NEXT_PUBLIC_SITE_URL` for canonical
   SEO/Open-Graph URLs).
4. Deploy.

> Render's free tier (512 MB RAM, spins down after ~15 min idle) is enough for personal use. The Typst PDF
> compiler is a native addon warmed at boot, so it's best suited to a long-running Node server rather than a
> serverless/edge host.

## Notes & limits

- Groq's free tier is rate-limited (per-minute/day). The UI surfaces a friendly message on 429s;
  wait a moment and retry. You can point `GROQ_MODEL` at any Groq-hosted open model.
- Some job sites block automated reading — use the **paste** fallback in the Tailor tab.

## License

[MIT](./LICENSE) © Sardor Mamadaliev.

Bundled third-party assets keep their own licenses: the `swe` and `vantage` templates are MIT
(see their `LICENSE` files), the Font Awesome Free icon fonts in `src/templates/_fonts/` are SIL OFL 1.1
(`OFL.txt`), PT Sans in `src/templates/vantage/fonts/` is SIL OFL 1.1, and the remaining templates wrap
their respective Typst Universe `@preview` packages under each package's own license.
