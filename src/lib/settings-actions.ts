"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createBranch, updateBranch } from "@/lib/data/branches";
import { requireOnboardedOwner } from "@/lib/data/business";
import { createClient } from "@/lib/supabase/server";
import { branchName, businessName, fieldErrors, mapsUrl, type ActionState } from "@/lib/validation";

// Actions for the signed-in dashboard: business details and branches.
// Each one finds the owner from the session, never from an id in the form.

const text = (fd: FormData, key: string) => String(fd.get(key) ?? "");

export async function saveBusinessName(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const { user } = await requireOnboardedOwner();
  const values = { name: text(formData, "name") };
  const parsed = z.object({ name: businessName }).safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const supabase = await createClient();
  const { error } = await supabase.from("businesses").update({ name: parsed.data.name }).eq("user_id", user.id);
  if (error) return { error: "We could not save this. Please try again.", values };

  revalidatePath("/", "layout");
  return { ok: true, values: { name: parsed.data.name } };
}

/** Adds a branch, or edits one when the form carries its id. */
export async function saveBranchDetails(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireOnboardedOwner();
  const id = text(formData, "id");
  const values = { name: text(formData, "name"), url: text(formData, "url") };
  const parsed = z.object({ name: branchName, url: mapsUrl }).safeParse(values);
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const input = { name: parsed.data.name, googleMapsUrl: parsed.data.url };
  const result = id ? await updateBranch(id, input) : await createBranch(input);
  if (!result.ok) return { error: result.error, values };

  revalidatePath("/", "layout");
  redirect("/branches");
}
