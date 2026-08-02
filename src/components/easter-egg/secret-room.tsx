"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { SecretNote } from "./secret-note";

/**
 * A hidden, unlinked view — reached only by whatever quiet trigger the
 * caller wires up (see the Explore Flowers page). Deliberately calm: no
 * confetti, no "you found it" banner, just a private note and a way out.
 */
export function SecretRoom({ onClose }: { onClose: () => void }) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    returnFocusRef.current = document.activeElement;
    closeButtonRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      if (returnFocusRef.current instanceof HTMLElement) {
        returnFocusRef.current.focus();
      }
    };
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="A private note"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-b from-[#1c1428] to-[#0f0a17] p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8B6FC0] opacity-20 blur-[100px]"
      />

      <motion.div
        className="relative w-full max-w-md rounded-[1.75rem] bg-[#FBF3DD] px-8 py-10 shadow-2xl"
        initial={{ opacity: 0, scale: 0.92, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <button
          ref={closeButtonRef}
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 rounded-full p-1.5 text-[#4B3A63]/50 outline-none transition-colors hover:bg-[#4B3A63]/10 hover:text-[#4B3A63] focus-visible:ring-2 focus-visible:ring-[#8B6FC0] focus-visible:ring-offset-2 focus-visible:ring-offset-[#FBF3DD]"
        >
          <X className="size-4" aria-hidden="true" />
        </button>

        <SecretNote />
      </motion.div>

      <motion.p
        className="absolute bottom-7 text-xs text-white/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
      >
        Click anywhere to close
      </motion.p>
    </motion.div>
  );
}
