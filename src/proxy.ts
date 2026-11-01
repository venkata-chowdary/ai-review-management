import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Skip static assets, images and the public QR review pages (/r/...),
  // which never need an owner session.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|r/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
