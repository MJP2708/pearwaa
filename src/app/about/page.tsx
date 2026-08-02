import type { Metadata } from "next";
import { FadeIn } from "@/components/motion/fade-in";

export const metadata: Metadata = {
  title: "About — Pearwaa",
  description: "Why Pearwaa exists, and how it tries to stay out of your way.",
};

const values = [
  {
    title: "No notifications, ever",
    body: "Pearwaa never pushes, pings, or reminds you to come back. Every visit is one you chose.",
  },
  {
    title: "Nothing is tracked",
    body: "There are no accounts and no saved history. What you build here is yours, in the moment you build it.",
  },
  {
    title: "Built to be used by everyone",
    body: "High-contrast and reduced-motion settings live in the header, full keyboard support runs throughout, and colour is never the only signal.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-16 sm:px-8 sm:py-24">
      <FadeIn>
        <p className="text-sm font-medium text-primary">About</p>
        <h1 className="mt-3 font-heading text-3xl font-normal leading-tight text-foreground sm:text-4xl">
          Not every feeling wants to be a sentence.
        </h1>
        <div className="mt-6 space-y-5 text-base leading-relaxed text-muted-foreground">
          <p>
            Pearwaa is a small, quiet space for a specific kind of moment — the one where you feel
            something clearly but the words won&rsquo;t come, or won&rsquo;t come out kindly. Flowers have
            carried meaning like this for a very long time, long before anyone needed to explain
            themselves in full sentences. We borrowed that.
          </p>
          <p>
            You pick a feeling, or you don&rsquo;t name it at all and just start choosing flowers that
            look right. Either way, you end up with something small and specific: a bouquet that
            means what you mean, even if you can&rsquo;t say exactly why.
          </p>
          <p>
            That&rsquo;s the whole app. One flow, done with care, instead of many features done
            halfway. We&rsquo;d rather it feel finished and small than impressive and busy.
          </p>
        </div>
      </FadeIn>

      <FadeIn delay={0.1} className="mt-14 border-t border-border/70 pt-10">
        <h2 className="font-heading text-xl font-normal text-foreground">How Pearwaa tries to behave</h2>
        <dl className="mt-6 space-y-6">
          {values.map((v) => (
            <div key={v.title}>
              <dt className="font-medium text-foreground">{v.title}</dt>
              <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{v.body}</dd>
            </div>
          ))}
        </dl>
      </FadeIn>
    </div>
  );
}
