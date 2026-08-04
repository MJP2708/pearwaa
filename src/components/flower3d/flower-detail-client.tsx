"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { EncyclopediaFlower } from "@/data/flower-encyclopedia";
import { FlowerInfoPanel } from "@/components/flower3d/flower-info-panel";
import { ViewerControls } from "@/components/flower3d/viewer-controls";
import { Flower2DFallback } from "@/components/flower3d/flower-2d-fallback";
import { AchievementToast } from "@/components/flower3d/achievement-toast";
import { SecretRoom } from "@/components/easter-egg/secret-room";
import { Mascot } from "@/components/mascot";
import { useFlowerCollection } from "@/lib/use-flower-collection";
import { useSecretClickCounter } from "@/lib/use-secret-click-counter";
import { useAmbientTone } from "@/lib/use-ambient-tone";
import { useAccessibility } from "@/components/providers/accessibility-provider";
import { hasWebGLSupport } from "@/lib/webgl-support";
import { AnimatePresence } from "framer-motion";

const Flower3DViewer = dynamic(
  () => import("@/components/flower3d/flower-3d-viewer").then((m) => m.Flower3DViewer),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-secondary/30">
        <Mascot size={48} mood="sleepy" className="opacity-70" />
      </div>
    ),
  },
);

const SECRET_FLOWER_ID = "forget-me-not";
const ACHIEVEMENT_DISPLAY_MS = 5000;

export function FlowerDetailClient({ flower }: { flower: EncyclopediaFlower }) {
  const [colorId, setColorId] = useState(flower.colors[0]?.id ?? "");
  const [bloomStage, setBloomStage] = useState("full");
  const [autoSpin, setAutoSpin] = useState(false);
  const [particlesOn, setParticlesOn] = useState(true);
  const [soundOn, setSoundOn] = useState(false);
  const [webglOk, setWebglOk] = useState<boolean | null>(null);
  const [secretOpen, setSecretOpen] = useState(false);

  const { reducedMotion } = useAccessibility();
  const { favorited, toggleFavorite, markViewed, markColorViewed, newlyUnlocked, acknowledgeAchievement } =
    useFlowerCollection();
  const registerSecretClick = useSecretClickCounter();
  // If the browser blocks the audio context despite the click gesture,
  // flip the toggle back off rather than leaving it reading "on" with no
  // sound and no explanation.
  useAmbientTone(soundOn, () => setSoundOn(false));

  // WebGL support can only be detected client-side after mount — there's no
  // pure/lazy-init alternative that stays SSR-safe, so this one intentionally
  // sets state from an effect.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setWebglOk(hasWebGLSupport()), []);
  useEffect(() => markViewed(flower.id), [flower.id, markViewed]);
  useEffect(() => markColorViewed(flower.id, colorId), [flower.id, colorId, markColorViewed]);

  const currentToast = newlyUnlocked[0] ?? null;
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    if (!currentToast) return;
    dismissTimer.current = setTimeout(() => acknowledgeAchievement(currentToast.id), ACHIEVEMENT_DISPLAY_MS);
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [currentToast, acknowledgeAchievement]);

  const selectedColor = useMemo(
    () => flower.colors.find((c) => c.id === colorId) ?? flower.colors[0],
    [flower.colors, colorId],
  );

  function handleHeadingActivate() {
    if (flower.id !== SECRET_FLOWER_ID) return;
    if (registerSecretClick()) setSecretOpen(true);
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
      <Link
        href="/explore"
        className="inline-flex items-center gap-1.5 rounded-full text-sm text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <ArrowLeft className="size-3.5" aria-hidden="true" />
        Back to Explore Flowers
      </Link>

      <div className="mt-6 grid gap-10 md:grid-cols-[1.1fr_1fr]">
        <div>
          <div className="aspect-square w-full overflow-hidden rounded-3xl border border-border/70">
            {webglOk === false ? (
              <Flower2DFallback flower={flower} selectedColor={selectedColor} />
            ) : (
              <Flower3DViewer
                flower={flower}
                colorHex={selectedColor.hex}
                bloomStage={bloomStage}
                autoSpin={autoSpin}
                showParticles={particlesOn}
                reducedMotion={reducedMotion}
              />
            )}
          </div>
          <ViewerControls
            flower={flower}
            colorId={selectedColor.id}
            onSelectColor={setColorId}
            bloomStage={bloomStage}
            onSelectStage={setBloomStage}
            autoSpin={autoSpin}
            onToggleAutoSpin={() => setAutoSpin((v) => !v)}
            soundOn={soundOn}
            onToggleSound={() => setSoundOn((v) => !v)}
            particlesOn={particlesOn}
            onToggleParticles={() => setParticlesOn((v) => !v)}
          />
        </div>

        <FlowerInfoPanel
          flower={flower}
          selectedColor={selectedColor}
          favorited={favorited.includes(flower.id)}
          onToggleFavorite={() => toggleFavorite(flower.id)}
          onHeadingActivate={flower.id === SECRET_FLOWER_ID ? handleHeadingActivate : undefined}
        />
      </div>

      <AchievementToast achievement={currentToast} onDismiss={() => currentToast && acknowledgeAchievement(currentToast.id)} />

      <AnimatePresence>{secretOpen && <SecretRoom onClose={() => setSecretOpen(false)} />}</AnimatePresence>
    </div>
  );
}
