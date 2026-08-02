"use client";

import { useRef, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { flowers as allFlowers } from "@/data/flowers";
import { FlowerGlyphIcon } from "@/components/flower-glyph-icon";
import { lightenHex } from "@/lib/color";
import type { FlowerPlacement } from "@/lib/export-image";
import { cn } from "@/lib/utils";

const CLAMP_MIN = 6;
const CLAMP_MAX = 94;
const NUDGE = 2;
const NUDGE_LARGE = 6;

type DragState = { key: string; startX: number; startY: number; originX: number; originY: number; moved: boolean };

type Props = {
  placements: FlowerPlacement[];
  onChangePlacements: (next: FlowerPlacement[]) => void;
  selectedKey: string | null;
  onSelectKey: (key: string | null) => void;
  accentHex: string;
  aspectRatio: string;
  label?: string;
};

function clamp(v: number) {
  return Math.min(CLAMP_MAX, Math.max(CLAMP_MIN, v));
}

export function WallpaperCanvasEditor({
  placements,
  onChangePlacements,
  selectedKey,
  onSelectKey,
  accentHex,
  aspectRatio,
  label,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  function updatePlacement(key: string, x: number, y: number) {
    onChangePlacements(placements.map((p) => (p.key === key ? { ...p, x: clamp(x), y: clamp(y) } : p)));
  }

  function handlePointerDown(e: ReactPointerEvent<HTMLButtonElement>, placement: FlowerPlacement) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      key: placement.key,
      startX: e.clientX,
      startY: e.clientY,
      originX: placement.x,
      originY: placement.y,
      moved: false,
    };
    onSelectKey(placement.key);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!drag || !rect) return;
    const dxPct = ((e.clientX - drag.startX) / rect.width) * 100;
    const dyPct = ((e.clientY - drag.startY) / rect.height) * 100;
    if (Math.abs(dxPct) > 0.4 || Math.abs(dyPct) > 0.4) drag.moved = true;
    updatePlacement(drag.key, drag.originX + dxPct, drag.originY + dyPct);
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, placement: FlowerPlacement) {
    const step = e.shiftKey ? NUDGE_LARGE : NUDGE;
    let { x, y } = placement;
    let handled = true;
    if (e.key === "ArrowLeft") x -= step;
    else if (e.key === "ArrowRight") x += step;
    else if (e.key === "ArrowUp") y -= step;
    else if (e.key === "ArrowDown") y += step;
    else if (e.key === "Enter" || e.key === " ") onSelectKey(placement.key);
    else handled = false;
    if (handled) {
      e.preventDefault();
      updatePlacement(placement.key, x, y);
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full touch-none overflow-hidden rounded-3xl border border-border/70"
      style={{
        aspectRatio,
        background: `radial-gradient(circle at 50% 36%, ${lightenHex(accentHex, 0.82)}, ${lightenHex(accentHex, 0.94)})`,
      }}
    >
      {placements.map((placement) => {
        const flower = allFlowers.find((f) => f.id === placement.flowerId);
        if (!flower) return null;
        const selected = placement.key === selectedKey;
        return (
          <button
            key={placement.key}
            type="button"
            onPointerDown={(e) => handlePointerDown(e, placement)}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onKeyDown={(e) => handleKeyDown(e, placement)}
            aria-label={`${flower.name}. Draggable — use arrow keys to move, hold Shift to move further, Enter to select for layering.`}
            className={cn(
              "absolute flex cursor-grab touch-none items-center justify-center rounded-full outline-none active:cursor-grabbing",
              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              selected && "ring-2 ring-primary ring-offset-2",
            )}
            style={{
              left: `${placement.x}%`,
              top: `${placement.y}%`,
              transform: `translate(-50%, -50%) scale(${placement.scale})`,
            }}
          >
            <FlowerGlyphIcon flower={flower} size={72} />
          </button>
        );
      })}

      {label && (
        <p
          aria-hidden="true"
          className="pointer-events-none absolute bottom-[7%] left-1/2 -translate-x-1/2 font-heading text-sm text-foreground/70"
        >
          {label}
        </p>
      )}
    </div>
  );
}
