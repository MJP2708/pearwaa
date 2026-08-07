"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaperSurface } from "@/components/paper-surface";
import { FlowerLayoutCanvas } from "@/components/create/flower-layout-canvas";
import { useBouquetReflection } from "@/lib/use-bouquet-reflection";
import type { FlowerPlacement } from "@/lib/export-image";
import type { Emotion } from "@/data/emotions";
import { cn } from "@/lib/utils";

type Props = {
  emotion: Emotion;
  placements: FlowerPlacement[];
  bouquetKey: string;
  stepLabel?: string;
  /** Only present when this reflection can flow into a Flower Letter —
   * the Bouquet Builder's own "keep/download" path has nothing to
   * include it in, so this control only shows up from the Letters flow. */
  showIncludeOption?: boolean;
  onBack: () => void;
  onContinue: (result: { note: string; includeInLetter: boolean }) => void;
};

export function BouquetReflection({
  emotion,
  placements,
  bouquetKey,
  stepLabel = "Optional",
  showIncludeOption = false,
  onBack,
  onContinue,
}: Props) {
  const { note, save } = useBouquetReflection(bouquetKey);
  const [draft, setDraft] = useState(note);
  const [includeInLetter, setIncludeInLetter] = useState(false);
  const [skipped, setSkipped] = useState(false);

  function handleSkip() {
    setSkipped(true);
    onContinue({ note: "", includeInLetter: false });
  }

  function handleKeep() {
    save(draft);
    onContinue({ note: draft, includeInLetter: draft.trim() ? includeInLetter : false });
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-medium text-primary">{stepLabel}</p>
      <h1 className="mt-2 font-heading text-3xl font-normal text-foreground sm:text-4xl">
        Would you like to remember why you made this?
      </h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
        A sentence is plenty. Or skip this entirely — nothing about your bouquet needs it.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-[220px_1fr] sm:items-start">
        <div className="mx-auto w-full max-w-[220px] sm:mx-0">
          <FlowerLayoutCanvas
            placements={placements}
            onChangePlacements={() => {}}
            selectedKey={null}
            onSelectKey={() => {}}
            accentHex={emotion.colorHex}
            aspectRatio="1 / 1"
          />
        </div>

        <PaperSurface tint={emotion.colorHex} className="p-5 sm:p-6">
          <label htmlFor="reflection-note" className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            This stays with you
          </label>
          <textarea
            id="reflection-note"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="I made this because…"
            rows={3}
            className="mt-2 w-full resize-none bg-transparent font-heading text-lg leading-relaxed text-foreground placeholder:text-foreground/30 focus:outline-none"
          />

          {showIncludeOption && (
            <label
              className={cn(
                "mt-4 flex items-start gap-2.5 rounded-xl border border-border/60 p-3 text-sm transition-colors",
                draft.trim() ? "cursor-pointer hover:bg-secondary/40" : "cursor-not-allowed opacity-40",
              )}
            >
              <input
                type="checkbox"
                checked={includeInLetter}
                disabled={!draft.trim()}
                onChange={(e) => setIncludeInLetter(e.target.checked)}
                className="mt-0.5 size-4 rounded border-border accent-primary"
              />
              <span className="text-muted-foreground">
                Include this in the letter — the person receiving it will see these words too.
              </span>
            </label>
          )}
        </PaperSurface>
      </div>

      <div className="mt-9 flex flex-wrap justify-between gap-3">
        <Button variant="ghost" size="lg" className="rounded-full px-6" onClick={onBack}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="rounded-full px-6" onClick={handleSkip} disabled={skipped}>
            Skip
          </Button>
          <Button size="lg" className="rounded-full px-7" onClick={handleKeep}>
            Continue
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}
