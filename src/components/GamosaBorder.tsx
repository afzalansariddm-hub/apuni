/** Thin decorative strip inspired by gamosa woven borders — repeating red diamonds. */
export default function GamosaBorder() {
  return (
    <svg
      className="gamosa-strip"
      viewBox="0 0 240 8"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect width="240" height="8" fill="#EFE6D3" />
      {Array.from({ length: 30 }).map((_, i) => (
        <g key={i} transform={`translate(${i * 8}, 0)`}>
          <path d="M4 1 L7 4 L4 7 L1 4 Z" fill="#A32D2D" />
        </g>
      ))}
    </svg>
  );
}
