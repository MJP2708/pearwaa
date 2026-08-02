"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Emotion } from "@/data/emotions";
import { FadeIn } from "@/components/motion/fade-in";

export function FeelingReveal({
  emotion,
  onContinue,
  onChooseInstead,
}: {
  emotion: Emotion;
  onContinue: () => void;
  onChooseInstead: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <FadeIn>
        <p className="text-sm font-medium text-primary">It sounds like</p>
        <h1 className="mt-2 font-heading text-4xl font-normal text-foreground">{emotion.label}</h1>
        <p className="mx-auto mt-3 max-w-sm text-base leading-relaxed text-muted-foreground">
          {emotion.description}
        </p>

        <div className="mt-9 flex flex-col items-center gap-3">
          <Button size="lg" className="rounded-full px-7" onClick={onContinue}>
            That&rsquo;s close enough
            <ArrowRight className="size-4" aria-hidden="true" />
          </Button>
          <button
            type="button"
            onClick={onChooseInstead}
            className="rounded text-xs text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            That&rsquo;s not quite it — let me choose myself
          </button>
        </div>
      </FadeIn>
    </div>
  );
}
