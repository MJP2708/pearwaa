import type { EmotionId } from "./emotions";
import { flowers as bouquetFlowers } from "./flowers";

export type PetalShape3D = "round" | "pointed" | "star" | "cluster" | "ruffled" | "trumpet";

export type ColorVariant = {
  id: string;
  label: string;
  hex: string;
  /** What THIS color specifically symbolizes — updates with the color switch. */
  symbolism: string;
};

export type Habitat = {
  label: string;
  skyTop: string;
  skyBottom: string;
  ground: string;
  fog: string;
};

export type EncyclopediaFlower = {
  id: string;
  commonName: string;
  scientificName: string;
  hanakotoba: string;
  victorianMeaning: string;
  bloomSeason: string;
  nativeRegion: string;
  funFact: string;
  bloomStory: string[];
  emotions: EmotionId[];
  colors: ColorVariant[];
  habitat: Habitat;
  model: {
    petalShape: PetalShape3D;
    petalCount: number;
    /** How far petals rotate open at full bloom, in degrees — lower reads
     * as a cupped flower (tulip), higher as flat-open (daisy). */
    maxOpenDeg: number;
    hasWiltedStage: boolean;
  };
};

function reuseBloomStory(id: string): string[] {
  return bouquetFlowers.find((f) => f.id === id)?.bloomStory ?? [];
}

