"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { BookHeart } from "lucide-react";
import { ENCYCLOPEDIA_FLOWERS, toLegacyFlower } from "@/data/flower-encyclopedia";
import { emotions, type EmotionId } from "@/data/emotions";
import { FlowerGlyphIcon } from "@/components/flower-glyph-icon";
import { FadeIn } from "@/components/motion/fade-in";
import { cn } from "@/lib/utils";

type FilterId = "all" | EmotionId;

export default function ExplorePage() {
  const [filter, setFilter] = useState<FilterId>("all");

  const visible = useMemo(
    () => (filter === "all" ? ENCYCLOPEDIA_FLOWERS : ENCYCLOPEDIA_FLOWERS.filter((f) => f.emotions.includes(filter))),
    [filter],
  );

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <FadeIn className="max-w-2xl">
          <p className="text-sm font-medium text-primary">Explore Flowers</p>
          <h1 className="mt-2 font-heading text-3xl font-normal text-foreground sm:text-4xl">
            A small vocabulary of flowers
          </h1>
          <p className="mt-3 text-base leading-relaxed text-muted-foreground">
            Every flower here carries a meaning. Open one to turn it in your hands, in 3D — its
            colors, its bloom, its story.
          </p>
        </FadeIn>
        <Link
          href="/collection"
          className="inline-flex items-center gap-1.5 rounded-full border border-border/70 px-4 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <BookHeart className="size-3.5" aria-hidden="true" />
          My Collection
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter flowers by feeling">
        <button
          type="button"
          aria-pressed={filter === "all"}
          onClick={() => setFilter("all")}
          className={cn(
            "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            filter === "all"
              ? "border-primary bg-accent text-accent-foreground"
              : "border-border/70 text-muted-foreground hover:bg-secondary",
          )}
        >
          All
        </button>
        {emotions.map((emotion) => (
          <button
            key={emotion.id}
            type="button"
            aria-pressed={filter === emotion.id}
            onClick={() => setFilter(emotion.id)}
            className={cn(
              "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              filter === emotion.id
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border/70 text-muted-foreground hover:bg-secondary",
            )}
          >
            {emotion.label}
          </button>
        ))}
      </div>

      <ul className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {visible.map((flower, i) => {
          const previewFlower = toLegacyFlower(flower);
          return (
            <li key={flower.id}>
              <FadeIn delay={Math.min(i * 0.03, 0.3)}>
                <Link
                  href={`/explore/${flower.id}`}
                  className="flex h-full w-full flex-col items-center gap-2 rounded-2xl border border-border/70 bg-card px-4 py-5 text-center transition-colors hover:border-primary/40 hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  <FlowerGlyphIcon flower={previewFlower} size={56} />
                  <span className="font-heading text-base font-normal text-foreground">{flower.commonName}</span>
                  <span className="text-xs leading-snug text-muted-foreground">{previewFlower.meaning}</span>
                </Link>
              </FadeIn>
            </li>
          );
        })}
      </ul>

      {visible.length === 0 && (
        <p className="mt-10 text-sm text-muted-foreground">No flowers match that feeling yet.</p>
      )}
    </div>
  );
}
