/** Fixed pickup points for the Flower Delivery minigame, in the scene's
 * logical coordinate space (see SCENE_W/SCENE_H in delivery-scene.tsx). */
export type DeliveryFlowerSeed = { id: string; flowerId: string; x: number; y: number };

export const DELIVERY_FLOWERS: DeliveryFlowerSeed[] = [
  { id: "f1", flowerId: "daffodil", x: 210, y: 100 },
  { id: "f2", flowerId: "forget-me-not", x: 420, y: 70 },
  { id: "f3", flowerId: "sunflower", x: 650, y: 140 },
  { id: "f4", flowerId: "lavender", x: 160, y: 330 },
  { id: "f5", flowerId: "peony", x: 400, y: 380 },
  { id: "f6", flowerId: "wisteria", x: 620, y: 350 },
  { id: "f7", flowerId: "snowdrop", x: 520, y: 230 },
];
