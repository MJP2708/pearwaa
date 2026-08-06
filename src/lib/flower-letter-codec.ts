import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";

/**
 * A Flower Letter has no backend — the whole thing (bouquet + message) is
 * compressed and packed directly into the link, and the recipient's
 * browser decodes it. Nothing is ever sent to or stored on a server, and
 * there's no per-letter ID to look up — the URL *is* the letter.
 */
export type FlowerLetterPayload = {
  v: 1;
  emotionLabel: string;
  emotionColorHex: string;
  message: string;
  /** Optional — older links and blank fields alike fall back to something
   * warm and anonymous rather than showing nothing or an error state. */
  senderName?: string;
  flowers: { flowerId: string; x: number; y: number; scale: number }[];
  createdAt: number;
};

export const MAX_LETTER_MESSAGE_LENGTH = 600;

/** The compact shape actually put in the URL — short keys, and flowers as
 * tuples instead of objects, so there's no repeated `"flowerId":`/`"x":`/
 * etc. per flower. The bigger win is rounding: placement x/y/scale come
 * out of trig-based layout math (phyllotaxis, presets) with 15+
 * significant digits, and unlike repeated JSON structure, that kind of
 * numeric noise doesn't compress away — one decimal place of precision is
 * visually indistinguishable but cuts each number from ~18 characters to
 * ~4. Rounding happens here (not at every call site) so every caller gets
 * a short link automatically. */
type FlowerLetterWire = {
  v: 1;
  l: string;
  c: string;
  m: string;
  s?: string;
  f: [string, number, number, number][];
  t: number;
};

function round(n: number, decimals: number): number {
  const factor = 10 ** decimals;
  return Math.round(n * factor) / factor;
}

export function encodeFlowerLetter(payload: FlowerLetterPayload): string {
  const wire: FlowerLetterWire = {
    v: 1,
    l: payload.emotionLabel,
    c: payload.emotionColorHex,
    m: payload.message,
    s: payload.senderName,
    f: payload.flowers.map((fl) => [fl.flowerId, round(fl.x, 1), round(fl.y, 1), round(fl.scale, 2)]),
    t: payload.createdAt,
  };
  return compressToEncodedURIComponent(JSON.stringify(wire));
}

function isValidFlowerEntry(f: unknown): f is FlowerLetterPayload["flowers"][number] {
  if (typeof f !== "object" || f === null) return false;
  const entry = f as Record<string, unknown>;
  return (
    typeof entry.flowerId === "string" &&
    entry.flowerId.length > 0 &&
    typeof entry.x === "number" &&
    Number.isFinite(entry.x) &&
    typeof entry.y === "number" &&
    Number.isFinite(entry.y) &&
    typeof entry.scale === "number" &&
    Number.isFinite(entry.scale)
  );
}

function isValidFlowerTuple(f: unknown): f is [string, number, number, number] {
  return (
    Array.isArray(f) &&
    typeof f[0] === "string" &&
    f[0].length > 0 &&
    typeof f[1] === "number" &&
    Number.isFinite(f[1]) &&
    typeof f[2] === "number" &&
    Number.isFinite(f[2]) &&
    typeof f[3] === "number" &&
    Number.isFinite(f[3])
  );
}

export function decodeFlowerLetter(encoded: string): FlowerLetterPayload | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (parsed?.v !== 1) return null;

    // The compact wire format (current encodeFlowerLetter output) has a
    // short "f" array of tuples; older already-shared links used the
    // original named-object shape and must keep decoding correctly.
    if (Array.isArray(parsed.f)) {
      if (typeof parsed.m !== "string" || typeof parsed.l !== "string" || typeof parsed.c !== "string") return null;
      const flowers = (parsed.f as unknown[]).filter(isValidFlowerTuple).map(([flowerId, x, y, scale]) => ({ flowerId, x, y, scale }));
      return {
        v: 1,
        emotionLabel: parsed.l,
        emotionColorHex: parsed.c,
        message: parsed.m,
        senderName: typeof parsed.s === "string" ? parsed.s : undefined,
        flowers,
        createdAt: typeof parsed.t === "number" ? parsed.t : Date.now(),
      };
    }

    if (
      typeof parsed.message !== "string" ||
      typeof parsed.emotionLabel !== "string" ||
      typeof parsed.emotionColorHex !== "string" ||
      !Array.isArray(parsed.flowers)
    ) {
      return null;
    }
    // A hand-edited or corrupted link shouldn't silently render a broken
    // bouquet (NaN coordinates, etc.) — drop individually malformed
    // entries rather than trusting the whole array's shape.
    const flowers = parsed.flowers.filter(isValidFlowerEntry);
    return {
      ...parsed,
      flowers,
      senderName: typeof parsed.senderName === "string" ? parsed.senderName : undefined,
    } as FlowerLetterPayload;
  } catch {
    return null;
  }
}

export function buildLetterUrl(encoded: string): string {
  if (typeof window === "undefined") return `/letter?d=${encoded}`;
  return `${window.location.origin}/letter?d=${encoded}`;
}
