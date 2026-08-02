import type { EmotionId } from "./emotions";

export type PetalShape = "round" | "pointed" | "star" | "bell" | "cluster";

export type Flower = {
  id: string;
  name: string;
  scientificName: string;
  /** One-sentence symbolic meaning, shown wherever the flower appears. */
  meaning: string;
  /** A few poetic lines revealed on click — the "Bloom Story". */
  bloomStory: string[];
  emotions: EmotionId[];
  colorHex: string;
  petalShape: PetalShape;
  petalCount: number;
};

export const flowers: Flower[] = [
  {
    id: "cherry-blossom",
    name: "Cherry Blossom",
    scientificName: "Prunus serrulata",
    meaning: "The beauty of impermanence, and the gentleness of letting go.",
    bloomStory: [
      "It only asks to be beautiful for a little while. Not forever — just now.",
      "Some things are worth loving precisely because they don't stay.",
      "You're allowed to let this season close softly.",
    ],
    emotions: ["nostalgia", "hope"],
    colorHex: "#F4C6D7",
    petalShape: "cluster",
    petalCount: 8,
  },
  {
    id: "chrysanthemum",
    name: "White Chrysanthemum",
    scientificName: "Chrysanthemum morifolium",
    meaning: "Quiet grief, and the honoring of a loss.",
    bloomStory: [
      "Some flowers are for celebrating. This one is for sitting with you.",
      "No advice, no timeline, no rush to feel better.",
      "Just quiet company for as long as you need it.",
    ],
    emotions: ["grief"],
    colorHex: "#F5F1E8",
    petalShape: "round",
    petalCount: 13,
  },
  {
    id: "sunflower",
    name: "Sunflower",
    scientificName: "Helianthus annuus",
    meaning: "Resilience, and the choice to keep turning toward the light.",
    bloomStory: [
      "It doesn't perform happiness. It just keeps turning toward the light —",
      "even on the days the sky is grey.",
      "That's not naivety. That's practice.",
    ],
    emotions: ["joy", "hope"],
    colorHex: "#F2B705",
    petalShape: "pointed",
    petalCount: 12,
  },
  {
    id: "lavender",
    name: "Lavender",
    scientificName: "Lavandula angustifolia",
    meaning: "Calm, stillness, and permission to rest.",
    bloomStory: [
      "You don't have to earn rest.",
      "This one just asks you to breathe a little slower, unclench your jaw,",
      "put the list down. Everything else can wait a few minutes.",
    ],
    emotions: ["calm", "overwhelm"],
    colorHex: "#B7A4D6",
    petalShape: "cluster",
    petalCount: 6,
  },
  {
    id: "camellia",
    name: "Red Camellia",
    scientificName: "Camellia japonica",
    meaning: "Quiet longing, and admiration from a distance.",
    bloomStory: [
      "Some love doesn't get to be loud.",
      "It waits at the edge of the room, hoping to be noticed,",
      "learning to be okay either way. That kind of quiet devotion counts too.",
    ],
    emotions: ["longing", "love"],
    colorHex: "#C1495A",
    petalShape: "round",
    petalCount: 9,
  },
  {
    id: "forget-me-not",
    name: "Forget-Me-Not",
    scientificName: "Myosotis scorpioides",
    meaning: "Remembrance — a small promise that someone hasn't been forgotten.",
    bloomStory: [
      "Small, and easy to miss — which is exactly why it matters that you looked twice.",
      "This is what remembering someone looks like when there are no big gestures left to make.",
      "I haven't forgotten. I won't.",
    ],
    emotions: ["nostalgia", "longing"],
    colorHex: "#8FB8DE",
    petalShape: "star",
    petalCount: 5,
  },
  {
    id: "peony",
    name: "Peony",
    scientificName: "Paeonia lactiflora",
    meaning: "A full heart — abundant love without apology.",
    bloomStory: [
      "It doesn't hold anything back.",
      "Every petal is proof that a heart can be full without spilling over —",
      "that too much love was never actually the problem.",
    ],
    emotions: ["love", "gratitude"],
    colorHex: "#E8A3B0",
    petalShape: "round",
    petalCount: 16,
  },
  {
    id: "marigold",
    name: "Marigold",
    scientificName: "Tagetes erecta",
    meaning: "Fierce, warm remembrance — grief and gratitude in the same breath.",
    bloomStory: [
      "Bright enough to guide someone home, even after they're gone.",
      "This flower doesn't mourn quietly — it lights a path and leaves it lit.",
      "Grief and gratitude, standing in the same small vase.",
    ],
    emotions: ["gratitude", "love", "grief"],
    colorHex: "#E8823C",
    petalShape: "pointed",
    petalCount: 13,
  },
  {
    id: "iris",
    name: "Iris",
    scientificName: "Iris germanica",
    meaning: "A message still finding its words, and the courage to say it anyway.",
    bloomStory: [
      "Somewhere underneath this shape is a message that hasn't found its words yet.",
      "That's alright. You don't need the whole sentence —",
      "just the courage to open your mouth and start.",
    ],
    emotions: ["courage", "overwhelm"],
    colorHex: "#5B4B8A",
    petalShape: "bell",
    petalCount: 6,
  },
  {
    id: "poppy",
    name: "Poppy",
    scientificName: "Papaver rhoeas",
    meaning: "Rest that arrives after struggle — peace that follows a hard season.",
    bloomStory: [
      "It grows loudest in the places that were hardest —",
      "fields that once held something heavier than flowers.",
      "Peace doesn't mean it didn't happen. It means you get to rest now.",
    ],
    emotions: ["relief", "grief"],
    colorHex: "#D9534F",
    petalShape: "round",
    petalCount: 6,
  },
  {
    id: "snowdrop",
    name: "Snowdrop",
    scientificName: "Galanthus nivalis",
    meaning: "Hope breaking through frozen ground — the first brave thing.",
    bloomStory: [
      "It pushes up through frozen ground before anything else dares to.",
      "Not because it's fearless — because it decided",
      "the cold wasn't going to be the end of the story.",
    ],
    emotions: ["hope", "courage"],
    colorHex: "#F7F7F2",
    petalShape: "bell",
    petalCount: 6,
  },
  {
    id: "wisteria",
    name: "Wisteria",
    scientificName: "Wisteria sinensis",
    meaning: "Patience, and a welcome for whatever change is unfolding.",
    bloomStory: [
      "It takes its time — climbing slowly, blooming in its own season,",
      "never rushed into shape.",
      "Let whatever's unfolding in you take exactly as long as it needs.",
    ],
    emotions: ["hope", "calm"],
    colorHex: "#A78BC9",
    petalShape: "cluster",
    petalCount: 7,
  },
  {
    id: "black-eyed-susan",
    name: "Black-Eyed Susan",
    scientificName: "Rudbeckia hirta",
    meaning: "Steady encouragement — standing your ground without needing to shout.",
    bloomStory: [
      "Plain-spoken and unbothered by weather, it doesn't need to be exotic to matter.",
      "Sometimes the steadiest thing in the garden is also the most overlooked.",
      "That's you, some days.",
    ],
    emotions: ["courage", "anger"],
    colorHex: "#D9A441",
    petalShape: "star",
    petalCount: 11,
  },
  {
    id: "anemone",
    name: "Anemone",
    scientificName: "Anemone coronaria",
    meaning: "Anticipation, and protection against what frightens you.",
    bloomStory: [
      "In old stories, it was planted to ward off what frightens us —",
      "a small, defiant bloom standing between you and the thing you're afraid of.",
      "Anticipation isn't only dread. Sometimes it's readiness.",
    ],
    emotions: ["anger", "overwhelm"],
    colorHex: "#8C4A6B",
    petalShape: "round",
    petalCount: 8,
  },
  {
    id: "queens-lace",
    name: "Queen Anne's Lace",
    scientificName: "Daucus carota",
    meaning: "Sanctuary — safety found in gentleness, not size.",
    bloomStory: [
      "Delicate on top, sturdy enough underneath to hold its own weight.",
      "It doesn't ask to be the centerpiece —",
      "just a soft place for other things to rest against.",
    ],
    emotions: ["calm", "relief"],
    colorHex: "#F2F0E6",
    petalShape: "cluster",
    petalCount: 10,
  },
  {
    id: "bluebell",
    name: "Bluebell",
    scientificName: "Hyacinthoides non-scripta",
    meaning: "Humble gratitude — thanks that doesn't need to be announced.",
    bloomStory: [
      "It rings without making a sound.",
      "Some thanks are like that — not announced, just quietly, constantly there,",
      "bending a little toward whoever gave it a reason to grow.",
    ],
    emotions: ["gratitude", "calm"],
    colorHex: "#6E8FD1",
    petalShape: "bell",
    petalCount: 6,
  },
  {
    id: "daffodil",
    name: "Daffodil",
    scientificName: "Narcissus pseudonarcissus",
    meaning: "New beginnings — joy that shows up before it's asked to.",
    bloomStory: [
      "The first to show up after winter, unbothered that no one else has arrived yet.",
      "Joy doesn't always wait for permission.",
      "Sometimes it just opens.",
    ],
    emotions: ["joy", "hope"],
    colorHex: "#F4D35E",
    petalShape: "star",
    petalCount: 6,
  },
];

export function getFlower(id: string): Flower | undefined {
  return flowers.find((f) => f.id === id);
}

export function getFlowersByEmotion(emotionId: string): Flower[] {
  return flowers.filter((f) => f.emotions.includes(emotionId as EmotionId));
}
