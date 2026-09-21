"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

let cached: SupabaseClient | null = null;

/**
 * The studio's client. Sessions persist here - that is the whole point - and
 * every write it makes is still checked by RLS against the owner email, so a
 * stolen anon key buys nothing.
 */
export function getBrowserSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) return null;
  cached ??= createClient(url!, anonKey!);
  return cached;
}
