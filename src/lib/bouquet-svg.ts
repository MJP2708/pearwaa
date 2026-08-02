import { getFlower } from "@/data/flowers";
import { flowerGlyphMarkup } from "./flower-glyph";
import { computeBouquetLayout, computeFillerDots } from "./bouquet-layout";

export type ComposeBouquetOptions = {
  size?: number;
  background?: string | null;
  interactive?: boolean;
};

/**
 * Builds the full bouquet as a self-contained SVG string. This is the single
 * source of truth for bouquet visuals — the on-screen builder renders it via
 * dangerouslySetInnerHTML, and the wallpaper/share-card exporters rasterize
 * this exact same markup, so what you build is what you download.
 */
export function composeBouquetSvg(flowerIds: string[], opts: ComposeBouquetOptions = {}): string {
  const size = opts.size ?? 640;
  const interactive = opts.interactive ?? true;
  const layout = computeBouquetLayout(flowerIds);
  const fillers = computeFillerDots(flowerIds.length);

  const bgRect = opts.background ? `<rect x="0" y="0" width="100" height="100" fill="${opts.background}" />` : "";

  const fillerMarkup = fillers
    .map((d) => `<circle cx="${d.cx.toFixed(2)}" cy="${d.cy.toFixed(2)}" r="${d.r.toFixed(2)}" fill="#B9C7AE" opacity="0.5" />`)
    .join("");

  const flowerMarkup = layout
    .map((item, i) => {
      const flower = getFlower(item.flowerId);
      if (!flower) return "";
      return flowerGlyphMarkup(flower, {
        cx: item.cx,
        cy: item.cy,
        scale: item.scale,
        baseLength: 15,
        instanceId: `${item.flowerId}-${i}`,
        interactive,
      });
    })
    .join("\n");

  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">${bgRect}${fillerMarkup}${flowerMarkup}</svg>`;
}
