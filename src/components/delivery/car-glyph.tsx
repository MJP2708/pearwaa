/** Top-down purple car, drawn pointing right (angle 0) so it lines up
 * directly with atan2-style rotation math — no offset needed. */
export function CarGlyph({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={(size * 26) / 44} viewBox="0 0 44 26" aria-hidden="true">
      <defs>
        <linearGradient id="car-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8B6FC0" />
          <stop offset="100%" stopColor="#5B4B8A" />
        </linearGradient>
      </defs>
      <ellipse cx="22" cy="22.5" rx="17" ry="2.2" fill="#000" opacity="0.15" />

      <rect x="8" y="2.5" width="6" height="4.2" rx="1.4" fill="#2A2038" />
      <rect x="8" y="19.3" width="6" height="4.2" rx="1.4" fill="#2A2038" />
      <rect x="28" y="2.5" width="6" height="4.2" rx="1.4" fill="#2A2038" />
      <rect x="28" y="19.3" width="6" height="4.2" rx="1.4" fill="#2A2038" />

      <rect x="3" y="6" width="36" height="14" rx="7" fill="url(#car-body)" />

      <path d="M18 27 C16.5 24 16.5 22 18 20.4 Z" fill="none" />
      <path d="M15 6.6 C13.5 3.4 21 2.4 22.5 6.6 Z" fill="#4B3A63" opacity="0.8" />

      <rect x="24" y="9.4" width="8.5" height="7.2" rx="2" fill="#C9B7E8" opacity="0.9" />

      <circle cx="37.5" cy="10.4" r="1.1" fill="#F6E6C8" />
      <circle cx="37.5" cy="15.6" r="1.1" fill="#F6E6C8" />
    </svg>
  );
}
