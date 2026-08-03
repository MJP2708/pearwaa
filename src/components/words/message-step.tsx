"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MAX_LETTER_MESSAGE_LENGTH } from "@/lib/flower-letter-codec";

const MAX_NAME_LENGTH = 40;

const STARTERS = [
  "I'm not okay, but I will be.",
  "I don't have the words, but I wanted you to have this.",
  "Thinking of you today.",
  "I'm sorry. I mean that.",
  "Thank you for staying.",
];

const MAX_LENGTH = MAX_LETTER_MESSAGE_LENGTH;

export function MessageStep({
  message,
  onChangeMessage,
  senderName,
  onChangeSenderName,
  onBack,
  onContinue,
}: {
  message: string;
  onChangeMessage: (v: string) => void;
  senderName: string;
  onChangeSenderName: (v: string) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  return (
    <div className="mx-auto max-w-xl">
      <p className="text-sm font-medium text-primary">Step 4 of 5</p>
      <h1 className="mt-2 font-heading text-3xl font-normal text-foreground sm:text-4xl">
        Say as much or as little as you want
      </h1>
      <p className="mt-3 text-base leading-relaxed text-muted-foreground">
        This part is optional. The bouquet can speak for itself if you&rsquo;d rather it did. A
        few words or a full letter — both fit here.
      </p>

      <Textarea
        value={message}
        onChange={(e) => onChangeMessage(e.target.value.slice(0, MAX_LENGTH))}
        placeholder="You don't have to explain. Just this is enough."
        maxLength={MAX_LENGTH}
        rows={7}
        aria-label="Your message"
        className="mt-6 resize-none rounded-2xl text-base"
      />
      <p className="mt-1.5 text-right text-xs text-muted-foreground">
        {message.length}/{MAX_LENGTH}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        {STARTERS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => onChangeMessage(s)}
            className="rounded-full border border-border/70 px-3.5 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:bg-accent/30 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <label htmlFor="sender-name" className="text-sm font-medium text-foreground">
          Your name <span className="font-normal text-muted-foreground">(optional)</span>
        </label>
        <Input
          id="sender-name"
          value={senderName}
          onChange={(e) => onChangeSenderName(e.target.value.slice(0, MAX_NAME_LENGTH))}
          placeholder="Leave blank to send it as “a friend”"
          maxLength={MAX_NAME_LENGTH}
          className="mt-2 h-11 rounded-full px-4"
        />
      </div>

      <div className="mt-9 flex justify-between">
        <Button variant="ghost" size="lg" className="rounded-full px-6" onClick={onBack}>
          <ArrowLeft className="size-4" aria-hidden="true" />
          Back
        </Button>
        <Button size="lg" className="rounded-full px-7" onClick={onContinue}>
          Continue
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </div>
  );
}
