/**
 * Next.js boot hook. Pre-warms the Typst compiler so the first live-preview /
 * export render isn't stuck paying the one-time NodeCompiler init (~1.9s on a
 * cold process). After this warm-up every render is single-digit milliseconds.
 * Runs once per server process, off the request path.
 */
export async function register() {
  // Only in the Node.js server runtime (not edge, not the browser).
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  try {
    const [{ renderResumePdf }, { emptyResume }, { DEFAULT_TEMPLATE }] =
      await Promise.all([
        import("@/lib/typst/compile"),
        import("@/lib/resume/schema"),
        import("@/lib/templates"),
      ]);
    // One throwaway compile of the default template initializes the native
    // compiler + fonts, so the first real render is milliseconds, not ~2s.
    renderResumePdf(emptyResume(), DEFAULT_TEMPLATE);
  } catch {
    // Warm-up is best-effort; a failure here must never block server start.
  }
}
