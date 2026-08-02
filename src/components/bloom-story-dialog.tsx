"use client";

import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { FlowerGlyphIcon } from "@/components/flower-glyph-icon";
import type { Flower } from "@/data/flowers";

export function BloomStoryDialog({
  flower,
  open,
  onOpenChange,
}: {
  flower: Flower | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md gap-0 overflow-hidden border-border/60 bg-card p-0">
        {flower && (
          <div className="flex flex-col items-center gap-5 px-8 pb-10 pt-10 text-center">
            <FlowerGlyphIcon flower={flower} size={108} />
            <DialogHeader className="items-center gap-1.5 text-center">
              <DialogTitle className="font-heading text-2xl font-normal">{flower.name}</DialogTitle>
              <DialogDescription className="italic">{flower.scientificName}</DialogDescription>
            </DialogHeader>
            <p className="text-sm font-medium text-accent-foreground">{flower.meaning}</p>
            <div className="mt-1 w-full space-y-2.5 border-t border-border/70 pt-5">
              {flower.bloomStory.map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.18, ease: [0.22, 1, 0.36, 1] }}
                  className="font-heading text-base leading-relaxed text-foreground/90"
                >
                  {line}
                </motion.p>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
