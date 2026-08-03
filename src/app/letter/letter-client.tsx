  "use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import Link from "next/link";
import { decodeFlowerLetter } from "@/lib/flower-letter-codec";
import { buildWallpaperSvgFromPlacements, type FlowerPlacement } from "@/lib/export-image";
import { lightenHex } from "@/lib/color";
import { FadeIn } from "@/components/motion/fade-in";

export function LetterClient() {
  const searchParams = useSearchParams();
  const encoded = searchParams.get("d");

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
      <FadeIn className="w-full max-w-md">
        <div
          className="mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[2rem] [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: bouquetSvg }}
        />

        {payload.message && (
          <div className="mt-6 rounded-3xl bg-card/90 p-6 shadow-sm">
            <p className="whitespace-pre-wrap font-heading text-lg leading-relaxed text-foreground">
              {payload.message}
            </p>
          </div>
        )}

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
      </FadeIn>
    </div>
  );
}
