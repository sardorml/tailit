@AGENTS.md

# Tailor — project notes

AI resume-tailoring web app. Paste a job link → AI rewrites the user's resume to match it. An AI
interview (or PDF/DOCX upload) builds the profile; export ATS-friendly PDFs.

## Stack
- Next.js 16 (App Router) · React 19 · TypeScript · Ant Design v6 (stock theme; no Tailwind)
- Groq free API (open-source Llama/Qwen) via `src/lib/llm/provider.ts` — key is server-side only
- Zustand + `persist` (localStorage) — no backend DB, no auth (data stays in the browser)
- Typst for PDF templates/export — compiled server-side via `@myriaddreamin/typst-ts-node-compiler`
  (`src/lib/typst/`, `POST /api/render`). The compiler is a process-global singleton, warmed at boot in
  `src/instrumentation.ts` so the first render is ms not ~2s. The export/download uses the PDF; the live preview
  uses `format:"svg"` (Typst's own renderer → vector glyph outlines), shown as an `<img>` — same layout engine as
  the PDF so it's pixel-identical to the export, but rasterized to a single composited layer so it scrolls smoothly
  and stays crisp at any width (a re-implementation like pdf.js mis-renders embedded-font ligatures; a native PDF
  plugin re-rasterizes on every scroll frame → lag). · `unpdf`/`mammoth` for
  upload parsing · `linkedom` + `@mozilla/readability` + Jina Reader for job scraping

## UI components
**Ant Design v6** is the UI system — every component comes from `antd` (stock theme, no token overrides), icons
from `@ant-design/icons`. There is no Tailwind, no custom primitives, no CSS-in-JS theme config.
- SSR is wired via `@ant-design/nextjs-registry`: `src/app/layout.tsx` (server) wraps the tree in `<AntdRegistry>`
  → `src/app/providers.tsx` ("use client") = `<ConfigProvider>` → antd `<App>`. The `<App>` wrapper supplies
  context for the static `message`/`modal` APIs — get them with `const { modal, message } = App.useApp()`.
- Any file using antd components must be a Client Component (`"use client"`) — antd calls `createContext` at
  module load, which breaks in Server Components (only `layout.tsx` may import `AntdRegistry`, never antd UI).
- Layout/structure uses antd primitives (`Layout`, `Flex`, `Space`, `Row`/`Col`) + the `style` prop for one-offs;
  brand/accent color comes from `theme.useToken().token.colorPrimary` (stock antd blue), never hardcoded.
- `src/app/globals.css` is plain CSS (no Tailwind) with only a few helpers: `.screen-lg` (desktop one-viewport:
  `height:100dvh;overflow:hidden` ≥1024px), `.scrollbar-thin`, `.no-scrollbar`, `.pdf-canvas` (dark #525659).

## Layout
- `src/lib/resume/schema.ts` — JSON Resume Zod model + `applyResumePatch`, `REQUIREMENTS`, completeness
- `src/lib/llm/provider.ts` — `chatJSON` / `chatText` / `chatStream` + `llmErrorMessage` (429/401 mapping)
- `src/lib/job/extract.ts` — layered job-URL → text (Jina → Readability → raw)
- `src/store/useAppStore.ts` — single store (resume, job, tailored, templateId, messages). `skipHydration`;
  rehydrate via `useHydration()` in `src/lib/hooks.ts` to avoid SSR mismatch
- `src/app/api/{health,parse,interview,job,tailor,render}/route.ts` — all `runtime = "nodejs"`
- `src/components/{onboarding,tailor,editor,preview,landing}/*` — all pure antd, all `"use client"`. `preview/ResumePreview.tsx` = the live preview: POSTs `/api/render` with `format:"svg"`, makes a blob URL of the returned SVG and shows it as an `<img width:100%>` inside a `scrollbar-thin` scroller on the dark `.pdf-canvas`; debounced so typing doesn't recompile every keystroke. The export button still POSTs `/api/render` (no format) for the PDF. `preview/TemplatePicker.tsx` = a "Template:" `Button` → antd `Modal` showing a responsive CSS-grid (`auto-fill minmax`, 15 per page) of static thumbnails (`public/thumbs/<id>.webp`), paged with antd `<Pagination>`; the grid scrolls inside a height-capped area so the modal never overflows. `landing/InfiniteSlider.tsx` = a dependency-free reimagining of smoothui.dev's Infinite Slider (no Tailwind/`motion`/`react-use-measure`). It's a NATIVE horizontal scroll container; a `requestAnimationFrame` loop nudges `scrollLeft` by `speed` px/sec and wraps it by one copy's stride `(scrollWidth+gap)/2` (children rendered twice) for a seamless loop. Being a real scroller it's drag-to-scroll (mouse, with a slop threshold + deferred pointer-capture so plain clicks still fire), swipeable on touch, wheel/trackpad scrollable, and a focused card can `scrollIntoView`. Auto-scroll pauses on hover, on keyboard focus (`:focus-visible`), and while dragging — and stops for `prefers-reduced-motion` — but the strip stays manually scrollable. The 2nd copy is `aria-hidden`+untabbable (each item read once) but stays clickable. `landing/TemplateCarousel.tsx` = the homepage showcase: fixed A4-portrait (210:297) `public/thumbs` cards sized to the available height, fed through `<InfiniteSlider pauseOnHover>`; click a card → `setTemplate` + route to `/build`. The landing page (`app/page.tsx`) and `/build` use `className="screen-lg"` so they fit one viewport (no scroll) on desktop, with the carousel / work-area as the flex-fill child
- `src/lib/typst/compile.ts` — `renderResumePdf(resume, templateId)`: looks up the template in the registry, runs its `adapt()` → JSON, compiles `<id>/resume.typ`. One process-global `NodeCompiler` on `globalThis` (so every server chunk shares it; warmed by `instrumentation.ts`), workspace = `src/templates`, fonts from `vantage/fonts` + `_fonts`

## Templates (65, mostly Typst Universe `@preview` CV packages)
- `src/templates/registry.ts` — **generated** by `scripts/build-registry.mjs`; the single source of truth (id, name, description, accent, adapter). Don't hand-edit.
- Each `src/templates/<id>/` has: `adapter.ts` (`export function adapt(resume): unknown` — pure, maps `Resume` → the template's input JSON), `resume.typ` (entry: `#import "@preview/<pkg>:<ver>"` + reads `json(bytes(sys.inputs.resume))`), and `meta.json` (registry metadata). `vantage`/`swe` are vendored; the rest wrap `@preview` packages auto-downloaded into the Typst cache on first render (needs network once).
- `src/templates/shared.ts` = shared adapter helpers; `format.ts` = date/contact formatting. `_fonts/` = shared fonts (Font Awesome); `vantage/fonts/` = PT Sans.
- Add a template: create `<id>/{adapter.ts,resume.typ,meta.json}`, then `node scripts/build-registry.mjs`. Verify one with `npx tsx scripts/verify-template.mjs <id>`, or all with `scripts/verify-all.mjs`.
- Thumbnails are static, committed `public/thumbs/<id>.webp` — the SAME PDF the preview/export makes (Typst → PDF → `unpdf`+`@napi-rs/canvas` raster → full-page A4 WebP), rendered from `SAMPLE_RESUME`. The homepage carousel shows them as full A4 pages; the modal picker top-crops the same image via CSS. Regenerate after adding/changing a template, the sample, or fonts: `pnpm thumbs` (`scripts/gen-thumbs.mjs`).

## Conventions
- LLM JSON responses are always re-validated with Zod `safeParse`; fall back, never trust raw output.
- Tailoring prompt is truthful-only: rephrase/reorder real content, report gaps; never fabricate.
- When updating a resume array via a patch, the LLM returns the FULL array (it's replaced, not merged).
- After TS/TSX changes run `pnpm typecheck && pnpm lint && pnpm test`.
- Needs `GROQ_API_KEY` in `.env.local` (see `.env.example`). AI routes 500 without it.
