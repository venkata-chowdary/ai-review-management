import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Pages anyone can open. /reset-password is open because the reset link signs
// the person in first; /auth/* handles links from Supabase emails.
const publicPaths = ["/sign-in", "/sign-up", "/check-email", "/forgot-password", "/reset-password", "/auth"];
// Pages for signed-out visitors only; signed-in owners are sent to the dashboard.
const guestOnlyPaths = ["/sign-in", "/sign-up", "/check-email", "/forgot-password"];

const matches = (pathname: string, paths: string[]) => paths.some((p) => pathname === p || pathname.startsWith(`${p}/`));

// Refreshes the Supabase auth session on each request, writes updated cookies
// back, and does the quick signed-in / signed-out redirects. This is not
// authorization: pages, actions and the database still check the owner.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  // Until a Supabase project is configured there is no session to check.
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet, headers) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
        Object.entries(headers).forEach(([k, v]) => response.headers.set(k, v));
      },
    },
  });

  const { data } = await supabase.auth.getClaims();
  const signedIn = !!data?.claims;
  const { pathname } = request.nextUrl;

  const redirectTo = (path: string) => {
    const redirect = NextResponse.redirect(new URL(path, request.url));
    // Keep any refreshed session cookies on the redirect.
    response.cookies.getAll().forEach((c) => redirect.cookies.set(c));
    return redirect;
  };

  if (!signedIn && !matches(pathname, publicPaths)) return redirectTo("/sign-in");
  if (signedIn && matches(pathname, guestOnlyPaths)) return redirectTo("/");

  return response;
}
