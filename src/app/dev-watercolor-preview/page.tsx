"use client";

/**
 * Temporary side-by-side comparison of the production ink-outline glyph
 * style vs. a prototype watercolor style, for sign-off before any wider
 * rollout. Not linked from nav, not indexed. Delete once a direction is
 * chosen and (if approved) rolled out.
 */

import { flowers } from "@/data/flowers";
import { composeFlowerIconSvg } from "@/lib/flower-glyph";
import { composeWatercolorFlowerSvg } from "@/lib/flower-watercolor";

const PROTOTYPE_IDS = ["cherry-blossom", "chrysanthemum", "sunflower"];

export default function DevWatercolorPreview() {
  const samples = PROTOTYPE_IDS.map((id) => flowers.find((f) => f.id === id)).filter((f): f is NonNullable<typeof f> => Boolean(f));

  return (
    <div className="mx-auto max-w-5xl px-8 py-14">
      <h1 className="font-heading text-3xl">Watercolor style prototype</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Current production style (ink-outline botanical) on the left, watercolor prototype on the right, for each sample flower.
      </p>

      <div className="mt-10 flex flex-col gap-10">
        {samples.map((flower) => (
          <div key={flower.id} className="grid grid-cols-2 gap-6 rounded-3xl border border-border/70 p-6">
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Current — ink outline</p>
              <div
                className="rounded-2xl bg-white p-4"
                dangerouslySetInnerHTML={{ __html: composeFlowerIconSvg(flower, { size: 220 }) }}
              />
              <p className="text-sm text-foreground">{flower.name}</p>
            </div>
            <div className="flex flex-col items-center gap-3">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Prototype — watercolor</p>
              <div
                className="rounded-2xl bg-white p-4"
                dangerouslySetInnerHTML={{ __html: composeWatercolorFlowerSvg(flower, { size: 220 }) }}
              />
              <p className="text-sm text-foreground">{flower.name}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded-3xl border border-dashed border-border/70 p-6">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Watercolor prototype at bouquet scale (small)</p>
        <div className="mt-3 flex flex-wrap gap-4 rounded-2xl bg-white p-4">
          {samples.map((flower) => (
            <div key={flower.id} dangerouslySetInnerHTML={{ __html: composeWatercolorFlowerSvg(flower, { size: 64 }) }} />
          ))}
        </div>
      </div>
    </div>
  );
}
