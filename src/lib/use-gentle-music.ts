"use client";

import { useEffect, useRef } from "react";

/**
 * A slow, soft chord pad — no audio files (nowhere to source real
 * recordings from here), so this is a synthesized approximation of
 * "quiet gentle jazz": a ii-V-I-vi-ish loop of open, slightly detuned
 * triads, each chord fading in and out over several seconds rather than
 * playing as distinct notes. It's meant to sit under the delivery
 * minigame, not be listened to closely — off by default, only ever
 * started from a genuine user click (satisfies autoplay-gesture rules).
 */

// Am7 - D7 - Gmaj7 - Cmaj7, voiced low and open rather than close/bright.
const CHORDS: number[][] = [
  [220.0, 261.63, 329.63, 392.0], // A C E G  (Am7)
  [146.83, 185.0, 220.0, 293.66], // D F# A C (D7)
  [196.0, 246.94, 293.66, 369.99], // G B D F# (Gmaj7)
  [130.81, 164.81, 196.0, 246.94], // C E G B  (Cmaj7)
];
const CHORD_SECONDS = 5.2;

type Engine = { ctx: AudioContext; masterGain: GainNode; timer: ReturnType<typeof setTimeout> | null };

export function useGentleMusic(enabled: boolean, onBlocked?: () => void) {
  const engineRef = useRef<Engine | null>(null);
  const onBlockedRef = useRef(onBlocked);
  useEffect(() => {
    onBlockedRef.current = onBlocked;
  }, [onBlocked]);

  useEffect(() => {
    if (!enabled) return;
    const AudioCtxCtor =
      window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtxCtor) {
      onBlockedRef.current?.();
      return;
    }

    const ctx = new AudioCtxCtor();
    ctx.resume().catch(() => onBlockedRef.current?.());

    const masterGain = ctx.createGain();
    masterGain.gain.value = 0.045;
    masterGain.connect(ctx.destination);

    const engine: Engine = { ctx, masterGain, timer: null };
    engineRef.current = engine;

    let stopped = false;
    let chordIndex = 0;

    function playChord() {
      if (stopped) return;
      const chord = CHORDS[chordIndex % CHORDS.length];
      const now = ctx.currentTime;
      const attack = 1.4;
      const hold = CHORD_SECONDS - attack - 1.2;
      const release = 1.2;

      for (const freq of chord) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        // A touch of detune per note keeps the pad from sounding too
        // synthetic/locked-in-tune — real sustained ensembles drift.
        osc.frequency.value = freq * (1 + (Math.random() - 0.5) * 0.003);
        const noteGain = ctx.createGain();
        noteGain.gain.setValueAtTime(0, now);
        noteGain.gain.linearRampToValueAtTime(1 / chord.length, now + attack);
        noteGain.gain.setValueAtTime(1 / chord.length, now + attack + hold);
        noteGain.gain.linearRampToValueAtTime(0, now + attack + hold + release);
        osc.connect(noteGain);
        noteGain.connect(masterGain);
        osc.start(now);
        osc.stop(now + CHORD_SECONDS + 0.1);
      }

      chordIndex++;
      engine.timer = setTimeout(playChord, CHORD_SECONDS * 1000);
    }

    playChord();

    return () => {
      stopped = true;
      if (engine.timer) clearTimeout(engine.timer);
      const now = ctx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.linearRampToValueAtTime(0, now + 0.4);
      setTimeout(() => ctx.close().catch(() => {}), 500);
      engineRef.current = null;
    };
  }, [enabled]);
}
