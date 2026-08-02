export type DeliveryStop = {
  id: string;
  title: string;
  flowerId: string;
  note: string;
  /** Position along the road, 0–1. */
  t: number;
};

export const DELIVERY_STOPS: DeliveryStop[] = [
  {
    id: "bench",
    title: "The park bench",
    flowerId: "daffodil",
    note: "Someone's been sitting here a while. A little joy wouldn't hurt.",
    t: 0.1,
  },
  {
    id: "mailbox",
    title: "The old mailbox",
    flowerId: "forget-me-not",
    note: "For someone who hasn't been forgotten, even from far away.",
    t: 0.32,
  },
  {
    id: "doorstep",
    title: "The quiet doorstep",
    flowerId: "lavender",
    note: "A little calm for whoever opens this door next.",
    t: 0.52,
  },
  {
    id: "windowsill",
    title: "The windowsill",
    flowerId: "sunflower",
    note: "Something to turn toward on a grey morning.",
    t: 0.74,
  },
  {
    id: "gate",
    title: "The garden gate",
    flowerId: "peony",
    note: "A full heart, left right where they'll find it.",
    t: 0.93,
  },
];
