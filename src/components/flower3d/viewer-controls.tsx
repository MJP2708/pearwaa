"use client";

import { RotateCw, Sparkle, Volume2, VolumeX } from "lucide-react";
import type { EncyclopediaFlower } from "@/data/flower-encyclopedia";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const STAGES: { id: string; label: string }[] = [
  { id: "bud", label: "Bud" },
  { id: "half", label: "Half Bloom" },
  { id: "full", label: "Full Bloom" },
  { id: "wilted", label: "Wilted" },
];

type Props = {
  flower: EncyclopediaFlower;
  colorId: string;
  onSelectColor: (id: string) => void;
  bloomStage: string;
  onSelectStage: (id: string) => void;
  autoSpin: boolean;
  onToggleAutoSpin: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
  particlesOn: boolean;
  onToggleParticles: () => void;
};

export function ViewerControls({
  flower,
  colorId,
  onSelectColor,
  bloomStage,
  onSelectStage,
  autoSpin,
  onToggleAutoSpin,
  soundOn,
  onToggleSound,
  particlesOn,
  onToggleParticles,
}: Props) {
  const stages = flower.model.hasWiltedStage ? STAGES : STAGES.filter((s) => s.id !== "wilted");

  return (
    <div className="mt-4 space-y-4">
      {flower.colors.length > 1 && (
        <div>
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Color</p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={`${flower.commonName} color`}>
            {flower.colors.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectColor(c.id)}
                aria-pressed={c.id === colorId}
                aria-label={c.label}
                title={c.label}
                className={cn(
                  "size-8 rounded-full border-2 transition-transform focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  c.id === colorId ? "scale-110 border-primary" : "border-border/70 hover:scale-105",
                )}
                style={{ backgroundColor: c.hex }}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Bloom stage</p>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Bloom stage">
          {stages.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelectStage(s.id)}
              aria-pressed={s.id === bloomStage}
              className={cn(
                "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                s.id === bloomStage
                  ? "border-primary bg-accent text-accent-foreground"
                  : "border-border/70 text-muted-foreground hover:bg-secondary",
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="rounded-full" onClick={onToggleAutoSpin} aria-pressed={autoSpin}>
          <RotateCw className="size-3.5" aria-hidden="true" />
          {autoSpin ? "Spinning" : "Auto-spin"}
        </Button>
        <Button variant="outline" size="sm" className="rounded-full" onClick={onToggleParticles} aria-pressed={particlesOn}>
          <Sparkle className="size-3.5" aria-hidden="true" />
          {particlesOn ? "Motes on" : "Motes off"}
        </Button>
        <Button variant="outline" size="sm" className="rounded-full" onClick={onToggleSound} aria-pressed={soundOn}>
          {soundOn ? <Volume2 className="size-3.5" aria-hidden="true" /> : <VolumeX className="size-3.5" aria-hidden="true" />}
          {soundOn ? "Sound on" : "Sound off"}
        </Button>
      </div>
    </div>
  );
}