export const ENCYCLOPEDIA_FLOWERS: EncyclopediaFlower[] = [
  {
    id: "rose",
    commonName: "Rose",
    scientificName: "Rosa",
    hanakotoba: "Love, in as many shades as the rose itself comes in.",
    victorianMeaning: "The undisputed language of love — read the color to read the letter.",
    bloomSeason: "Late spring through autumn",
    nativeRegion: "Temperate regions across the Northern Hemisphere",
    funFact: "Rose fossils have been found dating back 35 million years — long before anyone was around to hand one to someone.",
    bloomStory: [
      "It took its time getting here — thirty-five million years of practice at being exactly this.",
      "Every color says something different, but the shape says the same thing every time: I made this for you.",
    ],
    emotions: ["love", "gratitude"],
    colors: [
      { id: "red", label: "Red", hex: "#C23B4B", symbolism: "Love said plainly, without hedging." },
      { id: "white", label: "White", hex: "#F5EFE6", symbolism: "A love that asks for nothing back." },
      { id: "yellow", label: "Yellow", hex: "#EBC13B", symbolism: "Friendship, and the joy of being known." },
      { id: "pink", label: "Pink", hex: "#E3A0B5", symbolism: "Gratitude, and gentler affections." },
      { id: "orange", label: "Orange", hex: "#E2823C", symbolism: "Fascination — the early, giddy part of caring about someone." },
      { id: "purple", label: "Purple", hex: "#8C6FA8", symbolism: "Love at first sight, or something close to it." },
    ],
    habitat: { label: "An old walled garden at dusk", skyTop: "#6B4E8E", skyBottom: "#E8B4C8", ground: "#4A5D3A", fog: "#C78FA8" },
    model: { petalShape: "ruffled", petalCount: 26, maxOpenDeg: 95, hasWiltedStage: true },
  },
  {
    id: "tulip",
    commonName: "Tulip",
    scientificName: "Tulipa gesneriana",
    hanakotoba: "A declaration of love — the perfect one, spoken without doubt.",
    victorianMeaning: "Once worth more than gold — literal fortunes were built and lost on this flower.",
    bloomSeason: "Early to mid spring",
    nativeRegion: "Central Asia, later naturalized across the Netherlands",
    funFact: "\"Tulip mania\" in 1630s Holland saw single bulbs trade for more than a house.",
    bloomStory: [
      "It never fully opens — even at its fullest, it keeps a little of itself cupped and private.",
      "Maybe that's the trick: give generously, but not everything at once.",
    ],
    emotions: ["love", "hope"],
    colors: [
      { id: "red", label: "Red", hex: "#C93B3B", symbolism: "A true, believe-it declaration of love." },
      { id: "yellow", label: "Yellow", hex: "#F0C33B", symbolism: "Cheerful thoughts, sent with no strings attached." },
      { id: "white", label: "White", hex: "#F4F0E4", symbolism: "Forgiveness, offered before it's even asked for." },
      { id: "purple", label: "Purple", hex: "#8067A3", symbolism: "Royalty — the feeling of being someone's favorite." },
    ],
    habitat: { label: "A windswept field at first light", skyTop: "#8FB8DE", skyBottom: "#FDF4D8", ground: "#6B8E4E", fog: "#E8D9A8" },
    model: { petalShape: "round", petalCount: 6, maxOpenDeg: 55, hasWiltedStage: true },
  },
  {
    id: "lily",
    commonName: "Lily",
    scientificName: "Lilium",
    hanakotoba: "Purity, and the return of innocence.",
    victorianMeaning: "Majesty — the flower of queens, altars, and quiet ceremony.",
    bloomSeason: "Summer",
    nativeRegion: "Temperate Northern Hemisphere, especially East Asia",
    funFact: "A single lily bulb can produce the same flower, unchanged, for decades — some outlive the gardens they were planted in.",
    bloomStory: [
      "It opens like a held breath finally let go — slow, then all at once.",
      "Nothing about it apologizes for taking up space.",
      "Some things are allowed to be this certain of themselves.",
    ],
    emotions: ["calm", "hope"],
    colors: [
      { id: "white", label: "White", hex: "#F7F3E8", symbolism: "Purity, and a fresh start." },
      { id: "pink", label: "Pink", hex: "#E3A8B8", symbolism: "Admiration, quietly held." },
      { id: "orange", label: "Orange", hex: "#E38A3C", symbolism: "Confidence, and pride well-earned." },
    ],
    habitat: { label: "A still garden pond at first light", skyTop: "#A8C4D9", skyBottom: "#F0E8D0", ground: "#3A5A4A", fog: "#D9E8DC" },
    model: { petalShape: "trumpet", petalCount: 6, maxOpenDeg: 110, hasWiltedStage: true },
  },
  {
    id: "lavender",
    commonName: "Lavender",
    scientificName: "Lavandula angustifolia",
    hanakotoba: "Devotion, and waiting quietly for someone.",
    victorianMeaning: "Distrust, oddly enough — though the modern reading is pure calm.",
    bloomSeason: "Summer",
    nativeRegion: "Mediterranean hillsides",
    funFact: "Its scent comes from oil glands so small they're invisible to the eye — the calm is quite literally in the details.",
    bloomStory: reuseBloomStory("lavender"),
    emotions: ["calm", "overwhelm"],
    colors: [
      { id: "purple", label: "Purple", hex: "#9B87C4", symbolism: "Calm, stillness, permission to rest." },
      { id: "white", label: "White", hex: "#F0EDE8", symbolism: "A clean slate, quietly offered." },
    ],
    habitat: { label: "A lavender field in golden light", skyTop: "#B79FCB", skyBottom: "#F4D9A8", ground: "#8B7BA8", fog: "#E0C8E8" },
    model: { petalShape: "cluster", petalCount: 10, maxOpenDeg: 90, hasWiltedStage: true },
  },
  {
    id: "sunflower",
    commonName: "Sunflower",
    scientificName: "Helianthus annuus",
    hanakotoba: "Adoration, and eyes that only look one way.",
    victorianMeaning: "False riches — but also unwavering devotion, depending who you ask.",
    bloomSeason: "Summer",
    nativeRegion: "North America",
    funFact: "Young sunflowers track the sun from east to west all day, then reset overnight to face east again by morning.",
    bloomStory: reuseBloomStory("sunflower"),
    emotions: ["joy", "hope"],
    colors: [
      { id: "yellow", label: "Yellow", hex: "#EFB61F", symbolism: "Resilience, and the choice to keep turning toward the light." },
      { id: "red", label: "Red", hex: "#B84A2E", symbolism: "A warmer, more private kind of adoration." },
    ],
    habitat: { label: "A sunny farm at midday", skyTop: "#6FA8DC", skyBottom: "#FDE49A", ground: "#C9A24D", fog: "#FFF3C4" },
    model: { petalShape: "star", petalCount: 13, maxOpenDeg: 100, hasWiltedStage: true },
  },
  {
    id: "cherry-blossom",
    commonName: "Cherry Blossom",
    scientificName: "Prunus serrulata",
    hanakotoba: "Mono no aware — the gentle sadness of beautiful, temporary things.",
    victorianMeaning: "A good education — though in the West it's mostly known simply for its fleeting beauty.",
    bloomSeason: "Early spring, for about a week",
    nativeRegion: "Japan and the Himalayas",
    funFact: "Peak bloom lasts only about a week — an entire cultural calendar (hanami) is built around catching it in time.",
    bloomStory: reuseBloomStory("cherry-blossom"),
    emotions: ["nostalgia", "hope"],
    colors: [
      { id: "pink", label: "Pink", hex: "#F2C6D6", symbolism: "The beauty of impermanence, held gently." },
      { id: "white", label: "White", hex: "#F8F1EC", symbolism: "A pure, uncomplicated new beginning." },
    ],
    habitat: { label: "A quiet park in Japan, mid-spring", skyTop: "#C9DCE8", skyBottom: "#FBDEE8", ground: "#7A9B6E", fog: "#FCE8EE" },
    model: { petalShape: "round", petalCount: 5, maxOpenDeg: 120, hasWiltedStage: true },
  },
  {
    id: "hydrangea",
    commonName: "Hydrangea",
    scientificName: "Hydrangea macrophylla",
    hanakotoba: "A heartfelt, if changeable, emotion.",
    victorianMeaning: "Boastfulness, historically — though today it usually just means gratitude.",
    bloomSeason: "Summer into early autumn",
    nativeRegion: "East Asia, especially Japan",
    funFact: "Its color isn't fixed by genetics alone — soil acidity shifts it from blue to pink, a rare flower whose meaning you can actually change with dirt.",
    bloomStory: [
      "It isn't one flower — it's a hundred small ones, holding formation together.",
      "Some feelings are too big for a single bloom to carry alone.",
    ],
    emotions: ["gratitude", "overwhelm"],
    colors: [
      { id: "blue", label: "Blue", hex: "#6E93C4", symbolism: "Deep, sincere apology — or deep, sincere gratitude." },
      { id: "pink", label: "Pink", hex: "#E5A3BC", symbolism: "Genuine emotion, heartfelt and a little overwhelmed." },
      { id: "white", label: "White", hex: "#F4F1EA", symbolism: "Boasting, in the gentlest possible way — pride, softened." },
    ],
    habitat: { label: "A misty hillside after rain", skyTop: "#8FA8B8", skyBottom: "#D8E0DC", ground: "#5A7A5A", fog: "#D0DCD8" },
    model: { petalShape: "cluster", petalCount: 14, maxOpenDeg: 100, hasWiltedStage: true },
  },
  {
    id: "orchid",
    commonName: "Orchid",
    scientificName: "Orchidaceae",
    hanakotoba: "Refined, rare beauty — the kind you don't rush past.",
    victorianMeaning: "Luxury and rare beauty, fit for the most careful attention.",
    bloomSeason: "Varies widely by species — often year-round indoors",
    nativeRegion: "Nearly every continent except Antarctica",
    funFact: "There are more orchid species than mammals and birds combined — over 28,000 and counting.",
    bloomStory: [
      "It doesn't grow in a hurry, and it doesn't apologize for that either.",
      "Some beauty needs the long way round to arrive properly.",
    ],
    emotions: ["longing", "love"],
    colors: [
      { id: "purple", label: "Purple", hex: "#9668A8", symbolism: "Admiration, refined and a little formal." },
      { id: "white", label: "White", hex: "#F2EEE4", symbolism: "Innocence, and an elegance that doesn't try hard." },
      { id: "pink", label: "Pink", hex: "#E39CB8", symbolism: "Pure affection, gently stated." },
    ],
    habitat: { label: "A warm greenhouse, humid and still", skyTop: "#4A6B5A", skyBottom: "#8FA88F", ground: "#3A4A3A", fog: "#B8D0B0" },
    model: { petalShape: "ruffled", petalCount: 5, maxOpenDeg: 100, hasWiltedStage: true },
  },
  {
    id: "peony",
    commonName: "Peony",
    scientificName: "Paeonia lactiflora",
    hanakotoba: "Bashfulness, and a heart that shows itself despite hesitating.",
    victorianMeaning: "Bashfulness and compassion — an old myth blamed it on nymphs hiding in the petals.",
    bloomSeason: "Late spring to early summer",
    nativeRegion: "Asia, Southern Europe, and Western North America",
    funFact: "A single peony bush can live for over a hundred years, quietly outlasting the person who planted it.",
    bloomStory: reuseBloomStory("peony"),
    emotions: ["love", "gratitude"],
    colors: [
      { id: "pink", label: "Pink", hex: "#E4A0B4", symbolism: "A full heart — abundant love without apology." },
      { id: "white", label: "White", hex: "#F6F0E8", symbolism: "Shyness, and a request for forgiveness." },
      { id: "red", label: "Red", hex: "#B84052", symbolism: "Honor, and deep-rooted respect." },
    ],
    habitat: { label: "A palace garden in late spring", skyTop: "#E8C4D9", skyBottom: "#FDF0E0", ground: "#6B8E5A", fog: "#F0D8E4" },
    model: { petalShape: "round", petalCount: 22, maxOpenDeg: 100, hasWiltedStage: true },
  },
  {
    id: "daisy",
    commonName: "Daisy",
    scientificName: "Bellis perennis",
    hanakotoba: "Innocence, and truth told plainly.",
    victorianMeaning: "Loyal love, and innocence — the flower you pull petals from to ask a question.",
    bloomSeason: "Spring through early autumn",
    nativeRegion: "Europe, naturalized nearly everywhere",
    funFact: "The name comes from \"day's eye\" — old English for the way it opens with the sun and closes each night.",
    bloomStory: [
      "It's not trying to be rare. It's trying to be honest.",
      "There's a whole field of them, and every one means exactly the same simple thing.",
    ],
    emotions: ["joy", "hope"],
    colors: [
      { id: "white", label: "White", hex: "#F7F5EC", symbolism: "Plain, unguarded innocence." },
      { id: "yellow", label: "Yellow", hex: "#F0CC4E", symbolism: "Simple, unfiltered cheerfulness." },
      { id: "pink", label: "Pink", hex: "#E8AFC0", symbolism: "A quiet, uncomplicated fondness." },
    ],
    habitat: { label: "An open meadow in early summer", skyTop: "#7FB8E8", skyBottom: "#FFF8D8", ground: "#7FA84D", fog: "#F4FADC" },
    model: { petalShape: "star", petalCount: 21, maxOpenDeg: 105, hasWiltedStage: true },
  },
  {
    id: "carnation",
    commonName: "Carnation",
    scientificName: "Dianthus caryophyllus",
    hanakotoba: "Fascination, and a love that endures.",
    victorianMeaning: "Fascination and distinction — one of the few flowers with a meaning for nearly every color.",
    bloomSeason: "Year-round in cultivation, naturally late spring",
    nativeRegion: "Mediterranean region",
    funFact: "Its genus name, Dianthus, translates roughly to \"flower of the gods\" — a big title for such a modest bloom.",
    bloomStory: [
      "Its edges are frayed on purpose — even a little raggedness can be part of the design.",
      "It lasts longer than most cut flowers. Steadiness has always been its whole point.",
    ],
    emotions: ["love", "gratitude"],
    colors: [
      { id: "pink", label: "Pink", hex: "#E4A8BE", symbolism: "A mother's undying love." },
      { id: "red", label: "Red", hex: "#C2384A", symbolism: "A heart that aches with deep affection." },
      { id: "white", label: "White", hex: "#F5F0E6", symbolism: "Pure love, and good luck for what's ahead." },
      { id: "yellow", label: "Yellow", hex: "#EEC23C", symbolism: "Disappointment — the one carnation to think twice about." },
    ],
    habitat: { label: "A quiet greenhouse windowsill", skyTop: "#D9C4E8", skyBottom: "#F8ECD9", ground: "#8B9B7A", fog: "#EDE0F0" },
    model: { petalShape: "ruffled", petalCount: 20, maxOpenDeg: 90, hasWiltedStage: true },
  },
  {
    id: "iris",
    commonName: "Iris",
    scientificName: "Iris germanica",
    hanakotoba: "A message, and good news on its way.",
    victorianMeaning: "A message — named for the Greek goddess who carried words between gods and mortals.",
    bloomSeason: "Late spring",
    nativeRegion: "Temperate Northern Hemisphere",
    funFact: "It's named after Iris, the Greek messenger goddess of the rainbow — fitting, given how many colors it comes in.",
    bloomStory: reuseBloomStory("iris"),
    emotions: ["courage", "overwhelm"],
    colors: [
      { id: "purple", label: "Purple", hex: "#6B5590", symbolism: "Wisdom, and a compliment paid with respect." },
      { id: "blue", label: "Blue", hex: "#4B6B9B", symbolism: "Hope, and faith that the message will land." },
      { id: "yellow", label: "Yellow", hex: "#E0C24A", symbolism: "Passion, spoken before it's fully understood." },
      { id: "white", label: "White", hex: "#F0EEE6", symbolism: "Purity, and a message meant kindly." },
    ],
    habitat: { label: "The edge of a slow river", skyTop: "#5A7B9B", skyBottom: "#B8D0D8", ground: "#4A6B4A", fog: "#C8DCD8" },
    model: { petalShape: "trumpet", petalCount: 6, maxOpenDeg: 85, hasWiltedStage: true },
  },
  {
    id: "camellia",
    commonName: "Camellia",
    scientificName: "Camellia japonica",
    hanakotoba: "Longing, and a quiet, patient love.",
    victorianMeaning: "Admiration and perfection, especially given between people who admire each other quietly.",
    bloomSeason: "Late winter to early spring",
    nativeRegion: "East Asia",
    funFact: "In old Japan, its way of dropping — whole, all at once, rather than petal by petal — was seen as symbolic of quiet, dignified endings.",
    bloomStory: reuseBloomStory("camellia"),
    emotions: ["longing", "love"],
    colors: [
      { id: "red", label: "Red", hex: "#B5384A", symbolism: "Quiet longing, and admiration from a distance." },
      { id: "white", label: "White", hex: "#F5F0E6", symbolism: "Waiting, and a love that hasn't been spoken yet." },
      { id: "pink", label: "Pink", hex: "#E3A0B0", symbolism: "Longing that's a little softer around the edges." },
    ],
    habitat: { label: "A stone courtyard in early winter", skyTop: "#A8B4C4", skyBottom: "#E0DCD0", ground: "#5A6B5A", fog: "#D8D8D0" },
    model: { petalShape: "round", petalCount: 9, maxOpenDeg: 105, hasWiltedStage: true },
  },
  {
    id: "lotus",
    commonName: "Lotus",
    scientificName: "Nelumbo nucifera",
    hanakotoba: "A pure heart, rising untouched from murky beginnings.",
    victorianMeaning: "Purity of heart and mind — eloquence born from difficulty.",
    bloomSeason: "Summer",
    nativeRegion: "Asia and Northern Australia",
    funFact: "It grows straight up out of mud and returns spotless every morning — its own leaves and petals actually repel dirt and water.",
    bloomStory: [
      "It grows up through the mud without ever wearing it.",
      "Wherever you started doesn't have to be where you stay.",
    ],
    emotions: ["calm", "hope"],
    colors: [
      { id: "pink", label: "Pink", hex: "#E7A8BC", symbolism: "Enlightenment, and the original teaching flower." },
      { id: "white", label: "White", hex: "#F5F1E6", symbolism: "A mind at total peace with itself." },
      { id: "blue", label: "Blue", hex: "#7B9BC4", symbolism: "Wisdom earned rather than given." },
    ],
    habitat: { label: "A still pond at sunrise", skyTop: "#E8A8B4", skyBottom: "#FDE8C4", ground: "#4A6B5A", fog: "#D8E8D0" },
    model: { petalShape: "round", petalCount: 15, maxOpenDeg: 115, hasWiltedStage: true },
  },
  {
    id: "chrysanthemum",
    commonName: "Chrysanthemum",
    scientificName: "Chrysanthemum morifolium",
    hanakotoba: "Nobility, and a life well and honorably lived.",
    victorianMeaning: "Varies sharply by color — cheerfulness in red, truth in white, slighted love in yellow.",
    bloomSeason: "Autumn",
    nativeRegion: "East Asia",
    funFact: "In Japan it appears on the Imperial Seal — the throne itself is sometimes just called \"the Chrysanthemum Throne.\"",
    bloomStory: reuseBloomStory("chrysanthemum"),
    emotions: ["grief"],
    colors: [
      { id: "white", label: "White", hex: "#F4F1E6", symbolism: "Quiet grief, and the honoring of a loss." },
      { id: "yellow", label: "Yellow", hex: "#EAC03E", symbolism: "Slighted love — a feeling brushed aside too soon." },
      { id: "red", label: "Red", hex: "#B8434A", symbolism: "Love returned, plainly and without games." },
    ],
    habitat: { label: "A quiet shrine garden in autumn", skyTop: "#C9A87A", skyBottom: "#F0D8A8", ground: "#8B6B4A", fog: "#ECD8B0" },
    model: { petalShape: "star", petalCount: 24, maxOpenDeg: 100, hasWiltedStage: true },
  },
  {
    id: "wisteria",
    commonName: "Wisteria",
    scientificName: "Wisteria sinensis",
    hanakotoba: "Love that keeps returning, welcome every time.",
    victorianMeaning: "Welcome, and a steady devotion that doesn't rush.",
    bloomSeason: "Late spring",
    nativeRegion: "East Asia and the Eastern United States",
    funFact: "A single vine can live over a century, and some of the oldest recorded specimens still bloom on the very same trellis they were first trained onto.",
    bloomStory: reuseBloomStory("wisteria"),
    emotions: ["hope", "calm"],
    colors: [
      { id: "purple", label: "Purple", hex: "#8A76B0", symbolism: "Patience, and a welcome for whatever change is unfolding." },
      { id: "white", label: "White", hex: "#F2EFE6", symbolism: "Youth, and a gentleness toward new beginnings." },
    ],
    habitat: { label: "A wooden trellis walk in late spring", skyTop: "#A8B8D9", skyBottom: "#E8DCF0", ground: "#6B7A5A", fog: "#DCE0EC" },
    model: { petalShape: "cluster", petalCount: 7, maxOpenDeg: 90, hasWiltedStage: true },
  },
  {
    id: "violet",
    commonName: "Violet",
    scientificName: "Viola odorata",
    hanakotoba: "Modesty, and small faithfulness that doesn't need to be seen.",
    victorianMeaning: "Faithfulness, and modesty — a love that doesn't need an audience.",
    bloomSeason: "Early spring",
    nativeRegion: "Europe and Asia",
    funFact: "Its scent famously comes and goes — a natural compound briefly numbs your sense of smell to it, so it seems to fade even when it hasn't.",
    bloomStory: [
      "It grows low on purpose, half-hidden under bigger leaves.",
      "Not every good thing needs to be the tallest one in the room.",
    ],
    emotions: ["longing", "calm"],
    colors: [
      { id: "purple", label: "Purple", hex: "#6F5B98", symbolism: "Faithfulness, quietly kept." },
      { id: "white", label: "White", hex: "#F2F0E8", symbolism: "Innocence, and a modesty that doesn't perform." },
      { id: "blue", label: "Blue", hex: "#5B76B0", symbolism: "Watchfulness — someone thinking of you from afar." },
    ],
    habitat: { label: "A shaded forest floor", skyTop: "#5A6B7A", skyBottom: "#8FA090", ground: "#3A4A3A", fog: "#B0C0B0" },
    model: { petalShape: "round", petalCount: 5, maxOpenDeg: 100, hasWiltedStage: true },
  },
  {
    id: "jasmine",
    commonName: "Jasmine",
    scientificName: "Jasminum officinale",
    hanakotoba: "Amiability, and attachment that grows sweeter with time.",
    victorianMeaning: "Amiability by day, and — in its white form — sensuality by night.",
    bloomSeason: "Summer, opening most fragrantly at night",
    nativeRegion: "South and Southeast Asia",
    funFact: "Its scent grows strongest after dark — the whole plant is built to be found by moonlight, not daylight.",
    bloomStory: [
      "It waits for the day to end before it really opens.",
      "Some things are only fully themselves once the noise dies down.",
    ],
    emotions: ["love", "calm"],
    colors: [
      { id: "white", label: "White", hex: "#F5F2E8", symbolism: "Sweet, uncomplicated love." },
      { id: "yellow", label: "Yellow", hex: "#EAC966", symbolism: "Grace, given freely." },
    ],
    habitat: { label: "A courtyard at night, warm air", skyTop: "#2A2438", skyBottom: "#4A3B5E", ground: "#2A3A2A", fog: "#6B5A88" },
    model: { petalShape: "star", petalCount: 6, maxOpenDeg: 100, hasWiltedStage: true },
  },
  {
    id: "hibiscus",
    commonName: "Hibiscus",
    scientificName: "Hibiscus rosa-sinensis",
    hanakotoba: "Delicate beauty — gone by evening, gorgeous while it lasted.",
    victorianMeaning: "Delicate beauty, and a reminder to enjoy this exact moment.",
    bloomSeason: "Year-round in warm climates",
    nativeRegion: "East Asia and the Pacific Islands",
    funFact: "Most hibiscus flowers open at dawn and wilt by nightfall — a single, spectacular day is the whole lifespan.",
    bloomStory: [
      "It gives its whole self to a single day and doesn't ask for a second one.",
      "That's not a tragedy. That's just how much it meant it.",
    ],
    emotions: ["joy", "relief"],
    colors: [
      { id: "red", label: "Red", hex: "#C23838", symbolism: "Delicate beauty, at its most fearless." },
      { id: "yellow", label: "Yellow", hex: "#EFC23E", symbolism: "Joy, brief and completely unguarded." },
      { id: "pink", label: "Pink", hex: "#E5A0B8", symbolism: "A gentler, quieter kind of beauty." },
    ],
    habitat: { label: "A tropical garden at high noon", skyTop: "#4DA8D9", skyBottom: "#FDE49A", ground: "#3A7A4A", fog: "#D8F0DC" },
    model: { petalShape: "trumpet", petalCount: 5, maxOpenDeg: 118, hasWiltedStage: true },
  },
  {
    id: "forget-me-not",
    commonName: "Forget-Me-Not",
    scientificName: "Myosotis scorpioides",
    hanakotoba: "True love that doesn't fade, even with distance.",
    victorianMeaning: "True and lasting memory — its name is its entire meaning.",
    bloomSeason: "Spring",
    nativeRegion: "Europe and parts of Asia",
    funFact: "Its name across many languages translates to some version of the same request — a rare flower whose name IS its message.",
    bloomStory: reuseBloomStory("forget-me-not"),
    emotions: ["nostalgia", "longing"],
    colors: [
      { id: "blue", label: "Blue", hex: "#7FA8DC", symbolism: "Remembrance — a small promise that someone hasn't been forgotten." },
      { id: "pink", label: "Pink", hex: "#E5A8BC", symbolism: "A gentler, softer kind of remembering." },
      { id: "white", label: "White", hex: "#F2F0E6", symbolism: "A memory held with total tenderness." },
    ],
    habitat: { label: "A stream bank in early spring", skyTop: "#9BC4E0", skyBottom: "#F0F4E0", ground: "#6B8E5A", fog: "#DCE8DC" },
    model: { petalShape: "round", petalCount: 5, maxOpenDeg: 110, hasWiltedStage: true },
  },
];

export function getEncyclopediaFlower(id: string): EncyclopediaFlower | undefined {
  return ENCYCLOPEDIA_FLOWERS.find((f) => f.id === id);
}
