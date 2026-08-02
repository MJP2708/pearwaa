"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildWallpaperSvg, svgToPngBlob, downloadBlob, WALLPAPER_SIZES } from "@/lib/export-image";
import type { Emotion } from "@/data/emotions";
import { cn } from "@/lib/utils";

type Props = {
  emotion: Emotion;
  label: string;
  flowerIds: string[];
  onBack: () => void;
  onRestart: () => void;
};

export function WallpaperStep({ emotion, label, flowerIds, onBack, onRestart }: Props) {
  const [sizeId, setSizeId] = useState(WALLPAPER_SIZES[0].id);
  const [includeLabel, setIncludeLabel] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const size = WALLPAPER_SIZES.find((s) => s.id === sizeId) ?? WALLPAPER_SIZES[0];

  const previewSvg = useMemo(
    () =>
      buildWallpaperSvg(flowerIds, {
        width: size.width,
        height: size.height,
        accentHex: emotion.colorHex,
        label: includeLabel ? label.toLowerCase() : undefined,
      }),
    [flowerIds, size, emotion.colorHex, includeLabel, label],
  );

  async function handleDownload() {
    setIsExporting(true);
    setError(null);
    try {
      const blob = await svgToPngBlob(previewSvg, size.width, size.height);
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
        Your bouquet, ready as a wallpaper. Choose a size that fits your screen.
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

      <div
        className="mx-auto mt-6 overflow-hidden rounded-3xl border border-border/70 bg-card [&>svg]:h-full [&>svg]:w-full"
        style={{ maxWidth: size.width >= size.height ? 480 : 280, aspectRatio: `${size.width} / ${size.height}` }}
        dangerouslySetInnerHTML={{ __html: previewSvg }}
      />

      {error && (
        <p role="alert" className="mt-3 text-sm text-destructive">
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
            <Download className="size-4" aria-hidden="true" />
            {isExporting ? "Preparing…" : "Download"}
          </Button>
        </div>
      </div>
    </div>
  );
}
