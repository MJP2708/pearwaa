"use client";

import { useMemo } from "react";
import type { Flower } from "@/data/flowers";
import { composeFlowerIconSvg } from "@/lib/flower-glyph";
import { cn } from "@/lib/utils";

export function FlowerGlyphIcon({
  flower,
  size = 64,
  className,
}: {
  flower: Flower;
  size?: number;
  className?: string;
}) {
  const svg = useMemo(() => composeFlowerIconSvg(flower, { size }), [flower, size]);
  return (
    <div
      className={cn("shrink-0", className)}
      style={{ width: size, height: size }}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
