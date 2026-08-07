"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Check, Copy, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PaperSurface } from "@/components/paper-surface";
import { buildWallpaperSvgFromPlacements, type FlowerPlacement } from "@/lib/export-image";
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

// The nine quiet beats of sealing a letter — fold, settle, press, close,
// wax appears, wax stamped, rest, silence, then the confirmation
// sentence. Nothing here is instant; each stage gets its own moment.
type Phase = "ready" | "folding" | "pressed" | "closed" | "waxed" | "stamped" | "resting" | "sent";

const STAGE_MS = {
  folding: 650,
  pressed: 350,
  closed: 450,
  waxed: 350,
  stamped: 400,
  resting: 500,
  silence: 550,
} as const;

const REDUCED_STAGE_MS = 260;

export function LetterSendStep({ emotion, message, senderName, placements, onBack, onRestart }: Props) {
  const { reducedMotion } = useAccessibility();
  const [phase, setPhase] = useState<Phase>("ready");
  const [linkUrl, setLinkUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { records, addRecord, removeRecord } = useSentLetters();

  // Must build from the actual saved placements (x/y/scale), not just the
  // flower ids — composeBouquetSvg recomputes a fresh generic phyllotaxis
  // layout from ids alone, which silently discarded whatever preset
  // (Heart/Circle/Letter) or manual drag arrangement the sender built.
  // buildWallpaperSvgFromPlacements is the same function the receiving
  // view uses, so what's previewed here is what actually gets sent.
  const bouquetSvg = useMemo(
    () => buildWallpaperSvgFromPlacements(placements, { width: 280, height: 280, accentHex: emotion.colorHex }),
    [placements, emotion.colorHex],
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

    const durations = reducedMotion
      ? { folding: REDUCED_STAGE_MS, pressed: REDUCED_STAGE_MS, closed: REDUCED_STAGE_MS, waxed: REDUCED_STAGE_MS, stamped: REDUCED_STAGE_MS, resting: REDUCED_STAGE_MS, silence: REDUCED_STAGE_MS }
      : STAGE_MS;

    const order: Exclude<Phase, "ready" | "sent">[] = ["folding", "pressed", "closed", "waxed", "stamped", "resting"];
    let elapsed = 0;
    for (const p of order) {
      elapsed += durations[p];
      setTimeout(() => setPhase(p), elapsed);
    }
    elapsed += durations.silence;
    setTimeout(() => {
      setLinkUrl(url);
      setPhase("sent");
    }, elapsed);

    setPhase("folding");
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

  const sealing = phase !== "ready" && phase !== "sent";
  const heading =
    phase === "sent" ? "Your flowers are on their way." : sealing ? "" : "Ready when you are";

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-sm font-medium text-primary">Send your letter</p>
      <h1 className="mt-2 min-h-[1.2em] font-heading text-3xl font-normal text-foreground sm:text-4xl">
        {heading}
      </h1>
      <p className="mt-3 min-h-[1.5em] text-base leading-relaxed text-muted-foreground">
        {phase === "sent"
          ? "A link now opens straight to your bouquet and letter — no account needed on either end."
          : sealing
            ? ""
            : "Nothing sends until you choose to. Once it's sealed, anyone with the link can open it."}
      </p>

      <div className="relative mt-8 flex min-h-[300px] items-center justify-center">
        <AnimatePresence mode="wait">
          {phase === "ready" && (
            <motion.div key="paper" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
              <PaperSurface className="w-[280px] p-5" style={{ transformOrigin: "top center" }}>
                <div className="overflow-hidden rounded-sm [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: bouquetSvg }} />
                <p className="mt-2 line-clamp-3 text-center font-heading text-sm italic text-foreground/80">{message}</p>
                <p className="mt-1 text-center text-xs text-muted-foreground">— {senderName.trim() || "a friend"}</p>
              </PaperSurface>
            </motion.div>
          )}

          {sealing && (
            <motion.div
              key="sealing"
              className="relative flex h-[220px] w-[280px] items-center justify-center"
              initial={{ opacity: reducedMotion ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.25 }}
            >
              {/* Stage 1–2: the paper folds and the bouquet settles inside it. */}
              <motion.div
                className="absolute w-[220px] overflow-hidden rounded-sm bg-[#FBF6EC] p-4 shadow-md ring-1 ring-black/5 dark:bg-[#2A2520] dark:ring-white/10"
                style={{ transformOrigin: "top center" }}
                animate={
                  reducedMotion
                    ? { opacity: phase === "folding" || phase === "pressed" ? 1 : 0 }
                    : {
                        scaleY: phase === "folding" ? 0.18 : 1,
                        opacity: phase === "folding" || phase === "pressed" ? 1 : 0,
                      }
                }
                transition={{ duration: reducedMotion ? 0.2 : 0.6, ease: [0.65, 0, 0.35, 1] }}
              >
                <motion.div
                  className="overflow-hidden rounded-sm [&>svg]:h-full [&>svg]:w-full"
                  animate={reducedMotion ? {} : { scale: phase === "pressed" ? 0.86 : 1 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  dangerouslySetInnerHTML={{ __html: bouquetSvg }}
                />
              </motion.div>

              {/* Stage 4: the envelope closes around the folded, pressed letter. */}
              <motion.div
                className="absolute h-[130px] w-[190px] overflow-hidden rounded-md shadow-lg"
                style={{ backgroundColor: emotion.colorHex, opacity: 0.16 }}
                initial={{ scaleX: reducedMotion ? 1 : 0, opacity: 0 }}
                animate={{
                  scaleX: 1,
                  opacity: phase === "closed" || phase === "waxed" || phase === "stamped" || phase === "resting" ? 1 : 0,
                  y: phase === "resting" ? 4 : 0,
                }}
                transition={{ duration: reducedMotion ? 0.2 : 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <div
                  className="absolute inset-0 bg-gradient-to-b from-black/5 to-black/10 dark:from-white/5 dark:to-white/10"
                  style={{ clipPath: "polygon(0 0, 100% 0, 50% 55%)" }}
                  aria-hidden="true"
                />
              </motion.div>

              {/* Stage 5–6: purple wax appears and is stamped — the one
                  deliberately purple moment in this whole animation. */}
              <motion.div
                className="absolute flex size-11 items-center justify-center rounded-full shadow-md"
                style={{ backgroundColor: "var(--primary)" }}
                initial={{ scale: 0, opacity: 0 }}
                animate={{
                  scale: phase === "waxed" ? 0.7 : phase === "stamped" || phase === "resting" ? 1 : 0,
                  opacity: phase === "waxed" || phase === "stamped" || phase === "resting" ? 1 : 0,
                }}
                transition={{ duration: reducedMotion ? 0.15 : 0.45, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className="font-heading text-lg text-primary-foreground" aria-hidden="true">
                  ✦
                </span>
              </motion.div>
            </motion.div>
          )}

          {phase === "sent" && (
            <motion.div
              key="sealed"
              className="flex flex-col items-center gap-3"
              initial={reducedMotion ? { opacity: 1 } : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <div
                className="flex size-14 items-center justify-center rounded-full text-primary-foreground shadow-sm"
                style={{ backgroundColor: "var(--primary)" }}
                aria-hidden="true"
              >
                <span className="font-heading text-xl">✦</span>
              </div>
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
            Seal Letter
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
