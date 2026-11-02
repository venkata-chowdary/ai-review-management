import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Clears a login that no longer matches an account, for example after the
// account was deleted. Without this the proxy keeps treating the visitor as
// signed in and bounces them between the dashboard and the sign-in page.
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut({ scope: "local" });
  return NextResponse.redirect(new URL("/sign-in", request.nextUrl.origin));
}
