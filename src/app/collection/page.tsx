"use client";

import Link from "next/link";
import { Heart, Sparkles } from "lucide-react";
import { ENCYCLOPEDIA_FLOWERS } from "@/data/flower-encyclopedia";
import { ACHIEVEMENTS } from "@/data/achievements";
import { FlowerGlyphIcon } from "@/components/flower-glyph-icon";
import { Mascot } from "@/components/mascot";
import { FadeIn } from "@/components/motion/fade-in";
import { useFlowerCollection } from "@/lib/use-flower-collection";
import { cn } from "@/lib/utils";
import type { Flower } from "@/data/flowers";

export default function CollectionPage() {
  const { viewed, favorited, viewedColors, unlocked } = useFlowerCollection();

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <FadeIn className="max-w-2xl">
        <p className="text-sm font-medium text-primary">My Collection</p>
        <h1 className="mt-2 font-heading text-3xl font-normal text-foreground sm:text-4xl">
          A scrapbook, not a checklist
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          {viewed.length} of {ENCYCLOPEDIA_FLOWERS.length} flowers met so far. Kept only on this
          device — nothing here is scored, and there&rsquo;s nowhere to fall behind.
        </p>
      </FadeIn>

      <ul className="mt-9 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {ENCYCLOPEDIA_FLOWERS.map((flower, i) => {
          const isViewed = viewed.includes(flower.id);
          const isFavorited = favorited.includes(flower.id);
          const previewFlower: Flower = {
            id: flower.id,
            name: flower.commonName,
            scientificName: flower.scientificName,
            meaning: flower.colors[0]?.symbolism ?? flower.hanakotoba,
            bloomStory: flower.bloomStory,
            emotions: flower.emotions,
            colorHex: flower.colors[0]?.hex ?? "#C9B7E8",
            petalShape: flower.model.petalShape === "trumpet" ? "bell" : flower.model.petalShape === "ruffled" ? "round" : flower.model.petalShape,
            petalCount: flower.model.petalCount,
          };

          return (
            <li key={flower.id}>
              <FadeIn delay={Math.min(i * 0.02, 0.24)}>
                <Link
                  href={`/explore/${flower.id}`}
                  className={cn(
                    "relative flex h-full w-full flex-col items-center gap-2 rounded-2xl border px-4 py-5 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                    isViewed
                      ? "border-border/70 bg-card hover:border-primary/40 hover:bg-accent/30"
                      : "border-dashed border-border/70 bg-secondary/30 hover:bg-secondary/50",
                  )}
                >
                  {isFavorited && (
                    <Heart className="absolute right-3 top-3 size-3.5 fill-primary text-primary" aria-hidden="true" />
                  )}
                  {isViewed ? (
                    <>
                      <FlowerGlyphIcon flower={previewFlower} size={52} />
                      <span className="font-heading text-base font-normal text-foreground">{flower.commonName}</span>
                      <span className="text-xs text-muted-foreground">Met</span>
                    </>
                  ) : (
                    <>
                      <Mascot size={44} mood="sleepy" className="opacity-50 grayscale" />
                      <span className="font-heading text-base font-normal text-muted-foreground">???</span>
                      <span className="text-xs text-muted-foreground">Not yet discovered</span>
                    </>
                  )}
                </Link>
              </FadeIn>
            </li>
          );
        })}
      </ul>

      <FadeIn delay={0.1} className="mt-14 border-t border-border/70 pt-10">
        <h2 className="font-heading text-xl font-normal text-foreground">Quiet milestones</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {unlocked.length} of {ACHIEVEMENTS.length} found — nothing timed, nothing competitive.
        </p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = achievement.isUnlocked(viewed, viewedColors);
            return (
              <li
                key={achievement.id}
                className={cn(
                  "flex items-start gap-3 rounded-2xl border p-4",
                  isUnlocked ? "border-border/70 bg-card" : "border-dashed border-border/70 bg-secondary/20",
                )}
              >
                <span
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-full",
                    isUnlocked ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground",
                  )}
                >
                  <Sparkles className="size-4" aria-hidden="true" />
                </span>
                <div>
                  <p className={cn("text-sm font-medium", isUnlocked ? "text-foreground" : "text-muted-foreground")}>
                    {isUnlocked ? achievement.title : "Not yet found"}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {isUnlocked ? achievement.description : "Keep exploring to uncover this one."}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </FadeIn>
    </div>
  );
}
