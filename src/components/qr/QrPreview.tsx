// Decorative stand-in until real QR generation lands. It has the look of a
// QR code (three finder squares, seeded modules) but does not encode anything.

const SIZE = 25;

function seeded(text: string) {
  let h = 2166136261;
  for (const c of text) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    return (h >>> 0) / 4294967296;
  };
}

function inFinder(x: number, y: number) {
  const corner = (cx: number, cy: number) => x >= cx && x < cx + 8 && y >= cy && y < cy + 8;
  return corner(0, 0) || corner(SIZE - 8, 0) || corner(0, SIZE - 8);
}

export function QrPreview({ seed, size = 132 }: { seed: string; size?: number }) {
  const rand = seeded(seed);
  const cells: [number, number][] = [];
  for (let y = 0; y < SIZE; y++)
    for (let x = 0; x < SIZE; x++) if (!inFinder(x, y) && rand() > 0.52) cells.push([x, y]);

  const finder = (x: number, y: number) => (
    <g key={`${x}-${y}`}>
      <rect x={x + 0.5} y={y + 0.5} width="6" height="6" rx="1.6" fill="none" stroke="currentColor" />
      <rect x={x + 2} y={y + 2} width="3" height="3" rx="0.8" fill="currentColor" />
    </g>
  );

  return (
    <svg
      viewBox={`-2 -2 ${SIZE + 4} ${SIZE + 4}`}
      width={size}
      height={size}
      role="img"
      aria-label="QR code preview (placeholder)"
      className="rounded-inner bg-surface text-fg"
    >
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x + 0.08} y={y + 0.08} width="0.84" height="0.84" rx="0.25" fill="currentColor" />
      ))}
      {finder(0, 0)}
      {finder(SIZE - 7, 0)}
      {finder(0, SIZE - 7)}
    </svg>
  );
}
