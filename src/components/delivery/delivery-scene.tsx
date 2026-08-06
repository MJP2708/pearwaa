"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Music, RotateCcw, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Mascot } from "@/components/mascot";
import { FlowerGlyphIcon } from "@/components/flower-glyph-icon";
import { CarGlyph } from "@/components/delivery/car-glyph";
import { SceneryDoodles } from "@/components/delivery/scenery-doodles";
import { DELIVERY_FLOWER_IDS } from "@/data/delivery-flowers";
import { getFlower } from "@/data/flowers";
import { useAccessibility } from "@/components/providers/accessibility-provider";
import { useGentleMusic } from "@/lib/use-gentle-music";

const SCENE_W = 800;
const SCENE_H = 460;
const CAR_W = 44;
const CAR_H = 26;
const CAR_PAD = 24;
const CAR_START = { x: 70, y: 230, angle: 0 };

const MAX_SPEED = 230;
const ACCEL = 3.4;
const FRICTION = 2.8;
const MAX_TURN_RATE = 175;
// The pickup check itself runs every animation frame (immediate, not
// throttled) — the "laggy" feel was actually a hitbox too small for the
// visuals: a 40px flower marker + ~44px car need roughly this much
// center-to-center clearance before they visually touch, so the old
// radius (32) required the car to visibly drive *into* the flower before
// registering. Matching the radius to the visuals makes pickup feel
// instant right as the car reaches the flower.
const PICKUP_RADIUS = 42;
const STEP = 42;
const MIN_FLOWER_SPACING = 95;
const MIN_START_DISTANCE = 120;

// A gentle "time of day" shift across replays — same low-key palette
// family, just enough variety that the scene doesn't look identical
// every time you come back to it.
const SKY_PALETTES = [
  { top: "#F3ECFF", bottom: "#EFE6FB" },
  { top: "#FFF1E0", bottom: "#FDE9EE" },
  { top: "#E9F3EC", bottom: "#EAF0FB" },
  { top: "#FDECE3", bottom: "#F3E9FB" },
];

type FlowerItem = { id: string; flowerId: string; x: number; y: number; collected: boolean; special: boolean };
type Dir = "up" | "down" | "left" | "right";

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function normalizeKey(key: string): Dir | null {
  switch (key) {
    case "ArrowUp":
    case "w":
    case "W":
      return "up";
    case "ArrowDown":
    case "s":
    case "S":
      return "down";
    case "ArrowLeft":
    case "a":
    case "A":
      return "left";
    case "ArrowRight":
    case "d":
    case "D":
      return "right";
    default:
      return null;
  }
}

/** Picks a spot with real breathing room from the car's start and from
 * every flower already placed — a handful of rejection-sampling attempts,
 * falling back to whatever the last attempt found rather than looping
 * forever if the scene is nearly full. */
function randomFlowerPosition(existing: { x: number; y: number }[]): { x: number; y: number } {
  const marginX = CAR_PAD + 34;
  const marginY = CAR_PAD + 26;
  let candidate = { x: SCENE_W / 2, y: SCENE_H / 2 };
  for (let attempt = 0; attempt < 40; attempt++) {
    const x = marginX + Math.random() * (SCENE_W - marginX * 2);
    const y = marginY + Math.random() * (SCENE_H - marginY * 2);
    candidate = { x, y };
    const farFromStart = Math.hypot(x - CAR_START.x, y - CAR_START.y) > MIN_START_DISTANCE;
    const farFromOthers = existing.every((p) => Math.hypot(p.x - x, p.y - y) > MIN_FLOWER_SPACING);
    if (farFromStart && farFromOthers) return candidate;
  }
  return candidate;
}

// A fixed, deterministic layout — used only for the very first render
// (see the mount effect below). Math.random() positions are randomized
// only after mount: calling it from the initial state initializer would
// run during SSR too, and the server's random values would never match
// the client's, causing a hydration mismatch.
const FALLBACK_POSITIONS = [
  { x: 210, y: 100 },
  { x: 420, y: 70 },
  { x: 650, y: 140 },
  { x: 160, y: 330 },
  { x: 400, y: 380 },
  { x: 620, y: 350 },
  { x: 520, y: 230 },
];

