"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ACHIEVEMENTS, type Achievement } from "@/data/achievements";

const STORAGE_KEY = "pearwaa:flower-collection";

type CollectionState = {
  viewed: string[];
  favorited: string[];
  viewedColors: string[];
  acknowledged: string[];
};

const EMPTY: CollectionState = { viewed: [], favorited: [], viewedColors: [], acknowledged: [] };

function readStorage(): CollectionState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw);
    return {
      viewed: Array.isArray(parsed.viewed) ? parsed.viewed : [],
      favorited: Array.isArray(parsed.favorited) ? parsed.favorited : [],
      viewedColors: Array.isArray(parsed.viewedColors) ? parsed.viewedColors : [],
      acknowledged: Array.isArray(parsed.acknowledged) ? parsed.acknowledged : [],
    };
  } catch {
    return EMPTY;
  }
}

function writeStorage(state: CollectionState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/** Low-pressure, local-only exploration tracking — viewed flowers/colors,
 * favorites, and which quiet achievements have already been shown. No
 * accounts, no syncing; a scrapbook, not a checklist. */
export function useFlowerCollection() {
  // Always starts from EMPTY (matching what the server renders) and only
  // reads localStorage after mount — reading it in the initializer would
  // make the client's first (hydration) render diverge from the server's,
  // which React flags as a hydration mismatch.
  const [state, setState] = useState<CollectionState>(EMPTY);

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setState(readStorage()), []);

  const markViewed = useCallback((id: string) => {
    setState((prev) => {
      if (prev.viewed.includes(id)) return prev;
      const next = { ...prev, viewed: [...prev.viewed, id] };
      writeStorage(next);
      return next;
    });
  }, []);

  const markColorViewed = useCallback((flowerId: string, colorId: string) => {
    const key = `${flowerId}:${colorId}`;
    setState((prev) => {
      if (prev.viewedColors.includes(key)) return prev;
      const next = { ...prev, viewedColors: [...prev.viewedColors, key] };
      writeStorage(next);
      return next;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setState((prev) => {
      const isFav = prev.favorited.includes(id);
      const next = {
        ...prev,
        favorited: isFav ? prev.favorited.filter((f) => f !== id) : [...prev.favorited, id],
      };
      writeStorage(next);
      return next;
    });
  }, []);

  const acknowledgeAchievement = useCallback((id: string) => {
    setState((prev) => {
      if (prev.acknowledged.includes(id)) return prev;
      const next = { ...prev, acknowledged: [...prev.acknowledged, id] };
      writeStorage(next);
      return next;
    });
  }, []);

  const unlocked = useMemo(
    () => ACHIEVEMENTS.filter((a) => a.isUnlocked(state.viewed, state.viewedColors)),
    [state.viewed, state.viewedColors],
  );
  const newlyUnlocked = useMemo<Achievement[]>(
    () => unlocked.filter((a) => !state.acknowledged.includes(a.id)),
    [unlocked, state.acknowledged],
  );

  return {
    viewed: state.viewed,
    favorited: state.favorited,
    viewedColors: state.viewedColors,
    unlocked,
    newlyUnlocked,
    markViewed,
    markColorViewed,
    toggleFavorite,
    acknowledgeAchievement,
  };
}
