"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { decodeFlowerLetter } from "@/lib/flower-letter-codec";
import { buildWallpaperSvgFromPlacements, type FlowerPlacement } from "@/lib/export-image";
import { lightenHex } from "@/lib/color";

const revealEase = [0.22, 1, 0.36, 1] as const;

export function LetterClient() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get("d");
  const [opened, setOpened] = useState(false);

  const payload = useMemo(() => (encoded ? decodeFlowerLetter(encoded) : null), [encoded]);

  if (!payload) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-center">
        <p className="font-heading text-2xl text-foreground">This link doesn&rsquo;t seem to work.</p>
        <p className="max-w-sm text-sm text-muted-foreground">
          It may be incomplete, or something got lost along the way.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-full bg-primary px-6 py-2.5 text-sm text-primary-foreground hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Go to Pearwaa
        </Link>
      </div>
    );
  }

  const placements: FlowerPlacement[] = payload.flowers.map((f, i) => ({
    key: `${f.flowerId}-${i}`,
    flowerId: f.flowerId,
    x: f.x,
    y: f.y,
    scale: f.scale,
  }));

  const bouquetSvg = buildWallpaperSvgFromPlacements(placements, {
    width: 900,
    height: 900,
    accentHex: payload.emotionColorHex,
  });

  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-5 py-14"
      style={{
        background: `linear-gradient(180deg, ${lightenHex(payload.emotionColorHex, 0.88)}, ${lightenHex(payload.emotionColorHex, 0.96)})`,
      }}
    >
      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.div
            key="envelope"
            className="flex w-full max-w-sm flex-col items-center"
            exit={{ opacity: 0, scale: 0.94 }}
            transition={{ duration: 0.35 }}
          >
            <button
              type="button"
              onClick={() => setOpened(true)}
              aria-label="Open your flower letter"
              className="group relative aspect-[4/3] w-full max-w-xs rounded-2xl shadow-md outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              style={{ backgroundColor: lightenHex(payload.emotionColorHex, 0.75) }}
            >
              <span
                className="absolute inset-x-0 top-0 h-1/2 origin-top transition-transform duration-300 group-hover:-translate-y-0.5"
                style={{
                  backgroundColor: lightenHex(payload.emotionColorHex, 0.55),
                  clipPath: "polygon(0 0, 100% 0, 50% 100%)",
                }}
                aria-hidden="true"
              />
              <span
                className="absolute inset-x-0 bottom-0 flex h-2/3 items-end justify-center pb-5"
                aria-hidden="true"
              >
                <span
                  className="flex size-11 items-center justify-center rounded-full font-heading text-lg text-primary-foreground shadow-sm"
                  style={{ backgroundColor: payload.emotionColorHex }}
                >
                  P
                </span>
              </span>
            </button>
            <p className="mt-6 font-heading text-lg text-foreground/85">A flower letter has arrived</p>
            <p className="mt-1 text-sm text-muted-foreground">Tap the envelope to open it.</p>
          </motion.div>
        ) : (
          <motion.div key="contents" className="w-full max-w-md">
            {/* Bouquet opens first — a blooming scale-and-fade rather than a
                flat reveal — then the letter's contents settle in after it,
                each a beat behind the last (the same staggered-reveal feel
                as a flower's Bloom Story). */}
            <motion.div
              className="mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[2rem] [&>svg]:h-full [&>svg]:w-full"
              initial={{ opacity: 0, scale: 0.86 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: revealEase }}
              dangerouslySetInnerHTML={{ __html: bouquetSvg }}
            />

            {payload.message && (
              <motion.div
                className="mt-6 rounded-3xl bg-card/90 p-6 shadow-sm"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: revealEase }}
              >
                <p className="whitespace-pre-wrap font-heading text-lg leading-relaxed text-foreground">
                  {payload.message}
                </p>
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: payload.message ? 0.48 : 0.3, ease: revealEase }}
            >
              <p className="mt-6 text-center font-heading text-base text-foreground/80">
                From {payload.senderName?.trim() || "a friend"}
              </p>
              <p className="mt-1 text-center text-xs text-muted-foreground">
                Sent {new Date(payload.createdAt).toLocaleDateString()} · via{" "}
                <Link
                  href="/"
                  className="underline decoration-dotted underline-offset-4 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                >
                  Pearwaa
                </Link>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