function initFlowers(randomize: boolean): FlowerItem[] {
  if (!randomize) {
    return DELIVERY_FLOWER_IDS.map((flowerId, i) => {
      const pos = FALLBACK_POSITIONS[i % FALLBACK_POSITIONS.length];
      return { id: `f${i}`, flowerId, x: pos.x, y: pos.y, collected: false, special: false };
    });
  }
  const placed: { x: number; y: number }[] = [];
  // One gentle rare-flower moment per playthrough — visually a little
  // brighter/glowing, not scored or announced any differently, just a
  // small "oh, that one's special" delight.
  const specialIndex = Math.floor(Math.random() * DELIVERY_FLOWER_IDS.length);
  return DELIVERY_FLOWER_IDS.map((flowerId, i) => {
    const pos = randomFlowerPosition(placed);
    placed.push(pos);
    return { id: `f${i}`, flowerId, x: pos.x, y: pos.y, collected: false, special: i === specialIndex };
  });
}

function randomSkyPalette() {
  return SKY_PALETTES[Math.floor(Math.random() * SKY_PALETTES.length)];
}

export function DeliveryScene() {
  const { reducedMotion } = useAccessibility();
  const [flowers, setFlowers] = useState<FlowerItem[]>(() => initFlowers(false));
  const [hasFocused, setHasFocused] = useState(false);
  const [sky, setSky] = useState(SKY_PALETTES[0]);
  const [musicOn, setMusicOn] = useState(false);
  useGentleMusic(musicOn, () => setMusicOn(false));
  // The visual pickup animation (fade/scale) and the running "N of N"
  // count convey nothing about *which* flower was just collected to a
  // screen-reader user — the rest of the app treats each flower's name
  // and meaning as the actual content, so this game shouldn't be the one
  // place that's reduced to an anonymous count.
  const [lastCollected, setLastCollected] = useState<{ name: string; meaning: string } | null>(null);

  const carElRef = useRef<HTMLDivElement>(null);
  const physicsRef = useRef({ ...CAR_START, speed: 0 });
  const pressedKeysRef = useRef<Set<Dir>>(new Set());
  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const flowersRef = useRef(flowers);

  useEffect(() => {
    flowersRef.current = flowers;
  }, [flowers]);

  // Randomize the layout and sky only after mount (client-only) — see the
  // comment on FALLBACK_POSITIONS above for why this can't happen in the
  // initial state itself.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- intentional one-time client-only randomization, see comment above
    setFlowers(initFlowers(true));
    setSky(randomSkyPalette());
  }, []);

  const totalCount = flowers.length;
  const collectedCount = flowers.filter((f) => f.collected).length;
  const allCollected = collectedCount === totalCount;

  const applyCarTransform = useCallback((x: number, y: number, angle: number) => {
    if (carElRef.current) {
      carElRef.current.style.transform = `translate(${(x - CAR_W / 2).toFixed(1)}px, ${(y - CAR_H / 2).toFixed(1)}px) rotate(${angle.toFixed(1)}deg)`;
    }
  }, []);

  const checkPickups = useCallback((carX: number, carY: number) => {
    const prev = flowersRef.current;
    let changed = false;
    const next = prev.map((f) => {
      if (f.collected) return f;
      if (Math.hypot(f.x - carX, f.y - carY) < PICKUP_RADIUS) {
        changed = true;
        return { ...f, collected: true };
      }
      return f;
    });
    if (!changed) return;
    setFlowers(next);
    const justCollectedId = next.find((f, i) => f.collected && !prev[i].collected)?.flowerId;
    const flower = justCollectedId ? getFlower(justCollectedId) : undefined;
    if (flower) setLastCollected({ name: flower.name, meaning: flower.meaning });
  }, []);

  // Continuous, physics-based driving — soft acceleration and gradual
  // steering, running every frame regardless of reduced-motion so the loop
  // itself is simple; the mode split happens in the input handlers below.
  useEffect(() => {
    if (reducedMotion) return;

    function tick(now: number) {
      if (lastTimeRef.current == null) lastTimeRef.current = now;
      const dt = Math.min(0.05, (now - lastTimeRef.current) / 1000);
      lastTimeRef.current = now;

      const keys = pressedKeysRef.current;
      const throttle = keys.has("up") ? 1 : keys.has("down") ? -1 : 0;
      const steer = keys.has("left") ? -1 : keys.has("right") ? 1 : 0;

      const p = physicsRef.current;
      const targetSpeed = throttle * MAX_SPEED * (throttle < 0 ? 0.55 : 1);
      const rate = Math.abs(targetSpeed) > Math.abs(p.speed) ? ACCEL : FRICTION;
      p.speed += (targetSpeed - p.speed) * Math.min(1, rate * dt);
      if (Math.abs(p.speed) < 1 && targetSpeed === 0) p.speed = 0;

      if (p.speed !== 0) {
        const speedFactor = 0.25 + 0.75 * Math.min(1, Math.abs(p.speed) / (MAX_SPEED * 0.6));
        p.angle += steer * MAX_TURN_RATE * speedFactor * dt;
        const rad = (p.angle * Math.PI) / 180;
        p.x += Math.cos(rad) * p.speed * dt;
        p.y += Math.sin(rad) * p.speed * dt;
      } else if (steer !== 0) {
        p.angle += steer * MAX_TURN_RATE * 0.3 * dt;
      }

      p.x = clamp(p.x, CAR_PAD, SCENE_W - CAR_PAD);
      p.y = clamp(p.y, CAR_PAD, SCENE_H - CAR_PAD);

      applyCarTransform(p.x, p.y, p.angle);
      checkPickups(p.x, p.y);

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      lastTimeRef.current = null;
    };
  }, [reducedMotion, applyCarTransform, checkPickups]);

  function handleContinuousKeyDown(e: React.KeyboardEvent) {
    const dir = normalizeKey(e.key);
    if (!dir) return;
    e.preventDefault();
    pressedKeysRef.current.add(dir);
    setHasFocused(true);
  }

  function handleContinuousKeyUp(e: React.KeyboardEvent) {
    const dir = normalizeKey(e.key);
    if (!dir) return;
    e.preventDefault();
    pressedKeysRef.current.delete(dir);
  }

  function handleDiscreteKeyDown(e: React.KeyboardEvent) {
    const dir = normalizeKey(e.key);
    if (!dir) return;
    e.preventDefault();
    setHasFocused(true);

    const p = physicsRef.current;
    let { x, y } = p;
    let angle = p.angle;
    if (dir === "up") {
      y -= STEP;
      angle = -90;
    } else if (dir === "down") {
      y += STEP;
      angle = 90;
    } else if (dir === "left") {
      x -= STEP;
      angle = 180;
    } else if (dir === "right") {
      x += STEP;
      angle = 0;
    }
    x = clamp(x, CAR_PAD, SCENE_W - CAR_PAD);
    y = clamp(y, CAR_PAD, SCENE_H - CAR_PAD);

    physicsRef.current = { x, y, angle, speed: 0 };
    applyCarTransform(x, y, angle);
    checkPickups(x, y);
  }

  function handleReset() {
    pressedKeysRef.current.clear();
    physicsRef.current = { ...CAR_START, speed: 0 };
    applyCarTransform(CAR_START.x, CAR_START.y, CAR_START.angle);
    setFlowers(initFlowers(true));
    setLastCollected(null);
    setSky(randomSkyPalette());
  }

  return (
    <div className="rounded-[2rem] bg-gradient-to-b from-accent/50 to-secondary/40 p-5 sm:p-7">
      <div
        tabIndex={0}
        role="application"
        aria-label="Flower delivery driving scene. Use arrow keys or W A S D to drive the car and collect flowers."
        onKeyDown={reducedMotion ? handleDiscreteKeyDown : handleContinuousKeyDown}
        onKeyUp={reducedMotion ? undefined : handleContinuousKeyUp}
        onFocus={() => setHasFocused(true)}
        onBlur={() => pressedKeysRef.current.clear()}
        className="relative w-full touch-none overflow-hidden rounded-3xl outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        style={{ aspectRatio: `${SCENE_W} / ${SCENE_H}` }}
      >
        <svg viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} className="absolute inset-0 h-full w-full">
          <defs>
            <radialGradient id="delivery-bg" cx="50%" cy="35%" r="80%">
              <stop offset="0%" stopColor={sky.top} />
              <stop offset="100%" stopColor={sky.bottom} />
            </radialGradient>
          </defs>
          <rect x="0" y="0" width={SCENE_W} height={SCENE_H} fill="url(#delivery-bg)" />
          {GRASS_DOTS.map((d, i) => (
            <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#B9C7AE" opacity={d.o} />
          ))}
          <SceneryDoodles />
        </svg>

        {flowers
          .filter((f) => !f.collected)
          .map((f) => {
            const flower = getFlower(f.flowerId);
            if (!flower) return null;
            return (
              <div
                key={f.id}
                className="pointer-events-none absolute"
                style={{
                  left: `${(f.x / SCENE_W) * 100}%`,
                  top: `${(f.y / SCENE_H) * 100}%`,
                  marginLeft: -20,
                  marginTop: -20,
                }}
              >
                {f.special && !reducedMotion && (
                  <motion.div
                    className="absolute inset-0 rounded-full bg-primary/25"
                    animate={{ scale: [1, 1.35, 1], opacity: [0.55, 0.15, 0.55] }}
                    transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                    aria-hidden="true"
                  />
                )}
                {f.special && reducedMotion && (
                  <div className="absolute inset-0 rounded-full bg-primary/20" aria-hidden="true" />
                )}
                <AnimatePresence>
                  <motion.div
                    key={f.id}
                    className="relative flex items-center justify-center rounded-full bg-white/60 shadow-sm"
                    style={{ width: 40, height: 40 }}
                    initial={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.7 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <FlowerGlyphIcon flower={flower} size={f.special ? 40 : 34} />
                  </motion.div>
                </AnimatePresence>
              </div>
            );
          })}

        <div
          ref={carElRef}
          className="pointer-events-none absolute left-0 top-0"
          style={{
            width: CAR_W,
            height: CAR_H,
            transform: `translate(${CAR_START.x - CAR_W / 2}px, ${CAR_START.y - CAR_H / 2}px) rotate(${CAR_START.angle}deg)`,
          }}
        >
          <CarGlyph size={CAR_W} />
        </div>

        {!hasFocused && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/40 backdrop-blur-[1px]">
            <p className="rounded-full bg-card px-5 py-2.5 text-sm text-foreground shadow-sm">
              Click here, then drive with the arrow keys or W A S D
            </p>
          </div>
        )}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {flowers.map((f) => {
            const flower = getFlower(f.flowerId);
            if (!flower) return null;
            return (
              <div
                key={f.id}
                className={f.collected ? "opacity-100" : "opacity-30 grayscale"}
                aria-hidden="true"
              >
                <FlowerGlyphIcon flower={flower} size={26} />
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-muted-foreground"
            onClick={() => setMusicOn((v) => !v)}
            aria-pressed={musicOn}
          >
            {musicOn ? <Music className="size-3.5" aria-hidden="true" /> : <VolumeX className="size-3.5" aria-hidden="true" />}
            {musicOn ? "Music on" : "Music off"}
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground" onClick={handleReset}>
            <RotateCcw className="size-3.5" aria-hidden="true" />
            Reset scene
          </Button>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {lastCollected && !allCollected ? `${lastCollected.name} collected — ${lastCollected.meaning} ` : ""}
        {collectedCount} of {totalCount} flowers collected.
        {allCollected ? " All flowers delivered." : ""}
      </p>

      <div className="mt-4 min-h-[64px] rounded-2xl bg-card/70 p-5" aria-live="polite">
        {allCollected ? (
          <div className="flex items-center gap-4">
            <Mascot size={48} mood="idle" />
            <p className="font-heading text-base text-foreground/90">
              All delivered. No rush to do it again — but you can, whenever you like.
            </p>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">
            {collectedCount} of {totalCount} flowers collected. Drive over one to pick it up —
            there&rsquo;s no timer and no wrong way to do this.
          </p>
        )}
      </div>
    </div>
  );
}

const GRASS_DOTS = [
  { x: 60, y: 220, r: 2.2, o: 0.5 },
  { x: 260, y: 60, r: 1.8, o: 0.4 },
  { x: 340, y: 300, r: 2, o: 0.45 },
  { x: 500, y: 90, r: 1.6, o: 0.4 },
  { x: 580, y: 300, r: 2.2, o: 0.5 },
  { x: 730, y: 220, r: 1.8, o: 0.4 },
  { x: 200, y: 400, r: 1.6, o: 0.35 },
  { x: 450, y: 40, r: 1.4, o: 0.35 },
  { x: 660, y: 60, r: 1.8, o: 0.4 },
  { x: 120, y: 130, r: 1.4, o: 0.35 },
];
