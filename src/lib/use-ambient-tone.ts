"use client";

import { useEffect, useRef } from "react";

type Engine = { ctx: AudioContext; gain: GainNode; oscillators: OscillatorNode[] };

/**
 * A very soft synthesized triad (no audio files — there's nowhere to
 * source real ambient recordings from here). Off by default; only ever
 * starts from a genuine user click on the toggle, which satisfies
 * browsers' autoplay-gesture requirement.
 */
export function useAmbientTone(enabled: boolean) {
  const engineRef = useRef<Engine | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const AudioCtxCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxCtor) return;

    const ctx = new AudioCtxCtor();
    ctx.resume().catch(() => {});

    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);

    const oscillators = [220, 277.18, 329.63].map((freq) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const oscGain = ctx.createGain();
      oscGain.gain.value = 0.05;
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start();
      return osc;
    });

    gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 1.5);
    engineRef.current = { ctx, gain, oscillators };

    return () => {
      const engine = engineRef.current;
      if (!engine) return;
      const { ctx, gain, oscillators } = engine;
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(gain.gain.value, now);
      gain.gain.linearRampToValueAtTime(0, now + 0.5);
      setTimeout(() => {
        oscillators.forEach((o) => {
          try {
            o.stop();
          } catch {
            /* already stopped */
          }
        });
        ctx.close().catch(() => {});
      }, 600);
      engineRef.current = null;
    };
  }, [enabled]);
}
