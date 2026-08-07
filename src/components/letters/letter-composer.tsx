"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaperSurface } from "@/components/paper-surface";
import { FlowerLayoutCanvas } from "@/components/create/flower-layout-canvas";
import { MAX_LETTER_MESSAGE_LENGTH } from "@/lib/flower-letter-codec";
import type { FlowerPlacement } from "@/lib/export-image";
import type { Emotion } from "@/data/emotions";

const MAX_NAME_LENGTH = 40;

type Props = {
  emotion: Emotion;
  placements: FlowerPlacement[];
  message: string;
  onChangeMessage: (v: string) => void;
  senderName: string;
  onChangeSenderName: (v: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

/**
 * A writing surface, not a form field — the bouquet stays visible beside
 * the page rather than hidden behind a step, so the letter is written
 * next to the thing it goes with, the way you would at a real desk.
 */
export function LetterComposer({
  emotion,
  placements,
  message,
  onChangeMessage,
  senderName,
  onChangeSenderName,
  onBack,
  onContinue,
}: Props) {
  const canContinue = message.trim().length > 0;

  return (
    <div className="mx-auto max-w-4xl">
      <p className="text-sm font-medium text-primary">Write your letter</p>
      <h1 className="mt-2 font-heading text-3xl font-normal text-foreground sm:text-4xl">
        Take your time
      </h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
        The bouquet is already speaking for you — this is just the letter that goes with it.
      </p>

      <div className="mt-8 grid gap-8 sm:grid-cols-[minmax(0,1fr)_220px] sm:items-start">
        <div>
        <PaperSurface className="px-8 pb-7 pt-9">
          <div
            className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-black/10 dark:bg-white/10"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-black/10 dark:bg-white/10"
            aria-hidden="true"
          />

          <textarea
            value={message}
            onChange={(e) => onChangeMessage(e.target.value.slice(0, MAX_LETTER_MESSAGE_LENGTH))}
            placeholder="Dear..."
            maxLength={MAX_LETTER_MESSAGE_LENGTH}
            rows={11}
            aria-label="Your letter"
            className="relative w-full resize-none bg-transparent font-heading text-lg italic leading-[35px] text-foreground outline-none placeholder:text-foreground/30"
          />

          <div className="relative mt-2 flex items-center justify-end gap-2">
            <label htmlFor="letter-sender-name" className="text-sm italic text-muted-foreground">
              — signed,
            </label>
            <input
              id="letter-sender-name"
              value={senderName}
              onChange={(e) => onChangeSenderName(e.target.value.slice(0, MAX_NAME_LENGTH))}
              placeholder="a friend"
              maxLength={MAX_NAME_LENGTH}
              className="w-40 border-b border-dashed border-border/70 bg-transparent px-1 pb-0.5 text-right font-heading text-base italic text-foreground outline-none placeholder:text-muted-foreground/60 focus-visible:border-primary"
            />
          </div>
        </PaperSurface>
        <p className="mt-1.5 text-right text-xs text-muted-foreground">
          {message.length}/{MAX_LETTER_MESSAGE_LENGTH}
        </p>
        </div>

        <div className="hidden sm:block">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Your bouquet
          </p>
          <FlowerLayoutCanvas
            placements={placements}
            onChangePlacements={() => {}}
            selectedKey={null}
            onSelectKey={() => {}}
            accentHex={emotion.colorHex}
            aspectRatio="1 / 1"
          />
        </div>
      </div>

      <div className="mt-9 flex justify-between">
        <Button variant="ghost" size="lg" className="rounded-full px-6" onClick={onBack}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Button>
        <Button size="lg" className="rounded-full px-7" onClick={onContinue} disabled={!canContinue}>
          Continue
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
