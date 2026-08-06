/** The flowers available to place in the Flower Delivery minigame. Actual
 * positions are randomized per playthrough (see delivery-scene.tsx) rather
 * than fixed here — the same static layout every visit was a big part of
 * why the minigame felt repetitive after a couple of plays. */
export const DELIVERY_FLOWER_IDS = [
  "daffodil",
  "forget-me-not",
  "sunflower",
  "lavender",
  "peony",
  "wisteria",
  "snowdrop",
] as const;
