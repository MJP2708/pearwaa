import type { Metadata } from "next";
import { Suspense } from "react";
import { LetterClient } from "./letter-client";

export const metadata: Metadata = {
  title: "A Flower Letter — Pearwaa",
  description: "Someone sent you flowers and a few words.",
  robots: { index: false, follow: false },
};

export default function LetterPage() {
  return (
    <Suspense fallback={null}>
      <LetterClient />
    </Suspense>
  );
}
