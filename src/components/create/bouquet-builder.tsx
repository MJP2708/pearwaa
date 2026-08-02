"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BringToFront, Minus, Plus, SendToBack } from "lucide-react";
import { flowers, getFlower, getFlowersByEmotion } from "@/data/flowers";
import type { Emotion } from "@/data/emotions";
import { Button } from "@/components/ui/button";
import { FlowerLayoutCanvas } from "@/components/create/flower-layout-canvas";
import { FlowerGlyphIcon } from "@/components/flower-glyph-icon";
import { BloomStoryDialog } from "@/components/bloom-story-dialog";
import { Mascot } from "@/components/mascot";
import { computePlacementPoint } from "@/lib/bouquet-layout";
import type { FlowerPlacement } from "@/lib/export-image";
import { cn } from "@/lib/utils";

const MAX_FLOWERS = 12;

function createPlacement(flowerId: string, index: number): FlowerPlacement {
  const { x, y, scale } = computePlacementPoint(index);
  const key = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${flowerId}-${index}-${Date.now()}`;
  return { key, flowerId, x, y, scale };
}

type Props = {
  emotion: Emotion;
  label: string;
  placements: FlowerPlacement[];
  onChangePlacements: (next: FlowerPlacement[]) => void;
  onBack: () => void;
  onContinue: () => void;
  stepLabel?: string;
};

export function BouquetBuilder({
  emotion,
  label,
  placements,
  onChangePlacements,
  onBack,
  onContinue,
  stepLabel = "Step 2 of 3",
}: Props) {
  const [showAll, setShowAll] = useState(false);
  const [activeFlowerId, setActiveFlowerId] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);

  const suggested = useMemo(() => getFlowersByEmotion(emotion.id), [emotion.id]);
  const palette = showAll ? flowers : suggested;

  const counts = useMemo(() => {
    const map = new Map<string, number>();
    for (const p of placements) map.set(p.flowerId, (map.get(p.flowerId) ?? 0) + 1);
    return map;
  }, [placements]);

  const atCapacity = placements.length >= MAX_FLOWERS;

  function addFlower(id: string) {
    if (atCapacity) return;
    onChangePlacements([...placements, createPlacement(id, placements.length)]);
  }

  function removeOne(id: string) {
    const idx = [...placements].reverse().findIndex((p) => p.flowerId === id);
    if (idx === -1) return;
    const realIdx = placements.length - 1 - idx;
    const removed = placements[realIdx];
    const next = placements.filter((_, i) => i !== realIdx);
    onChangePlacements(next);
    if (removed.key === selectedKey) setSelectedKey(null);
  }

  function bringToFront() {
    if (!selectedKey) return;
    const item = placements.find((p) => p.key === selectedKey);
    if (!item) return;
    onChangePlacements([...placements.filter((p) => p.key !== selectedKey), item]);
  }

  function sendToBack() {
    if (!selectedKey) return;
    const item = placements.find((p) => p.key === selectedKey);
    if (!item) return;
    onChangePlacements([item, ...placements.filter((p) => p.key !== selectedKey)]);
  }

  const activeFlower = activeFlowerId ? getFlower(activeFlowerId) ?? null : null;

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-sm font-medium text-primary">{stepLabel}</p>
      <h1 className="mt-2 font-heading text-3xl font-normal text-foreground sm:text-4xl">
        Choose your flowers
      </h1>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
        You told us: <span className="font-medium text-foreground">&ldquo;{label}.&rdquo;</span> Here
        are a few flowers that tend to carry that feeling — add as many as you like, or browse
        everything.
      </p>

      <div className="mt-9 grid gap-8 md:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">
              {showAll ? "All flowers" : "Suggested for you"}
            </h2>
            <button
              type="button"
              onClick={() => setShowAll((v) => !v)}
              className="rounded-full px-3 py-1 text-xs font-medium text-primary hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              {showAll ? "Show suggested only" : "Browse all flowers"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3" role="group" aria-label="Available flowers">
            {palette.map((flower) => (
              <button
                key={flower.id}
                type="button"
                onClick={() => addFlower(flower.id)}
                disabled={atCapacity}
                aria-label={`Add ${flower.name} to your bouquet`}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-2xl border border-border/70 bg-card px-3 py-3.5 text-center transition-colors hover:border-primary/40 hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:cursor-not-allowed disabled:opacity-40",
                )}
              >
                <FlowerGlyphIcon flower={flower} size={40} />
                <span className="text-xs font-medium text-foreground">{flower.name}</span>
              </button>
            ))}
          </div>

          {atCapacity && (
            <p className="mt-4 text-xs text-muted-foreground">
              Your bouquet feels full — twelve is plenty to say anything.
            </p>
          )}
        </div>

        <div>
          {placements.length === 0 ? (
            <div className="mx-auto flex aspect-square w-full max-w-md flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-secondary/40 p-8 text-center">
              <Mascot size={56} mood="sleepy" className="opacity-80" />
              <p className="max-w-[26ch] text-sm text-muted-foreground">
                Choose flowers from the left to begin your bouquet.
              </p>
            </div>
          ) : (
            <>
              <FlowerLayoutCanvas
                placements={placements}
                onChangePlacements={onChangePlacements}
                selectedKey={selectedKey}
                onSelectKey={setSelectedKey}
                accentHex={emotion.colorHex}
                aspectRatio="1 / 1"
                onFlowerTap={(flowerId) => setActiveFlowerId(flowerId)}
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button variant="outline" size="sm" className="rounded-full" onClick={bringToFront} disabled={!selectedKey}>
                  <BringToFront className="size-3.5" aria-hidden="true" />
                  Bring to front
                </Button>
                <Button variant="outline" size="sm" className="rounded-full" onClick={sendToBack} disabled={!selectedKey}>
                  <SendToBack className="size-3.5" aria-hidden="true" />
                  Send to back
                </Button>
              </div>
            </>
          )}

          {counts.size > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2" aria-label="Flowers in your bouquet">
              {Array.from(counts.entries()).map(([id, count]) => {
                const flower = getFlower(id);
                if (!flower) return null;
                return (
                  <li
                    key={id}
                    className="flex items-center gap-2 rounded-full border border-border/70 bg-secondary/50 py-1 pl-1 pr-1.5 text-xs"
                  >
                    <FlowerGlyphIcon flower={flower} size={22} />
                    <span className="text-foreground">
                      {flower.name}
                      {count > 1 ? ` ×${count}` : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeOne(id)}
                      aria-label={`Remove one ${flower.name} from your bouquet`}
                      className="rounded-full p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                    >
                      <Minus className="size-3" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => addFlower(id)}
                      disabled={atCapacity}
                      aria-label={`Add another ${flower.name} to your bouquet`}
                      className="rounded-full p-0.5 text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-30"
                    >
                      <Plus className="size-3" aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {placements.length > 0 && (
            <p className="mt-2 text-xs text-muted-foreground">
              Drag a flower to move it, tap to read its bloom story.
            </p>
          )}
        </div>
      </div>

      <div className="mt-9 flex justify-between">
        <Button variant="ghost" size="lg" className="rounded-full px-6" onClick={onBack}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Button>
        <Button size="lg" className="rounded-full px-7" disabled={placements.length === 0} onClick={onContinue}>
          Continue
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <BloomStoryDialog flower={activeFlower} open={Boolean(activeFlower)} onOpenChange={(o) => !o && setActiveFlowerId(null)} />
    </div>
  );
}
