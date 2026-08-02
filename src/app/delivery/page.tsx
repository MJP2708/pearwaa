import type { Metadata } from "next";
import { DeliveryScene } from "@/components/delivery/delivery-scene";
import { FadeIn } from "@/components/motion/fade-in";

export const metadata: Metadata = {
  title: "Flower Delivery — Pearwaa",
  description: "Drive a small purple car around and pick up flowers, at your own pace. No scores, no timers.",
};

export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-20">
      <FadeIn>
        <p className="text-sm font-medium text-primary">A small detour</p>
        <h1 className="mt-2 font-heading text-3xl font-normal text-foreground sm:text-4xl">
          Flower Delivery
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
          Nothing to win here, nothing to lose. Drive the car around with the arrow keys or
          W A S D, roll over a flower to pick it up, and stop whenever you&rsquo;ve had enough.
        </p>
      </FadeIn>

      <FadeIn delay={0.1} className="mt-8">
        <DeliveryScene />
      </FadeIn>
    </div>
  );
}
