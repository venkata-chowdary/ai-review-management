import "server-only";
import { cache } from "react";
import { requireOwner } from "@/lib/data/business";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type BranchRow = {
  id: string;
  name: string;
  googleMapsUrl: string | null;
  googleReviewUrl: string | null;
  qrCode: string;
  aiPaused: boolean;
};

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const columns = "id, name, google_maps_url, google_review_url, qr_code, ai_paused";
const toBranch = (row: {
  id: string;
  name: string;
  google_maps_url: string | null;
  google_review_url: string | null;
  qr_code: string;
  ai_paused: boolean;
}): BranchRow => ({
  id: row.id,
  name: row.name,
  googleMapsUrl: row.google_maps_url,
  googleReviewUrl: row.google_review_url,
  qrCode: row.qr_code,
  aiPaused: row.ai_paused,
});

type BranchInput = { name: string; googleMapsUrl: string | null; googleReviewUrl: string };

export const listBranches = cache(async (): Promise<BranchRow[]> => {
  const { user } = await requireOwner();
  const supabase = await createClient();
  const { data } = await supabase.from("branches").select(columns).eq("user_id", user.id).order("created_at");
  return (data ?? []).map(toBranch);
});

export async function getBranch(id: string): Promise<BranchRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { user } = await requireOwner();
  const supabase = await createClient();
  const { data } = await supabase.from("branches").select(columns).eq("id", id).eq("user_id", user.id).maybeSingle();
  return data ? toBranch(data) : null;
}

// Customers have no session, so the public page and the suggestion action read
// the branch behind a QR code with the service role and get back only what they need.
export async function getPublicBranch(code: string) {
  if (!/^[0-9a-f]{12}$/.test(code)) return null;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("branches")
    .select("id, user_id, name, google_review_url, ai_paused, businesses(name, business_type)")
    .eq("qr_code", code)
    .maybeSingle();
  if (!data?.google_review_url || !data.businesses) return null;
  return {
    id: data.id,
    userId: data.user_id,
    name: data.name,
    businessName: data.businesses.name,
    businessType: data.businesses.business_type,
    googleReviewUrl: data.google_review_url,
    aiPaused: data.ai_paused,
  };
}

export async function createBranch(input: BranchInput): Promise<Result<BranchRow>> {
  const { user, business } = await requireOwner();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("branches")
    .insert({
      business_id: business.id,
      user_id: user.id,
      name: input.name,
      google_maps_url: input.googleMapsUrl,
      google_review_url: input.googleReviewUrl,
    })
    .select(columns)
    .single();
  if (error || !data) return { ok: false, error: "We could not save the branch. Please try again." };
  return { ok: true, value: toBranch(data) };
}

export async function updateBranch(id: string, input: BranchInput): Promise<Result<BranchRow>> {
  const { user } = await requireOwner();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("branches")
    .update({ name: input.name, google_maps_url: input.googleMapsUrl, google_review_url: input.googleReviewUrl })
    .eq("id", id)
    .eq("user_id", user.id)
    .select(columns)
    .maybeSingle();
  if (error) return { ok: false, error: "We could not save the branch. Please try again." };
  if (!data) return { ok: false, error: "This branch was not found." };
  return { ok: true, value: toBranch(data) };
}
