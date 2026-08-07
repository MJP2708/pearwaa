"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pearwaa:bouquet-reflections";

type ReflectionEntry = { note: string; createdAt: number };

function readAll(): Record<string, ReflectionEntry> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(all: Record<string, ReflectionEntry>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

/** A private, local-only note about why a bouquet was made — stored
 * alongside the same-shaped local storage as Collection/Achievements.
 * Never sent anywhere unless the sender explicitly opts in when writing
 * a Flower Letter. See DESIGN_PRINCIPLES.md: "this is not social." */
export function useBouquetReflection(bouquetKey: string) {
  const [note, setNote] = useState("");

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setNote(readAll()[bouquetKey]?.note ?? ""), [bouquetKey]);

  const save = useCallback(
    (text: string) => {
      setNote(text);
      const all = readAll();
      if (text.trim()) {
        all[bouquetKey] = { note: text, createdAt: Date.now() };
      } else {
        delete all[bouquetKey];
      }
      writeAll(all);
    },
    [bouquetKey],
  );

  return { note, save };
}
