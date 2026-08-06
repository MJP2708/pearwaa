"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Copy, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FlowerPlacement } from "@/lib/export-image";
import { composeBouquetSvg } from "@/lib/bouquet-svg";
import { encodeFlowerLetter, buildLetterUrl, type FlowerLetterPayload } from "@/lib/flower-letter-codec";
import { useSentLetters } from "@/lib/use-sent-letters";
import { useAccessibility } from "@/components/providers/accessibility-provider";
import type { Emotion } from "@/data/emotions";

type Props = {
  emotion: Emotion;
  message: string;
  senderName: string;
  placements: FlowerPlacement[];
  onBack: () => void;
  onRestart: () => void;
};

type Phase = "ready" | "sealing" | "sent";

/**
 * The ceremonial send moment: the letter folds closed and takes a wax
 * seal before the shareable link appears — a beat of "this is being sent"
 * rather than the link just materializing under a button.
 */
export function LetterSendStep({ emotion, message, senderName, placements, onBack, onRestart }: Props) {
  const { reducedMotion } = useAccessibility();
  const [phase, setPhase] = useState<Phase>("ready");
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { records, addRecord, removeRecord } = useSentLetters();

  const flowerIds = useMemo(() => placements.map((p) => p.flowerId), [placements]);
  const bouquetSvg = useMemo(
    () => composeBouquetSvg(flowerIds, { size: 280, interactive: false }),
    [flowerIds],
  );

  function handleSeal() {
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
    addRecord({
      id: `${Date.now()}`,
      url,
      emotionLabel: emotion.label,
      messagePreview: message.slice(0, 60),
      createdAt: Date.now(),
    });

    if (reducedMotion) {
      setLinkUrl(url);
      setPhase("sent");
      return;
    }

    setPhase("sealing");
    setTimeout(() => {
      setLinkUrl(url);
      setPhase("sent");
    }, 1100);
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

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-sm font-medium text-primary">Send your letter</p>
      <h1 className="mt-2 font-heading text-3xl font-normal text-foreground sm:text-4xl">
        {phase === "sent" ? "Sealed and ready" : "Ready when you are"}
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        {phase === "sent"
          ? "A link now opens straight to your bouquet and letter — no account needed on either end."
          : "Nothing sends until you choose to. Once it's sealed, anyone with the link can open it."}
      </p>

      <div className="relative mt-8 flex min-h-[280px] items-center justify-center">
        <AnimatePresence mode="wait">
          {phase !== "sent" ? (
            <motion.div
              key="paper"
              className="w-full max-w-[300px] overflow-hidden rounded-sm bg-[#FBF6EC] p-5 shadow-md ring-1 ring-black/5 dark:bg-[#2A2520] dark:ring-white/10"
              style={{ transformOrigin: "top center" }}
              animate={
                phase === "sealing" && !reducedMotion
                  ? { scaleY: [1, 1, 0.06], rotateX: [0, 0, 55], opacity: [1, 1, 0.9] }
                  : { scaleY: 1, rotateX: 0, opacity: 1 }
              }
              transition={{ duration: 0.9, times: [0, 0.35, 1], ease: [0.65, 0, 0.35, 1] }}
              exit={{ opacity: 0 }}
            >
              <div className="overflow-hidden rounded-sm [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: bouquetSvg }} />
              <p className="mt-2 line-clamp-3 text-center font-heading text-sm italic text-foreground/80">{message}</p>
              <p className="mt-1 text-center text-xs text-muted-foreground">— {senderName.trim() || "a friend"}</p>
            </motion.div>
          ) : (
            <motion.div
              key="sealed"
              className="flex flex-col items-center gap-2"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="flex size-16 items-center justify-center rounded-full text-primary-foreground shadow-sm"
                style={{ backgroundColor: emotion.colorHex }}
                aria-hidden="true"
              >
                <span className="font-heading text-2xl">P</span>
              </div>
              <p className="text-xs text-muted-foreground">Sealed with a flower</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p role="alert" className="mt-3 text-center text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col items-center gap-3">
        {phase === "ready" && (
          <Button size="lg" className="rounded-full px-7" onClick={handleSeal}>
            Seal and send
          </Button>
        )}

        {phase === "sent" && linkUrl && (
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
      </div>

      {records.length > 0 && phase === "sent" && (
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
                  <Button variant="ghost" size="icon-sm" aria-label="Remove from my history" onClick={() => removeRecord(r.id)}>
                    <Trash2 className="size-3.5" aria-hidden="true" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-9 flex flex-wrap justify-between gap-3">
        <Button variant="ghost" size="lg" className="rounded-full px-6" onClick={onBack} disabled={phase !== "ready"}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Button>
        <Button variant="outline" size="lg" className="rounded-full px-6" onClick={onRestart}>
          <RotateCcw className="size-4" aria-hidden="true" />
          Write another
        </Button>
      </div>
    </div>
  );
}
