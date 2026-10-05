import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url =
  import.meta.env.PUBLIC_SUPABASE_ACADEMICS_URL ??
  import.meta.env.PUBLIC_SUPABASE_URL;

const key =
  import.meta.env.PUBLIC_SUPABASE_ACADEMICS_KEY ??
  import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && key);

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured) {
    if (import.meta.env.DEV) {
      console.warn(
        '[supabase] Supabase credentials are missing. Set ' +
          'PUBLIC_SUPABASE_ACADEMICS_URL and PUBLIC_SUPABASE_ACADEMICS_KEY ' +
          '(or PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY) in .env, ' +
          'then restart the dev server.',
      );
    }
    return null;
  }

  if (client) return client;

  client = createClient(url!, key!, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });

  return client;
}