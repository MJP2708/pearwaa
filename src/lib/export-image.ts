import { composeBouquetSvg } from "./bouquet-svg";
import { lightenHex } from "./color";

const INK = "#3A3350";

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export function wrapTextToLines(text: string, maxCharsPerLine: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length > maxCharsPerLine && current) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export type WallpaperSize = { id: string; label: string; width: number; height: number };

export const WALLPAPER_SIZES: WallpaperSize[] = [
  { id: "phone", label: "Phone", width: 1080, height: 1920 },
  { id: "desktop", label: "Desktop", width: 1920, height: 1080 },
  { id: "square", label: "Square", width: 1200, height: 1200 },
];

export const SHARE_CARD_SIZE = { width: 1080, height: 1350 };

/** Note: exported SVGs deliberately use generic font stacks, not the
 * app's webfonts — a blob-URL <img> renders in an isolated context that
 * can't see the page's @font-face rules, so a custom-font reference would
 * just silently fall back anyway. */
export function buildWallpaperSvg(
  flowerIds: string[],
  opts: { width: number; height: number; accentHex: string; label?: string },
): string {
  const { width, height, accentHex, label } = opts;
  const bouquetSize = Math.min(width, height) * 0.6;
  const bx = (width - bouquetSize) / 2;
  const by = height * 0.5 - bouquetSize / 2 - height * 0.03;
  const bouquetSvg = composeBouquetSvg(flowerIds, { size: bouquetSize, interactive: false });

  const labelMarkup = label
    ? `<text x="${width / 2}" y="${(by + bouquetSize + height * 0.07).toFixed(1)}" text-anchor="middle" font-family="Georgia, serif" font-size="${(height * 0.024).toFixed(1)}" fill="${INK}" opacity="0.7">${escapeXml(label)}</text>`
    : "";

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="wp-bg" cx="50%" cy="36%" r="75%">
        <stop offset="0%" stop-color="${lightenHex(accentHex, 0.82)}" />
        <stop offset="100%" stop-color="${lightenHex(accentHex, 0.94)}" />
      </radialGradient>
    </defs>
    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#wp-bg)" />
    <g transform="translate(${bx.toFixed(1)} ${by.toFixed(1)})">${bouquetSvg}</g>
    ${labelMarkup}
    <text x="${width / 2}" y="${(height * 0.965).toFixed(1)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${(height * 0.013).toFixed(1)}" letter-spacing="3" fill="${INK}" opacity="0.4">PEARWAA</text>
  </svg>`;
}

export function buildShareCardSvg(
  flowerIds: string[],
  message: string,
  opts: { width: number; height: number; accentHex: string },
): string {
  const { width, height, accentHex } = opts;
  const bouquetSize = width * 0.5;
  const bx = (width - bouquetSize) / 2;
  const by = height * 0.09;
  const bouquetSvg = composeBouquetSvg(flowerIds, { size: bouquetSize, interactive: false });

  const lines = wrapTextToLines(message, 30);
  const fontSize = height * 0.032;
  const lineHeight = fontSize * 1.55;
  const textStartY = by + bouquetSize + height * 0.1;

  const tspans = lines
    .map((line, i) => `<tspan x="${width / 2}" dy="${i === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
    .join("");

  const messageMarkup = message
    ? `<text x="${width / 2}" y="${textStartY.toFixed(1)}" text-anchor="middle" font-family="Georgia, serif" font-size="${fontSize.toFixed(1)}" fill="${INK}">${tspans}</text>`
    : "";

  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="sc-bg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${lightenHex(accentHex, 0.88)}" />
        <stop offset="100%" stop-color="${lightenHex(accentHex, 0.95)}" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="${width}" height="${height}" fill="url(#sc-bg)" />
    <g transform="translate(${bx.toFixed(1)} ${by.toFixed(1)})">${bouquetSvg}</g>
    ${messageMarkup}
    <text x="${width / 2}" y="${(height * 0.965).toFixed(1)}" text-anchor="middle" font-family="Arial, sans-serif" font-size="${(height * 0.012).toFixed(1)}" letter-spacing="3" fill="${INK}" opacity="0.45">PEARWAA</text>
  </svg>`;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to render image"));
    img.src = src;
  });
}

export async function svgToPngBlob(svgMarkup: string, width: number, height: number): Promise<Blob> {
  const svgBlob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas is not supported in this browser");
    ctx.drawImage(img, 0, 0, width, height);
    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to export image"));
      }, "image/png");
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
