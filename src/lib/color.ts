function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const num = parseInt(hex.replace("#", ""), 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

/** Blends a hex color toward another hex color by `t` (0–1). */
export function mixHex(hexA: string, hexB: string, t: number): string {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  const r = Math.round(a.r + (b.r - a.r) * t);
  const g = Math.round(a.g + (b.g - a.g) * t);
  const bch = Math.round(a.b + (b.b - a.b) * t);
  return `rgb(${r}, ${g}, ${bch})`;
}

/** Blends a hex color toward white by `amt` (0–1). Used to derive soft
 * tinted backgrounds from an emotion's accent color. */
export function lightenHex(hex: string, amt: number): string {
  return mixHex(hex, "#FFFFFF", amt);
}

/** Perceived brightness in [0,1] (ITU-R BT.601 luma) — used to catch
 * colors that are themselves near-white, where further mixing toward
 * white/paper would leave nothing visible. */
export function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}
