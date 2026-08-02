"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Download, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildShareCardSvg, svgToPngBlob, downloadBlob, SHARE_CARD_SIZE } from "@/lib/export-image";
import { Mascot } from "@/components/mascot";
import type { Emotion } from "@/data/emotions";

type Props = {
  emotion: Emotion;
  flowerIds: string[];
  message: string;
  onBack: () => void;
  onRestart: () => void;
};

export function ShareCardStep({ emotion, flowerIds, message, onBack, onRestart }: Props) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const previewSvg = useMemo(
    () =>
      buildShareCardSvg(flowerIds, message, {
        width: SHARE_CARD_SIZE.width,
        height: SHARE_CARD_SIZE.height,
        accentHex: emotion.colorHex,
      }),
    [flowerIds, message, emotion.colorHex],
  );

  async function handleDownload() {
    setIsExporting(true);
    setError(null);
    try {
      const blob = await svgToPngBlob(previewSvg, SHARE_CARD_SIZE.width, SHARE_CARD_SIZE.height);
      downloadBlob(blob, "pearwaa-share-card.png");
    } catch {
      setError("Something went wrong generating your card. Please try again.");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm font-medium text-primary">Step 5 of 5</p>
      <h1 className="mt-2 font-heading text-3xl font-normal text-foreground sm:text-4xl">Ready to send</h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        Save this and send it however feels right — text, email, however you&rsquo;d reach them.
      </p>

      <div
        className="mx-auto mt-7 overflow-hidden rounded-3xl border border-border/70 bg-card [&>svg]:h-full [&>svg]:w-full"
        style={{ maxWidth: 300, aspectRatio: `${SHARE_CARD_SIZE.width} / ${SHARE_CARD_SIZE.height}` }}
        dangerouslySetInnerHTML={{ __html: previewSvg }}
      />

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
