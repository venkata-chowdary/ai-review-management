import { create } from "qrcode";

// Black on white with a quiet zone, whatever the theme, so every phone can scan it.
export function QrPreview({ value, size = 132 }: { value: string; size?: number }) {
  const { modules } = create(value, { errorCorrectionLevel: "M" });
  let path = "";
  for (let row = 0; row < modules.size; row++)
    for (let col = 0; col < modules.size; col++) if (modules.get(row, col)) path += `M${col} ${row}h1v1h-1z`;

  return (
    <svg
      viewBox={`-4 -4 ${modules.size + 8} ${modules.size + 8}`}
      width={size}
      height={size}
      role="img"
      aria-label="QR code for your review page"
      className="rounded-inner"
    >
      <rect x="-4" y="-4" width={modules.size + 8} height={modules.size + 8} fill="#fff" />
      <path d={path} fill="#000" shapeRendering="crispEdges" />
    </svg>
  );
}
