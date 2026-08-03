import type { Flower, PetalShape } from "@/data/flowers";

const INK_GREEN = "#4C6B45";
const DEEP_INK = "#4A3B52";

/** Deterministic pseudo-random in [0,1), seeded by index + salt — see
 * flower-glyph.ts for why this avoids Math.sin (SSR/client hydration
 * mismatches across JS engines). Duplicated here rather than imported since
 * this is a standalone prototype, not yet wired into production code. */
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

/** Perceived brightness in [0,1] — used to catch flowers whose base color is
 * itself near-white (the chrysanthemum problem: mixing an already-pale
 * color further toward white/paper leaves nothing to see). */
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
 * paint-spatter accents — rather than the crisp ink-outline botanical style
 * currently in production. Prototype only: not yet wired into
 * FlowerGlyphIcon or the export pipeline pending style sign-off.
 */
export function watercolorFlowerMarkup(flower: Flower, opts: { cx: number; cy: number; scale?: number; instanceId: string; baseLength?: number }): string {
  const { cx, cy, scale = 1, instanceId, baseLength = 34 } = opts;
  const L = baseLength * scale;
  const petalCount = flower.petalShape === "cluster" ? Math.min(flower.petalCount, 9) : Math.min(flower.petalCount, 8);
  const bleedId = `wc-bleed-${instanceId}`;
  const blurId = `wc-blur-${instanceId}`;
  const softId = `wc-soft-${instanceId}`;
  const seed = (seeded(petalCount, 3) * 999) | 0;

  const washColor = mixHex(flower.colorHex, "#FFFFFF", 0.5);
  const coreColor = mixHex(flower.colorHex, DEEP_INK, 0.08);

  const petals: string[] = [];
  for (let i = 0; i < petalCount; i++) {
    const angle = (360 / petalCount) * i + (seeded(i, 41) - 0.5) * 10;
    const g = `<g transform="translate(${cx} ${cy}) rotate(${angle.toFixed(2)})">`;

    if (flower.petalShape === "cluster") {
      const r = L * (0.55 + (seeded(i, 8) - 0.5) * 0.12);
      const rr = L * (0.17 + (seeded(i, 9) - 0.5) * 0.05);
      petals.push(
        `<g transform="translate(${cx} ${cy}) rotate(${angle.toFixed(2)})">` +
          `<circle cx="0" cy="${(-r).toFixed(2)}" r="${(rr * 1.5).toFixed(2)}" fill="${washColor}" opacity="0.4" filter="url(#${bleedId})" />` +
          `<circle cx="0" cy="${(-r).toFixed(2)}" r="${rr.toFixed(2)}" fill="${coreColor}" opacity="0.8" filter="url(#${softId})" />` +
          `</g>`,
      );
      continue;
    }

    const { bleed, core } = petalBlobs(flower.petalShape, L, i);
    petals.push(
      g +
        `<path d="${bleed}" fill="${washColor}" opacity="0.38" filter="url(#${bleedId})" />` +
        `<path d="${core}" fill="${coreColor}" opacity="0.82" filter="url(#${softId})" />` +
        `<path d="M 0 0 Q ${(L * 0.05).toFixed(2)} ${(-L * 0.5).toFixed(2)} 0 ${(-L * 0.82).toFixed(2)}" stroke="${mixHex(flower.colorHex, DEEP_INK, 0.35)}" stroke-width="${Math.max(0.3, L * 0.02).toFixed(2)}" fill="none" opacity="0.35" stroke-linecap="round" />` +
        `</g>`,
    );
  }

  // A handful of loose paint-spatter dots scattered just outside the bloom.
  const spatters: string[] = [];
  for (let i = 0; i < 6; i++) {
    const a = seeded(i, 71) * Math.PI * 2;
    const dist = L * (1.05 + seeded(i, 72) * 0.55);
    const r = L * (0.02 + seeded(i, 73) * 0.045);
    const sx = cx + Math.sin(a) * dist;
    const sy = cy - Math.cos(a) * dist * 0.9;
    spatters.push(
      `<circle cx="${sx.toFixed(2)}" cy="${sy.toFixed(2)}" r="${r.toFixed(2)}" fill="${coreColor}" opacity="${(0.2 + seeded(i, 74) * 0.25).toFixed(2)}" filter="url(#${softId})" />`,
    );
  }

  const stemJitter = (seeded(1, 91) - 0.5) * L * 0.18;
  const stemBottomY = Math.min(98, cy + L * 1.15);
  const stemTopY = cy + L * 0.08;

  return `<g class="pw-flower-watercolor">
    <defs>
      <filter id="${bleedId}" x="-60%" y="-60%" width="220%" height="220%" primitiveUnits="objectBoundingBox">
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="${seed}" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.22" xChannelSelector="R" yChannelSelector="G" />
        <feGaussianBlur stdDeviation="0.012" />
      </filter>
      <filter id="${softId}" x="-60%" y="-60%" width="220%" height="220%" primitiveUnits="objectBoundingBox">
        <feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="${seed + 17}" result="noise2" />
        <feDisplacementMap in="SourceGraphic" in2="noise2" scale="0.1" xChannelSelector="R" yChannelSelector="G" />
      </filter>
      <filter id="${blurId}"><feGaussianBlur stdDeviation="${(L * 0.02).toFixed(2)}" /></filter>
    </defs>

    <path d="M ${cx.toFixed(2)} ${stemTopY.toFixed(2)} Q ${(cx + stemJitter).toFixed(2)} ${((stemTopY + stemBottomY) / 2).toFixed(2)} ${cx.toFixed(2)} ${stemBottomY.toFixed(2)}"
      stroke="${INK_GREEN}" stroke-width="${Math.max(0.6, L * 0.045).toFixed(2)}" fill="none" opacity="0.85" stroke-linecap="round" />

    ${spatters.join("\n    ")}
    ${petals.join("\n    ")}

    <circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(L * 0.24).toFixed(2)}" fill="${mixHex("#FBEFC9", flower.colorHex, 0.08)}" opacity="0.55" filter="url(#${bleedId})" />
    <circle cx="${cx.toFixed(2)}" cy="${cy.toFixed(2)}" r="${(L * 0.13).toFixed(2)}" fill="#F6DE9E" opacity="0.85" filter="url(#${softId})" />
  </g>`;
}

export function composeWatercolorFlowerSvg(flower: Flower, opts?: { size?: number }): string {
  const size = opts?.size ?? 96;
  const inner = watercolorFlowerMarkup(flower, { cx: 50, cy: 50, scale: 1, baseLength: 30, instanceId: flower.id });
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${inner}</svg>`;
}
