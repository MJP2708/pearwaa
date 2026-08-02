import type { Flower, PetalShape } from "@/data/flowers";
import { lightenHex } from "./color";

function petalPath(shape: PetalShape, cx: number, cy: number, L: number): string {
  switch (shape) {
    case "round": {
      const w = L * 0.42;
      return `M ${cx} ${cy} C ${cx - w} ${cy - L * 0.3} ${cx - w * 0.6} ${cy - L} ${cx} ${cy - L} C ${cx + w * 0.6} ${cy - L} ${cx + w} ${cy - L * 0.3} ${cx} ${cy} Z`;
    }
    case "pointed": {
      const w = L * 0.28;
      return `M ${cx} ${cy} C ${cx - w} ${cy - L * 0.45} ${cx - w * 0.25} ${cy - L * 0.92} ${cx} ${cy - L} C ${cx + w * 0.25} ${cy - L * 0.92} ${cx + w} ${cy - L * 0.45} ${cx} ${cy} Z`;
    }
    case "star": {
      const w = L * 0.16;
      return `M ${cx} ${cy} L ${cx - w} ${cy - L * 0.55} L ${cx} ${cy - L} L ${cx + w} ${cy - L * 0.55} Z`;
    }
    case "bell": {
      const w = L * 0.36;
      return `M ${cx} ${cy} C ${cx - w * 0.25} ${cy - L * 0.25} ${cx - w} ${cy - L * 0.5} ${cx - w} ${cy - L * 0.75} C ${cx - w} ${cy - L * 0.95} ${cx + w} ${cy - L * 0.95} ${cx + w} ${cy - L * 0.75} C ${cx + w} ${cy - L * 0.5} ${cx + w * 0.25} ${cy - L * 0.25} ${cx} ${cy} Z`;
    }
    case "cluster":
    default:
      return "";
  }
}

/**
 * Renders one flower as an abstract, radially-symmetric SVG glyph string.
 * Used both for on-screen interactive markup (dangerouslySetInnerHTML) and
 * for the export pipeline (wallpapers, share cards), so the two always match.
 */
export function flowerGlyphMarkup(
  flower: Flower,
  opts: { cx: number; cy: number; scale?: number; instanceId: string; interactive?: boolean; baseLength?: number },
): string {
  const { cx, cy, scale = 1, instanceId, interactive = true, baseLength = 9 } = opts;
  const L = baseLength * scale;
  const petalCount = flower.petalShape === "cluster" ? Math.min(flower.petalCount, 10) : flower.petalCount;
  const gradId = `fg-${instanceId}`;
  const petals: string[] = [];

  for (let i = 0; i < petalCount; i++) {
    const angle = (360 / petalCount) * i;
    if (flower.petalShape === "cluster") {
      const r = L * 0.62;
      const rad = (angle * Math.PI) / 180;
      const px = cx + Math.sin(rad) * r;
      const py = cy - Math.cos(rad) * r;
      petals.push(
        `<circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="${(L * 0.16).toFixed(2)}" fill="url(#${gradId})" />`,
      );
    } else {
      const d = petalPath(flower.petalShape, cx, cy, L);
      petals.push(`<path d="${d}" fill="url(#${gradId})" transform="rotate(${angle.toFixed(2)} ${cx} ${cy})" />`);
    }
  }

  const centerR = (L * 0.17).toFixed(2);
  const label = interactive ? ` data-flower-id="${flower.id}" tabindex="0" role="button" aria-label="${flower.name}"` : "";

  return `<g class="pw-flower"${label}>
    <defs><radialGradient id="${gradId}" cx="35%" cy="28%" r="78%"><stop offset="0%" stop-color="${lightenHex(flower.colorHex, 0.3)}" /><stop offset="100%" stop-color="${flower.colorHex}" /></radialGradient></defs>
    ${petals.join("\n    ")}
    <circle cx="${cx}" cy="${cy}" r="${centerR}" fill="#FBF3DD" opacity="0.92" />
  </g>`;
}

export function composeFlowerIconSvg(flower: Flower, opts?: { size?: number }): string {
  const size = opts?.size ?? 96;
  // A standalone icon should fill most of its frame — much larger than a
  // single bloom sized to sit among others in a bouquet cluster.
  const inner = flowerGlyphMarkup(flower, {
    cx: 50,
    cy: 56,
    scale: 1,
    baseLength: 34,
    instanceId: flower.id,
    interactive: false,
  });
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
}
