"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useEffect,
  useRef,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactElement,
  type ReactNode,
} from "react";

export interface InfiniteSliderProps {
  children: ReactNode;
  /** Pixels between items — and between the two looped copies. */
  gap?: number;
  /** Auto-scroll speed in pixels / second. */
  speed?: number;
  /** Scroll towards the start instead of the end. */
  reverse?: boolean;
  /** Pause the auto-scroll while hovered (the strip stays draggable/scrollable). */
  pauseOnHover?: boolean;
  className?: string;
  style?: CSSProperties;
}

const DRAG_SLOP = 4; // px of mouse travel that turns a click into a drag

/**
 * Seamless infinite auto-scrolling slider — a dependency-free reimagining of
 * smoothui.dev's Infinite Slider for this project's stack (stock Ant Design, no
 * Tailwind / `motion` / `react-use-measure`).
 *
 * Unlike a pure CSS-keyframe marquee, this is a NATIVE horizontal scroll
 * container whose `scrollLeft` is nudged each frame by a `requestAnimationFrame`
 * loop and wrapped by exactly one copy's stride (children are rendered twice),
 * so the loop is seamless. Being a real scroll container, it's draggable with
 * the mouse, swipeable on touch, and wheel/trackpad scrollable for free; a
 * keyboard-focused card can `scrollIntoView`. The auto-scroll pauses on hover,
 * while a child is focused, and while dragging — and stops entirely for
 * `prefers-reduced-motion` — but the strip always stays manually scrollable.
 *
 * The second copy is `aria-hidden` + removed from the tab order, so keyboard and
 * screen-reader users traverse each item once; it stays clickable so a click
 * lands whichever copy is on screen.
 */
export default function InfiniteSlider({
  children,
  gap = 16,
  speed = 100,
  reverse = false,
  pauseOnHover = false,
  className,
  style,
}: InfiniteSliderProps) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const strideRef = useRef(0); // one copy's stride (px) — the seamless wrap distance
  const hoverRef = useRef(false);
  const drag = useRef({ down: false, active: false, startX: 0, startScroll: 0, moved: false, pointerId: -1 });

  // Measure one copy's stride: the doubled track is `2C + (2N-1)·gap` wide, and
  // one copy + its trailing gap = (width + gap) / 2 — the distance that loops
  // seamlessly. Re-measured when the content resizes (cards resize with the
  // viewport). Kept in a ref so the rAF loop reads the latest without re-subscribing.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const measure = () => {
      strideRef.current = (track.scrollWidth + gap) / 2;
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, [gap]);

  // Auto-advance + seamless wrap. Driven by rAF so the position is tracked as a
  // float (no sub-pixel scrollLeft rounding stall) and stays smooth.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const dir = reverse ? -1 : 1;
    let raf = 0;
    let last = performance.now();
    let pos = scroller.scrollLeft;

    const canAutoScroll = () => {
      if (mq.matches || drag.current.active) return false;
      if (pauseOnHover && hoverRef.current) return false;
      // Pause only while a child holds *keyboard* focus (so it doesn't drift out
      // of view); a mouse click focuses a card too but should not pause — hence
      // :focus-visible, which is keyboard/programmatic focus only.
      const active = document.activeElement;
      return !(
        active instanceof Element &&
        active !== scroller &&
        scroller.contains(active) &&
        active.matches(":focus-visible")
      );
    };

    const step = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000); // clamp tab-switch gaps
      last = now;
      const stride = strideRef.current;
      if (canAutoScroll()) {
        pos += dir * speed * dt;
        if (stride > 0) pos = ((pos % stride) + stride) % stride;
        scroller.scrollLeft = pos;
      } else {
        // Respect manual scroll/drag; keep our float synced and wrapped.
        pos = scroller.scrollLeft;
        if (stride > 0) {
          if (pos >= stride) scroller.scrollLeft = pos -= stride;
          else if (pos < 0) scroller.scrollLeft = pos += stride;
        }
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [speed, reverse, pauseOnHover]);

  // Mouse drag-to-scroll. Touch / pen use the container's native scrolling, so
  // we only hijack mouse pointers. Capture is deferred until the pointer travels
  // past the slop threshold, so a plain click never captures (capturing on
  // mousedown would retarget the click to the scroller and break card clicks).
  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    drag.current = {
      down: true,
      active: false,
      startX: e.clientX,
      startScroll: scroller.scrollLeft,
      moved: false,
      pointerId: e.pointerId,
    };
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d.down) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const dx = e.clientX - d.startX;
    if (!d.active) {
      if (Math.abs(dx) <= DRAG_SLOP) return; // still a click, not a drag yet
      d.active = true;
      d.moved = true;
      scroller.setPointerCapture(d.pointerId);
      scroller.dataset.dragging = "true";
    }
    const stride = strideRef.current;
    let next = d.startScroll - dx;
    if (stride > 0) next = ((next % stride) + stride) % stride;
    scroller.scrollLeft = next;
  };
  const endDrag = () => {
    const d = drag.current;
    if (!d.down) return;
    d.down = false;
    const scroller = scrollerRef.current;
    if (scroller && d.active) {
      try {
        scroller.releasePointerCapture(d.pointerId);
      } catch {
        /* pointer already released */
      }
      delete scroller.dataset.dragging;
    }
    d.active = false;
  };
  // Swallow the click that ends a drag, so dragging never activates a card.
  const onClickCapture = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (drag.current.moved) {
      e.preventDefault();
      e.stopPropagation();
      drag.current.moved = false;
    }
  };

  const items = Children.toArray(children);
  const duplicate = items.map((child, i) =>
    isValidElement(child)
      ? cloneElement(
          child as ReactElement<{ "aria-hidden"?: boolean; tabIndex?: number }>,
          { key: `infinite-slider-dup-${i}`, "aria-hidden": true, tabIndex: -1 },
        )
      : child,
  );

  return (
    <div
      ref={scrollerRef}
      className={`is-root no-scrollbar${className ? ` ${className}` : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onClickCapture={onClickCapture}
      onMouseEnter={() => {
        hoverRef.current = true;
      }}
      onMouseLeave={() => {
        hoverRef.current = false;
      }}
      style={{
        display: "flex",
        alignItems: "center",
        overflowX: "auto",
        overflowY: "hidden",
        ...style,
      }}
    >
      <div ref={trackRef} className="is-track" style={{ gap: `${gap}px` }}>
        {items}
        {duplicate}
      </div>
    </div>
  );
}
