import { toBuffer, toString } from "qrcode";
import { getBranch } from "@/lib/data/branches";

export async function GET(request: Request, context: RouteContext<"/qr-codes/[id]/download">) {
  const { id } = await context.params;
  const branch = await getBranch(id);
  if (!branch) return new Response("Not found", { status: 404 });

  const reviewPageUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/r/${branch.qrCode}`;
  const fileName = `qr-${branch.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "branch"}`;

  if (new URL(request.url).searchParams.get("format") === "png") {
    const png = await toBuffer(reviewPageUrl, { errorCorrectionLevel: "M", margin: 4, width: 1024 });
    return new Response(new Uint8Array(png), {
      headers: { "Content-Type": "image/png", "Content-Disposition": `attachment; filename="${fileName}.png"` },
    });
  }

  const svg = await toString(reviewPageUrl, { type: "svg", errorCorrectionLevel: "M", margin: 4 });
  return new Response(svg, {
    headers: { "Content-Type": "image/svg+xml", "Content-Disposition": `attachment; filename="${fileName}.svg"` },
  });
}
