"use client";

import { motion } from "framer-motion";
import { BouquetCanvas } from "@/components/bouquet-canvas";

const SAMPLE_BOUQUET = ["peony", "lavender", "sunflower", "forget-me-not", "wisteria", "daffodil"];

export function HomeBouquetPreview() {
  return (
    <div className="relative rounded-[2.5rem] bg-gradient-to-b from-accent/60 to-secondary/40 p-10 sm:p-14">
      <motion.div
        animate={{ scale: [1, 1.015, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <BouquetCanvas flowerIds={SAMPLE_BOUQUET} className="drop-shadow-sm" />
      </motion.div>
    </div>
  );
}
