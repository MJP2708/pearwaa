"use client";

import { useMemo, useRef, useState } from "react";
import { animate } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/mascot";
import { FlowerGlyphIcon } from "@/components/flower-glyph-icon";
import { DELIVERY_STOPS } from "@/data/delivery-stops";
import { getFlower } from "@/data/flowers";
import { useAccessibility } from "@/components/providers/accessibility-provider";

const ROAD_D =
  "M40,190 C140,60 220,300 340,190 C440,100 500,280 580,190 C660,110 700,260 770,170";
const VIEW_W = 800;
const VIEW_H = 320;

type Point = { x: number; y: number; angle: number };

export function DeliveryScene() {
  const [pathEl, setPathEl] = useState<SVGPathElement | null>(null);
  const pathLength = useMemo(() => pathEl?.getTotalLength() ?? 0, [pathEl]);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(0);
  const [stopIndex, setStopIndex] = useState(-1);
  const [delivered, setDelivered] = useState<Set<string>>(new Set());
  const [isDriving, setIsDriving] = useState(false);
  const { reducedMotion } = useAccessibility();

  const stopPoints = useMemo(() => {
    if (!pathEl || pathLength === 0) return [];
    return DELIVERY_STOPS.map((stop) => pointAt(pathEl, pathLength, stop.t));
  }, [pathEl, pathLength]);

  const carPoint: Point = useMemo(() => {
    if (!pathEl || pathLength === 0) return { x: 40, y: 190, angle: 0 };
    return pointAt(pathEl, pathLength, progress);
  }, [pathEl, pathLength, progress]);

  function driveTo(targetT: number, onArrive?: () => void) {
    if (!pathLength) return;
    setIsDriving(true);
    animate(progressRef.current, targetT, {
      duration: reducedMotion ? 0 : 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        progressRef.current = v;
        setProgress(v);
      },
      onComplete: () => {
        setIsDriving(false);
        onArrive?.();
      },
    });
  }

  function goNext() {
    if (isDriving || stopIndex >= DELIVERY_STOPS.length - 1) return;
    const nextIndex = stopIndex + 1;
    const nextStop = DELIVERY_STOPS[nextIndex];
    driveTo(nextStop.t, () => {
      setStopIndex(nextIndex);
      setDelivered((prev) => new Set(prev).add(nextStop.id));
    });
  }

  function goBack() {
    if (isDriving || stopIndex < 0) return;
    const prevIndex = stopIndex - 1;
    const targetT = prevIndex >= 0 ? DELIVERY_STOPS[prevIndex].t : 0;
    driveTo(targetT, () => setStopIndex(prevIndex));
  }

  function resetRoute() {
    if (isDriving) return;
    driveTo(0, () => {
      setStopIndex(-1);
      setDelivered(new Set());
    });
  }

  const allDelivered = delivered.size === DELIVERY_STOPS.length;
  const currentStop = stopIndex >= 0 ? DELIVERY_STOPS[stopIndex] : null;

  return (
    <div className="rounded-[2rem] bg-gradient-to-b from-[#241a33] to-[#160f22] p-5 sm:p-7">
      <div className="relative w-full overflow-hidden rounded-3xl" style={{ aspectRatio: `${VIEW_W} / ${VIEW_H}` }}>
        <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="absolute inset-0 h-full w-full">
          <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="#1c1428" />
          {NIGHT_DOTS.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#EDE3FA" opacity={d.o} />
          ))}
          <path d="M700,40 A18 18 0 1 0 700,76 A13 13 0 1 1 700,40 Z" fill="#EDE3FA" opacity="0.85" />

          <path
            ref={setPathEl}
            d={ROAD_D}
            fill="none"
            stroke="#4B3A63"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d={ROAD_D}
            fill="none"
            stroke="#C9B7E8"
            strokeWidth="1.5"
            strokeDasharray="6 10"
            opacity="0.6"
          />

          {DELIVERY_STOPS.map((stop, i) => {
            const p = stopPoints[i];
            if (!p) return null;
            const isDelivered = delivered.has(stop.id);
            return (
              <g key={stop.id} transform={`translate(${p.x} ${p.y})`}>
                <circle
                  r="10"
                  fill={isDelivered ? "#7A5FA0" : "#2A2038"}
                  stroke="#C9B7E8"
                  strokeWidth="1.5"
                  opacity={isDelivered ? 0.9 : 0.6}
                />
                <text
                  y="-18"
                  textAnchor="middle"
                  fontSize="12"
                  fill="#EDE3FA"
                  opacity={isDelivered ? 0.95 : 0.55}
                  fontFamily="Georgia, serif"
                >
                  {stop.title}
                </text>
              </g>
            );
          })}
        </svg>

        {pathLength > 0 && (
          <div
            className="absolute flex items-center justify-center"
            style={{
              left: `${(carPoint.x / VIEW_W) * 100}%`,
              top: `${(carPoint.y / VIEW_H) * 100}%`,
              transform: `translate(-50%, -50%) rotate(${carPoint.angle}deg)`,
              width: 56,
              height: 34,
            }}
          >
            <CarGlyph />
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
          onClick={goBack}
          disabled={isDriving || stopIndex < 0}
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          Back a stop
        </Button>
        {!allDelivered ? (
          <Button size="sm" className="rounded-full" onClick={goNext} disabled={isDriving}>
            Drive to the next stop
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-white/15 bg-white/5 text-white hover:bg-white/10"
            onClick={resetRoute}
            disabled={isDriving}
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Drive the route again
          </Button>
        )}
      </div>

      <div className="mt-6 min-h-[92px] rounded-2xl bg-white/5 p-5" aria-live="polite">
        {allDelivered ? (
          <div className="flex items-center gap-4">
            <Mascot size={56} mood="idle" />
            <p className="font-heading text-base text-white/90">
              Every flower found where it needed to go. No rush to do it again — but you can,
              whenever you like.
            </p>
          </div>
        ) : currentStop ? (
          <DeliveredCard stopTitle={currentStop.title} flowerId={currentStop.flowerId} note={currentStop.note} />
        ) : (
          <div className="flex items-center gap-4">
            <Mascot size={56} mood="sleepy" />
            <p className="text-sm leading-relaxed text-white/70">
              A quiet road, a few flowers, nowhere you have to be. Drive whenever you&rsquo;re ready
              — there&rsquo;s no timer and no wrong way to do this.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function DeliveredCard({ stopTitle, flowerId, note }: { stopTitle: string; flowerId: string; note: string }) {
  const flower = getFlower(flowerId);
  if (!flower) return null;
  return (
    <div className="flex items-center gap-4">
      <div className="rounded-2xl bg-white/10 p-2">
        <FlowerGlyphIcon flower={flower} size={44} />
      </div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-white/50">
          Delivered to {stopTitle}
        </p>
        <p className="mt-1 font-heading text-base text-white/90">{note}</p>
      </div>
    </div>
  );
}

function CarGlyph() {
  return (
    <svg width="56" height="34" viewBox="0 0 56 34" aria-hidden="true">
      <ellipse cx="28" cy="30" rx="20" ry="2.5" fill="#000" opacity="0.25" />
      <rect x="6" y="12" width="44" height="14" rx="7" fill="#7A5FA0" />
      <path d="M16 12 C18 4 38 4 40 12 Z" fill="#4B3A63" />
      <circle cx="24" cy="10" r="4.6" fill="#2A2038" />
      <circle cx="27.3" cy="8.7" r="0.7" fill="#EDE3FA" />
      <circle cx="20.7" cy="8.7" r="0.7" fill="#EDE3FA" />
      <path d="M22 12.5 Q24 14 26 12.5" stroke="#EDE3FA" strokeWidth="0.9" fill="none" strokeLinecap="round" />
      <circle cx="14" cy="27" r="4.4" fill="#1c1428" />
      <circle cx="42" cy="27" r="4.4" fill="#1c1428" />
      <circle cx="14" cy="27" r="1.7" fill="#C9B7E8" />
      <circle cx="42" cy="27" r="1.7" fill="#C9B7E8" />
    </svg>
  );
}

const NIGHT_DOTS = [
  { x: 60, y: 30, r: 1.4, o: 0.7 },
  { x: 120, y: 60, r: 1, o: 0.5 },
  { x: 220, y: 24, r: 1.6, o: 0.8 },
  { x: 300, y: 50, r: 1, o: 0.4 },
  { x: 380, y: 20, r: 1.2, o: 0.6 },
  { x: 460, y: 46, r: 1, o: 0.45 },
  { x: 540, y: 22, r: 1.5, o: 0.7 },
  { x: 610, y: 55, r: 1, o: 0.4 },
  { x: 90, y: 90, r: 1, o: 0.35 },
  { x: 260, y: 100, r: 1.1, o: 0.4 },
  { x: 430, y: 90, r: 1, o: 0.35 },
  { x: 600, y: 100, r: 1.2, o: 0.4 },
];

function pointAt(path: SVGPathElement, totalLength: number, t: number): Point {
  const len = Math.min(totalLength, Math.max(0, t * totalLength));
  const p = path.getPointAtLength(len);
  const ahead = path.getPointAtLength(Math.min(totalLength, len + 1));
  const angle = (Math.atan2(ahead.y - p.y, ahead.x - p.x) * 180) / Math.PI;
  return { x: p.x, y: p.y, angle };
}
