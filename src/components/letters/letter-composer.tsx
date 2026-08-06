"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_LETTER_MESSAGE_LENGTH } from "@/lib/flower-letter-codec";

const MAX_NAME_LENGTH = 40;

type Props = {
  message: string;
  onChangeMessage: (v: string) => void;
  senderName: string;
  onChangeSenderName: (v: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

/**
 * A writing surface, not a form field — Flower Letters is for someone who
 * already knows what they want to say, so this skips the guided starter
 * prompts Words Are Hard uses and just gives them room to write.
 */
export function LetterComposer({ message, onChangeMessage, senderName, onChangeSenderName, onBack, onContinue }: Props) {
  const canContinue = message.trim().length > 0;

  return (
    <div className="mx-auto max-w-xl">
      <p className="text-sm font-medium text-primary">Write your letter</p>
      <h1 className="mt-2 font-heading text-3xl font-normal text-foreground sm:text-4xl">
        Say what you came here to say
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        The bouquet is already speaking for you — this is just the letter that goes with it.
      </p>

      <div
        className="relative mt-7 overflow-hidden rounded-sm bg-[#FBF6EC] px-8 pb-7 pt-9 shadow-sm ring-1 ring-black/5 dark:bg-[#2A2520] dark:ring-white/10"
        style={{
          backgroundImage:
            "repeating-linear-gradient(to bottom, transparent, transparent 34px, rgba(120,100,70,0.14) 35px)",
          backgroundPosition: "0 4px",
        }}
      >
        {/* A soft horizontal crease, like the letter has been folded in
            thirds before — purely decorative, sits above the ruled lines. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-1/3 h-px bg-black/10 dark:bg-white/10"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-2/3 h-px bg-black/10 dark:bg-white/10"
          aria-hidden="true"
        />

        <textarea
          value={message}
          onChange={(e) => onChangeMessage(e.target.value.slice(0, MAX_LETTER_MESSAGE_LENGTH))}
          placeholder="Dear..."
          maxLength={MAX_LETTER_MESSAGE_LENGTH}
          rows={9}
          aria-label="Your letter"
          className="relative w-full resize-none bg-transparent font-heading text-lg italic leading-[35px] text-foreground outline-none placeholder:text-muted-foreground/70"
        />

        <div className="relative mt-2 flex items-center justify-end gap-2">
          <label htmlFor="letter-sender-name" className="text-sm italic text-muted-foreground">
            — signed,
          </label>
          <input
            id="letter-sender-name"
            value={senderName}
            onChange={(e) => onChangeSenderName(e.target.value.slice(0, MAX_NAME_LENGTH))}
            placeholder="a friend"
            maxLength={MAX_NAME_LENGTH}
            className="w-40 border-b border-dashed border-border/70 bg-transparent px-1 pb-0.5 text-right font-heading text-base italic text-foreground outline-none placeholder:text-muted-foreground/60 focus-visible:border-primary"
          />
        </div>
      </div>
      <p className="mt-1.5 text-right text-xs text-muted-foreground">
        {message.length}/{MAX_LETTER_MESSAGE_LENGTH}
      </p>

      <div className="mt-9 flex justify-between">
        <Button variant="ghost" size="lg" className="rounded-full px-6" onClick={onBack}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Button>
        <Button size="lg" className="rounded-full px-7" onClick={onContinue} disabled={!canContinue}>
          Continue
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
