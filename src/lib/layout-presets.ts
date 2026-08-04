import { seeded } from "./seeded-random";

export type PresetId = "freeform" | "heart" | "circle" | "letter";

export type PresetPoint = { x: number; y: number };

function distance(a: PresetPoint, b: PresetPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Rescales a dense point set to sit centered around (50, 52) within
 * roughly targetRadius of that center — the same coordinate space bouquet
 * placements already use. */
function normalizeToPlacementSpace(points: PresetPoint[], targetRadius = 32): PresetPoint[] {
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const halfSpan = Math.max(maxX - minX, maxY - minY) / 2 || 1;
  const scale = targetRadius / halfSpan;
  return points.map((p) => ({ x: 50 + (p.x - cx) * scale, y: 52 + (p.y - cy) * scale }));
}

/** Picks `count` points evenly spaced by arc length along a dense sampled
 * path — evenly spaced by *parameter* would bunch up wherever the curve is
 * slow-moving (e.g. a heart's rounded lobes vs. its point). */
function resampleEvenlyByArcLength(dense: PresetPoint[], closed: boolean, count: number): PresetPoint[] {
  if (count <= 0) return [];
  const cumulative: number[] = [0];
  for (let i = 1; i < dense.length; i++) {
    cumulative.push(cumulative[i - 1] + distance(dense[i - 1], dense[i]));
  }
  const total = cumulative[cumulative.length - 1];
  if (total === 0) return dense.slice(0, count);

  const result: PresetPoint[] = [];
  for (let i = 0; i < count; i++) {
    const target = closed || count === 1 ? (i / count) * total : (i / (count - 1)) * total;
    let lo = 0;
    let hi = cumulative.length - 1;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cumulative[mid] < target) lo = mid + 1;
      else hi = mid;
    }
    const idx = Math.max(1, lo);
    const segStart = cumulative[idx - 1];
    const segEnd = cumulative[idx];
    const t = segEnd > segStart ? (target - segStart) / (segEnd - segStart) : 0;
    const a = dense[idx - 1];
    const b = dense[idx];
    result.push({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  }
  return result;
}

/**
 * A perimeter traced by only a few widely-spaced flowers doesn't read as a
 * shape on its own — it just looks scattered. Shrinking the shape for low
 * flower counts keeps consecutive flowers close enough to visually
 * connect; more flowers earn a bigger, more confident outline. The guide
 * line (see getPresetGuidePath) is what actually carries the shape,
 * though — the flowers just decorate it.
 */
function radiusForCount(count: number): number {
  return Math.min(32, 10 + count * 2.2);
}

function denseHeart(steps = 300): PresetPoint[] {
  const dense: PresetPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const x = 16 * Math.sin(t) ** 3;
    const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
    dense.push({ x, y });
  }
  return dense;
}

function denseCircle(steps = 200): PresetPoint[] {
  const dense: PresetPoint[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    dense.push({ x: Math.cos(t) * 16, y: Math.sin(t) * 16 });
  }
  return dense;
}

/**
 * Fills a rendered letter glyph with well-spaced points — a stipple fill
 * rather than a single traced outline, since a thin stroke path would
 * often break into disconnected pieces (the dot on an "i", the two
 * counters in a "B") that are hard to order into one coherent path. A
 * scattered fill reads clearly as the letter even with only a handful of
 * flowers, and works for any character. Client-only (uses canvas).
 */
function letterPreset(letter: string, count: number): PresetPoint[] {
  if (typeof document === "undefined" || !letter) return [];
  const size = 260;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return [];

  ctx.clearRect(0, 0, size, size);
  ctx.fillStyle = "#000";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `bold ${Math.round(size * 0.82)}px Arial, Helvetica, sans-serif`;
  ctx.fillText(letter.toUpperCase(), size / 2, size / 2 + size * 0.03);

  const data = ctx.getImageData(0, 0, size, size).data;
  const filled = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return false;
    return data[(y * size + x) * 4 + 3] > 128;
  };

  const accepted: PresetPoint[] = [];
  const minSpacing = Math.max(6, Math.sqrt((size * size) / Math.max(count, 1)) * 0.7);
  let attempts = 0;
  const maxAttempts = count * 400;

  while (accepted.length < count && attempts < maxAttempts) {
    attempts++;
    const seedX = seeded(attempts, 11);
    const seedY = seeded(attempts, 47);
    const x = Math.floor(seedX * size);
    const y = Math.floor(seedY * size);
    if (!filled(x, y)) continue;
    const tooClose = accepted.some((p) => distance(p, { x, y }) < minSpacing);
    if (tooClose) continue;
    accepted.push({ x, y });
  }

  // If rejection sampling couldn't pack enough points at the ideal spacing
  // (dense letters, high flower counts), relax and fill the remainder.
  let relaxedSpacing = minSpacing;
  while (accepted.length < count && relaxedSpacing > 1) {
    relaxedSpacing *= 0.7;
    for (let y = 0; y < size && accepted.length < count; y += 3) {
      for (let x = 0; x < size && accepted.length < count; x += 3) {
        if (!filled(x, y)) continue;
        const tooClose = accepted.some((p) => distance(p, { x, y }) < relaxedSpacing);
        if (tooClose) continue;
        accepted.push({ x, y });
      }
    }
  }

  // Convert from canvas pixel space (y-down) to the same coordinate
  // convention used elsewhere, then normalize.
  const asPoints = accepted.slice(0, count).map((p) => ({ x: p.x, y: p.y }));
  return normalizeToPlacementSpace(asPoints.length > 0 ? asPoints : [{ x: 0, y: 0 }], radiusForCount(count));
}

export function getPresetPoints(presetId: PresetId, letter: string, count: number): PresetPoint[] {
  if (count <= 0) return [];
  switch (presetId) {
    case "heart": {
      const normalized = normalizeToPlacementSpace(denseHeart(), radiusForCount(count));
      return resampleEvenlyByArcLength(normalized, true, count);
    }
    case "circle": {
      const normalized = normalizeToPlacementSpace(denseCircle(), radiusForCount(count));
      return resampleEvenlyByArcLength(normalized, true, count);
    }
    case "letter":
      return letterPreset(letter || "A", count);
    case "freeform":
    default:
      return [];
  }
}

/**
 * A thin decorative line tracing the preset's shape, drawn underneath the
 * flowers — like a wire a garland is strung on. A handful of flowers can't
 * carry a shape by themselves; the guide line is what actually makes the
 * heart or circle read clearly, with the flowers as beads along it. Not
 * offered for the Letter preset (fill-based, not a single traceable line).
 * Returns an SVG path `d` string in the same 0-100 coordinate space as
 * placements, or null when there's nothing to draw.
 */
export function getPresetGuidePath(presetId: PresetId, count: number): string | null {
  if (count <= 0) return null;
  const radius = radiusForCount(count);
  let dense: PresetPoint[] | null = null;
  if (presetId === "heart") dense = normalizeToPlacementSpace(denseHeart(), radius);
  else if (presetId === "circle") dense = normalizeToPlacementSpace(denseCircle(), radius);
  if (!dense || dense.length === 0) return null;
  const [first, ...rest] = dense;
  return `M ${first.x.toFixed(2)} ${first.y.toFixed(2)} ${rest.map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ")} Z`;
}
