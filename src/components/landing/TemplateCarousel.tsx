"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { getTemplate, type TemplateId } from "@/lib/templates";
import InfiniteSlider from "./InfiniteSlider";

// Curated, visually diverse showcase — dark sidebars, colour sidebars, bold
// header blocks and clean classics — using the pre-generated full-page A4
// thumbnails in public/thumbs. Order is just the marquee sequence.
const SHOWCASE = [
  "vantage",
  "brilliant-cv",
  "calligraphics",
  "metronic",
  "nabcv",
  "modern-cv",
  "vivid-cv",
  "cobalt-cv",
  "grotesk-cv",
  "mahou-cv",
  "toy-cv",
  "typographic-resume",
  "vercanard",
  "nutshell",
] satisfies string[];

const A4 = 210 / 297; // page width ÷ height
const GAP = 20; // horizontal gap between cards (px)
const VPAD = 20; // vertical breathing room around the cards
const MAX_CARD_H = 300; // cap so previews stay compact, not full-bleed
const SPEED = 55; // marquee scroll speed (px / second) — a calm, readable pace

/**
 * A4 template previews for the homepage, built on a seamless <InfiniteSlider>
 * marquee (continuous auto-scroll, pause-on-hover, respects reduced-motion) —
 * replacing the old antd <Carousel>. Each card is a fixed A4-portrait rectangle
 * (210:297) sized to the available height so the page still fits one viewport on
 * desktop. Hovering pauses the scroll so a card is easy to click; clicking one
 * selects that template and opens the builder.
 */
export default function TemplateCarousel() {
  const setTemplate = useAppStore((s) => s.setTemplate);
  const router = useRouter();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [availH, setAvailH] = useState(0);

  function start(id: TemplateId) {
    setTemplate(id);
    router.push("/build");
  }

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setAvailH(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Largest A4 card that fits the available height, capped so previews stay modest.
  const cardH = Math.max(0, Math.min(availH - VPAD, MAX_CARD_H));
  const cardW = Math.round(cardH * A4);
  const ready = cardH > 0;

  return (
    <div ref={wrapRef} className="tpl-carousel" style={{ height: "100%" }}>
      {ready && (
        <InfiniteSlider
          gap={GAP}
          speed={SPEED}
          pauseOnHover
          style={{ height: "100%" }}
        >
          {SHOWCASE.map((id) => {
            const t = getTemplate(id as TemplateId);
            return (
              <button
                key={id}
                type="button"
                className="tpl-card"
                onClick={() => start(id as TemplateId)}
                aria-label={`Start with the ${t.name} template`}
                style={{
                  position: "relative",
                  flexShrink: 0,
                  width: cardW,
                  height: cardH,
                  padding: 0,
                  border: "1px solid rgba(0,0,0,0.10)",
                  borderRadius: 4,
                  overflow: "hidden",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                {/* Decorative — the button's aria-label already names the
                    template, so an empty alt avoids a double announcement. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/thumbs/${id}.webp`}
                  alt=""
                  draggable={false}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "top",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    insetInline: 0,
                    bottom: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    background: "rgba(0,0,0,0.55)",
                    padding: "8px 12px",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      flexShrink: 0,
                      borderRadius: 9999,
                      boxShadow: "0 0 0 1px rgba(255,255,255,0.7)",
                      backgroundColor: t.accent,
                    }}
                  />
                  <span
                    style={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#fff",
                    }}
                  >
                    {t.name}
                  </span>
                </div>
              </button>
            );
          })}
        </InfiniteSlider>
      )}
    </div>
  );
}
