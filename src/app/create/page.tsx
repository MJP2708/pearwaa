"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EmotionPicker } from "@/components/create/emotion-picker";
import { BouquetBuilder } from "@/components/create/bouquet-builder";
import { WallpaperStep } from "@/components/create/wallpaper-step";
import type { Emotion } from "@/data/emotions";
import type { FlowerPlacement } from "@/lib/export-image";

type Step = "feeling" | "bouquet" | "wallpaper";

const stepTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

export default function CreatePage() {
  const [step, setStep] = useState<Step>("feeling");
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [label, setLabel] = useState("");
  const [placements, setPlacements] = useState<FlowerPlacement[]>([]);

  function reset() {
    setStep("feeling");
    setEmotion(null);
    setLabel("");
    setPlacements([]);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <AnimatePresence mode="wait">
        {step === "feeling" && (
          <motion.div key="feeling" {...stepTransition}>
            <EmotionPicker
              onContinue={(result) => {
                setEmotion(result.emotion);
                setLabel(result.label);
                setStep("bouquet");
              }}
            />
          </motion.div>
        )}

        {step === "bouquet" && emotion && (
          <motion.div key="bouquet" {...stepTransition}>
            <BouquetBuilder
              emotion={emotion}
              label={label}
              placements={placements}
              onChangePlacements={setPlacements}
              onBack={() => setStep("feeling")}
              onContinue={() => setStep("wallpaper")}
            />
          </motion.div>
        )}

        {step === "wallpaper" && emotion && (
          <motion.div key="wallpaper" {...stepTransition}>
            <WallpaperStep
              emotion={emotion}
              label={label}
              bouquetPlacements={placements}
              onBack={() => setStep("bouquet")}
              onRestart={reset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
