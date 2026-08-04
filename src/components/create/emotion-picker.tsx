"use client";

import { useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { emotions, matchEmotionFromText, type Emotion } from "@/data/emotions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Props = {
  onContinue: (result: { emotion: Emotion; label: string }) => void;
  stepLabel?: string;
};

export function EmotionPicker({ onContinue, stepLabel = "Step 1 of 3" }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");

  const matched = useMemo(
    () => (customText.trim() ? matchEmotionFromText(customText) : undefined),
    [customText],
  );

  const canContinue = Boolean(selectedId) || customText.trim().length > 1;

  function handleContinue() {
    if (selectedId) {
      const emotion = emotions.find((e) => e.id === selectedId);
      if (emotion) onContinue({ emotion, label: emotion.label });
      return;
    }
    const label = customText.trim();
    // Falls back through "calm" to the first available emotion rather than
    // asserting "calm" always exists — a future rename/removal of that
    // entry degrades gracefully instead of crashing this step.
    const emotion = matched ?? emotions.find((e) => e.id === "calm") ?? emotions[0];
    if (!emotion) return;
    onContinue({ emotion, label });
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm font-medium text-primary">{stepLabel}</p>
      <h1 className="mt-2 font-heading text-3xl font-normal text-foreground sm:text-4xl">
        How are you, really?
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        No wrong answer here. Pick whatever feels closest, or put it in your own words.
      </p>

      <div role="group" aria-label="Choose a feeling" className="mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {emotions.map((emotion) => {
          const active = selectedId === emotion.id;
          return (
            <button
              key={emotion.id}
              type="button"
              aria-pressed={active}
              onClick={() => {
                setSelectedId(emotion.id);
                setCustomText("");
              }}
              className={cn(
                "flex flex-col items-start gap-1 rounded-2xl border px-4 py-3.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                active
                  ? "border-primary bg-accent"
                  : "border-border/70 bg-card hover:border-primary/40 hover:bg-accent/30",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: emotion.colorHex }} />
                {emotion.label}
              </span>
              <span className="text-xs leading-snug text-muted-foreground">{emotion.description}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
        or name it yourself
        <span aria-hidden="true" className="h-px flex-1 bg-border" />
      </div>

      <Input
        value={customText}
        onChange={(e) => {
          setCustomText(e.target.value);
          setSelectedId(null);
        }}
        placeholder="I feel..."
        aria-label="Describe how you feel in your own words"
        className="mt-4 h-12 rounded-full px-5 text-base"
        maxLength={80}
      />

      <div className="mt-9 flex justify-end">
        <Button size="lg" className="rounded-full px-7" disabled={!canContinue} onClick={handleContinue}>
          Continue
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
