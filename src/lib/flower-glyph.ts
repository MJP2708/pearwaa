import type { Flower, PetalShape } from "@/data/flowers";

const INK = "#4A3B52";

/** Deterministic pseudo-random in [0,1), seeded by petal index + a salt —
 * gives every petal its own slight, consistent irregularity instead of
 * being a perfect radial copy, without ever reshuffling between renders.
 * Uses only integer bitwise ops (no Math.sin/transcendental functions) —
 * those aren't guaranteed bit-identical across engine versions per spec,
 * which was previously causing SSR/client hydration mismatches here. */
function seeded(i: number, salt: number): number {
  let h = (i * 374761393 + salt * 668265263) | 0;
  h = (h ^ (h >>> 13)) | 0;
  h = Math.imul(h, 1274126177);
  h = (h ^ (h >>> 16)) | 0;
  return (h >>> 0) / 4294967296;
}

function mixHex(hexA: string, hexB: string, t: number): string {
  const a = hexA.replace("#", "");
  const b = hexB.replace("#", "");
  const an = parseInt(a, 16);
  const bn = parseInt(b, 16);
  const ar = (an >> 16) & 255,
    ag = (an >> 8) & 255,
    ab = an & 255;
  const br = (bn >> 16) & 255,
    bg = (bn >> 8) & 255,
    bb = bn & 255;
  const r = Math.round(ar + (br - ar) * t);
  const g = Math.round(ag + (bg - ag) * t);
  const bch = Math.round(ab + (bb - ab) * t);
  return `rgb(${r}, ${g}, ${bch})`;
}

/** One petal's outline plus a smaller "inner wash" shape (a botanical-
 * illustration watercolor-pooling cue), both nudged by seeded jitter so no
 * two petals on a flower are quite identical. */
function petalShapes(shape: PetalShape, cx: number, cy: number, L: number, seedIndex: number): { outline: string; innerWash: string } {
  const j = (n: number, spread: number) => (seeded(seedIndex, n) - 0.5) * spread;

  switch (shape) {
    case "round": {
      const w = L * (0.42 + j(1, 0.06));
      const tipX = j(2, 0.08) * L;
      const outline = `M ${cx} ${cy} C ${cx - w + j(3, 3)} ${cy - L * 0.3} ${cx - w * 0.6} ${cy - L * (0.95 + j(4, 0.1))} ${cx + tipX} ${cy - L} C ${cx + w * 0.6} ${cy - L * (0.95 + j(5, 0.1))} ${cx + w - j(6, 3)} ${cy - L * 0.3} ${cx} ${cy} Z`;
      const iw = w * 0.55;
      const innerWash = `M ${cx} ${cy} C ${cx - iw} ${cy - L * 0.22} ${cx - iw * 0.5} ${cy - L * 0.65} ${cx} ${cy - L * 0.72} C ${cx + iw * 0.5} ${cy - L * 0.65} ${cx + iw} ${cy - L * 0.22} ${cx} ${cy} Z`;
      return { outline, innerWash };
    }
    case "pointed": {
      const w = L * (0.28 + j(1, 0.05));
      const outline = `M ${cx} ${cy} C ${cx - w + j(2, 2)} ${cy - L * 0.45} ${cx - w * 0.25} ${cy - L * 0.92} ${cx + j(3, 0.06) * L} ${cy - L} C ${cx + w * 0.25} ${cy - L * 0.92} ${cx + w - j(4, 2)} ${cy - L * 0.45} ${cx} ${cy} Z`;
      const iw = w * 0.5;
      const innerWash = `M ${cx} ${cy} C ${cx - iw} ${cy - L * 0.3} ${cx - iw * 0.4} ${cy - L * 0.6} ${cx} ${cy - L * 0.65} C ${cx + iw * 0.4} ${cy - L * 0.6} ${cx + iw} ${cy - L * 0.3} ${cx} ${cy} Z`;
      return { outline, innerWash };
    }
    case "star": {
      const w = L * (0.16 + j(1, 0.03));
      const outline = `M ${cx} ${cy} L ${cx - w + j(2, 1.5)} ${cy - L * 0.55} L ${cx + j(3, 0.05) * L} ${cy - L} L ${cx + w - j(4, 1.5)} ${cy - L * 0.55} Z`;
      const innerWash = `M ${cx} ${cy} L ${cx - w * 0.4} ${cy - L * 0.35} L ${cx} ${cy - L * 0.5} L ${cx + w * 0.4} ${cy - L * 0.35} Z`;
      return { outline, innerWash };
    }
    case "bell": {
      const w = L * (0.36 + j(1, 0.05));
      const outline = `M ${cx} ${cy} C ${cx - w * 0.25} ${cy - L * 0.25} ${cx - w} ${cy - L * 0.5} ${cx - w + j(2, 2)} ${cy - L * 0.75} C ${cx - w} ${cy - L * 0.95} ${cx + w} ${cy - L * 0.95} ${cx + w - j(3, 2)} ${cy - L * 0.75} C ${cx + w} ${cy - L * 0.5} ${cx + w * 0.25} ${cy - L * 0.25} ${cx} ${cy} Z`;
      const iw = w * 0.55;
      const innerWash = `M ${cx} ${cy} C ${cx - iw * 0.3} ${cy - L * 0.2} ${cx - iw} ${cy - L * 0.45} ${cx - iw} ${cy - L * 0.6} L ${cx + iw} ${cy - L * 0.6} C ${cx + iw} ${cy - L * 0.45} ${cx + iw * 0.3} ${cy - L * 0.2} ${cx} ${cy} Z`;
      return { outline, innerWash };
    }
    case "cluster":
    default:
      return { outline: "", innerWash: "" };
  }
}

