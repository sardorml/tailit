"use client";

import { useEffect, useState } from "react";
import { useAppStore } from "@/store/useAppStore";

/**
 * Rehydrates the persisted store on mount and reports when it's done.
 * The store uses `skipHydration: true`, so server render + first client render
 * both use default state (no hydration mismatch); persisted data appears once
 * this resolves. Gate any UI that depends on persisted state on the result.
 */
export function useHydration(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    const result = useAppStore.persist.rehydrate();
    Promise.resolve(result).finally(() => setHydrated(true));
  }, []);
  return hydrated;
}

/**
 * Subscribe to a CSS media query. SSR-safe: returns `false` on the server, then
 * the real match on the client (lazily initialised from `matchMedia`, so a
 * client-rendered tree gets the correct value on first paint — no flash).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

/** Debounce a fast-changing value (e.g. the resume) before expensive renders. */
export function useDebounced<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(id);
  }, [value, delayMs]);
  return debounced;
}
