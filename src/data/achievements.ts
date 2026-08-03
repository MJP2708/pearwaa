import { ENCYCLOPEDIA_FLOWERS } from "./flower-encyclopedia";

export type Achievement = {
  id: string;
  title: string;
  description: string;
  isUnlocked: (viewed: string[], viewedColors: string[]) => boolean;
};

const springFlowerIds = ENCYCLOPEDIA_FLOWERS.filter((f) => f.bloomSeason.toLowerCase().includes("spring")).map((f) => f.id);
const roseColorKeys = (ENCYCLOPEDIA_FLOWERS.find((f) => f.id === "rose")?.colors ?? []).map((c) => `rose:${c.id}`);

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-bloom",
    title: "First Bloom",
    description: "You opened your very first flower.",
    isUnlocked: (viewed) => viewed.length >= 1,
  },
  {
    id: "half-garden",
    title: "Half a Garden",
    description: "Ten flowers in — you're building something.",
    isUnlocked: (viewed) => viewed.length >= 10,
  },
  {
    id: "hanakotoba-master",
    title: "Hanakotoba Master",
    description: "Every flower in the garden, met in person.",
    isUnlocked: (viewed) => viewed.length >= ENCYCLOPEDIA_FLOWERS.length,
  },
  {
    id: "rose-lover",
    title: "Rose Lover",
    description: "Every shade of rose, seen and understood.",
    isUnlocked: (_viewed, viewedColors) => roseColorKeys.every((k) => viewedColors.includes(k)),
  },
  {
    id: "spring-collector",
    title: "Spring Collector",
    description: "Every flower that blooms in spring, found.",
    isUnlocked: (viewed) => springFlowerIds.every((id) => viewed.includes(id)),
  },
];
