"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EmotionPicker } from "@/components/create/emotion-picker";
import { BouquetBuilder } from "@/components/create/bouquet-builder";
import { LetterComposer } from "@/components/letters/letter-composer";
import { LetterSendStep } from "@/components/letters/letter-send-step";
import type { Emotion } from "@/data/emotions";
import type { FlowerPlacement } from "@/lib/export-image";
import type { PresetId } from "@/lib/layout-presets";

type Step = "feeling" | "bouquet" | "write" | "send";

const stepTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

export default function LettersPage() {
  const [step, setStep] = useState<Step>("feeling");
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [label, setLabel] = useState("");
  const [placements, setPlacements] = useState<FlowerPlacement[]>([]);
  const [preset, setPreset] = useState<PresetId>("freeform");
  const [presetLetter, setPresetLetter] = useState("A");
  const [message, setMessage] = useState("");
  const [senderName, setSenderName] = useState("");

  function reset() {
    setStep("feeling");
    setEmotion(null);
    setLabel("");
    setPlacements([]);
    setPreset("freeform");
    setPresetLetter("A");
    setMessage("");
    setSenderName("");
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <AnimatePresence mode="wait">
        {step === "feeling" && (
          <motion.div key="feeling" {...stepTransition}>
            <EmotionPicker
              stepLabel="Step 1 of 4"
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
              stepLabel="Step 2 of 4"
              emotion={emotion}
              label={label}
              placements={placements}
              onChangePlacements={setPlacements}
              preset={preset}
              presetLetter={presetLetter}
              onChangePreset={(nextPreset, nextLetter) => {
                setPreset(nextPreset);
                setPresetLetter(nextLetter);
              }}
              onBack={() => setStep("feeling")}
              onContinue={() => setStep("write")}
            />
          </motion.div>
        )}

        {step === "write" && (
          <motion.div key="write" {...stepTransition}>
            <LetterComposer
              message={message}
              onChangeMessage={setMessage}
              senderName={senderName}
              onChangeSenderName={setSenderName}
              onBack={() => setStep("bouquet")}
              onContinue={() => setStep("send")}
            />
          </motion.div>
        )}

        {step === "send" && emotion && (
          <motion.div key="send" {...stepTransition}>
            <LetterSendStep
              emotion={emotion}
              message={message}
              senderName={senderName}
              placements={placements}
              onBack={() => setStep("write")}
              onRestart={reset}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
