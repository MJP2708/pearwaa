"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

type QuestionOption = { text: string; emotionId: string };
type Question = { prompt: string; options: QuestionOption[] };

const QUESTIONS: Question[] = [
  {
    prompt: "Where does this feeling sit in your body?",
    options: [
      { text: "Heavy, low in my chest", emotionId: "grief" },
      { text: "Buzzing, everywhere at once", emotionId: "overwhelm" },
      { text: "Tight, right in my throat", emotionId: "courage" },
      { text: "Light, like it might lift", emotionId: "hope" },
    ],
  },
  {
    prompt: "If it were weather, what would it be?",
    options: [
      { text: "Fog that hasn't lifted", emotionId: "grief" },
      { text: "A storm with nowhere to land", emotionId: "overwhelm" },
      { text: "The stillness before saying something hard", emotionId: "courage" },
      { text: "First sun after days of rain", emotionId: "hope" },
    ],
  },
  {
    prompt: "What does it want from you right now?",
    options: [
      { text: "To be sat with, not solved", emotionId: "grief" },
      { text: "A little room to breathe", emotionId: "overwhelm" },
      { text: "To be let out, even shakily", emotionId: "courage" },
      { text: "To be let in, and shared", emotionId: "hope" },
    ],
  },
];

function pickWinner(answers: string[]): string {
  const counts = new Map<string, number>();
  for (const a of answers) counts.set(a, (counts.get(a) ?? 0) + 1);
  let best = answers[0];
  let bestCount = 0;
  for (const [id, count] of counts) {
    if (count > bestCount) {
      best = id;
      bestCount = count;
    }
  }
  return best;
}

export function GuidedQuestions({ onDone }: { onDone: (emotionId: string) => void }) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);

  function choose(emotionId: string) {
    const next = [...answers];
    next[index] = emotionId;
    if (index === QUESTIONS.length - 1) {
      onDone(pickWinner(next));
      return;
    }
    setAnswers(next);
    setIndex(index + 1);
  }

  const question = QUESTIONS[index];

  return (
    <div className="mx-auto max-w-xl">
      <div className="flex items-center gap-1.5" aria-hidden="true">
        {QUESTIONS.map((_, i) => (
          <span
            key={i}
            className={cn("h-1.5 rounded-full transition-all duration-500", i <= index ? "w-8 bg-primary" : "w-4 bg-border")}
          />
        ))}
      </div>
      <p className="mt-5 text-sm font-medium text-primary">
        Question {index + 1} of {QUESTIONS.length}
      </p>
      <h1 className="mt-2 font-heading text-2xl font-normal text-foreground sm:text-3xl">{question.prompt}</h1>

      <div className="mt-7 flex flex-col gap-2.5" role="group" aria-label={question.prompt}>
        {question.options.map((opt) => (
          <button
            key={opt.text}
            type="button"
            onClick={() => choose(opt.emotionId)}
            className="rounded-2xl border border-border/70 bg-card px-5 py-3.5 text-left text-sm text-foreground transition-colors hover:border-primary/40 hover:bg-accent/30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {opt.text}
          </button>
        ))}
      </div>

      {index > 0 && (
        <button
          type="button"
          onClick={() => setIndex((i) => i - 1)}
          className="mt-6 rounded text-xs text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          Go back a question
        </button>
      )}
    </div>
  );
}
