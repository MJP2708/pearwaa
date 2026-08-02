type MascotMood = "idle" | "sleepy";

/**
 * Pearwaa's own dark-cute accent character — an original design (bat-eared,
 * soft-rounded silhouette, moon/star/flower/skull charms) used sparingly on
 * empty and loading states and in the delivery minigame. Not modeled on any
 * existing licensed character; keep any future edits to that same spirit
 * (soft geometry, tiny charms) rather than converging on one.
 */
export function Mascot({
  size = 96,
  className,
  mood = "idle",
}: {
  size?: number;
  className?: string;
  mood?: MascotMood;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="mascot-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4B3A63" />
          <stop offset="100%" stopColor="#2A2038" />
        </linearGradient>
      </defs>

      <path d="M22 34 C18 20 30 14 36 26 Z" fill="url(#mascot-body)" />
      <path d="M78 34 C82 20 70 14 64 26 Z" fill="url(#mascot-body)" />
      <path d="M25.5 29.5 C23.5 22.5 29.5 19.5 32.5 26.5 Z" fill="#7A5FA0" opacity="0.7" />
      <path d="M74.5 29.5 C76.5 22.5 70.5 19.5 67.5 26.5 Z" fill="#7A5FA0" opacity="0.7" />

      <ellipse cx="50" cy="58" rx="30" ry="27" fill="url(#mascot-body)" />

      <ellipse cx="34" cy="62" rx="5.5" ry="4" fill="#B892D6" opacity="0.5" />
      <ellipse cx="66" cy="62" rx="5.5" ry="4" fill="#B892D6" opacity="0.5" />

      {mood === "idle" ? (
        <>
          <path d="M36 55 Q40 51 44 55" stroke="#F4EDFF" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M56 55 Q60 51 64 55" stroke="#F4EDFF" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M44 68 Q50 72 56 68" stroke="#F4EDFF" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <path d="M36 56 Q40 53 44 56" stroke="#F4EDFF" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M56 56 Q60 53 64 56" stroke="#F4EDFF" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          <path d="M46 69 Q50 71 54 69" stroke="#F4EDFF" strokeWidth="2" strokeLinecap="round" fill="none" />
          <text x="68" y="40" fontSize="9" fill="#C9B7E8" fontFamily="Georgia, serif">
            z
          </text>
          <text x="76" y="32" fontSize="6" fill="#C9B7E8" fontFamily="Georgia, serif">
            z
          </text>
        </>
      )}

      <path d="M46 40 A6 6 0 1 0 46 30 A4.6 4.6 0 1 1 46 40 Z" fill="#C9B7E8" opacity="0.85" />

      <path
        d="M74 22 L75.4 25.4 L79 25.8 L76.3 28.2 L77.1 31.8 L74 29.9 L70.9 31.8 L71.7 28.2 L69 25.8 L72.6 25.4 Z"
        fill="#E9D9FF"
        opacity="0.9"
      />

      <g transform="translate(24 22)">
        {Array.from({ length: 5 }).map((_, i) => (
          <ellipse key={i} cx="0" cy="-2.6" rx="2" ry="3.2" fill="#D9A6C2" transform={`rotate(${i * 72})`} />
        ))}
        <circle r="1.4" fill="#F6E6C8" />
      </g>

      <line x1="50" y1="66" x2="50" y2="70" stroke="#C9B7E8" strokeWidth="1" opacity="0.6" />
      <g transform="translate(50 73)">
        <circle r="3.4" fill="#EDE3FA" opacity="0.9" />
        <circle cx="-1.2" cy="-0.3" r="0.6" fill="#2A2038" />
        <circle cx="1.2" cy="-0.3" r="0.6" fill="#2A2038" />
        <path d="M-0.6 1.4 L0 2.4 L0.6 1.4 Z" fill="#2A2038" />
      </g>

      <ellipse cx="38" cy="83" rx="6" ry="4" fill="url(#mascot-body)" />
      <ellipse cx="62" cy="83" rx="6" ry="4" fill="url(#mascot-body)" />
    </svg>
  );
}
