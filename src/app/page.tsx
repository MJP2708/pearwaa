import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomeBouquetPreview } from "@/components/home/home-bouquet-preview";
import { FadeIn } from "@/components/motion/fade-in";

const journey = [
  { step: "Feel", description: "Start with however you're actually feeling — no wrong answer." },
  { step: "Arrange", description: "Let it take shape as flowers, at whatever pace feels right." },
  { step: "Share, or keep", description: "Send it as a letter, or simply keep it for yourself." },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-28 sm:px-8">
      <section className="grid items-center gap-16 pb-24 pt-16 sm:pt-24 md:grid-cols-2 md:gap-10 md:pb-32 md:pt-28">
        <FadeIn className="max-w-xl">
          <p className="text-sm font-medium text-muted-foreground">Pearwaa</p>
          <h1 className="mt-4 text-balance font-heading text-4xl font-normal leading-[1.15] text-foreground sm:text-5xl">
            Some feelings bloom more easily than words.
          </h1>
          <p className="mt-6 max-w-md text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Pearwaa is a quiet space where flowers become a language — for the things that are
            hard to say out loud. No accounts, no streaks, nothing pinging you back.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button render={<Link href="/create" />} nativeButton={false} size="lg" className="rounded-full px-7">
              Begin
              <ArrowRight className="size-4" aria-hidden="true" />
            </Button>
            <Button
              render={<Link href="/explore" />}
              nativeButton={false}
              variant="ghost"
              size="lg"
              className="rounded-full px-6 text-muted-foreground hover:text-foreground"
            >
              Explore meanings
            </Button>
          </div>
        </FadeIn>

        <FadeIn delay={0.15} className="mx-auto w-full max-w-sm md:max-w-none">
          <HomeBouquetPreview />
        </FadeIn>
      </section>

      <section aria-labelledby="journey-heading" className="border-t border-border/70 py-16 sm:py-20">
        <h2 id="journey-heading" className="sr-only">
          How Pearwaa works
        </h2>
        <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
          {journey.map((item, i) => (
            <FadeIn key={item.step} delay={i * 0.1}>
              <p className="font-heading text-lg text-foreground">
                <span className="text-muted-foreground">{i + 1}.</span> {item.step}
              </p>
              <p className="mt-2 max-w-[32ch] text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