/**
 * Renders one flower as a soft, botanical-illustration-style SVG glyph —
 * ink outline, gentle organic irregularity, a two-tone watercolor-style
 * wash, and fine vein linework — rather than a flat vector icon. Used both
 * for on-screen interactive markup (dangerouslySetInnerHTML) and for the
 * export pipeline (wallpapers, share cards, Flower Letters), so the two
 * always match.
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
  const veins: string[] = [];

  const washColor = mixHex(flower.colorHex, "#FFFFFF", 0.35);
  const deepColor = mixHex(flower.colorHex, INK, 0.14);
  const strokeW = Math.max(0.35, L * 0.05);

  for (let i = 0; i < petalCount; i++) {
    const angle = (360 / petalCount) * i;
    if (flower.petalShape === "cluster") {
      const r = L * 0.62;
      const rad = (angle * Math.PI) / 180;
      const px = cx + Math.sin(rad) * r;
      const py = cy - Math.cos(rad) * r;
      const rr = L * (0.16 + (seeded(i, 9) - 0.5) * 0.04);
      petals.push(
        `<circle cx="${px.toFixed(2)}" cy="${py.toFixed(2)}" r="${rr.toFixed(2)}" fill="url(#${gradId})" stroke="${INK}" stroke-width="${(strokeW * 0.6).toFixed(2)}" opacity="0.94" />`,
      );
    } else {
      const { outline, innerWash } = petalShapes(flower.petalShape, cx, cy, L, i);
      const rot = `rotate(${(angle + (seeded(i, 21) - 0.5) * 4).toFixed(2)} ${cx} ${cy})`;
      petals.push(
        `<g transform="${rot}">` +
          `<path d="${outline}" fill="url(#${gradId})" stroke="${INK}" stroke-width="${strokeW.toFixed(2)}" stroke-linejoin="round" />` +
          `<path d="${innerWash}" fill="${washColor}" opacity="0.4" />` +
          `</g>`,
      );
      veins.push(
        `<path d="M ${cx} ${cy} Q ${cx + L * 0.06} ${cy - L * 0.55} ${cx} ${cy - L * 0.9}" transform="${rot}" stroke="${deepColor}" stroke-width="${Math.max(0.2, L * 0.014).toFixed(2)}" fill="none" opacity="0.4" stroke-linecap="round" />`,
      );
    }
  }

  const centerR = (L * 0.17).toFixed(2);
  const label = interactive ? ` data-flower-id="${flower.id}" tabindex="0" role="button" aria-label="${flower.name}"` : "";

  return `<g class="pw-flower"${label}>
    <defs><radialGradient id="${gradId}" cx="38%" cy="30%" r="80%"><stop offset="0%" stop-color="${mixHex(flower.colorHex, "#FFFFFF", 0.28)}" /><stop offset="100%" stop-color="${mixHex(flower.colorHex, INK, 0.06)}" /></radialGradient></defs>
    ${petals.join("\n    ")}
    ${veins.join("\n    ")}
    <circle cx="${cx}" cy="${cy}" r="${centerR}" fill="#FBF3DD" stroke="${INK}" stroke-width="${(strokeW * 0.7).toFixed(2)}" opacity="0.96" />
    <circle cx="${cx}" cy="${cy}" r="${(Number(centerR) * 0.5).toFixed(2)}" fill="${mixHex("#FBF3DD", INK, 0.12)}" opacity="0.5" />
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
