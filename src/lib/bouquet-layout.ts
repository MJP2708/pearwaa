/**
 * Bouquet composition uses a phyllotaxis (golden-angle spiral) placement —
 * the same pattern sunflowers grow their seeds in. It's deterministic (no
 * randomness, so the on-screen preview and the exported image always match)
 * and produces a naturally pleasing, non-overlapping cluster for any count.
 */
const GOLDEN_ANGLE = 137.508;

export type BouquetItem = { flowerId: string; cx: number; cy: number; scale: number };
export type FillerDot = { cx: number; cy: number; r: number };
export type PlacementOpts = { centerX?: number; centerY?: number; spread?: number };

/** Position + scale for the nth flower in the spiral — exposed on its own
 * so callers can compute a single new point (e.g. "where should the next
 * flower a person adds land") without recomputing a whole layout. */
export function computePlacementPoint(index: number, opts?: PlacementOpts): { x: number; y: number; scale: number } {
  const centerX = opts?.centerX ?? 50;
  const centerY = opts?.centerY ?? 52;
  const spread = opts?.spread ?? 9;

  const angle = index * GOLDEN_ANGLE;
  const radius = spread * Math.sqrt(index);
  const rad = (angle * Math.PI) / 180;
  const x = centerX + Math.cos(rad) * radius;
  const y = centerY + Math.sin(rad) * radius * 0.9;
  const scale = Math.max(0.55, 1 - radius / 38);
  return { x, y, scale };
}

export function computeBouquetLayout(flowerIds: string[], opts?: PlacementOpts): BouquetItem[] {
  return flowerIds.map((flowerId, i) => {
    const { x, y, scale } = computePlacementPoint(i, opts);
    return { flowerId, cx: x, cy: y, scale };
  });
}

export function computeFillerDots(
  flowerCount: number,
  opts?: { centerX?: number; centerY?: number; spread?: number },
): FillerDot[] {
  if (flowerCount === 0) return [];
  const centerX = opts?.centerX ?? 50;
  const centerY = opts?.centerY ?? 52;
  const spread = opts?.spread ?? 9;
  const count = Math.min(20, flowerCount * 3 + 3);
  const dots: FillerDot[] = [];

  for (let i = 0; i < count; i++) {
    const idx = i * 2.4 + 1.3;
    const angle = idx * GOLDEN_ANGLE;
    const radius = spread * Math.sqrt(idx) * 1.15;
    const rad = (angle * Math.PI) / 180;
    const cx = centerX + Math.cos(rad) * radius;
    const cy = centerY + Math.sin(rad) * radius * 0.9;
    const r = Math.max(0.7, 1.6 - radius / 30);
    if (r > 0.7) dots.push({ cx, cy, r });
  }
  return dots;
}
