"use client";

import { useMemo, type KeyboardEvent, type MouseEvent } from "react";
import { composeBouquetSvg } from "@/lib/bouquet-svg";
import { Mascot } from "@/components/mascot";
import { cn } from "@/lib/utils";

type Props = {
  flowerIds: string[];
  onFlowerActivate?: (flowerId: string) => void;
  className?: string;
  emptyHint?: string;
};

export function BouquetCanvas({ flowerIds, onFlowerActivate, className, emptyHint }: Props) {
  const svg = useMemo(
    () => composeBouquetSvg(flowerIds, { size: 640, interactive: Boolean(onFlowerActivate) }),
    [flowerIds, onFlowerActivate],
  );

  function activateFromEvent(e: MouseEvent | KeyboardEvent) {
    if (!onFlowerActivate) return;
    const target = e.target as HTMLElement;
    const el = target.closest("[data-flower-id]");
    const id = el?.getAttribute("data-flower-id");
    if (id) onFlowerActivate(id);
  }

  if (flowerIds.length === 0) {
    return (
      <div
        className={cn(
          "mx-auto flex aspect-square w-full max-w-md flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-secondary/40 p-8 text-center",
          className,
        )}
      >
        <Mascot size={56} mood="sleepy" className="opacity-80" />
        <p className="max-w-[26ch] text-sm text-muted-foreground">
          {emptyHint ?? "Your bouquet is waiting. Choose a flower to begin."}
        </p>
      </div>
    );
  }

  return (
    <div
      className={cn("mx-auto aspect-square w-full max-w-md", className)}
      role={onFlowerActivate ? "group" : undefined}
      aria-label={onFlowerActivate ? "Your bouquet. Select a flower to read its bloom story." : "Your bouquet"}
      onClick={activateFromEvent}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          activateFromEvent(e);
        }
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
