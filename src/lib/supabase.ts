import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.PUBLIC_SUPABASE_URL;
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

/**
 * True when both env vars are present.
 * Astro inlines PUBLIC_* vars at build time — they're available in
 * both server and client bundles.
 */
export const supabaseConfigured = Boolean(url && anonKey);

let client: SupabaseClient | null = null;

/**
 * Lazy singleton. Returns null if credentials are missing — callers
 * must handle the null case. Nothing throws at import time.
 */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) {
    if (import.meta.env.DEV) {
      console.warn(
        '[supabase] PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY is missing. ' +
          'Forms will show a configuration error instead of submitting. ' +
          'Add them to .env and restart the dev server.',
      );
    }
    return null;
  }

  if (client) return client;

  client = createClient(url!, anonKey!, {
    auth: { persistSession: false },
  });

  return client;
}