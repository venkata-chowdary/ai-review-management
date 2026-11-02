import "server-only";
import { cache } from "react";
import { requireOwner } from "@/lib/data/business";
import { createClient } from "@/lib/supabase/server";

export type BranchRow = {
  id: string;
  name: string;
  googleMapsUrl: string | null;
};

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const columns = "id, name, google_maps_url";
const toBranch = (r: { id: string; name: string; google_maps_url: string | null }): BranchRow => ({
  id: r.id,
  name: r.name,
  googleMapsUrl: r.google_maps_url,
});

export const listBranches = cache(async (): Promise<BranchRow[]> => {
  const { user } = await requireOwner();
  const supabase = await createClient();
  const { data } = await supabase.from("branches").select(columns).eq("user_id", user.id).order("created_at");
  return (data ?? []).map(toBranch);
});

/** One branch of the signed-in owner, or null (also when the id belongs to someone else). */
export async function getBranch(id: string): Promise<BranchRow | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { user } = await requireOwner();
  const supabase = await createClient();
  const { data } = await supabase.from("branches").select(columns).eq("id", id).eq("user_id", user.id).maybeSingle();
  return data ? toBranch(data) : null;
}

export async function createBranch(input: { name: string; googleMapsUrl: string }): Promise<Result<BranchRow>> {
  const { user, business } = await requireOwner();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("branches")
    .insert({ business_id: business.id, user_id: user.id, name: input.name, google_maps_url: input.googleMapsUrl })
    .select(columns)
    .single();
  if (error || !data) return { ok: false, error: "We could not save the branch. Please try again." };
  return { ok: true, value: toBranch(data) };
}

export async function updateBranch(id: string, input: { name: string; googleMapsUrl: string }): Promise<Result<BranchRow>> {
  const { user } = await requireOwner();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("branches")
    .update({ name: input.name, google_maps_url: input.googleMapsUrl })
    .eq("id", id)
    .eq("user_id", user.id)
    .select(columns)
    .maybeSingle();
  if (error) return { ok: false, error: "We could not save the branch. Please try again." };
  if (!data) return { ok: false, error: "This branch was not found." };
  return { ok: true, value: toBranch(data) };
}
