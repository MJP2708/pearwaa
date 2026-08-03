"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "pearwaa:sent-letters";

export type SentLetterRecord = {
  id: string;
  url: string;
  emotionLabel: string;
  messagePreview: string;
  createdAt: number;
};

function readStorage(): SentLetterRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStorage(records: SentLetterRecord[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

/**
 * A record of links this browser has generated — purely local. There's no
 * backend, so "removing" one only clears it from this device's own list;
 * anyone who already has the link can still open it. Worded honestly in
 * the UI rather than implied as revocation.
 */
export function useSentLetters() {
  const [records, setRecords] = useState<SentLetterRecord[]>([]);

  // Starts empty (matching SSR) and reads localStorage only after mount,
  // to avoid a hydration mismatch — see useFlowerCollection for the same pattern.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setRecords(readStorage()), []);

  const addRecord = useCallback((record: SentLetterRecord) => {
    setRecords((prev) => {
      const next = [record, ...prev].slice(0, 20);
      writeStorage(next);
      return next;
    });
  }, []);

  const removeRecord = useCallback((id: string) => {
    setRecords((prev) => {
      const next = prev.filter((r) => r.id !== id);
      writeStorage(next);
      return next;
    });
  }, []);

  return { records, addRecord, removeRecord };
}
