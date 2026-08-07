import type { CSSProperties, ReactNode } from "react";
import { lightenHex } from "@/lib/color";
import { cn } from "@/lib/utils";

type Props = {
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** An optional accent color (e.g. an emotion's hex) tinted very lightly
   * into the paper — used by the Bouquet Builder canvas and anywhere else
   * a surface wants to carry a hint of the flower's own color without
   * losing the paper feel underneath. Omit for plain warm paper. */
  tint?: string;
};

/**
 * The one paper texture used everywhere Pearwaa asks someone to write,
 * arrange, or reflect — the Bouquet Builder canvas, the Letter composer,
 * Bouquet Reflection, the letter preview card. A soft warm surface with a
 * faint grain (pure CSS, no image asset), not a plain flat card. Built
 * once so every "paper" moment in the app is visually the same material —
 * see DESIGN_PRINCIPLES.md: "every interaction should feel handcrafted."
 */
export function PaperSurface({ children, className, style, tint }: Props) {
  const base = tint ? lightenHex(tint, 0.9) : "#FBF6EC";
  const wash = tint ? lightenHex(tint, 0.82) : "#F5EEDF";
  return (
    <div
      className={cn("relative overflow-hidden rounded-2xl shadow-[0_1px_2px_rgba(60,40,20,0.06),0_10px_24px_-14px_rgba(60,40,20,0.18)] ring-1 ring-black/5 dark:ring-white/10", className)}
      style={{
        backgroundColor: base,
        backgroundImage: [
          `radial-gradient(circle at 18% 22%, ${wash}, transparent 55%)`,
          `radial-gradient(circle at 82% 78%, ${wash}, transparent 60%)`,
          // A faint grain — three tiny repeating radial dots at slightly
          // different offsets/sizes so it doesn't read as a mechanical grid.
          "radial-gradient(rgba(90,70,40,0.05) 0.5px, transparent 0.5px)",
          "radial-gradient(rgba(90,70,40,0.035) 0.5px, transparent 0.5px)",
        ].join(", "),
        backgroundSize: "auto, auto, 7px 7px, 11px 11px",
        backgroundPosition: "0 0, 0 0, 0 0, 3px 5px",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
