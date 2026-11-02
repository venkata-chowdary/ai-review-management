import "server-only";
import { cache } from "react";
import { connection } from "next/server";
import { createClient } from "@/lib/supabase/server";

// The signed-in user, or null. getClaims() checks the token signature, unlike
// reading the cookie directly. Call this from pages and actions, not layouts.
export const verifySession = cache(async () => {
  // getClaims() compares the token's expiry with the current time, which Next
  // does not allow while it prerenders a route's app shell. Wait for a real request first.
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  if (!data) return null;

  return { id: data.claims.sub, email: data.claims.email };
});

// The business is found from the signed-in user, never from an id in the request.
export const getCurrentBusiness = cache(async () => {
  const session = await verifySession();
  if (!session) return null;

  const supabase = await createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("id, name")
    .eq("user_id", session.id)
    .maybeSingle();

  return business;
});
