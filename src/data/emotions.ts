export type EmotionId =
  | "joy"
  | "love"
  | "grief"
  | "hope"
  | "calm"
  | "longing"
  | "courage"
  | "gratitude"
  | "anger"
  | "overwhelm"
  | "relief"
  | "nostalgia";

export type Emotion = {
  id: EmotionId;
  label: string;
  /** A gentle, non-clinical framing shown on the picker card. */
  description: string;
  colorHex: string;
  /** Words that map free-text entries onto this emotion. */
  keywords: string[];
  flowerIds: string[];
};

export const emotions: Emotion[] = [
  {
    id: "joy",
    label: "Joy",
    description: "Something lifted, even briefly.",
    colorHex: "#E8B84B",
    keywords: ["joy", "happy", "happiness", "glad", "delighted", "excited", "light"],
    flowerIds: ["daffodil", "sunflower"],
  },
  {
    id: "love",
    label: "Love",
    description: "Warmth that reaches toward someone.",
    colorHex: "#E29AAE",
    keywords: ["love", "adore", "affection", "romance", "crush", "devoted"],
    flowerIds: ["peony", "camellia", "marigold"],
  },
  {
    id: "grief",
    label: "Grief",
    description: "Missing something you can't get back.",
    colorHex: "#9AA3B0",
    keywords: ["grief", "sad", "sadness", "loss", "mourning", "miss", "gone"],
    flowerIds: ["chrysanthemum", "poppy", "marigold"],
  },
  {
    id: "hope",
    label: "Hope",
    description: "A quiet belief that it could get better.",
    colorHex: "#8FBF9F",
    keywords: ["hope", "hopeful", "optimistic", "believe", "faith"],
    flowerIds: ["sunflower", "snowdrop", "wisteria", "daffodil"],
  },
  {
    id: "calm",
    label: "Calm",
    description: "Still water, finally.",
    colorHex: "#A7C4D9",
    keywords: ["calm", "peace", "peaceful", "relaxed", "settled", "quiet"],
    flowerIds: ["lavender", "wisteria", "queens-lace", "bluebell"],
  },
  {
    id: "longing",
    label: "Longing",
    description: "Wanting something that feels far away.",
    colorHex: "#B79FCB",
    keywords: ["longing", "yearning", "wish", "miss", "distant", "far"],
    flowerIds: ["camellia", "forget-me-not"],
  },
  {
    id: "courage",
    label: "Courage",
    description: "Doing it scared.",
    colorHex: "#D98A5F",
    keywords: ["courage", "brave", "bravery", "scared", "afraid", "nervous"],
    flowerIds: ["iris", "snowdrop", "black-eyed-susan"],
  },
  {
    id: "gratitude",
    label: "Gratitude",
    description: "Noticing what you were given.",
    colorHex: "#D6B25E",
    keywords: ["gratitude", "thankful", "grateful", "appreciate", "blessed"],
    flowerIds: ["peony", "marigold", "bluebell"],
  },
  {
    id: "anger",
    label: "Anger",
    description: "Something in you says this isn't right.",
    colorHex: "#C97B6D",
    keywords: ["anger", "angry", "mad", "furious", "frustrated", "irritated"],
    flowerIds: ["black-eyed-susan", "anemone"],
  },
  {
    id: "overwhelm",
    label: "Overwhelm",
    description: "Too much, all at once.",
    colorHex: "#A8A0C4",
    keywords: ["overwhelm", "overwhelmed", "stressed", "anxious", "anxiety", "too much"],
    flowerIds: ["lavender", "iris", "anemone"],
  },
  {
    id: "relief",
    label: "Relief",
    description: "The weight finally sets down.",
    colorHex: "#9FC7C2",
    keywords: ["relief", "relieved", "better", "okay now", "exhale"],
    flowerIds: ["poppy", "queens-lace"],
  },
  {
    id: "nostalgia",
    label: "Nostalgia",
    description: "A soft ache for somewhere you used to be.",
    colorHex: "#C9B79C",
    keywords: ["nostalgia", "nostalgic", "remember", "used to", "back then", "old days"],
    flowerIds: ["cherry-blossom", "forget-me-not"],
  },
];

export function getEmotion(id: string): Emotion | undefined {
  return emotions.find((e) => e.id === id);
}

/** Best-effort match of free-text feelings onto a curated emotion, for
 * people who'd rather name it themselves than pick from a list. */
export function matchEmotionFromText(text: string): Emotion | undefined {
  const normalized = text.toLowerCase();
  let best: { emotion: Emotion; score: number } | undefined;
  for (const emotion of emotions) {
    for (const keyword of emotion.keywords) {
      if (normalized.includes(keyword)) {
        const score = keyword.length;
        if (!best || score > best.score) {
          best = { emotion, score };
        }
      }
    }
  }
  return best?.emotion;
}
