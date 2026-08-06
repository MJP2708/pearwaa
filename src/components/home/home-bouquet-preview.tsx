"use client";

import { motion } from "framer-motion";
import { getFlower } from "@/data/flowers";
import { FlowerGlyphIcon } from "@/components/flower-glyph-icon";

/**
 * A small, deliberately-composed arrangement — not the bouquet-builder's
 * phyllotaxis auto-cluster (which is tuned for "fit N flowers without
 * overlapping," not "look considered"). One anchor flower carries the
 * composition; the rest are smaller supporting notes placed with real
 * breathing room around it, editorial-illustration style rather than a
 * dense pile.
 */
const ARRANGEMENT: { id: string; x: number; y: number; scale: number; z: number }[] = [
  { id: "peony", x: 56, y: 48, scale: 1.3, z: 3 },
  { id: "lavender", x: 21, y: 30, scale: 0.72, z: 1 },
  { id: "wisteria", x: 80, y: 26, scale: 0.66, z: 1 },
  { id: "forget-me-not", x: 24, y: 74, scale: 0.5, z: 2 },
  { id: "daffodil", x: 74, y: 78, scale: 0.58, z: 2 },
];

export function HomeBouquetPreview() {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-sm overflow-hidden rounded-[2.5rem] bg-gradient-to-b from-accent/40 to-secondary/30">
      {/* Soft, out-of-focus glow shapes — support the composition instead
          of competing with it, so the negative space still reads as calm. */}
      <div className="pointer-events-none absolute -left-10 top-6 size-40 rounded-full bg-primary/20 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-8 bottom-10 size-48 rounded-full bg-accent/50 blur-3xl" aria-hidden="true" />
      <div className="pointer-events-none absolute left-1/3 top-1/2 size-32 -translate-y-1/2 rounded-full bg-secondary/60 blur-3xl" aria-hidden="true" />

      <motion.div
        className="absolute inset-0"
        animate={{ scale: [1, 1.012, 1] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      >
        {ARRANGEMENT.map((item) => {
          const flower = getFlower(item.id);
          if (!flower) return null;
          return (
            <div
              key={item.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 drop-shadow-sm"
              style={{ left: `${item.x}%`, top: `${item.y}%`, zIndex: item.z }}
            >
              <FlowerGlyphIcon flower={flower} size={Math.round(220 * item.scale)} />
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
