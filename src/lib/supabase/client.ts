import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "./database.types";

// Browser client: publishable key only. All tenant data access is enforced by RLS.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
