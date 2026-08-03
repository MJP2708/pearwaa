"use client";

import { useCallback, useRef } from "react";

/** Module-level (not component-nested) so the Date.now() call doesn't trip
 * the "components must be pure" lint rule — this only ever runs from a
 * click handler, never during render. */
function registerClick(ref: { current: number[] }, windowMs: number, threshold: number): boolean {
  const now = Date.now();
  const recent = ref.current.filter((t) => now - t < windowMs);
  recent.push(now);
  ref.current = recent;
  if (recent.length >= threshold) {
    ref.current = [];
    return true;
  }
  return false;
}

/** N clicks within a rolling window, with no visible counter anywhere —
 * the building block behind Pearwaa's quiet hidden note. */
export function useSecretClickCounter(threshold = 5, windowMs = 6000) {
  const clicksRef = useRef<number[]>([]);
  return useCallback(() => registerClick(clicksRef, windowMs, threshold), [windowMs, threshold]);
}
