"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/motion/fade-in";

export function IntroStep({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="mx-auto max-w-xl text-center">
      <FadeIn>
        <p className="text-sm font-medium text-primary">Words Are Hard</p>
        <h1 className="mt-2 font-heading text-3xl font-normal leading-tight text-foreground sm:text-4xl">
          You don&rsquo;t need the right words. Just answer honestly.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
          A few gentle questions, a bouquet that takes shape on its own, and a card you can send
          when saying it out loud feels like too much.
        </p>
        <Button size="lg" className="mt-8 rounded-full px-7" onClick={onBegin}>
          Begin
          <ArrowRight className="size-4" aria-hidden="true" />
        </Button>
      </FadeIn>
    </div>
  );
}
