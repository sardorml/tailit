"use client";

import { useEffect, useRef, useState } from "react";
import { Alert, Spin } from "antd";
import type { Resume } from "@/lib/resume/schema";
import type { TemplateId } from "@/lib/templates";
import { useDebounced } from "@/lib/hooks";

/**
 * Live resume preview. The resume is compiled server-side by Typst to a standalone
 * SVG (POST /api/render with format:"svg") and shown as an <img>. This is the key
 * to "smooth + faithful":
 *  - Faithful: the SVG comes from Typst's OWN renderer (the same layout engine the
 *    PDF export uses), with glyphs as vector outlines — so it's pixel-identical to
 *    the download and free of the embedded-font / ligature artifacts a browser PDF
 *    re-implementation (pdf.js) introduces.
 *  - Smooth: the browser rasterizes the SVG once into a single composited image
 *    layer; scrolling just moves that layer (no per-frame PDF re-rasterization like
 *    the native plugin, which is what made scrolling laggy). It re-rasterizes on
 *    resize, so it stays crisp at any pane width / on HiDPI.
 * Debounced so typing doesn't recompile on every keystroke.
 */
export default function ResumePreview({
  resume,
  templateId,
}: {
  resume: Resume;
  templateId: TemplateId;
}) {
  const debouncedResume = useDebounced(resume, 500);
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(true);
  const lastUrl = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setPending(true);
      setError(null);
      try {
        const res = await fetch("/api/render", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ resume: debouncedResume, templateId, format: "svg" }),
        });
        if (!res.ok) {
          const msg = await res.json().catch(() => null);
          throw new Error(msg?.error || `Render failed (${res.status}).`);
        }
        const blob = await res.blob();
        if (cancelled) return;
        const next = URL.createObjectURL(blob);
        if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
        lastUrl.current = next;
        setUrl(next);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Render failed.");
      } finally {
        if (!cancelled) setPending(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [debouncedResume, templateId]);

  useEffect(() => {
    return () => {
      if (lastUrl.current) URL.revokeObjectURL(lastUrl.current);
    };
  }, []);

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
        }}
      >
        <Alert type="error" showIcon message={error} />
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        height: "100%",
        width: "100%",
        overflow: "hidden",
      }}
    >
      <div
        className="scrollbar-thin"
        style={{
          height: "100%",
          width: "100%",
          boxSizing: "border-box",
          overflowY: "auto",
          overflowX: "hidden",
          padding: 16,
          // Promote the scroller to its own compositing layer so scrolling the
          // (potentially tall, multi-page) image stays on the GPU.
          willChange: "scroll-position",
        }}
      >
        {/* A Typst-generated SVG via blob URL: next/image can't optimize it and
            would break the vector-rasterized-on-resize crispness we rely on. */}
        {url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Resume preview"
            draggable={false}
            style={{
              display: "block",
              width: "100%",
              height: "auto",
              background: "#fff",
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.35)",
            }}
          />
        )}
      </div>
      {pending && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0, 0, 0, 0.2)",
            pointerEvents: "none",
          }}
        >
          <Spin />
        </div>
      )}
    </div>
  );
}
