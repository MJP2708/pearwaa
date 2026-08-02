/** Blends a hex color toward white by `amt` (0–1). Used to derive soft
 * tinted backgrounds from an emotion's accent color. */
export function lightenHex(hex: string, amt: number): string {
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  let r = (num >> 16) & 255;
  let g = (num >> 8) & 255;
  let b = num & 255;
  r = Math.round(r + (255 - r) * amt);
  g = Math.round(g + (255 - g) * amt);
  b = Math.round(b + (255 - b) * amt);
  return `rgb(${r}, ${g}, ${b})`;
}
