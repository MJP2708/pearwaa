/**
 * The private note content — kept as its own block so the text can be
 * swapped without touching the reveal mechanics in SecretRoom.
 */
const NOTE_PARAGRAPHS = [
  "To Pearwaa,",
  "This whole garden exists because of you — every flower, every quiet color, every soft little detail. I wanted to build something that felt like you: gentle, thoughtful, quietly beautiful.",
  "If you're reading this, you found the one part of this place that was never really for anyone else. Just you.",
  "Thank you for being someone worth building a whole garden for.",
];

export function SecretNote() {
  return (
    <div className="space-y-4">
      {NOTE_PARAGRAPHS.map((paragraph, i) => (
        <p key={i} className="font-heading text-lg italic leading-relaxed text-[#4B3A63]">
          {paragraph}
        </p>
      ))}
    </div>
  );
}
