/** Sparse, low-opacity "dark-cute" scenery accents — moon, star, and a tiny
 * skull outline — scattered as a light watermark, not a theme takeover. */
export function SceneryDoodles() {
  return (
    <g opacity="0.9" stroke="none">
      <path
        d="M120,40 A9 9 0 1 0 120,58 A6.6 6.6 0 1 1 120,40 Z"
        fill="#8B6FC0"
        opacity="0.18"
      />
      <path
        d="M690 60 L692.6 66.4 L699.4 67 L694.3 71.4 L695.9 78.1 L690 74.6 L684.1 78.1 L685.7 71.4 L680.6 67 L687.4 66.4 Z"
        fill="#8B6FC0"
        opacity="0.16"
      />
      <g transform="translate(60 380)" opacity="0.14">
        <circle r="9" fill="#5B4B8A" />
        <circle cx="-3.2" cy="-1" r="1.6" fill="#F7F3FF" />
        <circle cx="3.2" cy="-1" r="1.6" fill="#F7F3FF" />
        <path d="M-1.6 4 L0 6.4 L1.6 4 Z" fill="#F7F3FF" />
      </g>
      <path
        d="M740 400 L741.6 404 L746 404.4 L742.8 407.2 L743.8 411.6 L740 409.3 L736.2 411.6 L737.2 407.2 L734 404.4 L738.4 404 Z"
        fill="#8B6FC0"
        opacity="0.16"
      />
    </g>
  );
}
