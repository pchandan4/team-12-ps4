import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { createLocalSupabaseClient } from "./localDb";

let client: SupabaseClient | null = null;

/**
 * Server-side Supabase client.
 * Connects to live Supabase PostgreSQL when SUPABASE_URL and SUPABASE_SECRET_KEY are configured.
 * Automatically falls back to local seed store (seed/ps4_it_helpdesk.sql) when running locally
 * without Supabase credentials, ensuring demo reliability.
 */
export function getSupabase(): SupabaseClient {
  const url = process.env.SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SECRET_KEY?.trim();

  if (url && key) {
    if (!client) {
      client = createClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }
    return client;
  }

  // Local demo fallback (exact schema & records from seed/ps4_it_helpdesk.sql)
  return createLocalSupabaseClient() as unknown as SupabaseClient;
}

export function isUsingLiveSupabase(): boolean {
  return Boolean(process.env.SUPABASE_URL?.trim() && process.env.SUPABASE_SECRET_KEY?.trim());
}
