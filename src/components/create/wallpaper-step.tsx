"use client";

import { useState } from "react";
import { ArrowLeft, Download, RotateCcw, SendToBack, BringToFront } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  buildWallpaperSvgFromPlacements,
  svgToPngBlob,
  downloadBlob,
  WALLPAPER_SIZES,
  type FlowerPlacement,
} from "@/lib/export-image";
import { FlowerLayoutCanvas } from "@/components/create/flower-layout-canvas";
import { Mascot } from "@/components/mascot";
import type { Emotion } from "@/data/emotions";
import { cn } from "@/lib/utils";

type Props = {
  emotion: Emotion;
  label: string;
  /** The layout built in the Bouquet Builder — inherited as a starting
   * point here, not re-clustered. Edits made below are this step's own
   * downstream copy and never write back to the bouquet's saved layout. */
  bouquetPlacements: FlowerPlacement[];
  onBack: () => void;
  onRestart: () => void;
};

export function WallpaperStep({ emotion, label, bouquetPlacements, onBack, onRestart }: Props) {
  const [sizeId, setSizeId] = useState(WALLPAPER_SIZES[0].id);
  const [includeLabel, setIncludeLabel] = useState(true);
  const [placements, setPlacements] = useState<FlowerPlacement[]>(() => bouquetPlacements.map((p) => ({ ...p })));
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const size = WALLPAPER_SIZES.find((s) => s.id === sizeId) ?? WALLPAPER_SIZES[0];

  function bringToFront() {
    if (!selectedKey) return;
    setPlacements((prev) => {
      const item = prev.find((p) => p.key === selectedKey);
      if (!item) return prev;
      return [...prev.filter((p) => p.key !== selectedKey), item];
    });
  }

  function sendToBack() {
    if (!selectedKey) return;
    setPlacements((prev) => {
      const item = prev.find((p) => p.key === selectedKey);
      if (!item) return prev;
      return [item, ...prev.filter((p) => p.key !== selectedKey)];
    });
  }

  function resetArrangement() {
    setPlacements(bouquetPlacements.map((p) => ({ ...p })));
    setSelectedKey(null);
  }

  async function handleDownload() {
    setIsExporting(true);
    setError(null);
    try {
      const svg = buildWallpaperSvgFromPlacements(placements, {
        width: size.width,
        height: size.height,
        accentHex: emotion.colorHex,
        label: includeLabel ? label.toLowerCase() : undefined,
      });
      const blob = await svgToPngBlob(svg, size.width, size.height);
      downloadBlob(blob, `pearwaa-wallpaper-${size.id}.png`);
    } catch {
      setError("Something went wrong generating your wallpaper. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-sm font-medium text-primary">Step 3 of 3</p>
      <h1 className="mt-2 font-heading text-3xl font-normal text-foreground sm:text-4xl">Take it with you</h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        This is the bouquet you built, ready as a wallpaper. Nudge anything further before you
        save it — choose a size first.
      </p>

      <div className="mt-7 flex flex-wrap gap-2" role="group" aria-label="Wallpaper size">
        {WALLPAPER_SIZES.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={s.id === sizeId}
            onClick={() => setSizeId(s.id)}
            className={cn(
              "rounded-full border px-4 py-2 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              s.id === sizeId
                ? "border-primary bg-accent text-accent-foreground"
                : "border-border/70 text-muted-foreground hover:bg-secondary",
            )}
          >
            {s.label}
          </button>
        ))}
      </div>

      <label className="mt-4 flex w-fit items-center gap-2 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={includeLabel}
          onChange={(e) => setIncludeLabel(e.target.checked)}
          className="size-4 rounded border-border accent-primary"
        />
        Include the word &ldquo;{label.toLowerCase()}&rdquo;
      </label>

      <div className="mx-auto mt-6" style={{ maxWidth: size.width >= size.height ? 480 : 280 }}>
        <FlowerLayoutCanvas
          placements={placements}
          onChangePlacements={setPlacements}
          selectedKey={selectedKey}
          onSelectKey={setSelectedKey}
          accentHex={emotion.colorHex}
          aspectRatio={`${size.width} / ${size.height}`}
          label={includeLabel ? label.toLowerCase() : undefined}
        />
      </div>

      <div className="mx-auto mt-3 flex flex-wrap items-center justify-center gap-2" style={{ maxWidth: size.width >= size.height ? 480 : 280 }}>
        <Button variant="outline" size="sm" className="rounded-full" onClick={bringToFront} disabled={!selectedKey}>
          <BringToFront className="size-3.5" aria-hidden="true" />
          Bring to front
        </Button>
        <Button variant="outline" size="sm" className="rounded-full" onClick={sendToBack} disabled={!selectedKey}>
          <SendToBack className="size-3.5" aria-hidden="true" />
          Send to back
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground" onClick={resetArrangement}>
          Reset to bouquet layout
        </Button>
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Tap a flower to select it, then drag — or use arrow keys once it&rsquo;s focused.
      </p>

      {error && (
        <p role="alert" className="mt-3 text-center text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-9 flex flex-wrap justify-between gap-3">
        <Button variant="ghost" size="lg" className="rounded-full px-6" onClick={onBack}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Button>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" className="rounded-full px-6" onClick={onRestart}>
            <RotateCcw className="size-4" aria-hidden="true" />
            Start over
          </Button>
          <Button size="lg" className="rounded-full px-7" onClick={handleDownload} disabled={isExporting}>
            {isExporting ? (
              <Mascot size={18} mood="sleepy" className="animate-pulse" />
            ) : (
              <Download className="size-4" aria-hidden="true" />
            )}
            {isExporting ? "Preparing…" : "Download"}
          </Button>
        </div>
      </div>
    </div>
  );
}
