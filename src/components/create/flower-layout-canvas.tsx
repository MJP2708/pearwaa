"use client";

import { useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import { flowers as allFlowers } from "@/data/flowers";
import { FlowerGlyphIcon } from "@/components/flower-glyph-icon";
import { lightenHex } from "@/lib/color";
import { PaperSurface } from "@/components/paper-surface";
import type { FlowerPlacement } from "@/lib/export-image";
import { useAccessibility } from "@/components/providers/accessibility-provider";
import { cn } from "@/lib/utils";

const CLAMP_MIN = 6;
const CLAMP_MAX = 94;
const NUDGE = 2;
const NUDGE_LARGE = 6;
const TAP_THRESHOLD_PCT = 0.6;

type DragState = { key: string; startX: number; startY: number; originX: number; originY: number; moved: boolean };

type Props = {
  placements: FlowerPlacement[];
  onChangePlacements: (next: FlowerPlacement[]) => void;
  selectedKey: string | null;
  onSelectKey: (key: string | null) => void;
  accentHex: string;
  aspectRatio: string;
  label?: string;
  /** Fires when a flower is clicked/tapped without being dragged — e.g. to
   * open its bloom story, distinct from picking it up to reposition it. */
  onFlowerTap?: (flowerId: string, key: string) => void;
  /** An optional decorative guide line (SVG path `d`, in the same 0-100
   * coordinate space as placements) drawn under the flowers — like a wire
   * a garland is strung on, so a shape preset actually reads as a shape
   * rather than a scatter of a few dots. */
  guidePathD?: string | null;
  /** A single character rendered as a large, pale watermark behind the
   * flowers — the Letter preset's equivalent of the guide line, since a
   * letter can't be traced as one continuous path. */
  backgroundGlyph?: string | null;
};

function clamp(v: number) {
  return Math.min(CLAMP_MAX, Math.max(CLAMP_MIN, v));
}

/** Freely-draggable flower layout — shared by the Bouquet Builder and the
 * Wallpaper Generator so a bouquet's arrangement is built once and carried
 * forward, not re-clustered at each step. */
export function FlowerLayoutCanvas({
  placements,
  onChangePlacements,
  selectedKey,
  onSelectKey,
  accentHex,
  aspectRatio,
  label,
  onFlowerTap,
  guidePathD,
  backgroundGlyph,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const { reducedMotion } = useAccessibility();

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
    setDraggingKey(placement.key);
    onSelectKey(placement.key);
  }

  function handlePointerMove(e: ReactPointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!drag || !rect) return;
    const dxPct = ((e.clientX - drag.startX) / rect.width) * 100;
    const dyPct = ((e.clientY - drag.startY) / rect.height) * 100;
    if (Math.abs(dxPct) > TAP_THRESHOLD_PCT || Math.abs(dyPct) > TAP_THRESHOLD_PCT) drag.moved = true;
    updatePlacement(drag.key, drag.originX + dxPct, drag.originY + dyPct);
  }

  function endDrag(placement: FlowerPlacement) {
    const drag = dragRef.current;
    dragRef.current = null;
    setDraggingKey(null);
    if (drag && !drag.moved) {
      onFlowerTap?.(placement.flowerId, placement.key);
    }
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, placement: FlowerPlacement) {
    const step = e.shiftKey ? NUDGE_LARGE : NUDGE;
    let { x, y } = placement;
    let handled = true;
    if (e.key === "ArrowLeft") x -= step;
    else if (e.key === "ArrowRight") x += step;
    else if (e.key === "ArrowUp") y -= step;
    else if (e.key === "ArrowDown") y += step;
    else if (e.key === "Enter" || e.key === " ") {
      onSelectKey(placement.key);
      onFlowerTap?.(placement.flowerId, placement.key);
    } else handled = false;
    if (handled) {
      e.preventDefault();
      if (e.key !== "Enter" && e.key !== " ") updatePlacement(placement.key, x, y);
    }
  }

  return (
    <PaperSurface
      tint={accentHex}
      className="w-full touch-none rounded-3xl"
      style={{ aspectRatio, containerType: "inline-size" }}
    >
        <div ref={containerRef} className="relative h-full w-full">
      {backgroundGlyph && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center select-none font-heading"
          style={{ fontSize: "60cqw", color: lightenHex(accentHex, 0.08), opacity: 0.28 }}
        >
          {backgroundGlyph.toUpperCase()}
        </span>
      )}

      {guidePathD && (
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-0 h-full w-full"
          aria-hidden="true"
        >
          <path
            d={guidePathD}
            fill="none"
            stroke={lightenHex(accentHex, 0.12)}
            strokeWidth="1.1"
            strokeDasharray="1.4 2.2"
            strokeLinecap="round"
            opacity="0.85"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}

      {placements.map((placement) => {
        const flower = allFlowers.find((f) => f.id === placement.flowerId);
        if (!flower) return null;
        const selected = placement.key === selectedKey;
        const isDragging = placement.key === draggingKey;
        const lift = isDragging && !reducedMotion;
        return (
          <button
            key={placement.key}
            type="button"
            onPointerDown={(e) => handlePointerDown(e, placement)}
            onPointerMove={handlePointerMove}
            onPointerUp={() => endDrag(placement)}
            onPointerCancel={() => endDrag(placement)}
            onKeyDown={(e) => handleKeyDown(e, placement)}
            aria-label={`${flower.name}. Draggable — use arrow keys to move, hold Shift to move further, Enter to ${onFlowerTap ? "read its bloom story and select for layering" : "select for layering"}.`}
            className={cn(
              "absolute flex cursor-grab touch-none items-center justify-center rounded-full outline-none active:cursor-grabbing",
              "focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
              selected && "ring-2 ring-primary ring-offset-2",
            )}
            style={{
              left: `${placement.x}%`,
              top: `${placement.y}%`,
              transform: `translate(-50%, -50%) scale(${placement.scale * (lift ? 1.1 : 1)}) translateY(${lift ? -3 : 0}px)`,
              boxShadow: lift
                ? "0 16px 28px -10px rgba(43, 26, 71, 0.38), 0 3px 5px -2px rgba(60,40,20,0.16)"
                : "0 3px 6px -2px rgba(60,40,20,0.16)",
              transition: isDragging || reducedMotion ? "none" : "transform 0.32s cubic-bezier(0.25,0.9,0.4,1), box-shadow 0.32s ease",
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
      </PaperSurface>
  );
}
