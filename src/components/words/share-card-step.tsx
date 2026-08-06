"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildShareCardSvg, svgToPngBlob, downloadBlob, SHARE_CARD_SIZE, type FlowerPlacement } from "@/lib/export-image";
import type { Emotion } from "@/data/emotions";

type Props = {
  emotion: Emotion;
  message: string;
  senderName: string;
  placements: FlowerPlacement[];
  onBack: () => void;
  onRestart: () => void;
};

/**
 * Words Are Hard ends here — a simple downloadable image, not a shareable
 * Flower Letter link. That fuller, more ceremonial send flow lives at
 * /letters now, for someone who already knows what they want to say.
 */
export function ShareCardStep({ emotion, message, senderName, placements, onBack, onRestart }: Props) {
  const flowerIds = useMemo(() => placements.map((p) => p.flowerId), [placements]);
  const previewSvg = useMemo(
    () =>
      buildShareCardSvg(flowerIds, message, {
        width: SHARE_CARD_SIZE.width,
        height: SHARE_CARD_SIZE.height,
        accentHex: emotion.colorHex,
      }),
    [flowerIds, message, emotion.colorHex],
  );

  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setIsExporting(true);
    setError(null);
    try {
      const blob = await svgToPngBlob(previewSvg, SHARE_CARD_SIZE.width, SHARE_CARD_SIZE.height);
      downloadBlob(blob, "pearwaa-bouquet.png");
    } catch {
      setError("Something went wrong generating the image. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm font-medium text-primary">Step 5 of 5</p>
      <h1 className="mt-2 font-heading text-3xl font-normal text-foreground sm:text-4xl">Here&rsquo;s what you made</h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        Save it and send it however feels right — a text, a photo, whatever&rsquo;s easiest. No
        link, no account, nothing to manage after this.
      </p>

      <div
        className="mx-auto mt-7 overflow-hidden rounded-3xl border border-border/70 bg-card [&>svg]:h-full [&>svg]:w-full"
        style={{ maxWidth: 300, aspectRatio: `${SHARE_CARD_SIZE.width} / ${SHARE_CARD_SIZE.height}` }}
        dangerouslySetInnerHTML={{ __html: previewSvg }}
      />
      <p className="mt-2 text-center text-xs text-muted-foreground">
        Signed: {senderName.trim() || "a friend"}
      </p>

      {error && (
        <p role="alert" className="mt-3 text-center text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-7 flex flex-col items-center gap-3">
        <Button size="lg" className="rounded-full px-7" onClick={handleDownload} disabled={isExporting}>
          <Download className="size-4" aria-hidden="true" />
          {isExporting ? "Preparing…" : "Download image"}
        </Button>
        <p className="max-w-sm text-center text-xs text-muted-foreground">
          Want to send an actual link instead — something they can open straight to the bouquet
          and a longer letter?{" "}
          <a href="/letters" className="underline decoration-dotted underline-offset-4 hover:text-foreground">
            Try Create a Letter
          </a>
          .
        </p>
      </div>

      <div className="mt-9 flex flex-wrap justify-between gap-3">
        <Button variant="ghost" size="lg" className="rounded-full px-6" onClick={onBack}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Button>
        <Button variant="outline" size="lg" className="rounded-full px-6" onClick={onRestart}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Start over
        </Button>
      </div>
    </div>
  );
}
