"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MotionConfig } from "framer-motion";

type AccessibilityState = {
  reducedMotion: boolean;
  highContrast: boolean;
  setReducedMotion: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;
};

const AccessibilityContext = createContext<AccessibilityState | null>(null);

const STORAGE_KEY = "pearwaa:a11y";

type StoredPrefs = { reducedMotion: boolean; highContrast: boolean };

function readStoredPrefs(): StoredPrefs {
  if (typeof window === "undefined") {
    return { reducedMotion: false, highContrast: false };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { reducedMotion: false, highContrast: false };
    const parsed = JSON.parse(raw);
    return {
      reducedMotion: Boolean(parsed.reducedMotion),
      highContrast: Boolean(parsed.highContrast),
    };
  } catch {
    return { reducedMotion: false, highContrast: false };
  }
}

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  // Lazy-initialized from localStorage (guarded for SSR inside readStoredPrefs).
  // The inline noFlashScript in <head> already applies the matching DOM
  // classes before hydration, so this never causes a visible mismatch.
  const [reducedMotion, setReducedMotionState] = useState(() => readStoredPrefs().reducedMotion);
  const [highContrast, setHighContrastState] = useState(() => readStoredPrefs().highContrast);

  useEffect(() => {
    document.documentElement.classList.toggle("motion-reduced", reducedMotion);
  }, [reducedMotion]);

  useEffect(() => {
    document.documentElement.classList.toggle("contrast-more", highContrast);
  }, [highContrast]);

  const persist = useCallback((next: Partial<StoredPrefs>) => {
    const current = readStoredPrefs();
    const merged = { ...current, ...next };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  }, []);

  const setReducedMotion = useCallback(
    (value: boolean) => {
      setReducedMotionState(value);
      persist({ reducedMotion: value });
    },
    [persist],
  );

  const setHighContrast = useCallback(
    (value: boolean) => {
      setHighContrastState(value);
      persist({ highContrast: value });
    },
    [persist],
  );

  const value = useMemo(
    () => ({ reducedMotion, highContrast, setReducedMotion, setHighContrast }),
    [reducedMotion, highContrast, setReducedMotion, setHighContrast],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      <MotionConfig reducedMotion={reducedMotion ? "always" : "user"}>
        {children}
      </MotionConfig>
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return ctx;
}

/** Inline script injected before hydration so the high-contrast class
 * applies on first paint, avoiding a flash of default-contrast UI. */
export const noFlashScript = `
(function () {
  try {
    var raw = window.localStorage.getItem(${JSON.stringify(STORAGE_KEY)});
    if (!raw) return;
    var prefs = JSON.parse(raw);
    if (prefs.highContrast) document.documentElement.classList.add("contrast-more");
    if (prefs.reducedMotion) document.documentElement.classList.add("motion-reduced");
  } catch (e) {}
})();
`;
