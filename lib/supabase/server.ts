import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/** The site has to build and run with no backend at all, so every caller
 *  checks this before assuming there is one. */
export const supabaseConfigured = Boolean(url && anonKey);

let cached: SupabaseClient | null = null;

/**
 * Anonymous, read-only in practice: row-level security lets this key see
 * published rows and nothing else, so it is safe on the server and in the
 * browser bundle alike.
 */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  cached ??= createClient(url!, anonKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
