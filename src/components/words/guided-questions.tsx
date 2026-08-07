"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type QuestionOption = { text: string; emotionId: string };
type Question = { prompt: string; placeholder: string; options: QuestionOption[] };

// A short, supportive back-and-forth rather than a form — each step asks
// one thing, in plain words, and free text is always an option alongside
// the gentle chips. See DESIGN_PRINCIPLES.md.
const QUESTIONS: Question[] = [
  {
    prompt: "Who's on your mind today?",
    placeholder: "Their name, or just who they are to you…",
    options: [
      { text: "Someone I miss", emotionId: "grief" },
      { text: "Someone I'm grateful for", emotionId: "hope" },
      { text: "Someone I've let too much go unsaid with", emotionId: "courage" },
      { text: "Myself, honestly", emotionId: "overwhelm" },
    ],
  },
  {
    prompt: "What do you wish they knew?",
    placeholder: "One thing, even a small one…",
    options: [
      { text: "That I'm not okay right now", emotionId: "overwhelm" },
      { text: "That I never stopped caring", emotionId: "grief" },
      { text: "That I'm proud of them", emotionId: "hope" },
      { text: "That this is hard for me to say", emotionId: "courage" },
    ],
  },
  {
    prompt: "What's hardest to say?",
    placeholder: "You don't have to get it exactly right…",
    options: [
      { text: "I'm scared it's too late", emotionId: "grief" },
      { text: "I need more from you", emotionId: "overwhelm" },
      { text: "I love you", emotionId: "hope" },
      { text: "I'm sorry", emotionId: "courage" },
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
  const [freeText, setFreeText] = useState("");

  function advance(emotionId: string) {
    const next = [...answers];
    next[index] = emotionId;
    setFreeText("");
    if (index === QUESTIONS.length - 1) {
      onDone(pickWinner(next));
      return;
    }
    setAnswers(next);
    setIndex(index + 1);
  }

  // Free text has no signal about which emotion it maps to, so it falls
  // back to whatever the previous answers lean toward — or the gentlest
  // default if this is the very first step.
  function submitFreeText() {
    const fallback = answers.length > 0 ? pickWinner(answers) : "hope";
    advance(fallback);
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

      <div className="mt-6 flex gap-2">
        <input
          value={freeText}
          onChange={(e) => setFreeText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && freeText.trim()) submitFreeText();
          }}
          placeholder={question.placeholder}
          aria-label={question.prompt}
          className="flex-1 rounded-full border border-border/70 bg-card px-5 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground/70 focus-visible:border-primary"
        />
        <Button size="icon" className="shrink-0 rounded-full" onClick={submitFreeText} disabled={!freeText.trim()} aria-label="Continue with what you wrote">
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>

      <p className="mt-5 text-xs text-muted-foreground">or, if one of these fits closer</p>
      <div className="mt-2 flex flex-col gap-2.5" role="group" aria-label={question.prompt}>
        {question.options.map((opt) => (
          <button
            key={opt.text}
            type="button"
            onClick={() => advance(opt.emotionId)}
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
