"use client";

import { Heart } from "lucide-react";
import type { ColorVariant, EncyclopediaFlower } from "@/data/flower-encyclopedia";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Row = { label: string; value: string };

export function FlowerInfoPanel({
  flower,
  selectedColor,
  favorited,
  onToggleFavorite,
  headingRef,
  onHeadingActivate,
}: {
  flower: EncyclopediaFlower;
  selectedColor: ColorVariant;
  favorited: boolean;
  onToggleFavorite: () => void;
  headingRef?: React.Ref<HTMLHeadingElement>;
  onHeadingActivate?: () => void;
}) {
  const rows: Row[] = [
    { label: "Bloom season", value: flower.bloomSeason },
    { label: "Native region", value: flower.nativeRegion },
  ];

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1
            ref={headingRef}
            onClick={onHeadingActivate}
            className={cn("font-heading text-3xl font-normal text-foreground sm:text-4xl", onHeadingActivate && "cursor-default select-none")}
          >
            {flower.commonName}
          </h1>
          <p className="mt-1 text-sm italic text-muted-foreground">{flower.scientificName}</p>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="rounded-full"
          onClick={onToggleFavorite}
          aria-pressed={favorited}
          aria-label={favorited ? `Remove ${flower.commonName} from favorites` : `Favorite ${flower.commonName}`}
        >
          <Heart className={cn("size-4", favorited && "fill-primary text-primary")} aria-hidden="true" />
        </Button>
      </div>

      {/* People come for emotional meaning before biology — meaning first,
          then the bloom story, then deeper symbolism, then science and
          botany last. See DESIGN_PRINCIPLES.md. */}
      <div className="mt-5 rounded-2xl border border-border/70 bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {selectedColor.label} {flower.commonName.toLowerCase()} means
        </p>
        <p className="mt-1.5 font-heading text-lg leading-relaxed text-foreground">{selectedColor.symbolism}</p>
      </div>

      {flower.bloomStory.length > 0 && (
        <div className="mt-5 space-y-2 rounded-2xl bg-secondary/50 p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Bloom story</p>
          {flower.bloomStory.map((line, i) => (
            <p key={i} className="font-heading text-base leading-relaxed text-foreground/90">
              {line}
            </p>
          ))}
        </div>
      )}

      <div className="mt-5 space-y-4 border-t border-border/70 pt-5 text-sm leading-relaxed">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Hanakotoba</p>
          <p className="mt-1 text-foreground">{flower.hanakotoba}</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Victorian meaning</p>
          <p className="mt-1 text-foreground">{flower.victorianMeaning}</p>
        </div>
      </div>

      <div className="mt-5 border-t border-border/70 pt-5 text-sm leading-relaxed">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Worth knowing</p>
        <p className="mt-1 text-foreground">{flower.funFact}</p>
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border/70 pt-5 text-sm">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{row.label}</dt>
            <dd className="mt-0.5 text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
