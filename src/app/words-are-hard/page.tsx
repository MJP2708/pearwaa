"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { IntroStep } from "@/components/words/intro-step";
import { GuidedQuestions } from "@/components/words/guided-questions";
import { FeelingReveal } from "@/components/words/feeling-reveal";
import { MessageStep } from "@/components/words/message-step";
import { ShareCardStep } from "@/components/words/share-card-step";
import { EmotionPicker } from "@/components/create/emotion-picker";
import { BouquetBuilder } from "@/components/create/bouquet-builder";
import { getEmotion, type Emotion } from "@/data/emotions";
import { getFlowersByEmotion } from "@/data/flowers";

type Step = "intro" | "questions" | "reveal" | "manual" | "bouquet" | "message" | "card";

const stepTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const },
};

export default function WordsAreHardPage() {
  const [history, setHistory] = useState<Step[]>(["intro"]);
  const [emotion, setEmotion] = useState<Emotion | null>(null);
  const [label, setLabel] = useState("");
  const [flowerIds, setFlowerIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");

  const step = history[history.length - 1];

  function push(next: Step) {
    setHistory((h) => [...h, next]);
  }

  function back() {
    setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
  }

  function restart() {
    setHistory(["intro"]);
    setEmotion(null);
    setLabel("");
    setFlowerIds([]);
    setMessage("");
  }

  function applyEmotion(next: Emotion, nextLabel: string) {
    setEmotion(next);
    setLabel(nextLabel);
    setFlowerIds(getFlowersByEmotion(next.id).slice(0, 3).map((f) => f.id));
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <AnimatePresence mode="wait">
        {step === "intro" && (
          <motion.div key="intro" {...stepTransition}>
            <IntroStep onBegin={() => push("questions")} />
          </motion.div>
        )}

        {step === "questions" && (
          <motion.div key="questions" {...stepTransition}>
            <GuidedQuestions
              onDone={(emotionId) => {
                const found = getEmotion(emotionId);
                if (found) applyEmotion(found, found.label);
                push("reveal");
              }}
            />
          </motion.div>
        )}

        {step === "reveal" && emotion && (
          <motion.div key="reveal" {...stepTransition}>
            <FeelingReveal emotion={emotion} onContinue={() => push("bouquet")} onChooseInstead={() => push("manual")} />
          </motion.div>
        )}

        {step === "manual" && (
          <motion.div key="manual" {...stepTransition}>
            <EmotionPicker
              stepLabel="Step 2 of 5"
              onContinue={(result) => {
                applyEmotion(result.emotion, result.label);
                push("bouquet");
              }}
            />
          </motion.div>
        )}

        {step === "bouquet" && emotion && (
          <motion.div key="bouquet" {...stepTransition}>
            <BouquetBuilder
              stepLabel="Step 3 of 5"
              emotion={emotion}
              label={label}
              flowerIds={flowerIds}
              onChangeFlowerIds={setFlowerIds}
              onBack={back}
              onContinue={() => push("message")}
            />
          </motion.div>
        )}

        {step === "message" && (
          <motion.div key="message" {...stepTransition}>
            <MessageStep message={message} onChangeMessage={setMessage} onBack={back} onContinue={() => push("card")} />
          </motion.div>
        )}

        {step === "card" && emotion && (
          <motion.div key="card" {...stepTransition}>
            <ShareCardStep emotion={emotion} flowerIds={flowerIds} message={message} onBack={back} onRestart={restart} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
