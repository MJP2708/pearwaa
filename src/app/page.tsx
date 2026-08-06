import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HomeBouquetPreview } from "@/components/home/home-bouquet-preview";
import { FadeIn } from "@/components/motion/fade-in";

const paths = [
  {
    href: "/create",
    title: "Build a bouquet",
    description: "Start with how you feel, and let it take shape as flowers.",
  },
  {
    href: "/explore",
    title: "Learn a flower's meaning",
    description: "Browse the symbolic vocabulary Pearwaa is built from.",
  },
  {
    href: "/words-are-hard",
    title: "Send instead of speak",
    description: "A gentler way to reach someone when words won't come.",
  },
  {
    href: "/letters",
    title: "Create a Letter",
    description: "Already know what to say? Write it as a real letter, with a bouquet attached.",
  },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
      <section className="grid items-center gap-12 pb-20 pt-14 sm:pt-20 md:grid-cols-2 md:gap-8 md:pb-28 md:pt-24">
        <FadeIn className="max-w-xl">
          <p className="text-sm font-medium text-primary">Pearwaa</p>
          <h1 className="mt-3 text-balance font-heading text-4xl font-normal leading-tight text-foreground sm:text-5xl">
            Some feelings are easier to hand someone than to say out loud.
          </h1>
          <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Pearwaa turns how you feel into a bouquet — quietly, at your own pace. No accounts,
            no streaks, nothing pinging you back. Just flowers, and what they mean.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
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
              Explore the flowers
            </Button>
          </div>
        </FadeIn>

        <FadeIn delay={0.15} className="mx-auto w-full max-w-sm md:max-w-none">
          <HomeBouquetPreview />
        </FadeIn>
      </section>

      <section aria-labelledby="paths-heading" className="border-t border-border/70 py-16 sm:py-20">
        <h2 id="paths-heading" className="sr-only">
          Three quiet ways to use Pearwaa
        </h2>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {paths.map((path, i) => (
            <FadeIn key={path.href} delay={i * 0.08}>
              <Link
                href={path.href}
                className="group flex h-full flex-col justify-between rounded-3xl border border-border/70 bg-card p-7 transition-colors hover:border-primary/40 hover:bg-accent/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              >
                <div>
                  <h3 className="font-heading text-xl font-normal text-foreground">{path.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{path.description}</p>
                </div>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                  Go
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            </FadeIn>
          ))}
        </div>
      </section>
    </div>
  );
}
