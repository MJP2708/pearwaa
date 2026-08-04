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

export function encodeFlowerLetter(payload: FlowerLetterPayload): string {
  return compressToEncodedURIComponent(JSON.stringify(payload));
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

export function decodeFlowerLetter(encoded: string): FlowerLetterPayload | null {
  try {
    const json = decompressFromEncodedURIComponent(encoded);
    if (!json) return null;
    const parsed = JSON.parse(json);
    if (
      parsed?.v !== 1 ||
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
