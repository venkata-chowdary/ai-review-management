import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Landing point for links from Supabase: the email confirmation, the password
// reset and the Google sign-in all arrive here with a one-time `code`.
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";
  // Only follow paths on this site, never an address from the link.
  const safeNext = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(safeNext, origin));
  }

  const failed = safeNext.startsWith("/reset-password") ? "/reset-password?state=error" : "/sign-in?error=link";
  return NextResponse.redirect(new URL(failed, origin));
}
