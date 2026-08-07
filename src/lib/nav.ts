/** Grouped around the emotional journey (discover a meaning → create a
 * bouquet → connect with someone) rather than a flat feature list — see
 * DESIGN_PRINCIPLES.md and the identity-milestone nav restructure. */
export const NAV_GROUPS = [
  {
    label: "Discover",
    description: "Things about flowers",
    items: [
      { href: "/explore", label: "Explore Flowers" },
      { href: "/collection", label: "My Collection" },
    ],
  },
  {
    label: "Create",
    description: "Things you make",
    items: [{ href: "/create", label: "Create Bouquet" }],
  },
  {
    label: "Connect",
    description: "Things you send",
    items: [
      { href: "/words-are-hard", label: "Words Are Hard" },
      { href: "/letters", label: "Create a Letter" },
    ],
  },
] as const;

/** Flattened, for anything that still just needs "every page" (sitemap-
 * style lists like the footer). */
export const NAV_ITEMS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  ...NAV_GROUPS.flatMap((g) => g.items.map((item) => ({ href: item.href, label: item.label }))),
  { href: "/about", label: "About" },
];
