"use client";

import { useMemo, useState } from "react";
import { ArrowLeft, Check, Copy, Download, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildShareCardSvg, svgToPngBlob, downloadBlob, SHARE_CARD_SIZE, type FlowerPlacement } from "@/lib/export-image";
import { encodeFlowerLetter, buildLetterUrl, type FlowerLetterPayload } from "@/lib/flower-letter-codec";
import { useSentLetters } from "@/lib/use-sent-letters";
import type { Emotion } from "@/data/emotions";

type Props = {
  emotion: Emotion;
  message: string;
  senderName: string;
  placements: FlowerPlacement[];
  onBack: () => void;
  onRestart: () => void;
};

export function SendLetterStep({ emotion, message, senderName, placements, onBack, onRestart }: Props) {
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

  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isExportingImage, setIsExportingImage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { records, addRecord, removeRecord } = useSentLetters();

  function handleCreateLink() {
    const payload: FlowerLetterPayload = {
      v: 1,
      emotionLabel: emotion.label,
      emotionColorHex: emotion.colorHex,
      message,
      senderName: senderName.trim(),
      flowers: placements.map((p) => ({ flowerId: p.flowerId, x: p.x, y: p.y, scale: p.scale })),
      createdAt: Date.now(),
    };
    const encoded = encodeFlowerLetter(payload);
    const url = buildLetterUrl(encoded);
    setLinkUrl(url);
    addRecord({
      id: `${Date.now()}`,
      url,
      emotionLabel: emotion.label,
      messagePreview: message.slice(0, 60),
      createdAt: Date.now(),
    });
  }

  async function handleCopyLink(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      setError("Couldn't copy automatically — you can select and copy the link text.");
    }
  }

  async function handleDownloadImage() {
    setIsExportingImage(true);
    setError(null);
    try {
      const blob = await svgToPngBlob(previewSvg, SHARE_CARD_SIZE.width, SHARE_CARD_SIZE.height);
      downloadBlob(blob, "pearwaa-flower-letter.png");
    } catch {
      setError("Something went wrong generating the image. Please try again.");
    } finally {
      setIsExportingImage(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm font-medium text-primary">Step 5 of 5</p>
      <h1 className="mt-2 font-heading text-3xl font-normal text-foreground sm:text-4xl">Ready to send</h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        Create a link that opens straight to your bouquet and letter — no account needed on
        either end. Or save it as an image, if that&rsquo;s easier to send.
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
        {!linkUrl ? (
          <Button size="lg" className="rounded-full px-7" onClick={handleCreateLink}>
            Create a link to send
          </Button>
        ) : (
          <div className="w-full rounded-2xl border border-border/70 bg-secondary/40 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Your link</p>
            <div className="mt-2 flex items-center gap-2">
              <input
                readOnly
                value={linkUrl}
                onFocus={(e) => e.currentTarget.select()}
                aria-label="Your Flower Letter link"
                className="flex-1 truncate rounded-full border border-border/70 bg-background px-4 py-2 text-xs text-foreground"
              />
              <Button size="sm" className="shrink-0 rounded-full" onClick={() => handleCopyLink(linkUrl)}>
                {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Anyone with this link can open it, and there&rsquo;s no way to lock it after it&rsquo;s
              sent — share it only where you mean to.
            </p>
          </div>
        )}

        <Button variant="outline" size="sm" className="rounded-full" onClick={handleDownloadImage} disabled={isExportingImage}>
          <Download className="size-3.5" aria-hidden="true" />
          {isExportingImage ? "Preparing…" : "Download as an image instead"}
        </Button>
      </div>

      {records.length > 0 && (
        <div className="mt-10 border-t border-border/70 pt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Sent from this device</p>
          <ul className="mt-3 space-y-2">
            {records.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-border/60 px-3.5 py-2.5 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate text-foreground">
                    {r.emotionLabel || "A letter"}
                    {r.messagePreview ? ` — ${r.messagePreview}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <Button variant="ghost" size="icon-sm" aria-label="Copy this link again" onClick={() => handleCopyLink(r.url)}>
                    <Copy className="size-3.5" aria-hidden="true" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Remove from my history"
                    onClick={() => removeRecord(r.id)}
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">
            This only clears your own list — it doesn&rsquo;t undo a link once you&rsquo;ve shared it.
          </p>
        </div>
      )}

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
