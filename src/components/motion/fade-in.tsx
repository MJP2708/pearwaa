"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

/** Gentle fade-up used for first-paint content. Framer's global
 * MotionConfig (see AccessibilityProvider) collapses this automatically
 * when the user prefers or has requested reduced motion. */
export function FadeIn({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
