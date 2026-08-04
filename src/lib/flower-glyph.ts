import type { Flower, PetalShape } from "@/data/flowers";

const INK_GREEN = "#4C6B45";
const DEEP_INK = "#4A3B52";

/** Deterministic pseudo-random in [0,1), seeded by index + salt — gives
 * every petal its own slight, consistent irregularity instead of being a
 * perfect radial copy, without ever reshuffling between renders. Uses only
 * integer bitwise ops (no Math.sin/transcendental functions) — those
 * aren't guaranteed bit-identical across engine versions per spec, which
 * was previously causing SSR/client hydration mismatches here. */
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

/** Perceived brightness in [0,1] — catches flowers whose base color is
 * itself near-white (a plain white/cream bloom): mixing an already-pale
 * color further toward white/paper would leave nothing to see. */
function luminance(hex: string): number {
  const c = hex.replace("#", "");
  const num = parseInt(c, 16);
  const r = (num >> 16) & 255,
    g = (num >> 8) & 255,
    b = num & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

/** One petal's soft outer "bleed" blob and smaller, more saturated "pigment
 * core" blob — an almond/teardrop silhouette loose enough that the SVG
 * turbulence filter (applied by the caller) reads as pigment spreading into
 * damp paper rather than a precise botanical outline. */
function petalBlobs(shape: PetalShape, L: number, seedIndex: number): { bleed: string; core: string } {
  const j = (n: number, spread: number) => (seeded(seedIndex, n) - 0.5) * spread;

  if (shape === "star") {
    const w = L * (0.22 + j(1, 0.04));
    const tip = L * (0.98 + j(2, 0.08));
    const bleed = `M 0 0 C ${-w * 1.3} ${-L * 0.4} ${-w * 0.5} ${-tip * 0.85} 0 ${-tip} C ${w * 0.5} ${-tip * 0.85} ${w * 1.3} ${-L * 0.4} 0 0 Z`;
    const cw = w * 0.55;
    const ct = tip * 0.72;
    const core = `M 0 0 C ${-cw} ${-L * 0.28} ${-cw * 0.4} ${-ct * 0.85} 0 ${-ct} C ${cw * 0.4} ${-ct * 0.85} ${cw} ${-L * 0.28} 0 0 Z`;
    return { bleed, core };
  }

  // round / pointed / bell all read fine as one loose teardrop at this
  // scale — the point of this style is that precise botanical distinction
  // between petal shapes matters less than the gesture and color.
  const w = L * (0.36 + j(1, 0.06));
  const tip = L * (0.96 + j(2, 0.1));
  const lean = j(3, 0.12) * L;
  const bleed = `M 0 0 C ${-w - j(4, 3)} ${-L * 0.3} ${-w * 0.6 + lean * 0.4} ${-tip * 0.92} ${lean} ${-tip} C ${w * 0.6 + lean * 0.4} ${-tip * 0.92} ${w + j(5, 3)} ${-L * 0.3} 0 0 Z`;
  const cw = w * 0.58;
  const ct = tip * 0.68;
  const cLean = lean * 0.6;
  const core = `M 0 0 C ${-cw} ${-L * 0.24} ${-cw * 0.55 + cLean * 0.4} ${-ct * 0.9} ${cLean} ${-ct} C ${cw * 0.55 + cLean * 0.4} ${-ct * 0.9} ${cw} ${-L * 0.24} 0 0 Z`;
  return { bleed, core };
}

/**
 * Renders one flower as a loose watercolor sketch — soft pigment-bleed
 * blobs fading toward paper, a confident single-line ink stem, and a few
 * paint-spatter accents. Used both for on-screen interactive markup
 * (dangerouslySetInnerHTML) and for the export pipeline (wallpapers, share
 * cards, Flower Letters), so the two always match.
 *
 * Two things this accounts for that a first pass at the style missed:
 *
 * 1. Contrast floor — a near-white base color (e.g. a white chrysanthemum)
 *    mixed further toward white/paper leaves nothing to see. `contrastT`
 *    scales the ink-mix and reduces the white-mix for pale flowers only,
 *    leaving saturated flowers' true hue untouched.
 * 2. Legibility factor — stroke widths, blur, and turbulence displacement
 *    read as loose and painterly at a large "specimen" render, but most
 *    real usages of this glyph are 22–72px, where the same viewBox-unit
 *    values either vanish (sub-pixel strokes) or smear into more blur than
 *    intended. `legibility` (driven by the actual pixel size passed down
 *    to composeFlowerIconSvg) thickens strokes and tightens the
 *    wobble/blur at small sizes, while leaving large renders as loose as
 *    designed.
 */
export function flowerGlyphMarkup(
  flower: Flower,
  opts: { cx: number; cy: number; scale?: number; instanceId: string; interactive?: boolean; baseLength?: number; renderSize?: number },
): string {
  const { cx, cy, scale = 1, instanceId, interactive = true, baseLength = 9, renderSize = 96 } = opts;
  const L = baseLength * scale;
  const petalCount = flower.petalShape === "cluster" ? Math.min(flower.petalCount, 9) : Math.min(flower.petalCount, 8);
  const bleedId = `wc-bleed-${instanceId}`;
  const softId = `wc-soft-${instanceId}`;
  const seed = (seeded(petalCount, 3) * 999) | 0;

  // 1 at "large specimen" sizes, up to 2.4 at the smallest bouquet icons.
  const legibility = Math.min(2.4, Math.max(1, 110 / renderSize));
  // Converts a desired real screen-pixel width into this glyph's viewBox
  // units. A floor like `Math.max(0.4, L * k)` still goes sub-pixel (and
  // effectively vanishes) whenever `L` itself is small — which it always
  // is for bouquet-placement instances (baseLength 9 × a fractional
  // placement scale). Flooring against actual render pixels, not viewBox
  // units, is what actually guarantees a visible line at every size.
  const px = (minPx: number) => (minPx / renderSize) * 100;

  // Contrast against arbitrary backgrounds (the bouquet canvas tints its
  // background toward the emotion's own accent color, which can sit close
  // in hue to the flower itself) can't be solved by fill color alone —
  // fixing it purely by mixing toward white/ink only helps against a white
  // background. `ringColor` gives every petal a soft, darker pigment-edge
  // (real watercolor pools darker at the rim of a wash) that reads against
  // any ground, independent of what's behind it.
  const lum = luminance(flower.colorHex);
  const contrastT = Math.max(0, lum - 0.55) * 0.75;
  const washColor = mixHex(flower.colorHex, "#FFFFFF", Math.max(0.22, 0.5 - contrastT));
  const coreColor = mixHex(flower.colorHex, DEEP_INK, Math.min(0.45, 0.18 + contrastT));
  const ringColor = mixHex(flower.colorHex, DEEP_INK, Math.min(0.65, 0.42 + contrastT));

  const bleedScale = (0.22 / legibility).toFixed(3);
  const softScale = (0.1 / legibility).toFixed(3);
  const coreOpacity = Math.min(0.97, 0.86 + legibility * 0.04).toFixed(2);
  const washOpacity = Math.min(0.65, 0.42 + legibility * 0.05).toFixed(2);
  const ringWidth = Math.max(px(0.9), L * 0.03 * legibility).toFixed(2);
  const ringOpacity = Math.min(0.65, 0.4 + legibility * 0.06).toFixed(2);
  const stemWidth = Math.max(px(1.1), L * 0.045 * legibility).toFixed(2);
  const gestureWidth = Math.max(px(0.55), L * 0.02 * legibility).toFixed(2);

  const petals: string[] = [];
  for (let i = 0; i < petalCount; i++) {
    const angle = (360 / petalCount) * i + (seeded(i, 41) - 0.5) * 10;
    const g = `<g transform="translate(${cx} ${cy}) rotate(${angle.toFixed(2)})">`;

    if (flower.petalShape === "cluster") {
      const r = L * (0.55 + (seeded(i, 8) - 0.5) * 0.12);
      const rr = L * (0.17 + (seeded(i, 9) - 0.5) * 0.05);
      petals.push(
        `<g transform="translate(${cx} ${cy}) rotate(${angle.toFixed(2)})">` +
          `<circle cx="0" cy="${(-r).toFixed(2)}" r="${(rr * 1.5).toFixed(2)}" fill="${washColor}" opacity="${washOpacity}" filter="url(#${bleedId})" />` +
          `<circle cx="0" cy="${(-r).toFixed(2)}" r="${rr.toFixed(2)}" fill="${coreColor}" opacity="${coreOpacity}" filter="url(#${softId})" />` +
          `<circle cx="0" cy="${(-r).toFixed(2)}" r="${rr.toFixed(2)}" fill="none" stroke="${ringColor}" stroke-width="${ringWidth}" opacity="${ringOpacity}" />` +
          `</g>`,
      );
      continue;
    }

    const { bleed, core } = petalBlobs(flower.petalShape, L, i);
    petals.push(
      g +
        `<path d="${bleed}" fill="${washColor}" opacity="${washOpacity}" filter="url(#${bleedId})" />` +
        `<path d="${core}" fill="${coreColor}" opacity="${coreOpacity}" filter="url(#${softId})" />` +
        `<path d="${core}" fill="none" stroke="${ringColor}" stroke-width="${ringWidth}" opacity="${ringOpacity}" stroke-linejoin="round" />` +
        `<path d="M 0 0 Q ${(L * 0.05).toFixed(2)} ${(-L * 0.5).toFixed(2)} 0 ${(-L * 0.82).toFixed(2)}" stroke="${mixHex(flower.colorHex, DEEP_INK, 0.35 + contrastT)}" stroke-width="${gestureWidth}" fill="none" opacity="0.45" stroke-linecap="round" />` +
        `</g>`,
    );
  }

  // A handful of loose paint-spatter dots scattered just outside the bloom.
  const spatters: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = seeded(i, 71) * Math.PI * 2;
    const dist = L * (1.05 + seeded(i, 72) * 0.55);
    const r = L * (0.02 + seeded(i, 73) * 0.045) * Math.sqrt(legibility);
    const sx = cx + Math.sin(a) * dist;
    const sy = cy - Math.cos(a) * dist * 0.9;
    spatters.push(
      `<circle cx="${sx.toFixed(2)}" cy="${sy.toFixed(2)}" r="${r.toFixed(2)}" fill="${coreColor}" opacity="${(0.22 + seeded(i, 74) * 0.25).toFixed(2)}" filter="url(#${softId})" />`,
    );
  }

  const stemJitter = (seeded(1, 91) - 0.5) * L * 0.18;
  const stemBottomY = Math.min(98, cy + L * 1.15);
  const stemTopY = cy + L * 0.08;
  const label = interactive ? ` data-flower-id="${flower.id}" tabindex="0" role="button" aria-label="${flower.name}"` : "";

  return `<g class="pw-flower"${label}>
    <defs>
      <filter id="${bleedId}" x="-60%" y="-60%" width="220%" height="220%" primitiveUnits="objectBoundingBox">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed}" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="${bleedScale}" xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation="0.012" />
      </filter>
      <filter id="${softId}" x="-60%" y="-60%" width="220%" height="220%" primitiveUnits="objectBoundingBox">
        <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="${seed + 17}" result="noise2" />
        <feDisplacementMap in="SourceGraphic" in2="noise2" scale="${softScale}" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>

    <path d="M ${cx.toFixed(2)} ${stemTopY.toFixed(2)} Q ${(cx + stemJitter).toFixed(2)} ${((stemTopY + stemBottomY) / 2).toFixed(2)} ${cx.toFixed(2)} ${stemBottomY.toFixed(2)}"
      stroke="${INK_GREEN}" stroke-width="${stemWidth}" fill="none" opacity="0.85" stroke-linecap="round" />

    ${spatters.join("\n    ")}
    ${petals.join("\n    ")}

    <circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(L * 0.24).toFixed(2)}" fill="${mixHex("#FBEFC9", flower.colorHex, 0.08)}" opacity="${washOpacity}" filter="url(#${bleedId})" />
    <circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(L * 0.13).toFixed(2)}" fill="#F6DE9E" opacity="${coreOpacity}" filter="url(#${softId})" />
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
    renderSize: size,
  });
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
}
