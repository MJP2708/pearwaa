/**
 * Bouquet composition uses a phyllotaxis (golden-angle spiral) placement —
 * the same pattern sunflowers grow their seeds in. It's deterministic (no
 * randomness, so the on-screen preview and the exported image always match)
 * and produces a naturally pleasing, non-overlapping cluster for any count.
 */
const GOLDEN_ANGLE = 137.508;

export type BouquetItem = { flowerId: string; cx: number; cy: number; scale: number };
export type FillerDot = { cx: number; cy: number; r: number };

export function computeBouquetLayout(
  flowerIds: string[],
  opts?: { centerX?: number; centerY?: number; spread?: number },
): BouquetItem[] {
  const centerX = opts?.centerX ?? 50;
  const centerY = opts?.centerY ?? 52;
  const spread = opts?.spread ?? 9;

  return flowerIds.map((flowerId, i) => {
    const angle = i * GOLDEN_ANGLE;
    const radius = spread * Math.sqrt(i);
    const rad = (angle * Math.PI) / 180;
    const cx = centerX + Math.cos(rad) * radius;
    const cy = centerY + Math.sin(rad) * radius * 0.9;
    const scale = Math.max(0.55, 1 - radius / 38);
    return { flowerId, cx, cy, scale };
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
