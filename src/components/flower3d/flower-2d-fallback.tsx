"use client";

import { useMemo } from "react";
import type { ColorVariant, EncyclopediaFlower, PetalShape3D } from "@/data/flower-encyclopedia";
import type { Flower, PetalShape } from "@/data/flowers";
import { FlowerGlyphIcon } from "@/components/flower-glyph-icon";

const SHAPE_MAP: Record<PetalShape3D, PetalShape> = {
  round: "round",
  pointed: "pointed",
  star: "star",
  cluster: "cluster",
  ruffled: "round",
  trumpet: "bell",
  // The 2D glyph system has no dedicated spike/raceme shape — a tight
  // dense cluster is the closest existing look for the fallback icon.
  spike: "cluster",
  // The 2D pipeline has no layered-ring/two-part/floret-dome concepts —
  // map each new 3D-only structure to its closest 2D silhouette.
  spiral: "round",
  cup: "round",
  "disc-ray": "star",
  floret: "cluster",
};

/** Shown when WebGL isn't available — the same info panel still works,
 * just paired with the app's existing flat glyph style instead of 3D. */
export function Flower2DFallback({ flower, selectedColor }: { flower: EncyclopediaFlower; selectedColor: ColorVariant }) {
  const adapted: Flower = useMemo(
    () => ({
      id: flower.id,
      name: flower.commonName,
      scientificName: flower.scientificName,
      meaning: selectedColor.symbolism,
      bloomStory: flower.bloomStory,
      emotions: flower.emotions,
      colorHex: selectedColor.hex,
      petalShape: SHAPE_MAP[flower.model.petalShape],
      petalCount: flower.model.petalCount,
    }),
    [flower, selectedColor],
  );

  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-3 rounded-3xl p-8 text-center"
      style={{ background: `linear-gradient(180deg, ${flower.habitat.skyTop}, ${flower.habitat.skyBottom})` }}
    >
      <FlowerGlyphIcon flower={adapted} size={140} />
      <p className="max-w-[28ch] text-xs text-foreground/70">
        Your browser can&rsquo;t show the 3D model here, so here&rsquo;s {flower.commonName.toLowerCase()} in
        Pearwaa&rsquo;s usual style instead.
      </p>
    </div>
  );
}
