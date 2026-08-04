/**
 * Deterministic pseudo-random in [0,1), seeded by index + salt — gives
 * repeated calls their own slight, consistent irregularity (petal jitter,
 * preset-point placement, paint-spatter scatter, ...) without ever
 * reshuffling between renders. Integer-only (no `Math.sin`) — transcendental
 * functions aren't guaranteed bit-identical across JS engine versions per
 * spec, which previously caused SSR/client hydration mismatches wherever
 * this was used to derive server-rendered markup.
 */
export function seeded(i: number, salt: number): number {
  let h = (i * 374761393 + salt * 668265263) | 0;
  h = (h ^ (h >>> 13)) | 0;
  h = Math.imul(h, 1274126177);
  h = (h ^ (h >>> 16)) | 0;
  return (h >>> 0) / 4294967296;
}
